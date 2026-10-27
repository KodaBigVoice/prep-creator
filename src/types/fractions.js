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
