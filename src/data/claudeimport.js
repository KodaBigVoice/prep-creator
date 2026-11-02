// "Import from Claude": a small JSON file that describes a whole prep or worksheet, and the same thing read back out of a prep.
// The format is written up for Claude in for-claude.md (made by tools/gen-reference.mjs from the notes in this file).
// Nothing here touches the page: parseImport() returns a prep (or a list of errors), and the dialog applies it.
import { entries, parsePick, defaultLines } from '../core/engine.js';
import { SETS, setById } from './sets.js';
import { makeSlot, newPrep, uid, reseed, setFlags, setMarks, setLines, isCustom } from './prep.js';
import { normalizeSections, sectionsOf, hasSections } from './sections.js';
import { composeQuestion, slotParts } from '../layout/compose.js';
import { coverFromImport } from './cover.js';

export const FORMAT_VERSION = 1;

// ---- helpers ----
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
function lev(a, b) {
  const m = a.length, n = b.length; if (Math.abs(m - n) > 6) return 99;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
let _keys = null;
const allKeys = () => (_keys ??= entries().map(e => e.key));
// the closest real keys to a wrong one
export function suggestKeys(bad, n = 4) {
  const s = String(bad).toLowerCase().trim(), [t] = s.split(':');
  const sameType = allKeys().filter(k => k.split(':')[0] === t);
  if (sameType.length) return sameType.slice(0, 8);                         // the right type with a wrong option: list that type's options
  const close = allKeys().map(k => [lev(s, k.toLowerCase()), k]).filter(x => x[0] <= 5).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
  if (close.length) return close;
  const word = s.replace(/[^a-z0-9]+/g, ' ').trim();                         // a topic or a few words: the options that mention them
  return word.length > 2 ? entries().filter(e => e.hay.includes(word)).slice(0, n + 1).map(e => e.key) : [];
}

// text with {{maths}} in it: the pieces, or an error message
export function segments(s) {
  const out = []; let i = 0, plain = '';
  while (i < s.length) {
    if (s[i] === '{' && s[i + 1] === '{') {
      let j = i + 2, d = 0;
      for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { if (d > 0) d--; else if (s[j + 1] === '}') break; } }
      if (j >= s.length) throw new Error('a {{ is never closed with }}');
      if (plain) out.push({ math: false, text: plain }); plain = '';
      out.push({ math: true, text: s.slice(i + 2, j) }); i = j + 2;
    } else { if (s[i] === '}' && s[i + 1] === '}') throw new Error('a }} has no {{ before it'); plain += s[i]; i++; }
  }
  if (plain) out.push({ math: false, text: plain });
  return out;
}
// checks that every {{…}} renders
function checkMath(s, katex) {
  const segs = segments(s);
  if (katex) for (const g of segs) if (g.math) { try { katex.renderToString(g.text, { throwOnError: true }); } catch (e) { throw new Error(`the maths {{${g.text}}} does not render (${String(e.message).replace(/^KaTeX parse error: /, '').split('\n')[0]})`); } }
}
// An answer is LaTeX. If it was written with {{…}} like the question text, the words outside become \text{…}.
export function answerToTex(a) {
  const s = String(a).trim();
  if (!s.includes('{{')) return s;
  return segments(s).map(g => (g.math ? g.text : `\\text{${g.text.replace(/([%$&#_{}])/g, '\\$1')}}`)).join('');
}
const intIn = (x, lo, hi) => Number.isInteger(x) && x >= lo && x <= hi;

// Pull the JSON out of whatever was pasted: a code fence, or chat text around it
export function extractJson(text) {
  let t = String(text || '').trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(t);
  if (fence) t = fence[1].trim();
  const a = t.indexOf('{'), b = t.lastIndexOf('}');
  if (a > 0 || (b >= 0 && b < t.length - 1)) t = t.slice(a, b + 1);
  return t;
}

// ---- reading a file ----
// opts: { setId (the set to use when the file names none), katex (to check the maths), cover (the saved cover, as a base) }
// returns { errors:[{path,message}] }  or  { prep, layout, warnings:[{path,message}], summary }
export function parseImport(text, opts = {}) {
  const errors = [], warnings = [];
  const err = (path, message) => errors.push({ path, message });
  const warn = (path, message) => warnings.push({ path, message });
  let spec;
  try { spec = JSON.parse(extractJson(text)); } catch (e) { return { errors: [{ path: '(file)', message: 'This is not valid JSON: ' + e.message + '. It must be one JSON object, as in the format guide.' }] }; }
  if (!isObj(spec)) return { errors: [{ path: '(file)', message: 'The file must be one JSON object { … }.' }] };
  if (spec.pmu !== FORMAT_VERSION) err('pmu', `"pmu" must be ${FORMAT_VERSION} (the format version); found ${JSON.stringify(spec.pmu)}.`);
  const setId = spec.set === undefined ? (opts.setId || 'Y7 Additional') : spec.set;
  if (!setById[setId]) err('set', `Unknown set ${JSON.stringify(setId)}. Use one of: ${SETS.map(s => s.id).join(', ')}.`);
  const name = spec.name === undefined ? 'Imported sheet' : spec.name;
  if (typeof name !== 'string' || !name.trim()) err('name', '"name" must be some text.');
  if (spec.minutes !== undefined && !intIn(spec.minutes, 1, 300)) err('minutes', '"minutes" must be a whole number (e.g. 30).');
  if (spec.calculator !== undefined && !['any', 'non'].includes(spec.calculator)) err('calculator', '"calculator" must be "any" or "non" (non-calculator).');
  const lay = spec.layout === undefined ? {} : spec.layout;
  if (!isObj(lay)) err('layout', '"layout" must be an object like { "mode": "qo", "marks": false }.');
  else {
    if (lay.mode !== undefined && !['qo', 'aos'].includes(lay.mode)) err('layout.mode', '"mode" must be "qo" (questions only) or "aos" (answer on sheet).');
    for (const k of ['marks', 'nameLine']) if (lay[k] !== undefined && typeof lay[k] !== 'boolean') err('layout.' + k, `"${k}" must be true or false.`);
  }
  // the questions: either "sections" or a plain "questions" list
  let blocks;
  if (spec.sections !== undefined && spec.questions !== undefined) err('(file)', 'Give either "sections" or "questions", not both.');
  if (spec.sections !== undefined) {
    if (!Array.isArray(spec.sections) || !spec.sections.length) err('sections', '"sections" must be a list with at least one section.');
    else blocks = spec.sections.map((s, i) => {
      if (!isObj(s)) { err(`sections[${i}]`, 'A section must be an object like { "title": "…", "questions": [ … ] }.'); return null; }
      if (s.title !== undefined && typeof s.title !== 'string') err(`sections[${i}].title`, '"title" must be some text.');
      if (!Array.isArray(s.questions) || !s.questions.length) { err(`sections[${i}].questions`, 'Each section needs a list of questions.'); return null; }
      return { title: typeof s.title === 'string' ? s.title.trim() : '', qs: s.questions, path: `sections[${i}].questions` };
    });
  } else if (Array.isArray(spec.questions) && spec.questions.length) blocks = [{ title: null, qs: spec.questions, path: 'questions' }];
  else if (spec.questions !== undefined) err('questions', '"questions" must be a list with at least one question.');
  else err('(file)', 'The file needs "sections" (each with "questions") or a plain "questions" list.');
  if (errors.length || !blocks) return { errors };

  const set = setById[setId];
  const prep = newPrep({ set: setId, name: name.trim(), minutes: spec.minutes ?? set.minutes });
  const seen = new Set();
  const katex = opts.katex;
  blocks.forEach((blk) => {
    if (!blk) return;
    let first = true;
    blk.qs.forEach((qs, qi) => {
      const path = `${blk.path}[${qi}]`;
      const q = buildQuestion(qs, path, { err, warn, katex, seen });
      if (!q) return;
      if (first && blk.title !== null) { q.sec = { title: blk.title }; }
      first = false;
      prep.questions.push(q);
    });
    // a section whose questions all failed has no heading to carry; errors say so already
  });
  if (errors.length) return { errors };
  normalizeSections(prep);
  prep.calcMode = spec.calculator === 'non' ? 'non' : 'any';
  prep.nameAuto = false;
  const layout = {};
  if (isObj(lay)) for (const k of ['mode', 'marks', 'nameLine']) if (lay[k] !== undefined) layout[k] = lay[k];
  if (spec.cover !== undefined && spec.cover !== false) prep.cover = coverFromImport(spec.cover, setId, opts.cover);
  const n = prep.questions.length, marks = prep.questions.reduce((a, q) => a + q.slots.reduce((b, s) => b + s.marks.reduce((c, m) => c + m, 0), 0), 0);
  const ns = hasSections(prep) ? sectionsOf(prep).length : 0;
  return { prep, layout, warnings, summary: { questions: n, marks, sections: ns, written: prep.questions.filter(q => q.slots.some(isCustom)).length } };
}

function buildQuestion(q, path, { err, warn, katex, seen }) {
  if (!isObj(q)) { err(path, 'A question must be an object.'); return null; }
  const hasPick = q.pick !== undefined, parts = q.parts;
  const bankParts = Array.isArray(parts) && parts.length && parts.every(p => isObj(p) && p.pick !== undefined);
  const customParts = Array.isArray(parts) && parts.length && parts.every(p => isObj(p) && p.text !== undefined);
  if (parts !== undefined && !Array.isArray(parts)) { err(path + '.parts', '"parts" must be a list.'); return null; }
  if (Array.isArray(parts) && !parts.length) { err(path + '.parts', '"parts" must not be empty.'); return null; }
  if (hasPick && parts === undefined) return bankQuestion([{ ...q }], path, { err, warn, seen }, q.marks, q.lines);
  if (bankParts && !hasPick) return bankQuestion(parts, path + '.parts', { err, warn, seen }, undefined, undefined, true);
  if (q.text !== undefined && parts === undefined) return customQuestion(q.stem, [q], path, { err, katex }, true);
  if (customParts && !hasPick) return customQuestion(q.stem, parts, path, { err, katex }, false);
  if (Array.isArray(parts) && parts.some(p => isObj(p) && p.pick !== undefined) && parts.some(p => isObj(p) && p.text !== undefined)) err(path, 'A question is either all bank options ("pick") or all written out ("text"), not a mixture. Split it into two questions, or write the whole thing out.');
  else err(path, 'Not recognised. A question needs a "pick" (a bank key), or "parts" each with a "pick", or "text" and "answer" (written out). See the format guide.');
  return null;
}

// ---- a question from the bank ----
function bankQuestion(list, path, { err, warn, seen }, marks0, lines0, multi = false) {
  const slots = []; let bad = false;
  list.forEach((p, i) => {
    const pp = multi ? `${path}[${i}]` : path;
    if (typeof p.pick !== 'string' || !p.pick.trim()) { err(pp + '.pick', '"pick" must be a bank key such as "pct-buildup:fives".'); bad = true; return; }
    const key = p.pick.trim(), parsed = key.includes(':') && !key.endsWith(':*') ? parsePick(key) : null;
    if (!parsed || `${parsed.t.id}:${parsed.v.id}` !== key) {
      const sug = suggestKeys(key);
      err(pp + '.pick', `${JSON.stringify(key)} is not a key in the bank.${key.includes(':') ? '' : ' A key has two halves, like "pct-buildup:fives".'}${sug.length ? ' Did you mean: ' + sug.map(k => JSON.stringify(k)).join(', ') + '?' : ''}`); bad = true; return;
    }
    if (p.seed !== undefined && !intIn(p.seed, 0, 2 ** 31)) { err(pp + '.seed', '"seed" must be a whole number.'); bad = true; return; }
    if (p.integer !== undefined && typeof p.integer !== 'boolean') { err(pp + '.integer', '"integer" must be true or false.'); bad = true; return; }
    const slot = makeSlot({ mode: 'fixed', pick: key });
    if (p.seed !== undefined) reseed(slot, p.seed);
    if (p.integer === false && parsed.t.integer) setFlags(slot, { integer: false });
    if (p.integer === false && !parsed.t.integer) warn(pp + '.integer', 'This option has no integer setting, so "integer": false does nothing.');
    // the same question twice on one sheet: new numbers (unless the numbers were pinned with a seed)
    const sig = () => key + '|' + slot.snapshot.parts.map(x => x.body).join('|');
    for (let t = 0; t < 14 && seen.has(sig()) && p.seed === undefined; t++) reseed(slot);
    seen.add(sig());
    const np = slot.marks.length;
    const m = p.marks !== undefined ? p.marks : (list.length === 1 ? marks0 : undefined), l = p.lines !== undefined ? p.lines : (list.length === 1 ? lines0 : undefined);
    const apply = (v, what, fn, ok) => {
      if (v === undefined) return;
      const arr = Array.isArray(v) ? v : (np === 1 ? [v] : null);
      if (!arr || arr.length !== np) { err(pp + '.' + what, `"${what}" for this option must be a list of ${np} number${np === 1 ? '' : 's'} (one for each part it makes)${np > 1 ? `, e.g. [${Array(np).fill(2).join(', ')}]` : ''}.`); bad = true; return; }
      arr.forEach((x, k) => { if (!ok(x)) { err(`${pp}.${what}`, `"${what}" must be ${what === 'marks' ? 'whole numbers from 1 to 20' : 'numbers from 0.5 to 30'}.`); bad = true; } else fn(slot, k, x); });
    };
    apply(m, 'marks', setMarks, (x) => intIn(x, 1, 20));
    apply(l, 'lines', setLines, (x) => typeof x === 'number' && x >= 0.5 && x <= 30);
    slots.push(slot);
  });
  return bad ? null : { id: uid(), slots };
}

// ---- a question written out in full ----
function customQuestion(stem, list, path, { err, katex }, single) {
  let bad = false;
  const check = (what, s, pp, required) => {
    if (s === undefined || s === null || s === '') { if (required) { err(pp, `"${what}" is required.`); bad = true; } return false; }
    if (typeof s !== 'string') { err(pp, `"${what}" must be text.`); bad = true; return false; }
    try { checkMath(s, katex); } catch (e) { err(pp, `In "${what}": ${e.message}.`); bad = true; return false; }
    return true;
  };
  if (stem !== undefined && stem !== null) check('stem', stem, path + '.stem', false);
  const parts = list.map((p, i) => {
    const pp = single ? path : `${path}.parts[${i}]`;
    if (!isObj(p)) { err(pp, 'A part must be an object.'); bad = true; return null; }
    const okT = check('text', p.text, pp + '.text', true), okA = check('answer', p.answer, pp + '.answer', true), okW = check('working', p.working, pp + '.working', false);
    let a = null;
    if (okA) { try { a = answerToTex(p.answer); if (katex) katex.renderToString(a, { throwOnError: true }); } catch (e) { err(pp + '.answer', `The answer does not render as LaTeX (${String(e.message).replace(/^KaTeX parse error: /, '').split('\n')[0]}). Use plain LaTeX like "x = 12" or "\\dfrac{3}{4}", and \\text{…} for words.`); bad = true; } }
    const m = p.marks === undefined ? 1 : p.marks, l = p.lines;
    if (!intIn(m, 1, 20)) { err(pp + '.marks', '"marks" must be a whole number from 1 to 20.'); bad = true; }
    if (l !== undefined && !(typeof l === 'number' && l >= 0.5 && l <= 30)) { err(pp + '.lines', '"lines" (ruled lines of working space) must be a number from 0.5 to 30.'); bad = true; }
    if (p.calculator !== undefined && typeof p.calculator !== 'boolean') { err(pp + '.calculator', '"calculator" must be true or false.'); bad = true; }
    return okT && okA && !bad ? { body: p.text, a, w: okW ? p.working : '', calc: !!p.calculator, m, lines: l } : null;
  });
  if (bad || parts.some(x => !x)) return null;
  const def = { mode: 'custom', parts: parts.map(p => ({ ...p, lines: p.lines ?? defaultLines(p.m) })) };
  if (stem) def.stem = stem;
  return { id: uid(), slots: [makeSlot(def)] };
}

// ---- writing a prep out ----
// A bank question is written as its option and its seed (the same numbers come back); anything hand-edited or written out is written in full.
export function exportForClaude(prep, layout = {}) {
  const sections = hasSections(prep) ? sectionsOf(prep) : null;
  const one = (q, i) => {
    const edited = q.slots.some(s => s.edits && s.edits.parts && Object.keys(s.edits.parts).length || s.edits && s.edits.stem !== undefined);
    const anyCustom = q.slots.some(isCustom);
    if (!edited && !anyCustom) {
      const bank = q.slots.map(s => {
        const o = { pick: s.pick, seed: s.seed };
        if (s.flags && s.flags.integer === false) o.integer = false;
        const m = s.marks.some((x, k) => x !== s.markDefaults[k]) ? s.marks.slice() : null; if (m) o.marks = m.length === 1 ? m[0] : m;
        const l = s.lines.some((x, k) => x !== s.lineDefaults[k]) ? s.lines.slice() : null; if (l) o.lines = l.length === 1 ? l[0] : l;
        return o;
      });
      return bank.length === 1 ? bank[0] : { parts: bank };
    }
    const cq = composeQuestion(q, String(i + 1));
    const parts = cq.parts.map(p => { const o = { text: p.text, answer: p.a, marks: p.marks }; if (p.w) o.working = p.w; if (p.lines !== undefined) o.lines = p.lines; if (p.calc) o.calculator = true; return o; });
    const out = {}; if (cq.stem) out.stem = cq.stem;
    if (parts.length === 1 && !cq.stem) return { ...parts[0] };
    out.parts = parts; return out;
  };
  const out = { pmu: FORMAT_VERSION, name: prep.name, set: prep.set, minutes: prep.minutes };
  if (prep.calcMode === 'non') out.calculator = 'non';
  const lay = {}; if (layout.mode) lay.mode = layout.mode; if (layout.marks === false) lay.marks = false; if (layout.mode === 'aos' && layout.nameLine === false) lay.nameLine = false;
  if (Object.keys(lay).length) out.layout = lay;
  if (sections) out.sections = sections.map(s => ({ title: s.sec.title || '', questions: prep.questions.slice(s.start, s.end).map((q, k) => one(q, s.start + k)) }));
  else out.questions = prep.questions.map(one);
  return out;
}
