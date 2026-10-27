import { gcd } from '../core/frac.js';
import { names } from '../core/q.js';

export default {
  id: 'ratio-difference',
  topic: 'Ratio', type: 'Ratio with a given difference', code: 'RDIF',
  levels: ['Core', 'Additional'],
  search: 'ratio difference more than one share given',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'total', label: 'difference given, find the total', params: { k: 'total' } },
    { id: 'other', label: 'one share given, find the other', params: { k: 'other' } },
  ],
  generate(r, v) {
    const [a, b] = r.until(() => { const a = r.int(2, 9), b = r.int(1, 8); return a > b && gcd(a, b) === 1 ? [a, b] : null; });
    const unit = r.int(2, 12);
    const ctxs = [['boys', 'girls', 'pupils', 'in a school club'], ['red', 'blue', 'counters', 'in a bag'], ['adults', 'children', 'people', 'at a theatre show'], ['cats', 'dogs', 'animals', 'at a rescue centre']];
    const [x, y, tot, where] = r.pick(ctxs);
    if (v.k === 'total') {
      const diff = (a - b) * unit;
      const body = `The ratio of ${x} to ${y} ${where} is ${a} : ${b}. There are ${diff} more ${x} than ${y}. How many ${tot} are there altogether?`;
      return { parts: [{ body, a: String((a + b) * unit), w: `{{${a} - ${b} = ${a - b};\\ ${diff} \\div ${a - b} = ${unit};\\ (${a} + ${b}) \\times ${unit} = ${(a + b) * unit}}}`, chk: { k: 'num', val: String((a + b) * unit), expr: `${diff}/(${a}-${b})*(${a}+${b})` } }] };
    }
    const body = `The ratio of ${x} to ${y} ${where} is ${a} : ${b}. There are ${a * unit} ${x}. How many ${y} are there?`;
    return { parts: [{ body, a: String(b * unit), w: `{{${a * unit} \\div ${a} = ${unit};\\ ${unit} \\times ${b} = ${b * unit}}}`, chk: { k: 'num', val: String(b * unit), expr: `${a * unit}/${a}*${b}` } }] };
  },
};
