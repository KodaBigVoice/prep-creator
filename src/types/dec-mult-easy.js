import { TOPIC, F, ds, py, M, num, dpOf } from './decimals.js';

export default {
  id: 'dec-mult-easy',
  topic: TOPIC, type: 'Multiplying two decimals: easy', code: 'DC8',
  levels: ['Core'],
  search: 'multiply decimals by decimals count decimal places tenths',
  verb: 'Evaluate', marks: 1, lines: 3,
  variants: [
    { id: 'tenths', label: 'tenths × tenths:  0.3 × 0.4', params: { k: 'tt' } },
    { id: 'zeros', label: 'with place-value zeros:  0.06 × 0.2', params: { k: 'z' } },
    { id: 'mixed', label: 'one number with two digits:  1.2 × 0.5', params: { k: 'm' } },
  ],
  generate(r, v) {
    const [a, b, ma, mb] = r.until(() => {
      let a, b;
      if (v.k === 'tt') { a = new F(r.int(2, 9), 10); b = new F(r.int(2, 9), 10); }
      else if (v.k === 'z') { const x = new F(r.int(2, 9), 100), y = new F(r.int(2, 9), 10); [a, b] = r.chance(0.5) ? [x, y] : [y, x]; }
      else { const x = new F(r.int(11, 49), 10), y = new F(r.int(2, 9), 10); if (x.n % 10 === 0 || x.d === 1) return null; [a, b] = r.chance(0.5) ? [x, y] : [y, x]; }
      return [a, b, a.mul(10 ** dpOf(a)), b.mul(10 ** dpOf(b))];
    });
    const ans = a.mul(b);
    return { parts: [{ body: `{{${ds(a)} \\times ${ds(b)}}}`, a: ds(ans), w: M(`${ds(ma)} \\times ${ds(mb)} = ${ds(ma.mul(mb))};\\ ${ds(a)} \\times ${ds(b)} = ${ds(ans)}`), m: 1, chk: num(`${py(a)}*${py(b)}`, ans) }] };
  },
};
