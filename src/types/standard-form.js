const trimZ = (x) => String(Math.round(x * 1e9) / 1e9);
const sf = (m, e) => `${trimZ(m)} \\times 10^{${e}}`;
export default {
  id: 'standard-form',
  topic: 'Standard form', type: 'Standard form', code: 'STDF',
  levels: ['Core', 'Additional'],
  search: 'standard form scientific notation',
  verb: '', marks: 2, lines: 3,
  variants: [
    { id: 'to', label: 'write a number in standard form', params: { k: 'to' } },
    { id: 'from', label: 'write as an ordinary number', params: { k: 'from' } },
    { id: 'multiply', label: 'multiply two numbers in standard form', params: { k: 'mul' } },
    { id: 'divide', label: 'divide two numbers in standard form', params: { k: 'div' } },
  ],
  generate(r, v) {
    if (v.k === 'to') {
      const m = r.pick([2.4, 3.7, 5.2, 6.1, 8.05, 1.9, 4.6, 7.3]); const e = r.pick([-6, -5, -4, -3, 3, 4, 5, 6, 7]);
      const n = m * 10 ** e; const s = e > 0 ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : n.toFixed(-e + (String(m).split('.')[1] || '').length);
      return { parts: [{ body: `Write {{${s}}} in standard form.`, a: sf(m, e), w: `{{${s} = ${sf(m, e)}}}`, chk: { k: 'num', val: trimZ(m * 10 ** e), expr: `${m}*10**${e}` } }] };
    }
    if (v.k === 'from') {
      const m = r.pick([2.4, 3.7, 5.2, 6.1, 8.05, 1.9, 4.6]); const e = r.pick([-5, -4, -3, -2, 3, 4, 5]);
      const n = m * 10 ** e; const s = e > 0 ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : n.toFixed(-e + (String(m).split('.')[1] || '').length);
      return { parts: [{ body: `Write {{${sf(m, e)}}} as an ordinary number.`, a: s, w: `{{${sf(m, e)} = ${s}}}`, chk: { k: 'num', val: trimZ(n), expr: `${m}*10**${e}` } }] };
    }
    const [m1, e1, m2, e2] = r.until(() => {
      const m1 = r.pick([2, 3, 4, 5, 6, 1.5, 2.5, 3.2, 4.8]), m2 = r.pick([2, 3, 4, 5, 1.5, 2.5, 8, 1.2]);
      const e1 = r.int(2, 8), e2 = v.k === 'mul' ? r.int(-4, 6) : r.int(1, 5);
      const prod = m1 * m2, q = m1 / m2;
      const ok = v.k === 'mul' ? Math.abs(prod * 1000 - Math.round(prod * 1000)) < 1e-6 : Math.abs(q * 1000 - Math.round(q * 1000)) < 1e-6 && q * 10 ** 3 === Math.round(q * 10 ** 3);
      return ok ? [m1, e1, m2, e2] : null;
    });
    const mm = v.k === 'mul' ? m1 * m2 : m1 / m2, ee = v.k === 'mul' ? e1 + e2 : e1 - e2;
    let M = Math.round(mm * 1e6) / 1e6, E = ee;
    while (M >= 10) { M /= 10; E += 1; }
    while (M < 1) { M *= 10; E -= 1; }
    M = Math.round(M * 1e6) / 1e6;
    const op = v.k === 'mul' ? '\\times' : '\\div';
    const q = `(${sf(m1, e1)}) ${op} (${sf(m2, e2)})`;
    const w = `${trimZ(m1)} ${op} ${trimZ(m2)} = ${trimZ(mm)};\\ 10^{${e1}} ${op} 10^{${e2}} = 10^{${ee}};\\ ${trimZ(mm)} \\times 10^{${ee}} = ${sf(M, E)}`;
    return { parts: [{ body: `Work out {{${q}}}. Give your answer in standard form.`, a: sf(M, E), w: `{{${w}}}`, chk: { k: 'num', val: trimZ(M * 10 ** E), expr: `(${m1}*10**${e1})${v.k === 'mul' ? '*' : '/'}(${m2}*10**${e2})` } }] };
  },
};
