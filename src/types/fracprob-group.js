import { names, TOPIC, T, M, F, U, proper, num, fx, lcm } from './fracprob.js';

const REST = [
  { stem: (f1, f2, k) => `${f1} of the pupils in Year 6 walk to school and ${f2} of the pupils cycle. The other ${k} pupils travel by bus.`, q1: 'What fraction of the pupils travel by bus?', q2: 'How many pupils are in Year 6?', lo: 24, hi: 120 },
  { stem: (f1, f2, k) => `${f1} of the sweets in a jar are red and ${f2} of the sweets are blue. The other ${k} sweets are green.`, q1: 'What fraction of the sweets are green?', q2: 'How many sweets are in the jar?', lo: 24, hi: 120 },
  { stem: (f1, f2, k) => `At a school concert, ${f1} of the audience are parents and ${f2} of the audience are pupils. The other ${k} people in the audience are teachers.`, q1: 'What fraction of the audience are teachers?', q2: 'How many people are in the audience?', lo: 40, hi: 240 },
  { stem: (f1, f2, k) => `${f1} of the members of a chess club are in Year 7 and ${f2} of the members are in Year 8. The other ${k} members are in Year 6.`, q1: 'What fraction of the members are in Year 6?', q2: 'How many members does the chess club have?', lo: 24, hi: 120 },
];
const OF = [
  { stem: (N, f1, f2) => `There are ${N} pupils in Year 7. ${f1} of the pupils are girls. ${f2} of the girls play hockey.`, q1: 'How many girls are in Year 7?', q2: 'How many girls play hockey?', lo: 30, hi: 120 },
  { stem: (N, f1, f2) => `A library has ${N} books. ${f1} of the books are fiction. ${f2} of the fiction books are mysteries.`, q1: 'How many fiction books are there?', q2: 'How many mystery books are there?', lo: 60, hi: 240 },
  { stem: (N, f1, f2) => `A swimming club has ${N} members. ${f1} of the members are under 12. ${f2} of the members who are under 12 are boys.`, q1: 'How many members are under 12?', q2: 'How many boys are under 12?', lo: 60, hi: 240 },
  { stem: (N, f1, f2) => `A farmer has ${N} animals. ${f1} of the animals are sheep. ${f2} of the sheep are lambs.`, q1: 'How many sheep does the farmer have?', q2: 'How many lambs does the farmer have?', lo: 60, hi: 240 },
];

export default {
  id: 'fracprob-group',
  topic: TOPIC, type: 'Fractions of a group', code: 'FP9',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'fractions of a group class pupils fraction of a fraction the rest find the total',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'rest', label: 'two fractions, the rest is a number:  find the total', params: { kind: 'rest' } },
    { id: 'of', label: 'fraction of a fraction:  2/5 are girls, 1/3 of the girls play hockey', params: { kind: 'of' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    if (v.kind === 'rest') {
      const c = r.pick(REST);
      const [a, b, Tt] = r.until(() => {
        const a = proper(r, [3, 4, 5, 6, 8, 10]), b = proper(r, [3, 4, 5, 6, 8, 10]);
        if (!a || !b) return null;
        const left = new F(1).sub(a).sub(b);
        if (left.val <= 0.1 || a.add(b).val >= 0.9) return null;
        const L = lcm(left.d, lcm(a.d, b.d)), ks = []; for (let k = Math.ceil(c.lo / L); k * L <= c.hi; k++) ks.push(k);
        return ks.length ? [a, b, L * r.pick(ks)] : null;
      });
      const left = new F(1).sub(a).sub(b), k = left.mul(Tt);
      return { stem: c.stem(T(a), T(b), k.n), parts: [
        { body: c.q1, a: left.tex(), w: M(`${a.tex()} + ${b.tex()} = ${a.add(b).tex()},\\ \\ 1 - ${a.add(b).tex()} = ${left.tex()}`), m: 1, lines: 3, chk: num(`1-${fx(a)}-${fx(b)}`, left) },
        { body: c.q2, a: String(Tt), w: M(`${left.tex()}\\text{ is }${k.n},\\ \\text{so the total is }${Tt}`), m: 2, lines: 4, chk: num(`${k.n}/(1-${fx(a)}-${fx(b)})`, new F(Tt)) },
      ] };
    }
    const c = r.pick(OF);
    const [a, b, N] = r.until(() => {
      const a = proper(r, [3, 4, 5, 6, 8], 1), b = proper(r, [2, 3, 4, 5, 6], 1);
      if (!a || !b) return null;
      const ks = []; for (let k = Math.ceil(c.lo / a.d); k * a.d <= c.hi; k++) if ((a.n * k) % b.d === 0) ks.push(k);
      return ks.length ? [a, b, a.d * r.pick(ks)] : null;
    });
    const first = a.mul(N), second = b.mul(first);
    return { stem: c.stem(N, T(a), T(b)), parts: [
      { body: c.q1, a: String(first.n), w: M(`${a.tex()}\\text{ of }${N} = ${first.n}`), m: 1, lines: 2, chk: num(`${fx(a)}*${N}`, first) },
      { body: c.q2, a: String(second.n), w: M(`${b.tex()}\\text{ of }${first.n} = ${second.n}`), m: 2, lines: 3, chk: num(`${fx(b)}*${fx(a)}*${N}`, second) },
    ] };
  },
};
