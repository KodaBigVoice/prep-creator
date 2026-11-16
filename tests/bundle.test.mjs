// prep.html is what the site serves: it must be built from the current source (template, scripts, styles and KaTeX).
import fs from 'fs';
import { page } from '../tools/bundle.mjs';
if (fs.readFileSync(new URL('../prep.html', import.meta.url), 'utf8') !== await page()) { console.log('FAIL prep.html is out of date: run  npm run build'); process.exit(1); }
console.log('bundle: up to date');
