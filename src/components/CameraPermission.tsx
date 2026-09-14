import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraIco } from './Icons';

export function CameraPermission({
  onAsk,
  canAskAgain = true,
}: {
  onAsk: () => void;
  canAskAgain?: boolean;
}) {
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
            if (canAskAgain) onAsk();
            else Linking.openSettings();
          }}
        >
          <Text style={styles.permBtnTx}>{canAskAgain ? 'Enable camera' : 'Open Settings'}</Text>
        </Pressable>
      </View>
    </View>
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
