// Page planner. Pure functions (no DOM) so they can be unit-tested.
//
// A "unit" is the smallest block that is never split: a whole question, or (if splitting is
// switched on) a group of parts of a question.
//   unit = { fixed: mm that never stretches (text, gaps, working boxes set by hand),
//            flex:  number of ruled lines of designated working space that may stretch/squash }
// The planner chooses the fewest pages that hold everything with the working space squashed by
// no more than `squash` and puts the questions on pages so that the pages are evenly filled.

const ln = Math.log;

export function planPages(units, o) {
  const { cap1, capN, lineMM, squash = 0.85, stretch = 1.3, splitPenalty = 0.6 } = o;
  const n = units.length;
  const warnings = [];
  if (!n) return { pages: [{ idx: [], factor: 1, free: cap1 }], warnings };
  const pre = { fixed: [0], flex: [0], marks: [0] };
  units.forEach((u, i) => { pre.fixed.push(pre.fixed[i] + u.fixed); pre.flex.push(pre.flex[i] + u.flex); pre.marks.push(pre.marks[i] + (u.marks || 0)); });
  const capOf = (page) => (page === 0 ? cap1 : capN);
  // factor needed so units [a,b) exactly fill a page of capacity c; Infinity when nothing stretches
  const factorFor = (a, b, page) => {
    const fixed = pre.fixed[b] - pre.fixed[a], flex = (pre.flex[b] - pre.flex[a]) * lineMM, c = capOf(page);
    if (fixed > c + 1e-6) return -1;                       // does not fit even with no working space
    if (flex <= 1e-9) return Infinity;
    return (c - fixed) / flex;
  };
  const feasible = (f) => f >= squash - 1e-9;
  const cost = (f, a, b) => {
    const g = f === Infinity ? stretch * 1.5 : Math.min(f, 4);
    return ln(g) ** 2;
  };
  let best = null;
  for (let P = 1; P <= n && !best; P++) {
    // dp[p][j] = min cost placing the first j units on pages 0..p-1
    const dp = Array.from({ length: P + 1 }, () => Array(n + 1).fill(Infinity));
    const from = Array.from({ length: P + 1 }, () => Array(n + 1).fill(-1));
    dp[0][0] = 0;
    for (let p = 1; p <= P; p++) for (let j = p; j <= n; j++) for (let i = p - 1; i < j; i++) {
      if (dp[p - 1][i] === Infinity) continue;
      const f = factorFor(i, j, p - 1);
      if (f < 0 || !feasible(f)) continue;
      const c = dp[p - 1][i] + cost(f, i, j) + (i > 0 && units[i].cont ? splitPenalty : 0);
      if (c < dp[p][j]) { dp[p][j] = c; from[p][j] = i; }
    }
    if (dp[P][n] < Infinity) {
      const cuts = []; let j = n;
      for (let p = P; p >= 1; p--) { const i = from[p][j]; cuts.unshift([i, j]); j = i; }
      best = cuts;
    }
  }
  if (!best) {
    // something is taller than a page: put each question on as many pages as needed, flag it
    best = []; let start = 0, page = 0;
    for (let i = 0; i < n; i++) {
      const f = factorFor(start, i + 1, page);
      if (f < 0 || !feasible(f)) {
        if (i > start) { best.push([start, i]); start = i; page++; }
        if (factorFor(start, i + 1, page) < 0) warnings.push({ type: 'tall', unit: i, text: `Question ${units[i].label || i + 1} is taller than a page. Turn on “allow a question to split between parts” or reduce its working space.` });
      }
    }
    best.push([start, n]);
  }
  const pages = best.map(([a, b], p) => {
    const f = factorFor(a, b, p);
    const factor = f === Infinity ? 1 : Math.max(squash, Math.min(stretch, f));
    const used = (pre.fixed[b] - pre.fixed[a]) + (pre.flex[b] - pre.flex[a]) * lineMM * factor;
    return { idx: Array.from({ length: b - a }, (_, k) => a + k), factor, free: capOf(p) - used, fit: f, marks: pre.marks[b] - pre.marks[a] };
  });
  return { pages, warnings };
}

// Questions-only: choose the largest text size that fits.
//   measureAt(pt) -> { units: [{fixed, marks}], cap1, capN }  (heights measured at that size)
export function planQuestionsOnly(measureAt, o) {
  const { minPt = 10, maxPt = 12, step = 0.5, minGap = 3 } = o;
  for (let pages = 1; pages <= 6; pages++) {
    for (let pt = maxPt; pt >= minPt - 1e-9; pt -= step) {
      const m = measureAt(pt);
      const units = m.units.map(u => ({ ...u, fixed: u.fixed + minGap, flex: 0 }));
      const cap1 = m.cap1 + minGap, capN = m.capN + minGap;
      const plan = planPages(units, { cap1, capN, lineMM: 1, squash: 0.01, stretch: 1 });
      if (!plan.warnings.length && plan.pages.length <= pages) return { pt, plan, m };
    }
  }
  const m = measureAt(minPt);
  const units = m.units.map(u => ({ ...u, fixed: u.fixed + minGap, flex: 0 }));
  return { pt: minPt, plan: planPages(units, { cap1: m.cap1 + minGap, capN: m.capN + minGap, lineMM: 1, squash: 0.01, stretch: 1 }), m, overfull: true };
}
