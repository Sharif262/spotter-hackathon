import { KinematicEngine } from '../src/cv/engine';
import { liveLandmarks } from '../src/cv/poseModel';
import { PresenceLock, canDriveFsm, emptyPose, frameLooksLocked } from '../src/cv/presence';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

function body() {
  const lms = emptyPose();
  const v = 0.9;
  lms[11] = { x: 0.4, y: 0.35, z: 0, visibility: v };
  lms[12] = { x: 0.6, y: 0.35, z: 0, visibility: v };
  lms[13] = { x: 0.38, y: 0.48, z: 0, visibility: v };
  lms[14] = { x: 0.62, y: 0.48, z: 0, visibility: v };
  lms[15] = { x: 0.37, y: 0.58, z: 0, visibility: v };
  lms[16] = { x: 0.63, y: 0.58, z: 0, visibility: v };
  lms[23] = { x: 0.44, y: 0.62, z: 0, visibility: v };
  lms[24] = { x: 0.56, y: 0.62, z: 0, visibility: v };
  return lms;
}

const empty = emptyPose();
assert(!frameLooksLocked(empty), 'empty room must not lock');
assert(!canDriveFsm(true, false, body()), 'unlocked body must not drive FSM');
assert(!canDriveFsm(true, true, empty), 'locked flag with empty landmarks must not drive FSM');

const lock = new PresenceLock();
for (let i = 0; i < 7; i += 1) assert(!lock.observe(true), `acquire should wait, frame ${i + 1}`);
assert(lock.observe(true), '8th good frame acquires lock');
for (let i = 0; i < 4; i += 1) assert(lock.observe(false), `still locked during miss ${i + 1}`);
assert(!lock.observe(false), '5th miss drops lock');

const still = new KinematicEngine('bicep_curl', 'bb');
const held = body();
for (let t = 0; t < 4000; t += 33) still.process(held, t);
assert(still.reps === 0, `standing still must not count reps, got ${still.reps}`);

const cycling = new KinematicEngine('bicep_curl', 'bb');
for (let t = 0; t < 8000; t += 33) cycling.process(liveLandmarks('bicep_curl', t), t);
assert(cycling.reps > 0, 'synthetic ROM fixture still exercises the FSM for tests');

const gated = new KinematicEngine('bicep_curl', 'bb');
for (let t = 0; t < 8000; t += 33) {
  if (canDriveFsm(true, false, liveLandmarks('bicep_curl', t))) {
    gated.process(liveLandmarks('bicep_curl', t), t);
  }
}
assert(gated.reps === 0, 'empty-room / unlocked must never increment reps');

console.log('pose gate ok', { acquire: 8, drop: 5, stillReps: still.reps, fixtureReps: cycling.reps });
