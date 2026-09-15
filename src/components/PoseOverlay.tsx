import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { LM } from '../cv/math';
import { liftToExercise, type ExerciseId } from '../cv/exercises';
import type { OverlayPoint } from '../cv/poseFeed';

const BONES: [number, number][] = [
  [LM.leftShoulder, LM.rightShoulder],
  [LM.leftShoulder, LM.leftElbow],
  [LM.leftElbow, LM.leftWrist],
  [LM.rightShoulder, LM.rightElbow],
  [LM.rightElbow, LM.rightWrist],
  [LM.leftShoulder, LM.leftHip],
  [LM.rightShoulder, LM.rightHip],
  [LM.leftHip, LM.rightHip],
  [LM.leftHip, LM.leftKnee],
  [LM.leftKnee, LM.leftAnkle],
  [LM.rightHip, LM.rightKnee],
  [LM.rightKnee, LM.rightAnkle],
];

const JOINTS = [
  LM.leftShoulder,
  LM.rightShoulder,
  LM.leftElbow,
  LM.rightElbow,
  LM.leftWrist,
  LM.rightWrist,
  LM.leftHip,
  LM.rightHip,
  LM.leftKnee,
  LM.rightKnee,
];

const WRISTS = [LM.leftWrist, LM.rightWrist] as const;
const ELBOWS = [LM.leftElbow, LM.rightElbow] as const;

const TRAIL = 20;
const MIN_VIS = 0.2;

function seen(p?: OverlayPoint) {
  if (!p) return false;
  if ((p.visibility ?? 1) < MIN_VIS) return false;
  return p.x > -0.05 && p.x < 1.05 && p.y > -0.05 && p.y < 1.05;
}

function xy(p: OverlayPoint) {
  return { x: p.x * 100, y: p.y * 100 };
}

function workingBones(exercise: ExerciseId): Set<string> {
  if (exercise === 'shoulder_press') {
    return new Set(['11-13', '13-15', '12-14', '14-16', '11-12']);
  }
  if (exercise === 'tricep_extension') {
    return new Set(['11-13', '13-15', '12-14', '14-16']);
  }
  return new Set(['11-13', '13-15', '12-14', '14-16']);
}

function boneKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function PoseOverlay({
  points,
  lift,
}: {
  points: OverlayPoint[];
  lift?: string;
}) {
  const trails = useRef({ l: [] as string[], r: [] as string[] });
  const exercise = liftToExercise(lift ?? '');
  const hot = workingBones(exercise);

  if (points.length < 25) {
    trails.current = { l: [], r: [] };
    return null;
  }

  const lSh = points[LM.leftShoulder];
  const rSh = points[LM.rightShoulder];
  const lHp = points[LM.leftHip];
  const rHp = points[LM.rightHip];
  const stacked = seen(lSh) && seen(rSh) && seen(lHp) && seen(rHp);
  const midHp = stacked ? { x: ((lHp.x + rHp.x) / 2) * 100, y: ((lHp.y + rHp.y) / 2) * 100 } : null;

  const lw = points[LM.leftWrist];
  const rw = points[LM.rightWrist];
  if (seen(lw)) {
    trails.current.l.push(`${lw.x * 100},${lw.y * 100}`);
    if (trails.current.l.length > TRAIL) trails.current.l.shift();
  }
  if (seen(rw)) {
    trails.current.r.push(`${rw.x * 100},${rw.y * 100}`);
    if (trails.current.r.length > TRAIL) trails.current.r.shift();
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {midHp ? (
          <Line
            x1={midHp.x}
            y1={0}
            x2={midHp.x}
            y2={100}
            stroke="#F5D000"
            strokeWidth={0.45}
            strokeDasharray="2.2 1.8"
            opacity={0.85}
          />
        ) : null}
        {trails.current.l.length > 2 ? (
          <Polyline points={trails.current.l.join(' ')} fill="none" stroke="#2563EB" strokeWidth={0.75} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ) : null}
        {trails.current.r.length > 2 ? (
          <Polyline points={trails.current.r.join(' ')} fill="none" stroke="#2563EB" strokeWidth={0.75} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
        ) : null}
        {BONES.map(([a, b], i) => {
          const pa = points[a];
          const pb = points[b];
          if (!seen(pa) || !seen(pb)) return null;
          const A = xy(pa);
          const B = xy(pb);
          const active = hot.has(boneKey(a, b));
          return (
            <Line
              key={`b${i}`}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke="#E53935"
              strokeWidth={active ? 1.35 : 0.7}
              strokeLinecap="round"
              opacity={active ? 1 : 0.55}
            />
          );
        })}
        {JOINTS.filter((i) => !WRISTS.includes(i as typeof WRISTS[number]) && !ELBOWS.includes(i as typeof ELBOWS[number])).flatMap((i) => {
          const p = points[i];
          if (!seen(p)) return [];
          const { x, y } = xy(p);
          return [
            <Circle key={`g${i}`} cx={x} cy={y} r={2.1} fill="#22D3EE" opacity={0.18} />,
            <Circle key={`j${i}`} cx={x} cy={y} r={1.25} fill="#22D3EE" stroke="#0E7490" strokeWidth={0.22} />,
          ];
        })}
        {ELBOWS.flatMap((i) => {
          const p = points[i];
          if (!seen(p)) return [];
          const { x, y } = xy(p);
          return [
            <Circle key={`eg${i}`} cx={x} cy={y} r={2.6} fill="#22D3EE" opacity={0.22} />,
            <Circle key={`e${i}`} cx={x} cy={y} r={1.7} fill="#22D3EE" stroke="#0E7490" strokeWidth={0.28} />,
          ];
        })}
        {WRISTS.flatMap((i) => {
          const p = points[i];
          if (!seen(p)) return [];
          const { x, y } = xy(p);
          return [
            <Circle key={`wg${i}`} cx={x} cy={y} r={3.4} fill="#38BDF8" opacity={0.28} />,
            <Circle key={`w${i}`} cx={x} cy={y} r={2.15} fill="#F8FAFC" stroke="#0891B2" strokeWidth={0.55} />,
          ];
        })}
      </Svg>
    </View>
  );
}
