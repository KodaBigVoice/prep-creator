import { TOPIC, M, valOf, wCalc, mk, pickCtx, ctxQuestion, PLAIN_UNITS, numChk, pounds, GBP, KG, G, MET, CM, KM, LIT, ML } from './percentages.js';

const NON5 = []; for (let p = 3; p <= 97; p++) if (p % 5 !== 0) NON5.push(p);
const DEC = [0.5, 1.5, 2.5, 3.5, 4.5, 6.5, 7.5, 8.5];
const U_CALC = [KG, G, MET, CM, KM, LIT, ML];

export default {
  id: 'pct-calc',
  topic: TOPIC, type: 'Percentage of an amount, calculator', code: 'PC4',
  levels: ['Core'],
  search: 'percentage of an amount calculator 23% of 640 17% of £256 4.5% to the penny units',
  verb: '', marks: 2, lines: 3, calc: true,
  variants: [
    { id: 'whole', label: 'any percentage of an amount:  23% of 640 kg', params: { k: 'whole' } },
    { id: 'money', label: 'money, to the penny:  17% of £256', params: { k: 'money' } },
    { id: 'ctx', label: 'any percentage, in context', params: { k: 'ctx' } },
    { id: 'decimal', label: 'decimal percentage:  4.5% of £372', params: { k: 'decimal' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    if (v.k === 'ctx') {
      const x = pickCtx(r, NON5, (val, p, A) => A % 10 === 0 || A % 4 === 0);
      return { parts: [{ body: ctxQuestion(r, x), a: x.c.u.tex(x.val), w: M(wCalc(x.A, x.p, x.val)), calc: true, ...mk(2, x.c.u), chk: numChk(`${x.A}*${x.p}/100`, x.val) }] };
    }
    if (v.k === 'whole') {
      const [p, A] = r.until(() => { const p = r.pick(NON5), A = r.int(5, 90) * 10, val = valOf(A, p); return 10 % val.d === 0 ? [p, A] : null; });
      const u = r.chance(0.35) ? GBP : r.pick(U_CALC), val = valOf(A, p);
      return { parts: [{ body: `Calculate ${p}% of ${u.txt(A)}.`, a: u.tex(val), w: M(wCalc(A, p, val)), calc: true, ...mk(2, u), chk: numChk(`${A}*${p}/100`, val) }] };
    }
    const p = r.pick(v.k === 'money' ? NON5 : DEC);
    const A = r.until(() => { const A = r.int(12, 98) * (v.k === 'money' ? 10 : 10) + (v.k === 'money' ? r.int(0, 9) : 2 * r.int(0, 4)); return v.k === 'money' || A % 2 === 0 ? A : null; });
    const val = valOf(A, p);
    return { parts: [{ body: `Calculate ${p}% of ${pounds(A)}.`, a: GBP.tex(val), w: M(wCalc(A, p, val)), calc: true, ...mk(2, GBP), chk: numChk(`${A}*${p}/100`, val) }] };
  },
};
