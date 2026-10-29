import { PTOPIC, F, rd, ds, py, M, mk, num, names } from './decimals.js';

const U = (u, sq = false) => ({ meas: true, tex: (v) => `${ds(v)}\\text{ ${u}}${sq ? '^2' : ''}` });

export default {
  id: 'decprob-rect',
  topic: PTOPIC, type: 'Rectangles with decimal sides', code: 'DP7',
  levels: ['Core', 'Additional'],
  search: 'rectangle perimeter area decimal lengths cm m',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'perimeter', label: 'perimeter of a rectangle', params: { k: 'p' }, levels: ['Core'] },
    { id: 'area', label: 'area of a rectangle', params: { k: 'a' } },
    { id: 'both', label: 'perimeter then area (two parts)', params: { k: 'b' }, multipart: true },
  ],
  generate(r, v) {
    const unit = r.pick(['cm', 'cm', 'm']);
    const [L, W] = r.until(() => { const L = rd(r, 1, 2, 15), W = rd(r, r.pick([1, 1, 2]), 1, 9); return L.gt(W) && (v.k === 'p' || (L.mul(W).d <= 100)) ? [L, W] : null; });
    const stem = `A rectangle has length ${ds(L)} ${unit} and width ${ds(W)} ${unit}.`;
    const per = L.add(W).mul(2), area = L.mul(W);
    const pp = { a: U(unit).tex(per), w: M(`2 \\times (${ds(L)} + ${ds(W)}) = ${ds(per)}`), ...mk(1, U(unit)), chk: num(`2*(${py(L)}+${py(W)})`, per) };
    const ap = { a: U(unit, true).tex(area), w: M(`${ds(L)} \\times ${ds(W)} = ${ds(area)}`), ...mk(1, U(unit, true)), chk: num(`${py(L)}*${py(W)}`, area) };
    if (v.k === 'p') return { parts: [{ ...pp, body: `${stem} Work out the perimeter of the rectangle.` }] };
    if (v.k === 'a') return { parts: [{ ...ap, body: `${stem} Work out the area of the rectangle.` }] };
    return { stem, parts: [{ ...pp, l: 'a', body: 'Work out the perimeter of the rectangle.' }, { ...ap, l: 'b', body: 'Work out the area of the rectangle.' }] };
  },
};
