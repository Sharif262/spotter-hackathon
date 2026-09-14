import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { USER_NAME } from '../data';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { Info, Ruler, Shield, Sun } from '../components/Icons';

export function YouScreen() {
  const { colors, themeName, metric, toggleTheme, toggleUnits, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const rows = [
    { icon: <Sun color={colors.ink2} />, t: 'Appearance', v: themeName === 'dark' ? 'Dark' : 'Light', on: toggleTheme },
    { icon: <Ruler color={colors.ink2} />, t: 'Units', v: metric ? 'Metric (cm / kg)' : 'Imperial (in / lb)', on: toggleUnits },
    { icon: <Shield color={colors.ink2} />, t: 'Privacy', v: 'On device', on: () => showToast('Pose logs stay in SQLite + CSV on this phone') },
    { icon: <Info color={colors.ink2} />, t: 'About', v: '1.0', on: () => showToast('Spotter 1.0 · AI Builders Hackathon') },
  ];
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
    >
      <Meta left="Profile" right="Local only" />
      <H1>You</H1>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avaTx}>S</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: colors.ink }]}>{USER_NAME}</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>No account · nothing uploaded</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {[
          { v: '12', l: 'Sessions', acc: true },
          { v: '48', l: 'Sets', acc: false },
          { v: '2.9 cm', l: 'Avg drift', acc: false },
        ].map((s) => (
          <View key={s.l} style={[styles.st, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
            <Text style={[styles.stv, { color: s.acc ? colors.accent : colors.ink }]}>{s.v}</Text>
            <Text style={[styles.stl, { color: colors.muted }]}>{s.l}</Text>
          </View>
        ))}
      </View>
      <Text style={[styles.lbl, { color: colors.muted }]}>Settings</Text>
      {rows.map((r) => (
        <Pressable key={r.t} onPress={r.on} style={[styles.prow, { borderBottomColor: colors.hair2 }]}>
          <View style={[styles.pi, { backgroundColor: colors.hair2 }]}>{r.icon}</View>
          <Text style={[styles.pt, { color: colors.ink }]}>{r.t}</Text>
          <Text style={[styles.pv, { color: colors.muted }]}>{r.v}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 20 },
  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avaTx: { color: '#fff', fontSize: 24, fontWeight: '800' },
  name: { fontSize: 18, fontWeight: '700', letterSpacing: -0.36 },
  sub: { fontSize: 14, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 8, marginTop: 18 },
  st: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  stv: { fontSize: 24, fontWeight: '800', letterSpacing: -0.48 },
  stl: { fontSize: 8.5, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  lbl: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 18, marginBottom: 4 },
  prow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, borderBottomWidth: 1 },
  pi: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 15, fontWeight: '600', flex: 1 },
  pv: { fontSize: 12.5 },
});
