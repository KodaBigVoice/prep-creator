import { TOPIC, M, F, gcd, ratioOf, PAIRS } from './ratio.js';

export default {
  id: 'rp-change',
  topic: TOPIC, type: 'Changing a ratio', code: 'RP16',
  levels: ['Additional'],
  search: 'ratio changes add remove counters new ratio how many must be added',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'add', label: 'some are added:  new ratio', params: { k: 'add' } },
    { id: 'remove', label: 'some are taken away:  new ratio', params: { k: 'rem' } },
    { id: 'target', label: 'how many must be added to make a given ratio', params: { k: 'tar' } },
  ],
  generate(r, v) {
    const p = r.pick(PAIRS.slice(0, 6));
    if (v.k === 'tar') {
      const [R, B, pp, qq, x] = r.until(() => {
        const [a, b] = ratioOf(r, 2, { max: 6, maxSum: 10 }), u = r.int(2, 8), R = a * u, B = b * u;
        const [pp, qq] = r.pick([[1, 1], [2, 1], [3, 2], [1, 2], [3, 1], [3, 4]]);
        const x = pp * B / qq - R;
        return Number.isInteger(x) && x > 0 && x <= 30 ? [R, B, pp, qq, x] : null;
      });
      return { parts: [{ body: `A bag has ${R} ${p[0]} and ${B} ${p[1]}. How many more ${p[0]} must be added so that the ratio of ${p[0]} to ${p[1]} is ${pp} : ${qq}?`, a: String(x), w: M(`${B} \\div ${qq} = ${B / qq};\\ ${pp} \\times ${B / qq} = ${pp * B / qq};\\ ${pp * B / qq} - ${R} = ${x}`), m: 3, lines: 5, chk: { k: 'num', expr: `${pp}*${B}/${qq}-${R}`, val: String(x) } }] };
    }
    const add = v.k === 'add';
    const [R, B, k, nr, nb, x] = r.until(() => {
      const [a, b] = ratioOf(r, 2, { max: 7, maxSum: 12 }), u = r.int(2, 9), R = a * u, B = b * u, k = r.int(2, 12);
      const x = add ? R + k : R - k;
      if (x <= 0) return null;
      const g = gcd(x, B), nr = x / g, nb = B / g;
      return (nr === a && nb === b) || nr + nb > 25 || nr === nb ? null : [R, B, k, nr, nb, x];
    });
    const act = add ? `${k} more ${p[0]} are put into the bag` : `${k} of the ${p[0]} are taken out of the bag`;
    return { parts: [{ body: `A bag has ${R} ${p[0]} and ${B} ${p[1]}. ${act}. Write down the new ratio of ${p[0]} to ${p[1]}.`, a: `${nr} : ${nb}`, w: M(`${R} ${add ? '+' : '-'} ${k} = ${x};\\ ${x} : ${B} = ${nr} : ${nb}`), m: 3, lines: 5, chk: { k: 'num', expr: `[Fraction(${R}${add ? '+' : '-'}${k},gcd(${R}${add ? '+' : '-'}${k},${B})),Fraction(${B},gcd(${R}${add ? '+' : '-'}${k},${B}))]`, val: `${nr},${nb}` } }] };
  },
};
