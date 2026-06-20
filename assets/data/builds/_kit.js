/* ============================================================================
   _kit.js — shared palette + helpers + the PRIMITIVE SPEC for Pattern Book
   scene authoring. Every scene module imports { P, rep, tree, fence } from here
   and exports an array of scene objects. Scenes are rendered by
   assets/js/iso-scene.js (renderSceneSVG).

   ---------------------------------------------------------------------------
   COORDINATES (isometric):  x = east (→ right & down),  z = depth (→ left &
   down),  y = UP.  A part's (x,y,z) is its minimum corner; size grows toward
   +x (w), +y (h), +z (d).  Author parts in PAINT ORDER: ground/water first,
   then back-to-front and bottom-to-top; roofs, chimneys and foreground last.
   Keep footprints roughly within ±8 of origin so cards crop nicely.

   SCENE OBJECT:
     { id, group, title, tags:[..], meta:{size, materials, best}, note, parts:[..] }
     - id: unique short slug (lowercase, no spaces)   - group: a GROUPS id
     - tags: 1-3 short chips                           - meta: 3 short strings
     - note: one or two short sentences (terse, instructional voice)

   PRIMITIVES (each is { t:"name", ...fields }):
     box      {x,y,z,w,h,d,c,op?}          a cuboid (op = 0..1 opacity for glass)
     frustum  {x,y,z,w,d,h,tw,td,c}        tapered box (top tw×td, centered)
     gable    {x,y,z,w,d,rise,c,axis,cGable?}  pitched roof; axis "x" (ridge ‖ x)
                                            or "z". Sits ON walls at height y.
     hip      {x,y,z,w,d,rise,c}           4-slope pyramid roof
     shed     {x,y,z,w,d,rise,c}           single slope, high at z, low at z+d
     wedge    {x,y,z,w,h,d,c,flip?}        triangular prism (ramp/buttress)
     cyl      {x,y,z,r,h,c,n?}             vertical cylinder (x,z = centre)
     cone     {x,y,z,r,h,c,n?}             cone (x,z = centre, apex up)
     dome     {x,y,z,r,h,c,n?,lat?}        hemisphere (x,z = centre)
     sails    {x,y,z,r,n,bw,plane,tilt?,c} fan of n blades in plane "xy" or "zy"
                                            (windmill sails, wheels, spokes)
     stairs   {x,y,z,w,steps,rise,run,c,dir?}  solid staircase ascending ±z
     poly     {pts:[[x,y,z],..], c}        a single flat polygon (custom shapes)
     win/door {face:"S"|"E", x,y,z, w?,h, d?, c}   flat decal on a wall face:
                face "S" spans x(w)&y(h) at depth z; face "E" spans z(d)&y(h) at x
     ground   {x,y?,z,w,d,c}               flat pad   water {x,y?,z,w,d,c}  pond
   Colours come from P (below). Faces are auto-shaded (top light, sides darker).
   ============================================================================ */

export const P = {
  ground: "#473d2c", soil: "#4f4334", water: "#356b7d", mud: "#5a4a33",
  log: "#7a5c3a", plaster: "#9a8763", stone: "#8d8475", whitestone: "#cdc6b5",
  wood: "#5a4630", post: "#483724", darkwood: "#4a3a26",
  thatch: "#6e4630", shingle: "#6d4a30", roofdk: "#5b3b2a", slate: "#55585f",
  glass: "#9fd0d8", clay: "#a85c3c", brick: "#9c4a36", metal: "#6b6b6b",
  iron: "#4a4d52", copper: "#b5713f", gold: "#cda94a", black: "#2c2620",
  cloth: "#d9cdae", canvas: "#cabf9c", green: "#3f5d2f", leaf: "#46673a",
  crop: "#6f8a3a", hay: "#c8a84a", red: "#a23b2b", blue: "#39557a",
  fire: "#d2691e", glow: "#ffe39a", snow: "#e8edf2", sand: "#c8b182",
};

export const rep = (n, fn) => Array.from({ length: n }, (_, i) => fn(i));

// a tree: trunk + leafy dome canopy (scale s)
export const tree = (x, z, s = 1, leaf = P.green) => [
  { t: "cyl", x, y: 0, z, r: 0.32 * s, h: 1.6 * s, c: P.wood, n: 8 },
  { t: "dome", x, y: 1.4 * s, z, r: 1.3 * s, h: 1.7 * s, c: leaf, n: 12, lat: 4 },
];

// a rectangular post-and-rail fence around (x,z)..(x+w,z+d)
export const fence = (x, z, w, d, c = P.post, h = 1) => {
  const out = [];
  const cs = [[x, z], [x + w, z], [x, z + d], [x + w, z + d]];
  for (const [px, pz] of cs) out.push({ t: "box", x: px, y: 0, z: pz, w: 0.2, h, d: 0.2, c });
  out.push({ t: "box", x, y: h * 0.7, z, w, h: 0.15, d: 0.15, c });
  out.push({ t: "box", x, y: h * 0.7, z: z + d, w, h: 0.15, d: 0.15, c });
  out.push({ t: "box", x, y: h * 0.7, z, w: 0.15, h: 0.15, d, c });
  out.push({ t: "box", x: x + w, y: h * 0.7, z, w: 0.15, h: 0.15, d, c });
  return out;
};
