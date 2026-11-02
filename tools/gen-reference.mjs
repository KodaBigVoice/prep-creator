// Writes the two files Claude reads before building a sheet for PMU: bank.md (every question option and its key) and for-claude.md (the import format).
// They are published with the site, and tests/reference.test.mjs fails if they are out of date:  npm run docs
import fs from 'fs';
import { entries, generate } from '../src/core/engine.js';
import { needsCalc } from '../src/data/query.js';
import { SETS } from '../src/data/sets.js';
import { MARK_STYLES } from '../src/data/cover.js';

export const SITE = 'https://prep-maths-universe.netlify.app';
export const REPO = 'https://github.com/KodaBigVoice/prep-creator';

const plain = (s) => String(s).replace(/\{\{(.*?)\}\}/g, '$1').replace(/\\dfrac|\\frac/g, '\\frac').replace(/\|/g, '\\|').replace(/\s+/g, ' ').trim();
const clip = (s, n = 42) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

export function bankMd() {
  const all = entries();
  const topics = [...new Set(all.map(e => e.topic))].sort((a, b) => a.localeCompare(b));
  const out = [];
  out.push('# PMU question bank', '',
    `Every question option in PMU (Prep Maths Universe), grouped by topic and listed from easiest to hardest. **${all.length} options in ${topics.length} topics.** This file is generated from the code, so it is always current.`, '',
    'To use an option in an import file, write its **key** exactly as shown: `{ "pick": "pct-buildup:fives" }`. PMU then makes a fresh question with fresh numbers and a checked answer.', '',
    '- **levels**: F = Foundation, C = Core, A = Additional, X = Further (the levels PMU sorts questions into).',
    '- **d**: difficulty on one ladder across the whole bank (about 1 = very easy, 10 = very hard). Use it to ramp a sheet from easy to hard.',
    '- **calc**: `yes` means the question needs a calculator. Leave those out of non-calculator sheets.',
    '- **parts**: how many parts (a), (b)… the option makes. If you set `marks` or `lines` on an option with several parts, give a list with that many numbers.',
    '- **example**: one sample (numbers change every time). `{{…}}` is maths.', '');
  for (const t of topics) {
    const rows = all.filter(e => e.topic === t).sort((a, b) => a.d - b.d || a.ti - b.ti || a.vi - b.vi);
    out.push(`## ${t}`, '', '| key | option | levels | d | calc | parts | example |', '|---|---|---|---|---|---|---|');
    for (const e of rows) {
      let ex = '', parts = 1;
      try { const q = generate(e.key, 7); parts = q.parts.length; const p = q.parts[0]; ex = clip(plain(`${q.stem ? q.stem + ' ' : ''}${p.verb ? p.verb + ' ' : ''}${p.body}`)); } catch (err) { ex = '(none)'; }
      const lv = e.levels.map(l => ({ Foundation: 'F', Core: 'C', Additional: 'A', Further: 'X' }[l])).join('');
      out.push(`| \`${e.key}\` | ${plain(e.type)} › ${plain(e.label)} | ${lv} | ${e.d} | ${needsCalc(e.key) ? 'yes' : ''} | ${parts} | ${ex} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

export function guideMd() {
  const sets = SETS.map(s => `\`${s.id}\``).join(', ');
  const marks = MARK_STYLES.map(([k, l]) => `\`${k}\` (${l.replace(/\s+/g, ' ')})`).join(', ');
  return `# Building a sheet for PMU: the import format

PMU (Prep Maths Universe, ${SITE}) is Tanmay's tool for the weekly prep and class worksheets at a UK prep school. He talks through the sheet he wants with you; when he is happy, **you reply with one JSON file in the format below**. He pastes (or uploads) it into PMU, and PMU builds and prints the sheet in the house style. Nothing is re-checked after import: what you write is what is printed. So be careful with every answer.

Read this file and **[bank.md](${SITE}/bank.md)** (every question option and its key; source: ${REPO}) before you start. If you cannot open them, say so and ask Tanmay to paste them.

## How to work

1. **Talk first.** Ask what he needs if it is not clear: year group and set, topic, how many questions, calculator or non-calculator, how the difficulty should progress, whether it is a worksheet (class, usually answered in books) or a prep (homework, with marks and a time).
2. **Prefer the bank.** A bank question gets fresh numbers and an answer that PMU has already verified. Pick options from bank.md in order of difficulty (the **d** column) so the sheet ramps from easy to hard. Put each section on one idea.
3. **Write a question out in full only when the bank cannot do it**: a specific layout, a context the bank lacks, an exact set of numbers Tanmay wants, or a step in difficulty that no option gives. Do the arithmetic carefully; if you can run code, check every answer.
4. **Then reply with the JSON** in one code block. Add one or two lines of plain text about what you built, and nothing that needs to be pasted.

## The file

One JSON object. No comments, no trailing commas.

\`\`\`json
{
  "pmu": 1,
  "name": "Two-step equations",
  "set": "Y7 Additional",
  "minutes": 30,
  "calculator": "non",
  "layout": { "mode": "qo", "marks": false },
  "sections": [
    { "title": "Two-step equations", "questions": [
      { "pick": "equations-one-step:add" },
      { "pick": "equations-two-step:std", "marks": 2 },
      { "pick": "equations-two-step:cross", "seed": 4821 }
    ] },
    { "title": "Written out", "questions": [
      { "text": "Solve {{3x + 8 = 2}}", "answer": "x = -2", "working": "{{3x = -6;\\\\ x = -2}}", "marks": 2 },
      { "stem": "Mia has {{x}} stickers. Sam has {{3}} more than Mia. Together they have {{17}}.",
        "parts": [
          { "text": "Write an equation for this.", "answer": "x + x + 3 = 17", "marks": 1 },
          { "text": "Solve your equation to find how many stickers Mia has.", "answer": "x = 7", "working": "{{2x + 3 = 17;\\\\ 2x = 14;\\\\ x = 7}}", "marks": 2 }
        ] }
    ] }
  ]
}
\`\`\`

### Top level

| field | required | meaning |
|---|---|---|
| \`pmu\` | yes | always \`1\` |
| \`name\` | no | the title printed at the top of the sheet |
| \`set\` | no | one of ${sets}. Default: the set open in PMU |
| \`minutes\` | no | whole number; only used by a prep's cover and wording |
| \`calculator\` | no | \`"any"\` (default) or \`"non"\` (non-calculator). A label for the sheet and for later re-rolls: it does **not** change the questions you list, so pick non-calculator options yourself |
| \`layout\` | no | \`mode\`: \`"qo"\` questions only (default) or \`"aos"\` answer on sheet (working space after each question). \`marks\`: \`false\` hides the marks. \`nameLine\`: \`false\` removes the Name line (answer-on-sheet only) |
| \`cover\` | no | an exam cover page, see below |
| \`sections\` **or** \`questions\` | yes (one) | \`sections\`: a list of \`{ "title": "…", "questions": [ … ] }\`. Or \`questions\`: one plain list with no headings |

With sections, questions are numbered **A1, A2, … B1, B2, …** automatically and each section gets a "Section A: title" heading. Never write numbers or letters yourself. Do not put a title that repeats the sheet name if there is only one section; leave \`"title": ""\`.

### A question

Exactly one of these three shapes.

**1. From the bank** (one option)

\`\`\`json
{ "pick": "pct-buildup:fives", "seed": 1234, "marks": 2, "lines": 4 }
\`\`\`

- \`pick\`: the key from bank.md, exactly. A wrong key is an error that lists the nearest ones.
- \`seed\`: optional whole number. The same seed always gives the same numbers. Leave it out to get fresh numbers (and PMU makes repeats of one option differ). Give it only to pin an exact question.
- \`marks\`, \`lines\`: optional. Leave them out to use the option's own marks and working space. An option with several parts (see the **parts** column) needs a list: \`"marks": [2, 2, 3]\`.
- \`integer\`: \`false\` allows non-integer answers on options that support it.

**2. Several bank options as parts (a), (b), …**

\`\`\`json
{ "parts": [ { "pick": "equations-one-step:times" }, { "pick": "equations-one-step:div", "seed": 9 } ] }
\`\`\`

**3. Written out in full**

\`\`\`json
{ "text": "Solve {{5x - 4 = 21}}", "answer": "x = 5", "working": "{{5x = 25;\\\\ x = 5}}", "marks": 2, "lines": 3, "calculator": false }
\`\`\`

or, with a stem and parts (a), (b), …: \`{ "stem": "…", "parts": [ { "text": …, "answer": …, "marks": … }, … ] }\`.

- \`text\`: the question. \`answer\`: required. \`working\`: optional, shown in the answer sheet. \`marks\`: whole number 1–20 (default 1). \`lines\`: working space in ruled lines for answer-on-sheet layouts (default is twice the marks, at least 3). \`calculator\`: \`true\` prints a CALCULATOR label.
- \`stem\`: shared text above the parts. A single part needs no stem and gets no (a).
- Never mix \`pick\` and \`text\` inside one question.

### Writing maths

- In \`text\`, \`stem\` and \`working\`, wrap maths in double braces: \`{{ ... }}\`. Inside is LaTeX (KaTeX). Everything outside the braces is plain text. Example: \`"Find {{15\\\\%}} of £{{80}}"\`.
- Use \`\\\\dfrac{3}{4}\` for fractions in questions, \`\\\\times\`, \`\\\\div\`, \`x^2\`, \`\\\\sqrt{}\`. Remember to double each backslash inside JSON (\`\\\\dfrac\` in the file is \`\\dfrac\` in LaTeX).
- Separate the steps of working with \`;\\\\ \` (a semicolon, then a LaTeX space), as in the examples.
- \`answer\` is **LaTeX with no braces**: \`"x = 7"\`, \`"\\\\dfrac{3}{4}"\`, \`"12.5\\\\text{ cm}"\`. Words and units go in \`\\\\text{…}\`. (If you do write \`{{…}}\` in an answer, the text outside becomes \`\\text{…}\`.)
- UK conventions: £ for money, metric units, "pence", and no calculator unless stated. Write minus as \`-\` inside maths.

### Cover page (optional)

\`"cover": true\` adds the default exam cover. Or give any of: \`"title"\`, \`"subtitle"\`, \`"topLine"\` (a string, or \`false\` to hide), \`"bullets"\` (a list of instruction lines; \`**bold**\`, \`{minutes}\` and \`{calc}\` work), \`"box": false\`, \`"name"\`, \`"set"\`, \`"date"\` (\`true\`, \`false\`, or a label), \`"logo"\`, and \`"mark"\`: \`"none"\` or one of ${marks}. Worksheets do not need a cover.

## Conventions Tanmay uses

- **Worksheet** (class, answered in their books): \`"layout": { "mode": "qo", "marks": false }\`, sections by idea, no cover, one topic mostly. A steady ramp inside each section (easiest option first), about 8–12 questions a section.
- **Prep** (homework): marks shown, a sensible \`minutes\` (about 1 minute per 1–2 marks), mixed questions, usually from a preset he already has. Sets: ${sets}.
- Difficulty comes from the **d** column in bank.md. To make a section "harder at the end", choose options with rising d, or write the last few questions out yourself.
- Non-calculator sheets: skip options with \`calc = yes\`, and write \`"calculator": "non"\`.

## If you can run code

With the repo (${REPO}) checked out, \`node tools/check-import.mjs sheet.json\` reads your file exactly as PMU will, prints every error, and lists each question with its answer so you can check them. Fix the errors it names, then hand over the final file.

## If PMU rejects the file

PMU lists each problem with its position, like \`sections[1].questions[3].pick: "pct-buildup:five" is not a key in the bank. Did you mean: "pct-buildup:fives"?\`. Tanmay can paste that list back to you; fix exactly those and send the whole file again.
`;
}

if (process.argv[1] && process.argv[1].endsWith('gen-reference.mjs')) {
  fs.writeFileSync(new URL('../bank.md', import.meta.url), bankMd());
  fs.writeFileSync(new URL('../for-claude.md', import.meta.url), guideMd());
  console.log('wrote bank.md and for-claude.md');
}
