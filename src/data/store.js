// Saving: everything lives in one history file (shareable) plus an automatic browser copy as a safety net.
// The Prep creator and the Worksheet creator share this one browser copy. Each page saves by merging with what is already stored,
// so work done in the other tab is never overwritten: preps and presets are joined by id (the newer one wins), and each page
// only replaces its own "work on screen" slot and its own layout settings.
import { KIND, slotKey, layoutKeyOf } from './kind.js';
export const KEY = 'prepCreator.v1';
export const emptyStore = () => ({
  version: 1, preps: [], presets: [], ticks: {}, gone: {},
  settings: { layout: {}, layoutW: {}, lastSet: 'Y7 Additional', rubrics: {} },
  current: null, currentWorksheet: null,
});
const readDisk = () => { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } };
export function loadStore() {
  const d = readDisk();
  return d ? { ...emptyStore(), ...d, gone: d.gone || {}, settings: { ...emptyStore().settings, ...(d.settings || {}) } } : emptyStore();
}

const stampOf = (x) => String(x.updated || x.saved || x.created || '');
// join two lists of things with ids: the newer of two copies wins (ours on a tie); anything marked as deleted stays deleted
function joinById(ours, theirs, gone) {
  const m = new Map();
  for (const x of theirs || []) if (!gone[x.id]) m.set(x.id, x);
  for (const x of ours || []) {
    if (gone[x.id]) continue;
    const o = m.get(x.id);
    if (!o || stampOf(x) >= stampOf(o)) m.set(x.id, x);
  }
  return [...m.values()];
}
// Bring what another tab saved into `st` (in place). The work on screen here and this page's layout stay as they are.
export function absorb(st, disk, kind = KIND) {
  if (!disk) return st;
  st.gone = { ...(disk.gone || {}), ...(st.gone || {}) };
  st.preps = joinById(st.preps, disk.preps, st.gone);
  st.presets = joinById(st.presets, disk.presets, st.gone);
  st.ticks = { ...(disk.ticks || {}), ...(st.ticks || {}) };
  const own = layoutKeyOf(kind), ds = disk.settings || {};
  const other = own === 'layout' ? 'layoutW' : 'layout';
  st.settings = { ...ds, ...st.settings, [other]: ds[other] || st.settings[other] || {},
    pinned: [...new Set([...(st.settings.pinned || []), ...(ds.pinned || [])])],
    rubrics: { ...(ds.rubrics || {}), ...(st.settings.rubrics || {}) } };
  const otherSlot = slotKey(kind) === 'current' ? 'currentWorksheet' : 'current';
  st[otherSlot] = disk[otherSlot] ?? null;
  return st;
}
// a deleted prep or preset is remembered, so the other tab does not bring it back
export function forget(st, id) { st.gone = { ...(st.gone || {}), [id]: new Date().toISOString() }; }

export function flushStore(st, kind = KIND) {
  try { absorb(st, readDisk(), kind); localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private window etc. */ }
}
// Give the work on screen to the other creator: it opens there next, and this page's slot is cleared
export function handOver(st, prep, toKind, from = KIND) {
  try { absorb(st, readDisk(), from); st[slotKey(toKind)] = prep; st[slotKey(from)] = null; localStorage.setItem(KEY, JSON.stringify(st)); return true; } catch (e) { return false; }
}
export function refreshStore(st, kind = KIND) { return absorb(st, readDisk(), kind); }
let timer = null;
export function saveStoreSoon(st) {
  clearTimeout(timer);
  timer = setTimeout(() => flushStore(st), 300);
}
export function exportText(st) {
  const { current, currentWorksheet, gone, ...rest } = st;
  return JSON.stringify({ ...rest, app: 'prep-creator', exported: new Date().toISOString() }, null, 1);
}
export function importText(st, text) {
  const d = JSON.parse(text);
  if (d.app !== 'prep-creator') throw new Error('This is not a PMU history file.');
  const byId = (arr) => Object.fromEntries(arr.map(x => [x.id, x]));
  const preps = byId(st.preps);
  for (const p of d.preps || []) if (!preps[p.id] || (p.saved || '') >= (preps[p.id].saved || '')) preps[p.id] = p;
  const presets = byId(st.presets);
  for (const p of d.presets || []) presets[p.id] = p;
  st.preps = Object.values(preps); st.presets = Object.values(presets);
  for (const x of [...st.preps, ...st.presets]) if (st.gone) delete st.gone[x.id];          // a file you load brings its items back
  st.ticks = { ...st.ticks, ...(d.ticks || {}) };
  st.settings = { ...st.settings, ...(d.settings || {}), layout: { ...st.settings.layout, ...((d.settings || {}).layout || {}) }, layoutW: { ...(st.settings.layoutW || {}), ...((d.settings || {}).layoutW || {}) }, rubrics: { ...st.settings.rubrics, ...((d.settings || {}).rubrics || {}) },
    pinned: [...new Set([...((st.settings || {}).pinned || []), ...(((d.settings || {}).pinned) || [])])] };
  return st;
}
