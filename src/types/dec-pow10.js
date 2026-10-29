import { TOPIC, F, rd, ds, py, M, num } from './decimals.js';

export default {
  id: 'dec-pow10',
  topic: TOPIC, type: 'Multiplying and dividing by 10, 100, 1000', code: 'DC4',
  levels: ['Foundation', 'Core'],
  search: 'multiply divide decimals by 10 100 1000 powers of ten move the digits',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'mult', label: 'multiply:  3.4 × 100', params: { op: '\\times' } },
    { id: 'div', label: 'divide:  56 ÷ 1000', params: { op: '\\div' } },
  ],
  generate(r, v) {
    const k = r.pick([10, 100, 1000]), mult = v.op === '\\times';
    const a = mult ? (r.chance(0.2) ? new F(r.int(2, 99)) : rd(r, r.int(1, 3), 0.01, 60)) : (r.chance(0.5) ? new F(r.int(2, 999)) : rd(r, r.int(1, 2), 0.5, 100));
    if (a.isInt && a.n % 10 === 0) return this.generate(r, v);
    const ans = mult ? a.mul(k) : a.div(k);
    return { parts: [{ body: `{{${ds(a)} ${v.op} ${k === 1000 ? '1000' : k}}}`, a: ds(ans), w: M(`${ds(a)} ${v.op} ${k} = ${ds(ans)}`), m: 1, chk: num(`${py(a)}${mult ? '*' : '/'}${k}`, ans) }] };
  },
};
