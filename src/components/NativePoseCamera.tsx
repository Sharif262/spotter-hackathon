import React, { useEffect, useRef } from 'react';
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
import type { PoseFeed } from '../cv/poseFeed';
import { CameraPermission } from './CameraPermission';

type Props = {
  active?: boolean;
  onPose: (pose: PoseFeed) => void;
};

function firstPose(result: PoseDetectionResultBundle) {
  const nested = result.results?.[0]?.landmarks?.[0];
  if (nested?.length) return { raw: nested, count: result.results[0].landmarks.length };
  const flat = (result as { landmarks?: typeof nested[] }).landmarks;
  if (flat?.[0]?.length) return { raw: flat[0], count: flat.length };
  return { raw: [], count: 0 };
}

export function NativePoseCamera({ active = true, onPose }: Props) {
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  const lockRef = useRef(new PresenceLock());
  const lastGood = useRef<Landmark[]>([]);
  const onPoseRef = useRef(onPose);
  onPoseRef.current = onPose;

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  useEffect(() => () => {
    lockRef.current.reset();
  }, []);

  const poseDetection = usePoseDetection(
    {
      onResults: (result) => {
        const { raw, count } = firstPose(result);
        const lms = raw.length ? mapPoseLandmarks(raw) : [];
        const ok = lms.length > 0 && count === 1 && frameLooksLocked(lms);
        const locked = lockRef.current.observe(ok);
        if (ok) lastGood.current = lms;
        onPoseRef.current({
          native: true,
          locked,
          landmarks: locked ? lastGood.current : [],
        });
      },
      onError: () => {
        const locked = lockRef.current.observe(false);
        onPoseRef.current({
          native: true,
          locked,
          landmarks: locked ? lastGood.current : [],
        });
      },
    },
    RunningMode.LIVE_STREAM,
    'pose_landmarker_lite.task',
    {
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      delegate: Delegate.GPU,
      fpsMode: 15,
    },
  );

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
      frameProcessor={poseDetection.frameProcessor}
      onLayout={poseDetection.cameraViewLayoutChangeHandler}
    />
  );
}
