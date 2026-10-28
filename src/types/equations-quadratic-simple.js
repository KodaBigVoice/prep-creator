import { F } from '../core/frac.js';

// Equations like x² = 64 or 2x² + 3 = 53: no x term, so just square roots (answers come in pairs, ±).
// With "integer answers only" off, answers such as ±2½ appear (the x² coefficient is then a square number such as 4 or 9).
const sq = (a) => (a === 1 ? 'x^2' : `${a}x^2`);
const ans = (x0) => `x = \\pm ${x0.mixedTex()}`;
const sgn = (n) => (n < 0 ? '-' : '+');

export default {
  id: 'equations-quadratic-simple',
  topic: 'Equations', type: 'Simple quadratic equations (x² only)', code: 'EQQ',
  levels: ['Additional'],
  search: 'solve quadratic equation x squared square root plus or minus no linear term',
  verb: 'Solve', marks: 2, lines: 3,
  integer: true,
  variants: [
    { id: 'pure', label: 'x² = a', params: { kind: 'pure' } },
    { id: 'coef', label: 'ax² = b', params: { kind: 'coef' } },
    { id: 'const', label: 'x² ± a = b', params: { kind: 'const' } },
    { id: 'full', label: 'ax² ± b = c', params: { kind: 'full' } },
    { id: 'sub', label: 'a − bx² = c', params: { kind: 'sub' } },
  ],
  generate(r, v, fl) {
    // the positive root x0 (exact) and the coefficient a of x² that goes with it
    const root = () => {
      if (fl.integer) return { x0: new F(r.int(2, 10)), a: r.int(2, 6) };
      const m = r.pick([2, 3, 4]), k = r.until(() => { const k = r.int(1, 3 * m + 2); return k % m ? k : null; });
      return { x0: new F(k, m), a: m * m * (m === 4 ? 1 : r.int(1, 2)) };
    };
    const [eq, w, x0] = r.until(() => {
      if (v.kind === 'pure') {
        const x0 = new F(r.int(2, 18)), a = x0.n * x0.n;
        return [r.chance(0.7) ? `x^2 = ${a}` : `${a} = x^2`, `x = \\pm\\sqrt{${a}};\\ ${ans(x0)}`, x0];
      }
      if (v.kind === 'const') {
        const x0 = new F(r.int(2, 12)), a = r.int(1, 30) * r.sign(), b = x0.n * x0.n + a;
        return b > 0 ? [`x^2 ${sgn(a)} ${Math.abs(a)} = ${b}`, `x^2 = ${x0.n * x0.n};\\ ${ans(x0)}`, x0] : null;
      }
      const { x0, a } = root(), xx = x0.mul(x0), k = xx.mul(a);        // k = a x0², a whole number
      if (v.kind === 'coef') return [`${sq(a)} = ${k.n}`, `x^2 = ${xx.tex()};\\ ${ans(x0)}`, x0];
      if (v.kind === 'full') {
        const b = r.int(1, 25) * r.sign(), c = k.n + b;
        return c > 0 ? [`${sq(a)} ${sgn(b)} ${Math.abs(b)} = ${c}`, `${sq(a)} = ${k.n};\\ x^2 = ${xx.tex()};\\ ${ans(x0)}`, x0] : null;
      }
      const c = r.int(1, 20);                                          // sub:  b - a x² = c
      return [`${k.n + c} - ${sq(a)} = ${c}`, `${k.n} = ${sq(a)};\\ x^2 = ${xx.tex()};\\ ${ans(x0)}`, x0];
    });
    return { parts: [{ body: `{{${eq}}}`, a: ans(x0), w: `{{${w}}}`, chk: { k: 'solveall', eq, v: 'x', val: `${x0.n}/${x0.d}` } }] };
  },
};
