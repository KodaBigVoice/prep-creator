// Question check harness.
//   node tests/check.mjs                 quick structural checks (200 instances of every variant)
//   node tests/check.mjs --dump out.json also write the instances for the independent Python (sympy) checker
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TYPES, generate, hasIntegerFlag, variantD, LEVELS, levelsOf } from '../src/core/engine.js';
import { VARIANT_D } from '../src/data/difficulty.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const katex = (() => { const m = { exports: {} }; vm.runInNewContext(fs.readFileSync(path.join(here, '../vendor/katex/katex.min.js'), 'utf8'), { module: m, exports: m.exports }); return m.exports; })();
const args = process.argv.slice(2);
const N = Number((args.find(a => a.startsWith('--n=')) || '--n=200').slice(4));
const dumpIdx = args.indexOf('--dump');
const dumpFile = dumpIdx >= 0 ? args[dumpIdx + 1] : null;

// every .js file in src/types must be registered in index.js
const registered = new Set(TYPES.map(t => t.id));
const files = fs.readdirSync(path.join(here, '../src/types')).filter(f => f.endsWith('.js') && f !== 'index.js');
const idx = fs.readFileSync(path.join(here, '../src/types/index.js'), 'utf8');
const NONTYPE = new Set(['fractions.js', 'equations.js', 'factorising.js', 'expanding.js', 'fracprob.js']);          // shared helper files
const unregistered = files.filter(f => !NONTYPE.has(f) && !idx.includes(`./${f}`));

const FORBIDDEN = [/leave your answer/i, /simplest form/i, /leave .{0,30}as a mixed number/i, /undefined/, /NaN/, /\bwork out the value of\b.*\bwork out\b/i, /  +/];
const problems = []; const dump = []; const stats = [];
// every option needs a difficulty number, and the table must not mention options that no longer exist
const known = new Set();
for (const t of TYPES) for (const v of t.variants) { if (!levelsOf(t, v).length || levelsOf(t, v).some(l => !LEVELS.includes(l))) problems.push(`${t.id}:${v.id}: bad levels ${JSON.stringify(levelsOf(t, v))}`); known.add(`${t.id}:${v.id}`); if (variantD(t, v) === null) problems.push(`${t.id}:${v.id}: no difficulty set (src/data/difficulty.js)`); }
for (const k of Object.keys(VARIANT_D)) if (!known.has(k)) problems.push(`difficulty.js has an unknown option: ${k}`);
const T = (s, where) => {
  const segs = [];
  let i = 0;
  while (i < s.length) {
    if (s[i] === '{' && s[i + 1] === '{') {
      let j = i + 2, d = 0;
      for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { if (d > 0) d--; else if (s[j + 1] === '}') break; } }
      if (j >= s.length) { problems.push(`${where}: unbalanced {{ }} in: ${s}`); return; }
      segs.push(s.slice(i + 2, j)); i = j + 2;
    } else i++;
  }
  for (const t of segs) { try { katex.renderToString(t, { throwOnError: true }); } catch (e) { problems.push(`${where}: KaTeX error "${e.message.slice(0, 80)}" in ${t}`); } }
};

let total = 0;
for (const t of TYPES) {
  for (const v of t.variants) {
    const flagSets = hasIntegerFlag(t) ? [{ integer: true }, { integer: false }] : [{}];
    for (const fl of flagSets) {
      const key = `${t.id}:${v.id}${hasIntegerFlag(t) ? (fl.integer ? '[int]' : '[any]') : ''}`;
      const bodies = new Set(); let fails = 0;
      for (let s = 1; s <= N; s++) {
        let q;
        try { q = generate(`${t.id}:${v.id}`, s * 104729 + 17, fl); } catch (e) { fails++; if (fails <= 2) problems.push(`${key} seed ${s}: ${e.message}`); continue; }
        total++;
        const where = `${key} seed ${s}`;
        if (!q.parts.length) problems.push(`${where}: no parts`);
        if (q.stem) T(q.stem, where + ' stem');
        q.parts.forEach((p, i) => {
          const w2 = `${where} part ${i + 1}`;
          for (const f of ['body', 'a', 'w']) if (typeof p[f] !== 'string' || !p[f].length) problems.push(`${w2}: missing ${f}`);
          if (!(p.m >= 1) || !Number.isInteger(p.m)) problems.push(`${w2}: bad marks ${p.m}`);
          if (!(p.lines > 0)) problems.push(`${w2}: bad lines ${p.lines}`);
          T(p.body || '', w2 + ' body'); T(p.w || '', w2 + ' working');
          try { katex.renderToString(p.a, { throwOnError: true }); } catch (e) { problems.push(`${w2}: KaTeX error in answer ${p.a}`); }
          const text = (q.stem || '') + ' ' + p.body;
          for (const re of FORBIDDEN) if (re.test(text) || re.test(p.a)) problems.push(`${w2}: forbidden text ${re} in "${p.body.slice(0, 80)}"`);
          if (p.chk) dump.push({ key, seed: s, part: i, body: p.body, a: p.a, chk: p.chk });
          bodies.add((q.stem || '') + p.body);
        });
      }
      stats.push({ key, distinct: bodies.size, fails });
    }
  }
}
for (const f of unregistered) problems.push(`type file src/types/${f} is not registered in src/types/index.js`);
const low = stats.filter(s => s.distinct < Math.min(30, N * 0.3));
console.log(`Types: ${TYPES.length}   variants checked: ${stats.length}   instances: ${total}`);
if (low.length) console.log('Low variety (fewer than 30 distinct questions in ' + N + '):\n  ' + low.map(s => `${s.key} (${s.distinct})`).join('\n  '));
if (stats.some(s => s.fails)) console.log('Generator failures:\n  ' + stats.filter(s => s.fails).map(s => `${s.key}: ${s.fails}`).join('\n  '));
console.log(problems.length ? `PROBLEMS (${problems.length}):\n  ` + problems.slice(0, 60).join('\n  ') : 'No structural problems.');
if (dumpFile) { fs.writeFileSync(dumpFile, JSON.stringify(dump)); console.log(`wrote ${dump.length} checks to ${dumpFile}`); }
process.exit(problems.length ? 1 : 0);
