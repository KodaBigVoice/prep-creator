import { F, gcd } from '../core/frac.js';
import { M, part, addSubWork, proper } from './fractions.js';

const PAIRS = [];
for (let d = 2; d <= 10; d++) for (let k = 2; k <= 4; k++) if (d * k <= 20) PAIRS.push([d, d * k]);

export default {
  id: 'fractions-related-denominators',
  topic: 'Fractions', type: 'Add and subtract (one denominator a multiple of the other)', code: 'FREL',
  levels: ['Core', 'Additional'],
  search: 'add subtract fractions different denominators multiple common denominator',
  verb: 'Evaluate', marks: 2, lines: 3,
  variants: [
    { id: 'add', label: 'adding:  1/3 + 1/6', params: { kind: 'add' } },
    { id: 'sub', label: 'subtracting:  7/8 − 1/4', params: { kind: 'sub' } },
    { id: 'addover', label: 'adding, answer more than 1:  3/4 + 5/8', params: { kind: 'addover' } },
  ],
  generate(r, v) {
    const [A, B, op] = r.until(() => {
      const [d1, d2] = r.chance(0.5) ? r.pick(PAIRS) : r.pick(PAIRS).slice().reverse();
      const a = proper(r, [d1]), b = proper(r, [d2]);
      if (!a || !b || a.d !== d1 || b.d !== d2) return null;
      if (v.kind === 'sub') { const [x, y] = a.gt(b) ? [a, b] : [b, a]; return x.sub(y).isZero ? null : [x, y, '-']; }
      const s = a.add(b);
      if (s.isInt) return null;
      if (v.kind === 'add' && s.val >= 1) return null;
      if (v.kind === 'addover' && s.val <= 1) return null;
      return [a, b, '+'];
    });
    const q = `${A.tex()} ${op} ${B.tex()}`, res = op === '+' ? A.add(B) : A.sub(B);
    return { parts: [part(M(q), res.mixedTex(), M(addSubWork(A, B, op)), { k: 'eval', tex: q })] };
  },
};
