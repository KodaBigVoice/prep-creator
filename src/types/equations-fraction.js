import { F } from '../core/frac.js';
import { P } from '../core/poly.js';
import { xAns } from './equations.js';

export default {
  id: 'equations-fraction',
  topic: 'Linear equations', type: 'Algebraic fraction (single)', code: 'EQF',
  levels: ['Core', 'Additional'],
  search: 'fractional equation algebraic fraction solve',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'top', label: '(ax + b)/c = d', params: { kind: 'top' } },
    { id: 'split', label: 'ax/c − b = d', params: { kind: 'split' } },
    { id: 'eq', label: '(ax + b)/c = x + d', params: { kind: 'eq' } },
  ],
  generate(r, v, fl) {
    if (v.kind === 'top') {
      const [a, b, c, d, x0] = r.until(() => {
        const a = r.int(2, 6), c = r.int(2, 7), x0 = r.int(-5, 12), b = r.int(-9, 9), d = (a * x0 + b) / c;
        return b !== 0 && Number.isInteger(d) && d !== 0 && x0 !== 0 ? [a, b, c, d, x0] : null;
      });
      const num = P.v('x', 1, a).add(P.c(b)).tex();
      const eq = `\\dfrac{${num}}{${c}} = ${d}`;
      return { parts: [{ body: `{{${eq}}}`, a: `x = ${x0}`, w: `{{${num} = ${c * d};\\ ${a}x = ${c * d - b};\\ x = ${x0}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    if (v.kind === 'split') {
      const [a, b, c, d, x0] = r.until(() => {
        const a = r.int(2, 5), c = r.int(2, 7), b = r.int(1, 12), x0 = r.int(-5, 12), d = (a * x0) / c - b;
        return Number.isInteger(d) && x0 !== 0 ? [a, b, c, d, x0] : null;
      });
      const eq = `\\dfrac{${a}x}{${c}} - ${b} = ${d}`;
      return { parts: [{ body: `{{${eq}}}`, a: `x = ${x0}`, w: `{{\\dfrac{${a}x}{${c}} = ${d + b};\\ ${a}x = ${c * (d + b)};\\ x = ${x0}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    const [a, b, c, d, sol] = r.until(() => {
      const a = r.int(3, 9), c = r.int(2, 5), b = r.int(-6, 9), d = r.int(-5, 6);
      if (a === c || d === 0) return null;
      const s = new F(c * d - b, a - c);
      return s.isInt && !s.isZero ? [a, b, c, d, s] : null;
    });
    const num = P.v('x', 1, a).add(P.c(b)).tex();
    const rhs = P.v('x').add(P.c(d)).tex();
    const eq = `\\dfrac{${num}}{${c}} = ${rhs}`;
    return { parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${num} = ${c}(${rhs});\\ ${xAns(sol)}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
  },
};
