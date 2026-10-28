import { names, pounds, TOPIC, T, M, F, U, GBP, proper, num, fx, lcm } from './fracprob.js';

const SHARE = [
  (A, B, C, f1, f2, k) => `${A}, ${B} and ${C} share the cost of a present for their teacher. ${A} pays ${f1} of the cost. ${B} pays ${f2} of the remaining cost. ${C} pays ${pounds(k)}.`,
  (A, B, C, f1, f2, k) => `${A}, ${B} and ${C} share the cost of a tent. ${A} pays ${f1} of the cost. ${B} pays ${f2} of what is left to pay. ${C} pays the rest, which is ${pounds(k)}.`,
];
const STAGES = [
  { u: GBP, mk: (n, a, b, k) => `${n} goes shopping. ${n} spends ${a} of ${n}'s money on a jumper. Then ${n} spends ${b} of the money that is left on lunch. ${n} has ${pounds(k)} left. How much money did ${n} have to start with?` },
  { u: U('litres', 'litre'), mk: (n, a, b, k) => `A water butt is full. ${n} uses ${a} of the water to wash a car. Then ${n} uses ${b} of the water that is left on the plants. There are ${k} litres of water left. How many litres of water does the water butt hold when it is full?` },
  { u: U('pages', 'page'), mk: (n, a, b, k) => `${n} reads ${a} of a book on Friday. On Saturday, ${n} reads ${b} of the pages that are left. ${n} still has ${k} pages to read. How many pages are in the book?` },
];
const THREE = [
  { u: U('sweets', 'sweet'), mk: (n, a, b, c, k) => `${n} has a bag of sweets. ${n} gives ${a} of the sweets to a friend. ${n} then eats ${b} of the sweets that are left. ${n} then shares ${c} of the sweets that are still left with a cousin. ${n} has ${k} sweets left. How many sweets were in the bag at the start?` },
  { u: GBP, mk: (n, a, b, c, k) => `${n} is given some money. ${n} spends ${a} of it on a book. Then ${n} spends ${b} of the money that is left on a snack. Then ${n} gives ${c} of the money that is now left to a charity. ${n} has ${pounds(k)} left. How much money was ${n} given?` },
];
const ONE = (f) => new F(1).sub(f);

export default {
  id: 'fracprob-multi',
  topic: TOPIC, type: 'Multi-step with several fractions', code: 'FP10',
  levels: ['Additional'],
  search: 'multi-step fractions problem solving working backwards share cost several stages',
  verb: '', marks: 4, lines: 8,
  variants: [
    { id: 'share', label: 'three people share a cost; find the total', params: { kind: 'share' }, multipart: true },
    { id: 'stages', label: 'two stages, find the starting amount', params: { kind: 'stages' }, multipart: false },
    { id: 'three', label: 'three stages, find the starting amount', params: { kind: 'three' }, multipart: false },
  ],
  generate(r, v) {
    if (v.kind === 'share') {
      const [A, B, C] = names(r, 3);
      const [f1, f2, Tt] = r.until(() => {
        const f1 = proper(r, [3, 4, 5, 6]), f2 = proper(r, [2, 3, 4, 5]);
        if (!f1 || !f2) return null;
        const cf = ONE(f1).mul(ONE(f2)), L = lcm(cf.d, lcm(f1.d, f2.d)), ks = [];
        for (let k = Math.ceil(60 / L); k * L <= 240; k++) ks.push(k);
        if (!ks.length || cf.val <= 0.1) return null;
        const Tt = L * r.pick(ks), R1 = ONE(f1).mul(Tt);
        return f1.mul(Tt).isInt && R1.isInt && f2.mul(R1).isInt ? [f1, f2, Tt] : null;
      });
      const cf = ONE(f1).mul(ONE(f2)), k = cf.mul(Tt);
      return { stem: r.pick(SHARE)(A, B, C, T(f1), T(f2), k.n), parts: [
        { body: `What fraction of the cost does ${C} pay?`, a: cf.tex(), w: M(`${ONE(f1).tex()} \\times ${ONE(f2).tex()} = ${cf.tex()}`), m: 2, lines: 3, chk: num(`(1-${fx(f1)})*(1-${fx(f2)})`, cf) },
        { body: `What is the total cost?`, a: pounds(Tt).replace('£', '\\pounds '), w: M(`${cf.tex()}\\text{ is }${k.n},\\ \\text{so the total is }${Tt}`), m: 2, lines: 4, chk: num(`${k.n}/((1-${fx(f1)})*(1-${fx(f2)}))`, new F(Tt)) },
      ] };
    }
    const [n] = names(r, 1);
    if (v.kind === 'stages') {
      const c = r.pick(STAGES);
      const [f1, f2, X, k] = r.until(() => {
        const f1 = proper(r, [3, 4, 5, 6, 8]), f2 = proper(r, [2, 3, 4, 5, 6]);
        if (!f1 || !f2) return null;
        const cf = ONE(f1).mul(ONE(f2)), L = cf.d, m = r.int(2, 12), X = cf.d * m, k = cf.n * m, R1 = ONE(f1).mul(X);
        return X >= 40 && X <= 240 && k >= 6 && f1.mul(X).isInt && R1.isInt && f2.mul(R1).isInt ? [f1, f2, X, k] : null;
      });
      const cf = ONE(f1).mul(ONE(f2));
      return { parts: [{ body: c.mk(n, T(f1), T(f2), k), a: c.u.tex(new F(X)), w: M(`${ONE(f1).tex()} \\times ${ONE(f2).tex()} = ${cf.tex()};\\ \\ ${cf.tex()}\\text{ is }${k},\\ \\text{so the start is }${X}`), m: 4, lines: 8, chk: num(`${k}/((1-${fx(f1)})*(1-${fx(f2)}))`, new F(X)) }] };
    }
    const c = r.pick(THREE);
    const [f1, f2, f3, X, k] = r.until(() => {
      const f1 = proper(r, [3, 4, 5, 6]), f2 = proper(r, [2, 3, 4, 5]), f3 = proper(r, [2, 3, 4, 5]);
      if (!f1 || !f2 || !f3) return null;
      const cf = ONE(f1).mul(ONE(f2)).mul(ONE(f3)), m = r.int(2, 12), X = cf.d * m, k = cf.n * m;
      const R1 = ONE(f1).mul(X), R2 = ONE(f2).mul(R1);
      return X >= 60 && X <= 300 && k >= 6 && k <= 60 && f1.mul(X).isInt && R1.isInt && f2.mul(R1).isInt && R2.isInt && f3.mul(R2).isInt ? [f1, f2, f3, X, k] : null;
    });
    const cf = ONE(f1).mul(ONE(f2)).mul(ONE(f3));
    return { parts: [{ body: c.mk(n, T(f1), T(f2), T(f3), k), a: c.u.tex(new F(X)), w: M(`${ONE(f1).tex()} \\times ${ONE(f2).tex()} \\times ${ONE(f3).tex()} = ${cf.tex()};\\ \\ ${cf.tex()}\\text{ is }${k},\\ \\text{so the start is }${X}`), m: 4, lines: 8, chk: num(`${k}/((1-${fx(f1)})*(1-${fx(f2)})*(1-${fx(f3)}))`, new F(X)) }] };
  },
};
