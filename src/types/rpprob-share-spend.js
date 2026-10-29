import { PTOPIC, M, F, names, pounds, GBP, ratioOf, mk } from './ratio.js';

export default {
  id: 'rpprob-share-spend',
  topic: PTOPIC, type: 'Share, then spend', code: 'RQ1',
  levels: ['Core', 'Additional'],
  search: 'share money in a ratio then spend a fraction or percentage how much left',
  verb: '', marks: 3, lines: 6,
  variants: [
    { id: 'fraction', label: 'one share, a fraction of it is spent', params: { k: 'f' }, levels: ['Core'] },
    { id: 'percent', label: 'one share, a percentage is spent', params: { k: 'p' } },
  ],
  generate(r, v) {
    const [a, b] = ratioOf(r, 2, { max: 7, maxSum: 11 }), [n1, n2] = names(r, 2);
    const sum = a + b, unit = r.pick([4, 5, 8, 10, 12, 15, 20]), total = sum * unit;
    const i = r.int(0, 1), part = [a, b][i], share = part * unit, who = [n1, n2][i];
    let spent, txt, wsp, expr;
    if (v.k === 'f') {
      const d = r.pick([2, 4, 5, 10]), nn = r.int(1, d - 1), f = new F(nn, d);
      if (!f.mul(share).isInt || f.d === 1) return this.generate(r, v);
      spent = f.mul(share).n; txt = `{{\\dfrac{${f.n}}{${f.d}}}}`; wsp = `\\dfrac{${f.n}}{${f.d}} \\times ${share} = ${spent}`; expr = `${share}-Fraction(${f.n},${f.d})*${share}`;
    } else {
      const pc = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), sp = new F(pc * share, 100);
      if (!sp.isInt) return this.generate(r, v);
      spent = sp.n; txt = `${pc}%`; wsp = `${pc}\\% \\text{ of } ${share} = ${spent}`; expr = `${share}-${share}*${pc}/100`;
    }
    const left = share - spent;
    return { parts: [{ body: `${n1} and ${n2} share ${pounds(total)} in the ratio ${a} : ${b}. ${who} spends ${txt} of that money. How much money does ${who} have left?`, a: GBP.tex(new F(left)), w: M(`${total} \\div ${sum} = ${unit};\\ ${part} \\times ${unit} = ${share};\\ ${wsp};\\ ${share} - ${spent} = ${left}`), ...mk(3, GBP), chk: { k: 'num', expr, val: String(left) } }] };
  },
};
