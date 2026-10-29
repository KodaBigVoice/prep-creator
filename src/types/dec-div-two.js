import { TOPIC, ds, py, M, num, divPair, divWork } from './decimals.js';

export default {
  id: 'dec-div-two',
  topic: TOPIC, type: 'Dividing by a decimal: two-digit divisor', code: 'DC12',
  levels: ['Additional'],
  search: 'divide by a decimal two non-zero digits 0.28 0.35 1.2 long division bus stop',
  verb: 'Evaluate', marks: 3, lines: 6,
  variants: [
    { id: 'more', label: 'dividend has more decimal places:  0.168 ÷ 0.12', params: { rel: 'more', kbs: [1, 2], maxDpA: 3 } },
    { id: 'fewer', label: 'divisor has more decimal places:  4.5 ÷ 0.15', params: { rel: 'fewer', kbs: [2, 3], maxDpA: 2 } },
  ],
  generate(r, v) {
    const x = divPair(r, { two: true, kbs: v.kbs, rel: v.rel, maxDpA: v.maxDpA });
    return { parts: [{ body: `{{${ds(x.a)} \\div ${ds(x.b)}}}`, a: ds(x.q), w: M(divWork(x)), m: 3, lines: 6, chk: num(`${py(x.a)}/${py(x.b)}`, x.q) }] };
  },
};
