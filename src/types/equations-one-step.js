import { F } from '../core/frac.js';
import { xAns } from './equations.js';

export default {
  id: 'equations-one-step',
  topic: 'Equations', type: 'One-step equations', code: 'EQ1',
  levels: ['Foundation', 'Core'],
  search: 'solve equation one step inverse operation',
  verb: 'Solve', marks: 1, lines: 2,
  integer: true,
  variants: [
    { id: 'add', label: 'x + a = b  or  x − a = b', params: { kind: 'add' } },
    { id: 'times', label: 'ax = b', params: { kind: 'times' } },
    { id: 'div', label: 'x over a = b', params: { kind: 'div' } },
    { id: 'neg', label: 'negative answers', params: { kind: 'neg' } },
  ],
  generate(r, v, fl) {
    // pick which of the three forms to write; negative answers only in the 'neg' option
    const kind = v.kind === 'neg' ? r.pick(['add', 'times', 'div']) : v.kind, neg = v.kind === 'neg';
    const x0 = (lo = 1, hi = 14) => (neg ? -r.int(lo, Math.min(hi, 12)) : r.int(lo, hi));
    if (kind === 'add') {
      const b = r.int(2, 20), plus = r.chance(), x = neg ? -r.int(1, 9) : plus ? r.int(1, 14) : b + r.int(1, 12);
      const eq = plus ? `x + ${b} = ${x + b}` : `x - ${b} = ${x - b}`;
      return { parts: [{ body: `{{${eq}}}`, a: `x = ${x}`, w: `{{x = ${plus ? `${x + b} - ${b}` : `${x - b} + ${b}`};\\ x = ${x}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    if (kind === 'times') {
      const [a, c, sol] = r.until(() => {
        const a = r.int(2, 12), c = fl.integer ? a * x0(1, 12) : r.int(2, 40) * (neg ? -1 : 1);
        if (c === 0) return null;
        const s = new F(c, a);
        return fl.integer || !s.isInt && s.d <= 6 ? [a, c, s] : null;
      });
      const eq = `${a}x = ${c}`;
      return { parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{x = ${c} \\div ${a};\\ ${xAns(sol)}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    const a = r.int(2, 12), b = x0(1, 12);
    const eq = `\\dfrac{x}{${a}} = ${b}`;
    return { parts: [{ body: `{{${eq}}}`, a: `x = ${a * b}`, w: `{{x = ${b} \\times ${a};\\ x = ${a * b}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
  },
};
