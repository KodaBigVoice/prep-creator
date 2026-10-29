import { TOPIC, ratioOf, M, listChk, F, mk, cnt, names } from './ratio.js';

const SQ = '\\square';
const RECIPES = [
  (a, b, ka, n) => `A hot chocolate recipe uses ${a} scoops of cocoa for every ${b} cups of milk. ${n} uses ${a * ka} scoops of cocoa. How many cups of milk does ${n} need?`,
  (a, b, ka, n) => `A fruit punch is made with ${a} litres of juice for every ${b} litres of lemonade. ${n} uses ${a * ka} litres of juice. How many litres of lemonade are needed?`,
  (a, b, ka, n) => `A bracelet has ${a} blue beads for every ${b} white beads. ${n} makes a longer bracelet with ${a * ka} blue beads. How many white beads does it have?`,
  (a, b, ka, n) => `A garden has ${a} rose bushes for every ${b} lavender plants. There are ${a * ka} rose bushes. How many lavender plants are there?`,
];
const NOUN = [cnt('cups', 'cup'), cnt('litres', 'litre'), cnt('beads', 'bead'), cnt('lavender plants', 'lavender plant')];

export default {
  id: 'rp-equivalent',
  topic: TOPIC, type: 'Equivalent ratios and missing values', code: 'RP3',
  levels: ['Core'],
  search: 'equivalent ratio missing number scale up scale down',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'second', label: 'missing second number:  3 : 5 = 12 : ?', params: { k: 's' } },
    { id: 'first', label: 'missing first number:  4 : 9 = ? : 36', params: { k: 'f' } },
    { id: 'down', label: 'scaling down:  20 : 35 = ? : 7', params: { k: 'd' } },
    { id: 'ctx', label: 'recipe scaled up (worded)', params: { k: 'c' } },
  ],
  generate(r, v) {
    const [a, b] = ratioOf(r, 2, { max: 9, maxSum: 16, min: v.k === 'c' ? 2 : 1 });
    if (v.k === 'c') {
      const i = r.int(0, RECIPES.length - 1), k = r.int(2, 6), [n] = names(r, 1), u = NOUN[i];
      return { parts: [{ body: RECIPES[i](a, b, k, n), a: u.tex(new F(b * k)), w: M(`${a} \\times ${k} = ${a * k};\\ ${b} \\times ${k} = ${b * k}`), m: 2, lines: 4, chk: { k: 'num', expr: `${a * k}/${a}*${b}`, val: String(b * k) } }] };
    }
    const k = r.int(2, 9);
    let eq, ans, w, expr;
    if (v.k === 's') { eq = `${a} : ${b} = ${a * k} : ${SQ}`; ans = b * k; w = `${a} \\times ${k} = ${a * k};\\ ${b} \\times ${k} = ${ans}`; expr = `${a * k}/${a}*${b}`; }
    else if (v.k === 'f') { eq = `${a} : ${b} = ${SQ} : ${b * k}`; ans = a * k; w = `${b} \\times ${k} = ${b * k};\\ ${a} \\times ${k} = ${ans}`; expr = `${b * k}/${b}*${a}`; }
    else { eq = r.chance(0.5) ? `${a * k} : ${b * k} = ${SQ} : ${b}` : `${a * k} : ${b * k} = ${a} : ${SQ}`; const first = eq.includes(`${SQ} : ${b}`); ans = first ? a : b; w = `${a * k} \\div ${k} = ${a};\\ ${b * k} \\div ${k} = ${b}`; expr = first ? `${a * k}/(${b * k}/${b})` : `${b * k}/(${a * k}/${a})`; }
    return { parts: [{ body: `Find the missing number: {{${eq}}}`, a: String(ans), w: M(w), m: 1, lines: 3, chk: { k: 'num', expr, val: String(ans) } }] };
  },
};
