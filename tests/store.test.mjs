// Several tabs share one store: merging saves, deletions, and presets with sections.
const mem = {}; globalThis.localStorage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
const { loadStore, flushStore, refreshStore, forget, KEY } = await import('../src/data/store.js');
const { newPrep, prepFromPreset, addQuestion } = await import('../src/data/prep.js');
const { presetFromPrep } = await import('../src/data/presetdraft.js');
const S = await import('../src/data/sections.js');
const { newPlan, setOn, buildSection, planOptions } = await import('../src/data/plan.js');
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };

// ---- two tabs saving into one store ----
const A = loadStore(), B = loadStore();                 // the prep creator tab and the worksheet tab (A = prep page here)
A.preps.push({ id: 'p1', name: 'Prep one', set: 'Y7 Additional', saved: '2026-11-01T10:00:00Z' });
flushStore(A);
B.preps.push({ id: 'w1', name: 'Worksheet one', set: 'Y7 Additional', saved: '2026-11-01T10:05:00Z' });
B.presets.push({ id: 'u1', name: 'Mine', set: 'Y7 Additional', updated: '2026-11-01T10:06:00Z' });
// B is a stale copy: it never saw p1. Saving must not delete it, and must not wipe A's slot or layout.
flushStore(B);
let disk = JSON.parse(mem[KEY]);
ok(disk.preps.map(p => p.id).sort().join() === 'p1,w1', 'both preps survive: ' + disk.preps.map(p => p.id));
ok(disk.presets.length === 1, 'preset saved');
// A saves again (stale about w1 and the preset): nothing is lost
A.preps[0].name = 'Prep one (edited)'; A.preps[0].saved = '2026-11-01T11:00:00Z';
flushStore(A);
disk = JSON.parse(mem[KEY]);
ok(disk.preps.length === 2 && disk.preps.find(p => p.id === 'p1').name === 'Prep one (edited)', 'the newer copy wins');
ok(A.presets.length === 1, 'the prep tab has picked up the preset from the other tab');
// an older copy never beats a newer one
A.preps.find(p => p.id === 'w1').saved = '2026-11-01T09:00:00Z'; A.preps.find(p => p.id === 'w1').name = 'stale';
flushStore(A); ok(JSON.parse(mem[KEY]).preps.find(p => p.id === 'w1').name === 'Worksheet one', 'stale copy loses');
// deleting: stays deleted across tabs
B.presets = B.presets.filter(p => p.id !== 'u1'); forget(B, 'u1'); flushStore(B);
flushStore(A);
ok(JSON.parse(mem[KEY]).presets.length === 0 && A.presets.length === 0, 'a deleted preset is not brought back by the other tab');
// refresh brings in new things
B.preps.push({ id: 'w2', name: 'Second', set: 'Y7 Additional', saved: '2026-11-02T00:00:00Z' }); flushStore(B);
refreshStore(A); ok(A.preps.some(p => p.id === 'w2'), 'refresh picks up new work');
// pinned topics join
A.settings.pinned = ['Equations']; B.settings.pinned = ['Percentages']; flushStore(B); flushStore(A);
ok(JSON.parse(mem[KEY]).settings.pinned.sort().join() === 'Equations,Percentages', 'pinned topics merge');
disk = JSON.parse(mem[KEY]);

// ---- presets with sections ----
let p = newPrep({ set: 'Y7 Additional', name: 'WS', minutes: 30 });
const plan = newPlan('Percentages', 6); planOptions('Percentages').slice(0, 3).forEach(e => setOn(plan, e.key, true));
buildSection(p, plan, 'Of amounts');
const plan2 = newPlan('Equations', 4); planOptions('Equations').slice(0, 2).forEach(e => setOn(plan2, e.key, true));
buildSection(p, plan2, 'Equations');
const preset = presetFromPrep(p, { name: 'Two topics' });
ok(preset.sections.length === 2 && preset.sections[0].at === 0 && preset.sections[1].at === 6 && preset.sections[1].title === 'Equations', 'preset keeps the sections: ' + JSON.stringify(preset.sections.map(s => [s.at, s.title])));
ok(preset.updated && preset.questions.length === 10, 'preset has a timestamp and ten questions');
const again = prepFromPreset(JSON.parse(JSON.stringify(preset)), 'Y7 Additional', 'x');
ok(S.labelsOf(again).join() === S.labelsOf(p).join(), 'a worksheet made from the preset has the same sections: ' + S.labelsOf(again).join(' '));
ok(again.questions[6].sec.title === 'Equations' && again.questions[0].sec.plan.topic === 'Percentages', 'titles and plans come back');
ok(JSON.stringify(again.questions.map(q => q.slots[0].snapshot.parts[0].body)) !== JSON.stringify(p.questions.map(q => q.slots[0].snapshot.parts[0].body)), 'with fresh numbers');
// a preset without sections still gives plain numbers; the starter is a prep preset
const { STARTER_PRESETS } = await import('../src/data/presets.js');
ok(!S.hasSections(prepFromPreset(STARTER_PRESETS[0], 'Y7 Additional', 'x')), 'no sections in the starter');
console.log(bad ? `${bad} FAILED` : 'store and preset sections: all ok');
process.exit(bad ? 1 : 0);
