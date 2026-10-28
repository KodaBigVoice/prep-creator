import { TOPIC, M, F, gcd, decStr, pct, terminates } from './fdp.js';

// a value shown as a fraction, a decimal or a percentage
function show(f, form) {
  if (form === 'frac') return f.tex();
  if (form === 'dec') return decStr(f);
  return pct(f);
}
const chkItem = (f, form) => (form === 'dec' ? decStr(f) : `${f.n}/${f.d}`);          // the value, whatever form it is shown in

export default {
  id: 'fdp-order',
  topic: TOPIC, type: 'Ordering fractions, decimals and percentages', code: 'FD6',
  levels: ['Core'],
  search: 'order compare fractions decimals percentages smallest largest FDP',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'three', label: 'three values:  3/5, 0.55, 62%', params: { n: 3, dens: [2, 4, 5, 10, 20, 25, 50], gap: 0.03, span: 0.4 } },
    { id: 'four', label: 'four values, closer together, with thirds or eighths', params: { n: 4, dens: [2, 3, 4, 5, 8, 10, 20, 40], gap: 0.003, span: 0.2 }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const items = r.until(() => {
      const centre = 0.2 + r.int(0, 60) / 100, xs = [];
      for (let i = 0; i < v.n; i++) {
        const form = r.pick(['frac', 'dec', 'perc']);
        let f;
        if (form === 'frac') { const d = r.pick(v.dens), k = Math.max(1, Math.min(d - 1, Math.round((centre + (r.int(-100, 100) / 100) * v.span / 2) * d))); if (gcd(k, d) !== 1) return null; f = new F(k, d); }
        else { const p = Math.round((centre + (r.int(-100, 100) / 100) * v.span / 2) * 100); if (p < 5 || p > 95) return null; f = new F(p, 100); }
        if (!terminates(f.d) && form !== 'frac') return null;
        xs.push({ f, form });
      }
      const vals = xs.map(x => x.f).sort((a, b) => a.cmp(b));
      for (let i = 1; i < vals.length; i++) if (vals[i].sub(vals[i - 1]).val < v.gap) return null;
      if (vals[vals.length - 1].sub(vals[0]).val > v.span) return null;
      if (new Set(xs.map(x => x.form)).size < 2) return null;
      if (v.n === 4 && !xs.some(x => !terminates(x.f.d))) return null;                 // the harder option needs a third or similar
      if (v.n === 3 && xs.some(x => !terminates(x.f.d))) return null;
      return xs;
    });
    const sorted = items.slice().sort((a, b) => a.f.cmp(b.f));
    const w = sorted.map(x => (terminates(x.f.d) ? decStr(x.f) : `${decStr3(x.f)}`)).join(' < ');
    return { parts: [{
      body: `Write these in order, starting with the smallest: {{${items.map(x => show(x.f, x.form)).join(',\\ ')}}}`,
      a: sorted.map(x => show(x.f, x.form)).join(',\\ '),
      w: M(w),
      chk: { k: 'order', items: items.map(x => chkItem(x.f, x.form)), dir: 'asc', n: items.length },
    }] };
  },
};
function decStr3(f) { return `${(f.val).toFixed(4).replace(/0+$/, '')}\\ldots`; }
