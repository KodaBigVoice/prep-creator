import { PTOPIC, M, F, SHOP, An, an, names, pounds, poundsTex, dstr, valOf, mk, numChk, GBP } from './percentages.js';

const FR = [['a quarter', 4], ['a fifth', 5], ['a third', 3], ['a tenth', 10], ['an eighth', 8]];
const PCS = [10, 15, 20, 25, 30, 35, 40, 50];

export default {
  id: 'pctprob-best-buy',
  topic: PTOPIC, type: 'Best buy', code: 'PP5',
  levels: ['Core', 'Additional'],
  search: 'best buy compare two offers percentage off fraction off which shop is cheaper by how much',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'percent', label: 'two percentage discounts', params: { k: 'pp' } },
    { id: 'fraction', label: 'a percentage against a fraction off', params: { k: 'pf' } },
    { id: 'amount', label: 'a percentage against an amount off', params: { k: 'pa' } },
  ],
  generate(r, v) {
    const it = r.pick(SHOP), item = it.name;
    const o = r.until(() => {
      const X = r.pick(it.prices), Y = X + r.pick([-12, -10, -8, -6, -5, -4, -2, 2, 4, 5, 6, 8, 10, 12, 15]), pa = r.pick(PCS);
      const fa = F.of(X).mul(100 - pa).div(100);
      let fb, desc, w2, eb;
      if (v.k === 'pp') { const pb = r.pick(PCS); if (pb === pa) return null; fb = F.of(Y).mul(100 - pb).div(100); desc = `${pb}% off`; w2 = `${Y} \\times ${dstr(new F(100 - pb, 100))} = ${dstr(fb)}`; eb = `${Y}*(100-${pb})/100`; }
      else if (v.k === 'pf') { const [wd, d] = r.pick(FR); fb = F.of(Y).mul(d - 1).div(d); if (100 % fb.d) return null; desc = `${wd} off`; w2 = `${Y} - ${dstr(F.of(Y).div(d))} = ${dstr(fb)}`; eb = `${Y}*${d - 1}/${d}`; }
      else { const off = r.pick([5, 8, 10, 12, 15, 18, 20, 25]); fb = F.of(Y - off); desc = `${pounds(off)} off`; w2 = `${Y} - ${off} = ${dstr(fb)}`; eb = `${Y}-${off}`; }
      if (100 % fa.d || 100 % fb.d || fa.eq(fb)) return null;
      return { X, Y, pa, fa, fb, desc, w2, ea: `${X}*(100-${pa})/100`, eb };
    });
    const { X, Y, pa, fa, fb, desc, w2, ea, eb } = o;
    const aCheaper = fa.lt(fb), diff = fa.sub(fb).abs();
    const stem = `${An(item)} is sold in two shops. In Shop A, the usual price is ${pounds(X)} and there is ${pa}% off. In Shop B, the usual price is ${pounds(Y)} and there is ${desc}.`;
    return { parts: [{ body: `${stem} Which shop sells the ${item} for less, and by how much?`, a: `\\text{Shop ${aCheaper ? 'A' : 'B'} by }${poundsTex(diff.val)}`, w: M(`\\text{A: } ${X} \\times ${dstr(new F(100 - pa, 100))} = ${dstr(fa)};\\ \\text{B: } ${w2};\\ \\text{difference } ${dstr(diff)}`), ...mk(3, GBP), chk: numChk(aCheaper ? `(${eb})-(${ea})` : `(${ea})-(${eb})`, diff) }] };
  },
};
