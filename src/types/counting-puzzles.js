// Problem solving: counting and patterns. Original puzzles, each a family with its own numbers (a few are fixed, one-off questions).
// Every answer is also worked out by brute force in the independent checker (tests/verify.py, via `chk.expr`).
import { names } from '../core/q.js';

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const ord = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10 > 3 ? 0 : n % 10]}`;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ds = (n) => [...String(n)].map(Number).reduce((a, b) => a + b, 0);
const num = (v, extra = {}) => ({ k: 'num', val: String(v), ...extra });

const gens = {
  digitSum(r) {
    const S = r.int(5, 14), list = [];
    for (let t = 10; t < 100; t++) if (ds(t) === S) list.push(t);
    return { body: `How many two-digit numbers have digits that add up to ${S}?`, a: String(list.length),
      w: `{{${list.join(',\\ ')};\\ \\text{that is } ${list.length}\\text{ numbers}}}`, m: 3,
      chk: num(list.length, { expr: `len([n for n in range(10,100) if n//10+n%10==${S}])` }) };
  },
  digitProduct(r) {
    const P = r.pick([6, 8, 12, 16, 18, 20, 24, 36]), list = [];
    for (let t = 10; t < 100; t++) if (Math.floor(t / 10) * (t % 10) === P) list.push(t);
    return { body: `How many two-digit numbers have digits that multiply to give ${P}?`, a: String(list.length),
      w: `{{${list.join(',\\ ')};\\ \\text{that is } ${list.length}\\text{ numbers}}}`, m: 3,
      chk: num(list.length, { expr: `len([n for n in range(10,100) if n//10*(n%10)==${P}])` }) };
  },
  threeDigitSum(r) {
    const S = r.int(3, 7); let cnt = 0; const parts = [];
    for (let h = 1; h <= S; h++) { const ways = S - h + 1; cnt += ways; parts.push(`${h}: ${ways}`); }
    return { body: `How many three-digit numbers have digits that add up to ${S}?`, a: String(cnt),
      w: `{{\\text{Hundreds digit and the number of ways to split the rest: } ${parts.join(',\\ ')};\\ \\text{total } ${cnt}}}`, m: 4,
      chk: num(cnt, { expr: `len([n for n in range(100,1000) if n//100+n//10%10+n%10==${S}])` }) };
  },
  digitCount(r) {
    const N = r.pick([50, 100, 150, 200, 300, 500]), D = r.int(1, 9);
    let cnt = 0; const at = [0, 0, 0];
    for (let n = 1; n <= N; n++) { const s = String(n).padStart(3, ' '); for (let p = 0; p < 3; p++) if (s[2 - p] === String(D)) { cnt++; at[p]++; } }
    const [who] = names(r, 1);
    return { body: `${who} writes down every whole number from 1 to ${N}. How many times does ${who} write the digit ${D}?`, a: String(cnt),
      w: `{{\\text{Units: } ${at[0]};\\ \\text{tens: } ${at[1]};\\ \\text{hundreds: } ${at[2]};\\ \\text{total } ${cnt}}}`, m: 4,
      chk: num(cnt, { expr: `sum(str(n).count('${D}') for n in range(1,${N + 1}))` }) };
  },
  gridRect(r) {
    const rows = r.int(2, 4), cols = r.int(3, 6);
    const a = (rows + 1) * rows / 2, b = (cols + 1) * cols / 2;
    return { body: `A grid is made of ${rows} rows and ${cols} columns of identical small squares. How many rectangles of any size can be drawn along the lines of the grid? (A square counts as a rectangle.)`, a: String(a * b),
      w: `{{\\text{Choose 2 of the } ${rows + 1}\\text{ horizontal lines: } ${a}\\text{ ways. Choose 2 of the } ${cols + 1}\\text{ vertical lines: } ${b}\\text{ ways.}\\ ${a} \\times ${b} = ${a * b}}}`, m: 4,
      chk: num(a * b, { expr: `len([1 for a in range(${rows + 1}) for b in range(a+1,${rows + 1}) for c in range(${cols + 1}) for d in range(c+1,${cols + 1})])` }) };
  },
  gridSquares(r) {
    const n = r.int(3, 6); let cnt = 0; const parts = [];
    for (let k = n; k >= 1; k--) { cnt += (n - k + 1) ** 2; parts.push(`${n - k + 1}^2`); }
    return { body: `A big square is made of ${n} rows and ${n} columns of identical small squares. How many squares of any size can be found along the lines of the grid?`, a: String(cnt),
      w: `{{\\text{Squares of each size, biggest to smallest: } ${parts.join(' + ')} = ${cnt}}}`, m: 4,
      chk: num(cnt, { expr: `len([1 for k in range(1,${n + 1}) for a in range(${n}-k+1) for b in range(${n}-k+1)])` }) };
  },
  homeAway(r) {
    const n = r.int(6, 20), sport = r.pick(['football', 'hockey', 'netball', 'rugby']);
    return { body: `There are ${n} teams in a ${sport} league. Every team plays every other team twice, once at home and once away. How many matches are played altogether?`, a: String(n * (n - 1)),
      w: `{{\\text{Each team plays one home match against each of the other } ${n - 1}\\text{ teams.}\\ ${n} \\times ${n - 1} = ${n * (n - 1)}}}`, m: 3,
      chk: num(n * (n - 1), { expr: `len([1 for a in range(${n}) for b in range(${n}) if a!=b])` }) };
  },
  knockout(r) {
    const n = r.pick([13, 17, 19, 23, 27, 29, 37, 41, 50, 63, 75, 100]);
    return { body: `${n} players enter a tennis tournament. In every match one player is knocked out, and the tournament continues until only one player is left. How many matches are played altogether?`, a: String(n - 1),
      w: `{{\\text{Every match knocks out exactly one player, and } ${n - 1}\\text{ players must go out.}\\ ${n} - 1 = ${n - 1}}}`, m: 3, chk: num(n - 1, { expr: `${n}-1` }) };
  },
  clockAngle(r) {
    for (let t = 0; t < 200; t++) {
      const H = r.int(1, 11), M = r.pick([10, 20, 30, 40, 50]);
      let ang = Math.abs(30 * H - 5.5 * M); ang %= 360; if (ang > 180) ang = 360 - ang;
      if (ang === 0 || ang === 180) continue;
      return { body: `What is the smaller angle between the hour hand and the minute hand of a clock at ${H}:${M}?`, a: `${ang}^{\\circ}`,
        w: `{{\\text{Minute hand: } ${6 * M}^{\\circ}\\text{ past 12.}\\ \\text{Hour hand: } ${30 * H} + ${M / 2} = ${30 * H + M / 2}^{\\circ}\\text{ past 12.}\\ \\text{Difference } ${Math.abs(30 * H + M / 2 - 6 * M)}^{\\circ}${Math.abs(30 * H + M / 2 - 6 * M) > 180 ? `;\\ 360 - ${Math.abs(30 * H + M / 2 - 6 * M)} = ${ang}^{\\circ}` : ''}}}`, m: 3,
        chk: num(ang, { expr: `min(abs(30*${H}-5.5*${M})%360, 360-abs(30*${H}-5.5*${M})%360)` }) };
    }
  },
  cycleTerm(r) {
    const k = r.int(3, 5), seq = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], k), N = r.int(60, 199);
    const ans = seq[(N - 1) % k], rem = N % k;
    return { body: `The numbers ${seq.join(', ')}, ${seq.join(', ')}, ${seq.join(', ')}, … continue in this pattern for ever. What is the ${ord(N)} number in the pattern?`, a: String(ans),
      w: `{{\\text{The pattern repeats every } ${k}\\text{ numbers.}\\ ${N} \\div ${k} = ${Math.floor(N / k)}\\text{ remainder } ${rem};\\ \\text{so the ${ord(N)} number is the same as the ${ord(rem === 0 ? k : rem)} number, } ${ans}}}`, m: 3,
      chk: num(ans, { expr: `[${seq.join(',')}][(${N}-1)%${k}]` }) };
  },
  daysCount(r) {
    const s0 = r.int(0, 6), t = r.int(0, 6), N = r.int(50, 120);
    let cnt = 0; for (let i = 1; i <= N; i++) if ((s0 + i) % 7 === t) cnt++;
    const q = Math.floor(N / 7), rem = N % 7, off = ((t - s0 + 7) % 7) || 7;
    return { body: `Today is a ${DAYS[s0]}. How many ${DAYS[t]}s are there in the next ${N} days? (Today does not count.)`, a: String(cnt),
      w: `{{${N} \\div 7 = ${q}\\text{ weeks remainder } ${rem}.}} {{\\text{That gives } ${q}\\text{ ${DAYS[t]}s. The next ${DAYS[t]} is in } ${off}\\text{ days, so the } ${rem}\\text{ extra days ${off <= rem ? 'include' : 'do not include'} one. Total: } ${cnt}}}`, m: 4,
      chk: num(cnt, { expr: `len([i for i in range(1,${N + 1}) if (${s0}+i)%7==${t}])` }) };
  },
  mealDeal(r) {
    const a = r.int(3, 6), b = r.int(3, 5), c = r.int(2, 4);
    return { body: `A café has ${a} kinds of sandwich, ${b} kinds of drink and ${c} kinds of snack. A meal deal is one sandwich, one drink and one snack. How many different meal deals are there?`, a: String(a * b * c),
      w: `{{${a} \\times ${b} \\times ${c} = ${a * b * c}}}`, m: 2, chk: num(a * b * c, { expr: `len([1 for x in range(${a}) for y in range(${b}) for z in range(${c})])` }) };
  },
  arrange(r) {
    const n = r.int(5, 6), digs = r.sample([1, 2, 3, 4, 5, 6, 7, 8, 9], n).sort((x, y) => x - y);
    const ev = digs.filter(x => x % 2 === 0).length;
    if (!ev) return gens.arrange(r);
    const cnt = ev * (n - 1) * (n - 2);
    return { body: `Three different digits are chosen from ${digs.join(', ')} and put side by side to make a three-digit number. How many of the possible numbers are even?`, a: String(cnt),
      w: `{{\\text{The last digit must be even: } ${ev}\\text{ choices.}\\ \\text{First digit: } ${n - 1}\\text{ choices; middle digit: } ${n - 2}.\\ ${ev} \\times ${n - 1} \\times ${n - 2} = ${cnt}}}`, m: 4,
      chk: num(cnt, { expr: `len([1 for a in [${digs}] for b in [${digs}] for c in [${digs}] if a!=b and b!=c and a!=c and c%2==0])` }) };
  },
  flash(r) {
    for (let t = 0; t < 200; t++) {
      const [a, b] = r.pick([[12, 18], [20, 30], [15, 25], [10, 16], [9, 12], [14, 21], [18, 24], [8, 12], [6, 10], [16, 20]]), m = r.pick([5, 6, 8, 10, 12, 15]);
      const L = lcm(a, b), secs = 60 * m;
      if (secs % L === 0 || secs / L < 2) continue;
      const cnt = Math.floor(secs / L);
      return { body: `Two lights flash together at exactly 8:00 pm. After that, one light flashes every ${a} seconds and the other flashes every ${b} seconds. How many more times do they flash together in the next ${m} minutes?`, a: String(cnt),
        w: `{{\\text{They flash together every } \\text{lcm}(${a}, ${b}) = ${L}\\text{ seconds.}\\ ${m}\\text{ minutes} = ${secs}\\text{ seconds.}\\ ${secs} \\div ${L} = ${(secs / L).toFixed(2).replace(/0+$/, '')}\\text{, so } ${cnt}\\text{ times}}}`, m: 4,
        chk: num(cnt, { expr: `len([t for t in range(1,${secs + 1}) if t%${a}==0 and t%${b}==0])` }) };
    }
  },
  gauss(r) {
    const n = r.pick([30, 40, 50, 60, 80, 100, 120]);
    return { body: `Work out the sum of all the whole numbers from 1 to ${n}.`, a: String(n * (n + 1) / 2),
      w: `{{\\text{Pair the numbers: } 1 + ${n} = ${n + 1}, 2 + ${n - 1} = ${n + 1}, \\ldots\\ \\text{There are } ${n / 2}\\text{ pairs.}\\ ${n / 2} \\times ${n + 1} = ${n * (n + 1) / 2}}}`, m: 3,
      chk: num(n * (n + 1) / 2, { expr: `sum(range(1,${n + 1}))` }) };
  },
  oddSum(r) {
    const n = r.int(10, 30);
    return { body: `Work out the sum of the first ${n} odd numbers: {{1 + 3 + 5 + \\ldots}} (${n} numbers altogether).`, a: String(n * n),
      w: `{{\\text{The sum of the first } n \\text{ odd numbers is } n^2.\\ ${n}^2 = ${n * n}}}`, m: 3, chk: num(n * n, { expr: `sum(range(1,${2 * n},2))` }) };
  },
  palindromes() {
    return { body: 'A palindrome is a number that reads the same forwards and backwards, for example 727. How many three-digit palindromes are there?', a: '90',
      w: `{{\\text{The first digit has 9 choices (1 to 9), the middle digit has 10 choices, and the last digit must match the first.}\\ 9 \\times 10 = 90}}`, m: 3,
      chk: num(90, { expr: `len([n for n in range(100,1000) if str(n)==str(n)[::-1]])` }) };
  },
  oppositeHands() {
    return { body: 'How many times between 12 noon and 12 midnight (not counting midnight itself) do the hour hand and the minute hand of a clock point in exactly opposite directions?', a: '11',
      w: `{{\\text{In 12 hours the minute hand turns 12 times and the hour hand once, so the minute hand gains } 11\\text{ turns.}\\ \\text{Each time it gains a turn it passes the opposite position once, so } 11}}`, m: 4,
      chk: num(11, { expr: `len([k for k in range(0,40) if Fraction(360+720*k,11) < 720])` }) };
  },
  lastDigit(r) {
    const b = r.pick([2, 3, 4, 7, 8, 9]), n = r.int(20, 60);
    const cyc = []; let x = b % 10; do { cyc.push(x); x = (x * b) % 10; } while (x !== cyc[0]);
    let u = 1; for (let i = 0; i < n; i++) u = (u * b) % 10;
    const rem = n % cyc.length;
    return { body: `What is the units digit of {{${b}^{${n}}}}?`, a: String(u),
      w: `{{\\text{The units digits of the powers of } ${b}\\text{ go } ${cyc.join(', ')}, ${cyc.join(', ')}, \\ldots\\ \\text{repeating every } ${cyc.length}.\\ ${n} \\div ${cyc.length}\\text{ leaves remainder } ${rem}\\text{, so the answer is } ${u}}}`, m: 3,
      chk: num(u, { expr: `${b}**${n}%10` }) };
  },
  lazyCaterer(r) {
    const n = r.int(3, 6), cnt = n * (n + 1) / 2 + 1;
    return { body: `A round pizza is cut using ${n} straight cuts, each cut going right across the pizza. What is the greatest number of pieces that can be made? (The pieces do not have to be the same size.)`, a: String(cnt),
      w: `{{\\text{Each new cut should cross all the earlier cuts. Pieces: } 1 + 1 + 2 + \\ldots + ${n} = ${cnt}}}`, m: 4, chk: num(cnt, { expr: `1+sum(range(1,${n + 1}))` }) };
  },
};
const LABELS = {
  digitSum: 'two-digit numbers with a given digit sum', digitProduct: 'two-digit numbers with a given digit product', threeDigitSum: 'three-digit numbers with a given digit sum',
  digitCount: 'how many times a digit is written', gridRect: 'count the rectangles in a grid', gridSquares: 'count the squares in a grid', homeAway: 'a league, home and away',
  knockout: 'matches in a knockout tournament', clockAngle: 'angle between the hands of a clock', cycleTerm: 'a repeating pattern: find the Nth number',
  daysCount: 'how many of a weekday in the next N days', mealDeal: 'meal deals (counting combinations)', arrange: 'arranging digits: how many are even',
  flash: 'lights flashing together (lowest common multiple)', gauss: 'add up the numbers from 1 to n', oddSum: 'add up the first n odd numbers',
  palindromes: 'three-digit palindromes (a fixed question)', oppositeHands: 'clock hands pointing opposite ways (a fixed question)',
  lastDigit: 'the units digit of a power', lazyCaterer: 'cutting a pizza into the most pieces',
};
const D = {
  mealDeal: [3.8, ['Foundation', 'Core']], digitSum: [5.2, ['Core']], digitProduct: [5.7, ['Core', 'Additional']], cycleTerm: [5.9, ['Core']],
  palindromes: [6.2, ['Core', 'Additional']], homeAway: [6.3, ['Core', 'Additional']], gauss: [6.4, ['Core', 'Additional']], digitCount: [6.6, ['Core', 'Additional']],
  daysCount: [6.7, ['Core', 'Additional']], oddSum: [6.9, ['Additional']], knockout: [7.1, ['Additional']], flash: [7.2, ['Additional']],
  gridSquares: [7.4, ['Additional']], threeDigitSum: [7.7, ['Additional']], gridRect: [8.3, ['Additional', 'Further']], arrange: [8.6, ['Additional', 'Further']],
  clockAngle: [8.8, ['Further']], lastDigit: [9.0, ['Further']], lazyCaterer: [9.2, ['Further']], oppositeHands: [9.4, ['Further']],
};
export default {
  id: 'counting-puzzles',
  topic: 'Problem solving', type: 'Counting and patterns', code: 'PS',
  levels: ['Core', 'Additional'],
  search: 'problem solving puzzle counting patterns digits grid clock sequence tournament challenge',
  verb: '', marks: 4, lines: 8,
  variants: Object.keys(gens).map(k => ({ id: k, label: LABELS[k], d: D[k][0], levels: D[k][1], params: { id: k } })),
  generate(r, v) { return { parts: [gens[v.id](r)] }; },
};
