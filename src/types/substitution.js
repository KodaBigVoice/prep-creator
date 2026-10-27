import { parse, texAlg, subst } from '../core/algexpr.js';
import { value, working, tex as texNum } from '../core/arith.js';

const BANK = {
  easy: ['2a+3b', 'a^2+b', '5a-2b', '3ab', 'a+bc', '4c-a', '2(a+b)', 'ab+c', '3a^2'],
  mid: ['2a^2-b', 'a^2-bc', '3(a-c)^2', 'a^2+b^2', '2a^2b', '(a+b)^2', 'a^3-b', '5c-a^2', '3a^2-2b^3', 'ab^2+c'],
  hard: ['2a^2b-5c', '(a-b)^2+c', 'a^2-b^2', 'c^2-2ab', '3a^3-b^2', '(2a+b)^2-c', 'ab^2-c^2', 'a^3+b^3', 'c(a-b)^2'],
};
const letters = [['a', 'b', 'c'], ['x', 'y', 'z'], ['p', 'q', 'r'], ['m', 'n', 'k']];

export default {
  id: 'substitution',
  topic: 'Substitution', type: 'Substitute with negatives and powers', code: 'SUB',
  levels: ['Core', 'Additional'],
  search: 'substitute evaluate expression value of when a = b =',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'three', label: 'three expressions with positive and negative values', params: { n: 3, bank: ['easy', 'mid'] } },
    { id: 'three-hard', label: 'three expressions, squares and cubes', params: { n: 3, bank: ['mid', 'hard'] } },
    { id: 'one', label: 'single expression', params: { n: 1, bank: ['mid', 'hard'] } },
  ],
  generate(r, v) {
    const L = r.pick(letters);
    const vals = r.until(() => {
      const o = {}; L.forEach(l => { o[l] = r.int(-4, 6); });
      return Object.values(o).every(x => x !== 0) && new Set(Object.values(o)).size === 3 && Object.values(o).some(x => x < 0) ? o : null;
    });
    const pool = v.bank.flatMap(b => BANK[b]);
    const exprs = r.sample(pool, v.n);
    const rename = (s) => s.replace(/[abc]/g, (c) => L['abc'.indexOf(c)]);
    const given = L.map(l => `${l} = ${vals[l]}`);
    const stem = v.n === 1 ? null : `Given that {{${given[0]}}}, {{${given[1]}}} and {{${given[2]}}}, evaluate:`;
    const parts = exprs.map((e, i) => {
      const ast = parse(rename(e));
      const sub = subst(ast, vals);
      const val = value(sub);
      const t = texAlg(ast);
      const wk = working(sub);
      const body = v.n === 1 ? `Given that {{${given[0]}}}, {{${given[1]}}} and {{${given[2]}}}, evaluate {{${t}}}` : `{{${t}}}`;
      const ok = val.isInt;
      return { l: v.n === 1 ? undefined : undefined, body, a: ok ? String(val.n) : val.mixedTex(), w: `{{${wk}}}`, m: v.n === 1 ? 3 : 2, lines: v.n === 1 ? 5 : 4,
        chk: { k: 'subs', expr: t, vars: vals, val: val.toString() } };
    });
    return { stem, parts };
  },
};
