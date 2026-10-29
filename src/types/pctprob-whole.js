import { PTOPIC, M, F, names, pounds, dstr, valOf, mk, numChk, GBP, KG, G, KM, LIT, cnt } from './percentages.js';

const C = (u, Ws, mkf, rest) => ({ u, Ws, mk: mkf, rest });
const BANK = [
  C(cnt('members', 'member'), [40, 60, 80, 100, 120, 150, 200, 240, 300], (n, p, a) => `${p}% of the members of a club are under 12. There are ${a} members under 12. How many members does the club have?`, (n, p, a, W) => `${p}% of the members of a club are under 12. There are ${a} members under 12. How many members of the club are not under 12?`),
  C(cnt('pupils', 'pupil'), [100, 150, 200, 240, 300, 400, 500, 600], (n, p, a) => `${p}% of the pupils in a school play chess. ${a} pupils play chess. How many pupils are in the school?`, (n, p, a) => `${p}% of the pupils in a school play chess. ${a} pupils play chess. How many pupils in the school do not play chess?`),
  C(GBP, [40, 60, 80, 100, 120, 150, 200, 250, 400, 500, 800], (n, p, a) => `${n} pays a deposit of ${a} for a holiday. The deposit is ${p}% of the total cost. What is the total cost of the holiday?`, (n, p, a) => `${n} pays a deposit of ${a} for a holiday. The deposit is ${p}% of the total cost. How much does ${n} still have to pay?`),
  C(KM, [20, 40, 50, 60, 80, 100, 120, 200], (n, p, a) => `${n} has driven ${a} on a journey. This is ${p}% of the whole journey. How long is the whole journey?`, (n, p, a) => `${n} has driven ${a} on a journey. This is ${p}% of the whole journey. How much further does ${n} have to drive?`),
  C(G, [200, 250, 400, 500, 800, 1000], (n, p, a) => `A cake contains ${a} of sugar. This is ${p}% of the total mass of the cake. What is the total mass of the cake?`, (n, p, a) => `A cake contains ${a} of sugar. This is ${p}% of the total mass of the cake. What is the mass of the rest of the cake, which is not sugar?`),
  C(LIT, [40, 50, 60, 80, 100, 200, 400], (n, p, a) => `A tank contains ${a} of water. This is ${p}% of the amount that the tank can hold. How many litres can the tank hold?`, (n, p, a) => `A tank contains ${a} of water. This is ${p}% of the amount that the tank can hold. How many more litres of water are needed to fill the tank?`),
];

export default {
  id: 'pctprob-whole',
  topic: PTOPIC, type: 'Finding the whole from a part', code: 'PP2',
  levels: ['Additional'],
  search: 'finding the whole from a percentage part 20% of the pupils is 30 reverse worded problem unitary',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'unit', label: '10%, 20%, 25%, 50% or 5% is given', params: { k: 'whole', ps: [10, 20, 25, 50, 5] }, levels: ['Core', 'Additional'] },
    { id: 'any', label: 'any whole-number percentage is given', params: { k: 'whole', ps: [15, 35, 12, 45, 60, 30, 40, 8, 4, 16, 18, 24, 36] } },
    { id: 'rest', label: 'find the whole, then the rest', params: { k: 'rest', ps: [10, 20, 25, 30, 40, 15, 35, 45] } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    const [c, p, W, a] = r.until(() => {
      const c = r.pick(BANK), p = r.pick(v.ps), W = r.pick(c.Ws), a = valOf(W, p);
      return a.isInt && a.val >= 3 && W !== 100 ? [c, p, W, a.n] : null;
    });
    const aTxt = c.u.money ? pounds(a) : c.u.count ? String(a) : c.u.txt(a);
    const wk = (100 % p === 0) ? `${p}\\% \\to ${a};\\ 100\\% \\to ${a} \\times ${100 / p} = ${W}` : `${p}\\% \\to ${a};\\ 1\\% \\to ${dstr(new F(a, p))};\\ 100\\% \\to ${W}`;
    if (v.k === 'whole') return { parts: [{ body: c.mk(n, p, aTxt), a: c.u.tex(W), w: M(wk), ...mk(2, c.u), chk: numChk(`${a}/${p}*100`, W) }] };
    const rest = W - a;
    return { parts: [{ body: c.rest(n, p, aTxt), a: c.u.tex(rest), w: M(`${wk};\\ ${W} - ${a} = ${rest}`), ...mk(3, c.u), chk: numChk(`${a}/${p}*100-${a}`, rest) }] };
  },
};
