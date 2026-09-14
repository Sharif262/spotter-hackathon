import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context';
import { LiveCamera } from '../components/LiveCamera';
import { SkeletonRig } from '../components/SkeletonRig';
import { NavBar, PrimaryButton } from '../components/Ui';

export function FrameScreen() {
  const { go } = useApp();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LiveCamera />
      <View style={styles.fg} pointerEvents="none">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.fgc, styles[c]]} />
        ))}
      </View>
      <View style={styles.fig} pointerEvents="none">
        <SkeletonRig />
      </View>
      <NavBar
        overlay
        glass
        onBack={() => go('pick')}
        right={
          <View style={styles.pillc}>
            <View style={styles.pi} />
            <Text style={styles.pillTx}>Side view · full body</Text>
          </View>
        }
      />
      <LinearGradient colors={['transparent', 'rgba(6,8,9,0.9)']} style={[styles.dock, { paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.ctitle}>Frame the lift</Text>
        <Text style={styles.csub}>Stand so elbows and hips are visible. Live tracking writes faults to the on-device log.</Text>
        <PrimaryButton label="Start live set" onPress={() => go('rec')} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C0D' },
  fg: { position: 'absolute', left: 22, right: 22, top: 140, bottom: 210 },
  fgc: { position: 'absolute', width: 32, height: 32, borderColor: 'rgba(255,255,255,0.85)', borderWidth: 2.5 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 13 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 13 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 13 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 13 },
  fig: { position: 'absolute', left: 0, right: 0, bottom: '26%', alignItems: 'center' },
  pillc: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(10,12,13,0.68)' },
  pi: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  pillTx: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 20 },
  ctitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  csub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3, marginBottom: 16 },
});
