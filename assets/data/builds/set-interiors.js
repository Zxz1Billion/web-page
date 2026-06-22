/* ============================================================================
   set-interiors.js — Cutaway interior room dioramas for the Pattern Book
   (group: "interior"). Each room shows a floor plus only the NORTH (low z) and
   WEST (low x) back walls, so the room stays open to the viewer. Furniture is
   authored back-to-front (back walls first, foreground last). See ./_kit.js.
   ========================================================================== */

import { P, rep, tree, fence } from "./_kit.js";

// shared cutaway shell: plank/stone floor + two back walls. Returns parts[].
const shell = (floor = P.wood, wall = P.plaster, w = 8, d = 7) => [
  { t: "box", x: 0, y: 0, z: 0, w, h: 0.4, d, c: floor },          // floor
  { t: "box", x: 0, y: 0.4, z: 0, w, h: 3, d: 0.4, c: wall },      // north wall (low z)
  { t: "box", x: 0, y: 0.4, z: 0, w: 0.4, h: 3, d, c: wall },      // west wall (low x)
];

export const SET = [
  /* ============================================================= int-bakery */
  { id: "int-bakery", group: "interior", title: "Bakery", tags: ["Oven", "Bread"],
    meta: { size: "8×7", materials: "Clay oven, plaster, plank", best: "A village baker working dough" },
    note: "Set the domed oven in the back corner with its mouth facing the room; keep a long prep table in the open centre.",
    parts: [
      ...shell(P.wood, P.plaster),
      // shelves on the north wall
      { t: "box", x: 1, y: 2, z: 0.4, w: 3, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "cyl", x: 1.6, y: 2.2, z: 0.7, r: 0.25, h: 0.5, c: P.clay, n: 10 },
      { t: "cyl", x: 2.6, y: 2.2, z: 0.7, r: 0.25, h: 0.5, c: P.clay, n: 10 },
      // domed clay oven in the back-left corner
      { t: "box", x: 0.6, y: 0.4, z: 0.6, w: 2.2, h: 1.3, d: 2.2, c: P.stone },
      { t: "dome", x: 1.7, y: 1.7, z: 1.7, r: 1.1, h: 1.1, c: P.clay, n: 14, lat: 4 },
      { t: "box", x: 1.3, y: 0.7, z: 2.7, w: 0.8, h: 0.7, d: 0.2, c: P.black }, // mouth
      { t: "box", x: 1.5, y: 2.8, z: 1.4, w: 0.5, h: 1.3, d: 0.5, c: P.stone }, // flue
      // flour sacks on the floor, mid-left
      { t: "box", x: 0.9, y: 0.4, z: 4.2, w: 0.8, h: 0.9, d: 0.8, c: P.cloth },
      { t: "box", x: 1.8, y: 0.4, z: 4.4, w: 0.7, h: 0.8, d: 0.7, c: P.canvas },
      // long prep table in the open centre-front
      { t: "box", x: 3.4, y: 0.4, z: 3, w: 3.4, h: 1, d: 1.4, c: P.wood },
      { t: "box", x: 3.6, y: 1.4, z: 3.2, w: 1, h: 0.12, d: 1, c: P.canvas }, // dough
      { t: "box", x: 5.2, y: 0.4, z: 4.8, w: 0.8, h: 1.2, d: 0.8, c: P.darkwood }, // stool
    ] },

  /* ============================================================= int-smithy */
  { id: "int-smithy", group: "interior", title: "Smithy", tags: ["Forge", "Anvil"],
    meta: { size: "8×7", materials: "Stone forge, iron, plank", best: "A blacksmith at the anvil" },
    note: "Put the hooded forge against the north wall, anvil on its stump out front, quench barrel beside it.",
    parts: [
      ...shell(P.stone, P.stone),
      // tool rack on west wall
      { t: "box", x: 0.4, y: 2, z: 1, w: 0.2, h: 0.2, d: 2.4, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 0.5, y: 1.2, z: 1.2 + i * 0.6, w: 0.12, h: 0.8, d: 0.12, c: P.iron })),
      // forge: stone cyl + black hood cone + flame
      { t: "cyl", x: 2, y: 0.4, z: 1.4, r: 1, h: 1.1, c: P.stone, n: 14 },
      { t: "cone", x: 2, y: 1.5, z: 1.4, r: 0.5, h: 1.4, c: P.black, n: 12 },
      { t: "cone", x: 2, y: 1.5, z: 1.4, r: 0.3, h: 0.5, c: P.fire, n: 10 },
      // ingot bin against north wall
      { t: "box", x: 3.8, y: 0.4, z: 0.6, w: 1.2, h: 0.7, d: 0.9, c: P.darkwood },
      { t: "box", x: 4, y: 1.1, z: 0.8, w: 0.8, h: 0.2, d: 0.5, c: P.metal },
      // anvil on a stump, centre-front
      { t: "box", x: 3.6, y: 0.4, z: 3.6, w: 0.9, h: 0.8, d: 0.9, c: P.wood },
      { t: "box", x: 3.5, y: 1.2, z: 3.7, w: 1.1, h: 0.3, d: 0.6, c: P.metal },
      { t: "box", x: 4.3, y: 1.5, z: 3.85, w: 0.5, h: 0.25, d: 0.3, c: P.metal }, // horn
      // quench barrel, front-right
      { t: "cyl", x: 5.6, y: 0.4, z: 4.6, r: 0.6, h: 1.1, c: P.darkwood, n: 12 },
      { t: "cyl", x: 5.6, y: 1.45, z: 4.6, r: 0.5, h: 0.05, c: P.water, n: 12 },
    ] },

  /* ============================================================ int-kitchen */
  { id: "int-kitchen", group: "interior", title: "Kitchen", tags: ["Hearth", "Cooking"],
    meta: { size: "8×7", materials: "Stone hearth, plank", best: "A cottage cooking fire" },
    note: "Firepit in the back-left with a pot on it; work table and crock shelves fill the centre and right.",
    parts: [
      ...shell(P.wood, P.plaster),
      // crock shelf on north wall
      { t: "box", x: 3.4, y: 1.9, z: 0.4, w: 3.4, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 3.9 + i * 1, y: 2.1, z: 0.7, r: 0.28, h: 0.55, c: P.clay, n: 10 })),
      // firepit + pot + flame, back-left
      { t: "box", x: 0.9, y: 0.4, z: 0.9, w: 1.8, h: 0.6, d: 1.8, c: P.stone },
      { t: "cone", x: 1.8, y: 1, z: 1.8, r: 0.4, h: 0.6, c: P.fire, n: 10 },
      { t: "cyl", x: 1.8, y: 1, z: 1.8, r: 0.55, h: 0.7, c: P.iron, n: 12 }, // cooking pot
      // barrel, mid-left
      { t: "cyl", x: 1.3, y: 0.4, z: 4, r: 0.65, h: 1.2, c: P.darkwood, n: 12 },
      // work table front-centre
      { t: "box", x: 3.2, y: 0.4, z: 3.4, w: 2.8, h: 1, d: 1.3, c: P.wood },
      { t: "box", x: 3.5, y: 1.4, z: 3.7, w: 0.6, h: 0.15, d: 0.6, c: P.red }, // chopping
      { t: "box", x: 5.4, y: 0.4, z: 4.9, w: 0.8, h: 1.1, d: 0.8, c: P.darkwood }, // stool
    ] },

  /* ============================================================ int-pantry */
  { id: "int-pantry", group: "interior", title: "Pantry larder", tags: ["Storage", "Cool"],
    meta: { size: "8×7", materials: "Stone, plank shelves", best: "A cool store for crocks and barrels" },
    note: "Line both back walls with deep shelves of crocks; stack barrels and sacks along the open front.",
    parts: [
      ...shell(P.stone, P.stone),
      // north wall shelves (two tiers)
      { t: "box", x: 1, y: 1.3, z: 0.4, w: 5.5, h: 0.2, d: 0.55, c: P.darkwood },
      { t: "box", x: 1, y: 2.3, z: 0.4, w: 5.5, h: 0.2, d: 0.55, c: P.darkwood },
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 1.5, z: 0.7, r: 0.25, h: 0.5, c: P.clay, n: 10 })),
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 2.5, z: 0.7, r: 0.25, h: 0.45, c: P.brick, n: 10 })),
      // west wall shelf
      { t: "box", x: 0.4, y: 1.6, z: 1, w: 0.55, h: 0.2, d: 4, c: P.darkwood },
      ...rep(4, (i) => ({ t: "cyl", x: 0.7, y: 1.8, z: 1.4 + i * 0.9, r: 0.22, h: 0.45, c: P.hay, n: 10 })),
      // barrels and sacks on the floor, front
      { t: "cyl", x: 2.2, y: 0.4, z: 4.3, r: 0.65, h: 1.2, c: P.darkwood, n: 12 },
      { t: "cyl", x: 3.6, y: 0.4, z: 4.6, r: 0.65, h: 1.2, c: P.wood, n: 12 },
      { t: "box", x: 4.8, y: 0.4, z: 5, w: 0.9, h: 0.9, d: 0.9, c: P.cloth },
      { t: "box", x: 5.8, y: 0.4, z: 5.2, w: 0.8, h: 0.8, d: 0.8, c: P.canvas },
    ] },

  /* =========================================================== int-bedroom */
  { id: "int-bedroom", group: "interior", title: "Bedroom", tags: ["Bed", "Chest"],
    meta: { size: "8×7", materials: "Plank, cloth, plaster", best: "A simple sleeping chamber" },
    note: "Push the bed into the back-left corner, rug beside it, chest at the foot, a small lamp on a bedside box.",
    parts: [
      ...shell(P.wood, P.plaster),
      // shelf on north wall
      { t: "box", x: 4.5, y: 2, z: 0.4, w: 2.5, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 4.9, y: 2.2, z: 0.6, w: 0.4, h: 0.5, d: 0.3, c: P.red },
      // bed in back-left: frame + mattress + pillow
      { t: "box", x: 0.7, y: 0.4, z: 0.8, w: 2.2, h: 0.55, d: 3.6, c: P.darkwood },
      { t: "box", x: 0.8, y: 0.95, z: 0.9, w: 2, h: 0.35, d: 3.4, c: P.cloth },
      { t: "box", x: 0.9, y: 1.3, z: 1, w: 1.8, h: 0.3, d: 0.9, c: P.snow }, // pillow
      // rug beside the bed
      { t: "box", x: 3.2, y: 0.41, z: 2.5, w: 2.4, h: 0.06, d: 2.6, c: P.red },
      // bedside box + lamp
      { t: "box", x: 3.1, y: 0.4, z: 1, w: 0.9, h: 1, d: 0.9, c: P.wood },
      { t: "box", x: 3.35, y: 1.4, z: 1.25, w: 0.4, h: 0.4, d: 0.4, c: P.clay },
      { t: "cone", x: 3.55, y: 1.8, z: 1.45, r: 0.15, h: 0.3, c: P.glow, n: 8 },
      // chest at foot, front
      { t: "box", x: 3.4, y: 0.4, z: 4.6, w: 2, h: 1, d: 1, c: P.darkwood },
      { t: "box", x: 3.4, y: 1.2, z: 4.6, w: 2, h: 0.25, d: 1, c: P.wood }, // lid
    ] },

  /* ========================================================= int-dininghall */
  { id: "int-dininghall", group: "interior", title: "Dining hall", tags: ["Table", "Hearth"],
    meta: { size: "8×7", materials: "Plank, stone hearth", best: "A household sharing a meal" },
    note: "Run one long table down the open centre with a bench each side; a hearth warms the back-left corner.",
    parts: [
      ...shell(P.wood, P.plaster),
      // wall shelf with crocks
      { t: "box", x: 4, y: 2.1, z: 0.4, w: 3, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 4.5 + i * 0.9, y: 2.3, z: 0.65, r: 0.24, h: 0.45, c: P.clay, n: 10 })),
      // hearth back-left
      { t: "box", x: 0.7, y: 0.4, z: 0.7, w: 1.8, h: 0.7, d: 1.4, c: P.stone },
      { t: "cone", x: 1.6, y: 1.1, z: 1.4, r: 0.45, h: 0.7, c: P.fire, n: 10 },
      { t: "box", x: 1.5, y: 1.8, z: 0.7, w: 0.6, h: 1.6, d: 0.6, c: P.stone }, // chimney
      // long table down the centre
      { t: "box", x: 2.6, y: 0.4, z: 2.6, w: 4, h: 1, d: 1.4, c: P.wood },
      // benches both sides
      { t: "box", x: 2.6, y: 0.4, z: 1.9, w: 4, h: 0.55, d: 0.5, c: P.darkwood },
      { t: "box", x: 2.6, y: 0.4, z: 4.2, w: 4, h: 0.55, d: 0.5, c: P.darkwood },
      // food on table
      { t: "cyl", x: 3.4, y: 1.4, z: 3.3, r: 0.3, h: 0.2, c: P.hay, n: 10 },
      { t: "cyl", x: 5, y: 1.4, z: 3.3, r: 0.25, h: 0.3, c: P.copper, n: 10 },
    ] },

  /* ============================================================ int-library */
  { id: "int-library", group: "interior", title: "Library", tags: ["Books", "Desk"],
    meta: { size: "8×7", materials: "Darkwood, plaster", best: "A reading and copying room" },
    note: "Tall bookcases line both back walls; a reading desk with a chair and lit candle sits in the open front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // tall bookcase on north wall
      { t: "box", x: 0.7, y: 0.4, z: 0.4, w: 6, h: 2.6, d: 0.55, c: P.darkwood },
      ...rep(4, (i) => ({ t: "box", x: 0.9, y: 0.7 + i * 0.6, z: 0.5, w: 5.6, h: 0.12, d: 0.45, c: P.wood })),
      ...rep(4, (i) => ({ t: "box", x: 0.9 + i * 1.4, y: 0.85, z: 0.5, w: 1.1, h: 0.45, d: 0.4, c: i % 2 ? P.red : P.blue })),
      ...rep(4, (i) => ({ t: "box", x: 0.9 + i * 1.4, y: 1.45, z: 0.5, w: 1.1, h: 0.45, d: 0.4, c: i % 2 ? P.green : P.brick })),
      // west wall bookcase
      { t: "box", x: 0.4, y: 0.4, z: 1.2, w: 0.55, h: 2.4, d: 4, c: P.darkwood },
      // desk + chair + candle, front
      { t: "box", x: 3, y: 0.4, z: 3.4, w: 2.6, h: 1, d: 1.3, c: P.wood },
      { t: "box", x: 3.4, y: 1.4, z: 3.7, w: 0.9, h: 0.08, d: 0.7, c: P.cloth }, // open book
      { t: "box", x: 5, y: 1.4, z: 3.7, w: 0.12, h: 0.4, d: 0.12, c: P.cloth }, // candle
      { t: "cone", x: 5.06, y: 1.8, z: 3.76, r: 0.1, h: 0.25, c: P.glow, n: 8 },
      { t: "box", x: 3.7, y: 0.4, z: 4.9, w: 0.9, h: 0.6, d: 0.9, c: P.darkwood }, // chair seat
      { t: "box", x: 3.7, y: 1, z: 5.7, w: 0.9, h: 0.9, d: 0.15, c: P.darkwood }, // chair back
    ] },

  /* ============================================================== int-study */
  { id: "int-study", group: "interior", title: "Scholar's study", tags: ["Desk", "Scrolls"],
    meta: { size: "8×7", materials: "Darkwood, plaster", best: "A private writing nook" },
    note: "A corner desk under the north wall, a shelf of scrolls above, a chair and a globe out front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // scroll shelf high on north wall
      { t: "box", x: 0.8, y: 2.1, z: 0.4, w: 4, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(6, (i) => ({ t: "cyl", x: 1.1 + i * 0.6, y: 1.7, z: 0.65, r: 0.12, h: 0.4, c: P.canvas, n: 8 })),
      // desk in the back-left corner
      { t: "box", x: 0.7, y: 0.4, z: 0.7, w: 3, h: 1, d: 1.3, c: P.darkwood },
      { t: "box", x: 1, y: 1.4, z: 1, w: 1, h: 0.08, d: 0.7, c: P.cloth }, // paper
      { t: "box", x: 2.6, y: 1.4, z: 1, w: 0.3, h: 0.3, d: 0.3, c: P.clay }, // inkpot
      { t: "box", x: 1.4, y: 0.4, z: 2.3, w: 0.9, h: 0.6, d: 0.9, c: P.wood }, // stool
      // small bookshelf on west wall
      { t: "box", x: 0.4, y: 0.4, z: 3.6, w: 0.5, h: 1.8, d: 2.4, c: P.darkwood },
      // globe on a stand, front
      { t: "box", x: 4, y: 0.4, z: 4.2, w: 0.5, h: 1, d: 0.5, c: P.wood },
      { t: "dome", x: 4.25, y: 1.4, z: 4.45, r: 0.45, h: 0.45, c: P.blue, n: 12, lat: 4 },
      { t: "box", x: 5, y: 0.4, z: 5, w: 1, h: 1.3, d: 1, c: P.darkwood }, // chair
    ] },

  /* ============================================================ int-brewery */
  { id: "int-brewery", group: "interior", title: "Brewery", tags: ["Vats", "Barrels"],
    meta: { size: "8×7", materials: "Wood vats, copper", best: "Brewing and casking ale" },
    note: "Big fermenting vats stand against the back walls; roll the finished barrels toward the open front.",
    parts: [
      ...shell(P.stone, P.stone),
      // shelf with mugs
      { t: "box", x: 4.5, y: 2.1, z: 0.4, w: 2.5, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 5 + i * 0.8, y: 2.3, z: 0.65, r: 0.18, h: 0.35, c: P.copper, n: 8 })),
      // large vats back-left
      { t: "cyl", x: 1.6, y: 0.4, z: 1.6, r: 1.1, h: 2, c: P.darkwood, n: 14 },
      { t: "cyl", x: 1.6, y: 2.4, z: 1.6, r: 1, h: 0.06, c: P.copper, n: 14 },
      { t: "cyl", x: 3.8, y: 0.4, z: 1.4, r: 0.9, h: 1.7, c: P.wood, n: 14 },
      // barrels rolled to the front
      { t: "cyl", x: 2.4, y: 0.4, z: 4.4, r: 0.7, h: 1.3, c: P.darkwood, n: 12 },
      { t: "cyl", x: 4, y: 0.4, z: 4.8, r: 0.7, h: 1.3, c: P.wood, n: 12 },
      { t: "cyl", x: 5.6, y: 0.4, z: 5.2, r: 0.7, h: 1.3, c: P.darkwood, n: 12 },
      // a copper kettle
      { t: "cyl", x: 5.5, y: 0.4, z: 2.4, r: 0.7, h: 1.2, c: P.copper, n: 12 },
    ] },

  /* ========================================================= int-weavingroom */
  { id: "int-weavingroom", group: "interior", title: "Weaving room", tags: ["Loom", "Flax"],
    meta: { size: "8×7", materials: "Wood loom, cloth", best: "Spinning and weaving cloth" },
    note: "Stand the upright loom against the north wall with vertical threads; baskets of flax and stools in front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // loom against north wall: two posts + crossbar + threads
      { t: "box", x: 1.3, y: 0.4, z: 0.7, w: 0.25, h: 2.6, d: 0.25, c: P.darkwood },
      { t: "box", x: 3.5, y: 0.4, z: 0.7, w: 0.25, h: 2.6, d: 0.25, c: P.darkwood },
      { t: "box", x: 1.3, y: 2.6, z: 0.7, w: 2.45, h: 0.25, d: 0.25, c: P.darkwood }, // top bar
      { t: "box", x: 1.3, y: 1.4, z: 0.7, w: 2.45, h: 0.2, d: 0.25, c: P.wood },      // cloth beam
      ...rep(6, (i) => ({ t: "box", x: 1.6 + i * 0.38, y: 1.6, z: 0.78, w: 0.07, h: 1, d: 0.07, c: P.cloth })),
      { t: "box", x: 1.3, y: 0.4, z: 1.4, w: 2.45, h: 1, d: 0.18, c: P.canvas }, // woven cloth
      // spinning wheel-ish + baskets of flax, mid
      { t: "cyl", x: 5.2, y: 0.4, z: 1.6, r: 0.7, h: 0.15, c: P.wood, n: 14 },
      { t: "box", x: 5.1, y: 0.55, z: 1.5, w: 0.2, h: 0.8, d: 0.2, c: P.darkwood },
      // baskets + stools, front
      { t: "cyl", x: 2, y: 0.4, z: 4.4, r: 0.6, h: 0.7, c: P.canvas, n: 12 },
      { t: "cyl", x: 2, y: 1.1, z: 4.4, r: 0.5, h: 0.25, c: P.hay, n: 12 }, // flax
      { t: "box", x: 3.6, y: 0.4, z: 4.6, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
      { t: "box", x: 5, y: 0.4, z: 5, w: 0.8, h: 0.9, d: 0.8, c: P.darkwood },
    ] },

  /* ============================================================ int-alchemy */
  { id: "int-alchemy", group: "interior", title: "Alchemy lab", tags: ["Jars", "Furnace"],
    meta: { size: "8×7", materials: "Stone, glass, clay", best: "Distilling and brewing potions" },
    note: "Shelves of glass jars along both walls; a workbench of jars in the centre and a small furnace in the corner.",
    parts: [
      ...shell(P.stone, P.stone),
      // jar shelves north wall (two tiers)
      { t: "box", x: 2.6, y: 1.4, z: 0.4, w: 4.2, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 2.6, y: 2.3, z: 0.4, w: 4.2, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(5, (i) => ({ t: "cyl", x: 3 + i * 0.8, y: 1.6, z: 0.65, r: 0.18, h: 0.45, c: P.green, n: 8 })),
      ...rep(5, (i) => ({ t: "cyl", x: 3 + i * 0.8, y: 2.5, z: 0.65, r: 0.18, h: 0.45, c: P.glass, n: 8 })),
      // small furnace, back-left
      { t: "box", x: 0.7, y: 0.4, z: 0.7, w: 1.5, h: 1.4, d: 1.5, c: P.stone },
      { t: "dome", x: 1.45, y: 1.8, z: 1.45, r: 0.7, h: 0.6, c: P.clay, n: 12, lat: 3 },
      { t: "box", x: 1.15, y: 0.7, z: 2.2, w: 0.6, h: 0.5, d: 0.2, c: P.fire }, // glowing mouth
      // workbench of jars, centre-front
      { t: "box", x: 2.8, y: 0.4, z: 3.4, w: 3, h: 1, d: 1.3, c: P.darkwood },
      { t: "cyl", x: 3.3, y: 1.4, z: 4, r: 0.22, h: 0.5, c: P.red, n: 8 },
      { t: "cyl", x: 4.1, y: 1.4, z: 4, r: 0.22, h: 0.5, c: P.blue, n: 8 },
      { t: "cone", x: 5, y: 1.4, z: 4, r: 0.3, h: 0.6, c: P.glass, n: 8 }, // flask
      { t: "box", x: 5.5, y: 0.4, z: 4.9, w: 0.8, h: 1, d: 0.8, c: P.darkwood }, // stool
    ] },

  /* ============================================================= int-armory */
  { id: "int-armory", group: "interior", title: "Armory", tags: ["Weapons", "Armor"],
    meta: { size: "8×7", materials: "Iron, darkwood", best: "Storing arms and armour" },
    note: "Mount weapon racks on the back walls; stand armour stands and a war chest across the open floor.",
    parts: [
      ...shell(P.stone, P.stone),
      // weapon rack on north wall: horizontal bar + vertical weapons
      { t: "box", x: 1, y: 2, z: 0.4, w: 5.5, h: 0.2, d: 0.4, c: P.darkwood },
      ...rep(6, (i) => ({ t: "box", x: 1.3 + i * 0.85, y: 0.7, z: 0.55, w: 0.12, h: 1.4, d: 0.12, c: P.iron })),
      ...rep(3, (i) => ({ t: "box", x: 1.7 + i * 1.7, y: 0.7, z: 0.55, w: 0.4, h: 0.4, d: 0.1, c: P.metal })), // axe heads
      // weapon rack on west wall
      { t: "box", x: 0.4, y: 2, z: 3.5, w: 0.4, h: 0.2, d: 2.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "box", x: 0.55, y: 0.7, z: 3.7 + i * 0.8, w: 0.12, h: 1.4, d: 0.12, c: P.iron })),
      // armour stands (boxes) centre
      { t: "box", x: 2.6, y: 0.4, z: 3.4, w: 0.9, h: 1.4, d: 0.7, c: P.metal },
      { t: "box", x: 2.55, y: 1.8, z: 3.45, w: 1, h: 0.5, d: 0.6, c: P.iron }, // helm
      { t: "box", x: 4, y: 0.4, z: 4, w: 0.9, h: 1.4, d: 0.7, c: P.metal },
      { t: "box", x: 3.95, y: 1.8, z: 4.05, w: 1, h: 0.5, d: 0.6, c: P.iron },
      // war chest front-right
      { t: "box", x: 5.3, y: 0.4, z: 4.8, w: 1.6, h: 0.9, d: 1, c: P.darkwood },
      { t: "box", x: 5.3, y: 1.3, z: 4.8, w: 1.6, h: 0.2, d: 1, c: P.iron },
    ] },

  /* ============================================================ int-greathall */
  { id: "int-greathall", group: "interior", title: "Great hall", tags: ["Feast", "Banners"],
    meta: { size: "8×7", materials: "Stone, timber, banners", best: "A lord's feasting hall" },
    note: "Hang tall banners on the back walls, set a raised high seat at the back, and run a long feast table forward.",
    parts: [
      ...shell(P.stone, P.stone),
      // banners on north wall
      ...rep(3, (i) => ({ t: "box", x: 1.4 + i * 1.8, y: 0.6, z: 0.42, w: 0.8, h: 2.3, d: 0.08, c: i === 1 ? P.red : P.blue })),
      // banners on west wall
      { t: "box", x: 0.42, y: 0.6, z: 4, w: 0.08, h: 2.3, d: 0.8, c: P.gold },
      // big hearth back-left corner
      { t: "box", x: 0.7, y: 0.4, z: 0.7, w: 1.5, h: 0.8, d: 1.2, c: P.stone },
      { t: "cone", x: 1.45, y: 1.2, z: 1.3, r: 0.45, h: 0.8, c: P.fire, n: 10 },
      // raised high seat on a dais, back-centre
      { t: "box", x: 4.5, y: 0.4, z: 1, w: 2, h: 0.4, d: 1.6, c: P.wood }, // dais
      { t: "box", x: 4.9, y: 0.8, z: 1.2, w: 1.2, h: 0.7, d: 1, c: P.darkwood }, // seat
      { t: "box", x: 4.9, y: 1.5, z: 1.2, w: 1.2, h: 1.4, d: 0.2, c: P.darkwood }, // tall back
      // long feast table forward
      { t: "box", x: 2.2, y: 0.4, z: 3.4, w: 4.2, h: 1, d: 1.4, c: P.wood },
      { t: "box", x: 2.2, y: 0.4, z: 4.9, w: 4.2, h: 0.55, d: 0.5, c: P.darkwood }, // bench
      { t: "cyl", x: 3.2, y: 1.4, z: 4, r: 0.28, h: 0.35, c: P.gold, n: 10 }, // goblet/dish
      { t: "cyl", x: 5, y: 1.4, z: 4, r: 0.3, h: 0.25, c: P.copper, n: 10 },
    ] },

  /* ============================================================== int-dairy */
  { id: "int-dairy", group: "interior", title: "Dairy", tags: ["Cheese", "Milk"],
    meta: { size: "8×7", materials: "Stone, plank shelves", best: "Pressing cheese and storing milk" },
    note: "Stack cheese wheels on the back shelves; a cheese press and milk buckets fill the open front.",
    parts: [
      ...shell(P.stone, P.plaster),
      // cheese shelves north wall (two tiers)
      { t: "box", x: 1, y: 1.4, z: 0.4, w: 5.5, h: 0.2, d: 0.55, c: P.darkwood },
      { t: "box", x: 1, y: 2.3, z: 0.4, w: 5.5, h: 0.2, d: 0.55, c: P.darkwood },
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 1.6, z: 0.7, r: 0.3, h: 0.3, c: P.hay, n: 12 })),
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 2.5, z: 0.7, r: 0.3, h: 0.3, c: P.cloth, n: 12 })),
      // cheese press, centre: stump + wheel + weighted top box
      { t: "box", x: 2.6, y: 0.4, z: 3.4, w: 1.2, h: 0.9, d: 1.2, c: P.wood },
      { t: "cyl", x: 3.2, y: 1.3, z: 4, r: 0.45, h: 0.35, c: P.cloth, n: 12 },
      { t: "box", x: 2.7, y: 1.65, z: 3.5, w: 1, h: 0.25, d: 1, c: P.darkwood },
      { t: "box", x: 3.1, y: 1.9, z: 3.9, w: 0.2, h: 0.9, d: 0.2, c: P.darkwood }, // screw
      // milk buckets front-right
      { t: "cyl", x: 5, y: 0.4, z: 4.4, r: 0.5, h: 0.9, c: P.metal, n: 12 },
      { t: "cyl", x: 5, y: 1.3, z: 4.4, r: 0.45, h: 0.05, c: P.snow, n: 12 },
      { t: "cyl", x: 6, y: 0.4, z: 4.9, r: 0.5, h: 0.9, c: P.wood, n: 12 },
    ] },

  /* ============================================================= int-tannery */
  { id: "int-tannery", group: "interior", title: "Tannery", tags: ["Hides", "Vat"],
    meta: { size: "8×7", materials: "Wood frames, leather", best: "Curing and tanning hides" },
    note: "Stretch hides on tall frames against the north wall; a soaking vat and scraping beam stand in front.",
    parts: [
      ...shell(P.stone, P.mud),
      // drying frames with hides on north wall
      ...rep(3, (i) => [
        { t: "box", x: 0.9 + i * 2, y: 0.4, z: 0.6, w: 0.18, h: 2.5, d: 0.18, c: P.darkwood },
        { t: "box", x: 2.4 + i * 2, y: 0.4, z: 0.6, w: 0.18, h: 2.5, d: 0.18, c: P.darkwood },
        { t: "box", x: 0.9 + i * 2, y: 1, z: 0.65, w: 1.65, h: 1.4, d: 0.1, c: i % 2 ? P.copper : P.mud },
      ]).flat(),
      // soaking vat, centre-front
      { t: "cyl", x: 2.4, y: 0.4, z: 3.8, r: 1, h: 1.3, c: P.darkwood, n: 14 },
      { t: "cyl", x: 2.4, y: 1.6, z: 3.8, r: 0.9, h: 0.06, c: P.mud, n: 14 },
      // scraping beam (slanted log on stands), front-right
      { t: "box", x: 4.4, y: 0.4, z: 4.2, w: 0.5, h: 1, d: 0.5, c: P.wood },
      { t: "box", x: 6, y: 0.4, z: 4.8, w: 0.5, h: 1, d: 0.5, c: P.wood },
      { t: "cyl", x: 4.6, y: 1.4, z: 4.4, r: 0.3, h: 1.8, c: P.log, n: 8 },
      { t: "box", x: 5.3, y: 0.4, z: 5.4, w: 0.9, h: 0.6, d: 0.9, c: P.copper }, // pile of leather
    ] },

  /* ============================================================ int-pottery */
  { id: "int-pottery", group: "interior", title: "Pottery", tags: ["Wheel", "Pots"],
    meta: { size: "8×7", materials: "Clay, wood, plaster", best: "Throwing and drying pots" },
    note: "Drying racks of stacked pots line the back walls; the potter's wheel sits low in the open centre.",
    parts: [
      ...shell(P.wood, P.plaster),
      // drying rack on north wall (two tiers of pots)
      { t: "box", x: 1, y: 1.3, z: 0.4, w: 5.5, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 1, y: 2.2, z: 0.4, w: 5.5, h: 0.2, d: 0.5, c: P.darkwood },
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 1.5, z: 0.65, r: 0.24, h: 0.5, c: P.clay, n: 10 })),
      ...rep(5, (i) => ({ t: "cyl", x: 1.5 + i * 1, y: 2.4, z: 0.65, r: 0.22, h: 0.45, c: P.brick, n: 10 })),
      // clay bin on west wall
      { t: "box", x: 0.6, y: 0.4, z: 3.6, w: 0.9, h: 0.9, d: 2, c: P.mud },
      // potter's wheel low in centre
      { t: "cyl", x: 3, y: 0.4, z: 3.6, r: 0.7, h: 0.7, c: P.wood, n: 12 },
      { t: "cyl", x: 3, y: 1.1, z: 3.6, r: 0.5, h: 0.12, c: P.stone, n: 14 }, // wheel head
      { t: "cyl", x: 3, y: 1.22, z: 3.6, r: 0.22, h: 0.5, c: P.clay, n: 10 }, // pot being thrown
      { t: "box", x: 3, y: 0.4, z: 4.9, w: 0.9, h: 0.5, d: 0.9, c: P.darkwood }, // potter's seat
      // stacked finished pots front-right
      { t: "cyl", x: 5.4, y: 0.4, z: 4.6, r: 0.4, h: 0.7, c: P.clay, n: 10 },
      { t: "cyl", x: 5.4, y: 1.1, z: 4.6, r: 0.32, h: 0.55, c: P.brick, n: 10 },
    ] },

  /* =========================================================== int-bathhouse */
  { id: "int-bathhouse", group: "interior", title: "Bathhouse", tags: ["Tub", "Basin"],
    meta: { size: "8×7", materials: "Stone, water", best: "A sunken bath and washing room" },
    note: "Sink a water-filled tub into the floor at the back; a basin on a stand and a bench sit toward the front.",
    parts: [
      ...shell(P.stone, P.stone),
      // shelf with towels (cloth) and jugs
      { t: "box", x: 4.5, y: 2, z: 0.4, w: 2.5, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 4.8, y: 2.2, z: 0.6, w: 0.6, h: 0.4, d: 0.3, c: P.snow },
      { t: "cyl", x: 6, y: 2.2, z: 0.65, r: 0.2, h: 0.45, c: P.clay, n: 8 },
      // sunken tub: stone rim + water inside, back area
      { t: "box", x: 0.8, y: 0.4, z: 0.8, w: 3.2, h: 0.7, d: 2.6, c: P.stone },
      { t: "box", x: 1.1, y: 0.6, z: 1.1, w: 2.6, h: 0.5, d: 2, c: P.water },
      // basin on a stand, centre-front
      { t: "box", x: 3, y: 0.4, z: 3.6, w: 0.5, h: 0.9, d: 0.5, c: P.stone },
      { t: "cyl", x: 3.25, y: 1.3, z: 3.85, r: 0.5, h: 0.35, c: P.whitestone, n: 12 },
      { t: "cyl", x: 3.25, y: 1.5, z: 3.85, r: 0.4, h: 0.06, c: P.water, n: 12 },
      // bench front-right
      { t: "box", x: 4.6, y: 0.4, z: 4.6, w: 2, h: 0.55, d: 0.7, c: P.wood },
      // steam crock / brazier
      { t: "cyl", x: 1.6, y: 0.4, z: 4.6, r: 0.45, h: 0.7, c: P.copper, n: 10 },
      { t: "cone", x: 1.6, y: 1.1, z: 4.6, r: 0.25, h: 0.4, c: P.glow, n: 8 },
    ] },

  /* ============================================================= int-chapel */
  { id: "int-chapel", group: "interior", title: "Chapel interior", tags: ["Altar", "Candles"],
    meta: { size: "8×7", materials: "Whitestone, gold", best: "A small place of prayer" },
    note: "Centre a raised altar against the north wall with candles and an idol; set a kneeling bench out front.",
    parts: [
      ...shell(P.whitestone, P.whitestone),
      // tall narrow window suggestion on north wall
      { t: "box", x: 3.2, y: 1, z: 0.42, w: 1.4, h: 1.8, d: 0.06, c: P.blue },
      // altar against north wall
      { t: "box", x: 2.6, y: 0.4, z: 0.7, w: 2.6, h: 1.1, d: 1.1, c: P.stone },
      { t: "box", x: 2.6, y: 1.5, z: 0.7, w: 2.6, h: 0.18, d: 1.1, c: P.gold }, // altar cloth top
      // idol on the altar
      { t: "box", x: 3.6, y: 1.68, z: 1.1, w: 0.5, h: 0.9, d: 0.5, c: P.gold },
      { t: "dome", x: 3.85, y: 2.58, z: 1.35, r: 0.25, h: 0.3, c: P.gold, n: 10, lat: 3 },
      // candles flanking the altar
      { t: "cyl", x: 2.9, y: 1.68, z: 1, r: 0.12, h: 0.5, c: P.cloth, n: 8 },
      { t: "cone", x: 2.9, y: 2.18, z: 1, r: 0.1, h: 0.3, c: P.glow, n: 8 },
      { t: "cyl", x: 4.8, y: 1.68, z: 1, r: 0.12, h: 0.5, c: P.cloth, n: 8 },
      { t: "cone", x: 4.8, y: 2.18, z: 1, r: 0.1, h: 0.3, c: P.glow, n: 8 },
      // red runner rug down the centre
      { t: "box", x: 3.4, y: 0.41, z: 2, w: 1.2, h: 0.06, d: 3.6, c: P.red },
      // kneeling bench, front
      { t: "box", x: 3.2, y: 0.4, z: 4.4, w: 1.6, h: 0.5, d: 0.6, c: P.darkwood },
    ] },

  /* =========================================================== int-storeroom */
  { id: "int-storeroom", group: "interior", title: "Storeroom", tags: ["Crates", "Barrels"],
    meta: { size: "8×7", materials: "Wood, plaster", best: "General stacked storage" },
    note: "Stack crates and barrels against the back walls and tier them down toward the open front-right.",
    parts: [
      ...shell(P.wood, P.plaster),
      // wall shelf
      { t: "box", x: 4.6, y: 2.1, z: 0.4, w: 2.4, h: 0.2, d: 0.5, c: P.darkwood },
      { t: "box", x: 4.9, y: 2.3, z: 0.6, w: 0.7, h: 0.6, d: 0.3, c: P.canvas },
      // stacked crates back-left (two high)
      { t: "box", x: 0.8, y: 0.4, z: 0.8, w: 1.4, h: 1.4, d: 1.4, c: P.darkwood },
      { t: "box", x: 0.9, y: 1.8, z: 0.9, w: 1.2, h: 1.2, d: 1.2, c: P.wood },
      { t: "box", x: 2.5, y: 0.4, z: 1, w: 1.4, h: 1.4, d: 1.4, c: P.wood },
      // barrels mid
      { t: "cyl", x: 1.5, y: 0.4, z: 3.4, r: 0.7, h: 1.3, c: P.darkwood, n: 12 },
      { t: "cyl", x: 3, y: 0.4, z: 3.6, r: 0.7, h: 1.3, c: P.wood, n: 12 },
      // crates + sacks front-right
      { t: "box", x: 4.4, y: 0.4, z: 4, w: 1.5, h: 1.5, d: 1.5, c: P.darkwood },
      { t: "box", x: 4.2, y: 0.4, z: 5.4, w: 0.9, h: 0.9, d: 0.9, c: P.cloth },
      { t: "box", x: 5.6, y: 0.4, z: 5.2, w: 0.9, h: 0.9, d: 0.9, c: P.canvas },
    ] },

  /* ============================================================ int-maproom */
  { id: "int-maproom", group: "interior", title: "Map room", tags: ["Map", "Charts"],
    meta: { size: "8×7", materials: "Darkwood, canvas", best: "Planning routes and campaigns" },
    note: "A big table with a flat map dominates the open centre; charts hang on the back wall, stools around it.",
    parts: [
      ...shell(P.wood, P.plaster),
      // charts on north wall
      ...rep(3, (i) => ({ t: "box", x: 1.2 + i * 1.8, y: 0.9, z: 0.42, w: 1.3, h: 1.8, d: 0.06, c: i % 2 ? P.canvas : P.cloth })),
      // wall shelf with scrolls on west wall
      { t: "box", x: 0.4, y: 1.8, z: 3.5, w: 0.5, h: 0.2, d: 2.5, c: P.darkwood },
      ...rep(3, (i) => ({ t: "cyl", x: 0.65, y: 1.4, z: 3.8 + i * 0.8, r: 0.14, h: 0.4, c: P.canvas, n: 8 })),
      // big map table, centre
      { t: "box", x: 2.2, y: 0.4, z: 2.8, w: 4, h: 1, d: 2.4, c: P.darkwood },
      { t: "box", x: 2.5, y: 1.4, z: 3.1, w: 3.4, h: 0.08, d: 1.8, c: P.canvas }, // the map
      { t: "box", x: 3.4, y: 1.48, z: 3.6, w: 0.3, h: 0.06, d: 0.5, c: P.red }, // route marks
      { t: "cyl", x: 4.6, y: 1.48, z: 3.6, r: 0.12, h: 0.3, c: P.gold, n: 8 }, // marker piece
      // stools around the open front
      { t: "box", x: 2.4, y: 0.4, z: 5.4, w: 0.8, h: 0.9, d: 0.8, c: P.wood },
      { t: "box", x: 5.2, y: 0.4, z: 5.4, w: 0.8, h: 0.9, d: 0.8, c: P.wood },
    ] },

  /* ============================================================ int-workshop */
  { id: "int-workshop", group: "interior", title: "Carpenter's workshop", tags: ["Bench", "Tools"],
    meta: { size: "8×7", materials: "Wood, iron tools", best: "Sawing and joining timber" },
    note: "Hang a tool rack on the north wall above a workbench; stack timber and a sawhorse toward the front.",
    parts: [
      ...shell(P.wood, P.plaster),
      // tool rack north wall
      { t: "box", x: 1, y: 2.1, z: 0.4, w: 4.5, h: 0.2, d: 0.4, c: P.darkwood },
      ...rep(5, (i) => ({ t: "box", x: 1.3 + i * 0.85, y: 1.3, z: 0.55, w: 0.12, h: 0.8, d: 0.12, c: P.iron })),
      // workbench against north wall
      { t: "box", x: 1, y: 0.4, z: 1, w: 3.5, h: 1, d: 1.2, c: P.wood },
      { t: "box", x: 1.4, y: 1.4, z: 1.3, w: 0.8, h: 0.3, d: 0.6, c: P.log }, // workpiece
      { t: "box", x: 3.4, y: 1.4, z: 1.3, w: 0.4, h: 0.2, d: 0.5, c: P.metal }, // plane
      // stacked plank timber on west wall + an upright log
      { t: "box", x: 0.6, y: 0.4, z: 3.6, w: 0.7, h: 0.3, d: 2.4, c: P.log },
      { t: "box", x: 0.6, y: 0.7, z: 3.7, w: 0.7, h: 0.3, d: 2.2, c: P.wood },
      { t: "box", x: 0.65, y: 1, z: 3.8, w: 0.6, h: 0.3, d: 2, c: P.log },
      { t: "cyl", x: 1.6, y: 0.4, z: 5.4, r: 0.3, h: 1.6, c: P.log, n: 8 },
      // sawhorse + plank, front
      { t: "box", x: 3.4, y: 0.4, z: 4, w: 0.4, h: 0.9, d: 0.4, c: P.darkwood },
      { t: "box", x: 5.4, y: 0.4, z: 4.6, w: 0.4, h: 0.9, d: 0.4, c: P.darkwood },
      { t: "box", x: 3.4, y: 1.3, z: 4.1, w: 2.4, h: 0.18, d: 0.6, c: P.wood }, // plank
    ] },

  /* ============================================================ int-throne */
  { id: "int-throne", group: "interior", title: "Throne room", tags: ["Throne", "Dais"],
    meta: { size: "8×7", materials: "Stone, gold, red", best: "A ruler's seat of audience" },
    note: "Raise a gold throne on a stepped dais against the back, banners behind, a red carpet leading to the front.",
    parts: [
      ...shell(P.whitestone, P.whitestone),
      // banners on north wall
      { t: "box", x: 2.4, y: 0.5, z: 0.42, w: 0.9, h: 2.4, d: 0.08, c: P.red },
      { t: "box", x: 4.4, y: 0.5, z: 0.42, w: 0.9, h: 2.4, d: 0.08, c: P.blue },
      // stepped dais back-centre
      { t: "box", x: 2.6, y: 0.4, z: 0.9, w: 2.8, h: 0.4, d: 1.8, c: P.stone },
      { t: "box", x: 3, y: 0.8, z: 1.2, w: 2, h: 0.4, d: 1.4, c: P.whitestone },
      // gold throne on the dais
      { t: "box", x: 3.4, y: 1.2, z: 1.5, w: 1.2, h: 0.7, d: 1, c: P.gold },
      { t: "box", x: 3.4, y: 1.9, z: 1.5, w: 1.2, h: 1.6, d: 0.22, c: P.gold }, // tall back
      { t: "box", x: 3.4, y: 1.2, z: 1.5, w: 0.22, h: 1.2, d: 1, c: P.gold },   // arm
      { t: "box", x: 4.38, y: 1.2, z: 1.5, w: 0.22, h: 1.2, d: 1, c: P.gold },  // arm
      { t: "box", x: 3.6, y: 1.9, z: 1.6, w: 0.8, h: 0.5, d: 0.2, c: P.red },   // cushion back
      // red carpet to the front
      { t: "box", x: 3.6, y: 0.41, z: 2.7, w: 0.9, h: 0.06, d: 3.4, c: P.red },
      // brazier pair, front
      { t: "cyl", x: 1.6, y: 0.4, z: 4.4, r: 0.4, h: 1.1, c: P.metal, n: 10 },
      { t: "cone", x: 1.6, y: 1.5, z: 4.4, r: 0.3, h: 0.4, c: P.glow, n: 8 },
      { t: "cyl", x: 6.2, y: 0.4, z: 4.8, r: 0.4, h: 1.1, c: P.metal, n: 10 },
      { t: "cone", x: 6.2, y: 1.5, z: 4.8, r: 0.3, h: 0.4, c: P.glow, n: 8 },
    ] },
];
