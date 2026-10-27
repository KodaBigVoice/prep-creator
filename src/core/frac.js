// Exact fractions. Never use floating point for answers.
export const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
export const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

export class F {
  constructor(n, d = 1) {
    if (d === 0) throw new Error('zero denominator');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    this.n = n / g; this.d = d / g;
  }
  static of(x, d = 1) { return x instanceof F ? x : new F(x, d); }
  add(o) { o = F.of(o); return new F(this.n * o.d + o.n * this.d, this.d * o.d); }
  sub(o) { o = F.of(o); return new F(this.n * o.d - o.n * this.d, this.d * o.d); }
  mul(o) { o = F.of(o); return new F(this.n * o.n, this.d * o.d); }
  div(o) { o = F.of(o); return new F(this.n * o.d, this.d * o.n); }
  neg() { return new F(-this.n, this.d); }
  inv() { return new F(this.d, this.n); }
  pow(k) { let r = new F(1); for (let i = 0; i < Math.abs(k); i++) r = r.mul(this); return k < 0 ? r.inv() : r; }
  eq(o) { o = F.of(o); return this.n === o.n && this.d === o.d; }
  cmp(o) { o = F.of(o); return Math.sign(this.n * o.d - o.n * this.d); }
  lt(o) { return this.cmp(o) < 0; } gt(o) { return this.cmp(o) > 0; }
  get isInt() { return this.d === 1; }
  get isNeg() { return this.n < 0; }
  get isZero() { return this.n === 0; }
  get val() { return this.n / this.d; }
  abs() { return new F(Math.abs(this.n), this.d); }
  // 7/3 -> {w:2, n:1, d:3};  whole part carries the sign
  mixed() { const s = this.n < 0 ? -1 : 1; const a = Math.abs(this.n); return { s, w: Math.floor(a / this.d), n: a % this.d, d: this.d }; }
  // improper fraction in TeX
  tex() { return this.d === 1 ? String(this.n) : `${this.n < 0 ? '-' : ''}\\dfrac{${Math.abs(this.n)}}{${this.d}}`; }
  // mixed number in TeX (the default way answers are shown)
  mixedTex() {
    const m = this.mixed();
    if (m.n === 0) return String(m.s * m.w);
    const sign = m.s < 0 ? '-' : '';
    return `${sign}${m.w > 0 ? m.w : ''}\\dfrac{${m.n}}{${m.d}}`;
  }
  toString() { return `${this.n}/${this.d}`; }
}
export const frac = (n, d = 1) => new F(n, d);

// "2 3/4" style helpers
export function mixedFrom(w, n, d) { return new F(w * d + n, d); }
// Round to dp decimal places (half away from zero) and return a clean string
export function fixed(x, dp = 2) {
  const v = Number(x);
  const s = (Math.round((Math.abs(v) + Number.EPSILON) * 10 ** dp) / 10 ** dp).toFixed(dp);
  return (v < 0 && Number(s) !== 0 ? '-' : '') + s;
}
// number with thousands separator for tex, e.g. 12500 -> 12{,}500
export const texNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '{,}');
export const plainNum = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// decimals that are exact: trim trailing zeros
export const trim = (s) => String(s).includes('.') ? String(s).replace(/0+$/, '').replace(/\.$/, '') : String(s);
