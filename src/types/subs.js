// The Substitution topic: one factory builds the expression steps (1-16); the table, formula, worded, compare and
// expression steps have their own generators. This file also exports the list of types (it is not a type itself).
import { parse, texAlg, subst } from '../core/algexpr.js';
import * as A from '../core/arith.js';
import { F } from '../core/frac.js';
import { P } from '../core/poly.js';
import { M, GBP, CM, MIN, LIT, mk, dstr } from './percentages.js';

export const TOPIC = 'Substitution';
const LETTERS = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r'], ['m', 'n', 'k']];
const ABC = ['a', 'b', 'c'];
const rename = (L, s) => s.replace(/[abc]/g, (c) => L[ABC.indexOf(c)]);
const listAnd = (xs) => (xs.length === 1 ? xs[0] : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
const lab = (i) => 'abcdefgh'[i];

// ---------- values ---------------------------------------------------------------------------------------
const SQ = [4, 9, 16, 25, 36, 49, 64, 81, 100];
const PYTH_SUM = [[3, 4], [4, 3], [6, 8], [8, 6], [5, 12], [12, 5], [8, 15], [15, 8]];
const PYTH_DIFF = [[5, 3], [10, 6], [13, 5], [15, 9], [17, 8], [13, 12], [10, 8], [25, 24]];
const FRACS = [[1, 2], [1, 3], [1, 4], [3, 4], [2, 3], [1, 5], [1, 6], [3, 2], [5, 2], [3, 5], [5, 4]];
// values for the letters in use (an object keyed by a, b, c holding exact fractions), or null to try again
function pickVals(r, cfg, used) {
  const o = {};
  const S = cfg.vals;
  if (S === 'sq') { const pool = r.shuffle(SQ); used.forEach((l, i) => { o[l] = F.of(pool[i]); }); return o; }
  if (S === 'pyth-sum' || S === 'pyth-diff') {
    const [p, q] = r.pick(S === 'pyth-sum' ? PYTH_SUM : PYTH_DIFF), pair = { a: p, b: q };
    used.forEach((l) => { o[l] = F.of(pair[l] ?? r.int(2, 9)); }); return o;
  }
  if (S === 'fracs') {
    const pool = r.shuffle(FRACS); used.forEach((l, i) => { o[l] = new F(pool[i][0], pool[i][1]); }); return o;
  }
  if (S === 'decs') {
    const seen = new Set();
    for (const l of used) { const m = r.int(1, 39); if (m % 10 === 0 || seen.has(m)) return null; seen.add(m); o[l] = new F(m, 10); }
    return o;
  }
  const lo = cfg.lo ?? 2, hi = cfg.hi ?? 9, mag = {};
  for (const l of used) { const v = r.int(lo, hi); if (cfg.noOne && v === 1) return null; mag[l] = v; o[l] = v; }
  if (used.length > 1 && new Set(used.map((l) => mag[l])).size < used.length) return null;
  if (cfg.neg === 'some') { used.forEach((l) => { if (r.chance(0.45)) o[l] = -o[l]; }); if (!used.some((l) => o[l] < 0)) return null; }
  if (cfg.neg === 'one') { const l = r.pick(used); o[l] = -o[l]; }
  if (cfg.neg === 'first') { const l = used.includes('a') ? 'a' : used[0]; o[l] = -o[l]; }
  used.forEach((l) => { o[l] = F.of(o[l]); });
  return o;
}
const fmtV = (f, dec) => (dec ? dstr(f) : f.isInt ? String(f.n) : f.tex());
const ansTex = (v, dec) => (v.isInt ? String(v.n) : dec ? dstr(v) : v.tex());
const vstr = (f) => (f.isInt ? String(f.n) : `${f.n}/${f.d}`);

// ---------- the expression steps ---------------------------------------------------------------------------
function genExpr(r, cfg) {
  const L = r.pick(LETTERS), dec = cfg.vals === 'decs', n = cfg.n ?? 3, mode = dec ? 'dec' : cfg.vals === 'fracs' ? 'frac' : false;
  return r.until(() => {
    const src = cfg.sets ? r.pick(cfg.sets) : r.sample(cfg.bank, n);
    const used = ABC.filter((l) => src.some((e) => e.includes(l)));
    const vals = pickVals(r, cfg, used);
    if (!vals) return null;
    const rv = {}; used.forEach((l) => { rv[L[ABC.indexOf(l)]] = vals[l]; });
    const rows = [];
    for (const e of src) {
      const ast = parse(rename(L, e));
      let sub, val;
      try { sub = subst(ast, rv); val = A.value(sub); } catch (err) { return null; }
      if (cfg.int !== false && !val.isInt) return null;
      if (cfg.maxD && val.d > cfg.maxD) return null;
      if (cfg.nonneg && val.isNeg) return null;
      if (Math.abs(val.val) > (cfg.max ?? 600)) return null;
      rows.push({ ast, sub, val });
    }
    if (new Set(rows.map((x) => x.val.toString())).size < rows.length) return null;
    if (cfg.neg && src.filter((e) => used.some((l) => vals[l].isNeg && e.includes(l))).length < Math.min(2, src.length)) return null;
    A.setDec(mode);
    try {
      const given = listAnd(used.map((l) => `{{${L[ABC.indexOf(l)]} = ${fmtV(vals[l], dec)}}}`));
      const vars = {}; Object.entries(rv).forEach(([k, f]) => { vars[k] = vstr(f); });
      const parts = rows.map((x, i) => {
        const t = texAlg(x.ast, true, { div: !!cfg.div });
        const single = rows.length === 1;
        return {
          l: single ? undefined : lab(i),
          body: single ? `Given that ${given}, evaluate {{${t}}}` : `{{${t}}}`,
          a: ansTex(x.val, dec), w: M(A.working(x.sub)), m: cfg.m ?? 2, lines: single ? 5 : 3,
          chk: { k: 'subs', expr: t, vars, val: x.val.toString() },
        };
      });
      return { stem: rows.length === 1 ? null : `Given that ${given}, evaluate:`, parts };
    } finally { A.setDec(false); }
  }, 30000);
}
const X = (id, code, type, levels, search, variants) => ({
  id, topic: TOPIC, type, code, levels, multipart: true, search, verb: '', marks: 2, lines: 3,
  variants: variants.map(([vid, label, cfg, lv]) => ({ id: vid, label, params: { cfg }, ...(lv ? { levels: lv } : {}), ...(cfg.n === 1 ? { multipart: false } : {}) })),
  generate(r, v) { return genExpr(r, v.cfg); },
});

const T1 = X('sub-one', 'SB1', 'One letter, one operation', ['Foundation'], 'substitute evaluate value of a letter one operation add subtract multiply divide when a =', [
  ['add-sub', 'add and subtract:  a + 5, a − 3, 15 − a', { bank: ['a+3', 'a+5', 'a+8', 'a+12', 'a-2', 'a-4', 'a-6', '7+a', '15-a', '20-a'], lo: 4, hi: 15, nonneg: true, m: 1 }],
  ['times', 'multiply:  3a, 5a, 10a', { bank: ['2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a'], lo: 2, hi: 9, m: 1 }],
  ['divide', 'divide:  a ÷ 2, a ÷ 5, 24 ÷ a', { bank: ['a/2', 'a/3', 'a/4', 'a/5', 'a/10', 'b/2', 'b/3', 'b/4', 'b/5', 'c/2', 'c/3', 'c/5', '24/a', '12/b', '30/c', '20/c', '36/b'], div: true, lo: 2, hi: 40, nonneg: true, m: 1 }],
]);
const T2 = X('sub-two', 'SB2', 'Two letters, one operation', ['Foundation'], 'substitute evaluate two letters a + b ab a - b when a = b =', [
  ['add-sub', 'add and subtract:  a + b, a − b', { bank: ['a+b', 'b+c', 'a+c', 'a-b', 'b-c', 'a-c', 'c-b', 'c-a', 'b-a'], lo: 2, hi: 12, nonneg: true, m: 1 }],
  ['multiply', 'multiply:  ab, bc, abc', { bank: ['ab', 'bc', 'ac', 'abc'], lo: 2, hi: 6, m: 1 }],
  ['mixed', 'a mixture:  a + b, ab, b − c', { bank: ['a+b', 'a-b', 'ab', 'b+c', 'bc', 'b-c', 'a+c', 'ac'], lo: 2, hi: 9, nonneg: true, m: 1 }],
  ['divide', 'divide:  a ÷ b, c ÷ b', { sets: [['a/b', 'c/b', 'ab'], ['a/c', 'b/c', 'bc'], ['b/a', 'c/a', 'ac']], div: true, lo: 2, hi: 20, nonneg: true, m: 1 }, ['Core']],
]);
const T3 = X('sub-number-letter', 'SB3', 'A number and a letter', ['Foundation', 'Core'], 'substitute evaluate 3a + 4 5a - 2 two step expression BIDMAS multiply first', [
  ['plus', 'multiply then add:  3a + 4, 2 + 5a', { bank: ['2a+3', '3a+4', '5a+1', '4a+7', '6a+2', '2+3a', '5+4a', '10+2a', '3a+8'], lo: 2, hi: 9 }],
  ['minus', 'multiply then subtract:  5a − 2, 20 − 3a', { bank: ['3a-1', '5a-2', '4a-3', '6a-5', '2a-1', '20-3a', '30-4a', '15-2a', '25-3a'], lo: 2, hi: 9, nonneg: true }],
  ['two-letter', 'two letters:  a + 2b, 3a + b', { bank: ['a+2b', '2a+b', '3a+b', 'a+4b', 'b+2c', '2b+c', '3c+b'], lo: 2, hi: 9 }],
]);
const T4 = X('sub-two-ops', 'SB4', 'Two letters, two operations', ['Core'], 'substitute evaluate 2a + 3b 5a - 2b when a = b = two letters', [
  ['add', 'add:  2a + 3b', { bank: ['2a+3b', '4a+b', '3a+2b', '5a+2c', '2b+3c', 'a+5b', '4b+3c', '6a+b', '2a+7c'], lo: 2, hi: 8 }],
  ['subtract', 'subtract:  5a − 2b', { bank: ['5a-2b', '3a-b', '4b-3c', '6a-2b', '5c-a', '7a-3c', '4b-c', '8a-5b'], lo: 2, hi: 9, nonneg: true }],
  ['three-terms', 'three terms:  2a + 3b − c', { bank: ['2a+3b-c', '5a-2b+c', 'a+b+c', '3a+2b+4c', '4a-b+2c', '2a+b-3c', 'a+2b+3c', '6a-2b-c'], lo: 2, hi: 7, nonneg: true }],
]);
const T5 = X('sub-products', 'SB5', 'Products of letters', ['Core'], 'substitute evaluate 3ab ab + c abc products of letters', [
  ['two-letter', 'a product:  3ab, 4bc', { bank: ['3ab', '2ab', '4bc', '5ac', '2bc', '6ab', '3ac'], lo: 2, hi: 6 }],
  ['plus-minus', 'a product and a term:  ab + c, 2ab − 3c', { bank: ['ab+c', 'ab-c', 'a+bc', '2ab+3c', '3ac-b', 'bc-a', 'ab+bc', '2bc+a'], lo: 2, hi: 6, nonneg: true }],
  ['three-letter', 'three letters:  abc, 2abc', { bank: ['abc', '2abc', 'abc+a', 'abc-b', '3abc', 'ab+bc+ac', 'abc+c'], lo: 2, hi: 5 }],
]);
const T6 = X('sub-brackets', 'SB6', 'Brackets', ['Core'], 'substitute evaluate 2(a + 3) 3(a - b) brackets when a = b =', [
  ['one-bracket', 'a number outside:  2(a + 3), 3(a − b)', { bank: ['2(a+3)', '3(a-1)', '5(a+1)', '4(2a+1)', '3(a+b)', '2(a+b)', '5(a-b)', '4(a+2b)', '3(2a-b)', '6(a+b)'], lo: 2, hi: 9, nonneg: true }],
  ['letter-outside', 'a letter outside:  a(b + c)', { bank: ['a(b+c)', 'b(a+c)', 'a(b-c)', 'c(a+b)', 'a(a+3)', 'b(b-1)', 'a(2b+c)', 'c(b-a)'], lo: 2, hi: 8, nonneg: true }],
  ['two-brackets', 'two brackets:  (a + 2)(b + 3)', { bank: ['(a+2)(b+3)', '(a+b)(c-1)', '(a-1)(b+1)', '(a+b)(a+c)', '(a+1)(a+2)', '(b-1)(c+2)', '(a+3)(b-1)'], lo: 2, hi: 7, nonneg: true, max: 400 }, ['Core', 'Additional']],
]);
const T7 = X('sub-fractions', 'SB7', 'Fractions in an expression', ['Core', 'Additional'], 'substitute evaluate a divided by 2 fraction (a + b) / 2 12 / a when a = b =', [
  ['divide', 'with a division sign:  a ÷ 2 + 3, 24 ÷ a', { bank: ['a/2+3', 'a/4-1', 'a/5+2', '24/a', '30/a+b', 'a/b+c', 'a/b-c', 'a/2+b', '3a/2', '2a/5', '36/a-1', 'a/3+b/2'], div: true, lo: 2, hi: 30, nonneg: true }],
  ['fraction-line', 'as a fraction:  (a + b) / 2', { bank: ['(a+b)/2', '(a-b)/2', '(a+b)/c', '(2a+b)/5', '(a+3)/2', 'a/b', 'ab/c', '(a+b+c)/3', 'a/2+b/3', '(5a-b)/c', '12/(a+b)', '(a+7)/b'], lo: 2, hi: 24, nonneg: true }, ['Additional']],
]);
const T8 = X('sub-squares', 'SB8', 'Squares', ['Core'], 'substitute evaluate a squared a^2 2a^2 3a^2 - b when a = b =', [
  ['simple', 'one square:  a², a² + 3, 2a²', { bank: ['a^2', 'b^2', 'a^2+3', 'a^2-1', '2a^2', '3a^2', 'a^2+5', '5a^2-4', 'b^2+a', '4b^2'], lo: 2, hi: 9, noOne: true }],
  ['two-letter', 'two letters:  a² + b², 3a² − 2b', { bank: ['a^2+b^2', 'a^2+2b', '2a^2+3b', 'a^2-b', '3a^2-2b', 'ab^2', 'a^2b', 'b^2-a', 'a^2+b^2+c', '2a^2+b^2'], lo: 2, hi: 6, noOne: true, nonneg: true }],
]);
const T9 = X('sub-order', 'SB9', 'Squares: the order matters', ['Core', 'Additional'], 'substitute evaluate (2a)^2 2a^2 (a + b)^2 squaring brackets order of operations', [
  ['compare', '(2a)² and 2a² side by side', { sets: [['(2a)^2', '2a^2'], ['(3a)^2', '3a^2'], ['(a+b)^2', 'a^2+b^2'], ['(a-b)^2', 'a^2-b^2'], ['(ab)^2', 'ab^2'], ['(a+1)^2', 'a^2+1'], ['(2a)^3', '2a^3']], lo: 2, hi: 6, noOne: true, nonneg: true, m: 2 }],
  ['brackets', 'a bracket squared:  (a + b)², (2a − 1)²', { bank: ['(a+b)^2', '(a-b)^2', '(2a)^2', '(a+1)^2', '(3a-1)^2', '2(a+b)^2', '(ab)^2', '(a+3)^2', '(2a+b)^2', '(a-2)^2'], lo: 2, hi: 6, noOne: true, nonneg: true }],
]);
const T10 = X('sub-neg-add', 'SB10', 'Negative values: add and subtract', ['Core'], 'substitute negative values a = -3 evaluate a + b a - b 2a + 3b', [
  ['one-negative', 'one value is negative:  a + b, a − b', { bank: ['a+b', 'a-b', 'b+c', 'c-a', 'a+b+c', 'b-a', 'b-c', 'a-b-c'], lo: 1, hi: 8, neg: 'one' }],
  ['with-multiples', 'with multiples:  2a + 3b, 5 − 2a', { bank: ['2a+3b', '5-2a', '3a-2b', '4a+b', 'a-3b', '5b-2a', '10+3a', '3a+5', '2b-a', '7-3b'], lo: 1, hi: 6, neg: 'some' }],
]);
const T11 = X('sub-neg-mult', 'SB11', 'Negative values: multiply and brackets', ['Core', 'Additional'], 'substitute negative values a = -3 evaluate ab 2ab 2(a - b) brackets multiply', [
  ['product', 'products:  ab, 3ab, abc', { bank: ['ab', '2ab', '3ab', 'abc', '4bc', '5ac', 'ac'], lo: 1, hi: 5, neg: 'some' }],
  ['with-add', 'a product and a term:  ab + c, 2ab − 3c', { bank: ['ab+c', 'ab-c', '2ab+3c', 'a+bc', 'bc-a', '3ac-b', 'ab+bc'], lo: 1, hi: 5, neg: 'some' }],
  ['brackets', 'brackets:  2(a − b), a(b + c)', { bank: ['2(a-b)', '3(a+b)', 'a(b+c)', '5(a+2b)', 'b(a-c)', '4(2a-b)', 'c(a-b)'], lo: 1, hi: 5, neg: 'some' }],
]);
const T12 = X('sub-neg-squares', 'SB12', 'Negative values: squares', ['Additional'], 'substitute negative values squares a = -3 a^2 -a^2 2a^2 evaluate', [
  ['negative-squared', 'squaring a negative:  a², 2a², a² − b', { bank: ['a^2', '2a^2', 'a^2+b', 'a^2-b', '3a^2+2', 'b^2-a', 'a^2+b^2', '5a^2-3', 'a^2+a'], lo: 2, hi: 6, neg: 'first', noOne: true }],
  ['minus-trap', 'the minus sign in front:  −a², 10 − a²', { bank: ['-a^2', '-a^2+b', '10-a^2', 'b-a^2', '-2a^2', '5-2a^2', '20-a^2', '3b-a^2'], lo: 2, hi: 5, neg: 'first', noOne: true }],
]);
const T13 = X('sub-cubes', 'SB13', 'Cubes', ['Additional'], 'substitute cubes a^3 negative values evaluate a cubed', [
  ['positive', 'positive values:  a³, 2a³, a³ − b', { bank: ['a^3', 'a^3+1', '2a^3', 'a^3-b', 'b^3-a', 'a^3+b', 'a^3+b^2', '3a^3'], lo: 2, hi: 5, noOne: true, nonneg: true }],
  ['negative', 'a negative value:  a³, b − a³', { bank: ['a^3', '2a^3', 'a^3+b', 'a^3-b', 'b-a^3', '-a^3', 'a^3+b^2', 'a^2+a^3'], lo: 2, hi: 4, neg: 'first', noOne: true }],
]);
const T14 = X('sub-mixed', 'SB14', 'Mixed powers and brackets', ['Additional', 'Further'], 'substitute evaluate a^2 - b^2 (a - b)^2 + c 2a^2b - 5c negative values powers brackets', [
  ['sum-diff', 'squares and cubes of two letters:  a² − b²', { bank: ['a^2+b^2', 'a^2-b^2', 'a^3+b^2', 'b^2-a^2', 'a^2+b^3', 'a^3-b^3', 'a^2-b^2+c'], lo: 1, hi: 5, neg: 'some', noOne: true }],
  ['brackets-squared', 'a bracket squared:  (a − b)² + c', { bank: ['(a-b)^2+c', '(a+b)^2-c', 'c(a-b)^2', '2(a+b)^2', '(2a-b)^2', '(a-b)^2-c^2', '(a+b)^2+c', '3(a-c)^2'], lo: 1, hi: 5, neg: 'some' }],
  ['longer', 'longer expressions:  2a²b − 5c', { bank: ['2a^2b-5c', 'c^2-2ab', 'a^3-b^2+c', '3a^2-2b^3', 'ab^2-c^2', '(2a+b)^2-c', 'a^2b+c^2', '4a^2-3bc'], lo: 1, hi: 4, neg: 'some' }],
  ['single', 'one longer expression on its own', { bank: ['2a^2b-5c', 'c^2-2ab', 'a^3-b^2+c', '3a^2-2b^3', 'ab^2-c^2', '(2a+b)^2-c', '(a-b)^2+c', 'c(a-b)^2', 'a^3+b^3'], n: 1, lo: 1, hi: 4, neg: 'some', m: 3 }],
]);
const T15 = X('sub-frac-values', 'SB15', 'Fractions and decimals as values', ['Additional'], 'substitute fraction values decimal values a = 1/2 b = 0.5 evaluate', [
  ['fractions', 'fraction values:  a = 1/2, b = 1/3', { vals: 'fracs', int: false, maxD: 12, nonneg: true, bank: ['4a', '6a', '12a', 'a+b', '2a+1', 'a+3', '8a-1', '10a', 'a^2', 'ab', '4ab', '6a+b', '2a+3b', '12b-a', 'a+b+c'] }],
  ['decimals', 'decimal values:  a = 0.5, b = 1.5', { vals: 'decs', int: false, bank: ['2a', '5a', '10a', 'a+b', 'a+3', '4a+1', 'a^2', 'ab', '3a-b', '10a-1', '2a+3b', '4b-a', 'a+b+c'], nonneg: true }],
]);
const T16 = X('sub-roots', 'SB16', 'Square roots', ['Additional', 'Further'], 'substitute square roots sqrt a evaluate root of a when a = 25', [
  ['simple', 'the root of a value:  √a + 3, 2√b', { vals: 'sq', bank: ['Ra', 'Rb', 'Ra+3', '2Rb', 'Ra+Rb', 'Rc+2', 'a+Rb', 'Rb+Ra', '3Rc-1', 'Ra-Rb'], nonneg: true, max: 400 }, ['Additional']],
  ['pythag-sum', 'a root of a sum of squares:  √(a² + b²)', { vals: 'pyth-sum', bank: ['R(a^2+b^2)', 'R(a^2+b^2)+c', '2R(a^2+b^2)', 'R(a^2+b^2)-c', 'c+R(a^2+b^2)', '3R(a^2+b^2)'], nonneg: true, max: 400 }, ['Further']],
  ['pythag-diff', 'a root of a difference of squares:  √(a² − b²)', { vals: 'pyth-diff', bank: ['R(a^2-b^2)', 'R(a^2-b^2)+c', '3R(a^2-b^2)', 'c+R(a^2-b^2)', '2R(a^2-b^2)-1', 'R(a^2-b^2)+b'], nonneg: true, max: 400 }, ['Further']],
]);

// ---------- Using a formula ---------------------------------------------------------------------------------
// vars: letter -> [lo, hi]; ok(values) is an extra rule (a whole-number answer)
const FORMULAS = {
  shapes: [
    { lhs: 'P', rhs: '2l+2w', vars: { l: [3, 15], w: [2, 12] } },
    { lhs: 'A', rhs: '1/2*b*h', vars: { b: [4, 20], h: [3, 14] }, ok: (o) => (o.b * o.h) % 2 === 0 },
    { lhs: 'V', rhs: 'l*w*h', vars: { l: [2, 9], w: [2, 8], h: [2, 6] } },
    { lhs: 'A', rhs: '(a+b)*h/2', vars: { a: [3, 12], b: [4, 16], h: [2, 10] }, ok: (o) => ((o.a + o.b) * o.h) % 2 === 0 },
    { lhs: 'P', rhs: '3a+b', vars: { a: [3, 12], b: [2, 9] } },
  ],
  physics: [
    { lhs: 'v', rhs: 'u+a*t', vars: { u: [1, 20], a: [2, 9], t: [2, 8] } },
    { lhs: 's', rhs: 'u*t+1/2*a*t^2', vars: { u: [1, 15], a: [2, 10], t: [2, 8] }, ok: (o) => (o.a * o.t * o.t) % 2 === 0 },
    { lhs: 'F', rhs: 'm*a', vars: { m: [2, 40], a: [2, 9] } },
    { lhs: 'v^{2}', rhs: 'u^2+2*a*s', vars: { u: [1, 10], a: [2, 8], s: [2, 20] } },
  ],
};
const T17 = {
  id: 'sub-formula', topic: TOPIC, type: 'Using a formula', code: 'SB17', levels: ['Core', 'Additional'], multipart: true,
  search: 'substitute use the formula P = 2l + 2w v = u + at work out the value when',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'shapes', label: 'perimeter, area and volume:  P = 2l + 2w', params: { k: 'shapes' }, levels: ['Core'] },
    { id: 'physics', label: 'physics formulas:  v = u + at, s = ut + ½at²', params: { k: 'physics' } },
  ],
  generate(r, v) {
    const f = r.pick(FORMULAS[v.k]), ast = parse(f.rhs), t = texAlg(ast), letters = Object.keys(f.vars);
    const sets = [], seen = new Set();
    for (let tries = 0; sets.length < 3 && tries < 500; tries++) {
      const o = {}; letters.forEach((l) => { o[l] = r.int(f.vars[l][0], f.vars[l][1]); });
      const key = JSON.stringify(o);
      if (seen.has(key) || (f.ok && !f.ok(o))) continue;
      seen.add(key); sets.push(o);
    }
    const parts = sets.map((o, i) => {
      const sub = subst(ast, o), val = A.value(sub);
      const given = listAnd(letters.map((l) => `{{${l} = ${o[l]}}}`));
      return { l: lab(i), body: `Work out the value of {{${f.lhs}}} when ${given}.`, a: String(val.n), w: M(A.working(sub)), m: v.k === 'shapes' ? 2 : 3, lines: 3, chk: { k: 'subs', expr: t, vars: o, val: val.toString() } };
    });
    return { stem: `Use the formula {{${f.lhs} = ${t}}}.`, parts };
  },
};

// ---------- worded formulas ---------------------------------------------------------------------------------
const rt = (c0, k, v, minus) => `${c0}${minus ? '-' : '+'}${k}${v}`;
const WORDED = {
  cost: [
    { lhs: 'C', v: 'm', c0: [2, 5], k: [2, 4], n: [5, 20], u: GBP, tx: (f, n) => `A taxi company uses the formula {{${f}}} to work out the cost, {{C}} pounds, of a journey of {{m}} miles. Work out the cost of a journey of ${n} miles.` },
    { lhs: 'C', v: 'd', c0: [10, 20], k: [6, 12], n: [2, 9], u: GBP, tx: (f, n) => `A shop hires out bikes. The formula {{${f}}} gives the cost, {{C}} pounds, of hiring a bike for {{d}} days. Work out the cost of hiring a bike for ${n} days.` },
    { lhs: 'C', v: 'n', c0: [40, 90], k: [6, 12], n: [10, 40], u: GBP, tx: (f, n) => `A hall hire company charges {{C}} pounds for a party of {{n}} guests, using the formula {{${f}}}. Work out the cost for ${n} guests.` },
    { lhs: 'C', v: 'h', c0: [30, 50], k: [20, 35], n: [2, 8], u: GBP, tx: (f, n) => `A plumber uses the formula {{${f}}} to work out the cost, {{C}} pounds, of a job that takes {{h}} hours. Work out the cost of a job that takes ${n} hours.` },
    { lhs: 'C', v: 'g', c0: [8, 15], k: [2, 5], n: [3, 12], u: GBP, tx: (f, n) => `A phone company uses the formula {{${f}}} to work out the monthly cost, {{C}} pounds, when {{g}} gigabytes of data are used. Work out the cost when ${n} gigabytes are used.` },
  ],
  other: [
    { lhs: 'T', v: 'w', c0: [15, 30], k: [30, 50], n: [2, 8], u: MIN, tx: (f, n) => `The time, {{T}} minutes, to cook a turkey of mass {{w}} kg is given by the formula {{${f}}}. Work out the time to cook a turkey of mass ${n} kg.` },
    { lhs: 'h', v: 'w', c0: [3, 8], k: [2, 5], n: [2, 10], u: CM, tx: (f, n) => `The height, {{h}} cm, of a plant after {{w}} weeks is given by the formula {{${f}}}. Work out the height of the plant after ${n} weeks.` },
    { lhs: 'h', v: 't', c0: [20, 40], k: [2, 4], n: [2, 6], u: CM, minus: true, tx: (f, n) => `A candle burns down as it is lit. Its height, {{h}} cm, after {{t}} hours is given by the formula {{${f}}}. Work out the height of the candle after ${n} hours.` },
    { lhs: 'V', v: 't', c0: [60, 100], k: [4, 8], n: [3, 9], u: LIT, minus: true, tx: (f, n) => `A tank is emptied through a pipe. The volume of water, {{V}} litres, left after {{t}} minutes is given by the formula {{${f}}}. Work out the volume of water left after ${n} minutes.` },
  ],
};
const T18 = {
  id: 'sub-worded', topic: TOPIC, type: 'Worded formulas', code: 'SB18', levels: ['Core', 'Additional'],
  search: 'substitute worded formula cost hire taxi plumber formula C = 3 + 2m work out the cost',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'cost', label: 'a cost formula:  C = 15 + 8d', params: { k: 'cost' }, levels: ['Core'] },
    { id: 'other', label: 'time, height and volume formulas', params: { k: 'other' } },
  ],
  generate(r, v) {
    const c = r.pick(WORDED[v.k]);
    const c0 = r.int(c.c0[0], c.c0[1]), k = r.int(c.k[0], c.k[1]), n = r.int(c.n[0], c.n[1]);
    if (c.minus && c0 - k * n <= 0) return this.generate(r, v);
    const rhs = rt(c0, k, c.v, c.minus), ast = parse(rhs), t = texAlg(ast), sub = subst(ast, { [c.v]: n }), val = A.value(sub);
    return { parts: [{ body: c.tx(`${c.lhs} = ${t}`, n), a: c.u.tex(val), w: M(`${c.lhs} = ${A.working(sub)}`), ...mk(2, c.u), chk: { k: 'subs', expr: t, vars: { [c.v]: n }, val: val.toString() } }] };
  },
};

// ---------- which is bigger ------------------------------------------------------------------------------------
const COMPARE = {
  largest: { word: 'largest', pick: 'max', lo: 3, hi: 8, neg: false, bank: ['a+6', '2a+1', '3a', 'a^2', 'a^3', 'a^2+a', '10-a', '2a+5', 'a^2-3', '20-a', '4a-2'] },
  smallest: { word: 'smallest', pick: 'min', lo: 2, hi: 5, neg: true, bank: ['a+3', '2a', 'a^2', 'a^3', '-a^2', 'a-5', 'a^2+a', '10-a', '3a+1', '-a', 'a^2-10'] },
};
const T19 = {
  id: 'sub-compare', topic: TOPIC, type: 'Which is the largest or smallest', code: 'SB19', levels: ['Additional'],
  search: 'substitute which expression has the largest value smallest compare a^2 3a a + 6 negative',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'largest', label: 'which has the largest value (a is positive)', params: { k: 'largest' } },
    { id: 'smallest', label: 'which has the smallest value (a is negative)', params: { k: 'smallest' } },
  ],
  generate(r, v) {
    const c = COMPARE[v.k], L = r.pick(LETTERS)[0];
    return r.until(() => {
      const a = (c.neg ? -1 : 1) * r.int(c.lo, c.hi), src = r.sample(c.bank, 3);
      const rows = src.map((e) => { const ast = parse(e.replace(/a/g, L)), sub = subst(ast, { [L]: a }); return { ast, sub, val: A.value(sub), t: texAlg(ast) }; });
      const vs = rows.map((x) => x.val.val), best = c.pick === 'max' ? Math.max(...vs) : Math.min(...vs);
      if (vs.filter((x) => x === best).length !== 1 || new Set(vs).size < 3) return null;
      const win = rows[vs.indexOf(best)];
      return {
        parts: [{
          body: `Given that {{${L} = ${a}}}, which of {{${rows[0].t}}}, {{${rows[1].t}}} and {{${rows[2].t}}} has the ${c.word} value?`,
          a: win.t, w: M(rows.map((x) => `${x.t} = ${A.working(x.sub)}`).join(';\\ ')), m: 3, lines: 5,
          chk: { k: 'which', exprs: rows.map((x) => x.t), vars: { [L]: a }, pick: c.pick, ans: win.t },
        }],
      };
    });
  },
};

// ---------- substituting an expression -----------------------------------------------------------------------------
const toPoly = (x, env) => {
  switch (x.t) {
    case 'n': return P.c(x.v);
    case 'v': return env[x.name];
    case 'neg': return toPoly(x.x, env).neg();
    case 'b': return toPoly(x.x, env);
    case 'bin': {
      const l = toPoly(x.l, env), rr = toPoly(x.r, env);
      if (x.op === '+') return l.add(rr);
      if (x.op === '-') return l.sub(rr);
      if (x.op === '*') return l.mul(rr);
      let p = P.c(1); for (let i = 0; i < x.r.v.n; i++) p = p.mul(l); return p;
    }
  }
  throw new Error('bad node');
};
const lin = (p, q) => P.v('x', 1, p).add(P.c(q));
const EXPR = {
  linear: { two: false, bank: ['3a', '2a+1', 'a+4', '5a-2', '4a-3', '2a-7', '6a+5', '3a+2', '4a+1'], head: 'write each of these in terms of {{x}} and simplify:' },
  'two-subs': { two: true, bank: ['a+b', 'a-b', '2a+b', 'a+3b', '3a-2b', '2a-b', '4a+b', 'a-2b', '2a+3b'], head: 'write each of these in terms of {{x}} and simplify:' },
  squared: { two: false, bank: ['a^2', 'a^2-1', '2a^2', 'a^2+a', 'a^2-a', '3a^2+1', 'a^2+3a', 'a^2-4'], head: 'write each of these in terms of {{x}}, expanding and simplifying:' },
};
const T20 = {
  id: 'sub-expression', topic: TOPIC, type: 'Substituting an expression', code: 'SB20', levels: ['Further'], multipart: true,
  search: 'substitute an expression a = x + 1 write in terms of x simplify expand',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'linear', label: 'one letter is an expression:  a = x + 1, find 3a', params: { k: 'linear' } },
    { id: 'two-subs', label: 'two letters are expressions:  a = x + 1, b = 2x − 3', params: { k: 'two-subs' } },
    { id: 'squared', label: 'squares to expand:  a = x + 2, find a² + a', params: { k: 'squared' } },
  ],
  generate(r, v) {
    const c = EXPR[v.k];
    return r.until(() => {
      const pa = v.k === 'squared' ? 1 : r.int(1, 3), qa = r.int(-6, 6);
      const pb = r.int(1, 4), qb = r.int(-6, 6);
      if (!qa || (c.two && !qb)) return null;
      const A_ = lin(pa, qa), B_ = lin(pb, qb);
      const src = r.sample(c.bank, 3), env = { a: A_, b: B_ };
      const vars = { a: `(${A_.tex()})`, b: `(${B_.tex()})` };
      const parts = src.map((e, i) => {
        const ast = parse(e), shown = texAlg(ast, true, { vars }), ans = toPoly(ast, env).tex();
        return { l: lab(i), body: `{{${texAlg(ast)}}}`, a: ans, w: M(`${texAlg(ast)} = ${shown} = ${ans}`), m: v.k === 'linear' ? 2 : 3, lines: 4, chk: { k: 'equiv', q: shown, a: ans } };
      });
      if (new Set(parts.map((p) => p.a)).size < 3) return null;
      const given = c.two ? `{{a = ${A_.tex()}}} and {{b = ${B_.tex()}}}` : `{{a = ${A_.tex()}}}`;
      return { stem: `Given that ${given}, ${c.head}`, parts };
    });
  },
};

// ---------- tables of values --------------------------------------------------------------------------------------
const R = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const kx = (k) => (k === 1 ? 'x' : `${k}x`);
const TABLE = {
  positive: { xs: [[0, 1, 2, 3, 4], [1, 2, 3, 4, 5], [0, 1, 2, 3, 4, 5], [1, 2, 3, 4, 5, 6]], nonneg: true,
    bank: [...R(1, 6).flatMap((k) => R(1, 9).map((c) => `${kx(k)}+${c}`)), ...R(2, 6).flatMap((k) => R(1, k).map((c) => `${kx(k)}-${c}`)), ...R(7, 14).map((c) => `${c}-x`)] },
  negative: { xs: [[-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1, 2, 3], [-3, -2, -1, 0, 1, 2]],
    bank: [...R(1, 5).flatMap((k) => R(1, 6).map((c) => `${kx(k)}+${c}`)), ...R(1, 5).flatMap((k) => R(1, 6).map((c) => `${kx(k)}-${c}`)), ...R(1, 4).flatMap((k) => R(1, 8).map((c) => `${c}-${kx(k)}`))] },
  quadratic: { xs: [[-2, -1, 0, 1, 2], [-3, -2, -1, 0, 1, 2, 3], [-3, -2, -1, 0, 1, 2]],
    bank: ['x^2', ...R(1, 6).flatMap((c) => [`x^2+${c}`, `x^2-${c}`]), ...R(2, 4).map((k) => `${k}x^2`), ...R(1, 4).flatMap((k) => [`x^2+${kx(k)}`, `x^2-${kx(k)}`]), ...R(2, 3).flatMap((k) => R(1, 5).map((c) => `${k}x^2-${c}`))] },
};
const arr = (xs, cells) => `\\begin{array}{|c|${'c|'.repeat(xs.length)}}\\hline x & ${xs.join(' & ')} \\\\ \\hline y & ${cells.join(' & ')} \\\\ \\hline \\end{array}`;
const BLANK = '\\hspace{1.8em}\\rule{0pt}{4.4ex}';
const T21 = {
  id: 'sub-table', topic: TOPIC, type: 'Table of values', code: 'SB21', levels: ['Foundation', 'Core', 'Additional'],
  search: 'substitute complete the table of values y = 2x + 3 x = -2 -1 0 1 2 graph plotting',
  verb: '', marks: 3, lines: 3,
  variants: [
    { id: 'positive', label: 'positive values of x:  y = 2x + 3', params: { k: 'positive' }, levels: ['Foundation', 'Core'] },
    { id: 'negative', label: 'x from −2 to 2 (or −3 to 3):  y = 3x − 2', params: { k: 'negative' }, levels: ['Core'] },
    { id: 'quadratic', label: 'a quadratic rule:  y = x² − 2x', params: { k: 'quadratic' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const c = TABLE[v.k];
    return r.until(() => {
      const xs = r.pick(c.xs), e = r.pick(c.bank), ast = parse(e);
      const subs = xs.map((x) => subst(ast, { x })), ys = subs.map((s) => A.value(s).n);
      if (c.nonneg && ys.some((y) => y < 0)) return null;
      const t = texAlg(ast), i0 = r.int(0, xs.length - 1), w = `x = ${xs[i0]}:\\ y = ${A.working(subs[i0])}`;
      return {
        parts: [{
          body: `Complete the table of values for {{y = ${t}}}. {{${arr(xs, xs.map(() => BLANK))}}}`,
          a: arr(xs, ys), w: M(w), m: ys.length > 5 ? 4 : 3, lines: 3,
          chk: { k: 'table', v: 'x', expr: t, xs, ys },
        }],
      };
    });
  },
};

export const subTypes = [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T20, T21];
