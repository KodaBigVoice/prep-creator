// The classes the app makes preps for. Each set has its own preset, time and rubric.
export const SETS = [
  { id: 'Y6 Core', year: 'Y6', level: 'Core', minutes: 20 },
  { id: 'Y6 Additional', year: 'Y6', level: 'Additional', minutes: 20 },
  { id: 'Y7 Core', year: 'Y7', level: 'Core', minutes: 30 },
  { id: 'Y7 Additional', year: 'Y7', level: 'Additional', minutes: 30 },
  { id: 'Y8 Foundation', year: 'Y8', level: 'Foundation', minutes: 30 },
  { id: 'Y8 Core', year: 'Y8', level: 'Core', minutes: 30 },
  { id: 'Y8 Additional', year: 'Y8', level: 'Additional', minutes: 30 },
];
export const setById = Object.fromEntries(SETS.map(s => [s.id, s]));
export const defaultRubric = (minutes) => `I’m looking for ${minutes} minutes of good work. Make sure you show full working on all questions. Enjoy!`;
