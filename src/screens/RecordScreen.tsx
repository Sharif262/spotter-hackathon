import { useKeepAwake } from 'expo-keep-awake';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line } from 'react-native-svg';
import { PoseCamera } from '../components/PoseCamera';
import { useApp } from '../context';
import { useLiveTracker } from '../hooks/useLiveTracker';
import { NO_POSE, type PoseFeed } from '../cv/poseFeed';

export function RecordScreen() {
  useKeepAwake();
  const { go, curLift, equipment, haptic, setLastSessionId } = useApp();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<'cd' | 'live'>('cd');
  const [count, setCount] = useState(3);
  const [pose, setPose] = useState<PoseFeed>(NO_POSE);
  const onPose = useCallback((next: PoseFeed) => setPose(next), []);
  const { hud, stop } = useLiveTracker(curLift, equipment, phase === 'live', pose);
  const finishing = useRef(false);
  const lockedRef = useRef(false);
  lockedRef.current = pose.locked;

  useEffect(() => {
    if (!pose.native) return;
    setPhase('cd');
    setCount(3);
    haptic();
    let k = 3;
    let goTimer: ReturnType<typeof setTimeout> | null = null;
    const id = setInterval(() => {
      if (!lockedRef.current) return;
      k -= 1;
      if (k <= 0) {
        clearInterval(id);
        setCount(0);
        haptic();
        goTimer = setTimeout(() => {
          if (lockedRef.current) setPhase('live');
          else setCount(3);
        }, 400);
      } else {
        setCount(k);
        haptic();
      }
    }, 900);
    return () => {
      clearInterval(id);
      if (goTimer) clearTimeout(goTimer);
    };
  }, [haptic, pose.native]);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    haptic();
    const id = await stop();
    if (id == null) {
      finishing.current = false;
      go('home');
      return;
    }
    setLastSessionId(id);
    go('result');
  }, [go, haptic, setLastSessionId, stop]);

  const cancel = useCallback(() => {
    if (finishing.current) return;
    go('home');
  }, [go]);

  const mm = String(Math.floor(hud.secs / 60)).padStart(2, '0');
  const ss = String(hud.secs % 60).padStart(2, '0');
  const waiting = !pose.native || !pose.locked;
  const banner = !pose.native
    ? 'Pose tracking needs the Spotter development build'
    : !pose.locked
      ? (phase === 'live' ? 'Step back into frame' : 'Can’t see you')
      : hud.cue ?? (phase === 'live' ? `${hud.fsm.replace(/_/g, ' ')} · live` : 'Get set');

  return (
    <View style={styles.root}>
      <PoseCamera onPose={onPose} />

      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {hud.landmarks.map((p, i) => (
            <Circle key={i} cx={p.x * 100} cy={p.y * 100} r={1.1} fill="#22D3EE" opacity={0.9} />
          ))}
          <Line x1="50" y1="0" x2="50" y2="100" stroke="rgba(255,255,255,0.22)" strokeWidth={0.4} strokeDasharray="1 2" />
        </Svg>
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 10 }]}>
        <View style={styles.pill}>
          <View style={[styles.liveDot, { backgroundColor: pose.locked ? '#34D399' : '#F59E0B' }]} />
          <Text style={styles.pillTx}>{pose.locked ? `LIVE ${mm}:${ss}` : 'WAIT'}</Text>
        </View>
        <View style={styles.pill}><Text style={styles.pillTx}>{curLift}</Text></View>
      </View>

      <View style={[styles.banner, (waiting || hud.warn) ? styles.bannerWarn : null, { top: insets.top + 58 }]}>
        <Text style={styles.bannerTx}>{banner}</Text>
      </View>

      {phase === 'live' ? (
        <>
          <View style={[styles.hudRep, { top: insets.top + 126 }]} pointerEvents="none">
            <Text style={styles.rk}>Rep</Text>
            <Text style={[styles.rv, (waiting || hud.warn) && { color: '#FFC46B' }]}>{hud.reps}</Text>
            <Text style={styles.rt}>{waiting ? 'WAITING' : hud.fsm}</Text>
          </View>
          <View style={styles.hudDrift} pointerEvents="none">
            <Text style={styles.dk}>Elbow</Text>
            <Text style={[styles.dv, (waiting || hud.warn) && { color: '#FFC46B' }]}>
              {hud.elbow}<Text style={styles.du}>°</Text>
            </Text>
          </View>
        </>
      ) : null}

      {phase === 'cd' ? (
        <View style={styles.cd}>
          {!pose.native ? (
            <>
              <Text style={styles.cdNeed}>Development build required</Text>
              <Text style={styles.cdlbl}>Expo Go cannot read a body from the camera</Text>
            </>
          ) : (
            <>
              <Text style={styles.cdn}>{!pose.locked ? '—' : count <= 0 ? 'GO' : count}</Text>
              <Text style={styles.cdlbl}>
                {!pose.locked ? 'Can’t see you — countdown paused' : count <= 0 ? 'Track live' : 'Find the start position'}
              </Text>
            </>
          )}
          <Pressable onPress={cancel} style={styles.cancel}>
            <Text style={styles.cancelTx}>Cancel</Text>
          </Pressable>
        </View>
      ) : null}

      <LinearGradient colors={['transparent', 'rgba(6,8,9,0.9)']} style={[styles.dock, { paddingBottom: insets.bottom + 22 }]}>
        <Pressable onPress={finish} disabled={phase !== 'live'} style={[styles.danger, phase !== 'live' && { opacity: 0.45 }]}>
          <Text style={styles.dangerTx}>Finish set</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C0D' },
  top: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 6 },
  pill: { backgroundColor: 'rgba(10,12,13,0.68)', paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', alignItems: 'center', gap: 7 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  pillTx: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  banner: { position: 'absolute', left: 16, right: 16, padding: 13, borderRadius: 15, backgroundColor: 'rgba(0,136,176,0.94)', alignItems: 'center', zIndex: 6 },
  bannerWarn: { backgroundColor: 'rgba(214,132,36,0.96)' },
  bannerTx: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', textAlign: 'center' },
  hudRep: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 5 },
  rk: { fontSize: 12, fontWeight: '700', letterSpacing: 0.7, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },
  rv: { fontSize: 86, fontWeight: '700', color: '#fff', lineHeight: 86, letterSpacing: -3 },
  rt: { fontSize: 13, fontWeight: '700', letterSpacing: 2.6, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' },
  hudDrift: { position: 'absolute', right: 18, top: '53%', alignItems: 'flex-end', zIndex: 5 },
  dk: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' },
  dv: { fontSize: 38, fontWeight: '700', color: '#31B4DA', lineHeight: 40 },
  du: { fontSize: 14, opacity: 0.6 },
  cd: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(6,8,9,0.62)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  cdn: { fontSize: 86, fontWeight: '700', color: '#fff' },
  cdNeed: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', paddingHorizontal: 28 },
  cdlbl: { marginTop: 8, fontSize: 11, fontWeight: '700', letterSpacing: 0.7, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', textAlign: 'center', paddingHorizontal: 24 },
  cancel: { marginTop: 28, paddingHorizontal: 18, paddingVertical: 10 },
  cancelTx: { color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: '600' },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 20 },
  danger: { height: 52, borderRadius: 15, backgroundColor: '#EF4444', alignItems: 'center', justifyContent: 'center' },
  dangerTx: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
