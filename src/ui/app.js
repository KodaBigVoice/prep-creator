import { h, $, showMenu, toast, setKids, download } from './dom.js';
import { ctx } from './state.js';
import { loadStore, saveStoreSoon, exportText, importText } from '../data/store.js';
import { SETS, setById, defaultRubric } from '../data/sets.js';
import { suggestName } from '../data/naming.js';
import { STARTER_PRESETS } from '../data/presets.js';
import * as P from '../data/prep.js';
import * as FL from '../data/filelink.js';
import { buildLayout, buildAnswerPages, DEFAULT_LAYOUT, FLOORS } from '../layout/layout.js';
import { renderBuilder } from './builder.js';
import { openHistory, openSavePreset } from './dialogs.js';
import { totalMarks } from '../layout/compose.js';

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

// ---------- saving ----------
function savePrep(quiet = false) {
  const prep = ctx.prep; prep.saved = new Date().toISOString();
  const i = store.preps.findIndex(p => p.id === prep.id);
  const copy = JSON.parse(JSON.stringify(prep));
  if (i >= 0) store.preps[i] = copy; else store.preps.push(copy);
  ctx.dirty = false; ctx.save(); ctx.hooks.status();
  if (!quiet) toast(`Saved “${prep.name}”.`);
}
async function saveClicked() {
  savePrep(true);
  let hd = null; try { hd = FL.supported() ? await FL.getLinked() : null; } catch (e) { hd = null; }
  if (hd) {
    try { await FL.writeLinked(hd, exportText(store)); toast(`Saved “${ctx.prep.name}” and updated ${hd.name}.`); }
    catch (e) { toast(`Saved in this browser, but the file was not updated: ${e.message}`, 6000); }
  } else toast(`Saved “${ctx.prep.name}”.`);
  if (ctx.ui.tab === 'history') renderSidebar();
}
function autosavePrevious() { if (ctx.prep && ctx.dirty && ctx.prep.questions.length) savePrep(true); }

// ---------- starting a prep ----------
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
function randomFor(setId) { autosavePrevious(); ctx.prep = finishNew(P.randomPrep(setId, 'x')); ctx.dirty = false; afterLoad(); }
function blankFor(setId) { autosavePrevious(); ctx.prep = finishNew(P.newPrep({ set: setId, name: 'x', minutes: setById[setId].minutes })); ctx.prep.presetId = null; ctx.dirty = false; afterLoad(); }
function afterLoad() { ctx.ui.sel = null; ctx.store.current = ctx.prep; ctx.commit({ toolbar: true }); ctx.dirty = false; ctx.hooks.status(); ctx.save(); }
ctx.ui.afterLoad = () => { ctx.ui.sel = null; ctx.commit({ toolbar: true }); ctx.dirty = false; ctx.hooks.status(); };

// ---------- top toolbar ----------
const toolbar = h('div', { class: 'toolbar' });
const saveStat = h('span', { class: 'savestat' });
ctx.hooks.status = () => { saveStat.textContent = ctx.dirty ? 'Unsaved changes' : 'All changes saved'; saveStat.classList.toggle('dirty', !!ctx.dirty); };
function renderToolbar() {
  const prep = ctx.prep;
  const nameIn = h('input', { type: 'text', class: 'namebox', value: prep.name, 'aria-label': 'Prep name', onInput: (e) => { prep.name = e.target.value; prep.nameAuto = false; ctx.commit({ builder: false }); } });
  const seg = (items) => h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Print mode' }, items.map(([val, label]) => h('button', { role: 'radio', 'aria-checked': ctx.layout.mode === val, onClick: () => { ctx.layout.mode = val; ctx.commit({ toolbar: true, dirty: false }); } }, label)));
  setKids(toolbar,
    h('span', { class: 'brand' }, 'Prep Creator'),
    h('div', { class: 'field' }, h('label', {}, 'Name'), nameIn),
    seg([['qo', 'Questions only'], ['aos', 'Answer on sheet']]),
    h('span', { class: 'sp' }),
    saveStat,
    h('button', { class: 'btn', onClick: saveClicked, title: 'Save this prep (and update your linked file, if you have one)' }, 'Save'),
    h('span', { class: 'divider' }),
    h('button', { class: 'btn primary printbtn', 'data-menu-anchor': '', onClick: (e) => togglePrintPanel(e.currentTarget) }, 'Print…'));
  ctx.hooks.status();
}

// ---------- print panel ----------
function togglePrintPanel(anchor) {
  if (ctx.ui.pop) { closePop(); return; }
  const L = ctx.layout;
  const pop = h('div', { class: 'pop' },
    h('h3', {}, 'Print or save as PDF'),
    h('div', { class: 'line' }, h('button', { class: 'btn primary', onClick: () => { closePop(); printQuestions(); } }, L.mode === 'aos' ? 'Answer-on-sheet PDF' : 'Questions PDF'),
      h('button', { class: 'btn', onClick: () => { closePop(); printAnswers(); } }, 'Answers PDF')),
    h('div', { class: 'hint' }, 'In the print window choose Save as PDF, A4, margins “None”, scale 100%, and headers and footers off.'));
  document.body.append(pop); ctx.ui.pop = pop;
  const close = (e) => { if (!pop.contains(e.target) && !e.target.closest('[data-menu-anchor]')) closePop(); };
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

// ---------- options sidebar ----------
const sideEl = h('div', { class: 'side' });
const TABS = [['presets', 'Presets'], ['rubric', 'Rubric'], ['layout', 'Layout'], ['history', 'History']];
function renderSidebar() {
  const tab = ctx.ui.tab;
  const tabs = h('div', { class: 'tabs', role: 'tablist' }, TABS.map(([k, l]) => h('button', { role: 'tab', 'aria-selected': tab === k, onClick: () => { ctx.ui.tab = k; renderSidebar(); } }, l)));
  const body = h('div', { class: 'tabbody' });
  ({ presets: tabPresets, rubric: tabRubric, layout: tabLayout, history: tabHistory })[tab](body);
  setKids(sideEl, h('div', { class: 'side-h' }, 'Options'), tabs, body);
}
function tabPresets(el) {
  const prep = ctx.prep;
  const presets = presetsFor(prep.set);
  const setSel = h('select', { 'aria-label': 'Set', onChange: (e) => useSet(e.target.value) }, SETS.map(s => h('option', { value: s.id, selected: s.id === prep.set }, s.id)));
  const presetSel = h('select', { 'aria-label': 'Preset', onChange: (e) => { if (e.target.value) useSet(prep.set, e.target.value); } },
    h('option', { value: '' }, presets.length ? 'Choose a preset…' : 'No preset for this set yet'),
    presets.map(p => h('option', { value: p.id, selected: p.id === prep.presetId }, p.name + (p.starter ? '' : ' ★'))));
  setKids(el,
    h('label', { class: 'fl' }, 'Set', setSel),
    h('label', { class: 'fl' }, 'Preset', presetSel),
    h('div', { class: 'hint' }, 'Choosing a set or preset starts a new prep from it. Your current prep is saved first.'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn', onClick: () => useSet(prep.set, prep.presetId || undefined) }, 'Start again from this preset'),
      h('button', { class: 'btn', onClick: () => randomFor(prep.set) }, 'Random prep'),
      h('button', { class: 'btn', onClick: () => blankFor(prep.set) }, 'Blank prep')),
    h('hr'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn', onClick: openSavePreset }, 'Save this prep as a preset…'),
      h('button', { class: 'btn', onClick: () => { prep.name = suggestName(setById[prep.set], store.preps); prep.nameAuto = true; ctx.commit({ toolbar: true, builder: false }); } }, 'Suggest a new name')));
}
function tabRubric(el) {
  const prep = ctx.prep;
  const rub = h('textarea', { rows: 5, onInput: (e) => { prep.rubricText = e.target.value; store.settings.rubrics[prep.set] = e.target.value; ctx.commit({ builder: false }); } }, prep.rubricText);
  const minIn = h('input', { type: 'number', min: 5, max: 90, step: 5, value: prep.minutes, style: { width: '64px' }, 'aria-label': 'Minutes', onChange: (e) => {
    const old = defaultRubric(prep.minutes); prep.minutes = Number(e.target.value) || prep.minutes;
    if (prep.rubricText === old || !prep.rubricText) { prep.rubricText = defaultRubric(prep.minutes); rub.value = prep.rubricText; store.settings.rubrics[prep.set] = prep.rubricText; }
    ctx.commit({ builder: false });
  } });
  setKids(el,
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: prep.rubricOn, onChange: (e) => { prep.rubricOn = e.target.checked; ctx.commit({ builder: false }); } }), ' Show the rubric line under the title'),
    h('div', { class: 'fl' }, 'Time for the prep', h('span', {}, minIn, ' minutes')),
    h('label', { class: 'fl' }, 'Rubric wording', rub),
    h('div', { class: 'hint' }, `Saved for ${prep.set}: new preps in this set start with it. Changing the minutes updates the wording if you haven't rewritten it.`),
    h('button', { class: 'btn small', onClick: () => { prep.rubricText = defaultRubric(prep.minutes); delete store.settings.rubrics[prep.set]; ctx.commit({ builder: false }); renderSidebar(); } }, 'Reset to the standard wording'));
}
function tabLayout(el) {
  const L = ctx.layout;
  const slider = (label, key, min, max, step, unit, hint) => {
    const val = h('span', { class: 'val' }, `${L[key]}${unit}`);
    const inp = h('input', { type: 'range', min, max, step, value: L[key], onInput: (e) => { L[key] = Number(e.target.value); val.textContent = `${L[key]}${unit}`; ctx.commit({ builder: false, dirty: false }); } });
    return h('div', {}, h('div', { class: 'row' }, h('label', {}, label), val), inp, hint ? h('div', { class: 'floor' }, hint) : null);
  };
  const fontVal = h('span', { class: 'val' }, L.fontPt === 'auto' ? 'Auto' : `${L.fontPt} pt`);
  const fontSl = h('input', { type: 'range', min: FLOORS.pt, max: 14, step: 0.5, value: L.fontPt === 'auto' ? 11 : L.fontPt, disabled: L.fontPt === 'auto', onInput: (e) => { L.fontPt = Number(e.target.value); fontVal.textContent = `${L.fontPt} pt`; ctx.commit({ builder: false, dirty: false }); } });
  setKids(el,
    h('details', { open: true }, h('summary', {}, 'Text'),
      h('div', { class: 'row' }, h('label', {}, 'Size'), fontVal),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: L.fontPt === 'auto', onChange: (e) => { L.fontPt = e.target.checked ? 'auto' : 11; ctx.commit({ builder: false, dirty: false }); renderSidebar(); } }), ' Choose the size for me'),
      fontSl, h('div', { class: 'floor' }, `Never smaller than ${FLOORS.pt} pt.`),
      slider('Line spacing', 'lh', 1.2, 1.9, 0.05, '', '')),
    h('details', {}, h('summary', {}, 'Page margins'),
      slider('Left and right', 'mx', FLOORS.margin, 30, 1, ' mm', `Never less than ${FLOORS.margin} mm.`),
      slider('Top', 'mt', FLOORS.margin, 30, 1, ' mm', ''),
      slider('Bottom', 'mb', FLOORS.margin, 30, 1, ' mm', '')),
    h('details', {}, h('summary', {}, 'Working space (answer on sheet)'),
      slider('One ruled line', 'lineMM', 6, 10, 0.5, ' mm', 'Height of one line of working space.'),
      slider('Squash by up to', 'squash', 0.7, 1, 0.01, '', 'Smallest share of the space you set (0.85 = 85%).'),
      slider('Stretch by up to', 'stretch', 1, 1.6, 0.01, '', 'Largest share of the space you set (1.3 = 130%).'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: L.nameLine, onChange: (e) => { L.nameLine = e.target.checked; ctx.commit({ builder: false, dirty: false }); } }), ' Name line on the title row')),
    h('details', {}, h('summary', {}, 'Page breaks'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: L.splitParts, onChange: (e) => { L.splitParts = e.target.checked; ctx.commit({ builder: false, dirty: false }); } }), ' Allow a question with several parts to continue on the next page'),
      h('div', { class: 'floor' }, 'Off by default: a question stays on one page. Parts are never cut in half.')),
    h('div', { style: { marginTop: '12px' } }, h('button', { class: 'btn small', onClick: () => { Object.assign(ctx.layout, { ...DEFAULT_LAYOUT, mode: ctx.layout.mode }); renderSidebar(); ctx.commit({ builder: false, dirty: false }); } }, 'Reset layout')));
}
function tabHistory(el) {
  const linkBox = h('div', { class: 'linkbox' });
  const drawLink = async () => {
    if (!FL.supported()) { setKids(linkBox, h('div', { class: 'hint' }, 'This browser cannot keep a file up to date automatically. Use Download and Open below.')); return; }
    const hd = await FL.getLinked();
    if (hd) {
      setKids(linkBox, h('div', {}, 'Linked file: ', h('b', {}, hd.name)),
        h('div', { class: 'hint' }, 'Save writes your preps and presets into this file each time. After restarting the browser it may ask permission once.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn small', onClick: async () => { try { await FL.writeLinked(hd, exportText(store)); toast(`Updated ${hd.name}.`); } catch (e) { toast(e.message, 5000); } } }, 'Update the file now'),
          h('button', { class: 'btn small', onClick: async () => { try { const t = await FL.readLinked(hd); importText(store, t); ctx.save(); toast('Loaded from the file.'); ctx.hooks.toolbar(); } catch (e) { toast(e.message, 5000); } } }, 'Load from the file'),
          h('button', { class: 'btn small ghost', onClick: async () => { await FL.unlink(); drawLink(); } }, 'Unlink')));
    } else {
      setKids(linkBox, h('div', { class: 'hint' }, 'Link a file on this computer (for example in OneDrive) and Save will keep it up to date. Do this once.'),
        h('div', { class: 'stack' },
          h('button', { class: 'btn', onClick: async () => { try { const hd2 = await FL.linkNew(); await FL.writeLinked(hd2, exportText(store)); toast(`Linked ${hd2.name}.`); drawLink(); } catch (e) { if (e.name !== 'AbortError') toast(e.message, 5000); } } }, 'Create a new history file…'),
          h('button', { class: 'btn', onClick: async () => { try { const { hd: hd2, text } = await FL.linkExisting(); importText(store, text); ctx.save(); toast(`Linked ${hd2.name} and loaded it.`); ctx.hooks.toolbar(); drawLink(); } catch (e) { if (e.name !== 'AbortError') toast(e.message, 5000); } } }, 'Use an existing history file…')));
    }
  };
  drawLink();
  setKids(el,
    h('div', { class: 'hint' }, 'Your preps, presets and settings are kept in this browser automatically. A history file is a copy you can keep, back up or use on another computer.'),
    h('div', { class: 'stack' }, h('button', { class: 'btn', onClick: openHistory }, 'Browse saved preps and presets…')),
    h('hr'),
    h('div', { class: 'sec' }, 'History file'),
    linkBox,
    h('hr'),
    h('div', { class: 'sec' }, 'Copy to or from a file'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn small', onClick: () => download(`Prep Creator history ${new Date().toISOString().slice(0, 10)}.json`, exportText(store)) }, 'Download a copy'),
      h('label', { class: 'btn small' }, 'Open a file…', h('input', { type: 'file', accept: '.json,application/json', style: { display: 'none' }, onChange: async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try { importText(store, await f.text()); ctx.save(); toast('History file loaded.'); ctx.hooks.toolbar(); } catch (err) { toast('Could not read that file: ' + err.message, 5000); }
      } }))));
}

// ---------- main area: sidebar | builder | divider | preview ----------
const main = h('div', { class: 'main' });
const builderEl = h('div', { class: 'builder' });
const splitEl = h('div', { class: 'split', role: 'separator', 'aria-orientation': 'vertical', title: 'Drag to resize (double-click to reset)', tabindex: 0 });
const previewEl = h('div', { class: 'preview' });
const pvTop = h('div', { class: 'pv-top' });
const pagesEl = h('div', { id: 'pages' });
previewEl.append(pvTop, pagesEl);

const SIDE_W = 300, SPLIT_W = 8, DEFAULT_BW = 520;
function builderWidth() {
  const w = store.settings.builderW || DEFAULT_BW;
  return Math.max(340, Math.min(w, window.innerWidth - SIDE_W - SPLIT_W - 300));
}
function applyWidths() { main.style.gridTemplateColumns = `${SIDE_W}px ${builderWidth()}px ${SPLIT_W}px minmax(0,1fr)`; }
splitEl.addEventListener('pointerdown', (e) => {
  e.preventDefault(); splitEl.setPointerCapture(e.pointerId); splitEl.classList.add('drag'); document.body.classList.add('resizing');
  const move = (ev) => { store.settings.builderW = Math.round(ev.clientX - SIDE_W - SPLIT_W / 2); applyWidths(); relayout(); };
  const up = () => { splitEl.releasePointerCapture(e.pointerId); splitEl.classList.remove('drag'); document.body.classList.remove('resizing'); splitEl.removeEventListener('pointermove', move); splitEl.removeEventListener('pointerup', up); ctx.save(); };
  splitEl.addEventListener('pointermove', move); splitEl.addEventListener('pointerup', up);
});
splitEl.addEventListener('dblclick', () => { delete store.settings.builderW; applyWidths(); relayout(); ctx.save(); });
splitEl.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { store.settings.builderW = builderWidth() + (e.key === 'ArrowLeft' ? -24 : 24); applyWidths(); relayout(); ctx.save(); e.preventDefault(); }
});
setKids(main, sideEl, builderEl, splitEl, previewEl);

// ---------- preview zoom ----------
const MM = 96 / 25.4;
let fitZoom = 1;
const zoomNow = () => (ctx.ui.zoom === 'fit' ? fitZoom : ctx.ui.zoom);
function setZoom(z, cx = null, cy = null) {
  const old = zoomNow();
  z = Math.max(0.25, Math.min(3, z));
  if (Math.abs(z - fitZoom) < 0.015) { ctx.ui.zoom = 'fit'; z = fitZoom; } else ctx.ui.zoom = Math.round(z * 1000) / 1000;
  const barH = pvTop.offsetHeight;
  if (cx === null) { cx = previewEl.clientWidth / 2; cy = previewEl.clientHeight / 2; }
  const r = z / old, sl = previewEl.scrollLeft, st = previewEl.scrollTop;
  pagesEl.style.setProperty('--zoom', z.toFixed(4));
  previewEl.scrollLeft = (sl + cx) * r - cx;
  previewEl.scrollTop = (st + cy - barH) * r + barH - cy;
  drawZoomBar();
}
const zoomBar = h('span', { class: 'zoombar' });
function drawZoomBar() {
  setKids(zoomBar,
    h('button', { class: 'iconbtn', title: 'Zoom out (Ctrl + scroll down)', onClick: () => setZoom(zoomNow() / 1.15) }, '−'),
    h('button', { class: 'zoompct', title: 'Click for 100%', onClick: () => setZoom(1) }, `${Math.round(zoomNow() * 100)}%`),
    h('button', { class: 'iconbtn', title: 'Zoom in (Ctrl + scroll up)', onClick: () => setZoom(zoomNow() * 1.15) }, '+'),
    h('button', { class: 'btn small', title: 'Fit the page to the width', onClick: () => { ctx.ui.zoom = 'fit'; relayout(); } }, 'Fit width'));
}
previewEl.addEventListener('wheel', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  e.preventDefault();
  const rect = previewEl.getBoundingClientRect();
  const k = e.deltaMode === 1 ? 0.05 : 0.0025;
  setZoom(zoomNow() * Math.exp(-e.deltaY * k), e.clientX - rect.left, e.clientY - rect.top);
}, { passive: false });
let overPreview = false;
previewEl.addEventListener('pointerenter', () => { overPreview = true; });
previewEl.addEventListener('pointerleave', () => { overPreview = false; });
window.addEventListener('keydown', (e) => {
  if (!overPreview || !(e.ctrlKey || e.metaKey)) return;
  if (e.key === '=' || e.key === '+') { e.preventDefault(); setZoom(zoomNow() * 1.15); }
  else if (e.key === '-') { e.preventDefault(); setZoom(zoomNow() / 1.15); }
  else if (e.key === '0') { e.preventDefault(); ctx.ui.zoom = 'fit'; relayout(); }
});

let pending = false;
function relayout() {
  if (pending) return; pending = true;
  requestAnimationFrame(() => {
    pending = false;
    try {
      const lay = buildLayout(ctx.prep, ctx.layout, ctx.katex);
      pagesEl.innerHTML = lay.pages.join('');
      fitZoom = Math.min(1.5, Math.max(0.2, (previewEl.clientWidth - 40) / (210 * MM)));
      pagesEl.style.setProperty('--zoom', zoomNow().toFixed(4));
      const tm = totalMarks(lay.qs);
      drawZoomBar();
      setKids(pvTop, h('span', { class: 'pvinfo' }, `${ctx.layout.mode === 'aos' ? 'Answer on sheet' : 'Questions only'} · ${lay.info.text} · ${tm} marks`),
        ...(lay.info.warnings || []).map(w => h('span', { class: 'warn' }, w.text)),
        lay.info.overfull ? h('span', { class: 'warn' }, 'Too much for the page at 10 pt: it has spilled over.') : null,
        zoomBar);
    } catch (e) { console.error(e); setKids(pvTop, h('span', { class: 'err' }, 'Layout error: ' + e.message)); }
  });
}
ctx.hooks.toolbar = () => { renderToolbar(); renderSidebar(); };
ctx.hooks.builder = () => renderBuilder(builderEl);
ctx.hooks.preview = relayout;

// ---------- start ----------
function init() {
  const app = $('#app');
  app.replaceChildren(toolbar, main);
  const last = store.settings.lastSet;
  if (store.current && store.current.questions && store.current.set && setById[store.current.set]) { ctx.prep = store.current; ctx.dirty = false; }
  else useSet(setById[last] ? last : 'Y7 Additional');
  if (ctx.prep.rubricOn === undefined) ctx.prep.rubricOn = true;
  applyWidths(); renderToolbar(); renderSidebar(); renderBuilder(builderEl); relayout();
  document.fonts && document.fonts.ready.then(() => relayout());
  window.addEventListener('resize', () => { applyWidths(); relayout(); });
  window.addEventListener('beforeunload', () => { try { localStorage.setItem('prepCreator.v1', JSON.stringify(store)); } catch (e) { /* ignore */ } });
}
init();
window.__prep = ctx;     // handy for testing
