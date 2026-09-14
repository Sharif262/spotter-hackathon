import type {
  Equipment,
  Exercise,
  HistorySession,
  MuscleGroup,
  PathKind,
  RepData,
  TodaySet,
} from './types';

export const USER_NAME = 'Lifter';

export const LIFTS = [
  { lift: 'Bicep curl', w: '12 kg', d: 'Elbow flexion · pin the upper arm', eq: 'db' as const },
  { lift: 'Shoulder press', w: '16 kg', d: 'Elbow lockout · rigid torso', eq: 'db' as const },
  { lift: 'Overhead tricep extension', w: '10 kg', d: 'Elbows to ceiling · long head', eq: 'db' as const },
  { lift: 'Barbell curl', w: '20 kg', d: 'Unified bar · level the elbows', eq: 'bb' as const },
] as const;

export const TODAY_SETS: TodaySet[] = [
  { lift: 'Bicep curl', detail: '8 reps @ 12 kg', drift: 3, unit: 'faults', status: 'bad', dots: ['good', 'good', 'warn', 'warn', 'bad'], weight: '12 kg' },
  { lift: 'Shoulder press', detail: '6 reps @ 16 kg', drift: 2, unit: 'faults', status: 'warn', dots: ['good', 'good', 'good', 'warn', 'good'], weight: '16 kg' },
  { lift: 'Overhead tricep extension', detail: '10 reps @ 10 kg', drift: 1, unit: 'faults', status: 'warn', dots: ['good', 'warn', 'warn'], weight: '10 kg' },
  { lift: 'Barbell curl', detail: '6 reps @ 20 kg', drift: 0, unit: 'faults', status: 'good', dots: ['good', 'good', 'good'], weight: '20 kg' },
];

export const SESSIONS: HistorySession[] = [
  { name: 'Session 12', detail: 'Wed 4 Sep · live · curl, press, tricep', drift: 3, status: 'bad' },
  { name: 'Session 11', detail: 'Mon 2 Sep · live · curl, press', drift: 2, status: 'warn' },
  { name: 'Session 10', detail: 'Sat 31 Aug · live · barbell curl', drift: 0, status: 'good' },
  { name: 'Session 09', detail: 'Thu 29 Aug · live · press, tricep', drift: 2, status: 'warn' },
  { name: 'Session 08', detail: 'Tue 27 Aug · live · curl', drift: 1, status: 'good' },
];

export const REP_DRIFT: Record<number, number> = { 1: 1.1, 2: 1.6, 3: 6.2, 4: 2.4, 5: 2.0 };

export const REP_PATH: Record<number, string> = {
  1: 'M43 4 C 39 48, 47 96, 42 146 C 41 164, 45 176, 43 160',
  2: 'M43 4 C 39 48, 48 96, 43 146 C 41 164, 46 176, 44 160',
  3: 'M43 4 C 39 46, 54 96, 48 146 C 46 164, 62 178, 56 160',
  4: 'M43 4 C 40 48, 49 96, 44 146 C 42 164, 48 176, 45 160',
  5: 'M43 4 C 39 48, 48 96, 43 146 C 41 164, 47 176, 44 160',
};

export const REPDATA: Record<number, RepData> = {
  1: { up: 'M30 8 C 28 40, 31 66, 30 88', dn: 'M30 88 C 29 108, 34 124, 32 142', x: 33, y: 130, drift: '1.1', spd: '0.51', dep: '+1', flag: false },
  2: { up: 'M30 8 C 28 40, 32 66, 30 88', dn: 'M30 88 C 29 108, 36 124, 33 142', x: 35, y: 130, drift: '1.6', spd: '0.48', dep: '0', flag: false },
  3: { up: 'M30 8 C 27 40, 32 66, 30 88', dn: 'M30 88 C 29 108, 52 124, 46 142', x: 49, y: 130, drift: '6.2', spd: '0.42', dep: '-4', flag: true },
  4: { up: 'M30 8 C 28 40, 32 66, 30 88', dn: 'M30 88 C 29 108, 40 124, 36 142', x: 39, y: 130, drift: '2.4', spd: '0.45', dep: '-3', flag: false },
  5: { up: 'M30 8 C 28 40, 32 66, 30 88', dn: 'M30 88 C 29 108, 37 124, 34 142', x: 36, y: 130, drift: '2.0', spd: '0.40', dep: '-4', flag: false },
};

export const MINI_PATHS: Record<number, string> = {
  1: 'M13 3 C 11 12, 15 22, 13 33',
  2: 'M13 3 C 11 12, 16 22, 14 33',
  3: 'M13 3 C 11 12, 22 22, 19 33',
  4: 'M13 3 C 11 12, 17 22, 15 33',
  5: 'M13 3 C 11 12, 16 22, 14 33',
};

export const EQMETA: Record<Equipment, { label: string; trk: string; cls: 'acc' | 'amb' | '' }> = {
  bb: { label: 'Barbell', trk: '3D bar path', cls: 'acc' },
  db: { label: 'Dumbbell', trk: 'Dual-arm symmetry', cls: 'acc' },
  mc: { label: 'Machine', trk: 'Tempo & ROM', cls: 'amb' },
  cb: { label: 'Cable', trk: 'Tempo & ROM', cls: 'amb' },
  bw: { label: 'Bodyweight', trk: 'Joint angles', cls: '' },
};

export const GNAME: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  legs: 'Legs & glutes',
  calves: 'Calves',
  forearms: 'Forearms',
};

export const GORDER: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'calves', 'forearms',
];

export const PATH_D: Record<PathKind, string> = {
  vert: 'M30 12 L30 50',
  jcurve: 'M30 14 C 24 26, 22 38, 30 50',
  hinge: 'M30 14 C 30 30, 32 40, 30 50',
  arc: 'M18 48 C 18 30, 30 18, 42 22',
  rail: 'M30 14 L30 50',
};

export const SPLIT = [
  {
    t: 'Chest and back',
    items: [
      'Bench press', 'Incline bench press', 'Chest fly', 'Close grip lat pulldown',
      'Chest supported T-bar row', 'Close grip cable row', 'Vertical chest supported row',
    ],
  },
  {
    t: 'Arms and shoulders',
    items: [
      'Preacher curl', 'Incline dumbbell curl', 'Tricep pushdown', 'Overhead tricep extension',
      'Dumbbell shoulder press', 'Cable lateral raise', 'Reverse machine fly',
      'Reverse barbell curl', 'Cable wrist curl',
    ],
  },
  {
    t: 'Legs',
    items: [
      'Back squat', 'Barbell RDL', 'Leg curl', 'Leg extension',
      'Hip adductor', 'Hip abductor', 'Standing calf raise',
    ],
  },
];

export const CATS = [
  { id: 'all', label: 'All' },
  { id: 'split', label: 'My split' },
  { id: 'chest', label: 'Chest' },
  { id: 'back', label: 'Back' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'biceps', label: 'Biceps' },
  { id: 'triceps', label: 'Triceps' },
  { id: 'legs', label: 'Legs' },
  { id: 'calves', label: 'Calves' },
  { id: 'forearms', label: 'Forearms' },
  { id: 'machine', label: 'Machines' },
] as const;

export const LIB: Exercise[] = [
  { n: 'Bench press', p: 'jcurve', g: 'chest', eq: 'bb', cue: 'Bar path is a shallow J from shoulder to lower chest. Too straight and the shoulders take it.', ang: 'Side 90°', d: '2:31', mine: 1 },
  { n: 'Incline bench press', p: 'jcurve', g: 'chest', eq: 'bb', cue: 'Upper chest and front delt. Bar should land higher on the chest than a flat press.', ang: 'Side 90°', d: '2:12', mine: 1 },
  { n: 'Dumbbell bench press', p: 'jcurve', g: 'chest', eq: 'db', cue: 'Flat press for the whole chest. Spotter checks whether one arm presses ahead of the other.', ang: '45° front', d: '2:05' },
  { n: 'Incline dumbbell press', p: 'jcurve', g: 'chest', eq: 'db', cue: 'Upper chest and anterior delt focus. Watch for the elbows flaring past the shoulder line.', ang: '45° front', d: '1:58' },
  { n: 'Decline dumbbell press', p: 'jcurve', g: 'chest', eq: 'db', cue: 'Lower pec emphasis. Short range, so tempo matters more than depth here.', ang: 'Side 90°', d: '1:42' },
  { n: 'Dumbbell floor press', p: 'jcurve', g: 'chest', eq: 'db', cue: 'Floor stops the range early to spare the shoulders. Pause at the bottom, no bouncing.', ang: 'Side 90°', d: '1:35' },
  { n: 'Chest fly', p: 'arc', g: 'chest', eq: 'db', cue: 'Isolation with a wide stretch. Elbows stay softly bent the whole arc, never locked.', ang: '45° front', d: '1:48', mine: 1 },
  { n: 'Dumbbell squeeze press', p: 'jcurve', g: 'chest', eq: 'db', cue: 'Press the bells together the whole set to light up the inner chest.', ang: '45° front', d: '1:20' },
  { n: 'Close grip lat pulldown', p: 'vert', g: 'back', eq: 'cb', cue: 'Pull to the collarbone, not the chin. Spotter flags torso sway past 10°.', ang: 'Rear 45°', d: '2:30', mine: 1 },
  { n: 'Chest supported T-bar row', p: 'vert', g: 'back', eq: 'mc', cue: 'Flare elbows near 45° and squeeze the shoulder blades to bias mid traps. Full stretch at the bottom.', ang: 'Rear 45°', d: '2:24', mine: 1 },
  { n: 'Close grip cable row', p: 'vert', g: 'back', eq: 'cb', cue: 'Torso stays still. If your back is rocking, the weight is doing the deciding.', ang: 'Side 90°', d: '2:02', mine: 1 },
  { n: 'Vertical chest supported row', p: 'vert', g: 'back', eq: 'mc', cue: 'Chest pad kills momentum, so range of motion is the whole story.', ang: 'Rear 45°', d: '1:52', mine: 1 },
  { n: 'One-arm dumbbell row', p: 'vert', g: 'back', eq: 'db', cue: 'Unilateral pull for lats and mid back. Spotter compares your two sides rep for rep.', ang: 'Side 90°', d: '2:10' },
  { n: 'Bent-over dumbbell row', p: 'vert', g: 'back', eq: 'db', cue: 'Compound pull. Hips hinge and hold, the torso angle should not rise as you fatigue.', ang: 'Side 90°', d: '2:00' },
  { n: 'Dumbbell pullover', p: 'arc', g: 'back', eq: 'db', cue: 'Expands the ribcage while hitting lats and chest. Keep the hips down.', ang: 'Side 90°', d: '1:44' },
  { n: 'Renegade row', p: 'vert', g: 'back', eq: 'db', cue: 'Plank row. Spotter watches hip rotation, which is the first thing to break.', ang: '45° front', d: '1:38' },
  { n: 'Dumbbell shrug', p: 'vert', g: 'back', eq: 'db', cue: 'Straight up, not rolling. Traps only, short clean range.', ang: 'Side 90°', d: '1:15' },
  { n: 'Dumbbell seal row', p: 'vert', g: 'back', eq: 'db', cue: 'Bench supported so there is zero momentum to hide behind.', ang: 'Side 90°', d: '1:40' },
  { n: 'Dumbbell shoulder press', p: 'vert', g: 'shoulders', eq: 'db', cue: 'Compound press for overall delt mass. Bells should meet over the crown, not in front.', ang: '45° front', d: '2:08', mine: 1 },
  { n: 'Cable lateral raise', p: 'arc', g: 'shoulders', eq: 'cb', cue: 'Constant tension through the whole arc. Lead with the elbow, not the hand.', ang: 'Front', d: '1:46', mine: 1 },
  { n: 'Reverse machine fly', p: 'arc', g: 'shoulders', eq: 'mc', cue: 'Rear delts and upper back posture. Squeeze and hold, do not snap it back.', ang: 'Rear 45°', d: '1:34', mine: 1 },
  { n: 'Dumbbell lateral raise', p: 'arc', g: 'shoulders', eq: 'db', cue: 'Momentum versus control, and where the side delt actually stops working.', ang: 'Front', d: '1:40' },
  { n: 'Dumbbell front raise', p: 'arc', g: 'shoulders', eq: 'db', cue: 'Anterior delt. Stop at shoulder height, higher just recruits traps.', ang: 'Side 90°', d: '1:22' },
  { n: 'Rear delt fly', p: 'arc', g: 'shoulders', eq: 'db', cue: 'Hinge over and lead with the pinkies. Spotter flags if one side swings higher.', ang: 'Rear 45°', d: '1:30' },
  { n: 'Arnold press', p: 'vert', g: 'shoulders', eq: 'db', cue: 'Rotating press that hits multiple delt heads. The rotation must finish before the press starts.', ang: '45° front', d: '1:55' },
  { n: 'Preacher curl', p: 'arc', g: 'biceps', eq: 'bb', cue: 'Pad removes the swing entirely. Control the bottom third, that is where the tear risk lives.', ang: '45° front', d: '1:50', mine: 1 },
  { n: 'Incline dumbbell curl', p: 'arc', g: 'biceps', eq: 'db', cue: 'Stretches the long head. Let the arms hang fully behind the torso between reps.', ang: '45° front', d: '1:44', mine: 1 },
  { n: 'Dumbbell bicep curl', p: 'arc', g: 'biceps', eq: 'db', cue: 'Elbow drift and momentum. Spotter flags when one arm lags the other by 15%.', ang: '45° front', d: '2:10' },
  { n: 'Hammer curl', p: 'arc', g: 'biceps', eq: 'db', cue: 'Neutral grip for brachialis and forearm. Wrists stay stacked, no curling in.', ang: '45° front', d: '1:32' },
  { n: 'Concentration curl', p: 'arc', g: 'biceps', eq: 'db', cue: 'Seated isolation that eliminates body swing completely.', ang: '45° front', d: '1:18' },
  { n: 'Zottman curl', p: 'arc', g: 'biceps', eq: 'db', cue: 'Supinated up, pronated down. The lowering half is the point, so slow it down.', ang: '45° front', d: '1:36' },
  { n: 'Tricep pushdown', p: 'vert', g: 'triceps', eq: 'cb', cue: 'Elbows pinned at the ribs. If they travel forward, the lats are helping.', ang: 'Side 90°', d: '1:28', mine: 1 },
  { n: 'Overhead tricep extension', p: 'arc', g: 'triceps', eq: 'cb', cue: 'Isolates the long head. Upper arms stay vertical the whole set.', ang: 'Side 90°', d: '1:40', mine: 1 },
  { n: 'Dumbbell skullcrusher', p: 'arc', g: 'triceps', eq: 'db', cue: 'Lying extension for mass. Lower behind the forehead, not to it.', ang: 'Side 90°', d: '1:34' },
  { n: 'Tricep kickback', p: 'arc', g: 'triceps', eq: 'db', cue: 'Contracted-position isolation. Full lockout is the whole rep.', ang: 'Side 90°', d: '1:12' },
  { n: 'Close-grip floor press', p: 'jcurve', g: 'triceps', eq: 'db', cue: 'Compound triceps and chest press with a short, joint-friendly range.', ang: 'Side 90°', d: '1:26' },
  { n: 'Back squat', p: 'vert', g: 'legs', eq: 'bb', cue: 'Bar drifts forward out of the hole. The cue that pulls it back over midfoot.', ang: 'Side 90°', d: '2:14', mine: 1 },
  { n: 'Barbell RDL', p: 'hinge', g: 'legs', eq: 'bb', cue: 'Hinge, not a squat. Bar stays scraping the thighs the whole descent.', ang: 'Side 90°', d: '2:20', mine: 1 },
  { n: 'Leg curl', p: 'rail', g: 'legs', eq: 'mc', cue: 'Fixed path, so Spotter grades tempo and whether you get full contraction.', ang: 'Side 90°', d: '1:24', mine: 1 },
  { n: 'Leg extension', p: 'rail', g: 'legs', eq: 'mc', cue: 'Pause at lockout. Range of motion and stall points are what get scored.', ang: 'Side 90°', d: '1:20', mine: 1 },
  { n: 'Hip adductor', p: 'arc', g: 'legs', eq: 'mc', cue: 'Squeeze in, control the way out. Have fun walking tomorrow.', ang: 'Front', d: '1:10', mine: 1 },
  { n: 'Hip abductor', p: 'arc', g: 'legs', eq: 'mc', cue: 'Push out and hold the end range for a beat before returning.', ang: 'Front', d: '1:08', mine: 1 },
  { n: 'Hack squat (machine)', p: 'rail', g: 'legs', eq: 'mc', cue: 'Fixed rail means path is set. Spotter watches depth and joint shear instead.', ang: 'Side 90°', d: '2:45' },
  { n: 'Leg press (machine)', p: 'rail', g: 'legs', eq: 'mc', cue: 'Lower back rounding at the bottom, and what counts as full extension.', ang: 'Side 90°', d: '1:55' },
  { n: 'Goblet squat', p: 'vert', g: 'legs', eq: 'db', cue: 'Quad-dominant deep squat. Elbows track inside the knees at the bottom.', ang: 'Side 90°', d: '1:46' },
  { n: 'Dumbbell RDL', p: 'hinge', g: 'legs', eq: 'db', cue: 'Hinge for hamstrings and glutes. Stop when the stretch stops, not when the floor arrives.', ang: 'Side 90°', d: '1:52' },
  { n: 'Reverse lunge', p: 'vert', g: 'legs', eq: 'db', cue: 'Unilateral builder. Spotter compares left and right depth rep for rep.', ang: 'Side 90°', d: '1:44' },
  { n: 'Bulgarian split squat', p: 'vert', g: 'legs', eq: 'db', cue: 'Rear foot elevated. Front shin angle decides whether it is quads or glutes.', ang: 'Side 90°', d: '2:06' },
  { n: 'Dumbbell step-up', p: 'vert', g: 'legs', eq: 'db', cue: 'Drive through the top foot. No pushing off the trailing leg.', ang: 'Side 90°', d: '1:30' },
  { n: 'Sumo squat', p: 'vert', g: 'legs', eq: 'db', cue: 'Wide stance for inner thigh and glute. Knees track over the toes.', ang: 'Front', d: '1:36' },
  { n: 'Dumbbell hip thrust', p: 'hinge', g: 'legs', eq: 'db', cue: 'Hip extension for glutes. Ribs stay down, do not arch to finish the rep.', ang: 'Side 90°', d: '1:40' },
  { n: 'Standing calf raise', p: 'rail', g: 'calves', eq: 'mc', cue: 'Full stretch at the bottom, hard pause at the top. Range is everything.', ang: 'Side 90°', d: '1:14', mine: 1 },
  { n: 'Standing dumbbell calf raise', p: 'vert', g: 'calves', eq: 'db', cue: 'Single or double leg. Spotter checks if one heel rises less than the other.', ang: 'Side 90°', d: '1:06' },
  { n: 'Seated dumbbell calf raise', p: 'vert', g: 'calves', eq: 'db', cue: 'Bells on the knees, seated on a bench edge. Soleus focus.', ang: 'Side 90°', d: '1:04' },
  { n: 'Reverse barbell curl', p: 'arc', g: 'forearms', eq: 'bb', cue: 'Pronated grip. Wrists stay locked, the movement is all elbow.', ang: '45° front', d: '1:16', mine: 1 },
  { n: 'Cable wrist curl', p: 'arc', g: 'forearms', eq: 'cb', cue: 'Small range, slow tempo. Let the bar roll to the fingertips at the bottom.', ang: 'Side 90°', d: '1:02', mine: 1 },
];
