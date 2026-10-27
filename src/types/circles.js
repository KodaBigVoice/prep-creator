const PI = Math.PI;
const rnd = (x, dp) => (Math.round(x * 10 ** dp + 1e-9) / 10 ** dp).toFixed(dp);
const safe = (x, dp) => Math.abs((x * 10 ** dp) % 1 - 0.5) > 0.02;

export default {
  id: 'circles',
  topic: 'Circles', type: 'Circumference and area', code: 'CIRC',
  levels: ['Core', 'Additional'],
  search: 'circle circumference area pi radius diameter',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'circ-calc', label: 'circumference, to 1 d.p. (calculator)', params: { k: 'circ', calc: true } },
    { id: 'area-calc', label: 'area, to 1 d.p. (calculator)', params: { k: 'area', calc: true } },
    { id: 'circ-pi', label: 'circumference in terms of π', params: { k: 'circ', calc: false } },
    { id: 'area-pi', label: 'area in terms of π', params: { k: 'area', calc: false } },
    { id: 'reverse', label: 'find the radius from the circumference', params: { k: 'rev', calc: true } },
  ],
  generate(r, v) {
    const things = [
      ['circular pond', 'm', [2.4, 3.5, 4.2, 5.5], [2, 3, 4, 5]],
      ['circular table', 'cm', [45, 60, 62.5, 75], [40, 45, 60, 75]],
      ['circular trampoline', 'm', [1.5, 1.8, 2.5, 3.2], [2, 3]],
      ['circular flower bed', 'm', [1.2, 1.5, 2.5, 3.5], [2, 3, 4]],
      ['coin', 'mm', [9, 10.5, 12, 13.5], [8, 9, 10, 12]],
      ['circular rug', 'cm', [60, 75, 90, 110], [60, 75, 90, 100]],
    ];
    const [thing, u, calcR, piR] = r.pick(things);
    const useD = r.chance(0.45);
    const R = v.calc ? r.pick(calcR) : r.pick(piR);
    const size = useD ? `diameter ${R * 2} ${u}` : `radius ${R} ${u}`;
    if (v.k === 'rev') {
      const C = r.until(() => { const c = r.int(12, 60); return safe(c / (2 * PI), 1) ? c : null; });
      const rad = C / (2 * PI);
      return { parts: [{ body: `The circumference of a circular pond is ${C} m. Calculate the radius of the pond. Give your answer correct to 1 decimal place.`, a: `${rnd(rad, 1)}\\text{ m}`, w: `{{C = 2\\pi r;\\ r = ${C} \\div (2\\pi) = ${rnd(rad, 3)}\\ldots}}`, calc: true,
        chk: { k: 'num', val: rnd(rad, 1), expr: `${C}/(2*pi)`, dp: 1 } }] };
    }
    if (v.k === 'circ') {
      const C = 2 * PI * R;
      if (v.calc) { if (!safe(C, 1)) return this.generate(r, v); return { parts: [{ body: `A ${thing} has ${size}. Calculate its circumference. Give your answer correct to 1 decimal place.`, a: `${rnd(C, 1)}\\text{ ${u}}`, w: `{{${useD ? `\\pi \\times ${R * 2}` : `2 \\times \\pi \\times ${R}`} = ${rnd(C, 3)}\\ldots}}`, calc: true, chk: { k: 'num', val: rnd(C, 1), expr: `2*pi*${R}`, dp: 1 } }] }; }
      return { parts: [{ body: `A ${thing} has ${size}. Calculate its circumference. Give your answer in terms of π.`, a: `${R * 2}\\pi\\text{ ${u}}`, w: `{{${useD ? `\\pi \\times ${R * 2}` : `2 \\times \\pi \\times ${R}`} = ${R * 2}\\pi}}`, chk: { k: 'num', val: String(R * 2), expr: `2*${R}`, mult: 'pi' } }] };
    }
    const Ar = PI * R * R;
    if (v.calc) { if (!safe(Ar, 1)) return this.generate(r, v); return { parts: [{ body: `A ${thing} has ${size}. Calculate its area. Give your answer correct to 1 decimal place.`, a: `${rnd(Ar, 1)}\\text{ ${u}}^2`, w: `{{\\pi \\times ${R}^2 = ${rnd(Ar, 3)}\\ldots}}`, calc: true, chk: { k: 'num', val: rnd(Ar, 1), expr: `pi*${R}**2`, dp: 1 } }] }; }
    const a2 = R * R;
    return { parts: [{ body: `A ${thing} has ${size}. Calculate its area. Give your answer in terms of π.`, a: `${a2}\\pi\\text{ ${u}}^2`, w: `{{\\pi \\times ${R}^2 = ${a2}\\pi}}`, chk: { k: 'num', val: String(a2), expr: `${R}**2`, mult: 'pi' } }] };
  },
};
