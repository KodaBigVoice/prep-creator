import { TOPIC, F, rd, ds, py, M, num, dpOf, rnd, tie } from './decimals.js';

export default {
  id: 'dec-calc',
  topic: TOPIC, type: 'Decimals with a calculator', code: 'DC18',
  levels: ['Core', 'Additional'],
  calc: true,
  search: 'calculator decimals multiply divide round decimal places',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'mult', label: 'multiply:  3.45 × 2.7', params: { k: 'mult' }, levels: ['Core'] },
    { id: 'div', label: 'divide exactly:  12.6 ÷ 0.45', params: { k: 'div' }, levels: ['Core'] },
    { id: 'round', label: 'several operations, rounded:  (7.2 + 3.85) ÷ 1.3', params: { k: 'round' }, levels: ['Core', 'Additional'] },
  ],
  generate(r, v) {
    if (v.k === 'mult') {
      const [a, b] = r.until(() => { const a = rd(r, 2, 1, 20), b = rd(r, r.int(1, 2), 1, 9); return dpOf(a.mul(b)) >= 3 ? [a, b] : null; });
      const ans = a.mul(b);
      return { parts: [{ body: `Work out {{${ds(a)} \\times ${ds(b)}}}`, a: ds(ans), w: M(`${ds(a)} \\times ${ds(b)} = ${ds(ans)}`), m: 1, lines: 3, chk: num(`${py(a)}*${py(b)}`, ans) }] };
    }
    if (v.k === 'div') {
      const [b, q] = r.until(() => { const b = rd(r, r.int(1, 2), 0.2, 9), q = rd(r, r.int(0, 2), 1, 60); return dpOf(b.mul(q)) <= 4 && b.val >= 0.12 && b.n % 10 !== 0 ? [b, q] : null; });
      const a = b.mul(q);
      return { parts: [{ body: `Work out {{${ds(a)} \\div ${ds(b)}}}`, a: ds(q), w: M(`${ds(a)} \\div ${ds(b)} = ${ds(q)}`), m: 1, lines: 3, chk: num(`${py(a)}/${py(b)}`, q) }] };
    }
    const [tex, expr, val] = r.until(() => {
      const a = rd(r, r.int(1, 2), 1, 15), b = rd(r, r.int(1, 2), 1, 15), c = rd(r, r.int(1, 2), 1, 9), form = r.int(0, 2);
      let tex, expr, val;
      if (form === 0) { tex = `(${ds(a)} + ${ds(b)}) \\div ${ds(c)}`; expr = `(${py(a)}+${py(b)})/${py(c)}`; val = a.add(b).div(c); }
      else if (form === 1) { tex = `${ds(a)} \\times ${ds(b)} \\div ${ds(c)}`; expr = `${py(a)}*${py(b)}/${py(c)}`; val = a.mul(b).div(c); }
      else { tex = `\\dfrac{${ds(a)} \\times ${ds(b)}}{${ds(c)}}`; expr = `${py(a)}*${py(b)}/${py(c)}`; val = a.mul(b).div(c); }
      return dpOf2(val) > 2 && !tie(val, 2) && val.val > 0.5 && val.val < 400 ? [tex, expr, val] : null;
    });
    const ans = rnd(val, 2);
    return { parts: [{ body: `Work out {{${tex}}}. Give your answer correct to 2 decimal places.`, a: ans.val.toFixed(2), w: M(`${tex} = ${dpOf2(val) < 9 ? ds(val) : val.val.toFixed(5) + '\\ldots'} \\approx ${ans.val.toFixed(2)}`), m: 2, lines: 4, chk: num(expr, ans, { dp: 2 }) }] };
  },
};
// decimal places needed, or 9 for a value that never terminates
function dpOf2(f) { let k = 0; while (10 ** k % f.d) { k++; if (k > 6) return 9; } return k; }
