import { TOPIC, M, F, gcd, decStr, num, val, pct } from './fdp.js';

export default {
  id: 'fdp-perc-to-fd',
  topic: TOPIC, type: 'Percentages to fractions and decimals', code: 'FD3',
  levels: ['Foundation', 'Core'],
  search: 'percentage to fraction decimal convert FDP',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'frac', label: 'to a fraction:  35%', params: { to: 'frac', hard: false } },
    { id: 'dec', label: 'to a decimal:  35%', params: { to: 'dec', hard: false } },
    { id: 'hardfrac', label: 'decimal percentage to a fraction:  12.5%', params: { to: 'frac', hard: true }, levels: ['Additional'] },
    { id: 'harddec', label: 'decimal percentage to a decimal:  6.5%', params: { to: 'dec', hard: true }, levels: ['Additional'] },
  ],
  generate(r, v) {
    // the percentage as a fraction of 100: whole percentages, or halves of a percentage
    const p2 = v.hard ? r.pick([1, 3, 5, 9, 13, 15, 17, 25, 35, 45, 65, 75, 125, 175]) : r.pick(Array.from({ length: 98 }, (_, i) => i + 2).filter(x => x % 5 !== 0 || r.chance(0.4)));
    const f = v.hard ? new F(p2, 200) : new F(p2, 100);
    const shown = v.hard ? `${p2 / 2}\\%` : `${p2}\\%`;
    const num100 = v.hard ? String(p2 / 2) : String(p2);
    let a, w;
    if (v.to === 'frac') {
      a = f.tex();
      w = v.hard
        ? `${shown} = \\dfrac{${num100}}{100} = \\dfrac{${p2}}{200}${a === `\\dfrac{${p2}}{200}` ? '' : ` = ${a}`}`
        : `${shown} = \\dfrac{${p2}}{100} = ${a}`;
      if (!v.hard && f.d === 100) w = `${shown} = ${a}`;
    } else {
      a = decStr(f); w = `${shown} = ${num100} \\div 100 = ${a}`;
    }
    return { parts: [{ body: `Write {{${shown}}} as ${v.to === 'frac' ? 'a fraction' : 'a decimal'}.`, a, w: M(w), chk: num(`Fraction('${num100}')/100`, v.to === 'frac' ? val(f) : a) }] };
  },
};
