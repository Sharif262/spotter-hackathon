import { useCallback, useEffect, useRef, useState } from 'react';
import { KinematicEngine, type TrackerSnapshot } from '../cv/engine';
import { liftToExercise, type EquipmentKind, type ExerciseId } from '../cv/exercises';
import { liveLandmarks } from '../cv/poseModel';
import * as store from '../storage/workoutStore';

export type LiveHud = {
  reps: number;
  elbow: number;
  fsm: string;
  cue: string | null;
  warn: boolean;
  secs: number;
  landmarks: { x: number; y: number }[];
};

export function useLiveTracker(lift: string, equipment: EquipmentKind, active: boolean) {
  const exercise: ExerciseId = liftToExercise(lift);
  const engineRef = useRef<KinematicEngine | null>(null);
  const sessionIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const writesRef = useRef<Promise<unknown>[]>([]);
  const t0 = useRef(0);
  const sampleN = useRef(0);

  const [hud, setHud] = useState<LiveHud>({
    reps: 0, elbow: 0, fsm: 'IDLE', cue: null, warn: false, secs: 0, landmarks: [],
  });

  const persist = useCallback((snap: TrackerSnapshot) => {
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
    if (!active) return;
    engineRef.current = new KinematicEngine(exercise, equipment);
    t0.current = Date.now();
    sampleN.current = 0;
    sessionIdRef.current = null;
    writesRef.current = [];

    const tick = () => {
      const elapsed = Date.now() - t0.current;
      const lms = liveLandmarks(exercise, elapsed);
      const snap = engineRef.current!.process(lms, Date.now());
      setHud({
        reps: snap.reps,
        elbow: Math.round((snap.leftAngle + snap.rightAngle) / 2),
        fsm: snap.leftState,
        cue: snap.liveCue,
        warn: !!snap.liveFault,
        secs: Math.floor(elapsed / 1000),
        landmarks: lms.filter((p) => (p.visibility ?? 0) > 0).map((p) => ({ x: p.x, y: p.y })),
      });
      persist(snap);
    };

    intervalRef.current = setInterval(tick, 33);
    sessionIdRef.current = store.beginSession(lift, exercise, equipment);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [active, equipment, exercise, lift, persist]);

  const stop = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    const id = sessionIdRef.current;
    const reps = engineRef.current?.reps ?? 0;
    await Promise.all(writesRef.current);
    if (id != null) await store.finishSession(id, reps).catch(() => {});
    return id;
  }, []);

  return { hud, stop };
}
