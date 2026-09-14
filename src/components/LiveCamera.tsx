import { CameraView, useCameraPermissions, type CameraView as CameraViewType } from 'expo-camera';
import React, { useEffect, useRef } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraIco } from './Icons';

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
    return <View style={styles.fallback} />;
  }

  if (!camPerm.granted) {
    return (
      <View style={styles.fallback}>
        <View style={styles.permCard}>
          <CameraIco size={28} color="#31B4DA" />
          <Text style={styles.permTitle}>Camera access needed</Text>
          <Text style={styles.permBody}>
            Spotter uses the live camera to estimate pose, count reps, and flag form breaks. Nothing is uploaded.
          </Text>
          <Pressable
            style={styles.permBtn}
            onPress={() => {
              if (camPerm.canAskAgain) requestCam();
              else Linking.openSettings();
            }}
          >
            <Text style={styles.permBtnTx}>
              {camPerm.canAskAgain ? 'Enable camera' : 'Open Settings'}
            </Text>
          </Pressable>
        </View>
      </View>
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

const styles = StyleSheet.create({
  fallback: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0A0C0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permCard: {
    marginHorizontal: 28,
    backgroundColor: 'rgba(21,28,39,0.92)',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  permTitle: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 6 },
  permBody: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', lineHeight: 20 },
  permBtn: {
    marginTop: 10,
    backgroundColor: '#0088B0',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 22,
  },
  permBtnTx: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
