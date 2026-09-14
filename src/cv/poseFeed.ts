import type { Landmark } from './math';

export type PoseFeed = {
  native: boolean;
  locked: boolean;
  landmarks: Landmark[];
};

export const NO_POSE: PoseFeed = {
  native: false,
  locked: false,
  landmarks: [],
};
