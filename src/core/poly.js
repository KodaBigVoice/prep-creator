// Tiny polynomial algebra for expand / simplify / equations (exact fractions).
import { F } from './frac.js';

const keyOf = (m) => Object.keys(m).filter(v => m[v] > 0).sort().map(v => v + m[v]).join('');
const monoOf = (key) => { const m = {}; (key.match(/[a-z]\d+/g) || []).forEach(t => { m[t[0]] = Number(t.slice(1)); }); return m; };

export class P {
  constructor(terms = {}) { this.t = {}; for (const [k, c] of Object.entries(terms)) { const f = F.of(c); if (!f.isZero) this.t[k] = f; } }
  static c(x) { return new P({ '': F.of(x) }); }
  static v(name, power = 1, coef = 1) { return new P({ [name + power]: F.of(coef) }); }
  static mono(coef, vars = {}) { return new P({ [keyOf(vars)]: F.of(coef) }); }
  add(o) { const r = { ...this.t }; for (const [k, c] of Object.entries(o.t)) r[k] = r[k] ? r[k].add(c) : c; return new P(r); }
  neg() { const r = {}; for (const [k, c] of Object.entries(this.t)) r[k] = c.neg(); return new P(r); }
  sub(o) { return this.add(o.neg()); }
  scale(c) { const r = {}; for (const [k, v] of Object.entries(this.t)) r[k] = v.mul(c); return new P(r); }
  mul(o) {
    const r = {};
    for (const [k1, c1] of Object.entries(this.t)) for (const [k2, c2] of Object.entries(o.t)) {
      const m = monoOf(k1); const m2 = monoOf(k2);
      for (const v of Object.keys(m2)) m[v] = (m[v] || 0) + m2[v];
      const k = keyOf(m); r[k] = r[k] ? r[k].add(c1.mul(c2)) : c1.mul(c2);
    }
    return new P(r);
  }
  get isZero() { return Object.keys(this.t).length === 0; }
  coef(key = '') { return this.t[key] || new F(0); }
  // terms ordered: highest total degree first, then alphabetical
  terms() {
    const deg = (k) => Object.values(monoOf(k)).reduce((a, b) => a + b, 0);
    const cmp = (ka, kb) => {
      const a = monoOf(ka), b = monoOf(kb);
      const vars = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
      for (const v of vars) { const d = (b[v] || 0) - (a[v] || 0); if (d) return d; }
      return 0;
    };
    return Object.entries(this.t).sort((a, b) => deg(b[0]) - deg(a[0]) || cmp(a[0], b[0]));
  }
  tex() {
    const ts = this.terms();
    if (!ts.length) return '0';
    let out = '';
    ts.forEach(([k, c], i) => {
      const body = monoTex(k);
      const a = c.abs();
      let mag;
      if (body === '') mag = a.isInt ? String(a.n) : a.tex();
      else if (a.eq(1)) mag = body;
      else mag = (a.isInt ? String(a.n) : a.tex()) + body;
      if (i === 0) out += (c.isNeg ? '-' : '') + mag;
      else out += (c.isNeg ? ' - ' : ' + ') + mag;
    });
    return out;
  }
}
export function monoTex(key) {
  const m = monoOf(key);
  return Object.keys(m).sort().map(v => m[v] === 1 ? v : `${v}^{${m[v]}}`).join('');
}
// "ax + b" style helper for linear expressions in one variable
export function lin(a, b, v = 'x') {
  return P.v(v, 1, a).add(P.c(b)).tex();
}
// join signed numbers: 5 and -3 -> "5 - 3" handled via lin / P.tex(); here we wrap negatives in brackets
export const br = (n) => (n < 0 ? `(${n})` : String(n));

export const termTex = (c, key) => new P({ [key]: c }).tex();
