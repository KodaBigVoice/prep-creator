import { names, pounds, TOPIC, T, M, F, U, GBP, proper, multiple, num, fx } from './fracprob.js';

const CT = {
  money: [
    { u: GBP, lo: 20, hi: 120, mk: (n, f, A) => `${n} has ${pounds(A)} to spend at the school fair. ${n} spends ${f} of the money on a book. How much does ${n} spend on the book?` },
    { u: GBP, lo: 20, hi: 120, mk: (n, f, A) => `A school trip costs ${pounds(A)}. ${n} has already paid ${f} of the cost. How much has ${n} paid?` },
    { u: GBP, lo: 20, hi: 120, mk: (n, f, A) => `${n} is given ${pounds(A)} for a birthday. ${n} saves ${f} of the money. How much does ${n} save?` },
    { u: GBP, lo: 30, hi: 150, mk: (n, f, A) => `A jacket costs ${pounds(A)} in the school shop. In the sale, the price is reduced by ${f} of the cost. How much is the price reduced by?` },
  ],
  measure: [
    { u: U('litres', 'litre'), lo: 24, hi: 120, mk: (n, f, A) => `A water tank holds ${A} litres when it is full. The tank is ${f} full. How much water is in the tank?` },
    { u: U('m'), lo: 24, hi: 96, mk: (n, f, A) => `A rope is ${A} m long. ${n} cuts off ${f} of the rope. How long is the piece that ${n} cuts off?` },
    { u: U('g'), lo: 200, hi: 960, mk: (n, f, A) => `A bag of flour has a mass of ${A} g. A recipe uses ${f} of the flour in the bag. What mass of flour does the recipe use?` },
    { u: U('km'), lo: 24, hi: 96, mk: (n, f, A) => `A cycle route is ${A} km long. ${n} has cycled ${f} of the route. How far has ${n} cycled?` },
  ],
  count: [
    { u: U('pupils', 'pupil'), lo: 24, hi: 120, mk: (n, f, A) => `There are ${A} pupils in Year 7. ${f} of the pupils walk to school. How many pupils walk to school?` },
    { u: U('chocolates', 'chocolate'), lo: 24, hi: 72, mk: (n, f, A) => `A box holds ${A} chocolates. ${f} of the chocolates are dark chocolate. How many chocolates are dark chocolate?` },
    { u: U('seats', 'seat'), lo: 60, hi: 240, mk: (n, f, A) => `The school hall has ${A} seats. ${f} of the seats are taken. How many seats are taken?` },
    { u: U('matches', 'match'), lo: 12, hi: 48, mk: (n, f, A) => `A hockey team plays ${A} matches in a season. The team wins ${f} of its matches. How many matches does the team win?` },
  ],
};

export default {
  id: 'fracprob-amount',
  topic: TOPIC, type: 'A fraction of an amount, in context', code: 'FP1',
  levels: ['Core'],
  search: 'fraction of an amount worded problem money litres pupils',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'count', label: 'a number of people or things', params: { kind: 'count' } },
    { id: 'money', label: 'money', params: { kind: 'money' } },
    { id: 'measure', label: 'a length, mass or capacity', params: { kind: 'measure' } },
  ],
  generate(r, v) {
    const c = r.pick(CT[v.kind]);
    const [f, A] = r.until(() => {
      const f = proper(r, [3, 4, 5, 6, 7, 8, 9, 10, 12], 1), A = f && multiple(r, f.d, c.lo, c.hi);
      return A ? [f, A] : null;
    });
    const [n] = names(r, 1), ans = f.mul(A);
    const w = `${f.tex()}\\text{ of }${A} = ${A} \\div ${f.d}${f.n > 1 ? ` \\times ${f.n}` : ''} = ${ans.n}`;
    return { parts: [{ body: c.mk(n, T(f), A), a: c.u.tex(ans), w: M(w), chk: num(`${fx(f)}*${A}`, ans) }] };
  },
};
