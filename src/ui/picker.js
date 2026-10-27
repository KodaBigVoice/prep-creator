// The question picker: global search, then three typable, scrollable columns (Topic > Type > Options), with a live preview.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { entries, typeById, generate, defaultFlags } from '../core/engine.js';
import { newSeed } from '../core/rng.js';
import { mathToHTML } from '../layout/render.js';

const ALL = entries().map(e => ({ ...e, lv: [...new Set(e.levels.map(l => (l === 'Foundation' ? 'Core' : l)))] }));
const byKey = Object.fromEntries(ALL.map(e => [e.key, e]));
const LEVEL_MODES = [['both', 'Core and Additional'], ['Core', 'Core only'], ['Additional', 'Additional only']];
const tokens = (s) => s.toLowerCase().split(/\s+/).filter(Boolean);

export function openPicker({ title = 'Choose a question', current = null, confirmLabel = 'Use this question', onPick, extraButtons = [] }) {
  const st = { q: '', level: 'both', topic: null, type: null, opt: null, f: { topic: '', type: '', opt: '' }, seed: newSeed(), flags: null, showAns: true, entryKey: null };
  const T = (s) => mathToHTML(s, ctx.katex);
  const inLevel = (e) => st.level === 'both' || e.lv.includes(st.level);
  const lvAll = () => ALL.filter(inLevel);

  // ----- the three columns -----
  const cols = {};
  const mkCol = (id, label) => {
    const input = h('input', { type: 'text', placeholder: `Type to find a ${label.toLowerCase()}…`, 'aria-label': label, onInput: () => { st.f[id] = input.value; drawCol(id); } });
    const list = h('div', { class: 'pk-col-list', role: 'listbox', 'aria-label': label });
    cols[id] = { input, list, el: h('div', { class: 'pk-col' }, h('div', { class: 'pk-col-h' }, label), input, list) };
  };
  mkCol('topic', 'Topic'); mkCol('type', 'Type'); mkCol('opt', 'Options');

  const topicItems = () => [...new Set(lvAll().map(e => e.topic))].sort((a, b) => a.localeCompare(b)).map(t => ({ id: t, name: t }));
  // types: easiest first within a topic; options: easiest first within a type. A number shows the position when the list belongs to one parent.
  const typeItems = () => {
    const seen = new Map();
    for (const e of lvAll()) if ((!st.topic || e.topic === st.topic) && !seen.has(e.typeId)) seen.set(e.typeId, { id: e.typeId, name: e.type, sub: st.topic ? '' : e.topic, td: e.td, ti: e.ti, topic: e.topic });
    const list = [...seen.values()].sort((a, b) => (st.topic ? (a.td - b.td || a.ti - b.ti) : (a.topic.localeCompare(b.topic) || a.td - b.td || a.ti - b.ti)));
    if (st.topic) list.forEach((it, i) => { it.rank = i + 1; });
    return list;
  };
  const optItems = () => {
    const list = lvAll().filter(e => (!st.topic || e.topic === st.topic) && (!st.type || e.typeId === st.type))
      .sort((a, b) => (st.type ? (a.d - b.d || a.vi - b.vi) : (a.topic.localeCompare(b.topic) || a.td - b.td || a.ti - b.ti || a.d - b.d || a.vi - b.vi)))
      .map(e => ({ id: e.key, name: e.label, sub: st.type ? '' : e.type, multipart: e.multipart }));
    if (st.type) list.forEach((it, i) => { it.rank = i + 1; });
    return list;
  };
  const itemsOf = { topic: topicItems, type: typeItems, opt: optItems };

  function drawCol(id) {
    const { list } = cols[id];
    const toks = tokens(st.f[id]);
    const items = itemsOf[id]().filter(it => toks.every(t => (it.name + ' ' + (it.sub || '')).toLowerCase().includes(t)));
    const cur = st[id];
    const mk = (it, any) => h('div', { class: 'pk-it' + ((any ? cur === null : cur === it.id) ? ' sel' : ''), role: 'option', 'aria-selected': any ? cur === null : cur === it.id, 'data-id': any ? '' : it.id, onClick: () => choose(id, any ? null : it.id) },
      h('span', { class: 'rk' }, !any && it.rank ? String(it.rank) : ''), h('span', { class: 'nm' }, any ? 'Any' : it.name), !any && it.multipart ? h('span', { class: 'badge' }, 'multipart') : null, !any && it.sub ? h('span', { class: 'sub' }, it.sub) : null);
    setKids(list, mk(null, true), ...items.map(it => mk(it, false)), items.length ? null : h('div', { class: 'pk-none' }, 'No match'));
  }
  const scrollSel = (id) => { const el = cols[id].list.querySelector('.pk-it.sel'); if (el) { const l = cols[id].list; l.scrollTop = Math.max(0, el.offsetTop - l.clientHeight / 2 + el.offsetHeight / 2); } };
  function drawAll(scroll = false) { ['topic', 'type', 'opt'].forEach(drawCol); if (scroll) ['topic', 'type', 'opt'].forEach(scrollSel); }

  function choose(id, val, { fromSearch = false } = {}) {
    if (id === 'topic') {
      st.topic = val;
      if (st.type && typeById[st.type].topic !== val && val) st.type = null;
      if (st.opt && val && byKey[st.opt].topic !== val) st.opt = null;
      st.f.type = ''; st.f.opt = ''; cols.type.input.value = ''; cols.opt.input.value = '';
    } else if (id === 'type') {
      st.type = val;
      if (val) { st.topic = typeById[val].topic; st.f.topic = ''; cols.topic.input.value = ''; }
      if (st.opt && val && byKey[st.opt].typeId !== val) st.opt = null;
      st.f.opt = ''; cols.opt.input.value = '';
    } else {
      st.opt = val;
      if (val) { const e = byKey[val]; st.type = e.typeId; st.topic = e.topic; st.f.topic = st.f.type = ''; cols.topic.input.value = cols.type.input.value = ''; }
    }
    st.seed = newSeed(); st.flags = null;
    drawAll(true); renderPreview();
  }
  const setFromKey = (key) => { const e = byKey[key]; if (!e) return; st.topic = e.topic; st.type = e.typeId; st.opt = e.key; st.f = { topic: '', type: '', opt: '' }; Object.values(cols).forEach(c => { c.input.value = ''; }); st.seed = newSeed(); st.flags = null; drawAll(true); renderPreview(); };

  // ----- global search -----
  const results = h('div', { class: 'pk-results' });
  const qIn = h('input', { type: 'text', placeholder: 'Search every question, e.g. overlap, ladder, 15%, simultaneous…', 'aria-label': 'Search', onInput: () => { st.q = qIn.value; drawResults(); } });
  function drawResults() {
    const toks = tokens(st.q);
    if (!toks.length) { results.style.display = 'none'; setKids(results); return; }
    results.style.display = '';
    const res = lvAll().filter(e => toks.every(t => e.hay.includes(t)));
    setKids(results,
      h('div', { class: 'pk-res-h' }, `${res.length} match${res.length === 1 ? '' : 'es'}`, h('button', { class: 'btn small ghost', onClick: () => { qIn.value = ''; st.q = ''; drawResults(); } }, 'Clear search')),
      ...(res.length ? res.slice(0, 80).map(e => h('div', { class: 'pk-item' + (e.key === st.opt ? ' sel' : ''), onClick: () => { setFromKey(e.key); drawResults(); }, onDblclick: use },
        h('div', { class: 'nm' }, e.label, e.multipart ? h('span', { class: 'badge' }, 'multipart') : null), h('div', { class: 'path' }, `${e.topic} › ${e.type}`))) : [h('div', { class: 'pk-none' }, 'Nothing matches. Try fewer words.')]));
  }

  // ----- level filter (hidden by default, set to both) -----
  const lvlSummary = h('summary', {}, 'Level: Core and Additional');
  const lvl = h('details', { class: 'pk-lvl' }, lvlSummary,
    h('div', { class: 'pk-lvl-in' }, LEVEL_MODES.map(([v, l]) => h('label', {}, h('input', { type: 'radio', name: 'pk-level', value: v, checked: v === 'both', onChange: () => {
      st.level = v; lvlSummary.textContent = 'Level: ' + l;
      if (st.opt && !inLevel(byKey[st.opt])) st.opt = null;
      if (st.type && !lvAll().some(e => e.typeId === st.type)) st.type = null;
      if (st.topic && !lvAll().some(e => e.topic === st.topic)) st.topic = null;
      drawAll(true); drawResults(); renderPreview();
    } }), ' ' + l))));

  // ----- preview -----
  const preview = h('div', { class: 'pk-preview' });
  const optsBox = h('div');
  const selLine = h('div', { class: 'pk-selline' });
  const katexTex = (t) => { try { return ctx.katex.renderToString(t, { throwOnError: false }); } catch (e) { return t; } };
  function previewEntry() {
    if (st.opt) return byKey[st.opt];
    const pool = lvAll().filter(e => (!st.topic || e.topic === st.topic) && (!st.type || e.typeId === st.type));
    return pool.length ? pool[st.seed % pool.length] : null;
  }
  function renderPreview() {
    const e = previewEntry(); st.entryKey = e ? e.key : null;
    if (!e) { setKids(preview, h('div', { class: 'hint' }, 'Nothing to show here.')); setKids(optsBox); setKids(selLine); return; }
    const t = typeById[e.typeId];
    const flags = st.flags || defaultFlags(t);
    setKids(selLine, h('b', {}, `${e.topic} › ${e.type} › ${e.label}`), st.opt ? null : h('span', { class: 'hint' }, '  (example: any option)'));
    let q;
    try { q = generate(e.key, st.seed, flags); } catch (err) { setKids(preview, h('div', { class: 'err' }, 'Could not make an example: ' + err.message)); return; }
    const verbs = q.parts.map(p => p.verb);
    const shared = !q.stem && q.parts.length > 1 && verbs[0] && verbs.every(v => v === verbs[0]);
    const lines = [];
    if (q.stem) lines.push(h('div', { html: T(q.stem) }));
    else if (shared) lines.push(h('div', {}, verbs[0] + ':'));
    q.parts.forEach((p, i) => {
      const text = (!q.stem && !shared && p.verb ? p.verb + ' ' : '') + p.body;
      lines.push(h('div', { style: { margin: '3px 0' } }, q.parts.length > 1 ? `(${'abcdefgh'[i]}) ` : '', h('span', { html: T(text) }), h('span', { class: 'hint' }, `  [${p.m} mark${p.m > 1 ? 's' : ''}]`), p.calc ? h('span', { class: 'badge' }, 'calculator') : null));
    });
    const ans = h('div', { class: 'ans' }, h('b', {}, 'Answer: '), q.parts.map((p, i) => h('span', { html: katexTex(p.a) + (i < q.parts.length - 1 ? ';&nbsp; ' : '') })));
    setKids(preview, ...lines, st.showAns ? ans : null,
      h('div', { class: 'addrow' }, h('button', { class: 'btn small', onClick: () => { st.seed = newSeed(); renderPreview(); } }, '↻ Another one'),
        h('label', { class: 'hint', style: { display: 'flex', gap: '4px', alignItems: 'center' } }, h('input', { type: 'checkbox', checked: st.showAns, onChange: (ev) => { st.showAns = ev.target.checked; renderPreview(); } }), 'show answer')));
    setKids(optsBox, t.integer ? h('details', { class: 'opts', open: true }, h('summary', {}, 'Question options'),
      h('div', { class: 'in' }, h('label', { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
        h('input', { type: 'checkbox', checked: flags.integer !== false, onChange: (ev) => { st.flags = { ...flags, integer: ev.target.checked }; renderPreview(); } }), 'Integer answers only'))) : null);
  }

  // what "use" hands back: the concrete example, plus the broader scope for pools
  function use() {
    if (!st.entryKey) return;
    const e = byKey[st.entryKey], t = typeById[e.typeId];
    let scope;
    if (st.opt) scope = [e.key];
    else if (st.type) scope = [`${st.type}:*`];
    else if (st.topic) scope = [...new Set(lvAll().filter(x => x.topic === st.topic).map(x => x.typeId))].map(id => `${id}:*`);
    else scope = [];
    m.close();
    onPick({ pick: e.key, fixedPick: (!st.opt && st.type) ? `${st.type}:*` : null, seed: st.seed, flags: st.flags && t.integer ? st.flags : null, scope });
  }

  const body = h('div', {},
    qIn, results,
    h('div', { class: 'pk-lvl-row' }, lvl),
    h('div', { class: 'picker' },
      h('div', { class: 'pk-cols' }, cols.topic.el, cols.type.el, cols.opt.el),
      h('div', {}, selLine, preview, optsBox)));
  const m = modal({
    title, body, wide: true,
    footer: [...extraButtons, h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), h('button', { class: 'btn primary', onClick: use }, confirmLabel)],
  });
  results.style.display = 'none';
  if (current && byKey[current]) setFromKey(current);
  else if (current && typeById[String(current).split(':')[0]]) { const t = typeById[String(current).split(':')[0]]; choose('type', t.id); }
  else { drawAll(); renderPreview(); }
  setTimeout(() => qIn.focus(), 30);
}
