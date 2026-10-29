import { TOPIC, M, F, names, pounds, dstr, mk, numChk, GBP, shown } from './percentages.js';

const ITEMS = ['jacket', 'bicycle', 'games console', 'sofa', 'laptop', 'camera', 'guitar', 'tent'];
const PAIRS = [[20, 20], [10, 10], [50, 50], [25, 20], [10, 20], [20, 10], [30, 30], [40, 25], [20, 25], [15, 20]];

export default {
  id: 'pct-repeat',
  topic: TOPIC, type: 'Repeated change, up and then down', code: 'PC11',
  levels: ['Additional'],
  search: 'increase then decrease percentage not back to the start single multiplier overall percentage change',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'price', label: 'a price goes up then down:  value, then overall change', params: { k: 'price' }, multipart: true },
    { id: 'multiplier', label: 'a rise then a fall as a single multiplier', params: { k: 'mult' }, multipart: true },
  ],
  generate(r, v) {
    const [u, d] = r.pick(PAIRS), item = r.pick(ITEMS);
    const m1 = new F(100 + u, 100), m2 = new F(100 - d, 100), tot = m1.mul(m2);
    const overall = tot.sub(1).mul(100);                              // as a percentage, signed
    const neg = overall.isNeg ? '-' : '';
    const sign = overall.isZero ? 'none' : overall.isNeg ? 'decrease' : 'increase';
    const ovTex = overall.isZero ? '0\\%' : `${shown(overall.abs(), overall.isInt ? 0 : 1)}\\%\\text{ ${sign}}`;
    const ovW = overall.isZero ? `${dstr(tot)} = 1:\\ \\text{no change}` : `${dstr(tot)} = ${dstr(tot.mul(100))}\\%;\\ 100\\% ${overall.isNeg ? '-' : '+'} ${dstr(overall.abs())}\\% `;
    if (v.k === 'price') {
      const A = r.pick([100, 200, 250, 400, 500, 800, 1000]);
      const a1 = F.of(A).mul(m1), a2 = a1.mul(m2);
      return { stem: `The price of a ${item} is ${pounds(A)}. In January the price is increased by ${u}%. In February the new price is decreased by ${d}%.`, parts: [
        { body: `Work out the price of the ${item} after both changes.`, a: GBP.tex(a2), w: M(`${A} \\times ${dstr(m1)} = ${dstr(a1)};\\ ${dstr(a1)} \\times ${dstr(m2)} = ${dstr(a2)}`), ...mk(2, GBP), chk: numChk(`${A}*(100+${u})/100*(100-${d})/100`, a2) },
        { body: `Work out the overall percentage change in the price of the ${item}.`, a: ovTex, w: M(overall.isZero ? `${dstr(a2)} = ${A}:\\ \\text{no change}` : `${dstr(a2.sub(A).abs())};\\ \\dfrac{${dstr(a2.sub(A).abs())}}{${A}} \\times 100 = ${shown(overall.abs(), overall.isInt ? 0 : 1)}\\%`), m: 2, lines: 4, chk: numChk(`${neg}(${A}*(100+${u})/100*(100-${d})/100-${A})/${A}*100`, overall.abs()) },
      ] };
    }
    return { stem: `The value of a painting increases by ${u}% in one year. In the next year its value decreases by ${d}%.`, parts: [
      { body: `Write down the single decimal multiplier for the two changes together.`, a: dstr(tot), w: M(`${dstr(m1)} \\times ${dstr(m2)} = ${dstr(tot)}`), m: 2, lines: 3, chk: numChk(`(100+${u})/100*(100-${d})/100`, tot) },
      { body: `Work out the overall percentage change in the value of the painting.`, a: ovTex, w: M(ovW), m: 1, lines: 3, chk: numChk(`${neg}((100+${u})/100*(100-${d})/100-1)*100`, overall.abs()) },
    ] };
  },
};
