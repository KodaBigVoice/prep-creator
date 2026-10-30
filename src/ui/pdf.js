// Download sheets as a PDF without the print dialog.
// Each A4 sheet is drawn by the browser exactly as it prints, photographed at about 300 dpi, and placed on its own page of a PDF.
// (A browser page cannot make a text PDF by itself; for selectable text use Print > Save as PDF.)
const DPI = 300, MM = 96 / 25.4;
const PT_W = 595.28, PT_H = 841.89;

let lib = null;
function loadLib() {
  if (window.htmlToImage) return Promise.resolve(window.htmlToImage);
  if (lib) return lib;
  lib = new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = 'vendor/html-to-image/html-to-image.js';
    s.onload = () => res(window.htmlToImage); s.onerror = () => { lib = null; rej(new Error('Could not load the PDF maker.')); };
    document.head.append(s);
  });
  return lib;
}
const loadImg = (src) => new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('The browser could not draw a sheet.')); im.src = src; });

// Draw each sheet (an HTML string for one A4 page) and return JPEG bytes. The browser itself draws the page, so it matches the screen and print exactly.
export async function renderSheets(sheetHtml, onProgress = () => {}) {
  const H = await loadLib();
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const stage = document.createElement('div');
  stage.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;pointer-events:none;';
  document.body.append(stage);
  const W = Math.round(210 * MM), Hh = Math.round(297 * MM), ratio = DPI / 96, out = [];
  try {
    for (let i = 0; i < sheetHtml.length; i++) {
      onProgress(i, sheetHtml.length);
      stage.innerHTML = sheetHtml[i];
      const el = stage.querySelector('.sheet');
      // two passes: the first call also gathers the fonts, the next ones reuse them
      const svg = await H.toSvg(el, { width: W, height: Hh, backgroundColor: '#ffffff', cacheBust: false, style: { margin: '0', transform: 'none' } });
      const img = await loadImg(svg);
      const canvas = document.createElement('canvas'); canvas.width = Math.round(W * ratio); canvas.height = Math.round(Hh * ratio);
      const g = canvas.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height); g.drawImage(img, 0, 0, canvas.width, canvas.height);
      const jpg = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', 0.92));
      out.push({ bytes: new Uint8Array(await jpg.arrayBuffer()), w: canvas.width, h: canvas.height });
    }
    onProgress(sheetHtml.length, sheetHtml.length);
  } finally { stage.remove(); }
  return out;
}

// A minimal PDF: one full-page JPEG per A4 page.
export function buildPdf(images, title = '') {
  const enc = new TextEncoder();
  const parts = []; let len = 0; const offsets = [];
  const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
  const obj = (n, body) => { offsets[n] = len; push(`${n} 0 obj\n`); push(body); push('\nendobj\n'); };
  const n = images.length;
  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  // object numbers: 1 catalog, 2 pages, 3 info, then per page: page, content, image
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${images.map((_, i) => `${4 + i * 3} 0 R`).join(' ')}] /Count ${n} >>`);
  const esc = (t) => '(' + String(t).replace(/[\\()]/g, '\\$&').replace(/[^\x20-\x7e]/g, '?') + ')';
  obj(3, `<< /Title ${esc(title)} /Producer (PMU Prep Maths Universe) >>`);
  images.forEach((im, i) => {
    const p = 4 + i * 3, c = p + 1, x = p + 2;
    obj(p, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PT_W} ${PT_H}] /Resources << /XObject << /Im0 ${x} 0 R >> >> /Contents ${c} 0 R >>`);
    const cs = `q ${PT_W} 0 0 ${PT_H} 0 0 cm /Im0 Do Q`;
    obj(c, `<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`);
    offsets[x] = len; push(`${x} 0 obj\n<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`);
    push(im.bytes); push('\nendstream\nendobj\n');
  });
  const total = 4 + n * 3, xref = len;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let k = 1; k < total; k++) push(String(offsets[k]).padStart(10, '0') + ' 00000 n \n');
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  const all = new Uint8Array(len); let o = 0; for (const b of parts) { all.set(b, o); o += b.length; }
  return new Blob([all], { type: 'application/pdf' });
}

export function saveBlob(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}
