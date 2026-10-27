// Arithmetic expression trees with automatic BIDMAS working.
// Build a tree with n(), neg(), br(), bin(); get tex(), value() and steps().
import { F } from './frac.js';

export const n = (v) => ({ t: 'n', v: F.of(v) });
export const neg = (x) => ({ t: 'neg', x });                 // unary minus in front of a term
export const br = (x) => ({ t: 'b', x });                    // brackets
export const bin = (op, l, r) => ({ t: 'bin', op, l, r });   // op: + - * / ^
export const add = (l, r) => bin('+', l, r);
export const sub = (l, r) => bin('-', l, r);
export const mul = (l, r) => bin('*', l, r);
export const div = (l, r) => bin('/', l, r);
export const pow = (l, r) => bin('^', l, r);

export function value(x) {
  switch (x.t) {
    case 'n': return x.v;
    case 'neg': return value(x.x).neg();
    case 'b': return value(x.x);
    case 'bin': {
      const a = value(x.l), b = value(x.r);
      if (x.op === '+') return a.add(b);
      if (x.op === '-') return a.sub(b);
      if (x.op === '*') return a.mul(b);
      if (x.op === '/') return a.div(b);
      if (x.op === '^') return a.pow(b.n);
    }
  }
  throw new Error('bad node');
}

export const texTop = (x) => tex(x, { first: true });
const numTex = (v) => (v.isInt ? String(v.n) : v.mixedTex());
const PREC = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
const prec = (x) => (x.t === 'bin' ? PREC[x.op] : 9);
export function tex(x, ctx = {}) {
  switch (x.t) {
    case 'n': {
      const s = numTex(x.v);
      return x.v.isNeg && (ctx.base || !ctx.first) ? `(${s})` : s;
    }
    case 'neg': return '-' + tex(x.x, { first: true });
    case 'b': return `(${tex(x.x, { first: true })})`;
    case 'bin': {
      if (x.op === '^') {
        const l = tex(x.l, { base: true, first: ctx.first });
        const lp = x.l.t === 'bin' || x.l.t === 'neg';
        return `${lp ? `(${l})` : l}^{${tex(x.r)}}`;
      }
      const sym = { '+': '+', '-': '-', '*': '\\times', '/': '\\div' }[x.op];
      let l = tex(x.l, { first: ctx.first }); let r = tex(x.r, { right: true });
      if (prec(x.l) < PREC[x.op]) l = `(${l})`;
      if (prec(x.r) <= PREC[x.op] && x.r.t === 'bin') r = `(${r})`;
      return `${l} ${sym} ${r}`;
    }
  }
}
// no node anywhere may divide to a non-integer / go beyond limits
export function allIntegers(x, limit = 1e6) {
  const ok = (v) => v.isInt && Math.abs(v.n) <= limit;
  switch (x.t) {
    case 'n': return ok(x.v);
    case 'neg': case 'b': return allIntegers(x.x, limit) && ok(value(x));
    case 'bin': return allIntegers(x.l, limit) && allIntegers(x.r, limit) && ok(value(x));
  }
}

const mapT = (x, f) => {
  switch (x.t) {
    case 'n': return x;
    case 'neg': return neg(mapT(x.x, f));
    case 'b': return f(br(mapT(x.x, f)));
    case 'bin': return f(bin(x.op, mapT(x.l, f), mapT(x.r, f)));
  }
};
const hasType = (x, pred) => {
  if (pred(x)) return true;
  if (x.t === 'neg' || x.t === 'b') return hasType(x.x, pred);
  if (x.t === 'bin') return hasType(x.l, pred) || hasType(x.r, pred);
  return false;
};
// reduce stage by stage:  brackets, then powers, then × ÷, then + −
const stageBrackets = (x) => { const f = (y) => (y.t === 'b' ? n(value(y)) : y); return mapT(x, f); };
const stagePowers = (x) => mapT(x, (y) => (y.t === 'bin' && y.op === '^' ? n(value(y)) : y));
const stageMulDiv = (x) => mapT(x, (y) => (y.t === 'bin' && (y.op === '*' || y.op === '/') ? n(value(y)) : y));
const stageNeg = (x) => mapT(x, (y) => (y.t === 'neg' && y.x.t === 'n' ? n(value(y)) : y));

// returns list of tex strings: the successive lines of working (not including the original)
export function steps(x) {
  const out = []; let cur = x; let last = texTop(x);
  const stages = [stageBrackets, stagePowers, stageNeg, stageMulDiv];
  for (const s of stages) {
    const nx = s(cur); const t = texTop(nx);
    if (t !== last) { out.push(t); last = t; cur = nx; }
  }
  const fin = numTex(value(cur));
  if (fin !== last) out.push(fin);
  return out;
}
export const working = (x) => { const s = steps(x); return `${texTop(x)} = ${s.join(' = ')}`; };
export { hasType };
