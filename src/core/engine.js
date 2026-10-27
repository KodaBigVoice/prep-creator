// Turns a "pick" (type + variant) and a seed into a finished question.
import { makeRng, newSeed } from './rng.js';
import ALL from '../types/index.js';
import { VARIANT_D } from '../data/difficulty.js';

export const TYPES = ALL;
export const typeById = Object.fromEntries(ALL.map(t => [t.id, t]));
export const LEVELS = ['Foundation', 'Core', 'Additional'];

// a pick is "typeId" or "typeId:variantId"
export function parsePick(pick) {
  const [typeId, variantId] = String(pick).split(':');
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
        multipart: !!t.multipart, levels: t.levels || [],
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
    topic: t.topic, type: t.type, label: v.label, multipart: !!t.multipart,
    stem: raw.stem || null, parts,
  };
}
