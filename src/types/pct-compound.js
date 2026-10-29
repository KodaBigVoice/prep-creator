import { TOPIC, M, F, names, pounds, poundsTex, dstr, mk, numChk, GBP, rnd, tie } from './percentages.js';

const PRINC = [200, 300, 500, 800, 1000, 1200, 1500, 2000, 2500, 4000, 5000];
const RATES = [2, 3, 4, 5, 6, 8, 10];
const CARS = [8000, 10000, 12000, 15000, 18000, 20000, 25000];
const THINGS = [['car', 'A new car'], ['motorbike', 'A new motorbike'], ['van', 'A new van'], ['caravan', 'A new caravan']];
const pcs = (f, dp = 2) => F.of(f);

export default {
  id: 'pct-compound',
  topic: TOPIC, type: 'Compound interest and repeated change', code: 'PC10',
  levels: ['Additional'],
  search: 'compound interest successive percentage growth decay depreciation year by year multiplier power calculator',
  verb: '', marks: 2, lines: 4, calc: true,
  variants: [
    { id: 'two-step', label: 'two years, year by year (two parts)', params: { k: 'two' }, multipart: true },
    { id: 'interest', label: 'compound interest, 2 to 4 years', params: { k: 'int' } },
    { id: 'depreciation', label: 'depreciation, successive decreases', params: { k: 'dep' } },
  ],
  generate(r, v) {
    const [nm] = names(r, 1);
    if (v.k === 'two') {
      const P = r.pick(PRINC), p = r.pick(RATES);
      const i1 = F.of(P).mul(p).div(100), y1 = F.of(P).add(i1), i2 = y1.mul(p).div(100), y2 = y1.add(i2);
      if (100 % y2.d) return this.generate(r, v);
      const stem = `${nm} invests ${pounds(P)} in a savings account. The account pays ${p}% compound interest per year.`;
      return { stem, parts: [
        { body: `Work out the interest ${nm} earns in the first year.`, a: GBP.tex(i1), w: M(`${p}\\% \\text{ of } ${P} = ${dstr(i1)}`), calc: true, ...mk(1, GBP), chk: numChk(`${P}*${p}/100`, i1) },
        { body: `Work out the total value of the investment at the end of the second year.`, a: GBP.tex(y2), w: M(`${dstr(y1)} \\times ${dstr(new F(100 + p, 100))} = ${dstr(y2)}`), calc: true, ...mk(2, GBP), chk: numChk(`${P}*(1+${p}/100)**2`, y2) },
      ] };
    }
    const dir = v.k === 'int' ? 1 : -1;
    const [P, p, n] = r.until(() => {
      const P = v.k === 'int' ? r.pick(PRINC) : r.pick(CARS), p = r.pick(RATES), n = r.int(2, 4);
      const f = F.of(P).mul(new F(100 + dir * p, 100).pow(n));
      return v.k === 'int' ? (!tie(f, 2) ? [P, p, n] : null) : (!tie(f, 0) ? [P, p, n] : null);
    });
    const f = F.of(P).mul(new F(100 + dir * p, 100).pow(n)), dp = v.k === 'int' ? 2 : 0;
    const ans = rnd(f, dp), mult = dstr(new F(100 + dir * p, 100));
    let text;
    if (v.k === 'int') text = `${nm} invests ${pounds(P)} in a savings account. The account pays ${p}% compound interest per year. Calculate the value of the investment after ${n} years.`;
    else { const [t, T] = r.pick(THINGS); text = `${T} is worth ${pounds(P)}. Its value falls by ${p}% each year. Work out the value of the ${t} after ${n} years. Give your answer to the nearest pound.`; }
    const tex = GBP.tex(ans);
    return { parts: [{ body: text, a: tex, w: M(`${P} \\times ${mult}^{${n}} = ${tex.replace('\\pounds ', '').replace(/\{,\}/g, '')}`), calc: true, ...mk(2, GBP), chk: numChk(`${P}*(${100 + dir * p}/100)**${n}`, ans, { dp }) }] };
  },
};
