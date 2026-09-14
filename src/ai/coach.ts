import type { ExerciseId, FaultEvent } from '../cv/exercises';
import { SPECS } from '../cv/exercises';
import * as store from '../storage/workoutStore';
import type { FaultRow, RepRow, SampleRow, SessionRow } from '../storage/workoutStore';
import { fetchGeminiFeedback } from './api';
import type { CoachLog, FunctioningItem, GeminiFeedback, ImproveItem, WentWrongItem } from './types';

export type CoachReport = {
  wentWell: string;
  diagnosis: string;
  why: string;
  cue: string;
  muscles: { label: string; hot?: boolean }[];
  reps: number;
  avgElbow: number;
  faultCount: number;
  byRep: { n: number; flag: boolean; summary: string; cue: string }[];
  watchouts: { title: string; body: string }[];
  functioning: FunctioningItem[];
  wentWrong: WentWrongItem[];
  improvements: ImproveItem[];
  source: 'local' | 'gemini';
};

const MUSCLE: Record<ExerciseId, { label: string; hot?: boolean }[]> = {
  bicep_curl: [
    { label: 'Front delt +swing', hot: true },
    { label: 'Biceps' },
    { label: 'Brachialis' },
    { label: 'Forearms' },
  ],
  shoulder_press: [
    { label: 'Lumbar +arch', hot: true },
    { label: 'Delts' },
    { label: 'Triceps' },
    { label: 'Core' },
  ],
  tricep_extension: [
    { label: 'Elbow path', hot: true },
    { label: 'Long head' },
    { label: 'Core' },
  ],
};

const WHY: Record<string, string> = {
  shoulder_swing: 'Your upper arm drifted forward, so the shoulder started driving the weight instead of the biceps.',
  bar_uneven: 'Left and right elbow angles diverged past 15°, so one side took more of the bar.',
  spinal_arch: 'Your torso angle dropped under 165°, dumping load into the lumbar spine instead of the delts.',
  press_trajectory: 'Wrists drifted off the elbow stack, so the bar path stopped being a straight press.',
  upper_arm_shift: 'The elbow dropped forward, shortening the stretch and taking the long head out of the movement.',
};

function topFault(faults: FaultEvent[]) {
  const counts = new Map<string, { n: number; f: FaultEvent }>();
  for (const f of faults) {
    const cur = counts.get(f.code);
    if (cur) cur.n += 1;
    else counts.set(f.code, { n: 1, f });
  }
  let best: { n: number; f: FaultEvent } | null = null;
  for (const v of counts.values()) {
    if (!best || v.n > best.n || (v.n === best.n && v.f.severity === 'high')) best = v;
  }
  return best;
}

function uniqueFaults(faults: FaultEvent[]) {
  const seen = new Map<string, FaultEvent>();
  for (const f of faults) {
    if (!seen.has(f.code)) seen.set(f.code, f);
  }
  return [...seen.values()];
}

function downsample<T>(rows: T[], max = 40): T[] {
  if (rows.length <= max) return rows;
  const step = rows.length / max;
  return Array.from({ length: max }, (_, i) => rows[Math.min(rows.length - 1, Math.floor(i * step))]);
}

function summarizeFaults(faults: FaultRow[]) {
  const map = new Map<string, { f: FaultRow; count: number; reps: Set<number>; angles: number[] }>();
  for (const f of faults) {
    const cur = map.get(f.code);
    if (cur) {
      cur.count += 1;
      cur.reps.add(f.rep);
      cur.angles.push(f.angle);
    } else {
      map.set(f.code, { f, count: 1, reps: new Set([f.rep]), angles: [f.angle] });
    }
  }
  return [...map.values()].map(({ f, count, reps, angles }) => ({
    code: f.code,
    cue: f.cue,
    severity: f.severity,
    joint: f.joint,
    count,
    reps: [...reps].sort((a, b) => a - b),
    avgAngle: Math.round((angles.reduce((s, n) => s + n, 0) / angles.length) * 10) / 10,
    threshold: f.threshold,
  }));
}

export function buildCoachLog(input: {
  session: SessionRow;
  faults: FaultRow[];
  reps: RepRow[];
  samples: SampleRow[];
}): CoachLog {
  const spec = SPECS[input.session.exercise];
  const ended = input.session.endedAt ?? Date.now();
  return {
    session: {
      lift: input.session.lift,
      exercise: input.session.exercise,
      equipment: input.session.equipment,
      reps: input.session.reps,
      durationMs: Math.max(0, ended - input.session.startedAt),
    },
    spec: {
      primaryJoint: spec.primaryJoint,
      startThreshold: spec.startThreshold,
      peakThreshold: spec.peakThreshold,
    },
    reps: input.reps.map((r) => ({
      n: r.n,
      leftAngle: Math.round(r.leftAngle * 10) / 10,
      rightAngle: Math.round(r.rightAngle * 10) / 10,
    })),
    faults: summarizeFaults(input.faults),
    samples: downsample(input.samples).map((s) => ({
      t: s.t,
      fsm: s.fsm,
      elbowDeg: s.elbowDeg,
      faultCode: s.faultCode,
      rep: s.rep,
    })),
  };
}

function applyGemini(local: CoachReport, fb: GeminiFeedback): CoachReport {
  const functioning = fb.functioning ?? [];
  const wentWrong = fb.wentWrong ?? [];
  const improvements = fb.improvements ?? [];
  return {
    ...local,
    functioning,
    wentWrong,
    improvements,
    wentWell: functioning[0]?.detail ?? local.wentWell,
    diagnosis: fb.diagnosis || local.diagnosis,
    why: fb.why || local.why,
    cue: fb.cue || improvements[0]?.cue || local.cue,
    muscles: fb.muscles?.length ? fb.muscles : local.muscles,
    watchouts: wentWrong.slice(0, 3).map((w) => ({
      title: w.where,
      body: w.reps && w.reps !== 'none' ? `${w.detail} (reps ${w.reps})` : w.detail,
    })),
    source: 'gemini',
  };
}

/** Reads stored kinematic events and produces the on-device coach report. */
export function coachFromLog(input: {
  session: SessionRow;
  faults: FaultRow[];
  reps: RepRow[];
  samples: SampleRow[];
}): CoachReport {
  const spec = SPECS[input.session.exercise];
  const samples = input.samples;
  const avgElbow = samples.length
    ? Math.round((samples.reduce((s, r) => s + r.elbowDeg, 0) / samples.length) * 10) / 10
    : 0;
  const top = topFault(input.faults);
  const faultsForRep = (n: number) =>
    input.faults.filter((f) => f.rep === n || (f.rep === 0 && n === 1));
  const cleanReps = input.reps.filter((r) => faultsForRep(r.n).length === 0);
  const wentWell = cleanReps.length
    ? `${cleanReps.length} rep${cleanReps.length === 1 ? '' : 's'} stayed inside the ${spec.primaryJoint} envelope (${spec.startThreshold}°–${spec.peakThreshold}°).`
    : `You completed ${input.session.reps} live-tracked reps. Keep the start position honest before the next set.`;

  const diagnosis = top
    ? `${top.f.code.replace(/_/g, ' ')} on ${top.n} sample${top.n === 1 ? '' : 's'}`
    : 'No form faults crossed threshold this set.';
  const why = top
    ? WHY[top.f.code] ?? `Tracked ${top.f.joint} at ${top.f.angle.toFixed(0)}° vs ${top.f.threshold}°.`
    : 'Joint angles stayed inside the exercise thresholds for the full FSM cycle.';
  const cue = top ? top.f.cue : 'Same setup. Hit full ROM, then add load.';

  const byRep = input.reps.map((r) => {
    const rf = faultsForRep(r.n);
    const flag = rf.length > 0;
    return {
      n: r.n,
      flag,
      summary: flag ? rf[0].code.replace(/_/g, ' ') : 'clean',
      cue: flag ? rf[0].cue : '',
    };
  });

  const uniques = uniqueFaults(input.faults);
  const functioning: FunctioningItem[] = cleanReps.length
    ? [{ area: spec.primaryJoint, detail: wentWell }]
    : [{ area: 'Set completed', detail: wentWell }];
  const wentWrong: WentWrongItem[] = uniques.map((f) => ({
    where: f.joint,
    detail: WHY[f.code] ?? f.cue,
    reps: [...new Set(input.faults.filter((x) => x.code === f.code).map((x) => x.rep))].join(', ') || 'set',
  }));
  const improvements: ImproveItem[] = uniques.length
    ? uniques.slice(0, 3).map((f) => ({
      area: f.code.replace(/_/g, ' '),
      detail: WHY[f.code] ?? f.cue,
      cue: f.cue,
    }))
    : [{ area: 'Progression', detail: 'Keep the same setup and add load only if ROM stays honest.', cue }];

  return {
    wentWell,
    diagnosis,
    why,
    cue,
    muscles: MUSCLE[input.session.exercise],
    reps: input.session.reps,
    avgElbow,
    faultCount: input.faults.length,
    byRep,
    watchouts: uniques.slice(1, 3).map((f) => ({
      title: f.code.replace(/_/g, ' '),
      body: WHY[f.code] ?? f.cue,
    })),
    functioning,
    wentWrong,
    improvements,
    source: 'local',
  };
}

export const EMPTY_REPORT: CoachReport = {
  wentWell: 'Finish a live-tracked set and Spotter will read the local log.',
  diagnosis: 'No kinematic session stored yet',
  why: 'Joint angles, FSM state, and form faults are written to SQLite (and CSV) on device, then Gemini reads that file.',
  cue: 'Pick a lift, lock the frame, then run a live set.',
  muscles: MUSCLE.bicep_curl.map((m) => ({ ...m, hot: false })),
  reps: 0,
  avgElbow: 0,
  faultCount: 0,
  byRep: [],
  watchouts: [],
  functioning: [],
  wentWrong: [],
  improvements: [],
  source: 'local',
};

const coachCache = new Map<number, CoachReport>();

export async function loadLocalCoach(sessionId: number): Promise<{ report: CoachReport; log: CoachLog | null }> {
  const session = await store.getSession(sessionId);
  if (!session) return { report: EMPTY_REPORT, log: null };
  const [faults, reps, samples] = await Promise.all([
    store.getFaults(sessionId),
    store.getReps(sessionId),
    store.getSamples(sessionId),
  ]);
  const input = { session, faults, reps, samples };
  return { report: coachFromLog(input), log: buildCoachLog(input) };
}

/** Load a finished session, then ask Gemini to coach from the local log. */
export async function loadCoach(
  sessionId: number,
  onLocal?: (report: CoachReport) => void,
): Promise<CoachReport> {
  const cached = coachCache.get(sessionId);
  if (cached?.source === 'gemini') return cached;
  const { report, log } = await loadLocalCoach(sessionId);
  onLocal?.(report);
  if (!log) return report;
  try {
    const fb = await fetchGeminiFeedback(log);
    const merged = applyGemini(report, fb);
    coachCache.set(sessionId, merged);
    return merged;
  } catch {
    return report;
  }
}
