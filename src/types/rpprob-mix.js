import { PTOPIC, M, F, names, ratioOf, sumOf, rtx, mk, LIT, KG, ML, G } from './ratio.js';

const MIX = [
  { what: 'A grey paint', parts: ['black paint', 'white paint'], u: LIT, tot: [10, 12, 15, 20, 24, 30, 40] },
  { what: 'A fruit squash', parts: ['concentrate', 'water'], u: ML, tot: [200, 300, 400, 500, 600, 800, 1000] },
  { what: 'Concrete', parts: ['cement', 'sand', 'gravel'], u: KG, tot: [30, 36, 48, 60, 72, 90, 120] },
  { what: 'A bird food mix', parts: ['seeds', 'nuts', 'dried fruit'], u: G, tot: [300, 400, 600, 800, 900, 1200] },
];
const cap = (t) => t[0].toUpperCase() + t.slice(1);

export default {
  id: 'rpprob-mix',
  topic: PTOPIC, type: 'Mixing', code: 'RQ2',
  levels: ['Core', 'Additional'],
  search: 'mixing paint concrete squash ratio how much of each ingredient',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'total', label: 'the total mixture is given: find one ingredient', params: { k: 't' }, levels: ['Core'] },
    { id: 'part', label: 'one ingredient is given: find another', params: { k: 'p' }, levels: ['Core'] },
    { id: 'whole', label: 'one ingredient is given: find the total mixture made', params: { k: 'm' } },
  ],
  generate(r, v) {
    const m = r.pick(MIX), k = m.parts.length, ratio = ratioOf(r, k, { max: 6, maxSum: 12 }), sum = sumOf(ratio);
    const rs = `${ratio.join(' : ')}`, ings = m.parts.map(cap);
    const i = r.int(0, k - 1), j = r.until(() => { const x = r.int(0, k - 1); return x !== i ? x : null; });
    if (v.k === 't') {
      const T = r.pick(m.tot.filter(t => t % sum === 0));
      if (T === undefined) return this.generate(r, v);
      const unit = T / sum, ans = ratio[i] * unit;
      return { parts: [{ body: `${m.what} is made by mixing ${m.parts.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the ratio ${rs}. ${cap(m.u.txt(new F(T)))} of it is made. How much of the ${m.parts[i]} is used?`, a: m.u.tex(new F(ans)), w: M(`${T} \\div ${sum} = ${unit};\\ ${ratio[i]} \\times ${unit} = ${ans}`), ...mk(2, m.u), chk: { k: 'num', expr: `${T}/${sum}*${ratio[i]}`, val: String(ans) } }] };
    }
    const unit = r.pick([2, 3, 4, 5, 6, 8, 10, 12, 15, 20]), given = ratio[i] * unit, other = ratio[j] * unit;
    if (v.k === 'p') return { parts: [{ body: `${m.what} is made by mixing ${m.parts.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the ratio ${rs}. ${cap(m.u.txt(new F(given)))} of ${m.parts[i]} is used. How much of the ${m.parts[j]} is needed?`, a: m.u.tex(new F(other)), w: M(`${given} \\div ${ratio[i]} = ${unit};\\ ${ratio[j]} \\times ${unit} = ${other}`), ...mk(2, m.u), chk: { k: 'num', expr: `${given}/${ratio[i]}*${ratio[j]}`, val: String(other) } }] };
    const total = sum * unit;
    return { parts: [{ body: `${m.what} is made by mixing ${m.parts.join(', ').replace(/, ([^,]*)$/, ' and $1')} in the ratio ${rs}. ${cap(m.u.txt(new F(given)))} of ${m.parts[i]} is used. What is the total amount of mixture made?`, a: m.u.tex(new F(total)), w: M(`${given} \\div ${ratio[i]} = ${unit};\\ ${sum} \\times ${unit} = ${total}`), ...mk(2, m.u), chk: { k: 'num', expr: `${given}/${ratio[i]}*${sum}`, val: String(total) } }] };
  },
};
