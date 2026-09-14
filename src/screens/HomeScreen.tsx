import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { TODAY_SETS, USER_NAME } from '../data';
import { useApp } from '../context';
import { Bolt, ChevronRight, LiftIcon } from '../components/Icons';
import { recentSessions } from '../storage/workoutStore';
import type { TodaySet } from '../types';

const C = 2 * Math.PI * 45;

export function HomeScreen() {
  const { colors, go, tab, showToast, setLift, setLastSessionId } = useApp();
  const insets = useSafeAreaInsets();
  const [now, setNow] = useState(new Date());
  const [ring, setRing] = useState(0);
  const [bars, setBars] = useState([0, 0, 0]);
  const [sets, setSets] = useState<TodaySet[]>(TODAY_SETS);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    recentSessions(6).then((rows) => {
      if (!rows.length) return;
      setSets(rows.map((r) => {
        const faults = r.faultCount ?? 0;
        const status = faults > 4 ? 'bad' : faults > 0 ? 'warn' : 'good';
        return {
          lift: r.lift,
          detail: `${r.reps} live reps`,
          drift: faults,
          unit: 'faults',
          status,
          dots: Array.from({ length: Math.max(r.reps, 1) }, (_, i) =>
            ((i === 2 || i === 4) && faults ? 'warn' : 'good') as TodaySet['dots'][number],
          ),
          weight: '',
          sessionId: r.id,
        };
      }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setRing(0);
    setBars([0, 0, 0]);
    const a = setTimeout(() => setRing(79), 260);
    const b = setTimeout(() => setBars([82, 64, 91]), 420);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  const greet = useMemo(() => {
    const h = now.getHours();
    const g = h >= 4 && h < 12 ? 'Good morning' : h >= 12 && h < 20 ? 'Good afternoon' : 'Good evening';
    return `${g}, ${USER_NAME}`;
  }, [now]);

  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const clock = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  const week = useMemo(() => {
    const names = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const jsDow = now.getDay();
    const idx = (jsDow + 6) % 7;
    const done = [0, 1, 3, 4];
    return names.map((n, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (idx - i));
      return { n, day: d.getDate(), done: done.includes(i), today: i === idx };
    });
  }, [now]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.ghead}>
        <View>
          <Text style={[styles.gk, { color: colors.ink2 }]}>{greet}</Text>
          <Text style={[styles.gn, { color: colors.ink }]}>Session 12</Text>
        </View>
        <Pressable onPress={() => tab('you')} style={[styles.ava, { backgroundColor: colors.accent }]}>
          <Text style={styles.avaTx}>S</Text>
        </Pressable>
      </View>

      <View style={styles.dtrow}>
        <Text style={[styles.dt, { color: colors.muted }]}>{dateStr}</Text>
        <Text style={[styles.tm, { color: colors.ink }]}>{clock}</Text>
      </View>

      <View style={styles.tagbar}>
        <View style={[styles.tgp, { backgroundColor: colors.tint, borderColor: 'transparent' }]}>
          <Text style={[styles.tgpTx, { color: colors.accent }]}>4 sets</Text>
        </View>
        <View style={[styles.tgp, { backgroundColor: colors.card, borderColor: colors.hair }]}>
          <Text style={[styles.tgpTx, { color: colors.ink2 }]}>Curl · Press · Tricep</Text>
        </View>
        <View style={[styles.tgp, { backgroundColor: colors.card, borderColor: colors.hair }]}>
          <Text style={[styles.tgpTx, { color: colors.ink2 }]}>4.2 t</Text>
        </View>
      </View>

      <View style={styles.week}>
        {week.map((w, i) => (
          <View
            key={i}
            style={[
              styles.wd,
              { backgroundColor: w.today ? colors.tint : colors.card2, borderColor: w.today ? colors.accent : 'transparent' },
            ]}
          >
            <Text style={[styles.wl, { color: w.today ? colors.accent : colors.muted }]}>{w.n}</Text>
            <Text style={[styles.wn, { color: w.today ? colors.accent : colors.ink }]}>{w.day}</Text>
            <View style={[styles.wdot, { backgroundColor: w.done ? colors.accent : colors.hair }]} />
          </View>
        ))}
      </View>

      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.hair }]}>
        <View style={styles.ring}>
          <Svg width={104} height={104} viewBox="0 0 104 104">
            <Circle cx="52" cy="52" r="45" fill="none" stroke={colors.hair2} strokeWidth={9} />
            <Circle
              cx="52" cy="52" r="45" fill="none" stroke={colors.accent} strokeWidth={9}
              strokeDasharray={`${C}`} strokeDashoffset={C * (1 - ring / 100)}
              strokeLinecap="round" rotation="-90" origin="52, 52"
            />
          </Svg>
          <View style={styles.rin}>
            <Text style={[styles.rn, { color: colors.ink }]}>{ring}</Text>
            <Text style={[styles.rs, { color: colors.muted }]}>Form</Text>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.ht, { color: colors.ink }]}>Solid session</Text>
          <Text style={[styles.hs, { color: colors.ink2 }]}>Live CV · faults stored on device</Text>
          {[
            { k: 'Path', v: bars[0], c: colors.accent, tick: 75 },
            { k: 'Depth', v: bars[1], c: colors.amber, tick: 80 },
            { k: 'Tempo', v: bars[2], c: colors.accent, tick: 70 },
          ].map((b) => (
            <View key={b.k} style={styles.brow}>
              <Text style={[styles.bkey, { color: colors.muted }]}>{b.k}</Text>
              <View style={[styles.btrk, { backgroundColor: colors.hair2 }]}>
                <View style={[styles.tick, { left: `${b.tick}%`, backgroundColor: colors.meta }]} />
                <View style={{ height: '100%', width: `${b.v}%`, backgroundColor: b.c, borderRadius: 4 }} />
              </View>
              <Text style={[styles.bv, { color: b.c }]}>{b.v || ''}</Text>
            </View>
          ))}
          <Text style={[styles.bnote, { color: colors.meta }]}>Tick = your 4-week average</Text>
        </View>
      </View>

      <Pressable
        onPress={() => showToast('4 sessions this week, keep it going')}
        style={[styles.strk, { backgroundColor: colors.accent }]}
      >
        <View style={styles.sfi}><Bolt size={19} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.sft}>4 week streak</Text>
          <Text style={styles.sfs}>Best run since you started</Text>
        </View>
        <ChevronRight color="rgba(255,255,255,0.75)" />
      </Pressable>

      <View style={styles.shd}>
        <Text style={[styles.shdt, { color: colors.ink }]}>Today's sets</Text>
        <Pressable onPress={() => tab('sessions')}><Text style={[styles.sa, { color: colors.accent }]}>History</Text></Pressable>
      </View>

      {sets.map((s, i) => {
        const tone = s.status === 'good' ? colors.accent : s.status === 'warn' ? colors.amber : colors.red;
        const toneBg = s.status === 'good' ? colors.tint : s.status === 'warn' ? colors.amberBg : colors.redBg;
        const label = s.status === 'good' ? 'Clean' : s.status === 'warn' ? 'Watch' : 'Flagged';
        return (
          <Pressable
            key={i}
            onPress={() => {
              setLift(s.lift, s.weight);
              setLastSessionId(s.sessionId ?? null);
              go('result');
            }}
            style={[styles.setc, { backgroundColor: colors.card, borderColor: colors.hair }]}
          >
            <View style={[styles.si, { backgroundColor: toneBg }]}>
              <LiftIcon name={s.lift} color={tone} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sn, { color: colors.ink }]}>{s.lift}</Text>
              <Text style={[styles.sm, { color: colors.ink2 }]}>{s.detail}</Text>
              <View style={styles.rdots}>
                {s.dots.map((d, di) => (
                  <View
                    key={di}
                    style={[
                      styles.dot,
                      { backgroundColor: d === 'good' ? colors.accent : d === 'warn' ? colors.amber : colors.red },
                    ]}
                  />
                ))}
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.sv, { color: tone }]}>
                {Number.isInteger(s.drift) ? s.drift : s.drift.toFixed(1)}
                <Text style={styles.svs}>{s.unit === 'faults' || s.sessionId ? '' : 'cm'}</Text>
              </Text>
              <Text style={[styles.sq, { color: colors.muted }]}>{label}</Text>
            </View>
          </Pressable>
        );
      })}
      <Text style={[styles.hint, { color: colors.muted }]}>Tap a set to open the coach report</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ghead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  gk: { fontSize: 14, fontWeight: '500' },
  gn: { fontSize: 25, fontWeight: '800', letterSpacing: -0.4, marginTop: 1 },
  ava: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avaTx: { color: '#fff', fontWeight: '800', fontSize: 16 },
  dtrow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  dt: { fontSize: 12.5 },
  tm: { fontSize: 12.5, fontWeight: '600' },
  tagbar: { flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  tgp: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 7, borderWidth: 1 },
  tgpTx: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  week: { flexDirection: 'row', gap: 6, marginTop: 18 },
  wd: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 13, borderWidth: 1.5 },
  wl: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  wn: { fontSize: 14, fontWeight: '700', marginTop: 3 },
  wdot: { width: 5, height: 5, borderRadius: 3, marginTop: 5 },
  hero: { flexDirection: 'row', gap: 16, borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 16 },
  ring: { width: 104, height: 104 },
  rin: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  rn: { fontSize: 29, fontWeight: '800', letterSpacing: -1 },
  rs: { fontSize: 8, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 3 },
  ht: { fontSize: 16.5, fontWeight: '700', letterSpacing: -0.3 },
  hs: { fontSize: 14, marginTop: 3, lineHeight: 20 },
  brow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 },
  bkey: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', width: 44 },
  btrk: { flex: 1, height: 5, borderRadius: 4, overflow: 'hidden' },
  tick: { position: 'absolute', top: -2, bottom: -2, width: 1.5, borderRadius: 2 },
  bv: { fontSize: 10.5, fontWeight: '700', width: 28, textAlign: 'right' },
  bnote: { fontSize: 8.5, letterSpacing: 0.6, marginTop: 5, textTransform: 'uppercase' },
  strk: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, borderRadius: 17, marginTop: 14 },
  sfi: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sft: { color: '#fff', fontSize: 15.5, fontWeight: '700' },
  sfs: { color: 'rgba(255,255,255,0.82)', fontSize: 12.5, marginTop: 1 },
  shd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 22, marginBottom: 2 },
  shdt: { fontSize: 17, fontWeight: '700', letterSpacing: -0.34 },
  sa: { fontSize: 13, fontWeight: '600' },
  setc: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14, borderRadius: 16, borderWidth: 1, marginTop: 9 },
  si: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  sn: { fontSize: 15.5, fontWeight: '700', letterSpacing: -0.24 },
  sm: { fontSize: 11.5, marginTop: 2 },
  rdots: { flexDirection: 'row', gap: 3.5, marginTop: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  sv: { fontSize: 17, fontWeight: '700' },
  svs: { fontSize: 9.5, opacity: 0.65 },
  sq: { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 2 },
  hint: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center', paddingVertical: 24 },
});
