import { P } from '../core/poly.js';
import { gcd, lcm } from '../core/frac.js';

const eqTex = (a, b, c) => `${P.v('x', 1, a).add(P.v('y', 1, b)).tex()} &= ${c}`;
const isMultiple = (p, q) => Math.abs(p) % Math.abs(q) === 0 || Math.abs(q) % Math.abs(p) === 0;
// how to eliminate y from two equations whose y coefficients are b1 and b2
function plan(b1, b2) {
  const L = lcm(Math.abs(b1), Math.abs(b2)), m1 = L / Math.abs(b1), m2 = L / Math.abs(b2);
  return { m1, m2, op: Math.sign(b1) === Math.sign(b2) ? 'subtract' : 'add' };
}

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
    { id: 'both', label: 'multiply both equations first', params: { k: 'both' } },
  ],
  generate(r, v) {
    for (let t = 0; t < 4000; t++) {
      const x = r.int(-4, 7), y = r.int(-4, 7);
      if (!x || !y || x === y) continue;
      let a1, b1, a2, b2, how;
      if (v.k === 'sub') {
        a1 = r.int(2, 5); a2 = a1; b1 = r.int(1, 5) * r.sign(); b2 = r.int(-5, 5);
        if (!b2 || b1 === b2 || b1 === -b2) continue;
        how = '\\text{subtract the equations}';
      } else if (v.k === 'add') {
        b1 = r.int(2, 5) * r.sign(); b2 = -b1; a1 = r.int(1, 5); a2 = r.int(1, 5);
        if (a1 === a2) continue;
        how = '\\text{add the equations}';
      } else if (v.k === 'mul') {
        b1 = r.int(1, 4) * r.sign(); const k = r.int(2, 3) * r.sign(); b2 = b1 * k; a1 = r.int(1, 5); a2 = r.int(1, 6);
        if (a2 === k * a1 || a1 === a2) continue;
        const p = plan(b1, b2);
        how = `\\text{first equation} \\times ${p.m1};\\ \\text{${p.op}}`;
      } else {
        a1 = r.int(2, 7); a2 = r.int(2, 7); b1 = r.int(2, 7) * r.sign(); b2 = r.int(2, 7) * r.sign();
        if (isMultiple(a1, a2) || isMultiple(b1, b2)) continue;   // so that neither equation alone can be multiplied to match
        const p = plan(b1, b2);
        how = `\\text{first equation} \\times ${p.m1},\\ \\text{second equation} \\times ${p.m2};\\ \\text{${p.op}}`;
      }
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      if (Math.abs(c1) > 60 || Math.abs(c2) > 60 || c1 === 0 || c2 === 0) continue;
      const d = a1 * b2 - a2 * b1; if (d === 0) continue;
      if (gcd(gcd(a1, b1), c1) > 1 || gcd(gcd(a2, b2), c2) > 1) continue;
      const eq1 = eqTex(a1, b1, c1), eq2 = eqTex(a2, b2, c2);
      const body = `{{\\begin{aligned}${eq1}\\\\ ${eq2}\\end{aligned}}}`;
      return { parts: [{ body, a: `x = ${x},\\ y = ${y}`, w: `{{${how};\\ x = ${x},\\ y = ${y}}}`, chk: { k: 'simul', eqs: [[a1, b1, c1], [a2, b2, c2]], x, y } }] };
    }
    throw new Error('no simultaneous');
  },
};
