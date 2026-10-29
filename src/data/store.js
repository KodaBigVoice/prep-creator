// Saving: everything lives in one history file (shareable) plus an automatic browser copy as a safety net.
const KEY = 'prepCreator.v1';
export const emptyStore = () => ({
  version: 1, preps: [], presets: [], ticks: {},
  settings: { layout: {}, lastSet: 'Y7 Additional', rubrics: {} },
  current: null,
});
export function loadStore() {
  try { const t = localStorage.getItem(KEY); if (t) return { ...emptyStore(), ...JSON.parse(t) }; } catch (e) { /* private window etc. */ }
  return emptyStore();
}
let timer = null;
export function saveStoreSoon(st) {
  clearTimeout(timer);
  timer = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) { /* ignore */ } }, 300);
}
export function exportText(st) {
  const { current, ...rest } = st;
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
  st.ticks = { ...st.ticks, ...(d.ticks || {}) };
  st.settings = { ...st.settings, ...(d.settings || {}), layout: { ...st.settings.layout, ...((d.settings || {}).layout || {}) }, rubrics: { ...st.settings.rubrics, ...((d.settings || {}).rubrics || {}) },
    pinned: [...new Set([...((st.settings || {}).pinned || []), ...(((d.settings || {}).pinned) || [])])] };
  return st;
}
