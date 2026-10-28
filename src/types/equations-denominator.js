import { F } from '../core/frac.js';
import { axb, cx, xAns, okSol } from './equations.js';

const fr = (n, d) => `\\dfrac{${n}}{${d}}`;

export default {
  id: 'equations-denominator',
  topic: 'Equations', type: 'Unknown in the denominator', code: 'EQD',
  levels: ['Additional'],
  search: 'solve equation x in the denominator reciprocal fraction unknown bottom',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'num', label: 'a/x = b', params: { kind: 'num' } },
    { id: 'add', label: 'a/x + b = c', params: { kind: 'add' } },
    { id: 'plus', label: 'a/(x + b) = c', params: { kind: 'plus' } },
  ],
  generate(r, v, fl) {
    const done = (eq, w, sol) => ({ parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq, v: 'x' } }] });
    if (v.kind === 'num') {
      const [a, b, sol] = r.until(() => {
        const a = r.int(2, 60), b = r.int(2, 12), s = new F(a, b);
        return okSol(s, fl, 30) ? [a, b, s] : null;
      });
      return done(`${fr(a, 'x')} = ${b}`, `${a} = ${b}x;\\ ${xAns(sol)}`, sol);
    }
    if (v.kind === 'add') {
      const [a, b, c, sol] = r.until(() => {
        const a = r.int(2, 36), b = r.int(1, 9) * r.sign(), c = r.int(-4, 12);
        if (!c || Math.abs(c - b) < 2) return null;
        const s = new F(a, c - b);
        return okSol(s, fl, 30) ? [a, b, c, s] : null;
      });
      return done(`${fr(a, 'x')} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${c}`, `${fr(a, 'x')} = ${c - b};\\ ${a} = ${cx(c - b)}x;\\ ${xAns(sol)}`, sol);
    }
    const [a, b, c, sol] = r.until(() => {
      const a = r.int(2, 48), b = r.int(1, 9) * r.sign(), c = r.int(2, 9);
      const s = new F(a, c).sub(b);
      return okSol(s, fl, 30) ? [a, b, c, s] : null;
    });
    const den = axb(1, b);
    return done(`${fr(a, den)} = ${c}`, `${a} = ${c}(${den});\\ ${a} = ${axb(c, c * b)};\\ ${xAns(sol)}`, sol);
  },
};
