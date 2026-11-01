// Turn the slots of a prep into printable questions (stems, labelled parts, marks, working lines).
// Pure functions: no DOM.

const LETTERS = 'abcdefghijklmnopqrstuvwxyz';

export function slotParts(slot) {
  // the generated parts, with any hand edits applied
  const snap = slot.snapshot;
  return snap.parts.map((p, i) => {
    const ed = slot.edits && slot.edits.parts && slot.edits.parts[i];
    return ed ? { ...p, ...ed, edited: true } : p;
  });
}

import { labelsOf, sectionsOf, headingText } from '../data/sections.js';

export function composeQuestion(q, n, section = null) {
  const parts = [];
  let ownStem = null;
  q.slots.forEach((slot, si) => {
    const sp = slotParts(slot);
    const stem = slot.edits && slot.edits.stem !== undefined ? slot.edits.stem : slot.snapshot.stem;
    if (stem && q.slots.length === 1) ownStem = stem;
    sp.forEach((p, pi) => {
      const body = stem && q.slots.length > 1 && pi === 0 ? `${stem} ${p.body}` : p.body;
      parts.push({
        ...p, body, si, pi,
        marks: slot.marks[pi] ?? p.m, lines: slot.lines[pi] ?? p.lines,
        linesManual: !!(slot.linesManual && slot.linesManual[pi]),
        marksManual: !!(slot.marksManual && slot.marksManual[pi]),
      });
    });
  });
  const verbs = parts.map(p => (p.verb || '').trim());
  let stem = ownStem, texts;
  if (!stem && parts.length > 1 && verbs[0] && verbs.every(v => v === verbs[0])) {
    stem = `${verbs[0]}:`;
    texts = parts.map(p => p.body);
  } else if (ownStem) {
    texts = parts.map(p => p.body);
  } else {
    texts = parts.map(p => (p.verb ? `${p.verb} ${p.body}` : p.body));
  }
  // a single part never gets a label unless the type is a multi-part chain
  const label = parts.length > 1;
  return {
    n, stem, section,
    calc: parts.some(p => p.calc),
    parts: parts.map((p, i) => ({ ...p, text: texts[i], l: label ? LETTERS[i] : '' })),
    marks: parts.reduce((a, p) => a + p.marks, 0),
  };
}

// Questions are labelled 1, 2, 3... or, with sections, A1, A2, B1... The first question of a section carries its heading.
export function composePrep(prep) {
  const labels = labelsOf(prep), secs = sectionsOf(prep);
  // a single section titled like the sheet itself would only say the same thing twice
  const dup = (s) => secs.length === 1 && (s.sec.title || '').trim().toLowerCase() === (prep.name || '').trim().toLowerCase();
  const heads = new Map(secs.map(s => { const title = dup(s) ? '' : (s.sec.title || ''); return [s.start, { letter: s.letter, title, text: headingText(s.letter, title) }]; }));
  return prep.questions.map((q, i) => composeQuestion(q, labels[i], heads.get(i) || null));
}
export const totalMarks = (qs) => qs.reduce((a, q) => a + q.marks, 0);

// Answer table rows
export function answerRows(qs, prep) {
  const rows = [];
  qs.forEach((q) => q.parts.forEach((p) => rows.push({ ref: `${q.n}${p.l ? `(${p.l})` : ''}`, a: p.a, w: p.w, edited: !!p.edited, byHand: !!p.byHand })));
  return rows;
}
