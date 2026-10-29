// Shared helpers for the Decimals and Decimals: problem solving types (this file is not a question type itself).
import { F } from '../core/frac.js';
import { names, pounds, poundsTex } from '../core/q.js';
import { dstr, M, GBP, KG, G, MET, CM, KM, LIT, ML, cnt, mk, numChk, rnd, tie } from './percentages.js';
export { F, names, pounds, poundsTex, dstr, M, GBP, KG, G, MET, CM, KM, LIT, ML, cnt, mk, numChk, rnd, tie };

export const TOPIC = 'Decimals';
export const PTOPIC = 'Decimals: problem solving';

// ---------- numbers --------------------------------------------------------------------------------
// the number of decimal places an exact value needs (0 for a whole number)
export const dpOf = (f) => { f = F.of(f); let k = 0; while (10 ** k % f.d) { k++; if (k > 8) throw new Error('not a decimal'); } return k; };
// a random decimal with exactly dp places (the last digit is never 0), lo <= x < hi
export const rd = (r, dp, lo, hi) => r.until(() => {
  const m = r.int(Math.round(lo * 10 ** dp), Math.round(hi * 10 ** dp) - 1);
  return m <= 0 || (dp && m % 10 === 0) ? null : new F(m, 10 ** dp);
});
// the value as text for the question, e.g. 0.45, 12.5, 3
export const ds = (f) => dstr(f);
// the same value as Python source for the independent checker
export const py = (f) => `Fraction('${dstr(f)}')`;
// money in a question: 85p, £3.40, £12
export const mon = (f) => { f = F.of(f); return f.val < 1 ? `${Math.round(f.val * 100)}p` : pounds(f.val); };
// the working that scales a division or multiplication: x10, x100 ...
export const pow10 = (k) => 10 ** k;

// a number of digits 12..99 that is not prime and has no zero digit (so "28" in 0.028 or 2.8)
export const TWO_DIGIT = [12, 14, 15, 16, 18, 21, 24, 25, 27, 28, 32, 33, 35, 36, 39, 42, 45, 48, 49, 54, 55, 56, 63, 64, 72, 81];
export const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };

// ---------- contexts ---------------------------------------------------------------------------------
// each context: u (unit), lo/hi (sensible size of the quantities), and the sentence
const C = (u, lo, hi, mkf, extra = {}) => ({ u, lo, hi, mk: mkf, ...extra });
export const ADD_CTX = [
  C(KG, 0.5, 9, (n, a, b) => `${n} buys ${a} of apples and ${b} of grapes. What is the total mass of fruit that ${n} buys?`),
  C(LIT, 0.5, 9, (n, a, b) => `A jug holds ${a} of water. ${n} pours in ${b} more. How much water is in the jug now?`),
  C(GBP, 1, 30, (n, a, b) => `${n} spends ${a} on lunch and ${b} on a drink. How much does ${n} spend altogether?`, { money: true }),
  C(KM, 1, 15, (n, a, b) => `${n} runs ${a} on Monday and ${b} on Tuesday. How far does ${n} run altogether?`),
  C(MET, 1, 12, (n, a, b) => `A rope is made by joining two pieces. One piece is ${a} long and the other is ${b} long. How long is the rope?`),
  C(KG, 1, 12, (n, a, b) => `A parcel contains a book of mass ${a} and a toy of mass ${b}. What is the total mass of the contents?`),
];
export const SUB_CTX = [
  C(GBP, 5, 40, (n, a, b) => `${n} has ${a} and buys a book for ${b}. How much money does ${n} have left?`, { money: true }),
  C(LIT, 2, 12, (n, a, b) => `A tank holds ${a} of water. ${b} leaks out. How much water is left in the tank?`),
  C(KG, 2, 12, (n, a, b) => `A bag of potatoes has a mass of ${a}. ${n} uses ${b} of the potatoes. What mass of potatoes is left?`),
  C(MET, 2, 12, (n, a, b) => `A plank is ${a} long. ${n} cuts off a piece ${b} long. How long is the piece that is left?`),
  C(KM, 3, 20, (n, a, b) => `A walking route is ${a} long. ${n} has walked ${b}. How much further does ${n} have to walk?`),
  C(KG, 0.5, 9, (n, a, b) => `${n}'s rucksack has a mass of ${a}. ${n} takes out a water bottle of mass ${b}. What is the mass of the rucksack now?`),
];
// two numbers in a context with dp decimal places each (money always has pence)
export function ctxPair(r, bank, dpA, dpB, op) {
  return r.until(() => {
    const c = r.pick(bank);
    const da = c.money ? 2 : dpA, db = c.money ? 2 : dpB;
    const a = rd(r, da, c.lo, c.hi), b = rd(r, db, op === '-' ? c.lo / 2 : c.lo, op === '-' ? Math.min(c.hi, a.val - 0.05) : c.hi);
    if (b.val < 0.05 || (op === '-' && !(a.gt(b)))) return null;
    return { c, a, b, ans: op === '+' ? a.add(b) : a.sub(b) };
  });
}
export const ctxText = (r, { c, a, b }) => { const [n] = names(r, 1); return c.mk(n, c.u.txt(a), c.u.txt(b)); };

// ---------- price per unit contexts (decimal quantity, price per kg etc.) --------------------------------
export const RATE_CTX = [
  { item: 'cheese', per: 'kg', u: KG, price: [4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 12.5], qty: [0.2, 0.25, 0.4, 0.5, 0.6, 0.75, 1.5, 2.5], q: (n, p, w) => `Cheese costs ${p} per kilogram. ${n} buys ${w} of cheese. How much does ${n} pay?`, rev: (n, p, t) => `Cheese costs ${p} per kilogram. ${n} spends ${t} on cheese. What mass of cheese does ${n} buy?` },
  { item: 'apples', per: 'kg', u: KG, price: [1.5, 2.4, 2.5, 3.2, 3.6, 4.5], qty: [0.5, 1.5, 2.5, 3.5, 4.5, 0.75, 1.2, 2.4], q: (n, p, w) => `Apples cost ${p} per kilogram. ${n} buys ${w} of apples. How much does ${n} pay?`, rev: (n, p, t) => `Apples cost ${p} per kilogram. ${n} spends ${t} on apples. What mass of apples does ${n} buy?` },
  { item: 'ribbon', per: 'metre', u: MET, price: [0.8, 1.2, 1.5, 2.4, 3.5, 4.5], qty: [0.5, 1.5, 2.5, 3.5, 4.5, 6.5, 1.2, 2.4, 3.6], q: (n, p, w) => `Ribbon costs ${p} per metre. ${n} buys ${w} of ribbon. How much does ${n} pay?`, rev: (n, p, t) => `Ribbon costs ${p} per metre. ${n} spends ${t} on ribbon. What length of ribbon does ${n} buy?` },
  { item: 'fabric', per: 'metre', u: MET, price: [4.5, 6, 7.5, 8, 9.5, 12], qty: [0.5, 1.5, 2.5, 3.5, 0.75, 1.2, 2.4], q: (n, p, w) => `Fabric costs ${p} per metre. ${n} buys ${w} of fabric. How much does ${n} pay?`, rev: (n, p, t) => `Fabric costs ${p} per metre. ${n} spends ${t} on fabric. What length of fabric does ${n} buy?` },
  { item: 'petrol', per: 'litre', u: LIT, price: [1.4, 1.45, 1.5, 1.6, 1.35], qty: [20, 25, 30, 35, 40, 45, 50, 12.5, 32.5, 37.5], q: (n, p, w) => `Petrol costs ${p} per litre. ${n} puts ${w} of petrol in a car. How much does ${n} pay?`, rev: (n, p, t) => `Petrol costs ${p} per litre. ${n} pays ${t} for petrol. How much petrol does ${n} buy?` },
];

// ---------- checking text ---------------------------------------------------------------------------
export const num = (expr, f, extra = {}) => numChk(expr, f, extra);

// ---------- division by a decimal ---------------------------------------------------------------------
// a ÷ b = q with b a decimal whose digits are one non-zero digit (two = false) or two adjacent non-zero digits that
// make a number that is not prime (two = true). rel compares the decimal places of the dividend a with the divisor b.
export function divPair(r, { two = false, rel = null, kbs = [1, 2], qInt = false, maxDpA = 4, daIs = null, maxA = 500 }) {
  return r.until(() => {
    const kb = r.pick(kbs);
    const dm = two ? r.pick(TWO_DIGIT) : r.int(2, 9);
    const b = new F(dm, 10 ** kb);
    const qk = qInt ? 0 : two ? r.pick([0, 0, 1]) : r.pick([0, 0, 1, 1, 2]);
    const qm = two ? r.int(2, 60) : r.int(2, 99);
    const q = new F(qm, 10 ** qk);
    if (!qInt && qk > 0 && qm % 10 === 0) return null;
    const a = b.mul(q);
    const da = dpOf(a), db = dpOf(b);
    if (da > maxDpA || a.val > maxA || a.val < 0.04) return null;
    if (rel === 'same' && da !== db) return null;
    if (rel === 'more' && !(da > db)) return null;
    if (rel === 'fewer' && !(da < db)) return null;
    if (daIs !== null && da !== daIs) return null;
    if (q.eq(1)) return null;
    return { a, b, q, da, db };
  }, 20000);
}
// working for a ÷ b by scaling both numbers by the same power of ten
export function divWork({ a, b, q, da, db }) {
  const s = Math.max(da, db), k = 10 ** s;
  return `\\times ${k}:\\ ${ds(a.mul(k))} \\div ${ds(b.mul(k))} = ${ds(q)}`;
}
