import { F, gcd } from '../core/frac.js';
import { randMixed, mixedIn, impr } from './fractions.js';

export default {
  id: 'fractions-divide',
  topic: 'Fractions', type: 'Divide (fractions and mixed numbers)', code: 'FDIV',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'divide fractions reciprocal keep change flip mixed numbers cross-cancel',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'mixed', label: 'mixed number ÷ mixed number', params: { kind: 'mixed' } },
    { id: 'cancel', label: 'cross-cancelling possible', params: { kind: 'cancel' } },
    { id: 'int', label: 'fraction ÷ whole number', params: { kind: 'int' } },
  ],
  generate(r, v) {
    let A, B;
    if (v.kind === 'int') {
      [A, B] = r.until(() => { const a = randMixed(r, { wMin: 0, wMax: 4 }); const b = new F(r.int(2, 9)); return a && !a.div(b).isInt ? [a, b] : null; });
    } else {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 5 }), b = randMixed(r, { wMin: 1, wMax: 4 });
        if (!a || !b) return null;
        const cancels = gcd(a.n, b.n) > 1 || gcd(a.d, b.d) > 1;
        if ((v.kind === 'cancel') !== cancels) return null;
        const res = a.div(b);
        if (res.isInt || res.val > 12 || res.d > 16) return null;
        return [a, b];
      });
    }
    const res = A.div(B);
    const bTex = B.isInt ? String(B.n) : mixedIn(B);
    const q = `${mixedIn(A)} \\div ${bTex}`;
    const steps = [q, `${impr(A)} \\div ${B.isInt ? B.n : impr(B)}`, `${impr(A)} \\times ${impr(B.inv())}`, `\\dfrac{${A.n * B.d}}{${A.d * B.n}}`];
    if (A.d * B.n !== res.d) steps.push(impr(res));
    steps.push(res.mixedTex());
    return { parts: [{ body: `{{${q}}}`, a: res.mixedTex(), w: `{{${[...new Set(steps)].join(' = ')}}}`, chk: { k: 'eval', tex: q } }] };
  },
};
