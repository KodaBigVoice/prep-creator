import { PTOPIC, M, F, mk, cnt } from './ratio.js';

const tu = (w) => ({ meas: true, tex: (n) => `${n}\\text{ ${w}}` });
const CTX = [
  { who: 'builders', what: 'bricks', verb: 'lay' }, { who: 'workers', what: 'boxes', verb: 'pack' }, { who: 'volunteers', what: 'sandbags', verb: 'fill' },
  { who: 'cooks', what: 'sandwiches', verb: 'make' }, { who: 'machines', what: 'bottles', verb: 'fill' }, { who: 'printers', what: 'posters', verb: 'print' },
];

export default {
  id: 'rpprob-hours',
  topic: PTOPIC, type: 'Human/work hours', code: 'RQ6',
  levels: ['Additional', 'Further'],
  search: 'human hours work hours worker hours people and time output rate two steps proportion',
  verb: '', marks: 4, lines: 7,
  variants: [
    { id: 'output', label: 'how much is done by a different number of workers in a different time', params: { k: 'o' } },
    { id: 'time', label: 'how long would a different number of workers take', params: { k: 't' } },
    { id: 'workers', label: 'how many workers are needed', params: { k: 'w' }, levels: ['Further'] },
  ],
  generate(r, v) {
    const c = r.pick(CTX);
    const [rate, m1, t1, m2, t2] = r.until(() => {
      const rate = r.int(2, 15), m1 = r.int(2, 8), t1 = r.int(2, 6), m2 = r.int(2, 10), t2 = r.int(2, 8);
      return (m2 !== m1 || t2 !== t1) && m1 * t1 !== m2 * t2 ? [rate, m1, t1, m2, t2] : null;
    });
    const W1 = rate * m1 * t1, W2 = rate * m2 * t2, h1 = m1 * t1, h2 = m2 * t2;
    const wk = `${m1} \\times ${t1} = ${h1}\\text{ worker-hours};\\ ${W1} \\div ${h1} = ${rate}\\text{ per worker-hour}`;
    const base = `${m1} ${c.who} ${c.verb} ${W1} ${c.what} in ${t1} hours. All the ${c.who} work at the same rate.`;
    if (v.k === 'o') return { parts: [{ body: `${base} How many ${c.what} can ${m2} ${c.who} ${c.verb} in ${t2} hours?`, a: cnt(c.what, c.what).tex(new F(W2)), w: M(`${wk};\\ ${m2} \\times ${t2} \\times ${rate} = ${W2}`), m: 4, lines: 7, chk: { k: 'num', expr: `${W1}/(${m1}*${t1})*${m2}*${t2}`, val: String(W2) } }] };
    if (v.k === 't') { const u = tu('hours'); return { parts: [{ body: `${base} How many hours would ${m2} ${c.who} take to ${c.verb} ${W2} ${c.what}?`, a: u.tex(t2), w: M(`${wk};\\ ${W2} \\div ${rate} = ${h2}\\text{ worker-hours};\\ ${h2} \\div ${m2} = ${t2}`), ...mk(3, u), chk: { k: 'num', expr: `${W2}/(${W1}/(${m1}*${t1}))/${m2}`, val: String(t2) } }] }; }
    return { parts: [{ body: `${base} How many ${c.who} are needed to ${c.verb} ${W2} ${c.what} in ${t2} hours?`, a: cnt(c.who, c.who).tex(new F(m2)), w: M(`${wk};\\ ${W2} \\div ${rate} = ${h2}\\text{ worker-hours};\\ ${h2} \\div ${t2} = ${m2}`), m: 4, lines: 7, chk: { k: 'num', expr: `${W2}/(${W1}/(${m1}*${t1}))/${t2}`, val: String(m2) } }] };
  },
};
