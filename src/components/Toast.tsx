import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isTabScreen, useApp } from '../context';
import { Check } from './Icons';

export function Toast() {
  const { toast, colors, screen } = useApp();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  const bottom = isTabScreen(screen) ? insets.bottom + 96 : insets.bottom + 24;
  return (
    <View style={[styles.toast, { bottom, backgroundColor: colors.ink }]}>
      <Check size={16} color={colors.bg} />
      <Text style={[styles.tx, { color: colors.bg }]}>{toast}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 13,
    paddingHorizontal: 17,
    borderRadius: 13,
  },
  tx: { fontSize: 14, fontWeight: '600', flex: 1 },
});
