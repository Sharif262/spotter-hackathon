import React from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { cyan } from '../theme';

export function SkeletonRig({
  scanning = false,
  locked = false,
  width = 164,
  height = 316,
}: {
  scanning?: boolean;
  locked?: boolean;
  width?: number;
  height?: number;
}) {
  const bone = scanning ? '#F59E0B' : cyan;
  const joint = scanning ? '#F59E0B' : cyan;
  const core = scanning ? '#FCD34D' : '#fff';
  const halo = scanning ? '#F59E0B' : cyan;
  return (
    <Svg width={width} height={height} viewBox="0 0 130 250" fill="none">
      <G stroke={bone} strokeWidth={2.4} strokeLinecap="round" opacity={0.75}>
        <Path d="M65 40 L65 62" />
        <Path d="M42 68 L88 68" />
        <Path d="M65 62 L65 118" />
        <Path d="M44 118 L86 118" />
        <Path d="M42 68 L34 96 L38 118" />
        <Path d="M88 68 L96 96 L92 118" />
        <Path d="M46 118 L40 168 L44 208" />
        <Path d="M84 118 L90 168 L86 208" />
        <Path d="M44 208 L32 213" />
        <Path d="M86 208 L98 213" />
      </G>
      <Path d="M20 62 H110" stroke={cyan} strokeWidth={5.5} strokeLinecap="round" opacity={0.95} />
      <Rect x="14" y="50" width="6" height="24" rx="3" fill={cyan} />
      <Rect x="110" y="50" width="6" height="24" rx="3" fill={cyan} />
      <Circle cx="65" cy="30" r="11" fill="none" stroke={cyan} strokeWidth={2.4} opacity={0.8} />
      <Circle cx="20" cy="62" r="8" fill={halo} opacity={0.18} />
      <Circle cx="20" cy="62" r="3.6" fill={core} />
      <Circle cx="110" cy="62" r="8" fill={halo} opacity={0.18} />
      <Circle cx="110" cy="62" r="3.6" fill={core} />
      <Circle cx="42" cy="68" r="3.4" fill={joint} />
      <Circle cx="88" cy="68" r="3.4" fill={joint} />
      <Circle cx="34" cy="96" r="3" fill={joint} />
      <Circle cx="96" cy="96" r="3" fill={joint} />
      <Circle cx="46" cy="118" r="7" fill={halo} opacity={0.18} />
      <Circle cx="46" cy="118" r="3.6" fill={joint} />
      <Circle cx="84" cy="118" r="7" fill={halo} opacity={0.18} />
      <Circle cx="84" cy="118" r="3.6" fill={joint} />
      <Circle cx="40" cy="168" r="3.4" fill={joint} />
      <Circle cx="90" cy="168" r="3.4" fill={joint} />
      <Circle cx="44" cy="208" r="3" fill={joint} />
      <Circle cx="86" cy="208" r="3" fill={joint} />
      {locked ? (
        <>
          <Circle cx="46" cy="118" r="12" fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.5} />
          <Circle cx="84" cy="118" r="12" fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.5} />
          <Circle cx="40" cy="168" r="12" fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.5} />
          <Circle cx="90" cy="168" r="12" fill="none" stroke={cyan} strokeWidth={1.6} opacity={0.5} />
        </>
      ) : null}
    </Svg>
  );
}

export function PathThumb({ d, size = 52 }: { d: string; size?: number }) {
  return (
    <Svg viewBox="0 0 60 64" width={size} height={size * (64 / 60)} fill="none">
      <Path d={d} stroke="#22D3EE" strokeWidth={1.4} fill="none" opacity={0.22} />
      <Path d={d} stroke="#22D3EE" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      <Circle cx="30" cy="12" r="4" fill="#22D3EE" />
    </Svg>
  );
}
