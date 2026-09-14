import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EMPTY_REPORT, loadCoach, type CoachReport } from '../ai/coach';
import { useApp } from '../context';
import { Bolt, Bulb } from '../components/Icons';
import { H2, Lbl, NavBar, PrimaryButton } from '../components/Ui';

export function FixScreen() {
  const { colors, go, showToast, lastSessionId } = useApp();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<CoachReport>(EMPTY_REPORT);

  useEffect(() => {
    let live = true;
    if (lastSessionId == null) {
      setReport(EMPTY_REPORT);
      return;
    }
    loadCoach(lastSessionId).then((r) => { if (live) setReport(r); }).catch(() => {});
    return () => { live = false; };
  }, [lastSessionId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar title="The fix" onBack={() => go('result')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={styles.aih}>
          <View style={[styles.aid, { backgroundColor: colors.accent }]}><Bulb size={15} /></View>
          <Lbl>Spotter coach</Lbl>
        </View>
        <H2>{report.cue}</H2>
        <View style={[styles.fix, styles.pri, { borderColor: colors.accent, backgroundColor: colors.tint, marginTop: 18 }]}>
          <View style={styles.fh}>
            <View style={[styles.fnum, { backgroundColor: colors.accent }]}><Text style={styles.fnumTx}>FIX 01</Text></View>
            <Text style={[styles.ft, { color: colors.ink }]}>{report.diagnosis}</Text>
          </View>
          <Text style={[styles.fb, { color: colors.ink2 }]}>{report.why}</Text>
          <View style={[styles.fc, { borderTopColor: colors.hair }]}>
            <Bolt size={14} color={colors.accent} />
            <Text style={{ color: colors.muted, fontSize: 13 }}>
              Cue: <Text style={{ color: colors.accent, fontWeight: '700' }}>{report.cue}</Text>
            </Text>
          </View>
        </View>
        {report.watchouts.map((w) => (
          <View key={w.title} style={[styles.fix, { borderColor: colors.hair, backgroundColor: colors.card2 }]}>
            <View style={styles.fh}>
              <View style={[styles.fnum, { backgroundColor: colors.card, borderColor: colors.hair, borderWidth: 1 }]}>
                <Text style={[styles.fnumTx, { color: colors.accent }]}>WATCH</Text>
              </View>
              <Text style={[styles.ft, { color: colors.ink }]}>{w.title}</Text>
            </View>
            <Text style={[styles.fb, { color: colors.ink2 }]}>{w.body}</Text>
          </View>
        ))}
        <View style={{ marginTop: 16 }}>
          <Lbl>Muscle load this set</Lbl>
          <View style={styles.mus}>
            {report.muscles.map((m) => (
              <View key={m.label} style={[styles.mc, { backgroundColor: m.hot ? colors.amberBg : colors.hair2 }]}>
                <Text style={[styles.mcTx, { color: m.hot ? colors.amber : colors.muted }]}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.dock, { paddingBottom: insets.bottom + 18, backgroundColor: colors.bg }]}>
        <View style={{ flex: 1 }}>
          <PrimaryButton ghost label="Saved" onPress={() => showToast('Set is already in the local log')} />
        </View>
        <View style={{ flex: 1.5 }}>
          <PrimaryButton label="Next set" onPress={() => go('pick')} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aih: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 },
  aid: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fix: { borderWidth: 1.5, borderRadius: 17, padding: 16, marginBottom: 10 },
  pri: {},
  fh: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8, flexWrap: 'wrap' },
  fnum: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  fnumTx: { color: '#fff', fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6 },
  ft: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.24, flex: 1 },
  fb: { fontSize: 14, lineHeight: 22 },
  fc: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  mus: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  mc: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  mcTx: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  dock: { paddingHorizontal: 20, paddingTop: 12, flexDirection: 'row', gap: 9 },
});
