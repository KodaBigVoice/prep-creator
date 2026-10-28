// Starter presets. They ship with the app and cannot be overwritten (duplicate one to change it).
// A slot is { mode:'fixed', pick:'typeId:variantId' } or { mode:'pool', candidates:[...], label }.
// 'typeId:*' in a pool means "any variant of that type".
const F = (pick, extra = {}) => ({ mode: 'fixed', pick, ...extra });
const pool = (label, picks, extra = {}) => ({ mode: 'pool', label, candidates: picks.map(p => ({ pick: p, on: true })), ...extra });

const POOL_A = ['substitution:*', 'pythagoras:*', 'hcf-lcm:*', 'prime-factorisation:*', 'ratio-share:*', 'ratio-difference:*', 'proportion-direct:*', 'proportion-inverse:*', 'percentage-of-amount:*'];
const POOL_B = ['circles:*', 'area-shapes:*', 'volume-prisms:*', 'speed-distance-time:*', 'units-metric:*', 'standard-form:*', 'simultaneous:*', 'rounding:*'];
const POOL_C = ['percentage-change:*', 'percentage-change-find:*', 'reverse-percentages:*', 'compound-interest:*', 'averages:*', 'mean-unknown:*', 'probability:*'];
const PS = ['problem-solving:*'];

export const STARTER_PRESETS = [
  {
    id: 'starter-y7-additional', starter: true, set: 'Y7 Additional', name: 'Y7 Additional (starter)', minutes: 30,
    questions: [
      [F('bidmas-standard:bp'), F('bidmas-negatives:std')],
      [F('fractions-subtract:overlap'), F('fractions-divide:cancel')],
      [F('indices-multiply:two'), F('indices-divide:frac'), pool('Expand or factorise', ['expand-two-subtract:lin', 'factorise-number-letter:std', 'factorise-number:two'])],
      [F('equations-both-sides:pos'), F('equations-brackets:both'), F('equations-fraction:top')],
      [pool('Question 5 pool', POOL_A)],
      [pool('Question 6 pool', POOL_A)],
      [pool('Question 7 pool', POOL_B)],
      [pool('Question 8 pool', POOL_C)],
      [pool('Problem solving', PS, { marks: [4], lines: [8] })],
      [pool('Problem solving', PS, { marks: [4], lines: [8] })],
    ],
  },
];
