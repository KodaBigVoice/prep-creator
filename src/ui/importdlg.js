// "Import from Claude": paste or upload the JSON file Claude wrote, see what it will build, build it.
import { h, modal, toast, setKids, download } from './dom.js';
import { ctx } from './state.js';
import { parseImport, exportForClaude } from '../data/claudeimport.js';

const SITE = 'https://prep-maths-universe.netlify.app';
const REPO = 'https://github.com/KodaBigVoice/prep-creator';
export const PROMPT = `I'd like you to design a PMU (Prep Maths Universe) sheet with me. Before we start, read these two files — they are live and always current:
${SITE}/for-claude.md  (the exact JSON format and the house conventions)
${SITE}/bank.md  (every question option PMU can generate, with its key)
The source is ${REPO} if you need it.
Let's talk through what I want first (topic, level, progression, number of questions). When I'm happy, reply with ONE JSON file in that format, in a single code block, and nothing else needed.`;

async function copy(text, ok) {
  try { await navigator.clipboard.writeText(text); toast(ok); }
  catch (e) {
    const ta = h('textarea', { style: { position: 'fixed', opacity: 0 } }, text); document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast(ok); } catch (e2) { toast('Could not copy: select the text and copy it yourself.', 4000); } ta.remove();
  }
}

// opts.onBuild(result, text) builds the sheet on screen
export function openImportDialog({ onBuild }) {
  const ta = h('textarea', { rows: 12, spellcheck: false, placeholder: 'Paste Claude’s JSON here (a code block is fine), or choose a file…', style: { width: '100%', fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '12px' } });
  const out = h('div', { style: { marginTop: '10px' } });
  let res = null;
  const build = h('button', { class: 'btn primary', disabled: true, onClick: () => { m.close(); onBuild(res, ta.value); } }, 'Build the sheet');
  const check = () => {
    const text = ta.value.trim();
    res = null; build.disabled = true;
    if (!text) { setKids(out, h('div', { class: 'hint' }, 'Nothing pasted yet.')); return; }
    const r = parseImport(text, { setId: ctx.prep.set, katex: ctx.katex, cover: ctx.store.settings.cover });
    if (r.errors) {
      const msg = r.errors.map(e => `${e.path}: ${e.message}`).join('\n');
      setKids(out, h('div', { class: 'importerr' }, h('b', {}, `${r.errors.length} problem${r.errors.length === 1 ? '' : 's'} — nothing built yet`),
        h('ul', {}, r.errors.slice(0, 40).map(e => h('li', {}, h('code', {}, e.path), ' ', e.message))),
        h('button', { class: 'btn small', onClick: () => copy('PMU could not import your file. Please fix these and send the whole corrected file:\n\n' + msg, 'Errors copied: paste them to Claude.') }, 'Copy the errors for Claude')));
      return;
    }
    res = r; build.disabled = false;
    const s = r.summary;
    setKids(out, h('div', {}, h('b', {}, `“${r.prep.name}” — ${s.questions} question${s.questions === 1 ? '' : 's'}, ${s.marks} marks`),
      ` (${r.prep.set}${s.sections ? `, ${s.sections} section${s.sections === 1 ? '' : 's'}` : ''}${s.written ? `, ${s.written} written out by Claude` : ''}).`),
      r.warnings.length ? h('ul', { class: 'hint' }, r.warnings.map(w => h('li', {}, h('code', {}, w.path), ' ', w.message))) : null,
      h('div', { class: 'hint' }, 'Building replaces the sheet on screen; the current one is saved to History first.'));
  };
  ta.addEventListener('input', check);
  const file = h('input', { type: 'file', accept: '.json,.txt,.md,application/json', style: { display: 'none' }, onChange: async (e) => { const f = e.target.files[0]; if (!f) return; ta.value = await f.text(); check(); } });
  const fetchBoth = async () => {
    try {
      const [g, b] = await Promise.all(['for-claude.md', 'bank.md'].map(f => fetch(f, { cache: 'no-cache' }).then(r => { if (!r.ok) throw new Error(f); return r.text(); })));
      copy(`${g}\n\n---\n\n${b}`, 'Guide and bank copied: paste them into the chat.');
    } catch (e) { toast('Could not load the guide: ' + e.message, 4000); }
  };
  const body = h('div', {},
    h('div', { class: 'hint', style: { marginBottom: '8px' } }, 'Talk the sheet through with Claude first. Start the chat with the prompt below so it reads the live format guide and question bank, then paste or upload the JSON it gives you.'),
    h('div', { class: 'stack', style: { flexDirection: 'row', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' } },
      h('button', { class: 'btn small', onClick: () => copy(PROMPT, 'Prompt copied: paste it to start a chat with Claude.') }, 'Copy the prompt (with links)'),
      h('button', { class: 'btn small', title: 'For a chat that cannot open links', onClick: fetchBoth }, 'Copy guide + bank instead'),
      h('button', { class: 'btn small', title: 'So Claude can tweak the sheet on screen', onClick: () => copy(JSON.stringify(exportForClaude(ctx.prep, ctx.layout), null, 2), 'This sheet copied as JSON: paste it to Claude with what to change.') }, 'Copy this sheet as JSON'),
      h('label', { class: 'btn small' }, 'Upload a file…', file)),
    ta, out);
  const m = modal({ title: 'Import from Claude', wide: true, body, footer: [h('button', { class: 'btn', onClick: () => m.close() }, 'Cancel'), build] });
  check(); setTimeout(() => ta.focus(), 30);
}
