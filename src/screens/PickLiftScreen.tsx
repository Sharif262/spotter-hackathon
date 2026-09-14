import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LIFTS } from '../data';
import { useApp } from '../context';
import { ArrowRight, CheckFilled, LiftIcon } from '../components/Icons';
import { H2, NavBar, PrimaryButton, Sub } from '../components/Ui';

export function PickLiftScreen() {
  const { colors, go, curLift, setLift } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <NavBar title="New set" subtitle="Step 1 of 2" onBack={() => go('home')} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <H2>What are you lifting?</H2>
        <Sub>Sets the joint-angle FSM Spotter tracks live.</Sub>
        <View style={{ marginTop: 20 }}>
          {LIFTS.map((l) => {
            const on = curLift === l.lift;
            return (
              <Pressable
                key={l.lift}
                onPress={() => setLift(l.lift, l.w, l.eq)}
                style={[
                  styles.lift,
                  {
                    borderColor: on ? colors.accent : colors.hair,
                    backgroundColor: on ? colors.tint : colors.card,
                  },
                ]}
              >
                <View style={[styles.ic, { backgroundColor: on ? colors.accent : colors.hair2 }]}>
                  <LiftIcon name={l.lift} color={on ? '#fff' : colors.ink2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.t, { color: colors.ink }]}>{l.lift}</Text>
                  <Text style={[styles.d, { color: colors.muted }]}>{l.d}</Text>
                </View>
                {on ? <CheckFilled color={colors.accent} /> : <View style={{ width: 21 }} />}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={[styles.dock, { paddingBottom: insets.bottom + 18, backgroundColor: colors.bg }]}>
        <PrimaryButton label="Continue" onPress={() => go('frame')} trailing={<ArrowRight />} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  lift: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 15, borderRadius: 16, borderWidth: 1.5, marginBottom: 10 },
  ic: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 16, fontWeight: '700', letterSpacing: -0.24 },
  d: { fontSize: 10, marginTop: 2, letterSpacing: 0.3 },
  dock: { paddingHorizontal: 20, paddingTop: 12 },
});
