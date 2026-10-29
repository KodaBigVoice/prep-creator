import { PTOPIC, F, rd, ds, py, M, mk, num, names, GBP, pounds } from './decimals.js';

const HRS = { meas: true, txt: (v) => `${ds(v)} hours`, tex: (v) => `${ds(v)}\\text{ hours}` };
const JOBS = [
  { who: 'A plumber', fee: [20, 25, 30, 35, 40], rate: [18, 22.5, 24, 27.5, 30, 35] },
  { who: 'A gardener', fee: [10, 15, 20, 25], rate: [12.5, 14, 15.5, 16, 18.5] },
  { who: 'An electrician', fee: [25, 30, 40, 45], rate: [24, 26.5, 28, 32, 35.5] },
  { who: 'A tutor', fee: [5, 10, 15], rate: [18.5, 22, 24.5, 26] },
];
const money = (f) => pounds(f.val);

export default {
  id: 'decprob-fee',
  topic: PTOPIC, type: 'Fixed fee plus hourly rate', code: 'DP6',
  levels: ['Additional'],
  search: 'fixed charge plus hourly rate call-out cost hours working backwards decimals',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'cost', label: 'find the total cost for a number of hours', params: { k: 'cost' } },
    { id: 'hours', label: 'find the number of hours for a total cost', params: { k: 'hours' } },
  ],
  generate(r, v) {
    const j = r.pick(JOBS), [n] = names(r, 1);
    const fee = new F(Math.round(r.pick(j.fee) * 100), 100), rate = new F(Math.round(r.pick(j.rate) * 100), 100);
    const h = new F(r.pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 6.5, 7.5]) * 10, 10), total = fee.add(rate.mul(h));
    if (100 % total.d) return this.generate(r, v);
    const stem = `${j.who} charges a fixed fee of ${money(fee)} plus ${money(rate)} for each hour of work.`;
    if (v.k === 'cost') {
      return { parts: [{ body: `${stem} ${n} hires them for ${ds(h)} hours. How much does ${n} pay altogether?`, a: GBP.tex(total), w: M(`${ds(h)} \\times ${ds(rate)} = ${ds(rate.mul(h))};\\ ${ds(rate.mul(h))} + ${ds(fee)} = ${ds(total)}`), ...mk(2, GBP), chk: num(`${py(fee)}+${py(h)}*${py(rate)}`, total) }] };
    }
    return { parts: [{ body: `${stem} ${n}'s bill is ${money(total)}. For how many hours did they work?`, a: HRS.tex(h), w: M(`${ds(total)} - ${ds(fee)} = ${ds(total.sub(fee))};\\ ${ds(total.sub(fee))} \\div ${ds(rate)} = ${ds(h)}`), ...mk(2, HRS), chk: num(`(${py(total)}-${py(fee)})/${py(rate)}`, h) }] };
  },
};
