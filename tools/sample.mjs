// node tools/sample.mjs [typeId]  -- print one example of every variant (for reading through the wording)
import { TYPES, generate } from '../src/core/engine.js';
const only = process.argv[2];
const strip = (s) => s.replace(/\{\{(.*?)\}\}/g, '[$1]');
for (const t of TYPES) {
  if (only && t.id !== only) continue;
  for (const v of t.variants) {
    const q = generate(`${t.id}:${v.id}`, 20260101);
    console.log(`\n# ${t.topic} > ${t.type} > ${v.label}`);
    if (q.stem) console.log('  STEM:', strip(q.stem));
    q.parts.forEach((p, i) => console.log(`  ${q.parts.length > 1 ? '(' + 'abcd'[i] + ') ' : ''}${p.verb ? p.verb + ' ' : ''}${strip(p.body)}   [${p.m}m, ${p.lines} lines]${p.calc ? ' CALC' : ''}\n      ans: ${p.a}`));
  }
}
