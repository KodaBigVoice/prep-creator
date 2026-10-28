import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, result } from './expanding.js';

export default {
  id: 'expand-letter',
  topic: 'Expanding brackets', type: 'Letter outside the bracket', code: 'EXP2',
  levels: ['Core', 'Additional'],
  search: 'expand multiply out single bracket letter outside x(x+5)',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'x', label: 'letter only:  x(x + 5)', params: { kind: 'x' } },
    { id: 'nx', label: 'number and letter:  3x(2x − 5)', params: { kind: 'nx' } },
    { id: 'neg', label: 'negative:  −2x(x − 6)', params: { kind: 'neg' }, levels: ['Additional'] },
    { id: 'two', label: 'two letters inside:  3x(2x + 4y)', params: { kind: 'two' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [l, m] = r.sample(LETTERS, 2).sort();
    const k = v.kind === 'x' ? 1 : v.kind === 'neg' ? -r.int(1, 5) : r.int(2, 6);
    const inner = r.until(() => {
      const p = v.kind === 'x' ? 1 : r.int(1, 6), q = r.int(2, 9) * r.sign();
      const i = v.kind === 'two' ? lin(p, l).add(P.mono(q, { [m]: 1 })) : lin(p, l, q);
      return prim(i) ? i : null;
    });
    const out = P.mono(k, { [l]: 1 }), ans = inner.mul(out);
    return result(`${out.tex()}${grp(inner)}`, ans, `\\text{multiply every term by } ${out.tex()}`);
  },
};
