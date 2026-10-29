import { PTOPIC, F, rd, ds, py, M, mk, num, names, LIT, KG, MET, GBP, pounds, dpOf } from './decimals.js';

const LEFT = [
  { u: LIT, tot: [1.5, 2, 2.5, 3, 4, 5], per: [0.2, 0.25, 0.3, 0.15], s: (n, T, k, e) => `A bottle contains ${T} of squash. ${n} pours ${k} glasses, each containing ${e}. How much squash is left in the bottle?` },
  { u: MET, tot: [3, 4, 5, 6, 8], per: [0.35, 0.45, 0.6, 0.75, 0.85], s: (n, T, k, e) => `A rope is ${T} long. ${n} cuts off ${k} pieces, each ${e} long. How much rope is left?` },
  { u: KG, tot: [2, 2.5, 3, 5, 6], per: [0.25, 0.3, 0.35, 0.45, 0.4], s: (n, T, k, e) => `A bag of rice has a mass of ${T}. ${n} makes ${k} portions, each of mass ${e}. What mass of rice is left in the bag?` },
  { u: GBP, tot: [10, 20, 50], per: [1.35, 2.4, 3.15, 1.85, 2.65], s: (n, T, k, e) => `${n} has ${T}. ${n} buys ${k} items at ${e} each. How much money does ${n} have left?`, money: true },
];
const NEED = [
  { u: KG, need: [2, 2.5, 3, 4], per: [0.25, 0.4, 0.5, 0.6, 0.75], s: (n, N, k, e) => `A recipe needs ${N} of flour. ${n} has ${k} bags of flour, each of mass ${e}. How much more flour does ${n} need?` },
  { u: MET, need: [3, 4, 5, 6], per: [0.65, 0.8, 0.95, 1.2], s: (n, N, k, e) => `${n} needs ${N} of ribbon. ${n} has ${k} pieces, each ${e} long. How much more ribbon does ${n} need?` },
  { u: LIT, need: [2, 3, 4, 5], per: [0.35, 0.45, 0.6, 0.75], s: (n, N, k, e) => `A plant trough needs ${N} of water. ${n} pours in ${k} jugs, each holding ${e}. How much more water does ${n} need to pour in?` },
];

export default {
  id: 'decprob-left',
  topic: PTOPIC, type: 'Amounts left and amounts needed', code: 'DP3',
  levels: ['Core'],
  search: 'cutting pouring amount left how much more needed multiply then subtract decimals mass length volume',
  verb: '', marks: 2, lines: 5,
  variants: [
    { id: 'left', label: 'how much is left after repeated amounts are used', params: { k: 'left' } },
    { id: 'need', label: 'how much more is needed', params: { k: 'need' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    const left = v.k === 'left', c = r.pick(left ? LEFT : NEED);
    const [T, k, e, used, ans] = r.until(() => {
      const T = new F(Math.round(r.pick(left ? c.tot : c.need) * 100), 100), e = new F(Math.round(r.pick(c.per) * 100), 100), k = r.int(3, 9);
      const used = e.mul(k), ans = left ? T.sub(used) : T.sub(used);
      return ans.val > 0.04 && (c.money ? ans.val >= 0.5 : true) && dpOf(ans) <= 2 ? [T, k, e, used, ans] : null;
    });
    return { parts: [{ body: c.s(n, c.u.txt(T), k, c.u.txt(e)), a: c.u.tex(ans), w: M(`${k} \\times ${ds(e)} = ${ds(used)};\\ ${ds(T)} - ${ds(used)} = ${ds(ans)}`), ...mk(2, c.u), chk: num(`${py(T)}-${k}*${py(e)}`, ans) }] };
  },
};
