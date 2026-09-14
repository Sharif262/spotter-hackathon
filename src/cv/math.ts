export type Vec3 = { x: number; y: number; z: number };

export type Landmark = Vec3 & { visibility?: number };

/** MediaPipe BlazePose 33-point indices. */
export const LM = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

export type Side = 'left' | 'right' | 'both';

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function mag(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}

/** Angle at vertex P2 from 3D points, in degrees. */
export function angleDeg(p1: Vec3, p2: Vec3, p3: Vec3): number {
  const v1 = sub(p1, p2);
  const v2 = sub(p3, p2);
  const d = mag(v1) * mag(v2);
  if (d < 1e-6) return 0;
  const c = Math.min(1, Math.max(-1, dot(v1, v2) / d));
  return (Math.acos(c) * 180) / Math.PI;
}

export function get(lms: Landmark[], i: number): Landmark {
  return lms[i] ?? { x: 0, y: 0, z: 0, visibility: 0 };
}

export class LowPass {
  private y: number | null = null;
  constructor(private alpha = 0.35) {}
  next(x: number): number {
    this.y = this.y == null ? x : this.alpha * x + (1 - this.alpha) * this.y;
    return this.y;
  }
  reset() {
    this.y = null;
  }
}
