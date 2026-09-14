export type FunctioningItem = { area: string; detail: string };
export type WentWrongItem = { where: string; detail: string; reps: string };
export type ImproveItem = { area: string; detail: string; cue: string };

export type GeminiFeedback = {
  functioning: FunctioningItem[];
  wentWrong: WentWrongItem[];
  improvements: ImproveItem[];
  diagnosis: string;
  why: string;
  cue: string;
  muscles: { label: string; hot?: boolean }[];
};

export type CoachLog = {
  session: {
    lift: string;
    exercise: string;
    equipment: string;
    reps: number;
    durationMs: number;
  };
  spec: {
    primaryJoint: string;
    startThreshold: number;
    peakThreshold: number;
  };
  reps: { n: number; leftAngle: number; rightAngle: number }[];
  faults: {
    code: string;
    cue: string;
    severity: string;
    joint: string;
    count: number;
    reps: number[];
    avgAngle: number;
    threshold: number;
  }[];
  samples: { t: number; fsm: string; elbowDeg: number; faultCode: string; rep: number }[];
};
