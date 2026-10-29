// Choosing questions by description: pick topic(s) and a level, and the app finds a question that fits.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { generate } from '../core/engine.js';
import { newSeed } from '../core/rng.js';
import { mathToHTML } from '../layout/render.js';
import { LEVELS, topicList, levelCounts, resolve } from '../data/query.js';

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

// A dialog for choosing topic(s) and a level. `def` is an existing query (to change it) or null (to add).
export function openQuickChooser({ title = 'Add a question', confirmLabel = 'Add question', def = null, onDone, extraButtons = [] }) {
  const st = { topics: new Set(def ? (def.topics || []) : []), level: def ? def.level : 'Core', q: '', seed: newSeed() };
  const T = (s) => mathToHTML(s, ctx.katex);
  const search = h('input', { type: 'text', placeholder: 'Find a topic…', 'aria-label': 'Find a topic', onInput: () => { st.q = search.value.toLowerCase(); drawTopics(); } });
  const list = h('div', { class: 'qk-topics', role: 'listbox', 'aria-label': 'Topics', 'aria-multiselectable': 'true' });
  const lvBox = h('div'), note = h('div', { class: 'hint' }), prev = h('div', { class: 'pk-preview qk-prev' });
  const cur = () => ({ topics: [...st.topics], level: st.level });

  function drawTopics() {
    const items = sortedTopics().filter(t => !st.q || t.name.toLowerCase().includes(st.q));
    setKids(list, items.map(t => h('div', { class: 'qk-t' + (st.topics.has(t.name) ? ' on' : ''), role: 'option', 'aria-selected': st.topics.has(t.name), onClick: () => { if (st.topics.has(t.name)) st.topics.delete(t.name); else st.topics.add(t.name); drawTopics(); drawRest(); } },
      h('span', { class: 'tick' }, st.topics.has(t.name) ? '✓' : ''), h('span', { class: 'nm' }, t.name), h('small', {}, `${t.n}`),
      h('button', { class: 'star' + (t.pinned ? ' on' : ''), title: t.pinned ? 'Unpin this topic' : 'Pin this topic to the top', 'aria-label': (t.pinned ? 'Unpin ' : 'Pin ') + t.name, html: STAR,
        onClick: (e) => { e.stopPropagation(); togglePin(t.name); const top = list.scrollTop; drawTopics(); list.scrollTop = top; } }))),
      items.length ? null : h('div', { class: 'pk-none' }, 'No topic matches'));
  }
  function drawRest() {
    const tops = [...st.topics];
    // the level is kept if the topics have it; otherwise the nearest level that has something is shown
    setKids(lvBox, tops.length ? levelButtons(tops, st.level, (l) => { st.level = l; drawRest(); }) : h('div', { class: 'hint' }, 'Choose one or more topics.'));
    const r = tops.length ? resolve(cur()) : null;
    setKids(note, r ? `${r.list.length} question option${r.list.length === 1 ? '' : 's'} to draw from.` : '', r && r.fell && r.level ? ` Nothing at ${st.level} here, so ${r.level} is used.` : '');
    if (!r || !r.list.length) { setKids(prev); ok.disabled = true; return; }
    ok.disabled = false;
    const e = r.list[st.seed % r.list.length];
    let q; try { q = generate(e.key, st.seed); } catch (err) { setKids(prev, 'Could not make an example.'); return; }
    setKids(prev, h('div', { class: 'hint' }, `Example: ${e.type} › ${e.label}`),
      q.stem ? h('div', { html: T(q.stem) }) : null,
      q.parts.map((p, i) => h('div', { style: { margin: '3px 0' } }, q.parts.length > 1 ? `(${'abcdefgh'[i]}) ` : '', h('span', { html: T((!q.stem && p.verb ? p.verb + ' ' : '') + p.body) }))),
      h('button', { class: 'btn small', onClick: () => { st.seed = newSeed(); drawRest(); } }, '↻ Another example'));
  }
  const ok = h('button', { class: 'btn primary', onClick: () => { if (!st.topics.size) return; m.close(); onDone({ mode: 'query', ...cur() }); } }, confirmLabel);
  const m = modal({ title, wide: true,
    body: h('div', { class: 'qk' },
      h('div', { class: 'qk-left' }, search, list),
      h('div', { class: 'qk-right' }, h('div', { class: 'pk-col-h' }, 'Level'), lvBox, note, prev)),
    footer: [...extraButtons.map(b => h('button', { class: 'btn', onClick: () => { m.close(); b.onClick(); } }, b.label)), h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), ok] });
  drawTopics(); drawRest();
  setTimeout(() => search.focus(), 30);
}
