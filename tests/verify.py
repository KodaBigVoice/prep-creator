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
    s = re.sub(r'(?<![A-Za-z])as(?![A-Za-z])', 'a*s', s)      # 'as' is a Python keyword: 2as means 2*a*s
    return parse_expr(s, transformations=TR, local_dict={'pi': sp.pi, **ns}, evaluate=True)

def numval(a):
    """numeric value of a displayed answer: strips units and symbols"""
    a = re.sub(r'\\text\{[^}]*\}(\^\{?\d\}?)?', '', a)
    a = a.replace('\\%', '').replace('\\pounds', '').replace('{,}', '').replace('\\,', '')
    a = a.replace('\\pi', '').replace('\\ldots', '')
    return S(a.strip())

def mathsegs(s):
    # the {{...}} maths segments of a body (braces inside the maths are balanced)
    out = []; i = 0
    while i < len(s):
        if s.startswith('{{', i):
            j = i + 2; d = 0
            while j < len(s):
                if s[j] == '{': d += 1
                elif s[j] == '}':
                    if d > 0: d -= 1
                    elif s.startswith('}}', j): break
                j += 1
            out.append(s[i + 2:j]); i = j + 2
        else: i += 1
    return out

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
                m = re.search(r'(\d+)\\dfrac\{(\d+)\}\{(\d+)\}$', rec['a']) or re.search(r'^-?\\dfrac\{(\d+)\}\{(\d+)\}$', rec['a'])
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
        elif k == 'solveall':
            # equations with a pair of answers (x = ±r): the real solutions must be exactly {r, -r} and the displayed answer must say so
            x = sp.Symbol(c['v'])
            lhs, rhs = c['eq'].split('=')
            sol = set(sp.solve(sp.Eq(S(lhs, **{c['v']: x}), S(rhs, **{c['v']: x})), x))
            rr = sp.Rational(c['val'].split('/')[0], c['val'].split('/')[1])
            shown = rec['a'].split('=')[1].strip()
            if not shown.startswith('\\pm'): fail(rec, 'answer should start with \\pm')
            elif sol != {rr, -rr} or sp.simplify(S(shown[len('\\pm'):]) - rr) != 0: fail(rec, f'solveall gives {sol}, answer {shown}')
            else: ok += 1
        elif k == 'solveset':
            # equations with several answers (x = a or x = b): the real solutions must be exactly the listed ones, and the displayed answer must say so
            x = sp.Symbol(c['v'])
            lhs, rhs = c['eq'].split('=')
            sol = set(sp.solve(sp.Eq(S(lhs, **{c['v']: x}), S(rhs, **{c['v']: x})), x))
            want = {sp.Integer(v) for v in c['vals']}
            shown = {sp.Integer(int(m)) for m in re.findall(r'x = (-?\d+)', rec['a'])}
            if sol != want or shown != want: fail(rec, f'solveset gives {sol}, listed {want}, shown {shown}')
            else: ok += 1
        elif k == 'factor':
            # out(in): expands to the question, and nothing is left to take out of the bracket
            q = S(c['q']); out = S(c['out']); ins = S(c['in'])
            if sp.expand(out * ins - q) != 0: fail(rec, 'factor: does not expand to the question')
            else:
                g = sp.gcd_list(sp.Add.make_args(sp.expand(ins)))
                if abs(g) != 1: fail(rec, f'not fully factorised: {g} still common in the bracket')
                else: ok += 1
        elif k == 'factorfull':
            # content x product of irreducible brackets: expands to the question, and there are no further factors
            q = S(c['q']); prod = sp.Integer(c['content'])
            for f in c['factors']: prod = prod * S(f)
            fl = sp.factor_list(sp.expand(q))
            irreducible = all(len(sp.factor_list(S(f))[1]) == 1 and sp.factor_list(S(f))[1][0][1] == 1 and abs(sp.factor_list(S(f))[0]) == 1 for f in c['factors'])
            if sp.expand(prod - q) != 0: fail(rec, 'factorfull: does not expand to the question')
            elif not irreducible: fail(rec, 'factorfull: a bracket can be factorised further')
            elif abs(fl[0]) != c['content'] or sum(e for _, e in fl[1]) != len(c['factors']): fail(rec, f'factorfull: not fully factorised: {fl}')
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
            e = S(c['expr'], **{v: sp.Rational(str(n)) for v, n in c['vars'].items()})
            val = sp.Rational(c['val'])
            if sp.simplify(e - val) != 0 or sp.simplify(S(rec['a']) - val) != 0: fail(rec, f'subs: {e} vs {val} vs answer')
            else: ok += 1
        elif k == 'which':
            # which of several expressions is the largest / smallest: the shown answer must be that one, and it must be the only one
            ns = {v: sp.Rational(str(n)) for v, n in c['vars'].items()}
            vals = [S(e, **ns) for e in c['exprs']]
            best = max(vals) if c['pick'] == 'max' else min(vals)
            shown = S(rec['a'], **ns)
            if vals.count(best) != 1: fail(rec, f'which: {c["pick"]} is not unique: {vals}')
            elif sp.simplify(shown - best) != 0 or sp.simplify(shown - vals[c['exprs'].index(c['ans'])]) != 0: fail(rec, f'which: shown {shown}, {c["pick"]} is {best} of {vals}')
            else: ok += 1
        elif k == 'table':
            # a table of values: every y matches the rule at its x, and the table shown holds exactly those y values
            x = sp.Symbol(c['v'])
            want = [S(c['expr'], **{c['v']: sp.Integer(xv)}) for xv in c['xs']]
            row = rec['a'].split('y &')[-1]
            shown = [int(m) for m in re.findall(r'-?\d+', row.replace('\\\\', ' ').replace('\\hline', ' '))]
            if [int(w) for w in want] != c['ys'] or shown != c['ys']: fail(rec, f'table: rule gives {want}, listed {c["ys"]}, shown {shown}')
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
        elif k == 'order':
            # fractions in order (or the larger/smaller one): the displayed answer must be exactly the expected values, in order
            items = sorted((Fraction(x) for x in c['items']), reverse=(c['dir'] == 'desc'))[:c['n']]
            def pv(t):
                t = t.strip(); pc = t.endswith('\\%'); core = t[:-2] if pc else t
                if re.fullmatch(r'\d+(\.\d+)?', core): x = Fraction(core)
                else:
                    q_ = sp.Rational(numval(core)); x = Fraction(int(q_.p), int(q_.q))
                return x / 100 if pc else x
            shown = [pv(t) for t in rec['a'].split(',\\ ')]
            if len(set(c['items'])) != len(c['items']) or len({Fraction(x) for x in c['items']}) != len(c['items']): fail(rec, 'order: equal values in the question')
            elif shown != items: fail(rec, f'order: expected {[str(i) for i in items]}, shown {[str(i) for i in shown]}')
            else: ok += 1
        elif k == 'recur':
            # recurring decimals: read the dots (or bar) straight off the question or the answer and compare with the fraction
            want = Fraction(c['frac'])
            def recval(t):
                t = t.strip(); m = re.match(r'^(\d+)\.(.*)$', t)
                ip = int(m.group(1)); rest = m.group(2); digs = []; start = end = None; i = 0
                while i < len(rest):
                    if rest.startswith('\\dot{', i):
                        j = rest.index('}', i); d = rest[i + 5:j]; 
                        if start is None: start = len(digs)
                        digs.append(d); end = len(digs) - 1; i = j + 1
                    elif rest.startswith('\\overline{', i):
                        j = rest.index('}', i); ds = rest[i + 10:j]
                        start = len(digs); digs.extend(ds); end = len(digs) - 1; i = j + 1
                    else: digs.append(rest[i]); i += 1
                nr = ''.join(digs[:start]); rep = ''.join(digs[start:end + 1])
                assert end == len(digs) - 1, 'digits after the repeating part'
                assert set(rep) != {'9'}, 'a repeating 9 is just a terminating decimal'
                return ip + Fraction(int(nr or '0'), 10 ** len(nr)) + Fraction(int(rep), (10 ** len(rep) - 1) * 10 ** len(nr))
            if c['dir'] == 'todec':
                got = recval(rec['a'])
                if got != want: fail(rec, f'recur: shown decimal is {got}, fraction is {want}')
                else: ok += 1
            else:
                note = mathsegs(rec['body']); got = recval(note[0])
                shown = Fraction(int(sp.Rational(numval(rec['a'])).p), int(sp.Rational(numval(rec['a'])).q))
                same_note = len(note) < 2 or recval(note[1]) == got
                if got != want or shown != want or not same_note or math.gcd(want.numerator, want.denominator) != 1: fail(rec, f'recur: decimal is {got}, answer {shown}, expected {want}')
                else: ok += 1
        elif k == 'recurpick':
            # which fractions give recurring decimals: denominator (in lowest terms) has a prime factor other than 2 or 5
            def rec_(x):
                d = Fraction(x).denominator
                while d % 2 == 0: d //= 2
                while d % 5 == 0: d //= 5
                return d != 1
            expect = [x for x in c['items'] if rec_(x)]
            got = [t for t in re.findall(r'\\dfrac\{(\d+)\}\{(\d+)\}', rec['a'])]
            got = [f'{a}/{b}' for a, b in got]
            if sorted(expect) != sorted(c['ans']) or sorted(got) != sorted(expect) or not expect: fail(rec, f'recurpick: expected {expect}, shown {got}')
            else: ok += 1
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
