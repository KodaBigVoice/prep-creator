export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v === true) el.setAttribute(k, (k.startsWith('aria-') || k.startsWith('data-')) && k !== 'data-menu-anchor' ? 'true' : '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid === null || kid === undefined || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}
export const $ = (sel, root = document) => root.querySelector(sel);

let openMenu = null;
export function closeMenu() { if (openMenu) { openMenu.remove(); openMenu = null; } }
document.addEventListener('mousedown', (e) => { if (openMenu && !openMenu.contains(e.target) && !e.target.closest('[data-menu-anchor]')) closeMenu(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

// items: [{label, onClick, danger, disabled}] | {sep:true} | {heading:'text'}
export function showMenu(anchor, items) {
  const same = openMenu && openMenu._anchor === anchor;
  closeMenu();
  if (same) return;
  const m = h('div', { class: 'menu' });
  for (const it of items) {
    if (it.sep) m.append(h('hr'));
    else if (it.heading) m.append(h('div', { class: 'lbl' }, it.heading));
    else if (it.note) m.append(h('div', { class: 'note' }, it.note));
    else m.append(h('button', { class: it.danger ? 'danger' : '', disabled: it.disabled, onClick: () => { closeMenu(); it.onClick && it.onClick(); } },
      h('span', { class: 'tick' }, it.checked ? '✓' : ''), h('span', {}, it.label), it.sub ? h('span', { class: 'msub' }, it.sub) : null));
  }
  document.body.append(m);
  const r = anchor.getBoundingClientRect();
  const w = m.offsetWidth, hgt = m.offsetHeight;
  m.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, r.right - w)) + 'px';
  m.style.top = (r.bottom + hgt + 8 > window.innerHeight ? Math.max(8, r.top - hgt - 4) : r.bottom + 4) + 'px';
  anchor.setAttribute('data-menu-anchor', '');
  m._anchor = anchor;
  openMenu = m;
}

export function modal({ title, body, footer, narrow = false, wide = false, onClose }) {
  const close = () => { scrim.remove(); document.removeEventListener('keydown', esc); onClose && onClose(); };
  const esc = (e) => { if (e.key === 'Escape') close(); };
  const scrim = h('div', { class: 'scrim', onMousedown: (e) => { if (e.target === scrim) close(); } },
    h('div', { class: 'dlg' + (narrow ? ' narrow' : '') + (wide ? ' wide' : ''), role: 'dialog', 'aria-label': title },
      h('header', {}, h('h2', {}, title), h('button', { class: 'btn ghost', onClick: close, 'aria-label': 'Close' }, '✕')),
      h('div', { class: 'body' }, body),
      footer ? h('footer', {}, footer) : null));
  document.body.append(scrim);
  document.addEventListener('keydown', esc);
  return { close, scrim };
}

export function toast(msg, ms = 2600, action = null) {
  const t = h('div', { class: 'toast' }, msg, action ? h('button', { class: 'toastbtn', onClick: () => { t.remove(); action.onClick(); } }, action.label) : null);
  document.body.append(t); setTimeout(() => t.remove(), ms);
}
export function download(name, text, type = 'application/json') {
  const a = h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a); a.click(); a.remove();
}

// replace the children of el, ignoring null/false
export function setKids(el, ...kids) { el.replaceChildren(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false).map(k => (k.nodeType ? k : document.createTextNode(String(k))))); return el; }

// "Are you sure?" box. Resolves true if the person confirms.
export function confirmBox({ title = 'Are you sure?', message, confirmLabel = 'Yes, continue', cancelLabel = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (v) => { if (done) return; done = true; m.close(); resolve(v); };
    const m = modal({ title, narrow: true, onClose: () => { if (!done) { done = true; resolve(false); } },
      body: h('div', { class: 'confirm-msg' }, ...(Array.isArray(message) ? message : [message]).map(t => h('p', {}, t))),
      footer: [h('button', { class: 'btn', onClick: () => finish(false) }, cancelLabel), h('button', { class: 'btn ' + (danger ? 'primary danger-fill' : 'primary'), onClick: () => finish(true) }, confirmLabel)] });
    setTimeout(() => { const b = m.scrim.querySelector('footer .primary'); if (b) b.focus(); }, 20);
  });
}
