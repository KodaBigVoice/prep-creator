import { TOPIC, F, ds, py, M, num, dpOf } from './decimals.js';

export default {
  id: 'dec-given',
  topic: TOPIC, type: 'Using a given multiplication', code: 'DC15',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'given that 23 x 47 = 1081 work out decimal multiplication division hence use a known fact',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'two', label: 'two parts, multiplying:  given 23 × 47 = 1081, work out 2.3 × 4.7', params: { n: 2 } },
    { id: 'std', label: 'three parts: two multiplications, then a division', params: { n: 3 }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [A, B] = r.until(() => { const A = r.int(12, 89), B = r.int(12, 89); return A % 10 && B % 10 && A !== B && A * B < 4000 ? [A, B] : null; });
    const C = A * B, sc = (m, k) => new F(m, 10 ** k);
    const mulPart = () => r.until(() => {
      const i = r.int(0, 2), j = r.int(0, 2);
      if (i + j === 0 || i + j > 3) return null;
      const x = sc(A, i), y = sc(B, j), [p, q] = r.chance(0.5) ? [x, y] : [y, x], ans = x.mul(y);
      return { body: `{{${ds(p)} \\times ${ds(q)}}}`, a: ds(ans), w: M(`${ds(p)} \\times ${ds(q)} = ${ds(ans)}`), chk: num(`${py(p)}*${py(q)}`, ans), key: `${i}${j}` };
    });
    const divPart = () => r.until(() => {
      const k = r.int(0, 2), m = r.int(1, 2), useA = r.chance(0.5), D = useA ? A : B, Q = useA ? B : A;
      const dividend = sc(C, k), divisor = sc(D, m), ans = dividend.div(divisor);
      if (dpOf(ans) > 3 || dpOf(divisor) === 0) return null;
      return { body: `{{${ds(dividend)} \\div ${ds(divisor)}}}`, a: ds(ans), w: M(`${ds(dividend)} \\div ${ds(divisor)} = ${ds(ans)}`), chk: num(`${py(dividend)}/${py(divisor)}`, ans), key: `d${k}${m}${D}` };
    });
    const parts = [], seen = new Set();
    for (const f of v.n === 2 ? [mulPart, mulPart] : [mulPart, mulPart, divPart]) {
      const p = r.until(() => { const x = f(); return seen.has(x.key) ? null : x; }, 200);
      seen.add(p.key); parts.push({ l: 'abc'[parts.length], body: p.body, a: p.a, w: p.w, m: 1, lines: 3, chk: p.chk });
    }
    return { stem: `Given that {{${A} \\times ${B} = ${C}}}, work out:`, parts };
  },
};
