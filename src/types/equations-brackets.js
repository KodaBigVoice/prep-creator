import { F, gcd } from '../core/frac.js';
import { P } from '../core/poly.js';
import { axb, bax, cx, fin, xAns, okSol } from './equations.js';

// expanded form with the x term first, e.g. "-3x + 12"
const ex = (a, b) => P.v('x', 1, a).add(P.c(b)).tex();

export default {
  id: 'equations-brackets',
  topic: 'Equations', type: 'Brackets', code: 'EQK',
  levels: ['Core', 'Additional'],
  search: 'solve equation brackets expand',
  verb: 'Solve', marks: 2, lines: 4,
  integer: true,
  variants: [
    { id: 'one', label: 'one bracket: a(bx + c) = d', params: { kind: 'one' } },
    { id: 'neg', label: 'negative number outside: −a(x + b) = c', params: { kind: 'neg' } },
    { id: 'xside', label: 'bracket one side, x term the other: a(x + b) = cx + d', params: { kind: 'xside' } },
    { id: 'both', label: 'brackets on both sides: a(x + b) = c(x + d)', params: { kind: 'both' } },
    { id: 'sub', label: 'subtracting a bracket: e − a(x + b) = f − gx', params: { kind: 'sub' } },
  ],
  generate(r, v, fl) {
    const done = (eq, w, sol) => ({ parts: [{ body: `{{${eq}}}`, a: xAns(sol), w: `{{${w}}}`, chk: { k: 'solve', eq, v: 'x' } }] });
    if (v.kind === 'one') {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 7), b = r.chance(0.5) ? 1 : r.int(2, 4), c = r.int(-9, 9), d = r.int(3, 48);
        if (!c || gcd(b, c) > 1) return null;
        const s = new F(d - a * c, a * b);
        return okSol(s, fl) ? [a, b, c, d, s] : null;
      });
      const eq = `${a}(${axb(b, c)}) = ${d}`;
      return done(eq, `${ex(a * b, a * c)} = ${d};\\ ${fin(a * b, d - a * c)}`, sol);
    }
    if (v.kind === 'neg') {
      const [a, b, c, sol] = r.until(() => {
        const a = r.int(2, 7), b = r.int(-9, 9), c = r.int(-30, 30);
        if (!b || !c) return null;
        const s = new F(-c - a * b, a);          // -a(x+b) = c  ->  -ax - ab = c  ->  x = -(c + ab)/a
        return okSol(s, fl) ? [a, b, c, s] : null;
      });
      const eq = `-${a}(${axb(1, b)}) = ${c}`;
      // -ax - ab = c  ->  -ax = c + ab
      return done(eq, `${ex(-a, -a * b)} = ${c};\\ ${fin(-a, c + a * b)}`, sol);
    }
    if (v.kind === 'xside') {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 8), c = r.int(1, 8), b = r.int(-8, 9), d = r.int(-9, 20);
        if (a === c || !b || !d) return null;
        const s = new F(d - a * b, a - c);
        return okSol(s, fl) ? [a, b, c, d, s] : null;
      });
      const eq = `${a}(${axb(1, b)}) = ${axb(c, d)}`;
      const p = a - c;
      return done(eq, `${ex(a, a * b)} = ${axb(c, d)};\\ ${p > 0 ? fin(p, d - a * b) : `${a * b - d} = ${cx(-p)}x;\\ ${xAns(sol)}`}`, sol);
    }
    if (v.kind === 'both') {
      const [a, b, c, d, sol] = r.until(() => {
        const a = r.int(2, 7), c = r.int(2, 7), b = r.int(-6, 8), d = r.int(-6, 8);
        if (a === c || !b || !d || b === d) return null;
        const s = new F(c * d - a * b, a - c);
        return okSol(s, fl) ? [a, b, c, d, s] : null;
      });
      const eq = `${a}(${axb(1, b)}) = ${c}(${axb(1, d)})`;
      const p = a - c;
      return done(eq, `${ex(a, a * b)} = ${ex(c, c * d)};\\ ${p > 0 ? fin(p, c * d - a * b) : `${a * b - c * d} = ${cx(-p)}x;\\ ${xAns(sol)}`}`, sol);
    }
    // sub:  e - a(x + b) = f - gx
    const [e, a, b, f, g, sol] = r.until(() => {
      const e = r.int(2, 14), a = r.int(2, 6), b = r.int(1, 6) * r.sign(), f = r.int(0, 20), g = r.int(1, 8);
      if (a === g || !f) return null;
      const s = new F(f - e + a * b, g - a);     // e - ab - ax = f - gx  ->  (g - a)x = f - e + ab
      return okSol(s, fl) ? [e, a, b, f, g, s] : null;
    });
    const eq = `${e} - ${a}(${axb(1, b)}) = ${bax(f, -g)}`;
    const p = g - a, q = f - e + a * b;
    return done(eq, `${bax(e - a * b, -a)} = ${bax(f, -g)};\\ ${p > 0 ? fin(p, q) : `${-q} = ${cx(-p)}x;\\ ${xAns(sol)}`}`, sol);
  },
};
