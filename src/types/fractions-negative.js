import { F, gcd } from '../core/frac.js';
import { proper, M, part } from './fractions.js';

export default {
  id: 'fractions-negative',
  topic: 'Fractions', type: 'Negative fractions', code: 'FNEG',
  levels: ['Further'],
  search: 'negative fractions add subtract multiply divide',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'addsub', label: 'adding and subtracting:  −2/3 + 1/4', params: { kind: 'addsub' } },
    { id: 'mul', label: 'multiplying:  1/2 × (−3/5)', params: { kind: 'mul' } },
    { id: 'div', label: 'dividing:  −3/4 ÷ 2/5', params: { kind: 'div' } },
  ],
  generate(r, v) {
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    const br = (t, neg) => (neg ? `\\left(${t}\\right)` : t);
    const [A, B, op, res] = r.until(() => {
      const a = proper(r, dens), b = proper(r, dens);
      if (!a || !b) return null;
      const sa = r.sign(), sb = r.sign();
      if (sa > 0 && sb > 0) return null;                                  // at least one negative
      const A = sa < 0 ? a.neg() : a, B = sb < 0 ? b.neg() : b;
      let op;
      if (v.kind === 'addsub') op = r.pick(['+', '-']); else op = v.kind === 'mul' ? '\\times' : '\\div';
      const res = op === '+' ? A.add(B) : op === '-' ? A.sub(B) : op === '\\times' ? A.mul(B) : A.div(B);
      if (res.isInt || res.isZero || Math.abs(res.val) > (v.kind === 'addsub' ? 3 : 8)) return null;
      if (v.kind === 'addsub' ? (a.d === b.d || res.d > 36) : res.d > 24) return null;
      return [A, B, op, res];
    });
    const q = `${A.tex()} ${op} ${br(B.tex(), B.isNeg)}`;
    const steps = [q];
    if (v.kind === 'addsub') {
      const L = A.d * B.d / gcd(A.d, B.d);
      const sd = (f) => `${f.isNeg ? '-' : ''}\\dfrac{${Math.abs(f.n) * (L / f.d)}}{${L}}`;
      steps.push(`${sd(A)} ${op} ${br(sd(B), B.isNeg)}`);
    }
    steps.push(res.tex());
    const m = res.mixed();
    if (m.w > 0 && m.n > 0) steps.push(res.mixedTex());
    return { parts: [part(M(q), res.mixedTex(), M([...new Set(steps)].join(' = ')), { k: 'eval', tex: q })] };
  },
};
