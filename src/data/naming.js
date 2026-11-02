// Suggest a name like "Y7 Prep M5": term letter (M Sep-Dec, L Jan-Mar, S Apr-Jul; August counts as M)
// plus one more than the highest number already used for that year group and term in this academic year.
export function termOf(d) {
  const m = d.getMonth();                       // 0 = Jan
  if (m >= 8 || m === 7) return 'M';            // Aug-Dec
  if (m <= 2) return 'L';                       // Jan-Mar
  return 'S';                                   // Apr-Jul
}
export function academicYearStart(d) {          // academic year starts 1 August
  return d.getMonth() >= 7 ? d.getFullYear() : d.getFullYear() - 1;
}
export function suggestName(set, history, now = new Date()) {
  const year = set.year, term = termOf(now), ay = academicYearStart(now);
  const re = new RegExp(`^${year} Prep ${term}(\\d+)$`);
  let max = 0;
  for (const h of history) {
    if (h.set !== set.id) continue;
    const created = new Date(h.created || h.saved || 0);
    if (academicYearStart(created) !== ay) continue;
    const m = re.exec((h.name || '').trim());
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${year} Prep ${term}${max + 1}`;
}
