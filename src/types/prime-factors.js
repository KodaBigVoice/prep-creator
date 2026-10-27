import { factorise, indexTex } from './hcf-lcm.js';

export default {
  id: 'prime-factorisation',
  topic: 'Prime factorisation', type: 'Prime factorisation in index form', code: 'PF',
  levels: ['Core', 'Additional'],
  search: 'product of prime factors index form factor tree',
  verb: '', marks: 3, lines: 5,
  variants: [
    { id: 'one', label: 'one number', params: {} },
  ],
  generate(r) {
    const n = r.until(() => {
      const x = r.int(60, 480);
      const f = factorise(x);
      return Object.keys(f).length >= 3 && Math.max(...Object.keys(f).map(Number)) <= 13 && Object.values(f).some(e => e >= 2) ? x : null;
    });
    const f = factorise(n);
    return { parts: [{ body: `Write ${n} as a product of its prime factors. Give your answer in index form.`, a: indexTex(f), w: `{{${n} = ${Object.keys(f).map(Number).sort((a, b) => a - b).flatMap(p => Array(f[p]).fill(p)).join(' \\times ')} = ${indexTex(f)}}}`,
      chk: { k: 'pf', n, a: indexTex(f) } }] };
  },
};
