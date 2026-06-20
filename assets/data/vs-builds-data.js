/* ============================================================================
   vs-builds-data.js — the Pattern Book scene library. Each entry is a structure
   described as a list of iso primitives (see assets/js/iso-scene.js). Authored
   in paint order: ground/water first, then back-to-front, roofs and foreground
   last. Shared by vs-builds.html and the offline render check.
   ========================================================================== */

const P = {
  ground: "#473d2c", soil: "#4f4334", water: "#356b7d",
  log: "#7a5c3a", plaster: "#9a8763", stone: "#8d8475",
  wood: "#5a4630", post: "#48372499".slice(0, 7), // dark post
  thatch: "#6e4630", shingle: "#6d4a30", roofdk: "#5b3b2a",
  glass: "#9fd0d8", clay: "#a85c3c", metal: "#6b6b6b",
  black: "#2c2620", cloth: "#d9cdae",
};
P.post = "#483724";

// small helpers that expand into part arrays
const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

export const SCENES = [
  // ---------------------------------------------------------------- HOMES
  { id: "leanto", group: "Shelters & homes", title: "Lean-to shelter",
    tags: ["Day one", "Temporary"],
    meta: { size: "6×4", materials: "Logs, sticks, dry grass", best: "A roof over your head on night one" },
    note: "A back wall, two posts, one sloped roof. Buys you a dry night while you plan the real base.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 8, d: 7, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 6, h: 3, d: 0.4, c: P.log },
      { t: "box", x: 0, y: 0, z: 4, w: 0.4, h: 1.5, d: 0.4, c: P.post },
      { t: "box", x: 5.6, y: 0, z: 4, w: 0.4, h: 1.5, d: 0.4, c: P.post },
      { t: "shed", x: 0, y: 1.5, z: 0, w: 6, d: 4, rise: 1.7, c: P.thatch },
    ] },

  { id: "cabin", group: "Shelters & homes", title: "Log cabin",
    tags: ["Starter home", "Gable roof"],
    meta: { size: "7×6", materials: "Logs, planks, thatch", best: "Your first permanent base" },
    note: "Solid log walls and a pitched gable roof. Smooth the roof slope with stairs and slabs in-game.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 9, d: 8, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 7, h: 4, d: 6, c: P.log },
      { t: "win", face: "S", x: 0.9, y: 1.6, z: 6, w: 1, h: 1.2, c: P.black },
      { t: "door", face: "S", x: 3, y: 0, z: 6, w: 1.3, h: 2.5, c: P.wood },
      { t: "win", face: "E", x: 7, y: 1.6, z: 2, d: 1.2, h: 1.2, c: P.black },
      { t: "gable", x: 0, y: 4, z: 0, w: 7, d: 6, rise: 3.2, axis: "x", c: P.roofdk, cGable: P.shingle },
      { t: "box", x: 4.4, y: 4, z: 4.2, w: 0.9, h: 3, d: 0.9, c: P.stone },
    ] },

  { id: "hiphouse", group: "Shelters & homes", title: "Hip-roof house",
    tags: ["Cottage", "Hip roof"],
    meta: { size: "7×7", materials: "Cob/plaster, timber, shingles", best: "A tidy weatherproof cottage" },
    note: "A four-sided hip roof sheds rain on every side and overhangs the walls.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 9, d: 9, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 7, h: 5, d: 7, c: P.plaster },
      { t: "door", face: "S", x: 3, y: 0, z: 7, w: 1.3, h: 2.5, c: P.wood },
      { t: "win", face: "S", x: 0.8, y: 2, z: 7, w: 1, h: 1.3, c: P.black },
      { t: "win", face: "S", x: 5.2, y: 2, z: 7, w: 1, h: 1.3, c: P.black },
      { t: "win", face: "E", x: 7, y: 2, z: 2, d: 1.2, h: 1.3, c: P.black },
      { t: "win", face: "E", x: 7, y: 2, z: 4.6, d: 1.2, h: 1.3, c: P.black },
      { t: "hip", x: -0.7, y: 5, z: -0.7, w: 8.4, d: 8.4, rise: 3.6, c: P.shingle },
    ] },

  { id: "homestead", group: "Shelters & homes", title: "Two-storey homestead",
    tags: ["Family base", "Two floors"],
    meta: { size: "7×6", materials: "Plaster, timber frame, shingles", best: "A long-term home with room to grow" },
    note: "Two full floors under one gable. Stack windows to light both levels; chimney serves a ground-floor hearth.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 9, d: 8, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 7, h: 7, d: 6, c: P.plaster },
      { t: "door", face: "S", x: 3, y: 0, z: 6, w: 1.3, h: 2.5, c: P.wood },
      { t: "win", face: "S", x: 0.8, y: 1.6, z: 6, w: 1, h: 1.2, c: P.black },
      { t: "win", face: "S", x: 5.2, y: 1.6, z: 6, w: 1, h: 1.2, c: P.black },
      { t: "win", face: "S", x: 0.8, y: 4.4, z: 6, w: 1, h: 1.2, c: P.black },
      { t: "win", face: "S", x: 5.2, y: 4.4, z: 6, w: 1, h: 1.2, c: P.black },
      { t: "win", face: "E", x: 7, y: 1.6, z: 2, d: 1.2, h: 1.2, c: P.black },
      { t: "win", face: "E", x: 7, y: 4.4, z: 2, d: 1.2, h: 1.2, c: P.black },
      { t: "gable", x: 0, y: 7, z: 0, w: 7, d: 6, rise: 3, axis: "x", c: P.shingle, cGable: P.plaster },
      { t: "box", x: 4.8, y: 7, z: 1.2, w: 0.9, h: 3, d: 0.9, c: P.stone },
    ] },

  { id: "longhouse", group: "Shelters & homes", title: "Longhouse",
    tags: ["Communal", "Long span"],
    meta: { size: "11×5", materials: "Logs, thatch", best: "Lots of indoor space, one roofline" },
    note: "A long footprint under one ridge. Cheap to roof per square, easy to extend along its length.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 13, d: 7, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 11, h: 3.5, d: 5, c: P.log },
      { t: "door", face: "S", x: 5, y: 0, z: 5, w: 1.3, h: 2.4, c: P.wood },
      ...[1, 3, 7, 9].map((x) => ({ t: "win", face: "S", x, y: 1.6, z: 5, w: 1, h: 1, c: P.black })),
      { t: "win", face: "E", x: 11, y: 1.6, z: 2, d: 1, h: 1, c: P.black },
      { t: "gable", x: 0, y: 3.5, z: 0, w: 11, d: 5, rise: 2.6, axis: "x", c: P.thatch },
    ] },

  { id: "watchtower", group: "Shelters & homes", title: "Watchtower",
    tags: ["Lookout", "Defence"],
    meta: { size: "3×3 × tall", materials: "Stone, timber", best: "Seeing trouble before it arrives" },
    note: "A tapered stone shaft with a crenellated top. Height is the point: light it as a landmark you can run home to.",
    parts: [
      { t: "ground", x: -2, z: -2, w: 7, d: 7, c: P.ground },
      { t: "frustum", x: -1.6, y: 0, z: -1.6, w: 3.2, d: 3.2, tw: 2.6, td: 2.6, h: 8, c: P.stone },
      { t: "door", face: "S", x: -0.5, y: 0, z: 1.45, w: 1, h: 2, c: P.wood },
      { t: "win", face: "S", x: -0.4, y: 5, z: 1.4, w: 0.8, h: 1, c: P.black },
      ...rep(3, (i) => ({ t: "box", x: -1.3 + i * 1.1, y: 8, z: 1.0, w: 0.5, h: 0.7, d: 0.5, c: P.stone })),
      ...rep(2, (i) => ({ t: "box", x: 0.9, y: 8, z: -1.0 + i * 1.2, w: 0.5, h: 0.7, d: 0.5, c: P.stone })),
    ] },

  // ------------------------------------------------------- WORKSHOPS
  { id: "smithy", group: "Workshops & production", title: "Open smithy",
    tags: ["Forge", "Open shed"],
    meta: { size: "7×6", materials: "Posts, shingles, stone", best: "Working metal without a stuffy room" },
    note: "Four posts, a shed roof, a stone forge and an anvil. Open sides vent the heat and smoke.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 9, d: 8, c: P.ground },
      ...[[0, 0], [6.6, 0], [0, 5.6], [6.6, 5.6]].map(([x, z]) => ({ t: "box", x, y: 0, z, w: 0.4, h: 3, d: 0.4, c: P.post })),
      { t: "cyl", x: 1.6, y: 0, z: 1.6, r: 1.1, h: 1.4, c: P.stone, n: 14 },
      { t: "cone", x: 1.6, y: 1.5, z: 1.6, r: 1.1, h: 1.2, c: P.black, n: 14 },
      { t: "box", x: 4, y: 0, z: 3, w: 1.3, h: 0.7, d: 0.6, c: P.metal },
      { t: "box", x: 4.3, y: 0.7, z: 3.15, w: 0.7, h: 0.4, d: 0.3, c: P.metal },
      { t: "shed", x: -0.3, y: 3, z: -0.3, w: 7.6, d: 6.6, rise: 1.7, c: P.shingle },
      { t: "box", x: 1.3, y: 2.6, z: 1.3, w: 0.6, h: 2.6, d: 0.6, c: P.stone },
    ] },

  { id: "charcoal", group: "Workshops & production", title: "Charcoal pit",
    tags: ["Fuel", "Smoulder"],
    meta: { size: "5×5 mound", materials: "Firewood, soil", best: "Turning stacked wood into charcoal" },
    note: "A cone of firewood buried under soil so it smoulders instead of burning. Charcoal feeds every furnace past the forge.",
    parts: [
      { t: "ground", x: -3, z: -3, w: 6, d: 6, c: P.ground },
      { t: "cone", x: 0, y: 0, z: 0, r: 2.4, h: 1.6, c: P.log, n: 16 },
      { t: "cone", x: 0, y: 0.25, z: 0, r: 2.6, h: 2.2, c: P.soil, n: 18 },
      { t: "box", x: -0.15, y: 2.3, z: -0.15, w: 0.3, h: 0.4, d: 0.3, c: P.black },
    ] },

  { id: "kiln", group: "Workshops & production", title: "Pottery kiln",
    tags: ["Firing", "Pottery"],
    meta: { size: "4×4 round", materials: "Clay bricks", best: "Hard-firing pots, crucibles and molds" },
    note: "A round clay chamber with a domed top and a stoke hole at the base. Fire your formed clay here before it holds water or metal.",
    parts: [
      { t: "ground", x: -3, z: -3, w: 6, d: 6, c: P.ground },
      { t: "cyl", x: 0, y: 0, z: 0, r: 2, h: 3.2, c: P.clay, n: 20 },
      { t: "win", face: "S", x: -0.6, y: 0, z: 2, w: 1.2, h: 1.1, c: P.black },
      { t: "cone", x: 0, y: 3.2, z: 0, r: 2, h: 2, c: P.roofdk, n: 20 },
    ] },

  { id: "bloomery", group: "Workshops & production", title: "Bloomery stack",
    tags: ["Iron", "Smelt"],
    meta: { size: "2×2 stack", materials: "Fire clay, bellows", best: "Smelting iron ore into a bloom" },
    note: "A tall, narrow clay chimney. Layer ore and charcoal, work the bellows, and tap a spongy iron bloom from the base.",
    parts: [
      { t: "ground", x: -2, z: -2, w: 5, d: 5, c: P.ground },
      { t: "frustum", x: -1, y: 0, z: -1, w: 2, d: 2, tw: 1.2, td: 1.2, h: 4.6, c: P.clay },
      { t: "win", face: "S", x: -0.5, y: 0, z: 1.05, w: 1, h: 1.2, c: P.black },
      { t: "box", x: 1.2, y: 0, z: -0.4, w: 1, h: 1.1, d: 1.4, c: P.wood },
    ] },

  { id: "greenhouse", group: "Workshops & production", title: "Greenhouse",
    tags: ["Farming", "Glass"],
    meta: { size: "7×5", materials: "Stone sill, glass panes", best: "Growing crops through a hard winter" },
    note: "Glass walls and roof over a low stone sill. Traps warmth so tender crops keep going when the ground outside freezes.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 9, d: 7, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 7, h: 1, d: 5, c: P.stone },
      { t: "box", x: 0, y: 1, z: 0, w: 7, h: 3, d: 5, c: P.glass, op: 0.42 },
      { t: "door", face: "S", x: 3, y: 1, z: 5, w: 1.2, h: 2.2, c: P.wood },
      { t: "gable", x: 0, y: 4, z: 0, w: 7, d: 5, rise: 2.2, axis: "x", c: P.glass, op: 0.42 },
    ] },

  // ------------------------------------------------------- POWER & WATER
  { id: "windmill", group: "Power & water", title: "Windmill",
    tags: ["Power", "Sails"],
    meta: { size: "4×4 × tall", materials: "Stone, cloth sails, gears", best: "Free rotation to grind, pulverise and hammer" },
    note: "A tapered tower with four sail blades. Put it high and in the open; wind strength climbs with altitude.",
    parts: [
      { t: "ground", x: -4, z: -4, w: 8, d: 8, c: P.ground },
      { t: "frustum", x: -2, y: 0, z: -2, w: 4, d: 4, tw: 2.6, td: 2.6, h: 8, c: P.stone },
      { t: "hip", x: -1.8, y: 8, z: -1.8, w: 3.6, d: 3.6, rise: 1.8, c: P.roofdk },
      { t: "door", face: "S", x: -0.5, y: 0, z: 2.0, w: 1, h: 2.1, c: P.wood },
      { t: "sails", x: 0, y: 6, z: 2.1, r: 4, n: 4, tilt: 45, bw: 1.4, plane: "xy", c: P.cloth },
    ] },

  { id: "waterwheel", group: "Power & water", title: "Waterwheel mill",
    tags: ["Power", "Flowing water"],
    meta: { size: "5×4 + channel", materials: "Timber, gears", best: "Steady power day and night from a stream" },
    note: "A vertical wheel in flowing water drives the mill beside it. Unlike wind, the current never drops.",
    parts: [
      { t: "ground", x: -5, z: -2, w: 11, d: 7, c: P.ground },
      { t: "water", x: -5, y: 0.05, z: 3.4, w: 11, d: 2, c: P.water },
      { t: "box", x: 0, y: 0, z: -1, w: 5, h: 4, d: 4, c: P.plaster },
      { t: "door", face: "S", x: 1.8, y: 0, z: 3, w: 1.2, h: 2.3, c: P.wood },
      { t: "gable", x: -0.4, y: 4, z: -1.4, w: 5.8, d: 4.8, rise: 2.4, axis: "z", c: P.shingle },
      { t: "sails", x: -2, y: 2.6, z: 4.3, r: 2.6, n: 8, tilt: 0, bw: 0.7, plane: "zy", c: P.wood },
    ] },

  { id: "well", group: "Power & water", title: "Covered well",
    tags: ["Water", "Utility"],
    meta: { size: "3×3", materials: "Stone, timber, rope", best: "Clean water at the doorstep" },
    note: "A stone ring, two posts and a little gable to keep rain and leaves out. Dig down to the water table first.",
    parts: [
      { t: "ground", x: -3, z: -3, w: 6, d: 6, c: P.ground },
      { t: "cyl", x: 0, y: 0, z: 0, r: 1.6, h: 1.4, c: P.stone, n: 16 },
      { t: "box", x: -0.2, y: 1.4, z: -1.7, w: 0.4, h: 3, d: 0.4, c: P.wood },
      { t: "box", x: -0.2, y: 1.4, z: 1.3, w: 0.4, h: 3, d: 0.4, c: P.wood },
      { t: "gable", x: -1.4, y: 4, z: -2, w: 2.8, d: 4, rise: 1.4, axis: "x", c: P.roofdk },
    ] },

  // ------------------------------------------------- LAND & INFRASTRUCTURE
  { id: "barn", group: "Land & infrastructure", title: "Barn & paddock",
    tags: ["Livestock", "Storage"],
    meta: { size: "7×6 + pen", materials: "Logs, thatch, fencing", best: "Housing animals and feed" },
    note: "A big door for hauling, a steep roof for hay, and a fenced paddock alongside for grazing animals.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 15, d: 9, c: P.ground },
      { t: "box", x: 0, y: 0, z: 0, w: 7, h: 4, d: 6, c: P.log },
      { t: "door", face: "S", x: 2.6, y: 0, z: 6, w: 1.8, h: 3, c: P.wood },
      { t: "gable", x: 0, y: 4, z: 0, w: 7, d: 6, rise: 3.4, axis: "x", c: P.thatch },
      ...[8, 10.5, 13].flatMap((x) => [
        { t: "box", x, y: 0, z: 1.8, w: 0.3, h: 1.3, d: 0.3, c: P.post },
        { t: "box", x, y: 0, z: 6, w: 0.3, h: 1.3, d: 0.3, c: P.post },
      ]),
      { t: "box", x: 8, y: 0.8, z: 1.95, w: 5.3, h: 0.18, d: 0.18, c: P.post },
      { t: "box", x: 8, y: 0.8, z: 6.15, w: 5.3, h: 0.18, d: 0.18, c: P.post },
      { t: "box", x: 13, y: 0.8, z: 1.8, w: 0.18, h: 0.18, d: 4.4, c: P.post },
    ] },

  { id: "granary", group: "Land & infrastructure", title: "Granary on stilts",
    tags: ["Storage", "Dry"],
    meta: { size: "5×5 raised", materials: "Logs, thatch", best: "Keeping grain dry and away from vermin" },
    note: "Raised on posts so damp and animals can't reach the grain. A ladder is the only way up.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 8, d: 7, c: P.ground },
      ...[[0.4, 0.4], [4.6, 0.4], [0.4, 4.6], [4.6, 4.6]].map(([x, z]) => ({ t: "box", x, y: 0, z, w: 0.5, h: 1.6, d: 0.5, c: P.post })),
      { t: "box", x: 0, y: 1.6, z: 0, w: 5.5, h: 3, d: 5, c: P.log },
      { t: "door", face: "S", x: 2, y: 1.6, z: 5, w: 1.2, h: 2, c: P.wood },
      { t: "box", x: 2.4, y: 0, z: 5.05, w: 0.8, h: 1.7, d: 0.12, c: P.wood },
      { t: "gable", x: 0, y: 4.6, z: 0, w: 5.5, d: 5, rise: 2.4, axis: "x", c: P.thatch },
    ] },

  { id: "bridge", group: "Land & infrastructure", title: "Stone-pier bridge",
    tags: ["Crossing", "Stone"],
    meta: { size: "12 span", materials: "Stone piers, timber deck", best: "Crossing a river or ravine dry-shod" },
    note: "Two stone piers carry a timber deck with railings. Sink the piers to the riverbed so the span sits clear of the water.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 14, d: 2, c: P.ground },
      { t: "ground", x: -1, z: 5, w: 14, d: 2, c: P.ground },
      { t: "water", x: -1, y: 0.05, z: 1, w: 14, d: 4, c: P.water },
      { t: "box", x: 3, y: 0, z: 2, w: 1, h: 1.6, d: 2, c: P.stone },
      { t: "box", x: 9, y: 0, z: 2, w: 1, h: 1.6, d: 2, c: P.stone },
      { t: "box", x: 0, y: 1.6, z: 2, w: 12, h: 0.4, d: 2, c: P.wood },
      { t: "box", x: 0, y: 2, z: 2, w: 12, h: 0.5, d: 0.15, c: P.wood },
      { t: "box", x: 0, y: 2, z: 3.85, w: 12, h: 0.5, d: 0.15, c: P.wood },
    ] },

  { id: "gate", group: "Land & infrastructure", title: "Palisade gate",
    tags: ["Defence", "Wall"],
    meta: { size: "10 wall + gate", materials: "Logs", best: "Walling a base against drifters and wolves" },
    note: "A pointed-top log wall broken by a gatehouse. Keeps night creatures out of your compound.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 12, d: 5, c: P.ground },
      { t: "box", x: 0, y: 0, z: 2, w: 3.5, h: 3, d: 0.7, c: P.post },
      { t: "box", x: 6.5, y: 0, z: 2, w: 3.5, h: 3, d: 0.7, c: P.post },
      ...rep(5, (i) => ({ t: "cone", x: 0.4 + i * 0.72, y: 3, z: 2.35, r: 0.38, h: 0.6, c: P.post, n: 8 })),
      ...rep(5, (i) => ({ t: "cone", x: 6.9 + i * 0.72, y: 3, z: 2.35, r: 0.38, h: 0.6, c: P.post, n: 8 })),
      { t: "box", x: 3.3, y: 0, z: 1.6, w: 1.2, h: 4, d: 1.4, c: P.wood },
      { t: "box", x: 6.0, y: 0, z: 1.6, w: 1.2, h: 4, d: 1.4, c: P.wood },
      { t: "box", x: 4.5, y: 0, z: 2.05, w: 1.5, h: 2.8, d: 0.3, c: P.wood },
      { t: "box", x: 3.3, y: 4, z: 1.6, w: 3.9, h: 0.6, d: 1.4, c: P.wood },
    ] },

  { id: "dock", group: "Land & infrastructure", title: "Jetty & dock",
    tags: ["Water", "Access"],
    meta: { size: "7 reach", materials: "Posts, planks", best: "Reaching deep water or mooring a boat" },
    note: "Planks on posts walking out over the shallows. Stand at the end to fish deeper water or tie up a boat.",
    parts: [
      { t: "ground", x: -1, z: -1, w: 12, d: 3, c: P.ground },
      { t: "water", x: -1, y: 0.05, z: 2, w: 12, d: 6, c: P.water },
      ...[3, 5.5, 8].flatMap((x) => [
        { t: "box", x, y: -0.6, z: 3.4, w: 0.3, h: 2, d: 0.3, c: P.post },
        { t: "box", x, y: -0.6, z: 5.4, w: 0.3, h: 2, d: 0.3, c: P.post },
      ]),
      { t: "box", x: 2.4, y: 1.3, z: 3.2, w: 7, h: 0.3, d: 2.4, c: P.wood },
    ] },
];
