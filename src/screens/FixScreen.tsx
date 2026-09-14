import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EMPTY_REPORT, loadCoach, type CoachReport } from '../ai/coach';
import { useApp } from '../context';
import { Bolt, Bulb, Check } from '../components/Icons';
import { H2, Lbl, NavBar, PrimaryButton } from '../components/Ui';

export function FixScreen() {
  const { colors, go, lastSessionId } = useApp();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<CoachReport>(EMPTY_REPORT);
  const [coaching, setCoaching] = useState(false);

  useEffect(() => {
    let live = true;
    if (lastSessionId == null) {
      setReport(EMPTY_REPORT);
      setCoaching(false);
      return;
    }
    setCoaching(true);
    loadCoach(lastSessionId, (local) => { if (live) setReport(local); })
      .then((r) => { if (live) { setReport(r); setCoaching(false); } })
      .catch(() => { if (live) setCoaching(false); });
    return () => { live = false; };
  }, [lastSessionId]);

  const fixes = report.improvements.length
    ? report.improvements
    : [{ area: report.diagnosis, detail: report.why, cue: report.cue }];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar
        title="The fix"
        subtitle={coaching ? 'Gemini is reading your log…' : report.source === 'gemini' ? 'Gemini coach' : 'On-device coach'}
        onBack={() => go('result')}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}>
        <View style={styles.aih}>
          <View style={[styles.aid, { backgroundColor: colors.accent }]}><Bulb size={15} /></View>
          <Lbl>Spotter coach</Lbl>
          {coaching ? <ActivityIndicator color={colors.accent} /> : null}
        </View>
        <H2>{report.cue}</H2>

        {report.functioning.map((item) => (
          <View key={item.area} style={[styles.fix, { borderColor: colors.hair, backgroundColor: colors.card2, marginTop: 12 }]}>
            <View style={styles.fh}>
              <View style={[styles.fnum, { backgroundColor: colors.accent }]}>
                <Check size={11} />
              </View>
              <Text style={[styles.ft, { color: colors.ink }]}>Working · {item.area}</Text>
            </View>
            <Text style={[styles.fb, { color: colors.ink2 }]}>{item.detail}</Text>
          </View>
        ))}

        {fixes.map((item, i) => (
          <View
            key={item.area}
            style={[
              styles.fix,
              i === 0
                ? { borderColor: colors.accent, backgroundColor: colors.tint, marginTop: 12 }
                : { borderColor: colors.hair, backgroundColor: colors.card2 },
            ]}
          >
            <View style={styles.fh}>
              <View style={[styles.fnum, { backgroundColor: i === 0 ? colors.accent : colors.card, borderColor: colors.hair, borderWidth: i === 0 ? 0 : 1 }]}>
                <Text style={[styles.fnumTx, { color: i === 0 ? '#fff' : colors.accent }]}>FIX {String(i + 1).padStart(2, '0')}</Text>
              </View>
              <Text style={[styles.ft, { color: colors.ink }]}>{item.area}</Text>
            </View>
            <Text style={[styles.fb, { color: colors.ink2 }]}>{item.detail}</Text>
            <View style={[styles.fc, { borderTopColor: colors.hair }]}>
              <Bolt size={14} color={colors.accent} />
              <Text style={{ color: colors.muted, fontSize: 13 }}>
                Cue: <Text style={{ color: colors.accent, fontWeight: '700' }}>{item.cue}</Text>
              </Text>
            </View>
          </View>
        ))}

        {report.wentWrong.map((w) => (
          <View key={w.where} style={[styles.fix, { borderColor: colors.hair, backgroundColor: colors.card2 }]}>
            <View style={styles.fh}>
              <View style={[styles.fnum, { backgroundColor: colors.card, borderColor: colors.hair, borderWidth: 1 }]}>
                <Text style={[styles.fnumTx, { color: colors.amber }]}>WRONG</Text>
              </View>
              <Text style={[styles.ft, { color: colors.ink }]}>{w.where}</Text>
            </View>
            <Text style={[styles.fb, { color: colors.ink2 }]}>
              {w.detail}{w.reps && w.reps !== 'none' ? ` Reps ${w.reps}.` : ''}
            </Text>
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
        <PrimaryButton label="Next set" onPress={() => go('pick')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aih: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 6 },
  aid: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  fix: { borderWidth: 1.5, borderRadius: 17, padding: 16, marginBottom: 10 },
  fh: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 8, flexWrap: 'wrap' },
  fnum: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  fnumTx: { color: '#fff', fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6 },
  ft: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.24, flex: 1 },
  fb: { fontSize: 14, lineHeight: 22 },
  fc: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  mus: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  mc: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  mcTx: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  dock: { paddingHorizontal: 20, paddingTop: 12 },
});
