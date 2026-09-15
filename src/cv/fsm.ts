export type FsmState = 'IDLE' | 'CONCENTRIC' | 'PEAK' | 'ECCENTRIC';

/**
 * One rep = visit the far end of the ROM, then return.
 * Rising alone does not count; dropping alone does not count.
 */
export class EasyRepCounter {
  private lo = Infinity;
  private hi = -Infinity;
  private started = false;
  private reachedFar = false;
  private lastRepAt = -1e9;
  state: FsmState = 'IDLE';

  constructor(
    private minRom: number,
    private refractoryMs = 500,
  ) {}

  setMinRom(n: number) {
    this.minRom = n;
  }

  reset() {
    this.lo = Infinity;
    this.hi = -Infinity;
    this.started = false;
    this.reachedFar = false;
    this.state = 'IDLE';
  }

  step(value: number, t: number): boolean {
    if (!Number.isFinite(value)) return false;
    this.lo = Math.min(this.lo, value);
    this.hi = Math.max(this.hi, value);
    const span = this.hi - this.lo;
    if (span < this.minRom) {
      this.state = 'IDLE';
      return false;
    }

    const far = value >= this.lo + span * 0.72;
    const near = value <= this.lo + span * 0.28;

    if (near) {
      this.started = true;
      if (this.reachedFar && t - this.lastRepAt >= this.refractoryMs) {
        this.reachedFar = false;
        this.lastRepAt = t;
        this.state = 'IDLE';
        return true;
      }
      this.state = this.reachedFar ? 'ECCENTRIC' : 'IDLE';
      return false;
    }

    if (this.started && far) {
      this.reachedFar = true;
      this.state = 'PEAK';
      return false;
    }

    this.state = this.reachedFar ? 'ECCENTRIC' : 'CONCENTRIC';
    return false;
  }
}
