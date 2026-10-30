import { h, modal, toast, download, setKids, confirmBox } from './dom.js';
import { ctx } from './state.js';
import { openPicker } from './picker.js';
import { openQuickChooser } from './quick.js';
import { upgradePool } from '../data/pools.js';
import { mathToHTML } from '../layout/render.js';
import { typeById, entries } from '../core/engine.js';
import * as P from '../data/prep.js';
import { presetFromPrep, sharedFor, setSlotPool } from '../data/presetdraft.js';
import { STARTER_PRESETS } from '../data/presets.js';
import { exportText, importText } from '../data/store.js';
import { SETS, setById } from '../data/sets.js';

// "type:variant" or "type:*" -> readable name
export function pickName(pick) {
  const [tid, vid] = pick.split(':'); const t = typeById[tid]; if (!t) return pick + ' (missing)';
  if (vid === '*') return `${t.topic} › ${t.type}`;
  const v = t.variants.find(x => x.id === vid); return `${t.topic} › ${t.type}${v ? ' › ' + v.label : ''}`;
}

// A pool's topics, levels and options: the simple picker opened on its Pool tab
export function openPoolDialog(slot, qi, si) {
  openQuickChooser({ title: `Pool for question ${qi + 1}`, confirmLabel: 'Save pool', def: upgradePool(slot.def), tabs: ['pool'],
    shared: slot.def.link ? null : sharedFor(ctx.prep),
    note: slot.def.link ? 'This part is linked with other parts of the question: they share one topic. Topics you add or remove here are added or removed on the linked parts too; the options you tick are for this part only.' : null,
    onDone: (d) => { setSlotPool(ctx.prep, slot, d); ctx.commit(); } });
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
                if (ctx.prep.draft) { if (!(await confirmBox({ title: 'Leave the preset editor?', message: [`This closes the preset “${ctx.prep.name || 'unnamed'}” without saving it, and opens “${p.name}”.`], confirmLabel: 'Open' }))) return; ctx.prep.draft = null; ctx.dirty = false; }
                else if (ctx.prep.questions.length && ctx.prep.id !== p.id && !(await confirmBox({ title: 'Open this prep?', message: [`This replaces “${ctx.prep.name}” on screen with “${p.name}”.`, 'Your current prep is saved to History first.'], confirmLabel: 'Open' }))) return;
                if (ctx.prep.id !== p.id && ctx.dirty && !ctx.prep.draft) { const cur = JSON.parse(JSON.stringify(ctx.prep)); cur.saved = new Date().toISOString(); const i = st.preps.findIndex(x => x.id === cur.id); if (i >= 0) st.preps[i] = cur; else if (cur.questions.length) st.preps.push(cur); }
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
    h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'A preset keeps how each question is chosen (a topic and level, a range, a pool, or one exact question), the marks and working space, and the time and rubric for this set. Starter presets cannot be overwritten, so give yours its own name.'),
    h('div', { class: 'kv' }, h('label', {}, 'Name'), name)),
  footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), h('button', { class: 'btn primary', onClick: () => {
    const nm = name.value.trim(); if (!nm) return;
    const preset = presetFromPrep(prep, { name: nm });
    ctx.store.presets.push(preset); prep.presetId = preset.id; ctx.save(); m.close(); toast('Preset saved.'); ctx.hooks.toolbar();
  } }, 'Save preset')] });
  setTimeout(() => name.select(), 30);
}
