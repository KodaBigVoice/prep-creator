import { F, gcd } from '../core/frac.js';
import { randMixed, mixedIn, impr, proper, M, part } from './fractions.js';

export default {
  id: 'fractions-divide',
  topic: 'Fractions', type: 'Dividing fractions', code: 'FDIV',
  levels: ['Core', 'Additional'],
  search: 'divide fractions reciprocal keep change flip mixed numbers cross-cancel',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'int', label: 'fraction ÷ whole number:  4 1/3 ÷ 2', params: { kind: 'int' } },
    { id: 'frac', label: 'fraction ÷ fraction:  3/4 ÷ 2/5', params: { kind: 'frac' } },
    { id: 'whole', label: 'whole number ÷ fraction:  6 ÷ 2/3', params: { kind: 'whole' } },
    { id: 'cancel', label: 'mixed numbers, cross-cancelling possible', params: { kind: 'cancel' }, levels: ['Additional'] },
    { id: 'mixed', label: 'mixed number ÷ mixed number', params: { kind: 'mixed' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    let A, B;
    const dens = [3, 4, 5, 6, 7, 8, 9, 10];
    if (v.kind === 'int') {
      [A, B] = r.until(() => { const a = randMixed(r, { wMin: 0, wMax: 4 }); const b = new F(r.int(2, 9)); return a && !a.div(b).isInt ? [a, b] : null; });
    } else if (v.kind === 'frac') {
      [A, B] = r.until(() => {
        const a = proper(r, dens), b = proper(r, dens);
        if (!a || !b || a.eq(b)) return null;
        const res = a.div(b);
        return !res.isInt && res.val < 8 && res.d <= 12 ? [a, b] : null;
      });
    } else if (v.kind === 'whole') {
      [A, B] = r.until(() => {
        const a = new F(r.int(2, 12)), b = proper(r, [2, 3, 4, 5, 6, 8]);
        if (!b) return null;
        const res = a.div(b);
        return !res.isInt && res.d <= 5 ? [a, b] : null;
      });
    } else {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 5 }), b = randMixed(r, { wMin: 1, wMax: 4 });
        if (!a || !b) return null;
        const cancels = gcd(a.n, b.n) > 1 || gcd(a.d, b.d) > 1;
        if ((v.kind === 'cancel') !== cancels) return null;
        const res = a.div(b);
        return res.isInt || res.val > 12 || res.d > 16 ? null : [a, b];
      });
    }
    const res = A.div(B);
    const bTex = B.isInt ? String(B.n) : mixedIn(B);
    const q = `${mixedIn(A)} \\div ${bTex}`;
    const steps = [q, `${impr(A)} \\div ${B.isInt ? B.n : impr(B)}`, `${impr(A)} \\times ${impr(B.inv())}`, `\\dfrac{${A.n * B.d}}{${A.d * B.n}}`];
    if (A.d * B.n !== res.d || A.n * B.d !== res.n) steps.push(impr(res));
    steps.push(res.mixedTex());
    return { parts: [part(M(q), res.mixedTex(), M([...new Set(steps)].join(' = ')), { k: 'eval', tex: q })] };
  },
};
