import { TOPIC, F, rd, ds, py, M, num } from './decimals.js';

export default {
  id: 'dec-pow01',
  topic: TOPIC, type: 'Multiplying and dividing by 0.1 and 0.01', code: 'DC5',
  levels: ['Additional'],
  search: 'multiply divide by 0.1 0.01 decimals making it bigger smaller',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'mult', label: 'multiply:  36 × 0.1', params: { op: '\\times' } },
    { id: 'div', label: 'divide:  35 ÷ 0.1', params: { op: '\\div' } },
  ],
  generate(r, v) {
    const k = r.pick(['0.1', '0.01']), kf = k === '0.1' ? new F(1, 10) : new F(1, 100), mult = v.op === '\\times';
    const a = r.chance(0.6) ? new F(r.int(2, 99)) : rd(r, r.int(1, 2), 0.5, 50);
    if (a.isInt && a.n % 10 === 0) return this.generate(r, v);
    const ans = mult ? a.mul(kf) : a.div(kf);
    const w = mult ? `${ds(a)} \\times ${k} = ${ds(a)} \\div ${k === '0.1' ? 10 : 100} = ${ds(ans)}` : `${ds(a)} \\div ${k} = ${ds(a)} \\times ${k === '0.1' ? 10 : 100} = ${ds(ans)}`;
    return { parts: [{ body: `{{${ds(a)} ${v.op} ${k}}}`, a: ds(ans), w: M(w), m: 1, chk: num(`${py(a)}${mult ? '*' : '/'}${py(kf)}`, ans) }] };
  },
};
