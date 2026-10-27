const trimZ = (x) => String(Math.round(x * 1e6) / 1e6);
const FAM = {
  length: [['km', 'm', 1000], ['m', 'cm', 100], ['cm', 'mm', 10], ['m', 'mm', 1000]],
  mass: [['kg', 'g', 1000], ['tonnes', 'kg', 1000]],
  capacity: [['litres', 'ml', 1000], ['litres', 'cl', 100]],
};
export default {
  id: 'units-metric',
  topic: 'Units and conversions', type: 'Metric and currency conversions', code: 'UNITC',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'convert units metric km m cm mm kg g litres ml',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'length', label: 'length', params: { fam: 'length' } },
    { id: 'mass', label: 'mass', params: { fam: 'mass' } },
    { id: 'capacity', label: 'capacity', params: { fam: 'capacity' } },
    { id: 'three', label: 'three conversions (mixed units)', params: { fam: 'mixed' } },
  ],
  generate(r, v) {
    const one = (fam) => {
      const [big, small, f] = r.pick(FAM[fam]);
      const down = r.chance(0.5);
      const val = down ? r.pick([2.5, 3.4, 0.6, 1.25, 7.8, 0.045, 12.5, 4.05]) : r.pick([3500, 450, 7200, 60, 825, 12500, 90, 2750]);
      const from = down ? big : small, to = down ? small : big;
      const ans = down ? val * f : val / f;
      const A = trimZ(ans);
      return { body: `Convert ${trimZ(val)} ${from} to ${to}.`, a: `${A}\\text{ ${to}}`, w: `{{${trimZ(val)} ${down ? '\\times' : '\\div'} ${f} = ${A}}}`, chk: { k: 'num', val: A, expr: `${val}${down ? '*' : '/'}${f}` } };
    };
    if (v.fam === 'mixed') {
      const fams = ['length', 'mass', 'capacity'];
      return { stem: 'Convert:', parts: fams.map(f => { const o = one(f); return { ...o, body: o.body.replace(/^Convert /, '').replace(/\.$/, '').replace(' to ', ' to '), m: 1, lines: 2 }; }) };
    }
    return { parts: [one(v.fam)] };
  },
};
