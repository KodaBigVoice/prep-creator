import { F, gcd } from '../core/frac.js';
import { axb, xAns, okSol } from './equations.js';

export default {
  id: 'equations-fraction',
  topic: 'Equations', type: 'One algebraic fraction', code: 'EQF',
  levels: ['Core', 'Additional'],
  search: 'fractional equation algebraic fraction solve single fraction',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'split', label: 'ax/c − b = d', params: { kind: 'split' } },
    { id: 'top', label: '(ax + b)/c = d', params: { kind: 'top' } },
    { id: 'eq', label: '(ax + b)/c = x + d', params: { kind: 'eq' } },
  ],
  generate(r, v, fl) {
    const done = (eq, w, sol) => ({ parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq, v: 'x' } }] });
    if (v.kind === 'top') {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 6), c = r.int(2, 7), b = r.int(-9, 9), d = r.int(-6, 12);
        if (!b || !d) return null;
        const s = new F(c * d - b, a);
        return okSol(s, fl) ? [a, b, c, d, s] : null;
      });
      const num = axb(a, b);
      return done(`\\dfrac{${num}}{${c}} = ${d}`, `${num} = ${c * d};\\ ${a}x = ${c * d - b};\\ ${xAns(sol)}`, sol);
    }
    if (v.kind === 'split') {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 5), c = r.int(2, 7), b = r.int(1, 12), d = r.int(-5, 12);
        if (!d || gcd(a, c) > 1) return null;
        const s = new F(c * (d + b), a);
        return okSol(s, fl) ? [a, b, c, d, s] : null;
      });
      return done(`\\dfrac{${a}x}{${c}} - ${b} = ${d}`, `\\dfrac{${a}x}{${c}} = ${d + b};\\ ${a}x = ${c * (d + b)};\\ ${xAns(sol)}`, sol);
    }
    const [a, b, c, d, sol] = r.until(() => {
      const a = r.int(3, 9), c = r.int(2, 5), b = r.int(-6, 9), d = r.int(-5, 6);
      if (a === c || !d) return null;
      const s = new F(c * d - b, a - c);
      return okSol(s, fl) ? [a, b, c, d, s] : null;
    });
    const num = axb(a, b), rhs = axb(1, d);
    return done(`\\dfrac{${num}}{${c}} = ${rhs}`, `${num} = ${c}(${rhs});\\ ${xAns(sol)}`, sol);
  },
};
