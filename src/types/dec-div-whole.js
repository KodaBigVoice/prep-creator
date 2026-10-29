import { TOPIC, F, rd, ds, py, M, mk, num, names, GBP, KG, LIT, MET, dpOf } from './decimals.js';

const CTX = [
  { u: GBP, dps: [2], lo: 3, hi: 40, s: (n, a, k) => `${n} shares ${a} equally between ${k} friends. How much does each friend get?` },
  { u: MET, dps: [1, 2], lo: 2, hi: 12, s: (n, a, k) => `A rope ${a} long is cut into ${k} equal pieces. How long is each piece?` },
  { u: KG, dps: [1, 2], lo: 2, hi: 12, s: (n, a, k) => `${n} shares ${a} of sand equally between ${k} buckets. What mass of sand goes in each bucket?` },
  { u: LIT, dps: [1, 2], lo: 2, hi: 12, s: (n, a, k) => `${a} of juice is poured equally into ${k} jugs. How much juice is in each jug?` },
  { u: KG, dps: [1, 2], lo: 2, hi: 10, s: (n, a, k) => `${k} identical books have a total mass of ${a}. What is the mass of one book?` },
];

export default {
  id: 'dec-div-whole',
  topic: TOPIC, type: 'Dividing a decimal by a whole number', code: 'DC7',
  levels: ['Core'],
  search: 'divide decimal by whole number bus stop sharing worded',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'tenths', label: 'tenths:  7.2 ÷ 4', params: { da: 1 } },
    { id: 'hundredths', label: 'hundredths:  0.84 ÷ 7', params: { da: 2 } },
    { id: 'whole', label: 'whole number ÷ whole number:  5 ÷ 8', params: { da: 0 } },
    { id: 'ctx', label: 'in context: sharing, equal pieces', params: { ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const c = r.pick(CTX), dpa = r.pick(c.dps), [n] = names(r, 1);
      const [a, k, q] = r.until(() => {
        const k = r.pick([3, 4, 5, 6, 7, 8, 9]), a = rd(r, dpa, c.lo, c.hi), q = a.div(k);
        let dq; try { dq = dpOf(q); } catch (e) { return null; }
        return dq <= 2 ? [a, k, q] : null;
      });
      return { parts: [{ verb: '', body: c.s(n, c.u.txt(a), k), a: c.u.tex(q), w: M(`${ds(a)} \\div ${k} = ${ds(q)}`), ...mk(1, c.u), chk: num(`${py(a)}/${k}`, q) }] };
    }
    const [a, k, q] = r.until(() => {
      const k = v.da === 0 ? r.pick([2, 4, 5, 8]) : r.int(2, 9);
      const q = v.da === 0 ? null : rd(r, r.int(0, 2), 0.1, v.da === 2 ? 5 : 12);
      const a = v.da === 0 ? new F(r.int(1, 29)) : (q ? q.mul(k) : null);
      if (!a || dpOf(a) !== v.da || (v.da === 0 && a.n % k === 0)) return null;
      const qq = a.div(k);
      let dq; try { dq = dpOf(qq); } catch (e) { return null; }
      return dq <= 3 && qq.val > 0.1 && (v.da === 0 ? true : !qq.isInt || r.chance(0.3)) ? [a, k, qq] : null;
    });
    return { parts: [{ body: `{{${ds(a)} \\div ${k}}}`, a: ds(q), w: M(`${ds(a)} \\div ${k} = ${ds(q)}`), m: 1, chk: num(`${py(a)}/${k}`, q) }] };
  },
};
