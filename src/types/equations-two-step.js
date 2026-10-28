import { F } from '../core/frac.js';
import { axb, bax, xAns, okSol } from './equations.js';

export default {
  id: 'equations-two-step',
  topic: 'Equations', type: 'Two-step equations', code: 'EQ2',
  levels: ['Foundation', 'Core'],
  search: 'solve equation two step negative coefficient',
  verb: 'Solve', marks: 2, lines: 3,
  integer: true,
  variants: [
    { id: 'std', label: 'ax + b = c', params: { kind: 'std' } },
    { id: 'frac', label: 'x over a, plus b = c', params: { kind: 'frac' } },
    { id: 'neg', label: 'b − ax = c  (negative x term)', params: { kind: 'neg' } },
  ],
  generate(r, v, fl) {
    if (v.kind === 'std') {
      const [a, b, c, sol] = r.until(() => {
        const a = r.int(2, 9), b = r.int(1, 15) * r.sign(), c = r.int(-12, 40);
        if (c === 0 || c === b) return null;
        const s = new F(c - b, a);
        return okSol(s, fl) ? [a, b, c, s] : null;
      });
      const eq = `${axb(a, b)} = ${c}`;
      return { parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${a}x = ${c - b};\\ ${xAns(sol)}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    if (v.kind === 'frac') {
      const [a, b, c, x0] = r.until(() => {
        const a = r.int(2, 8), b = r.int(1, 12) * r.sign(), x0 = a * r.int(-6, 10);
        const c = x0 / a + b;
        return x0 !== 0 && c !== 0 ? [a, b, c, x0] : null;
      });
      const eq = `\\dfrac{x}{${a}} ${b < 0 ? '-' : '+'} ${Math.abs(b)} = ${c}`;
      return { parts: [{ body: `{{${eq}}}`, a: `x = ${x0}`, w: `{{\\dfrac{x}{${a}} = ${c - b};\\ x = ${x0}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    const [a, b, c, sol] = r.until(() => {
      const a = r.int(2, 9), b = r.int(2, 30), c = r.int(-10, 24);
      if (c === 0 || c === b) return null;
      const s = new F(b - c, a);
      return okSol(s, fl) ? [a, b, c, s] : null;
    });
    const eq = `${bax(b, -a)} = ${c}`;
    return { parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${b - c} = ${a}x;\\ ${xAns(sol)}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
  },
};
