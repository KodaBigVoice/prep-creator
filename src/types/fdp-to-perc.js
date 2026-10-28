import { TOPIC, M, F, gcd, decStr, num, pct, CORE_D, dp } from './fdp.js';

export default {
  id: 'fdp-to-perc',
  topic: TOPIC, type: 'Decimals and fractions to percentages', code: 'FD4',
  levels: ['Foundation', 'Core'],
  search: 'decimal fraction to percentage convert FDP',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'dec', label: 'a decimal to a percentage:  0.6, 0.35, 0.07', params: { kind: 'dec' } },
    { id: 'frac', label: 'a fraction to a percentage:  7/20', params: { kind: 'frac' } },
    { id: 'harddec', label: 'a decimal with three places:  0.125, 0.045', params: { kind: 'harddec' }, levels: ['Additional'] },
    { id: 'hard', label: 'a fraction to a decimal percentage:  3/8, 7/40', params: { kind: 'hard' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    let f, shown;
    if (v.kind === 'dec') {
      const k = r.chance(0.35) ? 1 : 2, n = r.pick(Array.from({ length: k === 1 ? 9 : 99 }, (_, i) => i + 1).filter(x => k === 1 || x % 10));
      f = new F(n, 10 ** k); shown = dp(n, k);
    } else if (v.kind === 'harddec') {
      const n = r.pick(Array.from({ length: 999 }, (_, i) => i + 1).filter(x => x % 10 === 5));
      f = new F(n, 1000); shown = dp(n, 3);
    } else {
      const dens = v.kind === 'frac' ? [4, 5, 10, 20, 25, 50] : [8, 16, 40];
      const [d, n] = r.until(() => { const d = r.pick(dens), ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k); return ks.length ? [d, r.pick(ks)] : null; });
      f = new F(n, d); shown = f.tex();
    }
    const p = f.mul(100);
    const w = v.kind === 'dec' || v.kind === 'harddec' ? `${shown} \\times 100 = ${decStr(p)}\\%` : `${shown} \\times 100 = ${decStr(p)}\\%`;
    return { parts: [{ body: `Write {{${shown}}} as a percentage.`, a: pct(f), w: M(w), chk: num(`Fraction(${f.n},${f.d})*100`, decStr(p)) }] };
  },
};
