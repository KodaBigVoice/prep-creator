import { TOPIC, M, F, gcd, decStr, pct, num, val } from './fdp.js';

export default {
  id: 'fdp-beyond',
  topic: TOPIC, type: 'Beyond one whole', code: 'FD7',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'percentages over 100 mixed number decimal greater than one FDP',
  verb: '', marks: 2, lines: 2,
  variants: [
    { id: 'perc', label: 'a percentage over 100:  125% as a mixed number and a decimal', params: { kind: 'perc' } },
    { id: 'mixed', label: 'a mixed number:  2 3/5 as a decimal and a percentage', params: { kind: 'mixed', dens: [2, 4, 5, 10, 20, 25] } },
    { id: 'hard', label: 'eighths and 40ths:  1 3/8 as a decimal and a percentage', params: { kind: 'mixed', dens: [8, 40] }, levels: ['Additional'] },
  ],
  generate(r, v) {
    if (v.kind === 'perc') {
      const p = r.pick(Array.from({ length: 41 }, (_, i) => 105 + 5 * i).filter(x => x % 100 !== 0 && x <= 300)), f = new F(p, 100);
      return { stem: `Write {{${p}\\%}} as:`, parts: [
        { body: 'a mixed number', a: f.mixedTex(), w: M(`${p}\\% = \\dfrac{${p}}{100} = ${f.tex()} = ${f.mixedTex()}`), m: 1, lines: 2, chk: num(`Fraction(${p},100)`, val(f)) },
        { body: 'a decimal', a: decStr(f), w: M(`${p}\\% = ${p} \\div 100 = ${decStr(f)}`), m: 1, lines: 2, chk: num(`Fraction(${p},100)`, decStr(f)) },
      ] };
    }
    const [d, n] = r.until(() => { const d = r.pick(v.dens), ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k); return ks.length ? [d, r.pick(ks)] : null; });
    const w0 = r.int(1, 4), f = new F(n, d).add(w0);
    return { stem: `Write {{${f.mixedTex()}}} as:`, parts: [
      { body: 'a decimal', a: decStr(f), w: M(`${f.mixedTex()} = ${decStr(f)}`), m: 1, lines: 2, chk: num(`Fraction(${f.n},${f.d})`, decStr(f)) },
      { body: 'a percentage', a: pct(f), w: M(`${decStr(f)} \\times 100 = ${decStr(f.mul(100))}\\%`), m: 1, lines: 2, chk: num(`Fraction(${f.n},${f.d})*100`, decStr(f.mul(100))) },
    ] };
  },
};
