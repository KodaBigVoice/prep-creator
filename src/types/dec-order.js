import { TOPIC, F, rd, ds, M } from './decimals.js';

// a trap: the same leading digits, different lengths (0.3 and 0.29, 0.5 and 0.45)
function trapPair(r) {
  return r.until(() => {
    const w = r.chance(0.3) ? r.int(1, 9) : 0;
    const t1 = r.int(1, 9), t2 = r.pick([t1, t1 - 1]);
    if (t2 < 0) return null;
    const x = new F(w * 10 + t1, 10), y = new F((w * 10 + t2) * 10 + r.int(1, 9), 100);
    return x.eq(y) ? null : r.chance(0.5) ? [x, y] : [y, x];
  });
}
function setOf(r, n, whole) {
  return r.until(() => {
    const w = whole ? r.int(1, 9) : 0, t = r.int(1, 9), xs = [];
    for (let i = 0; i < n; i++) {
      const dp = r.int(1, 3);
      const lead = r.pick([t, t, t - 1, t + 1, 0]);
      if (lead < 0 || lead > 9) return null;
      const rest = dp > 1 ? r.int(0, 10 ** (dp - 1) - 1) : 0;
      let m = lead * 10 ** (dp - 1) + rest;
      if (m % 10 === 0 && dp > 0) m += r.int(1, 9);
      if (m <= 0) return null;
      xs.push(new F(w * 10 ** dp + m, 10 ** dp));
    }
    const dps = new Set(xs.map(x => String(x.d)));
    const distinct = new Set(xs.map(x => x.toString())).size === n;
    return distinct && dps.size >= 2 && Math.max(...xs.map(x => x.val)) - Math.min(...xs.map(x => x.val)) < 1 ? xs : null;
  });
}

export default {
  id: 'dec-order',
  topic: TOPIC, type: 'Ordering decimals', code: 'DC1',
  levels: ['Foundation', 'Core'],
  search: 'order compare decimals smallest largest bigger place value',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'two', label: 'which is larger or smaller:  0.3 or 0.29', params: { k: 'two' } },
    { id: 'four', label: 'four decimals in order:  0.5, 0.45, 0.054, 0.504', params: { k: 'four' } },
    { id: 'whole', label: 'with whole-number parts:  3.07, 3.7, 3.071', params: { k: 'whole' } },
  ],
  generate(r, v) {
    if (v.k === 'two') {
      const [x, y] = trapPair(r), big = r.chance(0.5);
      const ans = (big ? (x.gt(y) ? x : y) : (x.gt(y) ? y : x));
      return { parts: [{
        body: `Which of these numbers is the ${big ? 'larger' : 'smaller'}: {{${ds(x)}}} or {{${ds(y)}}}?`,
        a: ds(ans), w: M(`${ds(x.gt(y) ? y : x)} < ${ds(x.gt(y) ? x : y)}`), m: 1, lines: 2,
        chk: { k: 'order', items: [ds(x), ds(y)], dir: big ? 'desc' : 'asc', n: 1 },
      }] };
    }
    const n = 4, xs = setOf(r, n, v.k === 'whole'), up = r.chance(0.6);
    const sorted = xs.slice().sort((p, q) => (up ? p.cmp(q) : q.cmp(p)));
    return { parts: [{
      body: `Write these numbers in order, starting with the ${up ? 'smallest' : 'largest'}: {{${xs.map(ds).join(',\\ ')}}}`,
      a: sorted.map(ds).join(',\\ '), w: M(sorted.map(ds).join(up ? ' < ' : ' > ')), m: 2, lines: 3,
      chk: { k: 'order', items: xs.map(ds), dir: up ? 'asc' : 'desc', n },
    }] };
  },
};
