import { names, TOPIC, T, M, F, gcd, num, fx } from './fracprob.js';

const SAME = [
  (n, k, N) => `There are ${N} pupils in a class. ${k} of the pupils walk to school. What fraction of the class walk to school?`,
  (n, k, N) => `A hockey team plays ${N} matches in a season and wins ${k} of them. What fraction of the matches does the team win?`,
  (n, k, N) => `A bag contains ${N} sweets. ${k} of the sweets are red. What fraction of the sweets are red?`,
  (n, k, N) => `A quiz has ${N} questions. ${n} gets ${k} of the questions correct. What fraction of the questions does ${n} get correct?`,
];
const UN = [
  { mk: (n, a, h) => `${n} falls asleep for ${a} minutes on a ${h}-hour car journey. What fraction of the journey does ${n} spend asleep?`, small: 'minutes', big: 'hours', f: 60, gen: (r) => { const h = r.int(1, 3); return [r.int(5, 60 * h - 5), h]; }, w: (a, h) => `${h}\\text{ hours} = ${60 * h}\\text{ minutes}` },
  { mk: (n, a, h) => `A bag of sugar has a mass of ${h} kg. A recipe uses ${a} g of the sugar. What fraction of the bag is used?`, small: 'g', big: 'kg', f: 1000, gen: (r) => { const h = r.int(1, 3); return [r.int(2, 20 * h - 1) * 50, h]; }, w: (a, h) => `${h}\\text{ kg} = ${1000 * h}\\text{ g}` },
  { mk: (n, a, h) => `A ribbon is ${h} m long. ${n} cuts off a piece that is ${a} cm long. What fraction of the ribbon is cut off?`, small: 'cm', big: 'm', f: 100, gen: (r) => { const h = r.int(1, 4); return [r.int(2, 20 * h - 1) * 5, h]; }, w: (a, h) => `${h}\\text{ m} = ${100 * h}\\text{ cm}` },
  { mk: (n, a, h) => `A bottle holds ${h} litres of juice. ${n} drinks ${a} ml of the juice. What fraction of the juice does ${n} drink?`, small: 'ml', big: 'litres', f: 1000, gen: (r) => { const h = r.int(1, 3); return [r.int(2, 20 * h - 1) * 50, h]; }, w: (a, h) => `${h}\\text{ litres} = ${1000 * h}\\text{ ml}` },
];

export default {
  id: 'fracprob-fraction-of',
  topic: TOPIC, type: 'One quantity as a fraction of another', code: 'FP3',
  levels: ['Core', 'Additional'],
  search: 'write as a fraction of worded problem units convert minutes hours',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'same', label: 'same units:  12 of 40 pupils', params: { units: false } },
    { id: 'units', label: 'convert units first:  35 minutes of 2 hours', params: { units: true } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (!v.units) {
      const [k, N] = r.until(() => { const N = r.int(20, 60), k = r.int(4, N - 4); return gcd(k, N) > 1 && new F(k, N).d <= 20 ? [k, N] : null; });
      const f = new F(k, N);
      return { parts: [{ body: r.pick(SAME)(n, k, N), a: f.tex(), w: M(`\\dfrac{${k}}{${N}} = ${f.tex()}`), chk: num(`Fraction(${k},${N})`, f) }] };
    }
    const c = r.pick(UN);
    const [a, h] = r.until(() => { const [a, h] = c.gen(r); const f = new F(a, c.f * h); return gcd(a, c.f * h) > 1 && f.d <= 40 ? [a, h] : null; });
    const f = new F(a, c.f * h);
    return { parts: [{ body: c.mk(n, a, h), a: f.tex(), w: M(`${c.w(a, h)}:\\ \\dfrac{${a}}{${c.f * h}} = ${f.tex()}`), chk: num(`Fraction(${a},${c.f * h})`, f) }] };
  },
};
