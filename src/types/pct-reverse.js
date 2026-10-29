import { TOPIC, M, F, plainNum, SHOP, SHOP_PRICES, shopFor, an, An, names, pounds, dstr, mk, numChk, GBP, KG, G, CM, MIN, KM, cnt, rnd, valOf } from './percentages.js';

const NC = [5, 10, 15, 20, 25, 30, 40];
const people = cnt('people', 'person'), pupils = cnt('pupils', 'pupil');
// original amount O, change p%, new amount N
const DEC = [
  { u: GBP, Os: SHOP_PRICES, item: true, mk: (n, p, N, i) => `In a sale, all prices are reduced by ${p}%. ${An(i)} now costs ${N}. What was the original price of the ${i}?` },
  { u: GBP, Os: [20, 30, 40, 50, 60, 80, 100], mk: (n, p, N) => `A train ticket costs ${N} with a railcard. The railcard reduces the price by ${p}%. What is the price of the ticket without the railcard?` },
  { u: pupils, Os: [200, 240, 300, 400, 500, 600, 800], mk: (n, p, N) => `The number of pupils in a school fell by ${p}% to ${N}. How many pupils were in the school before the fall?` },
  { u: MIN, Os: [20, 30, 40, 50, 60, 80], mk: (n, p, N) => `${n}'s time for a race is reduced by ${p}%. The new time is ${N} minutes. How many minutes did the race take ${n} before the reduction?` },
  { u: KG, Os: [20, 40, 60, 80, 100, 200], mk: (n, p, N) => `A parcel loses ${p}% of its mass when some items are taken out. It now has a mass of ${N} kg. What was the mass of the parcel before the items were taken out?` },
];
const INC = [
  { u: GBP, Os: SHOP_PRICES, item: true, mk: (n, p, N, i) => `The price of ${an(i)} is increased by ${p}%. It now costs ${N}. What was the price of the ${i} before the increase?` },
  { u: GBP, Os: [800, 1000, 1200, 1500, 1600, 2000], mk: (n, p, N) => `After a pay rise of ${p}%, ${n} earns ${N} a month. How much did ${n} earn each month before the pay rise?` },
  { u: CM, Os: [40, 60, 80, 100, 120, 200], mk: (n, p, N) => `A tree has grown by ${p}% since it was planted. It is now ${N} cm tall. How tall was the tree when it was planted?` },
  { u: people, Os: [2000, 4000, 5000, 8000, 10000, 20000], mk: (n, p, N) => `The population of a town increased by ${p}% to ${N}. What was the population of the town before the increase?` },
  { u: G, Os: [200, 400, 500, 600, 800], mk: (n, p, N) => `A recipe uses ${p}% more flour than it did before. It now uses ${N} g of flour. How much flour did the recipe use before?` },
];
const PART = [
  { u: GBP, Ws: SHOP_PRICES, item: true, mk: (n, p, a, i) => `${n} has saved ${a}. This is ${p}% of the cost of ${an(i)}. Work out the cost of the ${i}.` },
  { u: cnt('questions', 'question'), Ws: [20, 25, 40, 50, 60, 80, 100], mk: (n, p, a) => `${n} gets ${a} questions correct in a quiz. This is ${p}% of all of the questions. How many questions are in the quiz?` },
  { u: G, Ws: [200, 250, 400, 500, 800, 1000], mk: (n, p, a) => `A recipe uses ${a} of butter. This is ${p}% of the total mass of the ingredients. What is the total mass of the ingredients?` },
  { u: KM, Ws: [20, 25, 40, 50, 60, 80, 100, 120], mk: (n, p, a) => `${n} has walked ${a} along a trail. This is ${p}% of the length of the trail. How long is the trail?` },
  { u: pupils, Ws: [100, 200, 240, 300, 400, 500, 600], mk: (n, p, a) => `${a} pupils in a school are in the choir. This is ${p}% of all of the pupils in the school. How many pupils are in the school?` },
  { u: null, mk: (n, p, a) => `${p}% of a number is ${a}. Work out the number.` },
];
const money = (u, x) => (u === GBP ? pounds(x) : String(x));

export default {
  id: 'pct-reverse',
  topic: TOPIC, type: 'Reverse percentages', code: 'PC9',
  levels: ['Additional'],
  search: 'reverse percentage original price before sale after increase find the whole is 15% of what number VAT',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'part-easy', label: 'find the whole from a part:  28 is 20% of what?', params: { k: 'part', ps: [10, 20, 25, 50, 5] }, levels: ['Core', 'Additional'] },
    { id: 'sale', label: 'after a decrease (sale price)', params: { k: 'dec' } },
    { id: 'increase', label: 'after an increase', params: { k: 'inc' } },
    { id: 'part', label: 'find the whole from a part, any percentage', params: { k: 'part', ps: [15, 35, 12, 8, 45, 60, 30, 40, 4, 16, 18] } },
    { id: 'sale-calc', label: 'after a decrease, calculator', params: { k: 'dec', calc: true } },
    { id: 'increase-calc', label: 'after an increase, calculator', params: { k: 'inc', calc: true } },
    { id: 'vat', label: 'price including VAT at 20%, find the price before VAT', params: { k: 'vat', calc: true } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'part') {
      const c = r.pick(PART), p = r.pick(v.ps);
      const [W, a] = r.until(() => { const W = c.Ws ? r.pick(c.Ws) : r.pick([40, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 800]); const a = valOf(W, p); return a.isInt ? [W, a.n] : null; });
      const u = c.u;
      const body = c.mk(n, p, c.u ? (c.u === GBP ? pounds(a) : (c.u.txt ? c.u.txt(a) : a)) : String(a), c.item ? shopFor(r, W) : null);
      const ans = u ? u.tex(W) : String(W);
      const w = p === 50 ? `50\\% = ${a};\\ 100\\% = ${a} \\times 2 = ${W}` : (100 % p === 0 ? `${p}\\% = ${a};\\ 100\\% = ${a} \\times ${100 / p} = ${W}` : `${p}\\% = ${a};\\ 1\\% = ${dstr(new F(a * 100, p * 100))};\\ 100\\% = ${W}`);
      return { parts: [{ body, a: ans, w: M(w), ...mk(2, u), chk: numChk(`${a}/${p}*100`, W) }] };
    }
    const dir = v.k === 'dec' ? -1 : 1;
    let c, p, O, N, item;
    if (v.k === 'vat') {
      p = 20; const it = r.pick(SHOP); item = it.name; O = r.pick(it.prices); N = O * 6 / 5;
      const body = r.pick([`${An(item)} costs ${pounds(N)} including VAT at 20%. Calculate the price of the ${item} before VAT was added.`, `The total price of ${an(item)}, including VAT at 20%, is ${pounds(N)}. Calculate the price of the ${item} without VAT.`]);
      return { parts: [{ body, a: GBP.tex(O), w: M(`${N} \\div 1.2 = ${O}`), calc: true, ...mk(2, GBP), chk: numChk(`${N}/1.2`, O) }] };
    }
    c = r.pick(dir < 0 ? DEC : INC);
    const ps = v.calc ? [8, 12, 14, 16, 17, 18, 22, 24, 35, 45] : NC;
    [p, O] = r.until(() => {
      const p = r.pick(ps), O = r.pick(c.Os), N = F.of(O).mul(100 + dir * p).div(100);
      const ok = c.u.count ? N.isInt : (c.u.money ? 100 % N.d === 0 : 10 % N.d === 0);
      return ok && (v.calc || N.d <= 2) ? [p, O] : null;
    });
    N = F.of(O).mul(100 + dir * p).div(100);
    const nText = c.u === GBP ? pounds(N.val) : dstr(N);
    const body = c.mk(n, p, c.u === GBP ? pounds(N.val) : plainNum(dstr(N)), c.item ? shopFor(r, O) : null);
    const pc = 100 + dir * p;
    const w = v.calc ? `${dstr(N)} \\div ${dstr(new F(pc, 100))} = ${O}` : `${pc}\\% = ${dstr(N)};\\ 1\\% = ${dstr(N.div(pc))};\\ 100\\% = ${O}`;
    return { parts: [{ body, a: c.u.tex(O), w: M(w), calc: !!v.calc, ...mk(2, c.u), chk: numChk(`${dstr(N)}/${pc}*100`, O) }] };
  },
};
