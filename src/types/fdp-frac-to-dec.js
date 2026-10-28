import { TOPIC, M, F, gcd, decStr, num, tenPow, CORE_D } from './fdp.js';

export default {
  id: 'fdp-frac-to-dec',
  topic: TOPIC, type: 'Fractions to decimals', code: 'FD2',
  levels: ['Foundation', 'Core'],
  search: 'fraction to decimal convert FDP eighths',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'tenths', label: 'halves, fifths, tenths:  3/5', params: { dens: [2, 5, 10], whole: false } },
    { id: 'hundredths', label: 'quarters, twentieths, 25ths, 50ths:  7/20', params: { dens: [4, 20, 25, 50], whole: false } },
    { id: 'mixed', label: 'mixed numbers:  2 3/5', params: { dens: CORE_D, whole: true } },
    { id: 'eighths', label: 'eighths:  3/8', params: { dens: [8], whole: false }, levels: ['Additional'] },
    { id: 'harder', label: 'harder denominators:  7/40, 3/16', params: { dens: [16, 40, 80, 125], whole: false }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [d, n] = r.until(() => {
      const d = r.pick(v.dens), ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k);
      return ks.length ? [d, r.pick(ks)] : null;
    });
    const w0 = v.whole ? r.int(1, 5) : 0, f = new F(n, d).add(w0), K = tenPow(d);
    const body = `Write {{${f.mixedTex()}}} as a decimal.`;
    const steps = `\\dfrac{${n}}{${d}} = \\dfrac{${n * (K / d)}}{${K}} = ${decStr(new F(n, d))}`;
    return { parts: [{ body, a: decStr(f), w: M(w0 ? `${f.mixedTex()} = ${w0} + ${steps} = ${decStr(f)}` : steps), chk: num(`Fraction(${f.n},${f.d})`, decStr(f)) }] };
  },
};
