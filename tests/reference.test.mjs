// bank.md and for-claude.md are generated from the code and published with the site: they must match it, and the example in the guide must import.
import fs from 'fs';
import katex from '../tools/katex-node.mjs';
import { bankMd, guideMd } from '../tools/gen-reference.mjs';
import { parseImport } from '../src/data/claudeimport.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
const read = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
ok(read('bank.md') === bankMd(), 'bank.md is out of date: run  npm run docs');
ok(read('for-claude.md') === guideMd(), 'for-claude.md is out of date: run  npm run docs');
const m = /```json\n([\s\S]*?)```/.exec(guideMd());
const r = parseImport(m ? m[1] : '', { katex });
ok(m && !r.errors, 'the example in for-claude.md imports cleanly: ' + (r.errors || []).map(e => e.path + ' ' + e.message).join(' | '));
ok(r.prep && r.summary.questions === 5 && r.summary.sections === 2, 'the example builds two sections and five questions');
console.log(bad ? `${bad} FAILED` : 'reference: all ok');
process.exit(bad ? 1 : 0);
