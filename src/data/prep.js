// Building and changing a prep: slots, pools, re-rolling, random preps.
import { makeRng, newSeed } from '../core/rng.js';
import { generate, parsePick, typeById, TYPES, defaultFlags, canon } from '../core/engine.js';
import { setById, defaultRubric } from './sets.js';
import { avoidFor, newAvoid, sceneOfSlot, clash, CLASHES } from './fresh.js';
import { poolByTopic, poolChoices, choiceOptions, upgradePool } from './pools.js';
import { resolve, step, ladder, topicsOf, levelOf, byKey, isRange } from './query.js';

let _id = 0;
export const uid = () => `s${Date.now().toString(36)}${(_id++).toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

// 'typeId:*' -> a random variant of that type
function resolvePick(pick, r) {
  if (!pick.endsWith(':*')) return pick;
  const t = typeById[canon(pick.slice(0, -2))];
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
export function makeSlot(def, usedTopics = new Set(), rng = makeRng(newSeed()), keys = new Set(), avoid = null, opts = {}) {
  const slot = { id: uid(), def: JSON.parse(JSON.stringify(def)), seed: newSeed(), locked: false, flags: null, edits: null };
  choosePick(slot, usedTopics, rng, keys, opts);
  freshen(slot, avoid, () => { slot.seed = newSeed(); choosePick(slot, usedTopics, rng, keys, opts); });
  return fillSnapshot(slot);
}
// The fresh-scenario rule (soft): try a few other questions or numbers, keep the first that does not retell a recent story, else the least similar
export function freshen(slot, avoid, retry) {
  if (!avoid || slot.locked) return;
  let best = null;
  for (let i = 0; i < 8; i++) {
    if (i) retry();
    const c = clash(slot.pick, slot.seed, slot.flags, avoid, topicOfPick(slot.pick));
    if (!best || c < best.c) best = { pick: slot.pick, seed: slot.seed, c };
    if (c < CLASHES) break;
  }
  slot.pick = best.pick; slot.seed = best.seed;
}
const addScene = (avoid, slot) => { sceneOfSlot(slot).forEach(w => avoid.words.add(w)); avoid.keys.add(slot.pick); };
// opts.leaveTopic: the topic it has now (a shuffle must leave it when there is another to go to); opts.mates: topics taken by the other questions of the same shared pool
function choosePick(slot, usedTopics, rng, usedKeys = new Set(), opts = {}) {
  const d = slot.def;
  if (d.mode === 'fixed') { slot.pick = resolvePick(d.pick, rng); return; }
  if (d.mode === 'query') { slot.pick = chooseFromQuery(d, rng, usedKeys, slot.pick, usedTopics, opts); return; }
  if (d.choices || !d.candidates) { slot.pick = chooseFromPool(d, rng, usedKeys, slot.pick, usedTopics, opts); return; }
  const on = d.candidates.filter(c => c.on);
  const pool = on.length ? on : d.candidates;
  const tier = (pred) => pool.filter(pred);
  const T = (c) => topicOfPick(c.pick);
  let fresh = tier(c => !usedTopics.has(T(c)) && T(c) !== opts.leaveTopic);
  if (!fresh.length) fresh = tier(c => T(c) !== opts.leaveTopic);
  if (!fresh.length) fresh = tier(c => !usedTopics.has(T(c)));
  if (!fresh.length) fresh = pool;
  slot.pick = resolvePick(rng.pick(fresh).pick, rng);
}
// Choose a topic: not the one it is leaving, not one taken by another question of the same pool, preferably one not yet on the prep
function chooseTopic(topics, rng, usedTopicSet, opts) {
  const mates = opts.mates || new Set(), leave = opts.leaveTopic;
  const tiers = [
    (t) => t !== leave && !mates.has(t) && !usedTopicSet.has(t),
    (t) => t !== leave && !mates.has(t),
    (t) => t !== leave,
    () => true,
  ];
  for (const f of tiers) { const c = topics.filter(f); if (c.length) return rng.pick(c); }
  return rng.pick(topics);
}
function chooseFromPool(d, rng, usedKeys, current, usedTopicSet = new Set(), opts = {}) {
  const by = poolByTopic(d);
  if (!by.size) {                       // everything switched off: fall back to every choice
    const all = new Map(); for (const c of poolChoices(d)) { const l = choiceOptions(c); if (l.length) all.set(c.topic, [...(all.get(c.topic) || []), ...l]); }
    if (!all.size) throw new Error('This pool has no questions in it.');
    by.clear(); all.forEach((v, k) => by.set(k, v));
  }
  // linked parts: opts.force is the topic the group already has; opts.only are the topics every part of the group can offer
  let keys = [...by.keys()], topic;
  if (opts.force && by.has(opts.force)) topic = opts.force;
  else {
    if (opts.only && opts.only.length) { const k = keys.filter(t => opts.only.includes(t)); if (k.length) keys = k; }
    topic = chooseTopic(keys, rng, usedTopicSet, opts);
  }
  const list = by.get(topic);
  let c = list.filter(e => !usedKeys.has(e.key) && e.key !== current);
  if (!c.length) c = list.filter(e => e.key !== current);
  if (!c.length) c = list;
  return rng.pick(c).key;
}

// A query slot draws any option that fits the description; options already on this prep (and the one it had) are avoided when there is a choice
function chooseFromQuery(d, rng, usedKeys, current, usedTopicSet = new Set(), opts = {}) {
  let { list } = resolve(d);
  if (!list.length) list = ladder(topicsOf(d));
  if (!list.length) throw new Error('No questions match ' + JSON.stringify(d));
  // several topics: choose a topic first (one not already on the prep if possible), so a big topic does not crowd out the others
  const topics = [...new Set(list.map(e => e.topic))];
  if (topics.length > 1) {
    const t = chooseTopic(topics, rng, usedTopicSet, opts);
    list = list.filter(e => e.topic === t);
  }
  let c = list.filter(e => !usedKeys.has(e.key) && e.key !== current);
  if (!c.length) c = list.filter(e => e.key !== current);
  if (!c.length) c = list;
  return rng.pick(c).key;
}
export const usedKeys = (prep, exceptSlotId = null) => {
  const s = new Set();
  prep.questions.forEach(q => q.slots.forEach(sl => { if (sl.id !== exceptSlotId && sl.pick) s.add(sl.pick); }));
  return s;
};

// A preset slot that names a shared pool gets that pool's choices copied in, so a prep never depends on the preset after it is made
export function resolveDef(preset, d) {
  if (d.mode !== 'pool' || !d.poolId) return d;
  const pool = (preset.pools || []).find(p => p.id === d.poolId);
  if (!pool) return d;
  return { ...d, label: pool.name, choices: JSON.parse(JSON.stringify(pool.choices)) };
}
// Linked parts: pool parts of one question that share a `link` make one topic decision between them. The topics every part can offer:
export function commonTopics(defs) {
  const lists = defs.map(d => [...poolByTopic(d).keys()]);
  if (!lists.length) return [];
  const both = lists[0].filter(t => lists.every(l => l.includes(t)));
  return both.length ? both : lists[0];
}
export function linkGroup(prep, slot) {
  const l = slot.def && slot.def.link; if (!l || slot.def.mode !== 'pool') return [slot];
  const q = prep.questions.find(x => x.slots.includes(slot)); if (!q) return [slot];
  const g = q.slots.filter(x => x.def.link === l && x.def.mode === 'pool');
  return g.includes(slot) && g.length > 1 ? g : [slot];
}
// Draw one question's slots from its rule definitions. `state` carries what is already on the prep: topics and questions used, recent stories to avoid,
// and the topics already drawn from each shared pool.
export function newDrawState() { return { used: new Set(), keys: new Set(), avoid: newAvoid(), taken: new Map() }; }
export function drawQuestion(preset, defs, state, rng = makeRng(newSeed())) {
  const { used, keys, avoid, taken } = state;
  const gt = new Map();                                                              // link -> the topic drawn for those linked parts
  return {
    id: uid(),
    slots: defs.map((d0) => {
      const d = resolveDef(preset, d0), mates = d.poolId ? (taken.get(d.poolId) || taken.set(d.poolId, new Set()).get(d.poolId)) : new Set();
      const opts = { mates };
      if (d.link && d.mode === 'pool') {
        if (gt.has(d.link)) opts.force = gt.get(d.link);
        else opts.only = commonTopics(defs.filter(x => x.link === d.link && x.mode === 'pool').map(x => resolveDef(preset, x)));
      }
      const s = makeSlot(d, used, rng, keys, avoid, opts);
      if (d.link && d.mode === 'pool' && !gt.has(d.link)) gt.set(d.link, s.meta.topic);
      used.add(s.meta.topic); keys.add(s.pick); addScene(avoid, s); if (d.poolId) mates.add(s.meta.topic);
      return s;
    }),
  };
}
export function prepFromPreset(preset, setId, name, rng = makeRng(newSeed())) {
  const set = setById[setId], state = newDrawState();
  const questions = preset.questions.map((defs) => drawQuestion(preset, defs, state, rng));
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

// topics already drawn by the other questions that share this slot's pool
export function matesOf(prep, slot) {
  const m = new Set(); if (!slot.def.poolId) return m;
  prep.questions.forEach(q => q.slots.forEach(sl => { if (sl.id !== slot.id && sl.def.poolId === slot.def.poolId && sl.meta) m.add(sl.meta.topic); }));
  return m;
}
// ⤮ a different question. Pools and multi-topic questions move to a different topic when there is one.

// Linked parts move together: one new topic for all of them, then each part draws from its own options in that topic.
function drawGroup(prep, group, leaveTopic) {
  const ids = new Set(group.map(g => g.id));
  const other = (f) => { const set = new Set(); prep.questions.forEach(q => q.slots.forEach(sl => { if (!ids.has(sl.id)) f(sl, set); })); return set; };
  const usedT = other((sl, set) => { if (sl.meta) set.add(sl.meta.topic); }), usedK = other((sl, set) => { if (sl.pick) set.add(sl.pick); });
  const rng = makeRng(newSeed());
  const only = commonTopics(group.map(g => g.def));
  const topic = chooseTopic(only, rng, usedT, { leaveTopic });
  for (const m of group) {
    m.edits = null;
    const roll = () => { m.seed = newSeed(); choosePick(m, usedT, rng, usedK, { force: topic }); };
    roll(); freshen(m, avoidFor(prep, m.id), roll); fillSnapshot(m); usedK.add(m.pick);
  }
}
// after a pool of a linked part was edited: keep the group on one topic that all parts can still offer
export function regroup(prep, slot) {
  const g = linkGroup(prep, slot); if (g.length < 2) return;
  const t = slot.meta && slot.meta.topic;
  const fits = g.every(m => m.meta && m.meta.topic === t && (poolByTopic(m.def).get(t) || []).some(e => e.key === m.pick));
  if (!fits && !g.some(m => m.locked)) drawGroup(prep, g, undefined);
}
export function rerollSlot(prep, slot) {
  if (slot.locked) return slot;
  const group = linkGroup(prep, slot);
  if (group.length > 1) { if (!group.some(m => m.locked)) drawGroup(prep, group, slot.meta && slot.meta.topic); return slot; }
  slot.edits = null;
  const from = slot.meta && slot.meta.topic, mates = matesOf(prep, slot);
  const roll = () => {
    slot.seed = newSeed();
    const o = { leaveTopic: from, mates };
    if (slot.def.mode === 'pool') choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()), usedKeys(prep, slot.id), o);
    else if (slot.def.mode === 'query') choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()), usedKeys(prep, slot.id), o);
    else if (slot.def.pick && slot.def.pick.endsWith(':*')) {      // "any option of this type": roll a different option where there is one
      const r = makeRng(newSeed()); const old = slot.pick; let next = resolvePick(slot.def.pick, r);
      for (let i = 0; i < 6 && next === old && typeById[canon(slot.def.pick.slice(0, -2))].variants.length > 1; i++) next = resolvePick(slot.def.pick, r);
      slot.pick = next;
    }
  };
  roll();
  freshen(slot, avoidFor(prep, slot.id), roll);
  return fillSnapshot(slot);
}
// same question, new numbers (steering clear of a recent story where it can)
export function renumber(prep, slot) {
  if (slot.locked) return slot;
  slot.edits = null;
  const roll = () => { slot.seed = newSeed(); };
  roll(); freshen(slot, avoidFor(prep, slot.id), roll);
  return fillSnapshot(slot);
}
export function reseed(slot, seed = newSeed()) { slot.seed = seed; slot.edits = null; return fillSnapshot(slot); }
export function setFlags(slot, flags) { slot.flags = { ...(slot.flags || {}), ...flags }; return fillSnapshot(slot); }
// choose a specific type/variant by hand: the slot becomes a fixed slot
// Apply a choice from the picker. fixedPick ('typeId:*') means "any option of this type"; pick is the concrete example shown.
export function applyChoice(slot, { pick, fixedPick = null, seed, flags = null }) {
  slot.def = { mode: 'fixed', pick: fixedPick || pick };
  slot.pick = pick; slot.seed = seed; slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = flags || null;
  return fillSnapshot(slot);
}
export function setPick(slot, pick) {
  slot.def = { mode: 'fixed', pick };
  slot.pick = pick; slot.seed = newSeed(); slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = null;
  return fillSnapshot(slot);
}
export function setMarks(slot, i, m) { slot.marks[i] = Math.max(1, Math.round(m)); slot.marksManual[i] = true; if (!slot.linesManual[i]) slot.lines[i] = Math.max(2, Math.round(slot.lineDefaults[i] * (slot.marks[i] / slot.markDefaults[i]) * 2) / 2); }
export function setLines(slot, i, l) { slot.lines[i] = Math.max(0.5, Math.round(l * 100) / 100); slot.linesManual[i] = true; }
export function resetLines(slot, i) { slot.linesManual[i] = false; slot.lines[i] = Math.max(2, Math.round(slot.lineDefaults[i] * (slot.marks[i] / slot.markDefaults[i]) * 2) / 2); }

// ---- choosing by description (Quick and Range) ----
// Make a slot follow a query. The question changes only if the one it has no longer fits.
export function setQuery(prep, slot, def, { redraw = false } = {}) {
  const old = slot.pick, od = slot.def;
  slot.def = { mode: 'query', ...def };
  if (od && od.marks && !slot.def.marks) slot.def.marks = od.marks;
  if (od && od.lines && !slot.def.lines) slot.def.lines = od.lines;
  if (!redraw && resolve(slot.def).list.some(e => e.key === old)) return slot;   // still fits: nothing else changes
  slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = null;
  choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()), usedKeys(prep, slot.id));
  slot.seed = newSeed();
  freshen(slot, avoidFor(prep, slot.id), () => { slot.seed = newSeed(); choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()), usedKeys(prep, slot.id)); });
  return fillSnapshot(slot);
}
// Make a slot a pool (or change its pool). A new question is drawn only if the one it has no longer fits, or when asked.
export function setPool(prep, slot, def, { redraw = false } = {}) {
  const od = slot.def, old = slot.pick;
  slot.def = { mode: 'pool', ...def }; upgradePool(slot.def);
  if (od && od.marks && !slot.def.marks) slot.def.marks = od.marks;
  if (od && od.lines && !slot.def.lines) slot.def.lines = od.lines;
  if (od && od.link && !slot.def.link) slot.def.link = od.link;
  const fits = [...poolByTopic(slot.def).values()].some(l => l.some(e => e.key === old));
  if (!redraw && fits) return slot;
  slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = null;
  const from = slot.meta && slot.meta.topic;
  choosePick(slot, usedTopics(prep, slot.id), makeRng(newSeed()), usedKeys(prep, slot.id), { leaveTopic: redraw ? from : undefined, mates: matesOf(prep, slot) });
  slot.seed = newSeed();
  return fillSnapshot(slot);
}
export const entryOfPick = (pick) => { const p = parsePick(String(pick).replace(/:\*$/, '')); return p ? byKey()[`${p.t.id}:${p.v.id}`] || null : null; };
// the query that describes a hand-picked question (so the person can switch to Quick or Range)
export function queryOfPick(pick) {
  const p = parsePick(pick.replace(/:\*$/, ''));
  const e = p && byKey()[`${p.t.id}:${p.v.id}`];
  return e ? { mode: 'query', topics: [e.topic], level: levelOf(e) } : null;
}
// Step to the next easier (-1) or harder (+1) question in this question's topic. Works on any question:
// a hand-picked one becomes a Quick question; a pool stays a pool (re-rolling still moves between its topics). False at either end.
function nudgeTarget(slot, dir) {
  if (slot.locked) return null;
  const e = entryOfPick(slot.pick); if (!e) return null;
  const od = slot.def;
  const def = od.mode === 'query' ? od : od.mode === 'pool' ? { mode: 'query', topics: [e.topic], level: null } : { mode: 'query', topics: [e.topic], level: levelOf(e) };
  const s = step(def, e.key, dir);
  return s ? { def, s } : null;
}
export const canNudge = (slot, dir) => !!nudgeTarget(slot, dir);
export function nudgeSlot(prep, slot, dir) {
  const t = nudgeTarget(slot, dir); if (!t) return false;
  const od = slot.def, { def, s } = t;
  if (od.mode !== 'pool') { slot.def = { ...def, level: s.level }; if (od.marks) slot.def.marks = od.marks; if (od.lines) slot.def.lines = od.lines; }
  slot.pick = s.entry.key; slot.seed = newSeed(); slot.edits = null; slot.marksManual = []; slot.linesManual = []; slot.flags = null;
  freshen(slot, avoidFor(prep, slot.id), () => { slot.seed = newSeed(); });
  fillSnapshot(slot);
  return true;
}
// topics already drawn by the questions that share a pool
const matesOfPool = (prep, poolId) => { const m = new Set(); if (poolId) prep.questions.forEach(q => q.slots.forEach(sl => { if (sl.def.poolId === poolId && sl.meta) m.add(sl.meta.topic); })); return m; };
export function addSlotDef(prep, q, def) {
  const s = makeSlot(def, usedTopics(prep), undefined, usedKeys(prep), avoidFor(prep), { mates: matesOfPool(prep, def.poolId) });
  q.slots.push(s); return s;
}
export function addSlotToQuestion(prep, q, pick) {
  const s = makeSlot({ mode: 'fixed', pick }, usedTopics(prep), undefined, usedKeys(prep), avoidFor(prep));
  q.slots.push(s); return s;
}
export function addQuestion(prep, pick, index = null) { return addQuestionDef(prep, { mode: 'fixed', pick }, index); }
export function addQuestionDef(prep, def, index = null) {
  const s = makeSlot(def, usedTopics(prep), undefined, usedKeys(prep), avoidFor(prep), { mates: matesOfPool(prep, def.poolId) });
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
  const okV = (t, v) => (v.levels || t.levels || []).includes(level);
  const ok = (t) => t.variants.some(v => okV(t, v));
  const calc = TYPES.filter(t => ok(t) && t.verb && t.topic !== 'Problem solving');
  const worded = TYPES.filter(t => ok(t) && !t.verb && t.topic !== 'Problem solving' && !t.multipart);
  const ps = TYPES.filter(t => ok(t) && t.topic === 'Problem solving');
  const nQ = Math.round(set.minutes / 3);
  const nCalc = Math.max(2, Math.round(nQ * 0.35)), nPS = ps.length ? (nQ >= 8 ? 2 : 1) : 0, nWord = nQ - nCalc - nPS;
  const used = new Set(); const questions = [];
  const pickType = (list) => { let c = list.filter(t => !used.has(t.topic)); if (!c.length) c = list; const t = rng.pick(c); used.add(t.topic); return t; };
  const slotFor = (t, v) => makeSlot({ mode: 'fixed', pick: `${t.id}:${(v || rng.pick(t.variants.filter(x => okV(t, x)))).id}` }, used, rng);
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
