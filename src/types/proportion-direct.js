import { names, pounds, poundsTex } from '../core/q.js';

export default {
  id: 'proportion-direct',
  topic: 'Proportion', type: 'Direct proportion', code: 'PDIR',
  levels: ['Core', 'Additional'],
  search: 'direct proportion unit rate recipe cost',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'cost', label: 'cost of items', params: { k: 'cost' } },
    { id: 'recipe', label: 'recipe for a number of people', params: { k: 'recipe' } },
  ],
  generate(r, v) {
    if (v.k === 'cost') {
      const items = [['pens', 'pen', 60], ['notebooks', 'notebook', 85], ['chocolate bars', 'chocolate bar', 90], ['bananas', 'banana', 25], ['cans of drink', 'can of drink', 65], ['apples', 'apple', 40]];
      const [pl, , pence] = r.pick(items);
      const [n1, n2] = r.until(() => { const a = r.int(3, 12), b = r.int(3, 20); return a !== b ? [a, b] : null; });
      const c1 = n1 * pence / 100, c2 = n2 * pence / 100;
      const body = `${n1} ${pl} cost ${pounds(c1)}. Work out the cost of ${n2} ${pl}.`;
      return { parts: [{ body, a: poundsTex(c2), w: `{{${pounds(c1).slice(1)} \\div ${n1} = ${(pence / 100).toFixed(2)};\\ ${(pence / 100).toFixed(2)} \\times ${n2} = ${c2.toFixed(2)}}}`, chk: { k: 'num', val: c2.toFixed(2), expr: `${c1}/${n1}*${n2}`, dp: 2 } }] };
    }
    const rec = [
      ['A pancake recipe', 'flour', 'g', 25], ['A pancake recipe', 'milk', 'ml', 60], ['A soup recipe', 'vegetable stock', 'ml', 100],
      ['A curry recipe', 'rice', 'g', 40], ['A cake recipe', 'sugar', 'g', 15], ['A cake recipe', 'butter', 'g', 20], ['A smoothie recipe', 'yoghurt', 'g', 50],
    ];
    const [dish, item, u, per] = r.pick(rec);
    const [p1, p2] = r.until(() => { const a = r.pick([4, 6, 8, 10, 12]), b = r.pick([2, 3, 5, 7, 9, 10, 14, 15]); return a !== b ? [a, b] : null; });
    const q1 = per * p1, q2 = per * p2;
    const body = `${dish} for ${p1} people uses ${q1} ${u} of ${item}. Work out how much ${item} is needed for ${p2} people.`;
    return { parts: [{ body, a: `${q2}\\text{ ${u}}`, w: `{{${q1} \\div ${p1} = ${per};\\ ${per} \\times ${p2} = ${q2}}}`, chk: { k: 'num', val: String(q2), expr: `${q1}/${p1}*${p2}` } }] };
  },
};
