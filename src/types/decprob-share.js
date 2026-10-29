import { PTOPIC, F, ds, py, M, mk, num, names, GBP, pounds, rnd, tie, rd } from './decimals.js';

const CTX = [
  (n, t, k) => `A restaurant bill is ${t}. It is shared equally between ${k} friends. How much does each friend pay?`,
  (n, t, k) => `A taxi fare of ${t} is shared equally between ${k} passengers. How much does each passenger pay?`,
  (n, t, k) => `${n} and ${k - 1} friends win ${t} in a raffle and share it equally. How much does each person get?`,
  (n, t, k) => `A class raises ${t} for charity. The money is shared equally between ${k} charities. How much does each charity get?`,
  (n, t, k) => `The cost of a ${k}-day hire of a boat is ${t}. What is the cost per day?`,
];

export default {
  id: 'decprob-share',
  topic: PTOPIC, type: 'Sharing money equally', code: 'DP2',
  levels: ['Core', 'Additional'],
  search: 'share equally bill divide money pence nearest penny rounding decimals',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'exact', label: 'shared exactly:  £47.60 between 7', params: { k: 'exact' }, levels: ['Core'] },
    { id: 'round', label: 'to the nearest penny:  £50 between 6', params: { k: 'round' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'exact') {
      const k = r.int(3, 9), each = rd(r, 2, 2, Math.floor(90 / k)), t = each.mul(k);
      return { parts: [{ body: r.pick(CTX.slice(0, 4))(n, pounds(t.val), k), a: GBP.tex(each), w: M(`${ds(t)} \\div ${k} = ${ds(each)}`), ...mk(1, GBP), chk: num(`${py(t)}/${k}`, each) }] };
    }
    const [t, k, q] = r.until(() => {
      const k = r.pick([3, 6, 7, 9]), t = r.chance(0.5) ? new F(r.int(20, 150)) : rd(r, 2, 10, 150), q = t.div(k);
      return 100 % q.d !== 0 && !tie(q, 2) && !t.div(k).mul(100).isInt ? [t, k, rnd(q, 2)] : null;
    });
    return { parts: [{ body: `${r.pick(CTX.slice(0, 4))(n, pounds(t.val), k)} Give your answer to the nearest penny.`, a: GBP.tex(q), w: M(`${ds(t)} \\div ${k} = ${(t.val / k).toFixed(4)}\\ldots \\approx ${q.val.toFixed(2)}`), ...mk(2, GBP), chk: num(`${py(t)}/${k}`, q, { dp: 2 }) }] };
  },
};
