import { TOPIC, M, F, dstr, names, mk, cnt } from './ratio.js';

const tu = (w) => ({ meas: true, txt: (v) => `${dstr(F.of(v))} ${w}`, tex: (v) => `${dstr(F.of(v))}\\text{ ${w}}` });
const JOBS = [
  ['builders', 'build a wall', 'days'], ['painters', 'paint a large fence', 'hours'], ['gardeners', 'tidy a park', 'days'], ['workers', 'unload a lorry', 'hours'], ['students', 'stuff envelopes for a mailing', 'minutes'],
];

export default {
  id: 'rp-inverse',
  topic: TOPIC, type: 'Inverse proportion', code: 'RP15',
  levels: ['Additional'],
  search: 'inverse proportion workers time speed journey taps pipes food lasts',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'workers', label: 'workers and time', params: { k: 'w' } },
    { id: 'speed', label: 'speed and journey time', params: { k: 's' } },
    { id: 'taps', label: 'taps or pumps filling a tank', params: { k: 't' } },
    { id: 'food', label: 'food that lasts for a number of animals', params: { k: 'f' } },
  ],
  generate(r, v) {
    const [nm] = names(r, 1);
    const pick = (totals) => r.until(() => {
      const total = r.pick(totals), divs = []; for (let d = 2; d <= 60; d++) if (total % d === 0) divs.push(d);
      const n1 = r.pick(divs), n2 = r.pick(divs);
      return n1 !== n2 && total / n1 >= 2 && total / n2 >= 1 ? [n1, total / n1, n2, total] : null;
    });
    if (v.k === 'w') {
      const [n1, t1, n2, total] = pick([24, 30, 36, 40, 48, 60, 72, 90, 120]), j = r.pick(JOBS), u = tu(j[2]);
      return { parts: [{ body: `${n1} ${j[0]} take ${t1} ${j[2]} to ${j[1]}. All the ${j[0]} work at the same rate. How long would it take ${n2} ${j[0]}?`, a: u.tex(total / n2), w: M(`${n1} \\times ${t1} = ${total};\\ ${total} \\div ${n2} = ${total / n2}`), ...mk(2, u), chk: { k: 'num', expr: `${n1}*${t1}/${n2}`, val: String(total / n2) } }] };
    }
    if (v.k === 's') {
      const [v1, t1, v2, D] = r.until(() => { const D = r.pick([60, 90, 120, 150, 180, 240, 300]); const sp = [20, 30, 40, 45, 50, 60, 75, 80, 90, 100].filter(x => D % x === 0); const a = r.pick(sp), b = r.pick(sp); return a !== b && 2 * D / b === Math.floor(2 * D / b) ? [a, D / a, b, D] : null; });
      const u = tu('hours');
      return { parts: [{ body: `${nm} drives to a seaside town at an average speed of ${v1} km/h. The journey takes ${dstr(new F(D, v1))} hours. How long would the journey take at an average speed of ${v2} km/h?`, a: u.tex(new F(D, v2)), w: M(`${v1} \\times ${dstr(new F(D, v1))} = ${D}\\text{ km};\\ ${D} \\div ${v2} = ${dstr(new F(D, v2))}`), ...mk(2, u), chk: { k: 'num', expr: `${D}/${v2}`, val: dstr(new F(D, v2)) } }] };
    }
    if (v.k === 't') {
      const [n1, t1, n2, total] = pick([24, 30, 36, 60, 72, 90, 120, 180]), u = tu('minutes');
      return { parts: [{ body: `${n1} identical taps fill a tank in ${t1} minutes. How long would ${n2} of these taps take to fill the same tank?`, a: u.tex(total / n2), w: M(`${n1} \\times ${t1} = ${total};\\ ${total} \\div ${n2} = ${total / n2}`), ...mk(2, u), chk: { k: 'num', expr: `${n1}*${t1}/${n2}`, val: String(total / n2) } }] };
    }
    const [n1, t1, n2, total] = pick([60, 72, 90, 120, 180, 240, 360]), u = tu('days');
    return { parts: [{ body: `A farmer has enough hay to feed ${n1} sheep for ${t1} days. How long would the same hay feed ${n2} sheep?`, a: u.tex(total / n2), w: M(`${n1} \\times ${t1} = ${total};\\ ${total} \\div ${n2} = ${total / n2}`), ...mk(2, u), chk: { k: 'num', expr: `${n1}*${t1}/${n2}`, val: String(total / n2) } }] };
  },
};
