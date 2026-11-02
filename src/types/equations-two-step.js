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
    { id: 'std', label: 'ax ± b = c', params: { kind: 'std' } },
    { id: 'negc', label: 'ax ± b = −c  (negative right-hand side)', params: { kind: 'negc' }, levels: ['Core'] },
    { id: 'cross', label: 'crossing zero:  3x + 8 = 2', params: { kind: 'cross' }, levels: ['Core'] },
    { id: 'frac', label: 'x over a ± b = c', params: { kind: 'frac' } },
    { id: 'neg', label: 'b − ax = c  (negative x term)', params: { kind: 'neg' } },
  ],
  generate(r, v, fl) {
    if (v.kind === 'std' || v.kind === 'negc' || v.kind === 'cross') {
      const [a, b, c, sol] = r.until(() => {
        const a = r.int(2, 9);
        let b, c;
        if (v.kind === 'std') {                                    // everything stays positive: ax = c − b is a positive number
          b = r.int(1, 15) * r.sign(); c = r.int(1, 40);
          if (c - b <= 0) return null;
        } else if (v.kind === 'negc') {                            // the right-hand side is negative, and so is ax = c − b: no crossing
          b = r.int(1, 15) * r.sign(); c = -r.int(1, 20);
          if (c - b >= 0) return null;
        } else if (r.sign() > 0) { c = r.int(1, 12); b = r.int(c + 1, c + 14); }            // 3x + 8 = 2: undoing b takes c across zero, to a negative
        else { c = -r.int(1, 12); b = -r.int(-c + 1, -c + 14); }                              // 3x − 8 = −2: ... or from a negative to a positive
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
