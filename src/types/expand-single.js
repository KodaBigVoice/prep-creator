import { P, termTex } from '../core/poly.js';

export default {
  id: 'expand-single',
  topic: 'Expanding brackets', type: 'Single bracket', code: 'EXP1',
  levels: ['Foundation', 'Core'],
  search: 'expand multiply out brackets',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'pos', label: 'positive outside', params: { neg: false, two: false } },
    { id: 'neg', label: 'negative outside', params: { neg: true, two: false } },
    { id: 'two', label: 'two letters', params: { neg: false, two: true } },
  ],
  generate(r, v) {
    const x = P.v('x'), y = P.v('y');
    const k = r.int(2, 8) * (v.neg ? -1 : 1);
    const second = v.two ? y : P.c(1);
    const a = r.int(1, 7), b = r.int(1, 9) * r.sign();
    const inner = v.two ? P.v('x', 1, a).add(P.v('y', 1, b)) : P.v('x', 1, a).add(P.c(b));
    const outer = P.c(k);
    const q = `${k < 0 ? '-' + Math.abs(k) : k}(${inner.tex()})`;
    const res = inner.scale(k);
    const w = inner.terms().map(([key, c]) => `${k}\\times ${c.isNeg ? '(' + termTex(c, key) + ')' : termTex(c, key)} = ${termTex(c.mul(k), key)}`).join(',\\ ');
    return { parts: [{ body: `{{${q}}}`, a: res.tex(), w: `{{${w}}}`, chk: { k: 'equiv', q, a: res.tex() } }] };
  },
};
