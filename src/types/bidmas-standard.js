import { n, br, add, sub, mul, div, pow, tex, value, working, allIntegers } from '../core/arith.js';

const sk = {
  a: (r) => add(n(r.int(2, 9)), mul(n(r.int(2, 6)), pow(br(sub(n(r.int(6, 14)), n(r.int(1, 5)))), n(2)))),
  b: (r) => sub(mul(n(r.int(2, 6)), pow(br(add(n(r.int(1, 6)), n(r.int(1, 6)))), n(2))), mul(n(r.int(2, 9)), n(r.int(2, 9)))),
  c: (r) => sub(add(pow(n(r.int(3, 9)), n(2)), mul(n(r.int(2, 9)), n(r.int(2, 9)))), n(r.int(2, 20))),
  d: (r) => { const d = r.int(2, 6); return sub(div(mul(n(r.int(2, 9)), br(add(n(r.int(1, 12)), n(r.int(1, 12))))), n(d)), n(r.int(1, 9))); },
  e: (r) => add(div(pow(br(sub(n(r.int(7, 13)), n(r.int(2, 6)))), n(3)), n(r.int(2, 10))), n(r.int(2, 9))),
  f: (r) => add(n(r.int(10, 40)), div(mul(n(r.int(2, 9)), pow(n(r.int(2, 6)), n(2))), n(r.int(2, 8)))),
  g: (r) => sub(mul(br(add(n(r.int(2, 9)), n(r.int(2, 9)))), br(sub(n(r.int(8, 15)), n(r.int(2, 7))))), pow(n(r.int(2, 6)), n(3))),
  h: (r) => div(br(add(pow(n(r.int(2, 8)), n(2)), n(r.int(2, 30)))), n(r.int(2, 9))),
  // four operations, no brackets or powers
  p: (r) => sub(add(n(r.int(5, 40)), mul(n(r.int(2, 9)), n(r.int(2, 9)))), n(r.int(2, 20))),
  q: (r) => add(sub(n(r.int(30, 99)), div(n(r.int(2, 12) * r.int(2, 9)), n(r.int(2, 9)))), mul(n(r.int(2, 9)), n(r.int(2, 6)))),
  s: (r) => sub(div(mul(n(r.int(2, 9)), n(r.int(2, 9))), n(r.int(2, 6))), add(n(r.int(1, 9)), n(r.int(1, 9)))),
};
const sets = {
  bp: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
  four: ['p', 'q', 's'],
};

export default {
  id: 'bidmas-standard',
  topic: 'Order of operations (BIDMAS)', type: 'BIDMAS: standard', code: 'BID',
  levels: ['Foundation', 'Core'],
  search: 'BIDMAS BODMAS order of operations brackets powers',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'bp', label: 'brackets and powers', params: { set: 'bp' } },
    { id: 'four', label: 'four operations (no brackets)', params: { set: 'four' } },
  ],
  generate(r, v) {
    const ids = sets[v.set];
    const e = r.until(() => {
      const e = sk[r.pick(ids)](r);
      if (!allIntegers(e, 5000)) return null;
      const val = value(e);
      return val.n >= 1 && val.n <= 200 ? e : null;
    });
    return { parts: [{ body: `{{${tex(e)}}}`, a: String(value(e).n), w: `{{${working(e)}}}`, chk: { k: 'eval', tex: tex(e) } }] };
  },
};
