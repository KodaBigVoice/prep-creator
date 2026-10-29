import { TOPIC, M, F, valOf, dstr, wOf, mk, pickCtx, ctxQuestion, PLAIN_UNITS, VERBS, numChk } from './percentages.js';

const AMOUNTS = { 50: [24, 36, 48, 60, 80, 90, 120, 150, 180, 240, 300, 500], 25: [24, 36, 40, 60, 80, 120, 160, 200, 240, 280, 320, 400], 75: [24, 40, 60, 80, 120, 160, 200, 240, 320, 400], 10: [30, 40, 60, 70, 90, 120, 150, 200, 250, 350, 400, 500] };

export default {
  id: 'pct-benchmark',
  topic: TOPIC, type: 'Benchmark percentages', code: 'PC1',
  levels: ['Foundation', 'Core'],
  search: 'percentage of an amount 50% 25% 10% 75% half quarter tenth non-calculator units',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'half', label: '50% of an amount', params: { ps: [50] } },
    { id: 'tenth', label: '10% of an amount', params: { ps: [10] } },
    { id: 'quarter', label: '25% of an amount', params: { ps: [25] } },
    { id: 'threeq', label: '75% of an amount', params: { ps: [75] } },
    { id: 'ctx', label: '50%, 25%, 10% or 75%, in context', params: { ps: [50, 25, 10, 75], ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const x = pickCtx(r, v.ps, (val) => val.isInt);
      return { parts: [{ body: ctxQuestion(r, x), a: x.c.u.tex(x.val), w: M(wOf(x.A, x.p, x.val)), ...mk(1, x.c.u), chk: numChk(`${x.A}*${x.p}/100`, x.val) }] };
    }
    const p = v.ps[0], A = r.pick(AMOUNTS[p]), u = r.pick(PLAIN_UNITS), val = valOf(A, p);
    return { parts: [{ body: `${r.pick(VERBS)} ${p}% of ${u.txt(A)}.`, a: u.tex(val), w: M(wOf(A, p, val)), ...mk(1, u), chk: numChk(`${A}*${p}/100`, val) }] };
  },
};
