import { axb, bax, sidesQuestion } from './equations.js';

// negative x terms are written with the number first (10 − 3x); positive ones the usual way (5x + 4)
const side = (k, b) => (k < 0 ? bax(b, k) : axb(k, b));

export default {
  id: 'equations-both-sides-negative',
  topic: 'Equations', type: 'Unknown on both sides (negative x terms)', code: 'EQBN',
  levels: ['Additional'],
  search: 'solve equation both sides negative coefficient of x',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'one', label: 'a negative x term on one side', params: { both: false } },
    { id: 'both', label: 'negative x terms on both sides', params: { both: true } },
  ],
  generate(r, v, fl) {
    return sidesQuestion(r, fl,
      () => {
        let a, c;
        if (v.both) { a = -r.int(1, 8); c = -r.int(1, 8); }
        else if (r.chance()) { a = -r.int(2, 8); c = r.int(1, 8); }
        else { a = r.int(1, 8); c = -r.int(2, 8); }
        const b = r.int(-12, 20), d = r.int(-12, 20);
        return b && d && b !== d ? [a, b, c, d] : null;
      },
      side, side);
  },
};
