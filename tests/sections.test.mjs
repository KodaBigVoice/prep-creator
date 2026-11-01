// Sections (A1, A2, B1...), moving and removing them, and plans that ramp.
import { newPrep, addQuestion, moveQuestion, mergeQuestion, removeSlot, splitSlot } from '../src/data/prep.js';
import * as S from '../src/data/sections.js';
import { newPlan, setOn, countsFor, buildSection, rebuildSection, planOptions, ticked } from '../src/data/plan.js';
import { composePrep, answerRows } from '../src/layout/compose.js';
import { ladder, topicList } from '../src/data/query.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
const prep = () => { const p = newPrep({ set: 'Y7 Additional', name: 'x', minutes: 30 }); return p; };
const labels = (p) => S.labelsOf(p).join(' ');

// no sections: plain numbers
let p = prep(); for (let i = 0; i < 4; i++) addQuestion(p, 'equations-one-step:add');
ok(labels(p) === '1 2 3 4', 'plain numbering');
ok(composePrep(p).every(q => !q.section), 'no headings without sections');

// start a section part-way: the first question gets one too
S.startSection(p, 2, 'Second');
ok(p.questions[0].sec && p.questions[2].sec.title === 'Second', 'first question gets an untitled section');
ok(labels(p) === 'A1 A2 B1 B2', 'A1 A2 B1 B2: ' + labels(p));
const cq = composePrep(p);
ok(cq[0].section && cq[0].section.letter === 'A' && cq[2].section.letter === 'B' && !cq[1].section, 'headings on the first question of each section');
ok(answerRows(cq).map(r => r.ref).join(' ') === 'A1 A2 B1 B2', 'answer refs use the labels: ' + answerRows(cq).map(r => r.ref));

// moving a question inside a section changes the order; across a boundary it changes section, not order
const ids = p.questions.map(q => q.id);
ok(moveQuestion(p, 1, 1) === 1, 'crossing a boundary keeps the index');
ok(labels(p) === 'A1 B1 B2 B3' && p.questions.map(q => q.id).join() === ids.join(), 'A2 moved down joins section B at the top, order unchanged: ' + labels(p));
ok(p.questions[1].sec && p.questions[1].sec.title === 'Second' && !p.questions[2].sec, 'the heading moved one place');
ok(moveQuestion(p, 1, -1) === 1 && labels(p) === 'A1 A2 B1 B2', 'and back up');
ok(moveQuestion(p, 2, 1) === 3 && labels(p) === 'A1 A2 B1 B2' && p.questions[3].id === ids[2] && p.questions[2].id === ids[3], 'inside a section the order changes, headings stay');
moveQuestion(p, 3, -1);
ok(moveQuestion(p, 0, 1) === 1 && p.questions[0].id === ids[1] && labels(p) === 'A1 A2 B1 B2', 'first question of the sheet moves down, heading stays on top');
moveQuestion(p, 1, -1);

// moving whole sections swaps the blocks
const first = p.questions.map(q => q.id);
S.moveSection(p, 0, 1);
ok(p.questions.map(q => q.id).join() === [first[2], first[3], first[0], first[1]].join(), 'sections swap');
ok(p.questions[0].sec.title === 'Second' && labels(p) === 'A1 A2 B1 B2', 'headings travel with their questions');
S.moveSection(p, 1, 1); ok(true, 'moving the last section down does nothing'); ok(!S.moveSection(p, 1, 1), 'refused');

// removing the question that carries a heading passes the heading on
p = prep(); for (let i = 0; i < 5; i++) addQuestion(p, 'equations-one-step:add');
S.startSection(p, 0, 'One'); S.startSection(p, 2, 'Two');
removeSlot(p, 2, 0);
ok(p.questions[2].sec && p.questions[2].sec.title === 'Two' && labels(p) === 'A1 A2 B1 B2', 'heading moves on when its question is removed: ' + labels(p));
// the last question of a section removed: the section goes
p = prep(); for (let i = 0; i < 3; i++) addQuestion(p, 'equations-one-step:add');
S.startSection(p, 2, 'Last'); removeSlot(p, 2, 0);
ok(labels(p) === 'A1 A2' && S.sectionsOf(p).length === 1, 'an emptied section disappears');
// joining and removing a section
p = prep(); for (let i = 0; i < 4; i++) addQuestion(p, 'equations-one-step:add');
S.startSection(p, 2, 'B');
ok(!S.joinWithAbove(p, 0) , 'the first heading stays while others follow');
ok(S.joinWithAbove(p, 1) && labels(p) === 'A1 A2 A3 A4', 'joined with the section above');
S.startSection(p, 1, 'X'); ok(S.removeSection(p, 1) === 3 && p.questions.length === 1, 'remove section takes its questions');
S.joinWithAbove(p, 0); ok(!S.hasSections(p) && labels(p) === '1', 'only heading removed: plain numbers again');
// merging into a neighbour
p = prep(); for (let i = 0; i < 4; i++) addQuestion(p, 'equations-one-step:add');
S.startSection(p, 2, 'B'); mergeQuestion(p, 2, -1);
ok(p.questions.length === 3 && p.questions[2].sec && labels(p) === 'A1 A2 B1', 'merging the first question of a section upward keeps the section: ' + labels(p));
p = prep(); for (let i = 0; i < 2; i++) addQuestion(p, 'equations-one-step:add'); p.questions[1].slots.push(p.questions[0].slots[0]);
S.startSection(p, 1, 'B'); const n0 = p.questions.length; splitSlot(p, 1, 1);
ok(p.questions.length === n0 + 1 && labels(p) === 'A1 B1 B2', 'split: ' + labels(p));

// sections survive a JSON round trip (undo, history file)
const copy = JSON.parse(JSON.stringify(p)); ok(S.labelsOf(copy).join() === S.labelsOf(p).join(), 'round trip');
ok(S.sectionLetter(0) === 'A' && S.sectionLetter(25) === 'Z' && S.sectionLetter(26) === 'AA', 'letters');
ok(S.headingText('B', ' Two-step ') === 'Section B: Two-step' && S.headingText('A', '') === 'Section A', 'heading text');

// ---- plans ----
ok(S.spreadCounts(3, 10).join() === '3,3,4' && S.spreadCounts(4, 10).join() === '2,2,3,3' && S.spreadCounts(5, 3).join() === '1,0,1,0,1' && S.spreadCounts(24, 6)[0] === 1 && S.spreadCounts(24, 6)[23] === 1 && S.spreadCounts(24, 6).reduce((a, b) => a + b) === 6, 'spread: extras go to the hard end');
ok(S.planCounts([{ manual: true, count: 5 }, {}, {}], 10).join() === '5,2,3', 'manual counts kept, the rest share');
const topic = 'Equations';
const opts = planOptions(topic);
ok(opts.length > 20, `Equations has many options (${opts.length})`);
const po = planOptions('Percentages'), skills = planOptions('Percentages', 'skills'), ctxs = planOptions('Percentages', 'context');
ok(skills.length + ctxs.length === po.length && ctxs.length > 5 && skills.length > 5, 'skills + in context partition the options');
const plan = newPlan(topic, 10);
[opts[0], opts[8], opts[16], opts[30]].forEach(e => setOn(plan, e.key, true));
ok(ticked(plan).map(it => it.key).join() === [opts[0], opts[8], opts[16], opts[30]].map(e => e.key).join(), 'ticks stay in ladder order');
setOn(plan, opts[30].key, true); ok(ticked(plan).length === 4, 'no duplicate ticks');
ok(countsFor(plan).join() === '2,2,3,3', 'ten over four: ' + countsFor(plan));
p = prep();
const made = buildSection(p, plan, 'Equations');
ok(made.length === 10 && p.questions.length === 10 && labels(p) === 'A1 A2 A3 A4 A5 A6 A7 A8 A9 A10', 'section built: ' + labels(p));
const ds = p.questions.map(q => q.slots[0].meta ? q.slots[0].pick : null);
const order = ladder([topic]).map(e => e.key);
ok(ds.every((k, i) => i === 0 || order.indexOf(k) >= order.indexOf(ds[i - 1])), 'questions ramp: never an easier option than the one before');
ok(new Set(p.questions.map(q => JSON.stringify(q.slots[0].snapshot.parts.map(x => [x.body, x.a])))).size === 10, 'no two identical questions');
ok(p.questions[0].sec.plan.topic === topic && p.questions[0].sec.title === 'Equations', 'plan remembered on the heading');
// a second section after it
const plan2 = newPlan('Percentages', 6); planOptions('Percentages').slice(0, 3).forEach(e => setOn(plan2, e.key, true));
buildSection(p, plan2, 'Percentages');
ok(S.sectionsOf(p).length === 2 && labels(p).endsWith('B1 B2 B3 B4 B5 B6'), 'second section appended');
// rebuild the first with fewer questions
const plan3 = JSON.parse(JSON.stringify(plan)); plan3.total = 4;
rebuildSection(p, 0, plan3, 'Equations');
ok(S.sectionsOf(p)[0].end === 4 && labels(p).startsWith('A1 A2 A3 A4 B1') && p.questions[4].sec.title === 'Percentages', 'rebuild replaces just that section: ' + labels(p));
// a manual count changes the shape
const plan4 = newPlan(topic, 6); [opts[0], opts[10]].forEach(e => setOn(plan4, e.key, true)); plan4.items[0].manual = true; plan4.items[0].count = 1;
ok(countsFor(plan4).join() === '1,5', 'manual count: ' + countsFor(plan4));
// the whole thing composes with long sections and answers
const cqs = composePrep(p); ok(cqs.length === p.questions.length && cqs[4].section.title === 'Percentages' && answerRows(cqs)[0].ref === 'A1', 'composes');
console.log(bad ? `${bad} FAILED` : 'sections: all ok');
process.exit(bad ? 1 : 0);
