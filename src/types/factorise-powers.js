// Higher powers (up to 9) and very high powers (10 to 30) share this generator.
import { P } from '../core/poly.js';
import { mono, innerOk, commonFactor } from './factorising.js';

const POOL = ['x', 'y', 'a', 'b', 'n', 'p', 't'];

export function powersGenerate(r, v, lo, hi) {
  const [out, inner] = r.until(() => {
    const [l, m] = r.sample(POOL, 2), k = r.int(2, 6), p = r.int(1, 5), q = r.int(1, 7) * r.sign();
    const e = (a, b) => r.int(a, b);
    let out, inner;
    if (v.kind === 'pure') {                       // x^m ± x^n
      const n = e(lo, hi), d = e(1, 4);
      out = mono(1, { [l]: n });
      inner = mono(1, { [l]: d }).add(P.c(r.sign()));
    } else if (v.kind === 'num') {                 // kx^m ± jx^n
      const n = e(lo, hi), d = e(1, 5);
      out = mono(k, { [l]: n });
      inner = mono(p, { [l]: d }).add(P.c(q));
    } else {                                       // two letters, e.g. 6a^3 b^4 + 9a^2 b^3
      out = mono(k, { [l]: e(lo, hi), [m]: e(lo, hi) });
      const u1 = e(0, 3), u2 = e(0, 3), w1 = e(0, 3), w2 = e(0, 3);
      if (Math.min(u1, u2) !== 0 || Math.min(w1, w2) !== 0 || (u1 === u2 && w1 === w2)) return null;
      inner = mono(p, { [l]: u1, [m]: w1 }).add(mono(q, { [l]: u2, [m]: w2 }));
    }
    return innerOk(inner) ? [out, inner] : null;
  });
  return commonFactor(out, inner);
}

export default {
  id: 'factorise-powers',
  topic: 'Factorising', type: 'Higher powers', code: 'FAC5',
  levels: ['Additional'],
  search: 'factorise fully common factor powers indices higher powers',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'pure', label: 'one letter:  x⁷ + x⁴', params: { kind: 'pure' } },
    { id: 'num', label: 'number and power:  4x⁶ − 8x⁴', params: { kind: 'num' } },
    { id: 'two', label: 'two letters:  6a³b⁴ + 9a²b³', params: { kind: 'two' } },
  ],
  generate(r, v) { return powersGenerate(r, v, 2, 9); },
};
