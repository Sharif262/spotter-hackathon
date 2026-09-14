export type ScreenId =
  | 'home'
  | 'sessions'
  | 'you'
  | 'pick'
  | 'frame'
  | 'rec'
  | 'result'
  | 'fix';

export type TabId = 'home' | 'sessions' | 'you';

export type SetStatus = 'good' | 'warn' | 'bad';

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
