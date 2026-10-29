import { PTOPIC, F, ds, py, M, num, names } from './decimals.js';

const FOOD = ['cereal', 'pasta', 'rice', 'biscuits', 'flour', 'coffee', 'cheese', 'sugar'];
const THINGS = [['pencils', 'pencil'], ['eggs', 'egg'], ['batteries', 'battery'], ['stickers', 'sticker'], ['cupcakes', 'cupcake'], ['pens', 'pen']];
const GRAMS = [200, 250, 300, 400, 500, 600, 750, 800, 1000];

export default {
  id: 'decprob-best-buy',
  topic: PTOPIC, type: 'Unit cost and best buy', code: 'DP4',
  levels: ['Core', 'Additional'],
  search: 'best buy better value unit price cost per 100 g per item compare two packs decimals',
  verb: '', marks: 3, lines: 6,
  calc: false,
  variants: [
    { id: 'item', label: 'cost per item:  12 for £2.40 or 20 for £3.80', params: { k: 'item' } },
    { id: 'per100', label: 'cost per 100 g:  250 g for £1.60 or 400 g for £2.28', params: { k: 'per100' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'item') {
      const [pl] = r.pick(THINGS);
      const [[a, pa], [b, pb], ua, ub] = r.until(() => {
        const a = r.pick([6, 10, 12, 15, 20]), b = r.pick([8, 12, 16, 20, 24, 30]);
        if (a === b) return null;
        const ua = r.int(12, 40), ub = ua + r.pick([-3, -2, -1, 1, 2, 3]);
        return ub > 5 && ua !== ub ? [[a, a * ua], [b, b * ub], ua, ub] : null;
      });
      const A = new F(pa, 100), B = new F(pb, 100), win = ua < ub ? 'A' : 'B';
      const t = (p, k) => `${k} for £${(p / 100).toFixed(2)}`;
      return { parts: [{ body: `${pl[0].toUpperCase() + pl.slice(1)} are sold in two packs. Pack A has ${t(pa, a)}. Pack B has ${t(pb, b)}. Which pack is better value for money? You must show your working.`, a: `\\text{Pack ${win}}`, w: M(`\\text{A: } ${ds(A)} \\div ${a} = ${ua}\\text{p each};\\ \\text{B: } ${ds(B)} \\div ${b} = ${ub}\\text{p each}`), m: 3, lines: 6, chk: num(win === 'A' ? `${pb}/${b}-${pa}/${a}` : `${pa}/${a}-${pb}/${b}`, new F(Math.abs(ua - ub))) }] };
    }
    const food = r.pick(FOOD);
    const [ga, gb, ua, ub] = r.until(() => {
      const ga = r.pick(GRAMS), gb = r.pick(GRAMS);
      if (ga === gb) return null;
      const ua = r.int(30, 150), ub = ua + r.pick([-9, -6, -4, -3, 3, 4, 6, 9]);
      return ub > 10 && (ua * ga) % 100 === 0 && (ub * gb) % 100 === 0 ? [ga, gb, ua, ub] : null;
    });
    const pa = ua * ga / 100, pb = ub * gb / 100, win = ua < ub ? 'A' : 'B';
    const t = (p, g) => `${g} g for £${(p / 100).toFixed(2)}`;
    return { parts: [{ body: `${food[0].toUpperCase() + food.slice(1)} is sold in two sizes. Pack A is ${t(pa, ga)}. Pack B is ${t(pb, gb)}. Which pack is better value for money? You must show your working.`, a: `\\text{Pack ${win}}`, w: M(`\\text{A: } ${pa} \\div ${ga / 100} = ${ua}\\text{p per 100 g};\\ \\text{B: } ${pb} \\div ${gb / 100} = ${ub}\\text{p per 100 g}`), m: 3, lines: 6, chk: num(win === 'A' ? `${pb}/(${gb}/100)-${pa}/(${ga}/100)` : `${pa}/(${ga}/100)-${pb}/(${gb}/100)`, new F(Math.abs(ua - ub))) }] };
  },
};
