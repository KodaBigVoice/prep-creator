import { F, gcd, lcm } from '../core/frac.js';
import { M, part, addSubWork, proper } from './fractions.js';

const COPRIME = [[2, 3], [2, 5], [3, 4], [3, 5], [2, 7], [4, 5], [3, 7], [5, 6], [4, 7], [3, 8], [5, 7], [2, 9], [4, 9], [5, 8], [3, 10], [7, 8], [6, 7]];
const SHARED = [[4, 6], [6, 8], [6, 9], [4, 10], [6, 10], [8, 12], [9, 12], [10, 15], [6, 15], [8, 10], [4, 14], [10, 12], [12, 15], [9, 15], [8, 20], [6, 14]];

export default {
  id: 'fractions-unrelated-denominators',
  topic: 'Fractions', type: 'Add and subtract (different denominators)', code: 'FUNR',
  levels: ['Core', 'Additional'],
  search: 'add subtract fractions different denominators lowest common denominator lcm',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'addc', label: 'adding, multiply the denominators:  2/3 + 1/4', params: { add: true, shared: false } },
    { id: 'subc', label: 'subtracting, multiply the denominators:  4/5 − 1/3', params: { add: false, shared: false } },
    { id: 'addl', label: 'adding, find the lowest common denominator:  5/6 + 3/8', params: { add: true, shared: true } },
    { id: 'subl', label: 'subtracting, find the lowest common denominator:  7/9 − 1/6', params: { add: false, shared: true } },
  ],
  generate(r, v) {
    const pairs = v.shared ? SHARED : COPRIME;
    const [A, B] = r.until(() => {
      const [d1, d2] = r.chance(0.5) ? r.pick(pairs) : r.pick(pairs).slice().reverse();
      const a = proper(r, [d1]), b = proper(r, [d2]);
      if (!a || !b || a.d !== d1 || b.d !== d2) return null;
      if (!v.add) { const [x, y] = a.gt(b) ? [a, b] : [b, a]; return x.sub(y).isZero ? null : [x, y]; }
      const s = a.add(b);
      return s.isInt || s.val > 2 ? null : [a, b];
    });
    const op = v.add ? '+' : '-', q = `${A.tex()} ${op} ${B.tex()}`, res = v.add ? A.add(B) : A.sub(B);
    return { parts: [part(M(q), res.mixedTex(), M(addSubWork(A, B, op)), { k: 'eval', tex: q })] };
  },
};
