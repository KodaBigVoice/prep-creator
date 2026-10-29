// Choosing questions by description: pick topic(s) and a level, and the app finds a question that fits.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { generate } from '../core/engine.js';
import { newSeed } from '../core/rng.js';
import { mathToHTML } from '../layout/render.js';
import { LEVELS, topicList, levelCounts, resolve, ladder, isRange } from '../data/query.js';

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

// The simple picker: choose topic(s), then a level (Quick) or a stretch of the ladder (Range). `def` is an existing query (to change it) or null.
// onBrowse (optional) adds a button that swaps to the full list of questions.
export function openQuickChooser({ title = 'Add a question', confirmLabel = 'Use this question', def = null, onDone, onBrowse = null, browseLabel = 'Browse all questions' }) {
  const st = { topics: new Set(def ? (def.topics || []) : []), level: def && def.level ? def.level : 'Core', tab: def && isRange(def) ? 'range' : 'quick', lo: def ? def.lo : null, hi: def ? def.hi : null, q: '', seed: newSeed() };
  const T = (s) => mathToHTML(s, ctx.katex);
  const search = h('input', { type: 'text', placeholder: 'Find a topic…', 'aria-label': 'Find a topic', onInput: () => { st.q = search.value.toLowerCase(); drawTopics(); } });
  const list = h('div', { class: 'qk-topics', role: 'listbox', 'aria-label': 'Topics', 'aria-multiselectable': 'true' });
  const lvBox = h('div'), note = h('div', { class: 'hint' }), prev = h('div', { class: 'pk-preview qk-prev' });
  let rc = null;
  const tabs = h('span', { class: 'seg', role: 'radiogroup', 'aria-label': 'How to choose' },
    [['quick', 'Quick', 'A topic and a level'], ['range', 'Range', 'A stretch of the difficulty ladder']].map(([id, label, t]) => h('button', { role: 'radio', title: t, 'data-tab': id, onClick: () => { st.tab = id; st.seed = newSeed(); drawRest(); } }, label)));
  const cur = () => (st.tab === 'range' && rc ? { topics: [...st.topics], level: null, ...rc.get() } : { topics: [...st.topics], level: st.level });

  function drawTopics() {
    const items = sortedTopics().filter(t => !st.q || t.name.toLowerCase().includes(st.q));
    setKids(list, items.map(t => h('div', { class: 'qk-t' + (st.topics.has(t.name) ? ' on' : ''), role: 'option', 'aria-selected': st.topics.has(t.name), onClick: () => { if (st.topics.has(t.name)) st.topics.delete(t.name); else st.topics.add(t.name); st.lo = st.hi = null; drawTopics(); drawRest(); } },
      h('span', { class: 'tick' }, st.topics.has(t.name) ? '✓' : ''), h('span', { class: 'nm' }, t.name), h('small', {}, `${t.n}`),
      h('button', { class: 'star' + (t.pinned ? ' on' : ''), title: t.pinned ? 'Unpin this topic' : 'Pin this topic to the top', 'aria-label': (t.pinned ? 'Unpin ' : 'Pin ') + t.name, html: STAR,
        onClick: (e) => { e.stopPropagation(); togglePin(t.name); const top = list.scrollTop; drawTopics(); list.scrollTop = top; } }))),
      items.length ? null : h('div', { class: 'pk-none' }, 'No topic matches'));
  }
  function drawExample() {
    const r = st.topics.size ? resolve(cur()) : null;
    ok.disabled = !r || !r.list.length;
    if (!r || !r.list.length) { setKids(prev); return; }
    const e = r.list[st.seed % r.list.length];
    let q; try { q = generate(e.key, st.seed); } catch (err) { setKids(prev, 'Could not make an example.'); return; }
    setKids(prev, h('div', { class: 'hint' }, `Example: ${e.type} › ${e.label}`),
      q.stem ? h('div', { html: T(q.stem) }) : null,
      q.parts.map((p, i) => h('div', { style: { margin: '3px 0' } }, q.parts.length > 1 ? `(${'abcdefgh'[i]}) ` : '', h('span', { html: T((!q.stem && p.verb ? p.verb + ' ' : '') + p.body) }))),
      h('button', { class: 'btn small', onClick: () => { st.seed = newSeed(); drawExample(); } }, '↻ Another example'));
  }
  function drawRest() {
    const tops = [...st.topics];
    tabs.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', b.dataset.tab === st.tab));
    rc = null;
    if (!tops.length) { setKids(lvBox, h('div', { class: 'hint' }, 'Choose one or more topics.')); setKids(note); drawExample(); return; }
    if (st.tab === 'quick') {
      setKids(lvBox, levelButtons(tops, st.level, (l) => { st.level = l; st.seed = newSeed(); drawRest(); }));
      const r = resolve(cur());
      setKids(note, `${r.list.length} question option${r.list.length === 1 ? '' : 's'} to draw from.`, r.fell && r.level ? ` Nothing at ${st.level} here, so ${r.level} is used.` : '');
    } else {
      rc = rangeControl(tops, st.lo, st.hi, () => { const g = rc.get(); st.lo = g.lo; st.hi = g.hi; st.seed = newSeed(); drawExample(); });
      const g = rc.get(); st.lo = g.lo; st.hi = g.hi;
      setKids(lvBox, rc.el); setKids(note);
    }
    drawExample();
  }
  const ok = h('button', { class: 'btn primary', onClick: () => { if (!st.topics.size) return; m.close(); onDone({ mode: 'query', ...cur() }); } }, confirmLabel);
  const m = modal({ title, wide: true,
    body: h('div', { class: 'qk' },
      h('div', { class: 'qk-left' }, search, list),
      h('div', { class: 'qk-right' }, h('div', { class: 'qk-tabs' }, h('span', { class: 'pk-col-h' }, 'Choose by'), tabs), lvBox, note, prev)),
    footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), onBrowse ? h('button', { class: 'btn', onClick: () => { m.close(); onBrowse(); } }, browseLabel) : null, ok] });
  drawTopics(); drawRest();
  setTimeout(() => search.focus(), 30);
}
