import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
import { LETTERS } from './factorising.js';
import { grp, lin, foil, rawTex, result } from './expanding.js';

export default {
  id: 'expand-dots',
  topic: 'Expanding brackets', type: 'Difference of two squares', code: 'EXP10',
  levels: ['Further'],
  search: 'expand difference of two squares (x+4)(x-4) conjugate brackets',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'x', label: '(x + 4)(x − 4)', params: { kind: 'x' } },
    { id: 'ax', label: '(3x + 2)(3x − 2)', params: { kind: 'ax' } },
    { id: 'two', label: 'two letters:  (5a − 2b)(5a + 2b)', params: { kind: 'two' } },
  ],
  generate(r, v) {
    const [l, m] = r.sample(LETTERS, 2).sort();
    const [k, c] = r.until(() => { const k = v.kind === 'x' ? 1 : r.int(2, 6), c = r.int(1, 9); return gcd(k, c) === 1 ? [k, c] : null; });
    const first = P.mono(k, { [l]: 1 });
    const second = v.kind === 'two' ? P.mono(c, { [m]: 1 }) : P.c(c);
    const A = first.add(second), B = first.sub(second);
    const [X, Y] = r.chance() ? [A, B] : [B, A], ans = X.mul(Y);
    return result(`${grp(X)}${grp(Y)}`, ans, `${rawTex(foil(X, Y))} = ${ans.tex()}`);
  },
};
