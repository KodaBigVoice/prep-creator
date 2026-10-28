// Shared helpers for the expanding types (this file is not a question type itself).
import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';

export const grp = (p) => `(${p.tex()})`;
// no common factor left in a bracket (so (2x + 4) is not offered as a bracket to expand)
export const prim = (...ps) => ps.every(p => p.terms().reduce((g, [, c]) => gcd(g, c.n), 0) === 1);
export const lin = (c, l, k = 0) => P.mono(c, { [l]: 1 }).add(P.c(k));      // c·l + k

// the terms of several expressions written one after another without collecting like terms: 4x - 24 - 10x - 16
export function rawTex(ps) {
  const out = [];
  ps.forEach(p => p.terms().forEach(([key, c]) => out.push([key, c])));
  return out.map(([key, c], i) => {
    const mag = new P({ [key]: c.abs() }).tex();
    return i === 0 ? (c.isNeg ? '-' : '') + mag : `${c.isNeg ? '-' : '+'} ${mag}`;
  }).join(' ');
}
// every term of A times every term of B, unsimplified (first times first, first times last, ...)
export function foil(A, B) {
  const ps = [];
  A.terms().forEach(([ka, ca]) => B.terms().forEach(([kb, cb]) => ps.push(new P({ [ka]: ca }).mul(new P({ [kb]: cb })))));
  return ps;
}
// A ± B written with brackets where needed
export function chain(ps, signs) {
  let s = ps[0].tex();
  for (let i = 1; i < ps.length; i++) s += signs[i - 1] < 0 ? ` - (${ps[i].tex()})` : ` + ${ps[i].terms()[0][1].isNeg ? grp(ps[i]) : ps[i].tex()}`;
  return s;
}
// A ± B collected
export const combine = (ps, signs) => ps.reduce((acc, p, i) => (i === 0 ? p : acc.add(signs[i - 1] < 0 ? p.neg() : p)), P.c(0));

export function result(q, ans, work) {
  return { parts: [{ body: `{{${q}}}`, a: ans.tex(), w: `{{${work}}}`, chk: { k: 'equiv', q, a: ans.tex() } }] };
}
