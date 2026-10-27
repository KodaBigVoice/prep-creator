// Building and changing a prep: slots, pools, re-rolling, random preps.
import { makeRng, newSeed } from '../core/rng.js';
import { generate, parsePick, typeById, TYPES, defaultFlags } from '../core/engine.js';
import { setById, defaultRubric } from './sets.js';

let _id = 0;
export const uid = () => `s${Date.now().toString(36)}${(_id++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

// 'typeId:*' -> a random variant of that type
function resolvePick(pick, r) {
  if (!pick.endsWith(':*')) return pick;
  const t = typeById[pick.slice(0, -2)];
  if (!t) return null;
  return `${t.id}:${r.pick(t.variants).id}`;
}
export const topicOfPick = (pick) => { const p = parsePick(pick.replace(/:\*$/, '')); return p ? p.t.topic : null; };

function fillSnapshot(slot) {
  const q = generate(slot.pick, slot.seed, slot.flags);
  slot.snapshot = { stem: q.stem, parts: q.parts.map(p => ({ body: p.body, a: p.a, w: p.w, verb: p.verb, calc: p.calc, m: p.m, lines: p.lines })) };
  slot.meta = { topic: q.topic, type: q.type, label: q.label, multipart: q.multipart, typeId: q.typeId, integer: !!typeById[q.typeId].integer };
  const n = q.parts.length;
  const dm = slot.def && slot.def.marks, dl = slot.def && slot.def.lines;
  // designated defaults: from the preset slot if it sets them, otherwise from the question type
  slot.markDefaults = q.parts.map((p, i) => (dm && dm[i] !== undefined ? dm[i] : p.m));
  slot.lineDefaults = q.parts.map((p, i) => (dl && dl[i] !== undefined ? dl[i] : (dm && dm[i] !== undefined ? Math.max(3, Math.round(p.lines * dm[i] / p.m * 2) / 2) : p.lines)));
  const mm = Array.from({ length: n }, (_, i) => !!(slot.marksManual && slot.marksManual[i]));
  const lm = Array.from({ length: n }, (_, i) => !!(slot.linesManual && slot.linesManual[i]));
  slot.marks = slot.markDefaults.map((d, i) => (mm[i] && slot.marks && slot.marks[i] !== undefined ? slot.marks[i] : d));
  slot.lines = slot.lineDefaults.map((d, i) => (lm[i] && slot.lines && slot.lines[i] !== undefined ? slot.lines[i] : d));
  slot.marksManual = mm; slot.linesManual = lm;
  return slot;
}

// def: the preset slot (fixed or pool); usedTopics: topics already in this prep
export function makeSlot(def, usedTopics = new Set(), rng = makeRng(newSeed())) {
  const slot = { id: uid(), def: JSON.parse(JSON.stringify(def)), seed: newSeed(), locked: false, flags: null, edits: null };
  choosePick(slot, usedTopics, rng);
  return fillSnapshot(slot);
}
function choosePick(slot, usedTopics, rng) {
  const d = slot.def;
  if (d.mode === 'fixed') { slot.pick = resolvePick(d.pick, rng); return; }
  const on = d.candidates.filter(c => c.on);
  const pool = on.length ? on : d.candidates;
  let fresh = pool.filter(c => !usedTopics.has(topicOfPick(c.pick)));
  if (!fresh.length) fresh = pool;
  slot.pick = resolvePick(rng.pick(fresh).pick, rng);
}

export function prepFromPreset(preset, setId, name, rng = makeRng(newSeed())) {
  const set = setById[setId];
  const used = new Set();
  const questions = preset.questions.map((defs) => ({
    id: uid(),
    slots: defs.map((d) => { const s = makeSlot(d, used, rng); used.add(s.meta.topic); return s; }),
  }));
  return newPrep({ set: setId, name, minutes: preset.minutes ?? set.minutes, presetId: preset.id, rubricText: preset.rubricText, questions });
}
export function newPrep({ set, name, minutes, presetId = null, rubricText, questions = [] }) {
  return { id: uid(), set, name, nameAuto: true, minutes, presetId, rubricOn: false, rubricText: rubricText || defaultRubric(minutes), questions, created: new Date().toISOString(), version: 1 };
}

export const usedTopics = (prep, exceptSlotId = null) => {
  const s = new Set();
  prep.questions.forEach(q => q.slots.forEach(sl => { if (sl.id !== exceptSlotId && sl.meta) s.add(sl.meta.topic); }));
  return s;
};

// re-roll: same type, new numbers (pool slots choose again)
export function rerollSlot(prep, slot) {
  if (slot.locked) return slot;
  slot.seed = newSeed();
  slot.edits = null;
  if (slot.def.mode === 'pool') choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()));
  return fillSnapshot(slot);
}
// next/previous variant while choosing by hand: keeps the type, changes the numbers
export function reseed(slot, seed = newSeed()) { slot.seed = seed; slot.edits = null; return fillSnapshot(slot); }
export function setFlags(slot, flags) { slot.flags = { ...(slot.flags || {}), ...flags }; return fillSnapshot(slot); }
// choose a specific type/variant by hand: the slot becomes a fixed slot
export function setPick(slot, pick) {
  slot.def = { mode: 'fixed', pick };
  slot.pick = pick; slot.seed = newSeed(); slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = null;
  return fillSnapshot(slot);
}
export function setMarks(slot, i, m) { slot.marks[i] = Math.max(1, Math.round(m)); slot.marksManual[i] = true; if (!slot.linesManual[i]) slot.lines[i] = Math.max(2, Math.round(slot.lineDefaults[i] * (slot.marks[i] / slot.markDefaults[i]) * 2) / 2); }
export function setLines(slot, i, l) { slot.lines[i] = Math.max(0.5, Math.round(l * 100) / 100); slot.linesManual[i] = true; }
export function resetLines(slot, i) { slot.linesManual[i] = false; slot.lines[i] = Math.max(2, Math.round(slot.lineDefaults[i] * (slot.marks[i] / slot.markDefaults[i]) * 2) / 2); }

export function addSlotToQuestion(prep, q, pick) {
  const s = makeSlot({ mode: 'fixed', pick }, usedTopics(prep));
  q.slots.push(s); return s;
}
export function addQuestion(prep, pick, index = null) {
  const s = makeSlot({ mode: 'fixed', pick }, usedTopics(prep));
  const q = { id: uid(), slots: [s] };
  if (index === null) prep.questions.push(q); else prep.questions.splice(index, 0, q);
  return q;
}
export function removeSlot(prep, qi, si) {
  const q = prep.questions[qi]; q.slots.splice(si, 1);
  if (!q.slots.length) prep.questions.splice(qi, 1);
}
export function moveQuestion(prep, qi, dir) {
  const j = qi + dir; if (j < 0 || j >= prep.questions.length) return;
  [prep.questions[qi], prep.questions[j]] = [prep.questions[j], prep.questions[qi]];
}

// Make question qi a further part of its neighbour (dir -1: the question above, +1: the one below)
export function mergeQuestion(prep, qi, dir) {
  const j = qi + dir; if (j < 0 || j >= prep.questions.length) return null;
  const a = prep.questions[qi], b = prep.questions[j];
  const firstSlot = dir < 0 ? b.slots.length : 0;
  if (dir < 0) b.slots.push(...a.slots); else b.slots.unshift(...a.slots);
  prep.questions.splice(qi, 1);
  return { q: dir < 0 ? j : qi, firstSlot };
}
// Take one part out of a multipart question and make it a question of its own (placed after)
export function splitSlot(prep, qi, si) {
  const q = prep.questions[qi]; if (q.slots.length < 2) return null;
  const [slot] = q.slots.splice(si, 1);
  prep.questions.splice(qi + 1, 0, { id: uid(), slots: [slot] });
  return qi + 1;
}

// Random prep: calculation questions first (shared stems), then worded, then problem solving last
export function randomPrep(setId, name) {
  const set = setById[setId];
  const rng = makeRng(newSeed());
  const level = set.level;
  const ok = (t) => (t.levels || []).includes(level);
  const calc = TYPES.filter(t => ok(t) && t.verb && t.topic !== 'Problem solving');
  const worded = TYPES.filter(t => ok(t) && !t.verb && t.topic !== 'Problem solving' && !t.multipart);
  const ps = TYPES.filter(t => ok(t) && t.topic === 'Problem solving');
  const nQ = Math.round(set.minutes / 3);
  const nCalc = Math.max(2, Math.round(nQ * 0.35)), nPS = ps.length ? (nQ >= 8 ? 2 : 1) : 0, nWord = nQ - nCalc - nPS;
  const used = new Set(); const questions = [];
  const pickType = (list) => { let c = list.filter(t => !used.has(t.topic)); if (!c.length) c = list; const t = rng.pick(c); used.add(t.topic); return t; };
  const slotFor = (t, v) => makeSlot({ mode: 'fixed', pick: `${t.id}:${(v || rng.pick(t.variants)).id}` }, used, rng);
  for (let i = 0; i < nCalc; i++) {
    const first = pickType(calc);
    const slots = [slotFor(first)];
    const same = calc.filter(t => t.verb === first.verb && t !== first && !used.has(t.topic));
    const extra = rng.int(1, 2);
    for (let k = 0; k < extra && same.length; k++) { const t = rng.pick(same); same.splice(same.indexOf(t), 1); used.add(t.topic); slots.push(slotFor(t)); }
    questions.push({ id: uid(), slots });
  }
  for (let i = 0; i < nWord; i++) questions.push({ id: uid(), slots: [slotFor(pickType(worded))] });
  for (let i = 0; i < nPS; i++) { const t = ps[0]; questions.push({ id: uid(), slots: [slotFor(t)] }); }
  return newPrep({ set: setId, name, minutes: set.minutes, presetId: null, questions });
}
