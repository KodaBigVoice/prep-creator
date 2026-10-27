import { P } from '../core/poly.js';
import { F, gcd } from '../core/frac.js';

const vtex = (e) => Object.keys(e).sort().filter(k => e[k] > 0).map(k => (e[k] === 1 ? k : `${k}^{${e[k]}}`)).join('');
export default {
  id: 'indices-divide',
  topic: 'Indices', type: 'Divide terms with powers', code: 'IDIV',
  levels: ['Core', 'Additional'],
  search: 'index laws divide powers simplify fraction form',
  verb: 'Simplify', marks: 2, lines: 3,
  variants: [
    { id: 'frac', label: 'fraction form (two letters)', params: { frac: true } },
    { id: 'div', label: 'written with ÷ (one letter)', params: { frac: false } },
  ],
  generate(r, v) {
    const vs = v.frac ? r.pick([['x', 'y'], ['a', 'b'], ['m', 'n']]) : [r.pick(['x', 'y', 'a', 'p'])];
    const [cn, cd, en, ed] = r.until(() => {
      const g = r.int(1, 4);
      const cn = g * r.int(2, 6), cd = g * r.int(2, 6);
      const en = {}, ed = {};
      vs.forEach((l, i) => { const e = r.int(2, 7); const f = r.int(0, Math.min(e, 4)); en[l] = e; ed[l] = f; });
      if (cn === cd) return null;
      if (v.frac && !vs.some(l => ed[l] > 0)) return null;
      // at least one letter must reduce to a positive power
      if (!vs.some(l => en[l] - ed[l] > 0)) return null;
      return [cn, cd, en, ed];
    });
    const res = new F(cn, cd);
    const out = {}; vs.forEach(l => { out[l] = en[l] - ed[l]; });
    const num = (res.n === 1 ? '' : res.n) + vtex(out) || '1';
    const numeral = (res.n === 1 && !vtex(out)) ? '1' : (res.n === 1 ? vtex(out) : `${res.n}${vtex(out)}`);
    const ans = res.d === 1 ? numeral : `\\dfrac{${numeral}}{${res.d}}`;
    const top = `${cn}${vtex(en)}`, bot = `${cd}${vtex(ed)}`;
    const q = v.frac ? `\\dfrac{${top}}{${bot}}` : `${top} \\div ${bot}`;
    const w = `\\dfrac{${cn}}{${cd}} = ${res.tex()};\\ ` + vs.filter(l => en[l]).map(l => `${l}^{${en[l]}-${ed[l]}}`).join(',\\ ');
    const qExpr = `(${cn}*${vs.map(l => `${l}**${en[l]}`).join('*')})/(${cd}*${vs.map(l => `${l}**${ed[l]}`).join('*')})`;
    const aExpr = `(${res.n}*${vs.map(l => `${l}**${out[l]}`).join('*')})/${res.d}`;
    return { parts: [{ body: `{{${q}}}`, a: ans, w: `{{${w}}}`, chk: { k: 'py', q: qExpr, a: aExpr } }] };
  },
};
