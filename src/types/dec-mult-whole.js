import { TOPIC, F, rd, ds, py, M, mk, num, names, GBP, KG, LIT, MET, ML, mon } from './decimals.js';

const CTX = [
  { u: GBP, lo: 0.5, hi: 6, dps: [2], s: (n, x, k) => `${n} buys ${k} pens. Each pen costs ${mon(x)}. How much do the pens cost altogether?` },
  { u: GBP, lo: 1, hi: 9, dps: [2], s: (n, x, k) => `A ticket for a school trip costs ${mon(x)}. ${n} buys ${k} tickets. How much does ${n} pay?` },
  { u: KG, lo: 0.2, hi: 3, dps: [1, 2], s: (n, x, k) => `Each bag of flour has a mass of ${ds(x)} kg. What is the total mass of ${k} bags of flour?` },
  { u: LIT, lo: 0.2, hi: 3, dps: [1, 2], s: (n, x, k) => `A bottle holds ${ds(x)} litres. ${n} buys ${k} bottles. How many litres is that altogether?` },
  { u: MET, lo: 0.3, hi: 4, dps: [1, 2], s: (n, x, k) => `${n} cuts ${k} pieces of ribbon, each ${ds(x)} m long. What is the total length of ribbon?` },
  { u: KG, lo: 0.3, hi: 4, dps: [1, 2], s: (n, x, k) => `A box of tiles has a mass of ${ds(x)} kg. What is the mass of ${k} boxes?` },
];

export default {
  id: 'dec-mult-whole',
  topic: TOPIC, type: 'Multiplying a decimal by a whole number', code: 'DC6',
  levels: ['Core'],
  search: 'multiply decimal by whole number tenths hundredths worded price',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'tenths', label: 'tenths:  2.3 × 4', params: { dp: 1 } },
    { id: 'hundredths', label: 'hundredths:  1.25 × 8', params: { dp: 2 } },
    { id: 'ctx', label: 'in context: price, mass, length', params: { ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const c = r.pick(CTX), k = r.int(3, 9), dp = r.pick(c.dps);
      const x = rd(r, dp, c.lo, c.hi), ans = x.mul(k), [n] = names(r, 1);
      return { parts: [{ verb: '', body: c.s(n, x, k), a: c.u.tex(ans), w: M(`${ds(x.mul(10 ** dp))} \\times ${k} = ${ds(x.mul(10 ** dp).mul(k))};\\ ${ds(x)} \\times ${k} = ${ds(ans)}`), ...mk(1, c.u), chk: num(`${py(x)}*${k}`, ans) }] };
    }
    const k = r.int(3, 9), x = rd(r, v.dp, v.dp === 1 ? 0.2 : 0.2, v.dp === 1 ? 12 : 8), ans = x.mul(k), mant = x.mul(10 ** v.dp);
    return { parts: [{ body: `{{${ds(x)} \\times ${k}}}`, a: ds(ans), w: M(`${ds(mant)} \\times ${k} = ${ds(mant.mul(k))};\\ ${ds(x)} \\times ${k} = ${ds(ans)}`), m: v.dp === 1 ? 1 : 2, chk: num(`${py(x)}*${k}`, ans) }] };
  },
};
