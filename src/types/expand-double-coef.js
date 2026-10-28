import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, foil, rawTex, result } from './expanding.js';

export default {
  id: 'expand-double-coef',
  topic: 'Expanding brackets', type: 'Double brackets (ax + b)(cx + d)', code: 'EXP8',
  levels: ['Further'],
  search: 'expand double brackets binomials coefficients quadratic',
  verb: 'Expand', marks: 3, lines: 5,
  variants: [
    { id: 'std', label: 'one x coefficient above 1:  (2x + 3)(x − 4)', params: { kind: 'std' } },
    { id: 'both', label: 'both above 1:  (3x − 2)(2x + 5)', params: { kind: 'both' } },
    { id: 'two', label: 'two letters:  (2x + y)(x − 3y)', params: { kind: 'two' } },
  ],
  generate(r, v) {
    const [A, B] = r.until(() => {
      const [l, m] = r.sample(LETTERS, 2).sort();
      const p = r.int(2, 4), q = v.kind === 'std' ? 1 : r.int(2, 4);
      if (v.kind === 'both' && p === q) return null;
      const c1 = r.int(1, 8) * r.sign(), c2 = r.int(1, 8) * r.sign();
      let A, B;
      if (v.kind === 'two') {
        A = lin(r.int(1, 4), l).add(P.mono(r.int(1, 5) * r.sign(), { [m]: 1 })); B = lin(r.int(1, 3), l).add(P.mono(r.int(1, 5) * r.sign(), { [m]: 1 }));
      } else { A = lin(p, l, c1); B = lin(q, l, c2); }
      const ans = A.mul(B);
      return ans.terms().length >= 3 && prim(A, B) ? (r.chance(0.5) ? [A, B] : [B, A]) : null;
    });
    const ans = A.mul(B);
    return result(`${grp(A)}${grp(B)}`, ans, `${rawTex(foil(A, B))} = ${ans.tex()}`);
  },
};
