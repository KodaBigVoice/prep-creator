import { gcd, lcm } from '../core/frac.js';

const PR = [2, 3, 5, 7, 11, 13];
export const factorise = (n) => { const f = {}; for (const p of PR.concat([17, 19, 23, 29, 31])) while (n % p === 0) { f[p] = (f[p] || 0) + 1; n /= p; } if (n > 1) f[n] = 1; return f; };
export const indexTex = (f) => Object.keys(f).map(Number).sort((a, b) => a - b).map(p => (f[p] === 1 ? `${p}` : `${p}^{${f[p]}}`)).join(' \\times ');

export default {
  id: 'hcf-lcm',
  topic: 'HCF and LCM', type: 'HCF and LCM', code: 'HCF',
  levels: ['Core', 'Additional'],
  search: 'highest common factor lowest common multiple HCF LCM',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'hcf', label: 'HCF of two numbers', params: { k: 'hcf', max: 100 } },
    { id: 'lcm', label: 'LCM of two numbers', params: { k: 'lcm', max: 60 } },
    { id: 'hcf-big', label: 'HCF of two larger numbers', params: { k: 'hcf', max: 300 } },
    { id: 'lcm-big', label: 'LCM of two larger numbers', params: { k: 'lcm', max: 120 } },
    { id: 'both', label: 'HCF and LCM of two numbers (two parts)', params: { k: 'both', max: 100 } },
  ],
  generate(r, v) {
    const [a, b] = r.until(() => {
      const g = r.int(2, 12), x = r.int(2, 9), y = r.int(2, 9);
      if (gcd(x, y) !== 1 || x === y) return null;
      const a = g * x, b = g * y;
      return a <= v.max && b <= v.max && a >= 12 && b >= 12 ? [a, b] : null;
    });
    const g = gcd(a, b), l = lcm(a, b);
    const mk = (kind) => ({
      body: kind === 'hcf' ? `Find the highest common factor (HCF) of ${a} and ${b}.` : `Find the lowest common multiple (LCM) of ${a} and ${b}.`,
      a: String(kind === 'hcf' ? g : l),
      w: `{{${kind === 'hcf' ? `${a} = ${indexTex(factorise(a))};\\ ${b} = ${indexTex(factorise(b))};\\ \\text{HCF} = ${g}` : `${a} = ${indexTex(factorise(a))};\\ ${b} = ${indexTex(factorise(b))};\\ \\text{LCM} = ${l}`}}}`,
      chk: { k: 'num', val: String(kind === 'hcf' ? g : l), expr: kind === 'hcf' ? `gcd(${a},${b})` : `lcm(${a},${b})` },
    });
    if (v.k === 'both') return { stem: `Two numbers are {{${a}}} and {{${b}}}.`, parts: [{ ...mk('hcf'), body: 'Find the highest common factor (HCF) of the two numbers.' }, { ...mk('lcm'), body: 'Find the lowest common multiple (LCM) of the two numbers.' }] };
    return { parts: [mk(v.k)] };
  },
};
