import { TOPIC, M, F, gcd, ratioOf, sumOf } from './ratio.js';

const CTX = [['red', 'blue', 'green', 'marbles', 'There are red, blue and green marbles in a jar.'], ['apples', 'pears', 'plums', 'pieces of fruit', 'A basket contains apples, pears and plums.'], ['Amy', 'Ben', 'Cal', 'stickers', '']];
export default {
  id: 'rp-combine',
  topic: TOPIC, type: 'Combining ratios', code: 'RP17',
  levels: ['Further'],
  search: 'combine ratios A:B B:C A:B:C common term',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'abc', label: 'A : B and B : C, find A : B : C', params: { k: 'abc' } },
    { id: 'total', label: 'as above, then share a total', params: { k: 'tot' } },
  ],
  generate(r, v) {
    const [p, q, s, t] = r.until(() => {
      const [p, q] = ratioOf(r, 2, { max: 7, maxSum: 11 }), [s, t] = ratioOf(r, 2, { max: 7, maxSum: 11 });
      return q !== s ? [p, q, s, t] : null;
    });
    const L = (q * s) / gcd(q, s), A = p * (L / q), B = L, C = t * (L / s), g = gcd(A, gcd(B, C)), res = [A / g, B / g, C / g];
    const c = r.pick(CTX), nm = c[0][0] === c[0][0].toUpperCase();
    const stem = nm
      ? `${c[0]}, ${c[1]} and ${c[2]} have some ${c[3]}. The ratio of ${c[0]}'s ${c[3]} to ${c[1]}'s ${c[3]} is ${p} : ${q}. The ratio of ${c[1]}'s ${c[3]} to ${c[2]}'s ${c[3]} is ${s} : ${t}.`
      : `${c[4]} The ratio of ${c[0]} to ${c[1]} is ${p} : ${q}. The ratio of ${c[1]} to ${c[2]} is ${s} : ${t}.`;
    const w1 = [`\\text{make the middle number } ${L}`, q !== L ? `${p} : ${q} = ${A} : ${B}` : '', s !== L ? `${s} : ${t} = ${B} : ${C}` : ''].filter(Boolean).join(';\\ ');
    const fin = g > 1 ? `${A} : ${B} : ${C} = ${res.join(' : ')}` : `${A} : ${B} : ${C}`;
    if (v.k === 'abc') {
      const q1 = (res[0] / res[1]).toFixed(12), q2 = (res[1] / res[2]).toFixed(12);
      return { parts: [{ body: `${stem} Write down the ratio ${c[0]} : ${c[1]} : ${c[2]}.`, a: res.join(' : '), w: M(`${w1};\\ ${fin}`), m: 3, lines: 5, chk: { k: 'num', expr: `[Fraction(${p},${q}),Fraction(${s},${t})]`, val: `${q1},${q2}` } }] };
    }
    const sum = sumOf(res), unit = r.int(2, 8), total = sum * unit, who = res[1] * unit;
    return { parts: [{ body: `${stem} There are ${total} ${c[3]} altogether. How many ${c[3]} ${nm ? `does ${c[1]} have` : `are ${c[1]}`}?`, a: String(who), w: M(`${w1};\\ ${fin};\\ ${total} \\div ${sum} = ${unit};\\ ${res[1]} \\times ${unit} = ${who}`), m: 4, lines: 7, chk: { k: 'num', expr: `${total}*lcm(${q},${s})/(${p}*lcm(${q},${s})/${q}+lcm(${q},${s})+${t}*lcm(${q},${s})/${s})`, val: String(who) } }] };
  },
};
