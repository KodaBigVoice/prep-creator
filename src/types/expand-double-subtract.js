import { P } from '../core/poly.js';

export default {
  id: 'expand-two-subtract',
  topic: 'Expanding brackets', type: 'Two brackets, subtracting', code: 'EXP2',
  levels: ['Core', 'Additional'],
  search: 'expand and simplify two brackets subtract',
  verb: 'Expand and simplify', marks: 2, lines: 5,
  variants: [
    { id: 'lin', label: 'a(bx + c) − d(ex + f)', params: { two: false } },
    { id: 'two', label: 'two letters: 3x(6x + 2y) − 3y(2x − 6y)', params: { two: true } },
  ],
  generate(r, v) {
    if (!v.two) {
      const [a, b, c, d, e, f] = r.until(() => {
        const a = r.int(2, 6), b = r.int(1, 5), c = r.int(1, 8) * r.sign(), d = r.int(2, 6), e = r.int(1, 5), f = r.int(1, 8) * r.sign();
        const res = P.v('x', 1, a * b - d * e).add(P.c(a * c - d * f));
        return a !== d && a * b - d * e !== 0 && a * c - d * f !== 0 ? [a, b, c, d, e, f] : null;
      });
      const in1 = P.v('x', 1, b).add(P.c(c)), in2 = P.v('x', 1, e).add(P.c(f));
      const q = `${a}(${in1.tex()}) - ${d}(${in2.tex()})`;
      const res = in1.scale(a).sub(in2.scale(d));
      const w = `${P.v('x', 1, a * b).add(P.c(a * c)).tex()} - (${P.v('x', 1, d * e).add(P.c(d * f)).tex()})`;
      return { parts: [{ body: `{{${q}}}`, a: res.tex(), w: `{{${w} = ${res.tex()}}}`, chk: { k: 'equiv', q, a: res.tex() } }] };
    }
    const [a, b, c, d, e, f] = r.until(() => {
      const a = r.int(2, 5), b = r.int(2, 6), c = r.int(1, 5), d = r.int(2, 5), e = r.int(1, 4), f = r.int(2, 6);
      return [a, b, c, d, e, f];
    });
    const x = P.v('x'), y = P.v('y');
    const in1 = P.v('x', 1, b).add(P.v('y', 1, c));
    const in2 = P.v('x', 1, e).sub(P.v('y', 1, f));
    const t1 = x.scale(a).mul(in1), t2 = y.scale(d).mul(in2);
    const q = `${a}x(${in1.tex()}) - ${d}y(${in2.tex()})`;
    const res = t1.sub(t2);
    const w = `${t1.tex()} - (${t2.tex()}) = ${res.tex()}`;
    return { parts: [{ body: `{{${q}}}`, a: res.tex(), w: `{{${w}}}`, chk: { k: 'equiv', q, a: res.tex() } }] };
  },
};
