// Turns a "pick" (type + variant) and a seed into a finished question.
import { makeRng, newSeed } from './rng.js';
import ALL from '../types/index.js';
import { VARIANT_D } from '../data/difficulty.js';

export const TYPES = ALL;
export const typeById = Object.fromEntries(ALL.map(t => [t.id, t]));
export const LEVELS = ['Foundation', 'Core', 'Additional', 'Further'];
// the levels an option belongs to: its own list if it has one, otherwise its type's
export const levelsOf = (t, v) => v.levels || t.levels || [];

// Types that were split or renamed keep working: older saved preps and presets still point at the old names.
const ALIAS = {
  'equations-simple': 'equations-one-step',
  'factorise-common': 'factorise-number', 'factorise-common:num': 'factorise-number:two', 'factorise-common:one': 'factorise-number-letter:std', 'factorise-common:two': 'factorise-two-letters:xy',
  'expand-single': 'expand-number', 'expand-single:pos': 'expand-number:pos', 'expand-single:neg': 'expand-number:neg', 'expand-single:two': 'expand-number:two',
  'expand-two-subtract': 'expand-simplify-subtract', 'expand-two-subtract:lin': 'expand-simplify-subtract:lin', 'expand-two-subtract:two': 'expand-simplify-subtract:two',
  'fractions-add': 'fractions-mixed:add-plain', 'fractions-add:plain': 'fractions-mixed:add-plain', 'fractions-add:carry': 'fractions-mixed:add-carry',
  'fractions-subtract': 'fractions-mixed:sub-plain', 'fractions-subtract:plain': 'fractions-mixed:sub-plain', 'fractions-subtract:any': 'fractions-mixed:sub-any', 'fractions-subtract:overlap': 'fractions-mixed:sub-overlap',
  'equations-simple:one': 'equations-one-step:add', 'equations-simple:two': 'equations-two-step:std', 'equations-simple:frac': 'equations-two-step:frac',
  'percentage-of-amount': 'pct-buildup:fives', 'percentage-of-amount:plain': 'pct-buildup:fives', 'percentage-of-amount:worded': 'pct-buildup:ctx',
  'percentage-change': 'pct-change-by:dec', 'percentage-change:decrease': 'pct-change-by:dec', 'percentage-change:increase': 'pct-change-by:inc', 'percentage-change:decrease-calc': 'pct-change-by:dec-calc', 'percentage-change:vat': 'pct-change-by:vat',
  'percentage-change-find': 'pct-find-change:inc', 'percentage-change-find:profit': 'pct-find-change:profit', 'percentage-change-find:increase': 'pct-find-change:inc', 'percentage-change-find:decrease': 'pct-find-change:dec',
  'reverse-percentages': 'pct-reverse:sale', 'reverse-percentages:sale': 'pct-reverse:sale', 'reverse-percentages:increase': 'pct-reverse:increase', 'reverse-percentages:sale-calc': 'pct-reverse:sale-calc',
  'compound-interest': 'pct-compound:interest', 'compound-interest:interest': 'pct-compound:interest', 'compound-interest:depreciation': 'pct-compound:depreciation',
  'ratio-share': 'rp-share2:money', 'ratio-share:two': 'rp-share2:money', 'ratio-share:three': 'rp-share3:money', 'ratio-share:one': 'rp-share2:one',
  'ratio-difference': 'rp-difference:total', 'ratio-difference:total': 'rp-difference:total', 'ratio-difference:other': 'rp-one-share:other',
  'proportion-direct': 'rp-direct:cost', 'proportion-direct:cost': 'rp-direct:cost', 'proportion-direct:recipe': 'rp-recipe:plain',
  'proportion-inverse': 'rp-inverse:workers', 'proportion-inverse:workers': 'rp-inverse:workers',
};
// 'oldType:*' (any option) follows the old type to its new one
export const canon = (p) => { if (ALIAS[p]) return ALIAS[p]; const m = /^(.+):\*$/.exec(p); return m && ALIAS[m[1]] ? ALIAS[m[1]].split(':')[0] + ':*' : p; };

// a pick is "typeId" or "typeId:variantId"
export function parsePick(pick) {
  const [typeId, variantId] = String(canon(pick)).split(':');
  const t = typeById[typeId];
  if (!t) return null;
  const v = t.variants.find(x => x.id === variantId) || t.variants[0];
  return { t, v };
}
export const pickKey = (t, v) => `${t.id}:${v.id}`;

// every selectable thing, flat: used by search and the Topic > Type > Options menus
export const variantD = (t, v) => (v.d ?? VARIANT_D[`${t.id}:${v.id}`] ?? null);
export function entries() {
  const out = [];
  ALL.forEach((t, ti) => {
    const ds = t.variants.map(v => variantD(t, v)).filter(x => x !== null);
    const td = ds.length ? ds.reduce((a, b) => a + b, 0) / ds.length : 5;
    t.variants.forEach((v, vi) => {
      out.push({
        key: pickKey(t, v), typeId: t.id, variantId: v.id, topic: t.topic, type: t.type, label: v.label,
        multipart: !!(v.multipart ?? t.multipart), levels: levelsOf(t, v),
        d: variantD(t, v) ?? 5, td, ti, vi,
        hay: [t.topic, t.type, v.label, t.search || '', t.code || ''].join(' ').toLowerCase(),
      });
    });
  });
  return out;
}
export const defaultFlags = (t) => ({ integer: t.integerDefault !== false });
export const hasIntegerFlag = (t) => !!t.integer;

export function defaultLines(marks) { return Math.max(3, marks * 2); }

export function generate(pick, seed = newSeed(), flags = null) {
  const p = parsePick(pick);
  if (!p) throw new Error('Unknown question type: ' + pick);
  const { t, v } = p;
  const fl = { ...defaultFlags(t), ...(flags || {}) };
  const r = makeRng(seed);
  const raw = t.generate(r, v.params || {}, fl);
  const baseMarks = t.marks || 2;
  const parts = raw.parts.map((pt) => {
    const m = pt.m ?? baseMarks;
    const lines = pt.lines ?? (t.lines ? Math.round((t.lines * m / baseMarks) * 2) / 2 : defaultLines(m));
    return { ...pt, verb: pt.verb ?? t.verb ?? '', m, lines, calc: !!(pt.calc ?? t.calc) };
  });
  return {
    pick: pickKey(t, v), typeId: t.id, seed, flags: fl,
    topic: t.topic, type: t.type, label: v.label, multipart: !!(v.multipart ?? t.multipart),
    stem: raw.stem || null, parts,
  };
}
