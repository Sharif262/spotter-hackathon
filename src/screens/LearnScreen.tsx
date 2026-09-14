import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATS, EQMETA, GNAME, GORDER, LIB, PATH_D, SPLIT } from '../data';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { ChevronRight, Play, Search } from '../components/Icons';
import { PathThumb } from '../components/SkeletonRig';
import type { Exercise } from '../types';

export function LearnScreen() {
  const { colors, showToast } = useApp();
  const insets = useSafeAreaInsets();
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  const list = useMemo(() => {
    const query = q.toLowerCase().trim();
    return LIB.filter((x) => {
      const okc = cat === 'all' || x.g === cat || (cat === 'machine' && (x.eq === 'mc' || x.eq === 'cb'));
      const okq = !query || x.n.toLowerCase().includes(query) || x.cue.toLowerCase().includes(query) || x.g.includes(query);
      return okc && okq;
    });
  }, [cat, q]);

  const showSplit = cat === 'split' && !q.trim();
  const showFeat = cat === 'all' && !q.trim();

  const Card = ({ x, hideMine }: { x: Exercise; hideMine?: boolean }) => {
    const m = EQMETA[x.eq];
    return (
      <Pressable
        onPress={() => showToast(`${x.n} breakdown opens in the full app`)}
        style={[styles.ex, { backgroundColor: colors.card, borderColor: colors.hair }]}
      >
        <View style={styles.xt}>
          <PathThumb d={PATH_D[x.p]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.xn, { color: colors.ink }]}>
            {x.mine && !hideMine ? '● ' : ''}{x.n}
          </Text>
          <Text style={[styles.xc, { color: colors.ink2 }]} numberOfLines={2}>{x.cue}</Text>
          <Text style={[styles.xmeta, { color: colors.meta }]}>{m.label} · {m.trk} · {x.d}</Text>
        </View>
        <ChevronRight color={colors.muted} size={15} />
      </Pressable>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Meta left="Library" right={q || cat !== 'all' ? `${list.length} shown` : `${LIB.length} exercises`} />
      <H1>Form & mechanics</H1>
      <View style={[styles.srch, { backgroundColor: colors.card, borderColor: colors.hair }]}>
        <Search color={colors.muted} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search exercises, cues, form"
          placeholderTextColor={colors.meta}
          style={[styles.input, { color: colors.ink }]}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills} contentContainerStyle={{ gap: 7 }}>
        {CATS.map((c) => {
          const on = cat === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => setCat(c.id)}
              style={[
                styles.pl,
                on
                  ? { backgroundColor: colors.accent, borderColor: colors.accent }
                  : { backgroundColor: colors.card, borderColor: colors.hair },
              ]}
            >
              <Text style={[styles.plTx, { color: on ? '#fff' : colors.ink2 }]}>{c.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {showFeat ? (
        <Pressable onPress={() => showToast('Masterclass opens in the full app')} style={[styles.feat, { borderColor: colors.hair }]}>
          <View style={styles.fv}>
            <PathThumb d={PATH_D.arc} size={90} />
            <View style={styles.fb}><Text style={styles.fbTx}>Masterclass</Text></View>
            <View style={styles.fp}><Play size={15} /></View>
          </View>
          <View style={[styles.fm, { backgroundColor: colors.card }]}>
            <Text style={[styles.fh, { color: colors.ink }]}>Mastering the bicep curl</Text>
            <Text style={[styles.fd, { color: colors.ink2 }]}>
              Killing elbow drift and momentum, plus how Spotter reads left-versus-right symmetry.
            </Text>
            <View style={styles.fr}>
              <View style={[styles.bdg, { backgroundColor: colors.tint }]}><Text style={[styles.bdgTx, { color: colors.accent }]}>3:15</Text></View>
              <View style={[styles.bdg, { backgroundColor: colors.hair2 }]}><Text style={[styles.bdgTx, { color: colors.muted }]}>45° front-quarter</Text></View>
              <View style={[styles.bdg, { backgroundColor: colors.amberBg }]}><Text style={[styles.bdgTx, { color: colors.amber }]}>Dual-arm symmetry</Text></View>
            </View>
          </View>
        </Pressable>
      ) : null}

      {showSplit ? (
        <>
          <View style={[styles.splitnote, { backgroundColor: colors.card2, borderColor: colors.hair }]}>
            <Text style={[styles.snh, { color: colors.ink }]}>Your routine</Text>
            <Text style={[styles.snb, { color: colors.ink2 }]}>
              2 sets · 6–10 reps · 3 min rest. Running chest+back / arms+shoulders / legs, with push-pull-legs as the alternate.
            </Text>
          </View>
          {SPLIT.map((day, i) => (
            <View key={day.t}>
              <View style={styles.mg}>
                <Text style={[styles.mgTx, { color: colors.muted }]}>Day {i + 1} · {day.t}</Text>
                <Text style={[styles.mgTx, { color: colors.meta }]}>{day.items.length}</Text>
              </View>
              {day.items.map((nm) => {
                const x = LIB.find((l) => l.n === nm);
                return x ? <Card key={nm} x={x} hideMine /> : null;
              })}
            </View>
          ))}
        </>
      ) : (
        GORDER.map((g) => {
          const items = list.filter((x) => x.g === g);
          if (!items.length) return null;
          return (
            <View key={g}>
              <View style={styles.mg}>
                <Text style={[styles.mgTx, { color: colors.muted }]}>{GNAME[g]}</Text>
                <Text style={[styles.mgTx, { color: colors.meta }]}>{items.length}</Text>
              </View>
              {items.map((x) => <Card key={x.n} x={x} />)}
            </View>
          );
        })
      )}
      {!showSplit && list.length === 0 ? (
        <Text style={[styles.hint, { color: colors.muted }]}>No matches. Try another term.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  srch: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginTop: 14 },
  input: { flex: 1, fontSize: 14.5, padding: 0 },
  pills: { marginTop: 14, marginHorizontal: -20, paddingHorizontal: 20 },
  pl: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 11, borderWidth: 1.5 },
  plTx: { fontSize: 13, fontWeight: '600' },
  feat: { borderRadius: 20, overflow: 'hidden', marginTop: 16, backgroundColor: '#0B0F17', borderWidth: 1 },
  fv: { height: 168, alignItems: 'center', justifyContent: 'center', backgroundColor: '#16222E' },
  fb: { position: 'absolute', left: 13, top: 13, backgroundColor: '#22D3EE', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 6 },
  fbTx: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', color: '#0B0F17' },
  fp: { position: 'absolute', right: 13, bottom: 13, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  fm: { padding: 16 },
  fh: { fontSize: 16.5, fontWeight: '700', letterSpacing: -0.3 },
  fd: { fontSize: 13.5, marginTop: 5, lineHeight: 20 },
  fr: { flexDirection: 'row', gap: 7, marginTop: 11, flexWrap: 'wrap' },
  bdg: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5 },
  bdgTx: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  mg: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, marginBottom: 2 },
  mgTx: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  ex: { flexDirection: 'row', gap: 13, padding: 12, borderRadius: 16, borderWidth: 1, marginTop: 9, alignItems: 'center' },
  xt: { width: 82, height: 76, borderRadius: 12, backgroundColor: '#0B0F17', alignItems: 'center', justifyContent: 'center' },
  xn: { fontSize: 15, fontWeight: '700', letterSpacing: -0.24 },
  xc: { fontSize: 12.5, marginTop: 3, lineHeight: 18 },
  xmeta: { fontSize: 11, marginTop: 8 },
  splitnote: { borderRadius: 16, borderWidth: 1, padding: 14, marginTop: 16 },
  snh: { fontSize: 15, fontWeight: '700' },
  snb: { fontSize: 13, marginTop: 4, lineHeight: 19 },
  hint: { fontSize: 9.5, letterSpacing: 0.6, textTransform: 'uppercase', textAlign: 'center', paddingVertical: 24 },
});
