import { TOPIC, F, rd, ds, py, M, mk, num, names, GBP, dpOf, RATE_CTX, pounds } from './decimals.js';

export default {
  id: 'dec-mult-hard',
  topic: TOPIC, type: 'Multiplying two decimals: harder', code: 'DC9',
  levels: ['Core', 'Additional'],
  search: 'multiply decimals by decimals harder two digit price per kilogram per metre',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'std', label: 'tenths with two digits:  1.6 × 2.5', params: { k: 'std' }, levels: ['Core'] },
    { id: 'twodp', label: 'tenths × hundredths:  2.4 × 0.35', params: { k: 'twodp' } },
    { id: 'small', label: 'hundredths × hundredths:  0.18 × 0.05', params: { k: 'small' }, levels: ['Additional'] },
    { id: 'ctx', label: 'in context: price per kilogram, metre or litre', params: { ctx: true } },
  ],
  generate(r, v) {
    if (v.ctx) {
      const c = r.pick(RATE_CTX), [n] = names(r, 1);
      const [p, w, ans] = r.until(() => {
        const p = new F(Math.round(r.pick(c.price) * 100), 100), w = new F(Math.round(r.pick(c.qty) * 100), 100), ans = p.mul(w);
        return 100 % ans.d === 0 && ans.val >= 1 && !(p.isInt && w.isInt) ? [p, w, ans] : null;
      });
      return { parts: [{ verb: '', body: c.q(n, pounds(p.val), c.u.txt(w)), a: GBP.tex(ans), w: M(`${ds(p)} \\times ${ds(w)} = ${ds(ans)}`), ...mk(2, GBP), chk: num(`${py(p)}*${py(w)}`, ans) }] };
    }
    const [a, b] = r.until(() => {
      const ok = (m) => m % 10 !== 0;
      let a, b;
      if (v.k === 'std') { const x = r.int(11, 99), y = r.int(11, 99); if (!ok(x) || !ok(y)) return null; a = new F(x, 10); b = new F(y, 10); }
      else if (v.k === 'twodp') { const x = r.int(11, 99), y = r.int(11, 99); if (!ok(x) || !ok(y)) return null; a = new F(x, 10); b = new F(y, 100); if (dpOf(a.mul(b)) > 2) return null; if (r.chance(0.5)) [a, b] = [b, a]; }
      else { const x = r.int(11, 99), y = r.int(2, 9); if (!ok(x)) return null; a = new F(x, 100); b = new F(y, 100); if (r.chance(0.5)) [a, b] = [b, a]; }
      if (a.val > 12 || b.val > 12 || a.eq(b)) return null;
      return [a, b];
    }, 20000);
    const ma = a.mul(10 ** dpOf(a)), mb = b.mul(10 ** dpOf(b)), ans = a.mul(b);
    return { parts: [{ body: `{{${ds(a)} \\times ${ds(b)}}}`, a: ds(ans), w: M(`${ds(ma)} \\times ${ds(mb)} = ${ds(ma.mul(mb))};\\ ${ds(a)} \\times ${ds(b)} = ${ds(ans)}`), m: v.k === 'small' ? 3 : 2, lines: v.k === 'small' ? 6 : 4, chk: num(`${py(a)}*${py(b)}`, ans) }] };
  },
};
