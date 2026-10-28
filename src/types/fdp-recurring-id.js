import { TOPIC, M, F, gcd, decStr, recur, dotTex, terminates, num, val } from './fdp.js';

const TERM = [8, 16, 20, 25, 40, 50, 80];
const REC1 = [3, 6, 9, 12, 15, 18, 30];            // one repeating digit
const REC2 = [11, 22, 33, 44, 55, 66];             // two repeating digits
const REC = [3, 6, 7, 9, 11, 12, 14, 15, 18, 21, 22, 24, 30];

const frac = (r, dens) => { const d = r.pick(dens), ks = []; for (let k = 1; k < d; k++) if (gcd(k, d) === 1) ks.push(k); return ks.length ? new F(r.pick(ks), d) : null; };

export default {
  id: 'fdp-recurring-id',
  topic: TOPIC, type: 'Terminating or recurring?', code: 'FD9',
  levels: ['Additional'],
  search: 'recurring decimal terminating dot notation fraction FDP',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'which2', label: 'which of two fractions is a recurring decimal:  7/20 or 7/30', params: { kind: 'which2' } },
    { id: 'which4', label: 'which of four fractions give recurring decimals', params: { kind: 'which4' } },
    { id: 'dec1', label: 'write as a recurring decimal, one repeating digit:  5/12', params: { kind: 'dec', dens: REC1 } },
    { id: 'dec2', label: 'write as a recurring decimal, two repeating digits:  3/11', params: { kind: 'dec', dens: REC2 } },
  ],
  generate(r, v) {
    if (v.kind === 'which2') {
      const [A, B] = r.until(() => { const a = frac(r, TERM.concat([10])), b = frac(r, REC); return a && b && a.d > 4 ? [a, b] : null; });
      const swap = r.chance(0.5), [x, y] = swap ? [B, A] : [A, B];
      return { parts: [{ body: `Which of these fractions is a recurring decimal? {{${x.tex()}}} or {{${y.tex()}}}`, a: B.tex(), w: M(`${A.tex()} = ${decStr(A)},\\ \\ ${B.tex()} = ${recur(B).int}.${recur(B).nr}${recur(B).rep.repeat(2)}\\ldots`), chk: { k: 'recurpick', items: [`${x.n}/${x.d}`, `${y.n}/${y.d}`], ans: [`${B.n}/${B.d}`] } }] };
    }
    if (v.kind === 'which4') {
      const items = r.until(() => {
        const k = r.int(1, 3), xs = [];
        while (xs.length < 4) { const f = frac(r, xs.length < k ? REC : TERM.concat([10, 4, 5])); if (!f || f.d < 4 || xs.some(x => x.eq(f))) return null; xs.push(f); }
        return xs;
      });
      const order = r.shuffle(items), recurring = order.filter(f => !terminates(f.d));
      return { parts: [{ body: `Write down the fractions that give recurring decimals: {{${order.map(f => f.tex()).join(',\\ ')}}}`, a: recurring.map(f => f.tex()).join(',\\ '), w: M(order.map(f => `${f.tex()}\\ ${terminates(f.d) ? '\\text{terminates}' : '\\text{recurs}'}`).join(',\\ ')), chk: { k: 'recurpick', items: order.map(f => `${f.n}/${f.d}`), ans: recurring.map(f => `${f.n}/${f.d}`) } }] };
    }
    const f = r.until(() => { const g = frac(r, v.dens); if (!g) return null; const q = recur(g); return q.rep.length === (v.dens === REC1 ? 1 : 2) ? g : null; });
    const q = recur(f), digits = (q.nr + q.rep.repeat(3)).slice(0, 6);
    return { parts: [{ body: `Write {{${f.tex()}}} as a recurring decimal.`, a: dotTex(q), w: M(`${f.n} \\div ${f.d} = ${q.int}.${q.nr}${q.rep.repeat(3).slice(0, 5 - q.nr.length)}\\ldots = ${dotTex(q)}`), chk: { k: 'recur', dir: 'todec', frac: `${f.n}/${f.d}` } }] };
  },
};
