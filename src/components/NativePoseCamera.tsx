import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {
  Delegate,
  RunningMode,
  usePoseDetection,
  type PoseDetectionResultBundle,
} from 'react-native-mediapipe-posedetection';
import { PresenceLock, frameLooksLocked, mapPoseLandmarks } from '../cv/presence';
import type { Landmark } from '../cv/math';
import { LM } from '../cv/math';
import { NATIVE_WAITING, type OverlayPoint, type PoseFeed } from '../cv/poseFeed';
import { landmarksToOverlay, resultImageSize } from '../cv/viewMap';
import { CameraPermission } from './CameraPermission';

type Props = {
  active?: boolean;
  onPose: (pose: PoseFeed) => void;
};

const POSE_OPTIONS = {
  numPoses: 1,
  minPoseDetectionConfidence: 0.4,
  minPosePresenceConfidence: 0.4,
  minTrackingConfidence: 0.4,
  delegate: Delegate.CPU,
  fpsMode: 8 as const,
};

function firstPerson(result: PoseDetectionResultBundle) {
  const pack = result.results?.[0];
  const nested = pack?.landmarks;
  const world = pack?.worldLandmarks?.[0];
  if (Array.isArray(nested) && nested.length > 0) {
    const row = nested[0];
    if (Array.isArray(row) && row.length >= 25) {
      return { raw: row, world, count: nested.length };
    }
    if (row && typeof row === 'object' && 'x' in row && nested.length >= 25) {
      return { raw: nested as typeof row[], world, count: 1 };
    }
  }
  const flat = (result as { landmarks?: { x: number; y: number; z: number }[][] }).landmarks;
  if (flat?.[0] && Array.isArray(flat[0]) && flat[0].length >= 25) {
    return { raw: flat[0], world, count: flat.length };
  }
  return { raw: [] as { x: number; y: number; z: number }[], world, count: 0 };
}

export function NativePoseCamera({ active = true, onPose }: Props) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const lockRef = useRef(new PresenceLock());
  const lastGood = useRef<Landmark[]>([]);
  const lastWorld = useRef<Landmark[]>([]);
  const lastOverlay = useRef<OverlayPoint[]>([]);
  const viewSize = useRef({ width: 0, height: 0 });
  const onPoseRef = useRef(onPose);
  const lastLog = useRef(0);
  onPoseRef.current = onPose;

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    onPoseRef.current(NATIVE_WAITING);
    return () => {
      lockRef.current.reset();
    };
  }, []);

  const onResults = useCallback((result: PoseDetectionResultBundle) => {
    const { raw, world: rawWorld, count } = firstPerson(result);
    const lms = raw.length ? mapPoseLandmarks(raw) : [];
    const world = rawWorld?.length ? mapPoseLandmarks(rawWorld) : [];
    const ok = count === 1 && frameLooksLocked(lms);
    const locked = lockRef.current.observe(ok);
    const image = resultImageSize(result);
    const view = viewSize.current;
    const overlay = lms.length >= 25 && image && view.width > 2
      ? landmarksToOverlay(lms, image, view, false)
      : [];
    if (ok) {
      lastGood.current = lms;
      lastWorld.current = world;
      lastOverlay.current = overlay;
    }
    const shown = lms.length >= 25 ? lms : locked ? lastGood.current : [];
    const shownWorld = world.length >= 25 ? world : locked ? lastWorld.current : [];
    const drawn = overlay.length ? overlay : locked ? lastOverlay.current : [];
    const now = Date.now();
    if (now - lastLog.current > 1500) {
      lastLog.current = now;
      console.log('pose', {
        n: raw.length,
        count,
        ok,
        locked,
        img: image,
        view,
        lSh: lms[LM.leftShoulder],
        rSh: lms[LM.rightShoulder],
        lWr: lms[LM.leftWrist],
        rWr: lms[LM.rightWrist],
        oLWr: drawn[LM.leftWrist],
        oRWr: drawn[LM.rightWrist],
      });
    }
    onPoseRef.current({
      native: true,
      locked,
      landmarks: shown,
      world: shownWorld,
      overlay: drawn,
    });
  }, []);

  const onError = useCallback((error: { message?: string }) => {
    console.warn('pose error', error?.message);
    const locked = lockRef.current.observe(false);
    onPoseRef.current({
      native: true,
      locked,
      landmarks: locked ? lastGood.current : [],
      world: locked ? lastWorld.current : [],
      overlay: locked ? lastOverlay.current : [],
    });
  }, []);

  const poseDetection = usePoseDetection(
    { onResults, onError },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    POSE_OPTIONS,
  );

  useEffect(() => {
    poseDetection.cameraDeviceChangeHandler(device);
  }, [device, poseDetection.cameraDeviceChangeHandler]);

  if (!hasPermission) {
    return <CameraPermission onAsk={requestPermission} canAskAgain />;
  }

  if (!device) {
    return null;
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={active}
      pixelFormat="rgb"
      resizeMode="cover"
      frameProcessor={poseDetection.frameProcessor}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        viewSize.current = { width, height };
        poseDetection.cameraViewLayoutChangeHandler(e);
      }}
      onOutputOrientationChanged={poseDetection.cameraOrientationChangedHandler}
    />
  );
}
