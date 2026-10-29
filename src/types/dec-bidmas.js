import { TOPIC, F, rd, ds, py, M, num, dpOf } from './decimals.js';

const P1 = [2, 3, 4, 5, 6, 8, 12, 15, 25].map(x => new F(x, 10));
// each form returns [tex, python, working] from three values (and a square for roots)
const BASIC = [
  (a, b, c) => [`${ds(a)} + ${ds(b)} \\times ${ds(c)}`, `${py(a)}+${py(b)}*${py(c)}`, `${ds(b)} \\times ${ds(c)} = ${ds(b.mul(c))};\\ ${ds(a)} + ${ds(b.mul(c))} = ${ds(a.add(b.mul(c)))}`],
  (a, b, c) => [`${ds(a)} - ${ds(b)} \\times ${ds(c)}`, `${py(a)}-${py(b)}*${py(c)}`, `${ds(b)} \\times ${ds(c)} = ${ds(b.mul(c))};\\ ${ds(a)} - ${ds(b.mul(c))} = ${ds(a.sub(b.mul(c)))}`],
  (a, b, c) => [`${ds(a)} \\div ${ds(b)} + ${ds(c)}`, `${py(a)}/${py(b)}+${py(c)}`, `${ds(a)} \\div ${ds(b)} = ${ds(a.div(b))};\\ ${ds(a.div(b))} + ${ds(c)} = ${ds(a.div(b).add(c))}`],
  (a, b, c) => [`${ds(a)} + ${ds(b)} \\div ${ds(c)}`, `${py(a)}+${py(b)}/${py(c)}`, `${ds(b)} \\div ${ds(c)} = ${ds(b.div(c))};\\ ${ds(a)} + ${ds(b.div(c))} = ${ds(a.add(b.div(c)))}`],
  (a, b, c) => [`${ds(a)} \\times ${ds(b)} - ${ds(c)}`, `${py(a)}*${py(b)}-${py(c)}`, `${ds(a)} \\times ${ds(b)} = ${ds(a.mul(b))};\\ ${ds(a.mul(b))} - ${ds(c)} = ${ds(a.mul(b).sub(c))}`],
];
const BRACK = [
  (a, b, c) => [`(${ds(a)} + ${ds(b)}) \\times ${ds(c)}`, `(${py(a)}+${py(b)})*${py(c)}`, `${ds(a)} + ${ds(b)} = ${ds(a.add(b))};\\ ${ds(a.add(b))} \\times ${ds(c)} = ${ds(a.add(b).mul(c))}`],
  (a, b, c) => [`(${ds(a)} - ${ds(b)}) \\div ${ds(c)}`, `(${py(a)}-${py(b)})/${py(c)}`, `${ds(a)} - ${ds(b)} = ${ds(a.sub(b))};\\ ${ds(a.sub(b))} \\div ${ds(c)} = ${ds(a.sub(b).div(c))}`],
  (a, b, c) => [`${ds(a)} \\times (${ds(b)} + ${ds(c)})`, `${py(a)}*(${py(b)}+${py(c)})`, `${ds(b)} + ${ds(c)} = ${ds(b.add(c))};\\ ${ds(a)} \\times ${ds(b.add(c))} = ${ds(a.mul(b.add(c)))}`],
  (a, b, c) => [`${ds(a)} \\div (${ds(b)} + ${ds(c)})`, `${py(a)}/(${py(b)}+${py(c)})`, `${ds(b)} + ${ds(c)} = ${ds(b.add(c))};\\ ${ds(a)} \\div ${ds(b.add(c))} = ${ds(a.div(b.add(c)))}`],
];
const POW = [
  (a, b) => [`${ds(a)}^2 + ${ds(b)}`, `${py(a)}**2+${py(b)}`, `${ds(a)}^2 = ${ds(a.mul(a))};\\ ${ds(a.mul(a))} + ${ds(b)} = ${ds(a.mul(a).add(b))}`],
  (a, b) => [`${ds(b)} - ${ds(a)}^2`, `${py(b)}-${py(a)}**2`, `${ds(a)}^2 = ${ds(a.mul(a))};\\ ${ds(b)} - ${ds(a.mul(a))} = ${ds(b.sub(a.mul(a)))}`],
  (a, b) => [`(${ds(a)} + ${ds(b)})^2`, `(${py(a)}+${py(b)})**2`, `${ds(a)} + ${ds(b)} = ${ds(a.add(b))};\\ ${ds(a.add(b))}^2 = ${ds(a.add(b).mul(a.add(b)))}`],
  (a, b) => [`${ds(b)} \\times ${ds(a)}^2`, `${py(b)}*${py(a)}**2`, `${ds(a)}^2 = ${ds(a.mul(a))};\\ ${ds(b)} \\times ${ds(a.mul(a))} = ${ds(b.mul(a.mul(a)))}`],
  (a, b) => [`\\sqrt{${ds(a.mul(a))}} + ${ds(b)}`, `sqrt(${py(a.mul(a))})+${py(b)}`, `\\sqrt{${ds(a.mul(a))}} = ${ds(a)};\\ ${ds(a)} + ${ds(b)} = ${ds(a.add(b))}`],
];

export default {
  id: 'dec-bidmas',
  topic: TOPIC, type: 'Order of operations with decimals', code: 'DC17',
  levels: ['Additional'],
  search: 'BIDMAS order of operations decimals brackets powers roots',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'basic', label: 'four operations:  2.5 + 0.4 × 3', params: { set: BASIC, n: 3 } },
    { id: 'brackets', label: 'brackets:  (1.2 + 0.8) × 0.5', params: { set: BRACK, n: 3 } },
    { id: 'powers', label: 'powers and roots:  0.5² + 1.4', params: { set: POW, n: 2 } },
  ],
  generate(r, v) {
    const [tex, p, w, ans] = r.until(() => {
      const f = r.pick(v.set);
      const a = r.pick(r.chance(0.5) ? P1 : [new F(r.int(11, 49), 10), new F(r.int(1, 9), 100)]), b = r.pick(P1.concat([new F(r.int(11, 99), 10)])), c = r.pick(P1.concat([new F(r.int(2, 9))]));
      if (v.set === POW && (a.val > 1.6 || a.n % 10 === 0 && a.d === 100)) return null;
      try {
        const [tex, p, w] = f(a, b, c);
        // value by exact arithmetic: evaluate the working's final number
        const val = (() => { const m = w.split('= ').pop(); return m; })();
        const x = new F(Math.round(Number(val) * 10 ** 6), 10 ** 6);
        if (!(x.val > 0.05 && x.val < 100) || dpOf(x) > 3) return null;
        if (!Number.isFinite(Number(val))) return null;
        return [tex, p, w, x];
      } catch (e) { return null; }
    });
    return { parts: [{ body: `{{${tex}}}`, a: ds(ans), w: M(w), m: 2, lines: 4, chk: num(p, ans) }] };
  },
};
