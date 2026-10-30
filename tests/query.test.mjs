// Choosing by description: levels, ladder order, nudging, recipes.
import { LEVELS, ladder, levelCounts, resolve, step, topicList } from '../src/data/query.js';
import { makeSlot, nudgeSlot, rerollSlot, renumber, setQuery, queryOfPick, newPrep, prepFromPreset } from '../src/data/prep.js';
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
// arrows work on any question: a fixed one becomes Quick; a pool stays a pool and keeps its topic
const fx = makeSlot({ mode: 'fixed', pick: 'bidmas-standard:bp' }); prep.questions.push({ id: 'f', slots: [fx] });
ok(nudgeSlot(prep, fx, 1) && fx.def.mode === 'query' && fx.def.topics[0] === 'Order of operations (BIDMAS)', 'nudge turns a fixed question into Quick');
const pl = makeSlot({ mode: 'pool', label: 'P', candidates: ['pct-buildup:*', 'hcf-lcm:*', 'indices-multiply:*'].map(p => ({ pick: p, on: true })) }); prep.questions.push({ id: 'p', slots: [pl] });
for (let i = 0; i < 12; i++) { const t = pl.meta.topic; nudgeSlot(prep, pl, i % 2 ? -1 : 1); ok(pl.def.mode === 'pool' && pl.meta.topic === t, 'pool nudge keeps the pool and the topic'); }
const topics = new Set(); for (let i = 0; i < 60; i++) { rerollSlot(prep, pl); topics.add(pl.meta.topic); }
ok(topics.size >= 2, 're-rolling a pool still moves between its topics: ' + [...topics]);
// new numbers keeps the question (also after a nudge); a different question may change it
const nq = makeSlot({ mode: 'query', topics: ['Equations'], level: 'Core' }); prep.questions.push({ id: 'n', slots: [nq] });
nudgeSlot(prep, nq, 1); const keepKey = nq.pick, keepDef = JSON.stringify(nq.def);
let changedNums = 0; for (let i = 0; i < 20; i++) { const b = nq.snapshot.parts[0].body; renumber(prep, nq); ok(nq.pick === keepKey && JSON.stringify(nq.def) === keepDef, 'renumber keeps the question and its definition'); if (nq.snapshot.parts[0].body !== b) changedNums++; }
ok(changedNums >= 15, 'renumber changes the numbers: ' + changedNums);
// ---- pools with choices: topic + levels + hand-picked options ----
{ const Pl = await import('../src/data/pools.js');
  const { newChoice, toggleLevel, toggleOption, choiceOptions, poolByTopic, poolChoices } = Pl;
  const c = newChoice('Substitution', 'Core');
  ok(choiceOptions(c).length === 29 && choiceOptions(c).every(e => e.levels.includes('Core')), 'a level chip includes every option at that level');
  toggleLevel(c, 'Additional'); const both = choiceOptions(c).length; ok(both > 29 && both <= 29 + 24, 'two levels: ' + both);
  const one = choiceOptions(c)[3].key; toggleOption(c, one, false); ok(!choiceOptions(c).some(e => e.key === one) && choiceOptions(c).length === both - 1, 'untick one option');
  toggleOption(c, one, true); ok(choiceOptions(c).length === both && !(c.off || []).length, 'tick it back: nothing left over');
  toggleLevel(c, 'Core'); toggleLevel(c, 'Additional');
  const hand = choiceOptions(c).length === 0; ok(hand, 'both chips off: empty');
  const keys = choiceOptions(newChoice('Substitution', 'Further')).map(e => e.key); toggleOption(c, keys[0], true);
  ok(choiceOptions(c).length === 1 && c.add.length === 1, 'hand-picking an option outside the levels adds just that one');
  // legacy pools (a list of question types) read as choices
  const leg = { mode: 'pool', label: 'Old', candidates: [{ pick: 'pct-buildup:*', on: true }, { pick: 'hcf-lcm:*', on: true }, { pick: 'sub-neg-add:one-negative', on: true }] };
  const ch = poolChoices(leg); ok(ch.length === 3 && ch.map(x => x.topic).sort().join() === ['HCF and LCM', 'Percentages', 'Substitution'].sort().join(), 'legacy pool becomes one choice per topic');
  ok(choiceOptions(ch.find(x => x.topic === 'Substitution')).length === 1, 'a single hand-picked legacy option stays single');
  // shuffling a pool always changes topic (when it has more than one); new numbers never does
  const P2 = await import('../src/data/prep.js');
  const def = { mode: 'pool', label: 'Mixed', choices: [newChoice('Substitution', 'Core'), newChoice('Order of operations (BIDMAS)', 'Core'), newChoice('Ratio and proportion', 'Core')] };
  const pp = newPrep({ set: 'Y7 Additional', name: 't', minutes: 30 }); const ps = P2.makeSlot(def); pp.questions.push({ id: 'pool', slots: [ps] });
  const seen = new Set();
  for (let i = 0; i < 80; i++) { const t0 = ps.meta.topic; P2.rerollSlot(pp, ps); seen.add(ps.meta.topic); ok(ps.meta.topic !== t0, `shuffle left ${t0} but landed on ${ps.meta.topic}`); }
  ok(seen.size === 3, 'all three topics come up: ' + [...seen]);
  const t1 = ps.meta.topic; for (let i = 0; i < 20; i++) { P2.renumber(pp, ps); ok(ps.meta.topic === t1, 'new numbers keeps the topic'); }
  // a pool with one topic shuffles to a different question in it
  const one1 = P2.makeSlot({ mode: 'pool', label: 'One', choices: [newChoice('Substitution', 'Core')] }); pp.questions.push({ id: 'one', slots: [one1] });
  let moved = 0; for (let i = 0; i < 20; i++) { const k = one1.pick; P2.rerollSlot(pp, one1); if (one1.pick !== k) moved++; } ok(moved >= 17, 'single-topic pool: shuffle changes the question ' + moved);
  // legacy pool shuffles topics too
  const lg = P2.makeSlot(leg); pp.questions.push({ id: 'leg', slots: [lg] });
  for (let i = 0; i < 40; i++) { const t0 = lg.meta.topic; P2.rerollSlot(pp, lg); ok(lg.meta.topic !== t0, 'legacy pool shuffle changes topic'); }
  // multi-topic Quick questions shuffle topics as well
  const mq = P2.makeSlot({ mode: 'query', topics: ['Substitution', 'Equations', 'Fractions'], level: 'Core' }); pp.questions.push({ id: 'mq', slots: [mq] });
  for (let i = 0; i < 40; i++) { const t0 = mq.meta.topic; P2.rerollSlot(pp, mq); ok(mq.meta.topic !== t0, 'multi-topic quick shuffle changes topic'); }
  // nudging a pool keeps its topic and stays a pool
  const t2 = ps.meta.topic; P2.nudgeSlot(pp, ps, 1); ok(ps.def.mode === 'pool' && ps.meta.topic === t2, 'nudge keeps pool + topic');
  console.log(bad ? `${bad} problems (pools)` : 'pool tests passed'); if (bad) process.exit(1);
}
// the starter recipe builds many times without errors, and every slot fits its description
for (let i = 0; i < 40; i++) {
  const p = prepFromPreset(STARTER_PRESETS[0], 'Y7 Additional', 'x');
  p.questions.forEach(qq => qq.slots.forEach(sl => { if (sl.def.mode === 'query') ok(resolve(sl.def).list.some(e => e.key === sl.pick), 'recipe slot fits ' + sl.pick); }));
  const keys = p.questions.flatMap(qq => qq.slots.map(sl => sl.pick));
  ok(new Set(keys).size >= keys.length - 1, 'recipe avoids the same option twice');
}
console.log(bad ? `${bad} problems` : 'query tests passed');
process.exit(bad ? 1 : 0);
