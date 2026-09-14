import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTabScreen, useApp } from '../context';
import { CameraIco, List, Person } from './Icons';

export function TabBar() {
  const { screen, tab, go, colors } = useApp();
  const insets = useSafeAreaInsets();
  if (!isTabScreen(screen)) return null;

  const item = (id: 'home' | 'sessions' | 'you', label: string, Icon: typeof CameraIco) => {
    const on = screen === id;
    const color = on ? colors.accent : colors.muted;
    return (
      <Pressable onPress={() => tab(id)} style={styles.tb}>
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
    paddingHorizontal: 8,
    borderTopWidth: 1,
    zIndex: 5,
  },
  tb: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  pill: { width: 26, height: 3, borderRadius: 3, marginBottom: 2 },
  pillSpacer: { width: 26, height: 3, marginBottom: 2 },
  tl: { fontSize: 8.5, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  recb: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginTop: -26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
  },
  in: { width: 23, height: 23, borderRadius: 12, backgroundColor: '#fff' },
});
