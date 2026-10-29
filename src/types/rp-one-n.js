import { TOPIC, M, F, gcd, dstr, names, ratioOf } from './ratio.js';

const MODELS = [['A model car is', 'The real car is', 'cm', 'm', 'long'], ['A model boat is', 'The real boat is', 'cm', 'm', 'long'], ['A toy plane has a wingspan of', 'The real plane has a wingspan of', 'cm', 'm', '']];

export default {
  id: 'rp-one-n',
  topic: TOPIC, type: 'Ratios in the form 1 : n and n : 1', code: 'RP6',
  levels: ['Additional'],
  search: 'ratio form 1 : n n : 1 unit ratio scale model',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'one-n', label: 'as 1 : n:  4 : 10', params: { k: 'a' } },
    { id: 'n-one', label: 'as n : 1:  5 : 2', params: { k: 'b' } },
    { id: 'model', label: 'a model and the real thing, as 1 : n', params: { k: 'm' } },
  ],
  generate(r, v) {
    if (v.k === 'm') {
      const [mA, rA, , , tail] = r.pick(MODELS);
      const k = r.pick([20, 25, 40, 50, 100, 200]), x = r.pick([6, 8, 10, 12, 15, 20, 30]);
      const real = x * k;                                               // in cm
      const realTxt = real % 100 === 0 ? `${real / 100} m` : `${dstr(new F(real, 100))} m`;
      if (real < 150) return this.generate(r, v);
      return { parts: [{ body: `${mA} ${x} cm ${tail}`.replace(/ +$/, '') + `. ${rA} ${realTxt}${tail ? ' ' + tail : ''}. Write the ratio of the model to the real one in the form 1 : n.`, a: `1 : ${k}`, w: M(`${realTxt.replace(' m', '')}\\text{ m} = ${real}\\text{ cm};\\ ${x} : ${real} = 1 : ${k}`), m: 2, lines: 4, chk: { k: 'num', expr: `Fraction(${real},${x})`, val: String(k) } }] };
    }
    const [a, b] = r.until(() => {
      const base = ratioOf(r, 2, { max: 9, maxSum: 15 }), g = r.int(2, 6);
      const x = base[0] * g, y = base[1] * g;
      const ok = (n) => [1, 2, 4, 5].includes(n.d);
      if (v.k === 'a') { if (x >= y) return null; return ok(new F(y, x)) ? [x, y] : null; }
      if (x <= y) return null; return ok(new F(x, y)) ? [x, y] : null;
    });
    const n = v.k === 'a' ? new F(b, a) : new F(a, b), nT = dstr(n);
    if (n.val > 20 || n.eq(1)) return this.generate(r, v);
    const ans = v.k === 'a' ? `1 : ${nT}` : `${nT} : 1`;
    const w = v.k === 'a' ? `${b} \\div ${a} = ${nT};\\ ${a} : ${b} = 1 : ${nT}` : `${a} \\div ${b} = ${nT};\\ ${a} : ${b} = ${nT} : 1`;
    return { parts: [{ body: `Write the ratio {{${a} : ${b}}} in the form ${v.k === 'a' ? '1 : n' : 'n : 1'}.`, a: ans, w: M(w), m: 2, lines: 3, chk: { k: 'num', expr: v.k === 'a' ? `Fraction(${b},${a})` : `Fraction(${a},${b})`, val: nT } }] };
  },
};
