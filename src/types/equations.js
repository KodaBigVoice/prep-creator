// Shared helpers for the equation types (this file is not a question type itself).
import { F } from '../core/frac.js';
import { P } from '../core/poly.js';

export const xAns = (f, v = 'x') => `${v} = ${f.mixedTex()}`;
export const showF = (f) => (f.isInt ? String(f.n) : f.mixedTex());

// the number in front of x: 1 -> "", -1 -> "-", 5 -> "5"
export const cx = (k) => (k === 1 ? '' : k === -1 ? '-' : String(k));
// "ax + b" in the usual order
export const axb = (a, b) => P.v('x', 1, a).add(P.c(b)).tex();
// "b + ax" with the number first, e.g. 11 - 3x
export function bax(b, a) {
  if (b === 0) return `${cx(a)}x`;
  if (a === 0) return String(b);
  return `${b} ${a < 0 ? '-' : '+'} ${cx(Math.abs(a))}x`;
}
// a signed number as a bracketed term, e.g. (x - 4)
export const bracket = (a, b) => `(${axb(a, b)})`;

// Is this solution acceptable? integer-only gives whole non-zero answers;
// otherwise a "nice" fraction (small denominator, modest size).
export function okSol(sol, fl, max = 12) {
  if (sol.isZero) return false;
  if (sol.abs().val > max) return false;
  return fl.integer ? sol.isInt : (!sol.isInt && sol.d <= 6);
}

// Final line of a worked solution: "p x = q;  x = answer"  (p is made positive; a coefficient of 1 is dropped)
export function fin(p, q) {
  if (p < 0) { p = -p; q = -q; }
  const sol = new F(q, p);
  return p === 1 ? xAns(sol) : `${p}x = ${q};\\ ${xAns(sol)}`;
}

// Working for  ax + b = cx + d : collect the x terms on the side with the larger coefficient
export function sidesWork(a, b, c, d) {
  const p = a - c;
  if (p > 0) return fin(p, d - b);
  const sol = new F(b - d, -p);
  return `${b - d} = ${cx(-p)}x;\\ ${xAns(sol)}`;
}
// A random "unknown on both sides" question. gen() returns [a, b, c, d]; fmtL / fmtR write each side.
export function sidesQuestion(r, fl, gen, fmtL, fmtR, accept = () => true) {
  const [a, b, c, d, sol] = r.until(() => {
    const t = gen(); if (!t) return null;
    const [a, b, c, d] = t;
    if (a === c) return null;
    const sol = new F(d - b, a - c);
    return okSol(sol, fl, 15) && accept(sol) ? [a, b, c, d, sol] : null;
  });
  const L = fmtL(a, b), R = fmtR(c, d);
  return { parts: [{ body: `{{${L} = ${R}}}`, a: xAns(sol), w: `{{${sidesWork(a, b, c, d)}}}`, chk: { k: 'solve', eq: `${L} = ${R}`, v: 'x' } }] };
}
