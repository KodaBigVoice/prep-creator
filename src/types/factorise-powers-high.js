import { powersGenerate } from './factorise-powers.js';

export default {
  id: 'factorise-powers-high',
  topic: 'Factorising', type: 'Very high powers', code: 'FAC6',
  levels: ['Additional'],
  search: 'factorise fully common factor very high powers indices x^20 x^15',
  verb: 'Factorise fully', marks: 2, lines: 3,
  variants: [
    { id: 'pure', label: 'one letter:  x²⁰ + x¹⁵', params: { kind: 'pure' } },
    { id: 'num', label: 'number and power:  6x¹⁸ − 9x¹²', params: { kind: 'num' } },
    { id: 'two', label: 'two letters:  4a¹²b²⁰ + 6a¹⁰b¹⁵', params: { kind: 'two' } },
  ],
  generate(r, v) { return powersGenerate(r, v, 10, 30); },
};
