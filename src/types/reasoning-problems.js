// Problem solving: reasoning problems. Original, parameterised; answers are re-derived by the independent checker (tests/verify.py, via `chk.expr`).
import { names } from '../core/q.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const tz = (x) => String(Math.round(x * 1e6) / 1e6);
const num = (v, extra = {}) => ({ k: 'num', val: String(v), ...extra });

const gens = {
  meanLeaves(r) {
    const n = r.int(9, 12), sport = r.pick(['hockey', 'netball', 'cricket', 'rugby', 'football']);
    const { m, c, rest } = r.until(() => {
      const m = r.int(20, 28), c = r.int(m + 4, m + 12), sum = n * m - c;
      return (2 * sum) % (n - 1) === 0 ? { m, c, rest: sum / (n - 1) } : null;
    });
    return { body: `The mean age of the ${n} players in a ${sport} squad is ${m} years. When the captain leaves, the mean age of the remaining ${n - 1} players is ${tz(rest)} years. How old is the captain?`, a: `${c}\\text{ years}`,
      w: `{{${n} \\times ${m} = ${n * m};\\ ${n - 1} \\times ${tz(rest)} = ${tz((n - 1) * rest)};\\ ${n * m} - ${tz((n - 1) * rest)} = ${c}}}`, m: 4,
      chk: num(c, { expr: `${n}*${m}-${n - 1}*Fraction('${tz(rest)}')` }) };
  },
  meanCombined(r) {
    const { a, b, x, y, M } = r.until(() => {
      const a = r.int(8, 16), b = r.int(8, 16), M = r.int(55, 75), x = r.int(40, 90), y = (M * (a + b) - a * x) / b;
      return Number.isInteger(y) && y >= 30 && y <= 100 && y !== x ? { a, b, x, y, M } : null;
    });
    return { body: `In a test, the ${a} girls in a class have a mean score of ${x}. The ${b} boys have a mean score of ${y}. What is the mean score of the whole class of ${a + b} pupils?`, a: String(M),
      w: `{{${a} \\times ${x} = ${a * x};\\ ${b} \\times ${y} = ${b * y};\\ (${a * x} + ${b * y}) \\div ${a + b} = ${M}}}`, m: 4,
      chk: num(M, { expr: `(${a}*${x}+${b}*${y})/(${a}+${b})` }) };
  },
  harmonic(r) {
    const [v1, v2] = r.pick([[30, 60], [20, 30], [40, 60], [60, 90], [30, 45], [20, 60], [40, 120], [45, 90], [24, 40], [60, 120], [12, 20], [15, 30], [10, 15], [50, 75]]);
    const D = lcm(v1, v2) * r.int(1, 2), t1 = D / v1, t2 = D / v2, avg = (2 * D) / (t1 + t2);
    const [who, how, u] = r.pick([['cyclist', 'rides', 'km/h'], ['coach', 'drives', 'mph'], ['car', 'travels', 'km/h']]);
    return { body: `The distance from Ashford to Bexley is ${D} ${u === 'mph' ? 'miles' : 'km'}. A ${who} ${how} from Ashford to Bexley at ${v1} ${u}, and then returns along the same road at ${v2} ${u}. What is the average speed for the whole journey?`, a: `${tz(avg)}\\text{ ${u}}`,
      w: `{{\\text{Time there: } ${D} \\div ${v1} = ${t1};\\ \\text{time back: } ${D} \\div ${v2} = ${t2};\\ \\text{total distance } ${2 * D}\\text{ in } ${t1 + t2}\\text{ hours;}\\ ${2 * D} \\div ${t1 + t2} = ${tz(avg)}}}`, m: 4,
      chk: num(tz(avg), { expr: `2*${D}/(${D}/${v1}+${D}/${v2})` }) };
  },
  upDown(r) {
    const p = r.pick([10, 20, 25, 30, 40, 50]), x = p * p / 100, thing = r.pick(['coat', 'bike', 'game', 'watch']);
    return { body: `The price of a ${thing} is increased by ${p}%. A week later the new price is reduced by ${p}%. Compared with the original price, is the final price higher or lower, and by what percentage?`, a: `${tz(x)}\\%\\text{ lower}`,
      w: `{{\\text{Multipliers: } ${tz(1 + p / 100)} \\text{ then } ${tz(1 - p / 100)}.\\ ${tz(1 + p / 100)} \\times ${tz(1 - p / 100)} = ${tz(1 - x / 100)}\\text{, which is } ${tz(x)}\\%\\text{ lower}}}`, m: 4,
      chk: num(tz(x), { expr: `100-100*(1+Fraction(${p},100))*(1-Fraction(${p},100))` }) };
  },
  backNumber(r) {
    const [who] = names(r, 1);
    const { x, a, b, c, d } = r.until(() => {
      const x = r.int(3, 20), a = r.int(2, 5), b = r.int(3, 12), c = r.int(2, 5), s = a * x + b;
      return s % c === 0 ? { x, a, b, c, d: s / c } : null;
    });
    return { body: `${who} thinks of a number. ${who} multiplies it by ${a}, adds ${b}, and then divides the result by ${c}. The answer is ${d}. What number did ${who} think of?`, a: String(x),
      w: `{{${d} \\times ${c} = ${d * c};\\ ${d * c} - ${b} = ${d * c - b};\\ ${d * c - b} \\div ${a} = ${x}}}`, m: 3, chk: num(x, { expr: `(${d}*${c}-${b})/${a}` }) };
  },
  venn(r) {
    const { N, a, b, c, both } = r.until(() => {
      const N = r.int(24, 36), c = r.int(2, 6), a = r.int(10, 22), b = r.int(10, 22), both = a + b - (N - c);
      return both >= 2 && both < Math.min(a, b) - 1 ? { N, a, b, c, both } : null;
    });
    return { body: `In a class of ${N} pupils, ${a} play football and ${b} play tennis. ${c} pupils play neither sport. How many pupils play both football and tennis?`, a: String(both),
      w: `{{${N} - ${c} = ${N - c}\\text{ pupils play at least one sport.}\\ ${a} + ${b} = ${a + b};\\ ${a + b} - ${N - c} = ${both}}}`, m: 4, chk: num(both, { expr: `${a}+${b}-(${N}-${c})` }) };
  },
  sumProduct(r) {
    const x = r.int(3, 15), y = r.int(x + 1, 20), S = x + y, P = x * y;
    return { body: `Two positive whole numbers have a sum of ${S} and a product of ${P}. What is the larger of the two numbers?`, a: String(y),
      w: `{{\\text{Try pairs that add to } ${S}\\text{ until the product is } ${P}:\\ ${x} + ${y} = ${S},\\ ${x} \\times ${y} = ${P}\\text{, so } ${y}}}`, m: 4,
      chk: num(y, { expr: `max([x for x in range(1,${S}) if x*(${S}-x)==${P}])` }) };
  },
  consecProduct(r) {
    const n = r.int(12, 60), P = n * (n + 1);
    return { body: `The product of two consecutive whole numbers is ${P}. What is the sum of the two numbers?`, a: String(2 * n + 1),
      w: `{{\\sqrt{${P}} \\approx ${Math.round(Math.sqrt(P) * 10) / 10},\\ \\text{so try } ${n} \\times ${n + 1} = ${P}.\\ ${n} + ${n + 1} = ${2 * n + 1}}}`, m: 4,
      chk: num(2 * n + 1, { expr: `[n for n in range(1,200) if n*(n+1)==${P}][0]*2+1` }) };
  },
  cutCorners(r) {
    const k = r.pick([1, 2, 4]);
    const L = r.int(12, 24), W = r.int(8, L - 2), s = r.int(2, Math.floor((W - 1) / 2));
    const where = k === 1 ? 'one corner' : k === 2 ? 'two opposite corners' : 'all four corners';
    const rect = L * 2 + W * 2;
    return { body: `A rectangle measures ${L} cm by ${W} cm. A square of side ${s} cm is cut from ${where}. What is the perimeter of the shape that is left?`, a: `${rect}\\text{ cm}`,
      w: `{{\\text{Cutting a square from a corner removes two lengths of } ${s}\\text{ cm from the outside edge but adds two new edges of } ${s}\\text{ cm, so the perimeter is unchanged.}\\ 2 \\times (${L} + ${W}) = ${rect}}}`, m: 3,
      chk: num(rect, { expr: `2*(${L}+${W})` }) };
  },
};
const LABELS = {
  meanLeaves: 'mean age when one person leaves', meanCombined: 'mean of two groups combined', harmonic: 'average speed there and back', upDown: 'a percentage increase then the same decrease',
  backNumber: 'I think of a number (work backwards)', venn: 'overlap of two groups', sumProduct: 'two numbers with a given sum and product', consecProduct: 'two consecutive numbers with a given product',
  cutCorners: 'perimeter after cutting corners',
};
const D = {
  backNumber: [4.8, ['Core']], cutCorners: [5.8, ['Core']], venn: [6.2, ['Core', 'Additional']], upDown: [6.8, ['Additional']], meanCombined: [7.0, ['Additional']],
  sumProduct: [7.3, ['Additional']], consecProduct: [7.5, ['Additional']], meanLeaves: [7.9, ['Additional']], harmonic: [8.4, ['Additional', 'Further']],
};
export default {
  id: 'reasoning-problems',
  topic: 'Problem solving', type: 'Reasoning problems', code: 'PS',
  levels: ['Core', 'Additional'],
  search: 'problem solving reasoning mean speed percentage venn consecutive challenge',
  verb: '', marks: 4, lines: 8,
  variants: Object.keys(gens).map(k => ({ id: k, label: LABELS[k], d: D[k][0], levels: D[k][1], params: { id: k } })),
  generate(r, v) { return { parts: [gens[v.id](r)] }; },
};
