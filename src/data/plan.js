// Plans: build a section from a topic, a selection of its options, and how many questions to ask.
// plan = { topic, mix:'both'|'skills'|'context', total, items:[{ key, on, count?, manual? }] }
//   items are the options of the topic, easiest first; only the ticked ones (on) are used.
//   Questions ramp: the early ones come from the first ticked options, the last ones from the hardest.
import { ladder } from './query.js';
import { isContext, planCounts, normalizeSections, sectionsOf } from './sections.js';
import { addQuestionDef, reseed } from './prep.js';

// The options a plan can offer for a topic, easiest first. `mix` limits them to skill drills or to worded / in-context questions.
export function planOptions(topic, mix = 'both') {
  return ladder([topic]).filter(e => mix === 'both' || (mix === 'context') === isContext(e.label));
}

// A fresh plan: nothing ticked yet
export function newPlan(topic, total = 10) { return { topic, mix: 'both', total, items: [] }; }

// Tick or untick one option (keeps the items in ladder order)
export function setOn(plan, key, on) {
  const order = ladder([plan.topic]).map(e => e.key);
  const it = plan.items.find(x => x.key === key);
  if (it) it.on = on; else if (on) plan.items.push({ key, on: true });
  plan.items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
}
export const ticked = (plan) => plan.items.filter(it => it.on);

// The number of questions each ticked option gets
export function countsFor(plan) { return planCounts(ticked(plan), plan.total); }
export function totalOf(plan) { return countsFor(plan).reduce((a, n) => a + n, 0); }

const sig = (q) => JSON.stringify(q.slots.map(s => s.snapshot.parts.map(p => [p.body, p.a])));

// Add the questions of a plan to the prep at `index`. The first carries the section heading. Returns the questions made.
export function buildSection(prep, plan, title, index = prep.questions.length) {
  const items = ticked(plan), counts = countsFor(plan), made = [];
  const seen = new Set(prep.questions.map(sig));
  items.forEach((it, k) => {
    for (let n = 0; n < counts[k]; n++) {
      const q = addQuestionDef(prep, { mode: 'fixed', pick: it.key }, index + made.length);
      // never the same question twice on a sheet: new numbers until it differs
      for (let tries = 0; tries < 12 && seen.has(sig(q)); tries++) reseed(q.slots[0]);
      seen.add(sig(q)); made.push(q);
    }
  });
  if (made.length) { made[0].sec = { title: title || '', plan: JSON.parse(JSON.stringify(plan)) }; normalizeSections(prep); }
  return made;
}
// Rebuild section si from a plan (its questions are replaced)
export function rebuildSection(prep, si, plan, title) {
  const s = sectionsOf(prep)[si]; if (!s) return buildSection(prep, plan, title);
  for (let k = s.end - 1; k >= s.start; k--) prep.questions.splice(k, 1);
  const made = buildSection(prep, plan, title, s.start);
  if (!made.length) normalizeSections(prep);
  return made;
}
