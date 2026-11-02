// Saving: everything lives in one history file (shareable) plus an automatic browser copy as a safety net.
// Several tabs may be open at once. Each saves by merging with what is already stored, so work done in another tab is never
// overwritten: preps and presets are joined by id (the newer copy wins), deleted ones stay deleted, and each tab keeps its own
// work on screen.
export const KEY = 'prepCreator.v1';
export const emptyStore = () => ({
  version: 1, preps: [], presets: [], ticks: {}, gone: {},
  settings: { layout: {}, lastSet: 'Y7 Additional', rubrics: {} },
  current: null,
});
const readDisk = () => { try { const t = localStorage.getItem(KEY); return t ? JSON.parse(t) : null; } catch (e) { return null; } };
export function loadStore() {
  const d = readDisk();
  return d ? { ...emptyStore(), ...d, gone: d.gone || {}, settings: { ...emptyStore().settings, ...(d.settings || {}) } } : emptyStore();
}

const stampOf = (x) => String(x.updated || x.saved || x.created || '');
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
// Bring what another tab saved into `st` (in place). The work on screen here stays as it is.
export function absorb(st, disk) {
  if (!disk) return st;
  st.gone = { ...(disk.gone || {}), ...(st.gone || {}) };
  st.preps = joinById(st.preps, disk.preps, st.gone);
  st.presets = joinById(st.presets, disk.presets, st.gone);
  st.ticks = { ...(disk.ticks || {}), ...(st.ticks || {}) };
  st.settings = { ...(disk.settings || {}), ...st.settings,
    pinned: [...new Set([...(st.settings.pinned || []), ...((disk.settings || {}).pinned || [])])],
    rubrics: { ...((disk.settings || {}).rubrics || {}), ...(st.settings.rubrics || {}) } };
  return st;
}
// a deleted prep or preset is remembered, so another tab does not bring it back
export function forget(st, id) { st.gone = { ...(st.gone || {}), [id]: new Date().toISOString() }; }

export function flushStore(st) {
  try { absorb(st, readDisk()); localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* private window etc. */ }
}
export function refreshStore(st) { return absorb(st, readDisk()); }
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
  st.settings = { ...st.settings, ...(d.settings || {}), layout: { ...st.settings.layout, ...((d.settings || {}).layout || {}) }, rubrics: { ...st.settings.rubrics, ...((d.settings || {}).rubrics || {}) },
    pinned: [...new Set([...((st.settings || {}).pinned || []), ...(((d.settings || {}).pinned) || [])])] };
  return st;
}
