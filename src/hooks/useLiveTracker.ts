import { useCallback, useEffect, useRef, useState } from 'react';
import { KinematicEngine } from '../cv/engine';
import { liftToExercise, type EquipmentKind, type ExerciseId } from '../cv/exercises';
import type { PoseFeed } from '../cv/poseFeed';
import * as store from '../storage/workoutStore';

export type LiveHud = {
  reps: number;
  elbow: number;
  fsm: string;
  cue: string | null;
  warn: boolean;
  secs: number;
  landmarks: { x: number; y: number }[];
  locked: boolean;
  native: boolean;
};

const WAITING: LiveHud = {
  reps: 0,
  elbow: 0,
  fsm: 'WAITING',
  cue: null,
  warn: false,
  secs: 0,
  landmarks: [],
  locked: false,
  native: false,
};

export function useLiveTracker(
  lift: string,
  equipment: EquipmentKind,
  active: boolean,
  pose: PoseFeed,
) {
  const exercise: ExerciseId = liftToExercise(lift);
  const engineRef = useRef<KinematicEngine | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const writesRef = useRef<Promise<unknown>[]>([]);
  const sampleN = useRef(0);
  const accMs = useRef(0);
  const lastTick = useRef<number | null>(null);
  const poseRef = useRef(pose);
  poseRef.current = pose;

  const [hud, setHud] = useState<LiveHud>(WAITING);

  const persist = useCallback((snap: ReturnType<KinematicEngine['process']>) => {
    const id = sessionIdRef.current;
    if (id == null) return;
    sampleN.current += 1;
    const track = (p: Promise<unknown>) => {
      writesRef.current.push(p.catch(() => {}));
    };
    if (sampleN.current % 3 === 0) track(store.logSample(id, snap.sample));
    for (const f of snap.newFaults) track(store.logFault(id, snap.t, snap.leftState, snap.faultRep, f));
    for (const n of snap.committedNs) {
      track(store.logRep(id, snap.t, n, snap.leftAngle, snap.rightAngle));
    }
  }, []);

  useEffect(() => {
    if (!active) {
      lastTick.current = null;
      setHud((h) => ({ ...WAITING, native: poseRef.current.native, locked: poseRef.current.locked, reps: h.reps }));
      return;
    }
    engineRef.current = new KinematicEngine(exercise, equipment);
    sampleN.current = 0;
    accMs.current = 0;
    lastTick.current = null;
    writesRef.current = [];
    sessionIdRef.current = store.beginSession(lift, exercise, equipment);
    setHud({ ...WAITING, native: poseRef.current.native, locked: poseRef.current.locked });
    return () => {
      lastTick.current = null;
    };
  }, [active, equipment, exercise, lift]);

  useEffect(() => {
    if (!active || !engineRef.current) return;
    const now = Date.now();
    const body = pose.landmarks.length >= 25 || pose.overlay.length >= 25;
    if (!body) {
      lastTick.current = null;
      setHud((h) => ({
        ...h,
        fsm: 'WAITING',
        cue: null,
        warn: false,
        native: pose.native,
        locked: pose.locked,
      }));
      return;
    }
    if (lastTick.current != null) accMs.current += now - lastTick.current;
    lastTick.current = now;
    const snap = engineRef.current.process(pose.landmarks, now, pose.overlay);
    persist(snap);
    setHud({
      reps: snap.reps,
      elbow: Math.round((snap.leftAngle + snap.rightAngle) / 2),
      fsm: snap.leftState,
      cue: snap.liveCue,
      warn: !!snap.liveFault,
      secs: Math.floor(accMs.current / 1000),
      landmarks: pose.overlay.length ? pose.overlay : pose.landmarks.map((p) => ({ x: p.x, y: p.y })),
      locked: pose.locked,
      native: pose.native,
    });
  }, [active, persist, pose]);

  const stop = useCallback(async () => {
    lastTick.current = null;
    const id = sessionIdRef.current;
    const reps = engineRef.current?.reps ?? 0;
    await Promise.all(writesRef.current);
    if (id != null) await store.finishSession(id, reps).catch(() => {});
    return id;
  }, []);

  return { hud, stop };
}
