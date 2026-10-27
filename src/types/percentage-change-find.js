import { names, pounds } from '../core/q.js';

export default {
  id: 'percentage-change-find',
  topic: 'Percentage change', type: 'Find the percentage change / profit', code: 'PPCT',
  levels: ['Core', 'Additional'],
  search: 'percentage increase percentage decrease profit loss find the percentage',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'profit', label: 'percentage profit', params: { k: 'profit' } },
    { id: 'increase', label: 'percentage increase', params: { k: 'inc' } },
    { id: 'decrease', label: 'percentage decrease', params: { k: 'dec' } },
  ],
  generate(r, v) {
    const [A, p] = r.until(() => {
      const A = r.pick([20, 40, 50, 60, 80, 120, 150, 200, 250, 400, 500, 800]);
      const p = r.pick([5, 10, 12, 15, 20, 25, 30, 40, 50, 60]);
      const B = A * (v.k === 'dec' ? 100 - p : 100 + p) / 100;
      return Number.isInteger(B) && B > 0 ? [A, p] : null;
    });
    const B = A * (v.k === 'dec' ? 100 - p : 100 + p) / 100;
    const [nm] = names(r, 1);
    let text, w;
    if (v.k === 'profit') {
      const item = r.pick(['bike', 'games console', 'guitar', 'antique clock', 'painting', 'camera']);
      text = `${nm} buys a second-hand ${item} for ${pounds(A)} and sells it for ${pounds(B)}. Work out ${nm}'s percentage profit.`;
      w = `\\text{profit} = ${B - A};\\ \\dfrac{${B - A}}{${A}} \\times 100 = ${p}\\%`;
    } else if (v.k === 'inc') {
      const th = r.pick([['The number of members of a club', 'rose from', 'to'], ['The population of a village', 'rose from', 'to'], ['The price of a season ticket', 'went up from', 'to']]);
      const money = th[0].includes('price');
      text = `${th[0]} ${th[1]} ${money ? pounds(A) : A} ${th[2]} ${money ? pounds(B) : B}. Work out the percentage increase.`;
      w = `${B - A};\\ \\dfrac{${B - A}}{${A}} \\times 100 = ${p}\\%`;
    } else {
      text = `A phone costs ${pounds(A)}. In a sale its price is reduced to ${pounds(B)}. Work out the percentage reduction.`;
      w = `${A - B};\\ \\dfrac{${A - B}}{${A}} \\times 100 = ${p}\\%`;
    }
    return { parts: [{ body: text, a: `${p}\\%`, w: `{{${w}}}`, chk: { k: 'num', val: String(p), expr: v.k === 'dec' ? `(${A}-${B})/${A}*100` : `(${B}-${A})/${A}*100` } }] };
  },
};
