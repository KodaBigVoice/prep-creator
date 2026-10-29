import { PTOPIC, M, F, names, pounds, dstr, valOf, mk, numChk, GBP } from './percentages.js';

export default {
  id: 'pctprob-pay',
  topic: PTOPIC, type: 'Pay, tax and overtime', code: 'PP6',
  levels: ['Core', 'Additional'],
  search: 'pay rise tax overtime income salary percentage worded problem',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'overtime', label: 'overtime paid at a percentage of the usual rate', params: { k: 'ot' }, levels: ['Core'] },
    { id: 'rise-year', label: 'pay rise, then pay for a year', params: { k: 'ry' } },
    { id: 'tax', label: 'tax on earnings above an allowance', params: { k: 'tax' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'ot') {
      const [rate, pc, h] = r.until(() => { const rate = r.pick([8, 10, 12, 14, 15, 16, 18, 20]), pc = r.pick([125, 150, 175, 200]), h = r.int(3, 8); const hr = F.of(rate).mul(pc).div(100); return 100 % hr.d === 0 && hr.d <= 2 ? [rate, pc, h] : null; });
      const hr = F.of(rate).mul(pc).div(100), tot = hr.mul(h);
      return { parts: [{ body: `${n} is paid ${pounds(rate)} for each hour of work. For overtime, ${n} is paid ${pc}% of this rate. How much does ${n} earn for ${h} hours of overtime?`, a: GBP.tex(tot), w: M(`${pc}\\% \\text{ of } ${rate} = ${dstr(hr)};\\ ${dstr(hr)} \\times ${h} = ${dstr(tot)}`), ...mk(2, GBP), chk: numChk(`${rate}*${pc}/100*${h}`, tot) }] };
    }
    if (v.k === 'ry') {
      const [E, p] = r.until(() => { const E = r.pick([1200, 1400, 1500, 1600, 1800, 2000, 2400, 2500]), p = r.pick([2, 3, 4, 5, 6, 10]); return 100 % F.of(E).mul(100 + p).div(100).d === 0 ? [E, p] : null; });
      const mo = F.of(E).mul(100 + p).div(100), yr = mo.mul(12);
      return { parts: [{ body: `${n} earns ${pounds(E)} a month. ${n} gets a pay rise of ${p}%. Work out how much ${n} earns in one year after the pay rise.`, a: GBP.tex(yr), w: M(`${p}\\% \\text{ of } ${E} = ${dstr(valOf(E, p))};\\ ${E} + ${dstr(valOf(E, p))} = ${dstr(mo)};\\ ${dstr(mo)} \\times 12 = ${dstr(yr)}`), ...mk(3, GBP), chk: numChk(`${E}*(100+${p})/100*12`, yr) }] };
    }
    const [E, al] = r.until(() => { const E = r.pick([1500, 1800, 2000, 2200, 2500, 3000, 3500]), al = r.pick([800, 1000, 1200, 1500]); return E > al + 300 ? [E, al] : null; });
    const taxable = E - al, tax = valOf(taxable, 20), left = F.of(E).sub(tax);
    return { parts: [{ body: `${n} earns ${pounds(E)} a month. ${n} pays tax of 20% on all earnings above ${pounds(al)} a month. How much money does ${n} have left each month after paying tax?`, a: GBP.tex(left), w: M(`${E} - ${al} = ${taxable};\\ 20\\% \\text{ of } ${taxable} = ${dstr(tax)};\\ ${E} - ${dstr(tax)} = ${dstr(left)}`), ...mk(3, GBP), chk: numChk(`${E}-(${E}-${al})*20/100`, left) }] };
  },
};
