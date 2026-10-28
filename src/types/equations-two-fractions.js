import { F, lcm, gcd } from '../core/frac.js';
import { P } from '../core/poly.js';
import { axb, cx, fin, xAns, okSol } from './equations.js';

const PAIRS = [[2, 3], [3, 2], [2, 5], [3, 4], [4, 3], [3, 5], [5, 3], [2, 4], [3, 6], [4, 8], [2, 6], [4, 6], [5, 2], [3, 9], [5, 4], [2, 7]];
// a fraction that does not cancel (e.g. not (3x + 9)/3)
const reduced = (m, p, d) => gcd(gcd(m, p), d) === 1;
const coef = (r) => (r.chance(0.65) ? 1 : r.int(2, 3));
const frac = (n, d) => `\\dfrac{${n}}{${d}}`;

export default {
  id: 'equations-two-fractions',
  topic: 'Equations', type: 'Two algebraic fractions', code: 'EQF2',
  levels: ['Additional'],
  search: 'fractional equation algebraic fractions two fractions lcm cross multiply solve',
  verb: 'Solve', marks: 3, lines: 6,
  integer: true,
  variants: [
    { id: 'sum', label: 'x/a + x/b = c', params: { kind: 'sum' } },
    { id: 'cross', label: '(x + a)/b = (x + c)/d', params: { kind: 'cross' } },
    { id: 'diff', label: '(x + a)/b ± (x + c)/d = e', params: { kind: 'diff' } },
  ],
  generate(r, v, fl) {
    const done = (eq, w, sol) => ({ parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq, v: 'x' } }] });
    if (v.kind === 'sum') {
      const [a, b, plus, c, sol] = r.until(() => {
        const [a, b] = r.pick(PAIRS), plus = r.chance(0.65);
        if (a === b) return null;
        const k = plus ? new F(1, a).add(new F(1, b)) : new F(1, a).sub(new F(1, b));
        if (k.isZero) return null;
        // choose the answer first (a multiple of the lcm) so that c is a whole number
        let c, s;
        if (fl.integer) {
          const x0 = lcm(a, b) * r.int(1, 3);
          s = new F(x0); const cc = k.mul(s);
          if (!cc.isInt || cc.isNeg || cc.isZero) return null;
          c = cc.n;
        } else { c = r.int(2, 20); s = new F(c).div(k); }
        return okSol(s, fl, 60) ? [a, b, plus, c, s] : null;
      });
      const L = lcm(a, b), eq = `${frac('x', a)} ${plus ? '+' : '-'} ${frac('x', b)} = ${c}`;
      const w = `${cx(L / a)}x ${plus ? '+' : '-'} ${cx(L / b)}x = ${c * L};\\ ${fin(plus ? L / a + L / b : L / a - L / b, c * L)}`;
      return done(eq, w, sol);
    }
    if (v.kind === 'cross') {
      const [a, m, p, b, n, q, sol] = r.until(() => {
        const [a, b] = r.pick(PAIRS), m = coef(r), n = coef(r), p = r.int(-9, 9), q = r.int(-9, 9);
        if (a === b || gcd(a, b) > 1 || !p || !q || p === q || !reduced(m, p, a) || !reduced(n, q, b)) return null;
        // b(mx + p) = a(nx + q)
        const den = b * m - a * n; if (!den) return null;
        const s = new F(a * q - b * p, den);
        return okSol(s, fl) ? [a, m, p, b, n, q, s] : null;
      });
      const N1 = axb(m, p), N2 = axb(n, q);
      const eq = `${frac(N1, a)} = ${frac(N2, b)}`;
      const w = `${b}(${N1}) = ${a}(${N2});\\ ${axb(b * m, b * p)} = ${axb(a * n, a * q)};\\ ${fin(b * m - a * n, a * q - b * p)}`;
      return done(eq, w, sol);
    }
    const [a, m, p, b, n, q, plus, c, sol] = r.until(() => {
      const [a, b] = r.pick(PAIRS), m = coef(r), n = coef(r), p = r.int(-9, 9), q = r.int(-9, 9), plus = r.chance(0.45);
      if (a === b || !p || !q || !reduced(m, p, a) || !reduced(n, q, b)) return null;
      const L = lcm(a, b), sg = plus ? 1 : -1;
      // (L/a)(mx + p) + sg (L/b)(nx + q) = cL
      const X = (L / a) * m + sg * (L / b) * n, K = (L / a) * p + sg * (L / b) * q;
      if (!X) return null;
      let c;
      if (fl.integer) {
        const x0 = r.int(-7, 12); if (!x0) return null;
        const cf = new F(X * x0 + K, L); if (!cf.isInt || cf.isZero) return null; c = cf.n;
      } else c = r.int(-6, 12);
      if (!c) return null;
      const s = new F(c * L - K, X);
      return okSol(s, fl) ? [a, m, p, b, n, q, plus, c, s] : null;
    }, 30000);
    const L = lcm(a, b), N1 = axb(m, p), N2 = axb(n, q);
    const eq = `${frac(N1, a)} ${plus ? '+' : '-'} ${frac(N2, b)} = ${c}`;
    const t1 = L / a === 1 ? `(${N1})` : `${L / a}(${N1})`, t2 = L / b === 1 ? `(${N2})` : `${L / b}(${N2})`;
    const ex = P.v('x', 1, m).add(P.c(p)).scale(L / a)[plus ? 'add' : 'sub'](P.v('x', 1, n).add(P.c(q)).scale(L / b));
    const X = ex.coef('x1').n, K = ex.coef('').n;
    const w = `${t1} ${plus ? '+' : '-'} ${t2} = ${c * L};\\ ${ex.tex()} = ${c * L};\\ ${fin(X, c * L - K)}`;
    return done(eq, w, sol);
  },
};
