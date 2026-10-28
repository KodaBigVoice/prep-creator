import { F, gcd, lcm } from '../core/frac.js';
import { randMixed, mixedIn, impr, asDen, M, part } from './fractions.js';

export default {
  id: 'fractions-mixed',
  topic: 'Fractions', type: 'Mixed numbers: add and subtract', code: 'FMIX',
  levels: ['Core', 'Additional'],
  search: 'add subtract mixed numbers carrying overlap borrowing regrouping exchange whole number',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'add-plain', label: 'adding, no carrying:  2 1/4 + 1 1/2', params: { add: true, carry: false } },
    { id: 'sub-plain', label: 'subtracting, no overlap:  6 1/4 − 3 1/5', params: { add: false, overlap: false } },
    { id: 'add-carry', label: 'adding, fractions add to more than 1:  3 1/2 + 1 7/10', params: { add: true, carry: true } },
    { id: 'sub-whole', label: 'subtracting from a whole number:  5 − 2 3/8', params: { add: false, whole: true } },
    { id: 'sub-any', label: 'subtracting, with or without overlap', params: { add: false, overlap: null } },
    { id: 'sub-overlap', label: 'subtracting, with overlap:  8 1/3 − 2 1/2', params: { add: false, overlap: true } },
  ],
  generate(r, v) {
    let A, B;
    if (v.add) {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 6 }), b = randMixed(r, { wMin: 1, wMax: 5 });
        if (!a || !b || a.d === b.d || lcm(a.d, b.d) > 30) return null;
        const carry = a.mixed().n / a.d + b.mixed().n / b.d >= 1;
        return carry === v.carry ? [a, b] : null;
      });
    } else if (v.whole) {
      [A, B] = r.until(() => {
        const b = randMixed(r, { wMin: 1, wMax: 6, dens: [2, 3, 4, 5, 6, 8, 10] });
        return b ? [new F(b.mixed().w + r.int(2, 4)), b] : null;
      });
    } else {
      [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 2, wMax: 8 }), b = randMixed(r, { wMin: 1, wMax: 6 });
        if (!a || !b || a.d === b.d && r.chance(0.7)) return null;
        const ma = a.mixed(), mb = b.mixed();
        if (lcm(a.d, b.d) > 30 || !a.gt(b)) return null;
        const ov = new F(ma.n, ma.d).lt(new F(mb.n, mb.d));
        if (v.overlap !== null && ov !== v.overlap) return null;
        const res = a.sub(b);
        return res.isInt || res.val > 8 || res.val < 1 ? null : [a, b];
      });
    }
    const op = v.add ? '+' : '-', res = v.add ? A.add(B) : A.sub(B), L = lcm(A.d, B.d);
    const q = `${mixedIn(A)} ${op} ${mixedIn(B)}`;
    const top = v.add ? A.n * (L / A.d) + B.n * (L / B.d) : A.n * (L / A.d) - B.n * (L / B.d);
    const steps = [q, `${impr(A)} ${op} ${impr(B)}`];
    if (A.d !== B.d) steps.push(`${asDen(A, L)} ${op} ${asDen(B, L)}`);
    steps.push(`\\dfrac{${top}}{${L}}`);
    if (res.d !== L) steps.push(impr(res));
    if (res.mixed().w > 0 && res.mixed().n > 0) steps.push(res.mixedTex());
    return { parts: [part(M(q), res.mixedTex(), M([...new Set(steps)].join(' = ')), { k: 'eval', tex: q })] };
  },
};
