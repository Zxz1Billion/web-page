/* ============================================================================
   SchematicViewer — a reusable, top-down, layer/tier-based block-map widget.
   Powers both the functional Blood Altar (tier frames) and the decorative
   "Sanguine Crypt" builds (Y-layer frames). Vanilla JS, no dependencies.

   config = {
     title, subtitle,
     meta: { footprint, height },          // shown top-right
     palette: { key: { label, color, note? } },
     frames: [                              // bottom->top (Y asc) OR tier asc
       { label, grid, note?, lp?, tally? }  // grid = 2D array of keys|null
     ],
     mode: "cumulative" | "layers",         // altar vs decorative
     stepperLabel: "Tier" | "Layer",
     segmented: bool,                       // segmented buttons (altar) vs prev/next
     coords: bool,                          // draw coordinate rulers
     elevation: (i, ctx) => svgString,      // optional side-profile renderer
     lpScale: number,                       // if set -> LP capacity meter (altar)
   }
   ========================================================================== */

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export class SchematicViewer {
  constructor(config) {
    this.cfg = config;
    this.index = config.startIndex ?? (config.mode === "layers" ? 0 : config.frames.length - 1);
    this.prevIndex = this.index;
    this.root = null;
  }

  /* ---- helpers ---------------------------------------------------------- */
  _palette(key) {
    return this.cfg.palette[key] || { label: key, color: "#888" };
  }

  // keys that appear anywhere across all frames, in palette order
  _presentKeys() {
    const seen = new Set();
    for (const f of this.cfg.frames)
      for (const row of f.grid) for (const k of row) if (k) seen.add(k);
    return Object.keys(this.cfg.palette).filter((k) => seen.has(k));
  }

  _countGrid(grid, into) {
    for (const row of grid) for (const k of row) if (k) into[k] = (into[k] || 0) + 1;
    return into;
  }

  // tally for the current view:
  //  - explicit frame.tally override wins (altar canonical totals)
  //  - layers mode -> sum across ALL frames (the build's shopping list)
  //  - cumulative -> count of the current frame
  _tally() {
    const f = this.cfg.frames[this.index];
    if (f.tally) return f.tally.slice();
    const counts = {};
    if (this.cfg.mode === "layers")
      for (const fr of this.cfg.frames) this._countGrid(fr.grid, counts);
    else this._countGrid(f.grid, counts);
    return Object.keys(this.cfg.palette)
      .filter((k) => counts[k])
      .map((k) => ({ label: this._palette(k).label, color: this._palette(k).color, count: counts[k] }));
  }

  /* ---- render ----------------------------------------------------------- */
  mount(el) {
    this.root = typeof el === "string" ? document.querySelector(el) : el;
    this.root.classList.add("schematic");
    this.root.innerHTML = this._chrome();
    this._cacheNodes();
    this._renderFrame(false);
    this._wire();
    return this;
  }

  _chrome() {
    const c = this.cfg;
    const meta = c.meta || {};
    const metaLine = [meta.footprint && `▦ ${meta.footprint}`, meta.height && `↕ ${meta.height}`]
      .filter(Boolean)
      .join("  ·  ");
    return `
      <div class="schematic__head">
        <div class="schematic__title">${c.title}${c.subtitle ? `<small>${c.subtitle}</small>` : ""}</div>
        <div class="schematic__meta">${metaLine}</div>
      </div>
      <div class="schematic__body">
        <div class="schematic__stage">
          <div class="schematic__stepper" data-stepper></div>
          <div class="schematic__plate-wrap" data-plate></div>
          ${c.elevation ? `<div class="schematic__elevation" data-elev></div><div class="elev-caption">side elevation · build downward like a beacon</div>` : ""}
        </div>
        <div class="schematic__rail">
          <p class="rail-h">Legend</p>
          <ul class="legend" data-legend></ul>
          <p class="rail-h" data-tally-h>${c.mode === "layers" ? "Materials · full build" : "Materials"}</p>
          <ul class="tally" data-tally></ul>
          ${c.lpScale ? `<div class="lpmeter"><p class="rail-h">LP capacity</p><div class="bar"><div class="fill" data-lp-fill></div></div><div class="val"><span data-lp-val></span><span>${c.lpScale.toLocaleString()} LP</span></div></div>` : ""}
          <p class="framenote" data-note></p>
        </div>
      </div>`;
  }

  _cacheNodes() {
    const q = (s) => this.root.querySelector(s);
    this.$stepper = q("[data-stepper]");
    this.$plate = q("[data-plate]");
    this.$elev = q("[data-elev]");
    this.$legend = q("[data-legend]");
    this.$tally = q("[data-tally]");
    this.$note = q("[data-note]");
    this.$lpFill = q("[data-lp-fill]");
    this.$lpVal = q("[data-lp-val]");
    this._buildStepper();
    this._buildLegend();
  }

  _buildStepper() {
    const c = this.cfg;
    if (c.frames.length === 1) { this.$stepper.style.display = "none"; return; }
    if (c.segmented) {
      const segs = c.frames
        .map((f, i) => `<button data-i="${i}" class="${i === this.index ? "on" : ""}">${f.label}</button>`)
        .join("");
      this.$stepper.innerHTML = `<div class="seg">${segs}</div>`;
    } else {
      this.$stepper.innerHTML = `
        <button class="nav-btn" data-prev aria-label="previous layer">‹</button>
        <span class="schematic__framelabel" data-flabel></span>
        <button class="nav-btn" data-next aria-label="next layer">›</button>`;
    }
  }

  _buildLegend() {
    this.$legend.innerHTML = this._presentKeys()
      .map((k) => {
        const p = this._palette(k);
        return `<li><span class="sw" style="background:${p.color}"></span>${p.label}${p.note ? ` <span class="ct" title="${p.note}">ⓘ</span>` : ""}</li>`;
      })
      .join("");
  }

  _renderFrame(animate) {
    const c = this.cfg;
    const f = c.frames[this.index];
    const grid = f.grid;
    const N = grid.length;
    const cols = grid[0].length;
    const cell = Math.max(12, Math.min(30, Math.floor(440 / Math.max(N, cols))));

    // which cells are newly-filled vs previous frame (for pop-in on step up)
    const goingUp = this.index > this.prevIndex;
    const prevGrid = c.frames[this.prevIndex] ? c.frames[this.prevIndex].grid : null;
    const isNew = (r, col) => {
      if (!animate || REDUCED_MOTION || !goingUp || !prevGrid) return false;
      const pr = prevGrid[r];
      const was = pr ? pr[col] : null;
      return grid[r][col] && was !== grid[r][col];
    };

    let html = `<div class="schematic__plate${c.coords ? " coords" : ""}" style="grid-template-columns:repeat(${cols}, ${cell}px); --cell:${cell}px">`;
    for (let r = 0; r < N; r++) {
      for (let col = 0; col < cols; col++) {
        const k = grid[r][col];
        if (!k) {
          html += `<div class="cell air" data-label=""></div>`;
        } else {
          const p = this._palette(k);
          const isCore = k === "altar";
          const cls = ["cell", "filled", isCore ? "altar-core" : "", isNew(r, col) ? "pop" : ""]
            .filter(Boolean)
            .join(" ");
          html += `<div class="${cls}" style="background:${p.color}" data-label="${p.label}"></div>`;
        }
      }
    }
    html += `</div>`;
    this.$plate.innerHTML = html;

    // elevation
    if (this.$elev && c.elevation) {
      this.$elev.innerHTML = c.elevation(this.index, { palette: c.palette });
    }

    // stepper state
    if (c.segmented) {
      this.$stepper.querySelectorAll("button[data-i]").forEach((b) => {
        b.classList.toggle("on", Number(b.dataset.i) === this.index);
      });
    } else {
      const fl = this.$stepper.querySelector("[data-flabel]");
      if (fl) fl.innerHTML = `<b>${f.label}</b><br><span style="font-size:.62rem">layer ${this.index + 1} / ${c.frames.length}</span>`;
      const prev = this.$stepper.querySelector("[data-prev]");
      const next = this.$stepper.querySelector("[data-next]");
      if (prev) prev.disabled = this.index === 0;
      if (next) next.disabled = this.index === c.frames.length - 1;
    }

    // tally
    this.$tally.innerHTML =
      this._tally()
        .map((t) => `<li><span style="display:inline-flex;align-items:center;gap:7px"><span class="sw" style="width:12px;height:12px;border-radius:2px;background:${t.color};display:inline-block"></span>${t.label}</span><span class="q">${t.count.toLocaleString()}</span></li>`)
        .join("") +
      (c.mode === "layers"
        ? `<li class="total"><span>Total blocks</span><span class="q">${this._tally().reduce((s, t) => s + t.count, 0).toLocaleString()}</span></li>`
        : "");

    // lp meter
    if (this.$lpFill) {
      const lp = f.lp || 0;
      this.$lpFill.style.width = `${Math.min(100, (lp / c.lpScale) * 100)}%`;
      this.$lpVal.textContent = `${lp.toLocaleString()} LP`;
    }

    this.$note.textContent = f.note || "";
  }

  _go(i, animate = true) {
    if (i < 0 || i >= this.cfg.frames.length || i === this.index) return;
    this.prevIndex = this.index;
    this.index = i;
    this._renderFrame(animate);
  }

  _wire() {
    this.$stepper.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.i != null) this._go(Number(b.dataset.i));
      else if (b.hasAttribute("data-prev")) this._go(this.index - 1);
      else if (b.hasAttribute("data-next")) this._go(this.index + 1);
    });
    // keyboard arrows when focused
    this.root.tabIndex = 0;
    this.root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowUp") { this._go(this.index + 1); e.preventDefault(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") { this._go(this.index - 1); e.preventDefault(); }
    });
  }
}

/* convenience: mount a viewer from a definition object onto a selector */
export function mountSchematic(def, selector) {
  const host = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!host) return null;
  return new SchematicViewer(def).mount(host);
}
