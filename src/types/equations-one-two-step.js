import { F } from '../core/frac.js';
import { P } from '../core/poly.js';
import { xAns } from './equations.js';

export default {
  id: 'equations-simple',
  topic: 'Linear equations', type: 'One- and two-step', code: 'EQ1',
  levels: ['Foundation', 'Core'],
  search: 'solve equation one step two step',
  verb: 'Solve', marks: 2, lines: 3,
  integer: true,
  variants: [
    { id: 'one', label: 'one-step', params: { steps: 1 } },
    { id: 'two', label: 'two-step', params: { steps: 2 } },
    { id: 'frac', label: 'x over a, plus b', params: { steps: 3 } },
  ],
  generate(r, v, fl) {
    const x0 = r.until(() => { const x = r.int(-9, 12); return x !== 0 ? x : null; });
    let eq, w;
    if (v.steps === 1) {
      const a = r.int(2, 9), b = r.int(2, 20);
      const kind = r.int(0, 2);
      if (kind === 0) { eq = `x + ${b} = ${x0 + b}`; w = `x = ${x0 + b} - ${b}`; }
      else if (kind === 1) { eq = `${a}x = ${a * x0}`; w = `x = ${a * x0} \\div ${a}`; }
      else { eq = `\\dfrac{x}{${a}} = ${x0}`; w = `x = ${x0} \\times ${a}`; return { parts: [{ body: `{{${eq}}}`, a: `x = ${x0 * a}`, w: `{{${w}}}`, chk: { k: 'solve', eq: `\\frac{x}{${a}} = ${x0}`, v: 'x' } }] }; }
    } else if (v.steps === 2) {
      const a = r.int(2, 9), b = r.int(1, 15) * r.sign();
      const rhs = a * x0 + b;
      eq = `${P.v('x', 1, a).add(P.c(b)).tex()} = ${rhs}`;
      w = `${a}x = ${rhs - b};\\ x = ${x0}`;
    } else {
      const a = r.int(2, 6), b = r.int(1, 12), c = x0 + b;
      eq = `\\dfrac{x}{${a}} + ${b} = ${x0 / 1 + b}`;
      // x/a + b = c -> x = a(c-b); choose x as multiple of a
      const xx = a * r.int(-6, 10) || a * 3; const cc = xx / a + b;
      eq = `\\dfrac{x}{${a}} + ${b} = ${cc}`;
      return { parts: [{ body: `{{${eq}}}`, a: `x = ${xx}`, w: `{{\\dfrac{x}{${a}} = ${cc - b};\\ x = ${xx}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
    }
    return { parts: [{ body: `{{${eq}}}`, a: `x = ${x0}`, w: `{{${w}}}`, chk: { k: 'solve', eq, v: 'x' } }] };
  },
};
