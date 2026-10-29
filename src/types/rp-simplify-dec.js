import { TOPIC, M, F, gcd, ratioOf, dstr } from './ratio.js';

export default {
  id: 'rp-simplify-dec',
  topic: TOPIC, type: 'Simplifying ratios with decimals and fractions', code: 'RP5',
  levels: ['Additional'],
  search: 'simplify ratio decimals fractions multiply to clear',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'decimal', label: 'decimals:  0.4 : 1.6', params: { k: 'd' } },
    { id: 'fraction', label: 'fractions:  1/2 : 3/4', params: { k: 'f' } },
    { id: 'mixed', label: 'a fraction and a decimal:  1/4 : 0.5', params: { k: 'm' } },
  ],
  generate(r, v) {
    if (v.k === 'd') {
      const [p, q] = ratioOf(r, 2, { max: 9, maxSum: 14 });
      const s = r.pick([0.1, 0.2, 0.3, 0.5, 0.25, 0.4, 1.5, 0.05, 2.5]);
      const x = new F(Math.round(p * s * 100), 100), y = new F(Math.round(q * s * 100), 100);
      const dpmax = Math.max(dstr(x).split('.')[1]?.length || 0, dstr(y).split('.')[1]?.length || 0);
      if (dpmax === 0) return this.generate(r, v);
      const mult = 10 ** dpmax, X = x.mul(mult).n, Y = y.mul(mult).n, g = gcd(X, Y);
      return { parts: [{ body: `Simplify the ratio ${dstr(x)} : ${dstr(y)}.`, a: `${X / g} : ${Y / g}`, w: M(`${dstr(x)} : ${dstr(y)} = ${X} : ${Y} = ${X / g} : ${Y / g}`), m: 2, lines: 3, chk: { k: 'num', expr: `Fraction('${dstr(y)}')/Fraction('${dstr(x)}')`, val: `${Y / g}/${X / g}` } }] };
    }
    const [a, b] = r.until(() => {
      const dens = [2, 3, 4, 5, 6, 8, 10];
      const f1 = new F(r.int(1, 7), r.pick(dens)), f2 = new F(r.int(1, 7), r.pick(dens));
      if (f1.d === 1 || f2.d === 1 || f1.eq(f2) || f1.val >= 1 || f2.val >= 1) return null;
      if (v.k === 'm' && !(f2.d === 2 || f2.d === 4 || f2.d === 5 || f2.d === 10)) return null;
      return [f1, f2];
    });
    const ratio = a.div(b), X = ratio.n, Y = ratio.d;
    const show = (f, dec) => (dec ? dstr(f) : `\\dfrac{${f.n}}{${f.d}}`);
    const dec2 = v.k === 'm';
    return { parts: [{ body: `Simplify the ratio {{${show(a, false)} : ${show(b, dec2)}}}.`, a: `${X} : ${Y}`, w: M(`${show(a, false)} : ${show(b, dec2)} = ${X} : ${Y}`), m: 2, lines: 3, chk: { k: 'num', expr: `Fraction(${b.n},${b.d})/Fraction(${a.n},${a.d})`, val: `${Y}/${X}` } }] };
  },
};
