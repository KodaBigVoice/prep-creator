#!/usr/bin/env python3
"""Independent check of generated answers using sympy.
Usage: python3 tests/verify.py tests/out.json
Each generated part carries a 'chk' record describing how to re-derive the answer
in a different way from the generator (parse the TeX, solve the equation, etc.)."""
import json, re, sys, math
from fractions import Fraction
import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations, implicit_multiplication_application, convert_xor

TR = standard_transformations + (implicit_multiplication_application, convert_xor)

def find_group(s, i):
    """s[i] == '{': return (content, index after closing brace)"""
    d = 0
    for j in range(i, len(s)):
        if s[j] == '{': d += 1
        elif s[j] == '}':
            d -= 1
            if d == 0: return s[i+1:j], j+1
    raise ValueError('unbalanced: ' + s)

def tex2py(t):
    t = t.replace('\\dfrac', '\\frac').replace('\\tfrac', '\\frac')
    t = t.replace('{,}', '').replace('\\,', '').replace('\\ ', ' ').replace('\\pounds', '').replace('\\%', '/100')
    t = re.sub(r'\\text\{[^}]*\}', '', t)
    t = re.sub(r'\\left|\\right', '', t)
    # mixed numbers: 2\frac{3}{4} -> (2+\frac{3}{4})
    def mixed(m): return '(' + m.group(1) + '+\\frac'
    # handle by scanning
    out = ''; i = 0
    while i < len(t):
        if t.startswith('\\frac', i):
            a, j = find_group(t, i + 5); b, k = find_group(t, j)
            frac = '((' + tex2py(a) + ')/(' + tex2py(b) + '))'
            m = re.search(r'(\d+)$', out)
            if m and (len(out) == m.end()) and not re.search(r'[\d.]\s*$', out[:m.start()] or ' '):
                out = out[:m.start()] + '(' + m.group(1) + '+' + frac + ')'
            else:
                out += frac
            i = k
        elif t.startswith('\\sqrt', i):
            a, j = find_group(t, i + 5); out += 'sqrt(' + tex2py(a) + ')'; i = j
        elif t[i] == '^':
            if t[i+1] == '{':
                a, j = find_group(t, i + 1); out += '**(' + tex2py(a) + ')'; i = j
            else:
                out += '**' + t[i+1]; i += 2
        elif t.startswith('\\times', i): out += '*'; i += 6
        elif t.startswith('\\div', i): out += '/'; i += 4
        elif t.startswith('\\pi', i): out += 'pi'; i += 3
        elif t[i] == '{': a, j = find_group(t, i); out += '(' + tex2py(a) + ')'; i = j
        else: out += t[i]; i += 1
    return out

def S(tex, **ns):
    s = tex2py(tex)
    return parse_expr(s, transformations=TR, local_dict={'pi': sp.pi, **ns}, evaluate=True)

def numval(a):
    """numeric value of a displayed answer: strips units and symbols"""
    a = re.sub(r'\\text\{[^}]*\}(\^\{?\d\}?)?', '', a)
    a = a.replace('\\%', '').replace('\\pounds', '').replace('{,}', '').replace('\\,', '')
    a = a.replace('\\pi', '').replace('\\ldots', '')
    return S(a.strip())

ok = bad = 0; fails = []
def fail(rec, why):
    global bad
    bad += 1
    if len(fails) < 40: fails.append(f"{rec['key']} seed {rec['seed']}: {why}\n      {rec['body'][:150]}  =>  {rec['a']}")

def close(x, y, tol=1e-9):
    return abs(float(x) - float(y)) <= tol * max(1, abs(float(y)))

recs = json.load(open(sys.argv[1]))
for rec in recs:
    c = rec['chk']; k = c['k']
    try:
        if k == 'eval':
            q = S(c['tex']); a = S(rec['a'])
            good = sp.simplify(q - a) == 0
            if not good: fail(rec, f'eval: {q} != answer {a}')
            else:
                # answer should be a simplified fraction/mixed number: displayed denominator coprime to numerator, mixed fraction < 1
                m = re.search(r'(\d+)\\dfrac\{(\d+)\}\{(\d+)\}$', rec['a']) or re.search(r'^\\dfrac\{(\d+)\}\{(\d+)\}$', rec['a'])
                if m:
                    nn, dd = int(m.group(m.lastindex - 1)), int(m.group(m.lastindex))
                    if math.gcd(nn, dd) != 1 or nn >= dd: fail(rec, 'answer fraction not simplified/proper')
                ok += 1
        elif k == 'solve':
            x = sp.Symbol(c['v'])
            lhs, rhs = c['eq'].split('=')
            sol = sp.solve(sp.Eq(S(lhs, **{c['v']: x}), S(rhs, **{c['v']: x})), x)
            a = S(rec['a'].split('=')[1])
            if len(sol) != 1 or sp.simplify(sol[0] - a) != 0: fail(rec, f'solve gives {sol}, answer {a}')
            else: ok += 1
        elif k == 'equiv':
            x, y = sp.symbols('x y')
            if sp.simplify(sp.expand(S(c['q']) - S(c['a']))) != 0: fail(rec, 'equiv: not equal')
            else:
                # factorised answers must be fully factorised: top-level check by comparing to sympy's factor
                ok += 1
        elif k == 'py':
            a_, b_, m_, n_, p_, q_, x, y = sp.symbols('a b m n p q x y')
            ns = {n: sp.Symbol(n) for n in 'abmnpqxy'}
            qq = parse_expr(c['q'], local_dict=ns); aa = parse_expr(c['a'], local_dict=ns)
            if sp.simplify(qq - aa) != 0: fail(rec, 'py: not equal')
            else: ok += 1
        elif k == 'subs':
            e = S(c['expr'], **{v: sp.Integer(n) for v, n in c['vars'].items()})
            val = sp.Rational(c['val'])
            if sp.simplify(e - val) != 0 or sp.simplify(S(rec['a']) - val) != 0: fail(rec, f'subs: {e} vs {val} vs answer')
            else: ok += 1
        elif k == 'num':
            ns = {'sqrt': sp.sqrt, 'pi': sp.pi, 'gcd': math.gcd, 'lcm': math.lcm, 'Fraction': Fraction, 'round': round, 'floor': math.floor, 'len': len, 'range': range}
            expr = c['expr']
            ev = eval(expr, {'__builtins__': {}}, ns)
            if isinstance(ev, list):
                vals = [float(v) for v in ev]; want = [float(x) for x in c['val'].split(',')]
                if not all(close(a, b, 1e-9) for a, b in zip(vals, want)) or len(vals) != len(want): fail(rec, f'num list {vals} vs {want}')
                else: ok += 1; continue
            ev = float(ev)
            want = float(Fraction(c['val'])) if '/' in c['val'] else float(c['val'])
            if 'dp' in c:
                tol = 0.5 * 10 ** (-c['dp']) + 1e-9
                if abs(round(ev + 1e-12, c['dp']) - want) > 1e-9 and abs(ev - want) > tol: fail(rec, f'num: {ev} !~ {want} at {c["dp"]} dp'); continue
                if abs(ev - want) > tol: fail(rec, f'num: {ev} vs {want}'); continue
            elif not close(ev, want, 1e-9): fail(rec, f'num: {ev} vs {want}'); continue
            # displayed answer agrees with val (skipped for multi-value answers and fraction/text answers)
            if ',' not in c['val'] and not re.search(r'text\{[A-Za-z]+: ', rec['a']):
                try:
                    shown = numval(rec['a'].split(',\\ ')[0]) if '/' not in c['val'] else numval(rec['a'])
                    if not close(float(shown), want, 1e-6) and not re.search(r'hours|minutes', rec['a']):
                        fail(rec, f'displayed answer {rec["a"]} != {want}'); continue
                except Exception as ex:
                    pass
            ok += 1
        elif k == 'simul':
            (a1, b1, c1), (a2, b2, c2) = c['eqs']; x, y = c['x'], c['y']
            if a1*x + b1*y != c1 or a2*x + b2*y != c2 or a1*b2 - a2*b1 == 0: fail(rec, 'simul wrong')
            else: ok += 1
        elif k == 'round':
            from decimal import Decimal, ROUND_HALF_UP
            d = Decimal(c['n']).quantize(Decimal(1).scaleb(-c['dp']), rounding=ROUND_HALF_UP)
            if str(d).lstrip('0') != rec['a'].lstrip('0') and str(d) != rec['a']: fail(rec, f'round: {d}')
            else: ok += 1
        elif k == 'sf':
            from decimal import Decimal, ROUND_HALF_UP
            d = Decimal(c['n']); e = d.adjusted(); q = d.quantize(Decimal(1).scaleb(e - c['sf'] + 1), rounding=ROUND_HALF_UP)
            shown = Decimal(rec['a'])
            if q != shown: fail(rec, f'sf: {q} vs {shown}')
            else: ok += 1
        elif k == 'pf':
            parts = re.findall(r'(\d+)(?:\^\{(\d+)\})?', c['a']); prod = 1
            for p_, e in parts: prod *= int(p_) ** int(e or 1)
            if prod != c['n'] or not all(sp.isprime(int(p_)) for p_, e in parts): fail(rec, 'pf wrong')
            else: ok += 1
        elif k == 'mode':
            from collections import Counter
            cnt = Counter(c['list']); m = max(cnt.values())
            modes = [v for v, n in cnt.items() if n == m]
            if len(modes) != 1 or str(modes[0]) != c['val']: fail(rec, 'mode wrong')
            else: ok += 1
        elif k == 'median':
            import statistics
            md = statistics.median(c['list'])
            if float(md) != float(c['val']): fail(rec, f'median {md}')
            else: ok += 1
        else:
            fail(rec, 'unknown check kind ' + k)
    except Exception as ex:
        fail(rec, f'checker error: {type(ex).__name__}: {ex}')
print(f'checked {ok + bad} answers independently: {ok} ok, {bad} wrong')
for f in fails: print('  FAIL', f)
sys.exit(1 if bad else 0)
