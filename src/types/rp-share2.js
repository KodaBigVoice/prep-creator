import { TOPIC, names, pounds, GBP, cnt, mk, ratioOf, rtx, sumOf, nameList, SPLIT, COUNTS, shareAns, listChk, F, M } from './ratio.js';

export default {
  id: 'rp-share2',
  topic: TOPIC, type: 'Sharing in a ratio: two parts', code: 'RP7',
  levels: ['Core'],
  search: 'share divide in the ratio two parts money sweets mass length',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'money', label: 'share money between two people', params: { k: 'money' } },
    { id: 'count', label: 'share sweets, stickers or cards', params: { k: 'count' } },
    { id: 'one', label: 'find just one of the shares', params: { k: 'one' } },
    { id: 'ctx', label: 'split a mass, volume or length (units)', params: { k: 'ctx' } },
  ],
  generate(r, v) {
    const ratio = ratioOf(r, 2, { max: 7, maxSum: 12 }), sum = sumOf(ratio), unit = r.int(3, 30);
    const total = sum * unit, shares = ratio.map(x => x * unit), rs = rtx(ratio), [n1, n2] = names(r, 2);
    const wk = `${total} \\div ${sum} = ${unit};\\ ${ratio[0]} \\times ${unit} = ${shares[0]},\\ ${ratio[1]} \\times ${unit} = ${shares[1]}`;
    const exprs = ratio.map(x => `${total}/${sum}*${x}`);
    if (v.k === 'ctx') {
      const c = r.pick(SPLIT), T = c.tot.filter(t => t % sum === 0);
      if (!T.length) return this.generate(r, v);
      const tt = r.pick(T), u = tt / sum, sh = ratio.map(x => x * u);
      return { parts: [{ body: c.two(c.u.txt(new F(tt)), rs), a: shareAns(null, sh, c.u), w: M(`${tt} \\div ${sum} = ${u};\\ ${ratio[0]} \\times ${u} = ${sh[0]},\\ ${ratio[1]} \\times ${u} = ${sh[1]}`), ...mk(2, c.u), chk: listChk(ratio.map(x => `${tt}/${sum}*${x}`), sh) }] };
    }
    if (v.k === 'money' || v.k === 'one') {
      const body = v.k === 'one' ? `${n1} and ${n2} share ${pounds(total)} in the ratio ${rs}. How much does ${n2} receive?` : `${n1} and ${n2} share ${pounds(total)} in the ratio ${rs}. How much does each person receive?`;
      const a = v.k === 'one' ? GBP.tex(new F(shares[1])) : shareAns([n1, n2], shares, GBP);
      const ch = v.k === 'one' ? { k: 'num', expr: exprs[1], val: String(shares[1]) } : listChk(exprs, shares);
      return { parts: [{ body, a, w: M(wk), ...mk(2, GBP), chk: ch }] };
    }
    const [pl] = r.pick(COUNTS), u = cnt(pl, pl);
    return { parts: [{ body: `${n1} and ${n2} share ${total} ${pl} in the ratio ${rs}. How many ${pl} does each person receive?`, a: shareAns([n1, n2], shares, u).replace(/\\text\{ [a-z ]+\}/g, ''), w: M(wk), m: 2, lines: 4, chk: listChk(exprs, shares) }] };
  },
};
