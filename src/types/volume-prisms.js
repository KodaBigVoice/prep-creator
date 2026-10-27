export default {
  id: 'volume-prisms',
  topic: 'Volume of prisms', type: 'Volume of prisms and cuboids', code: 'VOLP',
  levels: ['Core', 'Additional'],
  search: 'volume prism cuboid cylinder triangular prism',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'cuboid', label: 'cuboid', params: { k: 'cub' } },
    { id: 'tri-prism', label: 'triangular prism', params: { k: 'tri' } },
    { id: 'cyl-pi', label: 'cylinder, in terms of π', params: { k: 'cylpi' } },
    { id: 'cyl-calc', label: 'cylinder, to 1 d.p. (calculator)', params: { k: 'cylcalc' } },
    { id: 'find-height', label: 'cuboid: find a missing length', params: { k: 'miss' } },
  ],
  generate(r, v) {
    const rnd = (x, dp) => (Math.round(x * 10 ** dp + 1e-9) / 10 ** dp).toFixed(dp);
    if (v.k === 'cub') {
      const [a, b, c] = [r.int(3, 14), r.int(3, 12), r.int(2, 10)];
      return { parts: [{ body: `A cuboid measures ${a} cm by ${b} cm by ${c} cm. Calculate its volume.`, a: `${a * b * c}\\text{ cm}^3`, w: `{{${a} \\times ${b} \\times ${c} = ${a * b * c}}}`, chk: { k: 'num', val: String(a * b * c), expr: `${a}*${b}*${c}` } }] };
    }
    if (v.k === 'tri') {
      const [b, h, l] = r.until(() => { const b = r.int(3, 12), h = r.int(3, 12), l = r.int(4, 15); return (b * h) % 2 === 0 ? [b, h, l] : null; });
      return { parts: [{ body: `A prism has a cross-section that is a triangle with base ${b} cm and perpendicular height ${h} cm. The length of the prism is ${l} cm. Calculate the volume of the prism.`, a: `${b * h * l / 2}\\text{ cm}^3`, w: `{{\\tfrac{1}{2} \\times ${b} \\times ${h} = ${b * h / 2};\\ ${b * h / 2} \\times ${l} = ${b * h * l / 2}}}`, chk: { k: 'num', val: String(b * h * l / 2), expr: `${b}*${h}/2*${l}` } }] };
    }
    if (v.k === 'cylpi') {
      const [R, H] = [r.int(2, 9), r.int(3, 15)];
      return { parts: [{ body: `A cylinder has radius ${R} cm and height ${H} cm. Calculate its volume. Give your answer in terms of π.`, a: `${R * R * H}\\pi\\text{ cm}^3`, w: `{{\\pi \\times ${R}^2 \\times ${H} = ${R * R * H}\\pi}}`, chk: { k: 'num', val: String(R * R * H), expr: `${R}**2*${H}`, mult: 'pi' } }] };
    }
    if (v.k === 'cylcalc') {
      const [R, H] = r.until(() => { const R = r.pick([2.5, 3.5, 4, 4.5, 6, 7.5]), H = r.pick([8, 10, 12, 15, 20, 9.5]); const V = Math.PI * R * R * H; return Math.abs((V * 10) % 1 - 0.5) > 0.02 ? [R, H] : null; });
      const V = Math.PI * R * R * H;
      return { parts: [{ body: `A cylindrical tin has radius ${R} cm and height ${H} cm. Calculate the volume of the tin. Give your answer correct to 1 decimal place.`, a: `${rnd(V, 1)}\\text{ cm}^3`, w: `{{\\pi \\times ${R}^2 \\times ${H} = ${rnd(V, 3)}\\ldots}}`, calc: true, chk: { k: 'num', val: rnd(V, 1), expr: `pi*${R}**2*${H}`, dp: 1 } }] };
    }
    const [a, b, c] = [r.int(3, 12), r.int(3, 10), r.int(2, 9)];
    const V = a * b * c;
    return { parts: [{ body: `A cuboid has a volume of ${V} cm³. Its length is ${a} cm and its width is ${b} cm. Calculate the height of the cuboid.`, a: `${c}\\text{ cm}`, w: `{{${a} \\times ${b} = ${a * b};\\ ${V} \\div ${a * b} = ${c}}}`, chk: { k: 'num', val: String(c), expr: `${V}/(${a}*${b})` } }] };
  },
};
