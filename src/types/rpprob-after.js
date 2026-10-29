import { PTOPIC, M, F, gcd, names, ratioOf, PAIRS, cf } from './ratio.js';

export default {
  id: 'rpprob-after',
  topic: PTOPIC, type: 'Ratios that change', code: 'RQ5',
  levels: ['Additional', 'Further'],
  search: 'ratio before and after some leave join working back new ratio find the original number',
  verb: '', marks: 4, lines: 8,
  variants: [
    { id: 'leave', label: 'some of one group leave, the ratio changes', params: { k: 'leave' } },
    { id: 'join', label: 'some join, the ratio changes', params: { k: 'join' } },
    { id: 'both', label: 'the same number is added to both parts', params: { k: 'both' }, levels: ['Further'] },
  ],
  generate(r, v) {
    const p = r.pick(PAIRS.slice(0, 6));
    const o = r.until(() => {
      const [a, b] = ratioOf(r, 2, { max: 7, maxSum: 11 }), t = r.int(2, 9), k = r.int(2, 10);
      const X = a * t, Y = b * t;
      let nx = X, ny = Y;
      if (v.k === 'leave') ny = Y - k; else if (v.k === 'join') ny = Y + k; else { nx = X + k; ny = Y + k; }
      if (ny <= 0 || nx <= 0) return null;
      const g = gcd(nx, ny), c = nx / g, d = ny / g;
      if (c === a && d === b) return null;
      if (c + d > 12 || (c * b === d * a)) return null;
      // unique solution: t(d*a - c*b) = k * something (nonzero), as the unknown is t
      const eq = v.k === 'both' ? (d * a - c * b) : (d * a - c * b);
      return eq !== 0 ? { a, b, t, k, X, Y, c, d } : null;
    });
    const { a, b, t, k, X, Y, c, d } = o;
    const verb = v.k === 'leave' ? `${k} of the ${p[1]} are removed` : v.k === 'join' ? `${k} more ${p[1]} are added` : `${k} more of each are added`;
    const newRatio = `${c} : ${d}`;
    const stem = `The ratio of ${p[0]} to ${p[1]} ${p[3]} is ${a} : ${b}. After ${verb}, the ratio of ${p[0]} to ${p[1]} is ${newRatio}.`;
    const eqn = v.k === 'leave' ? `${cf(a)}x : (${cf(b)}x - ${k}) = ${c} : ${d}` : v.k === 'join' ? `${cf(a)}x : (${cf(b)}x + ${k}) = ${c} : ${d}` : `(${cf(a)}x + ${k}) : (${cf(b)}x + ${k}) = ${c} : ${d}`;
    return { parts: [{ body: `${stem} How many ${p[0]} were there at the start?`, a: String(X), w: M(`${eqn};\\ x = ${t};\\ ${a} \\times ${t} = ${X}`), m: 4, lines: 8, chk: { k: 'num', expr: v.k === 'leave' ? `${c}*${k}/(${c}*${b}-${d}*${a})*${a}` : v.k === 'join' ? `${c}*${k}/(${d}*${a}-${c}*${b})*${a}` : `${k}*(${c}-${d})/(${d}*${a}-${c}*${b})*${a}`, val: String(X) } }] };
  },
};
