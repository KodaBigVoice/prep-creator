# PMU: Prep Maths Universe

A web app for building maths prep worksheets: pick a preset (or build one), get a fresh set of numbers every time, and print to PDF — questions only, or with working space on the sheet — plus an answers PDF.

It is a plain static site: no build step, no server, nothing to install to *use* it.

## Putting it online (GitHub + Netlify)

1. Create a new GitHub repository (private is fine) and upload everything in this folder (drag the files into the GitHub page, or `git push`).
2. In Netlify choose **Add new site → Import an existing project**, pick the repository.
3. Leave the build command empty and set the publish directory to `.` (the included `netlify.toml` already says this). Deploy.
4. Open the site in Edge. Every time you change the files on GitHub, Netlify republishes automatically.

To try it on your own computer first: in this folder run `python3 -m http.server 8765` and open <http://localhost:8765>. (Opening `index.html` by double-click will not work: browsers block the app's modules from `file://`.)

## Printing

Press **Print…** in the app, then **Prep-style PDF** (or **Exam-style PDF**, or **Answers PDF**). In the Edge print window choose: Destination **Save as PDF**, Paper size **A4**, Margins **None**, Scale **100**, and turn **Headers and footers** off.

## Your history file

Everything you save (preps, presets, settings) is kept in the browser and can be downloaded as one file from **History → Download history file**. Open it on another computer from **History → Open history file…**. Download one now and then as a backup.

## Adding a new kind of question (maintainer notes)

1. Copy an existing file in `src/types/` (e.g. `percentage-of-amount.js`) and change it. Each type has an `id`, `topic`, `type`, `levels`, `verb`, `marks`, `lines`, `variants`, and a `generate(r, params, flags)` function returning `{stem?, parts:[{body, a, w, m, lines, chk}]}`. Maths goes inside `{{ ... }}` as KaTeX; answers are raw TeX.
2. Add one import line and list entry in `src/types/index.js`.
3. Run `node tests/check.mjs` (structure, KaTeX, wording checks) and `npm run verify` (needs Python with sympy: re-computes every generated answer independently).

Other useful pieces: `src/data/presets.js` (starter presets), `src/data/sets.js` (sets, minutes, rubric), `src/layout/` (pagination), `tools/sample.mjs` (prints one example of every question type).

Maths is rendered with KaTeX (vendored in `vendor/`, MIT licence).
