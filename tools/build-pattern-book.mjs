/* Generates vs-builds.html from GROUPS + SCENES (assets/data/vs-builds-data.js)
   with cards pre-rendered via the iso engine. Run: node tools/build-pattern-book.mjs
   Re-run whenever the scene data changes. */
import { GROUPS, SCENES } from "../assets/data/vs-builds-data.js";
import { buildCard } from "../assets/js/iso-scene.js";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const count = SCENES.length;

const nav = GROUPS.map((g) =>
  `      <a href="#${g.id}"><span class="ix">${g.index}</span> ${g.title}</a>`).join("\n");

const sections = GROUPS.map((g) => {
  const cards = SCENES.filter((s) => s.group === g.id).map(buildCard).join("\n");
  return `    <!-- ${g.index} ${g.title} -->
    <section class="doc" id="${g.id}">
      <p class="sec-index">${g.index} — ${g.kicker}</p>
      <h2>${g.title}</h2>
      <p class="lead">${g.intro}</p>
      <div class="buildgrid">
${cards}
      </div>
    </section>`;
}).join("\n\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<title>The Pattern Book — a Vintage Story building gallery (v1.22.3)</title>
<meta name="description" content="A visual pattern book for Vintage Story 1.22.3: ${count} structures drawn in 3D isometric across ten themes — quick shelters, homes, grand stone builds, workshops, furnaces, farming and livestock, power and water, defence and walls, crossings and waterworks, and mining and storage. Each card gives footprint, key materials and what it's best for." />
<link rel="icon" href="favicon.svg" type="image/svg+xml" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="assets/css/guide.css" />
<link rel="stylesheet" href="assets/css/vs.css" />
</head>
<body>

<button class="menu-toggle" aria-label="Toggle navigation" data-menu>☰</button>

<div class="shell">
  <aside class="sidebar" data-sidebar>
    <div class="brand">
      <span class="sigil" aria-hidden="true">🧱</span>
      <span class="wordmark">The Pattern<br>Book<small>VINTAGE STORY · STRUCTURES</small></span>
    </div>
    <a href="vintage-story.html" class="home-link">← The Drifter's Almanac</a>
    <nav class="nav" data-nav>
${nav}
    </nav>
    <p style="margin-top:28px;font-family:var(--f-mono);font-size:0.58rem;letter-spacing:0.06em;color:var(--ink-faint);line-height:1.7">
      ${count} stylised 3D plans, not block lists.<br>For decorative technique see
      <a href="vs-architect.html" style="color:var(--accent)">The Architect</a>;<br>for course-by-course working<br>plans see
      <a href="vs-structures.html" style="color:var(--accent)">The Homestead</a>. v<b style="color:var(--accent)">1.22.3</b>.
    </p>
  </aside>

  <main class="content">

    <header class="hero" id="top">
      <p class="kicker">Vintage Story · v1.22.3 · Building gallery</p>
      <h1>The Pattern Book</h1>
      <p class="lede">A catalogue of things to build, drawn in 3D so you can see the shape before you place a block. ${count} structures across ten themes: shelters, homes, grand stone, workshops, furnaces, farming, power, defence, crossings and mining. Each card gives the footprint, the key materials and what it's best for. Pick one, copy the massing, then dress the detail with <a href="vs-architect.html">The Architect</a>.</p>
      <div class="badges">
        <span class="badge accent">${count} structures</span>
        <span class="badge">3D isometric</span>
        <span class="badge">10 themes</span>
        <span class="badge accent">🧱 Massing, not block lists</span>
      </div>
    </header>

${sections}

  </main>
</div>

<footer class="site">
  <div class="cols">
    <div>
      <strong style="font-family:var(--f-display);color:var(--accent)">The Pattern Book</strong><br>
      Part of <a href="vintage-story.html">The Drifter's Almanac</a>, an unofficial fan-made guide to Vintage Story (v1.22.3).<br>
      Vintage Story is by <a href="https://www.vintagestory.at/">Anego Studios</a>. This guide is not affiliated with them.
    </div>
    <div style="font-family:var(--f-mono);font-size:0.74rem;line-height:1.9">
      Companion pages:<br>
      · <a href="vs-architect.html">The Architect</a> (decorative technique)<br>
      · <a href="vs-structures.html">The Homestead</a> (course-by-course plans)
    </div>
  </div>
  <p style="margin-top:24px;font-family:var(--f-mono);font-size:0.62rem;color:var(--ink-faint)">The illustrations are stylised isometric massing studies meant to show shape and proportion, not exact block counts or game textures. Sizes, materials and recipes are config-/version-dependent. Your in-game Handbook and creative palette are the final word.</p>
</footer>

<script type="module">
  import "./assets/js/vs-guide.js";
</script>
</body>
</html>
`;

writeFileSync(join(root, "vs-builds.html"), html);
console.log(`wrote vs-builds.html — ${count} structures, ${GROUPS.length} groups`);
