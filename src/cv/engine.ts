import { SPECS, primaryAngle, type EquipmentKind, type ExerciseId, type FaultEvent } from './exercises';
import { RepFsm, type FsmState } from './fsm';
import { LowPass, type Landmark, type Side } from './math';

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
  newFaults: FaultEvent[];
  sample: SampleRow;
};

export class KinematicEngine {
  private left: RepFsm;
  private right: RepFsm;
  private lFilter = new LowPass(0.35);
  private rFilter = new LowPass(0.35);
  private lastFaultAt = new Map<string, number>();
  reps = 0;

  constructor(
    readonly exercise: ExerciseId,
    readonly equipment: EquipmentKind,
  ) {
    const spec = SPECS[exercise];
    const cfg = {
      startThreshold: spec.startThreshold,
      peakThreshold: spec.peakThreshold,
      concentricDecreases: spec.concentricDecreases,
      holdFrames: 3,
    };
    this.left = new RepFsm(cfg);
    this.right = new RepFsm(cfg);
  }

  reset() {
    this.left.reset();
    this.right.reset();
    this.lFilter.reset();
    this.rFilter.reset();
    this.reps = 0;
    this.lastFaultAt.clear();
  }

  process(lms: Landmark[], t = Date.now()): TrackerSnapshot {
    const spec = SPECS[this.exercise];
    const lRaw = primaryAngle(lms, 'left', spec);
    const rRaw = primaryAngle(lms, 'right', spec);
    const lAng = this.lFilter.next(lRaw);
    const rAng = this.rFilter.next(rRaw);

    let newRep = false;
    if (this.equipment === 'db') {
      if (this.left.step(lAng) === 'rep') { this.reps += 1; newRep = true; }
      if (this.right.step(rAng) === 'rep') { this.reps += 1; newRep = true; }
    } else {
      const mid = (lAng + rAng) / 2;
      if (this.left.step(mid) === 'rep') { this.reps += 1; newRep = true; }
      this.right.step(mid);
    }

    const moving = this.left.state === 'CONCENTRIC' || this.right.state === 'CONCENTRIC'
      || this.left.state === 'PEAK' || this.right.state === 'PEAK'
      || this.left.state === 'ECCENTRIC' || this.right.state === 'ECCENTRIC';

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
      if (this.equipment === 'bb' && Math.abs(lAng - rAng) > 15) {
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
            threshold: 15,
            joint: 'left-right elbow',
          });
        }
      }
    }

    const live = newFaults[0] ?? null;
    const sample: SampleRow = {
      t,
      exercise: this.exercise,
      side: this.equipment === 'bb' ? 'both' : 'left',
      fsm: this.left.state,
      elbowDeg: Math.round(((lAng + rAng) / 2) * 10) / 10,
      faultCode: live?.code ?? '',
      cue: live?.cue ?? '',
      rep: this.reps,
    };

    return {
      t,
      reps: this.reps,
      leftAngle: lAng,
      rightAngle: rAng,
      leftState: this.left.state,
      rightState: this.right.state,
      liveCue: live?.cue ?? null,
      liveFault: live,
      barUneven: this.equipment === 'bb' && Math.abs(lAng - rAng) > 15,
      newRep,
      newFaults,
      sample,
    };
  }
}
