import { PTOPIC, F, ds, py, M, mk, num, names, GBP, mon, pounds } from './decimals.js';

const ITEMS = [
  ['a sandwich', [2.8, 3.2, 3.4, 3.5, 3.95]], ['a drink', [0.95, 1.2, 1.25, 1.4, 1.65]], ['a notebook', [1.15, 1.8, 2.15, 2.6, 3.25]],
  ['a magazine', [2.95, 3.5, 3.95, 4.25]], ['a bag of crisps', [0.7, 0.85, 0.95, 1.1]], ['a cake', [1.8, 2.25, 2.6, 3.15]],
  ['a pen', [0.65, 0.85, 0.95, 1.2]], ['a ruler', [0.55, 0.75, 0.9, 1.3]], ['a bottle of water', [0.8, 1.05, 1.3, 1.6]],
  ['a comic', [2.4, 3.1, 3.75, 4.5]], ['a sticker book', [1.95, 2.4, 2.85, 3.3]], ['a banana loaf', [2.1, 2.7, 3.4]],
];
const MULT = [
  ['pens', 'pen', [0.65, 0.85, 0.95, 1.2]], ['notebooks', 'notebook', [1.15, 1.8, 2.15, 2.6]], ['drinks', 'drink', [0.95, 1.2, 1.25, 1.4]],
  ['apples', 'apple', [0.35, 0.45, 0.55, 0.65]], ['cakes', 'cake', [1.8, 2.25, 2.6]], ['stickers', 'sticker', [0.25, 0.35, 0.45]],
];
const NOTES = [5, 10, 20, 50];
const f2 = (x) => new F(Math.round(x * 100), 100);

export default {
  id: 'decprob-shopping',
  topic: PTOPIC, type: 'Shopping and change', code: 'DP1',
  levels: ['Core'],
  search: 'shopping change money total cost decimals pence notes',
  verb: '', marks: 2, lines: 5,
  variants: [
    { id: 'two', label: 'two items, change from a note', params: { k: 'two' } },
    { id: 'three', label: 'three items, change from a note', params: { k: 'three' } },
    { id: 'multi', label: 'several of one item and other items', params: { k: 'multi' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    const note = (total) => NOTES.find(x => x > total + 0.5 && x - total < 20) || 50;
    if (v.k === 'multi') {
      const [pl, sg, prices] = r.pick(MULT), k = r.int(3, 8);
      const [name2, p2s] = r.pick(ITEMS.filter(i => i[0] !== `a ${sg}`));
      const p1 = f2(r.pick(prices)), p2 = f2(r.pick(p2s));
      const total = p1.mul(k).add(p2), pay = new F(note(total.val)), ch = pay.sub(total);
      if (ch.val <= 0 || ch.val > 20) return this.generate(r, v);
      return { parts: [{ body: `${n} buys ${k} ${pl} at ${mon(p1)} each and ${name2} for ${mon(p2)}. ${n} pays with a £${pay.n} note. How much change does ${n} get?`, a: GBP.tex(ch), w: M(`${k} \\times ${ds(p1)} = ${ds(p1.mul(k))};\\ ${ds(p1.mul(k))} + ${ds(p2)} = ${ds(total)};\\ ${pay.n} - ${ds(total)} = ${ds(ch)}`), ...mk(2, GBP), chk: num(`${pay.n}-(${k}*${py(p1)}+${py(p2)})`, ch) }] };
    }
    const cnt = v.k === 'two' ? 2 : 3, picks = r.sample(ITEMS, cnt), ps = picks.map(i => f2(r.pick(i[1])));
    const total = ps.reduce((a, b) => a.add(b), new F(0)), pay = new F(note(total.val)), ch = pay.sub(total);
    if (ch.val <= 0 || ch.val > 20) return this.generate(r, v);
    const list = picks.map((it, i) => `${it[0]} for ${mon(ps[i])}`);
    const text = list.length === 2 ? `${list[0]} and ${list[1]}` : `${list[0]}, ${list[1]} and ${list[2]}`;
    return { parts: [{ body: `${n} buys ${text}. ${n} pays with a £${pay.n} note. How much change does ${n} get?`, a: GBP.tex(ch), w: M(`${ps.map(ds).join(' + ')} = ${ds(total)};\\ ${pay.n} - ${ds(total)} = ${ds(ch)}`), ...mk(cnt === 2 ? 1 : 2, GBP), chk: num(`${pay.n}-(${ps.map(py).join('+')})`, ch) }] };
  },
};
