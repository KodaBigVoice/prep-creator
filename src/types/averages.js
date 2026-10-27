import { F } from '../core/frac.js';
const arrTex = (a) => a.join(',\\ ');
export default {
  id: 'averages',
  topic: 'Averages', type: 'Mean, median, mode, range', code: 'MEAN',
  levels: ['Foundation', 'Core'],
  search: 'mean median mode range average list of numbers',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'three', label: 'mean, median and range from a list', params: { k: 'three' } },
    { id: 'mode', label: 'mode, median and range from a list', params: { k: 'mode' } },
  ],
  generate(r, v) {
    const n = r.pick([7, 8, 9]);
    const list = r.until(() => {
      const base = Array.from({ length: n }, () => r.int(2, 30));
      const sum = base.reduce((a, b) => a + b);
      if (v.k === 'three' && sum % n !== 0) return null;
      const counts = {}; base.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
      const mx = Math.max(...Object.values(counts));
      if (v.k === 'mode' && !(mx >= 2 && Object.values(counts).filter(c => c === mx).length === 1)) return null;
      const s = base.slice().sort((a, b) => a - b);
      const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
      return Number.isInteger(med * 2) && Math.max(...base) - Math.min(...base) >= 8 ? base : null;
    });
    const s = list.slice().sort((a, b) => a - b);
    const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
    const range = s[n - 1] - s[0];
    const ctx = r.pick([['The marks of', 'pupils in a test are', ''], ['The ages, in years, of', 'members of a swimming club are', ''], ['The number of goals scored by a team in', 'matches are', '']]);
    let intro;
    if (ctx[0].startsWith('The marks')) intro = `The marks of ${n} pupils in a test are:`;
    else if (ctx[0].startsWith('The ages')) intro = `The ages, in years, of ${n} members of a swimming club are:`;
    else intro = `The numbers of goals scored by a team in ${n} matches are:`;
    const stem = `${intro} {{${arrTex(list)}}}`;
    const medW = `\\text{ordered: }${arrTex(s)}`;
    const mean = list.reduce((a, b) => a + b) / n;
    const parts = [];
    if (v.k === 'three') {
      parts.push({ body: 'Work out the mean.', a: String(mean), w: `{{\\text{sum} = ${list.reduce((a, b) => a + b)};\\ ${list.reduce((a, b) => a + b)} \\div ${n} = ${mean}}}`, m: 2, lines: 3, chk: { k: 'num', val: String(mean), expr: `(${list.join('+')})/${n}` } });
    } else {
      const counts = {}; list.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
      const mode = Number(Object.keys(counts).find(k => counts[k] === Math.max(...Object.values(counts))));
      parts.push({ body: 'Write down the mode.', a: String(mode), w: `{{\\text{most common value}}}`, m: 1, lines: 2, chk: { k: 'mode', list, val: String(mode) } });
    }
    parts.push({ body: 'Work out the median.', a: String(med), w: `{{${medW};\\ \\text{median} = ${med}}}`, m: 2, lines: 3, chk: { k: 'median', list, val: String(med) } });
    parts.push({ body: 'Work out the range.', a: String(range), w: `{{${s[n - 1]} - ${s[0]} = ${range}}}`, m: 1, lines: 2, chk: { k: 'num', val: String(range), expr: `${Math.max(...list)}-${Math.min(...list)}` } });
    return { stem, parts };
  },
};
