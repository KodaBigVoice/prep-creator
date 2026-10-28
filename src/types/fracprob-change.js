import { names, pounds, TOPIC, T, M, F, U, GBP, proper, multiple, num, fx } from './fracprob.js';

const INC = [
  { u: U('g'), lo: 80, hi: 480, mk: (n, f, O) => `A recipe uses ${O} g of butter. To make a bigger cake, the amount of butter is increased by ${f} of the original amount. How much butter is used for the bigger cake?` },
  { u: GBP, lo: 16, hi: 80, mk: (n, f, O) => `${n}'s pocket money is ${pounds(O)} each month. It is increased by ${f} of this amount. What is ${n}'s new monthly pocket money?` },
  { u: U('cm'), lo: 40, hi: 240, mk: (n, f, O) => `A young tree is ${O} cm tall. Over the next year it grows by ${f} of its height. How tall is the tree after a year?` },
  { u: GBP, lo: 20, hi: 72, mk: (n, f, O) => `A train ticket costs ${pounds(O)}. The price goes up by ${f} of the price. What is the new price of the ticket?` },
];
const DEC = [
  { u: GBP, lo: 24, hi: 120, mk: (n, f, O) => `A jacket costs ${pounds(O)}. In a sale, the price is reduced by ${f} of the price. What is the sale price?` },
  { u: U('kg'), lo: 12, hi: 36, mk: (n, f, O) => `A suitcase has a mass of ${O} kg. After some items are taken out, its mass goes down by ${f} of its original mass. What is the new mass of the suitcase?` },
  { u: U('minutes', 'minute'), lo: 40, hi: 160, mk: (n, f, O) => `A bus journey takes ${O} minutes. A new road shortens the journey by ${f} of the time. How long does the journey take on the new road?` },
  { u: U('pupils', 'pupil'), lo: 60, hi: 300, mk: (n, f, O) => `A school has ${O} pupils. The number of pupils falls by ${f} after a new school opens nearby. How many pupils does the school have now?` },
];
const REV = [
  { up: false, u: GBP, lo: 30, hi: 150, mk: (n, f, N) => `The price of a coat falls by ${f} of its original price. The sale price is ${pounds(N)}. What was the original price of the coat?` },
  { up: true, u: U('cm'), lo: 60, hi: 200, mk: (n, f, N) => `A sunflower grows by ${f} of its height in one week. It is now ${N} cm tall. How tall was the sunflower at the start of the week?` },
  { up: true, u: GBP, lo: 20, hi: 100, mk: (n, f, N) => `${n}'s pocket money is increased by ${f} of the original amount. ${n} now gets ${pounds(N)}. How much pocket money did ${n} get before the increase?` },
  { up: false, u: U('kg'), lo: 12, hi: 40, mk: (n, f, N) => `After a diet, a dog's mass goes down by ${f} of its original mass. It now has a mass of ${N} kg. What was the original mass of the dog?` },
];

export default {
  id: 'fracprob-change',
  topic: TOPIC, type: 'Increase and decrease by a fraction', code: 'FP8',
  levels: ['Core', 'Additional'],
  search: 'increase decrease by a fraction worded problem sale price reverse original',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'inc', label: 'increase by a fraction:  increase 40 kg by 3/8', params: { kind: 'inc' } },
    { id: 'dec', label: 'decrease by a fraction:  reduce £48 by 1/6', params: { kind: 'dec' } },
    { id: 'rev', label: 'find the original amount:  a price falls by 1/5 to £36', params: { kind: 'rev' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.kind !== 'rev') {
      const up = v.kind === 'inc', c = r.pick(up ? INC : DEC);
      const [f, O] = r.until(() => {
        const f = proper(r, [3, 4, 5, 6, 8, 10], 1), O = f && f.val <= 0.5 && multiple(r, f.d, c.lo, c.hi);
        return O ? [f, O] : null;
      });
      const change = f.mul(O), ans = up ? new F(O).add(change) : new F(O).sub(change);
      return { parts: [{ body: c.mk(n, T(f), O), a: c.u.tex(ans), w: M(`${f.tex()}\\text{ of }${O} = ${change.n};\\ \\ ${O} ${up ? '+' : '-'} ${change.n} = ${ans.n}`), chk: num(`${O}*(1${up ? '+' : '-'}${fx(f)})`, ans) }] };
    }
    const c = r.pick(REV);
    const [f, k, Nn, O] = r.until(() => {
      const f = proper(r, [3, 4, 5, 6, 8, 10], 1);
      if (!f || f.val > 0.5) return null;
      const known = c.up ? f.d + f.n : f.d - f.n, k = r.int(2, 30), O = f.d * k, N = known * k;
      return N >= c.lo && N <= c.hi ? [f, k, N, O] : null;
    });
    const mult = c.up ? new F(1).add(f) : new F(1).sub(f);
    return { parts: [{ body: c.mk(n, T(f), Nn), a: c.u.tex(new F(O)), w: M(`${c.up ? '1 + ' : '1 - '}${f.tex()} = ${mult.tex()};\\ \\ ${mult.tex()}\\text{ is }${Nn},\\ \\text{so }\\dfrac{1}{${mult.d}}\\text{ is }${Nn / mult.n}\\text{ and the original is }${O}`), chk: num(`${Nn}/(1${c.up ? '+' : '-'}${fx(f)})`, new F(O)) }] };
  },
};
