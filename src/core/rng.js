// Seeded random numbers. The same seed always gives the same question.
export function makeRng(seed) {
  let a = (seed >>> 0) || 1;
  const next = () => {            // mulberry32
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const r = {
    next,
    int: (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)),          // inclusive
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    chance: (p = 0.5) => next() < p,
    sign: () => (next() < 0.5 ? -1 : 1),
    shuffle: (arr) => { const x = arr.slice(); for (let i = x.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [x[i], x[j]] = [x[j], x[i]]; } return x; },
    sample: (arr, k) => r.shuffle(arr).slice(0, k),
    // keep calling fn until it returns something other than null/false (constraint solving)
    until: (fn, tries = 2000) => {
      for (let i = 0; i < tries; i++) { const v = fn(); if (v !== null && v !== undefined && v !== false) return v; }
      throw new Error('constraint solver gave up after ' + tries + ' tries');
    },
  };
  return r;
}
export const newSeed = () => (Math.floor(Math.random() * 2 ** 31) + 1);
