import { h, toast, confirmBox, showMenu } from './dom.js';
import { ctx } from './state.js';
import { composeQuestion, composePrep } from '../layout/compose.js';
import * as S from '../data/sections.js';
import { buildSection, rebuildSection } from '../data/plan.js';
import { openPlanDialog } from './plan.js';
import { mathToHTML } from '../layout/render.js';
import { openPicker } from './picker.js';
import { openQuickChooser } from './quick.js';
import { describe, isRange, levelOf } from '../data/query.js';
import { newChoice } from '../data/pools.js';
import { openPoolDialog, openEditDialog, pickName } from './dialogs.js';
import { typeById } from '../core/engine.js';
import * as P from '../data/prep.js';
import { sharedFor, setSlotPool, addFromDef, addPartFromDef, ruleText, poolUsers, linkWithAbove, unlinkSlot, linkedWith, toPool, duplicateQuestion, switchVersion, addVersion, removeVersion, versionSummary } from '../data/presetdraft.js';
const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const ICON_UP = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2.5h10M8 13.5V6M4.8 8.7 8 5.5l3.2 3.2"/></svg>';
const ICON_DOWN = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13.5h10M8 2.5V10M4.8 7.3 8 10.5l3.2-3.2"/></svg>';
const SV = (d) => `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICON_LOCK = SV('<rect x="3.2" y="7" width="9.6" height="6.8" rx="1.4"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.6 0V7"/>');
const ICON_UNLOCK = SV('<rect x="3.2" y="7" width="9.6" height="6.8" rx="1.4"/><path d="M5.2 7V5.2a2.8 2.8 0 0 1 5.4-1"/>');
const ICON_BIN = SV('<path d="M2.8 4.2h10.4M6.2 4.2V2.8h3.6v1.4M4.2 4.2l.6 9h6.4l.6-9M6.6 6.6v4.2M9.4 6.6v4.2"/>');
const ICON_POOL = SV('<path d="M5.5 3.2h6.2a1.6 1.6 0 0 1 1.6 1.6v6.2"/><rect x="2.7" y="5.4" width="7.9" height="8" rx="1.6"/>');
const ICON_SWAP = SV('<path d="M2.5 5.5h10M9.8 2.8l2.7 2.7-2.7 2.7M13.5 10.5h-10M6.2 7.8l-2.7 2.7 2.7 2.7"/>');
const ICON_EDIT = SV('<path d="M2.8 13.2l.6-2.9 7.2-7.2a1.4 1.4 0 0 1 2 0l.3.3a1.4 1.4 0 0 1 0 2l-7.2 7.2-2.9.6zM9.6 4.1l2.3 2.3"/>');
const ICON_EYE = SV('<path d="M1.5 8S4 3.6 8 3.6 14.5 8 14.5 8 12 12.4 8 12.4 1.5 8 1.5 8z"/><circle cx="8" cy="8" r="2"/>');
const ICON_EYE_OFF = SV('<path d="M1.5 8S4 3.6 8 3.6c1 0 1.9.3 2.7.7M14.5 8S12 12.4 8 12.4c-1 0-1.9-.3-2.7-.7M2.5 2.5l11 11"/><path d="M6.4 6.4a2 2 0 0 0 3.2 3.2"/>');
const lab = (qi) => S.labelsOf(ctx.prep)[qi] || String(qi + 1);
const ICON_MORE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><circle cx="3.5" cy="8" r="1.3"/><circle cx="8" cy="8" r="1.3"/><circle cx="12.5" cy="8" r="1.3"/></svg>';
const ICON_SHUFFLE = SV('<path d="M2 4.5h2.2c3.2 0 3.6 7 6.8 7H14M2 11.5h2.2c1 0 1.7-.7 2.3-1.6M14 4.5h-3c-1 0-1.7.7-2.3 1.6M12 2.5l2 2-2 2M12 9.5l2 2-2 2"/>');
// difficulty: three rising bars; the filled ones are the level
const BARS = (on) => `<svg width="16" height="16" viewBox="0 0 16 16" stroke="none">${[5, 8, 11].map((hh, k) => `<rect x="${2 + k * 4.5}" y="${14.5 - hh}" width="3.2" height="${hh}" rx="1" fill="currentColor" opacity="${k < on ? 1 : 0.22}"/>`).join('')}</svg>`;
const ICON_EASIER = BARS(1);
const ICON_HARDER = BARS(3);
const ICON_CALC = SV('<rect x="3.2" y="1.8" width="9.6" height="12.4" rx="1.8"/><path d="M5.4 4.9h5.2"/><path d="M5.7 8h.01M8 8h.01M10.3 8h.01M5.7 10.6h.01M8 10.6h.01M10.3 10.6h.01" stroke-width="1.9"/>');
const poolInfo = (slot) => { const d = slot.def; if (d.mode !== 'pool') return null; const n = d.choices ? new Set(d.choices.filter(c => c.enabled !== false).map(c => c.topic)).size : (d.candidates || []).filter(c => c.on !== false).length; return { label: d.label || 'Pool', n, text: `${d.label || 'Pool'} · ${n} choice${n === 1 ? '' : 's'}` }; };
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
  const qs = composePrep(prep);
  const total = qs.reduce((a, q) => a + q.marks, 0);
  const sel = ctx.ui.sel;
  root.replaceChildren();
  if (prep.draft) root.append(h('div', { class: 'draftbar', role: 'region', 'aria-label': 'Preset editor' },
    h('div', { class: 'dtext' }, h('b', {}, prep.draft.presetId ? 'Editing preset' : 'New preset'), h('span', {}, ' The questions below are samples. What gets saved is the rule under each one (exact question, topic and level, range or pool), plus the marks and working space.')),
    h('div', { class: 'dbtn' },
      h('button', { class: 'btn small ghost', onClick: () => ctx.hooks.cancelDraft && ctx.hooks.cancelDraft() }, 'Cancel'),
      h('button', { class: 'btn small primary', onClick: () => ctx.hooks.saveDraft && ctx.hooks.saveDraft() }, 'Save preset'))));
  root.append(h('div', { class: 'summary' },
    h('span', {}, h('b', {}, `${prep.questions.length} question${prep.questions.length === 1 ? '' : 's'}`), ` · ${total} marks`),
    h('span', { style: { flex: 1 } }),
    h('span', { class: 'splitbtn' },
      h('button', { class: 'btn small', onClick: () => rerollAll(), title: REROLL[rerollMode()].tip }, REROLL[rerollMode()].label),
      h('button', { class: 'btn small arrow', 'aria-label': 'Re-roll options', onClick: (e) => showMenu(e.currentTarget, [
        { label: 'New numbers', sub: 'Every question stays; locked ones are untouched', checked: rerollMode() === 'nums', onClick: () => rerollAll('nums') },
        { label: 'New questions', sub: 'A fresh question for each Quick or pooled row (same topic and level)', checked: rerollMode() === 'questions', onClick: () => rerollAll('questions') },
      ]) }, '▾'))));
  if (!prep.questions.length) root.append(h('div', { class: 'empty' }, prep.draft ? 'No questions yet. Add the first question of this preset: exact, a topic and level, or a pool.' : 'No questions yet. Choose a preset in the sidebar, or add a question.'));
  else root.append(h('div', { class: 'colhead' + (aos ? ' aos' : '') }, h('span'), h('span', { class: 'qh' }, 'Question'), marksHead(), aos ? h('span', { class: 'c' }, 'Lines') : null, h('span')));

  prep.questions.forEach((q, qi) => {
    try { drawCard(q, qi); } catch (err) {
      console.error('Could not draw question', qi + 1, err);
      root.append(h('div', { class: 'q-card' }, h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${lab(qi)}.`), h('span', { class: 'hint' }, `This question could not be shown (${err.message}). Try ↻ or Replace.`), h('span', { class: 'sp' }),
        h('button', { class: 'btn small', onClick: () => { try { q.slots.forEach(sl => P.rerollSlot(prep, sl)); } catch (e2) { toast('Still cannot make it: ' + e2.message); } ctx.commit(); } }, '↻'))));
    }
  });
  function drawCard(q, qi) {
    const cq = qs[qi];
    const isSel = sel && sel.q === qi;
    if (cq.section) root.append(sectionHead(cq.section, qs, qi));
    const card = h('div', { class: 'q-card' + (isSel ? ' sel' : '') },
      h('div', { class: 'q-head' }, h('span', { class: 'n' }, `${cq.n}.`), h('span', { class: 'hint' }, `${cq.marks} mark${cq.marks === 1 ? '' : 's'}`),
        q.slots.some(s => s.locked) ? h('span', { class: 'lockmark', title: 'Locked', html: ICON_LOCK }) : null,
        versionBar(q, qi),
        h('span', { class: 'sp' }),
        h('span', { class: 'acts' },
          h('button', { class: 'iconbtn', title: 'Make this a further part of the question above', disabled: qi === 0, html: ICON_UP, onClick: () => joinQuestion(qi, -1) }),
          h('button', { class: 'iconbtn', title: 'Make this the first part of the question below', disabled: qi === prep.questions.length - 1, html: ICON_DOWN, onClick: () => joinQuestion(qi, 1) }),
          h('span', { class: 'acts-sep' }),
          h('button', { class: 'iconbtn', title: 'Move up', onClick: () => { const to = P.moveQuestion(prep, qi, -1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: to } : null; ctx.commit(); } }, '↑'),
          h('button', { class: 'iconbtn', title: 'Move down', onClick: () => { const to = P.moveQuestion(prep, qi, 1); ctx.ui.sel = sel && sel.q === qi ? { ...sel, q: to } : null; ctx.commit(); } }, '↓'))));
    if (cq.stem) card.append(h('div', { class: 'stemrow' }, h('div'), h('div', { class: 'txt', html: T(cq.stem) }), h('div'), h('div')));
    cq.parts.forEach((p, k) => {
      const slot = q.slots[p.si];
      const firstOfSlot = cq.parts.findIndex(x => x.si === p.si) === k;
      const isRowSel = isSel && sel.k === k;
      const manualM = slot.marksManual[p.pi], manualL = slot.linesManual[p.pi];
      const pinfo = poolInfo(slot);
      const toggleSel = () => { ctx.ui.sel = isRowSel ? null : { q: qi, k }; ctx.hooks.builder(); };
      const row = h('div', { class: 'prow' + (aos ? ' aos' : '') + (isRowSel ? ' sel' : '') + (p.l ? '' : ' nolab') },
        h('div', { class: 'gut' }, pinfo && firstOfSlot ? h('button', { class: 'poolico', title: slot.def.poolId && prep.draft && poolUsers(prep, slot.def.poolId) > 1 ? `Shared pool “${pinfo.label}”, used by ${poolUsers(prep, slot.def.poolId)} questions. Click to edit it: the change applies to all of them.` : `Pool: this question is drawn from ${pinfo.n} choice${pinfo.n === 1 ? '' : 's'}. Click to edit them.`, 'aria-label': 'Edit the pool choices', html: ICON_POOL, onClick: () => openPoolDialog(slot, qi, p.si) }) : null),
        h('div', { class: 'lab' }, p.l ? `(${p.l})` : ''),
        h('div', { class: 'txt', title: 'Click for details and options', onClick: toggleSel,
          html: T(p.text) + (p.edited ? ' <span class="badge ed">edited</span>' : '') + (prep.draft && firstOfSlot ? `<div class="rulechip">${esc(ruleText(slot, prep))}</div>` : '') }),
        h('div', { class: 'c' }, stepper({ value: p.marks, step: 1, min: 1, manual: manualM, title: 'Marks for this part', onChange: (v) => { P.setMarks(slot, p.pi, v); ctx.commit(); } })),
        aos ? h('div', { class: 'c' }, stepper({ value: p.lines, step: 0.5, min: 0.5, manual: manualL, title: 'Working space in ruled lines (decimals allowed)', onChange: (v) => { P.setLines(slot, p.pi, v); ctx.commit({ builder: true }); } })) : null,
        h('div', { class: 'c end' }, p.calc ? h('span', { class: 'calcico', title: 'Calculator question', 'aria-label': 'Calculator question', html: ICON_CALC }) : null,
          firstOfSlot ? [
            slot.def.mode === 'query' || slot.def.mode === 'pool' || (slot.def.pick && slot.def.pick.endsWith(':*'))
              ? h('button', { class: 'iconbtn', title: slot.locked ? 'Locked' : slot.def.mode === 'pool' && slot.def.link ? 'A different topic for these linked parts (they change together)' : slot.def.mode === 'pool' ? `A different question from the pool: ${poolInfo(slot).text}` : slot.def.mode === 'query' ? `A different question: ${describe(slot.def)}` : 'A different option of this kind of question', 'aria-label': 'Different question', disabled: slot.locked, html: ICON_SHUFFLE, onClick: () => { P.rerollSlot(prep, slot); ctx.commit(); } }) : null,
            h('button', { class: 'iconbtn', title: slot.locked ? 'Locked' : 'New numbers (same question)', 'aria-label': 'New numbers', disabled: slot.locked, onClick: () => { P.renumber(prep, slot); ctx.commit(); } }, '↻')] : null));
      card.append(row);
      if (isRowSel) card.append(detailPanel(q, qi, slot, p.si, cq, p));
    });
    root.append(card);
  }
  root.append(h('div', { class: 'addrow' },
    h('button', { class: 'btn', onClick: addSimple }, '+ Add question'),
    h('button', { class: 'btn', title: 'Choose one exact question from the full list', style: { flex: '0 0 auto', width: 'auto' }, onClick: browseAdd }, 'Browse all…'),
    h('button', { class: 'btn', title: 'A new section A, B, C… built from a topic: tick the options, and the questions ramp from easy to hard', style: { flex: '0 0 auto', width: 'auto' }, onClick: () => addSection() }, '+ Add section')));
}
// ---- sections ----
// The bar above the first question of a section: its letter, a title (printed beside it), and what you can do with the section.
function sectionHead(sec, qs, qi) {
  const prep = ctx.prep, si = S.sectionsOf(prep).findIndex(x => x.start === qi), info = S.sectionsOf(prep)[si];
  const n = info.end - info.start, marks = qs.slice(info.start, info.end).reduce((a, q) => a + q.marks, 0), last = S.sectionsOf(prep).length - 1;
  const title = h('input', { type: 'text', class: 'sec-title', value: info.sec.title || '', placeholder: 'Title (optional), e.g. Two-step equations', 'aria-label': `Title of section ${sec.letter}`,
    onChange: () => { info.sec.title = title.value.trim(); ctx.commit(); } });
  const plan = info.sec.plan;
  return h('div', { class: 'sec-head', 'data-sec': sec.letter },
    h('span', { class: 'sec-letter' }, `Section ${sec.letter}`), title,
    h('span', { class: 'hint' }, `${n} question${n === 1 ? '' : 's'} · ${marks} mark${marks === 1 ? '' : 's'}`),
    h('span', { class: 'acts' },
      h('button', { class: 'btn small', title: plan ? 'Change the topic, options or number of questions; the section is rebuilt' : 'Replace this section’s questions with a plan: a topic, the options to use, and how many', onClick: () => editPlan(si) }, plan ? 'Plan…' : 'Build from a plan…'),
      h('button', { class: 'iconbtn', title: 'Move this section up', disabled: si === 0, html: ICON_UP, onClick: () => { S.moveSection(prep, si, -1); ctx.ui.sel = null; ctx.commit(); } }),
      h('button', { class: 'iconbtn', title: 'Move this section down', disabled: si === last, html: ICON_DOWN, onClick: () => { S.moveSection(prep, si, 1); ctx.ui.sel = null; ctx.commit(); } }),
      h('button', { class: 'iconbtn', title: 'More options for this section', 'data-menu-anchor': '', html: ICON_MORE, onClick: (e) => showMenu(e.currentTarget, [
        si > 0 ? { label: 'Join with the section above', sub: 'Remove this heading; its questions carry on the section above', onClick: () => { S.joinWithAbove(prep, si); ctx.ui.sel = null; ctx.commit(); } } : null,
        si === 0 && last === 0 ? { label: 'Remove the section heading', sub: 'Number the questions 1, 2, 3 again', onClick: () => { S.joinWithAbove(prep, si); ctx.ui.sel = null; ctx.commit(); } } : null,
        { label: 'Remove the section and its questions', sub: `${n} question${n === 1 ? '' : 's'}`, danger: true, onClick: async () => { if (!(await confirmBox({ title: `Remove section ${sec.letter}?`, message: `Its ${n} question${n === 1 ? '' : 's'} are removed from this ${prep.draft ? 'preset' : 'prep'}. You can bring them back with Undo.`, confirmLabel: 'Remove', danger: true }))) return; S.removeSection(prep, si); ctx.ui.sel = null; ctx.commit(); } },
      ].filter(Boolean)) })));
}
function addSection() {
  const prep = ctx.prep, had = S.hasSections(prep), nq = prep.questions.length;
  openPlanDialog({ title: 'New section', note: nq && !had ? 'The questions already on the sheet become section A; this one follows as section B.' : null,
    onDone: ({ plan, title }) => {
      try {
        const made = buildSection(prep, plan, title);
        ctx.ui.sel = null; ctx.commit();
        toast(`Section ${S.sectionLetter(S.sectionsOf(prep).length - 1)} added: ${made.length} question${made.length === 1 ? '' : 's'}.`, 5000, { label: 'Undo', onClick: () => ctx.undo() });
      } catch (e) { toast('Could not build the section: ' + e.message, 7000); }
    } });
}
function editPlan(si) {
  const prep = ctx.prep, info = S.sectionsOf(prep)[si]; if (!info) return;
  const had = info.sec.plan;
  openPlanDialog({ title: `Section ${info.letter}`, confirmLabel: 'Rebuild section', plan: had || null, secTitle: info.sec.title || '',
    note: `The ${info.end - info.start} question${info.end - info.start === 1 ? '' : 's'} in this section are replaced by the new plan.${prep.questions.slice(info.start, info.end).some(q => q.slots.some(s => s.locked || s.edits)) ? ' Some are locked or edited: those are replaced too (Undo brings them back).' : ''}`,
    onDone: ({ plan, title }) => {
      try { rebuildSection(prep, si, plan, title); ctx.ui.sel = null; ctx.commit(); toast(`Section ${info.letter} rebuilt.`, 5000, { label: 'Undo', onClick: () => ctx.undo() }); }
      catch (e) { toast('Could not rebuild the section: ' + e.message, 7000); }
    } });
}
// A question that has versions (say a two-part BIDMAS question OR a Substitution question) shows which one it is; click another to switch.
function versionBar(q, qi) {
  const prep = ctx.prep;
  if (!q.versions || q.versions.length < 2) return null;
  const go = (vi) => {
    if (vi === q.version) return;
    try { switchVersion(prep, qi, vi); ctx.ui.sel = { q: qi, k: 0 }; ctx.commit(); } catch (e) { toast(e.message, 6000); }
  };
  return h('span', { class: 'vers', role: 'group', 'aria-label': 'Versions of this question' },
    h('span', { class: 'hint' }, 'Version'),
    q.versions.map((v, i) => h('button', { class: 'vchip' + (i === q.version ? ' on' : ''), 'aria-pressed': i === q.version ? 'true' : 'false',
      title: `${i === q.version ? 'Showing: ' : 'Switch to: '}${versionSummary(i === q.version ? q.slots.map(s => s.def) : v)}`, onClick: () => go(i) }, String(i + 1))));
}
function addVersionTo(qi) {
  const prep = ctx.prep;
  openQuickChooser({ title: `Another version of question ${lab(qi)}`, confirmLabel: 'Add version', onBrowse: null, shared: sharedFor(prep),
    note: 'Version rules: a prep made from this preset shows just one of the versions of this question, chosen at random. You can add further parts to this version afterwards, with + Add a part.',
    onDone: (def) => { try { addVersion(prep, qi, def); ctx.ui.sel = { q: qi, k: 0 }; ctx.commit(); toast(`Question ${lab(qi)} now has ${prep.questions[qi].versions.length} versions. Use the numbers beside the question number to move between them.`, 7000); } catch (e) { toast(e.message, 6000); } } });
}
// The Marks header carries an eye: hide or show the marks on the printed sheet (the marks themselves stay editable)
function marksHead() {
  const on = ctx.layout.marks !== false;
  return h('span', { class: 'c marksh' }, 'Marks', h('button', { class: 'iconbtn eye', 'aria-pressed': on ? 'false' : 'true', 'aria-label': on ? 'Hide the marks on the sheet' : 'Show the marks on the sheet', title: on ? 'Marks are shown on the sheet. Click to hide them.' : 'Marks are hidden on the sheet. Click to show them.', html: on ? ICON_EYE : ICON_EYE_OFF, onClick: () => { ctx.layout.marks = !on; ctx.commit({ dirty: false }); } }));
}
function addSimple() {
  const prep = ctx.prep;
  openQuickChooser({ title: 'Add a question', confirmLabel: 'Add question', onBrowse: browseAdd,
    shared: sharedFor(prep, true),
    onDone: (def, o = {}) => { const added = addFromDef(prep, def, o.count || 1); ctx.ui.sel = { q: prep.questions.indexOf(added[0]), k: 0 }; ctx.commit(); } });
}
function browseAdd() {
  const prep = ctx.prep;
  openPicker({ title: 'Add a question', confirmLabel: 'Use this question', onSimple: addSimple, onPick: (c) => { const q = P.addQuestion(prep, c.pick); P.applyChoice(q.slots[0], c); ctx.ui.sel = { q: prep.questions.length - 1, k: 0 }; ctx.commit(); } });
}
// "Topic" in bold, then "Type › Option" plain
function pickParts(pick, anyOption) {
  if (pick === 'custom') return ['Written by Claude', 'Written out in full: it does not re-roll'];
  const [tid, vid] = pick.split(':'); const t = typeById[tid];
  if (!t) return [pick + ' (missing)', ''];
  if (anyOption || vid === '*') return [t.topic, `${t.type} › any option`];
  const v = t.variants.find(x => x.id === vid);
  return [t.topic, `${t.type}${v ? ' › ' + v.label : ''}`];
}
function sameTopic(slot) {
  if (!P.rerollInTopic(ctx.prep, slot)) { toast(`Only one question is allowed for ${slot.meta.topic} here. Tick more options for it in the pool to get a choice.`, 6000); return; }
  ctx.commit();
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
  const abtn = (icon, label, fn, title, disabled = false) => h('button', { class: 'abtn', title, disabled: disabled || undefined, onClick: fn }, h('span', { html: icon }), label);
  const isPool = slot.def.mode === 'pool';
  const anyOpt = slot.def.mode === 'fixed' && slot.def.pick && slot.def.pick.endsWith(':*');
  const isQuery = slot.def.mode === 'query';
  const [pickTopic, pickRest] = pickParts(anyOpt ? slot.def.pick : slot.pick, anyOpt);
  const canRemove = cq.parts.length > 1 || prep.questions.length > 0;
  const partLabel = (sl) => { const x = cq.parts.find(pp => pp.si === q.slots.indexOf(sl)); return x && x.l ? `(${x.l})` : `part ${q.slots.indexOf(sl) + 1}`; };
  const mates = slot.def.link ? linkedWith(prep, slot) : [];
  const linkedNote = mates.length ? h('div', { class: 'hint linknote' }, `Linked with ${mates.map(partLabel).join(' and ')}: the linked parts always share a topic, and ⤮ changes it for all of them. Each part keeps its own options.`) : null;
  return h('div', { class: 'detail' },
    h('div', { class: 'dside' },
      h('button', { class: 'iconbtn boxed' + (slot.locked ? ' on' : ''), title: slot.locked ? 'Locked: re-roll will not change this. Click to unlock' : 'Lock: stop re-roll changing this question', html: slot.locked ? ICON_LOCK : ICON_UNLOCK, onClick: () => { slot.locked = !slot.locked; ctx.commit(); } }),
      canRemove ? h('button', { class: 'iconbtn danger', title: q.slots.length > 1 ? 'Remove this part' : 'Remove this question', html: ICON_BIN, onClick: async () => { if (!(await confirmBox({ title: q.slots.length > 1 ? 'Remove this part?' : `Remove question ${cq.n}?`, message: q.slots.length > 1 ? 'It is removed from the question. You can bring it back with Undo.' : 'The question is removed from this prep. You can bring it back with Undo.', confirmLabel: 'Remove', danger: true }))) return; P.removeSlot(prep, qi, si); ctx.ui.sel = null; ctx.commit(); } }) : null),
    h('div', { class: 'dpath' }, h('b', {}, pickTopic), isQuery ? h('span', { class: 'tag lvtag', title: isRange(slot.def) ? 'A range of the difficulty ladder: ⤮ draws another question from it' : `${slot.def.level} level: ⤮ draws another question from this topic at this level` }, isRange(slot.def) ? 'range' : slot.def.level) : null, pickRest ? h('span', { class: 'dpath-rest' }, ' › ' + pickRest) : null, slot.meta && slot.meta.multipart ? h('span', { class: 'tag' }, 'multipart') : null, slot.locked ? h('span', { class: 'tag lock' }, 'locked') : null),
    anyOpt ? h('div', { class: 'hint' }, `A different option comes up each time you re-roll. This one is: ${slot.meta.label}.`) : null,
    range ? h('div', { class: 'hint' }, range) : null,
    linkedNote,
    h('div', { class: 'dbtns' },
      h('div', { class: 'abar' },
        abtn(ICON_EASIER, 'Easier', () => nudge(slot, -1), 'An easier question on the same topic', !P.canNudge(slot, -1)),
        abtn(ICON_HARDER, 'Harder', () => nudge(slot, 1), 'A harder question on the same topic', !P.canNudge(slot, 1)),
        P.canSameTopic(slot) ? abtn(ICON_SHUFFLE, 'Same topic', () => sameTopic(slot), `Keep the topic (${slot.meta.topic}) and draw a different question from the options allowed for it`) : null),
      h('div', { class: 'abar' },
      abtn(ICON_SWAP, 'Replace', () => changeSlot(q, qi, slot), 'Swap this for a different question'),
      abtn(ICON_EDIT, 'Edit', () => openEditDialog(slot, () => ctx.commit()), 'Change the wording or the answer'),
      h('button', { class: 'abtn', title: 'More options', 'data-menu-anchor': '', onClick: (e) => showMenu(e.currentTarget, [
        { label: '+ Add a part', onClick: () => addPart(qi) },
        !q.sec ? { label: 'Start a new section here', sub: qi === 0 ? 'Section A begins at this question' : 'This question and the ones below it become a new section', onClick: () => { S.startSection(prep, qi, ''); ctx.ui.sel = { q: qi, k: 0 }; ctx.commit(); } } : null,
        { label: 'Duplicate this question', sub: 'Same topics, options and pools; a fresh sample', onClick: () => { duplicateQuestion(prep, qi); ctx.ui.sel = { q: qi + 1, k: 0 }; ctx.commit(); toast(`Question ${qi + 1} copied as question ${lab(qi + 1)}.`, 4000, { label: 'Undo', onClick: () => ctx.undo() }); } },
        prep.draft ? { label: 'Add another version of this question…', sub: 'It will be this question OR the new one, chosen at random for each prep', onClick: () => addVersionTo(qi) } : null,
        prep.draft && q.versions && q.versions.length > 1 ? { label: 'Remove this version', sub: `Delete version ${q.version + 1} of ${q.versions.length}`, onClick: async () => { if (!(await confirmBox({ title: `Remove version ${q.version + 1}?`, message: 'This version of the question is removed from the preset. You can bring it back with Undo.', confirmLabel: 'Remove', danger: true }))) return; removeVersion(prep, qi); ctx.ui.sel = { q: qi, k: 0 }; ctx.commit(); } } : null,
        q.slots.length > 1 ? { label: 'Make this its own question', sub: 'Take it out of the multipart question', onClick: () => { const nq = P.splitSlot(prep, qi, si); ctx.ui.sel = nq === null ? null : { q: nq, k: 0 }; ctx.commit(); } } : null,
        { sep: true },
        prep.draft && si > 0 && !(slot.def.link && q.slots[si - 1].def.link === slot.def.link) ? { label: 'Link with the part above', sub: 'One topic decision for both; each part keeps its own options', onClick: () => { linkWithAbove(prep, q, si); ctx.commit(); toast('Linked. Open each part’s pool (the pool icon) to choose the topics and the options for that part.', 6000); } } : null,
        slot.def.link ? { label: 'Unlink this part', sub: 'It chooses its own topic again', onClick: () => { unlinkSlot(prep, slot); ctx.commit(); } } : null,
        isPool || slot.def.mode === 'custom' ? null : { label: 'Make this a pool…', sub: 'Re-roll picks from several questions you choose', onClick: () => { toPool(slot); ctx.commit(); openPoolDialog(slot, qi, si); } },
        isPool ? { label: 'Stop being a pool', sub: 'Re-roll keeps this kind of question', onClick: () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); } } : null,
        anyOpt ? { label: 'Keep this option', sub: 'Stop changing option when you re-roll', onClick: () => { slot.def = { mode: 'fixed', pick: slot.pick }; ctx.commit(); } } : null,
        { sep: true },
        q.slots.length > 1 ? { label: 'Remove the whole question', sub: `All ${q.slots.length} parts of question ${lab(qi)}`, onClick: async () => { if (!(await confirmBox({ title: `Remove question ${cq.n}?`, message: 'The whole question is removed from this prep. You can bring it back with Undo.', confirmLabel: 'Remove', danger: true }))) return; S.removeQuestionAt(prep, qi); ctx.ui.sel = null; ctx.commit(); } } : null,
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
const REROLL = {
  nums: { label: '↻ New numbers', tip: 'New numbers for every question that is not locked. The questions stay.' },
  questions: { label: '⤮ New questions', tip: 'A fresh question for every Quick or pooled row that is not locked. Exact questions are left alone.' },
};
const rerollMode = () => (ctx.store.settings.rerollMode === 'questions' ? 'questions' : 'nums');
function rerollAll(kind = rerollMode()) {
  const prep = ctx.prep;
  ctx.store.settings.rerollMode = kind; ctx.save();
  let failed = 0, n = 0, flipped = 0;
  // a question with versions flips to another version (unless a part of it is locked); its parts are then already fresh
  const fresh = new Set();
  prep.questions.forEach((q, qi) => {
    if (!q.versions || q.versions.length < 2 || q.slots.some(s => s.locked)) return;
    const others = q.versions.map((_, i) => i).filter(i => i !== q.version);
    try { switchVersion(prep, qi, others[Math.floor(Math.random() * others.length)]); fresh.add(q); flipped++; } catch (e) { failed++; console.error('Version flip failed', e); }
  });
  prep.questions.forEach(q => fresh.has(q) ? null : q.slots.forEach(s => {
    if (s.locked) return;
    const swappable = s.def.mode === 'query' || s.def.mode === 'pool' || (s.def.pick && s.def.pick.endsWith(':*'));
    if (kind === 'questions' && !swappable) return;
    try { if (kind === 'questions') P.rerollSlot(prep, s); else P.renumber(prep, s); n++; } catch (e) { failed++; console.error('Re-roll failed', s.pick, e); }
  }));
  ctx.commit();
  toast(failed ? `${failed} question${failed === 1 ? '' : 's'} could not be re-rolled and ${failed === 1 ? 'was' : 'were'} left as they were.` : flipped && kind === 'nums' ? `New numbers for every question that is not locked. ${flipped} question${flipped === 1 ? '' : 's'} switched to another version.` : kind === 'nums' ? 'New numbers for every question that is not locked.' : `${n} question${n === 1 ? '' : 's'} replaced.`, 5000, { label: 'Undo', onClick: () => ctx.undo() });
}
// Replace a question. A Quick or Range question opens the simple picker (its topic and level filled in); anything else opens the full list first. Each can switch to the other.
function changeSlot(q, qi, slot) {
  const prep = ctx.prep;
  const simple = () => {
    const def = slot.def.mode === 'query' || slot.def.mode === 'pool' ? slot.def : P.queryOfPick(slot.pick);
    openQuickChooser({ title: `Choose a question for ${lab(qi)}`, confirmLabel: 'Use this question', def, onBrowse: browse,
      shared: sharedFor(prep),
      onDone: (d) => { if (d.mode === 'pool') setSlotPool(prep, slot, d, { redraw: true }); else P.setQuery(prep, slot, d, { redraw: true }); ctx.commit(); } });
  };
  const browse = () => openPicker({ title: `Choose a question for ${lab(qi)}`, current: slot.pick, onSimple: simple, onPick: (c) => { P.applyChoice(slot, c); ctx.commit(); } });
  if (slot.def.mode === 'query' || slot.def.mode === 'pool') simple(); else browse();
}
function addPart(qi) {
  const prep = ctx.prep, q = prep.questions[qi];
  const simple = () => openQuickChooser({ title: `Add a part to question ${lab(qi)}`, confirmLabel: 'Add part', onBrowse: browse, shared: sharedFor(prep), onDone: (def) => { addPartFromDef(prep, q, def); ctx.commit(); } });
  const browse = () => openPicker({ title: `Add a part to question ${lab(qi)}`, confirmLabel: 'Add part', onSimple: simple, onPick: (c) => { const s = P.addSlotToQuestion(prep, q, c.pick); P.applyChoice(s, c); ctx.commit(); } });
  browse();
}
