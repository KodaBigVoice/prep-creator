import { F } from '../core/frac.js';
import { P } from '../core/poly.js';
import { xAns } from './equations.js';

export default {
  id: 'equations-brackets',
  topic: 'Linear equations', type: 'With brackets', code: 'EQK',
  levels: ['Core', 'Additional'],
  search: 'solve equation brackets expand',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'one', label: 'one bracket: a(bx + c) = d', params: { both: false } },
    { id: 'both', label: 'brackets on both sides', params: { both: true } },
  ],
  generate(r, v, fl) {
    if (!v.both) {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 7), b = r.int(1, 5), c = r.int(-9, 9);
        if (c === 0) return null;
        const x0 = r.int(-6, 10); if (x0 === 0) return null;
        const d = a * (b * x0 + c);
        const sol = new F(d / a - c, b);
        return d !== 0 ? [a, b, c, d, sol] : null;
      });
      const inner = P.v('x', 1, b).add(P.c(c)).tex();
      const w = `${P.v('x', 1, a * b).add(P.c(a * c)).tex()} = ${d};\\ ${a * b}x = ${d - a * c};\\ ${xAns(sol)}`;
      return { parts: [{ body: `{{${a}(${inner}) = ${d}}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq: `${a}(${inner}) = ${d}`, v: 'x' } }] };
    }
    const [a, b, c, d, sol] = r.until(() => {
      const a = r.int(2, 7), c = r.int(2, 7), b = r.int(-6, 8), d = r.int(-6, 8);
      if (a === c || b === 0 || d === 0 || b === d) return null;
      const s = new F(c * d - a * b, a - c);
      if (s.isZero || (fl.integer && !s.isInt)) return null;
      if (!fl.integer && (s.isInt || s.d > 5)) return null;
      return [a, b, c, d, s];
    });
    const l = P.v('x').add(P.c(b)).tex(), rr = P.v('x').add(P.c(d)).tex();
    const w = `${P.v('x', 1, a).add(P.c(a * b)).tex()} = ${P.v('x', 1, c).add(P.c(c * d)).tex()};\\ ${xAns(sol)}`;
    return { parts: [{ body: `{{${a}(${l}) = ${c}(${rr})}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq: `${a}(${l}) = ${c}(${rr})`, v: 'x' } }] };
  },
};
