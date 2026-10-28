import { axb, sidesQuestion } from './equations.js';

export default {
  id: 'equations-both-sides',
  topic: 'Equations', type: 'Unknown on both sides (larger x term on the left)', code: 'EQB',
  levels: ['Core', 'Additional'],
  search: 'solve equation both sides unknown on both sides',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'pos', label: 'positive answer', params: { neg: false } },
    { id: 'neg', label: 'negative answer', params: { neg: true } },
  ],
  generate(r, v, fl) {
    return sidesQuestion(r, fl,
      () => { const a = r.int(3, 9), c = r.int(1, a - 1), b = r.int(-9, 15), d = r.int(-9, 25); return b && d ? [a, b, c, d] : null; },
      axb, axb, (s) => (v.neg ? s.isNeg : !s.isNeg));
  },
};
