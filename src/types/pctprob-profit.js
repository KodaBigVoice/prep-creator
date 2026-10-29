import { PTOPIC, M, F, an, An, names, pounds, dstr, valOf, mk, numChk, GBP } from './percentages.js';

const ITEMS = [{ name: 'bicycle', cs: [60, 80, 100, 120, 150, 200, 240] }, { name: 'games console', cs: [40, 50, 60, 80, 100, 120, 150, 200] }, { name: 'guitar', cs: [60, 80, 100, 120, 150, 200, 240] }, { name: 'antique clock', cs: [40, 50, 60, 80, 100, 120, 150, 200, 240] }, { name: 'painting', cs: [50, 80, 100, 120, 150, 200, 240] }, { name: 'camera', cs: [60, 80, 100, 120, 150, 200, 240] }, { name: 'skateboard', cs: [20, 30, 40, 50, 60, 80] }, { name: 'vase', cs: [20, 30, 40, 50, 60, 80, 100] }, { name: 'record player', cs: [40, 50, 60, 80, 100, 120] }];

export default {
  id: 'pctprob-profit',
  topic: PTOPIC, type: 'Profit, loss and selling price', code: 'PP8',
  levels: ['Additional'],
  search: 'profit loss selling price cost price percentage profit worded problem',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'sell', label: 'selling price after a percentage profit', params: { k: 'sell', dir: 1 } },
    { id: 'loss', label: 'selling price after a percentage loss', params: { k: 'sell', dir: -1 } },
    { id: 'cost', label: 'find the cost price from a profit', params: { k: 'cost' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1), it = r.pick(ITEMS), item = it.name;
    if (v.k === 'sell') {
      const [C, p] = r.until(() => { const C = r.pick(it.cs), p = r.pick([10, 15, 20, 25, 30, 35, 40, 50]); const f = F.of(C).mul(100 + v.dir * p).div(100); return 100 % f.d === 0 ? [C, p] : null; });
      const S = F.of(C).mul(100 + v.dir * p).div(100), ch = valOf(C, p);
      const word = v.dir > 0 ? 'profit' : 'loss';
      return { parts: [{ body: `${n} buys ${an(item)} for ${pounds(C)} and sells it at a ${word} of ${p}%. Work out the selling price of the ${item}.`, a: GBP.tex(S), w: M(`${p}\\% \\text{ of } ${C} = ${dstr(ch)};\\ ${C} ${v.dir > 0 ? '+' : '-'} ${dstr(ch)} = ${dstr(S)}`), ...mk(2, GBP), chk: numChk(`${C}*(100+${v.dir * p})/100`, S) }] };
    }
    const [C, p] = r.until(() => { const C = r.pick(it.cs), p = r.pick([10, 20, 25, 30, 40, 50, 60, 15, 35]); const S = F.of(C).mul(100 + p).div(100); return 100 % S.d === 0 ? [C, p] : null; });
    const S = F.of(C).mul(100 + p).div(100);
    return { parts: [{ body: `${n} sells ${an(item)} for ${pounds(S.val)}. This gives ${n} a profit of ${p}% on the price that ${n} paid for it. How much did ${n} pay for the ${item}?`, a: GBP.tex(C), w: M(`${100 + p}\\% \\to ${dstr(S)};\\ 1\\% \\to ${dstr(S.div(100 + p))};\\ 100\\% \\to ${C}`), ...mk(3, GBP), chk: numChk(`${dstr(S)}/(100+${p})*100`, C) }] };
  },
};
