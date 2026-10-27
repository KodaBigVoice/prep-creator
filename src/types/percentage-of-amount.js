import { names, pounds, poundsTex } from '../core/q.js';
import { plainNum } from '../core/frac.js';

const CTX = [
  (r, p, A, v) => { const [n] = names(r, 1); return [`A school has ${plainNum(A)} pupils. ${p}% of the pupils walk to school. How many pupils walk to school?`, `${v}`]; },
  (r, p, A, v) => [`A concert hall has ${plainNum(A)} seats. ${p}% of the seats are in the balcony. How many seats are in the balcony?`, `${v}`],
  (r, p, A, v) => [`A bag of flour has a mass of ${plainNum(A)} g. A recipe uses ${p}% of the flour. What mass of flour does the recipe use?`, `${v}\\text{ g}`],
  (r, p, A, v) => { const [n] = names(r, 1); return [`${n} has a bonus of ${pounds(A)} and saves ${p}% of it. How much does ${n} save?`, poundsTex(v)]; },
];
export default {
  id: 'percentage-of-amount',
  topic: 'Percentages (non-calc)', type: 'Percentage of an amount', code: 'PAMT',
  levels: ['Foundation', 'Core'],
  search: 'percent of an amount 15% of non-calculator',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'plain', label: 'percentage of an amount', params: { worded: false } },
    { id: 'worded', label: 'worded', params: { worded: true } },
  ],
  generate(r, v) {
    const [p, A] = r.until(() => {
      const p = r.pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80, 90, 12.5, 2.5]);
      const A = r.pick([40, 60, 80, 120, 160, 180, 200, 240, 280, 320, 360, 400, 480, 520, 640, 800]);
      const val = A * p / 100;
      return Number.isInteger(val * 4) && (p % 5 === 0 || A % 8 === 0) ? [p, A] : null;
    });
    const val = A * p / 100;
    const w = `10\\% = ${A / 10};\\ ${p}\\% = ${val}`;
    if (!v.worded) {
      const money = r.chance(0.4);
      return { parts: [{ body: `Work out ${p}% of ${money ? pounds(A) : plainNum(A)}.`, a: money ? poundsTex(val) : String(val), w: `{{${w}}}`, chk: { k: 'num', val: String(val), expr: `${A}*${p}/100` } }] };
    }
    const [text, ans] = r.pick(CTX)(r, p, A, val);
    return { parts: [{ body: text, a: ans.startsWith('\\') || ans.includes('text') ? ans : ans, w: `{{${w}}}`, chk: { k: 'num', val: String(val), expr: `${A}*${p}/100` } }] };
  },
};
