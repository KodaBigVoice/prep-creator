import { PTOPIC, M, F, gcd, names, ratioOf, sumOf, cf } from './ratio.js';

const SQ = 'x';
export default {
  id: 'rpprob-algebra',
  topic: PTOPIC, type: 'Ratio and algebra', code: 'RQ7',
  levels: ['Additional', 'Further'],
  search: 'ratio algebra solve unknown x equivalent ratio expressions sweets shares equation',
  verb: '', marks: 2, lines: 4,
  variants: [
    { id: 'find-x', label: 'equal ratios, find x:  x : 3 = 8 : 12', params: { k: 'x' }, levels: ['Additional'] },
    { id: 'shares', label: 'shares written as 2x and 3x, then solve (two parts)', params: { k: 's' }, levels: ['Additional'], multipart: true },
    { id: 'expr', label: 'an expression in a ratio:  (x + 2) : 5 = 3 : 1', params: { k: 'e' } },
    { id: 'link', label: 'a ratio and an equation:  a : b = 2 : 3 and 3a − b = 9', params: { k: 'l' }, levels: ['Further'] },
  ],
  generate(r, v) {
    if (v.k === 'x') {
      const [p, q] = ratioOf(r, 2, { max: 9, maxSum: 14 }), g = r.int(2, 7), c = p * g, d = q * g, form = r.int(0, 3);
      let eq, ans, w;
      const G = `${g}`, PG = `${p * g}`, QG = `${q * g}`;
      if (form === 0) { eq = `x : ${QG} = ${p} : ${q}`; ans = p * g; w = `${QG} \\div ${q} = ${G};\\ x = ${p} \\times ${G} = ${PG}`; }
      else if (form === 1) { eq = `${p} : x = ${PG} : ${QG}`; ans = q; w = `${PG} \\div ${p} = ${G};\\ x = ${QG} \\div ${G} = ${q}`; }
      else if (form === 2) { eq = `${PG} : ${QG} = x : ${q}`; ans = p; w = `${QG} \\div ${q} = ${G};\\ x = ${PG} \\div ${G} = ${p}`; }
      else { eq = `${PG} : ${QG} = ${p} : x`; ans = q; w = `${PG} \\div ${p} = ${G};\\ x = ${QG} \\div ${G} = ${q}`; }
      const expr = form === 0 ? `${p}*${q * g}/${q}` : form === 1 ? `${q * g}*${p}/${p * g}` : form === 2 ? `${p * g}*${q}/${q * g}` : `${q * g}*${p}/${p * g}`;
      return { parts: [{ verb: 'Find the value of', body: `x in the equation {{${eq}}}`, a: `x = ${ans}`, w: M(w), m: 2, lines: 4, chk: { k: 'num', expr, val: String(ans) } }] };
    }
    if (v.k === 's') {
      const [a, b] = ratioOf(r, 2, { max: 7, maxSum: 11 }), x = r.int(2, 12), tot = (a + b) * x, [n1, n2] = names(r, 2);
      return { stem: `${n1} has {{${cf(a)}x}} sweets and ${n2} has {{${cf(b)}x}} sweets. Together they have ${tot} sweets.`, parts: [
        { l: 'a', body: `Work out the value of {{x}}.`, a: `x = ${x}`, w: M(`${cf(a)}x + ${cf(b)}x = ${tot};\\ ${a + b}x = ${tot};\\ x = ${x}`), m: 2, lines: 4, chk: { k: 'num', expr: `${tot}/(${a}+${b})`, val: String(x) } },
        { l: 'b', body: `How many sweets does ${n2} have?`, a: String(b * x), w: M(`${b} \\times ${x} = ${b * x}`), m: 1, lines: 2, chk: { k: 'num', expr: `${tot}/(${a}+${b})*${b}`, val: String(b * x) } },
      ] };
    }
    if (v.k === 'e') {
      const [A, B, C, x0] = r.until(() => {
        const A = r.int(1, 4), B = r.int(-6, 7), C = r.int(2, 9), x0 = r.int(2, 12);
        const top = A * x0 + B; if (top <= 0 || B === 0) return null;
        const g = gcd(top, C), p = top / g, q = C / g; if (p + q > 12 || p === q) return null;
        return [A, B, C, x0];
      });
      const top = A * x0 + B, g = gcd(top, C), p = top / g, q = C / g;
      const lhs = `(${A === 1 ? '' : A}x ${B < 0 ? '-' : '+'} ${Math.abs(B)})`;
      return { parts: [{ verb: 'Solve', body: `{{${lhs} : ${C} = ${p} : ${q}}}`, a: `x = ${x0}`, w: M(`${lhs} \\div ${C} = ${p} \\div ${q};\\ ${A === 1 ? '' : A}x ${B < 0 ? '-' : '+'} ${Math.abs(B)} = ${top};\\ x = ${x0}`), m: 3, lines: 6, chk: { k: 'num', expr: `(Fraction(${C}*${p},${q})-(${B}))/${A}`, val: String(x0) } }] };
    }
    const [p, q] = ratioOf(r, 2, { max: 5, maxSum: 8 }), t = r.int(2, 8), [c, d, sg] = r.until(() => { const c = r.int(2, 5), d = r.int(1, 4), sg = r.chance(0.6) ? -1 : 1; const den = c * p + sg * d * q; return den > 0 ? [c, d, sg] : null; });
    const k = (c * p + sg * d * q) * t;
    return { parts: [{ body: `The ratio {{a : b}} is {{${p} : ${q}}}. Also {{${c}a ${sg < 0 ? '-' : '+'} ${d === 1 ? '' : d}b = ${k}}}. Work out the value of {{a}}.`, a: `a = ${p * t}`, w: M(`a = ${cf(p)}t,\\ b = ${cf(q)}t;\\ ${cf(c * p)}t ${sg < 0 ? '-' : '+'} ${cf(d * q)}t = ${k};\\ t = ${t};\\ a = ${p * t}`), m: 4, lines: 7, chk: { k: 'num', expr: `${k}/(${c}*${p}${sg < 0 ? '-' : '+'}${d}*${q})*${p}`, val: String(p * t) } }] };
  },
};
