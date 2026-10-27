import { names } from '../core/q.js';

export default {
  id: 'area-shapes',
  topic: 'Area', type: 'Rectangles, triangles, trapezia', code: 'AREA',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'area perimeter trapezium triangle rectangle parallelogram',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'triangle', label: 'triangle', params: { k: 'tri' } },
    { id: 'trapezium', label: 'trapezium', params: { k: 'trap' } },
    { id: 'parallelogram', label: 'parallelogram', params: { k: 'par' } },
    { id: 'rect-missing', label: 'rectangle: find a missing length', params: { k: 'miss' } },
    { id: 'trap-height', label: 'trapezium: find the height', params: { k: 'trapH' } },
  ],
  generate(r, v) {
    if (v.k === 'tri') {
      const b = r.int(5, 20), h = r.until(() => { const x = r.int(4, 16); return (b * x) % 2 === 0 ? x : null; });
      return { parts: [{ body: `A triangle has a base of ${b} cm and a perpendicular height of ${h} cm. Calculate the area of the triangle.`, a: `${b * h / 2}\\text{ cm}^2`, w: `{{\\tfrac{1}{2} \\times ${b} \\times ${h} = ${b * h / 2}}}`, chk: { k: 'num', val: String(b * h / 2), expr: `${b}*${h}/2` } }] };
    }
    if (v.k === 'trap') {
      const [a, b, h] = r.until(() => { const a = r.int(4, 14), b = r.int(a + 2, 22), h = r.int(3, 12); return (a + b) * h % 2 === 0 ? [a, b, h] : null; });
      return { parts: [{ body: `A trapezium has parallel sides of length ${a} cm and ${b} cm. The perpendicular distance between the parallel sides is ${h} cm. Calculate the area of the trapezium.`, a: `${(a + b) * h / 2}\\text{ cm}^2`, w: `{{\\tfrac{1}{2}(${a} + ${b}) \\times ${h} = ${(a + b) * h / 2}}}`, chk: { k: 'num', val: String((a + b) * h / 2), expr: `(${a}+${b})*${h}/2` } }] };
    }
    if (v.k === 'par') {
      const b = r.int(6, 20), h = r.int(4, 14);
      return { parts: [{ body: `A parallelogram has a base of ${b} cm and a perpendicular height of ${h} cm. Calculate its area.`, a: `${b * h}\\text{ cm}^2`, w: `{{${b} \\times ${h} = ${b * h}}}`, chk: { k: 'num', val: String(b * h), expr: `${b}*${h}` } }] };
    }
    if (v.k === 'miss') {
      const [w, l] = r.until(() => { const w = r.int(4, 14), l = r.int(w + 2, 25); return [w, l]; });
      return { parts: [{ body: `A rectangular garden has an area of ${w * l} m². Its width is ${w} m. Calculate the perimeter of the garden.`, a: `${2 * (w + l)}\\text{ m}`, w: `{{${w * l} \\div ${w} = ${l};\\ 2(${l} + ${w}) = ${2 * (w + l)}}}`, chk: { k: 'num', val: String(2 * (w + l)), expr: `2*(${w * l}/${w}+${w})` } }] };
    }
    const [a, b, h] = r.until(() => { const a = r.int(4, 12), b = r.int(a + 2, 20), h = r.int(3, 12); return (a + b) * h % 2 === 0 ? [a, b, h] : null; });
    const A = (a + b) * h / 2;
    return { parts: [{ body: `A trapezium has an area of ${A} cm². Its parallel sides are ${a} cm and ${b} cm long. Calculate the perpendicular distance between the parallel sides.`, a: `${h}\\text{ cm}`, w: `{{${A} = \\tfrac{1}{2}(${a} + ${b})h;\\ h = ${A} \\div ${(a + b) / 2} = ${h}}}`, chk: { k: 'num', val: String(h), expr: `${A}*2/(${a}+${b})` } }] };
  },
};
