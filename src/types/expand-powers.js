// Higher powers (up to 9) and very high powers (10 to 30) share these.
import { grp, result } from './expanding.js';
import { powersPair } from './factorise-powers.js';

export function powersExpand(r, v, lo, hi) {
  const [out, inner] = powersPair(r, v, lo, hi);
  return result(`${out.tex()}${grp(inner)}`, out.mul(inner), `\\text{multiply every term by } ${out.tex()}`);
}

export default {
  id: 'expand-powers',
  topic: 'Expanding brackets', type: 'Higher powers', code: 'EXP5',
  levels: ['Additional'],
  search: 'expand brackets powers indices higher powers multiply out',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'pure', label: 'one letter:  x⁷(x⁴ − 1)', params: { kind: 'pure' } },
    { id: 'num', label: 'number and power:  4x⁷(2x³ + 5)', params: { kind: 'num' } },
    { id: 'two', label: 'two letters:  3a²b(2ab³ − 5a)', params: { kind: 'two' } },
  ],
  generate(r, v) { return powersExpand(r, v, 2, 9); },
};
