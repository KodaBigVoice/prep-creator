import { PTOPIC, M, F, plainNum, names, pounds, dstr, valOf, wOf, mk, numChk, GBP, LIT, cnt } from './percentages.js';

const OF = [
  (n, N, p1, p2) => `There are ${plainNum(N)} pupils in a school. ${p1}% of the pupils play football. ${p2}% of the pupils who play football are in Year 7. How many pupils who play football are in Year 7?`,
  (n, N, p1, p2) => `A bag contains ${plainNum(N)} sweets. ${p1}% of the sweets are fruit flavoured. ${p2}% of the fruit flavoured sweets are strawberry. How many strawberry sweets are in the bag?`,
  (n, N, p1, p2) => `A library has ${plainNum(N)} books. ${p1}% of the books are fiction. ${p2}% of the fiction books are new. How many new fiction books are in the library?`,
  (n, N, p1, p2) => `${plainNum(N)} people take part in a survey. ${p1}% of them own a pet. ${p2}% of the people who own a pet have a dog. How many of the people have a dog?`,
];
const REST = [
  { u: cnt('pupils', 'pupil'), Ns: [100, 200, 240, 300, 400, 500], mk: (n, N, p1, p2) => `Of the ${plainNum(N)} pupils in a year group, ${p1}% walk to school. The rest are driven or take the bus. ${p2}% of the pupils who do not walk take the bus. How many pupils take the bus?` },
  { u: cnt('T-shirts', 'T-shirt'), Ns: [100, 200, 300, 400, 500, 800], mk: (n, N, p1, p2) => `A shop has ${plainNum(N)} T-shirts. ${p1}% of them are sold on Saturday. On Sunday, ${p2}% of the T-shirts that are left are sold. How many T-shirts are sold on Sunday?` },
  { u: LIT, Ns: [100, 200, 400, 500, 800, 1000], mk: (n, N, p1, p2) => `A tank holds ${plainNum(N)} litres of water. In the morning, ${p1}% of the water is used. In the afternoon, ${p2}% of the water that is left is used. How many litres of water are used in the afternoon?` },
  { u: GBP, Ns: [100, 200, 300, 400, 500, 800], mk: (n, N, p1, p2) => `${n} has ${pounds(N)}. ${n} spends ${p1}% of the money on a book. ${n} then spends ${p2}% of the money that is left on a snack. How much does ${n} spend on the snack?` },
];
const P1 = [10, 20, 25, 30, 40, 50, 60, 75, 80], P2 = [10, 20, 25, 30, 40, 50, 60, 75];

export default {
  id: 'pctprob-group',
  topic: PTOPIC, type: 'A percentage of a percentage', code: 'PP3',
  levels: ['Core'],
  search: 'percentage of a group then another percentage of that group two stage worded problem',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'of-of', label: 'a percentage of a group, then a percentage of those', params: { k: 'of' } },
    { id: 'of-rest', label: 'a percentage of the rest', params: { k: 'rest' }, levels: ['Core', 'Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'of') {
      const [N, p1, p2] = r.until(() => { const N = r.pick([100, 200, 240, 300, 400, 500, 600, 800, 1000]), p1 = r.pick(P1), p2 = r.pick(P2); const g = valOf(N, p1); return g.isInt && valOf(g, p2).isInt && g.val >= 20 ? [N, p1, p2] : null; });
      const g = valOf(N, p1), a = valOf(g, p2);
      return { parts: [{ body: r.pick(OF)(n, N, p1, p2), a: String(a.n), w: M(`${p1}\\% \\text{ of } ${N} = ${dstr(g)};\\ ${p2}\\% \\text{ of } ${dstr(g)} = ${dstr(a)}`), m: 3, lines: 5, chk: numChk(`${N}*${p1}/100*${p2}/100`, a) }] };
    }
    const [c, N, p1, p2] = r.until(() => {
      const c = r.pick(REST), N = r.pick(c.Ns), p1 = r.pick(P1), p2 = r.pick(P2);
      const left = valOf(N, 100 - p1), a = valOf(left, p2);
      const okf = (x) => (c.u.count ? x.isInt : c.u.money ? 100 % x.d === 0 : 10 % x.d === 0);
      return left.isInt && okf(a) ? [c, N, p1, p2] : null;
    });
    const left = valOf(N, 100 - p1), a = valOf(left, p2);
    return { parts: [{ body: c.mk(n, N, p1, p2), a: c.u.tex(a), w: M(`${N} \\times ${dstr(new F(100 - p1, 100))} = ${dstr(left)};\\ ${p2}\\% \\text{ of } ${dstr(left)} = ${dstr(a)}`), ...mk(3, c.u), chk: numChk(`${N}*(100-${p1})/100*${p2}/100`, a) }] };
  },
};
