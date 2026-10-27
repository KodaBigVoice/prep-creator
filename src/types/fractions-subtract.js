import { F, gcd, lcm } from '../core/frac.js';
import { randMixed, mixedIn, impr, asDen } from './fractions.js';

export default {
  id: 'fractions-subtract',
  topic: 'Fractions', type: 'Subtract (fractions and mixed numbers)', code: 'FSUB',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'subtract fractions overlap borrowing regrouping exchange mixed numbers',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'overlap', label: 'with overlap (second fraction part is larger)', params: { overlap: true } },
    { id: 'plain', label: 'without overlap', params: { overlap: false } },
    { id: 'any', label: 'either', params: { overlap: null } },
  ],
  generate(r, v) {
    const [A, B] = r.until(() => {
      const a = randMixed(r, { wMin: 2, wMax: 8 }), b = randMixed(r, { wMin: 1, wMax: 6 });
      if (!a || !b || a.d === b.d && r.chance(0.7)) return null;
      const ma = a.mixed(), mb = b.mixed();
      if (lcm(a.d, b.d) > 30) return null;
      if (!a.gt(b)) return null;
      const ov = new F(ma.n, ma.d).lt(new F(mb.n, mb.d));
      if (v.overlap !== null && ov !== v.overlap) return null;
      const res = a.sub(b);
      if (res.isInt || res.val > 8 || res.val < 1) return null;
      return [a, b];
    });
    const res = A.sub(B), L = lcm(A.d, B.d);
    const steps = [`${mixedIn(A)} - ${mixedIn(B)}`, `${impr(A)} - ${impr(B)}`];
    if (A.d !== B.d) steps.push(`${asDen(A, L)} - ${asDen(B, L)}`);
    const ru = res.n * 1; // improper result before reducing
    steps.push(`\\dfrac{${A.n * (L / A.d) - B.n * (L / B.d)}}{${L}}`);
    if (!(res.d === L)) steps.push(impr(res));
    if (res.mixed().w > 0 && res.mixed().n > 0) steps.push(res.mixedTex());
    const w = [...new Set(steps)].join(' = ');
    return { parts: [{ body: `{{${mixedIn(A)} - ${mixedIn(B)}}}`, a: res.mixedTex(), w: `{{${w}}}`, chk: { k: 'eval', tex: `${mixedIn(A)} - ${mixedIn(B)}` } }] };
  },
};
