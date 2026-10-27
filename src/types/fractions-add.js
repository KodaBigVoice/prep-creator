import { F, lcm } from '../core/frac.js';
import { randMixed, mixedIn, impr, asDen } from './fractions.js';

export default {
  id: 'fractions-add',
  topic: 'Fractions', type: 'Add (fractions and mixed numbers)', code: 'FADD',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'add fractions mixed numbers carrying',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'carry', label: 'mixed numbers, fractions add to more than 1', params: { carry: true } },
    { id: 'plain', label: 'mixed numbers, no carrying', params: { carry: false } },
  ],
  generate(r, v) {
    const [A, B] = r.until(() => {
      const a = randMixed(r, { wMin: 1, wMax: 6 }), b = randMixed(r, { wMin: 1, wMax: 5 });
      if (!a || !b || a.d === b.d || lcm(a.d, b.d) > 30) return null;
      const carry = a.mixed().n / a.d + b.mixed().n / b.d >= 1;
      return carry === v.carry ? [a, b] : null;
    });
    const res = A.add(B), L = lcm(A.d, B.d);
    const q = `${mixedIn(A)} + ${mixedIn(B)}`;
    const steps = [q, `${impr(A)} + ${impr(B)}`, `${asDen(A, L)} + ${asDen(B, L)}`, `\\dfrac{${A.n * (L / A.d) + B.n * (L / B.d)}}{${L}}`, res.mixedTex()];
    return { parts: [{ body: `{{${q}}}`, a: res.mixedTex(), w: `{{${[...new Set(steps)].join(' = ')}}}`, chk: { k: 'eval', tex: q } }] };
  },
};
