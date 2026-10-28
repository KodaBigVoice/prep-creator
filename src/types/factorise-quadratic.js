import { P } from '../core/poly.js';
import { product, num } from './factorising.js';

// (x + p)(x + q) written with the smaller constant first
const br = (v, c) => (c < 0 ? `${v} - ${-c}` : `${v} + ${c}`);

export default {
  id: 'factorise-quadratic',
  topic: 'Factorising', type: 'Quadratics x² + bx + c', code: 'FAC7',
  levels: ['Further'],
  search: 'factorise quadratic trinomial double brackets x squared',
  verb: 'Factorise', marks: 2, lines: 3,
  variants: [
    { id: 'pos', label: 'all positive:  x² + 7x + 12', params: { kind: 'pos' } },
    { id: 'neg', label: 'negative middle term:  x² − 5x + 6', params: { kind: 'neg' } },
    { id: 'mixed', label: 'negative constant:  x² + 2x − 15', params: { kind: 'mixed' } },
  ],
  generate(r, v) {
    const [p, q] = r.until(() => {
      let p, q;
      if (v.kind === 'pos') { p = r.int(1, 9); q = r.int(1, 9); }
      else if (v.kind === 'neg') { p = -r.int(1, 9); q = -r.int(1, 9); }
      else { p = r.int(1, 12); q = -r.int(1, 12); if (r.chance()) [p, q] = [q, p]; }
      return p !== q && p !== -q ? [Math.min(p, q), Math.max(p, q)] : null;
    });
    const l = 'x', qd = P.v(l, 2).add(P.v(l, 1, p + q)).add(P.c(p * q));
    return product(qd, 1, [br(l, p), br(l, q)], `${num(p)} \\times ${num(q)} = ${p * q},\\ ${num(p)} + ${num(q)} = ${p + q}`);
  },
};
