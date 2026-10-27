// helpers for the linear-equation types
import { F } from '../core/frac.js';
export const xAns = (f, v = 'x') => `${v} = ${f.mixedTex()}`;
export const showF = (f) => (f.isInt ? String(f.n) : f.mixedTex());
