import { TOPIC, M, F, names, pounds, GBP, KM, G, cnt, mk, dstr } from './ratio.js';

// rate: how much of the "answer" quantity per one of the "given" quantity, and sensible sizes
const CTX = [
  { s: (n, a, b) => `A car uses ${a} litres of petrol to travel ${b} km.`, ask: (n, x) => `How far can the car travel on ${x} litres of petrol?`, ga: 'L', unitA: 'litres', unitB: KM, ar: [4, 5, 6, 8, 10], rate: [10, 12, 15, 16, 18], big: [12, 15, 20, 25, 30, 40] },
  { s: (n, a, b) => `${n} is paid ${pounds(b)} for working ${a} hours.`, ask: (n, x) => `How much would ${n} be paid for working ${x} hours?`, unitA: 'hours', unitB: GBP, ar: [3, 4, 5, 6, 8], rate: [8, 9, 10, 12, 14], big: [10, 12, 15, 20, 25], money: true },
  { s: (n, a, b) => `${a} buns need ${b} g of flour.`, ask: (n, x) => `How much flour is needed for ${x} buns?`, unitA: 'buns', unitB: G, ar: [6, 8, 12, 15], rate: [25, 30, 40, 50], big: [18, 20, 24, 30, 36, 40] },
  { s: (n, a, b) => `A printer prints ${b} pages in ${a} minutes.`, ask: (n, x) => `How many pages does it print in ${x} minutes?`, unitA: 'minutes', unitB: cnt('pages', 'page'), ar: [2, 3, 4, 5, 6], rate: [12, 15, 18, 20, 24], big: [8, 10, 12, 15, 20] },
  { s: (n, a, b) => `${n} walks ${b} km in ${a} hours at a steady speed.`, ask: (n, x) => `How far does ${n} walk in ${x} hours at the same speed?`, unitA: 'hours', unitB: KM, ar: [2, 3, 4, 5], rate: [3, 4, 5, 6], big: [6, 8, 10, 12, 15] },
];
const ITEMS = [['pens', 60], ['notebooks', 85], ['chocolate bars', 90], ['bananas', 25], ['cans of drink', 65], ['apples', 40], ['pencils', 35], ['stickers', 20]];

export default {
  id: 'rp-direct',
  topic: TOPIC, type: 'Direct proportion: the unitary method', code: 'RP12',
  levels: ['Foundation', 'Core'],
  search: 'direct proportion unitary method cost of items petrol pay find one first',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'cost', label: 'cost of items:  5 pens cost £3.50, cost of 8', params: { k: 'cost' } },
    { id: 'ctx', label: 'petrol, pay, baking, printing, walking (units)', params: { k: 'ctx' } },
    { id: 'back', label: 'how many can be bought:  8 pens cost £4.80, how many for £9', params: { k: 'back' }, levels: ['Core'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'ctx') {
      const c = r.pick(CTX), a = r.pick(c.ar), pr = r.pick(c.rate), b = a * pr / (c.money ? 1 : 1);
      const per = pr, x = r.until(() => { const x = r.pick(c.big); return x !== a ? x : null; });
      const bb = c.s.length ? a * per : 0;
      const ans = x * per, u = c.unitB;
      const ansT = u.tex ? u.tex(new F(ans)) : '';
      return { parts: [{ body: `${c.s(n, a, bb)} ${c.ask(n, x)}`, a: ansT, w: M(`${bb} \\div ${a} = ${per};\\ ${per} \\times ${x} = ${ans}`), ...mk(2, u), chk: { k: 'num', expr: `${bb}/${a}*${x}`, val: String(ans) } }] };
    }
    const [pl, pence] = r.pick(ITEMS);
    const [n1, n2] = r.until(() => { const a = r.int(3, 12), b = r.int(3, 20); return a !== b ? [a, b] : null; });
    const c1 = new F(n1 * pence, 100), c2 = new F(n2 * pence, 100), one = new F(pence, 100);
    if (v.k === 'cost') {
      return { parts: [{ body: `${n1} ${pl} cost ${pounds(c1.val)}. Work out the cost of ${n2} ${pl}.`, a: GBP.tex(c2), w: M(`${dstr(c1)} \\div ${n1} = ${dstr(one)};\\ ${dstr(one)} \\times ${n2} = ${dstr(c2)}`), ...mk(2, GBP), chk: { k: 'num', expr: `Fraction(${n1 * pence},100)/${n1}*${n2}`, val: dstr(c2) } }] };
    }
    return { parts: [{ body: `${n1} ${pl} cost ${pounds(c1.val)}. How many ${pl} can be bought for ${pounds(c2.val)}?`, a: cnt(pl, pl).tex(new F(n2)), w: M(`${dstr(c1)} \\div ${n1} = ${dstr(one)};\\ ${dstr(c2)} \\div ${dstr(one)} = ${n2}`), m: 3, lines: 5, chk: { k: 'num', expr: `Fraction(${n2 * pence},100)/(Fraction(${n1 * pence},100)/${n1})`, val: String(n2) } }] };
  },
};
