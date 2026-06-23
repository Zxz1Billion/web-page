/* Generates vs-house-schematic.html — clean top-down ARCHITECTURAL FLOOR PLANS
   (cellar, ground floor, first floor) drawn as parchment blueprints: labelled
   rooms, doors with swing arcs, windows, stairs with direction, and furniture.
   Pure SVG, no runtime deps. Run: node tools/build-floorplan.mjs */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const S = 42, T = 9, M = 58, TH = 62;            // scale, wall thickness, margin, title band
const PAPER = "#efe4c9", GRID = "#dchexcc", INK = "#43331f", WALL = "#39291663";
const W_STROKE = "#3a2b18", GLASS = "#6f8c99";

const f = (n) => +(+n).toFixed(1);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
let CLIP = 0; // unique clip-path id per plan

/* ---- one plan renderer -------------------------------------------------- */
function drawPlan(spec) {
  const { name, sub, tint = "#e7d9b6", rooms = [], walls = [], doors = [],
    windows = [], stairs = [], furniture = [] } = spec;
  // footprint outline (block coords); falls back to a plain W×H rectangle
  const outline = spec.outline || [[0, 0], [spec.W, 0], [spec.W, spec.H], [0, spec.H]];
  const W = Math.max(...outline.map((p) => p[0])), H = Math.max(...outline.map((p) => p[1]));
  const X = (b) => f(M + b * S), Y = (b) => f(TH + M + b * S);
  const vbW = W * S + 2 * M, vbH = H * S + 2 * M + TH;
  const cid = "fp" + (++CLIP);
  const poly = outline.map(([x, y]) => `${X(x)},${Y(y)}`).join(" ");
  let s = "";

  // paper + frame
  s += `<rect x="0" y="0" width="${f(vbW)}" height="${f(vbH)}" fill="${PAPER}"/>`;
  s += `<rect x="6" y="6" width="${f(vbW - 12)}" height="${f(vbH - 12)}" fill="none" stroke="${INK}" stroke-width="1" opacity=".4"/>`;
  s += `<defs><clipPath id="${cid}"><polygon points="${poly}"/></clipPath></defs>`;

  // title band
  s += `<text x="${f(vbW / 2)}" y="34" text-anchor="middle" font-family="Cinzel, serif" font-size="22" fill="${INK}" letter-spacing="1.5">${esc(name)}</text>`;
  s += `<text x="${f(vbW / 2)}" y="52" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="${INK}" opacity=".7" letter-spacing="1">${esc(sub)}</text>`;

  // footprint floor + faint block grid (clipped to the footprint shape)
  s += `<polygon points="${poly}" fill="${tint}" opacity=".5"/>`;
  s += `<g clip-path="url(#${cid})">`;
  for (let i = 1; i < W; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(H)}" stroke="${INK}" stroke-width=".5" opacity=".08"/>`;
  for (let i = 1; i < H; i++) s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(W)}" y2="${Y(i)}" stroke="${INK}" stroke-width=".5" opacity=".08"/>`;
  s += `</g>`;

  // room tints + labels
  for (const r of rooms) {
    if (r.fill) s += `<rect x="${X(r.x)}" y="${Y(r.y)}" width="${f(r.w * S)}" height="${f(r.h * S)}" fill="${r.fill}" opacity=".45"/>`;
  }

  // furniture (under the walls so wall lines sit cleanly on top)
  for (const fu of furniture) s += furn(fu, X, Y);

  // exterior wall (the footprint outline) + interior partitions
  s += `<polygon points="${poly}" fill="none" stroke="${W_STROKE}" stroke-width="${T}" stroke-linejoin="miter"/>`;
  for (const w of walls) s += `<line x1="${X(w.x1)}" y1="${Y(w.y1)}" x2="${X(w.x2)}" y2="${Y(w.y2)}" stroke="${W_STROKE}" stroke-width="${T - 2}" stroke-linecap="square"/>`;

  // erase + draw openings
  for (const d of doors) s += doorSym(d, X, Y);
  for (const w of windows) s += winSym(w, X, Y);

  // stairs
  for (const st of stairs) s += stairSym(st, X, Y);

  // room labels (on top), each on a soft parchment plate so it stays readable over furniture
  for (const r of rooms) {
    if (!r.label) continue;
    const cx = X(r.x + r.w / 2), cy = Y(r.y + r.h / 2);
    const tw = Math.max(r.label.length, (r.dim || "").length) * 8.4 + 18;
    s += `<rect x="${f(cx - tw / 2)}" y="${f(cy - 16)}" width="${f(tw)}" height="${r.dim ? 34 : 23}" rx="6" fill="${PAPER}" opacity=".8"/>`;
    s += `<text x="${cx}" y="${f(cy - 1)}" text-anchor="middle" font-family="Cinzel, serif" font-size="15" fill="${INK}" letter-spacing=".5">${esc(r.label)}</text>`;
    if (r.dim) s += `<text x="${cx}" y="${f(cy + 15)}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="${INK}" opacity=".6">${esc(r.dim)}</text>`;
  }

  // overall dimension ticks
  s += dim(0, W, "h", X, Y, W, H);
  s += dim(0, H, "v", X, Y, W, H);

  // north arrow
  const nx = f(vbW - 34), ny = f(TH + 24);
  s += `<g opacity=".75"><circle cx="${nx}" cy="${ny}" r="14" fill="none" stroke="${INK}" stroke-width="1"/><path d="M${nx},${ny - 11} L${nx + 4},${ny + 2} L${nx},${ny - 1} L${nx - 4},${ny + 2} Z" fill="${INK}"/><text x="${nx}" y="${ny + 24}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9" fill="${INK}">N</text></g>`;

  return `<svg viewBox="0 0 ${f(vbW)} ${f(vbH)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)} floor plan">${s}</svg>`;
}

/* door: {x,y,axis:'h'|'v',len,dir:+1/-1,hinge:0|1} opening starts at (x,y) */
function doorSym(d, X, Y) {
  const { x, y, axis, len, dir = 1, hinge = 0 } = d;
  let s = "";
  if (axis === "v") { // vertical wall at column x, opening down the y axis
    s += `<rect x="${f(X(x) - T / 2 - 1)}" y="${Y(y)}" width="${T + 2}" height="${f(len * S)}" fill="${PAPER}"/>`;
    const hy = hinge ? y + len : y, fy = hinge ? y : y + len;
    const hX = X(x), hY = Y(hy), endX = X(x + dir * len), endY = Y(hy), fX = X(x), fY = Y(fy);
    s += `<line x1="${hX}" y1="${hY}" x2="${endX}" y2="${endY}" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<path d="M${endX},${endY} A${f(len * S)} ${f(len * S)} 0 0 ${hinge ? 1 : 0} ${fX},${fY}" fill="none" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
  } else { // horizontal wall at row y, opening along x
    s += `<rect x="${X(x)}" y="${f(Y(y) - T / 2 - 1)}" width="${f(len * S)}" height="${T + 2}" fill="${PAPER}"/>`;
    const hx = hinge ? x + len : x, fx = hinge ? x : x + len;
    const hX = X(hx), hY = Y(y), endX = X(hx), endY = Y(y + dir * len), fX = X(fx), fY = Y(y);
    s += `<line x1="${hX}" y1="${hY}" x2="${endX}" y2="${endY}" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<path d="M${endX},${endY} A${f(len * S)} ${f(len * S)} 0 0 ${hinge ? 0 : 1} ${fX},${fY}" fill="none" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
  }
  return s;
}

/* window: {x,y,axis,len} */
function winSym(w, X, Y) {
  const { x, y, axis, len } = w;
  if (axis === "v") {
    const cx = X(x);
    return `<rect x="${f(cx - T / 2 - 1)}" y="${Y(y)}" width="${T + 2}" height="${f(len * S)}" fill="${PAPER}"/>` +
      `<rect x="${f(cx - T / 2)}" y="${Y(y)}" width="${T}" height="${f(len * S)}" fill="none" stroke="${INK}" stroke-width="1"/>` +
      `<line x1="${cx}" y1="${Y(y)}" x2="${cx}" y2="${Y(y + len)}" stroke="${GLASS}" stroke-width="2"/>`;
  }
  const cy = Y(y);
  return `<rect x="${X(x)}" y="${f(cy - T / 2 - 1)}" width="${f(len * S)}" height="${T + 2}" fill="${PAPER}"/>` +
    `<rect x="${X(x)}" y="${f(cy - T / 2)}" width="${f(len * S)}" height="${T}" fill="none" stroke="${INK}" stroke-width="1"/>` +
    `<line x1="${X(x)}" y1="${cy}" x2="${X(x + len)}" y2="${cy}" stroke="${GLASS}" stroke-width="2"/>`;
}

/* stairs: {x,y,w,h,flow:'+x'|'-x'|'+y'|'-y',label} */
function stairSym(st, X, Y) {
  const { x, y, w, h, flow = "+x", label = "" } = st;
  let s = `<rect x="${X(x)}" y="${Y(y)}" width="${f(w * S)}" height="${f(h * S)}" fill="none" stroke="${INK}" stroke-width="1.2" opacity=".8"/>`;
  const horiz = flow[1] === "x";
  const n = Math.round(horiz ? w : h); // treads
  for (let i = 1; i < n; i++) {
    if (horiz) s += `<line x1="${X(x + i)}" y1="${Y(y)}" x2="${X(x + i)}" y2="${Y(y + h)}" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
    else s += `<line x1="${X(x)}" y1="${Y(y + i)}" x2="${X(x + w)}" y2="${Y(y + i)}" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
  }
  // direction arrow along flow
  const cx = x + w / 2, cy = y + h / 2;
  const sign = flow[0] === "-" ? -1 : 1;
  let ax1, ay1, ax2, ay2, hp;
  if (horiz) { ax1 = X(x + 0.4); ax2 = X(x + w - 0.4); ay1 = ay2 = Y(cy); const tip = sign > 0 ? ax2 : ax1; hp = `${tip},${Y(cy)} ${f(tip - sign * 9)},${f(Y(cy) - 5)} ${f(tip - sign * 9)},${f(Y(cy) + 5)}`; }
  else { ay1 = Y(y + 0.4); ay2 = Y(y + h - 0.4); ax1 = ax2 = X(cx); const tip = sign > 0 ? ay2 : ay1; hp = `${X(cx)},${tip} ${f(X(cx) - 5)},${f(tip - sign * 9)} ${f(X(cx) + 5)},${f(tip - sign * 9)}`; }
  s += `<line x1="${ax1}" y1="${ay1}" x2="${ax2}" y2="${ay2}" stroke="${INK}" stroke-width="1.4"/><polygon points="${hp}" fill="${INK}"/>`;
  if (label) s += `<text x="${X(cx)}" y="${f(Y(y + h) + 13)}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9" fill="${INK}" opacity=".8">${esc(label)}</text>`;
  return s;
}

/* furniture icons: {t, x, y, ...} */
function furn(o, X, Y) {
  const st = `stroke="${INK}" stroke-width="1.2" fill="${INK}" fill-opacity="0.07"`;
  const fillSoft = `fill="${INK}" fill-opacity="0.12" stroke="${INK}" stroke-width="1.1"`;
  const r = (x, y, w, h, rx = 3, extra = st) => `<rect x="${X(x)}" y="${Y(y)}" width="${f(w * S)}" height="${f(h * S)}" rx="${rx}" ${extra}/>`;
  const lbl = () => ""; // furniture is shown as icons only — keeps the plan uncluttered
  switch (o.t) {
    case "bed": { // {x,y,w,h}
      const w = o.w || 2, h = o.h || 2.6;
      return r(o.x, o.y, w, h, 4) + r(o.x + 0.12, o.y + 0.12, w - 0.24, 0.7, 3) /*pillow*/ +
        `<line x1="${X(o.x + 0.1)}" y1="${Y(o.y + 1)}" x2="${X(o.x + w - 0.1)}" y2="${Y(o.y + 1)}" stroke="${INK}" stroke-width="1" opacity=".4"/>` + lbl(o.x + w / 2, o.y + h / 2 + 0.2, "bed");
    }
    case "stove":
      return r(o.x, o.y, 1, 1, 2) + `<circle cx="${X(o.x + 0.5)}" cy="${Y(o.y + 0.5)}" r="${f(0.3 * S)}" fill="none" stroke="${INK}" stroke-width="1.2"/>` + lbl(o.x + 0.5, o.y + 1.32, "stove");
    case "counter": // {x,y,w,h}
      return r(o.x, o.y, o.w, o.h, 2, fillSoft);
    case "table": { // {x,y,w,h}
      const w = o.w || 2, h = o.h || 1.4;
      let g = r(o.x + 0.3, o.y + 0.3, w - 0.6, h - 0.6, 3);
      for (const [dx, dy] of [[0, 0.45], [w - 0.5, 0.45], [0.45, 0], [0.45, h - 0.5]]) g += r(o.x + dx, o.y + dy, 0.5, 0.5, 2);
      return g + lbl(o.x + w / 2, o.y + h / 2 + 0.1, "table");
    }
    case "sofa": { const w = o.w || 2.4, h = o.h || 0.95; return r(o.x, o.y, w, h, 4) + r(o.x, o.y, w, 0.35, 3) + lbl(o.x + w / 2, o.y + h + 0.28, "seating"); }
    case "wardrobe": return r(o.x, o.y, o.w || 2, o.h || 0.8, 2) + `<line x1="${X(o.x + (o.w || 2) / 2)}" y1="${Y(o.y)}" x2="${X(o.x + (o.w || 2) / 2)}" y2="${Y(o.y + (o.h || 0.8))}" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + (o.w || 2) / 2, o.y + (o.h || 0.8) + 0.28, "wardrobe");
    case "hearth":
      return r(o.x, o.y, o.w || 2, 0.6, 1, fillSoft) + `<path d="M${X(o.x + 0.4)},${Y(o.y + 0.55)} Q${X(o.x + (o.w || 2) / 2)},${Y(o.y - 0.3)} ${X(o.x + (o.w || 2) - 0.4)},${Y(o.y + 0.55)}" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + (o.w || 2) / 2, o.y + 0.95, "hearth");
    case "chest": return r(o.x, o.y, 1, 0.7, 2) + `<line x1="${X(o.x)}" y1="${Y(o.y + 0.35)}" x2="${X(o.x + 1)}" y2="${Y(o.y + 0.35)}" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + 0.5, o.y + 1, "chest");
    case "barrel": return `<circle cx="${X(o.x + 0.4)}" cy="${Y(o.y + 0.4)}" r="${f(0.38 * S)}" ${st}/>`;
    case "shelf": return r(o.x, o.y, o.w, o.h, 1, fillSoft) + lbl(o.x + o.w / 2, o.y + o.h + 0.26, o.label || "shelving");
    default: return "";
  }
}

/* overall dimension line with the block count */
function dim(a, b, axis, X, Y, W, H) {
  if (axis === "h") {
    const yy = f(Y(H) + 26), x1 = X(0), x2 = X(W);
    return `<line x1="${x1}" y1="${yy}" x2="${x2}" y2="${yy}" stroke="${INK}" stroke-width="1" opacity=".55"/>` +
      `<line x1="${x1}" y1="${f(yy - 4)}" x2="${x1}" y2="${f(yy + 4)}" stroke="${INK}" stroke-width="1"/>` +
      `<line x1="${x2}" y1="${f(yy - 4)}" x2="${x2}" y2="${f(yy + 4)}" stroke="${INK}" stroke-width="1"/>` +
      `<text x="${f((x1 + x2) / 2)}" y="${f(yy - 6)}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9.5" fill="${INK}" opacity=".7">${W} blocks</text>`;
  }
  const xx = f(X(0) - 26), y1 = Y(0), y2 = Y(H);
  return `<line x1="${xx}" y1="${y1}" x2="${xx}" y2="${y2}" stroke="${INK}" stroke-width="1" opacity=".55"/>` +
    `<line x1="${f(xx - 4)}" y1="${y1}" x2="${f(xx + 4)}" y2="${y1}" stroke="${INK}" stroke-width="1"/>` +
    `<line x1="${f(xx - 4)}" y1="${y2}" x2="${f(xx + 4)}" y2="${y2}" stroke="${INK}" stroke-width="1"/>` +
    `<text x="${xx}" y="${f((y1 + y2) / 2)}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9.5" fill="${INK}" opacity=".7" transform="rotate(-90 ${xx} ${f((y1 + y2) / 2)})">${H} blocks</text>`;
}

/* ======================================================= THE THREE LEVELS == */
const ground = drawPlan({
  W: 15, H: 11, name: "Ground Floor", sub: "ENTRANCE HALL · DINING · LIVING · KITCHEN · STUDY", tint: "#e7d9b6",
  walls: [
    { x1: 6, y1: 0, x2: 6, y2: 11 }, { x1: 9, y1: 0, x2: 9, y2: 11 }, // central hall
    { x1: 0, y1: 5, x2: 6, y2: 5 }, { x1: 9, y1: 5, x2: 15, y2: 5 },  // left & right wings split
  ],
  rooms: [
    { x: 0, y: 0, w: 6, h: 5, label: "Dining Room", dim: "6 × 5", fill: "#e9dcbb" },
    { x: 0, y: 5, w: 6, h: 6, label: "Living Room", dim: "6 × 6", fill: "#ecdfbf" },
    { x: 6, y: 0, w: 3, h: 11, label: "Hall", dim: "3 × 11", fill: "#dfd0aa" },
    { x: 9, y: 0, w: 6, h: 5, label: "Kitchen", dim: "6 × 5", fill: "#e5d6b2" },
    { x: 9, y: 5, w: 6, h: 6, label: "Study", dim: "6 × 6", fill: "#e3d6bd" },
  ],
  doors: [
    { x: 6.9, y: 11, axis: "h", len: 1.3, dir: -1, hinge: 0 },  // front entrance → hall
    { x: 6, y: 7.0, axis: "v", len: 1.4, dir: -1, hinge: 0 },   // hall ↔ living
    { x: 6, y: 3.7, axis: "v", len: 1.2, dir: -1, hinge: 0 },   // hall ↔ dining (clear of the stairs)
    { x: 2.0, y: 5, axis: "h", len: 1.4, dir: 1, hinge: 0 },    // living ↔ dining
    { x: 9, y: 3.7, axis: "v", len: 1.2, dir: 1, hinge: 0 },    // hall ↔ kitchen (clear of the stairs)
    { x: 9, y: 7.0, axis: "v", len: 1.4, dir: 1, hinge: 0 },    // hall ↔ study
    { x: 11.0, y: 5, axis: "h", len: 1.4, dir: 1, hinge: 0 },   // kitchen ↔ study
    { x: 11.4, y: 0, axis: "h", len: 1.2, dir: 1, hinge: 0 },   // back door → kitchen
  ],
  windows: [
    { x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 },  // dining
    { x: 0, y: 7.2, axis: "v", len: 1.3 }, { x: 2.0, y: 11, axis: "h", len: 1.3 }, // living
    { x: 15, y: 1.6, axis: "v", len: 1.3 }, { x: 9.8, y: 0, axis: "h", len: 1.3 }, // kitchen
    { x: 15, y: 7.2, axis: "v", len: 1.3 }, { x: 11.2, y: 11, axis: "h", len: 1.3 }, // study
  ],
  stairs: [{ x: 6.3, y: 0.4, w: 2.4, h: 3.0, flow: "-y", label: "UP · cellar below" }],
  furniture: [
    { t: "table", x: 1.8, y: 1.4, w: 2.6, h: 2.2 },
    { t: "hearth", x: 3.7, y: 5.15, w: 2 },
    { t: "sofa", x: 0.4, y: 9.5, w: 2.6, h: 0.95 }, { t: "chest", x: 4.7, y: 9.6 },
    { t: "stove", x: 9.4, y: 0.3 }, { t: "counter", x: 10.6, y: 0.3, w: 4.0, h: 0.8 }, { t: "counter", x: 14.1, y: 1.2, w: 0.8, h: 3.2 },
    { t: "table", x: 12.4, y: 6.0, w: 2, h: 1.5 }, { t: "shelf", x: 9.2, y: 5.5, w: 0.8, h: 4.8 },
  ],
});

const first = drawPlan({
  W: 15, H: 11, name: "First Floor", sub: "MASTER + ENSUITE · TWO BEDROOMS · LANDING", tint: "#e3d9c0",
  walls: [
    { x1: 6, y1: 0, x2: 6, y2: 11 }, { x1: 9, y1: 0, x2: 9, y2: 11 },
    { x1: 0, y1: 3, x2: 6, y2: 3 }, { x1: 9, y1: 5, x2: 15, y2: 5 },
  ],
  rooms: [
    { x: 0, y: 0, w: 6, h: 3, label: "Ensuite", dim: "6 × 3", fill: "#dde3da" },
    { x: 0, y: 3, w: 6, h: 8, label: "Master Bedroom", dim: "6 × 8", fill: "#e8ddc4" },
    { x: 6, y: 0, w: 3, h: 11, label: "Landing", dim: "3 × 11", fill: "#dccfaf" },
    { x: 9, y: 0, w: 6, h: 5, label: "Bedroom 2", dim: "6 × 5", fill: "#e2d6bc" },
    { x: 9, y: 5, w: 6, h: 6, label: "Bedroom 3", dim: "6 × 6", fill: "#e5d8bf" },
  ],
  doors: [
    { x: 6, y: 7.0, axis: "v", len: 1.4, dir: -1, hinge: 0 },   // landing ↔ master
    { x: 2.0, y: 3, axis: "h", len: 1.3, dir: -1, hinge: 0 },   // master ↔ ensuite
    { x: 9, y: 3.7, axis: "v", len: 1.2, dir: 1, hinge: 0 },    // landing ↔ bedroom 2 (clear of the stairs)
    { x: 9, y: 7.0, axis: "v", len: 1.4, dir: 1, hinge: 0 },    // landing ↔ bedroom 3
  ],
  windows: [
    { x: 0, y: 5.0, axis: "v", len: 1.3 }, { x: 0, y: 8.4, axis: "v", len: 1.3 }, { x: 2.0, y: 11, axis: "h", len: 1.3 }, // master
    { x: 2.0, y: 0, axis: "h", len: 1.3 },                                          // ensuite
    { x: 15, y: 1.6, axis: "v", len: 1.3 }, { x: 9.8, y: 0, axis: "h", len: 1.3 },  // bedroom 2
    { x: 15, y: 7.2, axis: "v", len: 1.3 }, { x: 11.2, y: 11, axis: "h", len: 1.3 }, // bedroom 3
  ],
  stairs: [{ x: 6.3, y: 0.4, w: 2.4, h: 3.0, flow: "+y", label: "DOWN" }],
  furniture: [
    { t: "bed", x: 0.5, y: 3.6, w: 2.8, h: 3.2 }, { t: "wardrobe", x: 4.0, y: 3.5, w: 1.6, h: 0.8 }, { t: "chest", x: 0.5, y: 9.5 },
    { t: "barrel", x: 0.6, y: 0.6 }, { t: "barrel", x: 1.7, y: 0.6 },
    { t: "bed", x: 9.5, y: 0.5, w: 2.4, h: 2.8 }, { t: "wardrobe", x: 13.0, y: 0.5, w: 1.6, h: 0.8 },
    { t: "bed", x: 9.5, y: 5.6, w: 2.4, h: 2.8 }, { t: "wardrobe", x: 13.0, y: 5.5, w: 1.6, h: 0.8 },
  ],
});

const cellar = drawPlan({
  W: 10, H: 8, name: "Cellar", sub: "COLD STORE · STORE ROOM · UNDER THE HALL", tint: "#cfc6b4",
  walls: [{ x1: 5, y1: 0, x2: 5, y2: 8 }],
  rooms: [
    { x: 0, y: 0, w: 5, h: 8, label: "Cold Store", dim: "5 × 8", fill: "#c8bfa9" },
    { x: 5, y: 0, w: 5, h: 8, label: "Store Room", dim: "5 × 8", fill: "#cdc4ae" },
  ],
  doors: [{ x: 5, y: 3.3, axis: "v", len: 1.4, dir: -1, hinge: 0 }], // cold store ↔ store room
  windows: [],
  stairs: [{ x: 6.4, y: 0.6, w: 2.4, h: 1.6, flow: "+y", label: "UP · to hall" }],
  furniture: [
    { t: "shelf", x: 0.3, y: 0.3, w: 0.8, h: 7.4 }, { t: "shelf", x: 1.3, y: 6.9, w: 3.4, h: 0.8 },
    { t: "barrel", x: 1.4, y: 0.6 }, { t: "barrel", x: 2.5, y: 0.6 }, { t: "barrel", x: 3.6, y: 0.6 },
    { t: "shelf", x: 8.9, y: 3.2, w: 0.8, h: 4.5 },
    { t: "chest", x: 5.4, y: 3.6 }, { t: "chest", x: 6.6, y: 3.6 },
    { t: "barrel", x: 5.4, y: 6.4 }, { t: "barrel", x: 6.5, y: 6.4 }, { t: "barrel", x: 7.6, y: 6.4 },
  ],
});

/* ===================================== GROUND-FLOOR LAYOUT OPTIONS (flow) === */
// Option A — L-shaped cottage with a projecting entry porch and a bay window.
const optA = drawPlan({
  name: "Option A · The L-Cottage", sub: "L-PLAN · PORCH · BAY WINDOW", tint: "#e7d9b6",
  outline: [[0, 0], [15, 0], [15, 7], [10, 7], [10, 8.5], [7, 8.5], [7, 12], [5, 12], [5, 13], [2, 13], [2, 12], [0, 12]],
  walls: [
    { x1: 7, y1: 0, x2: 7, y2: 8.5 }, // left wing | hall+porch
    { x1: 0, y1: 5, x2: 7, y2: 5 },   // dining | living
    { x1: 10, y1: 0, x2: 10, y2: 8.5 }, // hall+porch | kitchen
  ],
  rooms: [
    { x: 0, y: 0, w: 7, h: 5, label: "Dining", dim: "7 × 5" },
    { x: 0, y: 5, w: 7, h: 7, label: "Living Room", dim: "with bay" },
    { x: 7, y: 0, w: 3, h: 7, label: "Hall", dim: "+ stairs" },
    { x: 10, y: 0, w: 5, h: 7, label: "Kitchen", dim: "5 × 7" },
    { x: 7, y: 7, w: 3, h: 1.5, label: "", dim: "" }, // porch (unlabelled)
  ],
  doors: [
    { x: 7.85, y: 8.5, axis: "h", len: 1.3, dir: -1, hinge: 0 }, // front door → porch/hall
    { x: 7, y: 3.3, axis: "v", len: 1.3, dir: -1, hinge: 0 },   // hall → dining (clear of stairs)
    { x: 7, y: 5.4, axis: "v", len: 1.3, dir: -1, hinge: 0 },   // hall → living
    { x: 2.0, y: 5, axis: "h", len: 1.4, dir: 1, hinge: 0 },    // dining → living
    { x: 10, y: 3.3, axis: "v", len: 1.3, dir: 1, hinge: 0 },   // hall → kitchen (clear of stairs)
  ],
  windows: [
    { x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 },  // dining
    { x: 0, y: 7.4, axis: "v", len: 1.4 }, { x: 2.6, y: 13, axis: "h", len: 1.8 }, // living west + bay front
    { x: 7, y: 9.4, axis: "v", len: 1.4 },                                          // living nook side
    { x: 15, y: 1.6, axis: "v", len: 1.3 }, { x: 15, y: 4.6, axis: "v", len: 1.3 }, { x: 11.2, y: 0, axis: "h", len: 1.3 }, // kitchen
  ],
  stairs: [{ x: 7.25, y: 0.45, w: 2.5, h: 2.1, flow: "+x", label: "UP · ↓ cellar" }],
  furniture: [
    { t: "table", x: 1.8, y: 1.3, w: 2.6, h: 2.2 },
    { t: "hearth", x: 4.4, y: 5.15, w: 2 }, { t: "sofa", x: 0.5, y: 9.5, w: 2.6, h: 0.95 }, { t: "table", x: 3.6, y: 9.7, w: 1.7, h: 1.3 }, { t: "chest", x: 5.6, y: 10.8 },
    { t: "stove", x: 10.4, y: 0.3 }, { t: "counter", x: 11.6, y: 0.3, w: 3.0, h: 0.8 }, { t: "counter", x: 14.1, y: 1.2, w: 0.8, h: 3.4 }, { t: "table", x: 10.7, y: 4.4, w: 2.0, h: 1.6 },
    { t: "shelf", x: 9.0, y: 4.9, w: 0.8, h: 1.7 },
  ],
});

// Option B — T-shaped cross-gable house: a prominent living wing projects from the front,
// with a central store/stairs and kitchen + workshop flanking it.
const optB = drawPlan({
  name: "Option B · The Cross-Gable", sub: "T-PLAN · CENTRAL STORE · PROJECTING PARLOUR", tint: "#e7d9b6",
  outline: [[0, 0], [14, 0], [14, 7], [10, 7], [10, 12], [8, 12], [8, 13], [6, 13], [6, 12], [4, 12], [4, 7], [0, 7]],
  walls: [
    { x1: 5, y1: 0, x2: 5, y2: 7 }, { x1: 9, y1: 0, x2: 9, y2: 7 },
    { x1: 5, y1: 4, x2: 9, y2: 4 }, { x1: 4, y1: 7, x2: 10, y2: 7 },
  ],
  rooms: [
    { x: 0, y: 0, w: 5, h: 7, label: "Workshop", dim: "5 × 7" },
    { x: 5, y: 0, w: 4, h: 4, label: "Store", dim: "central" },
    { x: 5, y: 4, w: 4, h: 3, label: "Hall", dim: "+ stairs" },
    { x: 9, y: 0, w: 5, h: 7, label: "Kitchen", dim: "5 × 7" },
    { x: 4, y: 7, w: 6, h: 5, label: "Living Room", dim: "bright parlour" },
  ],
  doors: [
    { x: 6.4, y: 13, axis: "h", len: 1.3, dir: -1, hinge: 0 },  // front door → living
    { x: 6.6, y: 7, axis: "h", len: 1.4, dir: -1, hinge: 0 },   // living ↔ hall
    { x: 6.6, y: 4, axis: "h", len: 1.4, dir: -1, hinge: 0 },   // hall ↔ store
    { x: 5, y: 5.3, axis: "v", len: 1.3, dir: -1, hinge: 0 },   // hall ↔ workshop
    { x: 9, y: 5.3, axis: "v", len: 1.3, dir: 1, hinge: 0 },    // hall ↔ kitchen
    { x: 5, y: 1.5, axis: "v", len: 1.3, dir: -1, hinge: 0 },   // store ↔ workshop
    { x: 9, y: 1.5, axis: "v", len: 1.3, dir: 1, hinge: 0 },    // store ↔ kitchen
  ],
  windows: [
    { x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 0, y: 4.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 },
    { x: 14, y: 1.6, axis: "v", len: 1.3 }, { x: 14, y: 4.6, axis: "v", len: 1.3 }, { x: 11.4, y: 0, axis: "h", len: 1.3 },
    { x: 6.5, y: 0, axis: "h", len: 1.2 },
    { x: 4, y: 9, axis: "v", len: 1.4 }, { x: 10, y: 9, axis: "v", len: 1.4 },
  ],
  stairs: [{ x: 5.4, y: 4.3, w: 2.3, h: 2.1, flow: "+x", label: "UP · ↓ cellar" }],
  furniture: [
    { t: "table", x: 0.6, y: 0.6, w: 1.9, h: 1.5 }, { t: "shelf", x: 3.5, y: 0.4, w: 0.8, h: 3.2 }, { t: "chest", x: 0.6, y: 5.0 },
    { t: "shelf", x: 5.3, y: 0.4, w: 2.6, h: 0.7 }, { t: "chest", x: 5.5, y: 1.5 }, { t: "chest", x: 6.7, y: 1.5 }, { t: "barrel", x: 5.6, y: 2.7 }, { t: "barrel", x: 6.7, y: 2.7 },
    { t: "stove", x: 9.4, y: 0.3 }, { t: "counter", x: 10.6, y: 0.3, w: 3.0, h: 0.8 }, { t: "counter", x: 13.1, y: 1.2, w: 0.8, h: 3.4 },
    { t: "hearth", x: 5.9, y: 11.3, w: 2 }, { t: "sofa", x: 4.4, y: 7.4, w: 2.6, h: 0.95 }, { t: "table", x: 6.0, y: 9.0, w: 1.9, h: 1.5 },
  ],
});

// Option C — U-shaped courtyard house: two wings reach forward round a sheltered courtyard.
const optC = drawPlan({
  name: "Option C · The Courtyard", sub: "U-PLAN · SHELTERED COURT · TWO WINGS", tint: "#e7d9b6",
  outline: [[0, 0], [14, 0], [14, 12], [10, 12], [10, 4], [4, 4], [4, 12], [0, 12]],
  walls: [
    { x1: 5, y1: 0, x2: 5, y2: 4 }, { x1: 9, y1: 0, x2: 9, y2: 4 },
    { x1: 0, y1: 4, x2: 4, y2: 4 }, { x1: 10, y1: 4, x2: 14, y2: 4 },
  ],
  rooms: [
    { x: 0, y: 0, w: 5, h: 4, label: "Kitchen", dim: "5 × 4" },
    { x: 5, y: 0, w: 4, h: 4, label: "Hall", dim: "+ stairs" },
    { x: 9, y: 0, w: 5, h: 4, label: "Dining", dim: "5 × 4" },
    { x: 0, y: 4, w: 4, h: 8, label: "Living Room", dim: "left wing" },
    { x: 10, y: 4, w: 4, h: 8, label: "Workshop", dim: "& store" },
  ],
  doors: [
    { x: 6.4, y: 4, axis: "h", len: 1.4, dir: -1, hinge: 0 },   // courtyard → hall (entrance)
    { x: 5, y: 1.5, axis: "v", len: 1.3, dir: -1, hinge: 0 },   // hall ↔ kitchen
    { x: 9, y: 1.5, axis: "v", len: 1.3, dir: 1, hinge: 0 },    // hall ↔ dining
    { x: 1.6, y: 4, axis: "h", len: 1.3, dir: 1, hinge: 0 },    // kitchen ↔ living
    { x: 11.0, y: 4, axis: "h", len: 1.3, dir: 1, hinge: 0 },   // dining ↔ workshop
  ],
  windows: [
    { x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 },
    { x: 6.5, y: 0, axis: "h", len: 1.2 }, { x: 14, y: 1.6, axis: "v", len: 1.3 }, { x: 11.4, y: 0, axis: "h", len: 1.3 },
    { x: 0, y: 6.0, axis: "v", len: 1.4 }, { x: 0, y: 9.4, axis: "v", len: 1.4 }, { x: 4, y: 8.0, axis: "v", len: 1.4 }, { x: 1.4, y: 12, axis: "h", len: 1.4 },
    { x: 14, y: 6.0, axis: "v", len: 1.4 }, { x: 14, y: 9.4, axis: "v", len: 1.4 }, { x: 10, y: 8.0, axis: "v", len: 1.4 }, { x: 11.4, y: 12, axis: "h", len: 1.4 },
  ],
  stairs: [{ x: 5.4, y: 0.4, w: 2.4, h: 2.0, flow: "+x", label: "UP · ↓ cellar" }],
  furniture: [
    { t: "stove", x: 0.4, y: 0.3 }, { t: "counter", x: 1.6, y: 0.3, w: 3.0, h: 0.8 },
    { t: "table", x: 9.5, y: 0.5, w: 2.0, h: 1.6 }, { t: "chest", x: 12.6, y: 0.6 },
    { t: "hearth", x: 0.9, y: 4.2, w: 2 }, { t: "sofa", x: 0.4, y: 9.4, w: 2.6, h: 0.95 }, { t: "table", x: 1.0, y: 6.4, w: 1.9, h: 1.5 },
    { t: "table", x: 10.4, y: 5.0, w: 1.9, h: 1.4 }, { t: "shelf", x: 13.1, y: 5.0, w: 0.8, h: 3.2 }, { t: "chest", x: 10.4, y: 8.0 }, { t: "chest", x: 11.6, y: 8.0 }, { t: "barrel", x: 10.5, y: 10.2 }, { t: "barrel", x: 11.6, y: 10.2 },
  ],
});

/* a polygon approximating a circle (for round footprints), clockwise from the top */
const circle = (cx, cy, r, n = 24) => Array.from({ length: n }, (_, i) => {
  const a = (i / n) * 2 * Math.PI - Math.PI / 2;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
});

/* radial partition walls (r0..r1) at the given angles, for round buildings */
const radial = (cx, cy, r0, r1, angs) => angs.map((d) => {
  const a = d * Math.PI / 180;
  return { x1: +(cx + r0 * Math.cos(a)).toFixed(2), y1: +(cy + r0 * Math.sin(a)).toFixed(2), x2: +(cx + r1 * Math.cos(a)).toFixed(2), y2: +(cy + r1 * Math.sin(a)).toFixed(2) };
});

/* ================================================ THE LAYOUT GALLERY (no furniture) === */
const LAYOUTS = [
  // ---- COTTAGES -------------------------------------------------------------
  { name: "The Square Cottage", sub: "10×8 · STARTER · 3 ROOMS",
    blurb: "A compact starter — living room across the front, kitchen to the side, a back hall with the cellar stair.",
    W: 10, H: 8,
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 6, y1: 3, x2: 10, y2: 3 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 8, label: "Living Room", dim: "6 × 8" }, { x: 6, y: 0, w: 4, h: 3, label: "Hall", dim: "+ stairs" }, { x: 6, y: 3, w: 4, h: 5, label: "Kitchen", dim: "4 × 5" }],
    doors: [{ x: 2.4, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 4.6, axis: "v", len: 1.3, dir: -1 }, { x: 6, y: 1.4, axis: "v", len: 1.3, dir: -1 }, { x: 8, y: 3, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 5.4, axis: "v", len: 1.4 }, { x: 4.4, y: 8, axis: "h", len: 1.4 }, { x: 10, y: 5, axis: "v", len: 1.4 }],
    stairs: [{ x: 6.3, y: 0.4, w: 2.4, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The One-Room Cabin", sub: "8×6 · NIGHT ONE · 1 ROOM",
    blurb: "The smallest real home: a single room with a corner stair down to a cold cellar. Partition it later.",
    W: 8, H: 6, walls: [],
    rooms: [{ x: 0, y: 0, w: 8, h: 6, label: "Cabin", dim: "8 × 6" }],
    doors: [{ x: 3.4, y: 6, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0, y: 2.4, axis: "v", len: 1.4 }, { x: 8, y: 2.4, axis: "v", len: 1.4 }, { x: 5.4, y: 6, axis: "h", len: 1.4 }, { x: 2.4, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 5.4, y: 0.4, w: 2.2, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  { name: "The L-Cottage", sub: "L-PLAN · PORCH · BAY WINDOW",
    blurb: "An L of two wings with a sheltered entry porch in the nook and a bay window on the living room.",
    outline: [[0, 0], [15, 0], [15, 7], [10, 7], [10, 8.5], [7, 8.5], [7, 12], [5, 12], [5, 13], [2, 13], [2, 12], [0, 12]],
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 8.5 }, { x1: 0, y1: 5, x2: 7, y2: 5 }, { x1: 10, y1: 0, x2: 10, y2: 8.5 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 5, label: "Dining", dim: "7 × 5" }, { x: 0, y: 5, w: 7, h: 7, label: "Living Room", dim: "with bay" }, { x: 7, y: 0, w: 3, h: 7, label: "Hall", dim: "+ stairs" }, { x: 10, y: 0, w: 5, h: 7, label: "Kitchen", dim: "5 × 7" }],
    doors: [{ x: 7.85, y: 8.5, axis: "h", len: 1.3, dir: -1 }, { x: 7, y: 3.3, axis: "v", len: 1.3, dir: -1 }, { x: 7, y: 5.4, axis: "v", len: 1.3, dir: -1 }, { x: 2.0, y: 5, axis: "h", len: 1.4, dir: 1 }, { x: 10, y: 3.3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 }, { x: 0, y: 7.4, axis: "v", len: 1.4 }, { x: 2.6, y: 13, axis: "h", len: 1.8 }, { x: 7, y: 9.4, axis: "v", len: 1.4 }, { x: 15, y: 1.6, axis: "v", len: 1.3 }, { x: 15, y: 4.6, axis: "v", len: 1.3 }, { x: 11.2, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 7.25, y: 0.45, w: 2.5, h: 2.1, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Porch Cottage", sub: "11×8 · GABLE PORCH · BAY",
    blurb: "A tidy symmetric cottage: a central gabled porch over the door, a bay window beside it, two rooms and a back kitchen.",
    outline: [[0, 0], [11, 0], [11, 8], [7.5, 8], [7.5, 9], [5.5, 9], [5.5, 8], [4, 8], [4, 9.2], [2, 9.2], [2, 8], [0, 8]],
    walls: [{ x1: 5.5, y1: 0, x2: 5.5, y2: 8 }, { x1: 0, y1: 4, x2: 5.5, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 5.5, h: 4, label: "Kitchen", dim: "5 × 4" }, { x: 0, y: 4, w: 5.5, h: 4, label: "Parlour", dim: "with bay" }, { x: 5.5, y: 0, w: 5.5, h: 8, label: "Living Room", dim: "+ stairs" }],
    doors: [{ x: 6.0, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 5.5, y: 5.4, axis: "v", len: 1.3, dir: -1 }, { x: 5.5, y: 1.4, axis: "v", len: 1.3, dir: -1 }, { x: 2.4, y: 4, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.4, y: 0, axis: "h", len: 1.3 }, { x: 0, y: 5.4, axis: "v", len: 1.3 }, { x: 2.6, y: 9.2, axis: "h", len: 1.2 }, { x: 11, y: 2, axis: "v", len: 1.4 }, { x: 11, y: 5.4, axis: "v", len: 1.4 }],
    stairs: [{ x: 8.4, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- FAMILY HOMES ---------------------------------------------------------
  { name: "The Pinwheel", sub: "11×11 · FOUR ROOMS ROUND A HALL",
    blurb: "Four rooms wind round a central stair hall like a pinwheel, so every room opens straight onto the hall — no room is a dead end.",
    W: 11, H: 11,
    walls: [{ x1: 0, y1: 4, x2: 7, y2: 4 }, { x1: 7, y1: 0, x2: 7, y2: 7 }, { x1: 4, y1: 4, x2: 4, y2: 11 }, { x1: 4, y1: 7, x2: 11, y2: 7 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 4, label: "Kitchen", dim: "7 × 4" }, { x: 7, y: 0, w: 4, h: 7, label: "Store", dim: "4 × 7" }, { x: 0, y: 4, w: 4, h: 7, label: "Dining", dim: "4 × 7" }, { x: 4, y: 7, w: 7, h: 4, label: "Living Room", dim: "7 × 4" }, { x: 4, y: 4, w: 3, h: 3, label: "Hall", dim: "stairs" }],
    doors: [{ x: 6.5, y: 11, axis: "h", len: 1.3, dir: -1 }, { x: 5.3, y: 7, axis: "h", len: 1.2, dir: -1 }, { x: 5.3, y: 4, axis: "h", len: 1.2, dir: -1 }, { x: 4, y: 5.3, axis: "v", len: 1.2, dir: -1 }, { x: 7, y: 5.3, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.3 }, { x: 3.5, y: 0, axis: "h", len: 1.4 }, { x: 11, y: 2, axis: "v", len: 1.4 }, { x: 11, y: 5, axis: "v", len: 1.4 }, { x: 9, y: 0, axis: "h", len: 1.3 }, { x: 0, y: 6, axis: "v", len: 1.4 }, { x: 0, y: 9, axis: "v", len: 1.4 }, { x: 9, y: 11, axis: "h", len: 1.4 }, { x: 11, y: 9, axis: "v", len: 1.4 }],
    stairs: [{ x: 8.5, y: 7.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Centre-Hall", sub: "12×10 · CORRIDOR · 4 ROOMS",
    blurb: "A classic centre-hall plan: a corridor runs front to back with the stair, two rooms to each side.",
    W: 12, H: 10,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 10 }, { x1: 7, y1: 0, x2: 7, y2: 10 }, { x1: 0, y1: 5, x2: 5, y2: 5 }, { x1: 7, y1: 5, x2: 12, y2: 5 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 5, label: "Dining", dim: "5 × 5" }, { x: 0, y: 5, w: 5, h: 5, label: "Living Room", dim: "5 × 5" }, { x: 5, y: 0, w: 2, h: 10, label: "Hall", dim: "stairs" }, { x: 7, y: 0, w: 5, h: 5, label: "Kitchen", dim: "5 × 5" }, { x: 7, y: 5, w: 5, h: 5, label: "Study", dim: "5 × 5" }],
    doors: [{ x: 5.4, y: 10, axis: "h", len: 1.2, dir: -1 }, { x: 5, y: 7.2, axis: "v", len: 1.2, dir: -1 }, { x: 5, y: 2.4, axis: "v", len: 1.2, dir: -1 }, { x: 7, y: 7.2, axis: "v", len: 1.2, dir: 1 }, { x: 7, y: 2.4, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 7, axis: "v", len: 1.4 }, { x: 12, y: 2, axis: "v", len: 1.4 }, { x: 12, y: 7, axis: "v", len: 1.4 }, { x: 2, y: 0, axis: "h", len: 1.4 }, { x: 9, y: 0, axis: "h", len: 1.4 }, { x: 2, y: 10, axis: "h", len: 1.4 }, { x: 9, y: 10, axis: "h", len: 1.4 }],
    stairs: [{ x: 5.05, y: 0.4, w: 1.9, h: 3.4, flow: "+y", label: "↓ cellar" }] },

  { name: "The Cross-Gable", sub: "T-PLAN · PROJECTING PARLOUR",
    blurb: "A T-plan with a bright living wing thrust out front, a central store and stair, kitchen and workshop flanking.",
    outline: [[0, 0], [14, 0], [14, 7], [10, 7], [10, 12], [8, 12], [8, 13], [6, 13], [6, 12], [4, 12], [4, 7], [0, 7]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 7 }, { x1: 9, y1: 0, x2: 9, y2: 7 }, { x1: 5, y1: 4, x2: 9, y2: 4 }, { x1: 4, y1: 7, x2: 10, y2: 7 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 7, label: "Workshop", dim: "5 × 7" }, { x: 5, y: 0, w: 4, h: 4, label: "Store", dim: "central" }, { x: 5, y: 4, w: 4, h: 3, label: "Hall", dim: "+ stairs" }, { x: 9, y: 0, w: 5, h: 7, label: "Kitchen", dim: "5 × 7" }, { x: 4, y: 7, w: 6, h: 5, label: "Living Room", dim: "parlour" }],
    doors: [{ x: 6.4, y: 13, axis: "h", len: 1.3, dir: -1 }, { x: 6.6, y: 7, axis: "h", len: 1.4, dir: -1 }, { x: 6.6, y: 4, axis: "h", len: 1.4, dir: -1 }, { x: 5, y: 5.3, axis: "v", len: 1.3, dir: -1 }, { x: 9, y: 5.3, axis: "v", len: 1.3, dir: 1 }, { x: 5, y: 1.5, axis: "v", len: 1.3, dir: -1 }, { x: 9, y: 1.5, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 0, y: 4.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 }, { x: 14, y: 1.6, axis: "v", len: 1.3 }, { x: 14, y: 4.6, axis: "v", len: 1.3 }, { x: 11.4, y: 0, axis: "h", len: 1.3 }, { x: 4, y: 9, axis: "v", len: 1.4 }, { x: 10, y: 9, axis: "v", len: 1.4 }],
    stairs: [{ x: 5.4, y: 4.3, w: 2.3, h: 2.1, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Side-Wing Farmhouse", sub: "L-PLAN · KITCHEN WING",
    blurb: "A long main block with a kitchen wing stepping out to one side — easy to extend, room for a workshop.",
    outline: [[0, 0], [10, 0], [10, 3], [15, 3], [15, 8], [0, 8]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 8 }, { x1: 10, y1: 3, x2: 10, y2: 8 }, { x1: 5, y1: 4, x2: 10, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 8, label: "Living Room", dim: "5 × 8" }, { x: 5, y: 0, w: 5, h: 4, label: "Hall", dim: "+ stairs" }, { x: 5, y: 4, w: 5, h: 4, label: "Dining", dim: "5 × 4" }, { x: 10, y: 3, w: 5, h: 5, label: "Kitchen", dim: "5 × 5" }],
    doors: [{ x: 6.4, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 5.6, axis: "v", len: 1.3, dir: -1 }, { x: 7.4, y: 4, axis: "h", len: 1.3, dir: -1 }, { x: 10, y: 5.6, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 5.4, axis: "v", len: 1.4 }, { x: 2.4, y: 0, axis: "h", len: 1.4 }, { x: 7.4, y: 0, axis: "h", len: 1.3 }, { x: 15, y: 5, axis: "v", len: 1.4 }, { x: 12, y: 8, axis: "h", len: 1.4 }, { x: 2.4, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 7.4, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Long House", sub: "16×7 · LINEAR · ROOMS IN A ROW",
    blurb: "Everything in a single row — store, kitchen, hall with stairs, then the living room. Cheap to roof, easy to wall.",
    W: 16, H: 7,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 7 }, { x1: 8, y1: 0, x2: 8, y2: 7 }, { x1: 11, y1: 0, x2: 11, y2: 7 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 7, label: "Store", dim: "4 × 7" }, { x: 4, y: 0, w: 4, h: 7, label: "Kitchen", dim: "4 × 7" }, { x: 8, y: 0, w: 3, h: 7, label: "Hall", dim: "stairs" }, { x: 11, y: 0, w: 5, h: 7, label: "Living Room", dim: "5 × 7" }],
    doors: [{ x: 9.0, y: 7, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 3, axis: "v", len: 1.3, dir: 1 }, { x: 8, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 11, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 1.4 }, { x: 16, y: 3, axis: "v", len: 1.4 }, { x: 2, y: 0, axis: "h", len: 1.3 }, { x: 6, y: 0, axis: "h", len: 1.3 }, { x: 13, y: 0, axis: "h", len: 1.3 }, { x: 2, y: 7, axis: "h", len: 1.3 }, { x: 6, y: 7, axis: "h", len: 1.3 }, { x: 13, y: 7, axis: "h", len: 1.3 }],
    stairs: [{ x: 8.3, y: 0.4, w: 2.4, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Saltbox", sub: "12×9 · DEEP CATSLIDE ROOF",
    blurb: "Two rooms up front under a tall roof that sweeps low over a single-storey kitchen and store at the back.",
    W: 12, H: 9,
    walls: [{ x1: 0, y1: 3, x2: 12, y2: 3 }, { x1: 6, y1: 0, x2: 6, y2: 3 }, { x1: 6, y1: 3, x2: 6, y2: 9 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 3, label: "Store", dim: "6 × 3" }, { x: 6, y: 0, w: 6, h: 3, label: "Kitchen", dim: "6 × 3" }, { x: 0, y: 3, w: 6, h: 6, label: "Living Room", dim: "6 × 6" }, { x: 6, y: 3, w: 6, h: 6, label: "Hall", dim: "+ stairs" }],
    doors: [{ x: 8.4, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 5.6, axis: "v", len: 1.3, dir: -1 }, { x: 3.0, y: 3, axis: "h", len: 1.3, dir: -1 }, { x: 9.0, y: 3, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 1.4, axis: "v", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 5, axis: "v", len: 1.4 }, { x: 0, y: 1.4, axis: "v", len: 1.2 }, { x: 12, y: 5, axis: "v", len: 1.4 }, { x: 2, y: 9, axis: "h", len: 1.4 }, { x: 3, y: 0, axis: "h", len: 1.3 }, { x: 9, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 9.4, y: 3.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- LARGE & SPECIAL ------------------------------------------------------
  { name: "The Courtyard", sub: "U-PLAN · SHELTERED COURT",
    blurb: "Two wings reach forward around a sheltered courtyard; the back range holds kitchen, hall-stair and dining.",
    outline: [[0, 0], [14, 0], [14, 12], [10, 12], [10, 4], [4, 4], [4, 12], [0, 12]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 4 }, { x1: 9, y1: 0, x2: 9, y2: 4 }, { x1: 0, y1: 4, x2: 4, y2: 4 }, { x1: 10, y1: 4, x2: 14, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 4, label: "Kitchen", dim: "5 × 4" }, { x: 5, y: 0, w: 4, h: 4, label: "Hall", dim: "+ stairs" }, { x: 9, y: 0, w: 5, h: 4, label: "Dining", dim: "5 × 4" }, { x: 0, y: 4, w: 4, h: 8, label: "Living Room", dim: "left wing" }, { x: 10, y: 4, w: 4, h: 8, label: "Workshop", dim: "& store" }],
    doors: [{ x: 6.4, y: 4, axis: "h", len: 1.4, dir: -1 }, { x: 5, y: 1.5, axis: "v", len: 1.3, dir: -1 }, { x: 9, y: 1.5, axis: "v", len: 1.3, dir: 1 }, { x: 1.6, y: 4, axis: "h", len: 1.3, dir: 1 }, { x: 11.0, y: 4, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 2.0, y: 0, axis: "h", len: 1.3 }, { x: 6.5, y: 0, axis: "h", len: 1.2 }, { x: 14, y: 1.6, axis: "v", len: 1.3 }, { x: 11.4, y: 0, axis: "h", len: 1.3 }, { x: 0, y: 7, axis: "v", len: 1.4 }, { x: 4, y: 8, axis: "v", len: 1.4 }, { x: 1.4, y: 12, axis: "h", len: 1.4 }, { x: 14, y: 7, axis: "v", len: 1.4 }, { x: 10, y: 8, axis: "v", len: 1.4 }, { x: 11.4, y: 12, axis: "h", len: 1.4 }],
    stairs: [{ x: 5.4, y: 0.4, w: 2.4, h: 2.0, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Cross-Plan", sub: "+ PLAN · FOUR SHORT WINGS",
    blurb: "A central hall with the stair, and four short wings — a room on each arm, light on three sides of every one.",
    outline: [[4, 0], [9, 0], [9, 4], [13, 4], [13, 9], [9, 9], [9, 13], [4, 13], [4, 9], [0, 9], [0, 4], [4, 4]],
    walls: [{ x1: 4, y1: 4, x2: 9, y2: 4 }, { x1: 4, y1: 9, x2: 9, y2: 9 }, { x1: 4, y1: 4, x2: 4, y2: 9 }, { x1: 9, y1: 4, x2: 9, y2: 9 }],
    rooms: [{ x: 4, y: 0, w: 5, h: 4, label: "Kitchen", dim: "5 × 4" }, { x: 0, y: 4, w: 4, h: 5, label: "Dining", dim: "4 × 5" }, { x: 9, y: 4, w: 4, h: 5, label: "Store", dim: "4 × 5" }, { x: 4, y: 9, w: 5, h: 4, label: "Living Room", dim: "5 × 4" }, { x: 4, y: 4, w: 5, h: 5, label: "Hall", dim: "stairs" }],
    doors: [{ x: 6.0, y: 13, axis: "h", len: 1.3, dir: -1 }, { x: 6.2, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 6.2, y: 4, axis: "h", len: 1.3, dir: 1 }, { x: 4, y: 6.2, axis: "v", len: 1.3, dir: -1 }, { x: 9, y: 6.2, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 4, y: 1.6, axis: "v", len: 1.4 }, { x: 9, y: 1.6, axis: "v", len: 1.4 }, { x: 6, y: 0, axis: "h", len: 1.4 }, { x: 0, y: 6, axis: "v", len: 1.4 }, { x: 2, y: 4, axis: "h", len: 1.2 }, { x: 2, y: 9, axis: "h", len: 1.2 }, { x: 13, y: 6, axis: "v", len: 1.4 }, { x: 11, y: 4, axis: "h", len: 1.2 }, { x: 11, y: 9, axis: "h", len: 1.2 }, { x: 4, y: 11, axis: "v", len: 1.4 }, { x: 9, y: 11, axis: "v", len: 1.4 }],
    stairs: [{ x: 6.5, y: 4.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The H-Plan Hall", sub: "H-PLAN · TWO RANGES + LINK",
    blurb: "Two parallel ranges joined by a low central hall — a grand entrance front and a sheltered yard at the back.",
    outline: [[0, 0], [5, 0], [5, 4], [11, 4], [11, 0], [16, 0], [16, 12], [11, 12], [11, 8], [5, 8], [5, 12], [0, 12]],
    walls: [{ x1: 5, y1: 6, x2: 11, y2: 6 }, { x1: 5, y1: 0, x2: 5, y2: 12 }, { x1: 11, y1: 0, x2: 11, y2: 12 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 12, label: "Living Range", dim: "5 × 12" }, { x: 11, y: 0, w: 5, h: 12, label: "Kitchen Range", dim: "5 × 12" }, { x: 5, y: 4, w: 6, h: 2, label: "Hall", dim: "stairs" }, { x: 5, y: 6, w: 6, h: 2, label: "Store", dim: "6 × 2" }],
    doors: [{ x: 7.4, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 7.4, y: 6, axis: "h", len: 1.2, dir: 1 }, { x: 5, y: 4.6, axis: "v", len: 1.2, dir: -1 }, { x: 11, y: 4.6, axis: "v", len: 1.2, dir: 1 }, { x: 5, y: 6.6, axis: "v", len: 1.2, dir: -1 }, { x: 11, y: 6.6, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 6, axis: "v", len: 1.4 }, { x: 0, y: 9.5, axis: "v", len: 1.4 }, { x: 2.4, y: 0, axis: "h", len: 1.4 }, { x: 2.4, y: 12, axis: "h", len: 1.4 }, { x: 16, y: 2.5, axis: "v", len: 1.4 }, { x: 16, y: 6, axis: "v", len: 1.4 }, { x: 16, y: 9.5, axis: "v", len: 1.4 }, { x: 12.6, y: 0, axis: "h", len: 1.4 }, { x: 12.6, y: 12, axis: "h", len: 1.4 }],
    stairs: [{ x: 8.6, y: 4.1, w: 2.2, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  { name: "The Atrium House", sub: "13×12 · ROOMS ROUND A COURT",
    blurb: "Rooms wrap a small open courtyard in the middle — every room gets an outside wall and an inner one onto the light-well.",
    W: 13, H: 12,
    walls: [{ x1: 4, y1: 4, x2: 9, y2: 4 }, { x1: 4, y1: 8, x2: 9, y2: 8 }, { x1: 4, y1: 4, x2: 4, y2: 8 }, { x1: 9, y1: 4, x2: 9, y2: 8 }, { x1: 4, y1: 0, x2: 4, y2: 4 }, { x1: 9, y1: 0, x2: 9, y2: 4 }, { x1: 4, y1: 8, x2: 4, y2: 12 }, { x1: 9, y1: 8, x2: 9, y2: 12 }, { x1: 0, y1: 6, x2: 4, y2: 6 }, { x1: 9, y1: 6, x2: 13, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 6, label: "Kitchen", dim: "4 × 6" }, { x: 0, y: 6, w: 4, h: 6, label: "Living Room", dim: "4 × 6" }, { x: 4, y: 0, w: 5, h: 4, label: "Dining", dim: "5 × 4" }, { x: 4, y: 4, w: 5, h: 4, label: "Court", dim: "open" }, { x: 4, y: 8, w: 5, h: 4, label: "Hall", dim: "+ stairs" }, { x: 9, y: 0, w: 4, h: 6, label: "Store", dim: "4 × 6" }, { x: 9, y: 6, w: 4, h: 6, label: "Workshop", dim: "4 × 6" }],
    doors: [{ x: 6.0, y: 12, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 2.0, axis: "v", len: 1.2, dir: 1 }, { x: 4, y: 9.6, axis: "v", len: 1.2, dir: -1 }, { x: 9, y: 2.0, axis: "v", len: 1.2, dir: -1 }, { x: 9, y: 9.6, axis: "v", len: 1.2, dir: 1 }, { x: 6.2, y: 8, axis: "h", len: 1.2, dir: 1 }, { x: 6.2, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 9, axis: "v", len: 1.4 }, { x: 13, y: 2, axis: "v", len: 1.4 }, { x: 13, y: 9, axis: "v", len: 1.4 }, { x: 2, y: 0, axis: "h", len: 1.4 }, { x: 6, y: 0, axis: "h", len: 1.4 }, { x: 10.5, y: 0, axis: "h", len: 1.4 }, { x: 2, y: 12, axis: "h", len: 1.4 }, { x: 10.5, y: 12, axis: "h", len: 1.4 }],
    stairs: [{ x: 6.5, y: 8.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Manor", sub: "18×11 · GRAND · ENTRANCE PORCH",
    blurb: "A big house: a porch into a grand hall with the main stair, two reception rooms one side, kitchen, store and study the other.",
    outline: [[0, 0], [18, 0], [18, 11], [11, 11], [11, 12.5], [7, 12.5], [7, 11], [0, 11]],
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 11 }, { x1: 11, y1: 0, x2: 11, y2: 11 }, { x1: 0, y1: 5.5, x2: 7, y2: 5.5 }, { x1: 11, y1: 4, x2: 18, y2: 4 }, { x1: 11, y1: 7.5, x2: 18, y2: 7.5 }, { x1: 14.5, y1: 4, x2: 14.5, y2: 7.5 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 5.5, label: "Dining Room", dim: "7 × 6" }, { x: 0, y: 5.5, w: 7, h: 5.5, label: "Drawing Room", dim: "7 × 6" }, { x: 7, y: 0, w: 4, h: 11, label: "Grand Hall", dim: "main stair" }, { x: 11, y: 0, w: 7, h: 4, label: "Kitchen", dim: "7 × 4" }, { x: 11, y: 4, w: 3.5, h: 3.5, label: "Store", dim: "" }, { x: 14.5, y: 4, w: 3.5, h: 3.5, label: "Scullery", dim: "" }, { x: 11, y: 7.5, w: 7, h: 3.5, label: "Study", dim: "7 × 4" }],
    doors: [{ x: 8.4, y: 12.5, axis: "h", len: 1.3, dir: -1 }, { x: 7, y: 8.4, axis: "v", len: 1.3, dir: -1 }, { x: 7, y: 2.4, axis: "v", len: 1.3, dir: -1 }, { x: 2.6, y: 5.5, axis: "h", len: 1.3, dir: 1 }, { x: 11, y: 2.0, axis: "v", len: 1.3, dir: 1 }, { x: 11, y: 8.8, axis: "v", len: 1.3, dir: 1 }, { x: 12.2, y: 4, axis: "h", len: 1.2, dir: -1 }, { x: 15.7, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 8, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 2.5, y: 11, axis: "h", len: 1.4 }, { x: 18, y: 2, axis: "v", len: 1.4 }, { x: 18, y: 5.7, axis: "v", len: 1.4 }, { x: 18, y: 9.2, axis: "v", len: 1.4 }, { x: 13, y: 0, axis: "h", len: 1.4 }, { x: 13, y: 11, axis: "h", len: 1.4 }],
    stairs: [{ x: 7.3, y: 0.5, w: 3.4, h: 2.4, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Hall House", sub: "13×8 · OPEN HALL · CROSS-PASSAGE",
    blurb: "A medieval pattern: a tall open hall with a cross-passage by the door, service rooms at the cool end, parlour at the warm.",
    W: 13, H: 8,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 8 }, { x1: 10, y1: 0, x2: 10, y2: 8 }, { x1: 4, y1: 4, x2: 0, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 4, label: "Pantry", dim: "4 × 4" }, { x: 0, y: 4, w: 4, h: 4, label: "Buttery", dim: "4 × 4" }, { x: 4, y: 0, w: 6, h: 8, label: "Great Hall", dim: "open · stairs" }, { x: 10, y: 0, w: 3, h: 8, label: "Parlour", dim: "3 × 8" }],
    doors: [{ x: 4.4, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 6, axis: "v", len: 1.2, dir: 1 }, { x: 4, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 10, y: 4, axis: "v", len: 1.3, dir: 1 }, { x: 1.6, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.3 }, { x: 0, y: 5.6, axis: "v", len: 1.3 }, { x: 13, y: 2.5, axis: "v", len: 1.4 }, { x: 13, y: 5.5, axis: "v", len: 1.4 }, { x: 6, y: 0, axis: "h", len: 1.6 }, { x: 7.4, y: 8, axis: "h", len: 1.6 }],
    stairs: [{ x: 8.0, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- MORE COTTAGES & SMALL HOMES -----------------------------------------
  { name: "The Crofter's Cottage", sub: "8×6 · BUT-AND-BEN · 2 ROOMS",
    blurb: "The old two-room croft: a 'but' (kitchen-living) you enter, and a 'ben' (the good room) beyond, a stair in the corner.",
    W: 8, H: 6,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 6, label: "But", dim: "kitchen" }, { x: 5, y: 0, w: 3, h: 6, label: "Ben", dim: "parlour" }],
    doors: [{ x: 2.0, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 1.4 }, { x: 3.4, y: 6, axis: "h", len: 1.4 }, { x: 8, y: 3, axis: "v", len: 1.4 }, { x: 6.5, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.4, y: 0.4, w: 2.0, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  { name: "The Tower House", sub: "8×8 · STONE KEEP · CORNER STAIR",
    blurb: "A compact stone keep — one great room over a vaulted cellar, with a tight turret stair in the corner. Defensible and snug.",
    W: 8, H: 8,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 3 }, { x1: 5, y1: 3, x2: 8, y2: 3 }],
    rooms: [{ x: 0, y: 0, w: 8, h: 8, label: "Great Chamber", dim: "hall · hearth" }, { x: 5, y: 0, w: 3, h: 3, label: "Stair", dim: "turret" }],
    doors: [{ x: 3.4, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 1.4, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.0 }, { x: 0, y: 5.5, axis: "v", len: 1.0 }, { x: 8, y: 5.5, axis: "v", len: 1.0 }, { x: 2, y: 0, axis: "h", len: 1.0 }, { x: 6, y: 8, axis: "h", len: 1.0 }],
    stairs: [{ x: 5.4, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Shotgun", sub: "6×13 · NARROW · ROOMS IN A LINE",
    blurb: "A narrow plot solved — living, kitchen and store stacked front to back with the doors in line, so a draught runs clean through.",
    W: 6, H: 13,
    walls: [{ x1: 0, y1: 9, x2: 6, y2: 9 }, { x1: 0, y1: 5, x2: 6, y2: 5 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 5, label: "Store", dim: "6 × 5" }, { x: 0, y: 5, w: 6, h: 4, label: "Kitchen", dim: "6 × 4" }, { x: 0, y: 9, w: 6, h: 4, label: "Living Room", dim: "6 × 4" }],
    doors: [{ x: 2.4, y: 13, axis: "h", len: 1.3, dir: -1 }, { x: 2.4, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 2.4, y: 5, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0, y: 11, axis: "v", len: 1.4 }, { x: 6, y: 11, axis: "v", len: 1.4 }, { x: 0, y: 6.5, axis: "v", len: 1.4 }, { x: 6, y: 6.5, axis: "v", len: 1.4 }, { x: 0, y: 2, axis: "v", len: 1.4 }, { x: 6, y: 2, axis: "v", len: 1.4 }],
    stairs: [{ x: 3.4, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Terrace House", sub: "6×12 · NARROW · SIDE STAIR-HALL",
    blurb: "A townhouse on a tight frontage: a stair-hall runs down one side, three rooms opening off it front to back.",
    W: 6, H: 12,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 12 }, { x1: 0, y1: 8, x2: 4, y2: 8 }, { x1: 0, y1: 4, x2: 4, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 4, label: "Scullery", dim: "4 × 4" }, { x: 0, y: 4, w: 4, h: 4, label: "Kitchen", dim: "4 × 4" }, { x: 0, y: 8, w: 4, h: 4, label: "Living Room", dim: "4 × 4" }, { x: 4, y: 0, w: 2, h: 12, label: "Hall", dim: "stairs" }],
    doors: [{ x: 4.5, y: 12, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 9.6, axis: "v", len: 1.2, dir: -1 }, { x: 4, y: 5.6, axis: "v", len: 1.2, dir: -1 }, { x: 4, y: 3.0, axis: "v", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 9.6, axis: "v", len: 1.4 }, { x: 1.4, y: 12, axis: "h", len: 1.4 }, { x: 0, y: 5.6, axis: "v", len: 1.4 }, { x: 0, y: 1.6, axis: "v", len: 1.4 }, { x: 1.4, y: 0, axis: "h", len: 1.4 }, { x: 6, y: 6, axis: "v", len: 1.4 }],
    stairs: [{ x: 4.1, y: 0.4, w: 1.7, h: 2.4, flow: "+y", label: "↓ cellar" }] },

  // ---- THROUGH-PLANS --------------------------------------------------------
  { name: "The Dogtrot", sub: "13×8 · TWO CABINS · OPEN BREEZEWAY",
    blurb: "Two cabins flanking an open central breezeway — a cool through-passage in summer and a sheltered porch the year round.",
    W: 13, H: 8,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 8 }, { x1: 8, y1: 0, x2: 8, y2: 8 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 8, label: "Living Cabin", dim: "5 × 8" }, { x: 5, y: 0, w: 3, h: 8, label: "Breezeway", dim: "open" }, { x: 8, y: 0, w: 5, h: 8, label: "Kitchen Cabin", dim: "5 × 8" }],
    doors: [{ x: 6, y: 8, axis: "h", len: 1.6, dir: -1 }, { x: 6, y: 0, axis: "h", len: 1.6, dir: 1 }, { x: 5, y: 4, axis: "v", len: 1.4, dir: -1 }, { x: 8, y: 4, axis: "v", len: 1.4, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 5.5, axis: "v", len: 1.4 }, { x: 2, y: 8, axis: "h", len: 1.4 }, { x: 13, y: 2.5, axis: "v", len: 1.4 }, { x: 13, y: 5.5, axis: "v", len: 1.4 }, { x: 10, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.4, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Gatehouse", sub: "10×7 · ARCHWAY · LODGE + STORE",
    blurb: "A block with a cart archway straight through the middle — a lodge with the stair on one side, a store on the other.",
    W: 10, H: 7,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 7 }, { x1: 6, y1: 0, x2: 6, y2: 7 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 7, label: "Lodge", dim: "4 × 7" }, { x: 4, y: 0, w: 2, h: 7, label: "Archway", dim: "open" }, { x: 6, y: 0, w: 4, h: 7, label: "Store", dim: "4 × 7" }],
    doors: [{ x: 4.6, y: 7, axis: "h", len: 1.4, dir: -1 }, { x: 4.6, y: 0, axis: "h", len: 1.4, dir: 1 }, { x: 4, y: 4, axis: "v", len: 1.2, dir: -1 }, { x: 6, y: 4, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 5.5, axis: "v", len: 1.4 }, { x: 2, y: 0, axis: "h", len: 1.3 }, { x: 10, y: 2.5, axis: "v", len: 1.4 }, { x: 10, y: 5.5, axis: "v", len: 1.4 }, { x: 8, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 0.4, y: 0.4, w: 2.0, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  // ---- FARMSTEADS & MEDIEVAL ------------------------------------------------
  { name: "The Longhouse & Byre", sub: "18×6 · HOUSE + BARN · CROSS-PASSAGE",
    blurb: "House and beast under one roof: a byre at the cool end, a cross-passage you enter by, then the hall and a snug parlour.",
    W: 18, H: 6,
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 6 }, { x1: 8, y1: 0, x2: 8, y2: 6 }, { x1: 13, y1: 0, x2: 13, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 6, label: "Byre", dim: "stock" }, { x: 6, y: 0, w: 2, h: 6, label: "Passage", dim: "open" }, { x: 8, y: 0, w: 5, h: 6, label: "Hall", dim: "+ stairs" }, { x: 13, y: 0, w: 5, h: 6, label: "Parlour", dim: "5 × 6" }],
    doors: [{ x: 6.6, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 6.6, y: 0, axis: "h", len: 1.3, dir: 1 }, { x: 6, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 8, y: 3, axis: "v", len: 1.3, dir: 1 }, { x: 13, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 1.2 }, { x: 3, y: 0, axis: "h", len: 1.2 }, { x: 10, y: 0, axis: "h", len: 1.4 }, { x: 10, y: 6, axis: "h", len: 1.4 }, { x: 18, y: 3, axis: "v", len: 1.4 }, { x: 15, y: 6, axis: "h", len: 1.4 }, { x: 15, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 11, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Hall & Solar", sub: "14×9 · GREAT HALL · SOLAR · SERVICE",
    blurb: "A little manor: a great hall in the middle, a private solar wing one end and the service rooms — buttery and pantry — the other.",
    W: 14, H: 9,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 9 }, { x1: 0, y1: 4.5, x2: 4, y2: 4.5 }, { x1: 10, y1: 0, x2: 10, y2: 9 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 4.5, label: "Buttery", dim: "4 × 5" }, { x: 0, y: 4.5, w: 4, h: 4.5, label: "Pantry", dim: "4 × 5" }, { x: 4, y: 0, w: 6, h: 9, label: "Great Hall", dim: "open · stairs" }, { x: 10, y: 0, w: 4, h: 9, label: "Solar", dim: "4 × 9" }],
    doors: [{ x: 4.4, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 2, axis: "v", len: 1.2, dir: -1 }, { x: 4, y: 6.5, axis: "v", len: 1.2, dir: -1 }, { x: 10, y: 4.5, axis: "v", len: 1.3, dir: 1 }, { x: 1.6, y: 4.5, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.2 }, { x: 0, y: 6.5, axis: "v", len: 1.2 }, { x: 6, y: 0, axis: "h", len: 1.8 }, { x: 6, y: 9, axis: "h", len: 1.8 }, { x: 14, y: 2.5, axis: "v", len: 1.4 }, { x: 14, y: 6, axis: "v", len: 1.4 }, { x: 11.5, y: 9, axis: "h", len: 1.4 }],
    stairs: [{ x: 7.8, y: 0.4, w: 2.0, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- GRAND & WIDE ---------------------------------------------------------
  { name: "The Wealden Hall", sub: "RECESSED HALL · TWO JETTIED ENDS",
    blurb: "The classic Wealden front: a hall set back between two projecting bays — a parlour one end, the kitchen the other, under one long roof.",
    outline: [[0, 0], [14, 0], [14, 9], [10, 9], [10, 6], [4, 6], [4, 9], [0, 9]],
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 9 }, { x1: 10, y1: 0, x2: 10, y2: 9 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 9, label: "Parlour", dim: "4 × 9" }, { x: 4, y: 0, w: 6, h: 6, label: "Great Hall", dim: "+ stairs" }, { x: 10, y: 0, w: 4, h: 9, label: "Kitchen", dim: "4 × 9" }],
    doors: [{ x: 6.5, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 10, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 6, axis: "v", len: 1.4 }, { x: 2, y: 9, axis: "h", len: 1.4 }, { x: 2, y: 0, axis: "h", len: 1.4 }, { x: 6, y: 0, axis: "h", len: 1.8 }, { x: 14, y: 2.5, axis: "v", len: 1.4 }, { x: 14, y: 6, axis: "v", len: 1.4 }, { x: 12, y: 9, axis: "h", len: 1.4 }, { x: 12, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 8.0, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The E-Plan Manor", sub: "E-PLAN · PORCH + TWO WINGS",
    blurb: "Elizabethan grandeur: a central entrance porch between two forward wings, a grand hall and stair behind, kitchen and dining flanking.",
    outline: [[0, 0], [16, 0], [16, 11], [12, 11], [12, 6], [9.5, 6], [9.5, 8], [6.5, 8], [6.5, 6], [4, 6], [4, 11], [0, 11]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 6 }, { x1: 11, y1: 0, x2: 11, y2: 6 }, { x1: 0, y1: 6, x2: 4, y2: 6 }, { x1: 12, y1: 6, x2: 16, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 6, label: "Kitchen", dim: "5 × 6" }, { x: 5, y: 0, w: 6, h: 6, label: "Grand Hall", dim: "main stair" }, { x: 11, y: 0, w: 5, h: 6, label: "Dining", dim: "5 × 6" }, { x: 0, y: 6, w: 4, h: 5, label: "Drawing Room", dim: "4 × 5" }, { x: 12, y: 6, w: 4, h: 5, label: "Study", dim: "4 × 5" }],
    doors: [{ x: 7.5, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 7.5, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 11, y: 3, axis: "v", len: 1.3, dir: 1 }, { x: 2, y: 6, axis: "h", len: 1.3, dir: 1 }, { x: 14, y: 6, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 8, y: 0, axis: "h", len: 1.6 }, { x: 13.5, y: 0, axis: "h", len: 1.4 }, { x: 16, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 8.5, axis: "v", len: 1.4 }, { x: 2, y: 11, axis: "h", len: 1.4 }, { x: 16, y: 8.5, axis: "v", len: 1.4 }, { x: 14, y: 11, axis: "h", len: 1.4 }],
    stairs: [{ x: 6.6, y: 0.4, w: 2.8, h: 2.2, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Quadrangle", sub: "13×13 · ENCLOSED COURTYARD",
    blurb: "Four ranges round a fully enclosed court — every room faces both out and onto the bright central yard. A small castle of a home.",
    W: 13, H: 13,
    walls: [{ x1: 0, y1: 3, x2: 13, y2: 3 }, { x1: 0, y1: 10, x2: 13, y2: 10 }, { x1: 3, y1: 3, x2: 3, y2: 10 }, { x1: 10, y1: 3, x2: 10, y2: 10 }, { x1: 4, y1: 10, x2: 4, y2: 13 }],
    rooms: [{ x: 0, y: 0, w: 13, h: 3, label: "Kitchen Range", dim: "13 × 3" }, { x: 0, y: 3, w: 3, h: 7, label: "Store", dim: "3 × 7" }, { x: 10, y: 3, w: 3, h: 7, label: "Dining", dim: "3 × 7" }, { x: 3, y: 3, w: 7, h: 7, label: "Court", dim: "open" }, { x: 0, y: 10, w: 4, h: 3, label: "Hall", dim: "stairs" }, { x: 4, y: 10, w: 9, h: 3, label: "Living Room", dim: "9 × 3" }],
    doors: [{ x: 1.4, y: 13, axis: "h", len: 1.3, dir: -1 }, { x: 4, y: 11.5, axis: "v", len: 1.2, dir: 1 }, { x: 1.5, y: 10, axis: "h", len: 1.2, dir: -1 }, { x: 6.5, y: 10, axis: "h", len: 1.3, dir: -1 }, { x: 6.5, y: 3, axis: "h", len: 1.3, dir: 1 }, { x: 3, y: 6.5, axis: "v", len: 1.2, dir: -1 }, { x: 10, y: 6.5, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 1.5, axis: "v", len: 1.4 }, { x: 3, y: 0, axis: "h", len: 1.4 }, { x: 7, y: 0, axis: "h", len: 1.4 }, { x: 10.5, y: 0, axis: "h", len: 1.4 }, { x: 13, y: 1.5, axis: "v", len: 1.4 }, { x: 0, y: 6, axis: "v", len: 1.4 }, { x: 13, y: 6, axis: "v", len: 1.4 }, { x: 0, y: 11.5, axis: "v", len: 1.4 }, { x: 13, y: 11.5, axis: "v", len: 1.4 }, { x: 8, y: 13, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.5, y: 10.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Bungalow", sub: "15×8 · SINGLE STOREY · FRONT HALL",
    blurb: "Everything on one floor: a front hall runs the width with the cellar stair, and three big rooms open off the back of it.",
    W: 15, H: 8,
    walls: [{ x1: 0, y1: 6, x2: 15, y2: 6 }, { x1: 5, y1: 0, x2: 5, y2: 6 }, { x1: 10, y1: 0, x2: 10, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 6, label: "Living Room", dim: "5 × 6" }, { x: 5, y: 0, w: 5, h: 6, label: "Kitchen", dim: "5 × 6" }, { x: 10, y: 0, w: 5, h: 6, label: "Bed Chamber", dim: "5 × 6" }, { x: 0, y: 6, w: 15, h: 2, label: "Hall", dim: "stairs" }],
    doors: [{ x: 2, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 2.4, y: 6, axis: "h", len: 1.3, dir: 1 }, { x: 7.4, y: 6, axis: "h", len: 1.3, dir: 1 }, { x: 12.4, y: 6, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 7.5, y: 0, axis: "h", len: 1.4 }, { x: 12.5, y: 0, axis: "h", len: 1.4 }, { x: 15, y: 2.5, axis: "v", len: 1.4 }, { x: 8, y: 8, axis: "h", len: 1.4 }, { x: 12, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 12.6, y: 6.2, w: 2.2, h: 1.6, flow: "+x", label: "↓ cellar" }] },

  // ---- ROUND & ANGULAR ------------------------------------------------------
  { name: "The Octagon", sub: "12×12 · EIGHT SIDES · LIGHT ALL ROUND",
    blurb: "An eight-sided house with a window facing every way — four rooms quartered round a central stair, never a dark corner.",
    outline: [[3, 0], [9, 0], [12, 3], [12, 9], [9, 12], [3, 12], [0, 9], [0, 3]],
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 12 }, { x1: 0, y1: 6, x2: 12, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 6, label: "Kitchen", dim: "6 × 6" }, { x: 6, y: 0, w: 6, h: 6, label: "Dining", dim: "6 × 6" }, { x: 0, y: 6, w: 6, h: 6, label: "Living Room", dim: "6 × 6" }, { x: 6, y: 6, w: 6, h: 6, label: "Hall", dim: "stairs" }],
    doors: [{ x: 3.4, y: 12, axis: "h", len: 1.3, dir: -1 }, { x: 3, y: 6, axis: "h", len: 1.2, dir: -1 }, { x: 6, y: 9.5, axis: "v", len: 1.2, dir: 1 }, { x: 9, y: 6, axis: "h", len: 1.2, dir: 1 }, { x: 6, y: 3, axis: "v", len: 1.2, dir: -1 }],
    windows: [{ x: 4.5, y: 0, axis: "h", len: 1.4 }, { x: 7.5, y: 0, axis: "h", len: 1.4 }, { x: 0, y: 4.5, axis: "v", len: 1.4 }, { x: 0, y: 7.5, axis: "v", len: 1.4 }, { x: 12, y: 4.5, axis: "v", len: 1.4 }, { x: 12, y: 7.5, axis: "v", len: 1.4 }, { x: 7.5, y: 12, axis: "h", len: 1.4 }],
    stairs: [{ x: 7.3, y: 8.6, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Roundhouse", sub: "11Ø · ONE ROUND ROOM · CENTRE HEARTH",
    blurb: "The old round: a single circular room about a central hearth and stair, beds round the wall. No corners to draught.",
    outline: circle(5.5, 5.5, 5, 24),
    walls: [],
    rooms: [{ x: 0.5, y: 0.5, w: 10, h: 10, label: "Roundhouse", dim: "hearth · beds" }],
    doors: [{ x: 4.8, y: 10.5, axis: "h", len: 1.4, dir: -1 }],
    windows: [{ x: 0.5, y: 5, axis: "v", len: 1.2 }, { x: 10.5, y: 5, axis: "v", len: 1.2 }, { x: 4.9, y: 0.5, axis: "h", len: 1.2 }],
    stairs: [{ x: 4.4, y: 4.5, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Z-Plan Tower", sub: "Z-PLAN · TWO CORNER TOWERS",
    blurb: "A fortified Z — a central range with a stair-tower at one corner and a watch-room at the other, set diagonally for covering fire.",
    outline: [[0, 0], [11, 0], [11, 6], [14, 6], [14, 10], [11, 10], [3, 10], [3, 4], [0, 4]],
    walls: [{ x1: 3, y1: 0, x2: 3, y2: 4 }, { x1: 3, y1: 4, x2: 11, y2: 4 }, { x1: 3, y1: 7, x2: 11, y2: 7 }, { x1: 11, y1: 6, x2: 11, y2: 10 }],
    rooms: [{ x: 0, y: 0, w: 3, h: 4, label: "Study", dim: "tower" }, { x: 3, y: 0, w: 8, h: 4, label: "Kitchen", dim: "8 × 4" }, { x: 3, y: 4, w: 8, h: 3, label: "Hall", dim: "+ stairs" }, { x: 3, y: 7, w: 8, h: 3, label: "Living Room", dim: "8 × 3" }, { x: 11, y: 6, w: 3, h: 4, label: "Pantry", dim: "tower" }],
    doors: [{ x: 6, y: 10, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 7, axis: "h", len: 1.2, dir: -1 }, { x: 5, y: 4, axis: "h", len: 1.2, dir: -1 }, { x: 3, y: 2, axis: "v", len: 1.2, dir: -1 }, { x: 11, y: 8.5, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.2 }, { x: 1.4, y: 0, axis: "h", len: 1.2 }, { x: 7, y: 0, axis: "h", len: 1.4 }, { x: 11, y: 2, axis: "v", len: 1.4 }, { x: 3, y: 5.5, axis: "v", len: 1.2 }, { x: 14, y: 8, axis: "v", len: 1.2 }, { x: 12.4, y: 10, axis: "h", len: 1.2 }, { x: 9, y: 10, axis: "h", len: 1.4 }],
    stairs: [{ x: 4, y: 4.3, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- SYMMETRIC & DOUBLE-FRONTED ------------------------------------------
  { name: "The Villa", sub: "SYMMETRIC · CENTRAL PORTICO",
    blurb: "A balanced front with a columned portico over the door, a central hall and stair, and four matched rooms — formal and calm.",
    outline: [[0, 0], [14, 0], [14, 9], [9, 9], [9, 10.5], [5, 10.5], [5, 9], [0, 9]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 9 }, { x1: 9, y1: 0, x2: 9, y2: 9 }, { x1: 0, y1: 4.5, x2: 5, y2: 4.5 }, { x1: 9, y1: 4.5, x2: 14, y2: 4.5 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 4.5, label: "Dining", dim: "5 × 5" }, { x: 0, y: 4.5, w: 5, h: 4.5, label: "Parlour", dim: "5 × 5" }, { x: 5, y: 0, w: 4, h: 9, label: "Hall", dim: "+ stairs" }, { x: 9, y: 0, w: 5, h: 4.5, label: "Kitchen", dim: "5 × 5" }, { x: 9, y: 4.5, w: 5, h: 4.5, label: "Study", dim: "5 × 5" }],
    doors: [{ x: 6.4, y: 10.5, axis: "h", len: 1.3, dir: -1 }, { x: 5, y: 6.5, axis: "v", len: 1.3, dir: -1 }, { x: 5, y: 2.6, axis: "v", len: 1.2, dir: -1 }, { x: 9, y: 6.5, axis: "v", len: 1.3, dir: 1 }, { x: 9, y: 2.6, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 6.5, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 2.5, y: 9, axis: "h", len: 1.4 }, { x: 14, y: 2, axis: "v", len: 1.4 }, { x: 14, y: 6.5, axis: "v", len: 1.4 }, { x: 11.5, y: 0, axis: "h", len: 1.4 }, { x: 11.5, y: 9, axis: "h", len: 1.4 }],
    stairs: [{ x: 5.3, y: 0.4, w: 3.0, h: 1.8, flow: "+x", label: "UP · ↓ cellar" }] },

  { name: "The Garrison", sub: "12×10 · ENTRY HALL · FOUR ROOMS",
    blurb: "A square, symmetric house: you step into a central hall with the stair, two living rooms either side and the kitchen and dining behind.",
    W: 12, H: 10,
    walls: [{ x1: 4.5, y1: 5, x2: 4.5, y2: 10 }, { x1: 7.5, y1: 5, x2: 7.5, y2: 10 }, { x1: 0, y1: 5, x2: 4.5, y2: 5 }, { x1: 7.5, y1: 5, x2: 12, y2: 5 }, { x1: 4.5, y1: 5, x2: 7.5, y2: 5 }, { x1: 6, y1: 0, x2: 6, y2: 5 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 5, label: "Kitchen", dim: "6 × 5" }, { x: 6, y: 0, w: 6, h: 5, label: "Dining", dim: "6 × 5" }, { x: 0, y: 5, w: 4.5, h: 5, label: "Living Room", dim: "5 × 5" }, { x: 4.5, y: 5, w: 3, h: 5, label: "Hall", dim: "stairs" }, { x: 7.5, y: 5, w: 4.5, h: 5, label: "Parlour", dim: "5 × 5" }],
    doors: [{ x: 5.5, y: 10, axis: "h", len: 1.3, dir: -1 }, { x: 4.5, y: 7.5, axis: "v", len: 1.3, dir: -1 }, { x: 7.5, y: 7.5, axis: "v", len: 1.3, dir: 1 }, { x: 5, y: 5, axis: "h", len: 1.2, dir: -1 }, { x: 6.6, y: 5, axis: "h", len: 1.0, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 12, y: 2, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 9, y: 0, axis: "h", len: 1.4 }, { x: 0, y: 7.5, axis: "v", len: 1.4 }, { x: 12, y: 7.5, axis: "v", len: 1.4 }, { x: 2, y: 10, axis: "h", len: 1.4 }, { x: 10, y: 10, axis: "h", len: 1.4 }],
    stairs: [{ x: 4.7, y: 5.4, w: 2.4, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Back-to-Back", sub: "14×7 · TWO HOMES · ONE PARTY WALL",
    blurb: "Two mirrored cottages sharing a central wall — a cheap pair of homes, each with a living room, a back kitchen and a corner stair.",
    W: 14, H: 7,
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 7 }, { x1: 0, y1: 3, x2: 7, y2: 3 }, { x1: 7, y1: 3, x2: 14, y2: 3 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 3, label: "Kitchen A", dim: "7 × 3" }, { x: 0, y: 3, w: 7, h: 4, label: "Living A", dim: "7 × 4" }, { x: 7, y: 0, w: 7, h: 3, label: "Kitchen B", dim: "7 × 3" }, { x: 7, y: 3, w: 7, h: 4, label: "Living B", dim: "7 × 4" }],
    doors: [{ x: 2, y: 7, axis: "h", len: 1.3, dir: -1 }, { x: 2, y: 3, axis: "h", len: 1.3, dir: -1 }, { x: 11, y: 7, axis: "h", len: 1.3, dir: -1 }, { x: 11, y: 3, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0, y: 4.5, axis: "v", len: 1.4 }, { x: 4.5, y: 7, axis: "h", len: 1.4 }, { x: 0, y: 1.5, axis: "v", len: 1.3 }, { x: 2.5, y: 0, axis: "h", len: 1.3 }, { x: 14, y: 4.5, axis: "v", len: 1.4 }, { x: 9.5, y: 7, axis: "h", len: 1.4 }, { x: 14, y: 1.5, axis: "v", len: 1.3 }, { x: 11.5, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 5.0, y: 3.4, w: 1.8, h: 1.6, flow: "+x", label: "↓ A" }, { x: 7.2, y: 3.4, w: 1.8, h: 1.6, flow: "+x", label: "↓ B" }] },

  // ---- HOMESTEADS & DEFENSIVE ----------------------------------------------
  { name: "The Courtyard Farmstead", sub: "16×14 · HOUSE + BARN + BYRE",
    blurb: "A working farmstead round three sides of a yard: the house along the back, a barn down one side and a byre and cart-shed down the other.",
    outline: [[0, 0], [16, 0], [16, 14], [12, 14], [12, 5], [4, 5], [4, 14], [0, 14]],
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 5 }, { x1: 10, y1: 0, x2: 10, y2: 5 }, { x1: 0, y1: 5, x2: 4, y2: 5 }, { x1: 12, y1: 5, x2: 16, y2: 5 }, { x1: 12, y1: 9, x2: 16, y2: 9 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 5, label: "Kitchen", dim: "6 × 5" }, { x: 6, y: 0, w: 4, h: 5, label: "Hall", dim: "+ stairs" }, { x: 10, y: 0, w: 6, h: 5, label: "Parlour", dim: "6 × 5" }, { x: 0, y: 5, w: 4, h: 9, label: "Barn", dim: "4 × 9" }, { x: 12, y: 5, w: 4, h: 4, label: "Byre", dim: "stock" }, { x: 12, y: 9, w: 4, h: 5, label: "Cart-shed", dim: "4 × 5" }],
    doors: [{ x: 7.4, y: 5, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 2.5, axis: "v", len: 1.3, dir: -1 }, { x: 10, y: 2.5, axis: "v", len: 1.3, dir: 1 }, { x: 2, y: 5, axis: "h", len: 1.3, dir: 1 }, { x: 14, y: 5, axis: "h", len: 1.3, dir: 1 }, { x: 14, y: 9, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 8, y: 0, axis: "h", len: 1.3 }, { x: 13, y: 0, axis: "h", len: 1.4 }, { x: 16, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 9, axis: "v", len: 1.3 }, { x: 0, y: 12, axis: "v", len: 1.3 }, { x: 16, y: 7, axis: "v", len: 1.3 }, { x: 16, y: 12, axis: "v", len: 1.3 }],
    stairs: [{ x: 6.5, y: 0.4, w: 2.6, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Bastle House", sub: "8×10 · DEFENSIVE · BYRE BELOW",
    blurb: "A fortified farmhouse: thick walls, stock and stores on the ground floor, and a stair up to the living room above out of reach of raiders.",
    W: 8, H: 10,
    walls: [{ x1: 0, y1: 3, x2: 8, y2: 3 }],
    rooms: [{ x: 0, y: 0, w: 8, h: 3, label: "Store", dim: "8 × 3" }, { x: 0, y: 3, w: 8, h: 7, label: "Byre", dim: "stock · stair up" }],
    doors: [{ x: 3.4, y: 10, axis: "h", len: 1.1, dir: -1 }, { x: 4, y: 3, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 6, axis: "v", len: 0.8 }, { x: 8, y: 6, axis: "v", len: 0.8 }, { x: 0, y: 1.5, axis: "v", len: 0.8 }, { x: 8, y: 1.5, axis: "v", len: 0.8 }],
    stairs: [{ x: 5.6, y: 3.4, w: 2.0, h: 2.0, flow: "+x", label: "↑ living" }] },

  // ---- SINGLE-STOREY & TRADES ----------------------------------------------
  { name: "The L-Bungalow", sub: "L-PLAN · SINGLE STOREY",
    blurb: "All on one floor in an L — bedrooms and kitchen along the back, the living room reaching out in the leg, the cellar stair in the hall.",
    outline: [[0, 0], [14, 0], [14, 5], [7, 5], [7, 10], [0, 10]],
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 5 }, { x1: 9, y1: 0, x2: 9, y2: 5 }, { x1: 0, y1: 5, x2: 7, y2: 5 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 5, label: "Kitchen", dim: "5 × 5" }, { x: 5, y: 0, w: 4, h: 5, label: "Hall", dim: "+ stairs" }, { x: 9, y: 0, w: 5, h: 5, label: "Bed Chamber", dim: "5 × 5" }, { x: 0, y: 5, w: 7, h: 5, label: "Living Room", dim: "7 × 5" }],
    doors: [{ x: 3, y: 10, axis: "h", len: 1.3, dir: -1 }, { x: 5.6, y: 5, axis: "h", len: 1.3, dir: -1 }, { x: 2.5, y: 5, axis: "h", len: 1.2, dir: -1 }, { x: 5, y: 2.5, axis: "v", len: 1.3, dir: -1 }, { x: 9, y: 2.5, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 7, y: 0, axis: "h", len: 1.3 }, { x: 11.5, y: 0, axis: "h", len: 1.4 }, { x: 14, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 7.5, axis: "v", len: 1.4 }, { x: 3.5, y: 10, axis: "h", len: 1.4 }, { x: 7, y: 7.5, axis: "v", len: 1.4 }],
    stairs: [{ x: 5.5, y: 0.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Weaver's Cottage", sub: "14×6 · LOOMSHOP · GLAZED FOR LIGHT",
    blurb: "A trade cottage: a long loomshop at one end glazed with windows for the light, the living hall and stair in the middle, kitchen at the warm end.",
    W: 14, H: 6,
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 6 }, { x1: 10, y1: 0, x2: 10, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 6, label: "Loomshop", dim: "6 × 6" }, { x: 6, y: 0, w: 4, h: 6, label: "Hall", dim: "+ stairs" }, { x: 10, y: 0, w: 4, h: 6, label: "Kitchen", dim: "4 × 6" }],
    doors: [{ x: 7.4, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 10, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.5, axis: "v", len: 1.4 }, { x: 0, y: 4, axis: "v", len: 1.4 }, { x: 1.5, y: 0, axis: "h", len: 1.3 }, { x: 3.2, y: 0, axis: "h", len: 1.3 }, { x: 4.9, y: 0, axis: "h", len: 1.3 }, { x: 1.5, y: 6, axis: "h", len: 1.3 }, { x: 3.2, y: 6, axis: "h", len: 1.3 }, { x: 4.9, y: 6, axis: "h", len: 1.3 }, { x: 14, y: 3, axis: "v", len: 1.4 }, { x: 12, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 8, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Three-Room Cottage", sub: "13×6 · CROSS-PASSAGE · PARLOUR + KITCHEN",
    blurb: "The classic three-room plan: a cross-passage you enter by, a parlour the warm side and a kitchen the cool side, the stair in the kitchen corner.",
    W: 13, H: 6,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 6 }, { x1: 8, y1: 0, x2: 8, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 6, label: "Parlour", dim: "5 × 6" }, { x: 5, y: 0, w: 3, h: 6, label: "Passage", dim: "open" }, { x: 8, y: 0, w: 5, h: 6, label: "Kitchen", dim: "5 × 6" }],
    doors: [{ x: 5.6, y: 6, axis: "h", len: 1.3, dir: -1 }, { x: 5.6, y: 0, axis: "h", len: 1.3, dir: 1 }, { x: 5, y: 3, axis: "v", len: 1.3, dir: -1 }, { x: 8, y: 3, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 1.6, axis: "v", len: 1.4 }, { x: 0, y: 4.4, axis: "v", len: 1.4 }, { x: 2.5, y: 6, axis: "h", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 13, y: 3, axis: "v", len: 1.4 }, { x: 10.5, y: 6, axis: "h", len: 1.4 }, { x: 10.5, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 11, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Apsidal Hall", sub: "GREAT HALL · CANTED BAY · SOLAR",
    blurb: "A grand hall ending in a canted bay window, with a private solar partitioned off the warm end and the stair in the corner.",
    outline: [[5, 0], [7, 0], [8, 2], [12, 2], [12, 10], [0, 10], [0, 2], [4, 2]],
    walls: [{ x1: 9, y1: 2, x2: 9, y2: 10 }],
    rooms: [{ x: 0, y: 0, w: 9, h: 10, label: "Great Hall", dim: "open · bay" }, { x: 9, y: 2, w: 3, h: 8, label: "Solar", dim: "3 × 8" }],
    doors: [{ x: 3.5, y: 10, axis: "h", len: 1.4, dir: -1 }, { x: 9, y: 6, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 4, axis: "v", len: 1.4 }, { x: 0, y: 7.5, axis: "v", len: 1.4 }, { x: 5.5, y: 0, axis: "h", len: 1.4 }, { x: 7, y: 10, axis: "h", len: 1.6 }, { x: 12, y: 4, axis: "v", len: 1.4 }, { x: 12, y: 7.5, axis: "v", len: 1.4 }, { x: 10.5, y: 10, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.4, y: 2.4, w: 2.0, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- MORE SHAPES ----------------------------------------------------------
  { name: "The Hexagon", sub: "12×8 · SIX SIDES · POINTED ENDS",
    blurb: "A six-sided cottage with flat front and back and pointed ends — a long living room one side, kitchen and stair-hall the other.",
    outline: [[3, 0], [9, 0], [12, 4], [9, 8], [3, 8], [0, 4]],
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 6, y1: 4, x2: 12, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 8, label: "Living Room", dim: "6 × 8" }, { x: 6, y: 0, w: 6, h: 4, label: "Kitchen", dim: "6 × 4" }, { x: 6, y: 4, w: 6, h: 4, label: "Hall", dim: "stairs" }],
    doors: [{ x: 3, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 6, axis: "v", len: 1.2, dir: 1 }, { x: 6, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 9, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 4.5, y: 0, axis: "h", len: 1.4 }, { x: 7.5, y: 0, axis: "h", len: 1.4 }, { x: 4.5, y: 8, axis: "h", len: 1.4 }, { x: 7.5, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 7, y: 4.4, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Wheelhouse", sub: "12Ø · RADIAL CELLS · CENTRE HEARTH",
    blurb: "An Iron-Age round: wedge-shaped cells round a central hearth, each its own snug bay. Thick stone wall, one low door.",
    outline: circle(6, 6, 5.5, 24),
    walls: radial(6, 6, 1.8, 5.5, [30, 102, 174, 246, 318]),
    rooms: [{ x: 5.5, y: 8.2, w: 2, h: 1, label: "Bed", dim: "" }, { x: 1.4, y: 7.3, w: 2, h: 1, label: "Store", dim: "" }, { x: 1.0, y: 3.7, w: 2, h: 1, label: "Byre", dim: "" }, { x: 4.7, y: 2.1, w: 2, h: 1, label: "Loom", dim: "" }, { x: 7.5, y: 5.1, w: 2, h: 1, label: "Larder", dim: "" }],
    doors: [{ x: 5.9, y: 11.4, axis: "h", len: 1.4, dir: -1 }],
    windows: [{ x: 0.5, y: 6, axis: "v", len: 1.0 }, { x: 11.5, y: 6, axis: "v", len: 1.0 }],
    stairs: [{ x: 4.9, y: 5.0, w: 2.2, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  // ---- MULTI-DWELLING & GRAND ----------------------------------------------
  { name: "The Almshouse Row", sub: "16×6 · FOUR DWELLINGS IN A TERRACE",
    blurb: "A charitable terrace: four little one-room dwellings side by side, each with its own door, window and cellar stair. Cheap to raise as a set.",
    W: 16, H: 6,
    walls: [{ x1: 4, y1: 0, x2: 4, y2: 6 }, { x1: 8, y1: 0, x2: 8, y2: 6 }, { x1: 12, y1: 0, x2: 12, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 6, label: "Dwelling", dim: "4 × 6" }, { x: 4, y: 0, w: 4, h: 6, label: "Dwelling", dim: "4 × 6" }, { x: 8, y: 0, w: 4, h: 6, label: "Dwelling", dim: "4 × 6" }, { x: 12, y: 0, w: 4, h: 6, label: "Dwelling", dim: "4 × 6" }],
    doors: [{ x: 1.3, y: 6, axis: "h", len: 1.2, dir: -1 }, { x: 5.3, y: 6, axis: "h", len: 1.2, dir: -1 }, { x: 9.3, y: 6, axis: "h", len: 1.2, dir: -1 }, { x: 13.3, y: 6, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 2.7, y: 6, axis: "h", len: 1.0 }, { x: 6.7, y: 6, axis: "h", len: 1.0 }, { x: 10.7, y: 6, axis: "h", len: 1.0 }, { x: 14.7, y: 6, axis: "h", len: 1.0 }, { x: 1.5, y: 0, axis: "h", len: 1.0 }, { x: 5.5, y: 0, axis: "h", len: 1.0 }, { x: 9.5, y: 0, axis: "h", len: 1.0 }, { x: 13.5, y: 0, axis: "h", len: 1.0 }, { x: 0, y: 3, axis: "v", len: 1.2 }, { x: 16, y: 3, axis: "v", len: 1.2 }],
    stairs: [{ x: 2.2, y: 0.4, w: 1.4, h: 1.6, flow: "+x", label: "↓" }, { x: 6.2, y: 0.4, w: 1.4, h: 1.6, flow: "+x", label: "↓" }, { x: 10.2, y: 0.4, w: 1.4, h: 1.6, flow: "+x", label: "↓" }, { x: 14.2, y: 0.4, w: 1.4, h: 1.6, flow: "+x", label: "↓" }] },

  { name: "The Long Gallery Manor", sub: "16×9 · GALLERY ALONG THE FRONT",
    blurb: "A grand front taken up by a long gallery for walking and light, with the parlours, dining and kitchen ranked behind it.",
    W: 16, H: 9,
    walls: [{ x1: 0, y1: 6, x2: 16, y2: 6 }, { x1: 5, y1: 0, x2: 5, y2: 6 }, { x1: 8, y1: 0, x2: 8, y2: 6 }, { x1: 12, y1: 0, x2: 12, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 6, label: "Kitchen", dim: "5 × 6" }, { x: 5, y: 0, w: 3, h: 6, label: "Parlour", dim: "3 × 6" }, { x: 8, y: 0, w: 4, h: 6, label: "Dining", dim: "4 × 6" }, { x: 12, y: 0, w: 4, h: 6, label: "Study", dim: "4 × 6" }, { x: 0, y: 6, w: 16, h: 3, label: "Long Gallery", dim: "16 × 3" }],
    doors: [{ x: 7.4, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 2.4, y: 6, axis: "h", len: 1.3, dir: 1 }, { x: 6, y: 6, axis: "h", len: 1.2, dir: 1 }, { x: 9.4, y: 6, axis: "h", len: 1.3, dir: 1 }, { x: 13.4, y: 6, axis: "h", len: 1.3, dir: 1 }],
    windows: [{ x: 2, y: 9, axis: "h", len: 1.4 }, { x: 5, y: 9, axis: "h", len: 1.4 }, { x: 9, y: 9, axis: "h", len: 1.4 }, { x: 12, y: 9, axis: "h", len: 1.4 }, { x: 15, y: 9, axis: "h", len: 1.4 }, { x: 0, y: 3, axis: "v", len: 1.4 }, { x: 16, y: 3, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 10, y: 0, axis: "h", len: 1.4 }, { x: 14, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.5, y: 6.2, w: 2.2, h: 1.6, flow: "+x", label: "↓ cellar" }] },

  { name: "The Inn", sub: "16×9 · TAPROOM · SNUG · STABLE",
    blurb: "A roadside inn: a big taproom, a private snug, a kitchen, a stair to guest rooms and the cellar, and a stable at the gable end.",
    W: 16, H: 9,
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 9 }, { x1: 11, y1: 0, x2: 11, y2: 9 }, { x1: 13, y1: 0, x2: 13, y2: 9 }, { x1: 7, y1: 5, x2: 11, y2: 5 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 9, label: "Taproom", dim: "7 × 9" }, { x: 7, y: 0, w: 4, h: 5, label: "Kitchen", dim: "4 × 5" }, { x: 7, y: 5, w: 4, h: 4, label: "Snug", dim: "4 × 4" }, { x: 11, y: 0, w: 2, h: 9, label: "Hall", dim: "stairs" }, { x: 13, y: 0, w: 3, h: 9, label: "Stable", dim: "3 × 9" }],
    doors: [{ x: 3, y: 9, axis: "h", len: 1.4, dir: -1 }, { x: 7, y: 7, axis: "v", len: 1.2, dir: 1 }, { x: 7, y: 2.5, axis: "v", len: 1.2, dir: 1 }, { x: 11, y: 2.5, axis: "v", len: 1.2, dir: 1 }, { x: 11, y: 7, axis: "v", len: 1.2, dir: 1 }, { x: 13, y: 4.5, axis: "v", len: 1.2, dir: 1 }, { x: 14.5, y: 9, axis: "h", len: 1.4, dir: -1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 1.4 }, { x: 0, y: 6.5, axis: "v", len: 1.4 }, { x: 3, y: 9, axis: "h", len: 1.4 }, { x: 3, y: 0, axis: "h", len: 1.4 }, { x: 9, y: 0, axis: "h", len: 1.3 }, { x: 9, y: 9, axis: "h", len: 1.3 }, { x: 16, y: 3, axis: "v", len: 1.3 }, { x: 16, y: 6.5, axis: "v", len: 1.3 }],
    stairs: [{ x: 11.05, y: 0.4, w: 1.8, h: 2.4, flow: "+y", label: "↓ cellar · ↑ rooms" }] },

  // ---- TRADES & OUTBUILDINGS ------------------------------------------------
  { name: "The Smithy & Cottage", sub: "14×8 · FORGE + LIVING UNDER ONE ROOF",
    blurb: "A smith's place: an open forge hall with a wide door for the work, and a snug two-room cottage attached at the warm end.",
    W: 14, H: 8,
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 8 }, { x1: 7, y1: 4, x2: 14, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 8, label: "Smithy", dim: "forge · anvil" }, { x: 7, y: 0, w: 7, h: 4, label: "Kitchen", dim: "7 × 4" }, { x: 7, y: 4, w: 7, h: 4, label: "Living Room", dim: "7 × 4" }],
    doors: [{ x: 2, y: 8, axis: "h", len: 1.7, dir: -1 }, { x: 10, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 7, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 10, y: 4, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 5.5, axis: "v", len: 1.4 }, { x: 4, y: 0, axis: "h", len: 1.4 }, { x: 14, y: 2, axis: "v", len: 1.4 }, { x: 9, y: 0, axis: "h", len: 1.3 }, { x: 14, y: 6, axis: "v", len: 1.4 }, { x: 8.5, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 12, y: 4.4, w: 1.8, h: 1.6, flow: "+x", label: "↓ cellar" }] },

  { name: "The Watermill", sub: "14×9 · MILL · WHEEL PIT · GRANARY",
    blurb: "Set on the race: the mill room with the wheel and gears, a hall and stair in the middle, and a granary at the dry end for the sacks.",
    W: 14, H: 9,
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 9 }, { x1: 10, y1: 0, x2: 10, y2: 9 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 9, label: "Mill", dim: "wheel · gears" }, { x: 6, y: 0, w: 4, h: 9, label: "Hall", dim: "+ stairs" }, { x: 10, y: 0, w: 4, h: 9, label: "Granary", dim: "4 × 9" }],
    doors: [{ x: 7.4, y: 9, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 4.5, axis: "v", len: 1.3, dir: -1 }, { x: 10, y: 4.5, axis: "v", len: 1.3, dir: 1 }, { x: 2, y: 9, axis: "h", len: 1.5, dir: -1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 1.3 }, { x: 0, y: 6, axis: "v", len: 1.3 }, { x: 4, y: 0, axis: "h", len: 1.3 }, { x: 8, y: 0, axis: "h", len: 1.3 }, { x: 14, y: 3, axis: "v", len: 1.3 }, { x: 14, y: 6, axis: "v", len: 1.3 }, { x: 12, y: 9, axis: "h", len: 1.3 }],
    stairs: [{ x: 7.8, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ wheel pit" }] },

  { name: "The Oast House", sub: "12×8 · DRYING KILN + STOWAGE BARN",
    blurb: "A drying house: a tall round kiln with its cowl, attached to a stowage barn where the crop is spread, turned and stored.",
    outline: [[0, 0], [10, 0], [11.5, 1.5], [12.5, 4], [11.5, 6.5], [10, 8], [0, 8]],
    walls: [{ x1: 9, y1: 0, x2: 9, y2: 8 }],
    rooms: [{ x: 0, y: 0, w: 9, h: 8, label: "Stowage Barn", dim: "9 × 8" }, { x: 9, y: 0, w: 3.5, h: 8, label: "Kiln", dim: "drying floor" }],
    doors: [{ x: 3, y: 8, axis: "h", len: 1.6, dir: -1 }, { x: 9, y: 4, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.4 }, { x: 0, y: 5.5, axis: "v", len: 1.4 }, { x: 5, y: 0, axis: "h", len: 1.4 }, { x: 6, y: 8, axis: "h", len: 1.4 }],
    stairs: [{ x: 6.5, y: 0.4, w: 1.8, h: 2.0, flow: "+x", label: "↓ cellar" }] },

  { name: "The Boathouse", sub: "7×14 · BOAT SLIP · NET STORE · LOFT",
    blurb: "Built at the water's edge: a long bay for the boat opening to a slip, a net store and a snug living end with a stair to the sleeping loft.",
    W: 7, H: 14,
    walls: [{ x1: 0, y1: 4, x2: 7, y2: 4 }, { x1: 3.5, y1: 0, x2: 3.5, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 3.5, h: 4, label: "Net Store", dim: "" }, { x: 3.5, y: 0, w: 3.5, h: 4, label: "Living", dim: "loft over" }, { x: 0, y: 4, w: 7, h: 10, label: "Boat Bay", dim: "slip to water" }],
    doors: [{ x: 2.6, y: 14, axis: "h", len: 1.8, dir: -1 }, { x: 1.5, y: 4, axis: "h", len: 1.2, dir: -1 }, { x: 5, y: 4, axis: "h", len: 1.2, dir: -1 }, { x: 3.5, y: 2, axis: "v", len: 1.0, dir: -1 }],
    windows: [{ x: 7, y: 2, axis: "v", len: 1.3 }, { x: 5.2, y: 0, axis: "h", len: 1.2 }, { x: 0, y: 8, axis: "v", len: 1.4 }, { x: 7, y: 8, axis: "v", len: 1.4 }, { x: 0, y: 11, axis: "v", len: 1.4 }, { x: 7, y: 11, axis: "v", len: 1.4 }],
    stairs: [{ x: 5, y: 0.4, w: 1.6, h: 1.6, flow: "+x", label: "↑ loft" }] },

  { name: "The Stable Block", sub: "12×7 · FOUR STALLS · TACK + FEED",
    blurb: "For the horses: a row of stalls down one side off a grooming passage, with a tack room and a feed store, and a stair up to the hayloft.",
    W: 12, H: 7,
    walls: [{ x1: 8, y1: 0, x2: 8, y2: 7 }, { x1: 8, y1: 4, x2: 12, y2: 4 }, { x1: 2, y1: 0, x2: 2, y2: 3.5 }, { x1: 4, y1: 0, x2: 4, y2: 3.5 }, { x1: 6, y1: 0, x2: 6, y2: 3.5 }],
    rooms: [{ x: 0, y: 0, w: 8, h: 7, label: "Stalls", dim: "four stalls" }, { x: 8, y: 0, w: 4, h: 4, label: "Feed Store", dim: "" }, { x: 8, y: 4, w: 4, h: 3, label: "Tack Room", dim: "" }],
    doors: [{ x: 3, y: 7, axis: "h", len: 1.6, dir: -1 }, { x: 8, y: 5.5, axis: "v", len: 1.2, dir: 1 }, { x: 8, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 10, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 1, y: 0, axis: "h", len: 1.0 }, { x: 5, y: 0, axis: "h", len: 1.0 }, { x: 0, y: 3.5, axis: "v", len: 1.2 }, { x: 12, y: 2, axis: "v", len: 1.3 }, { x: 12, y: 5.5, axis: "v", len: 1.3 }, { x: 10, y: 7, axis: "h", len: 1.3 }],
    stairs: [{ x: 9.8, y: 0.4, w: 1.6, h: 1.6, flow: "+x", label: "↑ hayloft" }] },

  { name: "The Chapel", sub: "8×14 · NAVE · CHANCEL · PORCH",
    blurb: "A small place of worship: a long nave entered through a porch, a chancel for the altar at the far end, tall windows down both sides and a crypt stair.",
    outline: [[2, 0], [6, 0], [6, 3], [8, 3], [8, 12], [5, 12], [5, 13.5], [3, 13.5], [3, 12], [0, 12], [0, 3], [2, 3]],
    walls: [{ x1: 0, y1: 3, x2: 2, y2: 3 }, { x1: 6, y1: 3, x2: 8, y2: 3 }, { x1: 2, y1: 3, x2: 6, y2: 3 }],
    rooms: [{ x: 0, y: 3, w: 8, h: 9, label: "Nave", dim: "open" }, { x: 2, y: 0, w: 4, h: 3, label: "Chancel", dim: "altar" }],
    doors: [{ x: 3.6, y: 13.5, axis: "h", len: 1.3, dir: -1 }, { x: 3.6, y: 3, axis: "h", len: 1.4, dir: -1 }],
    windows: [{ x: 0, y: 5, axis: "v", len: 1.4 }, { x: 0, y: 8.5, axis: "v", len: 1.4 }, { x: 8, y: 5, axis: "v", len: 1.4 }, { x: 8, y: 8.5, axis: "v", len: 1.4 }, { x: 2, y: 1.2, axis: "v", len: 1.2 }, { x: 6, y: 1.2, axis: "v", len: 1.2 }, { x: 3.5, y: 0, axis: "h", len: 1.4 }],
    stairs: [{ x: 0.4, y: 3.4, w: 1.7, h: 1.8, flow: "+x", label: "↓ crypt" }] },

  { name: "The Cob Cottage", sub: "10×8 · ROUNDED CORNERS · COSY",
    blurb: "Hand-built in cob with soft rounded corners — a living room across the front, a kitchen and a snug stair-hall behind. No draughty angles.",
    outline: [[1.5, 0], [8.5, 0], [10, 1.5], [10, 6.5], [8.5, 8], [1.5, 8], [0, 6.5], [0, 1.5]],
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 6, y1: 4, x2: 10, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 8, label: "Living Room", dim: "6 × 8" }, { x: 6, y: 0, w: 4, h: 4, label: "Kitchen", dim: "4 × 4" }, { x: 6, y: 4, w: 4, h: 4, label: "Hall", dim: "stairs" }],
    doors: [{ x: 2.5, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 6, axis: "v", len: 1.2, dir: 1 }, { x: 6, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 8, y: 4, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 4, axis: "v", len: 1.4 }, { x: 4, y: 0, axis: "h", len: 1.4 }, { x: 4, y: 8, axis: "h", len: 1.4 }, { x: 10, y: 5.5, axis: "v", len: 1.4 }, { x: 8, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 6.4, y: 4.4, w: 2.2, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  // ---- VILLAGE TRADES & PUBLIC BUILDINGS -----------------------------------
  { name: "The Bakehouse", sub: "10×7 · OVEN · SHOP · STORE",
    blurb: "A baker's: a hot room with the wood oven and the kneading benches, a flour store, and a little shop with a counter onto the street.",
    W: 10, H: 7,
    walls: [{ x1: 7, y1: 0, x2: 7, y2: 7 }, { x1: 7, y1: 4, x2: 10, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 7, h: 7, label: "Bakehouse", dim: "oven · bench" }, { x: 7, y: 0, w: 3, h: 4, label: "Flour Store", dim: "" }, { x: 7, y: 4, w: 3, h: 3, label: "Shop", dim: "counter" }],
    doors: [{ x: 8.3, y: 7, axis: "h", len: 1.2, dir: -1 }, { x: 7, y: 5.5, axis: "v", len: 1.2, dir: 1 }, { x: 7, y: 2, axis: "v", len: 1.2, dir: 1 }, { x: 2, y: 7, axis: "h", len: 1.4, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.3 }, { x: 0, y: 5, axis: "v", len: 1.3 }, { x: 4, y: 0, axis: "h", len: 1.3 }, { x: 10, y: 5.5, axis: "v", len: 1.3 }, { x: 10, y: 2, axis: "v", len: 1.2 }],
    stairs: [{ x: 4.8, y: 0.4, w: 1.8, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  { name: "The Brewhouse", sub: "11×8 · MASH · BOIL · BEER CELLAR",
    blurb: "A brewery: a mash room, a boil room with the copper, a malt store, and a stair down to the cool beer cellar where the barrels rest.",
    W: 11, H: 8,
    walls: [{ x1: 5, y1: 0, x2: 5, y2: 8 }, { x1: 8, y1: 0, x2: 8, y2: 8 }, { x1: 8, y1: 4, x2: 11, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 5, h: 8, label: "Mash Room", dim: "5 × 8" }, { x: 5, y: 0, w: 3, h: 8, label: "Boil Room", dim: "copper" }, { x: 8, y: 0, w: 3, h: 4, label: "Malt Store", dim: "" }, { x: 8, y: 4, w: 3, h: 4, label: "Hall", dim: "+ stairs" }],
    doors: [{ x: 9.3, y: 8, axis: "h", len: 1.2, dir: -1 }, { x: 8, y: 5.5, axis: "v", len: 1.2, dir: -1 }, { x: 8, y: 2, axis: "v", len: 1.2, dir: -1 }, { x: 5, y: 4, axis: "v", len: 1.3, dir: -1 }, { x: 6, y: 8, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.3 }, { x: 0, y: 5.5, axis: "v", len: 1.3 }, { x: 2.5, y: 0, axis: "h", len: 1.3 }, { x: 6.5, y: 0, axis: "h", len: 1.2 }, { x: 11, y: 2, axis: "v", len: 1.2 }, { x: 11, y: 5.5, axis: "v", len: 1.3 }],
    stairs: [{ x: 9, y: 4.4, w: 1.8, h: 1.6, flow: "+x", label: "↓ beer cellar" }] },

  { name: "The Pottery", sub: "12×8 · WHEELS · DRYING · ROUND KILN",
    blurb: "A potter's: a light workshop for the wheels, a drying and store room, and a tall round kiln at the end for the firing.",
    outline: [[0, 0], [9, 0], [10.5, 1.5], [11.5, 4], [10.5, 6.5], [9, 8], [0, 8]],
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 9, y1: 0, x2: 9, y2: 8 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 8, label: "Workshop", dim: "wheels" }, { x: 6, y: 0, w: 3, h: 8, label: "Drying", dim: "& store" }, { x: 9, y: 0, w: 3.5, h: 8, label: "Kiln", dim: "firing" }],
    doors: [{ x: 2.5, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 4, axis: "v", len: 1.3, dir: 1 }, { x: 9, y: 4, axis: "v", len: 1.3, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 5.5, axis: "v", len: 1.4 }, { x: 3, y: 0, axis: "h", len: 1.4 }, { x: 3, y: 8, axis: "h", len: 1.4 }, { x: 7.5, y: 0, axis: "h", len: 1.2 }],
    stairs: [{ x: 4, y: 0.4, w: 1.8, h: 1.8, flow: "+x", label: "↓ clay store" }] },

  { name: "The Bath House", sub: "14×8 · COLD · WARM · HOT · FURNACE",
    blurb: "A Roman sequence: undress, then cold, warm and hot rooms in a row over a hypocaust, with the furnace stoked from the far end.",
    W: 14, H: 8,
    walls: [{ x1: 3, y1: 0, x2: 3, y2: 8 }, { x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 9, y1: 0, x2: 9, y2: 8 }, { x1: 12, y1: 0, x2: 12, y2: 8 }],
    rooms: [{ x: 0, y: 0, w: 3, h: 8, label: "Changing", dim: "" }, { x: 3, y: 0, w: 3, h: 8, label: "Cold Room", dim: "plunge" }, { x: 6, y: 0, w: 3, h: 8, label: "Warm Room", dim: "" }, { x: 9, y: 0, w: 3, h: 8, label: "Hot Room", dim: "bath" }, { x: 12, y: 0, w: 2, h: 8, label: "Furnace", dim: "" }],
    doors: [{ x: 1.3, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 3, y: 4, axis: "v", len: 1.2, dir: 1 }, { x: 6, y: 4, axis: "v", len: 1.2, dir: 1 }, { x: 9, y: 4, axis: "v", len: 1.2, dir: 1 }, { x: 12, y: 2, axis: "v", len: 1.0, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 1.3 }, { x: 1.5, y: 0, axis: "h", len: 1.2 }, { x: 4.5, y: 0, axis: "h", len: 1.0 }, { x: 7.5, y: 8, axis: "h", len: 1.0 }, { x: 14, y: 5.5, axis: "v", len: 1.0 }],
    stairs: [{ x: 0.5, y: 0.4, w: 1.6, h: 1.6, flow: "+x", label: "↓ hypocaust" }] },

  { name: "The Schoolhouse", sub: "12×9 · SCHOOLROOM · PORCH · MASTER",
    blurb: "One big schoolroom lit from both sides, entered through a porch, with a cloakroom and the master's own room off the end.",
    outline: [[0, 0], [12, 0], [12, 9], [7, 9], [7, 10.5], [5, 10.5], [5, 9], [0, 9]],
    walls: [{ x1: 8, y1: 0, x2: 8, y2: 9 }, { x1: 8, y1: 4, x2: 12, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 8, h: 9, label: "Schoolroom", dim: "8 × 9" }, { x: 8, y: 0, w: 4, h: 4, label: "Cloakroom", dim: "" }, { x: 8, y: 4, w: 4, h: 5, label: "Master's Room", dim: "" }],
    doors: [{ x: 5.8, y: 10.5, axis: "h", len: 1.3, dir: -1 }, { x: 8, y: 6, axis: "v", len: 1.3, dir: 1 }, { x: 8, y: 2, axis: "v", len: 1.2, dir: 1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.4 }, { x: 0, y: 4.5, axis: "v", len: 1.4 }, { x: 0, y: 7, axis: "v", len: 1.4 }, { x: 2.5, y: 0, axis: "h", len: 1.4 }, { x: 5.5, y: 0, axis: "h", len: 1.4 }, { x: 12, y: 2, axis: "v", len: 1.3 }, { x: 12, y: 6.5, axis: "v", len: 1.4 }, { x: 9.5, y: 9, axis: "h", len: 1.3 }],
    stairs: [{ x: 0.4, y: 0.4, w: 1.8, h: 1.8, flow: "+x", label: "↓ cellar" }] },

  { name: "The Market Hall", sub: "12×9 · OPEN BELOW · GUILDROOM OVER",
    blurb: "Open arcaded ground for the market stalls, on stone pillars, with a corner stair up to the closed guildroom above.",
    W: 12, H: 9,
    walls: [{ x1: 3, y1: 3, x2: 3, y2: 3.6 }, { x1: 6, y1: 3, x2: 6, y2: 3.6 }, { x1: 9, y1: 3, x2: 9, y2: 3.6 }, { x1: 3, y1: 6, x2: 3, y2: 6.6 }, { x1: 6, y1: 6, x2: 6, y2: 6.6 }, { x1: 9, y1: 6, x2: 9, y2: 6.6 }],
    rooms: [{ x: 0, y: 0, w: 12, h: 9, label: "Market Floor", dim: "open · pillared" }],
    doors: [{ x: 5, y: 9, axis: "h", len: 2.2, dir: -1 }, { x: 0, y: 4, axis: "v", len: 2.0, dir: 1 }, { x: 12, y: 4, axis: "v", len: 2.0, dir: -1 }, { x: 5, y: 0, axis: "h", len: 2.2, dir: 1 }],
    windows: [],
    stairs: [{ x: 0.4, y: 0.4, w: 2.0, h: 2.0, flow: "+x", label: "↑ guildroom" }] },

  { name: "The Shop House", sub: "8×10 · SHOPFRONT · LIVING BEHIND",
    blurb: "A trader's home: a shop with a wide window onto the street, a parlour and kitchen behind, and a stair to the living rooms and cellar.",
    W: 8, H: 10,
    walls: [{ x1: 0, y1: 6, x2: 8, y2: 6 }, { x1: 4, y1: 0, x2: 4, y2: 6 }],
    rooms: [{ x: 0, y: 0, w: 4, h: 6, label: "Parlour", dim: "4 × 6" }, { x: 4, y: 0, w: 4, h: 6, label: "Kitchen", dim: "4 × 6" }, { x: 0, y: 6, w: 8, h: 4, label: "Shop", dim: "counter" }],
    doors: [{ x: 1.5, y: 10, axis: "h", len: 1.3, dir: -1 }, { x: 1.5, y: 6, axis: "h", len: 1.2, dir: 1 }, { x: 6, y: 6, axis: "h", len: 1.2, dir: 1 }, { x: 4, y: 3, axis: "v", len: 1.2, dir: -1 }],
    windows: [{ x: 5, y: 10, axis: "h", len: 1.8 }, { x: 0, y: 8, axis: "v", len: 1.3 }, { x: 8, y: 8, axis: "v", len: 1.3 }, { x: 0, y: 2.5, axis: "v", len: 1.3 }, { x: 8, y: 2.5, axis: "v", len: 1.3 }, { x: 2, y: 0, axis: "h", len: 1.3 }, { x: 6, y: 0, axis: "h", len: 1.3 }],
    stairs: [{ x: 6.0, y: 6.2, w: 1.8, h: 1.6, flow: "+x", label: "↑ living · ↓ cellar" }] },

  // ---- BARNS & STORES -------------------------------------------------------
  { name: "The Tithe Barn", sub: "16×10 · AISLED · CART PORCHES",
    blurb: "A great aisled barn: a tall central nave between two rows of posts, with cart porches front and back to drive a wagon straight through.",
    W: 16, H: 10,
    walls: [{ x1: 4, y1: 1.5, x2: 4, y2: 2.5 }, { x1: 4, y1: 4.5, x2: 4, y2: 5.5 }, { x1: 4, y1: 7.5, x2: 4, y2: 8.5 }, { x1: 12, y1: 1.5, x2: 12, y2: 2.5 }, { x1: 12, y1: 4.5, x2: 12, y2: 5.5 }, { x1: 12, y1: 7.5, x2: 12, y2: 8.5 }],
    rooms: [{ x: 0, y: 0, w: 16, h: 10, label: "Threshing Barn", dim: "aisled" }],
    doors: [{ x: 6.9, y: 10, axis: "h", len: 2.2, dir: -1 }, { x: 6.9, y: 0, axis: "h", len: 2.2, dir: 1 }],
    windows: [{ x: 0, y: 2.5, axis: "v", len: 0.8 }, { x: 0, y: 5, axis: "v", len: 0.8 }, { x: 0, y: 7.5, axis: "v", len: 0.8 }, { x: 16, y: 2.5, axis: "v", len: 0.8 }, { x: 16, y: 5, axis: "v", len: 0.8 }, { x: 16, y: 7.5, axis: "v", len: 0.8 }],
    stairs: [{ x: 0.4, y: 0.4, w: 1.8, h: 1.8, flow: "+x", label: "↓ undercroft" }] },

  { name: "The Dovecote", sub: "7×7 · NEST TIERS · CENTRAL LADDER",
    blurb: "A pigeon house: a small square tower lined inside with nest boxes, a central revolving ladder to reach them, and flight holes high in the walls.",
    W: 7, H: 7,
    walls: [],
    rooms: [{ x: 0, y: 0, w: 7, h: 7, label: "Dovecote", dim: "nest tiers" }],
    doors: [{ x: 3, y: 7, axis: "h", len: 1.0, dir: -1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 0.6 }, { x: 7, y: 3, axis: "v", len: 0.6 }, { x: 3, y: 0, axis: "h", len: 0.6 }],
    stairs: [{ x: 2.8, y: 2.8, w: 1.4, h: 1.4, flow: "+x", label: "↑ tiers" }] },

  { name: "The Windmill", sub: "9Ø · ROUND TOWER · SACK HOIST",
    blurb: "A round tower mill: the millstones on the round stone floor, a sack hoist up the centre and a stair winding to the cap and sails above.",
    outline: circle(4.5, 4.5, 4.2, 22),
    walls: [],
    rooms: [{ x: 0.3, y: 0.3, w: 8.4, h: 8.4, label: "Mill Floor", dim: "stones · hoist" }],
    doors: [{ x: 3.8, y: 8.7, axis: "h", len: 1.3, dir: -1 }],
    windows: [{ x: 0.3, y: 4, axis: "v", len: 1.0 }, { x: 8.7, y: 4, axis: "v", len: 1.0 }, { x: 4, y: 0.3, axis: "h", len: 1.0 }],
    stairs: [{ x: 3.5, y: 3.5, w: 2.0, h: 1.8, flow: "+x", label: "↑ cap" }] },

  { name: "The Granary", sub: "8×6 · RAISED ON STADDLES · DRY STORE",
    blurb: "A grain store kept dry and rat-proof on staddle stones, reached by an external stair — one snug, sealed room for the year's seed and flour.",
    W: 8, H: 6,
    walls: [],
    rooms: [{ x: 0, y: 0, w: 8, h: 6, label: "Granary", dim: "sealed store" }],
    doors: [{ x: 3.4, y: 6, axis: "h", len: 1.2, dir: -1 }],
    windows: [{ x: 0, y: 3, axis: "v", len: 0.8 }, { x: 8, y: 3, axis: "v", len: 0.8 }, { x: 2, y: 0, axis: "h", len: 0.8 }, { x: 6, y: 0, axis: "h", len: 0.8 }],
    stairs: [{ x: 4.4, y: 6.2, w: 2.0, h: 1.4, flow: "-y", label: "↑ external stair" }] },

  { name: "The Counting House", sub: "10×8 · OFFICE · STRONGROOM · CLERKS",
    blurb: "A merchant's office: a counting room, a clerks' room, a thick-walled strongroom for the strongbox, and a stair to the living rooms above.",
    W: 10, H: 8,
    walls: [{ x1: 6, y1: 0, x2: 6, y2: 8 }, { x1: 0, y1: 4, x2: 6, y2: 4 }, { x1: 6, y1: 4, x2: 10, y2: 4 }],
    rooms: [{ x: 0, y: 0, w: 6, h: 4, label: "Clerks' Room", dim: "" }, { x: 0, y: 4, w: 6, h: 4, label: "Counting Room", dim: "" }, { x: 6, y: 0, w: 4, h: 4, label: "Strongroom", dim: "vault" }, { x: 6, y: 4, w: 4, h: 4, label: "Hall", dim: "+ stairs" }],
    doors: [{ x: 8, y: 8, axis: "h", len: 1.3, dir: -1 }, { x: 6, y: 6, axis: "v", len: 1.3, dir: -1 }, { x: 2, y: 4, axis: "h", len: 1.3, dir: 1 }, { x: 6, y: 2, axis: "v", len: 1.0, dir: -1 }],
    windows: [{ x: 0, y: 2, axis: "v", len: 1.3 }, { x: 0, y: 6, axis: "v", len: 1.3 }, { x: 2.5, y: 8, axis: "h", len: 1.4 }, { x: 3, y: 0, axis: "h", len: 1.3 }, { x: 10, y: 6, axis: "v", len: 1.3 }],
    stairs: [{ x: 8, y: 4.4, w: 1.8, h: 1.6, flow: "+x", label: "↑ living" }] },
];

const byName = Object.fromEntries(LAYOUTS.map((L) => [L.name, L]));
const CATS = [
  { id: "cottages", title: "Cottages & small homes", intro: "Starter homes and snug cottages — a night's roof, a croft, a weaver's place.",
    names: ["The One-Room Cabin", "The Crofter's Cottage", "The Square Cottage", "The Porch Cottage", "The Cob Cottage", "The Three-Room Cottage", "The Shotgun", "The Terrace House", "The Weaver's Cottage", "The Saltbox", "The Pinwheel"] },
  { id: "family", title: "Family homes", intro: "Room for a household — halls, wings and double-fronted plans to live in for good.",
    names: ["The L-Cottage", "The Centre-Hall", "The Cross-Gable", "The Side-Wing Farmhouse", "The Long House", "The Dogtrot", "The Garrison", "The Villa", "The Bungalow", "The L-Bungalow", "The Hall House", "The Hall & Solar", "The Wealden Hall", "The Back-to-Back"] },
  { id: "grand", title: "Grand houses & manors", intro: "When stone is cheap and the base is set: manors, courtyards and great halls.",
    names: ["The Manor", "The E-Plan Manor", "The Long Gallery Manor", "The Quadrangle", "The Atrium House", "The Courtyard", "The H-Plan Hall", "The Cross-Plan", "The Apsidal Hall"] },
  { id: "round", title: "Round, angular & towers", intro: "Geometry for show and defence — circles, an octagon, a wheel-house and stone towers.",
    names: ["The Octagon", "The Hexagon", "The Roundhouse", "The Wheelhouse", "The Z-Plan Tower", "The Tower House", "The Windmill"] },
  { id: "farm", title: "Farmsteads & homestead buildings", intro: "The working yard: byres and barns, stables, kilns, a watermill and stores.",
    names: ["The Courtyard Farmstead", "The Longhouse & Byre", "The Bastle House", "The Stable Block", "The Oast House", "The Watermill", "The Granary", "The Dovecote", "The Tithe Barn", "The Boathouse"] },
  { id: "village", title: "Village trades & public buildings", intro: "A whole village's worth — an inn, a smithy, a chapel, a school and the trades.",
    names: ["The Gatehouse", "The Almshouse Row", "The Inn", "The Smithy & Cottage", "The Chapel", "The Bakehouse", "The Brewhouse", "The Pottery", "The Bath House", "The Schoolhouse", "The Market Hall", "The Shop House", "The Counting House"] },
];
const placed = new Set(CATS.flatMap((c) => c.names));
for (const L of LAYOUTS) if (!placed.has(L.name)) console.warn("UNGROUPED:", L.name);

const gallery = CATS.map((cat) => {
  const cards = cat.names.map((n) => byName[n]).filter(Boolean)
    .map((L) => `<figure class="planfig"><div class="plan">${drawPlan(L)}</div><figcaption>${esc(L.blurb)}</figcaption></figure>`).join("\n");
  return `      <h3 class="cat-h" id="${cat.id}">${esc(cat.title)} <span class="cat-n">${cat.names.length}</span></h3>
      <p class="cat-intro">${esc(cat.intro)}</p>
      <div class="layouts">
${cards}
      </div>`;
}).join("\n\n");

/* =============================================================== THE PAGE == */
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>House Floor Plans — living room, kitchen, bedrooms &amp; cellar (Vintage Story v1.22.3)</title>
<meta name="description" content="Clean top-down architectural floor plans for a Vintage Story house: a cellar cold store, a ground floor with the entrance into the living room and the kitchen to the right, and a first floor with two bedrooms. Labelled rooms, doors, windows, stairs and furniture." />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/guide.css" />
<link rel="stylesheet" href="assets/css/vs.css" />
<style>
  .layouts { display: grid; grid-template-columns: 1fr; gap: 26px; margin: 20px 0 8px; }
  @media (min-width: 820px) { .layouts { grid-template-columns: 1fr 1fr; } }
  .planfig { margin: 0; }
  .planfig .plan { background: #efe4c9; border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; }
  .planfig .plan svg { width: 100%; height: auto; display: block; }
  .planfig figcaption { font-size: .82rem; color: var(--ink-dim); line-height: 1.5; margin: 9px 4px 0; }
  .cat-h { font-family: var(--f-display); font-size: 1.4rem; color: var(--accent); margin: 40px 0 4px; padding-bottom: 8px; border-bottom: 1px solid var(--line); display: flex; align-items: baseline; gap: 11px; }
  .cat-h .cat-n { font-family: var(--f-mono); font-size: .8rem; color: var(--ink-faint); }
  .cat-intro { color: var(--ink-dim); font-size: .9rem; margin: 0 0 4px; }
  .legend-key { display: flex; flex-wrap: wrap; gap: 14px 22px; font-family: var(--f-mono); font-size: .72rem; color: var(--ink-dim); margin: 10px 0 0; }
  .legend-key span { display: inline-flex; align-items: center; gap: 7px; }
  .legend-key i { width: 22px; height: 0; border-top: 3px solid #3a2b18; display: inline-block; }
  .legend-key i.win { border-top: 3px solid #6f8c99; }
</style>
</head>
<body>

<button class="menu-toggle" aria-label="Toggle navigation" data-menu>☰</button>

<div class="shell">
  <aside class="sidebar" data-sidebar>
    <div class="brand">
      <span class="sigil" aria-hidden="true">📐</span>
      <span class="wordmark">House<br>Layouts<small>${LAYOUTS.length} FLOOR PLANS</small></span>
    </div>
    <a href="vintage-story.html" class="home-link">← The Drifter's Almanac</a>
    <nav class="nav" data-nav>
      <a href="#cottages"><span class="ix">01</span> Cottages</a>
      <a href="#family"><span class="ix">02</span> Family homes</a>
      <a href="#grand"><span class="ix">03</span> Grand &amp; manors</a>
      <a href="#round"><span class="ix">04</span> Round &amp; towers</a>
      <a href="#farm"><span class="ix">05</span> Farmsteads</a>
      <a href="#village"><span class="ix">06</span> Village &amp; trades</a>
      <a href="#notes"><span class="ix">07</span> Reading a plan</a>
    </nav>
    <p style="margin-top:28px;font-family:var(--f-mono);font-size:0.58rem;letter-spacing:0.06em;color:var(--ink-faint);line-height:1.7">
      ${LAYOUTS.length} top-down house plans —<br>shapes, rooms, doors, windows<br>and stairs. For built examples see
      <a href="vs-builds.html" style="color:var(--accent)">The Pattern Book</a>. v<b style="color:var(--accent)">1.22.3</b>.
    </p>
  </aside>

  <main class="content">

    <header class="hero" id="top">
      <p class="kicker">Vintage Story · v1.22.3 · ${LAYOUTS.length} floor plans</p>
      <h1>House Layouts</h1>
      <p class="lede">A gallery of <strong>${LAYOUTS.length} ground-floor plans</strong> to copy or remix — from a night-one cabin to a courtyard manor. Every shape is here: cottages and longhouses, L-, T- and E-wings, a U-shaped courtyard, a cross-plan, an H-range, an atrium, a round-house, a wheel-house and an eight-sided octagon. And it's not just homes — a smithy, a watermill, an oast, a stable, an inn and a chapel too. Each is drawn top-down with labelled rooms, doors, windows and the cellar stair, so you can see the whole building before you place a block. Pick one, scale it to your spot, and build.</p>
      <div class="badges">
        <span class="badge accent">${LAYOUTS.length} layouts</span>
        <span class="badge">Cabin → manor + trades</span>
        <span class="badge">round · octagon · L · T · U · cross · H</span>
        <span class="badge accent">📐 Rooms · doors · windows · stairs</span>
      </div>
      <p class="legend-key">
        <span><i></i> wall</span>
        <span><i class="win"></i> window</span>
        <span>⌐ door (with swing)</span>
        <span>▦ stairs (↓ to cellar)</span>
      </p>
    </header>

    <section class="doc" id="gallery">
      <p class="sec-index">01 — ${LAYOUTS.length} plans in ${CATS.length} groups</p>
      <h2>The layouts</h2>
      <p class="lead">Grouped by kind, smallest first. Sizes are in blocks; the front door is on the lower edge of each plan and the staircase runs down to a cold cellar. Mix and match — borrow a wing from one, a porch from another.</p>
${gallery}
    </section>

    <section class="doc" id="notes">
      <p class="sec-index">02 — Reading &amp; building</p>
      <h2>Reading a plan</h2>
      <ul>
        <li><strong>Walls</strong> are the thick lines; <strong>windows</strong> are the thin pale breaks in them; <strong>doors</strong> are the gaps with a quarter-circle showing the swing.</li>
        <li><strong>The staircase</strong> (the ruled box with an arrow) drops to a cold cellar — dig that out underground, wall it in stone, and keep it sealed with no skylight so food lasts.</li>
        <li><strong>Scale it to your site:</strong> the block sizes are a starting point — stretch a room a block or two to suit your ground and materials.</li>
        <li><strong>Vintage Story:</strong> set the kitchen fire on stone, a block clear of timber; a central hearth doubles as winter warmth; keep food in the cellar and tools/blocks in the ground-floor stores.</li>
      </ul>
    </section>

  </main>
</div>

<footer class="site">
  <div class="cols">
    <div>
      <strong style="font-family:var(--f-display);color:var(--accent)">House Floor Plans</strong><br>
      Part of <a href="vintage-story.html">The Drifter's Almanac</a>, an unofficial fan-made guide to Vintage Story (v1.22.3).<br>
      Vintage Story is by <a href="https://www.vintagestory.at/">Anego Studios</a>. This guide is not affiliated with them.
    </div>
    <div style="font-family:var(--f-mono);font-size:0.74rem;line-height:1.9">
      Companion pages:<br>
      · <a href="vs-structures.html">The Homestead</a> (cellars &amp; workshops)<br>
      · <a href="vs-builds.html">The Pattern Book</a> (more builds)
    </div>
  </div>
  <p style="margin-top:24px;font-family:var(--f-mono);font-size:0.62rem;color:var(--ink-faint)">Plans are stylised to show layout and proportion; sizes and recipes are config-/version-dependent. Your in-game Handbook is the final word.</p>
</footer>

<script type="module">
  import "./assets/js/vs-guide.js";
</script>
</body>
</html>
`;

writeFileSync(join(root, "vs-house-schematic.html"), html);
console.log(`wrote vs-house-schematic.html — ${LAYOUTS.length} layout plans`);
