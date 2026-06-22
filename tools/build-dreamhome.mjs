/* Generates vs-dreamhome.html — a single-estate build guide: a huge multi-room
   two-person house, massive farmland to the side and a walk-through greenhouse.
   Scenes are authored as iso primitives (see assets/data/builds/_kit.js),
   rendered with the Pattern Book engine and given course-by-course instructions
   (with material counts) by the shared deriver. Run: node tools/build-dreamhome.mjs */
import { renderSceneSVG } from "../assets/js/iso-scene.js";
import { deriveCourses, estimateMaterials } from "../assets/js/build-steps.js";
import { P, rep, tree, fence } from "../assets/data/builds/_kit.js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

/* offset a list of parts in the x/z plane (for the estate overview) */
const off = (parts, dx, dz) => parts.map((p) => {
  const q = { ...p };
  if ("x" in q) q.x = p.x + dx;
  if ("z" in q) q.z = p.z + dz;
  if (p.pts) q.pts = p.pts.map(([a, b, c]) => [a + dx, b, c + dz]);
  return q;
});

/* ----------------------------------------------------------------- THE HOUSE */
const houseStruct = [
  // stone plinth / footing
  { t: "box", x: 0, y: 0, z: 0, w: 18, h: 1.2, d: 13, c: P.stone },
  // main block — three storeys of timber-frame plaster
  { t: "box", x: 0, y: 1.2, z: 0, w: 18, h: 8, d: 13, c: P.plaster },
  // left hall wing + right kitchen wing, projecting to the front
  { t: "box", x: 0, y: 0, z: 13, w: 6, h: 6, d: 3, c: P.plaster },
  { t: "box", x: 12, y: 0, z: 13, w: 6, h: 5, d: 3, c: P.plaster },
  // exposed corner posts + two string-course beams (reads as three storeys)
  ...[0, 5.9, 11.9, 17.8].map((x) => ({ t: "box", x, y: 1.2, z: 12.85, w: 0.25, h: 8, d: 0.25, c: P.darkwood })),
  ...[3.4, 5.8].map((y) => ({ t: "box", x: 0, y: 1.2 + y, z: 12.85, w: 18, h: 0.25, d: 0.2, c: P.darkwood })),
  // grand double door, centre front
  { t: "door", face: "S", x: 8, y: 1.2, z: 13.02, w: 2, h: 3, c: P.darkwood },
  // porch: two stone columns + a lintel beam over the entrance
  ...[7, 11].map((x) => ({ t: "cyl", x, y: 0, z: 14.6, r: 0.45, h: 3.2, c: P.whitestone, n: 12 })),
  { t: "box", x: 6.4, y: 3.2, z: 13, w: 5.2, h: 0.5, d: 2, c: P.whitestone },
  // three rows of windows down the front (three floors of rooms)
  ...[2.3, 4.7, 7.0].flatMap((y) => [1.4, 4.4, 8.3, 12.0, 15.1].map((x) => ({ t: "win", face: "S", x, y, z: 13.02, w: 1.2, h: 1.5, c: P.black }))),
  // east-side windows
  ...[2.3, 4.7].map((y) => ({ t: "win", face: "E", x: 18.01, y, z: 4, d: 1.5, h: 1.5, c: P.black })),
  // three chimney stacks
  ...[2, 9, 16].map((x) => ({ t: "box", x, y: 9.2, z: 2.5, w: 1.3, h: 3.2, d: 1.3, c: P.stone })),
  // main roof — big gable, ridge along x
  { t: "gable", x: 0, y: 9.2, z: 0, w: 18, d: 13, rise: 4.6, axis: "x", c: P.shingle, cGable: P.plaster },
  // three dormers on the front slope (loft bedrooms)
  ...[3.5, 9, 14.5].flatMap((x) => [
    { t: "box", x: x - 0.9, y: 9.5, z: 11.4, w: 1.8, h: 1.4, d: 0.8, c: P.plaster },
    { t: "win", face: "S", x: x - 0.6, y: 9.8, z: 11.38, w: 1.2, h: 1, c: P.black },
    { t: "gable", x: x - 0.9, y: 10.9, z: 10.9, w: 1.8, d: 1.3, rise: 0.8, axis: "x", c: P.shingle },
  ]),
  // wing roofs
  { t: "gable", x: 0, y: 6, z: 13, w: 6, d: 3, rise: 2, axis: "z", c: P.shingle, cGable: P.plaster },
  { t: "gable", x: 12, y: 5, z: 13, w: 6, d: 3, rise: 2, axis: "z", c: P.shingle, cGable: P.plaster },
];
const house = {
  id: "house", title: "The great house",
  meta: { size: "18×13 + two wings", materials: "Stone plinth, oak frame, plaster, shingles", best: "A huge two-person home: great hall, kitchen, parlour, two bedrooms, a study and a loft" },
  note: "Three storeys of timber-frame over a stone plinth, with a hall wing and a kitchen wing. Ground floor: great hall, kitchen and parlour. First floor: two bedrooms and a study. Above: a loft lit by dormers. Three hearths warm the whole house.",
  parts: [{ t: "ground", x: -2, z: -2, w: 24, d: 19, c: P.ground }, ...houseStruct],
};

/* -------------------------------------------------------------- THE FARMLAND */
const farmStruct = [
  // tilled field
  { t: "ground", x: 0, z: 0, w: 20, d: 14, c: P.soil },
  // crop strips running along x; every third strip left fallow (bare soil)
  ...rep(9, (i) => ({ t: "box", x: 0.4, y: 0, z: 0.6 + i * 1.45, w: 19.2, h: i % 3 === 2 ? 0.18 : 0.45, d: 0.8, c: i % 3 === 2 ? P.soil : (i % 2 ? P.crop : P.green) })),
  // perimeter fence
  ...fence(0, 0, 20, 14, P.post, 1.1),
  // scarecrow at the centre
  { t: "box", x: 10, y: 0, z: 7, w: 0.2, h: 2.2, d: 0.2, c: P.post },
  { t: "box", x: 9.1, y: 1.5, z: 7, w: 1.8, h: 0.2, d: 0.2, c: P.post },
  { t: "box", x: 9.6, y: 2.2, z: 6.9, w: 0.6, h: 0.6, d: 0.6, c: P.cloth },
  // tool & seed barn at a corner
  { t: "box", x: 16, y: 0, z: 10.5, w: 4, h: 3.2, d: 3, c: P.log },
  { t: "door", face: "S", x: 17.5, y: 0, z: 13.51, w: 1.2, h: 2.2, c: P.wood },
  { t: "gable", x: 16, y: 3.2, z: 10.5, w: 4, d: 3, rise: 1.8, axis: "x", c: P.thatch, cGable: P.log },
  // a couple of shade trees at the edges
  ...tree(1.5, 12.5, 1.1), ...tree(18.5, 2, 1.1),
];
const farm = {
  id: "farm", title: "The farmland",
  meta: { size: "20×14 field", materials: "Tilled soil, post-and-rail fence, seed", best: "Feeding two people year-round — grain, roots and greens on a rotating field" },
  note: "A big fenced field beside the house, split into strips: grain, roots and greens, with every third strip left fallow to rotate. A scarecrow stands guard and a tool-and-seed barn sits at the corner.",
  parts: [{ t: "ground", x: -2, z: -2, w: 25, d: 19, c: P.ground }, ...farmStruct],
};

/* ------------------------------------------------------ THE GREENHOUSE (walk-through) */
const ghStruct = [
  // stone knee-walls (low) down both long sides
  { t: "box", x: 0, y: 0, z: 0, w: 0.5, h: 1, d: 11, c: P.stone },
  { t: "box", x: 5.5, y: 0, z: 0, w: 0.5, h: 1, d: 11, c: P.stone },
  // raised planting beds either side of a central path
  ...rep(4, (i) => ({ t: "box", x: 0.6, y: 1, z: 1 + i * 2.4, w: 1.6, h: 0.6, d: 1.8, c: P.crop })),
  ...rep(4, (i) => ({ t: "box", x: 3.8, y: 1, z: 1 + i * 2.4, w: 1.6, h: 0.6, d: 1.8, c: P.crop })),
  // central walk-through path
  { t: "box", x: 2.4, y: 1, z: 0.4, w: 1.2, h: 0.2, d: 10.2, c: P.wood },
  // glass walls (translucent, drawn over the beds)
  { t: "box", x: 0, y: 1, z: 0, w: 6, h: 3.2, d: 11, c: P.glass, op: 0.32 },
  // ridge beam + glass gable roof, ridge running front-to-back so you walk under it
  { t: "box", x: 2.9, y: 4.2, z: 0, w: 0.2, h: 0.2, d: 11, c: P.darkwood },
  { t: "gable", x: 0, y: 4.2, z: 0, w: 6, d: 11, rise: 2, axis: "z", c: P.glass, cGable: P.glass },
  // a door at each gable end — walk straight through
  { t: "door", face: "S", x: 2.3, y: 1, z: 11.02, w: 1.4, h: 2.3, c: P.wood },
  { t: "win", face: "S", x: 2.3, y: 1, z: -0.02, w: 1.4, h: 2.3, c: P.wood },
];
const greenhouse = {
  id: "greenhouse", title: "The walk-through greenhouse",
  meta: { size: "6×11 glasshouse", materials: "Stone knee-wall, glass panes, timber ridge", best: "Year-round greens — walk in one end and out the other, beds either side" },
  note: "A glasshouse you walk straight through, end to end: a door at each gable, a central timber path, and raised planting beds down both sides under a peaked glass roof. The stone knee-walls hold warmth so crops keep through winter.",
  parts: [{ t: "ground", x: -2, z: -2, w: 11, d: 16, c: P.ground }, ...ghStruct],
};

/* --------------------------------------------------------------- THE ESTATE OVERVIEW */
const estate = {
  id: "estate", title: "The whole estate",
  parts: [
    { t: "ground", x: -2, z: -2, w: 54, d: 20, c: P.ground },
    ...off(farmStruct, 0, 2),
    ...off(ghStruct, 22, 4),
    ...off(houseStruct, 31, 1),
  ],
};

/* --------------------------------------------------------------------------- ASSEMBLE */
const sections = [house, farm, greenhouse];
const SEC_META = {
  house: { ix: "01", kicker: "The home" },
  farm: { ix: "02", kicker: "The land" },
  greenhouse: { ix: "03", kicker: "Glass & greens" },
};

const renderSteps = (scene) => deriveCourses(scene)
  .map((s) => `<li><b>${s.title}</b> — ${s.body}</li>`).join("");

const sectionHtml = (scene) => {
  const m = SEC_META[scene.id];
  const spec = [["Footprint", scene.meta.size], ["Key materials", scene.meta.materials], ["Best for", scene.meta.best]]
    .map(([k, v]) => `<div class="brow"><span class="bk">${k}</span><span class="bv">${v}</span></div>`).join("");
  return `    <section class="doc" id="${scene.id}">
      <p class="sec-index">${m.ix} — ${m.kicker}</p>
      <h2>${scene.title}</h2>
      <p class="lead">${scene.note}</p>
      <div class="bc-art">${renderSceneSVG(scene)}</div>
      <div class="bc-spec dreamspec">${spec}</div>
      <h3>Course-by-course plan</h3>
      <ol class="bc-courses">${renderSteps(scene)}</ol>
    </section>`;
};

// estate-wide bill of materials
const estateMats = estimateMaterials([...houseStruct, ...farmStruct, ...ghStruct]);
const billRows = estateMats.map((mat) => `<tr><td>${mat.label.replace(/^./, (s) => s.toUpperCase())}</td><td>~${mat.n}</td></tr>`).join("");

const nav = [["estate", "Overview"], ["house", "The great house"], ["farm", "The farmland"], ["greenhouse", "The greenhouse"], ["materials", "Material bill"]]
  .map(([id, label], i) => `      <a href="#${id}"><span class="ix">${String(i).padStart(2, "0")}</span> ${label}</a>`).join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>The Dream Estate — a huge house, farmland &amp; greenhouse for Vintage Story (v1.22.3)</title>
<meta name="description" content="A complete build guide for a huge two-person homestead in Vintage Story 1.22.3: a three-storey, multi-room great house with a great hall, kitchen, parlour, bedrooms, study and loft; massive rotating farmland beside it; and a walk-through glass greenhouse. Drawn in 3D isometric, with a course-by-course build plan and an approximate material bill for every part." />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/guide.css" />
<link rel="stylesheet" href="assets/css/vs.css" />
<style>
  .dreamspec { max-width: 560px; margin: 16px 0 4px; }
  .bc-art { border-radius: 14px; margin: 8px 0 4px; min-height: 220px; }
  .bc-art svg { max-width: 760px; }
  section.doc .bc-courses { margin-top: 14px; }
</style>
</head>
<body>

<button class="menu-toggle" aria-label="Toggle navigation" data-menu>☰</button>

<div class="shell">
  <aside class="sidebar" data-sidebar>
    <div class="brand">
      <span class="sigil" aria-hidden="true">🏡</span>
      <span class="wordmark">The Dream<br>Estate<small>HOUSE · FARM · GREENHOUSE</small></span>
    </div>
    <a href="vintage-story.html" class="home-link">← The Drifter's Almanac</a>
    <nav class="nav" data-nav>
${nav}
    </nav>
    <p style="margin-top:28px;font-family:var(--f-mono);font-size:0.58rem;letter-spacing:0.06em;color:var(--ink-faint);line-height:1.7">
      One huge homestead, drawn in 3D<br>with a course-by-course plan and<br>a material bill for each part. For<br>more builds see
      <a href="vs-builds.html" style="color:var(--accent)">The Pattern Book</a>. v<b style="color:var(--accent)">1.22.3</b>.
    </p>
  </aside>

  <main class="content">

    <header class="hero" id="top">
      <p class="kicker">Vintage Story · v1.22.3 · A homestead to build for two</p>
      <h1>The Dream Estate</h1>
      <p class="lede">Not a starter shack — the home you build once the base is established: a <strong>huge three-storey great house</strong> with a hall, kitchen, parlour, two bedrooms, a study and a dormered loft; <strong>massive farmland</strong> beside it to feed two people year-round; and a <strong>walk-through greenhouse</strong> for greens through winter. Every part is drawn in 3D, with a course-by-course build plan and an approximate material bill.</p>
      <div class="badges">
        <span class="badge accent">Huge multi-room house</span>
        <span class="badge">Massive farmland</span>
        <span class="badge">Walk-through greenhouse</span>
        <span class="badge accent">📐 Plans + material counts</span>
      </div>
    </header>

    <section class="doc" id="estate">
      <p class="sec-index">00 — The whole estate</p>
      <h2>The estate at a glance</h2>
      <p class="lead">The great house sits to one side; the massive field runs along the other, with the walk-through greenhouse between them so you can carry greens straight indoors. Build the house first for shelter, then fence and till the field, then raise the glasshouse.</p>
      <div class="bc-art">${renderSceneSVG(estate)}</div>
    </section>

${sections.map(sectionHtml).join("\n\n")}

    <section class="doc" id="materials">
      <p class="sec-index">04 — What it takes</p>
      <h2>Material bill (approx.)</h2>
      <p class="lead">A rough tally for the whole estate, estimated from the massing. Treat these as shopping-list ballparks — exact counts depend on how thick you build the walls and how much you chisel and finish. Terrain like tilled soil and crops isn't listed; gather those as seed and a hoe.</p>
      <div class="data-table">
        <table>
          <caption>Estimated blocks for the house, farm buildings and greenhouse</caption>
          <thead><tr><th>Material</th><th>Approx. blocks</th></tr></thead>
          <tbody>${billRows}</tbody>
        </table>
      </div>
      <div class="note tip">
        <span class="label">Build in this order</span>
        <p>Plinth and ground floor of the house first (somewhere dry to sleep), then its upper storeys and roof. Fence and till the field next so food is growing while you finish the house. Raise the greenhouse last — it wants spare glass, which comes after you've a bloomery running.</p>
      </div>
    </section>

  </main>
</div>

<footer class="site">
  <div class="cols">
    <div>
      <strong style="font-family:var(--f-display);color:var(--accent)">The Dream Estate</strong><br>
      Part of <a href="vintage-story.html">The Drifter's Almanac</a>, an unofficial fan-made guide to Vintage Story (v1.22.3).<br>
      Vintage Story is by <a href="https://www.vintagestory.at/">Anego Studios</a>. This guide is not affiliated with them.
    </div>
    <div style="font-family:var(--f-mono);font-size:0.74rem;line-height:1.9">
      Companion pages:<br>
      · <a href="vs-builds.html">The Pattern Book</a> (${"500+"} more builds)<br>
      · <a href="vs-structures.html">The Homestead</a> (cellars &amp; workshops)
    </div>
  </div>
  <p style="margin-top:24px;font-family:var(--f-mono);font-size:0.62rem;color:var(--ink-faint)">The illustrations are stylised isometric massing studies meant to show shape and proportion, not exact block counts or game textures. The plans and material counts are estimates derived from the drawings, not block-by-block schematics. Sizes, materials and recipes are config-/version-dependent. Your in-game Handbook and creative palette are the final word.</p>
</footer>

<script type="module">
  import "./assets/js/vs-guide.js";
</script>
</body>
</html>
`;

writeFileSync(join(root, "vs-dreamhome-estate.html"), html);
console.log(`wrote vs-dreamhome-estate.html — house ${houseStruct.length} parts, farm ${farmStruct.length}, greenhouse ${ghStruct.length}, ${estateMats.length} materials`);
