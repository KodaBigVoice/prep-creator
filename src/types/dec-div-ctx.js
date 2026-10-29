import { TOPIC, F, ds, py, M, mk, num, names, GBP, KG, LIT, MET, cnt, mon, divPair, divWork, RATE_CTX, pounds } from './decimals.js';

const CTX = [
  { u: MET, kbs: [1, 2], pl: 'pieces', sg: 'piece', s: (n, a, b) => `A ribbon is ${MET.txt(a)} long. ${n} cuts it into pieces that are each ${MET.txt(b)} long. How many pieces are there?` },
  { u: LIT, kbs: [1, 2], pl: 'glasses', sg: 'glass', s: (n, a, b) => `A bottle holds ${LIT.txt(a)} of water. ${n} fills glasses that each hold ${LIT.txt(b)}. How many glasses can ${n} fill completely?` },
  { u: KG, kbs: [1, 2], pl: 'bags', sg: 'bag', s: (n, a, b) => `${n} has ${KG.txt(a)} of rice and puts it into bags. Each bag holds ${KG.txt(b)}. How many bags are filled?` },
  { u: GBP, kbs: [2], pl: 'sweets', sg: 'sweet', s: (n, a, b) => `${n} has ${mon(a)} to spend. Sweets cost ${mon(b)} each. How many sweets can ${n} buy?`, money: true },
  { u: MET, kbs: [1, 2], pl: 'stakes', sg: 'stake', s: (n, a, b) => `A fence panel is ${MET.txt(a)} long. ${n} cuts it into lengths of ${MET.txt(b)} to make small garden stakes. How many stakes can ${n} make?` },
];

export default {
  id: 'dec-div-ctx',
  topic: TOPIC, type: 'Dividing by a decimal: in context', code: 'DC13',
  levels: ['Core', 'Additional'],
  search: 'divide by a decimal worded how many pieces glasses bags price per kilogram',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'single', label: 'how many pieces:  3.6 m into 0.6 m pieces', params: { k: 'single' }, levels: ['Core'] },
    { id: 'two', label: 'how many pieces, two-digit divisor:  4.2 m into 0.35 m pieces', params: { k: 'two' }, levels: ['Additional'] },
    { id: 'rate', label: 'price per kilogram, metre or litre: how much for the money', params: { k: 'rate' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'rate') {
      const c = r.pick(RATE_CTX);
      const [p, w, t] = r.until(() => {
        const p = new F(Math.round(r.pick(c.price.filter(x => !Number.isInteger(x))) * 100), 100), w = new F(Math.round(r.pick(c.qty) * 100), 100), t = p.mul(w);
        return 100 % t.d === 0 && t.val >= 2 && !p.isInt ? [p, w, t] : null;
      });
      return { parts: [{ body: c.rev(n, pounds(p.val), pounds(t.val)), a: c.u.tex(w), w: M(`${ds(t)} \\div ${ds(p)} = ${ds(w)}`), ...mk(2, c.u), chk: num(`${py(t)}/${py(p)}`, w) }] };
    }
    const c = r.pick(CTX), two = v.k === 'two';
    const x = divPair(r, { two, kbs: c.kbs, qInt: true, maxDpA: c.money ? 2 : 3, maxA: 60 });
    const u = cnt(c.pl, c.sg);
    return { parts: [{ body: c.s(n, x.a, x.b), a: u.tex(x.q), w: M(divWork(x)), ...mk(two ? 3 : 2, u), chk: num(`${py(x.a)}/${py(x.b)}`, x.q) }] };
  },
};
