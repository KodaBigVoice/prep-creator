import { PTOPIC, F, ds, py, M, mk, num, names, rd, pounds } from './decimals.js';

const CUR = [
  { sym: '€', word: 'euros', rates: [1.1, 1.12, 1.15, 1.17, 1.2, 1.25], tex: (v) => `\\text{€}${v}` },
  { sym: '$', word: 'dollars', rates: [1.2, 1.25, 1.28, 1.3, 1.35, 1.4], tex: (v) => `\\text{\\$}${v}` },
];
const rt = (f) => f.val.toFixed(2);
const showF = (c, f) => `${c.sym}${f.val.toFixed(2).replace(/\.00$/, '')}`;

export default {
  id: 'decprob-exchange',
  topic: PTOPIC, type: 'Exchange rates', code: 'DP5',
  levels: ['Core', 'Additional'],
  search: 'exchange rate currency pounds euros dollars convert multiply divide decimals',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'to', label: 'pounds to another currency (multiply)', params: { k: 'to' }, levels: ['Core'] },
    { id: 'from', label: 'another currency to pounds (divide)', params: { k: 'from' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1), c = r.pick(CUR), rate = new F(Math.round(r.pick(c.rates) * 100), 100);
    const gbp = new F(r.pick([20, 25, 40, 50, 60, 80, 100, 120, 150, 200, 250])), fx = gbp.mul(rate);
    if (v.k === 'to') {
      return { parts: [{ body: `The exchange rate is £1 = ${c.sym}${rt(rate)}. ${n} changes £${gbp.n} into ${c.word}. How many ${c.word} does ${n} get?`, a: c.tex(fx.val.toFixed(2).replace(/\.00$/, '')), w: M(`${gbp.n} \\times ${ds(rate)} = ${ds(fx)}`), m: 3, lines: 6, chk: num(`${gbp.n}*${py(rate)}`, fx) }] };
    }
    return { parts: [{ body: `The exchange rate is £1 = ${c.sym}${rt(rate)}. ${n} has ${showF(c, fx)} left after a holiday and changes it back into pounds. How many pounds does ${n} get?`, a: `\\pounds ${gbp.n}`, w: M(`${ds(fx)} \\div ${ds(rate)} = ${gbp.n}`), ...mk(2, { meas: false }), m: 3, lines: 6, chk: num(`${py(fx)}/${py(rate)}`, gbp) }] };
  },
};
