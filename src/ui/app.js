import { h, $, showMenu, toast, setKids, download, confirmBox } from './dom.js';
import { ctx } from './state.js';
import { loadStore, saveStoreSoon, exportText, importText } from '../data/store.js';
import { SETS, setById, defaultRubric } from '../data/sets.js';
import { suggestName } from '../data/naming.js';
import { STARTER_PRESETS } from '../data/presets.js';
import * as P from '../data/prep.js';
import * as FL from '../data/filelink.js';
import { setHistory } from '../data/fresh.js';
import { buildLayout, buildAnswerPages, DEFAULT_LAYOUT, FLOORS } from '../layout/layout.js';
import { renderBuilder } from './builder.js';
import { openHistory, openSavePreset } from './dialogs.js';
import { totalMarks } from '../layout/compose.js';

const store = loadStore();
ctx.store = store;
ctx.layout = { ...DEFAULT_LAYOUT, ...(store.settings.layout || {}) };
ctx.save = () => saveStoreSoon(store);
setHistory(() => store.preps);

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
  ctx.dirty = false; ctx.ui.savedTo = 'browser'; ctx.save(); ctx.hooks.status();
  if (!quiet) toast(`Saved “${prep.name}” in this browser.`);
}
const saveMode = () => store.settings.saveMode || 'browser';
const printMode = () => store.settings.printMode || 'q';
// Save: always keeps the browser copy; 'file' also writes the linked JSON file (asking for one the first time)
async function doSave(kind = saveMode()) {
  savePrep(true);
  store.settings.saveMode = kind;
  if (kind === 'file') {
    try {
      const how = await saveToFile();
      ctx.ui.savedTo = how;
      toast(how === 'file' ? `Saved to ${linkedName || 'the JSON file'}.` : 'This browser cannot keep a file linked, so a JSON copy was downloaded.', 4000);
    } catch (e) {
      if (e && e.name === 'AbortError') toast('Saved in this browser. No file was chosen.', 4000);
      else toast(`Saved in this browser, but the file was not updated: ${e.message}`, 6000);
    }
  } else toast(`Saved “${ctx.prep.name}” in this browser.`);
  ctx.save(); renderToolbar();
  if (ctx.ui.tab === 'history') renderSidebar();
}
let linkedName = '';
async function refreshLinked() { try { const hd = FL.supported() ? await FL.getLinked() : null; linkedName = hd ? hd.name : ''; } catch (e) { linkedName = ''; } }
async function saveToFile() {
  if (!FL.supported()) { download(`PMU history ${new Date().toISOString().slice(0, 10)}.json`, exportText(store)); return 'download'; }
  let hd = await FL.getLinked();
  if (!hd) {
    hd = await FL.linkNew();
    try { const old = await (await hd.getFile()).text(); if (old.trim()) importText(store, old); } catch (e) { /* new or unreadable file: just write ours */ }
  }
  await FL.writeLinked(hd, exportText(store));
  linkedName = hd.name;
  return 'file';
}
function saveMenu(anchor) {
  showMenu(anchor, [
    { label: 'Save in browser', sub: 'Kept on this computer automatically', checked: saveMode() === 'browser', onClick: () => doSave('browser') },
    { label: linkedName ? `Save to JSON file` : 'Save to JSON file…', sub: linkedName ? `Updates ${linkedName}` : 'Choose where to keep your history file', checked: saveMode() === 'file', onClick: () => doSave('file') },
    ...(linkedName ? [{ label: 'Use a different JSON file…', onClick: async () => { await FL.unlink(); linkedName = ''; doSave('file'); } }] : []),
    { sep: true }, { note: 'The Save button repeats whichever of these you used last.' },
  ]);
}
// Ask before anything that swaps the prep on screen for a different one
async function confirmReplace(title, message, label) {
  const prep = ctx.prep;
  if (!prep || !prep.questions.length) return true;
  return confirmBox({ title, message: [message, `“${prep.name}” is saved to History first, so you can open it again from there.`], confirmLabel: label });
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
function afterLoad() { ctx.ui.sel = null; ctx.store.current = ctx.prep; ctx.resetHistory(); ctx.commit({ toolbar: true }); ctx.dirty = false; ctx.hooks.status(); ctx.save(); }
ctx.ui.afterLoad = () => { ctx.ui.sel = null; ctx.resetHistory(); ctx.commit({ toolbar: true }); ctx.dirty = false; ctx.hooks.status(); };

// ---------- top toolbar ----------
const toolbar = h('div', { class: 'toolbar' });
const saveStat = h('span', { class: 'savestat' });
const SAVED_TEXT = { browser: 'Saved in browser', file: 'Saved to JSON file', download: 'JSON file downloaded' };
const ICON_UNDO = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5.2 3 2.8 5.5 5.2 8M3 5.5h6a4 4 0 0 1 0 8H6"/></svg>';
const ICON_REDO = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.8 3l2.4 2.5L10.8 8M13 5.5H7a4 4 0 0 0 0 8h3"/></svg>';
const undoBtn = h('button', { class: 'iconbtn', 'aria-label': 'Undo', html: ICON_UNDO, onClick: () => ctx.undo() });
const redoBtn = h('button', { class: 'iconbtn', 'aria-label': 'Redo', html: ICON_REDO, onClick: () => ctx.redo() });
const syncUndo = () => { undoBtn.disabled = !ctx.canUndo(); redoBtn.disabled = !ctx.canRedo(); undoBtn.title = 'Undo (Ctrl+Z)'; redoBtn.title = 'Redo (Ctrl+Y)'; };
document.addEventListener('keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
  const t = e.target, k = e.key.toLowerCase();
  if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;   // leave the browser's own text undo alone
  if (document.querySelector('.scrim')) return;
  if (k === 'z' && !e.shiftKey) { e.preventDefault(); ctx.undo(); }
  else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); ctx.redo(); }
});
ctx.hooks.status = () => { syncUndo(); saveStat.textContent = ctx.dirty ? 'Unsaved changes' : (SAVED_TEXT[ctx.ui.savedTo] || SAVED_TEXT.browser); saveStat.classList.toggle('dirty', !!ctx.dirty); };
function renderToolbar() {
  const prep = ctx.prep;
  const nameIn = h('input', { type: 'text', class: 'namebox', value: prep.name, 'aria-label': 'Prep name', onInput: (e) => { prep.name = e.target.value; prep.nameAuto = false; ctx.commit({ builder: false }); } });
  const seg = (items) => h('div', { class: 'seg', role: 'radiogroup', 'aria-label': 'Print style' }, items.map(([val, label]) => h('button', { role: 'radio', 'aria-checked': ctx.layout.mode === val, onClick: () => { ctx.layout.mode = val; ctx.commit({ toolbar: true, dirty: false }); } }, label)));
  setKids(toolbar,
    h('button', { class: 'iconbtn hamburger', 'aria-label': 'Options', 'aria-pressed': !!ctx.ui.sidebar, title: ctx.ui.sidebar ? 'Hide the options panel' : 'Show the options panel', onClick: toggleSidebar },
      h('span', { html: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 5h12M3 9h12M3 13h12"/></svg>' })),
    h('img', { class: 'applogo', src: 'logo.svg', alt: 'PMU | Prep Maths Universe', title: 'PMU | Prep Maths Universe' }),
    h('button', { class: 'btn', 'data-menu-anchor': '', onClick: (e) => newMenu(e.currentTarget) }, 'New ▾'),
    h('div', { class: 'field' }, h('label', {}, 'Name'), nameIn),
    h('span', { class: 'sp' }),
    saveStat,
    h('span', { class: 'undoredo' }, undoBtn, redoBtn),
    h('span', { class: 'splitbtn' },
      h('button', { class: 'btn', onClick: () => doSave(), title: saveMode() === 'file' ? 'Save to the JSON file (and in this browser)' : 'Save in this browser' }, 'Save'),
      h('button', { class: 'btn arrow', 'aria-label': 'Save options', onClick: (e) => saveMenu(e.currentTarget) }, '▾')),
    h('span', { class: 'divider' }),
    seg([['qo', 'Prep style'], ['aos', 'Exam style']]),
    h('span', { class: 'splitbtn' },
      h('button', { class: 'btn primary printbtn', onClick: () => doPrint(), title: PRINT_LABEL[printMode()] }, 'Print'),
      h('button', { class: 'btn primary arrow', 'aria-label': 'Print options', onClick: (e) => printMenu(e.currentTarget) }, '▾')));
  ctx.hooks.status();
}
function newMenu(anchor) {
  const prep = ctx.prep;
  showMenu(anchor, [
    { label: 'New blank prep', onClick: async () => { if (await confirmReplace('Start a blank prep?', `This replaces “${prep.name}” on screen with an empty prep.`, 'Start blank prep')) blankFor(prep.set); } },
    { label: 'New random prep', onClick: async () => { if (await confirmReplace('Start a random prep?', `This replaces “${prep.name}” on screen with a randomly chosen prep.`, 'Make random prep')) randomFor(prep.set); } },
  ]);
}
function toggleSidebar() {
  ctx.ui.sidebar = !ctx.ui.sidebar; store.settings.sidebar = ctx.ui.sidebar;
  applyWidths(); renderToolbar(); ctx.save(); relayout();
}

// ---------- printing ----------
const PRINT_LABEL = { q: 'Print questions', a: 'Print answers', both: 'Print questions + answers' };
function printMenu(anchor) {
  showMenu(anchor, [
    { label: 'Questions only', checked: printMode() === 'q', onClick: () => doPrint('q') },
    { label: 'Answers only', checked: printMode() === 'a', onClick: () => doPrint('a') },
    { label: 'Questions and answers', sub: 'Answers follow the questions in one PDF', checked: printMode() === 'both', onClick: () => doPrint('both') },
    { sep: true }, { note: 'In the print window choose Save as PDF, A4, margins “None”, scale 100%, and headers and footers off.' },
  ]);
}
function doPrint(kind = printMode()) {
  store.settings.printMode = kind; ctx.save();
  savePrep(true); renderToolbar();
  const t = document.title;
  const restore = () => { document.body.classList.remove('printing-answers', 'printing-both'); document.title = t; window.removeEventListener('afterprint', restore); };
  if (kind === 'q') { document.title = ctx.prep.name; window.print(); document.title = t; return; }
  $('#print-answers').innerHTML = buildAnswerPages(ctx.prep, ctx.katex, ctx.layout).join('');
  document.body.classList.add(kind === 'a' ? 'printing-answers' : 'printing-both');
  document.title = kind === 'a' ? `${ctx.prep.name} – Answers` : ctx.prep.name;
  window.addEventListener('afterprint', restore);
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
  const setSel = h('select', { 'aria-label': 'Set', onChange: async (e) => {
    const v = e.target.value;
    if (await confirmReplace(`Switch to ${v}?`, `This replaces “${prep.name}” on screen with a new ${v} prep.`, 'Switch set')) useSet(v); else renderSidebar();
  } }, SETS.map(s => h('option', { value: s.id, selected: s.id === prep.set }, s.id)));
  const presetSel = h('select', { 'aria-label': 'Preset', onChange: async (e) => {
    const v = e.target.value; if (!v) return;
    const nm = (findPreset(v) || {}).name || 'this preset';
    if (await confirmReplace('Use this preset?', `This replaces “${prep.name}” on screen with a new prep from “${nm}”.`, 'Use preset')) useSet(prep.set, v); else renderSidebar();
  } },
    h('option', { value: '' }, presets.length ? 'Choose a preset…' : 'No preset for this set yet'),
    presets.map(p => h('option', { value: p.id, selected: p.id === prep.presetId }, p.name + (p.starter ? '' : ' ★'))));
  setKids(el,
    h('label', { class: 'fl' }, 'Set', setSel),
    h('label', { class: 'fl' }, 'Preset', presetSel),
    h('div', { class: 'hint' }, 'Choosing a set or preset starts a new prep from it.'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn', onClick: async () => { if (await confirmReplace('Start again from this preset?', `This replaces “${prep.name}” on screen with a fresh prep from the preset.`, 'Start again')) useSet(prep.set, prep.presetId || undefined); } }, 'Start again from this preset')),
    h('hr'),
    h('div', { class: 'stack' },
      h('button', { class: 'btn', onClick: openSavePreset }, 'Save this prep as a preset…')));
}
function tabRubric(el) {
  const prep = ctx.prep;
  const rub = h('textarea', { rows: 5, onInput: (e) => { prep.rubricText = e.target.value; store.settings.rubrics[prep.set] = e.target.value; ctx.commit({ builder: false }); } }, prep.rubricText);
  setKids(el,
    h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: prep.rubricOn, onChange: (e) => { prep.rubricOn = e.target.checked; ctx.commit({ builder: false }); } }), ' Show the rubric line under the title'),
    h('label', { class: 'fl' }, 'Rubric wording', rub),
    h('div', { class: 'hint' }, `Your wording is remembered for ${prep.set}, so new preps in this set start with it. The line is off until you tick the box.`),
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
    h('details', {}, h('summary', {}, 'Logo'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: !!L.logo, onChange: (e) => { L.logo = e.target.checked; ctx.commit({ builder: false, dirty: false }); } }), ' Show the logo at the top right of the title')),
    h('details', {}, h('summary', {}, 'Page breaks'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: L.splitParts, onChange: (e) => { L.splitParts = e.target.checked; ctx.commit({ builder: false, dirty: false }); } }), ' Allow a question with several parts to continue on the next page'),
      h('div', { class: 'floor' }, 'Off by default: a question stays on one page. Parts are never cut in half.')),
    h('div', { style: { marginTop: '12px' } }, h('button', { class: 'btn small', onClick: () => { Object.assign(ctx.layout, { ...DEFAULT_LAYOUT, mode: ctx.layout.mode }); renderSidebar(); ctx.commit({ builder: false, dirty: false }); } }, 'Reset layout')));
}
function tabHistory(el) {
  const linkBox = h('div', { class: 'linkbox' });
  const drawLink = async () => {
    await refreshLinked();
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
      h('button', { class: 'btn small', onClick: () => download(`PMU history ${new Date().toISOString().slice(0, 10)}.json`, exportText(store)) }, 'Download a copy'),
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

const SIDE_PX = 300, SPLIT_W = 8, DEFAULT_BW = 520;
const sideW = () => (ctx.ui.sidebar ? SIDE_PX : 0);
function builderWidth() {
  const w = store.settings.builderW || DEFAULT_BW;
  return Math.max(340, Math.min(w, window.innerWidth - sideW() - SPLIT_W - 300));
}
function applyWidths() { sideEl.style.display = ctx.ui.sidebar ? '' : 'none'; main.style.gridTemplateColumns = `${sideW()}px ${builderWidth()}px ${SPLIT_W}px minmax(0,1fr)`; }
splitEl.addEventListener('pointerdown', (e) => {
  e.preventDefault(); splitEl.setPointerCapture(e.pointerId); splitEl.classList.add('drag'); document.body.classList.add('resizing');
  const move = (ev) => { store.settings.builderW = Math.round(ev.clientX - sideW() - SPLIT_W / 2); applyWidths(); relayout(); };
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
const fitMode = () => store.settings.fitMode || 'w';
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
function setFit(m) { store.settings.fitMode = m; ctx.ui.zoom = 'fit'; ctx.save(); relayout(); }
const zoomBar = h('span', { class: 'zoombar' });
const fitBar = h('span', { class: 'zoombar' });
function drawZoomBar() {
  setKids(zoomBar,
    h('button', { class: 'iconbtn', title: 'Zoom out (Ctrl + scroll down)', onClick: () => setZoom(zoomNow() / 1.15) }, '−'),
    h('button', { class: 'zoompct', title: 'Click for 100%', onClick: () => setZoom(1) }, `${Math.round(zoomNow() * 100)}%`),
    h('button', { class: 'iconbtn', title: 'Zoom in (Ctrl + scroll up)', onClick: () => setZoom(zoomNow() * 1.15) }, '+'));
  setKids(fitBar,
    h('button', { class: 'btn small', 'data-menu-anchor': '', title: 'Fit the page in the window', onClick: (e) => showMenu(e.currentTarget, [
      { label: 'Fit width', checked: fitMode() === 'w', onClick: () => setFit('w') },
      { label: 'Fit height', sub: 'Shows a whole page at once', checked: fitMode() === 'h', onClick: () => setFit('h') }]) }, 'Fit ▾'));
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
      fitZoom = fitMode() === 'h'
        ? Math.min(1.5, Math.max(0.2, (previewEl.clientHeight - pvTop.offsetHeight - 36) / (297 * MM)))
        : Math.min(1.5, Math.max(0.2, (previewEl.clientWidth - 40) / (210 * MM)));
      pagesEl.style.setProperty('--zoom', zoomNow().toFixed(4));
      const tm = totalMarks(lay.qs);
      drawZoomBar();
      setKids(pvTop,
        zoomBar,
        ...(lay.info.warnings || []).map(w => h('span', { class: 'warn' }, w.text)),
        lay.info.overfull ? h('span', { class: 'warn' }, 'Too much for the page at 10 pt: it has spilled over.') : null,
        h('span', { class: 'pvinfo' }),
        fitBar);
    } catch (e) { console.error(e); setKids(pvTop, h('span', { class: 'err' }, 'Layout error: ' + e.message)); }
  });
}
ctx.hooks.toolbar = () => { renderToolbar(); renderSidebar(); };
ctx.ui.sidebar = false;
ctx.hooks.builder = () => renderBuilder(builderEl);
ctx.hooks.preview = relayout;

// ---------- start ----------
function init() {
  const app = $('#app');
  app.replaceChildren(toolbar, main);
  const last = store.settings.lastSet;
  if (store.current && store.current.questions && store.current.set && setById[store.current.set]) { ctx.prep = store.current; ctx.dirty = false; }
  else useSet(setById[last] ? last : 'Y7 Additional');
  if (ctx.prep.rubricOn === undefined) ctx.prep.rubricOn = false;
  ctx.resetHistory();
  ctx.ui.sidebar = !!store.settings.sidebar;
  applyWidths(); renderToolbar(); renderSidebar(); renderBuilder(builderEl); relayout();
  refreshLinked().then(renderToolbar);
  document.fonts && document.fonts.ready.then(() => relayout());
  window.addEventListener('resize', () => { applyWidths(); relayout(); });
  window.addEventListener('beforeunload', () => { try { localStorage.setItem('prepCreator.v1', JSON.stringify(store)); } catch (e) { /* ignore */ } });
}
init();
window.__prep = ctx;     // handy for testing
