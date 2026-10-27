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

export function composeQuestion(q, n) {
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
    n, stem,
    calc: parts.some(p => p.calc),
    parts: parts.map((p, i) => ({ ...p, text: texts[i], l: label ? LETTERS[i] : '' })),
    marks: parts.reduce((a, p) => a + p.marks, 0),
  };
}

export function composePrep(prep) {
  return prep.questions.map((q, i) => composeQuestion(q, i + 1));
}
export const totalMarks = (qs) => qs.reduce((a, q) => a + q.marks, 0);

// Answer table rows
export function answerRows(qs, prep) {
  const rows = [];
  qs.forEach((q) => q.parts.forEach((p) => rows.push({ ref: `${q.n}${p.l ? `(${p.l})` : ''}`, a: p.a, w: p.w, edited: !!p.edited, byHand: !!p.byHand })));
  return rows;
}
