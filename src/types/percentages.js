// Shared helpers for the Percentages and Percentages: problem solving types (this file is not a question type itself).
import { F, plainNum } from '../core/frac.js';
import { names, pounds, poundsTex } from '../core/q.js';
export { F, names, pounds, poundsTex, plainNum };

export const TOPIC = 'Percentages';
export const PTOPIC = 'Percentages: problem solving';
export const M = (s) => `{{${s}}}`;

// ---------- numbers --------------------------------------------------------------------------------
// exact decimal text of a fraction whose denominator divides 10^6
export function dstr(f) {
  f = F.of(f);
  let k = 0; while (k <= 6 && 10 ** k % f.d) k++;
  if (k > 6) throw new Error('not a short decimal: ' + f);
  return String(Math.round(f.n * (10 ** k / f.d)) / 10 ** k);
}
const withSep = (s, br) => { const [i, d] = s.split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, br) + (d ? '.' + d : ''); };
export const pctF = (p) => new F(Math.round(p * 10), 10);                    // a percentage with at most 1 decimal place
export const valOf = (A, p) => pctF(p).mul(A).div(100);                       // p% of A, exactly
// round an exact fraction to dp decimal places (half up); tie() is true when it sits exactly on a half
export function rnd(f, dp = 0) {
  f = F.of(f); const s = 10 ** dp;
  const x = f.mul(s);                                                          // x = n/d
  const q = Math.floor((2 * x.n + x.d) / (2 * x.d));
  return new F(q, s);
}
export const tie = (f, dp = 0) => { const x = F.of(f).mul(10 ** dp); return x.d === 2; };
export const shown = (f, dp) => (dp === 0 ? String(rnd(f, 0).n) : rnd(f, dp).val.toFixed(dp));

// ---------- units ----------------------------------------------------------------------------------
// meas: the answer needs a unit (and earns a unit mark). count: a number of people or things (no unit mark).
const unit = (word) => ({
  meas: true, word,
  txt: (v) => `${withSep(dstr(v), ',')} ${word}`,
  tex: (v) => `${withSep(dstr(v), '{,}')}\\text{ ${word}}`,
});
export const GBP = { meas: true, money: true, word: '£', txt: (v) => pounds(F.of(v).val), tex: (v) => poundsTex(F.of(v).val) };
export const KG = unit('kg'), G = unit('g'), MET = unit('m'), CM = unit('cm'), KM = unit('km'), LIT = unit('litres'), ML = unit('ml'), MIN = unit('minutes'), YRS = unit('years');
export const cnt = (plural, singular = plural) => ({
  meas: false, count: true,
  txt: (v) => withSep(dstr(v), ','),
  tex: (v) => `${withSep(dstr(v), '{,}')}\\text{ ${F.of(v).val === 1 ? singular : plural}}`,
});

// marks for a part: base marks, plus one mark for the unit when the answer is a measured quantity
export const mk = (base, u) => { const m = base + (u && u.meas ? 1 : 0); return { m, lines: Math.max(3, 2 * m) }; };

// ---------- working ----------------------------------------------------------------------------------
const pc = (q) => `${q}\\%`;
// brief mental-method working for p% of A (no calculator)
export function wOf(A, p, val) {
  const a = (q) => dstr(valOf(A, q));
  const v = dstr(val);
  if (p === 50) return `${A} \\div 2 = ${v}`;
  if (p === 25) return `${A} \\div 4 = ${v}`;
  if (p === 75) return `25\\% = ${a(25)};\\ 75\\% = ${v}`;
  if (p === 10) return `${A} \\div 10 = ${v}`;
  if (p === 12.5) return `${A} \\div 8 = ${v}`;
  if (p === 17.5) return `10\\% = ${a(10)};\\ 5\\% = ${a(5)};\\ 2.5\\% = ${a(2.5)};\\ 17.5\\% = ${v}`;
  if (p === 2.5) return `10\\% = ${a(10)};\\ 5\\% = ${a(5)};\\ 2.5\\% = ${v}`;
  if (p > 100) return `100\\% = ${A};\\ ${pc(p - 100)} = ${a(p - 100)};\\ ${pc(p)} = ${v}`;
  if (p % 10 === 0) return `10\\% = ${a(10)};\\ ${pc(p)} = ${v}`;
  if (p === 5) return `10\\% = ${a(10)};\\ 5\\% = ${v}`;
  if (p % 5 === 0) return `10\\% = ${a(10)};\\ 5\\% = ${a(5)};\\ ${pc(p)} = ${v}`;
  return `1\\% = ${a(1)};\\ ${pc(p)} = ${v}`;
}
// calculator working: decimal multiplier
export const wCalc = (A, p, val) => `${dstr(pctF(p).div(100))} \\times ${A} = ${dstr(val)}`;

// ---------- percentage of an amount, in context ------------------------------------------------------
// each context: u (unit of the amount and the answer), As (sensible amounts), mk(name, 'p%', amount) -> sentence(s),
// optionally pmin / pmax (the percentages that make sense; default 0 to 100)
const C = (u, As, mkf, extra = {}) => ({ u, As, mk: mkf, ...extra });
export const AMOUNT_CTX = [
  C(GBP, [40, 60, 80, 120, 150, 160, 200, 240, 250, 300, 320, 400, 480, 500, 600, 800], (n, p, a) => `${n} earns ${a} in a month and saves ${p} of it. How much does ${n} save?`),
  C(GBP, [20, 24, 30, 36, 40, 45, 50, 60, 64, 72, 80, 90, 120], (n, p, a) => `The bill for a meal is ${a}. ${n} leaves a tip of ${p} of the bill. How much is the tip?`, { pmax: 25 }),
  C(GBP, [60, 80, 120, 160, 200, 240, 300, 400, 500, 800], (n, p, a) => `A school raises ${a} at its summer fair. ${p} of the money raised is given to charity. How much money is given to charity?`),
  C(GBP, [200, 240, 300, 400, 480, 500, 600, 800, 1000], (n, p, a) => `A holiday costs ${a}. A deposit of ${p} of the cost is paid when the holiday is booked. How much is the deposit?`, { pmin: 10, pmax: 40 }),
  C(GBP, [200, 250, 300, 400, 500, 600, 800, 1000, 1200], (n, p, a) => `${n} has ${a} in a savings account. After one year, interest of ${p} of this amount is added to the account. How much interest is added?`, { pmax: 20 }),
  C(GBP, [40, 60, 80, 120, 160, 200, 240, 300, 400], (n, p, a) => `A coat is priced at ${a}. A shop gives a discount of ${p} on the price. How much is the discount?`),
  C(GBP, [20, 30, 40, 50, 60, 80, 100, 120], (n, p, a) => `${n} is paid ${a} for a job and spends ${p} of it on a new game. How much does ${n} spend on the game?`),
  C(G, [200, 240, 400, 500, 600, 800], (n, p, a) => `A bag of flour has a mass of ${a}. A recipe uses ${p} of the flour. What mass of flour does the recipe use?`),
  C(KM, [20, 30, 40, 60, 80, 120, 160, 200], (n, p, a) => `A cycle route is ${a} long. ${n} has cycled ${p} of the route. How far has ${n} cycled?`),
  C(LIT, [40, 80, 120, 160, 200, 240, 400, 500, 600, 800], (n, p, a) => `A water tank holds ${a} of water when it is full. The tank is ${p} full. How much water is in the tank?`),
  C(CM, [40, 60, 80, 120, 160, 200, 240], (n, p, a) => `A ribbon is ${a} long. ${n} cuts off ${p} of the ribbon. How long is the piece that ${n} cuts off?`),
  C(ML, [200, 400, 500, 600, 800, 1000], (n, p, a) => `A bottle contains ${a} of squash. ${n} drinks ${p} of the squash. How much squash does ${n} drink?`),
  C(KG, [20, 40, 60, 80, 100, 120, 160, 200], (n, p, a) => `A parcel has a mass of ${a}. The packaging makes up ${p} of this mass. What is the mass of the packaging?`, { pmax: 40 }),
  C(cnt('pupils', 'pupil'), [40, 60, 80, 100, 120, 140, 160, 180, 200, 240, 300], (n, p, a) => `There are ${a} pupils in Year 7. ${p} of the pupils walk to school. How many pupils walk to school?`),
  C(cnt('seats', 'seat'), [200, 240, 300, 400, 500, 600, 800], (n, p, a) => `A concert hall has ${a} seats. ${p} of the seats are in the balcony. How many seats are in the balcony?`, { pmax: 50 }),
  C(cnt('questions', 'question'), [20, 40, 50, 60, 80, 100], (n, p, a) => `A quiz has ${a} questions. ${n} answers ${p} of the questions correctly. How many questions does ${n} answer correctly?`),
  C(cnt('chocolates', 'chocolate'), [20, 24, 40, 60, 80, 100], (n, p, a) => `A box contains ${a} chocolates. ${p} of the chocolates are milk chocolate. How many chocolates are milk chocolate?`),
  C(cnt('pupils', 'pupil'), [200, 240, 300, 400, 480, 500, 600, 800], (n, p, a) => `A school has ${a} pupils. ${p} of the pupils play a musical instrument. How many pupils play a musical instrument?`),
  // percentages over 100%
  C(CM, [20, 40, 60, 80, 120, 160, 200], (n, p, a) => `A sunflower is ${a} tall. A month later it is ${p} of its original height. How tall is the sunflower now?`, { pmin: 101, pmax: 300 }),
  C(GBP, [40, 60, 80, 100, 120, 160, 200], (n, p, a) => `${n} buys a rare coin for ${a}. Ten years later the coin is worth ${p} of the price ${n} paid. How much is the coin worth now?`, { pmin: 101, pmax: 300 }),
  C(G, [100, 120, 200, 240, 300, 400], (n, p, a) => `A recipe for a small cake uses ${a} of sugar. ${n} makes a bigger cake using ${p} of this amount of sugar. How much sugar does ${n} use?`, { pmin: 101, pmax: 300 }),
];
// choose a context, a percentage from ps and an amount so that the answer is a sensible number
// (a whole number of things, money to the penny, other measures to 1 decimal place)
export function pickCtx(r, ps, test = () => true, bank = AMOUNT_CTX, tweak = (c, A) => A) {
  return r.until(() => {
    const c = r.pick(bank);
    const pl = ps.filter(p => p >= (c.pmin ?? 0) && p <= (c.pmax ?? 100));
    if (!pl.length) return null;
    const p = r.pick(pl), A = tweak(c, r.pick(c.As)), val = valOf(A, p);
    if (c.u.count ? (!val.isInt || val.val < 2) : (c.u.money ? 100 % val.d : 10 % val.d)) return null;
    return test(val, p, A, c) ? { c, p, A, val } : null;
  });
}
// the amount sentence for a context
export const ctxQuestion = (r, { c, p, A }) => { const [n] = names(r, 1); return c.mk(n, `${p}%`, c.u.txt(A)); };

// plain (not worded) units for "Work out 25% of 80 kg"
export const PLAIN_UNITS = [GBP, GBP, GBP, KG, G, MET, CM, KM, LIT, ML];
export const VERBS = ['Work out', 'Find'];

// ---------- exact checking text ----------------------------------------------------------------------
export const numChk = (expr, f, extra = {}) => ({ k: 'num', expr, val: dstr(F.of(f)), ...extra });

// ---------- things for sale, with believable prices ---------------------------------------------------
export const SHOP = [
  { name: 'jacket', prices: [40, 60, 80, 100, 120, 160] },
  { name: 'pair of trainers', prices: [40, 60, 80, 100, 120] },
  { name: 'coat', prices: [60, 80, 100, 120, 160, 200] },
  { name: 'rucksack', prices: [40, 60, 80, 100, 120] },
  { name: 'watch', prices: [60, 80, 120, 160, 200, 240] },
  { name: 'skateboard', prices: [40, 60, 80, 100, 120] },
  { name: 'tent', prices: [60, 80, 120, 160, 200, 240] },
  { name: 'guitar', prices: [120, 160, 200, 240, 320, 400] },
  { name: 'camera', prices: [120, 160, 200, 240, 320, 400] },
  { name: 'telescope', prices: [120, 160, 200, 240, 320, 400] },
  { name: 'tablet', prices: [120, 160, 200, 240, 280, 320, 400] },
  { name: 'bicycle', prices: [120, 160, 200, 240, 300, 400, 480] },
  { name: 'games console', prices: [160, 200, 240, 280, 320, 400, 480] },
  { name: 'laptop', prices: [400, 480, 500, 600, 800, 1000] },
  { name: 'sofa', prices: [400, 480, 500, 600, 800, 1000] },
];
export const SHOP_PRICES = [...new Set(SHOP.flatMap(i => i.prices))].sort((a, b) => a - b);
export const shopFor = (r, A) => r.pick(SHOP.filter(i => i.prices.includes(A))).name;      // an item that can cost A
export const an = (w) => (/^[aeiou]/i.test(w) ? 'an ' : 'a ') + w;
export const An = (w) => { const t = an(w); return t[0].toUpperCase() + t.slice(1); };
