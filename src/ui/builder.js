import { h, toast, confirmBox } from './dom.js';
import { ctx } from './state.js';
import { composeQuestion } from '../layout/compose.js';
import { mathToHTML } from '../layout/render.js';
import { openPicker } from './picker.js';
import { openPoolDialog, openEditDialog, pickName } from './dialogs.js';
import * as P from '../data/prep.js';

const ICON_UP = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2.5h10M8 13.5V6M4.8 8.7 8 5.5l3.2 3.2"/></svg>';
const ICON_DOWN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5h10M8 2.5V10M4.8 7.3 8 10.5l3.2-3.2"/></svg>';
const fmt = (n) => (Math.round(n * 100) / 100).toString();

function stepper({ value, onChange, step = 1, min = 0, manual = false, title }) {
  const input = h('input', { type: 'text', inputmode: 'decimal', value: fmt(value), 'aria-label': title,
    onChange: () => { const v = parseFloat(input.value.replace(',', '.')); if (!isNaN(v)) onChange(Math.max(min, v)); else input.value = fmt(value); } });
  return h('span', { class: 'stepper' + (manual ? ' manual' : ''), title },
    h('button', { 'aria-label': 'less', onClick: (e) => { e.stopPropagation(); onChange(Math.max(min, Math.round((value - step) * 100) / 100)); } }, '−'), input,
    h('button', { 'aria-label': 'more', onClick: (e) => { e.stopPropagation(); onChange(Math.round((value + step) * 100) / 100); } }, '+'));
}

export function renderBuilder(root) {
  const prep = ctx.prep, aos = ctx.layout.mode === 'aos';
  const T = (s) => mathToHTML(s, ctx.katex);
  const qs = prep.questions.map((q, i) => composeQuestion(q, i + 1));
  const total = qs.reduce((a, q) => a + q.marks, 0);
  const sel = ctx.ui.sel;
  root.replaceChildren();
  root.append(h('div', { class: 'summary' },
    h('span', {}, h('b', {}, `${prep.questions.length} question${prep.questions.length === 1 ? '' : 's'}`), ` · ${total} marks`),
    h('span', { style: { flex: 1 } }),
    h('button', { class: 'btn small', onClick: rerollAll, title: 'New numbers for every question that is not locked' }, '↻ Re-roll all')));
  if (!prep.questions.length) root.append(h('div', { class: 'empty' }, 'No questions yet. Choose a preset in the sidebar, or add a question.'));
  else root.append(h('div', { class: 'colhead' + (aos ? ' aos' : '') }, h('span'), h('span', {}, 'Question'), h('span', { class: 'c' }, 'Marks'), aos ? h('span', { class: 'c' }, 'Lines') : null, h('span')));

  prep.questions.forEach((q, qi) => {
    const cq = qs[qi];
    const isSel = sel && sel.q === qi;
    const card = h('div', { class: 'q-card' + (isSel ? ' sel' : '') },
      h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${qi + 1}.`), h('span', { class: 'hint' }, `${cq.marks} mark${cq.marks === 1 ? '' : 's'}`),
        q.slots.some(s => s.locked) ? h('span', { class: 'lockmark', title: 'Locked' }, '🔒') : null,
        h('span', { class: 'sp' }),
        h('span', { class: 'acts' },
          h('button', { class: 'iconbtn', title: 'Make this a further part of the question above', disabled: qi === 0, html: ICON_UP, onClick: () => joinQuestion(qi, -1) }),
          h('button', { class: 'iconbtn', title: 'Make this the first part of the question below', disabled: qi === prep.questions.length - 1, html: ICON_DOWN, onClick: () => joinQuestion(qi, 1) }),
          h('span', { class: 'acts-sep' }),
          h('button', { class: 'iconbtn', title: 'Move up', onClick: () => { P.moveQuestion(prep, qi, -1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: Math.max(0, qi - 1) } : null; ctx.commit(); } }, '↑'),
          h('button', { class: 'iconbtn', title: 'Move down', onClick: () => { P.moveQuestion(prep, qi, 1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: Math.min(prep.questions.length - 1, qi + 1) } : null; ctx.commit(); } }, '↓'),
          h('button', { class: 'iconbtn', title: 'Remove this question', onClick: () => { prep.questions.splice(qi, 1); ctx.ui.sel = null; ctx.commit(); } }, '✕'))));
    if (cq.stem) card.append(h('div', { class: 'stemrow' }, h('div'), h('div', { class: 'txt', html: T(cq.stem) }), h('div'), h('div')));
    cq.parts.forEach((p, k) => {
      const slot = q.slots[p.si];
      const firstOfSlot = cq.parts.findIndex(x => x.si === p.si) === k;
      const isRowSel = isSel && sel.k === k;
      const manualM = slot.marksManual[p.pi], manualL = slot.linesManual[p.pi];
      const row = h('div', { class: 'prow' + (aos ? ' aos' : '') + (isRowSel ? ' sel' : '') },
        h('div', { class: 'lab' }, p.l ? `(${p.l})` : ''),
        h('div', { class: 'txt', title: 'Click for details and options', onClick: () => { ctx.ui.sel = isRowSel ? null : { q: qi, k }; ctx.hooks.builder(); },
          html: T(p.text) + (p.calc ? ' <span class="badge">calculator</span>' : '') + (p.edited ? ' <span class="badge ed">edited</span>' : '') }),
        h('div', { class: 'c' }, stepper({ value: p.marks, step: 1, min: 1, manual: manualM, title: 'Marks for this part', onChange: (v) => { P.setMarks(slot, p.pi, v); ctx.commit(); } })),
        aos ? h('div', { class: 'c' }, stepper({ value: p.lines, step: 0.5, min: 0.5, manual: manualL, title: 'Working space in ruled lines (decimals allowed)', onChange: (v) => { P.setLines(slot, p.pi, v); ctx.commit({ builder: true }); } })) : null,
        h('div', { class: 'c' }, firstOfSlot ? h('button', { class: 'iconbtn', title: slot.locked ? 'Locked' : 'New numbers (same kind of question)', disabled: slot.locked, onClick: () => { P.rerollSlot(prep, slot); ctx.commit(); } }, '↻') : null));
      card.append(row);
      if (isRowSel) card.append(detailPanel(q, qi, slot, p.si, cq, p));
    });
    root.append(card);
  });
  root.append(h('div', { class: 'addrow' },
    h('button', { class: 'btn', onClick: () => openPicker({ title: 'Add a question', confirmLabel: 'Add question', onPick: ({ pick, seed, flags }) => { const q = P.addQuestion(prep, pick); const s = q.slots[0]; s.seed = seed; if (flags) s.flags = flags; P.reseed(s, seed); ctx.ui.sel = { q: prep.questions.length - 1, k: 0 }; ctx.commit(); } }) }, '+ Add question')));
}

// The panel under a selected row: what the question is, and everything you can do with it.
function detailPanel(q, qi, slot, si, cq, part) {
  const prep = ctx.prep;
  const slotParts = cq.parts.filter(x => x.si === si);
  const range = slotParts.length > 1 ? `Applies to parts (${slotParts[0].l})–(${slotParts[slotParts.length - 1].l})` : null;
  const flagsInt = slot.flags ? slot.flags.integer !== false : true;
  const btn = (label, fn, opts = {}) => h('button', { class: 'btn small' + (opts.danger ? ' danger' : ''), disabled: opts.disabled, title: opts.title, onClick: fn }, label);
  const isPool = slot.def.mode === 'pool';
  const pickLine = pickName(slot.pick);
  return h('div', { class: 'detail' },
    h('div', { class: 'dpath' }, h('b', {}, pickLine), isPool ? h('span', { class: 'tag pool' }, 'pool') : null, slot.meta && slot.meta.multipart ? h('span', { class: 'tag' }, 'multipart') : null, slot.locked ? h('span', { class: 'tag lock' }, 'locked') : null),
    range ? h('div', { class: 'hint' }, range) : null,
    h('div', { class: 'dbtns' },
      btn('Change question…', () => changeSlot(q, qi, slot)),
      btn('Edit wording or answer…', () => openEditDialog(slot, () => ctx.commit())),
      btn('+ Add a part', () => addPart(qi)),
      q.slots.length > 1 ? btn('Make this its own question', () => { const nq = P.splitSlot(prep, qi, si); ctx.ui.sel = nq === null ? null : { q: nq, k: 0 }; ctx.commit(); }, { title: 'Take this out of the multipart question and give it its own number' }) : null,
      btn(slot.locked ? 'Unlock' : 'Lock', () => { slot.locked = !slot.locked; ctx.commit(); }, { title: 'A locked question is not changed by re-roll' }),
      isPool ? btn('Pool choices…', () => openPoolDialog(slot, qi, si)) : btn('Make this a pool…', () => { slot.def = { mode: 'pool', label: 'Pool', candidates: [{ pick: slot.pick, on: true }] }; ctx.commit(); openPoolDialog(slot, qi, si); }),
      isPool ? btn('Make fixed', () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); }) : null,
      btn('Reset marks and lines', () => { slot.marksManual = slot.marksManual.map(() => false); slot.linesManual = slot.linesManual.map(() => false); P.reseed(slot, slot.seed); ctx.commit(); }),
      cq.parts.length > 1 || prep.questions.length > 0 ? btn('Remove', () => { P.removeSlot(prep, qi, si); ctx.ui.sel = null; ctx.commit(); }, { danger: true }) : null),
    slot.meta.integer ? h('label', { class: 'dint' }, h('input', { type: 'checkbox', checked: flagsInt, onChange: () => { P.setFlags(slot, { integer: !flagsInt }); ctx.commit(); } }), ' Integer answers only') : null);
}

function joinQuestion(qi, dir) {
  const prep = ctx.prep;
  const r = P.mergeQuestion(prep, qi, dir); if (!r) return;
  const cq = composeQuestion(prep.questions[r.q], r.q + 1);
  const k = Math.max(0, cq.parts.findIndex(p => p.si === r.firstSlot));
  ctx.ui.sel = { q: r.q, k };
  ctx.commit();
}
async function rerollAll() {
  const prep = ctx.prep;
  if (!(await confirmBox({ title: 'Re-roll every question?', message: 'Every question that is not locked gets new numbers. The current numbers cannot be brought back.', confirmLabel: 'Re-roll all' }))) return;
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
