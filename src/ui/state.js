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
    this.hooks.status();
    this.store.current = this.prep;
    this.store.settings.layout = this.layout;
    this.save();
  },
  save() {},
};
