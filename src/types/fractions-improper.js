import { F, gcd } from '../core/frac.js';
import { M, part } from './fractions.js';

export default {
  id: 'fractions-improper',
  topic: 'Fractions', type: 'Improper fractions and mixed numbers', code: 'FIMP',
  levels: ['Foundation', 'Core'],
  search: 'improper fraction mixed number top-heavy convert',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'tomixed', label: 'improper fraction to mixed number:  17/5', params: { kind: 'tomixed' } },
    { id: 'toimproper', label: 'mixed number to improper fraction:  3 2/7', params: { kind: 'toimproper' } },
    { id: 'simplify', label: 'to mixed number, then simplify:  26/4', params: { kind: 'simplify' } },
  ],
  generate(r, v) {
    const dens = v.kind === 'simplify' ? [4, 6, 8, 9, 10, 12] : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    let d, rem, w;
    do { d = r.pick(dens); rem = r.int(1, d - 1); w = r.int(1, v.kind === 'toimproper' ? 9 : 7); } while (v.kind === 'simplify' ? gcd(rem, d) === 1 : gcd(rem, d) !== 1);
    const top = w * d + rem, imp = `\\dfrac{${top}}{${d}}`;
    const mixed = `${w}\\dfrac{${rem}}{${d}}`;
    if (v.kind === 'toimproper') {
      return { parts: [part(`Write {{${mixed}}} as an improper fraction.`, imp, M(`${mixed} = \\dfrac{${w} \\times ${d} + ${rem}}{${d}} = ${imp}`),
        { k: 'num', expr: `${w}+Fraction(${rem},${d})`, val: `${top}/${d}` })] };
    }
    const F2 = new F(top, d), ans = F2.mixedTex();
    const work = v.kind === 'simplify' ? `${imp} = ${mixed} = ${ans}` : `${imp} = ${mixed}`;
    return { parts: [part(`Write {{${imp}}} as a mixed number.`, ans, M(work), { k: 'eval', tex: imp })] };
  },
};
