import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
import { product, LETTERS } from './factorising.js';

export default {
  id: 'factorise-squares',
  topic: 'Factorising', type: 'Difference of two squares', code: 'FAC8',
  levels: ['Additional'],
  search: 'factorise difference of two squares x squared minus',
  verb: 'Factorise', marks: 2, lines: 3,
  variants: [
    { id: 'x2', label: 'x² − 49', params: { kind: 'x2' } },
    { id: 'ax2', label: '9x² − 16', params: { kind: 'ax2' } },
    { id: 'two', label: 'two letters:  25a² − 4b²', params: { kind: 'two' } },
  ],
  generate(r, v) {
    const l = r.pick(LETTERS);
    if (v.kind === 'x2') {
      const a = r.int(2, 20);
      return product(P.v(l, 2).add(P.c(-a * a)), 1, [`${l} - ${a}`, `${l} + ${a}`], `${l}^2 - ${a}^2`);
    }
    if (v.kind === 'ax2') {
      const [k, a] = r.until(() => { const k = r.int(2, 6), a = r.int(1, 12); return gcd(k, a) === 1 ? [k, a] : null; });
      return product(P.v(l, 2, k * k).add(P.c(-a * a)), 1, [`${k}${l} - ${a}`, `${k}${l} + ${a}`], `(${k}${l})^2 - ${a}^2`);
    }
    const [k, m] = r.until(() => { const k = r.int(1, 6), m = r.int(1, 6); return gcd(k, m) === 1 && !(k === 1 && m === 1) ? [k, m] : null; });
    const [u, w] = r.sample(LETTERS, 2).sort();
    const t = (c, l) => (c === 1 ? l : `${c}${l}`);
    return product(P.v(u, 2, k * k).add(P.v(w, 2, -m * m)), 1, [`${t(k, u)} - ${t(m, w)}`, `${t(k, u)} + ${t(m, w)}`], `(${t(k, u)})^2 - (${t(m, w)})^2`);
  },
};
