import { names } from '../core/q.js';
export default {
  id: 'mean-unknown',
  topic: 'Averages', type: 'Mean with an unknown value', code: 'MEANU',
  levels: ['Core', 'Additional'],
  search: 'mean puzzle missing value new mean',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'missing', label: 'find the missing value from the mean', params: { k: 'miss' } },
    { id: 'new', label: 'new mean after another value', params: { k: 'new' } },
  ],
  generate(r, v) {
    const [nm] = names(r, 1);
    if (v.k === 'miss') {
      const n = r.int(4, 6);
      const known = r.until(() => { const k = Array.from({ length: n - 1 }, () => r.int(5, 25)); return k; });
      const missing = r.int(5, 25);
      const total = known.reduce((a, b) => a + b) + missing;
      if (total % n !== 0) return this.generate(r, v);
      const mean = total / n;
      return { parts: [{ body: `The mean of ${n} numbers is ${mean}. Four of the numbers are ${known.slice(0, -1).join(', ')} and ${known[known.length - 1]}`.replace(/Four/, ['Zero', 'One', 'Two', 'Three', 'Four', 'Five'][n - 1]) + '. Work out the other number.', a: String(missing), w: `{{${mean} \\times ${n} = ${mean * n};\\ ${mean * n} - ${known.reduce((a, b) => a + b)} = ${missing}}}`, chk: { k: 'num', val: String(missing), expr: `${mean}*${n}-(${known.join('+')})` } }] };
    }
    const n = r.int(4, 8), mean = r.int(55, 80), extra = r.int(3, 9);
    const newMean = mean + extra;
    const test = (n + 1) * newMean - n * mean;
    return { parts: [{ body: `After ${n} tests, ${nm}'s mean mark is ${mean}. After the next test, ${nm}'s mean mark rises to ${newMean}. What mark did ${nm} get in the next test?`, a: String(test), w: `{{${n} \\times ${mean} = ${n * mean};\\ ${n + 1} \\times ${newMean} = ${(n + 1) * newMean};\\ ${(n + 1) * newMean} - ${n * mean} = ${test}}}`, chk: { k: 'num', val: String(test), expr: `${n + 1}*${newMean}-${n}*${mean}` } }] };
  },
};
