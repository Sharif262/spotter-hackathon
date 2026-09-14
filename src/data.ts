export const USER_NAME = 'Lifter';

export const LIFTS = [
  { lift: 'Bicep curl', w: '12 kg', d: 'Elbow flexion · pin the upper arm', eq: 'db' as const },
  { lift: 'Shoulder press', w: '16 kg', d: 'Elbow lockout · rigid torso', eq: 'db' as const },
  { lift: 'Overhead tricep extension', w: '10 kg', d: 'Elbows to ceiling · long head', eq: 'db' as const },
  { lift: 'Barbell curl', w: '20 kg', d: 'Unified bar · level the elbows', eq: 'bb' as const },
] as const;
