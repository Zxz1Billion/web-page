/* ============================================================================
   iso-viewer.js — an isometric 3D voxel renderer for build plans. Consumes the
   same definition shape as SchematicViewer (palette + frames[].grid, frame 0 =
   bottom course) but draws the layers stacked in isometric projection with
   shaded cube faces, so a build reads as a building. A stepper raises the
   structure one course at a time. Vanilla JS + SVG, no dependencies.
   ========================================================================== */

const TW = 28, W = TW / 2, H = TW / 4, E = 16; // tile width, half-w, half-h, cube rise

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const a = (x) => Math.max(0, Math.min(255, Math.round(x + 255 * f)));
  return `rgb(${a(r)},${a(g)},${a(b)})`;
}

export class IsoViewer {
  constructor(cfg) {
    this.cfg = cfg;
    this.shown = cfg.frames.length; // number of courses shown (default: all)
    this.root = null;
  }
  _palette(k) { return this.cfg.palette[k] || { label: k, color: "#888" }; }
  _presentKeys(upto) {
    const seen = new Set();
    for (let y = 0; y < upto; y++)
      for (const row of this.cfg.frames[y].grid) for (const k of row) if (k) seen.add(k);
    return Object.keys(this.cfg.palette).filter((k) => seen.has(k));
  }
  _counts(upto) {
    const c = {};
    for (let y = 0; y < upto; y++)
      for (const row of this.cfg.frames[y].grid) for (const k of row) if (k) c[k] = (c[k] || 0) + 1;
    return c;
  }

  mount(el) {
    this.root = typeof el === "string" ? document.querySelector(el) : el;
    if (!this.root) return this;
    this.root.classList.add("schematic", "iso");
    const c = this.cfg, meta = c.meta || {};
    const metaLine = [meta.footprint && `▦ ${meta.footprint}`, meta.height && `↕ ${meta.height}`].filter(Boolean).join("  ·  ");
    this.root.innerHTML = `
      <div class="schematic__head">
        <div class="schematic__title">${c.title}${c.subtitle ? `<small>${c.subtitle}</small>` : ""}</div>
        <div class="schematic__meta">${metaLine}</div>
      </div>
      <div class="schematic__body">
        <div class="schematic__stage">
          <div class="schematic__stepper" data-stepper></div>
          <div class="iso-stage" data-iso></div>
          <div class="elev-caption">isometric · steps up course by course</div>
        </div>
        <div class="schematic__rail">
          <p class="rail-h">Legend</p>
          <ul class="legend" data-legend></ul>
          <p class="rail-h">Materials · full build</p>
          <ul class="tally" data-tally></ul>
          <p class="framenote" data-note></p>
        </div>
      </div>`;
    this.$stage = this.root.querySelector("[data-iso]");
    this.$stepper = this.root.querySelector("[data-stepper]");
    this.$legend = this.root.querySelector("[data-legend]");
    this.$tally = this.root.querySelector("[data-tally]");
    this.$note = this.root.querySelector("[data-note]");
    this._buildStepper();
    this._render();
    this.$stepper.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-i]");
      if (b) { this.shown = Number(b.dataset.i) + 1; this._render(); }
    });
    return this;
  }

  _buildStepper() {
    const segs = this.cfg.frames
      .map((f, i) => `<button data-i="${i}" class="${i === this.shown - 1 ? "on" : ""}">${f.label}</button>`)
      .join("");
    this.$stepper.innerHTML = `<div class="seg">${segs}</div>`;
  }

  _render() {
    const c = this.cfg, upto = this.shown;
    // collect voxels: (col, row, layer) for layers 0..upto-1
    const vox = [];
    for (let y = 0; y < upto; y++) {
      const g = c.frames[y].grid;
      for (let r = 0; r < g.length; r++)
        for (let col = 0; col < g[r].length; col++)
          if (g[r][col]) vox.push([col, r, y, g[r][col]]);
    }
    // painter's order: back (small col+row) first, lower layers first
    vox.sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]) || a[2] - b[2]);

    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9, body = "";
    for (const [col, r, y, k] of vox) {
      const cx = (col - r) * W;
      const cy = (col + r) * H - y * E;
      const color = this._palette(k).color;
      const top = shade(color, 0.12), lft = shade(color, -0.04), rgt = shade(color, -0.20);
      // top diamond
      const tp = `${cx},${cy - H} ${cx + W},${cy} ${cx},${cy + H} ${cx - W},${cy}`;
      // left face
      const lf = `${cx - W},${cy} ${cx},${cy + H} ${cx},${cy + H + E} ${cx - W},${cy + E}`;
      // right face
      const rf = `${cx + W},${cy} ${cx},${cy + H} ${cx},${cy + H + E} ${cx + W},${cy + E}`;
      body +=
        `<polygon points="${lf}" fill="${lft}" stroke="rgba(0,0,0,.32)" stroke-width=".5"/>` +
        `<polygon points="${rf}" fill="${rgt}" stroke="rgba(0,0,0,.32)" stroke-width=".5"/>` +
        `<polygon points="${tp}" fill="${top}" stroke="rgba(0,0,0,.28)" stroke-width=".5"/>`;
      minX = Math.min(minX, cx - W); maxX = Math.max(maxX, cx + W);
      minY = Math.min(minY, cy - H); maxY = Math.max(maxY, cy + H + E);
    }
    if (vox.length === 0) { minX = minY = 0; maxX = maxY = TW; }
    const pad = 8;
    const vbW = (maxX - minX) + pad * 2, vbH = (maxY - minY) + pad * 2;
    this.$stage.innerHTML =
      `<svg viewBox="${minX - pad} ${minY - pad} ${vbW} ${vbH}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${this.cfg.title} isometric view">${body}</svg>`;

    // stepper state
    this.$stepper.querySelectorAll("button[data-i]").forEach((b) => b.classList.toggle("on", Number(b.dataset.i) === upto - 1));
    // legend (keys present so far)
    this.$legend.innerHTML = this._presentKeys(upto).map((k) => {
      const p = this._palette(k);
      return `<li><span class="sw" style="background:${p.color}"></span>${p.label}</li>`;
    }).join("");
    // tally (cumulative to shown courses)
    const counts = this._counts(upto);
    const rows = Object.keys(this.cfg.palette).filter((k) => counts[k]);
    const total = rows.reduce((s, k) => s + counts[k], 0);
    this.$tally.innerHTML = rows.map((k) => {
      const p = this._palette(k);
      return `<li><span style="display:inline-flex;align-items:center;gap:7px"><span class="sw" style="width:12px;height:12px;border-radius:2px;background:${p.color};display:inline-block"></span>${p.label}</span><span class="q">${counts[k].toLocaleString()}</span></li>`;
    }).join("") + `<li class="total"><span>Blocks placed</span><span class="q">${total.toLocaleString()}</span></li>`;
    this.$note.textContent = c.frames[upto - 1] ? (c.frames[upto - 1].note || "") : "";
  }
}

export function mountIso(def, selector) {
  const host = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!host) return null;
  return new IsoViewer(def).mount(host);
}
