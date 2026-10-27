// Helpers shared by the question types.
import { F } from './frac.js';

export const FIRST = ['Amy','Ben','Chloe','Dev','Ella','Femi','Grace','Harry','Isla','Jack','Kai','Layla','Mia','Noah','Olivia','Priya','Quinn','Ravi','Sofia','Tom','Uma','Victor','Will','Zara','Aisha','Callum','Hana','Leo','Maya','Omar'];
export const names = (r, k) => r.sample(FIRST, k);
export const pounds = (v) => {                     // plain text: £1,250 or £4.50
  const x = typeof v === 'number' ? v : v.val;
  const s = Number.isInteger(x) ? String(x) : x.toFixed(2);
  return '£' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
export const poundsTex = (v) => {                  // for answers (TeX)
  const x = typeof v === 'number' ? v : v.val;
  const s = Number.isInteger(x) ? String(x) : x.toFixed(2);
  return '\\pounds ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
};
export const m = (t) => `{{${t}}}`;                 // wrap TeX for use inside text
export const unit = (u) => `\\text{ ${u}}`;
export const num = (x) => (x instanceof F ? (x.isInt ? String(x.n) : x.mixedTex()) : String(x));
export const dec = (x, dp) => {                    // decimal string with exactly dp places
  const s = (Math.round(x * 10 ** dp + 1e-9 * Math.sign(x)) / 10 ** dp).toFixed(dp);
  return s;
};
export const trimZeros = (s) => (String(s).includes('.') ? String(s).replace(/0+$/, '').replace(/\.$/, '') : String(s));
