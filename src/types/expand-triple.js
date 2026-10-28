import { LETTERS } from './factorising.js';
import { lin, result } from './expanding.js';

export default {
  id: 'expand-triple',
  topic: 'Expanding brackets', type: 'Three brackets', code: 'EXP12',
  levels: ['Further'],
  search: 'expand three brackets cubic (x+1)(x+2)(x+3)',
  verb: 'Expand', marks: 4, lines: 7,
  variants: [
    { id: 'three', label: 'three different brackets:  (x + 1)(x + 2)(x + 3)', params: { kind: 'three' } },
    { id: 'sq', label: 'a squared bracket:  (x + 2)²(x − 1)', params: { kind: 'sq' } },
  ],
  generate(r, v) {
    const l = r.pick(LETTERS);
    const [a, b, c] = r.until(() => {
      const a = r.int(1, 6) * r.sign(), b = r.int(1, 6) * r.sign(), c = r.int(1, 6) * r.sign();
      if (v.kind === 'sq') return a !== c && a !== -c ? [a, a, c] : null;
      return new Set([a, b, c]).size === 3 ? [a, b, c] : null;
    });
    const A = lin(1, l, a), B = lin(1, l, b), C = lin(1, l, c);
    const AB = A.mul(B), ans = AB.mul(C);
    const br = (P_) => `(${P_.tex()})`;
    const q = v.kind === 'sq' ? `(${A.tex()})^2(${C.tex()})` : `${br(A)}${br(B)}${br(C)}`;
    return result(q, ans, `${br(AB)}${br(C)} = ${ans.tex()}`);
  },
};
