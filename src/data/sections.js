// Sections: a prep (or worksheet) can be split into sections A, B, C... Questions are then numbered A1, A2, B1...
// A section starts at a question that carries `q.sec = { title, plan? }`. Sections belong to positions in the list:
// moving a question up or down never moves a heading, it just lets the question join the neighbouring section.
// `sec.plan` remembers how a section was built by the plan dialog: { topic, mix, total, items:[{key, count, manual?}] }

export const sectionLetter = (i) => (i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(64 + Math.floor(i / 26)) + String.fromCharCode(65 + (i % 26)));
export const hasSections = (prep) => prep.questions.some(q => q.sec);

// If any question starts a section, the first one must too (the questions before the first heading would otherwise have no section)
export function normalizeSections(prep) {
  if (!hasSections(prep)) return prep;
  const qs = prep.questions;
  if (qs.length && !qs[0].sec) qs[0].sec = { title: '' };
  return prep;
}

// [{ i, letter, sec, start, end }] with end exclusive
export function sectionsOf(prep) {
  const out = [], qs = prep.questions;
  qs.forEach((q, qi) => {
    if (q.sec || (qi === 0 && hasSections(prep))) out.push({ i: out.length, letter: sectionLetter(out.length), sec: q.sec || { title: '' }, start: qi, end: qi + 1 });
    else if (out.length) out[out.length - 1].end = qi + 1;
  });
  return out;
}
// the section a question belongs to (or null)
export function sectionAt(prep, qi) { return sectionsOf(prep).find(s => qi >= s.start && qi < s.end) || null; }

// labels for each question: "3" without sections, "A1" with them
export function labelsOf(prep) {
  const qs = prep.questions;
  if (!hasSections(prep)) return qs.map((_, i) => String(i + 1));
  const labels = new Array(qs.length), secs = sectionsOf(prep);
  secs.forEach(s => { for (let k = s.start; k < s.end; k++) labels[k] = `${s.letter}${k - s.start + 1}`; });
  return labels;
}
// the heading of a section for print: "Section A" / "Section A: Two-step equations"
export const headingText = (letter, title) => `Section ${letter}${title && title.trim() ? ': ' + title.trim() : ''}`;

// ---- changes ----
export function startSection(prep, qi, title = '') {
  if (qi < 0 || qi >= prep.questions.length) return null;
  prep.questions[qi].sec = { title };
  normalizeSections(prep);
  return prep.questions[qi].sec;
}
// Take the heading away: its questions join the section above. The first section's heading cannot go while others follow; if it is the only one, all headings go.
export function joinWithAbove(prep, si) {
  const secs = sectionsOf(prep), s = secs[si];
  if (!s) return false;
  if (si === 0) {
    if (secs.length > 1) return false;
    delete prep.questions[s.start].sec; return true;
  }
  delete prep.questions[s.start].sec; return true;
}
// swap section si with its neighbour; the headings travel with their questions
export function moveSection(prep, si, dir) {
  const secs = sectionsOf(prep), j = si + dir;
  if (!secs[si] || !secs[j]) return false;
  const blocks = secs.map(s => prep.questions.slice(s.start, s.end));
  blocks.forEach((b, k) => { b[0].sec = secs[k].sec; b.slice(1).forEach(q => { delete q.sec; }); });
  [blocks[si], blocks[j]] = [blocks[j], blocks[si]];
  prep.questions.splice(0, prep.questions.length, ...blocks.flat());
  return true;
}
// remove a whole section with its questions
export function removeSection(prep, si) {
  const s = sectionsOf(prep)[si]; if (!s) return 0;
  const n = s.end - s.start;
  prep.questions.splice(s.start, n);
  normalizeSections(prep);
  return n;
}
// remove one question without losing the heading it carries: the heading moves to the next question of its section
export function removeQuestionAt(prep, qi) {
  const q = prep.questions[qi]; if (!q) return;
  const next = prep.questions[qi + 1];
  if (q.sec && next && !next.sec) next.sec = q.sec;
  prep.questions.splice(qi, 1);
  normalizeSections(prep);
}
// Move a question one place. Inside a section the order changes (headings stay where they are). Across a boundary the order does not
// change at all: the question changes section, i.e. the heading moves one place. Returns the question's new index.
export function moveQuestionBy(prep, qi, dir) {
  const qs = prep.questions, j = qi + dir;
  if (j < 0 || j >= qs.length) return qi;
  const q = qs[qi];
  if (dir > 0 && qs[j].sec) { q.sec = qs[j].sec; delete qs[j].sec; return qi; }            // becomes the first question of the next section
  if (dir < 0 && q.sec) {                                                                   // becomes the last question of the section above
    const next = qs[qi + 1];
    if (next && !next.sec) next.sec = q.sec;
    delete q.sec; normalizeSections(prep); return qi;
  }
  const sa = qs[qi].sec, sb = qs[j].sec;
  [qs[qi], qs[j]] = [qs[j], qs[qi]];
  if (sa) qs[qi].sec = sa; else delete qs[qi].sec;
  if (sb) qs[j].sec = sb; else delete qs[j].sec;
  return j;
}

// ---- plans ----
// How a section's N questions are spread over the chosen options (easiest first): an even ramp, so the early questions use the
// first options and the later ones the harder ones. Returns a count for each option; they sum to `total`.
export function spreadCounts(k, total) {
  if (k <= 0) return [];
  if (total < k) {                                   // fewer questions than options: spread them along the ladder, first to last
    const out = new Array(k).fill(0);
    for (let i = 0; i < total; i++) out[total === 1 ? 0 : Math.round(i * (k - 1) / (total - 1))]++;
    return out;
  }
  const base = Math.floor(total / k), extra = total - base * k;
  // the extra questions go to the harder end, so the sheet finishes on its hardest ideas
  return Array.from({ length: k }, (_, i) => base + (i >= k - extra ? 1 : 0));
}
// The counts to use for a plan: options with a hand-set count keep it, the rest share what is left of `total`.
export function planCounts(items, total) {
  const free = items.filter(it => !it.manual);
  const fixed = items.filter(it => it.manual).reduce((a, it) => a + it.count, 0);
  const share = spreadCounts(free.length, Math.max(0, total - fixed));
  let fi = 0;
  return items.map(it => (it.manual ? it.count : share[fi++]));
}

// A label heuristic: worded / in-context options versus skill drills
export const isContext = (label) => /context|worded|word problem|problem|story|real|money|scenario/i.test(label || '');
