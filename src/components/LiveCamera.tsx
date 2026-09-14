import { CameraView, useCameraPermissions, type CameraView as CameraViewType } from 'expo-camera';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { CameraPermission } from './CameraPermission';

type Props = {
  onReady?: (ref: CameraViewType | null) => void;
};

export function LiveCamera({ onReady }: Props) {
  const [camPerm, requestCam] = useCameraPermissions();
  const ref = useRef<CameraViewType>(null);

  useEffect(() => {
    onReady?.(ref.current);
  }, [camPerm?.granted, onReady]);

  useEffect(() => {
    if (camPerm && !camPerm.granted && camPerm.canAskAgain) {
      requestCam();
    }
  }, [camPerm, requestCam]);

  if (!camPerm) {
    return <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0A0C0D' }} />;
  }

  if (!camPerm.granted) {
    return (
      <CameraPermission
        onAsk={() => { if (camPerm.canAskAgain) requestCam(); }}
        canAskAgain={camPerm.canAskAgain}
      />
    );
  }

  return (
    <CameraView
      ref={ref}
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      facing="back"
      mode="picture"
      active
      onCameraReady={() => onReady?.(ref.current)}
    />
  );
}
