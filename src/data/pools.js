// Pools: a question that is drawn from several topics, each with its own levels and (if wanted) hand-picked options.
// A pool definition: { mode:'pool', label, poolId?, choices:[ choice, ... ] }
// A choice is one topic: { topic, levels:['Core','Additional'], off:[keys], add:[keys], enabled?:false (the whole choice switched off) }
//   an option is included when it is in one of the levels (and not in `off`), or when it is listed in `add`.
// (Older pools listed question types as `candidates`; poolChoices() reads those too.)
import { parsePick } from '../core/engine.js';
import { LEVELS, ladder, topicList, levelCounts } from './query.js';

export { LEVELS };
const isOn = (c) => c.enabled !== false;

// the options a choice allows, easiest first
export function choiceOptions(c) {
  const lv = new Set(c.levels || []), off = new Set(c.off || []), add = new Set(c.add || []);
  return ladder([c.topic]).filter(e => add.has(e.key) || (e.levels.some(l => lv.has(l)) && !off.has(e.key)));
}
export const isIncluded = (c, e) => choiceOptions(c).some(x => x.key === e.key);
export const choiceEnabled = isOn;

// "Core, Additional" / "5 hand-picked"
export function describeChoice(c) {
  const n = choiceOptions(c).length, total = ladder([c.topic]).length;
  const lv = (c.levels || []).join(', ');
  return `${c.topic} · ${lv || 'hand-picked'} · ${n}/${total}`;
}

// A new choice for a topic. `level` is the level to start with; if the topic has nothing there, the nearest level that has something.
export function newChoice(topic, level = 'Core') {
  const counts = levelCounts([topic]);
  const order = [...LEVELS].sort((a, b) => Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(level)) - Math.abs(LEVELS.indexOf(b) - LEVELS.indexOf(level)) || LEVELS.indexOf(a) - LEVELS.indexOf(b));
  const use = counts[level] ? level : order.find(l => counts[l]);
  return { topic, levels: use ? [use] : [], off: [], add: [] };
}
export function choiceFromKey(key) {
  const e = ladder(topicList().map(t => t.name)).find(x => x.key === key);
  return e ? { topic: e.topic, levels: [], off: [], add: [key] } : null;
}

// A level chip: tick or untick a whole level. Ticking it also clears any individual unticks at that level.
export function toggleLevel(c, level) {
  const at = new Set(ladder([c.topic]).filter(e => e.levels.includes(level)).map(e => e.key));
  const lv = new Set(c.levels || []);
  if (lv.has(level)) { lv.delete(level); }
  else { lv.add(level); c.off = (c.off || []).filter(k => !at.has(k)); c.add = (c.add || []).filter(k => !at.has(k)); }
  c.levels = LEVELS.filter(l => lv.has(l));
  tidy(c);
}
// One option's tick box.
export function toggleOption(c, key, want) {
  const e = ladder([c.topic]).find(x => x.key === key); if (!e) return;
  const covered = e.levels.some(l => (c.levels || []).includes(l));
  const off = new Set(c.off || []), add = new Set(c.add || []);
  if (want) { if (covered) off.delete(key); else add.add(key); } else { if (covered) off.add(key); add.delete(key); }
  c.off = [...off]; c.add = [...add];
  tidy(c);
}
function tidy(c) { const cov = new Set(ladder([c.topic]).filter(e => e.levels.some(l => (c.levels || []).includes(l))).map(e => e.key)); c.off = (c.off || []).filter(k => cov.has(k)); c.add = (c.add || []).filter(k => !cov.has(k)); }

// The choices of a pool definition. Older pools (a list of question types) become one choice per topic with those options hand-picked.
export function poolChoices(def) {
  if (def.choices) return def.choices;
  const byTopic = new Map();
  for (const cand of def.candidates || []) {
    const star = cand.pick.endsWith(':*'), p = parsePick(star ? cand.pick.slice(0, -2) : cand.pick);
    if (!p) continue;
    const keys = star || !cand.pick.includes(':') ? p.t.variants.map(v => `${p.t.id}:${v.id}`) : [`${p.t.id}:${p.v.id}`];
    const c = byTopic.get(p.t.topic) || { topic: p.t.topic, levels: [], off: [], add: [], enabled: false };
    c.add.push(...keys); if (cand.on !== false) c.enabled = true;
    byTopic.set(p.t.topic, c);
  }
  return [...byTopic.values()].map(c => ({ ...c, add: [...new Set(c.add)], enabled: c.enabled !== false ? true : false }));
}
// Convert in place (so the pool can be edited), and drop the old list
export function upgradePool(def) { if (!def.choices) { def.choices = poolChoices(def); delete def.candidates; } return def; }

// every option the pool can draw, with the topic it belongs to: Map topic -> entries
export function poolByTopic(def) {
  const m = new Map();
  for (const c of poolChoices(def)) {
    if (!isOn(c)) continue;
    const have = m.get(c.topic) || new Map();
    for (const e of choiceOptions(c)) have.set(e.key, e);
    if (have.size) m.set(c.topic, have);
  }
  return new Map([...m].map(([t, h]) => [t, [...h.values()]]));
}
export const poolTopics = (def) => [...poolByTopic(def).keys()];
