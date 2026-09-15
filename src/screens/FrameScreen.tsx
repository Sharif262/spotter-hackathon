import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context';
import { PoseCamera } from '../components/PoseCamera';
import { PoseOverlay } from '../components/PoseOverlay';
import { NavBar, PrimaryButton } from '../components/Ui';
import { isNativePoseRuntime } from '../cv/poseCapability';
import { NATIVE_WAITING, NO_POSE, type PoseFeed } from '../cv/poseFeed';

export function FrameScreen() {
  const { go, curLift } = useApp();
  const insets = useSafeAreaInsets();
  const [pose, setPose] = useState<PoseFeed>(() => (
    isNativePoseRuntime() ? NATIVE_WAITING : NO_POSE
  ));
  const onPose = useCallback((next: PoseFeed) => setPose(next), []);

  const status = useMemo(() => {
    if (!pose.native) {
      return {
        pill: 'Needs development build',
        title: 'Pose tracking is not in Expo Go',
        sub: 'Install the Spotter development build, then stand so elbows and hips are visible. Start stays off until a body is locked.',
        cta: 'Waiting for pose runtime',
        locked: false,
      };
    }
    if (pose.locked) {
      return {
        pill: 'Locked',
        title: 'Body locked',
        sub: 'Elbows and hips are in frame. Keep this distance for the set.',
        cta: 'Start live set',
        locked: true,
      };
    }
    if (pose.landmarks.length >= 25) {
      return {
        pill: 'Hold still',
        title: 'Seeing you — locking on',
        sub: 'Stay in the box with elbows and hips visible. Start turns on once the lock holds.',
        cta: 'Waiting for a lock',
        locked: false,
      };
    }
    return {
      pill: 'Can’t see you',
      title: 'Step into the box',
      sub: 'Face the phone or stand side-on so elbows and hips are visible. Start stays off until Spotter locks onto one person.',
      cta: 'Waiting for a person',
      locked: false,
    };
  }, [pose.landmarks.length, pose.locked, pose.native]);

  return (
    <View style={styles.root}>
      <PoseCamera onPose={onPose} />
      <PoseOverlay points={pose.overlay.length ? pose.overlay : pose.landmarks} lift={curLift} />
      <View style={styles.fg} pointerEvents="none">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.fgc, styles[c]]} />
        ))}
      </View>
      <NavBar
        overlay
        glass
        onBack={() => go('pick')}
        right={
          <View style={styles.pillc}>
            <View style={[styles.pi, { backgroundColor: status.locked ? '#34D399' : '#F59E0B' }]} />
            <Text style={styles.pillTx}>{status.pill}</Text>
          </View>
        }
      />
      <LinearGradient colors={['transparent', 'rgba(6,8,9,0.9)']} style={[styles.dock, { paddingBottom: insets.bottom + 22 }]}>
        <Text style={styles.ctitle}>{status.title}</Text>
        <Text style={styles.csub}>{status.sub}</Text>
        <PrimaryButton
          label={status.cta}
          disabled={!status.locked}
          onPress={() => go('rec')}
        />
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
  pillc: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(10,12,13,0.68)' },
  pi: { width: 7, height: 7, borderRadius: 4 },
  pillTx: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 20 },
  ctitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  csub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3, marginBottom: 16 },
});
