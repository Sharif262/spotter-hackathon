import { LM, type Landmark } from './math';
import type { ExerciseId } from './exercises';

const EMPTY: Landmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }));

function rad(d: number) {
  return (d * Math.PI) / 180;
}

function set(lms: Landmark[], i: number, x: number, y: number, z: number) {
  lms[i] = { x, y, z, visibility: 1 };
}

/**
 * Build MediaPipe-shaped 3D landmarks from joint angles so the FSM
 * always evaluates real vector geometry (not precomputed flags).
 */
export function landmarksFromAngles(a: {
  leftElbow: number;
  rightElbow: number;
  swing: number;
  lean: number;
  wristDrift: number;
  overhead: boolean;
}): Landmark[] {
  const lms = EMPTY.map((p) => ({ ...p }));
  const lean = rad(a.lean);
  const midX = 0.5;
  const hipY = 0.62;
  const shY = 0.38 + Math.sin(lean) * 0.04;
  const shW = 0.12;

  set(lms, LM.leftHip, midX - 0.06, hipY, 0);
  set(lms, LM.rightHip, midX + 0.06, hipY, 0);
  set(lms, LM.leftKnee, midX - 0.07, 0.78, 0);
  set(lms, LM.rightKnee, midX + 0.07, 0.78, 0);
  set(lms, LM.leftAnkle, midX - 0.07, 0.94, 0);
  set(lms, LM.rightAnkle, midX + 0.07, 0.94, 0);
  set(lms, LM.leftShoulder, midX - shW, shY, 0);
  set(lms, LM.rightShoulder, midX + shW, shY, 0);
  set(lms, LM.nose, midX, shY - 0.12, 0);

  placeArm(lms, 'left', a.leftElbow, a.swing, a.wristDrift, a.overhead);
  placeArm(lms, 'right', a.rightElbow, a.swing, a.wristDrift, a.overhead);
  return lms;
}

function placeArm(
  lms: Landmark[],
  side: 'left' | 'right',
  elbowDeg: number,
  swingDeg: number,
  wristDrift: number,
  overhead: boolean,
) {
  const sign = side === 'left' ? -1 : 1;
  const sh = lms[side === 'left' ? LM.leftShoulder : LM.rightShoulder];
  const upper = 0.14;
  const lower = 0.13;
  const swing = rad(swingDeg) * sign;
  const upperDir = overhead
    ? { x: Math.sin(swing) * 0.4, y: -Math.cos(rad(Math.min(swingDeg, 25))), z: Math.sin(swing) }
    : { x: Math.sin(swing), y: Math.cos(rad(Math.min(swingDeg, 40))), z: Math.sin(swing) * 0.3 };
  const um = Math.hypot(upperDir.x, upperDir.y, upperDir.z) || 1;
  const el = {
    x: sh.x + (upperDir.x / um) * upper,
    y: sh.y + (upperDir.y / um) * upper,
    z: sh.z + (upperDir.z / um) * upper,
  };
  const flex = rad(180 - elbowDeg);
  const wr = {
    x: el.x + Math.sin(flex + swing) * lower * sign * 0.35 + wristDrift * sign * 0.08,
    y: el.y + Math.cos(flex) * (overhead ? -lower : lower * 0.85),
    z: el.z + Math.sin(flex) * 0.05,
  };
  set(lms, side === 'left' ? LM.leftElbow : LM.rightElbow, el.x, el.y, el.z);
  set(lms, side === 'left' ? LM.leftWrist : LM.rightWrist, wr.x, wr.y, wr.z);
}

export type PosePhase = {
  leftElbow: number;
  rightElbow: number;
  swing: number;
  lean: number;
  wristDrift: number;
};

/** Time-based live pose for an exercise, with form breaks on later reps. */
export function poseAt(exercise: ExerciseId, elapsedMs: number): { pose: PosePhase; overhead: boolean } {
  const cycle = 2200;
  const n = Math.floor(elapsedMs / cycle);
  const u = (elapsedMs % cycle) / cycle;
  const goingUp = u < 0.5;
  const p = goingUp ? u * 2 : (1 - u) * 2;
  const ease = p * p * (3 - 2 * p);
  const faultRep = n === 2 || n === 4;

  if (exercise === 'bicep_curl') {
    const elbow = 168 - ease * 122;
    return {
      overhead: false,
      pose: {
        leftElbow: elbow,
        rightElbow: elbow + (faultRep ? 18 : 2),
        swing: faultRep && goingUp && p > 0.4 ? 32 : 8,
        lean: 2,
        wristDrift: 0,
      },
    };
  }
  if (exercise === 'shoulder_press') {
    const elbow = 78 + ease * 92;
    return {
      overhead: true,
      pose: {
        leftElbow: elbow,
        rightElbow: elbow,
        swing: 6,
        lean: faultRep && goingUp && p > 0.5 ? 22 : 4,
        wristDrift: faultRep ? 0.55 : 0.05,
      },
    };
  }
  const elbow = 52 + ease * 118;
  return {
    overhead: true,
    pose: {
      leftElbow: elbow,
      rightElbow: elbow,
      swing: faultRep && goingUp ? 40 : 8,
      lean: 3,
      wristDrift: 0,
    },
  };
}

export function liveLandmarks(exercise: ExerciseId, elapsedMs: number): Landmark[] {
  const { pose, overhead } = poseAt(exercise, elapsedMs);
  return landmarksFromAngles({ ...pose, overhead });
}
