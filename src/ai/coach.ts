import type { ExerciseId, FaultEvent } from '../cv/exercises';
import { SPECS } from '../cv/exercises';
import * as store from '../storage/workoutStore';
import type { FaultRow, RepRow, SampleRow, SessionRow } from '../storage/workoutStore';

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
  const cleanReps = input.reps.filter((r) => !input.faults.some((f) => f.rep === r.n));
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
    const rf = input.faults.filter((f) => f.rep === r.n);
    const flag = rf.length > 0;
    return {
      n: r.n,
      flag,
      summary: flag ? rf[0].code.replace(/_/g, ' ') : 'clean',
      cue: flag ? rf[0].cue : '',
    };
  });

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
    watchouts: uniqueFaults(input.faults).slice(1, 3).map((f) => ({
      title: f.code.replace(/_/g, ' '),
      body: WHY[f.code] ?? f.cue,
    })),
  };
}

function uniqueFaults(faults: FaultEvent[]) {
  const seen = new Map<string, FaultEvent>();
  for (const f of faults) {
    if (!seen.has(f.code)) seen.set(f.code, f);
  }
  return [...seen.values()];
}

export const EMPTY_REPORT: CoachReport = {
  wentWell: 'Finish a live-tracked set and Spotter will read the local log.',
  diagnosis: 'No kinematic session stored yet',
  why: 'Joint angles, FSM state, and form faults are written to SQLite (and CSV) on device, then this coach reads that file.',
  cue: 'Pick a lift, lock the frame, then run a live set.',
  muscles: MUSCLE.bicep_curl.map((m) => ({ ...m, hot: false })),
  reps: 0,
  avgElbow: 0,
  faultCount: 0,
  byRep: [],
  watchouts: [],
};

const coachCache = new Map<number, CoachReport>();

/** Load a finished session from local storage and produce the coach report. */
export async function loadCoach(sessionId: number): Promise<CoachReport> {
  const cached = coachCache.get(sessionId);
  if (cached) return cached;
  const session = await store.getSession(sessionId);
  if (!session) return EMPTY_REPORT;
  const [faults, reps, samples] = await Promise.all([
    store.getFaults(sessionId),
    store.getReps(sessionId),
    store.getSamples(sessionId),
  ]);
  const report = coachFromLog({ session, faults, reps, samples });
  coachCache.set(sessionId, report);
  return report;
}
