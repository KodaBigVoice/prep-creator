// Builds the printable pages for a prep: measures the real text with the browser, plans the pages, writes the HTML.
import { composePrep } from './compose.js';
import { planPages, planQuestionsOnly } from './paginate.js';
import { qoHTML, aosHTML, headHTML, runHeadHTML, answersHTML } from './render.js';
import { answerRows } from './compose.js';

export const DEFAULT_LAYOUT = {
  mode: 'qo',            // 'qo' = questions only, 'aos' = answer on sheet
  fontPt: 'auto',        // 'auto' or a number (floor 10)
  lh: 1.5,               // line spacing
  mx: 18, mt: 15, mb: 15,// margins in mm (floor 12)
  lineMM: 8,             // one ruled line of working space
  squash: 0.85, stretch: 1.3,
  splitParts: false,     // allow a multipart question to continue on the next page
  logo: false,           // The logo at the top right of the title row
  nameLine: true,        // Name line on the title row (answer on sheet only)
};
export const FLOORS = { pt: 10, margin: 12 };
const PX_MM = 96 / 25.4;

function makeMeasurer(doc) {
  let host = doc.getElementById('measure-host');
  if (!host) { host = doc.createElement('div'); host.id = 'measure-host'; host.style.cssText = 'position:absolute;left:-10000px;top:0;visibility:hidden;pointer-events:none'; doc.body.appendChild(host); }
  return host;
}

export function buildLayout(prep, L, katex, doc = document) {
  const host = makeMeasurer(doc);
  const qs = composePrep(prep);
  const mode = L.mode;
  const mt = Math.max(FLOORS.margin, L.mt), mb = Math.max(FLOORS.margin, L.mb), mx = Math.max(FLOORS.margin, L.mx);
  const vars = (pt) => `--fs:${pt}pt;--lh:${L.lh};--mt:${mt}mm;--mx:${mx}mm;--mb:${mb}mm`;
  const showName = mode === 'aos' && L.nameLine;

  // Heights of: page-1 header, running header
  const probe = (pt, inner) => {
    host.innerHTML = `<div class="sheet ${mode}" style="${vars(pt)};height:auto;overflow:visible">${inner}</div>`;
    return host.firstElementChild;
  };
  const measureHeads = (pt) => {
    const head = probe(pt, `<div id="h1">${headHTML(prep, katex, { rubric: true, name: showName, logo: !!L.logo })}</div><div id="h2">${runHeadHTML(prep, 2)}</div>`);
    const h1 = head.querySelector('#h1').getBoundingClientRect().height / PX_MM;
    const h2 = head.querySelector('#h2').getBoundingClientRect().height / PX_MM;
    return { h1, h2 };
  };
  const bodyTop = 4;                          // .body margin-top
  const pageInner = 297 - mt - mb;

  // ---------------- questions only ----------------
  if (mode === 'qo') {
    const measureAt = (pt) => {
      const { h1, h2 } = measureHeads(pt);
      host.innerHTML = `<div class="sheet qo" style="${vars(pt)};height:auto;overflow:visible"><div class="body" style="display:block">${qs.map(q => `<div class="mu">${qoHTML(q, katex)}</div>`).join('')}</div></div>`;
      const units = [...host.querySelectorAll('.mu')].map((el, i) => ({ fixed: el.getBoundingClientRect().height / PX_MM, flex: 0, marks: qs[i].marks, label: qs[i].n }));
      return { units, cap1: pageInner - h1 - bodyTop, capN: pageInner - h2 - bodyTop };
    };
    let pt, plan, m, overfull = false;
    if (L.fontPt === 'auto') ({ pt, plan, m, overfull } = planQuestionsOnly(measureAt, { minPt: FLOORS.pt, maxPt: 12, step: 0.5, minGap: 3 }));
    else {
      pt = Math.max(FLOORS.pt, Number(L.fontPt)); m = measureAt(pt);
      plan = planPages(m.units.map(u => ({ ...u, fixed: u.fixed + 3 })), { cap1: m.cap1 + 3, capN: m.capN + 3, lineMM: 1, squash: 0.01, stretch: 1 });
    }
    const pages = plan.pages.map((pg, pi) => {
      const n = pg.idx.length;
      const gap = n > 1 ? Math.max(3, Math.min(30, 3 + pg.free / (n - 1))) : 0;
      const body = pg.idx.map((qi, k) => `<div style="margin-top:${k ? gap.toFixed(2) : 0}mm">${qoHTML(qs[qi], katex)}</div>`).join('');
      const top = pi === 0 ? headHTML(prep, katex, { rubric: true, name: false, logo: !!L.logo }) : runHeadHTML(prep, pi + 1);
      return `<div class="sheet qo" style="${vars(pt)}">${top}<div class="body">${body}</div></div>`;
    });
    return { pages, qs, info: { pageCount: pages.length, pt, mode, warnings: plan.warnings, overfull, text: `${pages.length} page${pages.length > 1 ? 's' : ''} · ${pt} pt text` } };
  }

  // ---------------- answer on sheet ----------------
  const pt = L.fontPt === 'auto' ? 11 : Math.max(FLOORS.pt, Number(L.fontPt));
  const { h1, h2 } = measureHeads(pt);
  // units
  const units = [];
  qs.forEach((q, qi) => {
    if (!L.splitParts || q.parts.length < 2) units.push({ qi, pa: 0, pb: q.parts.length, firstOfQuestion: true, cont: false });
    else q.parts.forEach((p, k) => units.push({ qi, pa: k, pb: k + 1, firstOfQuestion: k === 0, cont: k > 0 }));
  });
  host.innerHTML = `<div class="sheet aos" style="${vars(pt)};height:auto;overflow:visible"><div class="body" style="display:block">${units.map(u => `<div class="mu">${aosHTML(u, qs[u.qi], katex, { lineMM: L.lineMM, factors: 1, first: false, textOnly: true })}</div>`).join('')}</div></div>`;
  const textH = [...host.querySelectorAll('.mu')].map(el => el.getBoundingClientRect().height / PX_MM);
  const pu = units.map((u, i) => {
    const q = qs[u.qi]; let manual = 0, flex = 0, marks = 0;
    for (let k = u.pa; k < u.pb; k++) { const p = q.parts[k]; marks += p.marks; if (p.linesManual) manual += p.lines * L.lineMM; else flex += p.lines; }
    return { fixed: textH[i] + manual, flex, marks, cont: u.cont, label: q.n };
  });
  const plan = planPages(pu, { cap1: pageInner - h1 - bodyTop, capN: pageInner - h2 - bodyTop, lineMM: L.lineMM, squash: L.squash, stretch: L.stretch, splitPenalty: 0.6 });
  const pages = plan.pages.map((pg, pi) => {
    const n = pg.idx.length;
    const extra = n > 1 ? Math.min(10, Math.max(0, pg.free) / (n - 1)) : 0;
    const body = pg.idx.map((ui, k) => {
      const u = units[ui];
      return `<div style="margin-top:${k ? extra.toFixed(2) : 0}mm">${aosHTML(u, qs[u.qi], katex, { lineMM: L.lineMM, factors: pg.factor, first: k === 0, textOnly: false })}</div>`;
    }).join('');
    const top = pi === 0 ? headHTML(prep, katex, { rubric: true, name: showName, logo: !!L.logo }) : runHeadHTML(prep, pi + 1);
    return `<div class="sheet aos" style="${vars(pt)}">${top}<div class="body">${body}</div></div>`;
  });
  const fs = plan.pages.map(p => p.factor);
  const debug = { units: pu, cap1: pageInner - h1 - bodyTop, capN: pageInner - h2 - bodyTop, pages: plan.pages.map(p => ({ idx: p.idx, f: +p.factor.toFixed(2), fit: +(p.fit || 0).toFixed(2) })) };
  const lo = Math.round(Math.min(...fs) * 100), hi = Math.round(Math.max(...fs) * 100);
  return { pages, qs, info: { debug, pageCount: pages.length, pt, mode, factors: fs, marksPerPage: plan.pages.map(p => p.marks), warnings: plan.warnings,
    text: `${pages.length} page${pages.length > 1 ? 's' : ''} · working space at ${lo === hi ? lo : lo + '–' + hi}% of what you set` } };
}

// Answers: a table that flows over as many pages as it needs
export function buildAnswerPages(prep, katex, L, doc = document) {
  const host = makeMeasurer(doc);
  const qs = composePrep(prep);
  const rows = answerRows(qs, prep);
  const vars = `--fs:11pt;--lh:1.4;--mt:${Math.max(FLOORS.margin, L.mt)}mm;--mx:${Math.max(FLOORS.margin, L.mx)}mm;--mb:${Math.max(FLOORS.margin, L.mb)}mm`;
  const one = (subset, first) => answersHTML({ ...prep, name: first ? prep.name : prep.name + ' (continued)' }, subset, katex, undefined, { logo: !!L.logo });
  host.innerHTML = `<div class="sheet ans-sheet" style="${vars};height:auto;overflow:visible">${one(rows, true)}</div>`;
  const trs = [...host.querySelectorAll('tbody tr')].map(tr => tr.getBoundingClientRect().height / PX_MM);
  const head = host.querySelector('thead').getBoundingClientRect().height / PX_MM;
  const title = host.querySelector('.rule').getBoundingClientRect().bottom / PX_MM - host.firstElementChild.getBoundingClientRect().top / PX_MM;
  const avail = 297 - Math.max(FLOORS.margin, L.mt) - Math.max(FLOORS.margin, L.mb) - title - head - 8;
  const pages = []; let cur = [], used = 0;
  rows.forEach((r, i) => { if (used + trs[i] > avail && cur.length) { pages.push(cur); cur = []; used = 0; } cur.push(r); used += trs[i]; });
  if (cur.length) pages.push(cur);
  return pages.map((pr, pi) => `<div class="sheet ans-sheet" style="${vars}">${one(pr, pi === 0)}</div>`);
}
