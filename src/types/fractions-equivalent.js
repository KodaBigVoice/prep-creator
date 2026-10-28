import { F, gcd } from '../core/frac.js';
import { M, part } from './fractions.js';

export default {
  id: 'fractions-equivalent',
  topic: 'Fractions', type: 'Equivalent fractions', code: 'FEQV',
  levels: ['Foundation', 'Core'],
  search: 'equivalent fractions missing number numerator denominator',
  verb: 'Find the missing number', marks: 1, lines: 2,
  variants: [
    { id: 'up', label: 'scaling up:  3/4 = ?/20', params: { up: true } },
    { id: 'down', label: 'scaling down:  18/24 = 3/?', params: { up: false } },
  ],
  generate(r, v) {
    let a, b, k, unknownTop;
    do {
      b = r.int(2, 12); a = r.int(1, b - 1); k = r.int(2, v.up ? 9 : 8); unknownTop = r.chance(0.5);
    } while (gcd(a, b) !== 1 || b * k > 100 || (!v.up && a * k < 4));
    // the fraction we are shown whole, and the one with a gap
    const [sn, sd, gn, gd] = v.up ? [a, b, a * k, b * k] : [a * k, b * k, a, b];
    const shown = `\\dfrac{${sn}}{${sd}}`;
    const body = unknownTop ? `\\dfrac{${gn}}{${gd}}`.replace(`{${gn}}`, '{?}') : `\\dfrac{${gn}}{${gd}}`.replace(`{${gd}}`, '{?}');
    const ans = unknownTop ? gn : gd;
    // known number on the gapped side, and the scale factor, give the working
    const op = v.up ? '\\times' : '\\div';
    const f = k;
    const w = unknownTop
      ? `\\dfrac{${sn} ${op} ${f}}{${sd} ${op} ${f}} = \\dfrac{${gn}}{${gd}}`
      : `\\dfrac{${sn} ${op} ${f}}{${sd} ${op} ${f}} = \\dfrac{${gn}}{${gd}}`;
    const chk = unknownTop
      ? { k: 'num', expr: `Fraction(${sn},${sd})*${gd}`, val: String(ans) }
      : { k: 'num', expr: `Fraction(${gn}*${sd},${sn})`, val: String(ans) };
    const sides = r.chance(0.5);
    return { parts: [part(M(sides ? `${shown} = ${body}` : `${body} = ${shown}`), String(ans), M(w), chk)] };
  },
};
