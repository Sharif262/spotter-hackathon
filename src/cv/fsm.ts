export type FsmState = 'IDLE' | 'CONCENTRIC' | 'PEAK' | 'ECCENTRIC';

export type FsmConfig = {
  startThreshold: number;
  peakThreshold: number;
  concentricDecreases: boolean;
  holdFrames?: number;
};

export class RepFsm {
  state: FsmState = 'IDLE';
  private hold = 0;
  private pending: FsmState | null = null;
  private armed = false;
  readonly holdFrames: number;

  constructor(private cfg: FsmConfig) {
    this.holdFrames = cfg.holdFrames ?? 3;
  }

  reset() {
    this.state = 'IDLE';
    this.hold = 0;
    this.pending = null;
    this.armed = false;
  }

  private commit(next: FsmState): boolean {
    if (this.pending !== next) {
      this.pending = next;
      this.hold = 1;
      return false;
    }
    this.hold += 1;
    if (this.hold < this.holdFrames) return false;
    this.state = next;
    this.pending = null;
    this.hold = 0;
    return true;
  }

  atStart(angle: number) {
    return this.cfg.concentricDecreases
      ? angle >= this.cfg.startThreshold
      : angle <= this.cfg.startThreshold;
  }

  atPeak(angle: number) {
    return this.cfg.concentricDecreases
      ? angle <= this.cfg.peakThreshold
      : angle >= this.cfg.peakThreshold;
  }

  step(angle: number): 'rep' | null {
    switch (this.state) {
      case 'IDLE':
        if (this.atStart(angle)) this.armed = true;
        if (this.armed && !this.atStart(angle)) this.commit('CONCENTRIC');
        break;
      case 'CONCENTRIC':
        if (this.atPeak(angle)) this.commit('PEAK');
        break;
      case 'PEAK':
        if (!this.atPeak(angle)) this.commit('ECCENTRIC');
        break;
      case 'ECCENTRIC':
        if (this.atStart(angle) && this.commit('IDLE')) {
          this.armed = true;
          return 'rep';
        }
        break;
    }
    return null;
  }
}
