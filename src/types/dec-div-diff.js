import { TOPIC, ds, py, M, num, divPair, divWork } from './decimals.js';

export default {
  id: 'dec-div-diff',
  topic: TOPIC, type: 'Dividing by a decimal: different decimal places', code: 'DC11',
  levels: ['Core', 'Additional'],
  search: 'divide by a decimal different numbers of decimal places multiply both by same power of ten',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'more', label: 'dividend has more decimal places:  0.84 ÷ 0.2', params: { rel: 'more', kbs: [1, 2], maxDpA: 3 } },
    { id: 'fewer', label: 'divisor has more decimal places:  3.6 ÷ 0.09', params: { rel: 'fewer', kbs: [2, 3], maxDpA: 2 } },
  ],
  generate(r, v) {
    const x = divPair(r, { kbs: v.kbs, rel: v.rel, maxDpA: v.maxDpA });
    return { parts: [{ body: `{{${ds(x.a)} \\div ${ds(x.b)}}}`, a: ds(x.q), w: M(divWork(x)), m: 2, lines: 4, chk: num(`${py(x.a)}/${py(x.b)}`, x.q) }] };
  },
};
