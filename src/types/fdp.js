// Shared helpers for the Fractions, decimals and percentages (FDP) types (this file is not a question type itself).
import { F, gcd } from '../core/frac.js';

export const TOPIC = 'Fractions, decimals and percentages (FDP)';
export const M = (s) => `{{${s}}}`;
export const val = (f) => (f.isInt ? String(f.n) : `${f.n}/${f.d}`);
export const num = (expr, v) => ({ k: 'num', expr, val: v });
export const CORE_D = [2, 4, 5, 10, 20, 25, 50];      // denominators that go into 10 or 100

// n / 10^k written with exactly k decimal places, e.g. dp(35, 2) = '0.35', dp(5, 2) = '0.05'
export function dp(n, k) {
  const s = String(n).padStart(k + 1, '0');
  return k ? `${s.slice(0, -k)}.${s.slice(-k)}` : s;
}
// a terminating fraction as a decimal string, no trailing zeros
export function decStr(f) {
  let k = 0;
  while ((10 ** k) % f.d) { k++; if (k > 9) throw new Error('not terminating'); }
  const m = f.n * (10 ** k / f.d), s = String(m).padStart(k + 1, '0');
  if (!k) return s;
  const ip = s.slice(0, -k), fp = s.slice(-k).replace(/0+$/, '');
  return fp ? `${ip}.${fp}` : ip;
}
export const pct = (f) => `${decStr(f.mul(100))}\\%`;
export const terminates = (d) => { while (d % 2 === 0) d /= 2; while (d % 5 === 0) d /= 5; return d === 1; };
// the smallest power of ten the denominator divides into
export const tenPow = (d) => { let k = 1; while ((10 ** k) % d) k++; return 10 ** k; };

export function proper(r, dens, minN = 1) {
  const d = r.pick(dens), ks = [];
  for (let k = minN; k < d; k++) if (gcd(k, d) === 1) ks.push(k);
  return ks.length ? new F(r.pick(ks), d) : null;
}
// long division: integer part, non-repeating digits, repeating digits ('' if it terminates)
export function recur(f) {
  const ip = Math.floor(f.n / f.d);
  let rem = f.n % f.d; const digits = [], seen = new Map();
  while (rem && !seen.has(rem)) { seen.set(rem, digits.length); rem *= 10; digits.push(Math.floor(rem / f.d)); rem %= f.d; }
  if (!rem) return { int: ip, nr: digits.join(''), rep: '' };
  const s = seen.get(rem);
  return { int: ip, nr: digits.slice(0, s).join(''), rep: digits.slice(s).join('') };
}
export const dotTex = ({ int, nr, rep }) =>
  `${int}.${nr}${rep.length === 1 ? `\\dot{${rep}}` : `\\dot{${rep[0]}}${rep.slice(1, -1)}\\dot{${rep[rep.length - 1]}}`}`;
export const barTex = ({ int, nr, rep }) => `${int}.${nr}\\overline{${rep}}`;
export { F, gcd };
