import { F, gcd } from '../core/frac.js';
const ft = (n, d) => { const f = new F(n, d); return f.isInt ? String(f.n) : `\\dfrac{${f.n}}{${f.d}}`; };
export default {
  id: 'probability',
  topic: 'Probability', type: 'Probability', code: 'PROB',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'probability bag counters chance expected number',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'bag', label: 'counters in a bag (single event)', params: { k: 'bag' } },
    { id: 'bag-two', label: 'counters in a bag (event and not event)', params: { k: 'bag2' } },
    { id: 'expected', label: 'expected number of times', params: { k: 'exp' } },
  ],
  generate(r, v) {
    if (v.k === 'exp') {
      const [p, n] = r.until(() => { const p = r.pick([0.1, 0.2, 0.25, 0.3, 0.35, 0.4, 0.15, 0.6]); const n = r.pick([40, 50, 60, 80, 100, 120, 150, 200, 300]); return Number.isInteger(p * n) ? [p, n] : null; });
      const colour = r.pick(['blue', 'red', 'green', 'yellow']);
      return { parts: [{ body: `A biased spinner lands on ${colour} with probability ${p}. The spinner is spun ${n} times. Work out an estimate for the number of times it lands on ${colour}.`, a: String(p * n), w: `{{${p} \\times ${n} = ${p * n}}}`, chk: { k: 'num', val: String(Math.round(p * n)), expr: `${p}*${n}` } }] };
    }
    const colours = r.sample(['red', 'blue', 'green', 'yellow', 'white'], 3);
    const [a, b, c] = r.until(() => { const a = r.int(2, 9), b = r.int(2, 9), c = r.int(2, 8); const t = a + b + c; return t <= 24 && t >= 10 && gcd(a, t) > 1 ? [a, b, c] : null; });
    const t = a + b + c;
    const bag = `A bag contains ${a} ${colours[0]} counters, ${b} ${colours[1]} counters and ${c} ${colours[2]} counters.`;
    if (v.k === 'bag') {
      const pickC = r.int(0, 2); const cnt = [a, b, c][pickC];
      return { parts: [{ body: `${bag} A counter is taken at random. Write down the probability that it is ${colours[pickC]}.`, a: ft(cnt, t), w: `{{\\dfrac{${cnt}}{${t}}${new F(cnt, t).d !== t ? ' = ' + ft(cnt, t) : ''}}}`, chk: { k: 'num', val: `${new F(cnt, t)}`, expr: `Fraction(${cnt},${t})` } }] };
    }
    return { stem: `${bag} A counter is taken at random.`, parts: [
      { body: `Write down the probability that the counter is ${colours[0]}.`, a: ft(a, t), w: `{{\\dfrac{${a}}{${t}}${new F(a, t).d !== t ? ' = ' + ft(a, t) : ''}}}`, m: 1, lines: 2, chk: { k: 'num', val: `${new F(a, t)}`, expr: `Fraction(${a},${t})` } },
      { body: `Work out the probability that the counter is not ${colours[2]}.`, a: ft(a + b, t), w: `{{1 - \\dfrac{${c}}{${t}} = \\dfrac{${a + b}}{${t}}${new F(a + b, t).d !== t ? ' = ' + ft(a + b, t) : ''}}}`, m: 2, lines: 3, chk: { k: 'num', val: `${new F(a + b, t)}`, expr: `Fraction(${a + b},${t})` } },
    ] };
  },
};
