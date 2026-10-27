import { F } from '../core/frac.js';
import { names, pounds, poundsTex } from '../core/q.js';

const ITEMS = ['jacket', 'pair of trainers', 'bicycle', 'games console', 'coat', 'watch', 'tablet', 'guitar', 'tent', 'sofa', 'laptop', 'camera'];
const money = (f) => { const x = f.val; return Number.isInteger(x) ? x : Math.round(x * 100) / 100; };

export default {
  id: 'percentage-change',
  topic: 'Percentage change', type: 'Increase or decrease by a percentage', code: 'PCHG',
  levels: ['Core', 'Additional'],
  search: 'percentage increase decrease sale VAT price',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'decrease', label: 'decrease (sale), non-calculator', params: { dir: -1, calc: false } },
    { id: 'increase', label: 'increase, non-calculator', params: { dir: 1, calc: false } },
    { id: 'decrease-calc', label: 'decrease, calculator', params: { dir: -1, calc: true } },
    { id: 'vat', label: 'add VAT, calculator', params: { dir: 1, calc: true, vat: true } },
  ],
  generate(r, v) {
    const [p, A] = r.until(() => {
      const p = v.calc ? r.pick([2.5, 4, 7.5, 12, 17.5, 18, 22, 35, 8, 14]) : r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75]);
      const A = v.calc ? r.int(12, 95) * 10 : r.pick([40, 60, 80, 120, 160, 200, 240, 280, 320, 360, 400, 480]);
      const res = new F(A * (100 + v.dir * p) * 10, 1000);
      return (res.d === 1 || res.d === 2 || res.d === 4 || res.d === 5 || res.d === 10 || res.d === 20 || res.d === 25 || res.d === 50 || res.d === 100) ? [p, A] : null;
    });
    const item = r.pick(ITEMS);
    const pp = v.vat ? 20 : p;
    const [nm] = names(r, 1);
    const res = new F(Math.round(A * (100 + v.dir * pp) * 10), 1000);
    const val = money(res);
    let text;
    if (v.vat) text = `A ${item} costs ${pounds(A)} before VAT is added. VAT is charged at 20%. Calculate the cost of the ${item} including VAT.`;
    else if (v.dir < 0) text = `In a sale, all prices are reduced by ${p}%. A ${item} normally costs ${pounds(A)}. Work out the sale price of the ${item}.`;
    else text = `${nm} buys a ${item} for ${pounds(A)}. A year later its price has increased by ${p}%. Work out the new price of the ${item}.`;
    const mult = (100 + v.dir * pp) / 100;
    const w = v.calc ? `${A} \\times ${mult} = ${poundsTex(val).replace('\\pounds ', '\\pounds ')}`
      : `10\\% = ${pounds(A / 10).slice(1)};\\ ${pp}\\% = ${pounds(A * pp / 100).slice(1)};\\ ${v.dir < 0 ? 'sale price' : 'new price'} = ${poundsTex(val).replace('\\pounds ', '')}`;
    return { parts: [{ body: text, a: poundsTex(val), w: `{{${w}}}`, calc: v.calc, chk: { k: 'num', val: String(val), expr: `${A}*${(100 + v.dir * pp)}/100` } }] };
  },
};
