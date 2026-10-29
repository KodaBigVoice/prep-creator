import { TOPIC, M, valOf, wOf, mk, pickCtx, ctxQuestion, PLAIN_UNITS, VERBS, numChk, pounds, GBP, names } from './percentages.js';

const A8 = [16, 24, 32, 40, 48, 56, 64, 72, 80, 96, 120, 160, 200, 240, 320, 400];
const A40 = [40, 80, 120, 160, 200, 240, 280, 320, 400];
const OVER = [110, 120, 125, 130, 150, 175, 200, 250];

export default {
  id: 'pct-harder',
  topic: TOPIC, type: 'Percentage of an amount: harder, no calculator', code: 'PC3',
  levels: ['Core'],
  search: 'percentage of an amount pence 15% of £64 12.5% 17.5% 2.5% over 100% 150% non-calculator',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'pence', label: 'money that gives pence:  15% of £64', params: { k: 'pence' } },
    { id: 'ctx', label: 'money that gives pence, in context', params: { k: 'ctx' } },
    { id: 'over', label: 'over 100%:  150% of an amount', params: { k: 'over' } },
    { id: 'eighth', label: '12.5% of an amount', params: { k: 'eighth' }, levels: ['Additional'] },
    { id: 'twohalf', label: '2.5% of an amount', params: { k: 'twohalf' }, levels: ['Additional'] },
    { id: 'seventeen', label: '17.5% of an amount', params: { k: 'seventeen' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    if (v.k === 'ctx' || v.k === 'pence') {
      const ps = [5, 15, 20, 30, 35, 45, 60, 65, 75], u = GBP;
      if (v.k === 'ctx') {
        const x = r.until(() => { const y = pickCtx(r, ps, (val, p, A, c) => c.u.money && !val.isInt && A % 20 !== 0 && val.d <= 10); return y.c.u.money ? y : null; });
        return { parts: [{ body: ctxQuestion(r, x), a: GBP.tex(x.val), w: M(wOf(x.A, x.p, x.val)), ...mk(2, GBP), chk: numChk(`${x.A}*${x.p}/100`, x.val) }] };
      }
      const [p, A] = r.until(() => { const p = r.pick(ps), A = r.int(12, 98), val = valOf(A, p); return !val.isInt && A % 20 !== 0 && 100 % val.d === 0 && val.d <= 10 ? [p, A] : null; });
      const val = valOf(A, p);
      return { parts: [{ body: `${r.pick(VERBS)} ${p}% of ${pounds(A)}.`, a: GBP.tex(val), w: M(wOf(A, p, val)), ...mk(2, GBP), chk: numChk(`${A}*${p}/100`, val) }] };
    }
    if (v.k === 'over') {
      const p = r.pick(OVER);
      if (r.chance(0.5)) {
        const x = pickCtx(r, [p], (val) => val.isInt || val.d === 2, undefined);
        return { parts: [{ body: ctxQuestion(r, x), a: x.c.u.tex(x.val), w: M(wOf(x.A, x.p, x.val)), ...mk(2, x.c.u), chk: numChk(`${x.A}*${x.p}/100`, x.val) }] };
      }
      const A = r.pick(A40), u = r.pick(PLAIN_UNITS), val = valOf(A, p);
      return { parts: [{ body: `${r.pick(VERBS)} ${p}% of ${u.txt(A)}.`, a: u.tex(val), w: M(wOf(A, p, val)), ...mk(2, u), chk: numChk(`${A}*${p}/100`, val) }] };
    }
    const p = { eighth: 12.5, twohalf: 2.5, seventeen: 17.5 }[v.k];
    const A = r.pick(v.k === 'eighth' ? A8 : A40), u = r.pick(PLAIN_UNITS), val = valOf(A, p);
    return { parts: [{ body: `${r.pick(VERBS)} ${p}% of ${u.txt(A)}.`, a: u.tex(val), w: M(wOf(A, p, val)), ...mk(v.k === 'seventeen' ? 3 : 2, u), chk: numChk(`${A}*${p}/100`, val) }] };
  },
};
