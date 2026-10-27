import { n, br, add, sub, mul, div, pow, neg, tex, value, working, allIntegers } from '../core/arith.js';

const sk = [
  (r) => { const a = r.int(2, 4), c = r.int(2, 4); return sub(sub(pow(br(n(-a)), n(2)), pow(n(r.int(2, 3)), n(3))), pow(br(n(-c)), n(2))); },
  (r) => sub(neg(pow(n(r.int(2, 6)), n(2))), pow(br(n(-r.int(2, 6))), n(2))),
  (r) => add(pow(br(n(-r.int(2, 4))), n(3)), mul(n(r.int(2, 6)), br(n(-r.int(2, 6))))),
  (r) => sub(n(r.int(5, 20)), pow(br(n(-r.int(2, 5))), n(2))),
  (r) => sub(div(pow(br(n(-r.int(2, 5))), n(3)), n(r.int(2, 4))), mul(n(r.int(2, 6)), br(n(-r.int(2, 6))))),
  (r) => add(neg(pow(n(r.int(2, 5)), n(2))), mul(br(n(-r.int(2, 6))), br(n(-r.int(2, 6))))),
  (r) => sub(pow(br(sub(n(r.int(1, 4)), n(r.int(5, 9)))), n(2)), pow(n(r.int(2, 4)), n(3))),
  (r) => div(sub(pow(br(n(-r.int(2, 6))), n(2)), n(r.int(1, 20))), n(r.int(2, 5))),
];

export default {
  id: 'bidmas-negatives',
  topic: 'Order of operations (BIDMAS)', type: 'BIDMAS: negatives and powers', code: 'BIDN',
  levels: ['Core', 'Additional'],
  search: 'silly BIDMAS negative powers squares of negatives',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [{ id: 'std', label: 'negatives with squares and cubes', params: {} }],
  generate(r) {
    const e = r.until(() => {
      const e = sk[r.int(0, sk.length - 1)](r);
      if (!allIntegers(e, 5000)) return null;
      const v = value(e).n;
      return Math.abs(v) <= 100 && v !== 0 ? e : null;
    });
    return { parts: [{ body: `{{${tex(e)}}}`, a: String(value(e).n), w: `{{${working(e)}}}`, chk: { k: 'eval', tex: tex(e) } }] };
  },
};
