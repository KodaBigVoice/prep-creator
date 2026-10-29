import { PTOPIC, M, F, names, ratioOf, sumOf, mk } from './ratio.js';

const yrs = { meas: true, tex: (n) => `${n}\\text{ years}` };
export default {
  id: 'rpprob-ages',
  topic: PTOPIC, type: 'Ages in a ratio', code: 'RQ4',
  levels: ['Additional'],
  search: 'ages ratio now years time father son total age',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'now', label: 'ages in a ratio with a total: find one age', params: { k: 'now' } },
    { id: 'future', label: 'ages in a ratio now: find an age in some years', params: { k: 'fut' } },
    { id: 'times', label: 'one is a number of times older:  find the ages', params: { k: 'times' }, levels: ['Further'] },
  ],
  generate(r, v) {
    const [n1, n2] = names(r, 2);
    if (v.k === 'times') {
      const m = r.int(2, 5), s = r.int(5, 14), f = m * s, tot = f + s;
      return { parts: [{ body: `${n1} is ${m} times as old as ${n2}. The sum of their ages is ${tot}. How old is ${n2}?`, a: yrs.tex(s), w: M(`${m} + 1 = ${m + 1};\\ ${tot} \\div ${m + 1} = ${s}`), ...mk(3, yrs), chk: { k: 'num', expr: `${tot}/(${m}+1)`, val: String(s) } }] };
    }
    const [a, b] = ratioOf(r, 2, { max: 7, maxSum: 11 }), unit = r.int(2, 9), A = a * unit, B = b * unit, sum = a + b, tot = A + B;
    if (v.k === 'now') {
      const askA = r.chance(0.5), ans = askA ? A : B;
      return { parts: [{ body: `The ratio of ${n1}'s age to ${n2}'s age is ${a} : ${b}. The sum of their ages is ${tot} years. How old is ${askA ? n1 : n2}?`, a: yrs.tex(ans), w: M(`${tot} \\div ${sum} = ${unit};\\ ${askA ? a : b} \\times ${unit} = ${ans}`), ...mk(2, yrs), chk: { k: 'num', expr: `${tot}/${sum}*${askA ? a : b}`, val: String(ans) } }] };
    }
    const k = r.int(2, 10), ans = A + k, ask = r.chance(0.5);
    return { parts: [{ body: `The ratio of ${n1}'s age to ${n2}'s age is ${a} : ${b}. The sum of their ages is ${tot} years. How old will ${ask ? n1 : n2} be in ${k} years?`, a: yrs.tex(ask ? A + k : B + k), w: M(`${tot} \\div ${sum} = ${unit};\\ ${ask ? a : b} \\times ${unit} = ${ask ? A : B};\\ ${ask ? A : B} + ${k} = ${(ask ? A : B) + k}`), ...mk(3, yrs), chk: { k: 'num', expr: `${tot}/${sum}*${ask ? a : b}+${k}`, val: String((ask ? A : B) + k) } }] };
  },
};
