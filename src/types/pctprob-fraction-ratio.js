import { PTOPIC, M, F, names, dstr, valOf, mk, numChk } from './percentages.js';

export default {
  id: 'pctprob-fraction-ratio',
  topic: PTOPIC, type: 'Percentages with fractions and ratio', code: 'PP9',
  levels: ['Additional'],
  search: 'percentage with fractions and ratio mixed worded problem girls boys hockey',
  verb: '', marks: 4, lines: 8,
  variants: [
    { id: 'fraction', label: 'a fraction of the group, then a percentage', params: { k: 'fr' } },
    { id: 'percent-fraction', label: 'a percentage of the group, then a fraction', params: { k: 'pf' } },
    { id: 'ratio', label: 'a ratio, then a percentage', params: { k: 'ra' } },
  ],
  generate(r, v) {
    const [n] = names(r, 1);
    if (v.k === 'fr') {
      const [N, f, p] = r.until(() => { const N = r.pick([50, 75, 100, 125, 150, 200, 250, 300, 400]), f = r.pick([[3, 5], [2, 5], [3, 4], [1, 4], [2, 3], [1, 2]]), p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]); const g = F.of(N).mul(f[0]).div(f[1]); return g.isInt && valOf(g, p).isInt ? [N, f, p] : null; });
      const g = F.of(N).mul(f[0]).div(f[1]), a = valOf(g, p), group = r.pick([['girls', 'hockey'], ['girls', 'netball'], ['boys', 'football'], ['boys', 'rugby']]);
      const other = group[0] === 'girls' ? 'girls' : 'boys';
      return { parts: [{ body: `There are ${N} pupils in a year group. {{\\dfrac{${f[0]}}{${f[1]}}}} of the pupils are ${other}. ${p}% of the ${other} play ${group[1]}. How many ${other} play ${group[1]}?`, a: String(a.n), w: M(`\\dfrac{${f[0]}}{${f[1]}} \\text{ of } ${N} = ${dstr(g)};\\ ${p}\\% \\text{ of } ${dstr(g)} = ${dstr(a)}`), m: 4, lines: 7, chk: numChk(`${N}*${f[0]}/${f[1]}*${p}/100`, a) }] };
    }
    if (v.k === 'pf') {
      const [N, p, f] = r.until(() => { const N = r.pick([100, 200, 240, 300, 400, 500, 600]), p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]), f = r.pick([[3, 5], [2, 5], [3, 4], [1, 4], [2, 3], [1, 3], [1, 5]]); const g = valOf(N, p); return g.isInt && g.mul(f[0]).div(f[1]).isInt ? [N, p, f] : null; });
      const g = valOf(N, p), a = g.mul(f[0]).div(f[1]);
      return { parts: [{ body: `A school has ${N} pupils. ${p}% of the pupils are in Year 7. {{\\dfrac{${f[0]}}{${f[1]}}}} of the Year 7 pupils play in the orchestra. How many Year 7 pupils play in the orchestra?`, a: String(a.n), w: M(`${p}\\% \\text{ of } ${N} = ${dstr(g)};\\ \\dfrac{${f[0]}}{${f[1]}} \\text{ of } ${dstr(g)} = ${dstr(a)}`), m: 4, lines: 7, chk: numChk(`${N}*${p}/100*${f[0]}/${f[1]}`, a) }] };
    }
    const [N, [x, y], p] = r.until(() => { const N = r.pick([50, 100, 150, 200, 250, 300, 400, 500]), rt = r.pick([[2, 3], [3, 2], [1, 4], [3, 7], [2, 3], [3, 5], [4, 1]]), p = r.pick([10, 20, 25, 30, 40, 50, 60, 75]); const tot = rt[0] + rt[1]; const boys = F.of(N).mul(rt[0]).div(tot); return boys.isInt && valOf(boys, p).isInt ? [N, rt, p] : null; });
    const boys = F.of(N).mul(x).div(x + y), a = valOf(boys, p);
    return { parts: [{ body: `The ratio of boys to girls in a swimming club is ${x} : ${y}. There are ${N} children in the club. ${p}% of the boys can swim 50 metres. How many boys can swim 50 metres?`, a: String(a.n), w: M(`${x} + ${y} = ${x + y};\\ ${N} \\div ${x + y} \\times ${x} = ${dstr(boys)};\\ ${p}\\% \\text{ of } ${dstr(boys)} = ${dstr(a)}`), m: 4, lines: 7, chk: numChk(`${N}*${x}/${x + y}*${p}/100`, a) }] };
  },
};
