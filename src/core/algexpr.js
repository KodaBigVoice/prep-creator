// A tiny parser for algebra like "3a^2 - 2bc" so one description gives:
//   the algebraic TeX, the substituted numeric working, and the exact value.
import { F } from './frac.js';
import * as A from './arith.js';

export function parse(src) {
  const toks = src.match(/\d+(\.\d+)?|[a-zR]|[-+*/^()]/g);
  let i = 0;
  const peek = () => toks[i], eat = () => toks[i++];
  const isAtomStart = (t) => t !== undefined && (/^[a-z(]$/.test(t) || /^\d/.test(t));
  function expr() { let l = term(); while (peek() === '+' || peek() === '-') { const op = eat(); l = A.bin(op, l, term()); } return l; }
  function term() {
    let l = unary();
    for (;;) {
      if (peek() === '*' || peek() === '/') { const op = eat(); l = A.bin(op, l, unary()); }
      else if (peek() !== undefined && /^[a-zR(]$/.test(peek())) l = A.bin('*', l, power());     // implicit multiplication: 2a, ab, 3(a+b)
      else return l;
    }
  }
  function unary() { if (peek() === '-') { eat(); return A.neg(unary()); } return power(); }
  function power() { const b = atom(); if (peek() === '^') { eat(); return A.bin('^', b, A.n(Number(eat()))); } return b; }
  function atom() {
    const t = eat();
    if (t === '(') { const e = expr(); eat(); return A.br(e); }
    if (t === 'R') { const inner = atom(); return A.sqrt(inner.t === 'b' ? inner.x : inner); }       // R(a^2+b^2) is a square root
    if (/^[a-z]$/.test(t)) return { t: 'v', name: t };
    return A.n(F.of(Number(t)));
  }
  const e = expr();
  if (i !== toks.length) throw new Error('parse error in ' + src);
  return e;
}

const isVarish = (x) => x.t === 'v' || (x.t === 'bin' && x.op === '^' && x.l.t === 'v') || x.t === 'b' || (x.t === 'bin' && x.op === '*' && isVarish(x.l));
// algebraic TeX. o.div: show / as a division sign, not a fraction line.  o.vars: swap a letter for text, e.g. {a: '(x + 1)'}
export function texAlg(x, top = true, o = {}) {
  switch (x.t) {
    case 'v': return o.vars && o.vars[x.name] !== undefined ? o.vars[x.name] : x.name;
    case 'n': return x.v.isInt ? String(x.v.n) : x.v.tex();
    case 'neg': return '-' + texAlg(x.x, false, o);
    case 'b': return `(${texAlg(x.x, true, o)})`;
    case 'sqrt': return `\\sqrt{${texAlg(x.x, true, o)}}`;
    case 'bin': {
      const L = texAlg(x.l, false, o), R = texAlg(x.r, false, o);
      if (x.op === '^') { const base = x.l.t === 'bin' ? `(${L})` : L; return `${base}^{${R}}`; }
      if (x.op === '/') {
        const un = (y) => (y.t === 'b' ? y.x : y);
        if (o.div) return `${texAlg(x.l, false, o)} \\div ${x.r.t === 'bin' ? `(${R})` : R}`;
        return `\\dfrac{${texAlg(un(x.l), true, o)}}{${texAlg(un(x.r), true, o)}}`;
      }
      if (x.op === '*') {
        const lw = x.l.t === 'bin' && (x.l.op === '+' || x.l.op === '-') ? `(${L})` : L;
        const rw = x.r.t === 'bin' && (x.r.op === '+' || x.r.op === '-') ? `(${R})` : R;
        if ((x.l.t === 'n' && x.r.t !== 'n') || (x.l.t !== 'n' && x.r.t !== 'n')) return `${lw}${rw}`;
        return `${lw} \\times ${rw}`;
      }
      return `${L} ${x.op} ${R}`;
    }
  }
}
// replace letters by numbers (returns an arith tree)
export function subst(x, vals) {
  switch (x.t) {
    case 'v': return A.n(F.of(vals[x.name]));
    case 'n': return x;
    case 'neg': return A.neg(subst(x.x, vals));
    case 'b': return A.br(subst(x.x, vals));
    case 'sqrt': return A.sqrt(subst(x.x, vals));
    case 'bin': return A.bin(x.op, subst(x.l, vals), subst(x.r, vals));
  }
}
// substituted tree, with a coefficient-times-letter kept as a product; wrap negatives
export function evalAlg(x, vals) {
  return A.value(subst(x, vals));
}
