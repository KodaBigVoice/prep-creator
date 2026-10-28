import { mono, innerOk, commonFactor } from './factorising.js';

const POOL = ['a', 'b', 'c', 'p', 'q', 'x', 'y', 'z'];

export default {
  id: 'factorise-two-letters',
  topic: 'Factorising', type: 'Two letters', code: 'FAC4',
  levels: ['Additional'],
  search: 'factorise fully common factor two letters xy',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'shared', label: 'one letter shared:  5ab + 10bc', params: { kind: 'shared' } },
    { id: 'xy', label: 'both letters come out:  6x²y − 9xy²', params: { kind: 'xy' } },
    { id: 'three', label: 'three letters:  6xyz + 9x²y', params: { kind: 'three' } },
  ],
  generate(r, v) {
    const [out, inner] = r.until(() => {
      const [l, m, n] = r.sample(POOL, 3), k = r.int(2, 6), p = r.int(1, 5), q = r.int(1, 5) * r.sign();
      let out, inner;
      if (v.kind === 'shared') {
        out = mono(k, { [l]: 1 });
        inner = mono(p, { [m]: 1 }).add(mono(q, { [r.chance(0.35) ? l : n]: 1 }));
      } else if (v.kind === 'xy') {
        out = mono(k, { [l]: 1, [m]: 1 });
        inner = mono(p, { [l]: 1 }).add(mono(q, { [m]: 1 }));
      } else {
        out = mono(k, { [l]: 1, [m]: 1 });
        inner = mono(p, { [n]: 1 }).add(mono(q, { [r.chance(0.5) ? l : m]: 1 }));
      }
      return innerOk(inner) ? [out, inner] : null;
    });
    return commonFactor(out, inner);
  },
};
