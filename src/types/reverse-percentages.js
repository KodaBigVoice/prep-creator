import { names, pounds, poundsTex } from '../core/q.js';

const ITEMS = ['jacket', 'pair of trainers', 'bicycle', 'games console', 'coat', 'watch', 'tablet', 'rucksack', 'tent', 'sofa', 'laptop', 'camera'];
export default {
  id: 'reverse-percentages',
  topic: 'Reverse percentages', type: 'Find the original amount', code: 'PREV',
  levels: ['Core', 'Additional'],
  search: 'reverse percentage original price before sale after increase',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'sale', label: 'after a decrease (sale price)', params: { dir: -1, calc: false } },
    { id: 'increase', label: 'after an increase', params: { dir: 1, calc: false } },
    { id: 'sale-calc', label: 'after a decrease, calculator', params: { dir: -1, calc: true } },
  ],
  generate(r, v) {
    const [O, p, N] = r.until(() => {
      const O = v.calc ? r.int(8, 80) * 10 : r.pick([40, 60, 80, 100, 120, 160, 200, 240, 300, 400, 500]);
      const p = v.calc ? r.pick([12, 18, 22, 35, 8, 14, 17]) : r.pick([5, 10, 15, 20, 25, 30, 40]);
      const N = O * (100 + v.dir * p) / 100;
      return Number.isInteger(N * 4) ? [O, p, N] : null;
    });
    const item = r.pick(ITEMS);
    const pc = 100 + v.dir * p;
    const text = v.dir < 0
      ? `In a sale, all prices are reduced by ${p}%. A ${item} now costs ${pounds(N)}. What was the original price of the ${item}?`
      : `The price of a ${item} is increased by ${p}%. It now costs ${pounds(N)}. What was the price of the ${item} before the increase?`;
    const w = v.calc ? `${pounds(N).slice(1)} \\div ${pc / 100} = ${O}` : `${pc}\\% = ${pounds(N).slice(1)};\\ 1\\% = ${(N / pc).toFixed(N / pc % 1 === 0 ? 0 : 2).replace(/\.?0+$/, '')};\\ 100\\% = ${O}`;
    return { parts: [{ body: text, a: poundsTex(O), w: `{{${w}}}`, calc: v.calc, chk: { k: 'num', val: String(O), expr: `${N}/${pc}*100` } }] };
  },
};
