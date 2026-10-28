import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, foil, rawTex, result } from './expanding.js';

export default {
  id: 'expand-double',
  topic: 'Expanding brackets', type: 'Double brackets (x + a)(x + b)', code: 'EXP7',
  levels: ['Further'],
  search: 'expand double brackets binomials foil quadratic',
  verb: 'Expand', marks: 2, lines: 4,
  variants: [
    { id: 'pos', label: 'all positive:  (x + 3)(x + 5)', params: { kind: 'pos' } },
    { id: 'mixed', label: 'one negative:  (x − 4)(x + 7)', params: { kind: 'mixed' } },
    { id: 'neg', label: 'both negative:  (x − 3)(x − 5)', params: { kind: 'neg' } },
  ],
  generate(r, v) {
    const [a, b] = r.until(() => {
      let a = r.int(1, 9), b = r.int(1, 9);
      if (v.kind === 'neg') { a = -a; b = -b; } else if (v.kind === 'mixed') b = -b;
      return a !== b && a !== -b ? [a, b] : null;
    });
    const l = r.pick(LETTERS), A = lin(1, l, a), B = lin(1, l, b), ans = A.mul(B);
    return result(`${grp(A)}${grp(B)}`, ans, `${rawTex(foil(A, B))} = ${ans.tex()}`);
  },
};
