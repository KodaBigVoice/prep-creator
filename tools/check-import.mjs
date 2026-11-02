// Reads an import file exactly as PMU will and prints what it would build:  node tools/check-import.mjs sheet.json [--set "Y7 Additional"]
// Exit code 1 when there are errors. Every question is listed with its marks and answer, so the answers can be checked.
import fs from 'fs';
import katex from './katex-node.mjs';
import { parseImport } from '../src/data/claudeimport.js';
import { composePrep, answerRows } from '../src/layout/compose.js';

const file = process.argv[2];
if (!file) { console.error('usage: node tools/check-import.mjs sheet.json [--set "Y7 Additional"]'); process.exit(2); }
const si = process.argv.indexOf('--set');
const r = parseImport(fs.readFileSync(file, 'utf8'), { katex, setId: si > 0 ? process.argv[si + 1] : undefined });
if (r.errors) { console.log(`${r.errors.length} problem${r.errors.length === 1 ? '' : 's'}:`); r.errors.forEach(e => console.log(`  ${e.path}: ${e.message}`)); process.exit(1); }
const plain = (s) => String(s || '').replace(/\{\{(.*?)\}\}/g, '$1').replace(/\\dfrac|\\frac/g, '\\frac');
const qs = composePrep(r.prep), rows = answerRows(qs);
console.log(`OK: "${r.prep.name}" (${r.prep.set}), ${r.summary.questions} questions, ${r.summary.marks} marks${r.summary.sections ? `, ${r.summary.sections} sections` : ''}${r.summary.written ? `, ${r.summary.written} written out` : ''}. Calculator: ${r.prep.calcMode}.`);
r.warnings.forEach(w => console.log(`  warning ${w.path}: ${w.message}`));
let last = null;
for (const q of qs) {
  if (q.section && q.section !== last) { console.log(`\n${q.section.text}`); last = q.section; }
  if (q.stem) console.log(`${q.n.padEnd(4)} ${plain(q.stem)}`);
  q.parts.forEach((p, i) => {
    const ref = `${q.n}${p.l ? `(${p.l})` : ''}`, a = rows.find(x => x.ref === ref);
    console.log(`${(q.stem && i ? '' : q.n).padEnd(4)} ${p.l ? `(${p.l}) ` : ''}${plain(p.text)}   ->  ${plain(a && a.a)}   [${p.marks}]${p.calc ? ' calc' : ''}`);
  });
}
