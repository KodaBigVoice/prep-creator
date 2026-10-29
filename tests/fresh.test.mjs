// The fresh-scenario rule: a new prep retells fewer of the stories in the last few saved preps, and it never blocks anything.
import { prepFromPreset } from '../src/data/prep.js';
import { STARTER_PRESETS } from '../src/data/presets.js';
import { setHistory, sceneOfSlot, overlap, wordsOf, scene } from '../src/data/fresh.js';
let bad = 0;
const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };

// words: numbers, names and maths are not scenario words
const w = wordsOf('Priya buys 12 {{x + 3}} apples from the market. Then Tom sells them.');
ok(w.has('apple') && w.has('market') && !w.has('priya') && !w.has('tom') && !w.has('then'), 'wordsOf: ' + [...w]);
ok(scene('pct-buildup:fives', 'Find {{15\\%}} of {{30}}.').size === 0, 'skill questions have no scenario');

const clashes = (a, b) => {
  const sa = a.questions.flatMap(q => q.slots.map(sceneOfSlot)), sb = b.questions.flatMap(q => q.slots.map(sceneOfSlot));
  let n = 0; for (const x of sa) for (const y of sb) if (overlap(x, y) >= 2) n++; return n;
};
function run(withRule, rounds) {
  const saved = []; setHistory(withRule ? () => saved : () => []);
  let total = 0, seqs = 0;
  for (let i = 0; i < rounds; i++) {
    const p = prepFromPreset(STARTER_PRESETS[0], 'Y7 Additional', 'x'); p.saved = new Date(2026, 0, 1, 0, i).toISOString();
    const prev = saved.slice(-3); for (const q of prev) { total += clashes(p, q); seqs++; }
    saved.push(JSON.parse(JSON.stringify(p)));
  }
  return total / seqs;
}
// a worded-heavy recipe is where the rule matters: problem solving in several topics, 8 questions per prep
const WORD = ['Percentages: problem solving', 'Fractions: problem solving', 'Ratio and proportion: problem solving', 'Decimals: problem solving', 'Problem solving'];
const Q = (t) => ({ mode: 'query', topics: t, level: 'Core' });
const PRESET = { id: 't', questions: Array.from({ length: 8 }, () => [Q(WORD)]) };
const STARTER = STARTER_PRESETS[0];
STARTER_PRESETS[0] = PRESET;
const off = run(false, 14), on = run(true, 14);
STARTER_PRESETS[0] = STARTER;
console.log(`clashing question pairs per prep pair: without the rule ${off.toFixed(2)}, with it ${on.toFixed(2)}`);
ok(on < off, 'the rule reduces repeated scenarios');
ok(on <= 0.5, 'and leaves almost none');
console.log(bad ? `${bad} problems` : 'fresh-scenario tests passed');
process.exit(bad ? 1 : 0);
