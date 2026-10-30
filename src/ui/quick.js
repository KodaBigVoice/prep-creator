// Choosing questions by description: pick topic(s) and a level, and the app finds a question that fits.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { generate } from '../core/engine.js';
import { newSeed } from '../core/rng.js';
import { mathToHTML } from '../layout/render.js';
import { LEVELS, topicList, levelCounts, resolve, ladder, isRange } from '../data/query.js';
import { setById } from '../data/sets.js';
import { poolChoices, poolByTopic, choiceOptions, newChoice, toggleLevel, toggleOption } from '../data/pools.js';

// ---- pinned topics (kept in the browser settings and in the history file) ----
export const pinnedTopics = () => (ctx.store.settings.pinned ||= []);
export function togglePin(topic) {
  const p = pinnedTopics(), i = p.indexOf(topic);
  if (i >= 0) p.splice(i, 1); else p.push(topic);
  ctx.save();
}
// pinned topics first (in the order they were pinned), then the rest alphabetically
export function sortedTopics() {
  const pins = pinnedTopics(), all = topicList();
  const pinned = pins.map(n => all.find(t => t.name === n)).filter(Boolean);
  return [...pinned.map(t => ({ ...t, pinned: true })), ...all.filter(t => !pins.includes(t.name))];
}

export const STAR = '<svg width="15" height="15" viewBox="0 0 16 16" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"><path d="M8 1.8l1.9 4 4.3.5-3.2 3 .9 4.3L8 11.4l-3.9 2.2.9-4.3-3.2-3 4.3-.5z"/></svg>';

// The four level buttons with how many options each has. `onPick(level)`; unavailable levels are greyed out.
export function levelButtons(topics, current, onPick) {
  const counts = levelCounts(topics);
  return h('div', { class: 'lvbtns', role: 'radiogroup', 'aria-label': 'Difficulty level' },
    LEVELS.map(l => h('button', { class: 'lvbtn', role: 'radio', 'aria-checked': current === l, disabled: !counts[l] || undefined,
      title: counts[l] ? `${counts[l]} option${counts[l] === 1 ? '' : 's'}` : 'Nothing at this level in this topic: the nearest level is used', onClick: () => onPick(l) },
      l, h('small', {}, counts[l] ? String(counts[l]) : '–'))));
}
export const fallNote = (def) => { const r = resolve(def); return r.fell && r.level ? `Nothing at ${def.level} here, so ${r.level} questions are used.` : null; };

// Two sliders over the difficulty ladder of some topics. get() gives {lo, hi} (difficulty numbers). onInput fires while dragging.
export function rangeControl(topics, lo, hi, onInput) {
  const L = ladder(topics), n = L.length;
  let i = lo == null ? 0 : Math.max(0, L.findIndex(e => e.d >= lo - 1e-9));
  let j = hi == null ? n - 1 : n - 1; if (hi != null) while (j > 0 && L[j].d > hi + 1e-9) j--;
  const mk = (v, label) => h('input', { type: 'range', min: 0, max: Math.max(1, n - 1), step: 1, value: v, 'aria-label': label });
  const a = mk(i, 'Easiest question to include'), b = mk(j, 'Hardest question to include');
  const band = h('span', { class: 'rband' }), info = h('div', { class: 'rinfo' });
  const pct = (k) => (n > 1 ? (k / (n - 1)) * 100 : 0);
  const get = () => ({ lo: L[+a.value].d, hi: L[+b.value].d });
  const draw = () => {
    band.style.left = pct(+a.value) + '%'; band.style.width = (pct(+b.value) - pct(+a.value)) + '%';
    const cnt = resolve({ topics, level: null, ...get() }).list.length;
    info.replaceChildren(...[`Easiest: ${L[+a.value].type} › ${L[+a.value].label}`, `Hardest: ${L[+b.value].type} › ${L[+b.value].label}`, `${cnt} option${cnt === 1 ? '' : 's'} in this range`].map(t => h('div', {}, t)));
  };
  const clamp = (moved) => { if (+a.value > +b.value) { if (moved === a) a.value = b.value; else b.value = a.value; } draw(); onInput && onInput(); };
  a.addEventListener('input', () => clamp(a)); b.addEventListener('input', () => clamp(b));
  draw();
  const el = h('div', { class: 'rwrap' }, h('div', { class: 'rtrack' }, h('span', { class: 'rbase' }), band, a, b), h('div', { class: 'rends' }, h('span', {}, 'easier'), h('span', {}, 'harder')), info);
  return { el, get, empty: !n };
}

// The level a new choice starts at: the level of the set being made
const setLevel = () => { const st = ctx.prep && setById[ctx.prep.set]; return st ? st.level : 'Core'; };

// ---- one pool choice: a topic, its level chips, and (folded away) a tick box for every option ----
function choiceCard(c, { onChange, onRemove, open, onToggleOpen }) {
  const all = ladder([c.topic]), counts = levelCounts([c.topic]);
  const inc = new Set(choiceOptions(c).map(e => e.key));
  const chips = h('div', { class: 'lvbtns' }, LEVELS.map(l => {
    const at = all.filter(e => e.levels.includes(l)), on = (c.levels || []).includes(l);
    const part = on && at.some(e => !inc.has(e.key));
    return h('button', { class: 'lvbtn' + (part ? ' part' : ''), role: 'checkbox', 'aria-checked': String(on), disabled: !counts[l] || undefined,
      title: !counts[l] ? 'Nothing at this level in this topic' : on ? `Untick all ${l} options` : `Tick all ${l} options`, onClick: () => { toggleLevel(c, l); onChange(); } },
      l, h('small', {}, counts[l] ? (on ? `${at.filter(e => inc.has(e.key)).length}/${counts[l]}` : String(counts[l])) : '–'));
  }));
  let last = -1;
  const rows = open ? h('div', { class: 'pc-opts' }, all.map((e, i) => h('label', { class: 'pc-opt' },
    h('input', { type: 'checkbox', checked: inc.has(e.key), onClick: (ev) => {
      const want = ev.target.checked;
      if (ev.shiftKey && last >= 0) { const [x, y] = [Math.min(last, i), Math.max(last, i)]; for (let k = x; k <= y; k++) toggleOption(c, all[k].key, want); } else toggleOption(c, e.key, want);
      last = i; onChange();
    } }),
    h('span', { class: 'pc-nm' }, `${e.type} › ${e.label}`), h('small', {}, e.levels.join(' · '))))) : null;
  return h('div', { class: 'pc' + (c.enabled === false ? ' off' : '') },
    h('div', { class: 'pc-h' },
      h('input', { type: 'checkbox', checked: c.enabled !== false, title: 'Include this topic in the pool', 'aria-label': 'Include ' + c.topic, onChange: (e) => { c.enabled = e.target.checked; onChange(); } }),
      h('b', {}, c.topic), h('small', {}, `${inc.size} of ${all.length} options`), h('span', { style: { flex: 1 } }),
      h('button', { class: 'linkbtn', onClick: onToggleOpen }, open ? 'Hide options' : 'Pick options…'),
      h('button', { class: 'iconbtn', title: 'Remove this topic from the pool', 'aria-label': 'Remove ' + c.topic, onClick: onRemove }, '✕')),
    chips, rows);
}

// The simple picker: choose topic(s), then a level (Quick), a stretch of the ladder (Range), or per-topic levels and options (Pool).
// `def` is an existing query or pool (to change it) or null. onBrowse (optional) adds a button that swaps to the full list of questions.
export function openQuickChooser({ title = 'Add a question', confirmLabel = 'Use this question', def = null, onDone, onBrowse = null, browseLabel = 'Browse all questions', tabs = ['quick', 'range', 'pool'], shared = null, note: panelNote = null }) {
  const isPoolDef = def && def.mode === 'pool';
  const choices = isPoolDef ? JSON.parse(JSON.stringify(poolChoices(def))) : [];
  const st = {
    topics: new Set(isPoolDef ? choices.map(c => c.topic) : def ? (def.topics || []) : []),
    level: def && def.level ? def.level : setLevel(), tab: isPoolDef ? 'pool' : def && isRange(def) ? 'range' : 'quick',
    lo: def ? def.lo : null, hi: def ? def.hi : null, choices, open: new Set(), q: '', seed: newSeed(),
    poolId: shared && isPoolDef && def.poolId ? def.poolId : null, poolName: (def && def.label) || '', isNew: false, count: 1,
  };
  const T = (s) => mathToHTML(s, ctx.katex);
  const search = h('input', { type: 'text', placeholder: 'Find a topic…', 'aria-label': 'Find a topic', onInput: () => { st.q = search.value.toLowerCase(); drawTopics(); } });
  const list = h('div', { class: 'qk-topics', role: 'listbox', 'aria-label': 'Topics', 'aria-multiselectable': 'true' });
  const lvBox = h('div'), note = h('div', { class: 'hint' }), prev = h('div', { class: 'pk-preview qk-prev' });
  let rc = null;
  const TABS = { quick: ['Quick', 'A topic and a level'], range: ['Range', 'A stretch of the difficulty ladder'], pool: ['Pool', 'Several topics, each with its own levels and options; ⤮ moves to a different topic'] };
  const tabsEl = h('span', { class: 'seg', role: 'radiogroup', 'aria-label': 'How to choose' },
    tabs.map((id) => h('button', { role: 'radio', title: TABS[id][1], 'data-tab': id, onClick: () => { st.tab = id; st.seed = newSeed(); drawRest(); } }, TABS[id][0])));
  const poolDef = () => {
    const pid = shared ? st.poolId : (def && def.poolId);
    return { mode: 'pool', label: (shared && st.poolId ? st.poolName.trim() : (def && def.label)) || 'Pool', ...(pid ? { poolId: pid } : {}), choices: JSON.parse(JSON.stringify(st.choices)) };
  };
  const cur = () => (st.tab === 'range' && rc ? { mode: 'query', topics: [...st.topics], level: null, ...rc.get() } : st.tab === 'pool' ? poolDef() : { mode: 'query', topics: [...st.topics], level: st.level });

  function toggleTopic(name) {
    if (st.topics.has(name)) { st.topics.delete(name); st.choices = st.choices.filter(c => c.topic !== name); }
    else { st.topics.add(name); if (!st.choices.some(c => c.topic === name)) st.choices.push(newChoice(name, setLevel())); }
    st.lo = st.hi = null;
  }
  function drawTopics() {
    const items = sortedTopics().filter(t => !st.q || t.name.toLowerCase().includes(st.q));
    setKids(list, items.map(t => h('div', { class: 'qk-t' + (st.topics.has(t.name) ? ' on' : ''), role: 'option', 'aria-selected': st.topics.has(t.name), onClick: () => { toggleTopic(t.name); drawTopics(); drawRest(); } },
      h('span', { class: 'tick' }, st.topics.has(t.name) ? '✓' : ''), h('span', { class: 'nm' }, t.name), h('small', {}, `${t.n}`),
      h('button', { class: 'star' + (t.pinned ? ' on' : ''), title: t.pinned ? 'Unpin this topic' : 'Pin this topic to the top', 'aria-label': (t.pinned ? 'Unpin ' : 'Pin ') + t.name, html: STAR,
        onClick: (e) => { e.stopPropagation(); togglePin(t.name); const top = list.scrollTop; drawTopics(); list.scrollTop = top; } }))),
      items.length ? null : h('div', { class: 'pk-none' }, 'No topic matches'));
  }
  // Preset editor only: a pool can be shared, so several questions draw from it without repeating a topic
  const sharedBox = h('div', { class: 'pc-shared' });
  function drawShared() {
    if (!shared && panelNote && st.tab === 'pool') { setKids(sharedBox, h('div', { class: 'hint' }, panelNote)); return; }
    if (!shared || st.tab !== 'pool') { setKids(sharedBox); return; }
    const known = shared.pools.find(p => p.id === st.poolId);
    const sel = h('select', { 'aria-label': 'Shared pool', onChange: (e) => {
      const v = e.target.value;
      if (v === '') { st.poolId = null; st.isNew = false; }
      else if (v === '__new') { st.poolId = 'pool-' + Math.random().toString(36).slice(2, 9); st.isNew = true; st.poolName = `Pool ${shared.pools.length + 1}`; }
      else { const p = shared.pools.find(x => x.id === v); st.poolId = p.id; st.isNew = false; st.poolName = p.name; st.choices = JSON.parse(JSON.stringify(poolChoices({ choices: p.choices }))); st.topics = new Set(st.choices.map(c => c.topic)); drawTopics(); }
      st.seed = newSeed(); drawRest();
    } },
      h('option', { value: '', selected: !st.poolId }, 'Only this question'),
      shared.pools.map(p => h('option', { value: p.id, selected: p.id === st.poolId && !st.isNew }, `Shared pool: ${p.name}`)),
      h('option', { value: '__new', selected: st.isNew }, 'A new shared pool…'));
    setKids(sharedBox,
      h('label', { class: 'fl' }, 'Use this pool for', sel),
      st.poolId ? h('label', { class: 'fl' }, 'Pool name', h('input', { type: 'text', value: st.poolName, placeholder: 'e.g. Mixed skills', onInput: (e) => { st.poolName = e.target.value; } })) : null,
      st.poolId ? h('div', { class: 'hint' }, known || st.isNew ? 'Questions that use the same shared pool never repeat a topic. Changing the pool here changes every question that uses it.' : '') : h('div', { class: 'hint' }, 'Choose a shared pool to use the same topics for several questions.'),
      shared.count && st.poolId ? h('label', { class: 'fl cnt' }, 'Add this many questions', h('input', { type: 'number', min: 1, max: 10, value: st.count, onInput: (e) => { st.count = Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)); } })) : null);
  }
  const poolEntries = () => [...poolByTopic({ choices: st.choices }).values()].flat();
  function drawExample() {
    let e = null, n = 0;
    if (st.tab === 'pool') { const l = poolEntries(); n = l.length; e = l.length ? l[st.seed % l.length] : null; }
    else { const r = st.topics.size ? resolve(cur()) : null; n = r ? r.list.length : 0; e = r && r.list.length ? r.list[st.seed % r.list.length] : null; }
    ok.disabled = !e;
    if (!e) { setKids(prev); return; }
    let q; try { q = generate(e.key, st.seed); } catch (err) { setKids(prev, 'Could not make an example.'); return; }
    setKids(prev, h('div', { class: 'hint' }, `Example: ${e.type} › ${e.label}`),
      q.stem ? h('div', { html: T(q.stem) }) : null,
      q.parts.map((p, i) => h('div', { style: { margin: '3px 0' } }, q.parts.length > 1 ? `(${'abcdefgh'[i]}) ` : '', h('span', { html: T((!q.stem && p.verb ? p.verb + ' ' : '') + p.body) }))),
      h('button', { class: 'btn small', onClick: () => { st.seed = newSeed(); drawExample(); } }, '↻ Another example'));
  }
  function drawRest() {
    const tops = [...st.topics];
    tabsEl.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.tab === st.tab));
    rc = null; drawShared();
    if (!tops.length) { setKids(lvBox, h('div', { class: 'hint' }, st.tab === 'pool' ? 'Tick the topics this question can come from.' : 'Choose one or more topics.')); setKids(note); drawExample(); return; }
    if (st.tab === 'quick') {
      setKids(lvBox, levelButtons(tops, st.level, (l) => { st.level = l; st.seed = newSeed(); drawRest(); }));
      const r = resolve(cur());
      setKids(note, `${r.list.length} question option${r.list.length === 1 ? '' : 's'} to draw from.`, r.fell && r.level ? ` Nothing at ${st.level} here, so ${r.level} is used.` : '');
    } else if (st.tab === 'range') {
      rc = rangeControl(tops, st.lo, st.hi, () => { const g = rc.get(); st.lo = g.lo; st.hi = g.hi; st.seed = newSeed(); drawExample(); });
      const g = rc.get(); st.lo = g.lo; st.hi = g.hi;
      setKids(lvBox, rc.el); setKids(note);
    } else {
      const again = () => { st.seed = newSeed(); drawRest(); };
      setKids(lvBox, h('div', { class: 'pcs' }, st.choices.map(c => choiceCard(c, { open: st.open.has(c.topic), onChange: again,
        onToggleOpen: () => { st.open.has(c.topic) ? st.open.delete(c.topic) : st.open.add(c.topic); drawRest(); },
        onRemove: () => { st.topics.delete(c.topic); st.choices = st.choices.filter(x => x !== c); drawTopics(); drawRest(); } }))));
      const n = poolEntries().length, nt = poolByTopic({ choices: st.choices }).size;
      setKids(note, `${n} question option${n === 1 ? '' : 's'} across ${nt} topic${nt === 1 ? '' : 's'}.`, nt === 1 ? ' With one topic, ⤮ gives a different question in that topic.' : ' ⤮ always moves to a different topic.');
    }
    drawExample();
  }
  const ok = h('button', { class: 'btn primary', onClick: () => { if (!st.topics.size) return; if (shared && st.tab === 'pool' && st.poolId && !st.poolName.trim()) { st.poolName = `Pool ${shared.pools.length + 1}`; } m.close(); onDone(cur(), { count: st.tab === 'pool' && st.poolId ? st.count : 1 }); } }, confirmLabel);
  const m = modal({ title, wide: true,
    body: h('div', { class: 'qk' },
      h('div', { class: 'qk-left' }, search, list),
      h('div', { class: 'qk-right' }, h('div', { class: 'qk-tabs' }, h('span', { class: 'pk-col-h' }, 'Choose by'), tabsEl), sharedBox, lvBox, note, prev)),
    footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), onBrowse ? h('button', { class: 'btn', onClick: () => { m.close(); onBrowse(); } }, browseLabel) : null, ok] });
  drawTopics(); drawRest();
  setTimeout(() => search.focus(), 30);
}
