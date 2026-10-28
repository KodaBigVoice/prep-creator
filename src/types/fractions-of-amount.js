import { F, gcd } from '../core/frac.js';
import { M, part } from './fractions.js';

const UNITS = [['£', 'pound'], ['£', 'pound'], ['£', 'pound'], ['kg', 'u'], ['m', 'u'], ['cm', 'u'], ['litres', 'u'], ['ml', 'u'], ['g', 'u'], ['km', 'u'], ['minutes', 'u']];

export default {
  id: 'fractions-of-amount',
  topic: 'Fractions', type: 'Fraction of an amount', code: 'FAMT',
  levels: ['Foundation', 'Core'],
  search: 'fraction of an amount quantity unit fraction find',
  verb: 'Work out', marks: 1, lines: 3,
  variants: [
    { id: 'unit', label: 'unit fraction of a number:  1/5 of 40', params: { kind: 'unit' } },
    { id: 'nonunit', label: 'fraction of a number:  3/5 of 40', params: { kind: 'nonunit' } },
    { id: 'units', label: 'fraction of an amount with units:  7/8 of £36', params: { kind: 'units' } },
    { id: 'improper', label: 'improper fraction of an amount:  5/4 of 36', params: { kind: 'improper' } },
  ],
  generate(r, v) {
    const d = r.pick(v.kind === 'unit' || v.kind === 'improper' ? [2, 3, 4, 5, 6, 7, 8, 9, 10, 12] : [3, 4, 5, 6, 7, 8, 9, 10, 12]);
    let n;
    if (v.kind === 'unit') n = 1;
    else if (v.kind === 'improper') n = r.pick([d + 1, d + 2, d + 3, 2 * d - 1].filter(x => gcd(x, d) === 1));
    else n = r.pick(Array.from({ length: d - 1 }, (_, i) => i + 1).filter(k => k > 1 && gcd(k, d) === 1));
    const k = r.int(2, v.kind === 'unit' ? 12 : 9), amount = d * k * (v.kind === 'units' && r.chance(0.4) ? 5 : 1);
    const per = amount / d, ans = per * n;
    let unitTex = '', pre = '';
    if (v.kind === 'units') {
      const [u, t] = r.pick(UNITS);
      if (t === 'pound') pre = '\\pounds '; else unitTex = `\\text{ ${u}}`;
    }
    const frac = `\\dfrac{${n}}{${d}}`;
    const q = `${frac}\\text{ of }${pre}${amount}${unitTex}`;
    const w = n === 1 ? `${amount} \\div ${d} = ${per}` : `${amount} \\div ${d} = ${per},\\ \\ ${per} \\times ${n} = ${ans}`;
    return { parts: [part(M(q), `${pre}${ans}${unitTex}`, M(w), { k: 'num', expr: `Fraction(${n},${d})*${amount}`, val: String(ans) })] };
  },
};
