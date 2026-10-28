import { F, gcd } from '../core/frac.js';
import { randMixed, mixedIn, impr, proper, M, part } from './fractions.js';

export default {
  id: 'fractions-multiply',
  topic: 'Fractions', type: 'Multiplying fractions', code: 'FMUL',
  levels: ['Core', 'Additional'],
  search: 'multiply fractions mixed numbers cross-cancel whole number',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'plain', label: 'fraction × fraction, nothing to cancel:  2/3 × 4/5', params: { kind: 'plain' } },
    { id: 'whole', label: 'fraction × whole number:  4 × 2/5', params: { kind: 'whole' } },
    { id: 'cancel', label: 'fraction × fraction, cancelling:  3/8 × 4/9', params: { kind: 'cancel' } },
    { id: 'mixfrac', label: 'mixed number × fraction:  2 1/2 × 3/4', params: { kind: 'mixfrac' }, levels: ['Additional'] },
    { id: 'mixed', label: 'mixed number × mixed number', params: { kind: 'mixed' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    let A, B;
    const dens = [3, 4, 5, 6, 7, 8, 9, 10];
    if (v.kind === 'plain' || v.kind === 'cancel') {
      [A, B] = r.until(() => {
        const a = proper(r, dens), b = proper(r, dens);
        if (!a || !b || a.eq(b) || (a.n === 1 && b.n === 1)) return null;
        const cancels = gcd(a.n, b.d) > 1 || gcd(b.n, a.d) > 1;
        return (v.kind === 'cancel') === cancels ? [a, b] : null;
      });
    } else if (v.kind === 'whole') {
      [A, B] = r.until(() => {
        const a = proper(r, dens), n = new F(r.int(2, 9));
        return a && !a.mul(n).isInt ? (r.chance(0.5) ? [a, n] : [n, a]) : null;
      });
    } else if (v.kind === 'mixfrac') {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 4, dens: [2, 3, 4, 5, 6, 8] }), b = proper(r, dens);
        if (!a || !b) return null;
        const res = a.mul(b);
        return !res.isInt && res.d <= 20 ? [a, b] : null;
      });
    } else {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 5 }), b = randMixed(r, { wMin: 1, wMax: 4 });
        if (!a || !b) return null;
        const res = a.mul(b);
        return !res.isInt && res.val < 20 && res.d <= 16 && (gcd(a.n, b.d) > 1 || gcd(b.n, a.d) > 1) ? [a, b] : null;
      });
    }
    const res = A.mul(B);
    const q = `${mixedIn(A)} \\times ${mixedIn(B)}`;
    const steps = [q, `${impr(A)} \\times ${impr(B)}`];
    if (!A.isInt && !B.isInt) steps.push(`\\dfrac{${A.n} \\times ${B.n}}{${A.d} \\times ${B.d}}`);
    steps.push(`\\dfrac{${A.n * B.n}}{${A.d * B.d}}`, impr(res), res.mixedTex());
    return { parts: [part(M(q), res.mixedTex(), M([...new Set(steps)].join(' = ')), { k: 'eval', tex: q })] };
  },
};
