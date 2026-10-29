import { TOPIC, M, F, gcd, names, PAIRS, ratioOf, cnt } from './ratio.js';

export default {
  id: 'rp-difference',
  topic: TOPIC, type: 'Ratio with a given difference', code: 'RP10',
  levels: ['Core', 'Additional'],
  search: 'ratio difference more than find total shares',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'total', label: 'difference given, find the total', params: { k: 'total' }, levels: ['Core'] },
    { id: 'larger', label: 'difference given, find the larger quantity', params: { k: 'larger' }, levels: ['Core'] },
    { id: 'both', label: 'difference given, find both quantities', params: { k: 'both' } },
    { id: 'three', label: 'three-part ratio, difference between two parts', params: { k: 'three' }, levels: ['Additional'] },
  ],
  generate(r, v) {
    if (v.k === 'three') {
      const x = r.until(() => { const t = ratioOf(r, 3, { max: 8, maxSum: 16 }); return t; });
      const sorted = x.slice().sort((p, q) => q - p), unit = r.int(2, 9), [lo, hi] = [sorted[2], sorted[0]];
      const t = r.pick([['red', 'blue', 'green', 'counters', 'in a bag']]);
      const cols = ['red', 'blue', 'green'];
      const iHi = x.indexOf(hi), iLo = x.indexOf(lo), diff = (hi - lo) * unit, total = (x[0] + x[1] + x[2]) * unit;
      return { parts: [{ body: `The ratio of red, blue and green counters in a bag is ${x.join(' : ')}. There are ${diff} more ${cols[iHi]} counters than ${cols[iLo]} counters. How many counters are in the bag altogether?`, a: String(total), w: M(`${hi} - ${lo} = ${hi - lo};\\ ${diff} \\div ${hi - lo} = ${unit};\\ ${x.join(' + ')} = ${x[0] + x[1] + x[2]};\\ ${x[0] + x[1] + x[2]} \\times ${unit} = ${total}`), m: 3, lines: 6, chk: { k: 'num', expr: `${diff}/(${hi}-${lo})*(${x.join('+')})`, val: String(total) } }] };
    }
    const [a, b] = r.until(() => { const a = r.int(2, 9), b = r.int(1, 8); return a > b && gcd(a, b) === 1 ? [a, b] : null; });
    const unit = r.int(2, 12), p = r.pick(PAIRS), diff = (a - b) * unit;
    const stem = `The ratio of ${p[0]} to ${p[1]} ${p[3]} is ${a} : ${b}. There are ${diff} more ${p[0]} than ${p[1]}.`;
    const w1 = `${a} - ${b} = ${a - b};\\ ${diff} \\div ${a - b} = ${unit}`;
    if (v.k === 'total') return { parts: [{ body: `${stem} How many ${p[2]} are there altogether?`, a: String((a + b) * unit), w: M(`${w1};\\ (${a} + ${b}) \\times ${unit} = ${(a + b) * unit}`), m: 3, lines: 5, chk: { k: 'num', expr: `${diff}/(${a}-${b})*(${a}+${b})`, val: String((a + b) * unit) } }] };
    if (v.k === 'larger') return { parts: [{ body: `${stem} How many ${p[0]} are there?`, a: String(a * unit), w: M(`${w1};\\ ${a} \\times ${unit} = ${a * unit}`), m: 3, lines: 5, chk: { k: 'num', expr: `${diff}/(${a}-${b})*${a}`, val: String(a * unit) } }] };
    return { parts: [{ body: `${stem} Work out the number of ${p[0]} and the number of ${p[1]}.`, a: `\\text{${p[0]}: }${a * unit},\\ \\text{${p[1]}: }${b * unit}`, w: M(`${w1};\\ ${a} \\times ${unit} = ${a * unit},\\ ${b} \\times ${unit} = ${b * unit}`), m: 3, lines: 5, chk: { k: 'num', expr: `[${diff}/(${a}-${b})*${a},${diff}/(${a}-${b})*${b}]`, val: `${a * unit},${b * unit}` } }] };
  },
};
