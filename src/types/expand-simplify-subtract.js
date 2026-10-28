import { P } from '../core/poly.js';
import { LETTERS } from './factorising.js';
import { grp, lin, prim, chain, result } from './expanding.js';

export default {
  id: 'expand-simplify-subtract',
  topic: 'Expanding brackets', type: 'Expand and simplify: subtracting a bracket', code: 'EXP4',
  levels: ['Core', 'Additional'],
  search: 'expand and simplify two brackets subtract minus negative bracket',
  verb: 'Expand and simplify', marks: 2, lines: 5,
  variants: [
    { id: 'lin', label: 'a(bx ± c) − d(ex ± f)', params: { kind: 'lin' } },
    { id: 'bare', label: 'a minus sign and no number:  4(x − 6) − (5x + 8)', params: { kind: 'bare' } },
    { id: 'two', label: 'two letters:  3x(2x + 4y) − 3y(x − 6y)', params: { kind: 'two' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [qtext, E1, E2, ans] = r.until(() => {
      const [l, m] = r.sample(LETTERS, 2).sort();
      let q, E1, E2, I1, I2;
      if (v.kind === 'two') {
        const o1 = P.mono(r.int(2, 5), { [l]: 1 }), o2 = P.mono(r.int(2, 5), { [m]: 1 });
        const i1 = lin(r.int(2, 6), l).add(P.mono(r.int(1, 5), { [m]: 1 })), i2 = lin(r.int(1, 4), l).add(P.mono(-r.int(2, 6), { [m]: 1 }));
        q = `${o1.tex()}${grp(i1)} - ${o2.tex()}${grp(i2)}`; E1 = i1.mul(o1); E2 = i2.mul(o2); I1 = i1; I2 = i2;
      } else {
        const i1 = lin(r.int(1, 5), l, r.int(1, 8) * r.sign()), i2 = lin(r.int(1, 5), l, r.int(1, 8) * r.sign());
        const k1 = r.int(2, 6), k2 = r.int(2, 6); I1 = i1; I2 = i2;
        if (v.kind === 'lin') { q = `${k1}${grp(i1)} - ${k2}${grp(i2)}`; E1 = i1.scale(k1); E2 = i2.scale(k2); }
        else if (r.chance(0.65)) { q = `${k1}${grp(i1)} - ${grp(i2)}`; E1 = i1.scale(k1); E2 = i2; }
        else { q = `${grp(i1)} - ${k2}${grp(i2)}`; E1 = i1; E2 = i2.scale(k2); }
      }
      const ans = E1.sub(E2);
      return Object.keys(ans.t).length >= 2 && prim(I1, I2) ? [q, E1, E2, ans] : null;
    });
    return result(qtext, ans, `${chain([E1, E2], [-1])} = ${ans.tex()}`);
  },
};
