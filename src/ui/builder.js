import { h, toast, confirmBox, showMenu } from './dom.js';
import { ctx } from './state.js';
import { composeQuestion } from '../layout/compose.js';
import { mathToHTML } from '../layout/render.js';
import { openPicker } from './picker.js';
import { openQuickChooser } from './quick.js';
import { describe } from '../data/query.js';
import { openPoolDialog, openEditDialog, pickName } from './dialogs.js';
import * as P from '../data/prep.js';

const ICON_UP = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2.5h10M8 13.5V6M4.8 8.7 8 5.5l3.2 3.2"/></svg>';
const ICON_DOWN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5h10M8 2.5V10M4.8 7.3 8 10.5l3.2-3.2"/></svg>';
const SV = (d) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON_LOCK = SV('<rect x="3.2" y="7" width="9.6" height="6.8" rx="1.4"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7"/>');
const ICON_UNLOCK = SV('<rect x="3.2" y="7" width="9.6" height="6.8" rx="1.4"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.4-1"/>');
const ICON_BIN = SV('<path d="M2.8 4.2h10.4M6.2 4.2V2.8h3.6v1.4M4.2 4.2l.6 9h6.4l.6-9M6.6 6.6v4.2M9.4 6.6v4.2"/>');
const ICON_POOL = SV('<path d="M5.5 3.2h6.2a1.6 1.6 0 0 1 1.6 1.6v6.2"/><rect x="2.7" y="5.4" width="7.9" height="8" rx="1.6"/>');
const ICON_SWAP = SV('<path d="M2.5 5.5h10M9.8 2.8l2.7 2.7-2.7 2.7M13.5 10.5h-10M6.2 7.8l-2.7 2.7 2.7 2.7"/>');
const ICON_EDIT = SV('<path d="M2.8 13.2l.6-2.9 7.2-7.2a1.4 1.4 0 0 1 2 0l.3.3a1.4 1.4 0 0 1 0 2l-7.2 7.2-2.9.6zM9.6 4.1l2.3 2.3"/>');
const ICON_MORE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>';
const ICON_SHUFFLE = SV('<path d="M2 4.5h2.2c3.2 0 3.6 7 6.8 7H14M2 11.5h2.2c1 0 1.7-.7 2.3-1.6M14 4.5h-3c-1 0-1.7.7-2.3 1.6M12 2.5l2 2-2 2M12 9.5l2 2-2 2"/>');
const ICON_EASIER = SV('<path d="M3.5 6l4.5 4.5L12.5 6"/>');
const ICON_HARDER = SV('<path d="M3.5 10L8 5.5l4.5 4.5"/>');
const ICON_CALC = SV('<rect x="3.2" y="1.8" width="9.6" height="12.4" rx="1.8"/><path d="M5.4 4.9h5.2"/><path d="M5.7 8h.01M8 8h.01M10.3 8h.01M5.7 10.6h.01M8 10.6h.01M10.3 10.6h.01" stroke-width="1.9"/>');
const poolInfo = (slot) => { const d = slot.def; if (d.mode !== 'pool') return null; const n = (d.candidates || []).filter(c => c.on !== false).length; return { label: d.label || 'Pool', n, text: `${d.label || 'Pool'} · ${n} choice${n === 1 ? '' : 's'}` }; };
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
  else root.append(h('div', { class: 'colhead' + (aos ? ' aos' : '') }, h('span'), h('span', { class: 'qh' }, 'Question'), h('span', { class: 'c' }, 'Marks'), aos ? h('span', { class: 'c' }, 'Lines') : null, h('span')));

  prep.questions.forEach((q, qi) => {
    try { drawCard(q, qi); } catch (err) {
      console.error('Could not draw question', qi + 1, err);
      root.append(h('div', { class: 'q-card' }, h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${qi + 1}.`), h('span', { class: 'hint' }, `This question could not be shown (${err.message}). Try ↻ or Replace.`), h('span', { class: 'sp' }),
        h('button', { class: 'btn small', onClick: () => { try { q.slots.forEach(sl => P.rerollSlot(prep, sl)); } catch (e2) { toast('Still cannot make it: ' + e2.message); } ctx.commit(); } }, '↻'))));
    }
  });
  function drawCard(q, qi) {
    const cq = qs[qi];
    const isSel = sel && sel.q === qi;
    const card = h('div', { class: 'q-card' + (isSel ? ' sel' : '') },
      h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${qi + 1}.`), h('span', { class: 'hint' }, `${cq.marks} mark${cq.marks === 1 ? '' : 's'}`),
        q.slots.some(s => s.locked) ? h('span', { class: 'lockmark', title: 'Locked', html: ICON_LOCK }) : null,
        h('span', { class: 'sp' }),
        h('span', { class: 'acts' },
          h('button', { class: 'iconbtn', title: 'Make this a further part of the question above', disabled: qi === 0, html: ICON_UP, onClick: () => joinQuestion(qi, -1) }),
          h('button', { class: 'iconbtn', title: 'Make this the first part of the question below', disabled: qi === prep.questions.length - 1, html: ICON_DOWN, onClick: () => joinQuestion(qi, 1) }),
          h('span', { class: 'acts-sep' }),
          h('button', { class: 'iconbtn', title: 'Move up', onClick: () => { P.moveQuestion(prep, qi, -1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: Math.max(0, qi - 1) } : null; ctx.commit(); } }, '↑'),
          h('button', { class: 'iconbtn', title: 'Move down', onClick: () => { P.moveQuestion(prep, qi, 1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: Math.min(prep.questions.length - 1, qi + 1) } : null; ctx.commit(); } }, '↓'),
          h('button', { class: 'iconbtn', title: 'Remove this question', onClick: async () => { if (!(await confirmBox({ title: `Remove question ${qi + 1}?`, message: 'The whole question is removed from this prep. You can bring it back with Undo.', confirmLabel: 'Remove', danger: true }))) return; prep.questions.splice(qi, 1); ctx.ui.sel = null; ctx.commit(); } }, '✕'))));
    if (cq.stem) card.append(h('div', { class: 'stemrow' }, h('div'), h('div', { class: 'txt', html: T(cq.stem) }), h('div'), h('div')));
    cq.parts.forEach((p, k) => {
      const slot = q.slots[p.si];
      const firstOfSlot = cq.parts.findIndex(x => x.si === p.si) === k;
      const isRowSel = isSel && sel.k === k;
      const manualM = slot.marksManual[p.pi], manualL = slot.linesManual[p.pi];
      const pinfo = poolInfo(slot);
      const toggleSel = () => { ctx.ui.sel = isRowSel ? null : { q: qi, k }; ctx.hooks.builder(); };
      const row = h('div', { class: 'prow' + (aos ? ' aos' : '') + (isRowSel ? ' sel' : '') + (p.l ? '' : ' nolab') },
        h('div', { class: 'gut' }, pinfo && firstOfSlot ? h('button', { class: 'poolico', title: `Pool: ${pinfo.text}`, 'aria-label': 'Pool question', html: ICON_POOL, onClick: toggleSel }) : null),
        h('div', { class: 'lab' }, p.l ? `(${p.l})` : ''),
        h('div', { class: 'txt', title: 'Click for details and options', onClick: toggleSel,
          html: T(p.text) + (p.edited ? ' <span class="badge ed">edited</span>' : '') }),
        h('div', { class: 'c' }, stepper({ value: p.marks, step: 1, min: 1, manual: manualM, title: 'Marks for this part', onChange: (v) => { P.setMarks(slot, p.pi, v); ctx.commit(); } })),
        aos ? h('div', { class: 'c' }, stepper({ value: p.lines, step: 0.5, min: 0.5, manual: manualL, title: 'Working space in ruled lines (decimals allowed)', onChange: (v) => { P.setLines(slot, p.pi, v); ctx.commit({ builder: true }); } })) : null,
        h('div', { class: 'c end' }, p.calc ? h('span', { class: 'calcico', title: 'Calculator question', 'aria-label': 'Calculator question', html: ICON_CALC }) : null,
          firstOfSlot ? [
            h('button', { class: 'iconbtn nudge', title: 'Easier question (same topic)', 'aria-label': 'Easier question', disabled: slot.locked, html: ICON_EASIER, onClick: () => nudge(slot, -1) }),
            h('button', { class: 'iconbtn nudge', title: 'Harder question (same topic)', 'aria-label': 'Harder question', disabled: slot.locked, html: ICON_HARDER, onClick: () => nudge(slot, 1) })] : null,
          firstOfSlot ? h('button', { class: 'iconbtn', title: slot.locked ? 'Locked' : (slot.def.mode === 'query' ? `Another question: ${describe(slot.def)}` : poolInfo(slot) ? `New question from pool: ${poolInfo(slot).text}` : 'New numbers (same kind of question)'), disabled: slot.locked, onClick: () => { P.rerollSlot(prep, slot); ctx.commit(); }, ...(poolInfo(slot) || slot.def.mode === 'query' ? { html: ICON_SHUFFLE } : {}) }, poolInfo(slot) || slot.def.mode === 'query' ? null : '↻') : null));
      card.append(row);
      if (isRowSel) card.append(detailPanel(q, qi, slot, p.si, cq, p));
    });
    root.append(card);
  }
  root.append(h('div', { class: 'addrow' },
    h('button', { class: 'btn', onClick: addSimple }, '+ Add question'),
    h('button', { class: 'btn', title: 'Choose one exact question from the full list', style: { flex: '0 0 auto', width: 'auto' }, onClick: browseAdd }, 'Browse all…')));
}
function addSimple() {
  const prep = ctx.prep;
  openQuickChooser({ title: 'Add a question', confirmLabel: 'Add question', onBrowse: browseAdd,
    onDone: (def) => { P.addQuestionDef(prep, def); ctx.ui.sel = { q: prep.questions.length - 1, k: 0 }; ctx.commit(); } });
}
function browseAdd() {
  const prep = ctx.prep;
  openPicker({ title: 'Add a question', confirmLabel: 'Use this question', onSimple: addSimple, onPick: (c) => { const q = P.addQuestion(prep, c.pick); P.applyChoice(q.slots[0], c); ctx.ui.sel = { q: prep.questions.length - 1, k: 0 }; ctx.commit(); } });
}
function nudge(slot, dir) {
  if (!P.nudgeSlot(ctx.prep, slot, dir)) { toast(dir > 0 ? 'That is the hardest question available here.' : 'That is the easiest question available here.'); return; }
  ctx.commit();
}

// The panel under a selected row: what the question is, and everything you can do with it.
function detailPanel(q, qi, slot, si, cq, part) {
  const prep = ctx.prep;
  const slotParts = cq.parts.filter(x => x.si === si);
  const range = slotParts.length > 1 ? `Applies to parts (${slotParts[0].l})–(${slotParts[slotParts.length - 1].l})` : null;
  const flagsInt = slot.flags ? slot.flags.integer !== false : true;
  const btn = (label, fn, opts = {}) => h('button', { class: 'btn small' + (opts.danger ? ' danger' : ''), disabled: opts.disabled, title: opts.title, onClick: fn }, label);
  const abtn = (icon, label, fn, title) => h('button', { class: 'abtn', title, onClick: fn }, h('span', { html: icon }), label);
  const isPool = slot.def.mode === 'pool';
  const anyOpt = slot.def.mode === 'fixed' && slot.def.pick && slot.def.pick.endsWith(':*');
  const isQuery = slot.def.mode === 'query';
  const pickLine = anyOpt ? pickName(slot.def.pick) + ' › any option' : pickName(slot.pick);
  const canRemove = cq.parts.length > 1 || prep.questions.length > 0;
  return h('div', { class: 'detail' },
    h('div', { class: 'dside' },
      h('button', { class: 'iconbtn boxed' + (slot.locked ? ' on' : ''), title: slot.locked ? 'Locked: re-roll will not change this. Click to unlock' : 'Lock: stop re-roll changing this question', html: slot.locked ? ICON_LOCK : ICON_UNLOCK, onClick: () => { slot.locked = !slot.locked; ctx.commit(); } }),
      canRemove ? h('button', { class: 'iconbtn danger', title: 'Remove this part', html: ICON_BIN, onClick: async () => { if (!(await confirmBox({ title: 'Remove this part?', message: 'It is removed from the question. You can bring it back with Undo.', confirmLabel: 'Remove', danger: true }))) return; P.removeSlot(prep, qi, si); ctx.ui.sel = null; ctx.commit(); } }) : null),
    h('div', { class: 'dpath' }, h('b', {}, pickLine), slot.meta && slot.meta.multipart ? h('span', { class: 'tag' }, 'multipart') : null, slot.locked ? h('span', { class: 'tag lock' }, 'locked') : null),
    isQuery ? h('div', { class: 'qrow' }, h('span', { class: 'qlab' }, 'Chosen by'), h('b', {}, describe(slot.def)),
      h('button', { class: 'linkbtn', onClick: () => changeSlot(q, qi, slot) }, 'Change…'), h('span', { class: 'hint' }, 'Re-roll draws another that fits; ▲▼ step the difficulty.')) : null,
    isPool ? h('div', { class: 'poolline' }, h('span', { html: ICON_POOL }), h('span', {}, 'Drawn from pool: ', h('b', {}, poolInfo(slot).text)), h('button', { class: 'linkbtn', onClick: () => openPoolDialog(slot, qi, si) }, 'Choices…')) : null,
    anyOpt ? h('div', { class: 'hint' }, `A different option comes up each time you re-roll. This one is: ${slot.meta.label}.`) : null,
    range ? h('div', { class: 'hint' }, range) : null,
    h('div', { class: 'dbtns' },
      h('div', { class: 'abar' },
      abtn(ICON_SWAP, 'Replace', () => changeSlot(q, qi, slot), 'Swap this for a different question'),
      abtn(ICON_EDIT, 'Edit', () => openEditDialog(slot, () => ctx.commit()), 'Change the wording or the answer'),
      h('button', { class: 'abtn', title: 'More options', 'data-menu-anchor': '', onClick: (e) => showMenu(e.currentTarget, [
        { label: '+ Add a part', onClick: () => addPart(qi) },
        q.slots.length > 1 ? { label: 'Make this its own question', sub: 'Take it out of the multipart question', onClick: () => { const nq = P.splitSlot(prep, qi, si); ctx.ui.sel = nq === null ? null : { q: nq, k: 0 }; ctx.commit(); } } : null,
        { sep: true },
        isPool ? null : { label: 'Make this a pool…', sub: 'Re-roll picks from several questions you choose', onClick: () => { slot.def = { mode: 'pool', label: 'Pool', candidates: [{ pick: slot.pick, on: true }] }; ctx.commit(); openPoolDialog(slot, qi, si); } },
        isPool ? { label: 'Stop being a pool', sub: 'Re-roll keeps this kind of question', onClick: () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); } } : null,
        anyOpt ? { label: 'Keep this option', sub: 'Stop changing option when you re-roll', onClick: () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); } } : null,
        { sep: true },
        { label: 'Reset marks and lines', onClick: () => { slot.marksManual = slot.marksManual.map(() => false); slot.linesManual = slot.linesManual.map(() => false); P.reseed(slot, slot.seed); ctx.commit(); } },
      ].filter(Boolean)) }, h('span', { html: ICON_MORE }), 'More'))),
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
  let failed = 0;
  prep.questions.forEach(q => q.slots.forEach(s => { try { P.rerollSlot(prep, s); } catch (e) { failed++; console.error('Re-roll failed', s.pick, e); } }));
  ctx.commit();
  if (failed) toast(`${failed} question${failed === 1 ? '' : 's'} could not be re-rolled and ${failed === 1 ? 'was' : 'were'} left as they were.`, 5000);
}
// Replace a question. A Quick or Range question opens the simple picker (its topic and level filled in); anything else opens the full list first. Each can switch to the other.
function changeSlot(q, qi, slot) {
  const prep = ctx.prep;
  const simple = () => {
    const def = slot.def.mode === 'query' ? slot.def : P.queryOfPick(slot.pick);
    openQuickChooser({ title: `Choose a question for ${qi + 1}`, confirmLabel: 'Use this question', def, onBrowse: browse,
      onDone: (d) => { P.setQuery(prep, slot, d, { redraw: true }); ctx.commit(); } });
  };
  const browse = () => openPicker({ title: `Choose a question for ${qi + 1}`, current: slot.pick, onSimple: simple, onPick: (c) => { P.applyChoice(slot, c); ctx.commit(); } });
  if (slot.def.mode === 'query') simple(); else browse();
}
function addPart(qi) {
  const prep = ctx.prep, q = prep.questions[qi];
  const simple = () => openQuickChooser({ title: `Add a part to question ${qi + 1}`, confirmLabel: 'Add part', onBrowse: browse, onDone: (def) => { P.addSlotDef(prep, q, def); ctx.commit(); } });
  const browse = () => openPicker({ title: `Add a part to question ${qi + 1}`, confirmLabel: 'Add part', onSimple: simple, onPick: (c) => { const s = P.addSlotToQuestion(prep, q, c.pick); P.applyChoice(s, c); ctx.commit(); } });
  browse();
}
