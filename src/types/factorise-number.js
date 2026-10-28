import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
import { LETTERS, mono, innerOk, commonFactor } from './factorising.js';

export default {
  id: 'factorise-number',
  topic: 'Factorising', type: 'Common number factor', code: 'FAC1',
  levels: ['Core', 'Additional'],
  search: 'factorise fully common factor number',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'two', label: 'ax ± b:  12x + 18', params: { kind: 'two' } },
    { id: 'xy', label: 'ax ± by:  8x − 12y', params: { kind: 'xy' } },
    { id: 'three', label: 'three terms:  8x − 12y + 4', params: { kind: 'three' } },
  ],
  generate(r, v) {
    const [out, inner] = r.until(() => {
      const k = r.int(2, 9), l = r.pick(LETTERS);
      let m = r.pick(LETTERS); while (m === l) m = r.pick(LETTERS);
      const p = r.int(1, 7), q = r.int(1, 7) * r.sign(), s = r.int(1, 7) * r.sign();
      let inner;
      if (v.kind === 'two') inner = mono(p, { [l]: 1 }).add(P.c(q));
      else if (v.kind === 'xy') inner = mono(p, { [l]: 1 }).add(mono(q, { [m]: 1 }));
      else inner = mono(p, { [l]: 1 }).add(mono(q, { [m]: 1 })).add(P.c(s));
      return innerOk(inner) ? [mono(k), inner] : null;
    });
    return commonFactor(out, inner);
  },
};
