// "Non-calculator only", and the cover page defaults.
import { allEntries, needsCalc, setNonCalc, ladder, resolve, topicList } from '../src/data/query.js';
import { prepFromPreset, makeSlot, applyNonCalc, rerollSlot, newPrep } from '../src/data/prep.js';
import { poolByTopic } from '../src/data/pools.js';
import { newChoice } from '../src/data/pools.js';
import { defaultCover, mergeCover, richText, markBoxParts, termLine } from '../src/data/cover.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };

const calcKeys = allEntries().filter(e => needsCalc(e.key));
ok(calcKeys.length > 20 && calcKeys.length < 60, `about thirty options need a calculator (${calcKeys.length})`);
ok(needsCalc('pct-calc:whole') && !needsCalc('pct-buildup:tens'), 'known options are flagged correctly');

setNonCalc(false);
const all = ladder(['Percentages']).length;
setNonCalc(true);
const non = ladder(['Percentages']);
ok(non.length < all && non.every(e => !needsCalc(e.key)), 'the ladder leaves out calculator options');
ok(resolve({ topics: ['Percentages'], level: 'Core' }).list.every(e => !needsCalc(e.key)), 'Quick leaves them out');
ok([...poolByTopic({ mode: 'pool', choices: [newChoice('Percentages', 'Additional'), newChoice('Decimals', 'Additional')] }).values()].flat().every(e => !needsCalc(e.key)), 'pools leave them out');
// a topic with nothing else keeps its options
const t = topicList().map(x => x.name).find(n => ladder([n]).length);
ok(ladder(['Circles']).length > 0, 'a topic is never emptied');
// 'any option of this type' never picks a calculator option when there is another
for (let i = 0; i < 40; i++) { const s = makeSlot({ mode: 'fixed', pick: 'pct-calc:*' }); ok(s.pick.startsWith('pct-calc:'), 'type still found'); }
setNonCalc(false);

// switching a prep to non-calculator replaces calculator questions that are not hand-picked
const mk = (defs) => { const p = newPrep({ set: 'Y7 Additional', name: 'x', minutes: 30 }); p.questions = defs.map(d => ({ id: 'q' + Math.random(), slots: [makeSlot(d)] })); return p; };
const p = mk([{ mode: 'query', topics: ['Percentages'], level: 'Additional', lo: 18, hi: 30 }, { mode: 'fixed', pick: 'pct-calc:whole' }, { mode: 'fixed', pick: 'pct-buildup:tens' }]);
// force the first slot onto a calculator question
p.questions[0].slots[0].pick = 'pct-calc:money';
setNonCalc(true);
const r = applyNonCalc(p);
ok(!needsCalc(p.questions[0].slots[0].pick), 'a Quick question needing a calculator is replaced');
ok(r.replaced >= 1, 'and counted');
ok(needsCalc(p.questions[1].slots[0].pick) && r.kept.join() === '2', 'a hand-picked calculator question stays and is reported');
setNonCalc(false);
// a new prep from a preset starts with calculators allowed
setNonCalc(true); prepFromPreset({ id: 'x', set: 'Y7 Additional', name: 'x', minutes: 30, questions: [[{ mode: 'query', topics: ['Fractions'], level: 'Core' }]] }, 'Y7 Additional', 'x');
ok(ladder(['Percentages']).length === all, 'a new prep switches the filter off');

// cover
const c = defaultCover('Y7 Additional');
ok(c.on === false && c.bullets.length === 7 && c.bullets.filter(b => b.on).length === 4, 'default cover has his seven instructions, four on');
ok(/^Year 7 (Michaelmas|Lent|Summer) \d{4}$/.test(c.topLine.text), `top line ${c.topLine.text}`);
ok(termLine('Y8 Core', new Date(2026, 5, 10)) === 'Year 8 Summer 2026' && termLine('Y6 Core', new Date(2027, 1, 3)) === 'Year 6 Lent 2027', 'terms by month');
ok(richText('This paper is **{minutes} minutes**.', { minutes: 90, calcOnly: false }) === 'This paper is <b>90 minutes</b>.', 'bold and minutes');
ok(richText('Calculators **{calc}** permitted.', { minutes: 30, calcOnly: true }) === 'Calculators <b>are not</b> permitted.', 'calculator wording follows the setting');
ok(richText('<script>', { minutes: 1 }) === '&lt;script&gt;', 'text is escaped');
ok(markBoxParts('total', 84)[0].tail === '/ 84' && markBoxParts('mark', 84)[0].tail === '' && markBoxParts('pct', 84)[0].tail === '%' && markBoxParts('both', 84).length === 2, 'mark box styles');
const m = mergeCover({ title: { text: 'Paper 2' }, subtitle: { on: true, text: 'CDW–TAJ' } }, 'Y7 Additional');
ok(m.title.text === 'Paper 2' && m.title.on === true && m.subtitle.on && m.bullets.length === 7, 'an older cover is filled out with the new fields');
if (bad) { console.log(bad, 'failures'); process.exit(1); } else console.log('calc and cover tests passed');
