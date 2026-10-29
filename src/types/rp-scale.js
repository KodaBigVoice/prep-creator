import { TOPIC, M as M0, F, dstr, mk, MET, KM, CM } from './ratio.js';

// big numbers in the working get a thin space: 100\,000
const M = (t) => M0(t.replace(/\d{5,}/g, (d) => d.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')));

export default {
  id: 'rp-scale',
  topic: TOPIC, type: 'Scale drawings and maps', code: 'RP14',
  levels: ['Additional'],
  search: 'scale drawing map 1:50 1:25000 real length scale factor convert cm to m km',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'drawing', label: 'a plan:  scale 1 : 50, 4 cm on the plan', params: { k: 'd' } },
    { id: 'map', label: 'a map:  scale 1 : 25 000, 6 cm on the map', params: { k: 'm' } },
    { id: 'to-map', label: 'real distance to map length', params: { k: 't' } },
    { id: 'scale', label: 'find the scale:  4 cm on the map is 2 km', params: { k: 's' } },
  ],
  generate(r, v) {
    const sp = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    if (v.k === 'd') {
      const n = r.pick([20, 25, 40, 50, 100]), x = r.pick([3, 4, 5, 6, 8, 9, 12, 15]), real = x * n;
      return { parts: [{ body: `A plan of a room is drawn to the scale 1 : ${n}. A wall is ${x} cm long on the plan. How long is the real wall, in metres?`, a: MET.tex(new F(real, 100)), w: M(`${x} \\times ${n} = ${real}\\text{ cm} = ${dstr(new F(real, 100))}\\text{ m}`), ...mk(2, MET), chk: { k: 'num', expr: `Fraction(${x}*${n},100)`, val: dstr(new F(real, 100)) } }] };
    }
    if (v.k === 'm') {
      const n = r.pick([20000, 25000, 50000, 100000]), x = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), km = new F(x * n, 100000);
      return { parts: [{ body: `A map has a scale of 1 : ${sp(n)}. Two villages are ${x} cm apart on the map. How far apart are they in real life, in kilometres?`, a: KM.tex(km), w: M(`${x} \\times ${sp(n).replace(' ', '\\,')} = ${x * n}\\text{ cm} = ${dstr(km)}\\text{ km}`), ...mk(2, KM), chk: { k: 'num', expr: `Fraction(${x}*${n},100000)`, val: dstr(km) } }] };
    }
    if (v.k === 't') {
      const n = r.pick([20000, 25000, 50000, 100000]), cm = r.pick([2, 3, 4, 5, 6, 8, 10, 12]), km = new F(cm * n, 100000);
      return { parts: [{ body: `A map has a scale of 1 : ${sp(n)}. A lake is ${dstr(km)} km long in real life. How long is the lake on the map, in centimetres?`, a: CM.tex(new F(cm)), w: M(`${dstr(km)}\\text{ km} = ${cm * n}\\text{ cm};\\ ${cm * n} \\div ${n} = ${cm}`), ...mk(2, CM), chk: { k: 'num', expr: `Fraction('${dstr(km)}')*100000/${n}`, val: String(cm) } }] };
    }
    const n = r.pick([20000, 25000, 50000, 100000]), cm = r.pick([2, 4, 5, 8, 10]), km = new F(cm * n, 100000);
    return { parts: [{ body: `On a map, ${cm} cm represents ${dstr(km)} km in real life. Write the scale of the map in the form 1 : n.`, a: `1 : ${sp(n)}`, w: M(`${dstr(km)}\\text{ km} = ${cm * n}\\text{ cm};\\ ${cm} : ${cm * n} = 1 : ${n}`), m: 3, lines: 5, chk: { k: 'num', expr: `Fraction('${dstr(km)}')*100000/${cm}`, val: String(n) } }] };
  },
};
