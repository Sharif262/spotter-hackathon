import React, { useEffect } from 'react';
import { isNativePoseRuntime } from '../cv/poseCapability';
import { NO_POSE, type PoseFeed } from '../cv/poseFeed';
import { LiveCamera } from './LiveCamera';

type Props = {
  active?: boolean;
  onPose: (pose: PoseFeed) => void;
};

export function PoseCamera({ active = true, onPose }: Props) {
  const native = isNativePoseRuntime();

  useEffect(() => {
    if (!native) onPose(NO_POSE);
  }, [native, onPose]);

  if (!native) {
    return <LiveCamera />;
  }

  try {
    const { NativePoseCamera } = require('./NativePoseCamera') as typeof import('./NativePoseCamera');
    return <NativePoseCamera active={active} onPose={onPose} />;
  } catch {
    return <LiveCamera />;
  }
}
