// HTML for the printed sheets. Math is written {{like this}} in the question text.
import { LOGO_URI } from '../data/logo.js';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function mathToHTML(s, katex) {
  let out = '', i = 0;
  while (i < s.length) {
    if (s[i] === '{' && s[i + 1] === '{') {
      let j = i + 2, d = 0;
      for (; j < s.length; j++) { if (s[j] === '{') d++; else if (s[j] === '}') { if (d > 0) d--; else if (s[j + 1] === '}') break; } }
      let h;
      try { const tex = s.slice(i + 2, j); const blk = /\\begin\{aligned\}/.test(tex); h = katex.renderToString(tex, { throwOnError: true, output: 'html', displayMode: blk }); if (blk) h = `<span class="mblock">${h}</span>`; } catch (e) { h = `<span style="color:#b00">[maths error]</span>`; }
      out += h; i = j + 2;
    } else { out += esc(s[i]); i++; }
  }
  return out;
}

export const CALC = '<span class="calc">CALCULATOR</span>';
const isFrac = (t) => /dfrac/.test(t);

// ---- questions only -------------------------------------------------------
export function qoHTML(q, katex, { stemNoNum } = {}) {
  const T = (s) => mathToHTML(s, katex);
  const calcInStem = q.calc && q.stem;
  const lead = q.stem ? `<div class="lead">${calcInStem ? CALC : ''}${T(q.stem)}</div>` : '';
  const parts = q.parts.map((p, i) => {
    const calcHere = q.calc && !q.stem && i === 0;
    const label = p.l ? `<div>(${p.l})</div>` : '';
    return `<div class="part${p.l ? '' : ' nolabel'}${isFrac(p.text) ? ' fr' : ''}">${label}<div>${calcHere ? CALC : ''}${T(p.text)}</div><div class="mk">[${p.marks}]</div></div>`;
  }).join('');
  return `<div class="q"><div class="num">${q.n}.</div><div class="qmain">${lead}${parts}</div></div>`;
}

// ---- answer on sheet ------------------------------------------------------
// A unit is questions q, parts [pa, pb). `textOnly` gives the text rows with the working rows left out (for measuring).
export function aosHTML(unit, q, katex, { lineMM, factors, first, textOnly }) {
  const T = (s) => mathToHTML(s, katex);
  const rows = [];
  let numShown = !unit.firstOfQuestion;
  const num = () => { const h = numShown ? '' : `<div class="num" style="grid-column:1">${q.n}.</div>`; numShown = true; return h; };
  let cls = () => (rows.length === 0 && unit.firstOfQuestion && !first ? 'qstart' : '');
  if (unit.firstOfQuestion && q.stem) {
    rows.push(`<div class="frow ${cls()}">${num()}<div style="grid-column:2/4">${q.calc ? CALC : ''}${T(q.stem)}</div></div>`);
  }
  for (let k = unit.pa; k < unit.pb; k++) {
    const p = q.parts[k];
    const calcHere = q.calc && !q.stem && k === 0;
    const lab = p.l ? `<div style="grid-column:2">(${p.l})</div>` : '';
    const tx = p.l ? `<div style="grid-column:3">${T(p.text)}</div>` : `<div style="grid-column:2/4">${calcHere ? CALC : ''}${T(p.text)}</div>`;
    rows.push(`<div class="frow ${cls()}${isFrac(p.text) ? ' fr' : ''}">${num()}${lab}${tx}</div>`);
    if (!textOnly) {
      const h = p.lines * lineMM * (p.linesManual ? 1 : factors);
      rows.push(`<div class="fws" style="height:${h.toFixed(2)}mm"><span class="mk">[${p.marks}]</span></div>`);
    }
  }
  return rows.join('');
}

const logoHTML = () => `<img class="logo" src="${LOGO_URI}" alt="">`;
export function headHTML(prep, katex, { rubric, name, logo }) {
  const nameBit = name ? `<div class="name">Name<span></span></div>` : '';
  const rub = rubric && prep.rubricOn ? `<div class="intro">${esc(prep.rubricText)}</div>` : '';
  return `<div class="head${logo ? ' has-logo' : ''}"><h1>${esc(prep.name)}</h1>${nameBit}${logo ? logoHTML() : ''}</div>${rub}<hr class="rule">`;
}
export function runHeadHTML(prep, page) {
  return `<div class="runhead"><span>${esc(prep.name)}</span><span>Page ${page}</span></div><hr class="runrule">`;
}

// ---- answers table --------------------------------------------------------
export function answersHTML(prep, rows, katex, pageCount, { logo = false } = {}) {
  const body = rows.map(r => `<tr><td class="c1">${r.ref}</td><td class="c2">${katex.renderToString(r.a, { throwOnError: false })}${r.edited ? '<span class="by-hand">written by you</span>' : ''}</td><td class="c3">${mathToHTML(r.w, katex)}</td></tr>`).join('');
  return `<div class="head${logo ? ' has-logo' : ''}"><h1>${esc(prep.name)} – Answers</h1>${logo ? logoHTML() : ''}</div><hr class="rule"><table class="at"><thead><tr><th class="c1">Q</th><th class="c2">Answer</th><th class="c3">Working</th></tr></thead><tbody>${body}</tbody></table>`;
}
