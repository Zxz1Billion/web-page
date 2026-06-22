/* ============================================================================
   build-steps.js — derives a course-by-course build plan from a Pattern Book
   scene's geometry. Each scene (see assets/data/builds/_kit.js) is a list of
   iso primitives with exact footprints, wall heights, opening positions and
   roof pitches; deriveCourses() reads those and emits an ordered, build-specific
   set of construction steps so every card carries real instructions, not just a
   render. A scene may also hand-author a `steps:[{title,body}]` array to
   override the derived plan. Pure (no DOM); shared by buildCard in iso-scene.js
   and the offline page generator.
   ========================================================================== */

import { P } from "../data/builds/_kit.js";

// hex -> palette key -> friendly in-game material name
const KEY = Object.fromEntries(Object.entries(P).map(([k, v]) => [v, k]));
const LABEL = {
  ground: "levelled earth", soil: "packed soil", water: "water", mud: "mud brick",
  log: "logs", plaster: "plaster-on-frame", stone: "cobblestone", whitestone: "limestone brick",
  wood: "planks", post: "log posts", darkwood: "dark timber",
  thatch: "thatch", shingle: "wooden shingles", roofdk: "wooden shingles", slate: "slate",
  glass: "glass panes", clay: "fired clay brick", brick: "fired brick", metal: "metal block",
  iron: "iron plate", copper: "copper", gold: "gilded block", black: "dark glazing",
  cloth: "hide and cloth", canvas: "canvas", green: "foliage", leaf: "foliage",
  crop: "crops", hay: "hay bales", red: "red-painted plank", blue: "blue-painted plank",
  fire: "a firepit", glow: "lanterns", snow: "packed snow", sand: "sand",
};
const mat = (c) => LABEL[KEY[c]] || "your chosen block";
const isWood = (c) => [P.log, P.post, P.wood, P.darkwood].includes(c);
const isMasonry = (c) => [P.stone, P.whitestone, P.brick, P.clay, P.mud].includes(c);
const isFoliage = (c) => c === P.green || c === P.leaf;

const R = (n) => Math.max(1, Math.round(n));
const courses = (n) => R(n) === 1 ? "1 course" : R(n) + " courses";
const list = (a) => a.length <= 1 ? (a[0] || "") : a.slice(0, -1).join(", ") + " and " + a[a.length - 1];
const faceWord = (f) => f === "E" ? "in the right-hand (east) wall"
  : f === "N" ? "in the back (north) wall"
  : f === "W" ? "in the left-hand (west) wall"
  : "in the front (south) wall";
const courseOf = (y) => R((y || 0) + 0.5);

export function deriveCourses(def) {
  if (def.steps) return def.steps; // hand-authored override
  const parts = (def.parts || []).filter((p) => p && p.t);
  if (!parts.length) return [];

  const ground = parts.filter((p) => p.t === "ground");
  const water = parts.filter((p) => p.t === "water");

  // boxes split into walls (solid mass), columns (thin & tall) and slabs (flat trim)
  const walls = [], cols = [], slabs = [];
  for (const b of parts.filter((p) => p.t === "box")) {
    const thin = b.w <= 1.1 && b.d <= 1.1; // column / chimney footprint
    if (thin && b.h > 0.8) cols.push(b);
    else if (b.h >= 1.2) walls.push(b);
    else slabs.push(b);
  }
  const structPosts = cols.filter((c) => c.h > 1.4 && isWood(c.c));
  const railPosts = cols.filter((c) => c.h <= 1.4 && isWood(c.c));
  const chimneys = cols.filter((c) => isMasonry(c.c));
  // substantial flat slabs = floors, terraces, decks, balconies (not the timber frame)
  const bigSlabs = slabs.filter((s) => s.w >= 2 && s.d >= 2 && s.c !== P.darkwood);
  const groundSlabs = bigSlabs.filter((s) => (s.y || 0) < 0.6);
  const upperSlabs = bigSlabs.filter((s) => (s.y || 0) >= 0.6);

  const cyls = parts.filter((p) => p.t === "cyl");
  const roundWalls = cyls.filter((p) => p.r > 0.8 && p.h >= 1.2 && p.c !== P.fire && !isFoliage(p.c));
  // slim round shafts = columns, colonnades, pillars (P.wood excluded: those are tree trunks)
  const columns = cyls.filter((p) => p.r <= 0.8 && p.h >= 0.8 && p.c !== P.fire && p.c !== P.wood && !isFoliage(p.c));
  const frusta = parts.filter((p) => p.t === "frustum");
  const roofs = parts.filter((p) => ["gable", "hip", "shed"].includes(p.t));

  const cones = parts.filter((p) => p.t === "cone" && p.c !== P.fire);
  const roofCones = cones.filter((c) => (c.y || 0) > 1);
  const groundCones = cones.filter((c) => (c.y || 0) <= 1);
  const domes = parts.filter((p) => p.t === "dome" && !isFoliage(p.c));
  const roofDomes = domes.filter((d) => (d.y || 0) > 1.2);
  const groundDomes = domes.filter((d) => (d.y || 0) <= 1.2);

  const doors = parts.filter((p) => p.t === "door");
  const wins = parts.filter((p) => p.t === "win");
  const sails = parts.filter((p) => p.t === "sails");
  const stairs = parts.filter((p) => p.t === "stairs");
  const wedges = parts.filter((p) => p.t === "wedge");
  const polys = parts.filter((p) => p.t === "poly");
  const fires = parts.filter((p) => p.c === P.fire);
  const lanterns = parts.filter((p) => p.c === P.glow);
  const foliage = parts.filter((p) => isFoliage(p.c) && (p.t === "dome" || p.t === "cone"));
  const crops = parts.filter((p) => p.c === P.crop || p.c === P.hay);

  const steps = [];
  const add = (title, body) => body && steps.push({ title, body });

  // 1 — site & footprint
  const fp = def.meta && def.meta.size;
  const g = ground[0];
  let site = `Pick flat ground and mark out ${fp ? `the ${fp}-block footprint` : "the footprint"}`;
  if (g) site += `, clearing a ${R(g.w)}×${R(g.d)} working area around it`;
  site += ".";
  if (water.length) {
    const wa = water[0];
    site += ` Dig the ${R(wa.w)}×${R(wa.d)} ${wa.d > wa.w * 2 || wa.w > wa.d * 2 ? "channel" : "pond"} and let it flood before edging it.`;
  }
  add("Site & footprint", site);

  // 2 — foundation course
  const wallMat = (walls[0] || roundWalls[0] || frusta[0] || {}).c;
  if (wallMat !== undefined && isMasonry(wallMat) === false && isWood(wallMat) === false) {
    // non-stone shell (cob/plaster) — light footing
  }
  if (walls.length || roundWalls.length) {
    const fmat = isMasonry(wallMat) ? mat(wallMat) : "cobblestone";
    add("Foundation course", `Lay the first course as a solid ${fmat} ring on the outline to keep damp out of the walls, then floor the inside.`);
  }

  // 2b — ground floors, porches & terraces
  if (groundSlabs.length) {
    const segs = groundSlabs.map((s) => `a ${R(s.w)}×${R(s.d)} pad`);
    add("Floors & terraces", `Lay ${list(segs)} in ${mat(groundSlabs[0].c)} for the floor, porch and terraces, levelling each flush.`);
  }

  // 3 — walls & openings
  if (walls.length || roundWalls.length || frusta.length) {
    const segs = [];
    for (const w of walls) segs.push(`a ${R(w.w)}×${R(w.d)} block ${courses(w.h)} high`);
    for (const c of roundWalls) segs.push(`a round wall about ${R(c.r * 2)} across and ${courses(c.h)} high`);
    for (const f of frusta) segs.push(`a ${mat(f.c)} mass tapering from ${R(f.w)}×${R(f.d)} up to ${R(f.tw)}×${R(f.td)} over ${courses(f.h)}`);
    const wm = mat((walls[0] || roundWalls[0] || frusta[0]).c);
    let body = `Raise the walls in ${wm} — ${list(segs)} — keeping each course level and the corners plumb.`;
    const op = [];
    for (const d of doors) op.push(`a ${R(d.w || d.d || 1)}×${R(d.h)} doorway ${faceWord(d.face)}`);
    const byFace = {};
    for (const w of wins) { const f = w.face || "S"; (byFace[f] = byFace[f] || []).push(w); }
    for (const f of Object.keys(byFace)) {
      const ws = byFace[f];
      const c0 = courseOf(Math.min(...ws.map((w) => w.y || 0)));
      op.push(`${ws.length === 1 ? "a window" : ws.length + " windows"} ${faceWord(f)} from about course ${c0}`);
    }
    if (op.length) body += ` As the courses rise, leave ${list(op)}; bridge each opening with a lintel, then glaze the windows once the wall tops out.`;
    add("Walls & openings", body);
  }

  // 3a — columns & colonnades
  if (columns.length) {
    const c0 = columns[0];
    add("Columns & pillars", `Raise ${columns.length} round ${mat(c0.c)} column${columns.length > 1 ? "s" : ""} about ${R(c0.r * 2)} across and ${courses(c0.h)} tall, spaced evenly; cap each where it meets the ${roofs.length || roofCones.length || roofDomes.length ? "roof" : "beam above"}.`);
  }

  // 3c — upper floors, galleries & balconies
  if (upperSlabs.length) {
    const segs = upperSlabs.map((s) => `a ${R(s.w)}×${R(s.d)} deck at about course ${courseOf(s.y)}`);
    add("Upper floors & balconies", `Once the lower walls carry, lay ${list(segs)} in ${mat(upperSlabs[0].c)} for the upper floor${upperSlabs.length > 1 ? "s" : ""}, gallery and balconies, then carry the walls on up.`);
  }

  // 3b — ground-level shells with no box walls (tents, mounds, heaps, kilns, domes)
  if (!walls.length && !roundWalls.length) {
    for (const c of groundCones) add("Raise the form", `Stand poles and pull a cone of ${mat(c.c)} about ${R(c.r * 2)} across and ${R(c.h)} tall over them.`);
    for (const d of groundDomes) add("Heap the dome", `Pack a dome of ${mat(d.c)} about ${R(d.r * 2)} across and ${R(d.h)} high over the floor, leaving the doorway clear.`);
  }

  // 4 — timber frame / posts
  if (structPosts.length || (slabs.some((s) => s.c === P.darkwood))) {
    const n = structPosts.length;
    const fm = mat((structPosts[0] || { c: P.darkwood }).c);
    add("Frame & posts", `Stand ${n ? n + " " : "the "}corner posts and studs in ${fm}, then tie them with sill, rail and brace beams; fill the panels between with plaster or boards.`);
  }

  // 5 — roof
  const roofBits = [];
  for (const r of roofs) {
    if (r.t === "gable") roofBits.push(`a gabled roof, ridge running ${r.axis === "z" ? "front-to-back" : "left-to-right"}, rising about ${R(r.rise)} blocks in ${mat(r.c)}${r.cGable && mat(r.cGable) !== mat(r.c) ? ` with ${mat(r.cGable)} gable ends` : ""}`);
    else if (r.t === "hip") roofBits.push(`a hipped four-slope roof climbing about ${R(r.rise)} blocks to the apex in ${mat(r.c)}`);
    else if (r.t === "shed") roofBits.push(`a single-pitch shed roof, high at the back and low at the front, rising about ${R(r.rise)} in ${mat(r.c)}`);
  }
  for (const c of roofCones) roofBits.push(`a conical roof rising about ${R(c.h)} in ${mat(c.c)}`);
  for (const d of roofDomes) roofBits.push(`a domed cap in ${mat(d.c)}`);
  if (roofBits.length) add("Roof", `Set the rafters and build ${list(roofBits)}. Start at the eaves and lap each course upward so it sheds rain and snow.`);

  // 6 — chimney & hearth
  if (chimneys.length) {
    const tall = chimneys.find((c) => c.y + c.h > 3) || chimneys[0];
    const role = (roofs.length || roofCones.length || roofDomes.length) ? "chimney stack" : "stone pillars";
    add(role === "chimney stack" ? "Chimney" : "Pillars", `Build ${chimneys.length > 1 ? chimneys.length + " " : "the "}${mat(tall.c)} ${role}${chimneys.length > 1 ? "s" : ""}, carrying ${role === "chimney stack" ? "the flue up past the ridge so smoke draws clear" : "them their full height to take the load above"}.`);
  }
  if (fires.length || lanterns.length) {
    const bits = [];
    if (fires.length) bits.push("set the hearth or firepit at the base");
    if (lanterns.length) bits.push("hang lanterns to light it");
    add("Hearth & light", `${bits.join(", then ").replace(/^./, (s) => s.toUpperCase())}.`);
  }

  // 7 — mechanism
  if (sails.length) {
    const s = sails[0];
    add("Mechanism", `Mount the ${s.n || 4}-armed ${s.n >= 6 ? "wheel" : "sail"} on the axle — about ${R((s.r || 2) * 2)} blocks across — and connect it through to the gearing it drives.`);
  }
  if (stairs.length) {
    const st = stairs[0];
    add("Stairs", `Build the stair: ${st.steps} steps climbing ${st.dir < 0 ? "down" : "up"} in ${mat(st.c)}.`);
  }
  if (wedges.length) add("Banking & ramps", `Bank ${mat(wedges[0].c)} into the ${wedges.length > 1 ? "ramps/buttresses" : "ramp/buttress"} shown, sloping it cleanly into the ground.`);

  // 8 — shaped detailing (pediments, braces, gable infill, awnings — things square blocks can't make)
  if (polys.length) add("Detailing", `Cut and fit the angled, shaped pieces the drawing shows — pediments, braces, gable infill and trim — that plain blocks can't form on their own.`);

  // 9 — surroundings & dressing
  const around = [];
  if (railPosts.length) around.push("run a post-and-rail fence around the plot");
  if (foliage.length) around.push(`plant ${foliage.length > 2 ? "trees and shrubs" : "a tree or two"} for shelter`);
  if (crops.length) around.push("till and sow the beds");
  if (around.length) add("Surroundings", `${list(around).replace(/^./, (s) => s.toUpperCase())}.`);

  // 10 — finishing (reuse the author's terse note as the closing tip)
  if (def.note) add("Finishing", def.note);

  return steps;
}
