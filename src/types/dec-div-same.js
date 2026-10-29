import { TOPIC, ds, py, M, num, divPair, divWork } from './decimals.js';

export default {
  id: 'dec-div-same',
  topic: TOPIC, type: 'Dividing by a decimal: same decimal places', code: 'DC10',
  levels: ['Core'],
  search: 'divide by a decimal multiply both numbers by 10 100 1000 whole numbers same decimal places',
  verb: 'Evaluate', marks: 2, lines: 4,
  variants: [
    { id: 'x10', label: 'tenths ÷ tenths (× 10):  4.8 ÷ 0.6', params: { k: 1 } },
    { id: 'x100', label: 'hundredths ÷ hundredths (× 100):  0.36 ÷ 0.09', params: { k: 2 } },
    { id: 'x1000', label: 'thousandths ÷ thousandths (× 1000):  0.056 ÷ 0.007', params: { k: 3 }, levels: ['Core', 'Additional'] },
  ],
  generate(r, v) {
    const x = divPair(r, { kbs: [v.k], rel: 'same', daIs: v.k, maxDpA: 3 });
    return { parts: [{ body: `{{${ds(x.a)} \\div ${ds(x.b)}}}`, a: ds(x.q), w: M(divWork(x)), m: 2, lines: 4, chk: num(`${py(x.a)}/${py(x.b)}`, x.q) }] };
  },
};
