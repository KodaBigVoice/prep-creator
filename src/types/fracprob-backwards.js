import { names, pounds, TOPIC, T, M, F, U, GBP, proper, num, fx, gcd } from './fracprob.js';

const PART = [
  { u: U('pupils', 'pupil'), lo: 30, hi: 120, mk: (n, f, k) => `${f} of the pupils in the school choir are girls. There are ${k} girls in the choir. How many pupils are in the choir?` },
  { u: U('sweets', 'sweet'), lo: 30, hi: 150, mk: (n, f, k) => `${f} of the sweets in a jar are red. There are ${k} red sweets in the jar. How many sweets are in the jar?` },
  { u: U('pages', 'page'), lo: 90, hi: 400, mk: (n, f, k) => `${n} has read ${f} of a book. ${n} has read ${k} pages. How many pages are in the book?` },
  { u: U('litres', 'litre'), lo: 30, hi: 150, mk: (n, f, k) => `A water tank is ${f} full. There are ${k} litres of water in the tank. How many litres of water does the tank hold when it is full?` },
];
const LEFT = [
  { u: GBP, lo: 40, hi: 280, mk: (n, f, k) => `${n} spends ${f} of ${n}'s savings on a bike. ${n} has ${pounds(k)} left. How much money did ${n} have before buying the bike?` },
  { u: U('km'), lo: 24, hi: 120, mk: (n, f, k) => `${n} has run ${f} of the length of a cross-country race. ${k} km are still left to run. How long is the race?` },
  { u: U('litres', 'litre'), lo: 30, hi: 70, mk: (n, f, k) => `A car uses ${f} of the petrol in its tank on a journey. There are ${k} litres of petrol left in the tank. How much petrol was in the tank at the start of the journey?` },
  { u: U('tickets', 'ticket'), lo: 60, hi: 300, mk: (n, f, k) => `A theatre sells ${f} of its tickets for Friday night. ${k} tickets are still unsold. How many tickets does the theatre have for Friday night?` },
];

export default {
  id: 'fracprob-backwards',
  topic: TOPIC, type: 'Working backwards', code: 'FP7',
  levels: ['Additional'],
  search: 'fraction of a number is find the whole worded problem working backwards',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'part', label: 'a fraction of the whole is known:  3/5 of the pupils are girls', params: { left: false } },
    { id: 'left', label: 'what is left is known:  spent 2/7 and has £45 left', params: { left: true } },
  ],
  generate(r, v) {
    const c = r.pick(v.left ? LEFT : PART), [n] = names(r, 1);
    const [f, m, X, k] = r.until(() => {
      const f = proper(r, [3, 4, 5, 6, 7, 8, 9, 10], 2);
      if (!f) return null;
      const known = v.left ? f.d - f.n : f.n, mm = r.int(2, 30), X = f.d * mm, k = known * mm;
      return X >= c.lo && X <= c.hi && known >= 2 ? [f, mm, X, k] : null;
    });
    const known = v.left ? new F(1).sub(f) : f;
    const w = v.left
      ? `1 - ${f.tex()} = ${known.tex()};\\ \\ ${known.tex()}\\text{ is }${k},\\ \\text{so }\\dfrac{1}{${f.d}}\\text{ is }${k / known.n}\\text{ and the whole is }${X}`
      : `${f.tex()}\\text{ is }${k},\\ \\text{so }\\dfrac{1}{${f.d}}\\text{ is }${k / f.n}\\text{ and the whole is }${X}`;
    return { parts: [{ body: c.mk(n, T(f), k), a: c.u.tex(new F(X)), w: M(w), chk: num(`${k}/${fx(known)}`, new F(X)) }] };
  },
};
