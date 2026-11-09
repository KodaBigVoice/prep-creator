// dist/prep.js is what the site serves: it must be built from the current source.
import fs from 'fs';
import { bundle } from '../tools/bundle.mjs';
const built = fs.readFileSync(new URL('../dist/prep.js', import.meta.url), 'utf8');
if (built !== await bundle()) { console.log('FAIL dist/prep.js is out of date: run  npm run build'); process.exit(1); }
console.log('bundle: up to date');
