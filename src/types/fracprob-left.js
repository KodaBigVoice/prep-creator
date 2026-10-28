import { names, pounds, TOPIC, T, M, F, U, GBP, proper, multiple, num, fx } from './fracprob.js';

const CT = [
  { u: GBP, lo: 30, hi: 120, of: 'the money', mk: (n, f, A) => `${n} has ${pounds(A)}. ${n} spends ${f} of the money on a ticket for a concert.`, used: (n) => `How much does ${n} spend on the ticket?`, left: (n) => `How much does ${n} have left?` },
  { u: U('litres', 'litre'), lo: 30, hi: 70, of: 'the petrol', mk: (n, f, A) => `A car has a fuel tank that holds ${A} litres of petrol. The tank is full. ${n} drives to the coast and uses ${f} of the petrol.`, used: () => `How much petrol is used on the journey?`, left: () => `How much petrol is left in the tank?` },
  { u: U('pages', 'page'), lo: 120, hi: 360, of: 'the book', mk: (n, f, A) => `${n}'s book has ${A} pages. ${n} reads ${f} of the book on Saturday.`, used: (n) => `How many pages does ${n} read on Saturday?`, left: (n) => `How many pages does ${n} still have to read?` },
  { u: U('litres', 'litre'), lo: 40, hi: 160, of: 'the water', mk: (n, f, A) => `A water butt holds ${A} litres of water. ${n} uses ${f} of the water to water the garden.`, used: (n) => `How much water does ${n} use?`, left: () => `How much water is left in the water butt?` },
  { u: U('minutes', 'minute'), lo: 60, hi: 150, of: 'the film', mk: (n, f, A) => `A film lasts ${A} minutes. ${n} has watched ${f} of the film.`, used: (n) => `For how many minutes has ${n} watched the film?`, left: () => `How many minutes of the film are left?` },
];

export default {
  id: 'fracprob-left',
  topic: TOPIC, type: 'How much is left', code: 'FP2',
  levels: ['Core'],
  multipart: true,
  search: 'fraction left remaining worded problem spends uses',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'left', label: 'one question: how much is left?', params: { kind: 'left' }, multipart: false },
    { id: 'parts', label: 'two parts: how much used, how much left?', params: { kind: 'parts' } },
    { id: 'frac', label: 'two parts: what fraction is left, how much is left?', params: { kind: 'frac' } },
  ],
  generate(r, v) {
    const c = r.pick(CT);
    const [f, A] = r.until(() => {
      const f = proper(r, [3, 4, 5, 6, 7, 8, 9, 10, 12], 2), A = f && multiple(r, f.d, c.lo, c.hi);
      return A ? [f, A] : null;
    });
    const [n] = names(r, 1), used = f.mul(A), left = new F(A).sub(used), rest = new F(1).sub(f);
    const stem = c.mk(n, T(f), A);
    const wUsed = `${f.tex()}\\text{ of }${A} = ${used.n}`, wLeft = `${A} - ${used.n} = ${left.n}`;
    const pUsed = { body: c.used(n), a: c.u.tex(used), w: M(wUsed), m: 1, lines: 2, chk: num(`${fx(f)}*${A}`, used) };
    const pLeft = (m) => ({ body: c.left(n), a: c.u.tex(left), w: M(`${wUsed},\\ ${wLeft}`), m, lines: m === 1 ? 2 : 3, chk: num(`${A}-${fx(f)}*${A}`, left) });
    if (v.kind === 'left') return { parts: [{ ...pLeft(2), body: `${stem} ${c.left(n)}`, w: M(`${wUsed},\\ ${wLeft}`) }] };
    if (v.kind === 'parts') return { stem, parts: [pUsed, pLeft(1)] };
    return { stem, parts: [
      { body: `What fraction of ${c.of} is left?`, a: rest.tex(), w: M(`1 - ${f.tex()} = ${rest.tex()}`), m: 1, lines: 2, chk: num(`1-${fx(f)}`, rest) },
      { ...pLeft(1), w: M(`${rest.tex()}\\text{ of }${A} = ${left.n}`) },
    ] };
  },
};
