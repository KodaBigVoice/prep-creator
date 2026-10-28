// shared helpers for the four fraction types
import { F, gcd, lcm } from '../core/frac.js';
export const DEN = [2, 3, 4, 5, 6, 8, 9, 10, 12, 15];
export function randMixed(r, { wMin = 1, wMax = 6, dens = DEN } = {}) {
  const d = r.pick(dens);
  const choices = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) choices.push(k);
  if (!choices.length) return null;
  const w = r.int(wMin, wMax);
  return new F(w * d + r.pick(choices), d);
}
export const mixedIn = (f) => f.mixedTex();
export const impr = (f) => f.tex();
export const commonDen = (a, b) => lcm(a.d, b.d);
export const asDen = (f, d) => `\\dfrac{${f.n * (d / f.d)}}{${d}}`;

// ---- helpers added for the Fractions ladder ----
export const M = (s) => `{{${s}}}`;                       // wrap TeX for a body/working string
// a proper fraction in lowest terms with a denominator from `dens`
export function proper(r, dens = DEN) {
  const d = r.pick(dens);
  const ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k);
  return ks.length ? new F(r.pick(ks), d) : null;
}
// working for A + B or A - B: question, common denominator, one fraction, simplified, mixed number
export function addSubWork(A, B, op) {
  const L = lcm(A.d, B.d), res = op === '+' ? A.add(B) : A.sub(B);
  const top = op === '+' ? A.n * (L / A.d) + B.n * (L / B.d) : A.n * (L / A.d) - B.n * (L / B.d);
  const steps = [`${A.tex()} ${op} ${B.tex()}`];
  if (A.d !== B.d) steps.push(`${asDen(A, L)} ${op} ${asDen(B, L)}`);
  steps.push(`\\dfrac{${top}}{${L}}`);
  if (res.d !== L) steps.push(res.tex());
  const m = res.mixed();
  if (m.w > 0 && m.n > 0) steps.push(res.mixedTex());
  return [...new Set(steps)].join(' = ');
}
// a single-answer part (the usual shape)
export const part = (body, a, w, chk, extra = {}) => ({ body, a, w, chk, ...extra });
