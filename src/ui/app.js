import { h, $, showMenu, toast, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { loadStore, saveStoreSoon } from '../data/store.js';
import { SETS, setById, defaultRubric } from '../data/sets.js';
import { suggestName } from '../data/naming.js';
import { STARTER_PRESETS } from '../data/presets.js';
import * as P from '../data/prep.js';
import { buildLayout, buildAnswerPages, DEFAULT_LAYOUT, FLOORS } from '../layout/layout.js';
import { renderBuilder } from './builder.js';
import { openHistory, openSavePreset } from './dialogs.js';
import { totalMarks, composePrep } from '../layout/compose.js';

const store = loadStore();
ctx.store = store;
ctx.layout = { ...DEFAULT_LAYOUT, ...(store.settings.layout || {}) };
ctx.save = () => saveStoreSoon(store);

const presetsFor = (setId) => [...STARTER_PRESETS.filter(p => p.set === setId), ...store.presets.filter(p => p.set === setId)];
const findPreset = (id) => STARTER_PRESETS.find(p => p.id === id) || store.presets.find(p => p.id === id);

function withTicks(preset) {
  const t = store.ticks[preset.id]; if (!t) return preset;
  const copy = JSON.parse(JSON.stringify(preset));
  copy.questions.forEach((defs, qi) => defs.forEach((d, si) => { const saved = t[`${qi}.${si}`]; if (saved && d.mode === 'pool') d.candidates = saved.map(c => ({ ...c })); }));
  return copy;
}
function finishNew(prep) {
  const set = setById[prep.set];
  prep.rubricText = store.settings.rubrics[prep.set] || defaultRubric(prep.minutes);
  prep.name = suggestName(set, store.preps);
  prep.nameAuto = true;
  return prep;
}
function savePrep(quiet = false) {
  const prep = ctx.prep; prep.saved = new Date().toISOString();
  const i = store.preps.findIndex(p => p.id === prep.id);
  const copy = JSON.parse(JSON.stringify(prep));
  if (i >= 0) store.preps[i] = copy; else store.preps.push(copy);
  ctx.dirty = false; ctx.save(); if (!quiet) toast(`Saved “${prep.name}”.`);
}
function autosavePrevious() { if (ctx.prep && ctx.dirty && ctx.prep.questions.length) savePrep(true); }
function useSet(setId, presetId = undefined) {
  autosavePrevious();
  const set = setById[setId];
  store.settings.lastSet = setId;
  const list = presetsFor(setId);
  const preset = presetId ? findPreset(presetId) : list[0];
  if (preset) ctx.prep = finishNew(P.prepFromPreset(withTicks(preset), setId, 'x'));
  else ctx.prep = finishNew(P.newPrep({ set: setId, name: 'x', minutes: set.minutes }));
  ctx.prep.presetId = preset ? preset.id : null;
  ctx.dirty = false; afterLoad();
}
function randomFor(setId) {
  autosavePrevious();
  ctx.prep = finishNew(P.randomPrep(setId, 'x')); ctx.dirty = false; afterLoad();
}
function afterLoad() { ctx.store.current = ctx.prep; ctx.commit({ toolbar: true }); ctx.dirty = false; ctx.save(); }
ctx.ui.afterLoad = () => { ctx.commit({ toolbar: true }); ctx.dirty = false; };

// ---------- toolbar ----------
const toolbar = h('div', { class: 'toolbar' });
function renderToolbar() {
  const prep = ctx.prep;
  const presets = presetsFor(prep.set);
  const setSel = h('select', { 'aria-label': 'Set', onChange: (e) => useSet(e.target.value) }, SETS.map(s => h('option', { value: s.id, selected: s.id === prep.set }, s.id)));
  const nameIn = h('input', { type: 'text', class: 'namebox', value: prep.name, 'aria-label': 'Prep name', onInput: (e) => { prep.name = e.target.value; prep.nameAuto = false; ctx.commit({ builder: false }); } });
  const minIn = h('input', { type: 'number', min: 5, max: 90, step: 5, value: prep.minutes, style: { width: '56px' }, 'aria-label': 'Minutes', onChange: (e) => {
    const old = defaultRubric(prep.minutes); prep.minutes = Number(e.target.value) || prep.minutes;
    if (prep.rubricText === old) prep.rubricText = defaultRubric(prep.minutes);
    ctx.commit({ toolbar: true });
  } });
  const presetSel = h('select', { 'aria-label': 'Preset', onChange: (e) => { if (e.target.value) useSet(prep.set, e.target.value); } },
    h('option', { value: '' }, presets.length ? 'Preset…' : 'No preset for this set'),
    presets.map(p => h('option', { value: p.id, selected: p.id === prep.presetId }, p.name + (p.starter ? '' : ' ★'))));
  const modeSw = h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Print mode' },
    h('button', { role: 'radio', 'aria-checked': ctx.layout.mode === 'qo', onClick: () => { ctx.layout.mode = 'qo'; ctx.commit({ toolbar: true }); } }, 'Questions only'),
    h('button', { role: 'radio', 'aria-checked': ctx.layout.mode === 'aos', onClick: () => { ctx.layout.mode = 'aos'; ctx.commit({ toolbar: true }); } }, 'Answer on sheet'));
  setKids(toolbar, 
    h('span', { class: 'brand' }, 'Prep Creator'),
    h('div', { class: 'field' }, h('label', {}, 'Set'), setSel),
    h('div', { class: 'field' }, h('label', {}, 'Name'), nameIn),
    h('div', { class: 'field' }, h('label', {}, 'Time'), minIn, h('label', {}, 'min')),
    h('div', { class: 'field' }, presetSel),
    h('button', { class: 'btn', 'aria-label': 'More', onClick: (e) => plusMenu(e.currentTarget) }, '+ New ▾'),
    h('span', { class: 'sp' }), modeSw, h('span', { class: 'sp' }),
    h('button', { class: 'btn', 'aria-pressed': ctx.ui.sidebar, onClick: () => { ctx.ui.sidebar = !ctx.ui.sidebar; renderMainShell(); ctx.hooks.preview(); renderToolbar(); } }, 'Layout'),
    h('button', { class: 'btn', onClick: openHistory }, 'History'),
    h('button', { class: 'btn', onClick: () => savePrep() }, 'Save'),
    h('button', { class: 'btn primary', 'data-menu-anchor': '', onClick: (e) => togglePrintPanel(e.currentTarget) }, 'Print…'));
}
function plusMenu(anchor) {
  const prep = ctx.prep;
  showMenu(anchor, [
    { heading: 'Start a new prep' },
    { label: 'From the preset', onClick: () => useSet(prep.set, prep.presetId || undefined) },
    { label: 'Random prep', onClick: () => randomFor(prep.set) },
    { label: 'Blank prep', onClick: () => { autosavePrevious(); ctx.prep = finishNew(P.newPrep({ set: prep.set, name: 'x', minutes: prep.minutes })); ctx.prep.presetId = null; afterLoad(); } },
    { sep: true },
    { heading: 'Presets' },
    { label: 'Save this prep as a preset…', onClick: openSavePreset },
    { sep: true },
    { label: 'Suggest a new name', onClick: () => { prep.name = suggestName(setById[prep.set], store.preps); prep.nameAuto = true; ctx.commit({ toolbar: true, builder: false }); } },
  ]);
}

// ---------- print panel ----------
function togglePrintPanel(anchor) {
  if (ctx.ui.pop) { ctx.ui.pop.remove(); ctx.ui.pop = null; return; }
  const prep = ctx.prep, L = ctx.layout;
  const rub = h('textarea', { rows: 3, onInput: (e) => { prep.rubricText = e.target.value; store.settings.rubrics[prep.set] = e.target.value; ctx.commit({ builder: false }); } }, prep.rubricText);
  const pop = h('div', { class: 'pop' },
    h('h3', {}, 'Output'),
    h('div', { class: 'line' }, h('input', { type: 'checkbox', id: 'rb', checked: prep.rubricOn, onChange: (e) => { prep.rubricOn = e.target.checked; ctx.commit({ builder: false }); } }), h('label', { for: 'rb' }, 'Show the rubric line under the title')),
    rub,
    L.mode === 'aos' ? h('div', { class: 'line' }, h('input', { type: 'checkbox', id: 'nm', checked: L.nameLine, onChange: (e) => { L.nameLine = e.target.checked; ctx.commit({ builder: false }); } }), h('label', { for: 'nm' }, 'Name line on the title row')) : null,
    h('div', { class: 'hint' }, 'In the print window choose A4, margins “None”, scale 100%, and “Save as PDF”.'),
    h('div', { class: 'line', style: { marginTop: '12px' } },
      h('button', { class: 'btn primary', onClick: () => { closePop(); printQuestions(); } }, L.mode === 'aos' ? 'Print answer-on-sheet PDF' : 'Print questions PDF'),
      h('button', { class: 'btn', onClick: () => { closePop(); printAnswers(); } }, 'Print answers PDF')));
  document.body.append(pop); ctx.ui.pop = pop;
  const close = (e) => { if (!pop.contains(e.target) && !e.target.closest('[data-menu-anchor]')) { closePop(); } };
  setTimeout(() => document.addEventListener('mousedown', close, { once: true }), 0);
}
function closePop() { if (ctx.ui.pop) { ctx.ui.pop.remove(); ctx.ui.pop = null; } }
function printQuestions() {
  savePrep(true);
  const t = document.title; document.title = ctx.prep.name;
  window.print(); document.title = t;
}
function printAnswers() {
  savePrep(true);
  const pages = buildAnswerPages(ctx.prep, ctx.katex, ctx.layout);
  $('#print-answers').innerHTML = pages.join('');
  document.body.classList.add('printing-answers');
  const t = document.title; document.title = `${ctx.prep.name} – Answers`;
  const done = () => { document.body.classList.remove('printing-answers'); document.title = t; window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}

// ---------- sidebar (layout) ----------
function renderSidebar() {
  const L = ctx.layout;
  const slider = (label, key, min, max, step, unit, hint) => {
    const val = h('span', {}, `${L[key]}${unit}`);
    const inp = h('input', { type: 'range', min, max, step, value: L[key], onInput: (e) => { L[key] = Number(e.target.value); val.textContent = `${L[key]}${unit}`; ctx.commit({ builder: false }); } });
    return h('div', {}, h('div', { class: 'row' }, h('label', {}, label), val), inp, hint ? h('div', { class: 'floor' }, hint) : null);
  };
  const fontVal = h('span', {}, L.fontPt === 'auto' ? 'Auto' : `${L.fontPt} pt`);
  const fontSl = h('input', { type: 'range', min: FLOORS.pt, max: 14, step: 0.5, value: L.fontPt === 'auto' ? 11 : L.fontPt, disabled: L.fontPt === 'auto', onInput: (e) => { L.fontPt = Number(e.target.value); fontVal.textContent = `${L.fontPt} pt`; ctx.commit({ builder: false }); } });
  const side = h('div', { class: 'side' },
    h('details', { open: true }, h('summary', {}, 'Text'),
      h('div', { class: 'row' }, h('label', {}, 'Size'), fontVal),
      h('div', { class: 'row' }, h('label', {}, h('input', { type: 'checkbox', checked: L.fontPt === 'auto', onChange: (e) => { L.fontPt = e.target.checked ? 'auto' : 11; ctx.commit({ builder: false }); renderMainShell(); } }), ' Choose the size for me'), h('span')),
      fontSl, h('div', { class: 'floor' }, `Never smaller than ${FLOORS.pt} pt.`),
      slider('Line spacing', 'lh', 1.2, 1.9, 0.05, '', '')),
    h('details', {}, h('summary', {}, 'Page margins'),
      slider('Left and right', 'mx', FLOORS.margin, 30, 1, ' mm', `Never less than ${FLOORS.margin} mm.`),
      slider('Top', 'mt', FLOORS.margin, 30, 1, ' mm', ''),
      slider('Bottom', 'mb', FLOORS.margin, 30, 1, ' mm', '')),
    h('details', {}, h('summary', {}, 'Working space (answer on sheet)'),
      slider('One ruled line', 'lineMM', 6, 10, 0.5, ' mm', 'Height of one line of working space.'),
      slider('Squash by up to', 'squash', 0.7, 1, 0.01, '', 'Smallest share of the space you set (0.85 = 85%).'),
      slider('Stretch by up to', 'stretch', 1, 1.6, 0.01, '', 'Largest share of the space you set (1.3 = 130%).')),
    h('details', {}, h('summary', {}, 'Page breaks'),
      h('div', { class: 'row' }, h('label', {}, h('input', { type: 'checkbox', checked: L.splitParts, onChange: (e) => { L.splitParts = e.target.checked; ctx.commit({ builder: false }); } }), ' Allow a question with several parts to continue on the next page'), h('span')),
      h('div', { class: 'floor' }, 'Off by default: a question stays on one page. Parts are never cut in half.')),
    h('div', { style: { marginTop: '10px' } }, h('button', { class: 'btn small', onClick: () => { Object.assign(ctx.layout, { ...DEFAULT_LAYOUT, mode: ctx.layout.mode }); renderMainShell(); ctx.commit({ builder: false }); } }, 'Reset layout')));
  return side;
}

// ---------- main shell ----------
const main = h('div', { class: 'main nosb' });
const builderEl = h('div', { class: 'builder' });
const previewEl = h('div', { class: 'preview' });
const pvTop = h('div', { class: 'pv-top' });
const pagesEl = h('div', { id: 'pages' });
previewEl.append(pvTop, pagesEl);
function renderMainShell() {
  main.className = 'main' + (ctx.ui.sidebar ? '' : ' nosb');
  setKids(main, ...(ctx.ui.sidebar ? [renderSidebar()] : []), builderEl, previewEl);
}

let pending = false;
function relayout() {
  if (pending) return; pending = true;
  requestAnimationFrame(() => {
    pending = false;
    try {
      const lay = buildLayout(ctx.prep, ctx.layout, ctx.katex);
      pagesEl.innerHTML = lay.pages.join('');
      const avail = previewEl.clientWidth - 24;
      const zoom = Math.min(1, avail / (210 * 96 / 25.4));
      pagesEl.style.setProperty('--zoom', zoom.toFixed(3));
      const qs = lay.qs; const tm = totalMarks(qs);
      setKids(pvTop, h('span', {}, `${ctx.layout.mode === 'aos' ? 'Answer on sheet' : 'Questions only'} · ${lay.info.text} · ${tm} marks`),
        ...(lay.info.warnings || []).map(w => h('span', { class: 'warn' }, w.text)),
        lay.info.overfull ? h('span', { class: 'warn' }, 'Too much for the page at 10 pt: it has spilled over.') : null);
    } catch (e) { console.error(e); setKids(pvTop, h('span', { class: 'err' }, 'Layout error: ' + e.message)); }
  });
}
ctx.hooks.toolbar = renderToolbar;
ctx.hooks.builder = () => renderBuilder(builderEl);
ctx.hooks.preview = relayout;

// ---------- start ----------
function init() {
  const app = $('#app');
  app.replaceChildren(toolbar, main);
  const last = store.settings.lastSet;
  if (store.current && store.current.questions && store.current.set && setById[store.current.set]) { ctx.prep = store.current; ctx.dirty = false; }
  else useSet(setById[last] ? last : 'Y7 Additional');
  renderToolbar(); renderMainShell(); renderBuilder(builderEl); relayout();
  document.fonts && document.fonts.ready.then(() => relayout());
  window.addEventListener('resize', relayout);
  window.addEventListener('beforeunload', () => { try { localStorage.setItem('prepCreator.v1', JSON.stringify(store)); } catch (e) { /* ignore */ } });
}
init();
window.__prep = ctx;     // handy for testing
