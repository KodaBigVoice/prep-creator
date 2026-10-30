// The preset editor: shared pools, saving a draft as a preset, and loading it back.
import { prepFromPreset, newPrep, addQuestionDef } from '../src/data/prep.js';
import { newChoice, poolTopics } from '../src/data/pools.js';
import { presetFromPrep, syncPool, upsertPool, addFromDef, setSlotPool, pruneDraftPools, poolUsers, ruleText, sharedFor } from '../src/data/presetdraft.js';
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

if (bad) { console.log(bad, 'failures'); process.exit(1); } else console.log('presetdraft tests passed');
