import { TOPIC, M, valOf, wOf, mk, pickCtx, ctxQuestion, PLAIN_UNITS, VERBS, numChk } from './percentages.js';

const A10 = [30, 40, 50, 60, 70, 80, 90, 120, 150, 160, 200, 240, 250, 300, 350, 400, 450, 500];
const A20 = [40, 60, 80, 120, 140, 160, 200, 240, 280, 320, 360, 400, 480, 520, 640];
const A100 = [100, 200, 300, 400, 500, 600, 700, 800, 900];

export default {
  id: 'pct-buildup',
  topic: TOPIC, type: 'Percentage of an amount: build up', code: 'PC2',
  levels: ['Foundation', 'Core'],
  search: 'percentage of an amount 20% 5% 35% 1% 10% build up non-calculator units',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'tens', label: 'multiples of 10%:  20%, 30%, 60% of an amount', params: { ps: [20, 30, 40, 60, 70, 80, 90], As: A10 } },
    { id: 'five', label: '5% of an amount', params: { ps: [5], As: A10 } },
    { id: 'fives', label: '15%, 35%, 45%… of an amount', params: { ps: [15, 35, 45, 55, 65, 85, 95], As: A20 } },
    { id: 'one', label: '1%, 2%, 3%… of an amount', params: { ps: [1, 2, 3, 4, 6, 7, 8, 9], As: A100 } },
    { id: 'ctx', label: 'multiples of 5% in context', params: { ps: [5, 15, 20, 30, 35, 40, 45, 60, 65, 70, 80, 90], ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const x = pickCtx(r, v.ps, (val, p, A) => val.isInt && A % 20 === 0);
      return { parts: [{ body: ctxQuestion(r, x), a: x.c.u.tex(x.val), w: M(wOf(x.A, x.p, x.val)), ...mk(2, x.c.u), chk: numChk(`${x.A}*${x.p}/100`, x.val) }] };
    }
    const p = r.pick(v.ps), A = r.pick(v.As), u = r.pick(PLAIN_UNITS), val = valOf(A, p);
    return { parts: [{ body: `${r.pick(VERBS)} ${p}% of ${u.txt(A)}.`, a: u.tex(val), w: M(wOf(A, p, val)), ...mk(2, u), chk: numChk(`${A}*${p}/100`, val) }] };
  },
};
