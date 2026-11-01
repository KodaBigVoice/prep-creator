// The cover page of an exam: every field can be switched off. Text can use **bold**, and two tokens: {minutes} and {calc}.
import { setById } from './sets.js';

const uid = () => Math.random().toString(36).slice(2, 8);
export const MARK_STYLES = [
  ['total', 'Mark out of the total  (Mark ___ / 84)'],
  ['mark', 'Mark only  (Mark ___)'],
  ['pct', 'Percentage  (___ %)'],
  ['both', 'Mark and percentage'],
];

// "YEAR 7 MICHAELMAS 2026": the school year, the term (Sep-Dec Michaelmas, Jan-Mar Lent, Apr-Jul Summer) and the calendar year
export function termLine(setId, date = new Date()) {
  const set = setById[setId], m = date.getMonth() + 1;
  const term = m >= 9 ? 'Michaelmas' : m <= 3 ? 'Lent' : 'Summer';
  const year = set ? set.year.replace(/^Y/, 'Year ') : '';
  return `${year} ${term} ${date.getFullYear()}`.trim();
}

// The first cover for a prep. Wording is the one used on Tanmay's paper: instructions that suit every paper are on, the paper-specific ones are there but switched off.
export function defaultCover(setId) {
  const b = (text, on = true) => ({ id: 'b' + uid(), text, on });
  return {
    on: false,
    topLine: { on: true, text: termLine(setId), auto: true },
    title: { on: true, text: 'Mathematics' },
    subtitle: { on: false, text: '' },
    box: { on: true },
    bullets: [
      b('This paper is **{minutes} minutes**.'),
      b('Calculators **{calc}** permitted.'),
      b('You should show **clear working** on all questions worth more than one mark.'),
      b('Try to answer all the questions, but do not worry if you do not finish.'),
      b('Fractions should be written in their **simplest form**, and improper fractions should be converted to **mixed numbers**.', false),
      b('Diagrams are **not** to scale.', false),
      b('This paper is designed to be challenging and lengthy: you are encouraged not to spend too long on any one question.', false),
    ],
    name: { on: true, label: 'Name' },
    set: { on: true, label: 'Set' },
    date: { on: false, label: 'Date' },
    mark: { on: false, style: 'total' },
    logo: { on: false },
  };
}
// a cover kept from before (or from another prep) with any new fields filled in
export function mergeCover(c, setId) {
  const d = defaultCover(setId);
  const out = { ...d, ...(c || {}) };
  for (const k of Object.keys(d)) if (typeof d[k] === 'object' && !Array.isArray(d[k]) && c && c[k]) out[k] = { ...d[k], ...c[k] };
  if (!Array.isArray(out.bullets) || !out.bullets.length) out.bullets = d.bullets;
  if (out.topLine.auto) out.topLine.text = d.topLine.text;
  return out;
}

const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// text with **bold** and the tokens filled in, as safe HTML
export function richText(text, { minutes, calcOnly }) {
  const t = String(text).replace(/\{minutes\}/g, String(minutes)).replace(/\{calc\}/g, calcOnly ? 'are not' : 'are');
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}
// what the mark box says, given the total
export function markBoxParts(style, total) {
  if (style === 'mark') return [{ label: 'Mark', tail: '' }];
  if (style === 'pct') return [{ label: 'Percentage', tail: '%' }];
  if (style === 'both') return [{ label: 'Mark', tail: `/ ${total}` }, { label: 'Percentage', tail: '%' }];
  return [{ label: 'Mark', tail: `/ ${total}` }];
}
