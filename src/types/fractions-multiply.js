import { F, gcd } from '../core/frac.js';
import { randMixed, mixedIn, impr } from './fractions.js';

export default {
  id: 'fractions-multiply',
  topic: 'Fractions', type: 'Multiply (fractions and mixed numbers)', code: 'FMUL',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'multiply fractions mixed numbers cross-cancel',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'mixed', label: 'mixed numbers', params: {} },
  ],
  generate(r) {
    const [A, B] = r.until(() => {
      const a = randMixed(r, { wMin: 1, wMax: 5 }), b = randMixed(r, { wMin: 1, wMax: 4 });
      if (!a || !b) return null;
      const res = a.mul(b);
      return !res.isInt && res.val < 20 && res.d <= 16 && (gcd(a.n, b.d) > 1 || gcd(b.n, a.d) > 1) ? [a, b] : null;
    });
    const res = A.mul(B);
    const q = `${mixedIn(A)} \\times ${mixedIn(B)}`;
    const steps = [q, `${impr(A)} \\times ${impr(B)}`, `\\dfrac{${A.n * B.n}}{${A.d * B.d}}`, impr(res), res.mixedTex()];
    return { parts: [{ body: `{{${q}}}`, a: res.mixedTex(), w: `{{${[...new Set(steps)].join(' = ')}}}`, chk: { k: 'eval', tex: q } }] };
  },
};
