import { names } from '../core/q.js';

const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25], [11, 60, 61], [12, 35, 37], [16, 63, 65], [28, 45, 53]];
const fmt = (x) => String(Math.round(x * 100) / 100);
const r1 = (x) => (Math.round(x * 10 + 1e-9) / 10).toFixed(1);

export default {
  id: 'pythagoras',
  topic: 'Pythagoras', type: 'Pythagoras', code: 'PYTH',
  levels: ['Core', 'Additional'],
  search: 'Pythagoras right-angled triangle hypotenuse ladder diagonal',
  verb: '', marks: 3, lines: 5,
  integer: true,
  variants: [
    { id: 'hyp', label: 'find the hypotenuse', params: { kind: 'hyp' } },
    { id: 'short', label: 'find a shorter side', params: { kind: 'short' } },
    { id: 'ladder', label: 'worded: ladder against a wall', params: { kind: 'ladder' } },
    { id: 'diag', label: 'worded: diagonal of a rectangle', params: { kind: 'diag' } },
    { id: 'walk', label: 'worded: distance from start (two legs)', params: { kind: 'walk' } },
  ],
  generate(r, v, fl) {
    let a, b, c;
    const pickLegs = () => {
      if (fl.integer) {
        const t = r.pick(TRIPLES), s = r.pick([1, 1, 2, 3, 0.5, 0.1]);
        [a, b, c] = t.map(x => x * s);
        if (r.chance(0.5)) [a, b] = [b, a];
        return true;
      }
      a = r.int(3, 15); b = r.int(3, 15); if (a === b) return false;
      c = Math.sqrt(a * a + b * b);
      return !Number.isInteger(c) && Math.abs(c * 10 - Math.round(c * 10)) > 0.02 ? true : false;
    };
    r.until(() => pickLegs() && (v.kind !== 'ladder' || c <= 10) && (v.kind === 'ladder' || c >= 5));
    const nonInt = !fl.integer;
    const small = Math.min(a, b), big = Math.max(a, b);
    const u = (kind) => (kind === 'ladder' || kind === 'walk' ? (r.chance(0.5) ? 'm' : 'km') : 'cm');
    let body, ans, val, wk, unitStr = 'cm', find = 'hyp';
    const ask = nonInt ? ' Give your answer correct to 1 decimal place.' : '';
    const out = (x) => (nonInt ? r1(x) : fmt(x));
    if (v.kind === 'hyp') {
      body = `A right-angled triangle has shorter sides of length ${fmt(a)} cm and ${fmt(b)} cm. Calculate the length of the hypotenuse.${ask}`;
      val = c; wk = `${fmt(a)}^2 + ${fmt(b)}^2 = ${fmt(a * a + b * b)};\\ \\sqrt{${fmt(a * a + b * b)}} = ${out(c)}`;
    } else if (v.kind === 'short') {
      body = `A right-angled triangle has a hypotenuse of length ${fmt(c)} cm. One of the other sides has length ${fmt(small)} cm. Calculate the length of the third side.${ask}`;
      val = big; wk = `${fmt(c)}^2 - ${fmt(small)}^2 = ${fmt(c * c - small * small)};\\ \\sqrt{${fmt(c * c - small * small)}} = ${out(big)}`;
      if (nonInt) { const t = Math.sqrt(c * c - small * small); val = t; }
    } else if (v.kind === 'ladder') {
      const un = r.pick(['m']);
      body = `A ladder, ${fmt(c)} m long, leans against a vertical wall. The foot of the ladder is ${fmt(small)} m from the wall. How far up the wall does the ladder reach?${ask}`;
      val = big; wk = `${fmt(c)}^2 - ${fmt(small)}^2 = ${fmt(c * c - small * small)};\\ \\sqrt{${fmt(c * c - small * small)}} = ${out(big)}`;
      unitStr = 'm';
    } else if (v.kind === 'diag') {
      body = `A rectangular field has length ${fmt(big)} m and width ${fmt(small)} m. Calculate the length of a diagonal of the field.${ask}`;
      val = c; unitStr = 'm'; wk = `${fmt(big)}^2 + ${fmt(small)}^2 = ${fmt(a * a + b * b)};\\ \\sqrt{${fmt(a * a + b * b)}} = ${out(c)}`;
    } else {
      const [n1] = names(r, 1);
      body = `${n1} walks ${fmt(a)} km due north and then ${fmt(b)} km due east. How far is ${n1} from the starting point?${ask}`;
      val = c; unitStr = 'km'; wk = `${fmt(a)}^2 + ${fmt(b)}^2 = ${fmt(a * a + b * b)};\\ \\sqrt{${fmt(a * a + b * b)}} = ${out(c)}`;
    }
    const aa = `${out(val)}\\text{ ${unitStr}}`;
    return { parts: [{ body, a: aa, w: `{{${wk}}}`, calc: nonInt, chk: { k: 'num', val: out(val), dp: nonInt ? 1 : 2,
      expr: v.kind === 'short' || v.kind === 'ladder' ? `sqrt(${c * c}-${small * small})` : `sqrt(${a * a}+${b * b})` } }] };
  },
};
