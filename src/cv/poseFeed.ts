import type { Landmark } from './math';

export type OverlayPoint = { x: number; y: number; visibility?: number };

export type PoseFeed = {
  native: boolean;
  locked: boolean;
  landmarks: Landmark[];
  world: Landmark[];
  overlay: OverlayPoint[];
};

export const NO_POSE: PoseFeed = {
  native: false,
  locked: false,
  landmarks: [],
  world: [],
  overlay: [],
};

export const NATIVE_WAITING: PoseFeed = {
  native: true,
  locked: false,
  landmarks: [],
  world: [],
  overlay: [],
};
