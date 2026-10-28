import { TOPIC, M, F, gcd, dp, num, val } from './fdp.js';

export default {
  id: 'fdp-dec-to-frac',
  topic: TOPIC, type: 'Decimals to fractions', code: 'FD1',
  levels: ['Foundation', 'Core'],
  search: 'decimal to fraction convert tenths hundredths thousandths FDP',
  verb: '', marks: 1, lines: 2,
  variants: [
    { id: 'tenths', label: 'tenths:  0.7', params: { kind: 'tenths' } },
    { id: 'hundredths', label: 'hundredths:  0.35', params: { kind: 'hundredths' } },
    { id: 'zero', label: 'a zero after the point:  0.05', params: { kind: 'zero' } },
    { id: 'bigger', label: 'bigger than 1:  2.35', params: { kind: 'bigger' } },
    { id: 'thou', label: 'thousandths:  0.125, 0.035', params: { kind: 'thou' }, levels: ['Additional'] },
    { id: 'thoubig', label: 'thousandths, bigger than 1:  1.125', params: { kind: 'thoubig' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    let whole = 0, n, k;
    switch (v.kind) {
      case 'tenths': k = 1; n = r.int(1, 9); break;
      case 'hundredths': k = 2; n = r.pick(Array.from({ length: 89 }, (_, i) => i + 11).filter(x => x % 10)); break;
      case 'zero': k = 2; n = r.int(1, 9); break;
      case 'bigger': whole = r.int(1, 6); if (r.chance(0.4)) { k = 1; n = r.int(1, 9); } else { k = 2; n = r.pick(Array.from({ length: 99 }, (_, i) => i + 1).filter(x => x % 10)); } break;
      case 'thou': k = 3; n = r.pick(Array.from({ length: 999 }, (_, i) => i + 1).filter(x => x % 10 && gcd(x, 1000) > 1)); break;
      default: whole = r.int(1, 4); k = 3; n = r.pick(Array.from({ length: 999 }, (_, i) => i + 1).filter(x => x % 10 && gcd(x, 1000) > 1));
    }
    const part = new F(n, 10 ** k), f = part.add(whole), shown = `${whole}${dp(n, k).slice(1)}`;
    const w = whole
      ? `${shown} = ${whole}\\dfrac{${n}}{${10 ** k}} = ${f.mixedTex()}`
      : `${shown} = \\dfrac{${n}}{${10 ** k}}${part.d === 10 ** k ? '' : ` = ${part.tex()}`}`;
    return { parts: [{ body: `Write {{${shown}}} as ${whole ? 'a mixed number' : 'a fraction'}.`, a: f.mixedTex(), w: M(w), chk: num(`Fraction('${shown}')`, val(f)) }] };
  },
};
