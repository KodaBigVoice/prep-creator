import { TOPIC, PAIRS, TRIPLES, ratioOf, pairSentence, rtx, gcdAll, listChk } from './ratio.js';

export default {
  id: 'rp-write',
  topic: TOPIC, type: 'Writing a ratio', code: 'RP1',
  levels: ['Foundation', 'Core'],
  search: 'write a ratio from counts boys to girls order matters three-part',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'counts', label: 'two quantities:  3 red and 5 blue, red to blue', params: { k: 'c' } },
    { id: 'order', label: 'second quantity first:  girls to boys', params: { k: 'o' } },
    { id: 'three', label: 'three quantities:  red : blue : green', params: { k: 't' } },
  ],
  generate(r, v) {
    if (v.k === 't') {
      const t = r.pick(TRIPLES), xs = ratioOf(r, 3, { max: 12, maxSum: 30, distinct: false, min: 2 });
      const sent = `There are ${xs[0]} ${t[0]}, ${xs[1]} ${t[1]} and ${xs[2]} ${t[2]} ${t[3]} ${t[4]}.`;
      return { parts: [{ body: `${sent} Write down the ratio ${t[0]} : ${t[1]} : ${t[2]}.`, a: `${xs[0]} : ${xs[1]} : ${xs[2]}`, w: `{{${xs.join(' : ')}}}`, m: 1, lines: 2, chk: listChk(xs.map(String), xs) }] };
    }
    const p = r.pick(PAIRS), [x, y] = ratioOf(r, 2, { max: 15, maxSum: 28, min: 2 }), flip = v.k === 'o';
    const [A, B] = flip ? [p[1], p[0]] : [p[0], p[1]], [a, b] = flip ? [y, x] : [x, y];
    return { parts: [{ body: `${pairSentence(p, x, y)} Write down the ratio of ${A} to ${B}.`, a: `${a} : ${b}`, w: `{{${a} : ${b}}}`, m: 1, lines: 2, chk: listChk([String(a), String(b)], [a, b]) }] };
  },
};
