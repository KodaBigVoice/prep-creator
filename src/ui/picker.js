// The question picker: search plus typable Topic > Type > Options, with a live preview.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { entries, typeById, generate, defaultFlags } from '../core/engine.js';
import { newSeed } from '../core/rng.js';
import { mathToHTML } from '../layout/render.js';
import { setById } from '../data/sets.js';

const ALL = entries();

export function openPicker({ title = 'Choose a question', current = null, confirmLabel = 'Use this question', onPick, extraButtons = [] }) {
  const set = setById[ctx.prep.set];
  const st = { q: '', topic: '', type: '', opt: '', sel: current && ALL.find(e => e.key === current) ? current : null, seed: newSeed(), flags: null, level: true, showAns: true };
  const T = (s) => mathToHTML(s, ctx.katex);
  const list = h('div', { class: 'pk-list' });
  const preview = h('div', { class: 'pk-preview' });
  const optsBox = h('div');
  const qIn = h('input', { type: 'text', placeholder: 'Search, e.g. overlap, ladder, 15%…', style: { width: '100%' }, onInput: () => { st.q = qIn.value; renderList(); } });
  const mk = (ph, key, listId) => h('input', { type: 'text', placeholder: ph, list: listId, onInput: (e) => { st[key] = e.target.value; renderList(); } });
  const tIn = mk('Topic', 'topic', 'dl-topic'), yIn = mk('Type', 'type', 'dl-type'), oIn = mk('Options', 'opt', 'dl-opt');
  const dls = h('div', {}, h('datalist', { id: 'dl-topic' }), h('datalist', { id: 'dl-type' }), h('datalist', { id: 'dl-opt' }));
  const levelBox = h('input', { type: 'checkbox', checked: true, onChange: (e) => { st.level = e.target.checked; renderList(); } });

  const match = (e) => {
    const toks = st.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!toks.every(t => e.hay.includes(t))) return false;
    if (st.topic && !e.topic.toLowerCase().includes(st.topic.toLowerCase())) return false;
    if (st.type && !e.type.toLowerCase().includes(st.type.toLowerCase())) return false;
    if (st.opt && !e.label.toLowerCase().includes(st.opt.toLowerCase())) return false;
    if (st.level && set && !(e.levels.includes(set.level))) return false;
    return true;
  };
  function fillDatalists(pool) {
    const uniq = (a) => [...new Set(a)];
    dls.children[0].replaceChildren(...uniq(ALL.filter(e => !st.level || e.levels.includes(set.level)).map(e => e.topic)).sort().map(v => h('option', { value: v })));
    dls.children[1].replaceChildren(...uniq(pool.map(e => e.type)).sort().map(v => h('option', { value: v })));
    dls.children[2].replaceChildren(...uniq(pool.map(e => e.label)).sort().map(v => h('option', { value: v })));
  }
  function renderList() {
    const res = ALL.filter(match);
    fillDatalists(ALL.filter(e => (!st.topic || e.topic.toLowerCase().includes(st.topic.toLowerCase())) && (!st.type || e.type.toLowerCase().includes(st.type.toLowerCase()))));
    setKids(list, ...(res.length ? res.slice(0, 200).map(e => h('div', { class: 'pk-item' + (e.key === st.sel ? ' sel' : ''), onClick: () => { st.sel = e.key; st.seed = newSeed(); st.flags = null; renderList(); renderPreview(); }, onDblclick: () => use() },
      h('div', { class: 'nm' }, e.label, e.multipart ? h('span', { class: 'badge' }, 'multipart') : null),
      h('div', { class: 'path' }, `${e.topic} › ${e.type}`))) : [h('div', { class: 'empty' }, 'Nothing matches. Try fewer words, or untick “only this set’s level”.')]));
  }
  function renderPreview() {
    if (!st.sel) { setKids(preview, h('div', { class: 'hint' }, 'Choose a question on the left to see an example.')); setKids(optsBox, ); return; }
    const e = ALL.find(x => x.key === st.sel); const t = typeById[e.typeId];
    const flags = st.flags || defaultFlags(t);
    let q;
    try { q = generate(st.sel, st.seed, flags); } catch (err) { setKids(preview, h('div', { class: 'err' }, 'Could not make an example: ' + err.message)); return; }
    const verbs = q.parts.map(p => p.verb);
    const shared = !q.stem && q.parts.length > 1 && verbs[0] && verbs.every(v => v === verbs[0]);
    const lines = [];
    if (q.stem) lines.push(h('div', { html: T(q.stem) }));
    else if (shared) lines.push(h('div', {}, verbs[0] + ':'));
    q.parts.forEach((p, i) => {
      const text = (!q.stem && !shared && p.verb ? p.verb + ' ' : '') + p.body;
      lines.push(h('div', { style: { margin: '3px 0' } }, q.parts.length > 1 ? `(${'abcd'[i]}) ` : '', h('span', { html: T(text) }), h('span', { class: 'hint' }, `  [${p.m} mark${p.m > 1 ? 's' : ''}]`), p.calc ? h('span', { class: 'badge' }, 'calculator') : null));
    });
    const ans = h('div', { class: 'ans' }, h('b', {}, 'Answer: '), q.parts.map((p, i) => h('span', { html: katexTex(p.a) + (i < q.parts.length - 1 ? ';&nbsp; ' : '') })));
    setKids(preview, ...lines, st.showAns ? ans : null,
      h('div', { class: 'addrow' }, h('button', { class: 'btn small', onClick: () => { st.seed = newSeed(); renderPreview(); } }, '↻ Another one'),
        h('label', { class: 'hint', style: { display: 'flex', gap: '4px', alignItems: 'center' } }, h('input', { type: 'checkbox', checked: st.showAns, onChange: (ev) => { st.showAns = ev.target.checked; renderPreview(); } }), 'show answer')));
    setKids(optsBox, t.integer ? h('details', { class: 'opts', open: true }, h('summary', {}, 'Question options'),
      h('div', { class: 'in' }, h('label', { style: { display: 'flex', gap: '6px', alignItems: 'center' } },
        h('input', { type: 'checkbox', checked: flags.integer !== false, onChange: (ev) => { st.flags = { ...flags, integer: ev.target.checked }; renderPreview(); } }), 'Integer answers only'))) : h('div', { class: 'hint', style: { marginTop: '8px' } }, 'No extra options for this question type.'));
  }
  const katexTex = (t) => { try { return ctx.katex.renderToString(t, { throwOnError: false }); } catch (e) { return t; } };
  function use() {
    if (!st.sel) return;
    const e = ALL.find(x => x.key === st.sel);
    const t = typeById[e.typeId];
    m.close();
    onPick({ pick: st.sel, seed: st.seed, flags: st.flags && t.integer ? st.flags : null });
  }
  const body = h('div', {},
    qIn, h('div', { class: 'pk-filters' }, tIn, yIn, oIn), dls,
    h('div', { class: 'hint', style: { margin: '-2px 0 8px' } }, h('label', {}, levelBox, ` only ${set ? set.level : ''} level questions (untick to see everything)`)),
    h('div', { class: 'picker' }, list, h('div', {}, preview, optsBox)));
  const m = modal({
    title, body,
    footer: [...extraButtons, h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), h('button', { class: 'btn primary', onClick: use }, confirmLabel)],
  });
  renderList(); renderPreview();
  setTimeout(() => qIn.focus(), 30);
}
