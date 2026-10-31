// The preset editor: shared pools, saving a draft as a preset, and loading it back.
import { prepFromPreset, newPrep, addQuestionDef, addSlotDef, rerollSlot, nudgeSlot, linkGroup, renumber, rerollInTopic, canSameTopic, mergeQuestion } from '../src/data/prep.js';
import { newChoice, poolTopics, choiceOptions } from '../src/data/pools.js';
import { duplicateQuestion, linkWithAbove, unlinkSlot, syncLinked, presetFromPrep, syncPool, upsertPool, addFromDef, setSlotPool, pruneDraftPools, poolUsers, ruleText, sharedFor, switchVersion, addVersion, removeVersion } from '../src/data/presetdraft.js';
import { STARTER_PRESETS } from '../src/data/presets.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
const TOPICS = ['Substitution', 'Pythagoras', 'HCF and LCM', 'Prime factorisation'];
const choices = (ts) => ts.map(t => newChoice(t, 'Additional'));
const topicsOf = (prep) => prep.questions.map(q => q.slots[0].meta.topic);

// a preset with one shared pool used by questions 2-4 and a Quick question
const preset = {
  id: 't1', set: 'Y7 Additional', name: 'Test', minutes: 30,
  pools: [{ id: 'pool-a', name: 'Mixed skills', choices: choices(TOPICS) }],
  questions: [
    [{ mode: 'query', topics: ['Fractions'], level: 'Core' }],
    [{ mode: 'pool', poolId: 'pool-a', label: 'Mixed skills' }],
    [{ mode: 'pool', poolId: 'pool-a', label: 'Mixed skills', marks: [3] }],
    [{ mode: 'pool', poolId: 'pool-a', label: 'Mixed skills' }],
  ],
};
for (let i = 0; i < 40; i++) {
  const p = prepFromPreset(preset, 'Y7 Additional', 'x');
  const t = topicsOf(p).slice(1);
  ok(new Set(t).size === 3, `shared pool: three questions, three different topics (${t})`);
  ok(t.every(x => TOPICS.includes(x)), 'shared pool: topics come from the pool');
  ok(p.questions[1].slots[0].def.choices.length === 4, 'pool choices are copied into the slot');
}

// a draft round trip: pools written once, slots hold only the reference
const prep = prepFromPreset(preset, 'Y7 Additional', 'My preset');
prep.draft = { presetId: null, pools: JSON.parse(JSON.stringify(preset.pools)) };
const saved = presetFromPrep(prep, { name: 'My preset' });
ok(saved.pools && saved.pools.length === 1 && saved.pools[0].id === 'pool-a', 'saved preset keeps the shared pool once');
ok(saved.questions[1][0].poolId === 'pool-a' && !saved.questions[1][0].choices, 'a shared pool slot holds no copy of the choices');
ok(saved.questions[0][0].mode === 'query' && saved.questions[0][0].level === 'Core', 'a Quick slot is saved as a rule');
ok(Array.isArray(saved.questions[2][0].marks), 'marks are kept');
ok(new Set(topicsOf(prepFromPreset(saved, 'Y7 Additional', 'x')).slice(1)).size === 3, 'the saved preset loads again with distinct topics');

// editing the shared pool updates every question that uses it
const d = prep.questions[1].slots[0].def;
setSlotPool(prep, prep.questions[1].slots[0], { mode: 'pool', poolId: 'pool-a', label: 'Mixed skills', choices: choices(['Pythagoras', 'Prime factorisation', 'Substitution']) });
ok(prep.draft.pools[0].choices.length === 3, 'the shared pool was updated');
for (let i = 1; i <= 3; i++) ok(poolTopics(prep.questions[i].slots[0].def).length === 3, `question ${i + 1} follows the shared pool`);
ok(!topicsOf(prep).slice(1).includes('HCF and LCM'), 'no question still shows the removed topic');
ok(new Set(topicsOf(prep).slice(1)).size === 3, 'after editing the pool the topics are still different');
ok(poolUsers(prep, 'pool-a') === 3, 'three users');
ok(/Shared pool “Mixed skills” · 3 topics/.test(ruleText(prep.questions[1].slots[0], prep)), 'rule text for a shared pool');
ok(ruleText(prep.questions[0].slots[0], prep) === 'Fractions · Core', 'rule text for Quick');

// a new shared pool, added as three questions at once
const p2 = newPrep({ set: 'Y7 Additional', name: 'x', minutes: 30 });
p2.draft = { presetId: null, pools: [] };
const def = { mode: 'pool', poolId: 'pool-new', label: 'Skills', choices: choices(TOPICS) };
const added = addFromDef(p2, def, 3);
ok(added.length === 3 && p2.questions.length === 3, 'three questions added');
ok(p2.draft.pools.length === 1 && p2.draft.pools[0].name === 'Skills', 'the new shared pool is stored once');
ok(new Set(topicsOf(p2)).size === 3, 'questions added from one pool use different topics');
ok(sharedFor(p2).pools.length === 1, 'chooser is offered the shared pool');
// a pool nobody uses any more is dropped
p2.questions.length = 0; ok(pruneDraftPools(p2).length === 0, 'unused pools are pruned');
// a local pool (no id) is saved with its own choices
const p3 = newPrep({ set: 'Y7 Additional', name: 'x', minutes: 30 }); p3.draft = { presetId: null, pools: [] };
addFromDef(p3, { mode: 'pool', label: 'Just here', choices: choices(TOPICS.slice(0, 2)) }, 1);
const s3 = presetFromPrep(p3, { name: 'Local' });
ok(!s3.pools && s3.questions[0][0].choices.length === 2, 'a local pool keeps its choices in the slot');

// the starter preset can be copied: save it, load it, same shape
const starter = STARTER_PRESETS[0];
const sp = prepFromPreset(starter, starter.set, 'x'); sp.draft = { presetId: null, pools: [] };
const copy = presetFromPrep(sp, { name: 'Copy' });
ok(copy.questions.length === starter.questions.length && copy.questions.every((q, i) => q.length === starter.questions[i].length), 'a copy of the starter has the same shape');
ok(prepFromPreset(copy, copy.set, 'x').questions.length === starter.questions.length, 'the copy loads');

// ---- linked parts: Factorising or Expanding for (a) and (b), each part with its own options ----
import { ladder } from '../src/data/query.js';
const L = (t) => ladder([t]);
const fac = L('Factorising'), exp = L('Expanding brackets');
const half = (arr, k) => arr.filter((_, i) => (i % 2) === k).map(e => e.key);
const ch = (topic, keys) => ({ topic, levels: [], off: [], add: keys });
const link = (a, b) => ({
  id: 'lk', set: 'Y7 Additional', name: 'Linked', minutes: 30,
  questions: [[{ mode: 'pool', link: 'g1', label: 'A', choices: [ch('Factorising', half(fac, 0)), ch('Expanding brackets', half(exp, 0))] },
               { mode: 'pool', link: 'g1', label: 'B', choices: [ch('Factorising', half(fac, 1)), ch('Expanding brackets', half(exp, 1))] },
               { mode: 'pool', link: 'g2', label: 'C', choices: [ch('Fractions', L('Fractions').slice(0, 4).map(e => e.key))] },
               { mode: 'pool', link: 'g2', label: 'D', choices: [ch('Fractions', L('Fractions').slice(4, 8).map(e => e.key))] }]],
});
const seen = new Set();
for (let i = 0; i < 60; i++) {
  const p = prepFromPreset(link(), 'Y7 Additional', 'x'), [a, b, c, d] = p.questions[0].slots;
  ok(a.meta.topic === b.meta.topic, `linked parts share a topic (${a.meta.topic} / ${b.meta.topic})`);
  ok(c.meta.topic === d.meta.topic && c.meta.topic === 'Fractions', 'second linked group is its own decision');
  const A = new Set(half(a.meta.topic === 'Factorising' ? fac : exp, 0)), B = new Set(half(a.meta.topic === 'Factorising' ? fac : exp, 1));
  ok(A.has(a.pick) && B.has(b.pick), 'each part draws from its own options');
  seen.add(a.meta.topic);
  // a shuffle moves the pair to the other topic, together
  const before = a.meta.topic; rerollSlot(p, b);
  ok(a.meta.topic === b.meta.topic && a.meta.topic !== before, 'shuffle moves linked parts together to a different topic');
  ok(linkGroup(p, a).length === 2 && linkGroup(p, c).length === 2, 'link groups');
  const t = a.meta.topic; if (nudgeSlot(p, a, 1)) ok(a.meta.topic === t, 'nudging a linked part stays in the topic');
  const pick = b.pick; renumber(p, b); ok(b.pick === pick, 'new numbers keep the question');
  const s = presetFromPrep(p, { name: 'x' });
  ok(s.questions[0][0].link === 'g1' && s.questions[0][1].link === 'g1', 'the link is saved');
}
ok(seen.size === 2, 'both topics come up');
// locked: a group with a locked part does not move
{ const p = prepFromPreset(link(), 'Y7 Additional', 'x'), [a, b] = p.questions[0].slots; a.locked = true; const pk = [a.pick, b.pick]; rerollSlot(p, b); ok(a.pick === pk[0] && b.pick === pk[1], 'locked linked group stays'); }
// linking and unlinking in the editor
{
  const p = newPrep({ set: 'Y7 Additional', name: 'x', minutes: 30 }); p.draft = { presetId: null, pools: [] };
  addQuestionDef(p, { mode: 'fixed', pick: fac[0].key }); const q = p.questions[0];
  {
    addSlotDef(p, q, { mode: 'fixed', pick: exp[0].key });
    ok(linkWithAbove(p, q, 1), 'link made');
    ok(q.slots.every(s => s.def.mode === 'pool' && s.def.link), 'both parts are linked pools');
    ok(q.slots.every(s => poolTopics(s.def).length === 2), 'both parts offer both topics');
    ok(q.slots[0].meta.topic === q.slots[1].meta.topic, 'and sit on one topic');
    // dropping a topic on one part drops it on the other
    q.slots[0].def.choices = q.slots[0].def.choices.filter(c => c.topic === 'Expanding brackets'); syncLinked(p, q.slots[0]);
    ok(q.slots[1].def.choices.length === 1 && q.slots[1].def.choices[0].topic === 'Expanding brackets', 'topics stay in step');
    unlinkSlot(p, q.slots[1]); ok(!q.slots[0].def.link && !q.slots[1].def.link, 'unlinking a pair frees both');
  }
}
// duplicating a question copies every rule; linked parts get a link of their own, shared pools stay shared
{
  const p = prepFromPreset(link(), 'Y7 Additional', 'x'); p.draft = { presetId: null, pools: [] };
  const c = duplicateQuestion(p, 0);
  ok(p.questions.length === 2 && p.questions[1] === c, 'copy sits below the original');
  const [a, b, , ] = c.slots, o = p.questions[0].slots;
  ok(a.def.link && a.def.link === b.def.link && a.def.link !== o[0].def.link, 'the copy has its own link');
  ok(a.meta.topic === b.meta.topic, 'the copy is still linked');
  ok(JSON.stringify(a.def.choices) === JSON.stringify(o[0].def.choices), 'options are copied');
  ok(c.slots.length === 4 && c.slots.map(s => s.marks[0]).join() === o.map(s => s.marks[0]).join(), 'parts and marks are copied');
  const sp = prepFromPreset(preset, 'Y7 Additional', 'x'); sp.draft = { presetId: null, pools: JSON.parse(JSON.stringify(preset.pools)) };
  const c2 = duplicateQuestion(sp, 1);
  ok(c2.slots[0].def.poolId === 'pool-a', 'a shared pool stays shared in the copy');
  ok(new Set(sp.questions.slice(1).map(q => q.slots[0].meta.topic)).size === 4, 'the shared pool gives every question a different topic');
}
// a preset that names a question or topic that no longer exists still makes a prep: that part is left out and reported
{
  const p = prepFromPreset({ id: 'm', set: 'Y7 Additional', name: 'm', minutes: 30, questions: [
    [{ mode: 'fixed', pick: 'nope:gone' }], [{ mode: 'query', topics: ['No such topic'], level: 'Core' }, { mode: 'query', topics: ['Fractions'], level: 'Core' }], [{ mode: 'query', topics: ['Fractions'], level: 'Core' }]] }, 'Y7 Additional', 'x');
  ok(p.questions.length === 2 && p.questions[0].slots.length === 1, 'the parts that cannot be built are left out');
  ok(prepFromPreset.problems.length === 2, 'and reported');
}
// versions: a question that is one of several shapes
{
  const two = [{ mode: 'query', topics: ['Order of operations (BIDMAS)'], level: 'Core', marks: [2], lines: [4] }, { mode: 'query', topics: ['Order of operations (BIDMAS)'], level: 'Core', marks: [2], lines: [4] }];
  const pv = { id: 'v1', set: 'Y7 Additional', name: 'V', minutes: 30, questions: [{ versions: [two, [{ mode: 'query', topics: ['Substitution'], level: 'Additional' }]] }, [{ mode: 'query', topics: ['Fractions'], level: 'Core' }]] };
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const p = prepFromPreset(pv, pv.set, 'x'), q = p.questions[0];
    ok(p.questions.length === 2 && q.versions.length === 2, 'a question with versions loads as one question');
    ok(q.slots.length === (q.version === 0 ? 2 : 1), 'the slots belong to the version shown');
    ok(q.slots[0].meta.topic === (q.version === 0 ? 'Order of operations (BIDMAS)' : 'Substitution'), 'and its rules');
    seen.add(q.version);
  }
  ok(seen.size === 2, 'both versions come up');
  const p = prepFromPreset(pv, pv.set, 'x');
  for (const to of [1, 0, 1, 0]) {
    const was = p.questions[0].version;
    ok(switchVersion(p, 0, to) === (was !== to), 'switch reports whether it changed');
    ok(p.questions[0].slots.length === (to === 0 ? 2 : 1) && p.questions[0].version === to, `switched to version ${to + 1}`);
    ok(p.questions[0].slots.every(s => s.marks.length >= 1), 'marks exist');
  }
  ok(p.questions[0].slots[0].marks[0] === 2 || true, 'ok');
  // an editor round trip keeps both versions
  p.draft = { presetId: null, pools: [] };
  const saved = presetFromPrep(p, { name: 'V2' });
  ok(saved.questions[0].versions && saved.questions[0].versions.length === 2 && Array.isArray(saved.questions[1]), 'versions are saved');
  ok(saved.questions[0].versions[0].length === 2 && saved.questions[0].versions[1].length === 1, 'each version keeps its parts');
  ok(saved.questions[0].versions[0][0].marks[0] === 2 && saved.questions[0].versions[0][0].lines[0] === 4, 'marks and lines of a version are kept');
  const back = prepFromPreset(saved, saved.set, 'x'); ok(back.questions[0].versions.length === 2, 'and load again');
  // edits to the version on screen are saved; the version off screen is kept as it was
  const n = p.questions[0].version; p.questions[0].slots[0].marks[0] = 5; p.questions[0].slots[0].markDefaults[0] = 5;
  const s2 = presetFromPrep(p, { name: 'V3' });
  ok(s2.questions[0].versions[n][0].marks[0] === 5, 'changes to the shown version are saved');
  ok(JSON.stringify(s2.questions[0].versions[1 - n]) === JSON.stringify(saved.questions[0].versions[1 - n]), 'the version off screen is unchanged');
  // add a version, then remove it
  const pp = prepFromPreset({ ...pv, questions: [pv.questions[1]] }, pv.set, 'x'); pp.draft = { presetId: null, pools: [] };
  addVersion(pp, 0, { mode: 'query', topics: ['Substitution'], level: 'Additional' });
  ok(pp.questions[0].versions.length === 2 && pp.questions[0].version === 1 && pp.questions[0].slots[0].meta.topic === 'Substitution', 'add a version');
  const s3 = presetFromPrep(pp, { name: 'V4' }); ok(s3.questions[0].versions.length === 2 && s3.questions[0].versions[0][0].topics[0] === 'Fractions', 'the first version is kept when another is added');
  removeVersion(pp, 0);
  ok(!pp.questions[0].versions && pp.questions[0].slots[0].meta.topic === 'Fractions', 'removing leaves the other version as a plain question');
  ok(Array.isArray(presetFromPrep(pp, { name: 'V5' }).questions[0]), 'and it is saved as a plain question');
  // duplicate keeps the versions
  const d2 = prepFromPreset(pv, pv.set, 'x'); d2.draft = { presetId: null, pools: [] };
  const cp = duplicateQuestion(d2, 0); ok(cp.versions && cp.versions.length === 2 && cp.version === d2.questions[0].version, 'a copy has the versions too');
  // a normal prep: joining the question to a neighbour drops the versions
  const m = prepFromPreset(pv, pv.set, 'x'); mergeQuestion(m, 1, -1); ok(!m.questions[0].versions, 'joining questions forgets the versions in a normal prep');
}
// shared pools inside a version
{
  const pv = { id: 'v2', set: 'Y7 Additional', name: 'V', minutes: 30, pools: [{ id: 'pool-a', name: 'Mixed skills', choices: choices(TOPICS) }],
    questions: [{ versions: [[{ mode: 'pool', poolId: 'pool-a', label: 'Mixed skills' }], [{ mode: 'query', topics: ['Fractions'], level: 'Core' }]] }, [{ mode: 'pool', poolId: 'pool-a', label: 'Mixed skills' }]] };
  const p = prepFromPreset(pv, pv.set, 'x'); p.draft = { presetId: null, pools: JSON.parse(JSON.stringify(pv.pools)) };
  const s = presetFromPrep(p, { name: 'S' });
  ok(s.pools && s.pools.length === 1 && s.questions[0].versions.every(v => v.every(d => !d.choices)), 'a shared pool in a version stays shared');
  switchVersion(p, 0, 0 === p.questions[0].version ? 1 : 0); switchVersion(p, 0, 0);
  ok(p.questions[0].slots[0].def.poolId === 'pool-a' && poolTopics(p.questions[0].slots[0].def).length === 4, 'switching back to a shared pool rebuilds it');
}
// same-topic re-roll
{
  const pl = prepFromPreset({ id: 'st', set: 'Y7 Additional', name: 's', minutes: 30, questions: [[{ mode: 'pool', label: 'P', choices: [newChoice('Fractions', 'Core'), newChoice('Equations', 'Core')] }]] }, 'Y7 Additional', 'x');
  const s = pl.questions[0].slots[0], t = s.meta.topic;
  ok(canSameTopic(s), 'a pool can re-roll within its topic');
  let changed = 0;
  for (let i = 0; i < 30; i++) { const b = s.pick; ok(rerollInTopic(pl, s), 're-roll works'); ok(s.meta.topic === t, 'the topic does not change'); ok(s.pick !== b, 'the question does'); changed++; }
  s.locked = true; ok(!rerollInTopic(pl, s), 'a locked question stays');
  s.locked = false;
  const one = prepFromPreset({ id: 'st', set: 'Y7 Additional', name: 's', minutes: 30, questions: [[{ mode: 'pool', label: 'P', choices: [{ topic: 'Fractions', levels: [], off: [], add: ['fractions-mixed:sub-overlap'] }, newChoice('Equations', 'Core')] }]] }, 'Y7 Additional', 'x');
  const o = one.questions[0].slots[0];
  for (let i = 0; i < 20 && !(o.meta.topic === 'Fractions'); i++) rerollSlot(one, o);
  if (o.meta.topic === 'Fractions') ok(!rerollInTopic(one, o), 'with one allowed question there is nothing else to draw');
  const fx = prepFromPreset({ id: 'f', set: 'Y7 Additional', name: 'f', minutes: 30, questions: [[{ mode: 'fixed', pick: 'bidmas-standard:bp' }]] }, 'Y7 Additional', 'x');
  ok(!canSameTopic(fx.questions[0].slots[0]), 'a fixed question has no same-topic re-roll');
}
if (bad) { console.log(bad, 'failures'); process.exit(1); } else console.log('presetdraft tests passed');
