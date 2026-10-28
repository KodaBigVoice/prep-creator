import { P } from '../core/poly.js';
import { num } from './factorising.js';

const br = (c) => (c < 0 ? `x - ${-c}` : `x + ${c}`);
const ansOf = (roots) => (roots.length === 1 ? `x = ${roots[0]}` : roots.map(x => `x = ${x}`).join('\\text{ or }'));

export default {
  id: 'equations-quadratic-factorise',
  topic: 'Equations', type: 'Quadratics by factorising', code: 'EQQ2',
  levels: ['Additional'],
  search: 'solve quadratic equation by factorising roots x squared double brackets',
  verb: 'Solve', marks: 3, lines: 5,
  variants: [
    { id: 'common', label: 'common factor:  x² + 5x = 0', params: { kind: 'common' } },
    { id: 'trinomial', label: 'x² + bx + c = 0', params: { kind: 'trinomial' } },
    { id: 'rearrange', label: 'rearrange first:  x² = 5x + 14', params: { kind: 'rearrange' } },
  ],
  generate(r, v) {
    if (v.kind === 'common') {
      const b = r.int(2, 12) * r.sign(), k = r.chance(0.4) ? r.int(2, 5) : 1;
      const eq = P.v('x', 2, k).add(P.v('x', 1, k * b)).tex() + ' = 0';
      const roots = [Math.min(0, -b), Math.max(0, -b)];
      return done(eq, `${k === 1 ? '' : k}x(x ${b < 0 ? '-' : '+'} ${Math.abs(b)}) = 0;\\ ${ansOf(roots)}`, roots);
    }
    const [p, q] = r.until(() => {
      const p = r.int(-9, 9), q = r.int(-9, 9);
      return p && q && p < q && p + q !== 0 ? [p, q] : null;
    });
    const fac = `(${br(p)})(${br(q)}) = 0`, roots = [-q, -p].sort((a, b) => a - b);
    if (v.kind === 'trinomial') {
      const eq = P.v('x', 2).add(P.v('x', 1, p + q)).add(P.c(p * q)).tex() + ' = 0';
      return done(eq, `${fac};\\ ${ansOf(roots)}`, roots);
    }
    // x² = bx + c  (written either way round)
    const b = -(p + q), c = -(p * q);          // x² - ... : x² + (p+q)x + pq = 0  ->  x² = -(p+q)x - pq
    const rhs = P.v('x', 1, b).add(P.c(c)).tex();
    const eq = `x^2 = ${rhs}`;
    return done(eq, `x^2 ${(p + q) < 0 ? '-' : '+'} ${Math.abs(p + q) === 1 ? '' : Math.abs(p + q)}x ${p * q < 0 ? '-' : '+'} ${Math.abs(p * q)} = 0;\\ ${fac};\\ ${ansOf(roots)}`, roots);

  },
};
function done(eq, w, roots) {
  return { parts: [{ body: `{{${eq}}}`, a: ansOf(roots), w: `{{${w}}}`, chk: { k: 'solveset', eq, v: 'x', vals: roots } }] };
}
