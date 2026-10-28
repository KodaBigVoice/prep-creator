// Shared helpers for the Fractions: problem solving types (this file is not a question type itself).
import { F, gcd, lcm, plainNum, texNum } from '../core/frac.js';
import { names, pounds, poundsTex } from '../core/q.js';
export { names, pounds };

export const TOPIC = 'Fractions: problem solving';
export const T = (f) => `{{${f.tex()}}}`;                       // a fraction inside a sentence
export const TM = (f) => `{{${f.mixedTex()}}}`;                 // a mixed number inside a sentence
export const M = (s) => `{{${s}}}`;
export const fx = (f) => `Fraction(${f.n},${f.d})`;             // for the independent checker
export const val = (f) => { f = F.of(f); return f.isInt ? String(f.n) : `${f.n}/${f.d}`; };
export const num = (chk, v) => ({ k: 'num', expr: chk, val: val(v) });

// units: txt() for sentences, tex() for answers; singular used for amounts of 1 or less
export const U = (plural, singular = plural) => ({
  txt: (v) => { const f = F.of(v), s = f.val <= 1 ? singular : plural; return f.isInt ? `${plainNum(f.n)} ${s}` : `{{${f.mixedTex()}}} ${s}`; },
  tex: (v) => { const f = F.of(v), s = f.val <= 1 ? singular : plural; return `${f.isInt ? texNum(f.n) : f.mixedTex()}\\text{ ${s}}`; },
});
export const GBP = { txt: (v) => pounds(F.of(v).val), tex: (v) => poundsTex(F.of(v).val) };

// a proper fraction in lowest terms, denominator from dens, numerator at least minN
export function proper(r, dens, minN = 1) {
  const d = r.pick(dens), ks = [];
  for (let k = minN; k < d; k++) if (gcd(k, d) === 1) ks.push(k);
  return ks.length ? new F(r.pick(ks), d) : null;
}
// a multiple of d in [lo, hi]
export function multiple(r, d, lo, hi) {
  const ks = []; for (let k = Math.ceil(lo / d); k * d <= hi; k++) ks.push(k);
  return ks.length ? r.pick(ks) * d : null;
}
export { F, gcd, lcm };
