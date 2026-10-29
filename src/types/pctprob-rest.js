import { PTOPIC, M, F, plainNum, names, pounds, dstr, valOf, wOf, mk, numChk, GBP, LIT, cnt } from './percentages.js';

const PERC = [
  (n, p) => `In a class, ${p}% of the pupils walk to school. The rest travel by bus. What percentage of the pupils travel by bus?`,
  (n, p) => `${n} answers ${p}% of the questions in a test correctly. What percentage of the questions does ${n} get wrong?`,
  (n, p) => `In a bag of counters, ${p}% of the counters are red. What percentage of the counters are not red?`,
  (n, p) => `A fruit bowl contains only apples and pears. ${p}% of the fruit are apples. What percentage of the fruit are pears?`,
  (n, p) => `A football team wins ${p}% of its matches this season. It does not draw any matches. What percentage of its matches does the team lose?`,
  (n, p) => `In a survey, ${p}% of the people say that they like cricket. What percentage of the people say that they do not like cricket?`,
];
const C = (u, Ns, mkf) => ({ u, Ns, mk: mkf });
const COUNT = [
  C(cnt('pupils', 'pupil'), [40, 60, 80, 100, 120, 160, 200, 240, 300], (n, p, N) => `There are ${N} pupils in Year 7. ${p}% of the pupils walk to school. How many pupils do not walk to school?`),
  C(cnt('chocolates', 'chocolate'), [20, 40, 60, 80, 100], (n, p, N) => `A box contains ${N} chocolates. ${p}% of the chocolates are milk chocolate. How many chocolates are not milk chocolate?`),
  C(cnt('seats', 'seat'), [100, 200, 240, 300, 400, 500, 600], (n, p, N) => `A school hall has ${N} seats. ${p}% of the seats are taken. How many seats are empty?`),
  C(LIT, [40, 80, 100, 120, 160, 200, 400, 500], (n, p, N) => `A water tank holds ${N} litres when it is full. The tank is ${p}% full. How many more litres of water are needed to fill the tank?`),
  C(GBP, [20, 40, 50, 60, 80, 100, 120, 200], (n, p, N) => `${n} is given ${N}. ${n} spends ${p}% of the money. How much money does ${n} have left?`),
];
const NC = [10, 20, 25, 30, 35, 40, 45, 60, 65, 70, 75, 80];

export default {
  id: 'pctprob-rest',
  topic: PTOPIC, type: 'The rest', code: 'PP1',
  levels: ['Core'],
  search: 'percentage not the rest remaining what percentage are not worded problem',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'percent', label: 'what percentage are not…', params: { k: 'percent' } },
    { id: 'count', label: 'how many are not…, from a total', params: { k: 'count' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'percent') {
      const p = r.int(5, 95);
      return { parts: [{ body: r.pick(PERC)(n, p), a: `${100 - p}\\%`, w: M(`100 - ${p} = ${100 - p}`), m: 1, lines: 3, chk: numChk(`100-${p}`, 100 - p) }] };
    }
    const [c, p, N] = r.until(() => {
      const c = r.pick(COUNT), p = r.pick(NC), N = r.pick(c.Ns), x = valOf(N, 100 - p);
      return (c.u.count ? x.isInt : c.u.money ? 100 % x.d === 0 : 10 % x.d === 0) ? [c, p, N] : null;
    });
    const rest = valOf(N, 100 - p), part = valOf(N, p);
    return { parts: [{ body: c.mk(n, p, c.u.money ? pounds(N) : plainNum(N)), a: c.u.tex(rest), w: M(`${wOf(N, p, part)};\\ ${N} - ${dstr(part)} = ${dstr(rest)}`), ...mk(2, c.u), chk: numChk(`${N}*(100-${p})/100`, rest) }] };
  },
};
