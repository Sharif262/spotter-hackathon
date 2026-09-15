import { KinematicEngine } from '../src/cv/engine';
import { EasyRepCounter } from '../src/cv/fsm';
import { liveLandmarks } from '../src/cv/poseModel';
import { PresenceLock, canDriveFsm, emptyPose, frameLooksLocked } from '../src/cv/presence';
import { coverToView, imageToView, rotateToView } from '../src/cv/viewMap';

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

const half = new EasyRepCounter(0.1);
let halfReps = 0;
for (let t = 0; t < 6000; t += 40) {
  const v = 0.5 + 0.22 * Math.sin((t / 2000) * 2 * Math.PI);
  if (half.step(v, t)) halfReps += 1;
}
assert(halfReps >= 2 && halfReps <= 3, `one cycle must be one rep, got ${halfReps}`);

const noVis = body().map((p) => ({ x: p.x, y: p.y, z: p.z }));
assert(frameLooksLocked(noVis), 'in-frame joints without MediaPipe visibility must still lock');
assert(!canDriveFsm(true, false, body()), 'unlocked body must not drive FSM');
assert(!canDriveFsm(true, true, empty), 'locked flag with empty landmarks must not drive FSM');

const lock = new PresenceLock();
for (let i = 0; i < 4; i += 1) assert(!lock.observe(true), `acquire should wait, frame ${i + 1}`);
assert(lock.observe(true), '5th good frame acquires lock');
for (let i = 0; i < 4; i += 1) assert(lock.observe(false), `still locked during miss ${i + 1}`);
assert(!lock.observe(false), '5th miss drops lock');

const still = new KinematicEngine('bicep_curl', 'bb');
const held = body();
for (let t = 0; t < 4000; t += 33) still.process(held, t);
assert(still.reps === 0, `standing still must not count reps, got ${still.reps}`);

const cycling = new KinematicEngine('bicep_curl', 'bb');
for (let t = 0; t < 8000; t += 33) cycling.process(liveLandmarks('bicep_curl', t), t);
assert(cycling.reps > 0, 'synthetic ROM fixture still exercises the FSM for tests');
assert(cycling.reps <= 4, `curl must not double-count halves, got ${cycling.reps}`);

const press = new KinematicEngine('shoulder_press', 'db');
for (let t = 0; t < 8000; t += 33) press.process(liveLandmarks('shoulder_press', t), t);
assert(press.reps > 0, `press easy ROM must count, got ${press.reps}`);
assert(press.reps <= 4, `press must not double-count halves, got ${press.reps}`);

const tricep = new KinematicEngine('tricep_extension', 'db');
for (let t = 0; t < 8000; t += 33) tricep.process(liveLandmarks('tricep_extension', t), t);
assert(tricep.reps > 0, `tricep easy ROM must count, got ${tricep.reps}`);
assert(tricep.reps <= 4, `tricep must not double-count halves, got ${tricep.reps}`);

const shallow = new KinematicEngine('bicep_curl', 'db');
for (let t = 0; t < 5000; t += 33) {
  const lms = body();
  const u = (Math.sin(t / 260) + 1) / 2;
  const y = 0.58 - u * 0.14;
  lms[15] = { x: 0.37, y, z: 0, visibility: 0.9 };
  lms[16] = { x: 0.63, y, z: 0, visibility: 0.9 };
  shallow.process(lms, t);
}
assert(shallow.reps > 0, `partial curls must still count, got ${shallow.reps}`);

const formful = new KinematicEngine('bicep_curl', 'db');
let faults = 0;
for (let t = 0; t < 12000; t += 33) {
  const snap = formful.process(liveLandmarks('bicep_curl', t), t);
  faults += snap.newFaults.length;
}
assert(formful.reps > 0, 'faulty reps still count');
assert(faults > 0, 'positioning errors must still emit feedback');

const gated = new KinematicEngine('bicep_curl', 'bb');
for (let t = 0; t < 8000; t += 33) {
  if (canDriveFsm(true, false, liveLandmarks('bicep_curl', t))) {
    gated.process(liveLandmarks('bicep_curl', t), t);
  }
}
assert(gated.reps === 0, 'empty-room / unlocked must never increment reps');

const worldCurl = new KinematicEngine('bicep_curl', 'db');
for (let t = 0; t < 8000; t += 33) {
  const img = liveLandmarks('bicep_curl', t);
  worldCurl.process(img, t);
}
assert(worldCurl.reps > 0, 'world-landmark angles must still count curl reps');

const land = rotateToView({ x: 0.5, y: 0.5 }, { width: 1920, height: 1080 }, { width: 390, height: 844 });
assert(Math.abs(land.point.x - 0.5) < 1e-9 && Math.abs(land.point.y - 0.5) < 1e-9, 'frame center stays center after rotate');
assert(land.image.width === 1080 && land.image.height === 1920, 'landscape buffer swaps into portrait dims');

const port = imageToView({ x: 0.5, y: 0.5 }, { width: 1080, height: 1920 }, { width: 390, height: 844 });
assert(Math.abs(port.x - 0.5) < 0.02 && Math.abs(port.y - 0.5) < 0.02, 'portrait cover keeps a centered joint centered');

const covered = coverToView(960, 540, { width: 1920, height: 1080 }, { width: 390, height: 844 });
assert(Math.abs(covered.x / 390 - 0.5) < 0.03, 'cover crop keeps landscape center on the preview midline');

console.log('pose gate ok', {
  acquire: 5,
  drop: 5,
  stillReps: still.reps,
  curlReps: cycling.reps,
  pressReps: press.reps,
  tricepReps: tricep.reps,
  shallowReps: shallow.reps,
  formFaults: faults,
});
