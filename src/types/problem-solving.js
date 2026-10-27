import { F, lcm } from '../core/frac.js';
import { names } from '../core/q.js';

const frac = (n, d) => new F(n, d).tex();
const gens = {
  consecutive(r) {
    const kind = r.pick([['odd', 2, 1], ['even', 2, 0], ['integers', 1, null]]);
    const cnt = r.pick([3, 4, 5]);
    const step = kind[1];
    const start = kind[0] === 'odd' ? 2 * r.int(5, 40) + 1 : kind[0] === 'even' ? 2 * r.int(5, 40) : r.int(10, 80);
    const nums = Array.from({ length: cnt }, (_, i) => start + i * step);
    const sum = nums.reduce((a, b) => a + b);
    const word = ['', '', '', 'three', 'four', 'five'][cnt];
    const which = r.pick(['largest', 'smallest']);
    const noun = kind[0] === 'integers' ? 'whole numbers' : `${kind[0]} numbers`;
    return { body: `The sum of ${word} consecutive ${noun} is ${sum}. Find the ${which} of the ${word} numbers.`, a: String(which === 'largest' ? nums[cnt - 1] : nums[0]),
      w: `{{${sum} \\div ${cnt} = ${sum / cnt};\\ \\text{the numbers are } ${nums.join(',\\ ')}}}`, m: 3, chk: { k: 'num', val: String(which === 'largest' ? nums[cnt - 1] : nums[0]), expr: `${which === 'largest' ? nums[cnt - 1] : nums[0]}` } };
  },
  tank(r) {
    const [d1, d2] = r.pick([[3, 8], [2, 5], [4, 9], [3, 5], [5, 6], [2, 7], [3, 4]]);
    const n1 = r.pick([1, 1, 2]), n2 = r.int(Math.ceil(d2 * n1 / d1) + 1, d2 - 1);
    const f1 = new F(n1, d1), f2 = new F(n2, d2);
    const diff = f2.sub(f1);
    if (diff.n <= 0) return gens.tank(r);
    const cap = r.until(() => { const c = r.int(2, 8) * diff.d * r.pick([1, 2, 3]); return c <= 400 && c % lcm(d1, d2) === 0 ? c : null; });
    const added = diff.mul(cap);
    if (!added.isInt || added.n < 5 || added.n > 90) return gens.tank(r);
    const things = [['water tank', 'water', 'litres'], ['fuel tank', 'fuel', 'litres'], ['paddling pool', 'water', 'litres'], ['oil drum', 'oil', 'litres']];
    const [obj, liq, u] = r.pick(things);
    return { body: `A ${obj} is {{${f1.tex()}}} full. When ${added.n} ${u} of ${liq} are added, the ${obj} is {{${f2.tex()}}} full. How many ${u} of ${liq} does the ${obj} hold when it is full?`, a: `${cap}\\text{ ${u}}`,
      w: `{{${f2.tex()} - ${f1.tex()} = ${diff.tex()};\\ ${added.n} \\div ${diff.n} \\times ${diff.d} = ${cap}}}`, m: 4, chk: { k: 'num', val: String(cap), expr: `${added.n}/(Fraction(${n2},${d2})-Fraction(${n1},${d1}))` } };
  },
  ages(r) {
    const [A, B] = names(r, 2);
    for (let t = 0; t < 500; t++) {
      const k = r.int(3, 6), m = r.int(2, k - 1), n = r.int(2, 12);
      const S = n * (m - 1) / (k - m);
      if (Number.isInteger(S) && S >= 3 && S <= 14 && k * S <= 60) {
        return { body: `${A} is ${k} times as old as ${B}. In ${n} years' time, ${A} will be ${m} times as old as ${B}. How old is ${A} now?`, a: `${k * S}\\text{ years}`,
          w: `{{\\text{Let } ${B}\\text{ be } b;\\ ${k}b + ${n} = ${m}(b + ${n});\\ ${k - m}b = ${n * (m - 1)};\\ b = ${S}}}`, m: 4, chk: { k: 'num', val: String(k * S), expr: `${k}*(${n}*(${m}-1)/(${k}-${m}))` } };
      }
    }
    throw new Error('ages');
  },
  legs(r) {
    const [h, c] = [r.int(20, 60), 0];
    const cows = r.int(5, Math.floor(h / 2)), chick = h - cows;
    const legs = 4 * cows + 2 * chick;
    const [a, b, legA, legB] = r.pick([['chickens', 'cows', 2, 4], ['ducks', 'sheep', 2, 4]]);
    return { body: `A farm has only ${a} and ${b}. There are ${h} animals in total and they have ${legs} legs altogether. How many ${b} are there?`, a: String(cows),
      w: `{{${h} \\times 2 = ${2 * h};\\ ${legs} - ${2 * h} = ${legs - 2 * h};\\ ${legs - 2 * h} \\div 2 = ${cows}}}`, m: 4, chk: { k: 'num', val: String(cows), expr: `(${legs}-2*${h})/2` } };
  },
  digits(r) {
    for (let t = 0; t < 500; t++) {
      const a = r.int(1, 7), b = r.int(a + 1, 9);
      const s = a + b, d = 9 * (b - a);
      if (s >= 6) return { body: `A two-digit number has digits that add up to ${s}. When the digits are reversed, the number increases by ${d}. Find the original number.`, a: `${10 * a + b}`,
        w: `{{(10b + a) - (10a + b) = 9(b - a) = ${d};\\ b - a = ${b - a};\\ a + b = ${s};\\ a = ${a},\\ b = ${b}}}`, m: 4, chk: { k: 'num', val: String(10 * a + b), expr: `${10 * a + b}` } };
    }
  },
  rect(r) {
    const [w, d] = [r.int(4, 14), r.pick([2, 3, 4, 5, 6, 8])];
    const l = w + d;
    return { body: `A rectangle has a perimeter of ${2 * (l + w)} cm. Its length is ${d} cm more than its width. Work out the area of the rectangle.`, a: `${l * w}\\text{ cm}^2`,
      w: `{{${2 * (l + w)} \\div 2 = ${l + w};\\ ${l + w} - ${d} = ${2 * w};\\ w = ${w},\\ l = ${l};\\ ${w} \\times ${l} = ${l * w}}}`, m: 4, chk: { k: 'num', val: String(l * w), expr: `${l}*${w}` } };
  },
  handshake(r) {
    const n = r.int(6, 40);
    return { body: `There are ${n} people at a meeting. Each person shakes hands once with every other person. How many handshakes are there altogether?`, a: String(n * (n - 1) / 2),
      w: `{{${n} \\times ${n - 1} = ${n * (n - 1)};\\ ${n * (n - 1)} \\div 2 = ${n * (n - 1) / 2}}}`, m: 3, chk: { k: 'num', val: String(n * (n - 1) / 2), expr: `${n}*(${n}-1)/2` } };
  },
  sweets(r) {
    const [A, B, C] = names(r, 3);
    const c = r.int(5, 30), x = r.int(3, 12), k = r.pick([2, 3]);
    const b = c + x, a = k * b, tot = a + b + c;
    const times = k === 2 ? 'twice' : 'three times';
    return { body: `${A}, ${B} and ${C} have ${tot} stickers altogether. ${A} has ${times} as many stickers as ${B}. ${B} has ${x} more stickers than ${C}. How many stickers does ${A} have?`, a: String(a),
      w: `{{\\text{Let } ${C}\\text{ have } c;\\ ${B}: c + ${x};\\ ${A}: ${k}(c + ${x});\\ ${k + 2}c + ${k * x + x} = ${tot};\\ c = ${c}}}`, m: 4, chk: { k: 'num', val: String(a), expr: `${k}*((${tot}-${k * x + x})/${k + 2}+${x})` } };
  },
  train(r) {
    const [L, v] = [r.pick([100, 120, 150, 180, 200]), 0];
    const t = r.pick([8, 10, 12, 15]); const sp = L / t;
    if (!Number.isInteger(sp)) return gens.train(r);
    const T = r.pick([300, 360, 400, 450, 500, 600]);
    const time = (L + T) / sp;
    if (!Number.isInteger(time)) return gens.train(r);
    return { body: `A train is ${L} m long. It takes ${t} seconds to pass a signal post. The train then goes through a tunnel that is ${T} m long. How many seconds does it take for the whole train to pass through the tunnel, from the front entering to the back leaving?`, a: `${time}\\text{ seconds}`,
      w: `{{${L} \\div ${t} = ${sp}\\text{ m/s};\\ ${L} + ${T} = ${L + T};\\ ${L + T} \\div ${sp} = ${time}}}`, m: 4, chk: { k: 'num', val: String(time), expr: `(${L}+${T})/(${L}/${t})` } };
  },
  multiples(r) {
    const k = r.pick([7, 9, 11, 13]);
    const [lo, hi] = r.until(() => { const lo = r.int(50, 150), hi = lo + r.int(150, 400); return lo % k !== 0 && hi % k !== 0 ? [lo, hi] : null; });
    const first = Math.ceil(lo / k) * k, last = Math.floor(hi / k) * k;
    const cnt = (last - first) / k + 1;
    return { body: `How many multiples of ${k} are there between ${lo} and ${hi}?`, a: String(cnt), w: `{{${first},\\ ${first + k},\\ \\ldots,\\ ${last};\\ (${last} - ${first}) \\div ${k} + 1 = ${cnt}}}`, m: 3, chk: { k: 'num', val: String(cnt), expr: `len([x for x in range(${lo + 1},${hi}) if x%${k}==0])` } };
  },
};
const LABELS = {
  consecutive: 'consecutive numbers with a given sum',
  tank: 'fraction of a container',
  ages: 'ages in the future',
  legs: 'heads and legs',
  digits: 'digit puzzle (digits reversed)',
  rect: 'rectangle with a perimeter and a difference',
  handshake: 'handshakes',
  sweets: 'sharing with more than / times as many',
  train: 'train through a tunnel',
  multiples: 'count the multiples in a range',
};
export default {
  id: 'problem-solving',
  topic: 'Problem solving', type: 'Puzzle / multi-step reasoning', code: 'PS',
  levels: ['Core', 'Additional'],
  search: 'problem solving puzzle reasoning multi-step',
  verb: '', marks: 4, lines: 8,
  variants: Object.keys(gens).map(k => ({ id: k, label: LABELS[k], params: { id: k } })),
  generate(r, v) {
    const g = gens[v.id](r);
    return { parts: [g] };
  },
};
