import { LM, type Landmark } from './math';

const CRITICAL = [
  LM.leftShoulder,
  LM.rightShoulder,
  LM.leftElbow,
  LM.rightElbow,
  LM.leftHip,
  LM.rightHip,
] as const;

const WRISTS = [LM.leftWrist, LM.rightWrist] as const;

const ACQUIRE_FRAMES = 8;
const DROP_FRAMES = 5;

function vis(lms: Landmark[], i: number) {
  return lms[i]?.visibility ?? 0;
}

/** True when one body is in a usable side-view crop. */
export function frameLooksLocked(lms: Landmark[]): boolean {
  if (lms.length < 25) return false;
  if (CRITICAL.some((i) => vis(lms, i) < 0.5)) return false;
  if (WRISTS.filter((i) => vis(lms, i) >= 0.5).length < 1) return false;

  const lSh = lms[LM.leftShoulder];
  const rSh = lms[LM.rightShoulder];
  const lHp = lms[LM.leftHip];
  const rHp = lms[LM.rightHip];
  const midShX = (lSh.x + rSh.x) / 2;
  const midShY = (lSh.y + rSh.y) / 2;
  const midHpX = (lHp.x + rHp.x) / 2;
  const midHpY = (lHp.y + rHp.y) / 2;
  const torso = Math.hypot(midShX - midHpX, midShY - midHpY);
  if (torso < 0.08 || torso > 0.85) return false;
  return true;
}

export function canDriveFsm(active: boolean, locked: boolean, lms: Landmark[]): boolean {
  return active && locked && frameLooksLocked(lms);
}

export class PresenceLock {
  private good = 0;
  private miss = 0;
  locked = false;

  observe(ok: boolean): boolean {
    if (ok) {
      this.good += 1;
      this.miss = 0;
      if (this.good >= ACQUIRE_FRAMES) this.locked = true;
    } else {
      this.miss += 1;
      this.good = 0;
      if (this.miss >= DROP_FRAMES) this.locked = false;
    }
    return this.locked;
  }

  reset() {
    this.good = 0;
    this.miss = 0;
    this.locked = false;
  }
}

export function emptyPose(n = 33): Landmark[] {
  return Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0, visibility: 0 }));
}

export function mapPoseLandmarks(raw: { x: number; y: number; z: number; visibility?: number; presence?: number }[]): Landmark[] {
  const out = emptyPose(33);
  const n = Math.min(33, raw.length);
  for (let i = 0; i < n; i += 1) {
    const p = raw[i];
    out[i] = {
      x: p.x,
      y: p.y,
      z: p.z,
      visibility: p.visibility ?? p.presence ?? 0,
    };
  }
  return out;
}
