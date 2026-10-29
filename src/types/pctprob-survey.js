import { PTOPIC, M, F, names, dstr, valOf, mk, numChk } from './percentages.js';

const SURV = [
  { q: 'favourite sport', a: 'football', b: 'rugby', c: 'cricket' },
  { q: 'favourite fruit', a: 'apples', b: 'bananas', c: 'oranges' },
  { q: 'favourite pet', a: 'dogs', b: 'cats', c: 'rabbits' },
  { q: 'favourite colour', a: 'blue', b: 'red', c: 'green' },
  { q: 'favourite lesson', a: 'art', b: 'maths', c: 'music' },
];
const NS = [40, 60, 80, 100, 120, 160, 200, 240, 300, 400, 500];
const PS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

export default {
  id: 'pctprob-survey',
  topic: PTOPIC, type: 'Survey results', code: 'PP4',
  levels: ['Core'],
  search: 'survey results percentages of a total how many chose the rest compare pie chart',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'rest', label: 'how many chose the third choice?', params: { k: 'rest' } },
    { id: 'compare', label: 'how many more chose one than another?', params: { k: 'cmp' } },
  ],
  generate(r, v) {
    const s = r.pick(SURV);
    const [N, p1, p2] = r.until(() => {
      const N = r.pick(NS), p1 = r.pick(PS), p2 = r.pick(PS);
      return p1 + p2 <= 85 && p1 !== p2 && valOf(N, p1).isInt && valOf(N, p2).isInt ? [N, p1, p2] : null;
    });
    const x = valOf(N, p1), y = valOf(N, p2), z = F.of(N).sub(x).sub(y);
    const stem = `In a survey, ${N} people are asked about their ${s.q}. ${p1}% choose ${s.a}, ${p2}% choose ${s.b} and the rest choose ${s.c}.`;
    if (v.k === 'rest') return { parts: [{ body: `${stem} How many people choose ${s.c}?`, a: String(z.n), w: M(`${p1}\\% \\text{ of } ${N} = ${dstr(x)};\\ ${p2}\\% \\text{ of } ${N} = ${dstr(y)};\\ ${N} - ${dstr(x)} - ${dstr(y)} = ${dstr(z)}`), m: 3, lines: 6, chk: numChk(`${N}-${N}*${p1}/100-${N}*${p2}/100`, z) }] };
    const diff = x.sub(y).abs(), xBig = x.cmp(y) > 0, big = xBig ? x : y, small = xBig ? y : x, first = xBig ? [s.a, s.b] : [s.b, s.a], pb = xBig ? p1 : p2, ps = xBig ? p2 : p1;
    return { parts: [{ body: `${stem} How many more people choose ${first[0]} than ${first[1]}?`, a: String(diff.n), w: M(`${pb}\\% \\text{ of } ${N} = ${dstr(big)};\\ ${ps}\\% \\text{ of } ${N} = ${dstr(small)};\\ ${dstr(big)} - ${dstr(small)} = ${dstr(diff)}`), m: 3, lines: 5, chk: numChk(`${N}*${pb}/100-${N}*${ps}/100`, diff) }] };
  },
};
