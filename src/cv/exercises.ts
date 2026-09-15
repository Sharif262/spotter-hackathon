import { LM, angleDeg, get, mag, sub, type Landmark, type Side } from './math';

export type ExerciseId = 'bicep_curl' | 'shoulder_press' | 'tricep_extension';
export type EquipmentKind = 'db' | 'bb';

export type FaultEvent = {
  code: string;
  cue: string;
  severity: 'warn' | 'high';
  side: Side;
  angle: number;
  threshold: number;
  joint: string;
};

export type ExerciseSpec = {
  id: ExerciseId;
  label: string;
  startThreshold: number;
  peakThreshold: number;
  concentricDecreases: boolean;
  primaryJoint: string;
  formChecks: (lms: Landmark[], side: 'left' | 'right') => FaultEvent[];
};

function elbow(lms: Landmark[], side: 'left' | 'right') {
  const sh = side === 'left' ? LM.leftShoulder : LM.rightShoulder;
  const el = side === 'left' ? LM.leftElbow : LM.rightElbow;
  const wr = side === 'left' ? LM.leftWrist : LM.rightWrist;
  return angleDeg(get(lms, sh), get(lms, el), get(lms, wr));
}

function shoulderSwing(lms: Landmark[], side: 'left' | 'right') {
  const hp = side === 'left' ? LM.leftHip : LM.rightHip;
  const sh = side === 'left' ? LM.leftShoulder : LM.rightShoulder;
  const el = side === 'left' ? LM.leftElbow : LM.rightElbow;
  return angleDeg(get(lms, hp), get(lms, sh), get(lms, el));
}

function torso(lms: Landmark[], side: 'left' | 'right') {
  const sh = side === 'left' ? LM.leftShoulder : LM.rightShoulder;
  const hp = side === 'left' ? LM.leftHip : LM.rightHip;
  const kn = side === 'left' ? LM.leftKnee : LM.rightKnee;
  return angleDeg(get(lms, sh), get(lms, hp), get(lms, kn));
}

function wristElbowOffset(lms: Landmark[], side: 'left' | 'right') {
  const el = get(lms, side === 'left' ? LM.leftElbow : LM.rightElbow);
  const wr = get(lms, side === 'left' ? LM.leftWrist : LM.rightWrist);
  const sh = get(lms, side === 'left' ? LM.leftShoulder : LM.rightShoulder);
  const arm = mag(sub(el, sh)) || 1;
  // Lateral drift in the horizontal plane so "stack wrists over elbows" uses the wrist, not the bone length.
  return Math.hypot(wr.x - el.x, wr.z - el.z) / arm;
}

export const SPECS: Record<ExerciseId, ExerciseSpec> = {
  bicep_curl: {
    id: 'bicep_curl',
    label: 'Bicep curl',
    startThreshold: 160,
    peakThreshold: 50,
    concentricDecreases: true,
    primaryJoint: 'elbow',
    formChecks: (lms, side) => {
      const swing = Math.abs(180 - shoulderSwing(lms, side));
      if (swing > 20) {
        return [{
          code: 'shoulder_swing',
          cue: 'Pin your elbows to your sides.',
          severity: 'warn',
          side,
          angle: swing,
          threshold: 20,
          joint: 'hip-shoulder-elbow',
        }];
      }
      return [];
    },
  },
  shoulder_press: {
    id: 'shoulder_press',
    label: 'Shoulder press',
    startThreshold: 90,
    peakThreshold: 160,
    concentricDecreases: false,
    primaryJoint: 'elbow',
    formChecks: (lms, side) => {
      const out: FaultEvent[] = [];
      const spine = torso(lms, side);
      if (spine < 165) {
        out.push({
          code: 'spinal_arch',
          cue: "Keep your core tight, don't lean back.",
          severity: 'high',
          side,
          angle: spine,
          threshold: 165,
          joint: 'shoulder-hip-knee',
        });
      }
      const offset = wristElbowOffset(lms, side);
      if (offset > 0.28) {
        out.push({
          code: 'press_trajectory',
          cue: 'Stack wrists over elbows.',
          severity: 'warn',
          side,
          angle: offset * 180,
          threshold: 0.28 * 180,
          joint: 'wrist-elbow',
        });
      }
      return out;
    },
  },
  tricep_extension: {
    id: 'tricep_extension',
    label: 'Overhead tricep extension',
    startThreshold: 60,
    peakThreshold: 160,
    concentricDecreases: false,
    primaryJoint: 'elbow',
    formChecks: (lms, side) => {
      const upper = shoulderSwing(lms, side);
      if (upper < 150) {
        return [{
          code: 'upper_arm_shift',
          cue: 'Keep elbows pointed to the ceiling.',
          severity: 'warn',
          side,
          angle: upper,
          threshold: 150,
          joint: 'hip-shoulder-elbow',
        }];
      }
      return [];
    },
  },
};

export function verticalAxis(lms: Landmark[]): 'x' | 'y' {
  const lSh = get(lms, LM.leftShoulder);
  const rSh = get(lms, LM.rightShoulder);
  return Math.abs(rSh.y - lSh.y) > Math.abs(rSh.x - lSh.x) * 1.25 ? 'x' : 'y';
}

function axisVal(p: { x: number; y: number }, axis: 'x' | 'y') {
  return axis === 'x' ? p.x : p.y;
}

export function primaryAngle(lms: Landmark[], side: 'left' | 'right', spec: ExerciseSpec): number {
  if (spec.primaryJoint === 'elbow') return elbow(lms, side);
  return elbow(lms, side);
}

/** Wrist travel along the body's up-axis, plus elbow ROM. Works for landscape buffers and portrait views. */
export function repSignal(id: ExerciseId, lms: Landmark[]): { wrist: number; elbow: number; wristRom: number; elbowRom: number } {
  const axis = verticalAxis(lms);
  const wrist = (
    axisVal(get(lms, LM.leftWrist), axis) + axisVal(get(lms, LM.rightWrist), axis)
  ) / 2;
  const elbowMid = (elbow(lms, 'left') + elbow(lms, 'right')) / 2;
  if (id === 'tricep_extension') {
    return { wrist, elbow: elbowMid, wristRom: 0.035, elbowRom: 14 };
  }
  if (id === 'shoulder_press') {
    return { wrist, elbow: elbowMid, wristRom: 0.035, elbowRom: 14 };
  }
  return { wrist, elbow: elbowMid, wristRom: 0.035, elbowRom: 14 };
}

export function liftToExercise(lift: string): ExerciseId {
  const n = lift.toLowerCase();
  if (n.includes('tricep')) return 'tricep_extension';
  if (n.includes('press') || n.includes('ohp') || n.includes('overhead press')) return 'shoulder_press';
  return 'bicep_curl';
}
