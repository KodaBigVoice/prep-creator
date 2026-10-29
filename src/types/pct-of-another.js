import { TOPIC, M, F, names, rnd, tie, shown, numChk, pounds } from './percentages.js';
import { gcd } from '../core/frac.js';

// worded contexts: fit(b) says whether the total b suits the context
const CTX = [
  { fit: (b) => b >= 10 && b <= 100, mk: (n, a, b) => `${n} scores ${a} out of ${b} in a maths test. What percentage of the marks does ${n} score?` },
  { fit: (b) => b >= 10 && b <= 40, mk: (n, a, b) => `A class has ${b} pupils. ${a} of the pupils walk to school. What percentage of the pupils walk to school?` },
  { fit: (b) => b >= 10 && b <= 200, mk: (n, a, b) => `A bag contains ${b} sweets. ${a} of the sweets are red. What percentage of the sweets are red?` },
  { fit: (b) => b >= 10 && b <= 40, mk: (n, a, b) => `A hockey team plays ${b} matches in a season and wins ${a} of them. What percentage of its matches does the team win?` },
  { fit: (b) => b >= 100 && b <= 1000, mk: (n, a, b) => `A bag of flour has a mass of ${b} g. A recipe uses ${a} g of the flour. What percentage of the flour does the recipe use?` },
  { fit: (b) => b >= 20 && b <= 200, mk: (n, a, b) => `A ribbon is ${b} cm long. ${n} cuts off a piece that is ${a} cm long. What percentage of the ribbon does ${n} cut off?` },
  { fit: (b) => b >= 40 && b <= 500, mk: (n, a, b) => `A water tank holds ${b} litres when it is full. It now contains ${a} litres of water. What percentage of the tank is full?` },
  { fit: (b) => b >= 40 && b <= 500, mk: (n, a, b) => `A bike costs £${b}. ${n} has saved £${a} towards it. What percentage of the cost has ${n} saved?` },
  { fit: (b) => b >= 100 && b <= 1000, mk: (n, a, b) => `A school has ${b} pupils. ${a} of the pupils are in the choir. What percentage of the pupils are in the choir?` },
  { fit: (b) => b >= 20 && b <= 1000, mk: (n, a, b) => `In a survey of ${b} people, ${a} people say that they prefer tea to coffee. What percentage of the people prefer tea?` },
  { fit: (b) => b >= 10 && b <= 60, mk: (n, a, b) => `A quiz has ${b} questions. ${n} answers ${a} of the questions correctly. What percentage of the questions does ${n} answer correctly?` },
];
const PLAIN = [
  (a, b) => `Write ${a} out of ${b} as a percentage.`,
  (a, b) => `Write ${a} as a percentage of ${b}.`,
  (a, b) => `Express ${a} as a percentage of ${b}.`,
];

// pick a, b with the answer (a/b as a percentage) given by ok(F)
function ab(r, dens, ok, minA = 2) {
  return r.until(() => {
    const b = r.pick(dens), a = r.int(minA, b - 1), f = new F(a * 100, b);
    return gcd(a, b) < b && ok(f, a, b) ? [a, b] : null;
  });
}
const nice = (f) => f.isInt || (f.d === 2);                       // whole or half a percent

export default {
  id: 'pct-of-another',
  topic: TOPIC, type: 'One quantity as a percentage of another', code: 'PC5',
  levels: ['Foundation', 'Core'],
  search: 'write as a percentage of out of express test score survey calculator 1 decimal place',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'easy', label: 'denominator 10, 20, 25 or 50:  18 out of 50', params: { dens: [10, 20, 25, 50], plain: true }, },
    { id: 'ctx', label: 'denominator 10, 20, 25 or 50, in context', params: { dens: [10, 20, 25, 50], plain: false } },
    { id: 'forty', label: 'denominator 40, 80 or 200:  30 out of 40', params: { dens: [40, 80, 200], plain: false, ok: 'nice' }, levels: ['Additional'] },
    { id: 'simplify', label: 'simplify first:  21 out of 56', params: { simplify: true }, levels: ['Additional'] },
    { id: 'calc', label: 'calculator, to 1 decimal place:  37 out of 90', params: { calc: true }, levels: ['Core', 'Additional'], },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    let a, b, f, calc = false, extra = '';
    if (v.calc) {
      const dens = [30, 35, 45, 60, 70, 90, 120, 150, 175, 250, 300, 350, 400];
      [a, b] = r.until(() => { const b = r.pick(dens), a = r.int(6, b - 6), f = new F(a * 100, b); return !tie(f, 1) && !f.isInt && f.d !== 2 && f.d !== 5 && f.d !== 10 ? [a, b] : null; });
      f = new F(a * 100, b); calc = true; extra = ' Give your answer correct to 1 decimal place.';
    } else if (v.simplify) {
      const [base, k] = [r.pick([[3, 8], [5, 8], [7, 8], [3, 40], [9, 40], [1, 8], [3, 4], [7, 20], [11, 20]]), r.pick([3, 6, 7, 9, 12, 14, 15])];
      [a, b] = [base[0] * k, base[1] * k]; f = new F(a * 100, b);
    } else {
      [a, b] = ab(r, v.dens, v.ok === 'nice' ? nice : (g) => g.isInt);
      f = new F(a * 100, b);
    }
    const sh = shown(f, calc ? 1 : (f.isInt ? 0 : 1));
    const text = v.plain ? r.pick(PLAIN)(a, b) : (() => { const c = r.pick(CTX.filter(c => c.fit(b))); return c.mk(n, a, b); })();
    const w = v.simplify ? `\\dfrac{${a}}{${b}} = \\dfrac{${a / gcd(a, b)}}{${b / gcd(a, b)}};\\ ${a / gcd(a, b)} \\div ${b / gcd(a, b)} \\times 100 = ${sh}\\%` : `\\dfrac{${a}}{${b}} \\times 100 = ${sh}\\%`;
    return { parts: [{ body: text + extra, a: `${sh}\\%`, w: M(w), calc, chk: numChk(`${a}/${b}*100`, calc ? rnd(f, 1) : f, calc ? { dp: 1 } : {}) }] };
  },
};
