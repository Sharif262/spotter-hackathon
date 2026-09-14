import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SESSIONS } from '../data';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { recentSessions, type SessionRow } from '../storage/workoutStore';

export function SessionsScreen() {
  const { colors, go, showToast, setLastSessionId, setLift } = useApp();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<SessionRow[]>([]);

  useEffect(() => {
    recentSessions(20).then(setRows).catch(() => setRows([]));
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
        {(rows.length ? rows.map((r) => ({
          key: String(r.id),
          name: r.lift,
          detail: `${r.reps} reps · ${r.equipment === 'bb' ? 'barbell' : 'dumbbell'} · live`,
          drift: r.faultCount ?? 0,
          status: (r.faultCount ?? 0) > 4 ? 'bad' : (r.faultCount ?? 0) > 0 ? 'warn' : 'good',
          sessionId: r.id,
          lift: r.lift,
        })) : SESSIONS.map((s) => ({
          key: s.name,
          name: s.name,
          detail: s.detail,
          drift: s.drift,
          status: s.status,
          sessionId: null as number | null,
          lift: 'Bicep curl',
        }))).map((s) => {
          const tone = s.status === 'good' ? colors.accent : s.status === 'warn' ? colors.amber : colors.red;
          return (
            <Pressable
              key={s.key}
              onPress={() => {
                if (s.sessionId != null) {
                  setLift(s.lift, '');
                  setLastSessionId(s.sessionId);
                  go('result');
                } else {
                  showToast('Finish a live set to store it here');
                }
              }}
              style={[styles.row, { borderTopColor: colors.hair2 }]}
            >
              <View>
                <Text style={[styles.nm, { color: colors.ink }]}>{s.name}</Text>
                <Text style={[styles.ss, { color: colors.muted }]}>{s.detail}</Text>
              </View>
              <Text style={[styles.dev, { color: tone }]}>
                {s.drift}<Text style={styles.small}>{rows.length ? ' fx' : ''}</Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.hint, { color: colors.muted }]}>Live faults stay on this device</Text>
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
