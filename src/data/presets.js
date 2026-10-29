// Starter presets. They ship with the app and cannot be overwritten (duplicate one to change it).
// A slot is { mode:'fixed', pick:'typeId:variantId' } or { mode:'pool', candidates:[...], label }.
// 'typeId:*' in a pool means "any variant of that type".
const F = (pick, extra = {}) => ({ mode: 'fixed', pick, ...extra });
const pool = (label, picks, extra = {}) => ({ mode: 'pool', label, candidates: picks.map(p => ({ pick: p, on: true })), ...extra });

// A recipe slot: some topics at a level. Each new prep draws a different question that fits.
const Q = (topics, level, extra = {}) => ({ mode: 'query', topics: [].concat(topics), level, ...extra });
const MIX_A = ['Substitution', 'Pythagoras', 'HCF and LCM', 'Prime factorisation', 'Ratio and proportion', 'Percentages'];
const MIX_B = ['Circles', 'Area', 'Volume of prisms', 'Speed, distance and time', 'Units and conversions', 'Standard form', 'Place value and rounding'];
const MIX_C = ['Percentages', 'Averages', 'Probability'];

export const STARTER_PRESETS = [
  {
    id: 'starter-y7-additional', starter: true, set: 'Y7 Additional', name: 'Y7 Additional (starter recipe)', minutes: 30,
    questions: [
      [Q('Order of operations (BIDMAS)', 'Core'), Q('Order of operations (BIDMAS)', 'Additional')],
      [Q('Fractions', 'Core'), Q('Fractions', 'Additional')],
      [Q('Indices', 'Core'), Q('Indices', 'Additional'), Q(['Expanding brackets', 'Factorising'], 'Additional')],
      [Q('Equations', 'Core'), Q('Equations', 'Additional'), Q('Equations', 'Additional')],
      [Q(MIX_A, 'Additional')],
      [Q(MIX_A, 'Additional')],
      [Q(MIX_B, 'Additional')],
      [Q(MIX_C, 'Additional')],
      [Q('Problem solving', 'Additional', { marks: [4], lines: [8] })],
      [Q('Problem solving', 'Additional', { marks: [4], lines: [8] })],
    ],
  },
];
