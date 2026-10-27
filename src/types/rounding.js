// exact decimal rounding using strings and integers (no floating point surprises)
function roundDp(intDigits, fracDigits, dp) {
  const full = BigInt(intDigits + fracDigits.padEnd(dp, '0').slice(0, dp)) * 1n;
  const next = fracDigits[dp] ? Number(fracDigits[dp]) : 0;
  let v = full + (next >= 5 ? 1n : 0n);
  let s = v.toString().padStart(dp + 1, '0');
  return s.slice(0, s.length - dp) + (dp > 0 ? '.' + s.slice(s.length - dp) : '');
}
export default {
  id: 'rounding',
  topic: 'Place value and rounding', type: 'Rounding', code: 'RND',
  levels: ['Foundation', 'Core', 'Additional'],
  search: 'round decimal places significant figures nearest',
  verb: '', marks: 3, lines: 4,
  variants: [
    { id: 'dp', label: 'decimal places (three numbers)', params: { k: 'dp' } },
    { id: 'sf', label: 'significant figures (three numbers)', params: { k: 'sf' } },
    { id: 'nearest', label: 'nearest 10, 100 or 1000 (three numbers)', params: { k: 'near' } },
  ],
  generate(r, v) {
    const parts = [];
    let verb;
    if (v.k === 'dp') {
      const dp = r.pick([1, 2, 3]);
      verb = `Round to ${dp} decimal place${dp > 1 ? 's' : ''}`;
      for (let i = 0; i < 3; i++) {
        const ip = String(r.int(0, 60)), fr = String(r.int(100000, 999999)).slice(0, dp + 3);
        const a = roundDp(ip, fr, dp);
        parts.push({ body: `{{${ip}.${fr}}}`, a: a.replace(/^0+(?=\d)/, ''), w: `{{${ip}.${fr} \\approx ${a.replace(/^0+(?=\d)/, '')}}}`, m: 1, lines: 2, chk: { k: 'round', n: `${ip}.${fr}`, dp, a: a.replace(/^0+(?=\d)/, '') } });
      }
    } else if (v.k === 'sf') {
      const sfv = r.pick([1, 2, 3]);
      verb = `Round to ${sfv} significant figure${sfv > 1 ? 's' : ''}`;
      for (let i = 0; i < 3; i++) {
        const forms = [() => { const f = String(r.int(100000, 999999)); return [`0.00${f.slice(0, 4)}`, 'small']; }, () => [`${r.int(1, 99)}.${String(r.int(1000, 9999))}`, 'mid'], () => [String(r.int(10000, 999999)), 'big']];
        const [n, kind] = r.pick(forms)();
        const num = Number(n);
        const exp = Math.floor(Math.log10(num));
        const scale = 10 ** (sfv - 1 - exp);
        const rounded = Math.round(num * scale + 1e-9) / scale;
        const dpShown = Math.max(0, sfv - 1 - exp);
        const a = dpShown > 0 ? rounded.toFixed(dpShown) : String(Math.round(rounded));
        parts.push({ body: `{{${n}}}`, a, w: `{{${n} \\approx ${a}}}`, m: 1, lines: 2, chk: { k: 'sf', n, sf: sfv, a } });
      }
    } else {
      verb = 'Round';
      const opts = [[10, 'ten'], [100, 'hundred'], [1000, 'thousand']];
      for (let i = 0; i < 3; i++) {
        const [u, name] = opts[i];
        const n = r.until(() => { const x = r.int(1200, 98999); return x % u !== u / 2 ? x : null; });
        const a = Math.round((n + 1e-9) / u) * u;
        parts.push({ body: `{{${n}}} to the nearest ${name}`, a: String(a), w: `{{${n} \\approx ${a}}}`, m: 1, lines: 2, chk: { k: 'num', val: String(a), expr: `floor(${n}/${u}+0.5)*${u}` } });
      }
    }
    return { parts: parts.map(p => ({ ...p, verb })) };
  },
};
