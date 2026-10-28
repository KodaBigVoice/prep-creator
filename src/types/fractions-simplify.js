import { F, gcd } from '../core/frac.js';
import { M, part } from './fractions.js';

export default {
  id: 'fractions-simplify',
  topic: 'Fractions', type: 'Simplifying fractions', code: 'FSIM',
  levels: ['Foundation', 'Core'],
  search: 'simplify fractions lowest terms common factor cancel',
  verb: 'Simplify', marks: 1, lines: 2,
  variants: [
    { id: 'small', label: 'small common factor:  18/24', params: { lo: 2, hi: 6 } },
    { id: 'large', label: 'larger numbers:  84/126', params: { lo: 7, hi: 14 } },
  ],
  generate(r, v) {
    let a, b, k;
    do { b = r.int(3, 13); a = r.int(1, b - 1); k = r.int(v.lo, v.hi); } while (gcd(a, b) !== 1);
    const A = new F(a, b);
    const q = `\\dfrac{${a * k}}{${b * k}}`;
    return { parts: [part(M(q), `\\dfrac{${a}}{${b}}`, M(`\\dfrac{${a * k} \\div ${k}}{${b * k} \\div ${k}} = \\dfrac{${a}}{${b}}`), { k: 'eval', tex: q })] };
  },
};
