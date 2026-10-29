import { TOPIC, M, gcd } from './ratio.js';

// [small unit, large unit, how many small in one large, largest whole number of large units]
const FAM = {
  length: [['cm', 'm', 100, 6], ['mm', 'cm', 10, 30], ['m', 'km', 1000, 5]],
  mass: [['g', 'kg', 1000, 5]],
  volume: [['ml', 'litre', 1000, 4]],
  money: [['p', '£', 100, 9]],
  time: [['minutes', 'hours', 60, 5], ['seconds', 'minutes', 60, 5]],
};

export default {
  id: 'rp-simplify-units',
  topic: TOPIC, type: 'Simplifying ratios with units', code: 'RP4',
  levels: ['Core', 'Additional'],
  search: 'simplify ratio different units convert first cm m g kg minutes hours pence pounds',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'length', label: 'lengths:  40 cm : 1 m', params: { f: 'length' }, levels: ['Core'] },
    { id: 'mass', label: 'masses and volumes:  250 g : 2 kg', params: { f: 'mass' }, levels: ['Core'] },
    { id: 'money', label: 'money:  50p : £2', params: { f: 'money' }, levels: ['Core'] },
    { id: 'time', label: 'time:  45 minutes : 2 hours', params: { f: 'time' } },
  ],
  generate(r, v) {
    const fam = v.f === 'mass' ? r.pick([...FAM.mass, ...FAM.volume]) : r.pick(FAM[v.f]);
    const [sm, lg, k, big] = fam;
    const [x, y, X, Y, g] = r.until(() => {
      const y = r.int(1, big), x = r.int(2, k * 2);
      const Y = y * k, g = gcd(x, Y);
      if (g < 2 || x % k === 0 || Y / g > 20 || x / g > 20 || x / g === Y / g) return null;
      return [x, y, x, Y, g];
    });
    const first = r.chance(0.5);
    const unit = (n, u) => (u === '£' ? `£${n}` : u === 'p' ? `${n}p` : `${n} ${n === 1 ? (u.endsWith('s') ? u.slice(0, -1) : u) : (u === 'litre' ? 'litres' : u)}`);
    const qa = first ? `${unit(x, sm)} : ${unit(y, lg)}` : `${unit(y, lg)} : ${unit(x, sm)}`;
    const [A, B] = first ? [X / g, Y / g] : [Y / g, X / g];
    const conv = first ? `${x} : ${Y}` : `${Y} : ${x}`;
    return { parts: [{ body: `Simplify the ratio ${qa}.`, a: `${A} : ${B}`, w: M(`${conv} = ${A} : ${B}`), m: 2, lines: 3, chk: { k: 'num', expr: `[Fraction(${first ? x : Y},gcd(${x},${Y})),Fraction(${first ? Y : x},gcd(${x},${Y}))]`, val: `${A},${B}` } }] };
  },
};
