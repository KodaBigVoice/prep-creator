import { TOPIC, F, rd, ds, py, M, mk, num, ctxPair, ctxText, ADD_CTX, SUB_CTX } from './decimals.js';

export default {
  id: 'dec-add-same',
  topic: TOPIC, type: 'Adding and subtracting: same decimal places', code: 'DC2',
  levels: ['Foundation', 'Core'],
  search: 'add subtract decimals tenths hundredths worded money mass length',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'add1', label: 'add tenths:  2.4 + 3.7', params: { dp: 1, op: '+' } },
    { id: 'sub1', label: 'subtract tenths:  8.6 − 3.9', params: { dp: 1, op: '-' } },
    { id: 'hund', label: 'add or subtract hundredths:  0.45 + 0.37', params: { dp: 2, op: 'either' } },
    { id: 'ctx', label: 'in context: mass, length, money', params: { ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const op = r.pick(['+', '-']), dp = r.pick([1, 2]);
      const x = ctxPair(r, op === '+' ? ADD_CTX : SUB_CTX, dp, dp, op);
      const sym = op === '+' ? '+' : '-';
      return { parts: [{ verb: '', body: ctxText(r, x), a: x.c.u.tex(x.ans), w: M(`${ds(x.a)} ${sym} ${ds(x.b)} = ${ds(x.ans)}`), ...mk(1, x.c.u), chk: num(`${py(x.a)}${sym}${py(x.b)}`, x.ans) }] };
    }
    const op = v.op === 'either' ? r.pick(['+', '-']) : v.op;
    const [a, b] = r.until(() => {
      const a = rd(r, v.dp, op === '+' ? 0.5 : 2, v.dp === 1 ? (op === '+' ? 20 : 25) : 10), b = rd(r, v.dp, 0.5, v.dp === 1 ? 20 : 9);
      if (op === '-') return a.gt(b) && a.sub(b).val >= 0.1 && ((v.dp === 1 && a.mul(10).n % 10 < b.mul(10).n % 10) || r.chance(0.35)) ? [a, b] : null;
      return [a, b];
    });
    const ans = op === '+' ? a.add(b) : a.sub(b);
    return { parts: [{ body: `{{${ds(a)} ${op === '+' ? '+' : '-'} ${ds(b)}}}`, a: ds(ans), w: M(`${ds(a)} ${op === '+' ? '+' : '-'} ${ds(b)} = ${ds(ans)}`), m: 1, chk: num(`${py(a)}${op}${py(b)}`, ans) }] };
  },
};
