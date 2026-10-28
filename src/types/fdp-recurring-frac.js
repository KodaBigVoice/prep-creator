import { TOPIC, M, F, gcd, recur, dotTex, barTex } from './fdp.js';

const pow10 = (k) => 10 ** k;

export default {
  id: 'fdp-recurring-frac',
  topic: TOPIC, type: 'Recurring decimals to fractions', code: 'FD10',
  levels: ['Further'],
  search: 'recurring decimal to fraction dot notation bar FDP convert',
  verb: '', marks: 2, lines: 5,
  variants: [
    { id: 'one', label: 'one repeating digit:  0.3 (dot over the 3)', params: { kind: 'one', bar: false } },
    { id: 'two', label: 'two repeating digits:  0.12 (dots over the 1 and the 2)', params: { kind: 'two', bar: false } },
    { id: 'mixed', label: 'a digit before the repeat:  0.16 (dot over the 6)', params: { kind: 'mixed', bar: false }, marks: 3 },
    { id: 'bar', label: 'shown with a bar over the repeating digits (with a note giving the dot form)', params: { kind: 'two', bar: true } },
  ],
  generate(r, v) {
    let nr = '', rep;
    const draw = () => {
      nr = ''; rep = '';
      if (v.kind === 'one') rep = String(r.int(1, 8));
      else if (v.kind === 'two') rep = r.pick(Array.from({ length: 89 }, (_, i) => i + 10).filter(x => x % 11 !== 0)).toString();
      else { nr = String(r.int(1, 9)); if (r.chance(0.4)) nr += String(r.int(0, 9)); rep = String(r.int(1, 8)); }
      if (v.bar && r.chance(0.35)) { nr = String(r.int(1, 9)); rep = String(r.int(1, 8)); }       // a bar over one digit after a non-repeating digit
      return !(nr && rep.length === 1 && nr[nr.length - 1] === rep);                            // never 0.1\dot{1} and the like
    };
    while (!draw());
    const k = nr.length, m = rep.length;
    const A = parseInt(nr || '0', 10), B = parseInt((nr + rep) || '0', 10);
    // x = 0.nr rep rep rep ...
    const f = new F(B - A, pow10(k + m) - pow10(k));
    const q = { int: 0, nr, rep };
    const dot = dotTex(q), shown = v.bar ? barTex(q) : dot;
    const xl = `x = ${dot}`;
    const stepA = k ? `${pow10(k)}x = ${A}.${rep.length === 1 ? `\\dot{${rep}}` : `\\dot{${rep[0]}}${rep.slice(1, -1)}\\dot{${rep[rep.length - 1]}}`}` : null;
    const rest = (pre, mul) => `${mul}x = ${pre}.${m === 1 ? `\\dot{${rep}}` : `\\dot{${rep[0]}}${rep.slice(1, -1)}\\dot{${rep[m - 1]}}`}`;
    const stepB = rest(B, pow10(k + m));
    const diff = `${pow10(k + m) - pow10(k)}x = ${B - A}`;
    const w = [xl, k ? rest(A, pow10(k)) : null, stepB, diff, `x = \\dfrac{${B - A}}{${pow10(k + m) - pow10(k)}} = ${f.tex()}`].filter(Boolean).join(',\\ ');
    const note = v.bar ? ` ({{${barTex(q)}}} means {{${dot}}}.)` : '';
    return { parts: [{ body: `Write {{${shown}}} as a fraction.${note}`, a: f.tex(), w: M(w), m: v.kind === 'mixed' ? 3 : 2, lines: v.kind === 'mixed' ? 6 : 5, chk: { k: 'recur', dir: 'tofrac', frac: `${f.n}/${f.d}` } }] };
  },
};
