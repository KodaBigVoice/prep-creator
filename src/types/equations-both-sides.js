import { F } from '../core/frac.js';
import { P } from '../core/poly.js';
import { xAns, showF } from './equations.js';

export default {
  id: 'equations-both-sides',
  topic: 'Linear equations', type: 'Unknown on both sides', code: 'EQB',
  levels: ['Core', 'Additional'],
  search: 'solve equation both sides unknown on both sides',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'pos', label: 'positive answer', params: { neg: false } },
    { id: 'neg', label: 'negative answer', params: { neg: true } },
  ],
  generate(r, v, fl) {
    const [a, b, c, d, ans] = r.until(() => {
      const a = r.int(2, 9), c = r.int(1, 8), b = r.int(-9, 15), d = r.int(-9, 25);
      if (a <= c || b === 0 || d === 0 || (v.neg === false && false)) return null;
      const sol = new F(d - b, a - c);
      if (fl.integer && !sol.isInt) return null;
      if (!fl.integer && (sol.isInt || sol.d > 6 || sol.abs().val > 12)) return null;
      if (!v.neg && sol.isNeg) return null;
      if (v.neg && !sol.isNeg) return null;
      if (sol.isZero) return null;
      return [a, b, c, d, sol];
    });
    const lhs = P.v('x', 1, a).add(P.c(b)).tex(), rhs = P.v('x', 1, c).add(P.c(d)).tex();
    const w = a - c === 1 ? `x = ${d - b}` : `${P.v('x', 1, a - c).tex()} = ${d - b};\\ ${xAns(ans)}`;
    return { parts: [{ body: `{{${lhs} = ${rhs}}}`, a: xAns(ans), w: `{{${w}}}`, chk: { k: 'solve', eq: `${lhs} = ${rhs}`, v: 'x' } }] };
  },
};
