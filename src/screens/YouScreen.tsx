import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { USER_NAME } from '../data';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { recentSessions } from '../storage/workoutStore';

export function YouScreen() {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState({ sets: 0, reps: 0, faults: 0 });

  useEffect(() => {
    recentSessions(100).then((rows) => {
      setStats({
        sets: rows.length,
        reps: rows.reduce((s, r) => s + r.reps, 0),
        faults: rows.reduce((s, r) => s + (r.faultCount ?? 0), 0),
      });
    }).catch(() => {});
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
    >
      <Meta left="Profile" right="Local log" />
      <H1>You</H1>
      <View style={styles.hero}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avaTx}>S</Text>
        </View>
        <View>
          <Text style={[styles.name, { color: colors.ink }]}>{USER_NAME}</Text>
          <Text style={[styles.sub, { color: colors.muted }]}>No account · pose stays local</Text>
        </View>
      </View>
      <View style={styles.stats}>
        {[
          { v: String(stats.sets), l: 'Sets', acc: true },
          { v: String(stats.reps), l: 'Reps', acc: false },
          { v: String(stats.faults), l: 'Faults', acc: false },
        ].map((s) => (
          <View key={s.l} style={[styles.st, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
            <Text style={[styles.stv, { color: s.acc ? colors.accent : colors.ink }]}>{s.v}</Text>
            <Text style={[styles.stl, { color: colors.muted }]}>{s.l}</Text>
          </View>
        ))}
      </View>
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
});
