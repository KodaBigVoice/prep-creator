// Questions chosen by description rather than by name: one or more topics, plus a level, or a stretch of the ladder.
// A query definition looks like { mode: 'query', topics: ['Substitution'], level: 'Core' }  (Quick)
//                            or { mode: 'query', topics: [...], level: null, lo: 3.5, hi: 6.2, off: [keys] }  (Range)
import { entries } from '../core/engine.js';

export const LEVELS = ['Foundation', 'Core', 'Additional', 'Further'];
const lvIdx = (l) => LEVELS.indexOf(l);
let _all = null;
export const allEntries = () => (_all ??= entries());
export const byKey = () => Object.fromEntries(allEntries().map(e => [e.key, e]));
export const topicsOf = (def) => def.topics || (def.topic ? [def.topic] : []);
export const isRange = (def) => def.lo != null || def.hi != null;

// every topic, with how many options it has
export function topicList() {
  const m = new Map();
  for (const e of allEntries()) m.set(e.topic, (m.get(e.topic) || 0) + 1);
  return [...m].map(([name, n]) => ({ name, n })).sort((a, b) => a.name.localeCompare(b.name));
}
// the options of some topics, easiest first (ties keep the order of the bank)
export function ladder(topics) {
  const set = new Set(topics);
  return allEntries().filter(e => set.has(e.topic)).sort((a, b) => a.d - b.d || a.ti - b.ti || a.vi - b.vi);
}
// how many options each level has in these topics
export function levelCounts(topics) {
  const c = Object.fromEntries(LEVELS.map(l => [l, 0]));
  for (const e of ladder(topics)) for (const l of e.levels) c[l]++;
  return c;
}
const inRange = (e, def) => (def.lo == null || e.d >= def.lo - 1e-9) && (def.hi == null || e.d <= def.hi + 1e-9);

// The options a query can draw from. If the asked level has nothing in these topics, the nearest level that has
// something is used instead (and `fell` says so); a level asked for twice as far up prefers the easier side.
export function resolve(def) {
  const tops = topicsOf(def), off = new Set(def.off || []);
  const base = ladder(tops).filter(e => inRange(e, def) && !off.has(e.key));
  if (!def.level) return { list: base, level: null, fell: false };
  let list = base.filter(e => e.levels.includes(def.level));
  if (list.length) return { list, level: def.level, fell: false };
  const order = [...LEVELS].sort((a, b) => Math.abs(lvIdx(a) - lvIdx(def.level)) - Math.abs(lvIdx(b) - lvIdx(def.level)) || lvIdx(a) - lvIdx(b));
  for (const l of order) { list = base.filter(e => e.levels.includes(l)); if (list.length) return { list, level: l, fell: true }; }
  return { list: base, level: null, fell: true };
}

// A short description for lists and tooltips: "Substitution · Core", "Fractions +2 · Additional", "Percentages · from … to …"
export function describe(def) {
  const t = topicsOf(def);
  const name = t.length === 0 ? 'Any topic' : t.length === 1 ? t[0] : `${t[0]} +${t.length - 1}`;
  return `${name} · ${isRange(def) ? 'range' : def.level || 'any level'}`;
}

// The level to show for a question that was picked by hand: its lowest level that is not Foundation, unless Foundation is all it has
export const levelOf = (e) => e.levels.find(l => l !== 'Foundation') || e.levels[0] || 'Core';

// One step along the ladder. dir +1 is harder, -1 is easier. Inside a level the step stays inside it; at the end of the
// level it carries on into the next one and the level changes with it. Returns the new entry (and the level to use), or null at the end.
export function step(def, currentKey, dir) {
  const full = ladder(topicsOf(def)).filter(e => !(def.off || []).includes(e.key));
  const idx = full.findIndex(e => e.key === currentKey);
  if (idx < 0) return null;
  const level = def.level;
  if (level) {
    const inLevel = full.filter(e => e.levels.includes(level));
    const j = inLevel.findIndex(e => e.key === currentKey);
    if (j >= 0 && inLevel[j + dir]) return { entry: inLevel[j + dir], level };
  }
  const next = full[idx + dir];
  if (!next) return null;
  if (!level) return { entry: next, level: null };
  if (next.levels.includes(level)) return { entry: next, level };
  const ls = next.levels.map(lvIdx).sort((a, b) => a - b), here = lvIdx(level);
  const nl = dir > 0 ? (ls.find(i => i >= here) ?? ls[ls.length - 1]) : ([...ls].reverse().find(i => i <= here) ?? ls[0]);
  return { entry: next, level: LEVELS[nl] };
}
