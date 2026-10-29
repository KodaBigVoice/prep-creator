import { PTOPIC, M, F, names, pounds, GBP, ratioOf, sumOf, mk, dstr, nameList } from './ratio.js';

export default {
  id: 'rpprob-decimal',
  topic: PTOPIC, type: 'Sharing in a ratio with decimals', code: 'RQ3',
  levels: ['Additional'],
  search: 'share money in a ratio pounds and pence decimals',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'two', label: 'two people share an amount with pence', params: { k: 2 } },
    { id: 'three', label: 'three people share an amount with pence', params: { k: 3 } },
  ],
  generate(r, v) {
    const ratio = ratioOf(r, v.k, { max: 6, maxSum: v.k === 3 ? 12 : 10 }), sum = sumOf(ratio), ns = names(r, v.k);
    const [total, unit] = r.until(() => {
      const unitP = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 75, 80, 90, 120, 125, 150, 175, 225, 250]), tot = new F(sum * unitP, 100);
      if (tot.val < 3 || tot.val > 60 || (tot.isInt)) return null;
      return [tot, new F(unitP, 100)];
    });
    const shares = ratio.map(x => unit.mul(x));
    const ans = ns.map((n, i) => `\\text{${n}: }${GBP.tex(shares[i])}`).join(',\\ ');
    return { parts: [{ body: `${nameList(ns)} share ${pounds(total.val)} in the ratio ${ratio.join(' : ')}. How much does each person receive?`, a: ans, w: M(`${dstr(total)} \\div ${sum} = ${dstr(unit)};\\ ` + ratio.map((x, i) => `${x} \\times ${dstr(unit)} = ${dstr(shares[i])}`).join(',\\ ')), ...mk(3, GBP), chk: { k: 'num', expr: `[${ratio.map(x => `Fraction('${dstr(total)}')/${sum}*${x}`).join(',')}]`, val: shares.map(dstr).join(',') } }] };
  },
};
