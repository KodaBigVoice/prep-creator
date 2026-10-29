import { TOPIC, F, rd, ds, py, M, num } from './decimals.js';

const range = (lo, hi, d) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i).filter(x => x % 10 !== 0).map(x => new F(x, d));
const SQB = range(2, 29, 10).concat([2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15].map(x => new F(x, 100)));
const CUB = range(1, 25, 10).concat([new F(1, 20), new F(2, 100), new F(4, 100)]);

export default {
  id: 'dec-power',
  topic: TOPIC, type: 'Squares, cubes and roots of decimals', code: 'DC16',
  levels: ['Additional'],
  search: 'square cube root decimals 0.3 squared 0.2 cubed square root of 0.49',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'square', label: 'squares:  0.3²', params: { k: 'sq' } },
    { id: 'cube', label: 'cubes:  0.2³', params: { k: 'cu' } },
    { id: 'root', label: 'square roots:  √0.49', params: { k: 'rt' } },
    { id: 'cuberoot', label: 'cube roots:  ∛0.008', params: { k: 'cr' } },
  ],
  generate(r, v) {
    const b = r.pick(v.k === 'sq' || v.k === 'rt' ? SQB : CUB).div(1);
    if (v.k === 'sq') { const a = b.mul(b); return { parts: [{ body: `{{${ds(b)}^2}}`, a: ds(a), w: M(`${ds(b)}^2 = ${ds(b)} \\times ${ds(b)} = ${ds(a)}`), m: 1, chk: num(`${py(b)}**2`, a) }] }; }
    if (v.k === 'cu') { const a = b.mul(b).mul(b); return { parts: [{ body: `{{${ds(b)}^3}}`, a: ds(a), w: M(`${ds(b)}^3 = ${ds(b.mul(b))} \\times ${ds(b)} = ${ds(a)}`), m: 1, chk: num(`${py(b)}**3`, a) }] }; }
    if (v.k === 'rt') { const a = b.mul(b); return { parts: [{ body: `{{\\sqrt{${ds(a)}}}}`, a: ds(b), w: M(`${ds(b)} \\times ${ds(b)} = ${ds(a)},\\ \\text{so } \\sqrt{${ds(a)}} = ${ds(b)}`), m: 1, chk: num(`sqrt(${py(a)})`, b) }] }; }
    const a = b.mul(b).mul(b);
    return { parts: [{ body: `{{\\sqrt[3]{${ds(a)}}}}`, a: ds(b), w: M(`${ds(b)}^3 = ${ds(a)},\\ \\text{so } \\sqrt[3]{${ds(a)}} = ${ds(b)}`), m: 1, chk: num(`${py(a)}**Fraction(1,3)`, b) }] };
  },
};
