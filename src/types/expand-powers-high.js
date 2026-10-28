import { powersExpand } from './expand-powers.js';

export default {
  id: 'expand-powers-high',
  topic: 'Expanding brackets', type: 'Very high powers', code: 'EXP6',
  levels: ['Additional'],
  search: 'expand brackets very high powers indices x^20 x^15 multiply out',
  verb: 'Expand', marks: 2, lines: 3,
  variants: [
    { id: 'pure', label: 'one letter:  x¹²(x⁸ + 3)', params: { kind: 'pure' } },
    { id: 'num', label: 'number and power:  6x²⁰(2x¹⁵ − 3)', params: { kind: 'num' } },
    { id: 'two', label: 'two letters:  4a¹²b²⁰(3a¹⁰ − b¹⁵)', params: { kind: 'two' } },
  ],
  generate(r, v) { return powersExpand(r, v, 10, 30); },
};
