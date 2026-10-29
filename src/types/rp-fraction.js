import { TOPIC, M, F, gcd, ratioOf, sumOf, PAIRS, TRIPLES } from './ratio.js';

export default {
  id: 'rp-fraction',
  topic: TOPIC, type: 'Ratios and fractions', code: 'RP11',
  levels: ['Core', 'Additional'],
  search: 'ratio to fraction fraction to ratio what fraction of the total',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'frac-of', label: 'ratio to fraction:  2 : 3, what fraction are boys', params: { k: 'f' }, levels: ['Core'] },
    { id: 'to-ratio', label: 'fraction to ratio:  3/5 are girls, boys to girls', params: { k: 'r' }, levels: ['Core'] },
    { id: 'three', label: 'three-part ratio to fraction', params: { k: 't' } },
  ],
  generate(r, v) {
    if (v.k === 'f') {
      const [a, b] = ratioOf(r, 2, { max: 8, maxSum: 13 }), p = r.pick(PAIRS), first = r.chance(0.5), n = first ? a : b, f = new F(n, a + b);
      return { parts: [{ body: `The ratio of ${p[0]} to ${p[1]} ${p[3]} is ${a} : ${b}. What fraction of the ${p[2]} are ${first ? p[0] : p[1]}?`, a: f.tex(), w: M(`${a} + ${b} = ${a + b};\\ ${f.tex() === `${n}` ? n : `\\dfrac{${n}}{${a + b}}`}${f.d !== a + b ? ` = ${f.tex()}` : ''}`), m: 2, lines: 3, chk: { k: 'num', expr: `Fraction(${n},${a + b})`, val: `${f.n}/${f.d}` } }] };
    }
    if (v.k === 'r') {
      const [d, n] = r.until(() => { const d = r.int(4, 12), n = r.int(1, d - 1); return gcd(n, d) === 1 && n !== d - n ? [d, n] : null; });
      const p = r.pick(PAIRS.slice(0, 6)), flip = r.chance(0.5);
      const [A, B] = flip ? [p[1], p[0]] : [p[0], p[1]], ans = flip ? `${d - n} : ${n}` : `${n} : ${d - n}`;
      return { parts: [{ body: `{{\\dfrac{${n}}{${d}}}} of the ${p[2]} ${p[3]} are ${p[0]}. The rest are ${p[1]}. Write down the ratio of ${A} to ${B}.`, a: ans, w: M(`${d} - ${n} = ${d - n};\\ \\text{ratio} = ${ans}`), m: 2, lines: 3, chk: { k: 'num', expr: `Fraction(${flip ? d - n : n},${flip ? n : d - n})`, val: `${flip ? d - n : n}/${flip ? n : d - n}` } }] };
    }
    const [x, y, z] = ratioOf(r, 3, { max: 7, maxSum: 14 }), t = r.pick(TRIPLES), i = r.int(0, 2), tot = x + y + z, xs = [x, y, z], names3 = [t[0], t[1], t[2]];
    const askNot = r.chance(0.4), n = askNot ? tot - xs[i] : xs[i], f = new F(n, tot);
    return { parts: [{ body: `The ratio of ${t[0]}, ${t[1]} and ${t[2]} ${t[3]} ${t[4]} is ${xs.join(' : ')}. What fraction of the ${t[3]} ${askNot ? `are not ${names3[i]}` : `are ${names3[i]}`}?`, a: f.tex(), w: M(`${xs.join(' + ')} = ${tot};\\ \\dfrac{${n}}{${tot}}${f.d !== tot ? ` = ${f.tex()}` : ''}`), m: 2, lines: 3, chk: { k: 'num', expr: `Fraction(${n},${tot})`, val: `${f.n}/${f.d}` } }] };
  },
};
