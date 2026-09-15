import { SPECS, primaryAngle, repSignal, type EquipmentKind, type ExerciseId, type FaultEvent } from './exercises';
import { EasyRepCounter, type FsmState } from './fsm';
import { LowPass, type Landmark, type Side } from './math';
import type { OverlayPoint } from './poseFeed';

export type SampleRow = {
  t: number;
  exercise: ExerciseId;
  side: Side;
  fsm: FsmState;
  elbowDeg: number;
  faultCode: string;
  cue: string;
  rep: number;
};

export type TrackerSnapshot = {
  t: number;
  reps: number;
  leftAngle: number;
  rightAngle: number;
  leftState: FsmState;
  rightState: FsmState;
  liveCue: string | null;
  liveFault: FaultEvent | null;
  barUneven: boolean;
  newRep: boolean;
  committedNs: number[];
  newFaults: FaultEvent[];
  sample: SampleRow;
  faultRep: number;
};

function motionPose(lms: Landmark[], overlay?: OverlayPoint[]): Landmark[] {
  if (!overlay || overlay.length < 25) return lms;
  return lms.map((p, i) => {
    const o = overlay[i];
    if (!o) return p;
    return { x: o.x, y: o.y, z: p.z, visibility: o.visibility ?? p.visibility };
  });
}

export class KinematicEngine {
  private repsCounter = new EasyRepCounter(0.035);
  private sigFilter = new LowPass(0.55);
  private lFilter = new LowPass(0.5);
  private rFilter = new LowPass(0.5);
  private lastFaultAt = new Map<string, number>();
  private lastLog = 0;
  reps = 0;

  constructor(
    readonly exercise: ExerciseId,
    readonly equipment: EquipmentKind,
  ) {}

  reset() {
    this.repsCounter.reset();
    this.sigFilter.reset();
    this.lFilter.reset();
    this.rFilter.reset();
    this.reps = 0;
    this.lastFaultAt.clear();
  }

  process(lms: Landmark[], t = Date.now(), overlay?: OverlayPoint[]): TrackerSnapshot {
    const spec = SPECS[this.exercise];
    const lRaw = primaryAngle(lms, 'left', spec);
    const rRaw = primaryAngle(lms, 'right', spec);
    const lAng = this.lFilter.next(lRaw);
    const rAng = this.rFilter.next(rRaw);

    const motion = motionPose(lms, overlay);
    const sig = repSignal(this.exercise, motion);
    const value = this.exercise === 'tricep_extension' ? sig.elbow : sig.wrist;
    const minRom = this.exercise === 'tricep_extension' ? sig.elbowRom : sig.wristRom;
    this.repsCounter.setMinRom(minRom);
    const committedNs: number[] = [];
    if (this.repsCounter.step(this.sigFilter.next(value), t)) {
      this.reps += 1;
      committedNs.push(this.reps);
      console.log('rep', this.reps, this.exercise, { value, elbow: sig.elbow, wrist: sig.wrist });
    }

    if (t - this.lastLog > 1500) {
      this.lastLog = t;
      console.log('signal', this.exercise, {
        value: +value.toFixed(3),
        reps: this.reps,
        state: this.repsCounter.state,
      });
    }

    const moving = this.repsCounter.state !== 'IDLE';
    const newFaults: FaultEvent[] = [];
    if (moving) {
      for (const side of ['left', 'right'] as const) {
        for (const f of spec.formChecks(lms, side)) {
          const key = `${f.code}:${side}`;
          const last = this.lastFaultAt.get(key) ?? 0;
          if (t - last > 700) {
            this.lastFaultAt.set(key, t);
            newFaults.push(f);
          }
        }
      }
      if (this.equipment === 'bb' && Math.abs(lAng - rAng) > 18) {
        const key = 'bar_uneven';
        const last = this.lastFaultAt.get(key) ?? 0;
        if (t - last > 700) {
          this.lastFaultAt.set(key, t);
          newFaults.push({
            code: 'bar_uneven',
            cue: 'Level the bar.',
            severity: 'warn',
            side: 'both',
            angle: Math.abs(lAng - rAng),
            threshold: 18,
            joint: 'left-right elbow',
          });
        }
      }
    }

    const live = newFaults[0] ?? null;
    const state = this.repsCounter.state;
    const inFlight = moving ? Math.max(this.reps, 1) : this.reps;
    const sample: SampleRow = {
      t,
      exercise: this.exercise,
      side: this.equipment === 'bb' ? 'both' : 'left',
      fsm: state,
      elbowDeg: Math.round(((lAng + rAng) / 2) * 10) / 10,
      faultCode: live?.code ?? '',
      cue: live?.cue ?? '',
      rep: inFlight,
    };

    return {
      t,
      reps: this.reps,
      leftAngle: lAng,
      rightAngle: rAng,
      leftState: state,
      rightState: state,
      liveCue: live?.cue ?? null,
      liveFault: live,
      barUneven: this.equipment === 'bb' && Math.abs(lAng - rAng) > 18,
      newRep: committedNs.length > 0,
      committedNs,
      newFaults,
      sample,
      faultRep: inFlight,
    };
  }
}
