import { gcd } from '../core/frac.js';
import { names, pounds } from '../core/q.js';

export default {
  id: 'ratio-share',
  topic: 'Ratio', type: 'Share in a ratio', code: 'RSH',
  levels: ['Foundation', 'Core'],
  search: 'share divide in the ratio',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'two', label: 'two-part ratio', params: { k: 2 } },
    { id: 'three', label: 'three-part ratio', params: { k: 3 } },
    { id: 'one', label: 'two-part, find one share', params: { k: 1 } },
  ],
  generate(r, v) {
    const parts = v.k === 3 ? 3 : 2;
    const ratio = r.until(() => {
      const x = Array.from({ length: parts }, () => r.int(1, 7));
      const g = x.reduce((a, b) => gcd(a, b));
      return g === 1 && new Set(x).size === parts && x.reduce((a, b) => a + b) <= 15 ? x : null;
    });
    const sum = ratio.reduce((a, b) => a + b);
    const unit = r.int(3, 40) * (sum > 8 ? 1 : 2);
    const total = sum * unit;
    const who = names(r, parts);
    const rs = ratio.join(' : ');
    const shares = ratio.map(x => x * unit);
    const names2 = who.length === 2 ? `${who[0]} and ${who[1]}` : `${who[0]}, ${who[1]} and ${who[2]}`;
    const what = r.pick([['£', 'money'], ['sweets', 'sweets'], ['stickers', 'stickers']]);
    const amt = what[1] === 'money' ? pounds(total) : `${total} ${what[0]}`;
    const fmt = (x) => (what[1] === 'money' ? `\\pounds ${x}` : String(x));
    let body, a, w;
    if (v.k === 1) {
      body = `${who[0]} and ${who[1]} share ${amt} in the ratio ${rs}. Work out how much ${who[1]} receives.`.replace('how much', what[1] === 'money' ? 'how much' : 'how many ' + what[0] + ' ');
      if (what[1] !== 'money') body = `${who[0]} and ${who[1]} share ${amt} in the ratio ${rs}. How many ${what[0]} does ${who[1]} receive?`;
      a = fmt(shares[1]); w = `${total} \\div ${sum} = ${unit};\\ ${unit} \\times ${ratio[1]} = ${shares[1]}`;
    } else {
      body = `${names2} share ${amt} in the ratio ${rs}. Work out how ${what[1] === 'money' ? 'much' : 'many ' + what[0]} each person receives.`;
      if (what[1] !== 'money') body = `${names2} share ${amt} in the ratio ${rs}. Work out how many ${what[0]} each person receives.`;
      a = who.map((nm, i) => `\\text{${nm}: }${fmt(shares[i])}`).join(',\\ ');
      w = `${total} \\div ${sum} = ${unit};\\ ` + shares.map((s, i) => `${ratio[i]} \\times ${unit} = ${s}`).join(',\\ ');
    }
    return { parts: [{ body, a, w: `{{${w}}}`, chk: { k: 'num', val: String(v.k === 1 ? shares[1] : shares.join(',')), expr: v.k === 1 ? `${total}/${sum}*${ratio[1]}` : `[${ratio.map(x => `${total}/${sum}*${x}`).join(',')}]` } }] };
  },
};
