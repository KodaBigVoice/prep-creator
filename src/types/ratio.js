// Shared helpers for the Ratio and proportion types (this file is not a question type itself).
import { gcd } from '../core/frac.js';
import { F, names, pounds, poundsTex, dstr, M, GBP, KG, G, MET, CM, KM, LIT, ML, cnt, mk, numChk } from './percentages.js';
export { gcd, F, names, pounds, poundsTex, dstr, M, GBP, KG, G, MET, CM, KM, LIT, ML, cnt, mk, numChk };

export const TOPIC = 'Ratio and proportion';
export const PTOPIC = 'Ratio and proportion: problem solving';

export const gcdAll = (xs) => xs.reduce((a, b) => gcd(a, b));
export const sumOf = (xs) => xs.reduce((a, b) => a + b, 0);
export const rtx = (xs) => xs.join(' : ');                       // 3 : 5, for text and maths alike
// a coprime ratio of the given number of parts
export function ratioOf(r, parts, { max = 8, maxSum = 20, distinct = true, min = 1 } = {}) {
  return r.until(() => {
    const x = Array.from({ length: parts }, () => r.int(min, max));
    if (gcdAll(x) !== 1 || sumOf(x) > maxSum) return null;
    if (distinct && new Set(x).size !== parts) return null;
    return x;
  });
}
export const nameList = (ns) => (ns.length === 2 ? `${ns[0]} and ${ns[1]}` : `${ns.slice(0, -1).join(', ')} and ${ns[ns.length - 1]}`);

// pairs of things in a ratio
export const PAIRS = [
  ['boys', 'girls', 'pupils', 'in a school club'], ['red counters', 'blue counters', 'counters', 'in a bag'], ['adults', 'children', 'people', 'at a theatre show'],
  ['cats', 'dogs', 'animals', 'at a rescue centre'], ['fiction books', 'non-fiction books', 'books', 'on a shelf'], ['apples', 'oranges', 'pieces of fruit', 'in a bowl'],
  ['tulips', 'daffodils', 'flowers', 'in a garden'], ['home wins', 'away wins', 'wins', 'for a football team this season'],
];
export const TRIPLES = [
  ['red', 'blue', 'green', 'counters', 'in a bag'], ['gold', 'silver', 'bronze', 'medals', 'won by a school'], ['small', 'medium', 'large', 'T-shirts', 'in a box'],
  ['red', 'blue', 'white', 'cars', 'in a car park'],
];
// the question for a pair given counts x and y
export const pairSentence = (p, x, y) => `There are ${x} ${p[0]} and ${y} ${p[1]} ${p[3]}.`;

// ---------- sharing a total ---------------------------------------------------------------------------
// a quantity that is split in a ratio: measured ones have a unit
export const SPLIT = [
  { u: KG, tot: [20, 24, 30, 36, 40, 48, 60, 72, 80, 90, 120], two: (T, rs) => `A bag of compost of mass ${T} is split between two flower beds in the ratio ${rs}. What mass of compost goes into each bed?`, three: (T, rs) => `A ${T} bag of compost is split between three flower beds in the ratio ${rs}. What mass of compost goes into each bed?`, lab2: ['first bed', 'second bed'], lab3: ['first bed', 'second bed', 'third bed'] },
  { u: LIT, tot: [20, 24, 30, 36, 40, 48, 60, 72, 80, 90], two: (T, rs) => `${T} of paint is poured into two tins in the ratio ${rs}. How much paint is in each tin?`, three: (T, rs) => `${T} of paint is poured into three tins in the ratio ${rs}. How much paint is in each tin?`, lab2: ['first tin', 'second tin'], lab3: ['first tin', 'second tin', 'third tin'] },
  { u: MET, tot: [20, 24, 30, 36, 40, 48, 60, 72, 80, 90], two: (T, rs) => `A rope ${T} long is cut into two pieces in the ratio ${rs}. Work out the length of each piece.`, three: (T, rs) => `A rope ${T} long is cut into three pieces in the ratio ${rs}. Work out the length of each piece.`, lab2: ['first piece', 'second piece'], lab3: ['first piece', 'second piece', 'third piece'] },
  { u: CM, tot: [60, 72, 80, 90, 96, 120, 144, 150], two: (T, rs) => `A ribbon ${T} long is cut into two pieces in the ratio ${rs}. Work out the length of each piece.`, three: (T, rs) => `A ribbon ${T} long is cut into three pieces in the ratio ${rs}. Work out the length of each piece.`, lab2: ['first piece', 'second piece'], lab3: ['first piece', 'second piece', 'third piece'] },
];
export const COUNTS = [['sweets', 'sweets'], ['stickers', 'stickers'], ['marbles', 'marbles'], ['football cards', 'football cards'], ['stamps', 'stamps']];

// answer text for a list of shares: "Ann: £24, Ben: £36" or "24 kg, 36 kg"
export const shareAns = (labels, vals, u) => (labels ? labels.map((l, i) => `\\text{${l}: }${u.tex(new F(vals[i]))}`) : vals.map(v => u.tex(new F(v)))).join(',\\ ');
export const listChk = (exprs, vals) => ({ k: 'num', expr: `[${exprs.join(',')}]`, val: vals.join(',') });

// a coefficient for algebra text: 1 is left out (x, not 1x)
export const cf = (n) => (n === 1 ? '' : String(n));
