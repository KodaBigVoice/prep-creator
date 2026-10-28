import { F, gcd } from '../core/frac.js';
import { M, part, addSubWork } from './fractions.js';

export default {
  id: 'fractions-same-denominator',
  topic: 'Fractions', type: 'Add and subtract (same denominator)', code: 'FSAM',
  levels: ['Foundation', 'Core'],
  search: 'add subtract fractions same denominator',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'add', label: 'adding, answer less than 1:  3/8 + 2/8', params: { kind: 'add' } },
    { id: 'sub', label: 'subtracting:  11/12 − 5/12', params: { kind: 'sub' } },
    { id: 'addover', label: 'adding, answer more than 1:  3/8 + 7/8', params: { kind: 'addover' } },
    { id: 'simplify', label: 'answer needs simplifying:  1/8 + 3/8', params: { kind: 'simplify' } },
  ],
  generate(r, v) {
    const [A, B, op] = r.until(() => {
      const d = r.pick([4, 5, 6, 7, 8, 9, 10, 11, 12, 15]);
      const a = r.int(1, d - 1), b = r.int(1, d - 1);
      if (gcd(a, d) !== 1 || gcd(b, d) !== 1) return null;
      const op = v.kind === 'sub' ? '-' : v.kind === 'simplify' ? (r.chance(0.5) ? '+' : '-') : '+';
      if (op === '-' && a <= b) return null;
      const top = op === '+' ? a + b : a - b, g = gcd(top, d);
      if (top === d) return null;
      if (v.kind === 'add' && !(top < d && g === 1)) return null;
      if (v.kind === 'sub' && g !== 1) return null;
      if (v.kind === 'addover' && top < d) return null;
      if (v.kind === 'simplify' && !(g > 1 && top < d)) return null;
      return [new F(a, d), new F(b, d), op];
    });
    const q = `${A.tex()} ${op} ${B.tex()}`, res = op === '+' ? A.add(B) : A.sub(B);
    return { parts: [part(M(q), res.mixedTex(), M(addSubWork(A, B, op)), { k: 'eval', tex: q })] };
  },
};
