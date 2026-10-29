import { PTOPIC, M, F, SHOP, An, an, names, pounds, dstr, mk, numChk, GBP } from './percentages.js';

const ITEMS = SHOP.filter(i => ['laptop', 'sofa', 'games console', 'bicycle', 'tablet', 'camera', 'guitar'].includes(i.name));

export default {
  id: 'pctprob-sale-vat',
  topic: PTOPIC, type: 'Sale and VAT', code: 'PP7',
  levels: ['Additional'],
  search: 'sale then VAT two stage percentage change calculator further discount',
  verb: '', marks: 4, lines: 8, calc: true,
  variants: [
    { id: 'sale-vat', label: 'a sale price, then add VAT at 20%', params: { k: 'vat' } },
    { id: 'two-discounts', label: 'a discount, then a further discount', params: { k: 'two' } },
  ],
  generate(r, v) {
    const it = r.pick(ITEMS), item = it.name, [n] = names(r, 1);
    if (v.k === 'vat') {
      const [A, p] = r.until(() => { const A = r.pick(it.prices) + r.pick([0, 0, -1, -5]), p = r.pick([10, 15, 20, 25, 30, 40]); const f = F.of(A).mul(100 - p).div(100).mul(6).div(5); return 100 % f.d === 0 ? [A, p] : null; });
      const sale = F.of(A).mul(100 - p).div(100), fin = sale.mul(6).div(5);
      return { parts: [{ body: `The price of ${an(item)} is ${pounds(A)} before VAT. In a sale, the price is reduced by ${p}%. VAT at 20% is then added to the sale price. Calculate the final price of the ${item}.`, a: GBP.tex(fin), w: M(`${A} \\times ${dstr(new F(100 - p, 100))} = ${dstr(sale)};\\ ${dstr(sale)} \\times 1.2 = ${dstr(fin)}`), calc: true, ...mk(3, GBP), chk: numChk(`${A}*(100-${p})/100*1.2`, fin) }] };
    }
    const [A, p1, p2] = r.until(() => { const A = r.pick(it.prices) + r.pick([0, 0, -1, -5]), p1 = r.pick([10, 15, 20, 25, 30, 40]), p2 = r.pick([5, 10, 15, 20]); const f = F.of(A).mul(100 - p1).div(100).mul(100 - p2).div(100); return 100 % f.d === 0 ? [A, p1, p2] : null; });
    const s1 = F.of(A).mul(100 - p1).div(100), s2 = s1.mul(100 - p2).div(100);
    return { parts: [{ body: `${An(item)} costs ${pounds(A)}. In a sale, the price is reduced by ${p1}%. ${n} has a voucher that gives a further ${p2}% off the sale price. How much does ${n} pay for the ${item}?`, a: GBP.tex(s2), w: M(`${A} \\times ${dstr(new F(100 - p1, 100))} = ${dstr(s1)};\\ ${dstr(s1)} \\times ${dstr(new F(100 - p2, 100))} = ${dstr(s2)}`), calc: true, ...mk(3, GBP), chk: numChk(`${A}*(100-${p1})/100*(100-${p2})/100`, s2) }] };
  },
};
