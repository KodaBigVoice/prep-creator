export default {
  id: 'proportion-inverse',
  topic: 'Proportion', type: 'Inverse proportion', code: 'PINV',
  levels: ['Core', 'Additional'],
  search: 'inverse proportion workers days time',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'workers', label: 'workers and time', params: { k: 'w' } },
  ],
  generate(r) {
    const [n1, t1, n2] = r.until(() => {
      const total = r.pick([24, 30, 36, 40, 48, 60, 72, 90, 120]);
      const divs = []; for (let d = 2; d <= 30; d++) if (total % d === 0) divs.push(d);
      const n1 = r.pick(divs), n2 = r.pick(divs);
      return n1 !== n2 && total / n1 >= 2 ? [n1, total / n1, n2] : null;
    });
    const total = n1 * t1;
    const job = r.pick([['builders', 'a wall', 'days'], ['painters', 'a large fence', 'hours'], ['gardeners', 'a park', 'days'], ['workers', 'a warehouse of boxes', 'hours']]);
    const body = `${n1} ${job[0]} take ${t1} ${job[2]} to ${job[1] === 'a wall' ? 'build a wall' : job[1] === 'a large fence' ? 'paint a large fence' : job[1] === 'a park' ? 'tidy a park' : 'unload a lorry'}. All the ${job[0]} work at the same rate. How long would it take ${n2} ${job[0]}?`;
    return { parts: [{ body, a: `${total / n2}\\text{ ${job[2]}}`, w: `{{${n1} \\times ${t1} = ${total};\\ ${total} \\div ${n2} = ${total / n2}}}`, chk: { k: 'num', val: String(total / n2), expr: `${n1}*${t1}/${n2}` } }] };
  },
};
