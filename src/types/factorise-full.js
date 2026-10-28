import { P } from '../core/poly.js';
import { product } from './factorising.js';

const br = (c) => (c < 0 ? `x - ${-c}` : `x + ${c}`);

export default {
  id: 'factorise-full',
  topic: 'Factorising', type: 'Factorise fully (several steps)', code: 'FAC10',
  levels: ['Additional'],
  search: 'factorise fully common factor then double brackets difference of two squares cubic',
  verb: 'Factorise fully', marks: 3, lines: 4,
  variants: [
    { id: 'dots', label: 'number, then difference of squares:  2x² − 18', params: { kind: 'dots' } },
    { id: 'quad', label: 'number, then a quadratic:  3x² + 15x + 18', params: { kind: 'quad' } },
    { id: 'cubic', label: 'letter, then difference of squares:  x³ − 4x', params: { kind: 'cubic' } },
  ],
  generate(r, v) {
    if (v.kind === 'dots') {
      const k = r.int(2, 5), a = r.int(2, 9);
      return product(P.v('x', 2, k).add(P.c(-k * a * a)), k, [`x - ${a}`, `x + ${a}`], `${k}(x^2 - ${a * a})`);
    }
    if (v.kind === 'quad') {
      const [p, q] = r.until(() => { const p = r.int(-8, 9), q = r.int(-8, 9); return p && q && p < q && p + q !== 0 ? [p, q] : null; });
      const k = r.int(2, 5);
      return product(P.v('x', 2, k).add(P.v('x', 1, k * (p + q))).add(P.c(k * p * q)), k, [br(p), br(q)], `${k}(${P.v('x', 2).add(P.v('x', 1, p + q)).add(P.c(p * q)).tex()})`);
    }
    const k = r.int(1, 4), a = r.int(1, 8);
    const q = P.v('x', 3, k).add(P.v('x', 1, -k * a * a));
    return product(q, k, ['x', `x - ${a}`, `x + ${a}`], `${k === 1 ? '' : k}x(x^2 - ${a * a})`);
  },
};
