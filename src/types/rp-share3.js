import { TOPIC, names, pounds, GBP, cnt, mk, ratioOf, rtx, sumOf, nameList, SPLIT, COUNTS, shareAns, listChk, F, M } from './ratio.js';

export default {
  id: 'rp-share3',
  topic: TOPIC, type: 'Sharing in a ratio: three parts', code: 'RP8',
  levels: ['Core', 'Additional'],
  search: 'share divide in the ratio three parts money sweets mass length',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'money', label: 'share money between three people', params: { k: 'money' } },
    { id: 'count', label: 'share sweets, stickers or cards', params: { k: 'count' } },
    { id: 'one', label: 'find just one of the shares', params: { k: 'one' }, levels: ['Core'] },
    { id: 'ctx', label: 'split a mass, volume or length (units)', params: { k: 'ctx' } },
  ],
  generate(r, v) {
    const ratio = ratioOf(r, 3, { max: 7, maxSum: 16 }), sum = sumOf(ratio), unit = r.int(2, 20);
    const total = sum * unit, shares = ratio.map(x => x * unit), rs = rtx(ratio), ns = names(r, 3);
    const wk = `${total} \\div ${sum} = ${unit};\\ ` + ratio.map((x, i) => `${x} \\times ${unit} = ${shares[i]}`).join(',\\ ');
    const exprs = ratio.map(x => `${total}/${sum}*${x}`);
    if (v.k === 'ctx') {
      const c = r.pick(SPLIT), T = c.tot.filter(t => t % sum === 0);
      if (!T.length) return this.generate(r, v);
      const tt = r.pick(T), u = tt / sum, sh = ratio.map(x => x * u);
      return { parts: [{ body: c.three(c.u.txt(new F(tt)), rs), a: shareAns(null, sh, c.u), w: M(`${tt} \\div ${sum} = ${u};\\ ` + ratio.map((x, i) => `${x} \\times ${u} = ${sh[i]}`).join(',\\ ')), ...mk(3, c.u), chk: listChk(ratio.map(x => `${tt}/${sum}*${x}`), sh) }] };
    }
    if (v.k === 'money' || v.k === 'one') {
      const i = r.int(0, 2);
      const body = v.k === 'one' ? `${nameList(ns)} share ${pounds(total)} in the ratio ${rs}. How much does ${ns[i]} receive?` : `${nameList(ns)} share ${pounds(total)} in the ratio ${rs}. How much does each person receive?`;
      return { parts: [{ body, a: v.k === 'one' ? GBP.tex(new F(shares[i])) : shareAns(ns, shares, GBP), w: M(wk), ...mk(3, GBP), chk: v.k === 'one' ? { k: 'num', expr: exprs[i], val: String(shares[i]) } : listChk(exprs, shares) }] };
    }
    const [pl] = r.pick(COUNTS), u = cnt(pl, pl);
    return { parts: [{ body: `${nameList(ns)} share ${total} ${pl} in the ratio ${rs}. How many ${pl} does each person receive?`, a: shareAns(ns, shares, u).replace(/\\text\{ [a-z ]+\}/g, ''), w: M(wk), m: 3, lines: 5, chk: listChk(exprs, shares) }] };
  },
};
