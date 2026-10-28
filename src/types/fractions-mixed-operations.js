import { F, gcd } from '../core/frac.js';
import { proper, M, part } from './fractions.js';

export default {
  id: 'fractions-mixed-operations',
  topic: 'Fractions', type: 'Fractions with brackets and order of operations', code: 'FOPS',
  levels: ['Additional'],
  search: 'fractions bidmas brackets order of operations mixed operations',
  verb: 'Evaluate', marks: 3, lines: 5,
  variants: [
    { id: 'bracket', label: 'brackets then multiply:  (2/3 + 1/4) × 6/7', params: { kind: 'bracket' } },
    { id: 'order', label: 'multiply before adding:  1/2 + 1/3 × 3/4', params: { kind: 'order' } },
    { id: 'bracketdiv', label: 'brackets then divide:  (5/6 − 1/3) ÷ 3/4', params: { kind: 'bracketdiv' } },
  ],
  generate(r, v) {
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    const pm = () => (r.chance(0.5) ? '+' : '-');
    const ap = (x, op, y) => (op === '+' ? x.add(y) : op === '-' ? x.sub(y) : op === '\\times' ? x.mul(y) : x.div(y));
    const [a, b, c, op1, q, res, work] = r.until(() => {
      const a = proper(r, dens), b = proper(r, dens), c = proper(r, dens);
      if (!a || !b || !c) return null;
      if (v.kind === 'order') {
        const op1 = pm(), pr = b.mul(c), res = ap(a, op1, pr);
        if (pr.isInt || res.val <= 0 || res.val >= 3 || res.d > 20) return null;
        if (gcd(b.n, c.d) === 1 && gcd(c.n, b.d) === 1) return null;
        const t = `${a.tex()} ${op1} ${b.tex()} \\times ${c.tex()}`;
        const w = `${t} = ${a.tex()} ${op1} ${pr.tex()} = ${res.tex()}`;
        return [a, b, c, op1, t, res, w];
      }
      const op1 = pm(), inner = ap(a, op1, b);
      if (inner.val <= 0 || inner.isInt || inner.d > 24) return null;
      const op2 = v.kind === 'bracket' ? '\\times' : '\\div';
      const res = ap(inner, op2, c);
      if (res.isInt || res.val > 6 || res.d > 20) return null;
      if (v.kind === 'bracket' && gcd(inner.n, c.d) === 1 && gcd(c.n, inner.d) === 1) return null;
      const t = `\\left(${a.tex()} ${op1} ${b.tex()}\\right) ${op2} ${c.tex()}`;
      const w = `${t} = ${inner.tex()} ${op2} ${c.tex()} = ${res.tex()}`;
      return [a, b, c, op1, t, res, w];
    });
    const w2 = res.mixed().w > 0 && res.mixed().n > 0 ? `${work} = ${res.mixedTex()}` : work;
    return { parts: [part(M(q), res.mixedTex(), M(w2), { k: 'eval', tex: q })] };
  },
};
