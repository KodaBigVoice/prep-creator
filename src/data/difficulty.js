// How hard each question option is, on a scale of 1 (easiest) to 10 (hardest).
// The picker lists options in ascending order of these numbers and shows each option's position (1, 2, 3…).
// A type's own difficulty is the average of its options, so types are ordered within their topic too.
// Later this scale can be grouped into stars. To change the order, change a number here.
// (A variant may also carry its own `d` in its type file; that wins over this table.)
export const VARIANT_D = {
  'bidmas-standard:four': 2, 'bidmas-standard:bp': 3, 'bidmas-negatives:std': 6,

  // Fractions, in ladder order
  'fractions-equivalent:up': 1.2, 'fractions-equivalent:down': 1.8,
  'fractions-simplify:small': 2, 'fractions-simplify:large': 2.6,
  'fractions-improper:tomixed': 2.6, 'fractions-improper:toimproper': 3, 'fractions-improper:simplify': 3.4,
  'fractions-compare:larger': 3.2, 'fractions-compare:order': 3.8, 'fractions-compare:ordermix': 4.2,
  'fractions-of-amount:unit': 3.4, 'fractions-of-amount:nonunit': 4, 'fractions-of-amount:units': 4.3, 'fractions-of-amount:improper': 4.8,
  'fractions-same-denominator:add': 4, 'fractions-same-denominator:sub': 4.3, 'fractions-same-denominator:addover': 4.6, 'fractions-same-denominator:simplify': 5,
  'fractions-related-denominators:add': 4.7, 'fractions-related-denominators:sub': 5, 'fractions-related-denominators:addover': 5.3,
  'fractions-unrelated-denominators:addc': 5.3, 'fractions-unrelated-denominators:subc': 5.6, 'fractions-unrelated-denominators:addl': 5.8, 'fractions-unrelated-denominators:subl': 6.1,
  'fractions-mixed:add-plain': 5.9, 'fractions-mixed:sub-plain': 6, 'fractions-mixed:add-carry': 6.3, 'fractions-mixed:sub-whole': 6.5, 'fractions-mixed:sub-any': 6.6, 'fractions-mixed:sub-overlap': 6.9,
  'fractions-multiply:plain': 6, 'fractions-multiply:whole': 6.3, 'fractions-multiply:cancel': 6.8, 'fractions-multiply:mixfrac': 7.2, 'fractions-multiply:mixed': 7.6,
  'fractions-divide:int': 6.6, 'fractions-divide:frac': 7, 'fractions-divide:whole': 7.4, 'fractions-divide:cancel': 7.9, 'fractions-divide:mixed': 8.2,
  'fractions-mixed-operations:bracket': 7.8, 'fractions-mixed-operations:order': 8.2, 'fractions-mixed-operations:bracketdiv': 8.6,
  'fractions-negative:addsub': 8.6, 'fractions-negative:mul': 9, 'fractions-negative:div': 9.4,

  // Fractions: problem solving, in ladder order
  'fracprob-amount:count': 4.2, 'fracprob-amount:money': 4.4, 'fracprob-amount:measure': 4.6,
  'fracprob-left:left': 4.8, 'fracprob-left:parts': 5, 'fracprob-left:frac': 5.3,
  'fracprob-fraction-of:same': 5.2, 'fracprob-fraction-of:units': 5.9,
  'fracprob-add:left': 5.6, 'fracprob-add:total': 5.8, 'fracprob-add:sub': 6, 'fracprob-add:mixed': 6.8, 'fracprob-add:mixedsub': 7.2,
  'fracprob-divide:whole': 6.5, 'fracprob-divide:frac': 6.9, 'fracprob-divide:mixed': 7.5,
  'fracprob-stages:orig': 7, 'fracprob-stages:rest': 7.6,
  'fracprob-backwards:part': 7.6, 'fracprob-backwards:left': 8,
  'fracprob-change:inc': 7.7, 'fracprob-change:dec': 7.9, 'fracprob-change:rev': 8.4,
  'fracprob-group:rest': 8, 'fracprob-group:of': 8.5,
  'fracprob-multi:share': 8.6, 'fracprob-multi:stages': 8.9, 'fracprob-multi:three': 9.4,

  // Fractions, decimals and percentages (FDP), in ladder order
  'fdp-dec-to-frac:tenths': 1.5, 'fdp-dec-to-frac:hundredths': 2.2, 'fdp-dec-to-frac:zero': 2.8, 'fdp-dec-to-frac:bigger': 3.2, 'fdp-dec-to-frac:thou': 4.2, 'fdp-dec-to-frac:thoubig': 4.8,
  'fdp-frac-to-dec:tenths': 2.4, 'fdp-frac-to-dec:hundredths': 3.2, 'fdp-frac-to-dec:mixed': 3.6, 'fdp-frac-to-dec:eighths': 4.6, 'fdp-frac-to-dec:harder': 5.4,
  'fdp-perc-to-fd:frac': 3.4, 'fdp-perc-to-fd:dec': 3.6, 'fdp-perc-to-fd:hardfrac': 5, 'fdp-perc-to-fd:harddec': 5.4,
  'fdp-to-perc:dec': 3.8, 'fdp-to-perc:frac': 4, 'fdp-to-perc:harddec': 5.4, 'fdp-to-perc:hard': 5.6,
  'fdp-table:frac': 4.4, 'fdp-table:dec': 4.6, 'fdp-table:perc': 4.8, 'fdp-table:hard': 6,
  'fdp-order:three': 5, 'fdp-order:four': 6.4,
  'fdp-beyond:perc': 5.4, 'fdp-beyond:mixed': 5.8, 'fdp-beyond:hard': 6.6,
  'fdp-mixed-calc:frac': 6.8, 'fdp-mixed-calc:dec': 7, 'fdp-mixed-calc:mult': 7.6,
  'fdp-recurring-id:which2': 6.8, 'fdp-recurring-id:which4': 7.4, 'fdp-recurring-id:dec1': 7.6, 'fdp-recurring-id:dec2': 8.2,
  'fdp-recurring-frac:one': 8.6, 'fdp-recurring-frac:two': 9, 'fdp-recurring-frac:mixed': 9.4, 'fdp-recurring-frac:bar': 9.6,

  'indices-multiply:one': 3, 'indices-multiply:two': 4, 'indices-multiply:neg': 5,
  'indices-divide:div': 4, 'indices-divide:frac': 5,

  // Expanding brackets, in ladder order
  'expand-number:pos': 1.5, 'expand-number:neg': 2.2, 'expand-number:two': 2.6, 'expand-number:three': 3.1,
  'expand-letter:x': 3, 'expand-letter:nx': 3.5, 'expand-letter:neg': 4, 'expand-letter:two': 4.5,
  'expand-simplify-add:num': 4, 'expand-simplify-add:neg': 4.5, 'expand-simplify-add:letter': 5.1,
  'expand-simplify-subtract:lin': 5, 'expand-simplify-subtract:bare': 5.4, 'expand-simplify-subtract:two': 6.2,
  'expand-powers:pure': 6, 'expand-powers:num': 6.4, 'expand-powers:two': 6.8,
  'expand-powers-high:pure': 6.9, 'expand-powers-high:num': 7.3, 'expand-powers-high:two': 7.7,
  'expand-double:pos': 7.6, 'expand-double:mixed': 8, 'expand-double:neg': 8.4,
  'expand-double-coef:std': 8.4, 'expand-double-coef:both': 8.6, 'expand-double-coef:two': 8.8,
  'expand-square:x': 8.6, 'expand-square:ax': 9, 'expand-square:two': 9.4,
  'expand-dots:x': 8.9, 'expand-dots:ax': 9.3, 'expand-dots:two': 9.7,
  'expand-simplify-double:sum': 9.5, 'expand-simplify-double:sq': 9.7, 'expand-simplify-double:coef': 10,
  'expand-triple:three': 9.9, 'expand-triple:sq': 10,
  // Factorising, in ladder order
  'factorise-number:two': 2, 'factorise-number:xy': 2.5, 'factorise-number:three': 3.2,
  'factorise-letter:sq': 3.4, 'factorise-letter:mix': 3.9,
  'factorise-number-letter:std': 4.2, 'factorise-number-letter:three': 5,
  'factorise-two-letters:shared': 5, 'factorise-two-letters:xy': 5.5, 'factorise-two-letters:three': 6,
  'factorise-powers:pure': 5.8, 'factorise-powers:num': 6.2, 'factorise-powers:two': 6.6,
  'factorise-powers-high:pure': 6.8, 'factorise-powers-high:num': 7.2, 'factorise-powers-high:two': 7.6,
  'factorise-quadratic:pos': 8, 'factorise-quadratic:neg': 8.3, 'factorise-quadratic:mixed': 8.7,
  'factorise-squares:x2': 8.4, 'factorise-squares:ax2': 8.8, 'factorise-squares:two': 9.2,
  'factorise-ax2:pos': 9.2, 'factorise-ax2:mixed': 9.6,
  'factorise-full:dots': 9.4, 'factorise-full:quad': 9.6, 'factorise-full:cubic': 9.9,

  // Equations, in ladder order (a type's position is the average of its options)
  'equations-one-step:add': 1, 'equations-one-step:times': 1.3, 'equations-one-step:div': 1.6, 'equations-one-step:neg': 2,
  'equations-two-step:std': 2, 'equations-two-step:frac': 2.8, 'equations-two-step:neg': 3,
  'equations-both-sides:pos': 3.5, 'equations-both-sides:neg': 4.1,
  'equations-both-sides-right:pos': 4.1, 'equations-both-sides-right:neg': 4.7,
  'equations-both-sides-negative:one': 4.7, 'equations-both-sides-negative:both': 5.3,
  'equations-brackets:one': 4.9, 'equations-brackets:neg': 5.3, 'equations-brackets:xside': 5.7, 'equations-brackets:both': 5.9, 'equations-brackets:sub': 6.2,
  'equations-fraction:split': 5.8, 'equations-fraction:top': 6.3, 'equations-fraction:eq': 6.8,
  'equations-two-fractions:sum': 6.5, 'equations-two-fractions:coef': 6.8, 'equations-two-fractions:cross': 7, 'equations-two-fractions:diff': 7.5,
  'expand-then-solve:single': 7.2, 'expand-then-solve:std': 7.6,
  'equations-quadratic-simple:pure': 7.4, 'equations-quadratic-simple:coef': 7.8, 'equations-quadratic-simple:const': 8.2, 'equations-quadratic-simple:full': 8.6, 'equations-quadratic-simple:sub': 9,
  'equations-quadratic-factorise:common': 8, 'equations-quadratic-factorise:trinomial': 8.5, 'equations-quadratic-factorise:rearrange': 9,
  'equations-denominator:num': 8.4, 'equations-denominator:add': 8.8, 'equations-denominator:plus': 9.2,

  'substitution:one': 2, 'substitution:three': 4, 'substitution:three-hard': 6,

  'pythagoras:hyp': 4, 'pythagoras:short': 5, 'pythagoras:walk': 5.5, 'pythagoras:diag': 6, 'pythagoras:ladder': 7,

  'hcf-lcm:hcf': 3, 'hcf-lcm:lcm': 3.5, 'hcf-lcm:both': 4, 'hcf-lcm:hcf-big': 5, 'hcf-lcm:lcm-big': 5.5,
  'prime-factorisation:one': 4,

  'percentage-of-amount:plain': 2, 'percentage-of-amount:worded': 3,
  'percentage-change:increase': 3.5, 'percentage-change:decrease': 4, 'percentage-change:decrease-calc': 4.5, 'percentage-change:vat': 5,
  'percentage-change-find:increase': 5, 'percentage-change-find:profit': 5.2, 'percentage-change-find:decrease': 5.5,
  'reverse-percentages:sale': 6, 'reverse-percentages:increase': 6.5, 'reverse-percentages:sale-calc': 7,
  'compound-interest:interest': 8, 'compound-interest:depreciation': 8.5,

  'ratio-share:two': 2, 'ratio-share:one': 3, 'ratio-share:three': 3.5,
  'ratio-difference:other': 4, 'ratio-difference:total': 5,
  'proportion-direct:cost': 3, 'proportion-direct:recipe': 4, 'proportion-inverse:workers': 6,
  'speed-distance-time:speed': 3, 'speed-distance-time:distance': 3.5, 'speed-distance-time:time': 5,

  'circles:circ-calc': 4, 'circles:area-calc': 5, 'circles:circ-pi': 5.5, 'circles:area-pi': 6, 'circles:reverse': 7,
  'area-shapes:triangle': 3, 'area-shapes:parallelogram': 3.5, 'area-shapes:trapezium': 4, 'area-shapes:rect-missing': 5, 'area-shapes:trap-height': 6,
  'volume-prisms:cuboid': 3, 'volume-prisms:tri-prism': 4, 'volume-prisms:find-height': 5, 'volume-prisms:cyl-calc': 6, 'volume-prisms:cyl-pi': 6.5,
  'units-metric:length': 2, 'units-metric:mass': 2, 'units-metric:capacity': 2.5, 'units-metric:three': 4,

  'standard-form:from': 2.5, 'standard-form:to': 3, 'standard-form:multiply': 5, 'standard-form:divide': 5.5,
  'simultaneous:opp-y': 9.2, 'simultaneous:same-x': 9.4, 'simultaneous:multiply': 9.7, 'simultaneous:both': 10,

  'rounding:nearest': 1.5, 'rounding:dp': 2.5, 'rounding:sf': 4,
  'averages:three': 3, 'averages:mode': 3.5, 'mean-unknown:missing': 5, 'mean-unknown:new': 5.5,
  'probability:bag': 2, 'probability:bag-two': 3, 'probability:expected': 4,

  'problem-solving:multiples': 5, 'problem-solving:consecutive': 5.5, 'problem-solving:rect': 6, 'problem-solving:tank': 6,
  'problem-solving:ages': 6.5, 'problem-solving:sweets': 7, 'problem-solving:digits': 7, 'problem-solving:train': 7.5,
  'problem-solving:legs': 7.5, 'problem-solving:handshake': 8,
};
