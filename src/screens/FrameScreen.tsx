import React, { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context';
import { LiveCamera } from '../components/LiveCamera';
import { SkeletonRig } from '../components/SkeletonRig';
import { Volume, VolumeOff } from '../components/Icons';
import { NavBar, PrimaryButton } from '../components/Ui';
import { lockGreen } from '../theme';

export function FrameScreen() {
  const { go, audioOn, toggleAudio } = useApp();
  const insets = useSafeAreaInsets();
  const [scanning, setScanning] = useState(true);
  const [locked, setLocked] = useState(false);
  const [angle, setAngle] = useState(104);
  const [tilt, setTilt] = useState(0.72);
  const scanY = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setScanning(true);
    setLocked(false);
    setAngle(104);
    setTilt(0.72);
    const loop = Animated.loop(
      Animated.timing(scanY, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    );
    loop.start();
    const t1 = setTimeout(() => { setAngle(96); setTilt(0.58); }, 700);
    const t2 = setTimeout(() => { setAngle(90); setTilt(0.5); }, 1500);
    const t3 = setTimeout(() => {
      setScanning(false);
      setLocked(true);
      loop.stop();
    }, 2100);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); loop.stop(); };
  }, [scanY]);

  const pill = locked
    ? { bg: 'rgba(0,136,176,0.92)', tx: 'Lifter locked · 90° side', dot: lockGreen }
    : { bg: 'rgba(10,12,13,0.68)', tx: scanning ? 'Scanning for lifter' : 'Optimal angle detected', dot: scanning ? '#F59E0B' : lockGreen };

  return (
    <View style={styles.root}>
      <LiveCamera />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={styles.grid} />
      </View>
      {scanning ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.scan,
            {
              transform: [{
                translateY: scanY.interpolate({ inputRange: [0, 1], outputRange: [-80, 520] }),
              }],
            },
          ]}
        />
      ) : null}

      <View style={styles.fg} pointerEvents="none">
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <View key={c} style={[styles.fgc, styles[c], locked && { borderColor: '#0088B0' }]} />
        ))}
      </View>

      <View style={styles.fig} pointerEvents="none">
        <SkeletonRig scanning={scanning} locked={locked} />
      </View>

      <View style={[styles.lvl, { top: insets.top + 118 }]} pointerEvents="none">
        <Text style={styles.lv}>Tilt</Text>
        <View style={styles.lt}>
          <View style={[styles.dot, { left: `${tilt * 100}%`, backgroundColor: locked ? lockGreen : '#F59E0B' }]} />
        </View>
        <Text style={styles.lv}>{angle}°</Text>
      </View>

      <NavBar
        overlay
        glass
        onBack={() => go('pick')}
        right={
          <View style={[styles.pillc, { backgroundColor: pill.bg }]}>
            <View style={[styles.pi, { backgroundColor: pill.dot }]} />
            <Text style={styles.pillTx}>{pill.tx}</Text>
          </View>
        }
      />

      <LinearGradient colors={['transparent', 'rgba(6,8,9,0.9)']} style={[styles.dock, { paddingBottom: insets.bottom + 22 }]}>
        <View style={styles.calib}>
          {[
            ['Distance', '2.4 m', 'Optimal'],
            ['Height', '68 cm', 'Waist'],
            ['Angle', '90°', 'Lateral'],
          ].map(([k, v, s]) => (
            <View key={k} style={styles.cb}>
              <Text style={styles.ck}>{k}</Text>
              <Text style={styles.cv}>{v}</Text>
              <Text style={styles.cs}>{s}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.ctitle}>Lock the camera</Text>
        <Text style={styles.csub}>Live tracking starts in-app. Faults are stored on device, then the coach reads the log.</Text>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <Pressable onPress={toggleAudio} style={[styles.audio, !audioOn && styles.audioOff]}>
            {audioOn ? <Volume /> : <VolumeOff />}
          </Pressable>
          <View style={{ flex: 1 }}>
            <PrimaryButton label="Start live set" onPress={() => go('rec')} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0C0D' },
  grid: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.08 },
  scan: {
    position: 'absolute', left: 0, right: 0, height: 150,
    backgroundColor: 'rgba(34,211,238,0.22)',
  },
  fg: { position: 'absolute', left: 22, right: 22, top: 140, bottom: 210 },
  fgc: { position: 'absolute', width: 32, height: 32, borderColor: 'rgba(255,255,255,0.85)', borderWidth: 2.5 },
  tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 13 },
  tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 13 },
  bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 13 },
  br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 13 },
  fig: { position: 'absolute', left: 0, right: 0, bottom: '26%', alignItems: 'center' },
  lvl: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 10, zIndex: 5 },
  lt: { flex: 1, height: 3, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 3 },
  dot: { position: 'absolute', top: -3.5, width: 10, height: 10, borderRadius: 5, marginLeft: -5 },
  lv: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase' },
  pillc: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  pi: { width: 7, height: 7, borderRadius: 4 },
  pillTx: { color: '#fff', fontSize: 12.5, fontWeight: '600' },
  dock: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 20 },
  calib: { flexDirection: 'row', gap: 7, marginBottom: 14 },
  cb: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', borderRadius: 12, padding: 10 },
  ck: { fontSize: 8.5, letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' },
  cv: { fontSize: 13.5, fontWeight: '700', color: '#fff', marginTop: 2 },
  cs: { fontSize: 8, letterSpacing: 0.6, textTransform: 'uppercase', color: lockGreen, marginTop: 2 },
  ctitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  csub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 3, marginBottom: 16 },
  audio: { width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.24)', alignItems: 'center', justifyContent: 'center' },
  audioOff: { opacity: 0.45 },
});
