import { P } from '../core/poly.js';
import { F } from '../core/frac.js';
import { xAns } from './equations.js';

export default {
  id: 'expand-then-solve',
  topic: 'Linear equations', type: 'Expand, then solve (hence)', code: 'EQK2',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'expand and simplify hence solve equation multipart chain',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'std', label: 'a(bx + c) − d(ex + f) = k', params: {} },
  ],
  generate(r) {
    const [a, b, c, d, e, f, x0] = r.until(() => {
      const a = r.int(2, 6), b = r.int(1, 5), c = r.int(1, 8) * r.sign(), d = r.int(2, 6), e = r.int(1, 5), f = r.int(1, 8) * r.sign();
      const p = a * b - d * e, q = a * c - d * f;
      if (a === d || p === 0 || q === 0) return null;
      const x0 = r.int(-6, 8); if (x0 === 0) return null;
      return [a, b, c, d, e, f, x0];
    });
    const in1 = P.v('x', 1, b).add(P.c(c)), in2 = P.v('x', 1, e).add(P.c(f));
    const expr = `${a}(${in1.tex()}) - ${d}(${in2.tex()})`;
    const res = in1.scale(a).sub(in2.scale(d));
    const k = res.coef('x1').mul(x0).add(res.coef('')).n;     // value of the expression at x0
    const eq = `${expr} = ${k}`;
    const sol = new F(x0);
    return {
      parts: [
        { l: 'a', body: `Expand and simplify {{${expr}}}`, a: res.tex(), w: `{{${P.v('x', 1, a * b).add(P.c(a * c)).tex()} - (${P.v('x', 1, d * e).add(P.c(d * f)).tex()}) = ${res.tex()}}}`, m: 2, lines: 4, chk: { k: 'equiv', q: expr, a: res.tex() } },
        { l: 'b', body: `Hence, solve {{${eq}}}`, a: xAns(sol), w: `{{${res.tex()} = ${k};\\ ${res.coef('x1').n}x = ${k - res.coef('').n};\\ x = ${x0}}}`, m: 2, lines: 4, chk: { k: 'solve', eq, v: 'x' } },
      ],
    };
  },
};
