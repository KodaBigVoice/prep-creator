// Building a preset: the preset editor works on a normal prep that carries a `draft` (the shared pools and which preset it came from).
// The rows you see are samples; the rules behind them (exact question, topic and level, range, pool) are what gets saved.
import * as P from './prep.js';
import { poolChoices, poolTopics, upgradePool } from './pools.js';
import { describe } from './query.js';

const copy = (x) => JSON.parse(JSON.stringify(x));
export const isDraft = (prep) => !!(prep && prep.draft);
export const newPoolId = () => 'pool-' + P.uid();

// the saved rule for one slot (marks and working space included)
export function slotDefOf(s, pools = []) {
  const d = s.def;
  let base;
  if (d.mode === 'pool') {
    const shared = d.poolId && pools.find(p => p.id === d.poolId);
    base = shared ? { mode: 'pool', poolId: shared.id, label: shared.name }
      : { mode: 'pool', label: d.label || 'Pool', ...(d.poolId ? { poolId: d.poolId } : {}), choices: copy(poolChoices(d)) };
  } else if (d.mode === 'query') base = copy(d);
  else base = { mode: 'fixed', pick: d.pick || s.pick };
  delete base.marks; delete base.lines;
  base.marks = s.marks.slice(); base.lines = s.lines.slice();
  return base;
}
// A preset from the prep on screen. With a draft, shared pools are written once (and only the ones still in use).
export function presetFromPrep(prep, { id, name, created } = {}) {
  const pools = (prep.draft && prep.draft.pools) || [], used = new Map();
  const questions = prep.questions.map(q => q.slots.map(s => {
    const d = slotDefOf(s, pools);
    if (d.mode === 'pool' && d.poolId && !d.choices) used.set(d.poolId, pools.find(p => p.id === d.poolId));
    return d;
  }));
  const preset = { id: id || 'user-' + P.uid(), set: prep.set, name, minutes: prep.minutes, rubricText: prep.rubricText, questions, created: created || new Date().toISOString() };
  if (used.size) preset.pools = [...used.values()].map(p => ({ id: p.id, name: p.name, choices: copy(p.choices) }));
  return preset;
}

// ---- shared pools inside a draft ----
export const poolUsers = (prep, poolId) => { let n = 0; prep.questions.forEach(q => q.slots.forEach(s => { if (s.def.mode === 'pool' && s.def.poolId === poolId) n++; })); return n; };
export function pruneDraftPools(prep) {
  if (!prep.draft) return [];
  prep.draft.pools = (prep.draft.pools || []).filter(p => poolUsers(prep, p.id) > 0);
  return prep.draft.pools;
}
// what the chooser needs to offer shared pools (only in the preset editor)
export const sharedFor = (prep, count = false) => (prep.draft ? { pools: pruneDraftPools(prep).map(p => ({ id: p.id, name: p.name, choices: p.choices })), count } : null);
export function upsertPool(prep, d) {
  const pools = (prep.draft.pools ||= []);
  let p = pools.find(x => x.id === d.poolId);
  if (!p) { p = { id: d.poolId, name: d.label || 'Pool', choices: [] }; pools.push(p); }
  p.name = d.label || p.name; p.choices = copy(poolChoices(d));
  return p;
}
// Every question that uses this pool takes its current topics and options. A question whose sample no longer fits is redrawn,
// and questions of one pool that landed on the same topic are spread out again.
export function syncPool(prep, poolId) {
  const pool = (prep.draft.pools || []).find(p => p.id === poolId); if (!pool) return;
  const mine = [];
  prep.questions.forEach(q => q.slots.forEach(s => { if (s.def.mode === 'pool' && s.def.poolId === poolId) mine.push(s); }));
  for (const s of mine) P.setPool(prep, s, { mode: 'pool', poolId, label: pool.name, choices: copy(pool.choices) });
  const seen = new Set();
  for (const s of mine) {
    const t = s.meta && s.meta.topic;
    if (t && seen.has(t) && !s.locked && poolTopics(s.def).length > 1) { try { P.rerollSlot(prep, s); } catch (e) { /* keep the sample */ } }
    if (s.meta) seen.add(s.meta.topic);
  }
}
// Use a pool the chooser returned for this slot. In a draft a pool with an id is a shared pool: store it and update every question that uses it.
export function setSlotPool(prep, slot, d, opts) {
  if (prep.draft && d.poolId) { upsertPool(prep, d); P.setPool(prep, slot, { ...d }, opts); syncPool(prep, d.poolId); }
  else P.setPool(prep, slot, d, opts);
  if (prep.draft) pruneDraftPools(prep);
}
// Add a question (or several) from a chooser result.
export function addFromDef(prep, def, count = 1) {
  if (prep.draft && def.mode === 'pool' && def.poolId) upsertPool(prep, def);
  const added = [];
  for (let i = 0; i < Math.max(1, count); i++) added.push(P.addQuestionDef(prep, def));
  if (prep.draft && def.mode === 'pool' && def.poolId) syncPool(prep, def.poolId);
  return added;
}

export function addPartFromDef(prep, q, def) {
  const sh = prep.draft && def.mode === 'pool' && def.poolId;
  if (sh) upsertPool(prep, def);
  const s = P.addSlotDef(prep, q, def);
  if (sh) syncPool(prep, def.poolId);
  return s;
}

// ---- what a row says about its rule ----
export function ruleText(slot, prep) {
  const d = slot.def;
  if (d.mode === 'pool') {
    const n = poolTopics(d).length, shared = d.poolId && prep && prep.draft && (prep.draft.pools || []).some(p => p.id === d.poolId);
    return shared ? `Shared pool “${d.label}” · ${n} topic${n === 1 ? '' : 's'}` : `Pool · ${n} topic${n === 1 ? '' : 's'}`;
  }
  if (d.mode === 'query') return describe(d);
  return d.pick && d.pick.endsWith(':*') ? 'Any option of this type' : 'Exact question';
}
