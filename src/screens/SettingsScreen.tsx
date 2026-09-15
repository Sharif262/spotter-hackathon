import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context';
import { H1, Meta } from '../components/Ui';
import { Info, Shield, Sun } from '../components/Icons';

export function SettingsScreen() {
  const { colors, themeName, toggleTheme, showToast } = useApp();
  const insets = useSafeAreaInsets();

  const rows = [
    { icon: <Sun color={colors.ink2} />, t: 'Appearance', v: themeName === 'dark' ? 'Dark' : 'Light', on: toggleTheme },
    { icon: <Shield color={colors.ink2} />, t: 'Privacy', v: 'On device + Gemini', on: () => showToast('Pose stays on phone. The coach log is sent to your local Gemini backend.') },
    { icon: <Info color={colors.ink2} />, t: 'About', v: '1.0', on: () => showToast('Spotter 1.0 · AI Builders Hackathon') },
  ];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 110 }}
    >
      <Meta left="Settings" right="Spotter" />
      <H1>Settings</H1>
      <Text style={[styles.lead, { color: colors.muted }]}>Theme, privacy, and app info. Pose never leaves the phone.</Text>
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
  lead: { fontSize: 14, marginTop: 8, marginBottom: 18, lineHeight: 20 },
  prow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 15, borderBottomWidth: 1 },
  pi: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  pt: { fontSize: 15, fontWeight: '600', flex: 1 },
  pv: { fontSize: 12.5 },
});
