import { TOPIC, F, rd, ds, py, M, num, dpOf } from './decimals.js';

const SQ = '\\square';
export default {
  id: 'dec-missing',
  topic: TOPIC, type: 'Missing numbers', code: 'DC14',
  levels: ['Core'],
  search: 'missing number decimals inverse operation box addition multiplication division',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'add', label: 'addition or subtraction:  □ + 3.7 = 5.12', params: { k: 'add' } },
    { id: 'mult', label: 'multiplication:  0.6 × □ = 0.18', params: { k: 'mult' }, levels: ['Core', 'Additional'] },
    { id: 'div', label: 'division:  8 ÷ □ = 0.4', params: { k: 'div' }, levels: ['Core', 'Additional'] },
  ],
  generate(r, v) {
    let eq, x, expr, w;
    if (v.k === 'add') {
      const [a, b] = r.until(() => { const a = rd(r, r.int(1, 2), 0.5, 12), b = rd(r, r.int(1, 2), 1, 20); return new Set([dpOf(a), dpOf(b)]).size === 2 || r.chance(0.3) ? [a, b] : null; });
      const big = a.add(b), forms = [
        [`${SQ} + ${ds(a)} = ${ds(big)}`, b, `${py(big)}-${py(a)}`, `${ds(big)} - ${ds(a)} = ${ds(b)}`],
        [`${ds(a)} + ${SQ} = ${ds(big)}`, b, `${py(big)}-${py(a)}`, `${ds(big)} - ${ds(a)} = ${ds(b)}`],
        [`${SQ} - ${ds(a)} = ${ds(b)}`, big, `${py(b)}+${py(a)}`, `${ds(b)} + ${ds(a)} = ${ds(big)}`],
        [`${ds(big)} - ${SQ} = ${ds(a)}`, b, `${py(big)}-${py(a)}`, `${ds(big)} - ${ds(a)} = ${ds(b)}`],
      ];
      [eq, x, expr, w] = r.pick(forms);
    } else if (v.k === 'mult') {
      const [a, q] = r.until(() => { const a = rd(r, r.int(1, 2), 0.2, 9), q = rd(r, r.int(0, 2), 0.2, 12); return dpOf(a.mul(q)) <= 3 && !q.eq(1) ? [a, q] : null; });
      const p = a.mul(q);
      eq = r.chance(0.5) ? `${ds(a)} \\times ${SQ} = ${ds(p)}` : `${SQ} \\times ${ds(a)} = ${ds(p)}`; x = q; expr = `${py(p)}/${py(a)}`; w = `${ds(p)} \\div ${ds(a)} = ${ds(q)}`;
    } else {
      const form = r.pick(['top', 'bottom']);
      const [a, q] = r.until(() => { const a = rd(r, r.int(0, 2), 0.5, 40), q = rd(r, r.int(0, 2), 0.1, 12); return !q.eq(1) && dpOf(a.mul(q)) <= 3 && !a.eq(q) ? [a, q] : null; });
      if (form === 'top') { const p = a.mul(q); eq = `${SQ} \\div ${ds(a)} = ${ds(q)}`; x = p; expr = `${py(q)}*${py(a)}`; w = `${ds(q)} \\times ${ds(a)} = ${ds(p)}`; }
      else { const big = a.mul(q); eq = `${ds(big)} \\div ${SQ} = ${ds(q)}`; x = a; expr = `${py(big)}/${py(q)}`; w = `${ds(big)} \\div ${ds(q)} = ${ds(a)}`; }
    }
    if (dpOf(x) > 4) return this.generate(r, v);
    return { parts: [{ body: `Find the missing number: {{${eq}}}`, a: ds(x), w: M(w), m: 1, chk: num(expr, x) }] };
  },
};
