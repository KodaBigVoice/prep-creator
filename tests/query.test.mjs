// Choosing by description: levels, ladder order, nudging, recipes.
import { LEVELS, ladder, levelCounts, resolve, step, topicList } from '../src/data/query.js';
import { makeSlot, nudgeSlot, rerollSlot, setQuery, queryOfPick, newPrep, prepFromPreset } from '../src/data/prep.js';
import { STARTER_PRESETS } from '../src/data/presets.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };

// every topic has a ladder in non-decreasing difficulty, and every level request resolves to something
for (const t of topicList()) {
  const L = ladder([t.name]);
  ok(L.length === t.n, `ladder size ${t.name}`);
  ok(L.every((e, i) => !i || L[i - 1].d <= e.d), `ladder sorted ${t.name}`);
  for (const lv of LEVELS) { const r = resolve({ topics: [t.name], level: lv }); ok(r.list.length > 0, `${t.name} ${lv} resolves`); if (!r.fell) ok(r.list.every(e => e.levels.includes(lv)), `${t.name} ${lv} members`); }
  const c = levelCounts([t.name]);
  for (const lv of LEVELS) if (!c[lv]) ok(resolve({ topics: [t.name], level: lv }).fell, `${t.name} ${lv} is empty so should fall back`);
}
// nudging walks the whole ladder one way, and back the other, never skipping and never leaving the topics
const prep = newPrep({ set: 'Y7 Additional', name: 't', minutes: 30 });
const s = makeSlot({ mode: 'query', topics: ['Percentages'], level: 'Foundation' });
prep.questions.push({ id: 'q', slots: [s] });
const seen = [s.pick];
for (let i = 0; i < 200 && nudgeSlot(prep, s, 1); i++) { seen.push(s.pick); ok(s.meta.topic === 'Percentages', 'stays in topic'); }
ok(new Set(seen).size === seen.length, 'no repeats going up');
const full = ladder(['Percentages']);
ok(seen.length > 20, 'climbs a long way: ' + seen.length);
ok(s.def.level === 'Further' || !full.some(e => e.levels.includes('Further')), 'ends in the top level');
for (let i = 1; i < seen.length; i++) ok(full.findIndex(e => e.key === seen[i]) > full.findIndex(e => e.key === seen[i - 1]), 'ladder order');
let prevIdx = full.findIndex(e => e.key === s.pick), down = 0;
while (nudgeSlot(prep, s, -1)) { const k = full.findIndex(e => e.key === s.pick); ok(k < prevIdx, 'ladder order going down'); prevIdx = k; down++; }
ok(down >= seen.length - 1 && s.pick === full[0].key, 'walks all the way back down to the easiest');
// range
const rs = makeSlot({ mode: 'query', topics: ['Equations'], level: null, lo: 4, hi: 6 });
ok(resolve(rs.def).list.every(e => e.d >= 4 && e.d <= 6), 'range members');
ok(rs.meta.topic === 'Equations', 'range slot');
// re-roll gives a question that still fits, and mostly a different one
let diff = 0; for (let i = 0; i < 20; i++) { const before = rs.pick; rerollSlot(prep, rs); ok(resolve(rs.def).list.some(e => e.key === rs.pick), 'reroll fits'); if (rs.pick !== before) diff++; }
ok(diff >= 12, 'reroll changes the question: ' + diff);
// switching mode keeps the question; a hand pick becomes a quick query with its level
const q = queryOfPick('sub-neg-add:one-negative'); ok(q && q.topics[0] === 'Substitution' && LEVELS.includes(q.level), 'queryOfPick');
const keep = makeSlot({ mode: 'fixed', pick: 'sub-neg-add:one-negative' }); const pk = keep.pick;
setQuery(prep, keep, q); ok(keep.pick === pk && keep.def.mode === 'query', 'switching to quick keeps the question');
// the starter recipe builds many times without errors, and every slot fits its description
for (let i = 0; i < 40; i++) {
  const p = prepFromPreset(STARTER_PRESETS[0], 'Y7 Additional', 'x');
  p.questions.forEach(qq => qq.slots.forEach(sl => { if (sl.def.mode === 'query') ok(resolve(sl.def).list.some(e => e.key === sl.pick), 'recipe slot fits ' + sl.pick); }));
  const keys = p.questions.flatMap(qq => qq.slots.map(sl => sl.pick));
  ok(new Set(keys).size >= keys.length - 1, 'recipe avoids the same option twice');
}
console.log(bad ? `${bad} problems` : 'query tests passed');
process.exit(bad ? 1 : 0);
