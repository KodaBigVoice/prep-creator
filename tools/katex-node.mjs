// KaTeX for Node: the vendored file is a plain browser script, so run it in a small context and take what it defines.
import fs from 'fs'; import vm from 'vm'; import { fileURLToPath } from 'url';
const file = fileURLToPath(new URL('../vendor/katex/katex.min.js', import.meta.url));
const box = {}; vm.runInNewContext(fs.readFileSync(file, 'utf8'), box);
export default box.katex;
