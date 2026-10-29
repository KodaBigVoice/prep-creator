import { TOPIC, M, F, SHOP, SHOP_PRICES, shopFor, an, An, names, pounds, valOf, dstr, wOf, wCalc, mk, pickCtx, numChk, GBP, KG, G, MET, CM, KM, LIT, ML, MIN, cnt, PLAIN_UNITS, plainNum } from './percentages.js';

const C = (u, As, mkf, extra = {}) => ({ u, As, mk: mkf, ...extra });
const people = cnt('people', 'person'), pupils = cnt('pupils', 'pupil');

// every context: n = a name, a = the starting amount (with its unit), p = 'p%', item = a thing for sale
const INC = [
  C(GBP, SHOP_PRICES, (n, a, p, i) => `${An(i)} costs ${a}. The price is increased by ${p}. Work out the new price of the ${i}.`, { item: true }),
  C(GBP, [800, 1000, 1200, 1500, 1600, 1800, 2000, 2400], (n, a, p) => `${n} earns ${a} a month. ${n} gets a pay rise of ${p}. Work out ${n}'s new monthly pay.`, { pmax: 20 }),
  C(CM, [120, 160, 200, 240, 300, 400], (n, a, p) => `A tree is ${a} tall. Over the next year it grows by ${p}. How tall is the tree at the end of the year?`, { pmax: 50 }),
  C(G, [200, 240, 400, 500, 600, 800], (n, a, p) => `A recipe uses ${a} of flour. ${n} increases the amount of flour by ${p}. What mass of flour does ${n} now use?`, { pmax: 50 }),
  C(GBP, [200, 300, 400, 500, 600, 800, 1000], (n, a, p, i) => `A season ticket costs ${a}. The cost goes up by ${p}. Work out the cost of a season ticket after the increase.`, { pmax: 30 }),
  C(KG, [4, 6, 8, 10, 12, 20, 40], (n, a, p) => `A puppy has a mass of ${a}. In one month its mass increases by ${p}. Work out the mass of the puppy after the month.`, { pmax: 50 }),
  C(people, [2000, 4000, 5000, 8000, 10000, 12000, 20000], (n, a, p) => `The population of a town is ${a}. It increases by ${p} over ten years. What is the population of the town after the increase?`, { pmax: 40 }),
  C(MIN, [20, 30, 40, 60, 80, 120], (n, a, p) => `A bus journey normally takes ${a}. Roadworks increase the journey time by ${p}. How long does the journey take with the roadworks?`, { pmax: 50 }),
  C(MET, [20, 40, 60, 80, 100, 120], (n, a, p) => `A garden path is ${a} long. It is extended by ${p}. Work out the new length of the path.`, { pmax: 50 }),
  C(pupils, [200, 240, 300, 400, 480, 500, 600, 800], (n, a, p) => `A school has ${a} pupils. The number of pupils increases by ${p} next year. How many pupils will the school have next year?`, { pmax: 25 }),
  C(GBP, [20, 25, 30, 40, 50, 60], (n, a, p) => `${n} pays ${a} a month for a phone contract. The monthly cost rises by ${p}. Work out the new monthly cost.`, { pmax: 30 }),
];
const DEC = [
  C(GBP, SHOP_PRICES, (n, a, p, i) => `In a sale, all prices are reduced by ${p}. ${An(i)} normally costs ${a}. Work out the sale price of the ${i}.`, { item: true }),
  C(LIT, [80, 120, 160, 200, 240, 400, 500], (n, a, p) => `A tank holds ${a} of water. ${p} of the water leaks out. How much water is left in the tank?`, { pmax: 60 }),
  C(GBP, SHOP_PRICES.filter(x => x >= 100), (n, a, p, i) => `${n} buys ${an(i)} for ${a}. After a year its value has fallen by ${p}. Work out its value after the year.`, { pmax: 50, item: true }),
  C(KG, [20, 40, 60, 80, 100, 120, 200], (n, a, p) => `A parcel has a mass of ${a}. ${n} removes some of the items and the mass decreases by ${p}. What is the mass of the parcel now?`, { pmax: 50 }),
  C(people, [2000, 4000, 5000, 8000, 10000, 12000, 20000], (n, a, p) => `A village has a population of ${a}. The population falls by ${p}. How many people live in the village now?`, { pmax: 40 }),
  C(CM, [20, 24, 30, 40, 60], (n, a, p) => `A candle is ${a} tall. After burning for an hour it is ${p} shorter. How tall is the candle now?`, { pmax: 40 }),
  C(MIN, [20, 25, 30, 40, 50, 60], (n, a, p) => `${n} takes ${a} to run a race. After training, ${n}'s time is reduced by ${p}. How long does ${n} now take to run the race?`, { pmax: 25 }),
  C(GBP, [20, 30, 40, 50, 60, 80, 100], (n, a, p) => `The price of a train ticket is ${a}. With a railcard, the price is reduced by ${p}. Work out the price of the ticket with the railcard.`, { pmin: 5, pmax: 40 }),
  C(KM, [20, 40, 60, 80, 100], (n, a, p) => `${n} plans to cycle ${a}. ${n} is tired and shortens the ride by ${p}. How far does ${n} cycle?`, { pmax: 40 }),
];
const BIG = [
  C(cnt('followers', 'follower'), [200, 400, 600, 800, 1000, 2000], (n, a, p) => `A video channel has ${a} followers. The number of followers increases by ${p} in a year. How many followers does the channel have now?`, { pmin: 101, pmax: 300 }),
  C(GBP, [200, 400, 500, 800, 1000, 2000], (n, a, p) => `A painting is valued at ${a}. Over twenty years, its value increases by ${p}. What is the value of the painting now?`, { pmin: 101, pmax: 300 }),
  C(CM, [20, 40, 60, 80, 100], (n, a, p) => `A bamboo shoot is ${a} tall. In a week it grows by ${p}. How tall is the shoot at the end of the week?`, { pmin: 101, pmax: 300 }),
  C(GBP, [4000, 6000, 8000, 10000, 12000], (n, a, p) => `A small company made a profit of ${a} in its first year. In its second year the profit increased by ${p}. How much profit did the company make in its second year?`, { pmin: 101, pmax: 300 }),
];
const NC = [5, 10, 15, 20, 25, 30, 35, 40, 45, 60, 75];
const CALC = [2, 3, 4, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 22, 23, 24, 26, 27, 28, 32, 33, 34, 36, 38, 42, 44, 46, 48];
const DECP = [2.5, 3.5, 4.5, 7.5, 12.5, 17.5];
const OVERP = [120, 125, 150, 200, 250];
const AMS = [40, 60, 80, 120, 160, 200, 240, 280, 320, 360, 400, 480, 500];

// contexts take (n, a, p, item) but pickCtx's bank format calls mk(n, p, a): wrap them
const wrap = (bank) => bank.map(c => ({ ...c, mk: (n, p, a, i) => c.mk(n, a, p, i) }));
const WI = wrap(INC), WD = wrap(DEC), WB = wrap(BIG);

export default {
  id: 'pct-change-by',
  topic: TOPIC, type: 'Increase or decrease by a percentage', code: 'PC6',
  levels: ['Core'],
  search: 'increase decrease by a percentage sale price pay rise how much is left VAT new price units calculator',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'plain-inc', label: 'increase an amount by a percentage', params: { dir: 1, kind: 'plain' } },
    { id: 'plain-dec', label: 'decrease an amount by a percentage', params: { dir: -1, kind: 'plain' } },
    { id: 'inc', label: 'worded increase, no calculator', params: { dir: 1, kind: 'ctx' } },
    { id: 'dec', label: 'worded decrease, no calculator', params: { dir: -1, kind: 'ctx' } },
    { id: 'over', label: 'worded increase of more than 100%', params: { dir: 1, kind: 'over' }, levels: ['Additional'] },
    { id: 'inc-calc', label: 'worded increase, calculator', params: { dir: 1, kind: 'calc' }, levels: ['Core', 'Additional'] },
    { id: 'dec-calc', label: 'worded decrease, calculator', params: { dir: -1, kind: 'calc' }, levels: ['Core', 'Additional'] },
    { id: 'vat', label: 'add VAT at 20%, calculator', params: { dir: 1, kind: 'vat' }, levels: ['Core', 'Additional'] },
    { id: 'decimal-calc', label: 'decimal percentage, calculator', params: { dir: 1, kind: 'dec' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1), sgn = v.dir;
    const fin = (A, p, u, text, calc, d) => {
      const nw = sgn > 0 ? F.of(A).add(d) : F.of(A).sub(d);
      const w = calc ? `${dstr(new F(Math.round((100 + sgn * p) * 10), 1000))} \\times ${A} = ${dstr(nw)}` : `${wOf(A, p, d)};\\ ${A} ${sgn > 0 ? '+' : '-'} ${dstr(d)} = ${dstr(nw)}`;
      return { parts: [{ body: text, a: u.tex(nw), w: M(w), calc, ...mk(2, u), chk: numChk(`${A}*${100 + sgn * p}/100`, nw) }] };
    };
    if (v.kind === 'plain') {
      const [p, A] = r.until(() => { const p = r.pick(NC), A = r.pick(AMS), d = valOf(A, p); return d.d <= 2 ? [p, A] : null; });
      const u = r.pick(PLAIN_UNITS);
      return fin(A, p, u, `${sgn > 0 ? 'Increase' : 'Decrease'} ${u.txt(A)} by ${p}%.`, false, valOf(A, p));
    }
    if (v.kind === 'vat') {
      const it = r.pick(SHOP), item = it.name, A = r.pick(it.prices) + r.pick([0, 0, -1, -5]);
      const d = valOf(A, 20);
      const text = r.pick([`${An(item)} costs ${pounds(A)} before VAT is added. VAT is charged at 20%. Calculate the cost of the ${item} including VAT.`, `The price of ${an(item)} is ${pounds(A)} plus VAT at 20%. Calculate the total price of the ${item}.`]);
      return fin(A, 20, GBP, text, true, d);
    }
    const bank = v.kind === 'over' ? (sgn > 0 ? WB : WI) : (sgn > 0 ? WI : WD);
    const ps = v.kind === 'calc' ? CALC : v.kind === 'dec' ? DECP : v.kind === 'over' ? OVERP : NC;
    const tweak = (v.kind === 'calc' || v.kind === 'dec') ? (c, A) => (c.u.money && !c.item ? A + r.pick([0, 0, 4, 6, 8, 12, 14, 18]) : A) : (c, A) => A;
    const x = pickCtx(r, ps, (val, p) => (v.kind === 'ctx' || v.kind === 'over' ? val.d <= 2 : true), bank, tweak);
    const sentence = x.c.mk(n, `${x.p}%`, x.c.u.txt(x.A), x.c.item ? shopFor(r, x.A) : null);
    return fin(x.A, x.p, x.c.u, sentence, v.kind === 'calc' || v.kind === 'dec', x.val);
  },
};
