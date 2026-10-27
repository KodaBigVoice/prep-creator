import { F } from '../core/frac.js';
import { names, pounds, poundsTex } from '../core/q.js';

export default {
  id: 'compound-interest',
  topic: 'Compound interest', type: 'Compound / successive percentage change', code: 'PCOMP',
  levels: ['Additional'],
  search: 'compound interest successive percentage growth decay',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'interest', label: 'compound interest (2 to 4 years)', params: { k: 'int' } },
    { id: 'depreciation', label: 'depreciation (successive decreases)', params: { k: 'dep' } },
  ],
  generate(r, v) {
    const dir = v.k === 'int' ? 1 : -1;
    const [P, p, n] = r.until(() => [r.pick([500, 800, 1000, 1500, 2000, 2500, 4000, 5000]), r.pick([2, 3, 4, 5, 6, 8, 10]), r.int(2, 4)]);
    const f = new F(100 + dir * p, 100).pow(n).mul(P);
    const val = Math.round(f.val * 100) / 100;
    const [nm] = names(r, 1);
    const dbase = r.pick([8000, 12000, 15000, 18000, 20000, 25000]);
    const text = v.k === 'int'
      ? `${nm} invests ${pounds(P)} in a savings account. The account pays ${p}% compound interest per year. Calculate the value of the investment after ${n} years.`
      : `A new car is worth ${pounds(dbase)}. Its value falls by ${p}% each year. Calculate its value after ${n} years.`;
    const base = v.k === 'int' ? P : dbase;
    const f2 = new F(100 + dir * p, 100).pow(n).mul(base);
    const val2 = Math.round(f2.val * 100) / 100;
    const mult = (100 + dir * p) / 100;
    return { parts: [{ body: text, a: poundsTex(val2), w: `{{${base} \\times ${mult}^{${n}} = ${poundsTex(val2).replace('\\pounds ', '')}}}`, calc: true,
      chk: { k: 'num', val: String(val2), expr: `${base}*(${100 + dir * p}/100)**${n}`, dp: 2 } }] };
  },
};
