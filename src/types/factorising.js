// Shared helpers for the factorising types (this file is not a question type itself).
import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';

export const LETTERS = ['x', 'y', 'a', 'b', 'n', 'p', 't', 'm'];
export const mono = (c, vars = {}) => P.mono(c, vars);

// Is there nothing left to take out of this bracket, and does it start with a positive term?
export function innerOk(inner) {
  const ts = Object.entries(inner.t);
  if (ts.length < 2) return false;
  let g = 0; for (const [, c] of ts) g = gcd(g, c.n);
  if (g !== 1) return false;
  const vars = new Set(); ts.forEach(([k]) => (k.match(/[a-z]/g) || []).forEach(v => vars.add(v)));
  for (const v of vars) if (!ts.some(([k]) => !k.includes(v))) return false;
  return !inner.terms()[0][1].isNeg;
}

// out(inner): the question is the expansion, the answer is the factorised form
export function commonFactor(out, inner) {
  const q = out.mul(inner), o = out.tex(), i = inner.tex();
  return { parts: [{ body: `{{${q.tex()}}}`, a: `${o}(${i})`, w: `{{\\text{common factor } ${o}}}`, chk: { k: 'factor', q: q.tex(), out: o, in: i } }] };
}

// a fully factorised product: content, then a list of brackets (each already in TeX)
export function product(q, content, factors, work = null) {
  const lead = content === 1 ? '' : String(content);
  const bits = factors.map(f => (/^[a-z]$/.test(f) ? f : `(${f})`));
  const a = lead + bits.join('');
  return { parts: [{ body: `{{${q.tex()}}}`, a, w: `{{${work || a}}}`, chk: { k: 'factorfull', q: q.tex(), content, factors } }] };
}

export const num = (n) => (n < 0 ? `(${n})` : String(n));
