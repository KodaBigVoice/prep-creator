import { TOPIC, M, F, an, names, pounds, rnd, tie, shown, numChk, GBP, cnt, KG, CM, MIN, MET, KM, G } from './percentages.js';

// contexts: [text for increase] and [text for decrease]; from -> to, with units written in
const INC = [
  { u: 'money', mk: (n, a, b) => `The price of a season ticket went up from ${a} to ${b}. Work out the percentage increase.` },
  { u: 'count', mk: (n, a, b) => `The number of members of a club rose from ${a} to ${b}. Work out the percentage increase.` },
  { u: 'count', mk: (n, a, b) => `The population of a village rose from ${a} to ${b}. Work out the percentage increase.` },
  { u: 'cm', mk: (n, a, b) => `A plant grew from a height of ${a} cm to a height of ${b} cm. Work out the percentage increase in its height.` },
  { u: 'kg', mk: (n, a, b) => `A puppy's mass increased from ${a} kg to ${b} kg in a month. Work out the percentage increase in its mass.` },
  { u: 'money', mk: (n, a, b) => `${n}'s monthly pay increased from ${a} to ${b}. Work out the percentage increase in ${n}'s pay.` },
];
const DEC = [
  { u: 'money', mk: (n, a, b) => `A phone costs ${a}. In a sale its price is reduced to ${b}. Work out the percentage reduction.` },
  { u: 'count', mk: (n, a, b) => `The number of pupils in a school fell from ${a} to ${b}. Work out the percentage decrease.` },
  { u: 'min', mk: (n, a, b) => `${n}'s time for a race fell from ${a} minutes to ${b} minutes. Work out the percentage decrease in ${n}'s time.` },
  { u: 'kg', mk: (n, a, b) => `A parcel had a mass of ${a} kg. After some items were removed, its mass was ${b} kg. Work out the percentage decrease in its mass.` },
  { u: 'litres', mk: (n, a, b) => `A tank held ${a} litres of water. Some water was used and ${b} litres were left. Work out the percentage decrease in the amount of water.` },
  { u: 'money', mk: (n, a, b) => `A train ticket cost ${a}. With a railcard it costs ${b}. Work out the percentage reduction.` },
];
const fmt = (u, x) => (u === 'money' ? pounds(x) : String(x));
const RESALE = [{ name: 'bike', max: 500 }, { name: 'games console', max: 300 }, { name: 'guitar', max: 400 }, { name: 'antique clock', max: 1500 }, { name: 'painting', max: 1500 }, { name: 'camera', max: 400 }, { name: 'laptop', max: 600 }, { name: 'skateboard', max: 100 }, { name: 'record player', max: 200 }];
const resale = (r, A, B) => r.pick(RESALE.filter(i => Math.max(A, B) <= i.max)).name;

export default {
  id: 'pct-find-change',
  topic: TOPIC, type: 'Percentage change, profit and loss', code: 'PC8',
  levels: ['Core'],
  search: 'percentage increase percentage decrease profit loss find the percentage change calculator 1 decimal place',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'inc', label: 'percentage increase', params: { k: 'inc' } },
    { id: 'dec', label: 'percentage decrease', params: { k: 'dec' } },
    { id: 'profit', label: 'percentage profit', params: { k: 'profit' } },
    { id: 'loss', label: 'percentage loss', params: { k: 'loss' } },
    { id: 'inc-calc', label: 'percentage increase, calculator, to 1 d.p.', params: { k: 'inc', calc: true }, levels: ['Core', 'Additional'] },
    { id: 'dec-calc', label: 'percentage decrease, calculator, to 1 d.p.', params: { k: 'dec', calc: true }, levels: ['Core', 'Additional'] },
    { id: 'profit-calc', label: 'percentage profit or loss, calculator, to 1 d.p.', params: { k: 'profit', calc: true, mix: true }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    const up = v.k === 'inc' || v.k === 'profit';
    const calc = !!v.calc;
    const pcs = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75];
    let A, B;
    if (calc) {
      [A, B] = r.until(() => {
        const A = r.int(20, 480), B = r.int(Math.round(A * 0.5), Math.round(A * 1.6));
        if (B === A || (!v.mix && up !== (B > A))) return null;
        const f = new F(Math.abs(B - A) * 100, A);
        return !tie(f, 1) && f.d > 10 ? [A, B] : null;
      });
    } else {
      [A, B] = r.until(() => {
        const A = r.pick([20, 40, 50, 60, 80, 120, 150, 200, 250, 400, 500, 800]), p = r.pick(pcs);
        const B = A * (up ? 100 + p : 100 - p) / 100;
        return Number.isInteger(B) ? [A, B] : null;
      });
    }
    const loss = v.k === 'profit' && B < A;
    const ch = Math.abs(B - A), f = new F(ch * 100, A), dp = calc ? 1 : 0;
    const sh = shown(f, dp);
    let text, kind;
    if (v.k === 'profit') {
      const item = resale(r, A, B), pre = r.pick(['second-hand ', '', 'used ']);
      if (!loss) text = `${n} buys ${an(pre + item)} for ${pounds(A)} and sells it for ${pounds(B)}. Work out ${n}'s percentage profit.`;
      else text = `${n} buys ${an(pre + item)} for ${pounds(A)} and sells it for ${pounds(B)}. Work out ${n}'s percentage loss.`;
    } else if (v.k === 'loss') {
      const item = resale(r, A, B);
      text = `${n} buys ${an(item)} for ${pounds(A)} and later sells it for ${pounds(B)}. Work out ${n}'s percentage loss.`;
    } else {
      const c = r.pick(v.k === 'inc' ? INC : DEC); text = c.mk(n, fmt(c.u, A), fmt(c.u, B));
    }
    if (calc) text += ' Give your answer correct to 1 decimal place.';
    const w = `${ch};\\ \\dfrac{${ch}}{${A}} \\times 100 = ${sh}\\%`;
    return { parts: [{ body: text, a: `${sh}\\%`, w: M(w), calc, chk: numChk(`(${B > A ? `${B}-${A}` : `${A}-${B}`})/${A}*100`, calc ? rnd(f, 1) : f, calc ? { dp: 1 } : {}) }] };
  },
};
