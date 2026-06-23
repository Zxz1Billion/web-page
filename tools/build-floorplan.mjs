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

/* ---- one plan renderer -------------------------------------------------- */
function drawPlan(spec) {
  const { W, H, name, sub, tint = "#e7d9b6", rooms = [], walls = [], doors = [],
    windows = [], stairs = [], furniture = [] } = spec;
  const X = (b) => f(M + b * S), Y = (b) => f(TH + M + b * S);
  const vbW = W * S + 2 * M, vbH = H * S + 2 * M + TH;
  let s = "";

  // paper + frame
  s += `<rect x="0" y="0" width="${f(vbW)}" height="${f(vbH)}" fill="${PAPER}"/>`;
  s += `<rect x="6" y="6" width="${f(vbW - 12)}" height="${f(vbH - 12)}" fill="none" stroke="${INK}" stroke-width="1" opacity=".4"/>`;

  // title band
  s += `<text x="${f(vbW / 2)}" y="34" text-anchor="middle" font-family="Cinzel, serif" font-size="22" fill="${INK}" letter-spacing="1.5">${esc(name)}</text>`;
  s += `<text x="${f(vbW / 2)}" y="52" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="10.5" fill="${INK}" opacity=".7" letter-spacing="1">${esc(sub)}</text>`;

  // footprint floor tint + faint block grid
  s += `<rect x="${X(0)}" y="${Y(0)}" width="${f(W * S)}" height="${f(H * S)}" fill="${tint}" opacity=".5"/>`;
  for (let i = 1; i < W; i++) s += `<line x1="${X(i)}" y1="${Y(0)}" x2="${X(i)}" y2="${Y(H)}" stroke="${INK}" stroke-width=".5" opacity=".08"/>`;
  for (let i = 1; i < H; i++) s += `<line x1="${X(0)}" y1="${Y(i)}" x2="${X(W)}" y2="${Y(i)}" stroke="${INK}" stroke-width=".5" opacity=".08"/>`;

  // room tints + labels
  for (const r of rooms) {
    if (r.fill) s += `<rect x="${X(r.x)}" y="${Y(r.y)}" width="${f(r.w * S)}" height="${f(r.h * S)}" fill="${r.fill}" opacity=".45"/>`;
  }

  // furniture (under the walls so wall lines sit cleanly on top)
  for (const fu of furniture) s += furn(fu, X, Y);

  // exterior wall + interior partitions
  s += `<rect x="${X(0)}" y="${Y(0)}" width="${f(W * S)}" height="${f(H * S)}" fill="none" stroke="${W_STROKE}" stroke-width="${T}" stroke-linejoin="miter"/>`;
  for (const w of walls) s += `<line x1="${X(w.x1)}" y1="${Y(w.y1)}" x2="${X(w.x2)}" y2="${Y(w.y2)}" stroke="${W_STROKE}" stroke-width="${T - 2}" stroke-linecap="square"/>`;

  // erase + draw openings
  for (const d of doors) s += doorSym(d, X, Y);
  for (const w of windows) s += winSym(w, X, Y);

  // stairs
  for (const st of stairs) s += stairSym(st, X, Y);

  // room labels (on top)
  for (const r of rooms) {
    if (!r.label) continue;
    const cx = X(r.x + r.w / 2), cy = Y(r.y + r.h / 2);
    s += `<text x="${cx}" y="${f(cy - 2)}" text-anchor="middle" font-family="Cinzel, serif" font-size="15" fill="${INK}" letter-spacing=".5">${esc(r.label)}</text>`;
    if (r.dim) s += `<text x="${cx}" y="${f(cy + 15)}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="9.5" fill="${INK}" opacity=".6">${esc(r.dim)}</text>`;
  }

  // overall dimension ticks
  s += dim(0, W, "h", X, Y, W, H);
  s += dim(0, H, "v", X, Y, W, H);

  // north arrow
  const nx = f(vbW - 34), ny = f(TH + 24);
  s += `<g opacity=".75"><circle cx="${nx}" cy="${ny}" r="14" fill="none" stroke="${INK}" stroke-width="1"/><path d="M${nx},${ny - 11} L${nx + 4},${ny + 2} L${nx},${ny - 1} L${nx - 4},${ny + 2} Z" fill="${INK}"/><text x="${nx}" y="${ny + 24}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="9" fill="${INK}">N</text></g>`;

  return `<svg viewBox="0 0 ${f(vbW)} ${f(vbH)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${name} floor plan">${s}</svg>`;
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
  const st = `stroke="${INK}" stroke-width="1.3" fill="#00000010"`;
  const fillSoft = `fill="${INK}" opacity=".10"`;
  const r = (x, y, w, h, rx = 3, extra = st) => `<rect x="${X(x)}" y="${Y(y)}" width="${f(w * S)}" height="${f(h * S)}" rx="${rx}" ${extra}/>`;
  const lbl = (x, y, t) => `<text x="${X(x)}" y="${Y(y)}" text-anchor="middle" font-family="'JetBrains Mono',monospace" font-size="8" fill="${INK}" opacity=".7">${esc(t)}</text>`;
  switch (o.t) {
    case "bed": { // {x,y,w,h}
      const w = o.w || 2, h = o.h || 2.6;
      return r(o.x, o.y, w, h, 4) + r(o.x + 0.12, o.y + 0.12, w - 0.24, 0.7, 3) /*pillow*/ +
        `<line x1="${X(o.x + 0.1)}" y1="${Y(o.y + 1)}" x2="${X(o.x + w - 0.1)}" y2="${Y(o.y + 1)}" stroke="${INK}" stroke-width="1" opacity=".4"/>` + lbl(o.x + w / 2, o.y + h / 2 + 0.2, "bed");
    }
    case "stove":
      return r(o.x, o.y, 1, 1, 2) + `<circle cx="${X(o.x + 0.5)}" cy="${Y(o.y + 0.5)}" r="${f(0.3 * S)}" fill="none" stroke="${INK}" stroke-width="1.2"/>` + lbl(o.x + 0.5, o.y + 1.32, "stove");
    case "counter": // {x,y,w,h}
      return r(o.x, o.y, o.w, o.h, 2, fillSoft + ` stroke="${INK}" stroke-width="1.2"`);
    case "table": { // {x,y,w,h}
      const w = o.w || 2, h = o.h || 1.4;
      let g = r(o.x + 0.3, o.y + 0.3, w - 0.6, h - 0.6, 3);
      for (const [dx, dy] of [[0, 0.45], [w - 0.5, 0.45], [0.45, 0], [0.45, h - 0.5]]) g += r(o.x + dx, o.y + dy, 0.5, 0.5, 2);
      return g + lbl(o.x + w / 2, o.y + h / 2 + 0.1, "table");
    }
    case "sofa": { const w = o.w || 2.4, h = o.h || 0.95; return r(o.x, o.y, w, h, 4) + r(o.x, o.y, w, 0.35, 3) + lbl(o.x + w / 2, o.y + h + 0.28, "seating"); }
    case "wardrobe": return r(o.x, o.y, o.w || 2, o.h || 0.8, 2) + `<line x1="${X(o.x + (o.w || 2) / 2)}" y1="${Y(o.y)}" x2="${X(o.x + (o.w || 2) / 2)}" y2="${Y(o.y + (o.h || 0.8))}" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + (o.w || 2) / 2, o.y + (o.h || 0.8) + 0.28, "wardrobe");
    case "hearth":
      return r(o.x, o.y, o.w || 2, 0.6, 1, fillSoft + ` stroke="${INK}" stroke-width="1.3"`) + `<path d="M${X(o.x + 0.4)},${Y(o.y + 0.55)} Q${X(o.x + (o.w || 2) / 2)},${Y(o.y - 0.3)} ${X(o.x + (o.w || 2) - 0.4)},${Y(o.y + 0.55)}" fill="none" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + (o.w || 2) / 2, o.y + 0.95, "hearth");
    case "chest": return r(o.x, o.y, 1, 0.7, 2) + `<line x1="${X(o.x)}" y1="${Y(o.y + 0.35)}" x2="${X(o.x + 1)}" y2="${Y(o.y + 0.35)}" stroke="${INK}" stroke-width="1" opacity=".5"/>` + lbl(o.x + 0.5, o.y + 1, "chest");
    case "barrel": return `<circle cx="${X(o.x + 0.4)}" cy="${Y(o.y + 0.4)}" r="${f(0.38 * S)}" ${st}/>`;
    case "shelf": return r(o.x, o.y, o.w, o.h, 1, fillSoft + ` stroke="${INK}" stroke-width="1"`) + lbl(o.x + o.w / 2, o.y + o.h + 0.26, o.label || "shelving");
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
  W: 12, H: 9, name: "Ground Floor", sub: "ENTRANCE · LIVING ROOM · KITCHEN", tint: "#e7d9b6",
  walls: [{ x1: 7, y1: 0, x2: 7, y2: 9 }, { x1: 7, y1: 5, x2: 12, y2: 5 }],
  rooms: [
    { x: 0, y: 0, w: 7, h: 9, label: "Living Room", dim: "7 × 9", fill: "#ecdfbf" },
    { x: 7, y: 0, w: 5, h: 5, label: "Kitchen", dim: "5 × 5", fill: "#e5d6b2" },
    { x: 7, y: 5, w: 5, h: 4, label: "Hall & Stairs", dim: "5 × 4", fill: "#dfd0aa" },
  ],
  doors: [
    { x: 2, y: 9, axis: "h", len: 1.6, dir: -1, hinge: 0 },     // front entrance → living room
    { x: 7, y: 1.6, axis: "v", len: 1.4, dir: -1, hinge: 0 },   // living ↔ kitchen
    { x: 7, y: 6.0, axis: "v", len: 1.4, dir: -1, hinge: 1 },   // living ↔ hall
    { x: 9.8, y: 9, axis: "h", len: 1.2, dir: -1, hinge: 0 },   // back door from hall
  ],
  windows: [
    { x: 0, y: 2.0, axis: "v", len: 1.2 }, { x: 0, y: 5.6, axis: "v", len: 1.2 }, // living west
    { x: 4.3, y: 9, axis: "h", len: 1.3 },                                        // living front
    { x: 8.5, y: 0, axis: "h", len: 1.3 },                                        // kitchen back
    { x: 12, y: 1.6, axis: "v", len: 1.3 },                                       // kitchen east
    { x: 12, y: 6.2, axis: "v", len: 1.2 },                                       // hall east
  ],
  stairs: [{ x: 8, y: 6, w: 3.4, h: 1.6, flow: "+x", label: "UP · cellar below" }],
  furniture: [
    { t: "hearth", x: 2.5, y: 0.1, w: 2 },
    { t: "sofa", x: 0.35, y: 4, w: 2.4, h: 0.95 },
    { t: "table", x: 3.2, y: 4.2, w: 2.2, h: 1.5 },
    { t: "chest", x: 0.4, y: 7.6 }, { t: "chest", x: 1.6, y: 7.6 },
    { t: "stove", x: 7.4, y: 0.3 },
    { t: "counter", x: 8.6, y: 0.3, w: 3.1, h: 0.8 },
    { t: "counter", x: 11.0, y: 1.3, w: 0.8, h: 3.0 },
    { t: "table", x: 8.3, y: 2.6, w: 1.9, h: 1.5 },
  ],
});

const first = drawPlan({
  W: 12, H: 9, name: "First Floor", sub: "TWO BEDROOMS · LANDING", tint: "#e3d9c0",
  walls: [{ x1: 7, y1: 0, x2: 7, y2: 9 }, { x1: 7, y1: 5, x2: 12, y2: 5 }],
  rooms: [
    { x: 0, y: 0, w: 7, h: 9, label: "Bedroom 1", dim: "7 × 9", fill: "#e8ddc4" },
    { x: 7, y: 0, w: 5, h: 5, label: "Bedroom 2", dim: "5 × 5", fill: "#e2d6bc" },
    { x: 7, y: 5, w: 5, h: 4, label: "Landing", dim: "5 × 4", fill: "#dccfaf" },
  ],
  doors: [
    { x: 7, y: 6.0, axis: "v", len: 1.4, dir: -1, hinge: 1 },   // landing ↔ bedroom 1
    { x: 8.6, y: 5, axis: "h", len: 1.4, dir: -1, hinge: 0 },   // landing ↔ bedroom 2
  ],
  windows: [
    { x: 0, y: 2.0, axis: "v", len: 1.2 }, { x: 0, y: 5.6, axis: "v", len: 1.2 }, // bd1 west
    { x: 2.8, y: 9, axis: "h", len: 1.3 },                                        // bd1 front
    { x: 8.5, y: 0, axis: "h", len: 1.3 },                                        // bd2 back
    { x: 12, y: 1.6, axis: "v", len: 1.3 },                                       // bd2 east
    { x: 12, y: 6.2, axis: "v", len: 1.2 },                                       // landing east
  ],
  stairs: [{ x: 8, y: 6, w: 3.4, h: 1.6, flow: "-x", label: "DOWN" }],
  furniture: [
    { t: "bed", x: 0.5, y: 0.5, w: 2.4, h: 3 },
    { t: "wardrobe", x: 5, y: 0.4, w: 1.8, h: 0.8 },
    { t: "chest", x: 0.5, y: 7.7 },
    { t: "bed", x: 7.5, y: 0.5, w: 2.2, h: 2.6 },
    { t: "wardrobe", x: 10, y: 3.7, w: 1.6, h: 0.8 },
  ],
});

const cellar = drawPlan({
  W: 8, H: 7, name: "Cellar", sub: "COLD STORE · UNDER THE HALL", tint: "#cfc6b4",
  walls: [],
  rooms: [{ x: 0, y: 0, w: 8, h: 7, label: "Cold Store", dim: "8 × 7", fill: "#c8bfa9" }],
  doors: [],
  windows: [],
  stairs: [{ x: 5, y: 0.6, w: 2.4, h: 1.5, flow: "-x", label: "UP · to hall" }],
  furniture: [
    { t: "shelf", x: 0.3, y: 0.3, w: 0.8, h: 6.4, label: "vessels" },
    { t: "shelf", x: 6.9, y: 3.0, w: 0.8, h: 3.4, label: "" },
    { t: "shelf", x: 1.4, y: 6.0, w: 5.2, h: 0.8, label: "crocks" },
    { t: "barrel", x: 1.4, y: 0.6 }, { t: "barrel", x: 2.4, y: 0.6 }, { t: "barrel", x: 3.4, y: 0.6 },
    { t: "chest", x: 1.5, y: 2.4 }, { t: "chest", x: 2.7, y: 2.4 },
  ],
});

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
  .plan-grid { display: grid; grid-template-columns: 1fr; gap: 26px; margin: 18px 0 8px; }
  @media (min-width: 880px) { .plan-grid.two { grid-template-columns: 1fr 1fr; } }
  .plan { background: #efe4c9; border: 1px solid var(--line); border-radius: 12px; box-shadow: var(--shadow); overflow: hidden; }
  .plan svg { width: 100%; height: auto; display: block; }
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
      <span class="wordmark">House<br>Floor Plans<small>CELLAR · GROUND · FIRST</small></span>
    </div>
    <a href="vintage-story.html" class="home-link">← The Drifter's Almanac</a>
    <nav class="nav" data-nav>
      <a href="#ground"><span class="ix">01</span> Ground floor</a>
      <a href="#first"><span class="ix">02</span> First floor</a>
      <a href="#cellar"><span class="ix">03</span> Cellar</a>
      <a href="#build"><span class="ix">04</span> Building it</a>
    </nav>
    <p style="margin-top:28px;font-family:var(--f-mono);font-size:0.58rem;letter-spacing:0.06em;color:var(--ink-faint);line-height:1.7">
      Top-down plans — rooms, doors,<br>windows, stairs and furniture.<br>For more builds see
      <a href="vs-builds.html" style="color:var(--accent)">The Pattern Book</a>. v<b style="color:var(--accent)">1.22.3</b>.
    </p>
  </aside>

  <main class="content">

    <header class="hero" id="top">
      <p class="kicker">Vintage Story · v1.22.3 · Floor plans</p>
      <h1>House Floor Plans</h1>
      <p class="lede">A clean, top-down plan of a real two-bedroom house, level by level: a <strong>cellar</strong> cold store below, a <strong>ground floor</strong> where the entrance opens into the living room with the kitchen to the right, and a <strong>first floor</strong> with two bedrooms off a central landing. One staircase in the hall serves both the cellar and upstairs. Every room is labelled with its size; doors show their swing, windows sit in the walls, and the furniture marks how each room is used.</p>
      <div class="badges">
        <span class="badge accent">3 levels</span>
        <span class="badge">Living · kitchen · 2 beds · cellar</span>
        <span class="badge">Labelled rooms &amp; sizes</span>
        <span class="badge accent">📐 Doors · windows · stairs</span>
      </div>
      <p class="legend-key">
        <span><i></i> wall</span>
        <span><i class="win"></i> window</span>
        <span>⌐ door (with swing)</span>
        <span>▦ stairs (arrow = up)</span>
      </p>
    </header>

    <section class="doc" id="ground">
      <p class="sec-index">01 — Ground floor</p>
      <h2>Entrance, living room &amp; kitchen</h2>
      <p class="lead">The front door opens straight into the <strong>living room</strong> — a hearth, seating and a table — with windows down the west wall. A door on the right leads to the <strong>kitchen</strong> (stove and counters along the back and side) and to the <strong>hall</strong>, which holds the staircase up and the steps down to the cellar. A back door opens off the hall.</p>
      <div class="plan-grid"><div class="plan">${ground}</div></div>
    </section>

    <section class="doc" id="first">
      <p class="sec-index">02 — First floor</p>
      <h2>Two bedrooms off the landing</h2>
      <p class="lead">The stair lands on a central <strong>landing</strong>, with a door each side. <strong>Bedroom 1</strong> sits over the living room — the larger room, bed and wardrobe, windows west and front. <strong>Bedroom 2</strong> is over the kitchen, with windows to the back and east.</p>
      <div class="plan-grid"><div class="plan">${first}</div></div>
    </section>

    <section class="doc" id="cellar">
      <p class="sec-index">03 — Cellar</p>
      <h2>The cold store</h2>
      <p class="lead">Dug under the hall and reached by the same staircase, the <strong>cellar</strong> is a single stone-walled cold store. Line the walls with shelving for storage vessels and sealed crocks, and keep barrels for bulk. Cool, dark and fully enclosed keeps food longest — no skylight.</p>
      <div class="plan-grid"><div class="plan">${cellar}</div></div>
    </section>

    <section class="doc" id="build">
      <p class="sec-index">04 — From plan to blocks</p>
      <h2>Building it</h2>
      <ul>
        <li><strong>Set out the ground floor first</strong> at 12×9, walls two-to-three blocks high. Mark the two interior partitions (living/kitchen and the hall) before you raise them so the doorways line up.</li>
        <li><strong>Dig the cellar</strong> down under the hall, 8×7, walled in stone, before you floor the ground level over it. Put the staircase in the hall so one run reaches both the cellar and upstairs.</li>
        <li><strong>Floor and repeat upstairs</strong> for the two bedrooms, mirroring the partitions below so the walls stack and carry the roof.</li>
        <li><strong>Doors swing into the room</strong> shown by the arc; hang plank doors and glaze the windows once the walls top out.</li>
        <li><strong>Keep the stove on stone</strong> and a block clear of timber. A cool, sealed cellar with one solid door keeps food best.</li>
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
console.log("wrote vs-house-schematic.html — 3 floor plans (ground, first, cellar)");
