import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
import { LETTERS } from './factorising.js';
import { lin, prim, foil, rawTex } from './expanding.js';

export default {
  id: 'expand-square',
  topic: 'Expanding brackets', type: 'Squaring a bracket', code: 'EXP9',
  levels: ['Further'],
  search: 'expand squared bracket perfect square (x+3)^2',
  verb: 'Expand', marks: 2, lines: 4,
  variants: [
    { id: 'x', label: 'x ± a:  (x + 3)²', params: { kind: 'x' } },
    { id: 'ax', label: 'ax ± b:  (2x + 3)²', params: { kind: 'ax' } },
    { id: 'two', label: 'two letters:  (2a − 3b)²', params: { kind: 'two' } },
  ],
  generate(r, v) {
    const A = r.until(() => {
      const [l, m] = r.sample(LETTERS, 2).sort();
      const c = r.int(1, 9) * r.sign();
      const A = v.kind === 'x' ? lin(1, l, c)
        : v.kind === 'ax' ? lin(r.int(2, 5), l, c)
        : lin(r.int(1, 5), l).add(P.mono(r.int(1, 6) * r.sign(), { [m]: 1 }));
      return prim(A) ? A : null;
    });
    const ans = A.mul(A), q = `(${A.tex()})^2`;
    return { parts: [{ body: `{{${q}}}`, a: ans.tex(), w: `{{(${A.tex()})(${A.tex()}) = ${rawTex(foil(A, A))} = ${ans.tex()}}}`, chk: { k: 'equiv', q, a: ans.tex() } }] };
  },
};
