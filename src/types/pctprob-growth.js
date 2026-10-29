import { PTOPIC, M, F, dstr, mk, numChk, rnd, tie, plainNum } from './percentages.js';

const UP = [
  { Ps: [2000, 4000, 5000, 8000, 12000, 20000, 50000], mk: (P, p, n) => `The population of a town is ${plainNum(P)}. It grows by ${p}% each year. Work out the population of the town after ${n} years.` },
  { Ps: [1000, 2000, 5000, 8000, 10000], mk: (P, p, n) => `A colony of bacteria contains ${plainNum(P)} bacteria. The number of bacteria increases by ${p}% every hour. Work out the number of bacteria after ${n} hours.` },
  { Ps: [800, 1000, 2000, 5000, 8000, 12000], mk: (P, p, n) => `A video channel has ${plainNum(P)} followers. The number of followers grows by ${p}% each month. Work out the number of followers after ${n} months.` },
  { Ps: [500, 800, 1000, 2000, 5000], mk: (P, p, n) => `A forest has ${plainNum(P)} trees. The number of trees increases by ${p}% each year. Work out the number of trees in the forest after ${n} years.` },
];
const DOWN = [
  { Ps: [1000, 2000, 5000, 8000, 12000, 20000], mk: (P, p, n) => `There are ${plainNum(P)} fish in a lake. The number of fish falls by ${p}% each year. Work out the number of fish in the lake after ${n} years.` },
  { Ps: [800, 1000, 2000, 5000, 8000], mk: (P, p, n) => `A village has a population of ${plainNum(P)}. The population falls by ${p}% each year. Work out the population of the village after ${n} years.` },
  { Ps: [400, 500, 600, 800], mk: (P, p, n) => `A school has ${plainNum(P)} pupils. The number of pupils falls by ${p}% each year. Work out the number of pupils at the school after ${n} years.` },
  { Ps: [2000, 5000, 8000, 10000, 20000], mk: (P, p, n) => `A rare species of bird has a population of ${plainNum(P)}. The population falls by ${p}% each year. Work out the population after ${n} years.` },
];

export default {
  id: 'pctprob-growth',
  topic: PTOPIC, type: 'Growth and decline over several years', code: 'PP10',
  levels: ['Additional'],
  search: 'population growth decay several years repeated percentage change multiplier power nearest whole number calculator',
  verb: '', marks: 3, lines: 5, calc: true,
  variants: [
    { id: 'grows', label: 'growth over several years, nearest whole number', params: { dir: 1 } },
    { id: 'falls', label: 'decline over several years, nearest whole number', params: { dir: -1 } },
  ],
  generate(r, v) {
    const [c, P, p, n] = r.until(() => {
      const c = r.pick(v.dir > 0 ? UP : DOWN), P = r.pick(c.Ps), p = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), n = r.int(3, 8);
      const f = F.of(P).mul(new F(100 + v.dir * p, 100).pow(n));
      return !tie(f, 0) && f.d > 1 ? [c, P, p, n] : null;
    });
    const f = F.of(P).mul(new F(100 + v.dir * p, 100).pow(n)), ans = rnd(f, 0);
    return { parts: [{ body: c.mk(P, p, n) + ' Give your answer to the nearest whole number.', a: String(ans.n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}'), w: M(`${plainNum(P).replace(/,/g, '{,}')} \\times ${dstr(new F(100 + v.dir * p, 100))}^{${n}} = ${(f.n / f.d).toFixed(2)}\\ldots`), calc: true, m: 3, lines: 5, chk: numChk(`${P}*(${100 + v.dir * p}/100)**${n}`, ans, { dp: 0 }) }] };
  },
};
