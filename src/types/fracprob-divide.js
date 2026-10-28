import { names, TOPIC, M, F, U, proper, gcd, num, fx } from './fracprob.js';
import { randMixed } from './fractions.js';

const CT = [
  { u: 'litres', w: 'jug', mk: (n, W, p) => `A jug holds ${W} litres of orange juice. ${n} pours the juice into glasses. Each glass holds ${p} litre. How many glasses can ${n} fill?`, wu: 'litres', pu: 'litre' },
  { mk: (n, W, p) => `A ribbon is ${W} m long. ${n} cuts it into pieces that are each ${p} m long. How many pieces does ${n} cut?` },
  { mk: (n, W, p) => `A bag contains ${W} kg of rice. ${n} puts the rice into small bags that each hold ${p} kg. How many small bags can ${n} fill?` },
  { mk: (n, W, p) => `A runner covers ${p} km on each lap of a track. How many laps does ${n} run to cover ${W} km?` },
];
const txt = (f) => (f.isInt ? String(f.n) : `{{${f.mixedTex()}}}`);

export default {
  id: 'fracprob-divide',
  topic: TOPIC, type: 'Dividing into fractional pieces', code: 'FP5',
  levels: ['Core', 'Additional'],
  search: 'how many fractions go into worded problem division pieces glasses',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'whole', label: 'whole number ÷ fraction:  how many 2/3-litre glasses from 6 litres?', params: { kind: 'whole' } },
    { id: 'frac', label: 'fraction ÷ fraction:  how many 1/8-litre cups from 3/4 litre?', params: { kind: 'frac' } },
    { id: 'mixed', label: 'mixed numbers:  how many 3/4 m pieces from 7 1/2 m?', params: { kind: 'mixed' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    let W, p, c;
    if (v.kind === 'whole') {
      [W, p, c] = r.until(() => {
        const p = proper(r, [3, 4, 5, 6, 8, 10], 2) || null, cnt = r.int(3, 14);
        if (!p || cnt % p.d) return null;
        const W = p.mul(cnt);
        return W.isInt && W.n >= 2 && W.n <= 14 ? [W, p, cnt] : null;
      });
    } else if (v.kind === 'frac') {
      [W, p, c] = r.until(() => {
        const e = r.pick([2, 3, 4, 5, 6]), W = proper(r, [e]), m = r.int(2, 4);
        if (!W || W.d !== e) return null;
        const d = e * m, n = r.chance(0.3) ? r.pick([2, 3]) : 1;
        if (gcd(n, d) !== 1 || d > 12) return null;
        const p = new F(n, d), cnt = W.div(p);
        return cnt.isInt && cnt.n >= 3 && cnt.n <= 16 ? [W, p, cnt.n] : null;
      });
    } else {
      [W, p, c] = r.until(() => {
        const p = r.chance(0.8) ? proper(r, [2, 3, 4, 5, 6, 8], 1) : randMixed(r, { wMin: 1, wMax: 1, dens: [2, 4] });
        const cnt = r.int(3, 12);
        if (!p) return null;
        const W = p.mul(cnt);
        return W.val > 1 && !W.isInt && W.val < 16 ? [W, p, cnt] : null;
      });
    }
    const pick = r.pick(v.kind === 'frac' ? [0, 1, 2] : v.kind === 'mixed' && p.val > 1 ? [1, 2, 3] : [0, 1, 2, 3]);
    let body = CT[pick].mk(n, txt(W), txt(p));
    if (v.kind === 'frac' && pick === 0) body = body.replace(/\{\{(.+?)\}\} litres/, '{{$1}} litre');
    return { parts: [{ body, a: String(c), w: M(`${W.mixedTex()} \\div ${p.mixedTex()} = ${W.tex()} \\times ${p.inv().tex()} = ${c}`), m: 3, lines: 4, chk: num(`${fx(W)}/${fx(p)}`, new F(c)) }] };
  },
};
