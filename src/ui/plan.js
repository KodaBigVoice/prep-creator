// The plan dialog: choose a topic, tick the options for a section, say how many questions; they ramp from the easiest tick to the hardest.
import { h, modal, setKids } from './dom.js';
import { ctx } from './state.js';
import { LEVELS } from '../data/query.js';
import { sortedTopics } from './quick.js';
import { planOptions, newPlan, setOn, ticked, countsFor } from '../data/plan.js';

const MIX = { both: ['Both', 'Skill drills and worded questions'], skills: ['Skills', 'Plain questions with no context'], context: ['In context', 'Worded and real-life questions'] };

// plan: an existing plan (to change) or null. onDone({ plan, title })
export function openPlanDialog({ title: dlgTitle = 'New section', confirmLabel = 'Build section', plan: existing = null, secTitle = '', note = null, onDone }) {
  const topics = sortedTopics();
  const plan = existing ? JSON.parse(JSON.stringify(existing)) : newPlan(topics.length ? (ctx.store.settings.lastPlanTopic && topics.some(t => t.name === ctx.store.settings.lastPlanTopic) ? ctx.store.settings.lastPlanTopic : topics[0].name) : '', 10);
  let title = secTitle;
  const titleIn = h('input', { type: 'text', value: title, placeholder: 'e.g. Two-step equations', 'aria-label': 'Section title', onInput: () => { title = titleIn.value; } });
  const topicSel = h('select', { 'aria-label': 'Topic', onChange: () => { plan.topic = topicSel.value; plan.items = []; plan.mix = 'both'; ctx.store.settings.lastPlanTopic = plan.topic; if (!title.trim()) { /* leave the title for the person to write */ } draw(); } },
    topics.map(t => h('option', { value: t.name, selected: t.name === plan.topic }, t.name + (t.pinned ? ' ★' : ''))));
  const mixEl = h('span', { class: 'seg', role: 'radiogroup', 'aria-label': 'Kind of question' },
    Object.keys(MIX).map(k => h('button', { role: 'radio', title: MIX[k][1], 'data-mix': k, onClick: () => { plan.mix = k; const keep = new Set(planOptions(plan.topic, k).map(e => e.key)); plan.items.forEach(it => { if (!keep.has(it.key)) it.on = false; }); draw(); } }, MIX[k][0])));
  const lvEl = h('div', { class: 'lvbtns plan-lv' });
  const list = h('div', { class: 'plan-opts' });
  const sum = h('div', { class: 'plan-sum' });
  const totalIn = h('input', { type: 'text', inputmode: 'numeric', 'aria-label': 'Number of questions', onChange: () => { const v = parseInt(totalIn.value, 10); if (v >= 1) { plan.total = Math.min(60, v); } draw(); } });
  const evenBtn = h('button', { class: 'btn small', title: 'Share the questions evenly over the ticked options again', onClick: () => { plan.items.forEach(it => { delete it.manual; delete it.count; }); draw(); } }, 'Even out');
  const ok = h('button', { class: 'btn primary', onClick: () => { if (!ticked(plan).length) return; m.close(); onDone({ plan, title: title.trim() }); } }, confirmLabel);
  let last = -1;

  function draw() {
    mixEl.querySelectorAll('button').forEach(b => { const k = b.dataset.mix, n = planOptions(plan.topic, k).length; b.setAttribute('aria-checked', String(k === plan.mix)); b.disabled = !n; b.title = n ? `${MIX[k][1]} (${n} option${n === 1 ? '' : 's'})` : 'This topic has none of these'; });
    const opts = planOptions(plan.topic, plan.mix), on = new Set(ticked(plan).map(it => it.key));
    setKids(lvEl, h('span', { class: 'pk-col-h' }, 'Tick'), LEVELS.map(l => {
      const at = opts.filter(e => e.levels.includes(l));
      return h('button', { class: 'lvbtn', disabled: !at.length || undefined, title: at.length ? `Tick every ${l} option` : 'Nothing at this level', onClick: () => { at.forEach(e => setOn(plan, e.key, true)); draw(); } }, l, h('small', {}, at.length ? String(at.length) : '–'));
    }), h('button', { class: 'lvbtn', onClick: () => { opts.forEach(e => setOn(plan, e.key, true)); draw(); } }, 'All'), h('button', { class: 'lvbtn', onClick: () => { plan.items.forEach(it => { it.on = false; }); draw(); } }, 'None'));
    const counts = countsFor(plan), tk = ticked(plan);
    const at = new Map(); let pos = 0; tk.forEach((it, k) => { at.set(it.key, [pos + 1, pos + counts[k]]); pos += counts[k]; });
    setKids(list, opts.map((e, i) => {
      const item = plan.items.find(x => x.key === e.key), isOn = on.has(e.key), r = at.get(e.key), cnt = r ? r[1] - r[0] + 1 : 0;
      return h('div', { class: 'plan-opt' + (isOn ? ' on' : '') },
        h('label', {}, h('input', { type: 'checkbox', checked: isOn, onClick: (ev) => {
          const want = ev.target.checked;
          if (ev.shiftKey && last >= 0) { const [a, b] = [Math.min(last, i), Math.max(last, i)]; for (let k = a; k <= b; k++) setOn(plan, opts[k].key, want); } else setOn(plan, e.key, want);
          last = i; draw();
        } }), h('span', { class: 'pc-nm' }, `${e.type} › ${e.label}`), h('small', {}, e.levels.join(' · '))),
        isOn ? h('span', { class: 'plan-cnt' }, h('span', { class: 'stepper' + (item.manual ? ' manual' : '') },
          h('button', { 'aria-label': 'fewer', onClick: () => setCount(item, Math.max(0, cnt - 1), cnt) }, '−'),
          h('input', { type: 'text', inputmode: 'numeric', value: String(cnt), 'aria-label': 'Questions for ' + e.label, onChange: (ev) => { const v = parseInt(ev.target.value, 10); setCount(item, v >= 0 ? v : cnt, cnt); } }),
          h('button', { 'aria-label': 'more', onClick: () => setCount(item, cnt + 1, cnt) }, '+')),
          h('small', {}, cnt ? (cnt === 1 ? `Q${r[0]}` : `Q${r[0]}–${r[1]}`) : 'none')) : null);
    }));
    const n = counts.reduce((a, c) => a + c, 0);
    totalIn.value = String(n || plan.total);
    evenBtn.hidden = !tk.some(it => it.manual);
    setKids(sum, tk.length ? `${n} question${n === 1 ? '' : 's'} from ${tk.length} option${tk.length === 1 ? '' : 's'}, easiest first.` : 'Tick the options this section should use. The questions start with the first one you tick and finish on the last.');
    ok.disabled = !tk.length || !n;
  }
  // a hand-set count: that option keeps it, the total follows, and the options still on automatic share what is left as before
  function setCount(item, v, was) {
    const sum = countsFor(plan).reduce((a, c) => a + c, 0);
    item.manual = true; item.count = v;
    plan.total = Math.max(1, sum - was + v);
    draw();
  }
  const m = modal({ title: dlgTitle, wide: true,
    body: h('div', { class: 'plan' },
      note ? h('div', { class: 'hint' }, note) : null,
      h('div', { class: 'plan-top' },
        h('label', { class: 'fl' }, 'Section title', titleIn),
        h('label', { class: 'fl' }, 'Topic', topicSel),
        h('label', { class: 'fl plan-n' }, 'Questions', totalIn, evenBtn)),
      h('div', { class: 'qk-tabs' }, h('span', { class: 'pk-col-h' }, 'Questions'), mixEl),
      lvEl, sum, list),
    footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), ok] });
  draw();
  setTimeout(() => titleIn.focus(), 30);
}
