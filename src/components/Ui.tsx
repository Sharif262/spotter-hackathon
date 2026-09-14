import React from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context';
import { ChevronLeft } from './Icons';

export function NavBar({
  title,
  subtitle,
  onBack,
  right,
  glass,
  overlay,
}: {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
  glass?: boolean;
  overlay?: boolean;
}) {
  const { colors } = useApp();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.nav, overlay && styles.overlay, { paddingTop: insets.top + 14 }]}>
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={[
            styles.bk,
            glass
              ? styles.glass
              : { backgroundColor: colors.card, borderColor: colors.hair },
          ]}
        >
          <ChevronLeft color={glass ? '#fff' : colors.ink} />
        </Pressable>
      ) : (
        <View style={{ width: 38 }} />
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        {title ? (
          <Text style={[styles.ttl, { color: overlay ? '#fff' : colors.ink }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text style={[styles.sub, { color: colors.muted }]} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ?? <View style={{ width: 38 }} />}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  ghost,
  danger,
  glass,
  style,
  trailing,
  disabled,
}: {
  label: string;
  onPress: () => void;
  ghost?: boolean;
  danger?: boolean;
  glass?: boolean;
  style?: StyleProp<ViewStyle>;
  trailing?: React.ReactNode;
  disabled?: boolean;
}) {
  const { colors } = useApp();
  const bg = danger ? colors.red : ghost ? 'transparent' : glass ? 'rgba(255,255,255,0.12)' : colors.accent;
  const color = ghost ? colors.ink : '#fff';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.bt,
        {
          backgroundColor: bg,
          borderWidth: ghost || glass ? 1.5 : 0,
          borderColor: ghost ? colors.hair : 'rgba(255,255,255,0.26)',
          transform: [{ scale: pressed && !disabled ? 0.975 : 1 }],
          opacity: disabled ? 0.45 : 1,
        },
        style,
      ]}
    >
      <Text style={[styles.btTx, { color }]}>{label}</Text>
      {trailing}
    </Pressable>
  );
}

export function Meta({ left, right }: { left: string; right: string }) {
  const { colors } = useApp();
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaTx, { color: colors.muted }]}>{left}</Text>
      <Text style={[styles.metaTx, { color: colors.muted }]}>{right}</Text>
    </View>
  );
}

export function H1({ children }: { children: string }) {
  const { colors } = useApp();
  return <Text style={[styles.h1, { color: colors.ink }]}>{children}</Text>;
}

export function H2({ children }: { children: string }) {
  const { colors } = useApp();
  return <Text style={[styles.h2, { color: colors.ink }]}>{children}</Text>;
}

export function Sub({ children }: { children: string }) {
  const { colors } = useApp();
  return <Text style={[styles.subTxt, { color: colors.muted }]}>{children}</Text>;
}

export function Lbl({ children }: { children: string }) {
  const { colors } = useApp();
  return <Text style={[styles.lbl, { color: colors.muted }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  nav: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 6,
  },
  bk: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glass: {
    backgroundColor: 'rgba(12,14,15,0.6)',
    borderColor: 'rgba(255,255,255,0.16)',
  },
  ttl: { fontSize: 16, fontWeight: '700', letterSpacing: -0.32 },
  sub: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 1 },
  bt: {
    height: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btTx: { fontSize: 16, fontWeight: '700' },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaTx: { fontSize: 10.5, fontWeight: '500', letterSpacing: 0.6, textTransform: 'uppercase' },
  h1: { fontSize: 30, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34, marginTop: 8 },
  h2: { fontSize: 23, fontWeight: '800', letterSpacing: -0.46, lineHeight: 28 },
  subTxt: { fontSize: 14, marginTop: 5 },
  lbl: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
});
