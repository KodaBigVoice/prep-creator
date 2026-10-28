import { TOPIC, M, F, gcd, decStr, pct, num, val, CORE_D } from './fdp.js';

export default {
  id: 'fdp-table',
  topic: TOPIC, type: 'One value in all three forms', code: 'FD5',
  levels: ['Core'],
  multipart: true,
  search: 'fraction decimal percentage equivalent table FDP three forms',
  verb: '', marks: 2, lines: 2,
  variants: [
    { id: 'frac', label: 'given a fraction:  7/20 as a decimal and a percentage', params: { given: 'frac', hard: false } },
    { id: 'dec', label: 'given a decimal:  0.35 as a fraction and a percentage', params: { given: 'dec', hard: false } },
    { id: 'perc', label: 'given a percentage:  35% as a fraction and a decimal', params: { given: 'perc', hard: false } },
    { id: 'hard', label: 'eighths and 40ths, any form given', params: { given: 'any', hard: true }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const dens = v.hard ? [8, 40] : [4, 5, 20, 25, 50];
    const f = r.until(() => {
      const d = r.pick(dens), ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k);
      return ks.length ? new F(r.pick(ks), d) : null;
    });
    const form = v.given === 'any' ? r.pick(['frac', 'dec', 'perc']) : v.given;
    const FR = { name: 'a fraction', tex: f.tex(), chk: num(`Fraction(${f.n},${f.d})`, val(f)) };
    const DE = { name: 'a decimal', tex: decStr(f), chk: num(`Fraction(${f.n},${f.d})`, decStr(f)) };
    const PC = { name: 'a percentage', tex: pct(f), chk: num(`Fraction(${f.n},${f.d})*100`, decStr(f.mul(100))) };
    const given = { frac: FR, dec: DE, perc: PC }[form], others = [FR, DE, PC].filter(x => x !== given);
    const wk = { frac: `${DE.tex} = ${FR.tex}`, dec: `${FR.tex} = ${DE.tex}`, perc: `${FR.tex} = ${PC.tex}` };
    return { stem: `Write {{${given.tex}}} as:`, parts: others.map(o => ({
      body: o.name, a: o.tex, w: M(`${given.tex} = ${o.tex}`), m: 1, lines: 2, chk: o.chk,
    })) };
  },
};
