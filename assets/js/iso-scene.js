/* ============================================================================
   iso-scene.js — a small isometric illustration engine for building massed
   structures (not voxel cubes). Primitives: box, gable/hip/shed roofs, cylinder,
   cone, custom polygon, plus window/door decals. Parts are drawn in author order
   (paint back-to-front); cylinders/cones depth-sort their own facets. Pure SVG.
   ========================================================================== */

const U = 16, V = 8, K = 18; // iso horizontal half-step, vertical half-step, block height
const STROKE = "rgba(25,18,12,.38)";

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const a = (x) => Math.max(0, Math.min(255, Math.round(x + 255 * f)));
  return `rgb(${a(r)},${a(g)},${a(b)})`;
}

export function renderSceneSVG(def) {
  const B = { mnx: 1e9, mny: 1e9, mxx: -1e9, mxy: -1e9 };
  const pj = (x, y, z) => {
    const sx = (x - z) * U, sy = (x + z) * V - y * K;
    if (sx < B.mnx) B.mnx = sx; if (sx > B.mxx) B.mxx = sx;
    if (sy < B.mny) B.mny = sy; if (sy > B.mxy) B.mxy = sy;
    return [sx, sy];
  };
  const s = (p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
  const poly = (pts, fill, extra) => `<polygon points="${pts.map(s).join(" ")}" fill="${fill}" stroke="${STROKE}" stroke-width=".5" stroke-linejoin="round"${extra || ""}/>`;
  let body = "";

  const draw = {
    ground(o) { // flat diamond pad
      const { x, z, w, d, c = "#3a3326" } = o, y = o.y || 0;
      body += poly([pj(x, y, z), pj(x + w, y, z), pj(x + w, y, z + d), pj(x, y, z + d)], c);
    },
    water(o) {
      const { x, z, w, d, c = "#2f6d80" } = o, y = o.y || 0;
      body += poly([pj(x, y, z), pj(x + w, y, z), pj(x + w, y, z + d), pj(x, y, z + d)], c, ' opacity=".85"');
    },
    box(o) {
      const { x, y, z, w, h, d, c } = o, ex = o.op ? ` opacity="${o.op}"` : "";
      const x1 = x + w, y1 = y + h, z1 = z + d;
      body += poly([pj(x, y, z1), pj(x1, y, z1), pj(x1, y1, z1), pj(x, y1, z1)], shade(c, -0.20), ex); // south
      body += poly([pj(x1, y, z), pj(x1, y, z1), pj(x1, y1, z1), pj(x1, y1, z)], shade(c, -0.07), ex); // east
      body += poly([pj(x, y1, z), pj(x1, y1, z), pj(x1, y1, z1), pj(x, y1, z1)], shade(c, 0.13), ex);  // top
    },
    gable(o) {
      const { x, y, z, w, d, rise, c, axis = "x" } = o, ex = o.op ? ` opacity="${o.op}"` : "";
      const cg = o.cGable || shade(c, -0.02);
      const x1 = x + w, z1 = z + d, xm = x + w / 2, zm = z + d / 2, yr = y + rise;
      if (axis === "x") { // ridge runs along x
        body += poly([pj(x1, y, z), pj(x1, y, z1), pj(x1, yr, zm)], cg, ex); // east gable end
        body += poly([pj(x, y, z1), pj(x1, y, z1), pj(x1, yr, zm), pj(x, yr, zm)], shade(c, -0.06), ex); // south slope
        body += poly([pj(x, yr, zm), pj(x1, yr, zm), pj(x1, y, z), pj(x, y, z)], shade(c, 0.12), ex); // north slope (top-lit)
      } else { // ridge runs along z
        body += poly([pj(x, y, z1), pj(x1, y, z1), pj(xm, yr, z1)], cg, ex); // south gable end
        body += poly([pj(x1, y, z), pj(x1, y, z1), pj(xm, yr, z1), pj(xm, yr, z)], shade(c, -0.04), ex); // east slope
        body += poly([pj(xm, yr, z), pj(xm, yr, z1), pj(x, y, z1), pj(x, y, z)], shade(c, 0.12), ex); // west slope (top-lit)
      }
    },
    hip(o) { // four slopes to an apex (pyramid)
      const { x, y, z, w, d, rise, c } = o;
      const x1 = x + w, z1 = z + d, xm = x + w / 2, zm = z + d / 2, ap = pj(xm, y + rise, zm);
      body += poly([pj(x, y, z), pj(x1, y, z), ap], shade(c, 0.12));   // north (top-lit)
      body += poly([pj(x1, y, z), pj(x1, y, z1), ap], shade(c, -0.05)); // east
      body += poly([pj(x, y, z1), pj(x1, y, z1), ap], shade(c, -0.14)); // south
    },
    shed(o) { // single slope, high at back (z), low at front (z+d)
      const { x, y, z, w, d, rise, c } = o;
      const x1 = x + w, z1 = z + d, yr = y + rise;
      body += poly([pj(x1, y, z1), pj(x1, yr, z), pj(x1, yr, z)], STROKE); // (noop guard)
      body += poly([pj(x1, y, z1), pj(x1, yr, z), pj(x, yr, z), pj(x, y, z1)], shade(c, -0.06)); // east edge band
      body += poly([pj(x, y, z1), pj(x1, y, z1), pj(x1, yr, z), pj(x, yr, z)], shade(c, 0.10)); // top slope
    },
    wedge(o) { // right triangular prism (ramp/buttress/embankment). Low at z, high at z+d
      const { x, y, z, w, h, d, c } = o, flip = o.flip ? 1 : 0;
      const z1 = z + d, x1 = x + w, yh = y + h;
      const zh = flip ? z : z1; // high (vertical) edge
      body += poly([pj(x, y, zh), pj(x1, y, zh), pj(x1, yh, zh), pj(x, yh, zh)], shade(c, -0.20)); // vertical face
      body += poly([pj(x, y, flip ? z1 : z), pj(x1, y, flip ? z1 : z), pj(x1, yh, zh), pj(x, yh, zh)], shade(c, 0.11)); // sloped top
      body += poly([pj(x1, y, flip ? z1 : z), pj(x1, y, zh), pj(x1, yh, zh)], shade(c, -0.07)); // east triangle
    },
    cyl(o) {
      const { x, y, z, r, h, c, n = 18 } = o;
      const segs = [];
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
        const nx = Math.cos(am), nz = Math.sin(am);
        if (nx + nz <= 0.02) continue; // back-facing
        const f = Math.max(-0.22, Math.min(0.04, -0.07 + 0.11 * nx - 0.05 * nz));
        segs.push({ key: nx + nz, svg: poly([
          pj(x + r * Math.cos(a0), y, z + r * Math.sin(a0)),
          pj(x + r * Math.cos(a1), y, z + r * Math.sin(a1)),
          pj(x + r * Math.cos(a1), y + h, z + r * Math.sin(a1)),
          pj(x + r * Math.cos(a0), y + h, z + r * Math.sin(a0)),
        ], shade(c, f)) });
      }
      segs.sort((a, b) => a.key - b.key).forEach((sg) => body += sg.svg);
      const top = [];
      for (let i = 0; i < n; i++) top.push(pj(x + r * Math.cos((i / n) * 2 * Math.PI), y + h, z + r * Math.sin((i / n) * 2 * Math.PI)));
      body += poly(top, shade(c, 0.13)); // top cap
    },
    cone(o) {
      const { x, y, z, r, h, c, n = 18 } = o, ap = pj(x, y + h, z);
      const segs = [];
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
        const nx = Math.cos(am), nz = Math.sin(am);
        if (nx + nz <= 0.02) continue;
        const f = Math.max(-0.22, Math.min(0.06, -0.05 + 0.12 * nx - 0.05 * nz));
        segs.push({ key: nx + nz, svg: poly([
          pj(x + r * Math.cos(a0), y, z + r * Math.sin(a0)),
          pj(x + r * Math.cos(a1), y, z + r * Math.sin(a1)), ap], shade(c, f)) });
      }
      segs.sort((a, b) => a.key - b.key).forEach((sg) => body += sg.svg);
    },
    dome(o) { // hemisphere-ish, latitude-banded
      const { x, y, z, r, h, c, n = 18, lat = 5 } = o;
      const segs = [];
      const pt = (rr, a, yy) => pj(x + rr * Math.cos(a), yy, z + rr * Math.sin(a));
      for (let li = 0; li < lat; li++) {
        const t0 = (li / lat) * Math.PI / 2, t1 = ((li + 1) / lat) * Math.PI / 2;
        const y0 = y + h * Math.sin(t0), r0 = r * Math.cos(t0);
        const y1 = y + h * Math.sin(t1), r1 = r * Math.cos(t1);
        for (let i = 0; i < n; i++) {
          const a0 = (i / n) * 2 * Math.PI, a1 = ((i + 1) / n) * 2 * Math.PI, am = (a0 + a1) / 2;
          const nx = Math.cos(am), nz = Math.sin(am);
          if (nx + nz <= 0.02) continue;
          const f = Math.max(-0.22, Math.min(0.13, -0.04 + 0.10 * nx - 0.04 * nz + 0.06 * (li / lat)));
          segs.push({ key: (nx + nz) * 10 + li, svg: poly([pt(r0, a0, y0), pt(r0, a1, y0), pt(r1, a1, y1), pt(r1, a0, y1)], shade(c, f)) });
        }
      }
      segs.sort((a, b) => a.key - b.key).forEach((sg) => body += sg.svg);
    },
    stairs(o) { // solid staircase ascending along +z (or -z), height grows per step
      const { x, y, z, w, steps, rise, run, c, dir = 1 } = o;
      for (let i = 0; i < steps; i++) {
        const zz = dir > 0 ? z + i * run : z + (steps - 1 - i) * run;
        draw.box({ t: "box", x, y, z: zz, w, h: (i + 1) * rise, d: run, c });
      }
    },
    frustum(o) { // tapered box: base w×d, top tw×td (centered), height h
      const { x, y, z, w, d, h, c } = o, tw = o.tw, td = o.td;
      const x1 = x + w, z1 = z + d, y1 = y + h;
      const tx = x + (w - tw) / 2, tz = z + (d - td) / 2, tx1 = tx + tw, tz1 = tz + td;
      body += poly([pj(x, y, z1), pj(x1, y, z1), pj(tx1, y1, tz1), pj(tx, y1, tz1)], shade(c, -0.20)); // south
      body += poly([pj(x1, y, z), pj(x1, y, z1), pj(tx1, y1, tz1), pj(tx1, y1, tz)], shade(c, -0.07)); // east
      body += poly([pj(tx, y1, tz), pj(tx1, y1, tz), pj(tx1, y1, tz1), pj(tx, y1, tz1)], shade(c, 0.13)); // top
    },
    sails(o) { // windmill fan: n broad blades in a vertical plane (xy or zy)
      const { x, y, z, r, c = "#d9cdae", n = 4, plane = "xy", tilt = 45, bw = 1.3 } = o;
      const to3 = (u, v) => plane === "xy" ? [x + u, y + v, z] : [x, y + v, z + u];
      for (let i = 0; i < n; i++) {
        const a = (tilt + i * (360 / n)) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        const inr = r * 0.16, P0 = inr, P1 = r, hw = bw / 2;
        const pts = [
          to3(P0 * ca - hw * -sa, P0 * sa - hw * ca),
          to3(P0 * ca + hw * -sa, P0 * sa + hw * ca),
          to3(P1 * ca + hw * -sa, P1 * sa + hw * ca),
          to3(P1 * ca - hw * -sa, P1 * sa - hw * ca),
        ].map((p) => pj(p[0], p[1], p[2]));
        body += poly(pts, shade(c, i % 2 ? -0.07 : 0.02));
      }
      body += poly([pj(...to3(-0.4, -0.4)), pj(...to3(0.4, -0.4)), pj(...to3(0.4, 0.4)), pj(...to3(-0.4, 0.4))], shade(c, -0.18)); // hub
    },
    poly(o) { body += poly(o.pts.map((p) => pj(p[0], p[1], p[2])), o.c, o.extra); },
    win(o) { // decal on a face. face 'E' (x fixed, spans z & y) or 'S' (z fixed, spans x & y)
      const { x, y, z, c = "#1c2a33" } = o;
      if (o.face === "E") { const d = o.d, h = o.h; body += poly([pj(x, y, z), pj(x, y + h, z), pj(x, y + h, z + d), pj(x, y, z + d)], c); }
      else { const w = o.w, h = o.h; body += poly([pj(x, y, z), pj(x + w, y, z), pj(x + w, y + h, z), pj(x, y + h, z)], c); }
    },
  };
  draw.door = draw.win;

  (def.parts || []).forEach((p) => { if (draw[p.t]) draw[p.t](p); });

  const pad = 6;
  const vb = `${(B.mnx - pad).toFixed(1)} ${(B.mny - pad).toFixed(1)} ${(B.mxx - B.mnx + pad * 2).toFixed(1)} ${(B.mxy - B.mny + pad * 2).toFixed(1)}`;
  const label = String(def.title).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} — isometric view">${body}</svg>`;
}

export function buildCard(def) {
  const m = def.meta || {};
  const tags = (def.tags || []).map((t) => `<span class="bt">${t}</span>`).join("");
  const spec = [m.size && ["Footprint", m.size], m.materials && ["Key materials", m.materials], m.best && ["Best for", m.best]]
    .filter(Boolean).map(([k, v]) => `<div class="brow"><span class="bk">${k}</span><span class="bv">${v}</span></div>`).join("");
  return `<article class="buildcard" id="${def.id}">
    <div class="bc-art">${renderSceneSVG(def)}</div>
    <div class="bc-body">
      <h3>${def.title}</h3>
      <div class="bc-tags">${tags}</div>
      <div class="bc-spec">${spec}</div>
      ${def.note ? `<p class="bc-note">${def.note}</p>` : ""}
    </div>
  </article>`;
}

export function mountScenes(scenes, selector) {
  const host = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (!host) return;
  host.innerHTML = scenes.map(buildCard).join("");
}
