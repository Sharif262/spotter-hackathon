import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type Ico = { size?: number; color?: string };

const S = ({ size = 20, color = 'currentColor', children }: Ico & { children: React.ReactNode }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </Svg>
);

export const ChevronLeft = ({ size = 18, color = '#0F172A' }: Ico) => (
  <S size={size} color={color}><Path d="M15 18l-6-6 6-6" /></S>
);
export const ArrowRight = ({ size = 17, color = '#fff' }: Ico) => (
  <S size={size} color={color}><Path d="M5 12h14M13 6l6 6-6 6" /></S>
);
export const Bolt = ({ size = 19, color = '#fff' }: Ico) => (
  <S size={size} color={color}><Path d="M13 2L4 14h7l-1 8 9-12h-7z" /></S>
);
export const Sun = ({ size = 17, color = '#475569' }: Ico) => (
  <S size={size} color={color}><Circle cx="12" cy="12" r="4.2" /><Path d="M12 2v2M12 20v2M4.9 4.9l1.5 1.5M17.6 17.6l1.5 1.5M2 12h2M20 12h2M4.9 19.1l1.5-1.5M17.6 6.4l1.5-1.5" /></S>
);
export const Shield = ({ size = 17, color = '#475569' }: Ico) => (
  <S size={size} color={color}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></S>
);
export const Info = ({ size = 17, color = '#475569' }: Ico) => (
  <S size={size} color={color}><Circle cx="12" cy="12" r="9" /><Path d="M12 16v-4M12 8h.01" /></S>
);
export const Check = ({ size = 16, color = '#fff' }: Ico) => (
  <S size={size} color={color}><Path d="M5 13l4 4L19 7" /></S>
);
export const CheckFilled = ({ size = 21, color = '#0088B0' }: Ico) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Path d="M7.5 12.5l3 3 6-6" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
export const Bulb = ({ size = 14, color = '#fff' }: Ico) => (
  <S size={size} color={color}><Path d="M12 3a6 6 0 00-3.6 10.8V16a2 2 0 002 2h3.2a2 2 0 002-2v-2.2A6 6 0 0012 3z" /><Path d="M9.5 21h5" /></S>
);
export const List = ({ size = 20, color = '#64748B' }: Ico) => (
  <S size={size} color={color}><Path d="M4 7h16M4 12h16M4 17h10" /></S>
);
export const Person = ({ size = 20, color = '#64748B' }: Ico) => (
  <S size={size} color={color}><Circle cx="12" cy="8" r="4" /><Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></S>
);
export const CameraIco = ({ size = 22, color = '#fff' }: Ico) => (
  <S size={size} color={color}><Path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><Circle cx="12" cy="13" r="4" /></S>
);
export const Gear = ({ size = 20, color = '#64748B' }: Ico) => (
  <S size={size} color={color}>
    <Circle cx="12" cy="12" r="3" />
    <Path d="M12 2v3M12 19v3M4.2 6.2l2.1 2.1M17.7 15.7l2.1 2.1M2 12h3M19 12h3M4.2 17.8l2.1-2.1M17.7 8.3l2.1-2.1" />
  </S>
);

export function LiftIcon({ name, size = 22, color = '#475569' }: { name: string; size?: number; color?: string }) {
  const n = name.toLowerCase();
  if (n.includes('deadlift')) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={6.5} strokeLinecap="round">
        <Circle cx="50" cy="22" r="8" fill={color} stroke="none" />
        <Path d="M50 32v20M50 40l-14 22M50 40l14 22M26 66h48" />
      </Svg>
    );
  }
  if (n.includes('bench')) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={6.5} strokeLinecap="round">
        <Path d="M22 64h56" />
        <Circle cx="50" cy="56" r="8" fill={color} stroke="none" />
        <Path d="M26 34h48M36 34v14M64 34v14" />
      </Svg>
    );
  }
  if (n.includes('press') || n.includes('ohp')) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <Circle cx="50" cy="26" r="8" fill={color} stroke="none" />
        <Path d="M26 16h48M50 36v22M50 58l-12 24M50 58l12 24" />
      </Svg>
    );
  }
  if (n.includes('tricep')) {
    return (
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <Circle cx="50" cy="22" r="8" fill={color} stroke="none" />
        <Path d="M50 32v16M38 22v28M62 22v28M50 48l-10 22M50 48l10 22" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={6.5} strokeLinecap="round">
      <Circle cx="50" cy="20" r="8" fill={color} stroke="none" />
      <Path d="M34 40c0 18 32 18 32 0M34 40l-8 22M66 40l8 22" />
    </Svg>
  );
}
