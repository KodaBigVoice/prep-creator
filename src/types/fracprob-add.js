import { names, TOPIC, T, TM, M, F, U, proper, num, fx, lcm } from './fracprob.js';
import { randMixed } from './fractions.js';

const FOOD = [
  { noun: 'cake', v: 'eats', mk: (n, a, b, w1, w2) => `${n} bakes a cake. ${n} eats ${a} of the cake on Monday and ${b} of the cake on Tuesday.`, of: 'the cake' },
  { noun: 'pizza', v: 'eats', mk: (n, a, b) => `${n} orders a pizza. ${n} eats ${a} of the pizza at lunch and ${b} of the pizza for tea.`, of: 'the pizza' },
  { noun: 'book', v: 'reads', mk: (n, a, b) => `${n} is reading a book. ${n} reads ${a} of the book on Saturday and ${b} of the book on Sunday.`, of: 'the book' },
  { noun: 'tub', v: 'eats', mk: (n, a, b) => `${n} buys a tub of ice cream. ${n} eats ${a} of the ice cream on Friday and ${b} of the ice cream on Saturday.`, of: 'the ice cream' },
];
const TOTAL = [
  { u: U('km'), mk: (n, a, b) => `${n} walks ${a} to the bus stop and then ${b} from the bus stop to school. How far does ${n} walk altogether?` },
  { u: U('litres', 'litre'), mk: (n, a, b) => `${n} pours ${a} of orange juice and ${b} of lemonade into a jug. How much liquid is in the jug?` },
  { u: U('kg'), mk: (n, a, b) => `${n} buys ${a} of apples and ${b} of pears. What is the total mass of the fruit?` },
  { u: U('m'), mk: (n, a, b) => `${n} has a piece of ribbon that is ${a} long and another piece that is ${b} long. What is the total length of the ribbon?` },
];
const SUB = [
  { u: U('litres', 'litre'), mk: (n, a, b) => `A jug holds ${a} of milk. ${n} pours out ${b}. How much milk is left in the jug?` },
  { u: U('m'), mk: (n, a, b) => `${n} has a rope that is ${a} long. ${n} cuts off a piece that is ${b} long. How long is the piece that is left?` },
  { u: U('kg'), mk: (n, a, b) => `A bag of rice has a mass of ${a}. ${n} uses ${b} of the rice. What mass of rice is left in the bag?` },
  { u: U('km'), mk: (n, a, b) => `A footpath is ${a} long. ${n} has walked ${b} along the path. How far is there still to walk?` },
];
const MIXED = [
  { u: U('cups'), op: '+', mk: (n, a, b) => `${n} uses ${a} cups of flour to make bread and ${b} cups of flour to make a cake. How much flour does ${n} use altogether?` },
  { u: U('m'), op: '+', mk: (n, a, b) => `${n} needs ${a} m of wood for a shelf and ${b} m of wood for a frame. How much wood does ${n} need altogether?` },
  { u: U('litres', 'litre'), op: '+', mk: (n, a, b) => `${n} uses ${a} litres of paint on a wall and ${b} litres of paint on a door. How much paint is used altogether?` },
  { u: U('m'), op: '-', mk: (n, a, b) => `A plank is ${a} m long. ${n} cuts a piece ${b} m long off the end. How long is the rest of the plank?` },
  { u: U('kg'), op: '-', mk: (n, a, b) => `A bag of compost has a mass of ${a} kg. ${n} uses ${b} kg of it on the vegetable patch. What mass of compost is left?` },
  { u: U('litres', 'litre'), op: '-', mk: (n, a, b) => `A watering can holds ${a} litres of water. ${n} waters the plants using ${b} litres. How much water is left in the can?` },
];
const DEN = [2, 3, 4, 5, 6, 8, 10, 12];
const work = (A, B, op) => { const L = lcm(A.d, B.d), res = op === '+' ? A.add(B) : A.sub(B); return `${A.tex()} ${op} ${B.tex()} = \\dfrac{${A.n * (L / A.d)}}{${L}} ${op} \\dfrac{${B.n * (L / B.d)}}{${L}} = ${res.mixedTex() === res.tex() ? res.tex() : `${res.tex()} = ${res.mixedTex()}`}`; };

export default {
  id: 'fracprob-add',
  topic: TOPIC, type: 'Adding and subtracting fractions in context', code: 'FP4',
  levels: ['Core', 'Additional'],
  multipart: true,
  search: 'add subtract fractions worded problem mixed numbers total left',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'left', label: 'two parts: fraction eaten in total, fraction left', params: { kind: 'left' } },
    { id: 'total', label: 'adding two amounts with units', params: { kind: 'total' }, multipart: false },
    { id: 'sub', label: 'subtracting, amount left with units', params: { kind: 'sub' }, multipart: false },
    { id: 'mixed', label: 'mixed numbers, adding', params: { kind: 'mixed', op: '+' }, levels: ['Additional'], multipart: false },
    { id: 'mixedsub', label: 'mixed numbers, subtracting', params: { kind: 'mixed', op: '-' }, levels: ['Additional'], multipart: false },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.kind === 'left') {
      const c = r.pick(FOOD);
      const [A, B] = r.until(() => { const a = proper(r, DEN), b = proper(r, DEN); return a && b && a.add(b).val < 1 ? [a, b] : null; });
      const sum = A.add(B), left = new F(1).sub(sum);
      return { stem: c.mk(n, T(A), T(B)), parts: [
        { body: `What fraction of ${c.of} does ${n} ${c.v === 'reads' ? 'read' : 'eat'} altogether?`, a: sum.tex(), w: M(work(A, B, '+')), m: 2, lines: 3, chk: num(`${fx(A)}+${fx(B)}`, sum) },
        { body: `What fraction of ${c.of} is left?`, a: left.tex(), w: M(`1 - ${sum.tex()} = ${left.tex()}`), m: 1, lines: 2, chk: num(`1-${fx(A)}-${fx(B)}`, left) },
      ] };
    }
    if (v.kind === 'mixed') {
      const c = r.pick(MIXED.filter(x => x.op === v.op));
      const [A, B] = r.until(() => {
        const a = randMixed(r, { wMin: 1, wMax: 5, dens: [2, 3, 4, 6, 8] }), b = randMixed(r, { wMin: 1, wMax: 3, dens: [2, 3, 4, 6, 8] });
        if (!a || !b || a.d === b.d || lcm(a.d, b.d) > 24) return null;
        if (v.op === '-' && (!a.gt(b) || a.sub(b).isInt)) return null;
        return [a, b];
      });
      const res = v.op === '+' ? A.add(B) : A.sub(B);
      return { parts: [{ body: c.mk(n, TM(A), TM(B)), a: c.u.tex(res), w: M(`${A.mixedTex()} ${v.op} ${B.mixedTex()} = ${res.mixedTex()}`), m: 3, lines: 4, chk: num(`${fx(A)}${v.op}${fx(B)}`, res) }] };
    }
    const isAdd = v.kind === 'total', c = r.pick(isAdd ? TOTAL : SUB);
    const [A, B] = r.until(() => {
      const a = proper(r, DEN), b = proper(r, DEN);
      if (!a || !b || a.d === b.d && r.chance(0.6) || b.val < 0.25) return null;
      if (isAdd) return a.val >= 0.25 && !a.add(b).isInt ? [a, b] : null;
      return a.val >= 0.5 && a.gt(b) && !a.sub(b).isZero ? [a, b] : null;
    });
    const res = isAdd ? A.add(B) : A.sub(B);
    return { parts: [{ body: c.mk(n, c.u.txt(A), c.u.txt(B)), a: c.u.tex(res), w: M(work(A, B, isAdd ? '+' : '-')), m: 2, lines: 3, chk: num(`${fx(A)}${isAdd ? '+' : '-'}${fx(B)}`, res) }] };
  },
};
