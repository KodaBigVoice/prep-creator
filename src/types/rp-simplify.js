import { TOPIC, PAIRS, ratioOf, pairSentence, rtx, gcdAll, listChk, F } from './ratio.js';

export default {
  id: 'rp-simplify',
  topic: TOPIC, type: 'Simplifying ratios', code: 'RP2',
  levels: ['Foundation', 'Core'],
  search: 'simplify ratio whole numbers divide by common factor',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'two', label: 'two parts:  12 : 18', params: { k: 2 } },
    { id: 'three', label: 'three parts:  8 : 12 : 20', params: { k: 3 } },
    { id: 'ctx', label: 'from a worded count:  20 boys and 15 girls', params: { k: 'c' } },
  ],
  generate(r, v) {
    const k = v.k === 3 ? 3 : 2;
    const base = ratioOf(r, k, { max: k === 3 ? 6 : 9, maxSum: 20, distinct: false });
    if (base.every(x => x === base[0])) return this.generate(r, v);
    const g = r.int(2, v.k === 'c' ? 6 : 9), xs = base.map(x => x * g);
    const gx = xs.length === 3 ? `gcd(${xs[0]},gcd(${xs[1]},${xs[2]}))` : `gcd(${xs[0]},${xs[1]})`;
    const ck = { k: 'num', expr: `[${xs.map(x => `Fraction(${x},${gx})`).join(',')}]`, val: base.join(',') };
    if (v.k === 'c') {
      const p = r.pick(PAIRS), [x, y] = xs;
      return { parts: [{ body: `${pairSentence(p, x, y)} Simplify the ratio of ${p[0]} to ${p[1]}.`, a: rtx(base), w: `{{${xs.join(' : ')} = ${base.join(' : ')}\\ (\\div ${g})}}`, m: 1, lines: 3, chk: ck }] };
    }
    return { parts: [{ verb: 'Simplify', body: `the ratio {{${xs.join(' : ')}}}`, a: rtx(base), w: `{{${xs.join(' : ')} = ${base.join(' : ')}\\ (\\div ${g})}}`, m: 1, lines: 2, chk: ck }] };
  },
};
