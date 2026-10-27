import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';

export default {
  id: 'factorise-common',
  topic: 'Factorising', type: 'Common factor', code: 'FAC1',
  levels: ['Core', 'Additional'],
  search: 'factorise fully common factor',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'num', label: 'numbers only: 12x + 18', params: { kind: 'num' } },
    { id: 'one', label: 'one letter: 12x² − 18x', params: { kind: 'one' } },
    { id: 'two', label: 'two letters: 6x²y − 9xy²', params: { kind: 'two' } },
  ],
  generate(r, v) {
    const g = r.int(2, 8), a = r.int(1, 6), b = r.int(1, 6) * r.sign();
    let outside, inside, qs;
    if (v.kind === 'num') {
      const k = r.pick([2, 3, 4, 5, 6, 7, 8, 9]); const p = r.int(2, 6), q2 = r.int(1, 7);
      const aa = p, bb = q2 * r.sign();
      if (gcd(aa, bb) > 1) return this.generate(r, v);
      qs = P.v('x', 1, k * aa).add(P.c(k * bb));
      outside = String(k); inside = P.v('x', 1, aa).add(P.c(bb)).tex();
    } else if (v.kind === 'one') {
      const [aa, bb] = r.until(() => { const aa = r.int(1, 6), bb = r.int(1, 6) * r.sign(); return gcd(aa, bb) === 1 && aa !== Math.abs(bb) ? [aa, bb] : null; });
      const k = r.int(2, 6);
      qs = P.v('x', 2, k * aa).add(P.v('x', 1, k * bb));
      outside = `${k === 1 ? '' : k}x`; inside = P.v('x', 1, aa).add(P.c(bb)).tex();
    } else {
      const [aa, bb] = r.until(() => { const aa = r.int(1, 5), bb = r.int(1, 5) * r.sign(); return gcd(aa, bb) === 1 ? [aa, bb] : null; });
      const k = r.int(2, 5);
      // k*aa*x^2 y + k*bb*x y^2  = k x y (aa x + bb y)
      qs = P.mono(k * aa, { x: 2, y: 1 }).add(P.mono(k * bb, { x: 1, y: 2 }));
      outside = `${k}xy`; inside = P.v('x', 1, aa).add(P.v('y', 1, bb)).tex();
    }
    const a2 = `${outside}(${inside})`;
    return { parts: [{ body: `{{${qs.tex()}}}`, a: a2, w: `{{\\text{common factor } ${outside}}}`, chk: { k: 'equiv', q: qs.tex(), a: a2 } }] };
  },
};
