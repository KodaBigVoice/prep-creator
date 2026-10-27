import { P } from '../core/poly.js';
import { F } from '../core/frac.js';

const mono = (c, vars) => P.mono(c, vars);
const body = (c, vars) => mono(c, vars).tex();

export default {
  id: 'indices-multiply',
  topic: 'Indices', type: 'Multiply terms with powers', code: 'IMUL',
  levels: ['Core', 'Additional'],
  search: 'index laws multiply powers simplify',
  verb: 'Simplify', marks: 2, lines: 3,
  variants: [
    { id: 'one', label: 'one letter', params: { letters: 1, negs: false } },
    { id: 'two', label: 'two letters', params: { letters: 2, negs: false } },
    { id: 'neg', label: 'two letters, negative coefficient', params: { letters: 2, negs: true } },
  ],
  generate(r, v) {
    const vs = v.letters === 1 ? [r.pick(['x', 'y', 'a', 'p'])] : r.pick([['a', 'b'], ['x', 'y'], ['m', 'n'], ['p', 'q']]);
    const make = () => {
      const o = {}; vs.forEach(l => { if (r.chance(0.85)) o[l] = r.int(1, 6); });
      if (!Object.keys(o).length) o[vs[0]] = r.int(2, 5);
      return o;
    };
    const [c1, c2, e1, e2] = r.until(() => {
      const c1 = r.int(2, 9) * (v.negs && r.chance(0.7) ? -1 : 1), c2 = r.int(2, 6), e1 = make(), e2 = make();
      const all = {}; vs.forEach(l => { all[l] = (e1[l] || 0) + (e2[l] || 0); });
      if (v.letters === 2 && (!Object.keys(e1).length || Object.keys(e1).length + Object.keys(e2).length < 3)) return null;
      return Object.values(all).every(x => x <= 12) ? [c1, c2, e1, e2] : null;
    });
    const all = {}; vs.forEach(l => { all[l] = (e1[l] || 0) + (e2[l] || 0); });
    const q1 = body(c1, e1), q2 = body(c2, e2);
    const q = `${q1} \\times ${c2 < 0 ? `(${q2})` : q2}`;
    const ans = mono(c1 * c2, all).tex();
    const w = `${c1} \\times ${c2} = ${c1 * c2};\\ ` + vs.filter(l => e1[l] || e2[l]).map(l => `${l}^{${e1[l] || 0}+${e2[l] || 0}}`).join(',\\ ');
    return { parts: [{ body: `{{${q}}}`, a: ans, w: `{{${w}}}`, chk: { k: 'equiv', q: q1 + ' * (' + q2 + ')', a: ans } }] };
  },
};
