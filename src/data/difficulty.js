// How hard each question option is, on a scale of 1 (easiest) to 10 (hardest).
// The picker lists options in ascending order of these numbers and shows each option's position (1, 2, 3…).
// A type's own difficulty is the average of its options, so types are ordered within their topic too.
// Later this scale can be grouped into stars. To change the order, change a number here.
// (A variant may also carry its own `d` in its type file; that wins over this table.)
export const VARIANT_D = {
  'bidmas-standard:four': 2, 'bidmas-standard:bp': 3, 'bidmas-negatives:std': 6,

  'fractions-add:plain': 3, 'fractions-add:carry': 4,
  'fractions-subtract:plain': 3, 'fractions-subtract:any': 4, 'fractions-subtract:overlap': 5,
  'fractions-multiply:mixed': 4,
  'fractions-divide:int': 3, 'fractions-divide:cancel': 4, 'fractions-divide:mixed': 5,

  'indices-multiply:one': 3, 'indices-multiply:two': 4, 'indices-multiply:neg': 5,
  'indices-divide:div': 4, 'indices-divide:frac': 5,

  'expand-single:pos': 2, 'expand-single:neg': 3, 'expand-single:two': 4,
  'expand-two-subtract:lin': 6, 'expand-two-subtract:two': 8,
  'factorise-common:num': 2, 'factorise-common:one': 4, 'factorise-common:two': 6,

  'equations-simple:one': 1, 'equations-simple:two': 2, 'equations-simple:frac': 3,
  'equations-both-sides:pos': 5, 'equations-both-sides:neg': 6,
  'equations-brackets:one': 5, 'equations-brackets:both': 7,
  'equations-fraction:split': 5.5, 'equations-fraction:top': 6, 'equations-fraction:eq': 7,
  'expand-then-solve:std': 8,

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
  'simultaneous:opp-y': 5, 'simultaneous:same-x': 5.5, 'simultaneous:multiply': 7,

  'rounding:nearest': 1.5, 'rounding:dp': 2.5, 'rounding:sf': 4,
  'averages:three': 3, 'averages:mode': 3.5, 'mean-unknown:missing': 5, 'mean-unknown:new': 5.5,
  'probability:bag': 2, 'probability:bag-two': 3, 'probability:expected': 4,

  'problem-solving:multiples': 5, 'problem-solving:consecutive': 5.5, 'problem-solving:rect': 6, 'problem-solving:tank': 6,
  'problem-solving:ages': 6.5, 'problem-solving:sweets': 7, 'problem-solving:digits': 7, 'problem-solving:train': 7.5,
  'problem-solving:legs': 7.5, 'problem-solving:handshake': 8,
};
