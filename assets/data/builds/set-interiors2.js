/* ============================================================================
   set-interiors2.js — MORE cutaway interior room dioramas for the Pattern Book
   (group: "interior"). Same style as set-interiors.js: a shell() of floor +
   NORTH (low z) + WEST (low x) back walls only, furniture authored back-to-front
   resting on the floor. See ./_kit.js for the primitive spec. All ids start
   "in2-". Multi-room cutaways split one floor with a low interior wall.
   ========================================================================== */

import { P, rep, tree, fence } from "./_kit.js";

// shared cutaway shell: floor + two back walls. Returns parts[].
const shell = (floor = P.wood, wall = P.plaster, w = 8, d = 7) => [
  { t: "box", x: 0, y: 0, z: 0, w, h: 0.4, d, c: floor },          // floor
  { t: "box", x: 0, y: 0.4, z: 0, w, h: 3, d: 0.4, c: wall },      // north wall (low z)
  { t: "box", x: 0, y: 0.4, z: 0, w: 0.4, h: 3, d, c: wall },      // west wall (low x)
];

export const SET = [
  /* ============================================================ in2-forgehall */
  { id: "in2-forgehall", group: "interior", title: "Forge hall", tags: ["Anvils", "Forge"],
    meta: { size: "8×7", materials: "Stone forge, iron", best: "A busy smithy with several anvils" },
    note: "One hooded forge in the back corner; a row of three anvils on stumps across the open floor.",
    parts: [
      ...shell(P.stone, P.stone),
      // tool rack on west wall
      { t: "box", x: 0.4, y: 2, z: 1, w: 0.2, h: 0.2, d: 2.6, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 0.5, y: 1.2, z: 1.2 + i * 0.7, w: 0.12, h: 0.8, d: 0.12, c: P.iron })),
      // hooded forge back-left
      { t: "cyl", x: 1.7, y: 0.4, z: 1.4, r: 1, h: 1.1, c: P.stone, n: 14 },
      { t: "cone", x: 1.7, y: 1.5, z: 1.4, r: 0.5, h: 1.5, c: P.black, n: 12 },
      { t: "cone", x: 1.7, y: 1.5, z: 1.4, r: 0.3, h: 0.5, c: P.fire, n: 10 },
      // ingot bin against north wall
      { t: "box", x: 3.8, y: 0.4, z: 0.6, w: 1.2, h: 0.7, d: 0.9, c: P.darkwood },
      { t: "box", x: 4, y: 1.1, z: 0.8, w: 0.8, h: 0.2, d: 0.5, c: P.metal },
      // three anvils on stumps across the floor
      ...rep(3, (i) => ({ t: "box", x: 2.6 + i * 1.4, y: 0.4, z: 3.4 + i * 0.5, w: 0.8, h: 0.8, d: 0.8, c: P.wood })),
      ...rep(3, (i) => ({ t: "box", x: 2.5 + i * 1.4, y: 1.2, z: 3.5 + i * 0.5, w: 1, h: 0.3, d: 0.55, c: P.metal })),
      ...rep(3, (i) => ({ t: "box", x: 3.2 + i * 1.4, y: 1.5, z: 3.62 + i * 0.5, w: 0.45, h: 0.22, d: 0.3, c: P.metal })),
      // quench barrel front-left
      { t: "cyl", x: 1.4, y: 0.4, z: 5, r: 0.55, h: 1.1, c: P.darkwood, n: 12 },
      { t: "cyl", x: 1.4, y: 1.45, z: 5, r: 0.45, h: 0.05, c: P.water, n: 12 },
    ] },

  /* ============================================================== in2-saltery */
  { id: "in2-saltery", group: "interior", title: "Saltery", tags: ["Salt", "Fish"],
    meta: { size: "8×7", materials: "Stone, wood, salt", best: "Salting fish and meat in barrels" },
    note: "Salt-packing barrels along the back; a long brining trough and salt sacks fill the front.",
    parts: [
      ...shell(P.stone, P.stone),
      // shelf of salt crocks north wall
      { t: "box", x: 1, y: 2, z: 0.4, w: 5, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(4, (i) => ({ t: "cyl", x: 1.6 + i * 1.1, y: 2.2, z: 0.65, r: 0.25, h: 0.5, c: P.snow, n: 10 })),
      // salting barrels along back-left
      { t: "cyl", x: 1.4, y: 0.4, z: 1.5, r: 0.7, h: 1.3, c: P.darkwood, n: 12 },
      { t: "cyl", x: 1.4, y: 1.7, z: 1.5, r: 0.6, h: 0.05, c: P.snow, n: 12 },
      { t: "cyl", x: 3, y: 0.4, z: 1.4, r: 0.7, h: 1.3, c: P.wood, n: 12 },
      // brining trough centre-front
      { t: "box", x: 2.6, y: 0.4, z: 3.6, w: 3.6, h: 0.7, d: 1.3, c: P.darkwood },
      { t: "box", x: 2.8, y: 0.7, z: 3.8, w: 3.2, h: 0.45, d: 0.9, c: P.water },
      { t: "box", x: 3.1, y: 1.1, z: 4, w: 0.6, h: 0.12, d: 0.4, c: P.cloth }, // fish
      { t: "box", x: 4.4, y: 1.1, z: 4, w: 0.6, h: 0.12, d: 0.4, c: P.cloth },
      // salt sacks front-left
      { t: "box", x: 1.2, y: 0.4, z: 4.8, w: 0.9, h: 0.9, d: 0.9, c: P.snow },
      { t: "box", x: 2.1, y: 0.4, z: 5.2, w: 0.8, h: 0.8, d: 0.8, c: P.cloth },
    ] },

  /* =========================================================== in2-smokehouse */
  { id: "in2-smokehouse", group: "interior", title: "Smokehouse", tags: ["Smoke", "Meat"],
    meta: { size: "8×7", materials: "Log, stone firepit", best: "Hanging meat over a smouldering fire" },
    note: "A smoke fire pits the centre floor; racks of hanging meat dangle from a beam overhead.",
    parts: [
      ...shell(P.stone, P.log),
      // overhead beam spanning the room (north wall side)
      { t: "box", x: 0.8, y: 2.6, z: 1.6, w: 5.5, h: 0.25, d: 0.25, c: P.darkwood },
      // hanging meat from the beam
      ...rep(5, (i) => ({ t: "box", x: 1.3 + i * 1, y: 1.6, z: 1.6, w: 0.35, h: 1, d: 0.3, c: P.red })),
      ...rep(5, (i) => ({ t: "box", x: 1.4 + i * 1, y: 2.55, z: 1.65, w: 0.1, h: 0.1, d: 0.1, c: P.iron })),
      // second beam + meat lower-front
      { t: "box", x: 0.8, y: 2.6, z: 3.4, w: 5.5, h: 0.25, d: 0.25, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 1.6 + i * 1.1, y: 1.9, z: 3.4, w: 0.32, h: 0.8, d: 0.28, c: P.brick })),
      // central smoke firepit
      { t: "box", x: 3, y: 0.4, z: 4.6, w: 1.8, h: 0.5, d: 1.8, c: P.stone },
      { t: "cone", x: 3.9, y: 0.9, z: 5.5, r: 0.5, h: 0.7, c: P.fire, n: 10 },
      { t: "cone", x: 3.9, y: 1.4, z: 5.5, r: 0.35, h: 0.9, c: P.black, n: 8 }, // smoke
      // log pile front-left
      { t: "cyl", x: 1.3, y: 0.5, z: 5.2, r: 0.25, h: 1.2, c: P.log, n: 8 },
      { t: "cyl", x: 1.7, y: 0.5, z: 5.4, r: 0.25, h: 1.1, c: P.wood, n: 8 },
    ] },

  /* ============================================================ in2-cheesecave */
  { id: "in2-cheesecave", group: "interior", title: "Cheese cave", tags: ["Cheese", "Cool"],
    meta: { size: "8×7", materials: "Stone, plank racks", best: "Ageing cheese wheels on cool racks" },
    note: "Stone walls, deep multi-tier racks of cheese wheels lining the back; a tasting stool out front.",
    parts: [
      ...shell(P.stone, P.stone),
      // north wall: three tiers of cheese
      ...rep(3, (i) => ({ t: "box", x: 0.8, y: 0.9 + i * 0.8, z: 0.4, w: 5.6, h: 0.18, d: 0.6, c: P.darkwood })),
      ...rep(3, (tier) => rep(5, (i) => ({ t: "cyl", x: 1.2 + i * 1.05, y: 1.08 + tier * 0.8, z: 0.7, r: 0.28, h: 0.28, c: tier % 2 ? P.cloth : P.hay, n: 12 }))).flat(),
      // west wall: two tiers
      ...rep(2, (i) => ({ t: "box", x: 0.4, y: 1 + i * 0.9, z: 1.4, w: 0.6, h: 0.18, d: 4, c: P.darkwood })),
      ...rep(2, (tier) => rep(4, (i) => ({ t: "cyl", x: 0.7, y: 1.18 + tier * 0.9, z: 1.8 + i * 0.9, r: 0.26, h: 0.26, c: tier % 2 ? P.hay : P.cloth, n: 12 }))).flat(),
      // tasting table + stool front
      { t: "box", x: 3.4, y: 0.4, z: 4, w: 1.8, h: 1, d: 1, c: P.wood },
      { t: "cyl", x: 4.3, y: 1.4, z: 4.5, r: 0.35, h: 0.25, c: P.hay, n: 12 },
      { t: "box", x: 5.4, y: 0.4, z: 4.8, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================ in2-winecellar */
  { id: "in2-winecellar", group: "interior", title: "Wine cellar", tags: ["Casks", "Wine"],
    meta: { size: "8×7", materials: "Stone vault, oak", best: "Racking casks and bottles below ground" },
    note: "Big oak casks stacked along the back walls; a tasting table with bottles in the open front.",
    parts: [
      ...shell(P.stone, P.stone),
      // bottle rack north wall (diagonal slots suggested by short cyls)
      { t: "box", x: 3.4, y: 1.2, z: 0.4, w: 3, h: 1.6, d: 0.5, c: P.darkwood },
      ...rep(3, (r) => rep(4, (i) => ({ t: "cyl", x: 3.7 + i * 0.7, y: 1.35 + r * 0.5, z: 0.55, r: 0.13, h: 0.35, c: P.green, n: 8 }))).flat(),
      // stacked casks back-left (two high)
      { t: "cyl", x: 1.5, y: 0.4, z: 1.5, r: 0.8, h: 1.4, c: P.darkwood, n: 14 },
      { t: "cyl", x: 1.5, y: 1.8, z: 1.5, r: 0.7, h: 1.2, c: P.wood, n: 14 },
      { t: "cyl", x: 1.4, y: 0.4, z: 3.4, r: 0.8, h: 1.4, c: P.wood, n: 14 },
      // tasting table + bottles + stool front
      { t: "box", x: 3.2, y: 0.4, z: 4.2, w: 2.4, h: 1, d: 1.2, c: P.darkwood },
      { t: "cyl", x: 3.7, y: 1.4, z: 4.7, r: 0.14, h: 0.5, c: P.green, n: 8 },
      { t: "cyl", x: 4.4, y: 1.4, z: 4.7, r: 0.18, h: 0.3, c: P.copper, n: 8 },
      { t: "box", x: 5.6, y: 0.4, z: 4.9, w: 0.8, h: 0.9, d: 0.8, c: P.wood },
    ] },

  /* ============================================================ in2-rootcellar */
  { id: "in2-rootcellar", group: "interior", title: "Root cellar", tags: ["Roots", "Bins"],
    meta: { size: "8×7", materials: "Soil, plank bins", best: "Storing roots, gourds and onions" },
    note: "Earth floor, sloped bins of roots against the back; hanging onion strings and crates up front.",
    parts: [
      ...shell(P.soil, P.mud),
      // bins along north wall
      { t: "box", x: 0.8, y: 0.4, z: 0.6, w: 2.4, h: 1, d: 1.4, c: P.darkwood },
      { t: "box", x: 1, y: 1.2, z: 0.8, w: 2, h: 0.3, d: 1, c: P.crop }, // roots heap
      { t: "box", x: 3.6, y: 0.4, z: 0.6, w: 2.4, h: 1, d: 1.4, c: P.wood },
      { t: "box", x: 3.8, y: 1.2, z: 0.8, w: 2, h: 0.3, d: 1, c: P.copper }, // gourds
      // hanging onion strings from north wall top
      ...rep(3, (i) => ({ t: "cyl", x: 1.6 + i * 1.6, y: 2, z: 0.5, r: 0.18, h: 0.9, c: P.hay, n: 8 })),
      // crates + sacks front
      { t: "box", x: 1.4, y: 0.4, z: 4, w: 1.3, h: 1.3, d: 1.3, c: P.darkwood },
      { t: "box", x: 1.5, y: 1.7, z: 4.1, w: 1.1, h: 0.4, d: 1.1, c: P.crop },
      { t: "box", x: 3.4, y: 0.4, z: 4.6, w: 0.9, h: 0.9, d: 0.9, c: P.cloth },
      { t: "box", x: 4.6, y: 0.4, z: 5, w: 0.9, h: 0.9, d: 0.9, c: P.canvas },
    ] },

  /* ====================================================== in2-icehouse-interior */
  { id: "in2-icehouse-interior", group: "interior", title: "Icehouse interior", tags: ["Ice", "Cold"],
    meta: { size: "8×7", materials: "Stone, straw, ice", best: "Packing winter ice under straw" },
    note: "Stone pit packed with pale ice blocks under straw; tongs lean on the wall, a sled out front.",
    parts: [
      ...shell(P.stone, P.stone),
      // straw insulation strip on north wall
      { t: "box", x: 0.8, y: 0.4, z: 0.45, w: 5.4, h: 1, d: 0.3, c: P.hay },
      // ice pit back-centre (stone rim + stacked ice)
      { t: "box", x: 1, y: 0.4, z: 1, w: 4.4, h: 0.6, d: 3, c: P.stone },
      ...rep(2, (r) => rep(3, (i) => ({ t: "box", x: 1.3 + i * 1.3, y: 0.6, z: 1.3 + r * 1.2, w: 1.1, h: 1, d: 1, c: P.snow, op: 0.92 }))).flat(),
      { t: "box", x: 1.2, y: 1.6, z: 1.2, w: 4, h: 0.25, d: 2.6, c: P.hay }, // straw cover
      // tongs on west wall
      { t: "box", x: 0.5, y: 0.5, z: 4.4, w: 0.12, h: 2, d: 0.12, c: P.iron },
      // small sled front-right
      { t: "box", x: 3.6, y: 0.4, z: 5, w: 2, h: 0.3, d: 0.9, c: P.darkwood },
      { t: "box", x: 3.7, y: 0.7, z: 5.1, w: 1.5, h: 0.9, d: 0.7, c: P.snow, op: 0.92 }, // ice block on it
    ] },

  /* ====================================================== in2-granary-interior */
  { id: "in2-granary-interior", group: "interior", title: "Granary interior", tags: ["Grain", "Sacks"],
    meta: { size: "8×7", materials: "Plank, grain", best: "Bulk grain bins and sacks" },
    note: "Tall plank grain bins line the back; heaped sacks and a scoop barrel fill the open floor.",
    parts: [
      ...shell(P.wood, P.wood),
      // grain bins along north wall
      ...rep(3, (i) => ({ t: "box", x: 0.7 + i * 2, y: 0.4, z: 0.6, w: 1.7, h: 2.2, d: 1.4, c: P.darkwood })),
      ...rep(3, (i) => ({ t: "box", x: 0.85 + i * 2, y: 2.2, z: 0.75, w: 1.4, h: 0.3, d: 1.1, c: P.hay })), // grain tops
      // sacks heaped centre
      { t: "box", x: 1.6, y: 0.4, z: 3.4, w: 1, h: 1, d: 1, c: P.cloth },
      { t: "box", x: 2.7, y: 0.4, z: 3.7, w: 1, h: 1, d: 1, c: P.canvas },
      { t: "box", x: 2.1, y: 1.4, z: 3.6, w: 0.9, h: 0.9, d: 0.9, c: P.cloth },
      // scoop barrel + scoop front-right
      { t: "cyl", x: 5, y: 0.4, z: 4.6, r: 0.7, h: 1.2, c: P.wood, n: 12 },
      { t: "cyl", x: 5, y: 1.6, z: 4.6, r: 0.55, h: 0.05, c: P.hay, n: 12 },
      { t: "box", x: 4, y: 0.4, z: 5.2, w: 0.9, h: 0.9, d: 0.9, c: P.canvas },
    ] },

  /* ========================================================= in2-mill-interior */
  { id: "in2-mill-interior", group: "interior", title: "Mill interior", tags: ["Quern", "Grind"],
    meta: { size: "8×7", materials: "Stone, wood", best: "Grinding grain on a great millstone" },
    note: "A big round grindstone on a low base in the centre; grain sacks behind, flour bins to the side.",
    parts: [
      ...shell(P.wood, P.stone),
      // flour bin shelf north wall
      { t: "box", x: 4, y: 1.6, z: 0.4, w: 3, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "box", x: 4.4 + i * 0.9, y: 1.8, z: 0.6, w: 0.6, h: 0.6, d: 0.3, c: P.cloth })),
      // grain sacks back-left
      { t: "box", x: 1, y: 0.4, z: 1, w: 1, h: 1, d: 1, c: P.canvas },
      { t: "box", x: 2, y: 0.4, z: 1.2, w: 0.9, h: 0.9, d: 0.9, c: P.cloth },
      // grindstone in centre: base + lower stone + upper turning stone + handle
      { t: "cyl", x: 3.4, y: 0.4, z: 3.4, r: 1.1, h: 0.8, c: P.wood, n: 14 },
      { t: "cyl", x: 3.4, y: 1.2, z: 3.4, r: 1, h: 0.35, c: P.stone, n: 16 },
      { t: "cyl", x: 3.4, y: 1.55, z: 3.4, r: 0.95, h: 0.35, c: P.whitestone, n: 16 },
      { t: "cyl", x: 3.4, y: 1.9, z: 3.4, r: 0.18, h: 0.5, c: P.darkwood, n: 8 }, // spindle
      { t: "box", x: 3.3, y: 2.2, z: 4.3, w: 0.16, h: 0.16, d: 1, c: P.wood }, // handle
      // flour spilling at base + scoop
      { t: "cyl", x: 3.4, y: 1.2, z: 3.4, r: 1.15, h: 0.06, c: P.cloth, n: 16 },
      { t: "box", x: 5.4, y: 0.4, z: 4.8, w: 0.8, h: 0.9, d: 0.8, c: P.wood }, // stool
    ] },

  /* ============================================================== in2-loom-hall */
  { id: "in2-loom-hall", group: "interior", title: "Loom hall", tags: ["Looms", "Cloth"],
    meta: { size: "8×7", materials: "Wood, cloth", best: "A weaving workshop of several looms" },
    note: "Two upright looms against the back wall with threads strung; cloth bolts and a stool out front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // loom one (left)
      { t: "box", x: 0.9, y: 0.4, z: 0.7, w: 0.22, h: 2.6, d: 0.22, c: P.darkwood },
      { t: "box", x: 2.7, y: 0.4, z: 0.7, w: 0.22, h: 2.6, d: 0.22, c: P.darkwood },
      { t: "box", x: 0.9, y: 2.6, z: 0.7, w: 2, h: 0.22, d: 0.22, c: P.darkwood },
      ...rep(5, (i) => ({ t: "box", x: 1.2 + i * 0.34, y: 1.5, z: 0.78, w: 0.06, h: 1.1, d: 0.06, c: P.cloth })),
      { t: "box", x: 0.9, y: 0.4, z: 1.4, w: 2, h: 1, d: 0.16, c: P.canvas }, // woven cloth
      // loom two (right)
      { t: "box", x: 3.6, y: 0.4, z: 0.7, w: 0.22, h: 2.6, d: 0.22, c: P.darkwood },
      { t: "box", x: 5.4, y: 0.4, z: 0.7, w: 0.22, h: 2.6, d: 0.22, c: P.darkwood },
      { t: "box", x: 3.6, y: 2.6, z: 0.7, w: 2, h: 0.22, d: 0.22, c: P.darkwood },
      ...rep(5, (i) => ({ t: "box", x: 3.9 + i * 0.34, y: 1.5, z: 0.78, w: 0.06, h: 1.1, d: 0.06, c: P.cloth })),
      { t: "box", x: 3.6, y: 0.4, z: 1.4, w: 2, h: 1, d: 0.16, c: P.canvas },
      // cloth bolts + stool front
      { t: "cyl", x: 2, y: 0.4, z: 4.4, r: 0.3, h: 1.4, c: P.red, n: 10 },
      { t: "cyl", x: 2.7, y: 0.4, z: 4.6, r: 0.3, h: 1.3, c: P.blue, n: 10 },
      { t: "box", x: 4.4, y: 0.4, z: 4.8, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================== in2-dyehouse */
  { id: "in2-dyehouse", group: "interior", title: "Dyehouse", tags: ["Dye", "Vats"],
    meta: { size: "8×7", materials: "Stone, dye vats", best: "Dipping cloth in colour vats" },
    note: "Three steaming dye vats in a row at the back; drying lines of coloured cloth across the front.",
    parts: [
      ...shell(P.stone, P.stone),
      // three dye vats back
      ...[P.red, P.blue, P.green].map((col, i) => ({ t: "cyl", x: 1.5 + i * 2, y: 0.4, z: 1.6, r: 0.8, h: 1.3, c: P.darkwood, n: 12 })),
      ...[P.red, P.blue, P.green].map((col, i) => ({ t: "cyl", x: 1.5 + i * 2, y: 1.7, z: 1.6, r: 0.7, h: 0.06, c: col, n: 12 })),
      // drying line beam across, coloured cloth hanging
      { t: "box", x: 0.6, y: 2.5, z: 4, w: 6, h: 0.12, d: 0.12, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 1 + i * 1.4, y: 1.2, z: 3.95, w: 0.9, h: 1.3, d: 0.06, c: [P.red, P.gold, P.blue, P.green][i] })),
      // dye sacks front-left
      { t: "box", x: 1.2, y: 0.4, z: 5.2, w: 0.8, h: 0.8, d: 0.8, c: P.crop },
      { t: "cyl", x: 5.4, y: 0.4, z: 5.2, r: 0.5, h: 0.9, c: P.copper, n: 10 }, // stir bucket
    ] },

  /* ============================================================ in2-scriptorium */
  { id: "in2-scriptorium", group: "interior", title: "Scriptorium", tags: ["Desks", "Scrolls"],
    meta: { size: "8×7", materials: "Darkwood, parchment", best: "Monks copying manuscripts" },
    note: "Sloped writing desks face the back wall; a tall scroll cabinet behind, candle on each desk.",
    parts: [
      ...shell(P.wood, P.whitestone),
      // tall scroll cabinet north wall
      { t: "box", x: 0.7, y: 0.4, z: 0.4, w: 6, h: 2.6, d: 0.55, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 0.9, y: 0.7 + i * 0.6, z: 0.5, w: 5.6, h: 0.12, d: 0.45, c: P.wood })),
      ...rep(3, (r) => rep(6, (i) => ({ t: "cyl", x: 1.1 + i * 0.9, y: 0.85 + r * 0.6, z: 0.55, r: 0.12, h: 0.4, c: P.canvas, n: 8 }))).flat(),
      // two sloped writing desks
      ...rep(2, (i) => ({ t: "box", x: 1.4 + i * 2.6, y: 0.4, z: 3, w: 1.6, h: 1, d: 1, c: P.darkwood })),
      ...rep(2, (i) => ({ t: "wedge", x: 1.4 + i * 2.6, y: 1.4, z: 3, w: 1.6, h: 0.3, d: 1, c: P.wood, flip: true })),
      ...rep(2, (i) => ({ t: "box", x: 1.7 + i * 2.6, y: 1.5, z: 3.2, w: 0.8, h: 0.06, d: 0.5, c: P.cloth })), // parchment
      // candles + stools front
      ...rep(2, (i) => ({ t: "cyl", x: 2.7 + i * 2.6, y: 1.5, z: 3.2, r: 0.08, h: 0.4, c: P.cloth, n: 6 })),
      ...rep(2, (i) => ({ t: "cone", x: 2.74 + i * 2.6, y: 1.9, z: 3.24, r: 0.08, h: 0.2, c: P.glow, n: 6 })),
      ...rep(2, (i) => ({ t: "box", x: 1.7 + i * 2.6, y: 0.4, z: 4.6, w: 0.8, h: 0.9, d: 0.8, c: P.wood })),
    ] },

  /* ============================================================ in2-apothecary */
  { id: "in2-apothecary", group: "interior", title: "Apothecary", tags: ["Herbs", "Jars"],
    meta: { size: "8×7", materials: "Wood, glass, herbs", best: "Mixing remedies and tinctures" },
    note: "Wall of labelled jars and hanging herbs; a mixing counter with mortar and flasks in front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // jar shelves north wall (three tiers)
      ...rep(3, (i) => ({ t: "box", x: 0.8, y: 1 + i * 0.7, z: 0.4, w: 5.6, h: 0.18, d: 0.5, c: P.darkwood })),
      ...rep(3, (r) => rep(6, (i) => ({ t: "cyl", x: 1.1 + i * 0.9, y: 1.18 + r * 0.7, z: 0.62, r: 0.16, h: 0.42, c: [P.green, P.copper, P.glass][r], n: 8 }))).flat(),
      // hanging herb bundles west wall
      ...rep(3, (i) => ({ t: "cone", x: 0.7, y: 1.4 + (i % 2) * 0.3, z: 4 + i * 0.7, r: 0.2, h: 0.8, c: P.leaf, n: 6 })),
      // mixing counter front
      { t: "box", x: 2.6, y: 0.4, z: 3.6, w: 3, h: 1, d: 1.2, c: P.wood },
      { t: "cyl", x: 3.1, y: 1.4, z: 4.1, r: 0.28, h: 0.35, c: P.stone, n: 10 }, // mortar
      { t: "cone", x: 4, y: 1.4, z: 4.1, r: 0.3, h: 0.6, c: P.glass, n: 8 }, // flask
      { t: "cyl", x: 4.9, y: 1.4, z: 4.1, r: 0.18, h: 0.5, c: P.red, n: 8 },
      { t: "box", x: 5.6, y: 0.4, z: 4.8, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================ in2-infirmary */
  { id: "in2-infirmary", group: "interior", title: "Infirmary", tags: ["Beds", "Care"],
    meta: { size: "8×7", materials: "Plank, white cloth", best: "A ward of sickbeds" },
    note: "Two white sickbeds against the back wall; a medicine table and basin in the open front.",
    parts: [
      ...shell(P.wood, P.whitestone),
      // shelf of remedies north wall
      { t: "box", x: 5, y: 2, z: 0.4, w: 2, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 5.3 + i * 0.6, y: 2.2, z: 0.65, r: 0.14, h: 0.4, c: P.glass, n: 8 })),
      // two sickbeds along north wall
      ...rep(2, (i) => ({ t: "box", x: 0.7 + i * 2.2, y: 0.4, z: 0.7, w: 1.8, h: 0.5, d: 2.6, c: P.darkwood })),
      ...rep(2, (i) => ({ t: "box", x: 0.8 + i * 2.2, y: 0.9, z: 0.8, w: 1.6, h: 0.3, d: 2.4, c: P.cloth })),
      ...rep(2, (i) => ({ t: "box", x: 0.9 + i * 2.2, y: 1.2, z: 0.9, w: 1.4, h: 0.25, d: 0.7, c: P.snow })), // pillows
      // medicine table + basin front
      { t: "box", x: 4.4, y: 0.4, z: 3.8, w: 1.8, h: 1, d: 1, c: P.wood },
      { t: "cyl", x: 5, y: 1.4, z: 4.3, r: 0.35, h: 0.25, c: P.whitestone, n: 12 },
      { t: "cyl", x: 5, y: 1.55, z: 4.3, r: 0.28, h: 0.05, c: P.water, n: 12 },
      { t: "box", x: 2, y: 0.4, z: 4.6, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood }, // stool
    ] },

  /* ============================================================== in2-bunkroom */
  { id: "in2-bunkroom", group: "interior", title: "Bunkroom", tags: ["Bunks", "Sleep"],
    meta: { size: "8×7", materials: "Plank, cloth", best: "Stacked bunks for a whole crew" },
    note: "Two stacked double-bunks line the back walls; a footlocker and lamp post in the centre.",
    parts: [
      ...shell(P.wood, P.plaster),
      // bunk stack on north wall (two tiers)
      { t: "box", x: 0.7, y: 0.4, z: 0.6, w: 4.6, h: 0.5, d: 1.6, c: P.darkwood },
      { t: "box", x: 0.8, y: 0.9, z: 0.7, w: 4.4, h: 0.25, d: 1.4, c: P.cloth },
      { t: "box", x: 0.8, y: 1.1, z: 0.7, w: 0.6, h: 0.2, d: 0.5, c: P.snow },
      { t: "box", x: 0.7, y: 1.5, z: 0.6, w: 4.6, h: 0.5, d: 1.6, c: P.wood },
      { t: "box", x: 0.8, y: 2, z: 0.7, w: 4.4, h: 0.25, d: 1.4, c: P.cloth },
      { t: "box", x: 0.8, y: 2.2, z: 0.7, w: 0.6, h: 0.2, d: 0.5, c: P.snow },
      // bunk stack on west wall (lower, single, side-on)
      { t: "box", x: 0.6, y: 0.4, z: 3, w: 1.6, h: 0.5, d: 3, c: P.darkwood },
      { t: "box", x: 0.7, y: 0.9, z: 3.1, w: 1.4, h: 0.25, d: 2.8, c: P.cloth },
      // footlocker + lamp post centre-front
      { t: "box", x: 3.6, y: 0.4, z: 4, w: 1.6, h: 0.8, d: 0.9, c: P.darkwood },
      { t: "box", x: 3.6, y: 1.2, z: 4, w: 1.6, h: 0.18, d: 0.9, c: P.iron },
      { t: "box", x: 5.4, y: 0.4, z: 4.8, w: 0.2, h: 1.8, d: 0.2, c: P.darkwood },
      { t: "cone", x: 5.5, y: 2.2, z: 4.9, r: 0.18, h: 0.3, c: P.glow, n: 8 },
    ] },

  /* ============================================================== in2-nursery */
  { id: "in2-nursery", group: "interior", title: "Nursery", tags: ["Cradle", "Toys"],
    meta: { size: "8×7", materials: "Plank, cloth", best: "A warm room for the youngest" },
    note: "A cradle in the back corner, a toy chest and a rocking horse on a soft rug out front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // shelf with small things north wall
      { t: "box", x: 4, y: 2, z: 0.4, w: 2.6, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 4.4, y: 2.2, z: 0.6, w: 0.5, h: 0.5, d: 0.3, c: P.red },
      { t: "cyl", x: 5.6, y: 2.2, z: 0.65, r: 0.18, h: 0.4, c: P.blue, n: 8 },
      // cradle back-left (rockers + box + blanket)
      { t: "box", x: 0.9, y: 0.7, z: 0.9, w: 2, h: 0.7, d: 1.2, c: P.darkwood },
      { t: "box", x: 1, y: 1.3, z: 1, w: 1.8, h: 0.25, d: 1, c: P.cloth },
      { t: "box", x: 1, y: 0.45, z: 1, w: 1.8, h: 0.25, d: 0.2, c: P.wood }, // rocker
      { t: "box", x: 1, y: 0.45, z: 1.9, w: 1.8, h: 0.25, d: 0.2, c: P.wood },
      // soft rug front
      { t: "box", x: 2.8, y: 0.41, z: 3, w: 3, h: 0.06, d: 2.6, c: P.blue },
      // toy chest
      { t: "box", x: 3, y: 0.4, z: 4.4, w: 1.4, h: 0.8, d: 0.9, c: P.red },
      { t: "box", x: 3, y: 1.2, z: 4.4, w: 1.4, h: 0.2, d: 0.9, c: P.wood },
      // rocking horse
      { t: "box", x: 4.8, y: 0.7, z: 4.6, w: 1.2, h: 0.6, d: 0.4, c: P.hay },
      { t: "box", x: 5.7, y: 1.2, z: 4.65, w: 0.4, h: 0.5, d: 0.3, c: P.hay }, // head
      { t: "box", x: 4.8, y: 0.45, z: 4.6, w: 1.2, h: 0.25, d: 0.2, c: P.darkwood },
    ] },

  /* ================================================================ in2-kennel */
  { id: "in2-kennel", group: "interior", title: "Kennel", tags: ["Dogs", "Straw"],
    meta: { size: "8×7", materials: "Log, straw", best: "Stalls and beds for working dogs" },
    note: "Low divided pens along the back filled with straw; water trough and feed sacks out front.",
    parts: [
      ...shell(P.soil, P.log),
      // low pen dividers along north wall
      ...rep(4, (i) => ({ t: "box", x: 0.8 + i * 1.5, y: 0.4, z: 0.6, w: 0.18, h: 1.2, d: 1.6, c: P.darkwood })),
      { t: "box", x: 0.8, y: 0.4, z: 2.2, w: 5.7, h: 0.6, d: 0.18, c: P.darkwood }, // front rail
      // straw beds in pens
      ...rep(3, (i) => ({ t: "box", x: 1.1 + i * 1.5, y: 0.4, z: 0.8, w: 1.1, h: 0.3, d: 1.2, c: P.hay })),
      // water trough + feed front
      { t: "box", x: 1.4, y: 0.4, z: 4, w: 2.4, h: 0.5, d: 0.8, c: P.stone },
      { t: "box", x: 1.6, y: 0.6, z: 4.15, w: 2, h: 0.3, d: 0.5, c: P.water },
      { t: "box", x: 4.6, y: 0.4, z: 4.6, w: 0.9, h: 0.9, d: 0.9, c: P.cloth }, // feed sack
      { t: "box", x: 3.4, y: 0.4, z: 5, w: 0.6, h: 0.4, d: 0.6, c: P.darkwood }, // bowl
    ] },

  /* ====================================================== in2-stable-interior */
  { id: "in2-stable-interior", group: "interior", title: "Stable interior", tags: ["Stalls", "Hay"],
    meta: { size: "8×7", materials: "Log, straw, hay", best: "Horse stalls with feed and hay" },
    note: "Three divided stalls along the back, straw bedding inside; hay bales and a feed trough up front.",
    parts: [
      ...shell(P.soil, P.log),
      // stall dividers along north wall
      ...rep(4, (i) => ({ t: "box", x: 0.7 + i * 1.7, y: 0.4, z: 0.6, w: 0.2, h: 2, d: 2, c: P.darkwood })),
      { t: "box", x: 0.7, y: 0.4, z: 0.5, w: 6.1, h: 0.25, d: 0.15, c: P.darkwood }, // top rail
      // straw bedding inside stalls
      ...rep(3, (i) => ({ t: "box", x: 1 + i * 1.7, y: 0.4, z: 0.8, w: 1.4, h: 0.25, d: 1.6, c: P.hay })),
      // hay feed racks at stall fronts
      ...rep(3, (i) => ({ t: "box", x: 1 + i * 1.7, y: 1.1, z: 2.3, w: 1.4, h: 0.5, d: 0.3, c: P.hay })),
      // hay bales + trough front
      { t: "box", x: 1.4, y: 0.4, z: 4.4, w: 1.3, h: 1, d: 1, c: P.hay },
      { t: "box", x: 2.7, y: 0.4, z: 4.7, w: 1.3, h: 1, d: 1, c: P.crop },
      { t: "box", x: 4.6, y: 0.4, z: 4.8, w: 1.8, h: 0.5, d: 0.7, c: P.darkwood }, // trough
      { t: "box", x: 4.7, y: 0.6, z: 4.9, w: 1.6, h: 0.3, d: 0.5, c: P.hay },
    ] },

  /* ==================================================== in2-henhouse-interior */
  { id: "in2-henhouse-interior", group: "interior", title: "Henhouse interior", tags: ["Nests", "Roost"],
    meta: { size: "8×7", materials: "Plank, straw", best: "Nest boxes and a roosting bar" },
    note: "A bank of straw-lined nest boxes against the back; a roost bar above and a feed pan in front.",
    parts: [
      ...shell(P.wood, P.wood),
      // nest box bank north wall (two tiers)
      { t: "box", x: 0.7, y: 0.4, z: 0.6, w: 5.6, h: 1.8, d: 1, c: P.darkwood },
      ...rep(5, (i) => ({ t: "box", x: 0.85 + i * 1.08, y: 0.5, z: 0.5, w: 0.9, h: 0.7, d: 0.12, c: P.black })), // lower openings
      ...rep(5, (i) => ({ t: "box", x: 0.85 + i * 1.08, y: 1.35, z: 0.5, w: 0.9, h: 0.7, d: 0.12, c: P.black })), // upper openings
      ...rep(5, (i) => ({ t: "box", x: 0.9 + i * 1.08, y: 0.5, z: 0.55, w: 0.8, h: 0.15, d: 0.4, c: P.hay })), // straw peeking
      // roost bar above, on posts
      { t: "box", x: 1.2, y: 0.4, z: 3.2, w: 0.18, h: 1.6, d: 0.18, c: P.log },
      { t: "box", x: 5, y: 0.4, z: 3.2, w: 0.18, h: 1.6, d: 0.18, c: P.log },
      { t: "cyl", x: 1.2, y: 1.8, z: 3.3, r: 0.12, h: 0.12, c: P.wood, n: 8 },
      { t: "box", x: 1.2, y: 1.8, z: 3.25, w: 4, h: 0.16, d: 0.16, c: P.log },
      // feed pan + straw front
      { t: "cyl", x: 3, y: 0.4, z: 4.8, r: 0.6, h: 0.3, c: P.metal, n: 12 },
      { t: "cyl", x: 3, y: 0.7, z: 4.8, r: 0.5, h: 0.05, c: P.crop, n: 12 },
      { t: "box", x: 4.8, y: 0.4, z: 5, w: 1, h: 0.3, d: 1, c: P.hay },
    ] },

  /* ============================================================== in2-aviary-interior */
  { id: "in2-aviary-interior", group: "interior", title: "Aviary interior", tags: ["Birds", "Perches"],
    meta: { size: "8×7", materials: "Wood, mesh", best: "A bright room of perches and cages" },
    note: "A tall mesh-fronted cage on the back wall with perches; potted greenery and a stand out front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // tall cage along north wall: frame
      { t: "box", x: 0.7, y: 0.4, z: 0.6, w: 5, h: 2.6, d: 1.2, c: P.darkwood, op: 0.25 },
      ...rep(6, (i) => ({ t: "box", x: 0.8 + i * 0.95, y: 0.4, z: 0.55, w: 0.08, h: 2.6, d: 0.08, c: P.iron })), // bars
      // perches inside
      { t: "box", x: 1, y: 1.3, z: 1, w: 4.4, h: 0.12, d: 0.12, c: P.log },
      { t: "box", x: 1.4, y: 2, z: 1.4, w: 3.6, h: 0.12, d: 0.12, c: P.log },
      // little birds (small bright boxes) on perches
      ...rep(3, (i) => ({ t: "box", x: 1.4 + i * 1.4, y: 1.42, z: 1, w: 0.25, h: 0.3, d: 0.25, c: [P.red, P.gold, P.blue][i] })),
      ...rep(2, (i) => ({ t: "box", x: 2.2 + i * 1.6, y: 2.12, z: 1.4, w: 0.25, h: 0.3, d: 0.25, c: [P.green, P.copper][i] })),
      // potted greenery + bird stand front
      { t: "cyl", x: 2, y: 0.4, z: 4.4, r: 0.5, h: 0.6, c: P.clay, n: 12 },
      { t: "dome", x: 2, y: 1, z: 4.4, r: 0.7, h: 0.9, c: P.leaf, n: 12, lat: 4 },
      { t: "box", x: 4.6, y: 0.4, z: 4.6, w: 0.2, h: 1.8, d: 0.2, c: P.darkwood }, // stand
      { t: "box", x: 4.2, y: 2.2, z: 4.6, w: 1, h: 0.14, d: 0.14, c: P.log }, // top perch
    ] },

  /* =================================================== in2-greenhouse-interior */
  { id: "in2-greenhouse-interior", group: "interior", title: "Greenhouse interior", tags: ["Planters", "Glass"],
    meta: { size: "8×7", materials: "Glass, planters", best: "Raised beds under a glass wall" },
    note: "Glass back walls let light onto rows of raised planters of crops; watering cans up front.",
    parts: [
      // glass-tinted shell
      { t: "box", x: 0, y: 0, z: 0, w: 8, h: 0.4, d: 7, c: P.stone },
      { t: "box", x: 0, y: 0.4, z: 0, w: 8, h: 3, d: 0.4, c: P.glass, op: 0.45 },
      { t: "box", x: 0, y: 0.4, z: 0, w: 0.4, h: 3, d: 7, c: P.glass, op: 0.45 },
      // glazing bars on north wall
      ...rep(5, (i) => ({ t: "box", x: 1 + i * 1.4, y: 0.4, z: 0.38, w: 0.1, h: 3, d: 0.06, c: P.darkwood })),
      // raised planter rows
      ...rep(2, (r) => ({ t: "box", x: 0.8, y: 0.4, z: 1 + r * 1.6, w: 5.6, h: 0.7, d: 0.9, c: P.darkwood })),
      ...rep(2, (r) => ({ t: "box", x: 0.9, y: 1.1, z: 1.05 + r * 1.6, w: 5.4, h: 0.25, d: 0.8, c: P.soil })),
      ...rep(2, (r) => rep(6, (i) => ({ t: "cone", x: 1.3 + i * 0.9, y: 1.35, z: 1.45 + r * 1.6, r: 0.22, h: 0.6, c: P.crop, n: 6 }))).flat(),
      // watering cans front
      { t: "cyl", x: 2, y: 0.4, z: 4.6, r: 0.4, h: 0.7, c: P.metal, n: 10 },
      { t: "box", x: 1.6, y: 0.7, z: 4.6, w: 0.6, h: 0.12, d: 0.12, c: P.metal }, // spout
      { t: "cyl", x: 4.4, y: 0.4, z: 5, r: 0.4, h: 0.7, c: P.copper, n: 10 },
    ] },

  /* =================================================== in2-observatory-interior */
  { id: "in2-observatory-interior", group: "interior", title: "Observatory interior", tags: ["Telescope", "Stars"],
    meta: { size: "8×7", materials: "Stone, brass", best: "A telescope under an open dome" },
    note: "A great brass telescope on a tripod points up from the centre; star charts and a desk behind.",
    parts: [
      ...shell(P.stone, P.stone),
      // star charts north wall
      ...rep(2, (i) => ({ t: "box", x: 1.2 + i * 2.6, y: 1, z: 0.42, w: 2, h: 1.8, d: 0.06, c: P.blue })),
      ...rep(6, (i) => ({ t: "box", x: 1.4 + i * 0.8, y: 1.6 + (i % 3) * 0.4, z: 0.4, w: 0.12, h: 0.12, d: 0.05, c: P.glow })), // stars
      // desk with charts on west wall
      { t: "box", x: 0.5, y: 0.4, z: 1, w: 1, h: 1, d: 2, c: P.darkwood },
      { t: "box", x: 0.6, y: 1.4, z: 1.2, w: 0.7, h: 0.06, d: 1, c: P.canvas },
      // telescope: tripod legs + tube angled up toward the back (stepped boxes)
      { t: "box", x: 3.4, y: 0.4, z: 3.6, w: 0.16, h: 1.4, d: 0.16, c: P.darkwood },
      { t: "box", x: 4.4, y: 0.4, z: 3.4, w: 0.16, h: 1.4, d: 0.16, c: P.darkwood },
      { t: "box", x: 3.9, y: 0.4, z: 4.5, w: 0.16, h: 1.4, d: 0.16, c: P.darkwood },
      { t: "box", x: 3.95, y: 1.7, z: 3.9, r: 0.3, w: 0.6, h: 0.6, d: 0.6, c: P.copper }, // mount yoke
      ...rep(5, (i) => ({ t: "box", x: 3.7, y: 1.8 + i * 0.28, z: 4.6 - i * 0.45, w: 0.5, h: 0.4, d: 0.5, c: P.gold })), // angled tube
      { t: "box", x: 3.78, y: 1.7, z: 4.7, w: 0.34, h: 0.34, d: 0.34, c: P.copper }, // eyepiece (low front)
      // stool front
      { t: "box", x: 5.6, y: 0.4, z: 4.8, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================ in2-classroom */
  { id: "in2-classroom", group: "interior", title: "Classroom", tags: ["Desks", "Board"],
    meta: { size: "8×7", materials: "Plank, slate", best: "A schoolroom of desks and a board" },
    note: "A big slate board on the back wall; rows of small paired desks face it from the open floor.",
    parts: [
      ...shell(P.wood, P.plaster),
      // slate board north wall
      { t: "box", x: 1.6, y: 1, z: 0.42, w: 4, h: 1.8, d: 0.1, c: P.slate },
      { t: "box", x: 1.6, y: 1, z: 0.42, w: 4, h: 1.8, d: 0.1, c: P.slate },
      { t: "box", x: 2, y: 1.6, z: 0.36, w: 2.4, h: 0.5, d: 0.04, c: P.cloth }, // chalk marks
      // teacher's desk
      { t: "box", x: 0.7, y: 0.4, z: 1.4, w: 1.4, h: 1, d: 0.9, c: P.darkwood },
      // two rows of paired pupil desks
      ...rep(2, (r) => rep(2, (i) => ({ t: "box", x: 1.6 + i * 2.2, y: 0.4, z: 3 + r * 1.6, w: 1.6, h: 0.8, d: 0.7, c: P.wood }))).flat(),
      ...rep(2, (r) => rep(2, (i) => ({ t: "box", x: 1.6 + i * 2.2, y: 0.4, z: 3.7 + r * 1.6, w: 1.6, h: 0.5, d: 0.4, c: P.darkwood }))).flat(), // benches
      ...rep(2, (r) => rep(2, (i) => ({ t: "box", x: 1.8 + i * 2.2, y: 0.88, z: 3.1 + r * 1.6, w: 0.5, h: 0.04, d: 0.4, c: P.cloth }))).flat(), // slates on desks
    ] },

  /* ========================================================= in2-counting-house */
  { id: "in2-counting-house", group: "interior", title: "Counting house", tags: ["Coins", "Ledgers"],
    meta: { size: "8×7", materials: "Darkwood, gold", best: "Tallying coins and ledgers" },
    note: "A ledger cabinet on the back wall; a counting table heaped with coin stacks and a strongbox.",
    parts: [
      ...shell(P.wood, P.plaster),
      // ledger cabinet north wall
      { t: "box", x: 0.7, y: 0.4, z: 0.4, w: 4, h: 2.4, d: 0.55, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 0.9, y: 0.7 + i * 0.5, z: 0.5, w: 3.6, h: 0.1, d: 0.45, c: P.wood })),
      ...rep(3, (r) => rep(4, (i) => ({ t: "box", x: 1 + i * 0.9, y: 0.85 + r * 0.5, z: 0.5, w: 0.7, h: 0.35, d: 0.4, c: r % 2 ? P.red : P.brick }))).flat(), // ledgers
      // counting table front
      { t: "box", x: 2.6, y: 0.4, z: 3.4, w: 3.2, h: 1, d: 1.4, c: P.darkwood },
      // coin stacks on the table
      ...rep(4, (i) => ({ t: "cyl", x: 3 + i * 0.6, y: 1.4, z: 3.8, r: 0.18, h: 0.2 + (i % 3) * 0.15, c: P.gold, n: 10 })),
      ...rep(3, (i) => ({ t: "cyl", x: 3.3 + i * 0.6, y: 1.4, z: 4.4, r: 0.16, h: 0.15 + (i % 2) * 0.2, c: P.copper, n: 10 })),
      { t: "box", x: 5.2, y: 1.4, z: 3.7, w: 0.8, h: 0.08, d: 0.6, c: P.canvas }, // open ledger
      // strongbox + stool front
      { t: "box", x: 1.4, y: 0.4, z: 4.6, w: 1.2, h: 0.8, d: 0.9, c: P.iron },
      { t: "box", x: 1.4, y: 1.2, z: 4.6, w: 1.2, h: 0.18, d: 0.9, c: P.metal },
      { t: "box", x: 5.4, y: 0.4, z: 5, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================== in2-jail-cell */
  { id: "in2-jail-cell", group: "interior", title: "Jail cell", tags: ["Bars", "Cot"],
    meta: { size: "8×7", materials: "Stone, iron", best: "A barred holding cell" },
    note: "Stone cell with a straw cot in the corner; iron bars close off the open front of the room.",
    parts: [
      ...shell(P.stone, P.stone),
      // tiny barred window north wall
      { t: "box", x: 4, y: 1.8, z: 0.42, w: 1, h: 0.8, d: 0.06, c: P.black },
      ...rep(3, (i) => ({ t: "box", x: 4.2 + i * 0.3, y: 1.8, z: 0.38, w: 0.08, h: 0.8, d: 0.06, c: P.iron })),
      // straw cot back-left
      { t: "box", x: 0.7, y: 0.4, z: 0.8, w: 1.6, h: 0.5, d: 2.4, c: P.darkwood },
      { t: "box", x: 0.8, y: 0.9, z: 0.9, w: 1.4, h: 0.25, d: 2.2, c: P.hay },
      // bucket + bowl
      { t: "cyl", x: 3, y: 0.4, z: 2.6, r: 0.35, h: 0.6, c: P.iron, n: 10 },
      { t: "cyl", x: 4.2, y: 0.4, z: 2.4, r: 0.3, h: 0.2, c: P.metal, n: 10 },
      // iron bars closing the front (full-width grille)
      { t: "box", x: 0.4, y: 0.4, z: 5.4, w: 6, h: 0.15, d: 0.2, c: P.iron }, // bottom rail
      { t: "box", x: 0.4, y: 2.6, z: 5.4, w: 6, h: 0.15, d: 0.2, c: P.iron }, // top rail
      ...rep(9, (i) => ({ t: "box", x: 0.5 + i * 0.7, y: 0.4, z: 5.45, w: 0.1, h: 2.4, d: 0.1, c: P.iron })),
    ] },

  /* ============================================================ in2-bathhouse-hot */
  { id: "in2-bathhouse-hot", group: "interior", title: "Hot bathhouse", tags: ["Pool", "Steam"],
    meta: { size: "8×7", materials: "Stone, water, steam", best: "A steaming sunken hot pool" },
    note: "A large sunken hot pool fills the centre with rising steam; a stone bench and brazier beside it.",
    parts: [
      ...shell(P.whitestone, P.stone),
      // towel shelf north wall
      { t: "box", x: 5, y: 2, z: 0.4, w: 2, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 5.3, y: 2.2, z: 0.6, w: 0.6, h: 0.4, d: 0.3, c: P.snow },
      // big sunken pool
      { t: "box", x: 0.8, y: 0.4, z: 1, w: 5, h: 0.6, d: 3.2, c: P.stone },
      { t: "box", x: 1.1, y: 0.55, z: 1.3, w: 4.4, h: 0.4, d: 2.6, c: P.water },
      // steam wisps (translucent cones) rising from pool
      ...rep(4, (i) => ({ t: "cone", x: 1.6 + i * 1.1, y: 1, z: 2 + (i % 2) * 0.6, r: 0.35, h: 1.4, c: P.snow, n: 6, op: 0.4 })),
      // stone bench + brazier front
      { t: "box", x: 1.2, y: 0.4, z: 4.8, w: 2.4, h: 0.5, d: 0.7, c: P.whitestone },
      { t: "cyl", x: 5, y: 0.4, z: 4.8, r: 0.45, h: 1, c: P.metal, n: 10 },
      { t: "cone", x: 5, y: 1.4, z: 4.8, r: 0.3, h: 0.5, c: P.glow, n: 8 },
    ] },

  /* ============================================================ in2-shrine-room */
  { id: "in2-shrine-room", group: "interior", title: "Shrine room", tags: ["Shrine", "Offerings"],
    meta: { size: "8×7", materials: "Whitestone, gold", best: "A small shrine with offerings" },
    note: "A tiered shrine against the back wall topped with an idol; candles and offering bowls in front.",
    parts: [
      ...shell(P.whitestone, P.whitestone),
      // tiered shrine back-centre
      { t: "box", x: 2.4, y: 0.4, z: 0.7, w: 3, h: 0.6, d: 1.4, c: P.stone },
      { t: "box", x: 2.8, y: 1, z: 0.9, w: 2.2, h: 0.6, d: 1, c: P.whitestone },
      { t: "box", x: 3.2, y: 1.6, z: 1.1, w: 1.4, h: 0.6, d: 0.7, c: P.gold },
      // idol on top
      { t: "box", x: 3.5, y: 2.2, z: 1.25, w: 0.8, h: 0.9, d: 0.4, c: P.gold },
      { t: "dome", x: 3.9, y: 3.1, z: 1.45, r: 0.3, h: 0.35, c: P.gold, n: 10, lat: 3 },
      // candles flanking
      ...rep(2, (i) => ({ t: "cyl", x: 2.7 + i * 2.4, y: 1, z: 1, r: 0.12, h: 0.6, c: P.cloth, n: 8 })),
      ...rep(2, (i) => ({ t: "cone", x: 2.7 + i * 2.4, y: 1.6, z: 1, r: 0.1, h: 0.3, c: P.glow, n: 8 })),
      // offering rug + bowls front
      { t: "box", x: 3, y: 0.41, z: 2.6, w: 2, h: 0.06, d: 2.6, c: P.red },
      { t: "cyl", x: 3.4, y: 0.4, z: 4, r: 0.3, h: 0.25, c: P.copper, n: 10 },
      { t: "cyl", x: 4.4, y: 0.4, z: 4.2, r: 0.3, h: 0.25, c: P.gold, n: 10 },
      { t: "cone", x: 4.4, y: 0.65, z: 4.2, r: 0.22, h: 0.4, c: P.leaf, n: 6 }, // incense/herb
    ] },

  /* ============================================================== in2-musicroom */
  { id: "in2-musicroom", group: "interior", title: "Music room", tags: ["Lute", "Drum"],
    meta: { size: "8×7", materials: "Wood, cloth", best: "Instruments and a player's stool" },
    note: "Instruments hang on the back wall above a harp; a stool and a drum sit in the open front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // lutes hanging on north wall
      ...rep(3, (i) => ({ t: "cyl", x: 1.4 + i * 1.6, y: 1.6, z: 0.5, r: 0.4, h: 0.25, c: P.copper, n: 12 })),
      ...rep(3, (i) => ({ t: "box", x: 1.7 + i * 1.6, y: 1.85, z: 0.5, w: 0.18, h: 1, d: 0.18, c: P.darkwood })), // necks
      // shelf of small pipes
      { t: "box", x: 4.6, y: 1, z: 0.4, w: 2, h: 0.2, d: 0.45, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 5 + i * 0.5, y: 1.2, z: 0.6, r: 0.08, h: 0.6, c: P.log, n: 6 })),
      // harp in back-left corner: frame + strings
      { t: "box", x: 1, y: 0.4, z: 1.6, w: 0.2, h: 2.4, d: 0.2, c: P.gold },
      { t: "wedge", x: 1, y: 0.4, z: 1.6, w: 1.6, h: 2.4, d: 0.2, c: P.gold, flip: true },
      ...rep(6, (i) => ({ t: "box", x: 1.2 + i * 0.22, y: 0.6, z: 1.62, w: 0.04, h: 1.8 - i * 0.25, d: 0.04, c: P.cloth })),
      // drum + stool front
      { t: "cyl", x: 3.4, y: 0.4, z: 4, r: 0.6, h: 0.9, c: P.darkwood, n: 12 },
      { t: "cyl", x: 3.4, y: 1.3, z: 4, r: 0.6, h: 0.05, c: P.canvas, n: 12 },
      { t: "box", x: 5, y: 0.4, z: 4.6, w: 0.8, h: 0.9, d: 0.8, c: P.wood },
    ] },

  /* ============================================================= in2-trophy-hall */
  { id: "in2-trophy-hall", group: "interior", title: "Trophy hall", tags: ["Mounts", "Pelts"],
    meta: { size: "8×7", materials: "Timber, pelts", best: "Mounted heads and hunting spoils" },
    note: "Mounted heads and pelts cover the back walls; a pelt rug and a display table fill the front.",
    parts: [
      ...shell(P.wood, P.log),
      // mounted heads north wall (plaques + snout boxes)
      ...rep(3, (i) => ({ t: "box", x: 1 + i * 1.9, y: 1.6, z: 0.42, w: 1, h: 1, d: 0.1, c: P.darkwood })),
      ...rep(3, (i) => ({ t: "box", x: 1.3 + i * 1.9, y: 1.8, z: 0.4, w: 0.5, h: 0.6, d: 0.4, c: P.brick })),
      ...rep(3, (i) => ({ t: "cone", x: 1.55 + i * 1.9, y: 2.4, z: 0.55, r: 0.2, h: 0.5, c: P.hay, n: 6 })), // antlers-ish
      // pelt hanging on west wall
      { t: "box", x: 0.42, y: 0.8, z: 3.4, w: 0.08, h: 1.8, d: 2.2, c: P.copper },
      // pelt rug front
      { t: "box", x: 2.4, y: 0.41, z: 3.4, w: 3, h: 0.06, d: 2.4, c: P.mud },
      { t: "dome", x: 3.9, y: 0.41, z: 4.6, r: 0.5, h: 0.15, c: P.brick, n: 10, lat: 3 }, // head of rug
      // display table with trophies
      { t: "box", x: 2.6, y: 0.4, z: 5, w: 2.6, h: 1, d: 1, c: P.darkwood },
      { t: "box", x: 3, y: 1.4, z: 5.3, w: 0.6, h: 0.8, d: 0.4, c: P.gold }, // cup
      { t: "cyl", x: 4.4, y: 1.4, z: 5.3, r: 0.25, h: 0.5, c: P.metal, n: 10 },
    ] },

  /* =========================================================== in2-cottage-plan */
  { id: "in2-cottage-plan", group: "interior", title: "Cottage plan", tags: ["Two rooms", "Home"],
    meta: { size: "8×7", materials: "Plank, plaster", best: "A cottage split into kitchen + bedroom" },
    note: "A low interior wall divides the floor: kitchen with hearth on the left, a bed and chest on the right.",
    parts: [
      ...shell(P.wood, P.plaster),
      // interior dividing wall running along z at x≈3.6 (low, half height)
      { t: "box", x: 3.5, y: 0.4, z: 0.4, w: 0.3, h: 2, d: 6.2, c: P.plaster },
      // --- LEFT ROOM: kitchen ---
      // hearth back-left
      { t: "box", x: 0.7, y: 0.4, z: 0.7, w: 1.6, h: 0.6, d: 1.4, c: P.stone },
      { t: "cone", x: 1.5, y: 1, z: 1.4, r: 0.4, h: 0.6, c: P.fire, n: 10 },
      { t: "cyl", x: 1.5, y: 1, z: 1.4, r: 0.5, h: 0.6, c: P.iron, n: 12 }, // pot
      { t: "box", x: 1.4, y: 1.6, z: 0.7, w: 0.5, h: 1.4, d: 0.5, c: P.stone }, // chimney
      // kitchen table + stool front-left
      { t: "box", x: 0.9, y: 0.4, z: 3.6, w: 2, h: 1, d: 1.2, c: P.wood },
      { t: "box", x: 1.2, y: 1.4, z: 3.9, w: 0.5, h: 0.14, d: 0.5, c: P.red },
      { t: "box", x: 1.4, y: 0.4, z: 5, w: 0.7, h: 0.9, d: 0.7, c: P.darkwood },
      // --- RIGHT ROOM: bedroom ---
      // bed back-right
      { t: "box", x: 4.1, y: 0.4, z: 0.8, w: 1.9, h: 0.55, d: 3.2, c: P.darkwood },
      { t: "box", x: 4.2, y: 0.95, z: 0.9, w: 1.7, h: 0.35, d: 3, c: P.cloth },
      { t: "box", x: 4.3, y: 1.3, z: 1, w: 1.5, h: 0.3, d: 0.8, c: P.snow }, // pillow
      // chest at foot
      { t: "box", x: 4.4, y: 0.4, z: 4.6, w: 1.6, h: 0.9, d: 0.9, c: P.darkwood },
      { t: "box", x: 4.4, y: 1.3, z: 4.6, w: 1.6, h: 0.2, d: 0.9, c: P.wood },
      // rug + lamp
      { t: "box", x: 4.2, y: 0.41, z: 5.6, w: 1.6, h: 0.06, d: 1, c: P.red },
      { t: "box", x: 6, y: 0.4, z: 0.9, w: 0.7, h: 1, d: 0.7, c: P.wood }, // bedside box
      { t: "cone", x: 6.35, y: 1.4, z: 1.25, r: 0.16, h: 0.3, c: P.glow, n: 8 },
    ] },

  /* ============================================================ in2-smithy-plan */
  { id: "in2-smithy-plan", group: "interior", title: "Smithy plan", tags: ["Two rooms", "Forge"],
    meta: { size: "8×7", materials: "Stone, iron", best: "A smithy split into forge + store" },
    note: "Low wall divides the floor: forge and anvil on the left, a store of bars and barrels on the right.",
    parts: [
      ...shell(P.stone, P.stone),
      // dividing wall
      { t: "box", x: 3.5, y: 0.4, z: 0.4, w: 0.3, h: 2, d: 6.2, c: P.stone },
      // --- LEFT ROOM: forge ---
      { t: "cyl", x: 1.5, y: 0.4, z: 1.4, r: 0.9, h: 1.1, c: P.stone, n: 14 },
      { t: "cone", x: 1.5, y: 1.5, z: 1.4, r: 0.45, h: 1.4, c: P.black, n: 12 },
      { t: "cone", x: 1.5, y: 1.5, z: 1.4, r: 0.28, h: 0.5, c: P.fire, n: 10 },
      // anvil on stump
      { t: "box", x: 1.3, y: 0.4, z: 3.8, w: 0.8, h: 0.8, d: 0.8, c: P.wood },
      { t: "box", x: 1.2, y: 1.2, z: 3.9, w: 1, h: 0.3, d: 0.55, c: P.metal },
      { t: "box", x: 1.9, y: 1.5, z: 4, w: 0.4, h: 0.22, d: 0.3, c: P.metal },
      // quench barrel
      { t: "cyl", x: 1.4, y: 0.4, z: 5.3, r: 0.5, h: 1, c: P.darkwood, n: 12 },
      { t: "cyl", x: 1.4, y: 1.4, z: 5.3, r: 0.4, h: 0.05, c: P.water, n: 12 },
      // --- RIGHT ROOM: store ---
      // bar rack on north wall (right half)
      { t: "box", x: 4.2, y: 2, z: 0.4, w: 2.6, h: 0.2, d: 0.4, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 4.4 + i * 0.6, y: 0.7, z: 0.55, w: 0.12, h: 1.4, d: 0.12, c: P.iron })),
      // ingot bin + barrels
      { t: "box", x: 4.2, y: 0.4, z: 2.6, w: 1.6, h: 0.8, d: 1, c: P.darkwood },
      { t: "box", x: 4.4, y: 1.2, z: 2.8, w: 1.2, h: 0.25, d: 0.6, c: P.metal },
      { t: "cyl", x: 4.6, y: 0.4, z: 4.4, r: 0.6, h: 1.2, c: P.wood, n: 12 },
      { t: "cyl", x: 6, y: 0.4, z: 5, r: 0.6, h: 1.2, c: P.darkwood, n: 12 },
    ] },

  /* ============================================================ in2-tavern-plan */
  { id: "in2-tavern-plan", group: "interior", title: "Tavern plan", tags: ["Two rooms", "Bar"],
    meta: { size: "8×7", materials: "Wood, copper", best: "A tavern split into bar + tables" },
    note: "Low wall splits the floor: serving bar with casks on the left, dining tables and benches on the right.",
    parts: [
      ...shell(P.wood, P.plaster),
      // dividing wall (shorter, leaves a doorway gap at front)
      { t: "box", x: 3.5, y: 0.4, z: 0.4, w: 0.3, h: 2, d: 4.4, c: P.plaster },
      // --- LEFT ROOM: bar ---
      // mug shelf north wall
      { t: "box", x: 0.8, y: 2, z: 0.4, w: 2.4, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 1.1 + i * 0.8, y: 2.2, z: 0.65, r: 0.16, h: 0.35, c: P.copper, n: 8 })),
      // casks stacked back-left
      { t: "cyl", x: 1.3, y: 0.4, z: 1.6, r: 0.6, h: 1.1, c: P.darkwood, n: 12 },
      { t: "cyl", x: 2.5, y: 0.4, z: 1.5, r: 0.6, h: 1.1, c: P.wood, n: 12 },
      // bar counter
      { t: "box", x: 0.7, y: 0.4, z: 3.4, w: 2.6, h: 1.1, d: 0.9, c: P.darkwood },
      { t: "box", x: 0.7, y: 1.5, z: 3.4, w: 2.6, h: 0.15, d: 0.9, c: P.wood },
      { t: "cyl", x: 1.3, y: 1.65, z: 3.8, r: 0.18, h: 0.3, c: P.copper, n: 8 }, // tankard
      { t: "box", x: 1.6, y: 0.4, z: 5, w: 0.7, h: 0.9, d: 0.7, c: P.wood }, // stool
      // --- RIGHT ROOM: tables ---
      ...rep(2, (r) => ({ t: "box", x: 4.4, y: 0.4, z: 1.2 + r * 2.6, w: 2.2, h: 1, d: 1.2, c: P.wood })),
      ...rep(2, (r) => ({ t: "box", x: 4.4, y: 0.4, z: 0.6 + r * 2.6, w: 2.2, h: 0.5, d: 0.45, c: P.darkwood })), // back bench
      ...rep(2, (r) => ({ t: "box", x: 4.4, y: 0.4, z: 2.5 + r * 2.6, w: 2.2, h: 0.5, d: 0.45, c: P.darkwood })), // front bench
      ...rep(2, (r) => ({ t: "cyl", x: 5, y: 1.4, z: 1.7 + r * 2.6, r: 0.2, h: 0.3, c: P.copper, n: 8 })), // mugs
      ...rep(2, (r) => ({ t: "cyl", x: 5.8, y: 1.4, z: 1.7 + r * 2.6, r: 0.22, h: 0.2, c: P.hay, n: 10 })), // bowls
    ] },
];
