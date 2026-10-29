import { TOPIC, M, F, names, pounds, poundsTex, dstr, mk, numChk, GBP, YRS, rnd, tie } from './percentages.js';

export default {
  id: 'pct-compound-find',
  topic: TOPIC, type: 'Compound interest: finding a time or a rate', code: 'PC12',
  levels: ['Further'],
  search: 'compound interest how many years annual rate trial and improvement root',
  verb: '', marks: 4, lines: 8, calc: true,
  variants: [
    { id: 'years', label: 'how many years to reach a target', params: { k: 'years' } },
    { id: 'rate', label: 'find the annual rate', params: { k: 'rate' } },
  ],
  generate(r, v) {
    const [nm] = names(r, 1);
    if (v.k === 'rate') {
      const [P, p, n, A] = r.until(() => {
        const P = r.pick([500, 800, 1000, 1500, 2000, 2500, 4000, 5000, 8000, 10000]), p = r.pick([2, 3, 4, 5, 6, 8, 10]), n = r.pick([2, 2, 3]);
        const A = F.of(P).mul(new F(100 + p, 100).pow(n));
        return 100 % A.d === 0 ? [P, p, n, A] : null;
      });
      return { parts: [{ body: `${nm} invests ${pounds(P)} in a savings account. The account pays compound interest at a fixed rate each year. After ${n} years the investment is worth ${pounds(A.val)}. Work out the annual rate of interest.`, a: `${p}\\%`, w: M(`${dstr(A)} \\div ${P} = ${dstr(A.div(P))};\\ ${n === 2 ? '\\sqrt{' + dstr(A.div(P)) + '}' : '\\sqrt[3]{' + dstr(A.div(P)) + '}'} = ${dstr(new F(100 + p, 100))}`), calc: true, ...mk(3), chk: numChk(`(${dstr(A)}/${P})**(1/${n})*100-100`, p, { dp: 6 }) }] };
    }
    const [P, p, n, T] = r.until(() => {
      const P = r.pick([500, 800, 1000, 1200, 2000, 2500, 4000, 5000]), p = r.pick([3, 4, 5, 6, 8, 10]), n = r.int(3, 9);
      const mult = new F(100 + p, 100), lo = F.of(P).mul(mult.pow(n - 1)), hi = F.of(P).mul(mult.pow(n));
      const step = hi.val > 6000 ? 500 : hi.val > 2500 ? 250 : 100;
      const T = Math.ceil(lo.val / step + 0.0001) * step;                    // a round target between the two years
      return T > lo.val * 1.004 && T < hi.val * 0.996 ? [P, p, n, T] : null;
    });
    return { parts: [{ body: `${nm} invests ${pounds(P)} in a savings account. The account pays ${p}% compound interest per year. Work out the smallest number of whole years until the investment is worth more than ${pounds(T)}.`, a: YRS.tex(n), w: M(`\\text{after } ${n - 1} \\text{ years: } ${poundsTex(Math.round(P * (1 + p / 100) ** (n - 1) * 100) / 100).replace('\\pounds ', '')};\\ \\text{after } ${n} \\text{ years: } ${poundsTex(Math.round(P * (1 + p / 100) ** n * 100) / 100).replace('\\pounds ', '')}`), calc: true, ...mk(3, YRS), chk: numChk(`len([k for k in range(1,60) if ${P}*(1+${p}/100)**k <= ${T}])+1`, n) }] };
  },
};
