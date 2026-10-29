import { TOPIC, M, F, dstr, mk, G, ML } from './ratio.js';

const REC = [
  ['A pancake recipe', [['flour', G], ['milk', ML]]], ['A soup recipe', [['vegetable stock', ML], ['lentils', G]]], ['A curry recipe', [['rice', G], ['chicken', G]]],
  ['A cake recipe', [['sugar', G], ['butter', G]]], ['A smoothie recipe', [['yoghurt', G], ['orange juice', ML]]], ['A flapjack recipe', [['oats', G], ['butter', G]]],
];

export default {
  id: 'rp-recipe',
  topic: TOPIC, type: 'Direct proportion: recipes', code: 'RP13',
  levels: ['Core'],
  search: 'recipe scale ingredients for a number of people direct proportion',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'plain', label: 'amount per person is a whole number:  4 people to 10 people', params: { k: 'plain' } },
    { id: 'decimal', label: 'amount per person is a decimal:  150 g for 6, for 15', params: { k: 'dec' }, levels: ['Additional'] },
    { id: 'two', label: 'two ingredients (two parts)', params: { k: 'two' }, multipart: true },
  ],
  generate(r, v) {
    const [dish, ings] = r.pick(REC);
    const [p1, p2] = r.until(() => { const a = r.pick(v.k === 'dec' ? [4, 6, 8, 10, 12] : [4, 6, 8, 10, 12]), b = r.pick([2, 3, 5, 7, 9, 10, 14, 15, 18, 20]); return a !== b ? [a, b] : null; });
    const make = (ing, u) => {
      const pp = new F(Math.round((v.k === 'dec' ? r.pick([2.5, 7.5, 12.5, 17.5, 22.5, 37.5, 62.5]) : r.pick([5, 10, 15, 20, 25, 30, 40, 50])) * 10), 10);
      const q1 = pp.mul(p1), q2 = pp.mul(p2);
      if (!q1.isInt || (v.k === 'dec' && q2.d > 2)) return null;
      return { ing, u, pp, q1, q2 };
    };
    if (v.k === 'two') {
      const [A, B] = [ings[0], ings[1]], a = r.until(() => make(...A)), b = r.until(() => make(...B));
      const part = (x, l) => ({ l, body: `Work out how much ${x.ing} is needed for ${p2} people.`, a: x.u.tex(x.q2), w: M(`${dstr(x.q1)} \\div ${p1} = ${dstr(x.pp)};\\ ${dstr(x.pp)} \\times ${p2} = ${dstr(x.q2)}`), ...mk(2, x.u), chk: { k: 'num', expr: `${dstr(x.q1)}/${p1}*${p2}`, val: dstr(x.q2) } });
      return { stem: `${dish} for ${p1} people uses ${a.u.txt(a.q1)} of ${a.ing} and ${b.u.txt(b.q1)} of ${b.ing}.`, parts: [part(a, 'a'), part(b, 'b')] };
    }
    const x = r.until(() => make(...r.pick(ings)));
    return { parts: [{ body: `${dish} for ${p1} people uses ${x.u.txt(x.q1)} of ${x.ing}. Work out how much ${x.ing} is needed for ${p2} people.`, a: x.u.tex(x.q2), w: M(`${dstr(x.q1)} \\div ${p1} = ${dstr(x.pp)};\\ ${dstr(x.pp)} \\times ${p2} = ${dstr(x.q2)}`), ...mk(2, x.u), chk: { k: 'num', expr: `${dstr(x.q1)}/${p1}*${p2}`, val: dstr(x.q2) } }] };
  },
};
