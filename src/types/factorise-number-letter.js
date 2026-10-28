import { P } from '../core/poly.js';
import { LETTERS, mono, innerOk, commonFactor } from './factorising.js';

export default {
  id: 'factorise-number-letter',
  topic: 'Factorising', type: 'Number and letter together', code: 'FAC3',
  levels: ['Additional'],
  search: 'factorise fully common factor number and letter',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'std', label: 'ax² ± bx:  12x² − 18x', params: { kind: 'std' } },
    { id: 'three', label: 'three terms:  4x³ + 8x² − 12x', params: { kind: 'three' } },
  ],
  generate(r, v) {
    const [out, inner] = r.until(() => {
      const l = r.pick(LETTERS), k = r.int(2, v.kind === 'std' ? 6 : 5);
      const p = r.int(1, 6), q = r.int(1, 7) * r.sign(), s = r.int(1, 7) * r.sign();
      const inner = v.kind === 'std'
        ? mono(p, { [l]: 1 }).add(P.c(q))
        : mono(p, { [l]: 2 }).add(mono(q, { [l]: 1 })).add(P.c(s));
      return innerOk(inner) ? [mono(k, { [l]: 1 }), inner] : null;
    });
    return commonFactor(out, inner);
  },
};
