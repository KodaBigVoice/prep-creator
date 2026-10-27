import { h, showMenu, toast } from './dom.js';
import { ctx } from './state.js';
import { composeQuestion } from '../layout/compose.js';
import { mathToHTML } from '../layout/render.js';
import { openPicker } from './picker.js';
import { openPoolDialog, openEditDialog } from './dialogs.js';
import * as P from '../data/prep.js';

const fmtLines = (n) => (Math.round(n * 100) / 100).toString();

function stepper({ value, onChange, step = 1, min = 0, manual = false, title }) {
  const input = h('input', { type: 'text', inputmode: 'decimal', value: fmtLines(value), 'aria-label': title,
    onChange: () => { const v = parseFloat(input.value.replace(',', '.')); if (!isNaN(v)) onChange(Math.max(min, v)); else input.value = fmtLines(value); } });
  return h('span', { class: 'stepper' + (manual ? ' manual' : ''), title },
    h('button', { 'aria-label': 'less', onClick: () => onChange(Math.max(min, Math.round((value - step) * 100) / 100)) }, '−'), input,
    h('button', { 'aria-label': 'more', onClick: () => onChange(Math.round((value + step) * 100) / 100) }, '+'));
}

export function renderBuilder(root) {
  const prep = ctx.prep, aos = ctx.layout.mode === 'aos';
  const T = (s) => mathToHTML(s, ctx.katex);
  const qs = prep.questions.map((q, i) => composeQuestion(q, i + 1));
  const total = qs.reduce((a, q) => a + q.marks, 0);
  root.replaceChildren();
  root.append(h('div', { class: 'summary' },
    h('span', {}, h('b', {}, `${prep.questions.length} question${prep.questions.length === 1 ? '' : 's'}`), ` · ${total} marks · ${prep.minutes} min`),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'btn small', onClick: rerollAll, title: 'New numbers for every question that is not locked' }, '↻ Re-roll all'),
  ));
  if (!prep.questions.length) root.append(h('div', { class: 'empty' }, 'No questions yet. Choose a preset above, press + for a random prep, or add a question.'));

  prep.questions.forEach((q, qi) => {
    const cq = qs[qi];
    const tags = [];
    if (q.slots.some(s => s.def.mode === 'pool')) tags.push(h('span', { class: 'tag pool' }, 'pool'));
    if (q.slots.some(s => s.meta && s.meta.multipart)) tags.push(h('span', { class: 'tag' }, 'multipart'));
    if (q.slots.some(s => s.locked)) tags.push(h('span', { class: 'tag lock' }, 'locked'));
    const card = h('div', { class: 'q-card' },
      h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${qi + 1}.`), ...tags,
        h('span', { class: 'hint' }, `${cq.marks} mark${cq.marks === 1 ? '' : 's'}`), h('span', { class: 'sp' }),
        h('button', { class: 'iconbtn', title: 'Move up', onClick: () => { P.moveQuestion(prep, qi, -1); ctx.commit(); } }, '↑'),
        h('button', { class: 'iconbtn', title: 'Move down', onClick: () => { P.moveQuestion(prep, qi, 1); ctx.commit(); } }, '↓'),
        h('button', { class: 'btn small ghost', title: 'Add another part (a), (b)… to this question', onClick: () => addPart(qi) }, '+ part'),
        h('button', { class: 'iconbtn', title: 'Remove this question', onClick: () => { prep.questions.splice(qi, 1); ctx.commit(); } }, '✕')));
    if (cq.stem) card.append(h('div', { class: 'prow', style: { background: '#fafbfc' } }, h('div'), h('div', { class: 'txt', style: { cursor: 'default' }, html: T(cq.stem) }), h('div')));
    const seen = new Set();
    cq.parts.forEach((p) => {
      const slot = q.slots[p.si];
      const firstOfSlot = !seen.has(p.si); seen.add(p.si);
      const manualM = slot.marksManual[p.pi], manualL = slot.linesManual[p.pi];
      const ctl = h('div', { class: 'ctl' },
        h('span', { class: 'stlabel' }, 'marks'),
        stepper({ value: p.marks, step: 1, min: 1, manual: manualM, title: 'Marks for this part', onChange: (v) => { P.setMarks(slot, p.pi, v); ctx.commit(); } }),
        aos ? [h('span', { class: 'stlabel' }, 'lines'), stepper({ value: p.lines, step: 0.5, min: 0.5, manual: manualL, title: 'Working space in ruled lines (decimals allowed)', onChange: (v) => { P.setLines(slot, p.pi, v); ctx.commit({ builder: true }); } })] : null,
        firstOfSlot ? [
          h('button', { class: 'iconbtn', title: slot.locked ? 'Locked: unlock in the ⋯ menu' : 'New numbers (same kind of question)', disabled: slot.locked, onClick: () => { P.rerollSlot(prep, slot); ctx.commit(); } }, '↻'),
          h('button', { class: 'iconbtn', 'aria-label': 'More', title: 'More', onClick: (e) => slotMenu(e.currentTarget, q, qi, slot, p.si) }, '⋯')] : null);
      const meta = firstOfSlot ? `${slot.meta.type}${slot.meta.label ? ' · ' + slot.meta.label : ''}${p.edited ? ' · edited by you' : ''}` : '';
      card.append(h('div', { class: 'prow' },
        h('div', { class: 'lab' }, p.l ? `(${p.l})` : ''),
        h('div', { class: 'txt', title: 'Click to choose a different question', onClick: () => changeSlot(q, qi, slot), html: T(p.text) + (p.calc ? ' <span class="badge">calculator</span>' : '') + (meta ? `<div class="meta">${meta.replace(/</g, '&lt;')}</div>` : '') }),
        ctl));
    });
    root.append(card);
  });
  root.append(h('div', { class: 'addrow' },
    h('button', { class: 'btn', onClick: () => openPicker({ title: 'Add a question', confirmLabel: 'Add question', onPick: ({ pick, seed, flags }) => { const q = P.addQuestion(prep, pick); const s = q.slots[0]; s.seed = seed; if (flags) s.flags = flags; P.reseed(s, seed); ctx.commit(); } }) }, '+ Add question')));
}

function rerollAll() {
  const prep = ctx.prep;
  prep.questions.forEach(q => q.slots.forEach(s => P.rerollSlot(prep, s)));
  ctx.commit();
}

function changeSlot(q, qi, slot) {
  openPicker({ title: `Choose a question for ${qi + 1}`, current: slot.pick, onPick: ({ pick, seed, flags }) => {
    P.setPick(slot, pick); slot.seed = seed; if (flags) slot.flags = flags; P.reseed(slot, seed); ctx.commit();
  } });
}
function addPart(qi) {
  const prep = ctx.prep, q = prep.questions[qi];
  openPicker({ title: `Add a part to question ${qi + 1}`, confirmLabel: 'Add part', onPick: ({ pick, seed, flags }) => {
    const s = P.addSlotToQuestion(prep, q, pick); if (flags) s.flags = flags; P.reseed(s, seed); ctx.commit();
  } });
}

function slotMenu(anchor, q, qi, slot, si) {
  const prep = ctx.prep;
  const items = [
    { label: 'Change question…', onClick: () => changeSlot(q, qi, slot) },
    { label: 'Edit wording or answer…', onClick: () => openEditDialog(slot, () => ctx.commit()) },
    { label: slot.locked ? 'Unlock (allow re-roll)' : 'Lock this question', onClick: () => { slot.locked = !slot.locked; ctx.commit(); } },
    { sep: true },
  ];
  if (slot.def.mode === 'pool') {
    items.push({ label: 'Pool choices…', onClick: () => openPoolDialog(slot, qi, si) });
    items.push({ label: 'Make this a fixed question', onClick: () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); } });
  } else {
    items.push({ label: 'Make this a pool…', onClick: () => { slot.def = { mode: 'pool', label: 'Pool', candidates: [{ pick: slot.pick, on: true }] }; ctx.commit(); openPoolDialog(slot, qi, si); } });
  }
  if (slot.meta.integer) items.push({ label: (slot.flags ? slot.flags.integer !== false : true) ? 'Allow non-integer answers' : 'Integer answers only', onClick: () => { const cur = slot.flags ? slot.flags.integer !== false : true; P.setFlags(slot, { integer: !cur }); ctx.commit(); } });
  items.push({ label: 'Reset marks and working space', onClick: () => { slot.marksManual = slot.marksManual.map(() => false); slot.linesManual = slot.linesManual.map(() => false); P.reseed(slot, slot.seed); ctx.commit(); } });
  items.push({ sep: true });
  items.push({ label: 'Remove', danger: true, onClick: () => { P.removeSlot(prep, qi, si); ctx.commit(); } });
  showMenu(anchor, items);
}
