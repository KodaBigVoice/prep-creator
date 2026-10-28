import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, chain, combine, result } from './expanding.js';

export default {
  id: 'expand-simplify-double',
  topic: 'Expanding brackets', type: 'Expand and simplify: double brackets', code: 'EXP11',
  levels: ['Further'],
  search: 'expand and simplify double brackets add subtract squared brackets',
  verb: 'Expand and simplify', marks: 3, lines: 6,
  variants: [
    { id: 'sum', label: 'two pairs of brackets:  (x + 3)(x + 4) + (x − 2)(x + 5)', params: { kind: 'sum' } },
    { id: 'sq', label: 'two squares:  (x + 3)² − (x − 2)²', params: { kind: 'sq' } },
    { id: 'coef', label: 'with coefficients:  (2x + 1)(x − 3) − (x + 4)(x − 1)', params: { kind: 'coef' } },
  ],
  generate(r, v) {
    const [qtext, E1, E2, sg, ans] = r.until(() => {
      const l = r.pick(LETTERS), sg = v.kind === 'sum' ? r.sign() : -1;
      const c = () => r.int(1, 7) * r.sign();
      let q, E1, E2, bs;
      if (v.kind === 'sq') {
        const A = lin(1, l, c()), B = lin(1, l, c());
        q = `(${A.tex()})^2 ${sg < 0 ? '-' : '+'} (${B.tex()})^2`; E1 = A.mul(A); E2 = B.mul(B); bs = [A, B];
      } else {
        const co = v.kind === 'coef' ? () => r.int(1, 3) : () => 1;
        const A = lin(co(), l, c()), B = lin(co(), l, c()), C = lin(co(), l, c()), D = lin(co(), l, c());
        q = `${grp(A)}${grp(B)} ${sg < 0 ? '-' : '+'} ${grp(C)}${grp(D)}`; E1 = A.mul(B); E2 = C.mul(D); bs = [A, B, C, D];
      }
      const ans = combine([E1, E2], [sg]);
      return ans.terms().length >= 2 && prim(...bs) ? [q, E1, E2, sg, ans] : null;
    });
    return result(qtext, ans, `${chain([E1, E2], [sg])} = ${ans.tex()}`);
  },
};
