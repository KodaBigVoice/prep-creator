import { names, pounds, TOPIC, T, M, F, U, GBP, proper, num, fx, lcm } from './fracprob.js';

const CT = [
  { u: GBP, lo: 60, hi: 240,
    orig: (n, A, a, b) => `${n} has ${pounds(A)}. ${n} spends ${a} of the money on a book and ${b} of the money on lunch.`,
    rest: (n, A, a, b) => `${n} has ${pounds(A)}. ${n} spends ${a} of the money on a book. ${n} then spends ${b} of the money that is left on lunch.`,
    ofq: 'the money', q1: (n) => `How much does ${n} have left after buying the book?`, q2: (n) => `How much does ${n} have left at the end?`, qq: (n) => `How much money does ${n} have left?` },
  { u: U('pages', 'page'), lo: 120, hi: 360,
    orig: (n, A, a, b) => `${n}'s book has ${A} pages. ${n} reads ${a} of the book on Saturday and ${b} of the book on Sunday.`,
    rest: (n, A, a, b) => `${n}'s book has ${A} pages. ${n} reads ${a} of the book on Saturday. On Sunday, ${n} reads ${b} of the pages that are left.`,
    ofq: 'the book', q1: (n) => `How many pages does ${n} still have to read after Saturday?`, q2: (n) => `How many pages does ${n} still have to read after Sunday?`, qq: (n) => `How many pages does ${n} still have to read?` },
  { u: U('litres', 'litre'), lo: 60, hi: 240,
    orig: (n, A, a, b) => `A water butt holds ${A} litres of water. ${n} uses ${a} of the water to wash a car and ${b} of the water on the garden.`,
    rest: (n, A, a, b) => `A water butt holds ${A} litres of water. ${n} uses ${a} of the water to wash a car. ${n} then uses ${b} of the water that is left on the garden.`,
    ofq: 'the water', q1: () => `How much water is left after the car is washed?`, q2: () => `How much water is left after the garden is watered?`, qq: () => `How much water is left in the water butt?` },
  { u: U('km'), lo: 60, hi: 240,
    orig: (n, A, a, b) => `${n}'s journey is ${A} km long. ${n} travels ${a} of the journey by train and ${b} of the journey by bus.`,
    rest: (n, A, a, b) => `${n}'s journey is ${A} km long. ${n} travels ${a} of the journey by train. ${n} then travels ${b} of the distance that is left by bus.`,
    ofq: 'the journey', q1: () => `How far is left to travel after the train journey?`, q2: () => `How far is left to travel after the bus journey?`, qq: () => `How far is left to travel?` },
];

export default {
  id: 'fracprob-stages',
  topic: TOPIC, type: 'Two stages of spending', code: 'FP6',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'fraction of the original fraction of what is left two stages spending worded',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'orig', label: 'two fractions of the original:  1/3 then 1/4 of the money', params: { rest: false } },
    { id: 'rest', label: 'second fraction of what is left', params: { rest: true } },
  ],
  generate(r, v) {
    const c = r.pick(CT), [n] = names(r, 1);
    let a, b, A;
    if (!v.rest) {
      [a, b, A] = r.until(() => {
        const a = proper(r, [3, 4, 5, 6, 8, 10]), b = proper(r, [3, 4, 5, 6, 8, 10]);
        if (!a || !b || a.add(b).val >= 0.95) return null;
        const L = lcm(a.d, b.d), ks = []; for (let k = Math.ceil(c.lo / L); k * L <= c.hi; k++) ks.push(k);
        return ks.length ? [a, b, L * r.pick(ks)] : null;
      });
      const sum = a.add(b), leftF = new F(1).sub(sum), left = leftF.mul(A);
      return { stem: c.orig(n, A, T(a), T(b)), parts: [
        { body: `What fraction of ${c.ofq} is left?`, a: leftF.tex(), w: M(`${a.tex()} + ${b.tex()} = ${sum.tex()},\\ \\ 1 - ${sum.tex()} = ${leftF.tex()}`), m: 2, lines: 3, chk: num(`1-${fx(a)}-${fx(b)}`, leftF) },
        { body: c.qq(n), a: c.u.tex(left), w: M(`${leftF.tex()}\\text{ of }${A} = ${left.n}`), m: 1, lines: 2, chk: num(`${A}*(1-${fx(a)}-${fx(b)})`, left) },
      ] };
    }
    [a, b, A] = r.until(() => {
      const a = proper(r, [3, 4, 5, 6, 8, 10]), b = proper(r, [2, 3, 4, 5, 6]);
      if (!a || !b) return null;
      const ks = []; for (let k = Math.ceil(c.lo / a.d); k * a.d <= c.hi; k++) if (((a.d - a.n) * k) % b.d === 0) ks.push(k);
      return ks.length ? [a, b, a.d * r.pick(ks)] : null;
    });
    const R = new F(1).sub(a).mul(A), end = new F(1).sub(b).mul(R);
    return { stem: c.rest(n, A, T(a), T(b)), parts: [
      { body: c.q1(n), a: c.u.tex(R), w: M(`${A} - ${new F(A).mul(a).n} = ${R.n}`), m: 1, lines: 2, chk: num(`${A}*(1-${fx(a)})`, R) },
      { body: c.q2(n), a: c.u.tex(end), w: M(`${R.n} - ${R.mul(b).n} = ${end.n}`), m: 2, lines: 3, chk: num(`${A}*(1-${fx(a)})*(1-${fx(b)})`, end) },
    ] };
  },
};
