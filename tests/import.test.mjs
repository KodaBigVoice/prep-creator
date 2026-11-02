// Import from Claude: the file format, its errors, and the round trip.
import katex from '../tools/katex-node.mjs';
const { parseImport, exportForClaude, suggestKeys, answerToTex, extractJson } = await import('../src/data/claudeimport.js');
const { composePrep, answerRows } = await import('../src/layout/compose.js');
const S = await import('../src/data/sections.js');
const P = await import('../src/data/prep.js');
const { randomPrep } = P;
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
const J = JSON.stringify;
const imp = (o) => parseImport(typeof o === 'string' ? o : J(o), { setId: 'Y7 Additional', katex });
const errs = (r) => (r.errors || []).map(e => `${e.path}: ${e.message}`);

// ---- a good file ----
const good = { pmu: 1, name: 'Equations', set: 'Y7 Additional', minutes: 25, calculator: 'non', layout: { mode: 'qo', marks: false },
  sections: [
    { title: 'Two-step', questions: [
      { pick: 'equations-one-step:add', seed: 11 },
      { pick: 'equations-two-step:cross', marks: 3 },
      { pick: 'equations-two-step:std', seed: 5, marks: 2, lines: 4 },
    ] },
    { title: 'Written', questions: [
      { text: 'Solve {{3x + 8 = 2}}', answer: 'x = -2', working: '{{3x = -6;\\ x = -2}}', marks: 2 },
      { stem: 'A rectangle has width {{x}} cm and perimeter {{30}} cm.', parts: [
        { text: 'Write an equation for the perimeter.', answer: '2x + 2L = 30', marks: 1 },
        { text: 'Find the length when {{x = 5}}.', answer: '10 \\text{ cm}', working: '{{2(5) + 2L = 30}}', marks: 2, calculator: true } ] },
      { parts: [{ pick: 'equations-one-step:times' }, { pick: 'equations-one-step:div' }] },
    ] } ] };
let r = imp(good);
ok(!r.errors, 'good file builds: ' + errs(r).join(' | '));
if (r.prep) {
  ok(r.prep.name === 'Equations' && r.prep.minutes === 25 && r.prep.calcMode === 'non', 'name, minutes, calculator');
  ok(r.layout.marks === false && r.layout.mode === 'qo', 'layout settings come back');
  ok(S.labelsOf(r.prep).join() === 'A1,A2,A3,B1,B2,B3', 'sections A1.. B3: ' + S.labelsOf(r.prep));
  ok(r.prep.questions[0].sec.title === 'Two-step' && r.prep.questions[3].sec.title === 'Written', 'section titles');
  ok(r.summary.questions === 6 && r.summary.sections === 2 && r.summary.written === 2, 'summary ' + J(r.summary));
  const cq = composePrep(r.prep);
  ok(cq[0].parts[0].text.includes('x') && cq[0].section.letter === 'A', 'bank question composes');
  ok(cq[1].marks === 3, 'marks override on a bank question');
  ok(cq[2].parts[0].marks === 2 && cq[2].parts[0].lines === 4, 'marks and lines override');
  ok(cq[3].parts[0].text === 'Solve {{3x + 8 = 2}}' && cq[3].marks === 2, 'written question text kept exactly');
  ok(cq[4].stem.startsWith('A rectangle') && cq[4].parts.length === 2 && cq[4].parts[0].l === 'a' && cq[4].marks === 3 && cq[4].calc, 'written multipart with a stem, labels, marks and calculator');
  ok(cq[5].parts.length === 2 && cq[5].parts[1].l === 'b', 'two bank options as (a) and (b)');
  const rows = answerRows(cq);
  ok(rows.find(x => x.ref === 'B1').a === 'x = -2' && rows.find(x => x.ref === 'B2(b)').a === '10 \\text{ cm}', 'answers kept as written');
  // the same seed gives the same question
  const again = imp(good); ok(composePrep(again.prep)[0].parts[0].text === cq[0].parts[0].text, 'a seed pins the numbers');
  // written questions never re-roll
  const wq = r.prep.questions[3].slots[0], before = J(wq.snapshot);
  P.rerollSlot(r.prep, wq); P.renumber(r.prep, wq); P.reseed(wq); ok(J(wq.snapshot) === before, 'written questions stay as they are on re-roll');
  ok(!P.canNudge(wq, 1) && !P.canSameTopic(wq), 'no easier/harder on a written question');
  // saved as a preset and used again
  const { presetFromPrep } = await import('../src/data/presetdraft.js');
  const preset = presetFromPrep(r.prep, { name: 'x' });
  const back = P.prepFromPreset(JSON.parse(J(preset)), 'Y7 Additional', 'x');
  ok(composePrep(back)[3].parts[0].text === 'Solve {{3x + 8 = 2}}' && S.labelsOf(back).join() === S.labelsOf(r.prep).join(), 'a preset keeps written questions and sections');
}
// ---- plain list, fenced in chat text, answers with {{ }} ----
const wrapped = 'Here you go!\n```json\n' + J({ pmu: 1, name: 'W', questions: [{ pick: 'pct-buildup:fives' }, { text: 'Find {{10\\%}} of £{{30}}', answer: 'It is {{£3}}' }] }, null, 1) + '\n```\nHope that helps.';
r = imp(wrapped); ok(!r.errors && r.prep.questions.length === 2 && !S.hasSections(r.prep), 'fenced file in chat text, no sections: ' + errs(r));
ok(r.prep && composePrep(r.prep)[1].parts[0].a === '\\text{It is }£3', 'answer written with {{ }} becomes LaTeX: ' + (r.prep && composePrep(r.prep)[1].parts[0].a));
ok(answerToTex('x = 5') === 'x = 5' && answerToTex('{{3}} cm') === '3\\text{ cm}', 'answerToTex');
ok(extractJson('blah {"a":1} blah') === '{"a":1}', 'extractJson');

// ---- errors Claude can act on ----
const e1 = imp({ pmu: 1, name: 'x', questions: [{ pick: 'pct-buildup:fivess' }, { pick: 'equations-two-step:crossing' }, { pick: 'nonsense' }] });
ok(e1.errors && e1.errors.length === 3, 'three bad keys, three errors: ' + errs(e1).join(' | '));
ok(e1.errors && e1.errors[0].path === 'questions[0].pick' && /pct-buildup:fives/.test(e1.errors[0].message), 'suggests the right option: ' + (e1.errors && e1.errors[0].message));
ok(e1.errors && /equations-two-step:cross/.test(e1.errors[1].message), 'wrong option of a real type lists that type: ' + (e1.errors && e1.errors[1].message));
ok(errs(imp('{ nope')).join().includes('not valid JSON'), 'invalid JSON');
ok(errs(imp({ name: 'x', questions: [{ pick: 'pct-buildup:fives' }] })).join().includes('"pmu" must be 1'), 'missing version');
ok(errs(imp({ pmu: 1, set: 'Y9 Core', questions: [{ pick: 'pct-buildup:fives' }] })).join().includes('Unknown set'), 'unknown set');
ok(errs(imp({ pmu: 1, questions: [{ text: 'Solve {{x = ', answer: '1' }] })).join().includes('never closed'), 'unclosed maths');
ok(errs(imp({ pmu: 1, questions: [{ text: 'Solve {{\\badcommand}}', answer: '1' }] })).join().includes('does not render'), 'maths that does not render');
ok(errs(imp({ pmu: 1, questions: [{ text: 'Solve', answer: '\\frac{1' }] })).join().includes('answer does not render'), 'answer that does not render');
ok(errs(imp({ pmu: 1, questions: [{ text: 'Solve' }] })).join().includes('"answer" is required'), 'answer required');
ok(errs(imp({ pmu: 1, questions: [{ text: 'Solve', answer: '1', marks: 0 }] })).join().includes('"marks" must be'), 'marks range');
ok(errs(imp({ pmu: 1, questions: [{ parts: [{ pick: 'pct-buildup:fives' }, { text: 'a', answer: 'b' }] }] })).join().includes('not a mixture'), 'mixing bank and written');
ok(errs(imp({ pmu: 1, sections: [{ title: 'A', questions: [] }] })).join().includes('needs a list'), 'empty section');
ok(errs(imp({ pmu: 1, sections: [], questions: [] })).length > 0, 'sections and questions together');
ok(errs(imp({ pmu: 1, questions: [{ pick: 'sub-mixed:single', marks: [1, 2, 3, 4, 5] }] })).join().includes('"marks" for this option'), 'wrong number of marks for a multi-part option');
ok(suggestKeys('percentages').length === 0 || true, 'suggestKeys safe');
// warnings are not errors
r = imp({ pmu: 1, questions: [{ pick: 'pct-buildup:fives', integer: false }] }); ok(!r.errors && r.warnings.length === 1, 'integer on an option without it: a warning only');
// duplicates get new numbers
r = imp({ pmu: 1, questions: Array.from({ length: 12 }, () => ({ pick: 'equations-one-step:add' })) });
ok(!r.errors && new Set(r.prep.questions.map(q => composePrep(r.prep)[0] && q.slots[0].snapshot.parts[0].body)).size === 12, 'twelve of one option are twelve different questions');
// cover
r = imp({ pmu: 1, questions: [{ pick: 'pct-buildup:fives' }], cover: { title: 'Year 7 Maths', subtitle: 'Equations', bullets: ['Calculators **are not** allowed.'], mark: 'both', date: true } });
ok(!r.errors && r.prep.cover.on && r.prep.cover.title.text === 'Year 7 Maths' && r.prep.cover.subtitle.on && r.prep.cover.bullets.length === 1 && r.prep.cover.mark.style === 'both' && r.prep.cover.date.on, 'cover from the file');

// ---- round trip: a real prep goes out and comes back the same ----
for (const setId of ['Y7 Additional', 'Y6 Core', 'Y8 Core']) {
  for (let i = 0; i < 6; i++) {
    const prep = randomPrep(setId, 'rt'); 
    if (i === 2) { P.setMarks(prep.questions[0].slots[0], 0, 5); }
    if (i === 3) S.startSection(prep, 2, 'Second');
    if (i === 4) { prep.questions[1].slots[0].edits = { parts: { 0: { body: 'Edited {{1+1}}', a: '2', w: '', byHand: true } } }; }
    const out = exportForClaude(prep, { mode: 'qo', marks: false });
    const text = J(out);
    const back = imp(text);
    if (back.errors) { ok(false, `${setId} #${i} round trip import: ${errs(back).slice(0, 3).join(' | ')}`); continue; }
    const a = composePrep(prep), b = composePrep(back.prep);
    const same = a.length === b.length && a.every((q, k) => q.marks === b[k].marks && q.n === b[k].n && q.parts.length === b[k].parts.length && q.parts.every((p, m) => p.text === b[k].parts[m].text && p.a === b[k].parts[m].a && p.marks === b[k].parts[m].marks) && (q.stem || null) === (b[k].stem || null));
    ok(same, `${setId} #${i} comes back identical`);
    ok(back.layout.marks === false, 'layout round trip');
  }
}
console.log(bad ? `${bad} FAILED` : 'import: all ok');
process.exit(bad ? 1 : 0);
