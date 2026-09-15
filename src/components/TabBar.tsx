import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTabScreen, useApp } from '../context';
import type { TabId } from '../types';
import { CameraIco, Gear, List, Person } from './Icons';

export function TabBar() {
  const { screen, tab, go, colors } = useApp();
  const insets = useSafeAreaInsets();
  if (!isTabScreen(screen)) return null;

  const item = (id: TabId, label: string, Icon: typeof CameraIco) => {
    const on = screen === id;
    const color = on ? colors.accent : colors.muted;
    return (
      <Pressable onPress={() => tab(id)} style={styles.tb} accessibilityLabel={label}>
        {on ? <View style={[styles.pill, { backgroundColor: colors.accent }]} /> : <View style={styles.pillSpacer} />}
        <Icon size={20} color={color} />
        <Text style={[styles.tl, { color }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: insets.bottom + 10,
          borderTopColor: colors.hair,
          backgroundColor: colors.tabBg,
        },
      ]}
    >
      {item('home', 'Live', CameraIco)}
      {item('sessions', 'Sessions', List)}
      <Pressable onPress={() => go('pick')} style={[styles.recb, { backgroundColor: colors.accent, borderColor: colors.bg }]} accessibilityLabel="New set">
        <View style={styles.in} />
      </Pressable>
      {item('you', 'You', Person)}
      {item('settings', 'Settings', Gear)}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingTop: 9,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    zIndex: 5,
  },
  tb: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 4 },
  pill: { width: 22, height: 3, borderRadius: 3, marginBottom: 2 },
  pillSpacer: { width: 22, height: 3, marginBottom: 2 },
  tl: { fontSize: 8, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  recb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginTop: -22,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
  },
  in: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
});
