# PMU question bank

Every question option in PMU (Prep Maths Universe), grouped by topic and listed from easiest to hardest. **602 options in 28 topics.** This file is generated from the code, so it is always current.

To use an option in an import file, write its **key** exactly as shown: `{ "pick": "pct-buildup:fives" }`. PMU then makes a fresh question with fresh numbers and a checked answer.

- **levels**: F = Foundation, C = Core, A = Additional, X = Further (the levels PMU sorts questions into).
- **d**: difficulty on one ladder across the whole bank (about 1 = very easy, 10 = very hard). Use it to ramp a sheet from easy to hard.
- **calc**: `yes` means the question needs a calculator. Leave those out of non-calculator sheets.
- **parts**: how many parts (a), (b)… the option makes. If you set `marks` or `lines` on an option with several parts, give a list with that many numbers.
- **example**: one sample (numbers change every time). `{{…}}` is maths.

## Area

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `area-shapes:triangle` | Rectangles, triangles, trapezia › triangle | FCA | 3 |  | 1 | A triangle has a base of 5 cm and a perpe… |
| `area-shapes:parallelogram` | Rectangles, triangles, trapezia › parallelogram | FCA | 3.5 |  | 1 | A parallelogram has a base of 6 cm and a … |
| `area-shapes:trapezium` | Rectangles, triangles, trapezia › trapezium | FCA | 4 |  | 1 | A trapezium has parallel sides of length … |
| `area-shapes:rect-missing` | Rectangles, triangles, trapezia › rectangle: find a missing length | FCA | 5 |  | 1 | A rectangular garden has an area of 28 m²… |
| `area-shapes:trap-height` | Rectangles, triangles, trapezia › trapezium: find the height | FCA | 6 |  | 1 | A trapezium has an area of 60 cm². Its pa… |

## Averages

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `averages:three` | Mean, median, mode, range › mean, median and range from a list | FC | 3 |  | 3 | The numbers of goals scored by a team in … |
| `averages:mode` | Mean, median, mode, range › mode, median and range from a list | FC | 3.5 |  | 3 | The marks of 7 pupils in a test are: 12,\… |
| `mean-unknown:missing` | Mean with an unknown value › find the missing value from the mean | CA | 5 |  | 1 | The mean of 6 numbers is 20. Five of the … |
| `mean-unknown:new` | Mean with an unknown value › new mean after another value | CA | 5.5 |  | 1 | After 8 tests, Ravi's mean mark is 69. Af… |

## Circles

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `circles:circ-calc` | Circumference and area › circumference, to 1 d.p. (calculator) | CA | 4 | yes | 1 | A circular pond has diameter 11 m. Calcul… |
| `circles:area-calc` | Circumference and area › area, to 1 d.p. (calculator) | CA | 5 | yes | 1 | A circular pond has diameter 11 m. Calcul… |
| `circles:circ-pi` | Circumference and area › circumference in terms of π | CA | 5.5 |  | 1 | A circular pond has diameter 10 m. Calcul… |
| `circles:area-pi` | Circumference and area › area in terms of π | CA | 6 |  | 1 | A circular pond has diameter 10 m. Calcul… |
| `circles:reverse` | Circumference and area › find the radius from the circumference | CA | 7 | yes | 1 | The circumference of a circular pond is 4… |

## Decimals

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `dec-order:two` | Ordering decimals › which is larger or smaller: 0.3 or 0.29 | FC | 1.2 |  | 1 | Which of these numbers is the larger: 1.9… |
| `dec-add-same:add1` | Adding and subtracting: same decimal places › add tenths: 2.4 + 3.7 | FC | 1.4 |  | 1 | Evaluate 0.7 + 1.7 |
| `dec-pow10:mult` | Multiplying and dividing by 10, 100, 1000 › multiply: 3.4 × 100 | FC | 1.6 |  | 1 | Evaluate 97 \times 10 |
| `dec-order:four` | Ordering decimals › four decimals in order: 0.5, 0.45, 0.054, 0.504 | FC | 1.8 |  | 1 | Write these numbers in order, starting wi… |
| `dec-add-same:sub1` | Adding and subtracting: same decimal places › subtract tenths: 8.6 − 3.9 | FC | 1.8 |  | 1 | Evaluate 2.2 - 1.7 |
| `dec-pow10:div` | Multiplying and dividing by 10, 100, 1000 › divide: 56 ÷ 1000 | FC | 2 |  | 1 | Evaluate 976 \div 10 |
| `dec-order:whole` | Ordering decimals › with whole-number parts: 3.07, 3.7, 3.071 | FC | 2.2 |  | 1 | Write these numbers in order, starting wi… |
| `dec-add-same:hund` | Adding and subtracting: same decimal places › add or subtract hundredths: 0.45 + 0.37 | FC | 2.2 |  | 1 | Evaluate 1.08 + 6.44 |
| `dec-add-same:ctx` | Adding and subtracting: same decimal places › in context: mass, length, money | FC | 2.4 |  | 1 | A parcel contains a book of mass 8.6 kg a… |
| `dec-add-diff:add` | Adding and subtracting: different decimal places › add or subtract: 12.5 + 3.84 | C | 2.6 |  | 1 | Evaluate 28.2 + 10.524 |
| `dec-add-diff:whole` | Adding and subtracting: different decimal places › whole number and a decimal: 7 − 2.35 | C | 2.9 |  | 1 | Evaluate 4 - 2.476 |
| `dec-mult-whole:tenths` | Multiplying a decimal by a whole number › tenths: 2.3 × 4 | C | 3 |  | 1 | Evaluate 0.9 \times 3 |
| `dec-add-diff:ctx` | Adding and subtracting: different decimal places › in context: mass, length, volume | C | 3.1 |  | 1 | A parcel contains a book of mass 8.6 kg a… |
| `dec-missing:add` | Missing numbers › addition or subtraction: □ + 3.7 = 5.12 | C | 3.2 |  | 1 | Find the missing number: \square - 1.2 = … |
| `dec-add-diff:three` | Adding and subtracting: different decimal places › three terms: 4.2 + 0.85 − 1.6 | C | 3.3 |  | 1 | Evaluate 8.6 + 4.7 + 3.768 |
| `dec-div-whole:tenths` | Dividing a decimal by a whole number › tenths: 7.2 ÷ 4 | C | 3.4 |  | 1 | Evaluate 34.3 \div 7 |
| `dec-mult-whole:hundredths` | Multiplying a decimal by a whole number › hundredths: 1.25 × 8 | C | 3.5 |  | 1 | Evaluate 0.68 \times 3 |
| `dec-mult-whole:ctx` | Multiplying a decimal by a whole number › in context: price, mass, length | C | 3.6 |  | 1 | Aisha buys 3 pens. Each pen costs £4.34. … |
| `dec-div-whole:hundredths` | Dividing a decimal by a whole number › hundredths: 0.84 ÷ 7 | C | 3.8 |  | 1 | Evaluate 2.76 \div 6 |
| `dec-div-whole:ctx` | Dividing a decimal by a whole number › in context: sharing, equal pieces | C | 3.9 |  | 1 | Zara shares £37.08 equally between 9 frie… |
| `dec-div-whole:whole` | Dividing a decimal by a whole number › whole number ÷ whole number: 5 ÷ 8 | C | 4 |  | 1 | Evaluate 21 \div 8 |
| `dec-mult-easy:tenths` | Multiplying two decimals: easy › tenths × tenths: 0.3 × 0.4 | C | 4 |  | 1 | Evaluate 0.2 \times 0.2 |
| `dec-mult-easy:zeros` | Multiplying two decimals: easy › with place-value zeros: 0.06 × 0.2 | C | 4.4 |  | 1 | Evaluate 0.2 \times 0.02 |
| `dec-pow01:mult` | Multiplying and dividing by 0.1 and 0.01 › multiply: 36 × 0.1 | A | 4.6 |  | 1 | Evaluate 97 \times 0.1 |
| `dec-mult-easy:mixed` | Multiplying two decimals: easy › one number with two digits: 1.2 × 0.5 | C | 4.6 |  | 1 | Evaluate 0.2 \times 1.1 |
| `dec-pow01:div` | Multiplying and dividing by 0.1 and 0.01 › divide: 35 ÷ 0.1 | A | 5 |  | 1 | Evaluate 97 \div 0.1 |
| `dec-mult-hard:std` | Multiplying two decimals: harder › tenths with two digits: 1.6 × 2.5 | C | 5 |  | 1 | Evaluate 1.2 \times 1.6 |
| `dec-div-same:x10` | Dividing by a decimal: same decimal places › tenths ÷ tenths (× 10): 4.8 ÷ 0.6 | C | 5.2 |  | 1 | Evaluate 11.9 \div 0.7 |
| `dec-mult-hard:ctx` | Multiplying two decimals: harder › in context: price per kilogram, metre or litre | CA | 5.4 |  | 1 | Cheese costs £7.50 per kilogram. Sofia bu… |
| `dec-mult-hard:twodp` | Multiplying two decimals: harder › tenths × hundredths: 2.4 × 0.35 | CA | 5.5 |  | 1 | Evaluate 5.2 \times 0.95 |
| `dec-div-same:x100` | Dividing by a decimal: same decimal places › hundredths ÷ hundredths (× 100): 0.36 ÷ 0.09 | C | 5.6 |  | 1 | Evaluate 1.19 \div 0.07 |
| `dec-missing:mult` | Missing numbers › multiplication: 0.6 × □ = 0.18 | CA | 5.8 |  | 1 | Find the missing number: \square \times 0… |
| `dec-calc:mult` | Decimals with a calculator › multiply: 3.45 × 2.7 | C | 5.8 | yes | 1 | Work out 1.22 \times 8.8 |
| `dec-mult-hard:small` | Multiplying two decimals: harder › hundredths × hundredths: 0.18 × 0.05 | A | 6 |  | 1 | Evaluate 0.12 \times 0.02 |
| `dec-div-same:x1000` | Dividing by a decimal: same decimal places › thousandths ÷ thousandths (× 1000): 0.056 ÷ 0.007 | CA | 6 |  | 1 | Evaluate 0.119 \div 0.007 |
| `dec-div-diff:more` | Dividing by a decimal: different decimal places › dividend has more decimal places: 0.84 ÷ 0.2 | CA | 6.2 |  | 1 | Evaluate 0.125 \div 0.05 |
| `dec-calc:div` | Decimals with a calculator › divide exactly: 12.6 ÷ 0.45 | C | 6.4 | yes | 1 | Work out 29.568 \div 0.7 |
| `dec-div-diff:fewer` | Dividing by a decimal: different decimal places › divisor has more decimal places: 3.6 ÷ 0.09 | CA | 6.6 |  | 1 | Evaluate 0.15 \div 0.006 |
| `dec-missing:div` | Missing numbers › division: 8 ÷ □ = 0.4 | CA | 6.6 |  | 1 | Find the missing number: \square \div 39 … |
| `dec-given:two` | Using a given multiplication › two parts, multiplying: given 23 × 47 = 1081, work out 2.3 × 4.7 | CA | 6.6 |  | 2 | Given that 12 \times 16 = 192, work out: … |
| `dec-calc:round` | Decimals with a calculator › several operations, rounded: (7.2 + 3.85) ÷ 1.3 | CA | 7 | yes | 1 | Work out 1.8 \times 10.78 \div 4.24. Give… |
| `dec-div-two:more` | Dividing by a decimal: two-digit divisor › dividend has more decimal places: 0.168 ÷ 0.12 | A | 7.2 |  | 1 | Evaluate 6.02 \div 1.4 |
| `dec-given:std` | Using a given multiplication › three parts: two multiplications, then a division | A | 7.2 |  | 3 | Given that 12 \times 16 = 192, work out: … |
| `dec-div-two:fewer` | Dividing by a decimal: two-digit divisor › divisor has more decimal places: 4.5 ÷ 0.15 | A | 7.6 |  | 1 | Evaluate 6.3 \div 0.63 |
| `dec-div-ctx:single` | Dividing by a decimal: in context › how many pieces: 3.6 m into 0.6 m pieces | C | 7.6 |  | 1 | A fence panel is 4.08 m long. Ravi cuts i… |
| `dec-power:square` | Squares, cubes and roots of decimals › squares: 0.3² | A | 7.6 |  | 1 | Evaluate 0.2^2 |
| `dec-div-ctx:rate` | Dividing by a decimal: in context › price per kilogram, metre or litre: how much for the money | CA | 7.8 |  | 1 | Petrol costs £1.50 per litre. Ravi pays £… |
| `dec-power:root` | Squares, cubes and roots of decimals › square roots: √0.49 | A | 7.8 |  | 1 | Evaluate \sqrt{0.04} |
| `dec-bidmas:basic` | Order of operations with decimals › four operations: 2.5 + 0.4 × 3 | A | 7.8 |  | 1 | Evaluate 2.5 + 0.8 \times 0.6 |
| `dec-power:cube` | Squares, cubes and roots of decimals › cubes: 0.2³ | A | 8 |  | 1 | Evaluate 0.1^3 |
| `dec-bidmas:brackets` | Order of operations with decimals › brackets: (1.2 + 0.8) × 0.5 | A | 8 |  | 1 | Evaluate (2.5 + 0.8) \times 0.6 |
| `dec-div-ctx:two` | Dividing by a decimal: in context › how many pieces, two-digit divisor: 4.2 m into 0.35 m pieces | A | 8.2 |  | 1 | A fence panel is 18.9 m long. Ravi cuts i… |
| `dec-power:cuberoot` | Squares, cubes and roots of decimals › cube roots: ∛0.008 | A | 8.4 |  | 1 | Evaluate \sqrt[3]{0.001} |
| `dec-bidmas:powers` | Order of operations with decimals › powers and roots: 0.5² + 1.4 | A | 8.4 |  | 1 | Evaluate 5.2 \times 0.5^2 |

## Decimals: problem solving

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `decprob-shopping:two` | Shopping and change › two items, change from a note | C | 3.4 |  | 1 | Ravi buys a drink for £1.25 and a noteboo… |
| `decprob-rect:perimeter` | Rectangles with decimal sides › perimeter of a rectangle | C | 3.6 |  | 1 | A rectangle has length 8.7 cm and width 4… |
| `decprob-shopping:three` | Shopping and change › three items, change from a note | C | 3.8 |  | 1 | Ravi buys a drink for £1.25, a notebook f… |
| `decprob-shopping:multi` | Shopping and change › several of one item and other items | C | 4.4 |  | 1 | Ravi buys 6 stickers at 45p each and a ru… |
| `decprob-share:exact` | Sharing money equally › shared exactly: £47.60 between 7 | C | 4.6 |  | 1 | Ravi and 8 friends win £57.78 in a raffle… |
| `decprob-left:left` | Amounts left and amounts needed › how much is left after repeated amounts are used | C | 5.2 |  | 1 | Ravi has £20. Ravi buys 7 items at £1.85 … |
| `decprob-rect:area` | Rectangles with decimal sides › area of a rectangle | CA | 5.4 |  | 1 | A rectangle has length 8.7 cm and width 4… |
| `decprob-left:need` | Amounts left and amounts needed › how much more is needed | C | 5.6 |  | 1 | A plant trough needs 5 litres of water. R… |
| `decprob-rect:both` | Rectangles with decimal sides › perimeter then area (two parts) | CA | 5.6 |  | 2 | A rectangle has length 8.7 cm and width 4… |
| `decprob-exchange:to` | Exchange rates › pounds to another currency (multiply) | C | 5.8 |  | 1 | The exchange rate is £1 = $1.30. Ravi cha… |
| `decprob-best-buy:item` | Unit cost and best buy › cost per item: 12 for £2.40 or 20 for £3.80 | CA | 6 |  | 1 | Pens are sold in two packs. Pack A has 12… |
| `decprob-fee:cost` | Fixed fee plus hourly rate › find the total cost for a number of hours | A | 6.2 |  | 1 | A plumber charges a fixed fee of £30 plus… |
| `decprob-share:round` | Sharing money equally › to the nearest penny: £50 between 6 | A | 6.6 |  | 1 | A class raises £97.41 for charity. The mo… |
| `decprob-best-buy:per100` | Unit cost and best buy › cost per 100 g: 250 g for £1.60 or 400 g for £2.28 | CA | 6.6 |  | 1 | Sugar is sold in two sizes. Pack A is 500… |
| `decprob-fee:hours` | Fixed fee plus hourly rate › find the number of hours for a total cost | A | 7 |  | 1 | A plumber charges a fixed fee of £30 plus… |
| `decprob-exchange:from` | Exchange rates › another currency to pounds (divide) | A | 7.4 |  | 1 | The exchange rate is £1 = $1.30. Ravi has… |

## Equations

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `equations-one-step:add` | One-step equations › x + a = b or x − a = b | FC | 1 |  | 1 | Solve x + 2 = 16 |
| `equations-one-step:times` | One-step equations › ax = b | FC | 1.3 |  | 1 | Solve 2x = 2 |
| `equations-one-step:div` | One-step equations › x over a = b | FC | 1.6 |  | 1 | Solve \frac{x}{2} = 1 |
| `equations-one-step:neg` | One-step equations › negative answers | FC | 2 |  | 1 | Solve x - 3 = -10 |
| `equations-two-step:std` | Two-step equations › ax ± b = c | FC | 2 |  | 1 | Solve 6x - 11 = 7 |
| `equations-two-step:negc` | Two-step equations › ax ± b = −c (negative right-hand side) | C | 2.4 |  | 1 | Solve 3x + 5 = -16 |
| `equations-two-step:cross` | Two-step equations › crossing zero: 3x + 8 = 2 | C | 2.6 |  | 1 | Solve 2x - 22 = -12 |
| `equations-two-step:frac` | Two-step equations › x over a ± b = c | FC | 2.8 |  | 1 | Solve \frac{x}{2} + 1 = 6 |
| `equations-two-step:neg` | Two-step equations › b − ax = c (negative x term) | FC | 3 |  | 1 | Solve 9 - 7x = -5 |
| `equations-both-sides:pos` | Unknown on both sides (larger x term on the left) › positive answer | CA | 3.5 |  | 1 | Solve 8x - 5 = 4x + 3 |
| `equations-both-sides:neg` | Unknown on both sides (larger x term on the left) › negative answer | CA | 4.1 |  | 1 | Solve 6x + 2 = 3x - 1 |
| `equations-both-sides-right:pos` | Unknown on both sides (larger x term on the right) › positive answer | CA | 4.1 |  | 1 | Solve x + 15 = 3x + 13 |
| `equations-both-sides-right:neg` | Unknown on both sides (larger x term on the right) › negative answer | CA | 4.7 |  | 1 | Solve 2x + 3 = 3x + 10 |
| `equations-both-sides-negative:one` | Unknown on both sides (negative x terms) › a negative x term on one side | A | 4.7 |  | 1 | Solve 5x + 19 = 8 - 6x |
| `equations-brackets:one` | Brackets › one bracket: a(bx ± c) = d | CA | 4.9 |  | 1 | Solve 5(x + 2) = 30 |
| `equations-both-sides-negative:both` | Unknown on both sides (negative x terms) › negative x terms on both sides | A | 5.3 |  | 1 | Solve 3 - 5x = -5 - 4x |
| `equations-brackets:neg` | Brackets › negative number outside: −a(x ± b) = c | CA | 5.3 |  | 1 | Solve -3(x + 9) = -15 |
| `equations-brackets:xside` | Brackets › bracket one side, x term the other: a(x ± b) = cx ± d | CA | 5.7 |  | 1 | Solve 2(x + 9) = x + 11 |
| `equations-fraction:split` | One algebraic fraction › ax/c ± b = d | CA | 5.8 |  | 1 | Solve \frac{3x}{2} + 10 = -2 |
| `equations-brackets:both` | Brackets › brackets on both sides: a(x ± b) = c(x ± d) | CA | 5.9 |  | 1 | Solve 5(x - 3) = 6(x - 4) |
| `equations-brackets:sub` | Brackets › x terms on both sides: e ± a(x ± b) = f ± gx | CA | 6.2 |  | 1 | Solve 2 - 2(x + 6) = 10 - 4x |
| `equations-fraction:top` | One algebraic fraction › (ax ± b)/c = d | CA | 6.3 |  | 1 | Solve \frac{4x - 8}{2} = 8 |
| `equations-two-fractions:sum` | Two algebraic fractions › x/a ± x/b = c | A | 6.5 |  | 1 | Solve \frac{x}{2} + \frac{x}{3} = 15 |
| `equations-fraction:eq` | One algebraic fraction › (ax ± b)/c = x ± d | CA | 6.8 |  | 1 | Solve \frac{3x + 9}{2} = x + 3 |
| `equations-two-fractions:coef` | Two algebraic fractions › ax/b ± cx/d = e | A | 6.8 |  | 1 | Solve \frac{2x}{3} + \frac{5x}{6} = 15 |
| `equations-two-fractions:cross` | Two algebraic fractions › (x ± a)/b = (x ± c)/d | A | 7 |  | 1 | Solve \frac{3x + 8}{5} = \frac{x - 4}{3} |
| `expand-then-solve:single` | Two brackets, then solve › one question: solve a(bx ± c) ± d(ex ± f) = k | CA | 7.2 |  | 1 | Solve 2(x + 8) - 4(3x - 4) = -8 |
| `equations-quadratic-simple:pure` | Simple quadratic equations (x² only) › x² = a | A | 7.4 |  | 1 | Solve x^2 = 4 |
| `equations-two-fractions:diff` | Two algebraic fractions › (x ± a)/b ± (x ± c)/d = e | A | 7.5 |  | 1 | Solve \frac{x - 1}{5} - \frac{x + 8}{2} =… |
| `expand-then-solve:std` | Two brackets, then solve › two parts: expand and simplify, then hence solve | CA | 7.6 |  | 2 | Expand and simplify 2(x + 8) - 4(3x - 4) |
| `equations-quadratic-simple:coef` | Simple quadratic equations (x² only) › ax² = b | A | 7.8 |  | 1 | Solve 2x^2 = 8 |
| `equations-quadratic-factorise:common` | Quadratics by factorising › common factor: x² + 5x = 0 | X | 8 |  | 1 | Solve x^{2} - 2x = 0 |
| `equations-quadratic-simple:const` | Simple quadratic equations (x² only) › x² ± a = b | A | 8.2 |  | 1 | Solve x^2 + 2 = 6 |
| `equations-denominator:num` | Unknown in the denominator › a/x = b | A | 8.4 |  | 1 | Solve \frac{2}{x} = 2 |
| `equations-quadratic-factorise:trinomial` | Quadratics by factorising › x² + bx + c = 0 | X | 8.5 |  | 1 | Solve x^{2} - 17x + 72 = 0 |
| `equations-quadratic-simple:full` | Simple quadratic equations (x² only) › ax² ± b = c | A | 8.6 |  | 1 | Solve 2x^2 + 25 = 33 |
| `equations-denominator:add` | Unknown in the denominator › a/x ± b = c | A | 8.8 |  | 1 | Solve \frac{28}{x} - 5 = 2 |
| `equations-quadratic-simple:sub` | Simple quadratic equations (x² only) › a − bx² = c | A | 9 |  | 1 | Solve 28 - 2x^2 = 20 |
| `equations-quadratic-factorise:rearrange` | Quadratics by factorising › rearrange first: x² = 5x + 14 | X | 9 |  | 1 | Solve x^2 = 17x - 72 |
| `equations-denominator:plus` | Unknown in the denominator › a/(x ± b) = c | A | 9.2 |  | 1 | Solve \frac{40}{x - 1} = 4 |
| `simultaneous:opp-y` | Simultaneous equations › add (opposite y coefficients) | A | 9.2 |  | 1 | Solve the simultaneous equations \begin{a… |
| `simultaneous:same-x` | Simultaneous equations › subtract (same x coefficient) | A | 9.4 |  | 1 | Solve the simultaneous equations \begin{a… |
| `simultaneous:multiply` | Simultaneous equations › multiply one equation first | A | 9.7 |  | 1 | Solve the simultaneous equations \begin{a… |
| `simultaneous:both` | Simultaneous equations › multiply both equations first | A | 10 |  | 1 | Solve the simultaneous equations \begin{a… |

## Expanding brackets

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `expand-number:pos` | Number outside the bracket › positive number: 4(x + 7) | CA | 1.5 |  | 1 | Expand 3(5n - 7) |
| `expand-number:neg` | Number outside the bracket › negative number: −4(x − 7) | CA | 2.2 |  | 1 | Expand -3(5n - 7) |
| `expand-number:two` | Number outside the bracket › two letters inside: 4(x − 7y) | CA | 2.6 |  | 1 | Expand 3(5n - 7t) |
| `expand-letter:x` | Letter outside the bracket › letter only: x(x + 5) | CA | 3 |  | 1 | Expand n(n + 3) |
| `expand-number:three` | Number outside the bracket › three terms inside: 3(2x − 5y + 4) | CA | 3.1 |  | 1 | Expand 3(5n - 7t + 2) |
| `expand-letter:nx` | Letter outside the bracket › number and letter: 3x(2x − 5) | CA | 3.5 |  | 1 | Expand 3n(4n - 7) |
| `expand-letter:neg` | Letter outside the bracket › negative: −2x(x − 6) | A | 4 |  | 1 | Expand -2n(4n - 7) |
| `expand-simplify-add:num` | Expand and simplify: adding brackets › all positive: 3(x + 2) + 4(x + 5) | CA | 4 |  | 1 | Expand and simplify 4(x + 8) + 4(4x + 5) |
| `expand-letter:two` | Letter outside the bracket › two letters inside: 3x(2x + 4y) | A | 4.5 |  | 1 | Expand 3n(4n - 7t) |
| `expand-simplify-add:neg` | Expand and simplify: adding brackets › with negatives: 3(2x − 1) + 2(x + 4) | CA | 4.5 |  | 1 | Expand and simplify 3(x + 8) + 4(3x - 4) |
| `expand-simplify-subtract:lin` | Expand and simplify: subtracting a bracket › a(bx ± c) − d(ex ± f) | CA | 5 |  | 1 | Expand and simplify 2(n - 2) - 6(2n + 5) |
| `expand-simplify-add:letter` | Expand and simplify: adding brackets › a letter outside one bracket: x(x + 3) + 2(x + 3) | A | 5.1 |  | 1 | Expand and simplify 2x(x + 8) + 4(3x - 4) |
| `expand-simplify-subtract:bare` | Expand and simplify: subtracting a bracket › a minus sign and no number: 4(x − 6) − (5x + 8) | CA | 5.4 |  | 1 | Expand and simplify 6(p - 2) - (3p - 7) |
| `expand-powers:pure` | Higher powers › one letter: x⁷(x⁴ − 1) | A | 6 |  | 1 | Expand b^{4}(b + 1) |
| `expand-simplify-subtract:two` | Expand and simplify: subtracting a bracket › two letters: 3x(2x + 4y) − 3y(x − 6y) | A | 6.2 |  | 1 | Expand and simplify 2n(5n + 2t) - 4t(n - … |
| `expand-powers:num` | Higher powers › number and power: 4x⁷(2x³ + 5) | A | 6.4 |  | 1 | Expand 3a^{3}(5a + 2) |
| `expand-powers:two` | Higher powers › two letters: 3a²b(2ab³ − 5a) | A | 6.8 |  | 1 | Expand 4p^{2}t^{3}(3p^{3} - 2t^{3}) |
| `expand-powers-high:pure` | Very high powers › one letter: x¹²(x⁸ + 3) | A | 6.9 |  | 1 | Expand b^{15}(b + 1) |
| `expand-powers-high:num` | Very high powers › number and power: 6x²⁰(2x¹⁵ − 3) | A | 7.3 |  | 1 | Expand 3a^{14}(5a + 2) |
| `expand-double:pos` | Double brackets (x + a)(x + b) › all positive: (x + 3)(x + 5) | X | 7.6 |  | 1 | Expand (n + 9)(n + 7) |
| `expand-powers-high:two` | Very high powers › two letters: 4a¹²b²⁰(3a¹⁰ − b¹⁵) | A | 7.7 |  | 1 | Expand 4p^{10}t^{13}(3p^{3} - 2t^{3}) |
| `expand-double:mixed` | Double brackets (x + a)(x + b) › one negative: (x − 4)(x + 7) | X | 8 |  | 1 | Expand (n + 9)(n - 7) |
| `expand-double:neg` | Double brackets (x + a)(x + b) › both negative: (x − 3)(x − 5) | X | 8.4 |  | 1 | Expand (n - 9)(n - 7) |
| `expand-double-coef:std` | Double brackets (ax + b)(cx + d) › one x coefficient above 1: (2x + 3)(x − 4) | X | 8.4 |  | 1 | Expand (n - 3)(2n + 5) |
| `expand-double-coef:both` | Double brackets (ax + b)(cx + d) › both above 1: (3x − 2)(2x + 5) | X | 8.6 |  | 1 | Expand (4t - 7)(3t + 8) |
| `expand-square:x` | Squaring a bracket › x ± a: (x + 3)² | X | 8.6 |  | 1 | Expand (n + 3)^2 |
| `expand-double-coef:two` | Double brackets (ax + b)(cx + d) › two letters: (2x + y)(x − 3y) | X | 8.8 |  | 1 | Expand (n - 3t)(3n - t) |
| `expand-dots:x` | Difference of two squares › (x + 4)(x − 4) | X | 8.9 |  | 1 | Expand (n - 3)(n + 3) |
| `expand-square:ax` | Squaring a bracket › ax ± b: (2x + 3)² | X | 9 |  | 1 | Expand (4n + 3)^2 |
| `expand-dots:ax` | Difference of two squares › (3x + 2)(3x − 2) | X | 9.3 |  | 1 | Expand (3n - 5)(3n + 5) |
| `expand-square:two` | Squaring a bracket › two letters: (2a − 3b)² | X | 9.4 |  | 1 | Expand (5a - 2x)^2 |
| `expand-simplify-double:sum` | Expand and simplify: double brackets › two pairs of brackets: (x + 3)(x + 4) + (x − 2)(x + 5) | X | 9.5 |  | 1 | Expand and simplify (x + 7)(x - 4) - (x -… |
| `expand-dots:two` | Difference of two squares › two letters: (5a − 2b)(5a + 2b) | X | 9.7 |  | 1 | Expand (3n - 5t)(3n + 5t) |
| `expand-simplify-double:sq` | Expand and simplify: double brackets › two squares: (x + 3)² − (x − 2)² | X | 9.7 |  | 1 | Expand and simplify (x + 1)^2 - (x + 5)^2 |
| `expand-triple:three` | Three brackets › three different brackets: (x + 1)(x + 2)(x + 3) | X | 9.9 |  | 1 | Expand (x + 1)(x + 5)(x - 3) |
| `expand-simplify-double:coef` | Expand and simplify: double brackets › with coefficients: (2x + 1)(x − 3) − (x + 4)(x − 1) | X | 10 |  | 1 | Expand and simplify (x + 7)(2x - 3) - (x … |
| `expand-triple:sq` | Three brackets › a squared bracket: (x + 2)²(x − 1) | X | 10 |  | 1 | Expand (x + 1)^2(x - 3) |

## Factorising

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `factorise-number:two` | Common number factor › ax ± b: 12x + 18 | CA | 2 |  | 1 | Factorise fully 10x - 8 |
| `factorise-number:xy` | Common number factor › ax ± by: 8x − 12y | CA | 2.5 |  | 1 | Factorise fully 8a + 28n |
| `factorise-number:three` | Common number factor › three terms: 8x − 12y + 4 | CA | 3.2 |  | 1 | Factorise fully 8a + 28n - 8 |
| `factorise-letter:sq` | Common letter factor › x² ± bx: x² + 5x | CA | 3.4 |  | 1 | Factorise fully r^{2} + 8r |
| `factorise-letter:mix` | Common letter factor › a letter shared by two terms: ab + ac | CA | 3.9 |  | 1 | Factorise fully r^{2} + ry |
| `factorise-number-letter:std` | Number and letter together › ax² ± bx: 12x² − 18x | A | 4.2 |  | 1 | Factorise fully 12x^{2} + 10x |
| `factorise-number-letter:three` | Number and letter together › three terms: 4x³ + 8x² − 12x | A | 5 |  | 1 | Factorise fully 12x^{3} + 10x^{2} - 6x |
| `factorise-two-letters:shared` | Two letters › one letter shared: 5ab + 10bc | A | 5 |  | 1 | Factorise fully 12ac - 30c^{2} |
| `factorise-two-letters:xy` | Two letters › both letters come out: 6x²y − 9xy² | A | 5.5 |  | 1 | Factorise fully 9q^{2}y - 12qy^{2} |
| `factorise-powers:pure` | Higher powers › one letter: x⁷ + x⁴ | A | 5.8 |  | 1 | Factorise fully b^{5} + b^{4} |
| `factorise-two-letters:three` | Two letters › three letters: 6xyz + 9x²y | A | 6 |  | 1 | Factorise fully 9bqy - 12q^{2}y |
| `factorise-powers:num` | Higher powers › number and power: 4x⁶ − 8x⁴ | A | 6.2 |  | 1 | Factorise fully 15a^{4} + 6a^{3} |
| `factorise-powers:two` | Higher powers › two letters: 6a³b⁴ + 9a²b³ | A | 6.6 |  | 1 | Factorise fully 12p^{5}t^{3} - 8p^{2}t^{6} |
| `factorise-powers-high:pure` | Very high powers › one letter: x²⁰ + x¹⁵ | A | 6.8 |  | 1 | Factorise fully b^{16} + b^{15} |
| `factorise-powers-high:num` | Very high powers › number and power: 6x¹⁸ − 9x¹² | A | 7.2 |  | 1 | Factorise fully 15a^{15} + 6a^{14} |
| `factorise-powers-high:two` | Very high powers › two letters: 4a¹²b²⁰ + 6a¹⁰b¹⁵ | A | 7.6 |  | 1 | Factorise fully 12p^{13}t^{13} - 8p^{10}t… |
| `factorise-quadratic:pos` | Quadratics x² + bx + c › all positive: x² + 7x + 12 | X | 8 |  | 1 | Factorise x^{2} + 16x + 63 |
| `factorise-quadratic:neg` | Quadratics x² + bx + c › negative middle term: x² − 5x + 6 | X | 8.3 |  | 1 | Factorise x^{2} - 16x + 63 |
| `factorise-squares:x2` | Difference of two squares › x² − 49 | X | 8.4 |  | 1 | Factorise x^{2} - 9 |
| `factorise-quadratic:mixed` | Quadratics x² + bx + c › negative constant: x² + 2x − 15 | X | 8.7 |  | 1 | Factorise x^{2} + 2x - 63 |
| `factorise-squares:ax2` | Difference of two squares › 9x² − 16 | X | 8.8 |  | 1 | Factorise 25x^{2} - 49 |
| `factorise-squares:two` | Difference of two squares › two letters: 25a² − 4b² | X | 9.2 |  | 1 | Factorise n^{2} - 36t^{2} |
| `factorise-ax2:pos` | Quadratics ax² + bx + c › all positive: 2x² + 7x + 3 | X | 9.2 |  | 1 | Factorise 9x^{2} + 9x + 2 |
| `factorise-full:dots` | Factorise fully (several steps) › number, then difference of squares: 2x² − 18 | X | 9.4 |  | 1 | Factorise fully 2x^{2} - 8 |
| `factorise-ax2:mixed` | Quadratics ax² + bx + c › with negatives: 3x² − 5x − 2 | X | 9.6 |  | 1 | Factorise 3x^{2} - 19x + 20 |
| `factorise-full:quad` | Factorise fully (several steps) › number, then a quadratic: 3x² + 15x + 18 | X | 9.6 |  | 1 | Factorise fully 5x^{2} - 75x + 280 |
| `factorise-full:cubic` | Factorise fully (several steps) › letter, then difference of squares: x³ − 4x | X | 9.9 |  | 1 | Factorise fully x^{3} - x |

## Fractions

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `fractions-equivalent:up` | Equivalent fractions › scaling up: 3/4 = ?/20 | FC | 1.2 |  | 1 | Find the missing number \frac{9}{?} = \fr… |
| `fractions-equivalent:down` | Equivalent fractions › scaling down: 18/24 = 3/? | FC | 1.8 |  | 1 | Find the missing number \frac{1}{?} = \fr… |
| `fractions-simplify:small` | Simplifying fractions › small common factor: 18/24 | FC | 2 |  | 1 | Simplify \frac{6}{18} |
| `fractions-simplify:large` | Simplifying fractions › larger numbers: 84/126 | FC | 2.6 |  | 1 | Simplify \frac{14}{42} |
| `fractions-improper:tomixed` | Improper fractions and mixed numbers › improper fraction to mixed number: 17/5 | FC | 2.6 |  | 1 | Write \frac{15}{2} as a mixed number. |
| `fractions-improper:toimproper` | Improper fractions and mixed numbers › mixed number to improper fraction: 3 2/7 | FC | 3 |  | 1 | Write 9\frac{1}{2} as an improper fractio… |
| `fractions-compare:larger` | Comparing and ordering fractions › which is larger (or smaller): 5/7 or 3/4 | FC | 3.2 |  | 1 | Which is larger, \frac{1}{2} or \frac{7}{… |
| `fractions-improper:simplify` | Improper fractions and mixed numbers › to mixed number, then simplify: 26/4 | FC | 3.4 |  | 1 | Write \frac{35}{10} as a mixed number. |
| `fractions-of-amount:unit` | Fraction of an amount › unit fraction of a number: 1/5 of 40 | FC | 3.4 |  | 1 | Work out \frac{1}{2}\text{ of }4 |
| `fractions-compare:order` | Comparing and ordering fractions › order three fractions, smallest first | FC | 3.8 |  | 1 | Write these in order, starting with the s… |
| `fractions-of-amount:nonunit` | Fraction of an amount › fraction of a number: 3/5 of 40 | FC | 4 |  | 1 | Work out \frac{2}{3}\text{ of }27 |
| `fractions-same-denominator:add` | Add and subtract (same denominator) › adding, answer less than 1: 3/8 + 2/8 | FC | 4 |  | 1 | Evaluate \frac{3}{11} + \frac{2}{11} |
| `fractions-compare:ordermix` | Comparing and ordering fractions › order mixed numbers and improper fractions | FC | 4.2 |  | 1 | Write these in order, starting with the s… |
| `fractions-of-amount:units` | Fraction of an amount › fraction of an amount with units: 7/8 of £36 | FC | 4.3 |  | 1 | Work out \frac{2}{3}\text{ of }27\text{ c… |
| `fractions-same-denominator:sub` | Add and subtract (same denominator) › subtracting: 11/12 − 5/12 | FC | 4.3 |  | 1 | Evaluate \frac{3}{11} - \frac{2}{11} |
| `fractions-same-denominator:addover` | Add and subtract (same denominator) › adding, answer more than 1: 3/8 + 7/8 | FC | 4.6 |  | 1 | Evaluate \frac{3}{5} + \frac{3}{5} |
| `fractions-related-denominators:add` | Add and subtract (one denominator a multiple of the other) › adding: 1/3 + 1/6 | CA | 4.7 |  | 1 | Evaluate \frac{1}{2} + \frac{1}{6} |
| `fractions-of-amount:improper` | Fraction of an amount › improper fraction of an amount: 5/4 of 36 | FC | 4.8 |  | 1 | Work out \frac{3}{2}\text{ of }18 |
| `fractions-same-denominator:simplify` | Add and subtract (same denominator) › answer needs simplifying: 1/8 + 3/8 | FC | 5 |  | 1 | Evaluate \frac{14}{15} - \frac{8}{15} |
| `fractions-related-denominators:sub` | Add and subtract (one denominator a multiple of the other) › subtracting: 7/8 − 1/4 | CA | 5 |  | 1 | Evaluate \frac{1}{2} - \frac{1}{6} |
| `fractions-related-denominators:addover` | Add and subtract (one denominator a multiple of the other) › adding, answer more than 1: 3/4 + 5/8 | CA | 5.3 |  | 1 | Evaluate \frac{9}{10} + \frac{3}{20} |
| `fractions-unrelated-denominators:addc` | Add and subtract (different denominators) › adding, multiply the denominators: 2/3 + 1/4 | CA | 5.3 |  | 1 | Evaluate \frac{1}{2} + \frac{2}{5} |
| `fractions-unrelated-denominators:subc` | Add and subtract (different denominators) › subtracting, multiply the denominators: 4/5 − 1/3 | CA | 5.6 |  | 1 | Evaluate \frac{1}{2} - \frac{2}{5} |
| `fractions-unrelated-denominators:addl` | Add and subtract (different denominators) › adding, find the lowest common denominator: 5/6 + 3/8 | CA | 5.8 |  | 1 | Evaluate \frac{3}{4} + \frac{1}{6} |
| `fractions-mixed:add-plain` | Mixed numbers: add and subtract › adding, no carrying: 2 1/4 + 1 1/2 | CA | 5.9 |  | 1 | Evaluate 1\frac{1}{2} + 3\frac{4}{9} |
| `fractions-mixed:sub-plain` | Mixed numbers: add and subtract › subtracting, no overlap: 6 1/4 − 3 1/5 | CA | 6 |  | 1 | Evaluate 3\frac{5}{6} - 2\frac{1}{10} |
| `fractions-multiply:plain` | Multiplying fractions › fraction × fraction, nothing to cancel: 2/3 × 4/5 | CA | 6 |  | 1 | Evaluate \frac{1}{3} \times \frac{7}{10} |
| `fractions-unrelated-denominators:subl` | Add and subtract (different denominators) › subtracting, find the lowest common denominator: 7/9 − 1/6 | CA | 6.1 |  | 1 | Evaluate \frac{3}{4} - \frac{1}{6} |
| `fractions-mixed:add-carry` | Mixed numbers: add and subtract › adding, fractions add to more than 1: 3 1/2 + 1 7/10 | CA | 6.3 |  | 1 | Evaluate 2\frac{2}{3} + 1\frac{9}{10} |
| `fractions-multiply:whole` | Multiplying fractions › fraction × whole number: 4 × 2/5 | CA | 6.3 |  | 1 | Evaluate \frac{5}{8} \times 5 |
| `fractions-mixed:sub-whole` | Mixed numbers: add and subtract › subtracting from a whole number: 5 − 2 3/8 | CA | 6.5 |  | 1 | Evaluate 5 - 1\frac{1}{2} |
| `fractions-mixed:sub-any` | Mixed numbers: add and subtract › subtracting, with or without overlap | CA | 6.6 |  | 1 | Evaluate 3\frac{5}{6} - 2\frac{1}{10} |
| `fractions-divide:int` | Dividing fractions › fraction ÷ whole number: 4 1/3 ÷ 2 | CA | 6.6 |  | 1 | Evaluate \frac{1}{2} \div 7 |
| `fractions-multiply:cancel` | Multiplying fractions › fraction × fraction, cancelling: 3/8 × 4/9 | CA | 6.8 |  | 1 | Evaluate \frac{3}{7} \times \frac{1}{6} |
| `fractions-mixed:sub-overlap` | Mixed numbers: add and subtract › subtracting, with overlap: 8 1/3 − 2 1/2 | CA | 6.9 |  | 1 | Evaluate 5\frac{1}{10} - 2\frac{3}{5} |
| `fractions-divide:frac` | Dividing fractions › fraction ÷ fraction: 3/4 ÷ 2/5 | CA | 7 |  | 1 | Evaluate \frac{3}{7} \div \frac{1}{6} |
| `fractions-multiply:mixfrac` | Multiplying fractions › mixed number × fraction: 2 1/2 × 3/4 | A | 7.2 |  | 1 | Evaluate 1\frac{1}{2} \times \frac{5}{8} |
| `fractions-divide:whole` | Dividing fractions › whole number ÷ fraction: 6 ÷ 2/3 | CA | 7.4 |  | 1 | Evaluate 9 \div \frac{2}{5} |
| `fractions-multiply:mixed` | Multiplying fractions › mixed number × mixed number | A | 7.6 |  | 1 | Evaluate 1\frac{1}{2} \times 3\frac{4}{9} |
| `fractions-mixed-operations:bracket` | Fractions with brackets and order of operations › brackets then multiply: (2/3 + 1/4) × 6/7 | A | 7.8 |  | 1 | Evaluate \left(\frac{1}{3} + \frac{3}{4}\… |
| `fractions-divide:cancel` | Dividing fractions › mixed numbers, cross-cancelling possible | A | 7.9 |  | 1 | Evaluate 5\frac{1}{4} \div 1\frac{1}{12} |
| `fractions-divide:mixed` | Dividing fractions › mixed number ÷ mixed number | A | 8.2 |  | 1 | Evaluate 3\frac{1}{3} \div 1\frac{1}{2} |
| `fractions-mixed-operations:order` | Fractions with brackets and order of operations › multiply before adding: 1/2 + 1/3 × 3/4 | A | 8.2 |  | 1 | Evaluate \frac{1}{2} - \frac{2}{5} \times… |
| `fractions-mixed-operations:bracketdiv` | Fractions with brackets and order of operations › brackets then divide: (5/6 − 1/3) ÷ 3/4 | A | 8.6 |  | 1 | Evaluate \left(\frac{1}{3} + \frac{3}{4}\… |
| `fractions-negative:addsub` | Negative fractions › adding and subtracting: −2/3 + 1/4 | X | 8.6 |  | 1 | Evaluate \frac{1}{2} + \left(-\frac{7}{12… |
| `fractions-negative:mul` | Negative fractions › multiplying: 1/2 × (−3/5) | X | 9 |  | 1 | Evaluate \frac{1}{2} \times \left(-\frac{… |
| `fractions-negative:div` | Negative fractions › dividing: −3/4 ÷ 2/5 | X | 9.4 |  | 1 | Evaluate \frac{1}{2} \div \left(-\frac{7}… |

## Fractions, decimals and percentages (FDP)

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `fdp-dec-to-frac:tenths` | Decimals to fractions › tenths: 0.7 | FC | 1.5 |  | 1 | Write 0.1 as a fraction. |
| `fdp-dec-to-frac:hundredths` | Decimals to fractions › hundredths: 0.35 | FC | 2.2 |  | 1 | Write 0.11 as a fraction. |
| `fdp-frac-to-dec:tenths` | Fractions to decimals › halves, fifths, tenths: 3/5 | FC | 2.4 |  | 1 | Write \frac{1}{2} as a decimal. |
| `fdp-dec-to-frac:zero` | Decimals to fractions › a zero after the point: 0.05 | FC | 2.8 |  | 1 | Write 0.01 as a fraction. |
| `fdp-dec-to-frac:bigger` | Decimals to fractions › bigger than 1: 2.35 | FC | 3.2 |  | 1 | Write 1.9 as a mixed number. |
| `fdp-frac-to-dec:hundredths` | Fractions to decimals › quarters, twentieths, 25ths, 50ths: 7/20 | FC | 3.2 |  | 1 | Write \frac{1}{4} as a decimal. |
| `fdp-perc-to-fd:frac` | Percentages to fractions and decimals › to a fraction: 35% | FC | 3.4 |  | 1 | Write 98\% as a fraction. |
| `fdp-frac-to-dec:mixed` | Fractions to decimals › mixed numbers: 2 3/5 | FC | 3.6 |  | 1 | Write 5\frac{1}{2} as a decimal. |
| `fdp-perc-to-fd:dec` | Percentages to fractions and decimals › to a decimal: 35% | FC | 3.6 |  | 1 | Write 98\% as a decimal. |
| `fdp-to-perc:dec` | Decimals and fractions to percentages › a decimal to a percentage: 0.6, 0.35, 0.07 | FC | 3.8 |  | 1 | Write 0.1 as a percentage. |
| `fdp-to-perc:frac` | Decimals and fractions to percentages › a fraction to a percentage: 7/20 | FC | 4 |  | 1 | Write \frac{1}{4} as a percentage. |
| `fdp-dec-to-frac:thou` | Decimals to fractions › thousandths: 0.125, 0.035 | A | 4.2 |  | 1 | Write 0.012 as a fraction. |
| `fdp-table:frac` | One value in all three forms › given a fraction: 7/20 as a decimal and a percentage | C | 4.4 |  | 2 | Write \frac{1}{4} as: a decimal |
| `fdp-frac-to-dec:eighths` | Fractions to decimals › eighths: 3/8 | A | 4.6 |  | 1 | Write \frac{1}{8} as a decimal. |
| `fdp-table:dec` | One value in all three forms › given a decimal: 0.35 as a fraction and a percentage | C | 4.6 |  | 2 | Write 0.25 as: a fraction |
| `fdp-dec-to-frac:thoubig` | Decimals to fractions › thousandths, bigger than 1: 1.125 | A | 4.8 |  | 1 | Write 1.062 as a mixed number. |
| `fdp-table:perc` | One value in all three forms › given a percentage: 35% as a fraction and a decimal | C | 4.8 |  | 2 | Write 25\% as: a fraction |
| `fdp-perc-to-fd:hardfrac` | Percentages to fractions and decimals › decimal percentage to a fraction: 12.5% | A | 5 |  | 1 | Write 0.5\% as a fraction. |
| `fdp-order:three` | Ordering fractions, decimals and percentages › three values: 3/5, 0.55, 62% | C | 5 |  | 1 | Write these in order, starting with the s… |
| `fdp-frac-to-dec:harder` | Fractions to decimals › harder denominators: 7/40, 3/16 | A | 5.4 |  | 1 | Write \frac{1}{16} as a decimal. |
| `fdp-perc-to-fd:harddec` | Percentages to fractions and decimals › decimal percentage to a decimal: 6.5% | A | 5.4 |  | 1 | Write 0.5\% as a decimal. |
| `fdp-to-perc:harddec` | Decimals and fractions to percentages › a decimal with three places: 0.125, 0.045 | A | 5.4 |  | 1 | Write 0.015 as a percentage. |
| `fdp-beyond:perc` | Beyond one whole › a percentage over 100: 125% as a mixed number and a decimal | CA | 5.4 |  | 2 | Write 105\% as: a mixed number |
| `fdp-to-perc:hard` | Decimals and fractions to percentages › a fraction to a decimal percentage: 3/8, 7/40 | A | 5.6 |  | 1 | Write \frac{1}{8} as a percentage. |
| `fdp-beyond:mixed` | Beyond one whole › a mixed number: 2 3/5 as a decimal and a percentage | CA | 5.8 |  | 2 | Write 4\frac{1}{2} as: a decimal |
| `fdp-table:hard` | One value in all three forms › eighths and 40ths, any form given | A | 6 |  | 2 | Write 12.5\% as: a fraction |
| `fdp-order:four` | Ordering fractions, decimals and percentages › four values, closer together, with thirds or eighths | A | 6.4 |  | 1 | Write these in order, starting with the s… |
| `fdp-beyond:hard` | Beyond one whole › eighths and 40ths: 1 3/8 as a decimal and a percentage | A | 6.6 |  | 2 | Write 4\frac{1}{8} as: a decimal |
| `fdp-mixed-calc:frac` | Calculations with fractions and decimals › add or subtract, answer as a fraction: 0.5 + 1/4 | A | 6.8 |  | 1 | Work out \frac{1}{2} - 0.2. Give your ans… |
| `fdp-recurring-id:which2` | Terminating or recurring? › which of two fractions is a recurring decimal: 7/20 or 7/30 | A | 6.8 |  | 1 | Which of these fractions is a recurring d… |
| `fdp-mixed-calc:dec` | Calculations with fractions and decimals › add or subtract, answer as a decimal: 3/5 − 0.15 | A | 7 |  | 1 | Work out \frac{1}{2} - 0.2. Give your ans… |
| `fdp-recurring-id:which4` | Terminating or recurring? › which of four fractions give recurring decimals | A | 7.4 |  | 1 | Write down the fractions that give recurr… |
| `fdp-mixed-calc:mult` | Calculations with fractions and decimals › multiply, answer as a fraction: 0.2 × 3/8 | A | 7.6 |  | 1 | Work out \frac{1}{2} \times 0.2. Give you… |
| `fdp-recurring-id:dec1` | Terminating or recurring? › write as a recurring decimal, one repeating digit: 5/12 | A | 7.6 |  | 1 | Write \frac{1}{3} as a recurring decimal. |
| `fdp-recurring-id:dec2` | Terminating or recurring? › write as a recurring decimal, two repeating digits: 3/11 | A | 8.2 |  | 1 | Write \frac{1}{11} as a recurring decimal. |
| `fdp-recurring-frac:one` | Recurring decimals to fractions › one repeating digit: 0.3 (dot over the 3) | X | 8.6 |  | 1 | Write 0.\dot{1} as a fraction. |
| `fdp-recurring-frac:two` | Recurring decimals to fractions › two repeating digits: 0.12 (dots over the 1 and the 2) | X | 9 |  | 1 | Write 0.\dot{1}\dot{0} as a fraction. |
| `fdp-recurring-frac:mixed` | Recurring decimals to fractions › a digit before the repeat: 0.16 (dot over the 6) | X | 9.4 |  | 1 | Write 0.19\dot{6} as a fraction. |
| `fdp-recurring-frac:bar` | Recurring decimals to fractions › shown with a bar over the repeating digits (with a note giving the dot form) | X | 9.6 |  | 1 | Write 0.9\overline{6} as a fraction. (0.9… |

## Fractions: problem solving

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `fracprob-amount:count` | A fraction of an amount, in context › a number of people or things | C | 4.2 |  | 1 | There are 93 pupils in Year 7. \frac{2}{3… |
| `fracprob-amount:money` | A fraction of an amount, in context › money | C | 4.4 |  | 1 | Aisha has £90 to spend at the school fair… |
| `fracprob-amount:measure` | A fraction of an amount, in context › a length, mass or capacity | C | 4.6 |  | 1 | A water tank holds 93 litres when it is f… |
| `fracprob-left:left` | How much is left › one question: how much is left? | C | 4.8 |  | 1 | Aisha has £93. Aisha spends \frac{2}{3} o… |
| `fracprob-left:parts` | How much is left › two parts: how much used, how much left? | C | 5 |  | 2 | Aisha has £93. Aisha spends \frac{2}{3} o… |
| `fracprob-fraction-of:same` | One quantity as a fraction of another › same units: 12 of 40 pupils | CA | 5.2 |  | 1 | There are 57 pupils in a class. 45 of the… |
| `fracprob-left:frac` | How much is left › two parts: what fraction is left, how much is left? | C | 5.3 |  | 2 | Aisha has £93. Aisha spends \frac{2}{3} o… |
| `fracprob-add:left` | Adding and subtracting fractions in context › two parts: fraction eaten in total, fraction left | CA | 5.6 |  | 2 | Ravi buys a tub of ice cream. Ravi eats \… |
| `fracprob-add:total` | Adding and subtracting fractions in context › adding two amounts with units | CA | 5.8 |  | 1 | Ravi has a piece of ribbon that is \frac{… |
| `fracprob-fraction-of:units` | One quantity as a fraction of another › convert units first: 35 minutes of 2 hours | CA | 5.9 |  | 1 | A bottle holds 2 litres of juice. Ravi dr… |
| `fracprob-add:sub` | Adding and subtracting fractions in context › subtracting, amount left with units | CA | 6 |  | 1 | A footpath is \frac{1}{2} km long. Ravi h… |
| `fracprob-divide:whole` | Dividing into fractional pieces › whole number ÷ fraction: how many 2/3-litre glasses from 6 litres? | CA | 6.5 |  | 1 | A bag contains 7 kg of rice. Ravi puts th… |
| `fracprob-add:mixed` | Adding and subtracting fractions in context › mixed numbers, adding | A | 6.8 |  | 1 | Ravi uses 4\frac{3}{4} litres of paint on… |
| `fracprob-divide:frac` | Dividing into fractional pieces › fraction ÷ fraction: how many 1/8-litre cups from 3/4 litre? | CA | 6.9 |  | 1 | A bag contains \frac{1}{2} kg of rice. Ra… |
| `fracprob-stages:orig` | Two stages of spending › two fractions of the original: 1/3 then 1/4 of the money | CA | 7 |  | 2 | Sofia has £60. Sofia spends \frac{1}{4} o… |
| `fracprob-add:mixedsub` | Adding and subtracting fractions in context › mixed numbers, subtracting | A | 7.2 |  | 1 | A watering can holds 4\frac{3}{4} litres … |
| `fracprob-divide:mixed` | Dividing into fractional pieces › mixed numbers: how many 3/4 m pieces from 7 1/2 m? | A | 7.5 |  | 1 | A jug holds 2\frac{5}{8} litres of orange… |
| `fracprob-stages:rest` | Two stages of spending › second fraction of what is left | CA | 7.6 |  | 2 | Sofia has £180. Sofia spends \frac{5}{6} … |
| `fracprob-backwards:part` | Working backwards › a fraction of the whole is known: 3/5 of the pupils are girls | A | 7.6 |  | 1 | \frac{2}{9} of the pupils in the school c… |
| `fracprob-change:inc` | Increase and decrease by a fraction › increase by a fraction: increase 40 kg by 3/8 | CA | 7.7 |  | 1 | A train ticket costs £32. The price goes … |
| `fracprob-change:dec` | Increase and decrease by a fraction › decrease by a fraction: reduce £48 by 1/6 | CA | 7.9 |  | 1 | A school has 104 pupils. The number of pu… |
| `fracprob-backwards:left` | Working backwards › what is left is known: spent 2/7 and has £45 left | A | 8 |  | 1 | Sofia spends \frac{5}{7} of Sofia's savin… |
| `fracprob-group:rest` | Fractions of a group › two fractions, the rest is a number: find the total | CA | 8 |  | 2 | \frac{1}{6} of the pupils in Year 6 walk … |
| `fracprob-change:rev` | Increase and decrease by a fraction › find the original amount: a price falls by 1/5 to £36 | CA | 8.4 |  | 1 | After a diet, a dog's mass goes down by \… |
| `fracprob-group:of` | Fractions of a group › fraction of a fraction: 2/5 are girls, 1/3 of the girls play hockey | A | 8.5 |  | 2 | There are 60 pupils in Year 7. \frac{2}{3… |
| `fracprob-multi:share` | Multi-step with several fractions › three people share a cost; find the total | A | 8.6 |  | 2 | Ravi, Olivia and Zara share the cost of a… |
| `fracprob-multi:stages` | Multi-step with several fractions › two stages, find the starting amount | A | 8.9 |  | 1 | Ravi reads \frac{3}{5} of a book on Frida… |
| `fracprob-multi:three` | Multi-step with several fractions › three stages, find the starting amount | A | 9.4 |  | 1 | Ravi is given some money. Ravi spends \fr… |

## HCF and LCM

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `hcf-lcm:hcf` | HCF and LCM › HCF of two numbers | CA | 3 |  | 1 | Find the highest common factor (HCF) of 5… |
| `hcf-lcm:lcm` | HCF and LCM › LCM of two numbers | CA | 3.5 |  | 1 | Find the lowest common multiple (LCM) of … |
| `hcf-lcm:both` | HCF and LCM › HCF and LCM of two numbers (two parts) | CA | 4 |  | 2 | Two numbers are 54 and 45. Find the highe… |
| `hcf-lcm:hcf-big` | HCF and LCM › HCF of two larger numbers | CA | 5 |  | 1 | Find the highest common factor (HCF) of 5… |
| `hcf-lcm:lcm-big` | HCF and LCM › LCM of two larger numbers | CA | 5.5 |  | 1 | Find the lowest common multiple (LCM) of … |

## Indices

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `indices-multiply:one` | Multiply terms with powers › one letter | CA | 3 |  | 1 | Simplify 2x^{4} \times 6x^{3} |
| `indices-multiply:two` | Multiply terms with powers › two letters | CA | 4 |  | 1 | Simplify 2a^{4}b^{3} \times 6a^{4}b^{2} |
| `indices-divide:div` | Divide terms with powers › written with ÷ (one letter) | CA | 4 |  | 1 | Simplify 6x^{5} \div 5x^{2} |
| `indices-multiply:neg` | Multiply terms with powers › two letters, negative coefficient | CA | 5 |  | 1 | Simplify 2a^{3}b^{2} \times 5a^{5}b |
| `indices-divide:frac` | Divide terms with powers › fraction form (two letters) | CA | 5 |  | 1 | Simplify \frac{6x^{5}y^{4{5x^{2}y}}} |

## Order of operations (BIDMAS)

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `bidmas-standard:four` | BIDMAS: standard › four operations (no brackets) | FC | 2 |  | 1 | Evaluate 7 + 9 \times 7 - 11 |
| `bidmas-standard:bp` | BIDMAS: standard › brackets and powers | FC | 3 |  | 1 | Evaluate 3 \times (7 + 9) \div 4 - 3 |
| `bidmas-negatives:std` | BIDMAS: negatives and powers › negatives with squares and cubes | CA | 6 |  | 1 | Evaluate (-2)^{2} - 3^{3} - (-4)^{2} |

## Percentages

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `pct-benchmark:half` | Benchmark percentages › 50% of an amount | FC | 1.4 |  | 1 | Find 50% of £24. |
| `pct-benchmark:tenth` | Benchmark percentages › 10% of an amount | FC | 1.7 |  | 1 | Find 10% of £30. |
| `pct-benchmark:quarter` | Benchmark percentages › 25% of an amount | FC | 2 |  | 1 | Find 25% of £24. |
| `pct-benchmark:threeq` | Benchmark percentages › 75% of an amount | FC | 2.5 |  | 1 | Find 75% of £24. |
| `pct-benchmark:ctx` | Benchmark percentages › 50%, 25%, 10% or 75%, in context | FC | 2.8 |  | 1 | Will earns £800 in a month and saves 50% … |
| `pct-buildup:tens` | Percentage of an amount: build up › multiples of 10%: 20%, 30%, 60% of an amount | FC | 2.9 |  | 1 | Find 20% of 40 ml. |
| `pct-buildup:five` | Percentage of an amount: build up › 5% of an amount | FC | 3.2 |  | 1 | Find 5% of 40 ml. |
| `pct-of-another:easy` | One quantity as a percentage of another › denominator 10, 20, 25 or 50: 18 out of 50 | FC | 3.4 |  | 1 | Write 28 as a percentage of 50. |
| `pct-buildup:fives` | Percentage of an amount: build up › 15%, 35%, 45%… of an amount | FC | 3.6 |  | 1 | Find 15% of 40 ml. |
| `pct-change-by:plain-inc` | Increase or decrease by a percentage › increase an amount by a percentage | C | 3.7 |  | 1 | Increase 280 cm by 75%. |
| `pct-buildup:one` | Percentage of an amount: build up › 1%, 2%, 3%… of an amount | FC | 3.9 |  | 1 | Find 1% of 100 ml. |
| `pct-change-by:plain-dec` | Increase or decrease by a percentage › decrease an amount by a percentage | C | 3.9 |  | 1 | Decrease 280 cm by 75%. |
| `pct-buildup:ctx` | Percentage of an amount: build up › multiples of 5% in context | FC | 4.1 |  | 1 | Will earns £800 in a month and saves 5% o… |
| `pct-of-another:ctx` | One quantity as a percentage of another › denominator 10, 20, 25 or 50, in context | FC | 4.2 |  | 1 | A bike costs £50. Ravi has saved £28 towa… |
| `pct-harder:pence` | Percentage of an amount: harder, no calculator › money that gives pence: 15% of £64 | C | 4.4 |  | 1 | Find 35% of £32. |
| `pct-change-by:inc` | Increase or decrease by a percentage › worded increase, no calculator | C | 4.5 |  | 1 | Ravi pays £40 a month for a phone contrac… |
| `pct-harder:ctx` | Percentage of an amount: harder, no calculator › money that gives pence, in context | C | 4.7 |  | 1 | Isla is paid £30 for a job and spends 75%… |
| `pct-change-by:dec` | Increase or decrease by a percentage › worded decrease, no calculator | C | 4.7 |  | 1 | Ravi plans to cycle 80 km. Ravi is tired … |
| `pct-calc:whole` | Percentage of an amount, calculator › any percentage of an amount: 23% of 640 kg | C | 4.8 | yes | 1 | Calculate 3% of 100 km. |
| `pct-harder:over` | Percentage of an amount: harder, no calculator › over 100%: 150% of an amount | C | 4.9 |  | 1 | A recipe for a small cake uses 240 g of s… |
| `pct-calc:money` | Percentage of an amount, calculator › money, to the penny: 17% of £256 | C | 5 | yes | 1 | Calculate 3% of £179. |
| `pct-find-change:inc` | Percentage change, profit and loss › percentage increase | C | 5 |  | 1 | A plant grew from a height of 500 cm to a… |
| `pct-find-change:profit` | Percentage change, profit and loss › percentage profit | C | 5.2 |  | 1 | Ravi buys an used painting for £500 and s… |
| `pct-harder:eighth` | Percentage of an amount: harder, no calculator › 12.5% of an amount | A | 5.3 |  | 1 | Find 12.5% of £16. |
| `pct-calc:ctx` | Percentage of an amount, calculator › any percentage, in context | C | 5.3 | yes | 1 | Will earns £800 in a month and saves 8% o… |
| `pct-change-by:inc-calc` | Increase or decrease by a percentage › worded increase, calculator | CA | 5.4 | yes | 1 | Ravi pays £52 a month for a phone contrac… |
| `pct-find-change:dec` | Percentage change, profit and loss › percentage decrease | C | 5.5 |  | 1 | A parcel had a mass of 500 kg. After some… |
| `pct-harder:twohalf` | Percentage of an amount: harder, no calculator › 2.5% of an amount | A | 5.6 |  | 1 | Find 2.5% of £40. |
| `pct-of-another:forty` | One quantity as a percentage of another › denominator 40, 80 or 200: 30 out of 40 | A | 5.6 |  | 1 | A bike costs £200. Ravi has saved £111 to… |
| `pct-change-by:dec-calc` | Increase or decrease by a percentage › worded decrease, calculator | CA | 5.6 | yes | 1 | Ravi plans to cycle 80 km. Ravi is tired … |
| `pct-find-change:loss` | Percentage change, profit and loss › percentage loss | C | 5.7 |  | 1 | Ravi buys a painting for £500 and later s… |
| `pct-change-by:vat` | Increase or decrease by a percentage › add VAT at 20%, calculator | CA | 5.8 | yes | 1 | The price of a laptop is £599 plus VAT at… |
| `pct-multiplier:inc` | Percentage multipliers › multiplier for a percentage increase: 15% → 1.15 | CA | 5.8 |  | 1 | The price of a jacket is increased by 5%.… |
| `pct-harder:seventeen` | Percentage of an amount: harder, no calculator › 17.5% of an amount | A | 6 |  | 1 | Find 17.5% of £40. |
| `pct-calc:decimal` | Percentage of an amount, calculator › decimal percentage: 4.5% of £372 | A | 6 | yes | 1 | Calculate 0.5% of £178. |
| `pct-multiplier:dec` | Percentage multipliers › multiplier for a percentage decrease: 8% → 0.92 | CA | 6.1 |  | 1 | In a sale, the price of a jacket is reduc… |
| `pct-of-another:simplify` | One quantity as a percentage of another › simplify first: 21 out of 56 | A | 6.2 |  | 1 | A bike costs £180. Ravi has saved £99 tow… |
| `pct-change-by:over` | Increase or decrease by a percentage › worded increase of more than 100% | A | 6.3 |  | 1 | A small company made a profit of £10,000 … |
| `pct-reverse:part-easy` | Reverse percentages › find the whole from a part: 28 is 20% of what? | CA | 6.4 |  | 1 | 25% of a number is 75. Work out the numbe… |
| `pct-find-change:inc-calc` | Percentage change, profit and loss › percentage increase, calculator, to 1 d.p. | CA | 6.5 | yes | 1 | A plant grew from a height of 440 cm to a… |
| `pct-of-another:calc` | One quantity as a percentage of another › calculator, to 1 decimal place: 37 out of 90 | CA | 6.6 | yes | 1 | A school has 350 pupils. 193 of the pupil… |
| `pct-change-by:decimal-calc` | Increase or decrease by a percentage › decimal percentage, calculator | A | 6.6 | yes | 1 | Ravi pays £52 a month for a phone contrac… |
| `pct-find-change:dec-calc` | Percentage change, profit and loss › percentage decrease, calculator, to 1 d.p. | CA | 6.8 | yes | 1 | Ravi's time for a race fell from 38 minut… |
| `pct-reverse:sale` | Reverse percentages › after a decrease (sale price) | A | 6.8 |  | 1 | A parcel loses 20% of its mass when some … |
| `pct-multiplier:decimal` | Percentage multipliers › multiplier for a decimal percentage: 2.5% → 1.025 | A | 6.9 |  | 1 | The price of a camera is increased by 2.5… |
| `pct-multiplier:over` | Percentage multipliers › multiplier for an increase of more than 100% | A | 7 |  | 1 | The price of a jacket is increased by 120… |
| `pct-reverse:increase` | Reverse percentages › after an increase | A | 7 |  | 1 | A recipe uses 20% more flour than it did … |
| `pct-find-change:profit-calc` | Percentage change, profit and loss › percentage profit or loss, calculator, to 1 d.p. | A | 7.2 | yes | 1 | Ravi buys an used painting for £440 and s… |
| `pct-reverse:part` | Reverse percentages › find the whole from a part, any percentage | A | 7.2 |  | 1 | 30% of a number is 75. Work out the numbe… |
| `pct-reverse:sale-calc` | Reverse percentages › after a decrease, calculator | A | 7.4 | yes | 1 | A parcel loses 18% of its mass when some … |
| `pct-reverse:increase-calc` | Reverse percentages › after an increase, calculator | A | 7.6 | yes | 1 | A recipe uses 18% more flour than it did … |
| `pct-reverse:vat` | Reverse percentages › price including VAT at 20%, find the price before VAT | A | 7.8 | yes | 1 | The total price of a laptop, including VA… |
| `pct-compound:two-step` | Compound interest and repeated change › two years, year by year (two parts) | A | 7.8 | yes | 2 | Ravi invests £5,000 in a savings account.… |
| `pct-compound:interest` | Compound interest and repeated change › compound interest, 2 to 4 years | A | 8.2 | yes | 1 | Ravi invests £2,000 in a savings account.… |
| `pct-repeat:price` | Repeated change, up and then down › a price goes up then down: value, then overall change | A | 8.4 |  | 2 | The price of a jacket is £1,000. In Janua… |
| `pct-compound:depreciation` | Compound interest and repeated change › depreciation, successive decreases | A | 8.5 | yes | 1 | A new van is worth £25,000. Its value fal… |
| `pct-repeat:multiplier` | Repeated change, up and then down › a rise then a fall as a single multiplier | A | 8.8 |  | 2 | The value of a painting increases by 20% … |
| `pct-compound-find:years` | Compound interest: finding a time or a rate › how many years to reach a target | X | 9.4 | yes | 1 | Ravi invests £2,500 in a savings account.… |
| `pct-compound-find:rate` | Compound interest: finding a time or a rate › find the annual rate | X | 9.8 | yes | 1 | Ravi invests £10,000 in a savings account… |

## Percentages: problem solving

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `pctprob-rest:percent` | The rest › what percentage are not… | C | 3.8 |  | 1 | A fruit bowl contains only apples and pea… |
| `pctprob-rest:count` | The rest › how many are not…, from a total | C | 4.4 |  | 1 | Ravi is given £80. Ravi spends 45% of the… |
| `pctprob-survey:rest` | Survey results › how many chose the third choice? | C | 5 |  | 1 | In a survey, 160 people are asked about t… |
| `pctprob-survey:compare` | Survey results › how many more chose one than another? | C | 5.4 |  | 1 | In a survey, 160 people are asked about t… |
| `pctprob-pay:overtime` | Pay, tax and overtime › overtime paid at a percentage of the usual rate | C | 5.5 |  | 1 | Ravi is paid £20 for each hour of work. F… |
| `pctprob-group:of-of` | A percentage of a percentage › a percentage of a group, then a percentage of those | C | 5.6 |  | 1 | A library has 1,000 books. 40% of the boo… |
| `pctprob-group:of-rest` | A percentage of a percentage › a percentage of the rest | CA | 6.2 |  | 1 | Ravi has £400. Ravi spends 50% of the mon… |
| `pctprob-pay:rise-year` | Pay, tax and overtime › pay rise, then pay for a year | CA | 6.2 |  | 1 | Ravi earns £2,500 a month. Ravi gets a pa… |
| `pctprob-whole:unit` | Finding the whole from a part › 10%, 20%, 25%, 50% or 5% is given | CA | 6.4 |  | 1 | A cake contains 25 g of sugar. This is 5%… |
| `pctprob-best-buy:percent` | Best buy › two percentage discounts | CA | 6.4 |  | 1 | A jacket is sold in two shops. In Shop A,… |
| `pctprob-best-buy:amount` | Best buy › a percentage against an amount off | CA | 6.6 |  | 1 | A jacket is sold in two shops. In Shop A,… |
| `pctprob-pay:tax` | Pay, tax and overtime › tax on earnings above an allowance | CA | 6.6 |  | 1 | Ravi earns £3,500 a month. Ravi pays tax … |
| `pctprob-profit:sell` | Profit, loss and selling price › selling price after a percentage profit | A | 6.6 |  | 1 | Ravi buys a record player for £80 and sel… |
| `pctprob-best-buy:fraction` | Best buy › a percentage against a fraction off | CA | 6.8 |  | 1 | A jacket is sold in two shops. In Shop A,… |
| `pctprob-profit:loss` | Profit, loss and selling price › selling price after a percentage loss | A | 6.8 |  | 1 | Ravi buys a record player for £80 and sel… |
| `pctprob-whole:any` | Finding the whole from a part › any whole-number percentage is given | A | 7.4 |  | 1 | A cake contains 180 g of sugar. This is 3… |
| `pctprob-sale-vat:sale-vat` | Sale and VAT › a sale price, then add VAT at 20% | A | 7.4 | yes | 1 | The price of a guitar is £239 before VAT.… |
| `pctprob-fraction-ratio:fraction` | Percentages with fractions and ratio › a fraction of the group, then a percentage | A | 7.6 |  | 1 | There are 400 pupils in a year group. \fr… |
| `pctprob-whole:rest` | Finding the whole from a part › find the whole, then the rest | A | 7.8 |  | 1 | A cake contains 225 g of sugar. This is 4… |
| `pctprob-sale-vat:two-discounts` | Sale and VAT › a discount, then a further discount | A | 7.8 | yes | 1 | A guitar costs £239. In a sale, the price… |
| `pctprob-fraction-ratio:percent-fraction` | Percentages with fractions and ratio › a percentage of the group, then a fraction | A | 7.8 |  | 1 | A school has 600 pupils. 40% of the pupil… |
| `pctprob-profit:cost` | Profit, loss and selling price › find the cost price from a profit | A | 8.2 |  | 1 | Ravi sells a record player for £120. This… |
| `pctprob-fraction-ratio:ratio` | Percentages with fractions and ratio › a ratio, then a percentage | A | 8.2 |  | 1 | The ratio of boys to girls in a swimming … |
| `pctprob-growth:grows` | Growth and decline over several years › growth over several years, nearest whole number | A | 8.4 | yes | 1 | The population of a town is 2,000. It gro… |
| `pctprob-growth:falls` | Growth and decline over several years › decline over several years, nearest whole number | A | 8.6 | yes | 1 | There are 1,000 fish in a lake. The numbe… |

## Place value and rounding

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `rounding:nearest` | Rounding › nearest 10, 100 or 1000 (three numbers) | FCA | 1.5 |  | 3 | Round 2344 to the nearest ten |
| `rounding:dp` | Rounding › decimal places (three numbers) | FCA | 2.5 |  | 3 | Round to 1 decimal place 3.9792 |
| `rounding:sf` | Rounding › significant figures (three numbers) | FCA | 4 |  | 3 | Round to 1 significant figure 0.009792 |

## Prime factorisation

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `prime-factorisation:one` | Prime factorisation in index form › one number | CA | 4 |  | 1 | Write 168 as a product of its prime facto… |

## Probability

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `probability:bag` | Probability › counters in a bag (single event) | FCA | 2 |  | 1 | A bag contains 6 yellow counters, 5 blue … |
| `probability:bag-two` | Probability › counters in a bag (event and not event) | FCA | 3 |  | 2 | A bag contains 6 yellow counters, 5 blue … |
| `probability:expected` | Probability › expected number of times | FCA | 4 |  | 1 | A biased spinner lands on yellow with pro… |

## Problem solving

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `counting-puzzles:mealDeal` | Counting and patterns › meal deals (counting combinations) | FC | 3.8 |  | 1 | A café has 3 kinds of sandwich, 3 kinds o… |
| `reasoning-problems:backNumber` | Reasoning problems › I think of a number (work backwards) | C | 4.8 |  | 1 | Ravi thinks of a number. Ravi multiplies … |
| `problem-solving:multiples` | Puzzle / multi-step reasoning › count the multiples in a range | CA | 5 |  | 1 | How many multiples of 7 are there between… |
| `counting-puzzles:digitSum` | Counting and patterns › two-digit numbers with a given digit sum | C | 5.2 |  | 1 | How many two-digit numbers have digits th… |
| `problem-solving:consecutive` | Puzzle / multi-step reasoning › consecutive numbers with a given sum | CA | 5.5 |  | 1 | The sum of three consecutive odd numbers … |
| `counting-puzzles:digitProduct` | Counting and patterns › two-digit numbers with a given digit product | CA | 5.7 |  | 1 | How many two-digit numbers have digits th… |
| `reasoning-problems:cutCorners` | Reasoning problems › perimeter after cutting corners | C | 5.8 |  | 1 | A rectangle measures 12 cm by 10 cm. A sq… |
| `counting-puzzles:cycleTerm` | Counting and patterns › a repeating pattern: find the Nth number | C | 5.9 |  | 1 | The numbers 7, 6, 9, 7, 6, 9, 7, 6, 9, … … |
| `problem-solving:tank` | Puzzle / multi-step reasoning › fraction of a container | CA | 6 |  | 1 | A oil drum is \frac{1}{4} full. When 33 l… |
| `problem-solving:rect` | Puzzle / multi-step reasoning › rectangle with a perimeter and a difference | CA | 6 |  | 1 | A rectangle has a perimeter of 20 cm. Its… |
| `counting-puzzles:palindromes` | Counting and patterns › three-digit palindromes (a fixed question) | CA | 6.2 |  | 1 | A palindrome is a number that reads the s… |
| `reasoning-problems:venn` | Reasoning problems › overlap of two groups | CA | 6.2 |  | 1 | In a class of 30 pupils, 16 play football… |
| `counting-puzzles:homeAway` | Counting and patterns › a league, home and away | CA | 6.3 |  | 1 | There are 6 teams in a football league. E… |
| `counting-puzzles:gauss` | Counting and patterns › add up the numbers from 1 to n | CA | 6.4 |  | 1 | Work out the sum of all the whole numbers… |
| `problem-solving:ages` | Puzzle / multi-step reasoning › ages in the future | CA | 6.5 |  | 1 | Ravi is 6 times as old as Olivia. In 2 ye… |
| `counting-puzzles:digitCount` | Counting and patterns › how many times a digit is written | CA | 6.6 |  | 1 | Zara writes down every whole number from … |
| `counting-puzzles:daysCount` | Counting and patterns › how many of a weekday in the next N days | CA | 6.7 |  | 1 | Today is a Monday. How many Mondays are t… |
| `reasoning-problems:upDown` | Reasoning problems › a percentage increase then the same decrease | A | 6.8 |  | 1 | The price of a coat is increased by 10%. … |
| `counting-puzzles:oddSum` | Counting and patterns › add up the first n odd numbers | A | 6.9 |  | 1 | Work out the sum of the first 10 odd numb… |
| `problem-solving:digits` | Puzzle / multi-step reasoning › digit puzzle (digits reversed) | CA | 7 |  | 1 | A two-digit number has digits that add up… |
| `problem-solving:sweets` | Puzzle / multi-step reasoning › sharing with more than / times as many | CA | 7 |  | 1 | Ravi, Olivia and Zara have 172 stickers a… |
| `reasoning-problems:meanCombined` | Reasoning problems › mean of two groups combined | A | 7 |  | 1 | In a test, the 10 girls in a class have a… |
| `counting-puzzles:knockout` | Counting and patterns › matches in a knockout tournament | A | 7.1 |  | 1 | 13 players enter a tennis tournament. In … |
| `counting-puzzles:flash` | Counting and patterns › lights flashing together (lowest common multiple) | A | 7.2 |  | 1 | Two lights flash together at exactly 8:00… |
| `reasoning-problems:sumProduct` | Reasoning problems › two numbers with a given sum and product | A | 7.3 |  | 1 | Two positive whole numbers have a sum of … |
| `counting-puzzles:gridSquares` | Counting and patterns › count the squares in a grid | A | 7.4 |  | 1 | A big square is made of 3 rows and 3 colu… |
| `problem-solving:legs` | Puzzle / multi-step reasoning › heads and legs | CA | 7.5 |  | 1 | A farm has only ducks and sheep. There ar… |
| `problem-solving:train` | Puzzle / multi-step reasoning › train through a tunnel | CA | 7.5 |  | 1 | A train is 120 m long. It takes 12 second… |
| `reasoning-problems:consecProduct` | Reasoning problems › two consecutive numbers with a given product | A | 7.5 |  | 1 | The product of two consecutive whole numb… |
| `counting-puzzles:threeDigitSum` | Counting and patterns › three-digit numbers with a given digit sum | A | 7.7 |  | 1 | How many three-digit numbers have digits … |
| `reasoning-problems:meanLeaves` | Reasoning problems › mean age when one person leaves | A | 7.9 |  | 1 | The mean age of the 9 players in a hockey… |
| `problem-solving:handshake` | Puzzle / multi-step reasoning › handshakes | CA | 8 |  | 1 | There are 6 people at a meeting. Each per… |
| `counting-puzzles:gridRect` | Counting and patterns › count the rectangles in a grid | AX | 8.3 |  | 1 | A grid is made of 2 rows and 3 columns of… |
| `reasoning-problems:harmonic` | Reasoning problems › average speed there and back | AX | 8.4 |  | 1 | The distance from Ashford to Bexley is 60… |
| `counting-puzzles:arrange` | Counting and patterns › arranging digits: how many are even | AX | 8.6 |  | 1 | Three different digits are chosen from 2,… |
| `counting-puzzles:clockAngle` | Counting and patterns › angle between the hands of a clock | X | 8.8 |  | 1 | What is the smaller angle between the hou… |
| `counting-puzzles:lastDigit` | Counting and patterns › the units digit of a power | X | 9 |  | 1 | What is the units digit of 2^{22}? |
| `counting-puzzles:lazyCaterer` | Counting and patterns › cutting a pizza into the most pieces | X | 9.2 |  | 1 | A round pizza is cut using 3 straight cut… |
| `counting-puzzles:oppositeHands` | Counting and patterns › clock hands pointing opposite ways (a fixed question) | X | 9.4 |  | 1 | How many times between 12 noon and 12 mid… |

## Pythagoras

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `pythagoras:hyp` | Pythagoras › find the hypotenuse | CA | 4 |  | 1 | A right-angled triangle has shorter sides… |
| `pythagoras:short` | Pythagoras › find a shorter side | CA | 5 |  | 1 | A right-angled triangle has a hypotenuse … |
| `pythagoras:walk` | Pythagoras › worded: distance from start (two legs) | CA | 5.5 |  | 1 | Will walks 3 km due north and then 4 km d… |
| `pythagoras:diag` | Pythagoras › worded: diagonal of a rectangle | CA | 6 |  | 1 | A rectangular field has length 4 m and wi… |
| `pythagoras:ladder` | Pythagoras › worded: ladder against a wall | CA | 7 |  | 1 | A ladder, 5 m long, leans against a verti… |

## Ratio and proportion

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `rp-write:counts` | Writing a ratio › two quantities: 3 red and 5 blue, red to blue | FC | 1 |  | 1 | There are 2 boys and 15 girls in a school… |
| `rp-write:order` | Writing a ratio › second quantity first: girls to boys | FC | 1.3 |  | 1 | There are 2 boys and 15 girls in a school… |
| `rp-write:three` | Writing a ratio › three quantities: red : blue : green | FC | 1.6 |  | 1 | There are 2 red, 12 blue and 9 green coun… |
| `rp-simplify:two` | Simplifying ratios › two parts: 12 : 18 | FC | 1.9 |  | 1 | Simplify the ratio 54 : 42 |
| `rp-simplify:three` | Simplifying ratios › three parts: 8 : 12 : 20 | FC | 2.2 |  | 1 | Simplify the ratio 7 : 7 : 42 |
| `rp-equivalent:second` | Equivalent ratios and missing values › missing second number: 3 : 5 = 12 : ? | C | 2.4 |  | 1 | Find the missing number: 9 : 7 = 54 : \sq… |
| `rp-simplify:ctx` | Simplifying ratios › from a worded count: 20 boys and 15 girls | FC | 2.5 |  | 1 | There are 36 cats and 28 dogs at a rescue… |
| `rp-equivalent:first` | Equivalent ratios and missing values › missing first number: 4 : 9 = ? : 36 | C | 2.6 |  | 1 | Find the missing number: 9 : 7 = \square … |
| `rp-equivalent:down` | Equivalent ratios and missing values › scaling down: 20 : 35 = ? : 7 | C | 2.8 |  | 1 | Find the missing number: 54 : 42 = \squar… |
| `rp-equivalent:ctx` | Equivalent ratios and missing values › recipe scaled up (worded) | C | 3 |  | 1 | A bracelet has 9 blue beads for every 7 w… |
| `rp-simplify-units:length` | Simplifying ratios with units › lengths: 40 cm : 1 m | C | 3.2 |  | 1 | Simplify the ratio 3 m : 60 cm. |
| `rp-simplify-units:money` | Simplifying ratios with units › money: 50p : £2 | C | 3.2 |  | 1 | Simplify the ratio 105p : £7. |
| `rp-simplify-units:mass` | Simplifying ratios with units › masses and volumes: 250 g : 2 kg | C | 3.3 |  | 1 | Simplify the ratio 5 kg : 1250 g. |
| `rp-simplify-units:time` | Simplifying ratios with units › time: 45 minutes : 2 hours | CA | 3.6 |  | 1 | Simplify the ratio 64 minutes : 4 hours. |
| `rp-simplify-dec:decimal` | Simplifying ratios with decimals and fractions › decimals: 0.4 : 1.6 | A | 3.8 |  | 1 | Simplify the ratio 1.25 : 1. |
| `rp-simplify-dec:fraction` | Simplifying ratios with decimals and fractions › fractions: 1/2 : 3/4 | A | 4 |  | 1 | Simplify the ratio \frac{1}{2} : \frac{2}… |
| `rp-simplify-dec:mixed` | Simplifying ratios with decimals and fractions › a fraction and a decimal: 1/4 : 0.5 | A | 4.2 |  | 1 | Simplify the ratio \frac{3}{5} : 0.3. |
| `rp-one-n:one-n` | Ratios in the form 1 : n and n : 1 › as 1 : n: 4 : 10 | A | 4.2 |  | 1 | Write the ratio 4 : 36 in the form 1 : n. |
| `rp-one-n:n-one` | Ratios in the form 1 : n and n : 1 › as n : 1: 5 : 2 | A | 4.5 |  | 1 | Write the ratio 20 : 16 in the form n : 1. |
| `rp-one-n:model` | Ratios in the form 1 : n and n : 1 › a model and the real thing, as 1 : n | A | 4.8 |  | 1 | A model car is 30 cm long. The real car i… |
| `rp-share2:count` | Sharing in a ratio: two parts › share sweets, stickers or cards | C | 4.9 |  | 1 | Tom and Kai share 204 football cards in t… |
| `rp-share2:money` | Sharing in a ratio: two parts › share money between two people | C | 5 |  | 1 | Tom and Kai share £204 in the ratio 7 : 5… |
| `rp-share2:one` | Sharing in a ratio: two parts › find just one of the shares | C | 5.1 |  | 1 | Tom and Kai share £204 in the ratio 7 : 5… |
| `rp-share2:ctx` | Sharing in a ratio: two parts › split a mass, volume or length (units) | C | 5.4 |  | 1 | A rope 72 m long is cut into two pieces i… |
| `rp-share3:one` | Sharing in a ratio: three parts › find just one of the shares | C | 5.4 |  | 1 | Victor, Zara and Ben share £120 in the ra… |
| `rp-share3:count` | Sharing in a ratio: three parts › share sweets, stickers or cards | CA | 5.5 |  | 1 | Victor, Zara and Ben share 120 stamps in … |
| `rp-share3:money` | Sharing in a ratio: three parts › share money between three people | CA | 5.6 |  | 1 | Victor, Zara and Ben share £120 in the ra… |
| `rp-one-share:other` | One share given: find the other or the total › find the other quantity: 3 : 4, 15 boys, how many girls | C | 5.7 |  | 1 | The ratio of fiction books to non-fiction… |
| `rp-share3:ctx` | Sharing in a ratio: three parts › split a mass, volume or length (units) | CA | 5.9 |  | 1 | A ribbon 60 cm long is cut into three pie… |
| `rp-one-share:total` | One share given: find the other or the total › find the total: 3 : 4, 15 boys, how many pupils | C | 5.9 |  | 1 | The ratio of fiction books to non-fiction… |
| `rp-difference:larger` | Ratio with a given difference › difference given, find the larger quantity | C | 6 |  | 1 | The ratio of apples to oranges in a bowl … |
| `rp-one-share:ctx` | One share given: find the other or the total › measured quantities (units) | C | 6.1 |  | 1 | Blue paint and white paint are mixed in t… |
| `rp-difference:total` | Ratio with a given difference › difference given, find the total | C | 6.2 |  | 1 | The ratio of apples to oranges in a bowl … |
| `rp-difference:both` | Ratio with a given difference › difference given, find both quantities | CA | 6.5 |  | 1 | The ratio of apples to oranges in a bowl … |
| `rp-fraction:frac-of` | Ratios and fractions › ratio to fraction: 2 : 3, what fraction are boys | C | 6.6 |  | 1 | The ratio of cats to dogs at a rescue cen… |
| `rp-fraction:to-ratio` | Ratios and fractions › fraction to ratio: 3/5 are girls, boys to girls | C | 6.7 |  | 1 | \frac{1}{4} of the pieces of fruit in a b… |
| `rp-direct:cost` | Direct proportion: the unitary method › cost of items: 5 pens cost £3.50, cost of 8 | FC | 6.8 |  | 1 | 8 stickers cost £1.60. Work out the cost … |
| `rp-difference:three` | Ratio with a given difference › three-part ratio, difference between two parts | A | 7 |  | 1 | The ratio of red, blue and green counters… |
| `rp-fraction:three` | Ratios and fractions › three-part ratio to fraction | CA | 7 |  | 1 | The ratio of gold, silver and bronze meda… |
| `rp-direct:ctx` | Direct proportion: the unitary method › petrol, pay, baking, printing, walking (units) | FC | 7 |  | 1 | Ravi walks 20 km in 4 hours at a steady s… |
| `rp-recipe:plain` | Direct proportion: recipes › amount per person is a whole number: 4 people to 10 people | C | 7 |  | 1 | A pancake recipe for 4 people uses 100 ml… |
| `rp-direct:back` | Direct proportion: the unitary method › how many can be bought: 8 pens cost £4.80, how many for £9 | C | 7.2 |  | 1 | 8 stickers cost £1.60. How many stickers … |
| `rp-recipe:two` | Direct proportion: recipes › two ingredients (two parts) | C | 7.4 |  | 2 | A pancake recipe for 4 people uses 120 g … |
| `rp-recipe:decimal` | Direct proportion: recipes › amount per person is a decimal: 150 g for 6, for 15 | A | 7.6 |  | 1 | A pancake recipe for 4 people uses 70 ml … |
| `rp-scale:drawing` | Scale drawings and maps › a plan: scale 1 : 50, 4 cm on the plan | A | 7.6 |  | 1 | A plan of a room is drawn to the scale 1 … |
| `rp-scale:map` | Scale drawings and maps › a map: scale 1 : 25 000, 6 cm on the map | A | 7.8 |  | 1 | A map has a scale of 1 : 20 000. Two vill… |
| `rp-scale:to-map` | Scale drawings and maps › real distance to map length | A | 8 |  | 1 | A map has a scale of 1 : 20 000. A lake i… |
| `rp-inverse:workers` | Inverse proportion › workers and time | A | 8 |  | 1 | 12 workers take 10 hours to unload a lorr… |
| `rp-inverse:taps` | Inverse proportion › taps or pumps filling a tank | A | 8 |  | 1 | 15 identical taps fill a tank in 12 minut… |
| `rp-scale:scale` | Scale drawings and maps › find the scale: 4 cm on the map is 2 km | A | 8.2 |  | 1 | On a map, 2 cm represents 0.4 km in real … |
| `rp-inverse:food` | Inverse proportion › food that lasts for a number of animals | A | 8.2 |  | 1 | A farmer has enough hay to feed 15 sheep … |
| `rp-inverse:speed` | Inverse proportion › speed and journey time | A | 8.3 |  | 1 | Ravi drives to a seaside town at an avera… |
| `rp-change:add` | Changing a ratio › some are added: new ratio | A | 8.4 |  | 1 | A bag has 7 boys and 49 girls. 7 more boy… |
| `rp-change:remove` | Changing a ratio › some are taken away: new ratio | A | 8.5 |  | 1 | A bag has 9 boys and 12 girls. 8 of the b… |
| `rp-change:target` | Changing a ratio › how many must be added to make a given ratio | A | 8.8 |  | 1 | A bag has 6 boys and 36 girls. How many m… |
| `rp-combine:abc` | Combining ratios › A : B and B : C, find A : B : C | X | 9.2 |  | 1 | There are red, blue and green marbles in … |
| `rp-combine:total` | Combining ratios › as above, then share a total | X | 9.5 |  | 1 | There are red, blue and green marbles in … |

## Ratio and proportion: problem solving

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `rpprob-mix:total` | Mixing › the total mixture is given: find one ingredient | C | 5.8 |  | 1 | A grey paint is made by mixing black pain… |
| `rpprob-mix:part` | Mixing › one ingredient is given: find another | C | 6 |  | 1 | A grey paint is made by mixing black pain… |
| `rpprob-mix:whole` | Mixing › one ingredient is given: find the total mixture made | CA | 6.2 |  | 1 | A grey paint is made by mixing black pain… |
| `rpprob-share-spend:fraction` | Share, then spend › one share, a fraction of it is spent | C | 6.4 |  | 1 | Uma and Will share £140 in the ratio 4 : … |
| `rpprob-share-spend:percent` | Share, then spend › one share, a percentage is spent | CA | 6.8 |  | 1 | Uma and Will share £140 in the ratio 4 : … |
| `rpprob-decimal:two` | Sharing in a ratio with decimals › two people share an amount with pence | A | 7.2 |  | 1 | Uma and Will share £15.75 in the ratio 4 … |
| `rpprob-ages:now` | Ages in a ratio › ages in a ratio with a total: find one age | A | 7.4 |  | 1 | The ratio of Ravi's age to Olivia's age i… |
| `rpprob-decimal:three` | Sharing in a ratio with decimals › three people share an amount with pence | A | 7.6 |  | 1 | Uma, Will and Victor share £4.80 in the r… |
| `rpprob-ages:future` | Ages in a ratio › ages in a ratio now: find an age in some years | A | 7.8 |  | 1 | The ratio of Ravi's age to Olivia's age i… |
| `rpprob-algebra:find-x` | Ratio and algebra › equal ratios, find x: x : 3 = 8 : 12 | A | 8 |  | 1 | Find the value of x in the equation x : 1… |
| `rpprob-ages:times` | Ages in a ratio › one is a number of times older: find the ages | X | 8.2 |  | 1 | Ravi is 5 times as old as Olivia. The sum… |
| `rpprob-algebra:shares` | Ratio and algebra › shares written as 2x and 3x, then solve (two parts) | A | 8.2 |  | 2 | Victor has 4x sweets and Zara has 3x swee… |
| `rpprob-after:leave` | Ratios that change › some of one group leave, the ratio changes | AX | 8.6 |  | 1 | The ratio of boys to girls in a school cl… |
| `rpprob-hours:output` | Human/work hours › how much is done by a different number of workers in a different time | AX | 8.6 |  | 1 | 8 builders lay 80 bricks in 5 hours. All … |
| `rpprob-after:join` | Ratios that change › some join, the ratio changes | AX | 8.8 |  | 1 | The ratio of boys to girls in a school cl… |
| `rpprob-hours:time` | Human/work hours › how long would a different number of workers take | AX | 8.8 |  | 1 | 8 builders lay 80 bricks in 5 hours. All … |
| `rpprob-hours:workers` | Human/work hours › how many workers are needed | X | 9 |  | 1 | 8 builders lay 80 bricks in 5 hours. All … |
| `rpprob-algebra:expr` | Ratio and algebra › an expression in a ratio: (x + 2) : 5 = 3 : 1 | AX | 9 |  | 1 | Solve (x - 6) : 9 = 1 : 3 |
| `rpprob-after:both` | Ratios that change › the same number is added to both parts | X | 9.2 |  | 1 | The ratio of boys to girls in a school cl… |
| `rpprob-algebra:link` | Ratio and algebra › a ratio and an equation: a : b = 2 : 3 and 3a − b = 9 | X | 9.7 |  | 1 | The ratio a : b is 3 : 2. Also 4a - 2b = … |

## Speed, distance and time

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `speed-distance-time:speed` | Speed, distance and time › find the speed | FCA | 3 |  | 1 | A coach travels 21 miles in 1 hour 45 min… |
| `speed-distance-time:distance` | Speed, distance and time › find the distance | FCA | 3.5 |  | 1 | A coach travels at an average speed of 12… |
| `speed-distance-time:time` | Speed, distance and time › find the time (hours and minutes) | FCA | 5 |  | 1 | A coach travels 21 miles at an average sp… |

## Standard form

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `standard-form:from` | Standard form › write as an ordinary number | CA | 2.5 |  | 1 | Write 2.4 \times 10^{-5} as an ordinary n… |
| `standard-form:to` | Standard form › write a number in standard form | CA | 3 |  | 1 | Write 0.0000024 in standard form. |
| `standard-form:multiply` | Standard form › multiply two numbers in standard form | CA | 5 |  | 1 | Work out (2 \times 10^{8}) \times (2 \tim… |
| `standard-form:divide` | Standard form › divide two numbers in standard form | CA | 5.5 |  | 1 | Work out (2 \times 10^{8}) \div (2 \times… |

## Substitution

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `sub-one:add-sub` | One letter, one operation › add and subtract: a + 5, a − 3, 15 − a | F | 1 |  | 3 | Given that a = 7, evaluate: a - 6 |
| `sub-one:times` | One letter, one operation › multiply: 3a, 5a, 10a | F | 1.2 |  | 3 | Given that a = 7, evaluate: 8a |
| `sub-one:divide` | One letter, one operation › divide: a ÷ 2, a ÷ 5, 24 ÷ a | F | 1.6 |  | 3 | Given that b = 18 and c = 30, evaluate: 3… |
| `sub-two:add-sub` | Two letters, one operation › add and subtract: a + b, a − b | F | 1.8 |  | 3 | Given that a = 6, b = 9 and c = 10, evalu… |
| `sub-two:multiply` | Two letters, one operation › multiply: ab, bc, abc | F | 2.2 |  | 3 | Given that a = 3, b = 2 and c = 5, evalua… |
| `sub-two:mixed` | Two letters, one operation › a mixture: a + b, ab, b − c | F | 2.4 |  | 3 | Given that a = 6, b = 7 and c = 4, evalua… |
| `sub-number-letter:plus` | A number and a letter › multiply then add: 3a + 4, 2 + 5a | FC | 2.4 |  | 3 | Given that a = 7, evaluate: 5 + 4a |
| `sub-number-letter:minus` | A number and a letter › multiply then subtract: 5a − 2, 20 − 3a | FC | 2.8 |  | 3 | Given that a = 4, evaluate: 25 - 3a |
| `sub-table:positive` | Table of values › positive values of x: y = 2x + 3 | FC | 2.9 |  | 1 | Complete the table of values for y = x + … |
| `sub-two:divide` | Two letters, one operation › divide: a ÷ b, c ÷ b | C | 3 |  | 3 | Given that a = 3, b = 12 and c = 9, evalu… |
| `sub-number-letter:two-letter` | A number and a letter › two letters: a + 2b, 3a + b | FC | 3 |  | 3 | Given that a = 3, b = 6 and c = 7, evalua… |
| `sub-two-ops:add` | Two letters, two operations › add: 2a + 3b | C | 3.2 |  | 3 | Given that a = 2, b = 7 and c = 4, evalua… |
| `sub-products:two-letter` | Products of letters › a product: 3ab, 4bc | C | 3.4 |  | 3 | Given that a = 3, b = 4 and c = 5, evalua… |
| `sub-two-ops:subtract` | Two letters, two operations › subtract: 5a − 2b | C | 3.5 |  | 3 | Given that a = 6, b = 7 and c = 4, evalua… |
| `sub-brackets:one-bracket` | Brackets › a number outside: 2(a + 3), 3(a − b) | C | 3.7 |  | 3 | Given that a = 4 and b = 3, evaluate: 5(a… |
| `sub-two-ops:three-terms` | Two letters, two operations › three terms: 2a + 3b − c | C | 3.8 |  | 3 | Given that a = 5, b = 6 and c = 3, evalua… |
| `sub-products:plus-minus` | Products of letters › a product and a term: ab + c, 2ab − 3c | C | 3.9 |  | 3 | Given that a = 4, b = 5 and c = 3, evalua… |
| `sub-formula:shapes` | Using a formula › perimeter, area and volume: P = 2l + 2w | C | 4 |  | 3 | Use the formula P = 2l + 2w. Work out the… |
| `sub-fractions:divide` | Fractions in an expression › with a division sign: a ÷ 2 + 3, 24 ÷ a | CA | 4.1 |  | 3 | Given that a = 20, evaluate: a \div 2 + 3 |
| `sub-products:three-letter` | Products of letters › three letters: abc, 2abc | C | 4.2 |  | 3 | Given that a = 3, b = 4 and c = 5, evalua… |
| `sub-squares:simple` | Squares › one square: a², a² + 3, 2a² | C | 4.2 |  | 3 | Given that a = 4 and b = 3, evaluate: a^{… |
| `sub-brackets:letter-outside` | Brackets › a letter outside: a(b + c) | C | 4.3 |  | 3 | Given that a = 5, b = 7 and c = 3, evalua… |
| `sub-worded:cost` | Worded formulas › a cost formula: C = 15 + 8d | C | 4.4 |  | 1 | A taxi company uses the formula C = 2 + 4… |
| `sub-neg-add:one-negative` | Negative values: add and subtract › one value is negative: a + b, a − b | C | 4.6 |  | 3 | Given that a = -5, b = 6 and c = 3, evalu… |
| `sub-squares:two-letter` | Squares › two letters: a² + b², 3a² − 2b | C | 4.7 |  | 3 | Given that a = 3 and b = 2, evaluate: a^{… |
| `sub-brackets:two-brackets` | Brackets › two brackets: (a + 2)(b + 3) | CA | 4.8 |  | 3 | Given that a = 3, b = 5 and c = 6, evalua… |
| `sub-table:negative` | Table of values › x from −2 to 2 (or −3 to 3): y = 3x − 2 | C | 4.8 |  | 1 | Complete the table of values for y = x + … |
| `sub-fractions:fraction-line` | Fractions in an expression › as a fraction: (a + b) / 2 | A | 5 |  | 3 | Given that a = 19, b = 9 and c = 20, eval… |
| `sub-order:brackets` | Squares: the order matters › a bracket squared: (a + b)², (2a − 1)² | CA | 5 |  | 3 | Given that a = 3 and b = 2, evaluate: (ab… |
| `sub-order:compare` | Squares: the order matters › (2a)² and 2a² side by side | CA | 5.2 |  | 2 | Given that a = 6, evaluate: (2a)^{2} |
| `sub-neg-add:with-multiples` | Negative values: add and subtract › with multiples: 2a + 3b, 5 − 2a | C | 5.2 |  | 3 | Given that a = 6 and b = -5, evaluate: 3a… |
| `sub-neg-mult:product` | Negative values: multiply and brackets › products: ab, 3ab, abc | CA | 5.4 |  | 3 | Given that a = -2, b = -3 and c = 4, eval… |
| `sub-worded:other` | Worded formulas › time, height and volume formulas | CA | 5.4 |  | 1 | The time, T minutes, to cook a turkey of … |
| `sub-neg-mult:brackets` | Negative values: multiply and brackets › brackets: 2(a − b), a(b + c) | CA | 5.6 |  | 3 | Given that a = -2, b = -3 and c = 4, eval… |
| `sub-cubes:positive` | Cubes › positive values: a³, 2a³, a³ − b | A | 5.6 |  | 3 | Given that a = 4 and b = 3, evaluate: a^{… |
| `sub-neg-mult:with-add` | Negative values: multiply and brackets › a product and a term: ab + c, 2ab − 3c | CA | 5.8 |  | 3 | Given that a = -2, b = -3 and c = 4, eval… |
| `sub-frac-values:decimals` | Fractions and decimals as values › decimal values: a = 0.5, b = 1.5 | A | 5.8 |  | 3 | Given that a = 2.1, b = 0.8 and c = 1.5, … |
| `sub-frac-values:fractions` | Fractions and decimals as values › fraction values: a = 1/2, b = 1/3 | A | 6 |  | 3 | Given that a = \frac{3}{2} and b = \frac{… |
| `sub-compare:largest` | Which is the largest or smallest › which has the largest value (a is positive) | A | 6 |  | 1 | Given that a = 3, which of a^{2} + a, 20 … |
| `sub-neg-squares:negative-squared` | Negative values: squares › squaring a negative: a², 2a², a² − b | A | 6.2 |  | 3 | Given that a = -5 and b = 3, evaluate: a^… |
| `sub-table:quadratic` | Table of values › a quadratic rule: y = x² − 2x | A | 6.2 |  | 1 | Complete the table of values for y = x^{2… |
| `sub-roots:simple` | Square roots › the root of a value: √a + 3, 2√b | A | 6.4 |  | 3 | Given that a = 100 and b = 64, evaluate: … |
| `sub-mixed:sum-diff` | Mixed powers and brackets › squares and cubes of two letters: a² − b² | AX | 6.5 |  | 3 | Given that a = -2, b = -3 and c = 4, eval… |
| `sub-formula:physics` | Using a formula › physics formulas: v = u + at, s = ut + ½at² | CA | 6.5 |  | 3 | Use the formula v = u + at. Work out the … |
| `sub-cubes:negative` | Cubes › a negative value: a³, b − a³ | A | 6.6 |  | 3 | Given that a = -3 and b = 4, evaluate: -a… |
| `sub-neg-squares:minus-trap` | Negative values: squares › the minus sign in front: −a², 10 − a² | A | 6.8 |  | 3 | Given that a = -4 and b = 3, evaluate: 5 … |
| `sub-mixed:brackets-squared` | Mixed powers and brackets › a bracket squared: (a − b)² + c | AX | 7 |  | 3 | Given that a = -3, b = 4 and c = 2, evalu… |
| `sub-roots:pythag-sum` | Square roots › a root of a sum of squares: √(a² + b²) | X | 7.2 |  | 3 | Given that a = 8, b = 6 and c = 3, evalua… |
| `sub-compare:smallest` | Which is the largest or smallest › which has the smallest value (a is negative) | A | 7.2 |  | 1 | Given that a = -2, which of a - 5, -a and… |
| `sub-mixed:longer` | Mixed powers and brackets › longer expressions: 2a²b − 5c | AX | 7.5 |  | 3 | Given that a = 2, b = -4 and c = -1, eval… |
| `sub-roots:pythag-diff` | Square roots › a root of a difference of squares: √(a² − b²) | X | 7.6 |  | 3 | Given that a = 17 and b = 8, evaluate: 3\… |
| `sub-mixed:single` | Mixed powers and brackets › one longer expression on its own | AX | 7.8 |  | 1 | Given that a = 3, b = 2 and c = -1, evalu… |
| `sub-expression:linear` | Substituting an expression › one letter is an expression: a = x + 1, find 3a | X | 7.8 |  | 3 | Given that a = x - 6, write each of these… |
| `sub-expression:two-subs` | Substituting an expression › two letters are expressions: a = x + 1, b = 2x − 3 | X | 8.2 |  | 3 | Given that a = x - 6 and b = 4x + 3, writ… |
| `sub-expression:squared` | Substituting an expression › squares to expand: a = x + 2, find a² + a | X | 8.8 |  | 3 | Given that a = x - 6, write each of these… |

## Units and conversions

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `units-metric:length` | Metric and currency conversions › length | FCA | 2 |  | 1 | Convert 4.05 km to m. |
| `units-metric:mass` | Metric and currency conversions › mass | FCA | 2 |  | 1 | Convert 4.05 kg to g. |
| `units-metric:capacity` | Metric and currency conversions › capacity | FCA | 2.5 |  | 1 | Convert 4.05 litres to ml. |
| `units-metric:three` | Metric and currency conversions › three conversions (mixed units) | FCA | 4 |  | 3 | Convert: 4.05 km to m |

## Volume of prisms

| key | option | levels | d | calc | parts | example |
|---|---|---|---|---|---|---|
| `volume-prisms:cuboid` | Volume of prisms and cuboids › cuboid | CA | 3 |  | 1 | A cuboid measures 3 cm by 3 cm by 10 cm. … |
| `volume-prisms:tri-prism` | Volume of prisms and cuboids › triangular prism | CA | 4 |  | 1 | A prism has a cross-section that is a tri… |
| `volume-prisms:find-height` | Volume of prisms and cuboids › cuboid: find a missing length | CA | 5 |  | 1 | A cuboid has a volume of 81 cm³. Its leng… |
| `volume-prisms:cyl-calc` | Volume of prisms and cuboids › cylinder, to 1 d.p. (calculator) | CA | 6 | yes | 1 | A cylindrical tin has radius 2.5 cm and h… |
| `volume-prisms:cyl-pi` | Volume of prisms and cuboids › cylinder, in terms of π | CA | 6.5 |  | 1 | A cylinder has radius 2 cm and height 3 c… |
