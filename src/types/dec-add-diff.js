import { TOPIC, F, rd, ds, py, M, mk, num, dpOf, ctxPair, ctxText, ADD_CTX, SUB_CTX } from './decimals.js';

export default {
  id: 'dec-add-diff',
  topic: TOPIC, type: 'Adding and subtracting: different decimal places', code: 'DC3',
  levels: ['Core'],
  search: 'add subtract decimals different decimal places line up the points whole number minus decimal',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'add', label: 'add or subtract:  12.5 + 3.84', params: { k: 'two' } },
    { id: 'whole', label: 'whole number and a decimal:  7 − 2.35', params: { k: 'whole' } },
    { id: 'three', label: 'three terms:  4.2 + 0.85 − 1.6', params: { k: 'three' } },
    { id: 'ctx', label: 'in context: mass, length, volume', params: { ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const op = r.pick(['+', '-']);
      const [da, db] = r.pick([[1, 2], [2, 1], [1, 3], [3, 1], [2, 3]]);
      const x = ctxPair(r, (op === '+' ? ADD_CTX : SUB_CTX).filter(c => !c.money), da, db, op);
      return { parts: [{ verb: '', body: ctxText(r, x), a: x.c.u.tex(x.ans), w: M(`${ds(x.a)} ${op} ${ds(x.b)} = ${ds(x.ans)}`), ...mk(1, x.c.u), chk: num(`${py(x.a)}${op}${py(x.b)}`, x.ans) }] };
    }
    if (v.k === 'whole') {
      const op = r.pick(['-', '-', '+']);
      const [a, b] = r.until(() => {
        const a = new F(r.int(2, 40)), b = rd(r, r.pick([2, 2, 3]), 0.1, Math.max(0.5, op === '-' ? Math.min(a.val - 0.5, 12) : 20));
        return op === '-' && !a.gt(b) ? null : [a, b];
      });
      const [x, y] = op === '+' && r.chance(0.5) ? [b, a] : [a, b];
      const ans = op === '+' ? a.add(b) : a.sub(b);
      return { parts: [{ body: `{{${ds(x)} ${op} ${ds(y)}}}`, a: ds(ans), w: M(`${ds(x)} ${op} ${ds(y)} = ${ds(ans)}`), m: 1, chk: num(`${py(x)}${op}${py(y)}`, ans) }] };
    }
    if (v.k === 'three') {
      const [a, b, c, o1, o2] = r.until(() => {
        const dps = [r.int(1, 2), r.int(1, 2), r.int(1, 3)];
        if (new Set(dps).size < 2) return null;
        const a = rd(r, dps[0], 1, 12), b = rd(r, dps[1], 0.2, 9), c = rd(r, dps[2], 0.2, 9);
        const o1 = r.pick(['+', '+', '-']), o2 = r.pick(['+', '-']);
        let t = o1 === '+' ? a.add(b) : a.sub(b); t = o2 === '+' ? t.add(c) : t.sub(c);
        return t.val > 0.1 && (o1 === '+' || a.gt(b)) ? [a, b, c, o1, o2] : null;
      });
      let ans = o1 === '+' ? a.add(b) : a.sub(b); const mid = ans; ans = o2 === '+' ? ans.add(c) : ans.sub(c);
      const q = `${ds(a)} ${o1} ${ds(b)} ${o2} ${ds(c)}`;
      return { parts: [{ body: `{{${q}}}`, a: ds(ans), w: M(`${ds(a)} ${o1} ${ds(b)} = ${ds(mid)};\\ ${ds(mid)} ${o2} ${ds(c)} = ${ds(ans)}`), m: 2, lines: 4, chk: num(`${py(a)}${o1}${py(b)}${o2}${py(c)}`, ans) }] };
    }
    const op = r.pick(['+', '+', '-']);
    const [a, b] = r.until(() => {
      const da = r.int(1, 3), db = r.int(1, 3);
      if (da === db) return null;
      const a = rd(r, da, op === '+' ? 1 : 3, 40), b = rd(r, db, 0.2, op === '+' ? 20 : 25);
      return op === '-' && !a.gt(b) ? null : [a, b];
    });
    const ans = op === '+' ? a.add(b) : a.sub(b);
    const pad = Math.max(dpOf(a), dpOf(b)), padded = (f) => f.val.toFixed(pad);
    return { parts: [{ body: `{{${ds(a)} ${op} ${ds(b)}}}`, a: ds(ans), w: M(`${padded(a)} ${op} ${padded(b)} = ${ds(ans)}`), m: 1, chk: num(`${py(a)}${op}${py(b)}`, ans) }] };
  },
};
