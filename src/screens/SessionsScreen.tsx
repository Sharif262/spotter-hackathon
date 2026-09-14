import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { recentSessions, type SessionRow } from '../storage/workoutStore';

export function SessionsScreen() {
  const { colors, go, setLastSessionId, setLift } = useApp();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<SessionRow[]>([]);

  useEffect(() => {
    recentSessions(40).then(setRows).catch(() => setRows([]));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <Meta left="History" right={rows.length ? `${rows.length} live sets` : 'On device'} />
      <H1>Sessions</H1>
      <View style={{ marginTop: 18 }}>
        {rows.length ? rows.map((r) => {
          const faults = r.faultCount ?? 0;
          const status = faults > 4 ? 'bad' : faults > 0 ? 'warn' : 'good';
          const tone = status === 'good' ? colors.accent : status === 'warn' ? colors.amber : colors.red;
          return (
            <Pressable
              key={r.id}
              onPress={() => {
                setLift(r.lift, '');
                setLastSessionId(r.id);
                go('result');
              }}
              style={[styles.row, { borderTopColor: colors.hair2 }]}
            >
              <View>
                <Text style={[styles.nm, { color: colors.ink }]}>{r.lift}</Text>
                <Text style={[styles.ss, { color: colors.muted }]}>
                  {r.reps} reps · {r.equipment === 'bb' ? 'barbell' : 'dumbbell'} · live
                </Text>
              </View>
              <Text style={[styles.dev, { color: tone }]}>
                {faults}<Text style={styles.small}> fx</Text>
              </Text>
            </Pressable>
          );
        }) : (
          <Text style={[styles.hint, { color: colors.muted }]}>No live sets stored yet</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, borderTopWidth: StyleSheet.hairlineWidth },
  nm: { fontSize: 16.5, fontWeight: '700', letterSpacing: -0.24 },
  ss: { fontSize: 10.5, marginTop: 3, letterSpacing: 0.2 },
  dev: { fontSize: 18, fontWeight: '700' },
  small: { fontSize: 10.5, fontWeight: '500', opacity: 0.72 },
  hint: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center', paddingVertical: 24 },
});
