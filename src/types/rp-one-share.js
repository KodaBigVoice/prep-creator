import { TOPIC, M, F, names, ratioOf, rtx, sumOf, PAIRS, cnt, GBP, KG, LIT, MET, mk, pounds } from './ratio.js';

const cap = (t) => t[0].toUpperCase() + t.slice(1);
const MEAS = [
  { u: KG, a: 'sugar', b: 'flour', s: (c, rs, giv, x) => `${cap(c.a)} and ${c.b} are mixed in the ratio ${rs}. There is ${x} of ${giv}.`, ask: (o) => `What mass of ${o} is there?`, askT: 'What is the total mass of the mixture?' },
  { u: LIT, a: 'blue paint', b: 'white paint', s: (c, rs, giv, x) => `${cap(c.a)} and ${c.b} are mixed in the ratio ${rs}. ${cap(x)} of ${giv} is used.`, ask: (o) => `How much ${o} is used?`, askT: 'How much paint is there altogether?' },
  { u: LIT, a: 'orange squash', b: 'water', s: (c, rs, giv, x) => `${cap(c.a)} and ${c.b} are mixed in the ratio ${rs}. ${cap(x)} of ${giv} is used.`, ask: (o) => `How much ${o} is used?`, askT: 'How much drink is made altogether?' },
];

export default {
  id: 'rp-one-share',
  topic: TOPIC, type: 'One share given: find the other or the total', code: 'RP9',
  levels: ['Core'],
  search: 'ratio one part given find the other part total multiply',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'other', label: 'find the other quantity:  3 : 4, 15 boys, how many girls', params: { k: 'o' } },
    { id: 'total', label: 'find the total:  3 : 4, 15 boys, how many pupils', params: { k: 't' } },
    { id: 'ctx', label: 'measured quantities (units)', params: { k: 'c' } },
  ],
  generate(r, v) {
    const [a, b] = r.until(() => { const x = ratioOf(r, 2, { max: 8, maxSum: 14 }); return x; });
    const unit = r.int(2, 12), pickFirst = r.chance(0.5), given = pickFirst ? a : b, other = pickFirst ? b : a;
    if (v.k === 'c') {
      const c = r.pick(MEAS), g = given * unit, total = (a + b) * unit, o = other * unit;
      const [G, O] = pickFirst ? [c.a, c.b] : [c.b, c.a], tot = r.chance(0.4);
      const body = `${c.s(c, `${a} : ${b}`, G, c.u.txt(new F(g)))} ${tot ? c.askT : c.ask(O)}`;
      const ans = tot ? total : o;
      return { parts: [{ body, a: c.u.tex(new F(ans)), w: M(tot ? `${g} \\div ${given} = ${unit};\\ ${a + b} \\times ${unit} = ${total}` : `${g} \\div ${given} = ${unit};\\ ${other} \\times ${unit} = ${o}`), ...mk(2, c.u), chk: { k: 'num', expr: tot ? `${g}/${given}*(${a}+${b})` : `${g}/${given}*${other}`, val: String(ans) } }] };
    }
    const p = r.pick(PAIRS);
    const [A, B] = pickFirst ? [p[0], p[1]] : [p[1], p[0]], g = given * unit;
    const total = v.k === 't';
    const body = `The ratio of ${p[0]} to ${p[1]} ${p[3]} is ${a} : ${b}. There are ${g} ${A}. ${total ? `How many ${p[2]} are there altogether?` : `How many ${B} are there?`}`;
    const ans = total ? (a + b) * unit : other * unit;
    return { parts: [{ body, a: String(ans), w: M(total ? `${g} \\div ${given} = ${unit};\\ ${a + b} \\times ${unit} = ${ans}` : `${g} \\div ${given} = ${unit};\\ ${other} \\times ${unit} = ${ans}`), m: 2, lines: 4, chk: { k: 'num', expr: total ? `${g}/${given}*(${a}+${b})` : `${g}/${given}*${other}`, val: String(ans) } }] };
  },
};
