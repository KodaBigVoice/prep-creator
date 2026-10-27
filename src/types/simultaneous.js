import { P } from '../core/poly.js';
import { gcd } from '../core/frac.js';
const eqTex = (a, b, c) => `${P.v('x', 1, a).add(P.v('y', 1, b)).tex()} &= ${c}`;
export default {
  id: 'simultaneous',
  topic: 'Equations', type: 'Simultaneous equations', code: 'SIM',
  levels: ['Additional'],
  search: 'simultaneous equations elimination solve',
  verb: 'Solve the simultaneous equations', marks: 3, lines: 8,
  variants: [
    { id: 'same-x', label: 'subtract (same x coefficient)', params: { k: 'sub' } },
    { id: 'opp-y', label: 'add (opposite y coefficients)', params: { k: 'add' } },
    { id: 'multiply', label: 'multiply one equation first', params: { k: 'mul' } },
  ],
  generate(r, v) {
    for (let t = 0; t < 2000; t++) {
      const x = r.int(-4, 7), y = r.int(-4, 7);
      if (!x || !y || x === y) continue;
      let a1, b1, a2, b2;
      if (v.k === 'sub') { a1 = r.int(2, 5); a2 = a1; b1 = r.int(1, 5); b2 = r.int(-5, 5); if (!b2 || b1 === b2) continue; }
      else if (v.k === 'add') { b1 = r.int(2, 5); b2 = -b1; a1 = r.int(1, 5); a2 = r.int(1, 5); if (a1 === a2) continue; }
      else { b1 = r.int(1, 4); const k = r.int(2, 3); b2 = b1 * k; a1 = r.int(1, 5); a2 = r.int(1, 6); if (a2 === k * a1) continue; }
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      if (Math.abs(c1) > 40 || Math.abs(c2) > 40 || c1 === 0 || c2 === 0) continue;
      const d = a1 * b2 - a2 * b1; if (d === 0) continue;
      if (gcd(gcd(a1, b1), c1) > 1 || gcd(gcd(a2, b2), c2) > 1) continue;
      const eq1 = eqTex(a1, b1, c1), eq2 = eqTex(a2, b2, c2);
      const body = `{{\\begin{aligned}${eq1}\\\\ ${eq2}\\end{aligned}}}`;
      const how = v.k === 'sub' ? 'subtract the equations' : v.k === 'add' ? 'add the equations' : 'multiply the first equation to match a coefficient';
      return { parts: [{ body, a: `x = ${x},\\ y = ${y}`, w: `{{\\text{${how}};\\ x = ${x},\\ y = ${y}}}`, chk: { k: 'simul', eqs: [[a1, b1, c1], [a2, b2, c2]], x, y } }] };
    }
    throw new Error('no simultaneous');
  },
};
