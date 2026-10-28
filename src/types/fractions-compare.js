import { F, lcm } from '../core/frac.js';
import { M, part, proper } from './fractions.js';

export default {
  id: 'fractions-compare',
  topic: 'Fractions', type: 'Comparing and ordering fractions', code: 'FCMP',
  levels: ['Foundation', 'Core'],
  search: 'compare order fractions larger smaller ascending descending',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'larger', label: 'which is larger (or smaller):  5/7 or 3/4', params: { kind: 'larger' } },
    { id: 'order', label: 'order three fractions, smallest first', params: { kind: 'order' } },
    { id: 'ordermix', label: 'order mixed numbers and improper fractions', params: { kind: 'ordermix' } },
  ],
  generate(r, v) {
    const dens = [2, 3, 4, 5, 6, 8, 9, 10, 12];
    if (v.kind === 'larger') {
      const [A, B] = r.until(() => {
        const a = proper(r, dens), b = proper(r, dens);
        return a && b && a.d !== b.d && lcm(a.d, b.d) <= 40 && !a.eq(b) && Math.abs(a.val - b.val) < 0.2 ? [a, b] : null;
      });
      const larger = r.chance(0.6), L = lcm(A.d, B.d);
      const win = (A.gt(B) === larger) ? A : B;
      const w = `\\dfrac{${A.n * (L / A.d)}}{${L}}\\text{ and }\\dfrac{${B.n * (L / B.d)}}{${L}}`;
      return { parts: [part(`Which is ${larger ? 'larger' : 'smaller'}, {{${A.tex()}}} or {{${B.tex()}}}?`, win.tex(), M(w),
        { k: 'order', items: [`${A.n}/${A.d}`, `${B.n}/${B.d}`], dir: larger ? 'desc' : 'asc', n: 1 })] };
    }
    const items = r.until(() => {
      let xs;
      if (v.kind === 'order') {
        const ds = r.sample(dens, 3);
        xs = ds.map(d => { const ks = []; for (let k = 1; k < d; k++) if (gcd2(k, d)) ks.push(k); return new F(r.pick(ks), d); });
      } else {
        xs = [];
        for (let i = 0; i < 4; i++) {
          const d = r.pick([2, 3, 4, 5, 6, 8]), w = r.int(1, 3), k = r.int(1, d - 1);
          xs.push({ f: new F(w * d + k, d), asMixed: r.chance(0.5) });
        }
        xs = xs.map(x => Object.assign(x.f, { _m: x.asMixed }));
      }
      const L = xs.reduce((l, x) => lcm(l, x.d), 1);
      const vals = new Set(xs.map(x => x.val));
      return vals.size === xs.length && L <= 48 && xs.every(x => x.d > 1 || v.kind === 'ordermix') && xs.every((x, i) => xs.every((y, j) => i === j || !x.eq(y))) ? xs : null;
    });
    const sorted = items.slice().sort((x, y) => x.cmp(y));
    const show = (f) => (v.kind === 'ordermix' ? (f._m ? f.mixedTex() : f.tex()) : f.tex());
    const L = items.reduce((l, x) => lcm(l, x.d), 1);
    const common = sorted.map(f => `\\dfrac{${f.n * (L / f.d)}}{${L}}`).join(',\\ ');
    const shownItems = items.map(show), shownAns = sorted.map(f => v.kind === 'ordermix' ? (items.find(x => x.eq(f))._m ? f.mixedTex() : f.tex()) : f.tex());
    const w = v.kind === 'ordermix'
      ? sorted.map(f => `\\dfrac{${f.n * (L / f.d)}}{${L}}`).join(' < ')
      : sorted.map(f => `\\dfrac{${f.n * (L / f.d)}}{${L}}`).join(' < ');
    return { parts: [part(`Write these in order, starting with the smallest: {{${shownItems.join(',\\ ')}}}`, shownAns.join(',\\ '), M(w),
      { k: 'order', items: items.map(f => `${f.n}/${f.d}`), dir: 'asc', n: items.length })] };
  },
};
function gcd2(a, b) { while (b) [a, b] = [b, a % b]; return a === 1; }
