import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { EMPTY_REPORT, loadCoach, type CoachReport } from '../ai/coach';
import { useApp } from '../context';
import { ArrowRight, Bolt, Bulb, Check } from '../components/Icons';
import { Lbl, NavBar, PrimaryButton } from '../components/Ui';

export function ResultScreen() {
  const { colors, go, curLift, curW, lastSessionId } = useApp();
  const insets = useSafeAreaInsets();
  const [report, setReport] = useState<CoachReport>(EMPTY_REPORT);
  const [rep, setRep] = useState(1);
  const [coaching, setCoaching] = useState(false);

  useEffect(() => {
    let live = true;
    if (lastSessionId == null) {
      setReport(EMPTY_REPORT);
      setCoaching(false);
      return;
    }
    setCoaching(true);
    loadCoach(lastSessionId, (local) => {
      if (!live) return;
      setReport(local);
      setRep(local.byRep.find((x) => x.flag)?.n ?? local.byRep[0]?.n ?? 1);
    }).then((r) => {
      if (!live) return;
      setReport(r);
      setRep(r.byRep.find((x) => x.flag)?.n ?? r.byRep[0]?.n ?? 1);
      setCoaching(false);
    }).catch(() => {
      if (live) setCoaching(false);
    });
    return () => { live = false; };
  }, [lastSessionId]);

  const selected = report.byRep.find((r) => r.n === rep);
  const flagged = report.byRep.filter((r) => r.flag);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar
        title={`${curLift} · live set`}
        subtitle={coaching ? 'Gemini is reading your log…' : `${curW} · ${report.reps} reps · ${report.source === 'gemini' ? 'Gemini' : 'local'} coach`}
        onBack={() => go('home')}
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View style={[styles.replay, { borderColor: colors.hair }]}>
          <Text style={styles.rpTag}>Live kinematics · Rep {rep}</Text>
          <View style={styles.rpFig}>
            <Svg width={96} height={188} viewBox="0 0 120 240" fill="none">
              <Path d="M60 66v46M60 112l-19 34M60 112l19 34M41 146l-3 16M79 146l3 16M60 76l-17 6M60 76l17 6" stroke="#8FA5AE" strokeWidth={5.5} strokeLinecap="round" opacity={0.85} />
              <Circle cx="60" cy="48" r="13.5" fill="#8FA5AE" opacity={0.85} />
            </Svg>
          </View>
          <Text style={styles.liveNote}>
            {selected?.flag ? selected.summary : 'Angles stayed inside the FSM envelope'}
          </Text>
        </View>

        <View style={styles.telem}>
          <Tmc k="Reps" v={`${report.reps}`} unit="" tone={colors.ink} colors={colors} />
          <Tmc k="Avg elbow" v={`${report.avgElbow}`} unit="°" tone={colors.accent} colors={colors} />
          <Tmc k="Faults" v={`${report.faultCount}`} unit="" tone={report.faultCount ? colors.amber : colors.accent} colors={colors} />
        </View>

        <Lbl>Rep by rep</Lbl>
        {report.byRep.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carou}>
            {report.byRep.map((rd) => {
              const on = rd.n === rep;
              return (
                <Pressable
                  key={rd.n}
                  onPress={() => setRep(rd.n)}
                  style={[
                    styles.rp,
                    {
                      borderColor: rd.flag ? colors.amber : on ? colors.accent : colors.hair,
                      backgroundColor: rd.flag ? colors.amberBg : on ? colors.tint : colors.card,
                    },
                  ]}
                >
                  <Text style={[styles.rl, { color: colors.muted }]}>{rd.flag ? `R${rd.n} flag` : `R${rd.n}`}</Text>
                  <Text style={[styles.rdv, { color: rd.flag ? colors.amber : on ? colors.accent : colors.ink }]}>
                    {rd.flag ? '!' : 'ok'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={[styles.empty, { color: colors.muted }]}>No committed reps in this log yet.</Text>
        )}

        <Pressable onPress={() => go('fix')} style={[styles.diag, { borderColor: colors.accent, backgroundColor: colors.card }]}>
          <View style={[styles.dh, { backgroundColor: colors.tint }]}>
            <View style={[styles.di, { backgroundColor: colors.accent }]}><Bulb size={14} /></View>
            <Text style={[styles.dn, { color: colors.accent }]}>
              {coaching ? 'Gemini coaching' : report.source === 'gemini' ? 'Gemini diagnosis' : 'Spotter diagnosis'}
            </Text>
            {coaching ? <ActivityIndicator color={colors.accent} style={{ marginLeft: 'auto' }} /> : null}
          </View>
          <View style={{ padding: 15 }}>
            {report.functioning.length ? (
              <>
                <Text style={[styles.sk, { color: colors.muted }]}>What’s working</Text>
                {report.functioning.map((item) => (
                  <View key={item.area} style={[styles.win, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
                    <View style={[styles.wi, { backgroundColor: colors.accent }]}><Check size={11} /></View>
                    <Text style={[styles.wt, { color: colors.ink2 }]}>
                      <Text style={{ fontWeight: '700', color: colors.ink }}>{item.area}: </Text>
                      {item.detail}
                    </Text>
                  </View>
                ))}
              </>
            ) : (
              <View style={[styles.win, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
                <View style={[styles.wi, { backgroundColor: colors.accent }]}><Check size={11} /></View>
                <Text style={[styles.wt, { color: colors.ink2 }]}>
                  <Text style={{ fontWeight: '700', color: colors.ink }}>Went well: </Text>
                  {report.wentWell}
                </Text>
              </View>
            )}

            <Text style={[styles.sk, { color: colors.muted }]}>Where you went wrong</Text>
            {report.wentWrong.length ? report.wentWrong.map((w) => (
              <Text key={w.where} style={[styles.sv, { color: colors.ink2, marginBottom: 8 }]}>
                <Text style={{ fontWeight: '700', color: colors.ink }}>{w.where}</Text>
                {w.reps && w.reps !== 'none' ? ` · reps ${w.reps}` : ''}{'\n'}{w.detail}
              </Text>
            )) : (
              <Text style={[styles.sv, { color: colors.ink2 }]}>{report.diagnosis}</Text>
            )}

            <Text style={[styles.sk, { color: colors.muted, marginTop: 14 }]}>What to improve</Text>
            {(report.improvements.length ? report.improvements : [{ area: 'Cue', detail: report.why, cue: report.cue }]).map((item) => (
              <View key={item.area} style={[styles.cue, { backgroundColor: colors.tint, marginBottom: 8 }]}>
                <Bolt size={16} color={colors.accent} />
                <Text style={[styles.ct, { color: colors.ink }]}>
                  {item.cue}
                  {'\n'}
                  <Text style={{ fontWeight: '500', color: colors.ink2 }}>{item.detail}</Text>
                </Text>
              </View>
            ))}

            <Text style={[styles.sk, { color: colors.muted, marginTop: 6 }]}>Muscle load</Text>
            <View style={styles.mus}>
              {report.muscles.map((m) => (
                <View key={m.label} style={[styles.mc, { backgroundColor: m.hot ? colors.amberBg : colors.hair2 }]}>
                  <Text style={[styles.mcTx, { color: m.hot ? colors.amber : colors.muted }]}>{m.label}</Text>
                </View>
              ))}
            </View>
            {flagged.length ? (
              <Text style={[styles.sk, { color: colors.muted, marginTop: 14 }]}>
                Flagged reps {flagged.map((f) => f.n).join(', ')}
              </Text>
            ) : null}
          </View>
        </Pressable>
      </ScrollView>
      <View style={[styles.dock, { paddingBottom: insets.bottom + 18, backgroundColor: colors.bg }]}>
        <PrimaryButton label="Apply cue & start next set" onPress={() => go('pick')} trailing={<ArrowRight />} />
      </View>
    </View>
  );
}

function Tmc({ k, v, unit, tone, colors }: { k: string; v: string; unit: string; tone: string; colors: { card2: string; hair: string; muted: string } }) {
  return (
    <View style={[styles.tmc, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
      <Text style={[styles.tk, { color: colors.muted }]}>{k}</Text>
      <Text style={[styles.tv, { color: tone }]}>{v}<Text style={styles.tsu}>{unit}</Text></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  replay: { height: 210, borderRadius: 16, overflow: 'hidden', backgroundColor: '#12171A', borderWidth: 1, marginTop: 8, justifyContent: 'flex-end' },
  rpTag: { position: 'absolute', left: 11, top: 11, zIndex: 3, fontSize: 9, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: 'rgba(255,255,255,0.62)', backgroundColor: 'rgba(10,12,13,0.6)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6, overflow: 'hidden' },
  rpFig: { position: 'absolute', left: '32%', bottom: '18%' },
  liveNote: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', padding: 14, textTransform: 'capitalize' },
  telem: { flexDirection: 'row', gap: 7, marginTop: 12 },
  tmc: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10 },
  tk: { fontSize: 8, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  tv: { fontSize: 17, fontWeight: '700', marginTop: 3 },
  tsu: { fontSize: 9.5, fontWeight: '500', opacity: 0.6 },
  carou: { gap: 7, paddingVertical: 8 },
  rp: { width: 64, borderRadius: 12, borderWidth: 1.5, paddingVertical: 12, alignItems: 'center' },
  rl: { fontSize: 8, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  rdv: { fontSize: 12.5, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  empty: { fontSize: 13, paddingVertical: 10 },
  diag: { borderWidth: 1.5, borderRadius: 18, overflow: 'hidden', marginTop: 16 },
  dh: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 15, paddingVertical: 13 },
  di: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dn: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  win: { flexDirection: 'row', gap: 9, padding: 11, borderRadius: 12, borderWidth: 1, marginBottom: 13 },
  wi: { width: 19, height: 19, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  wt: { flex: 1, fontSize: 13.5, lineHeight: 20 },
  sk: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 5 },
  sv: { fontSize: 14, lineHeight: 22 },
  cue: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 9, alignItems: 'flex-start' },
  ct: { flex: 1, fontSize: 14.5, fontWeight: '700', lineHeight: 21 },
  mus: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 8 },
  mc: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7 },
  mcTx: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  dock: { paddingHorizontal: 20, paddingTop: 12 },
});
