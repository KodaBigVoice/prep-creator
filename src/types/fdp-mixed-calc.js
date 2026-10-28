import { TOPIC, M, F, decStr, num, val, gcd } from './fdp.js';

const DECS = ['0.2', '0.25', '0.3', '0.4', '0.5', '0.6', '0.75', '0.15', '0.35', '0.05', '0.8', '1.5', '0.45'];
const FRACS = [[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [1, 8], [3, 8], [5, 8], [1, 10], [3, 10], [7, 10], [1, 20], [3, 20], [7, 20], [9, 20]];

export default {
  id: 'fdp-mixed-calc',
  topic: TOPIC, type: 'Calculations with fractions and decimals', code: 'FD8',
  levels: ['Additional'],
  search: 'add subtract multiply fractions and decimals together FDP mixed calculation',
  verb: 'Work out', marks: 2, lines: 4,
  variants: [
    { id: 'frac', label: 'add or subtract, answer as a fraction:  0.5 + 1/4', params: { kind: 'frac' } },
    { id: 'dec', label: 'add or subtract, answer as a decimal:  3/5 − 0.15', params: { kind: 'dec' } },
    { id: 'mult', label: 'multiply, answer as a fraction:  0.2 × 3/8', params: { kind: 'mult' } },
  ],
  generate(r, v) {
    const [D, fr, op, decFirst, res] = r.until(() => {
      const D = r.pick(DECS), [n, d] = r.pick(FRACS), fr = new F(n, d), dv = new F(Math.round(parseFloat(D) * 100), 100);
      const op = v.kind === 'mult' ? '\\times' : r.pick(['+', '-']), decFirst = r.chance(0.5);
      const a = decFirst ? dv : fr, b = decFirst ? fr : dv;
      const res = op === '+' ? a.add(b) : op === '-' ? a.sub(b) : a.mul(b);
      if (res.isNeg || res.isZero || res.isInt || (op === '+' && res.val > 3)) return null;
      if (v.kind === 'dec' && res.val > 3) return null;
      if (v.kind === 'mult' && (res.d > 200 || dv.isInt)) return null;
      return [D, fr, op, decFirst, res];
    });
    const q = decFirst ? `${D} ${op} ${fr.tex()}` : `${fr.tex()} ${op} ${D}`;
    const form = v.kind === 'dec' ? 'a decimal' : 'a fraction';
    const a = v.kind === 'dec' ? decStr(res) : res.mixedTex();
    const w = v.kind === 'dec' ? `${q} = ${decStr(res)}` : `${q} = ${res.tex()}${res.mixedTex() !== res.tex() ? ` = ${res.mixedTex()}` : ''}`;
    const dExpr = `Fraction('${D}')`, fExpr = `Fraction(${fr.n},${fr.d})`;
    const opPy = op === '\\times' ? '*' : op;
    const expr = decFirst ? `${dExpr}${opPy}${fExpr}` : `${fExpr}${opPy}${dExpr}`;
    return { parts: [{ body: `{{${q}}}. Give your answer as ${form}.`, a, w: M(w), chk: num(expr, v.kind === 'dec' ? decStr(res) : val(res)) }] };
  },
};
