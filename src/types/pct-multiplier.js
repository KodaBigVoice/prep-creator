import { TOPIC, M, F, dstr, numChk } from './percentages.js';

const ITEMS = ['jacket', 'pair of trainers', 'bicycle', 'games console', 'coat', 'watch', 'tablet', 'guitar', 'tent', 'laptop', 'camera'];
const NICE = [5, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45];

export default {
  id: 'pct-multiplier',
  topic: TOPIC, type: 'Percentage multipliers', code: 'PC7',
  levels: ['Core', 'Additional'],
  search: 'decimal multiplier percentage increase decrease 1.15 0.92 single multiplier',
  verb: '', marks: 1, lines: 3,
  variants: [
    { id: 'inc', label: 'multiplier for a percentage increase:  15% → 1.15', params: { dir: 1, ps: NICE } },
    { id: 'dec', label: 'multiplier for a percentage decrease:  8% → 0.92', params: { dir: -1, ps: NICE } },
    { id: 'decimal', label: 'multiplier for a decimal percentage:  2.5% → 1.025', params: { dir: 0, ps: [2.5, 7.5, 12.5, 17.5, 1.5, 3.5, 4.5] }, levels: ['Additional'] },
    { id: 'over', label: 'multiplier for an increase of more than 100%', params: { dir: 1, ps: [120, 150, 125, 200, 250] }, levels: ['Additional'] },
  ],
  generate(r, v) {
    const dir = v.dir || r.pick([1, -1]), p = r.pick(v.ps), item = r.pick(ITEMS);
    const mult = new F(Math.round((100 + dir * p) * 10), 1000);
    const abstract = r.chance(0.5);
    const verb = dir > 0 ? 'increases' : 'decreases';
    const body = abstract ? `Write down the decimal multiplier that ${verb} an amount by ${p}%.`
      : dir > 0 ? `The price of a ${item} is increased by ${p}%. Write down the decimal number that the old price is multiplied by to give the new price.`
        : `In a sale, the price of a ${item} is reduced by ${p}%. Write down the decimal number that the original price is multiplied by to give the sale price.`;
    const w = `100\\% ${dir > 0 ? '+' : '-'} ${p}\\% = ${dstr(new F(Math.round((100 + dir * p) * 10), 10))}\\%;\\ ${dstr(new F(Math.round((100 + dir * p) * 10), 10))} \\div 100 = ${dstr(mult)}`;
    return { parts: [{ body, a: dstr(mult), w: M(w), chk: numChk(`${100 + dir * p}/100`, mult) }] };
  },
};
