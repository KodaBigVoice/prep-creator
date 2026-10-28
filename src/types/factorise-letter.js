import { P } from '../core/poly.js';
import { mono, innerOk, commonFactor } from './factorising.js';

const POOL = ['a', 'b', 'c', 'p', 'q', 'r', 'x', 'y', 'z'];

export default {
  id: 'factorise-letter',
  topic: 'Factorising', type: 'Common letter factor', code: 'FAC2',
  levels: ['Core', 'Additional'],
  search: 'factorise common factor letter',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'sq', label: 'x² ± bx:  x² + 5x', params: { kind: 'sq' } },
    { id: 'mix', label: 'a letter shared by two terms:  ab + ac', params: { kind: 'mix' } },
  ],
  generate(r, v) {
    const [out, inner] = r.until(() => {
      const [l, m, n] = r.sample(POOL, 3);
      let inner;
      if (v.kind === 'sq') inner = mono(1, { [l]: 1 }).add(P.c(r.int(2, 12) * r.sign()));
      else inner = r.chance(0.5) ? mono(1, { [m]: 1 }).add(mono(r.sign(), { [n]: 1 })) : mono(1, { [l]: 1 }).add(mono(r.sign(), { [m]: 1 }));
      return innerOk(inner) ? [mono(1, { [l]: 1 }), inner] : null;
    });
    return commonFactor(out, inner);
  },
};
