import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, result } from './expanding.js';

export default {
  id: 'expand-number',
  topic: 'Expanding brackets', type: 'Number outside the bracket', code: 'EXP1',
  levels: ['Core', 'Additional'],
  search: 'expand multiply out single bracket number outside',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'pos', label: 'positive number:  4(x + 7)', params: { kind: 'pos' } },
    { id: 'neg', label: 'negative number:  −4(x − 7)', params: { kind: 'neg' } },
    { id: 'two', label: 'two letters inside:  4(x − 7y)', params: { kind: 'two' } },
    { id: 'three', label: 'three terms inside:  3(2x − 5y + 4)', params: { kind: 'three' } },
  ],
  generate(r, v) {
    const [k, inner] = r.until(() => {
      const [l, m] = r.sample(LETTERS, 2).sort();
      const k = r.int(2, 9) * (v.kind === 'neg' ? -1 : 1), p = r.int(1, 8), q = r.int(1, 9) * r.sign(), s = r.int(1, 9) * r.sign();
      const inner = v.kind === 'two' ? lin(p, l).add(P.mono(q, { [m]: 1 }))
        : v.kind === 'three' ? lin(p, l, s).add(P.mono(q, { [m]: 1 }))
        : lin(p, l, q);
      return prim(inner) ? [k, inner] : null;
    });
    const out = P.c(k), ans = inner.mul(out);
    return result(`${k}${grp(inner)}`, ans, `\\text{multiply every term by } ${k < 0 ? `(${k})` : k}`);
  },
};
