import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
import { product, num } from './factorising.js';

const lin = (a, c) => `${a === 1 ? '' : a}x ${c < 0 ? '-' : '+'} ${Math.abs(c)}`;

export default {
  id: 'factorise-ax2',
  topic: 'Factorising', type: 'Quadratics ax² + bx + c', code: 'FAC9',
  levels: ['Further'],
  search: 'factorise quadratic ax squared leading coefficient double brackets',
  verb: 'Factorise', marks: 3, lines: 4,
  variants: [
    { id: 'pos', label: 'all positive:  2x² + 7x + 3', params: { kind: 'pos' } },
    { id: 'mixed', label: 'with negatives:  3x² − 5x − 2', params: { kind: 'mixed' } },
  ],
  generate(r, v) {
    const [p, a, q, b] = r.until(() => {       // (px + a)(qx + b), p >= q
      const p = r.int(2, 4), q = r.int(1, p), a = r.int(1, 6), b = r.int(1, 6);
      const sa = v.kind === 'pos' ? 1 : r.sign(), sb = v.kind === 'pos' ? 1 : r.sign();
      const A = a * sa, B = b * sb, mid = p * B + q * A;
      if (v.kind === 'mixed' && sa > 0 && sb > 0) return null;
      if (!mid || gcd(gcd(p * q, mid), A * B) !== 1) return null;
      return [p, A, q, B];
    });
    const qd = P.v('x', 2, p * q).add(P.v('x', 1, p * b + q * a)).add(P.c(a * b));
    const N = p * q * a * b, mid = p * b + q * a;
    let u = 0, w = 0;
    for (let i = -60; i <= 60; i++) if (i && N % i === 0 && i + N / i === mid) { u = Math.min(i, N / i); w = Math.max(i, N / i); break; }
    return product(qd, 1, [lin(p, a), lin(q, b)], `${num(u)} \\times ${num(w)} = ${N},\\ ${num(u)} + ${num(w)} = ${mid}`);
  },
};
