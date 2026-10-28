// Shared app state. Modules read and change this, then call ctx.commit().
export const ctx = {
  store: null, prep: null, layout: null, katex: window.katex,
  ui: { tab: 'presets', pop: null, zoom: 'fit', sel: null },
  hooks: { toolbar() {}, builder() {}, preview() {}, status() {} },
  dirty: false,
  commit({ toolbar = false, builder = true, preview = true, dirty = true } = {}) {
    if (dirty) this.dirty = true;
    if (toolbar) this.hooks.toolbar();
    if (builder) this.hooks.builder();
    if (preview) this.hooks.preview();
    this.track();
    this.hooks.status();
    this.store.current = this.prep;
    this.store.settings.layout = this.layout;
    this.save();
  },
  save() {},

  // ---- undo / redo: snapshots of the prep, taken whenever a commit finds it changed ----
  hist: { undo: [], redo: [], last: null, t: 0 },
  resetHistory() { this.hist = { undo: [], redo: [], last: JSON.stringify(this.prep), t: 0 }; },
  track() {
    const H = this.hist, now = Date.now(), s = JSON.stringify(this.prep);
    if (H.last === null) { H.last = s; return; }
    if (s === H.last) return;
    // changes made in quick succession (typing, repeated clicks) count as one step
    if (!H.undo.length || now - H.t > 800) { H.undo.push(H.last); if (H.undo.length > 100) H.undo.shift(); }
    H.t = now; H.last = s; H.redo = [];
  },
  canUndo() { return this.hist.undo.length > 0; },
  canRedo() { return this.hist.redo.length > 0; },
  _restore(snap) {
    const o = JSON.parse(snap);
    Object.keys(this.prep).forEach(k => { delete this.prep[k]; });
    Object.assign(this.prep, o);
    this.ui.sel = null;
    this.hist.last = snap; this.hist.t = 0;
    this.commit({ toolbar: true });
  },
  undo() { const H = this.hist; if (!H.undo.length) return; H.redo.push(H.last); const snap = H.undo.pop(); this._restore(snap); },
  redo() { const H = this.hist; if (!H.redo.length) return; H.undo.push(H.last); const snap = H.redo.pop(); this._restore(snap); },
};
