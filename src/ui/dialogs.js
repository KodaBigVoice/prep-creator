import { h, modal, toast, download, setKids, confirmBox } from './dom.js';
import { ctx } from './state.js';
import { openPicker } from './picker.js';
import { mathToHTML } from '../layout/render.js';
import { typeById, entries } from '../core/engine.js';
import * as P from '../data/prep.js';
import { STARTER_PRESETS } from '../data/presets.js';
import { exportText, importText } from '../data/store.js';
import { SETS, setById } from '../data/sets.js';

// "type:variant" or "type:*" -> readable name
export function pickName(pick) {
  const [tid, vid] = pick.split(':'); const t = typeById[tid]; if (!t) return pick + ' (missing)';
  if (vid === '*') return `${t.topic} › ${t.type}`;
  const v = t.variants.find(x => x.id === vid); return `${t.topic} › ${t.type}${v ? ' › ' + v.label : ''}`;
}

// Pool choices: tick or untick the candidates; add more from the picker
export function openPoolDialog(slot, qi, si) {
  const d = slot.def;
  const area = h('div');
  const draw = () => {
    setKids(area, 
      h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'The question is chosen at random from the ticked choices. A topic is not used twice in one prep. Your ticks are remembered for this preset.'),
      ...d.candidates.map((c, i) => h('div', { class: 'tickrow' },
        h('input', { type: 'checkbox', checked: c.on, id: `pc${i}`, onChange: (e) => { c.on = e.target.checked; } }),
        h('label', { for: `pc${i}`, style: { flex: 1 } }, pickName(c.pick)),
        h('button', { class: 'btn small ghost', title: 'Remove from this pool', onClick: () => { d.candidates.splice(i, 1); draw(); } }, '✕'))),
      h('div', { class: 'addrow' }, h('button', { class: 'btn small', onClick: () => openPicker({ title: 'Add a choice to the pool', confirmLabel: 'Add to pool', onPick: ({ pick, scope }) => { for (const sc of (scope && scope.length ? scope : [pick])) if (!d.candidates.some(c => c.pick === sc)) d.candidates.push({ pick: sc, on: true }); draw(); } }) }, '+ Add a choice')),
      h('div', { class: 'hint', style: { marginTop: '6px' } }, 'In the picker, choose a topic or type and leave Options on “Any” to add all its options, or pick one option to add just that.'));
  };
  draw();
  const m = modal({ title: `Pool for question ${qi + 1}`, narrow: true, body: area, footer: [
    h('button', { class: 'btn', onClick: () => m.close() }, 'Close'),
    h('button', { class: 'btn primary', onClick: () => { rememberTicks(); P.rerollSlot(ctx.prep, slot); m.close(); ctx.commit(); } }, 'Save and pick again')] });
  function rememberTicks() {
    const id = ctx.prep.presetId;
    if (!id) return;
    ctx.store.ticks[id] = ctx.store.ticks[id] || {};
    ctx.store.ticks[id][`${qi}.${si}`] = d.candidates.map(c => ({ pick: c.pick, on: c.on }));
  }
}

// Edit this question's wording / answer for this prep only
export function openEditDialog(slot, done) {
  const T = (s) => mathToHTML(s, ctx.katex);
  const toEd = (s) => s.replace(/\{\{/g, '$').replace(/\}\}/g, '$');      // {{x}} -> $x$ for easier typing
  const fromEd = (s) => s.replace(/\$([^$]*)\$/g, '{{$1}}');
  const parts = slot.snapshot.parts.map((p, i) => ({ ...p, ...((slot.edits && slot.edits.parts && slot.edits.parts[i]) || {}) }));
  const ins = parts.map((p, i) => ({
    body: h('textarea', { rows: 3, style: { width: '100%' } }, toEd(p.body)),
    a: h('input', { type: 'text', style: { width: '100%' }, value: p.a }),
    w: h('textarea', { rows: 2, style: { width: '100%' } }, toEd(p.w || '')),
    prev: h('div', { class: 'pk-preview', style: { minHeight: 0, marginTop: '4px' } }),
  }));
  const refresh = () => ins.forEach(x => { x.prev.innerHTML = T(fromEd(x.body.value)) + `<div class="ans"><b>Answer:</b> ${safeTex(x.a.value)}</div>`; });
  const safeTex = (t) => { try { return ctx.katex.renderToString(t, { throwOnError: false }); } catch (e) { return t; } };
  ins.forEach(x => [x.body, x.a, x.w].forEach(el => el.addEventListener('input', refresh)));
  const body = h('div', {},
    h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'Put maths between $ signs, e.g. Work out $\\dfrac{3}{4} + \\dfrac{1}{2}$. The answer box is plain maths (no $ signs). Changes apply to this prep only. If you change the numbers, change the answer too: the app does not recalculate it. Parts you edit are marked “written by you” in the answers.'),
    parts.map((p, i) => h('div', { style: { marginBottom: '14px' } },
      parts.length > 1 ? h('b', {}, `Part (${'abcd'[i]})`) : null,
      p.verb ? h('div', { class: 'hint' }, `Starts with “${p.verb}” (added automatically)`) : null,
      h('label', { class: 'hint' }, 'Question'), ins[i].body,
      h('label', { class: 'hint' }, 'Answer'), ins[i].a,
      h('label', { class: 'hint' }, 'Working (shown in the answers)'), ins[i].w, ins[i].prev)));
  const m = modal({ title: 'Edit wording or answer', body, footer: [
    slot.edits ? h('button', { class: 'btn danger', style: { marginRight: 'auto' }, onClick: () => { slot.edits = null; m.close(); done(); } }, 'Reset to original') : null,
    h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'),
    h('button', { class: 'btn primary', onClick: () => {
      const e = { parts: {} };
      ins.forEach((x, i) => {
        const nb = fromEd(x.body.value), na = x.a.value, nw = fromEd(x.w.value);
        const o = slot.snapshot.parts[i];
        if (nb !== o.body || na !== o.a || nw !== o.w) e.parts[i] = { body: nb, a: na, w: nw, byHand: true };
      });
      slot.edits = Object.keys(e.parts).length ? e : null;
      m.close(); done();
    } }, 'Use my version')] });
  refresh();
}

export function openRubricDialog() { /* rubric is edited in the print panel */ }

// History: saved preps and presets
export function openHistory() {
  const st = ctx.store;
  const area = h('div');
  let tab = 'preps', setFilter = ctx.prep.set;
  const draw = () => {
    const tabs = h('div', { class: 'seg', role: 'tablist' }, ...[['preps', 'Saved preps'], ['presets', 'My presets']].map(([k, l]) => h('button', { 'aria-checked': tab === k, onClick: () => { tab = k; draw(); } }, l)));
    const top = h('div', { style: { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' } }, tabs, h('span', { style: { flex: 1 } }),
      h('button', { class: 'btn small', onClick: () => { download(`PMU history ${new Date().toISOString().slice(0, 10)}.json`, exportText(st)); } }, 'Download history file'),
      h('label', { class: 'btn small' }, 'Open history file…', h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onChange: async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { importText(st, await f.text()); ctx.save(); toast('History file loaded.'); draw(); ctx.hooks.toolbar(); } catch (err) { toast('Could not read that file: ' + err.message, 5000); }
      } })));
    let content;
    if (tab === 'preps') {
      const sel = h('select', { onChange: (e) => { setFilter = e.target.value; draw(); } }, h('option', { value: '' }, 'All sets'), SETS.map(s => h('option', { value: s.id, selected: s.id === setFilter }, s.id)));
      const rows = st.preps.filter(p => !setFilter || p.set === setFilter).sort((a, b) => (b.saved || '').localeCompare(a.saved || ''));
      content = h('div', {}, h('div', { class: 'field', style: { marginBottom: '8px' } }, h('label', {}, 'Show'), sel),
        rows.length ? h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, 'Name'), h('th', {}, 'Set'), h('th', {}, 'Saved'), h('th', {}))),
          h('tbody', {}, rows.map(p => h('tr', {}, h('td', {}, p.name), h('td', {}, p.set), h('td', {}, (p.saved || '').slice(0, 10)),
            h('td', { style: { textAlign: 'right', whiteSpace: 'nowrap' } },
              h('button', { class: 'btn small', onClick: async () => {
                if (ctx.prep.questions.length && ctx.prep.id !== p.id && !(await confirmBox({ title: 'Open this prep?', message: [`This replaces “${ctx.prep.name}” on screen with “${p.name}”.`, 'Your current prep is saved to History first.'], confirmLabel: 'Open' }))) return;
                if (ctx.prep.id !== p.id && ctx.dirty) { const cur = JSON.parse(JSON.stringify(ctx.prep)); cur.saved = new Date().toISOString(); const i = st.preps.findIndex(x => x.id === cur.id); if (i >= 0) st.preps[i] = cur; else if (cur.questions.length) st.preps.push(cur); }
                ctx.prep = JSON.parse(JSON.stringify(p)); ctx.ui.afterLoad && ctx.ui.afterLoad(); m.close(); } }, 'Open'), ' ',
              h('button', { class: 'btn small danger', onClick: async () => { if (!(await confirmBox({ title: 'Delete this saved prep?', message: `“${p.name}” will be removed from History. This cannot be undone.`, confirmLabel: 'Delete', danger: true }))) return; st.preps = st.preps.filter(x => x.id !== p.id); ctx.save(); draw(); } }, 'Delete')))))) : h('div', { class: 'empty' }, 'Nothing saved for this set yet. Preps are saved when you press Save or print.'));
    } else {
      const rows = st.presets;
      content = rows.length ? h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, 'Preset'), h('th', {}, 'Set'), h('th', {}))),
        h('tbody', {}, rows.map(p => h('tr', {}, h('td', {}, p.name), h('td', {}, p.set), h('td', { style: { textAlign: 'right' } }, h('button', { class: 'btn small danger', onClick: async () => { if (!(await confirmBox({ title: 'Delete this preset?', message: `The preset “${p.name}” will be removed. This cannot be undone.`, confirmLabel: 'Delete', danger: true }))) return; st.presets = st.presets.filter(x => x.id !== p.id); ctx.save(); draw(); ctx.hooks.toolbar(); } }, 'Delete')))))) : h('div', { class: 'empty' }, 'You have not saved any presets yet. Build a prep, then use + ▸ Save as preset.');
    }
    setKids(area, top, content);
  };
  draw();
  const m = modal({ title: 'History and presets', body: area, footer: [h('span', { class: 'hint', style: { marginRight: 'auto' } }, 'All your preps and presets live in one history file you can download and share.'), h('button', { class: 'btn', onClick: () => m.close() }, 'Close')] });
}

export function openSavePreset() {
  const prep = ctx.prep;
  const name = h('input', { type: 'text', value: `${prep.set} preset`, style: { width: '100%' } });
  const m = modal({ title: 'Save as preset', narrow: true, body: h('div', {},
    h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'A preset keeps the type of each question, your pools and ticks, the marks and working space, and the time and rubric for this set. Starter presets cannot be overwritten, so give yours its own name.'),
    h('div', { class: 'kv' }, h('label', {}, 'Name'), name)),
  footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), h('button', { class: 'btn primary', onClick: () => {
    const nm = name.value.trim(); if (!nm) return;
    const slotDef = (s) => {
      const base = s.def.mode === 'pool' ? { mode: 'pool', label: s.def.label, candidates: s.def.candidates.map(c => ({ ...c })) } : { mode: 'fixed', pick: s.def.pick || s.pick };
      base.marks = s.marks.slice(); base.lines = s.lines.slice();
      return base;
    };
    const preset = { id: 'user-' + P.uid(), set: prep.set, name: nm, minutes: prep.minutes, rubricText: prep.rubricText, questions: prep.questions.map(q => q.slots.map(slotDef)), created: new Date().toISOString() };
    ctx.store.presets.push(preset); prep.presetId = preset.id; ctx.save(); m.close(); toast('Preset saved.'); ctx.hooks.toolbar();
  } }, 'Save preset')] });
  setTimeout(() => name.select(), 30);
}
