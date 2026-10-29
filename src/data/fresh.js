// The fresh-scenario rule: a worded question should not retell a story that has just been used.
// A scenario is its distinctive words: not numbers, names, common words, or the vocabulary any question of that option always uses
// ("increase", "percentage", "ratio"...). Two questions clash when they share two or more such words.
// Skill questions ("find 15% of 30") have no scenario words left, so they repeat freely. It is a soft rule: it picks the best of a few tries and never blocks.
import { generate } from '../core/engine.js';
import { FIRST } from '../core/q.js';
const NAMES = new Set(FIRST.map(n => n.toLowerCase()));

const STOP = new Set(`about above after again against also always another answer around because been before being below between both bring calculate calculated called cannot could does done down during each either else equal every find first from give given gives have having here into just kind later least less like made make many might more most much must need next only other over part parts same should since some such than that their them then there these they this those through times total under until upon used using value very want were what when where which while whole with without work would write still already long left remaining your hence leave exactly altogether number numbers amount answer answers work show shown correct nearest whether explain simplify evaluate solve expression`.split(/\s+/));
const mathless = (t) => String(t || '').replace(/\{\{[\s\S]*?\}\}/g, ' ').replace(/\$[^$]*\$/g, ' ').replace(/\\[a-zA-Z]+/g, ' ');
const stem = (w) => (w.length > 4 && w.endsWith('ies') ? w.slice(0, -3) + 'y' : w.length > 4 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);

// the candidate scenario words of some text (names are dropped: a capital letter in the middle of a sentence)
export function wordsOf(text) {
  const out = new Set();
  for (const sent of mathless(text).split(/(?<=[.?!:])\s+/)) {
    const toks = sent.match(/[A-Za-z][A-Za-z'-]*/g) || [];
    toks.forEach((tok, i) => {
      if (i > 0 && /^[A-Z]/.test(tok)) return;
      const w = stem(tok.toLowerCase().replace(/'s$/, ''));
      if (w.length < 4 || STOP.has(w) || NAMES.has(w) || NAMES.has(tok.toLowerCase().replace(/'s$/, ''))) return;
      out.add(w);
    });
  }
  return out;
}
const textOf = (q) => [q.stem || '', ...q.parts.map(p => p.body || '')].join(' . ');

// the words an option uses in (nearly) every question it makes: they describe the technique, not the scenario
const techCache = new Map();
export function techVocab(key) {
  if (techCache.has(key)) return techCache.get(key);
  const N = 24, count = new Map();
  for (let i = 0; i < N; i++) {
    let q; try { q = generate(key, 9000 + i * 37); } catch (e) { continue; }
    for (const w of wordsOf(textOf(q))) count.set(w, (count.get(w) || 0) + 1);
  }
  const v = new Set([...count].filter(([, c]) => c >= N * 0.3).map(([w]) => w));
  techCache.set(key, v);
  return v;
}
// the scenario of a question: its words minus the technique vocabulary
export function scene(key, text) {
  const tech = techVocab(key);
  return new Set([...wordsOf(text)].filter(w => !tech.has(w)));
}
export const sceneOfQuestion = (key, q) => scene(key, textOf(q));
export const sceneOfSlot = (slot) => (slot.snapshot ? scene(slot.pick, [slot.snapshot.stem || '', ...slot.snapshot.parts.map(p => p.body || '')].join(' . ')) : new Set());

export const overlap = (a, b) => { let n = 0; for (const w of a) if (b.has(w)) n++; return n; };
export const isProblemSolving = (topic) => /problem solving/i.test(topic || '');

// ---- what to avoid ----
let history = () => [];
export const setHistory = (fn) => { history = fn; };
const PREPS_BACK = 3;
const cache = new WeakMap();
// the scenes and options of the last few saved preps (not the one being built)
export function recent(exceptPrepId = null) {
  const preps = history().filter(p => p && p.id !== exceptPrepId && p.questions).sort((a, b) => String(b.saved || b.created || '').localeCompare(String(a.saved || a.created || ''))).slice(0, PREPS_BACK);
  const words = new Set(), keys = new Set();
  for (const p of preps) {
    let c = cache.get(p); if (!c) { c = { words: new Set(), keys: new Set() }; p.questions.forEach(q => q.slots.forEach(s => { if (!s.pick) return; c.keys.add(s.pick); sceneOfSlot(s).forEach(w => c.words.add(w)); })); cache.set(p, c); }
    c.words.forEach(w => words.add(w)); c.keys.forEach(k => keys.add(k));
  }
  return { words, keys };
}
// avoid = the recent scenes plus the other questions already on this prep
export function avoidFor(prep, exceptSlotId = null) {
  const a = recent(prep && prep.id);
  if (prep) prep.questions.forEach(q => q.slots.forEach(s => { if (s.id !== exceptSlotId) { sceneOfSlot(s).forEach(w => a.words.add(w)); } }));
  return a;
}
export const newAvoid = (prepId = null) => recent(prepId);
// how much a candidate question clashes: the number of shared scenario words, with problem solving also avoiding the same option
export function clash(key, seed, flags, avoid, topic) {
  let q; try { q = generate(key, seed, flags); } catch (e) { return 99; }
  let n = overlap(sceneOfQuestion(key, q), avoid.words);
  if (isProblemSolving(topic) && avoid.keys.has(key)) n += 2;
  return n;
}
export const CLASHES = 2;      // two shared scenario words count as the same story
