const hm = (h, m) => `${h > 0 ? `${h} hour${h > 1 ? 's' : ''}` : ''}${h > 0 && m > 0 ? ' ' : ''}${m > 0 ? `${m} minutes` : ''}`;

export default {
  id: 'speed-distance-time',
  topic: 'Speed, distance and time', type: 'Speed, distance and time', code: 'SDT',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'speed distance time average speed mph km/h',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'speed', label: 'find the speed', params: { k: 'speed' } },
    { id: 'distance', label: 'find the distance', params: { k: 'dist' } },
    { id: 'time', label: 'find the time (hours and minutes)', params: { k: 'time' } },
  ],
  generate(r, v) {
    const [S, h, m] = r.until(() => {
      const S = r.pick([12, 24, 36, 48, 60, 72, 84, 96, 108]);
      const h = r.int(1, 4), m = r.pick([10, 15, 20, 30, 40, 45]);
      return [S, h, m];
    });
    const D = S * (h + m / 60);
    const veh = r.pick([['A car', 'km', 'km/h'], ['A train', 'km', 'km/h'], ['A coach', 'miles', 'mph'], ['A cyclist', 'km', 'km/h']]);
    let [who, du, su] = veh;
    if (who === 'A cyclist') { /* keep speeds plausible */ }
    const S2 = who === 'A cyclist' ? r.pick([12, 18, 24]) : S;
    const D2 = S2 * (h + m / 60);
    if (!Number.isInteger(D2)) return this.generate(r, v);
    if (v.k === 'speed') return { parts: [{ body: `${who} travels ${D2} ${du} in ${hm(h, m)}. Calculate its average speed in ${su}.`, a: `${S2}\\text{ ${su}}`, w: `{{${hm(h, m).replace(/ hours?/, ' h').replace(' minutes', ' min')} = ${h + m / 60}\\text{ hours};\\ ${D2} \\div ${trim(h + m / 60)} = ${S2}}}`, chk: { k: 'num', val: String(S2), expr: `${D2}/(${h}+${m}/60)` } }] };
    if (v.k === 'dist') return { parts: [{ body: `${who} travels at an average speed of ${S2} ${su} for ${hm(h, m)}. How far does it travel?`, a: `${D2}\\text{ ${du}}`, w: `{{${S2} \\times ${trim(h + m / 60)} = ${D2}}}`, chk: { k: 'num', val: String(D2), expr: `${S2}*(${h}+${m}/60)` } }] };
    return { parts: [{ body: `${who} travels ${D2} ${du} at an average speed of ${S2} ${su}. How long does the journey take? Give your answer in hours and minutes.`, a: `${h}\\text{ hours } ${m}\\text{ minutes}`, w: `{{${D2} \\div ${S2} = ${trim(h + m / 60)}\\text{ hours}}}`, chk: { k: 'num', val: String(h + m / 60), expr: `${D2}/${S2}` } }] };
  },
};
function trim(x) { return String(Math.round(x * 1e6) / 1e6); }
