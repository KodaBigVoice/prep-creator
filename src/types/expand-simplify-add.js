import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, rawTex, result } from './expanding.js';

export default {
  id: 'expand-simplify-add',
  topic: 'Expanding brackets', type: 'Expand and simplify: adding brackets', code: 'EXP3',
  levels: ['Core', 'Additional'],
  search: 'expand and simplify two brackets add collect like terms',
  verb: 'Expand and simplify', marks: 2, lines: 4,
  variants: [
    { id: 'num', label: 'all positive:  3(x + 2) + 4(x + 5)', params: { kind: 'num' } },
    { id: 'neg', label: 'with negatives:  3(2x − 1) + 2(x + 4)', params: { kind: 'neg' } },
    { id: 'letter', label: 'a letter outside one bracket:  x(x + 3) + 2(x + 3)', params: { kind: 'letter' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [A, B, ans] = r.until(() => {
      const l = r.pick(LETTERS), pos = v.kind === 'num';
      const sg = () => (pos ? 1 : r.sign());
      const A = lin(r.int(1, 5), l, r.int(1, 8) * sg()), B = lin(r.int(1, 5), l, r.int(1, 8) * sg());
      const k1 = r.int(2, 6), k2 = r.int(2, 6);
      const e1 = v.kind === 'letter' ? P.mono(r.chance(0.5) ? 1 : r.int(2, 3), { [l]: 1 }) : P.c(k1), e2 = P.c(k2);
      const E1 = A.mul(e1), E2 = B.mul(e2), ans = E1.add(E2);
      if (v.kind === 'neg' && [A, B].every(X => X.terms().every(([, c]) => !c.isNeg))) return null;
      if (Object.keys(ans.t).length < 2 || !prim(A, B)) return null;
      return [[e1, A, E1], [e2, B, E2], ans];
    });
    const q = `${A[0].tex()}${grp(A[1])} + ${B[0].tex()}${grp(B[1])}`;
    return result(q, ans, `${rawTex([A[2], B[2]])} = ${ans.tex()}`);
  },
};
