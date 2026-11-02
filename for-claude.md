# Building a sheet for PMU: the import format

PMU (Prep Maths Universe, https://prep-maths-universe.netlify.app) is Tanmay's tool for the weekly prep and class worksheets at a UK prep school. He talks through the sheet he wants with you; when he is happy, **you reply with one JSON file in the format below**. He pastes (or uploads) it into PMU, and PMU builds and prints the sheet in the house style. Nothing is re-checked after import: what you write is what is printed. So be careful with every answer.

Read this file and **[bank.md](https://prep-maths-universe.netlify.app/bank.md)** (every question option and its key; source: https://github.com/KodaBigVoice/prep-creator) before you start. If you cannot open them, say so and ask Tanmay to paste them.

## How to work

1. **Talk first.** Ask what he needs if it is not clear: year group and set, topic, how many questions, calculator or non-calculator, how the difficulty should progress, whether it is a worksheet (class, usually answered in books) or a prep (homework, with marks and a time).
2. **Prefer the bank.** A bank question gets fresh numbers and an answer that PMU has already verified. Pick options from bank.md in order of difficulty (the **d** column) so the sheet ramps from easy to hard. Put each section on one idea.
3. **Write a question out in full only when the bank cannot do it**: a specific layout, a context the bank lacks, an exact set of numbers Tanmay wants, or a step in difficulty that no option gives. Do the arithmetic carefully; if you can run code, check every answer.
4. **Then reply with the JSON** in one code block. Add one or two lines of plain text about what you built, and nothing that needs to be pasted.

## The file

One JSON object. No comments, no trailing commas.

```json
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
      { "text": "Solve {{3x + 8 = 2}}", "answer": "x = -2", "working": "{{3x = -6;\\ x = -2}}", "marks": 2 },
      { "stem": "Mia has {{x}} stickers. Sam has {{3}} more than Mia. Together they have {{17}}.",
        "parts": [
          { "text": "Write an equation for this.", "answer": "x + x + 3 = 17", "marks": 1 },
          { "text": "Solve your equation to find how many stickers Mia has.", "answer": "x = 7", "working": "{{2x + 3 = 17;\\ 2x = 14;\\ x = 7}}", "marks": 2 }
        ] }
    ] }
  ]
}
```

### Top level

| field | required | meaning |
|---|---|---|
| `pmu` | yes | always `1` |
| `name` | no | the title printed at the top of the sheet |
| `set` | no | one of `Y6 Core`, `Y6 Additional`, `Y7 Core`, `Y7 Additional`, `Y8 Foundation`, `Y8 Core`, `Y8 Additional`. Default: the set open in PMU |
| `minutes` | no | whole number; only used by a prep's cover and wording |
| `calculator` | no | `"any"` (default) or `"non"` (non-calculator). A label for the sheet and for later re-rolls: it does **not** change the questions you list, so pick non-calculator options yourself |
| `layout` | no | `mode`: `"qo"` questions only (default) or `"aos"` answer on sheet (working space after each question). `marks`: `false` hides the marks. `nameLine`: `false` removes the Name line (answer-on-sheet only) |
| `cover` | no | an exam cover page, see below |
| `sections` **or** `questions` | yes (one) | `sections`: a list of `{ "title": "…", "questions": [ … ] }`. Or `questions`: one plain list with no headings |

With sections, questions are numbered **A1, A2, … B1, B2, …** automatically and each section gets a "Section A: title" heading. Never write numbers or letters yourself. Do not put a title that repeats the sheet name if there is only one section; leave `"title": ""`.

### A question

Exactly one of these three shapes.

**1. From the bank** (one option)

```json
{ "pick": "pct-buildup:fives", "seed": 1234, "marks": 2, "lines": 4 }
```

- `pick`: the key from bank.md, exactly. A wrong key is an error that lists the nearest ones.
- `seed`: optional whole number. The same seed always gives the same numbers. Leave it out to get fresh numbers (and PMU makes repeats of one option differ). Give it only to pin an exact question.
- `marks`, `lines`: optional. Leave them out to use the option's own marks and working space. An option with several parts (see the **parts** column) needs a list: `"marks": [2, 2, 3]`.
- `integer`: `false` allows non-integer answers on options that support it.

**2. Several bank options as parts (a), (b), …**

```json
{ "parts": [ { "pick": "equations-one-step:times" }, { "pick": "equations-one-step:div", "seed": 9 } ] }
```

**3. Written out in full**

```json
{ "text": "Solve {{5x - 4 = 21}}", "answer": "x = 5", "working": "{{5x = 25;\\ x = 5}}", "marks": 2, "lines": 3, "calculator": false }
```

or, with a stem and parts (a), (b), …: `{ "stem": "…", "parts": [ { "text": …, "answer": …, "marks": … }, … ] }`.

- `text`: the question. `answer`: required. `working`: optional, shown in the answer sheet. `marks`: whole number 1–20 (default 1). `lines`: working space in ruled lines for answer-on-sheet layouts (default is twice the marks, at least 3). `calculator`: `true` prints a CALCULATOR label.
- `stem`: shared text above the parts. A single part needs no stem and gets no (a).
- Never mix `pick` and `text` inside one question.

### Writing maths

- In `text`, `stem` and `working`, wrap maths in double braces: `{{ ... }}`. Inside is LaTeX (KaTeX). Everything outside the braces is plain text. Example: `"Find {{15\\%}} of £{{80}}"`.
- Use `\\dfrac{3}{4}` for fractions in questions, `\\times`, `\\div`, `x^2`, `\\sqrt{}`. Remember to double each backslash inside JSON (`\\dfrac` in the file is `\dfrac` in LaTeX).
- Separate the steps of working with `;\\ ` (a semicolon, then a LaTeX space), as in the examples.
- `answer` is **LaTeX with no braces**: `"x = 7"`, `"\\dfrac{3}{4}"`, `"12.5\\text{ cm}"`. Words and units go in `\\text{…}`. (If you do write `{{…}}` in an answer, the text outside becomes `\text{…}`.)
- UK conventions: £ for money, metric units, "pence", and no calculator unless stated. Write minus as `-` inside maths.

### Cover page (optional)

`"cover": true` adds the default exam cover. Or give any of: `"title"`, `"subtitle"`, `"topLine"` (a string, or `false` to hide), `"bullets"` (a list of instruction lines; `**bold**`, `{minutes}` and `{calc}` work), `"box": false`, `"name"`, `"set"`, `"date"` (`true`, `false`, or a label), `"logo"`, and `"mark"`: `"none"` or one of `total` (Mark out of the total (Mark ___ / 84)), `mark` (Mark only (Mark ___)), `pct` (Percentage (___ %)), `both` (Mark and percentage). Worksheets do not need a cover.

## Conventions Tanmay uses

- **Worksheet** (class, answered in their books): `"layout": { "mode": "qo", "marks": false }`, sections by idea, no cover, one topic mostly. A steady ramp inside each section (easiest option first), about 8–12 questions a section.
- **Prep** (homework): marks shown, a sensible `minutes` (about 1 minute per 1–2 marks), mixed questions, usually from a preset he already has. Sets: `Y6 Core`, `Y6 Additional`, `Y7 Core`, `Y7 Additional`, `Y8 Foundation`, `Y8 Core`, `Y8 Additional`.
- Difficulty comes from the **d** column in bank.md. To make a section "harder at the end", choose options with rising d, or write the last few questions out yourself.
- Non-calculator sheets: skip options with `calc = yes`, and write `"calculator": "non"`.

## If you can run code

With the repo (https://github.com/KodaBigVoice/prep-creator) checked out, `node tools/check-import.mjs sheet.json` reads your file exactly as PMU will, prints every error, and lists each question with its answer so you can check them. Fix the errors it names, then hand over the final file.

## If PMU rejects the file

PMU lists each problem with its position, like `sections[1].questions[3].pick: "pct-buildup:five" is not a key in the bank. Did you mean: "pct-buildup:fives"?`. Tanmay can paste that list back to you; fix exactly those and send the whole file again.
