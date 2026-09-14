export type ScreenId =
  | 'home'
  | 'sessions'
  | 'learn'
  | 'you'
  | 'pick'
  | 'frame'
  | 'rec'
  | 'result'
  | 'fix';

export type TabId = 'home' | 'sessions' | 'learn' | 'you';

export type SetStatus = 'good' | 'warn' | 'bad';

export type Equipment = 'bb' | 'db' | 'mc' | 'cb' | 'bw';
export type PathKind = 'vert' | 'jcurve' | 'hinge' | 'arc' | 'rail';
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'calves'
  | 'forearms';

export type Exercise = {
  n: string;
  p: PathKind;
  g: MuscleGroup;
  eq: Equipment;
  cue: string;
  ang: string;
  d: string;
  mine?: 1;
};

export type TodaySet = {
  lift: string;
  detail: string;
  drift: number;
  unit?: string;
  status: SetStatus;
  dots: Array<'good' | 'warn' | 'bad'>;
  weight: string;
  sessionId?: number;
};

export type HistorySession = {
  name: string;
  detail: string;
  drift: number;
  status: SetStatus;
};

export type RepData = {
  up: string;
  dn: string;
  x: number;
  y: number;
  drift: string;
  spd: string;
  dep: string;
  flag: boolean;
};
