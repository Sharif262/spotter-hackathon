import type { Landmark } from './math';
import { LM } from './math';
import type { OverlayPoint } from './poseFeed';

export type Dims = { width: number; height: number };

export function looksLandscapePose(lms: Landmark[]) {
  const lSh = lms[LM.leftShoulder];
  const rSh = lms[LM.rightShoulder];
  const lHp = lms[LM.leftHip];
  const rHp = lms[LM.rightHip];
  if (!lSh || !rSh || !lHp || !rHp) return false;
  const width = Math.abs(rSh.x - lSh.x);
  const height = Math.abs((lSh.y + rSh.y) / 2 - (lHp.y + rHp.y) / 2);
  return width > height * 1.15;
}

/** Rotate normalized coords so a landscape camera buffer matches a portrait view. */
export function rotateToView(p: { x: number; y: number }, image: Dims, view: Dims, forceLandscape = false) {
  const landscape = forceLandscape || (image.width > image.height && view.height >= view.width);
  if (landscape) {
    return {
      point: { x: 1 - p.y, y: p.x },
      image: { width: Math.min(image.width, image.height), height: Math.max(image.width, image.height) },
    };
  }
  if (image.height > image.width && view.width > view.height) {
    return {
      point: { x: p.y, y: 1 - p.x },
      image: { width: image.height, height: image.width },
    };
  }
  return { point: { x: p.x, y: p.y }, image };
}

/** VisionCamera resizeMode=cover: scale uniformly, crop overflow, keep center. */
export function coverToView(px: number, py: number, frame: Dims, view: Dims) {
  const frameRatio = frame.width / frame.height;
  const viewRatio = view.width / view.height;
  let scale: number;
  let xoffset = 0;
  let yoffset = 0;
  if (frameRatio > viewRatio) {
    scale = view.height / frame.height;
    xoffset = (view.width - frame.width * scale) / 2;
  } else {
    scale = view.width / frame.width;
    yoffset = (view.height - frame.height * scale) / 2;
  }
  return { x: px * scale + xoffset, y: py * scale + yoffset };
}

export function imageToView(
  p: { x: number; y: number },
  image: Dims,
  view: Dims,
  opts?: { mirrorX?: boolean; forceLandscape?: boolean },
): { x: number; y: number } {
  const mirrorX = opts?.mirrorX ?? false;
  if (view.width < 2 || view.height < 2 || image.width < 2 || image.height < 2) {
    return { x: mirrorX ? 1 - p.x : p.x, y: p.y };
  }
  const rotated = rotateToView(p, image, view, opts?.forceLandscape);
  let x = rotated.point.x;
  const y = rotated.point.y;
  if (mirrorX) x = 1 - x;
  const mapped = coverToView(x * rotated.image.width, y * rotated.image.height, rotated.image, view);
  return { x: mapped.x / view.width, y: mapped.y / view.height };
}

export function landmarksToOverlay(
  lms: Landmark[],
  image: Dims,
  view: Dims,
  mirrorX = false,
): OverlayPoint[] {
  const forceLandscape = looksLandscapePose(lms);
  return lms.map((p) => {
    const q = imageToView(p, image, view, { mirrorX, forceLandscape });
    return { x: q.x, y: q.y, visibility: p.visibility };
  });
}

export function resultImageSize(result: { inputImageWidth?: number; inputImageHeight?: number; size?: Dims }): Dims | null {
  const w = result.inputImageWidth ?? result.size?.width;
  const h = result.inputImageHeight ?? result.size?.height;
  if (!w || !h) return null;
  return { width: w, height: h };
}
