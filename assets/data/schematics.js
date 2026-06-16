/* ============================================================================
   Schematic definitions — feeds the reusable SchematicViewer.
   Two families:
     • altarSchematic()  — functional Blood Altar, tiers T1–T6 (brief §3 + §4)
     • decorSchematics   — "The Sanguine Crypt" decorative builds, exact layers
     • ritualSchematic() — representative Well of Suffering stone layout
   All blocks are 1.19.2-available.
   ========================================================================== */

/* -------------------------------------------------- shared palette swatches */
export const PAL = {
  // functional altar
  rune:        { label: "Blood Rune",            color: "#b1322a" },
  glowstone:   { label: "Glowstone (cap)",       color: "#e0ad44" },
  bloodstone:  { label: "Lg. Bloodstone Brick",  color: "#5d1212" },
  beacon:      { label: "Beacon",                color: "#46c9bd" },
  crystal:     { label: "Crystal Cluster (cap)", color: "#c764b4" },
  altar:       { label: "Blood Altar",           color: "#2a1f3a" },
  pillar:      { label: "Pillar block (any solid)", color: "#5a4a3a" },

  // decorative — Sanguine Crypt
  deepslate_brick:  { label: "Deepslate Bricks",        color: "#36373c" },
  cobbled_deepslate:{ label: "Cobbled Deepslate",       color: "#494b4f" },
  deepslate_tile:   { label: "Deepslate Tiles",         color: "#2c2e32" },
  blackstone:       { label: "Blackstone",              color: "#2a2528" },
  pol_blackstone:   { label: "Pol. Blackstone Bricks",  color: "#3a3540" },
  darkoak_log:      { label: "Dark Oak Log",            color: "#2c2014" },
  darkoak_plank:    { label: "Dark Oak Planks",         color: "#46341f" },
  crimson_plank:    { label: "Crimson Planks",          color: "#7a2c3a" },
  crimson_hyphae:   { label: "Crimson Hyphae",          color: "#581b2a" },
  red_nether:       { label: "Red Nether Bricks",       color: "#45090c" },
  red_concrete:     { label: "Red Concrete",            color: "#8e2121" },
  red_carpet:       { label: "Red Carpet",              color: "#a32d2d" },
  soul_lantern:     { label: "Soul Lantern",            color: "#6fd3e6" },
  chain:            { label: "Chain",                   color: "#4a4a52" },
  candle:           { label: "Candle",                  color: "#e8c98a" },
  crying_obsidian:  { label: "Crying Obsidian",         color: "#3a1f57" },
  glass:            { label: "Glass",                   color: "#bfe6ec" },
  red_banner:       { label: "Red Banner",              color: "#8a1f1f" },

  // ritual
  master_ritual_stone: { label: "Master Ritual Stone", color: "#c08a3a" },
  ritual_stone:        { label: "Ritual Stone",        color: "#6b6f74" },

  // incense altar (tranquility)
  incense_altar:   { label: "Incense Altar",        color: "#8a6326" },
  path_wood:       { label: "Wooden Path",          color: "#6e4a24" },
  path_stone:      { label: "Stone Path",           color: "#7d7d7d" },
  path_wornstone:  { label: "Worn Stone Path",      color: "#565656" },
  path_obsidian:   { label: "Obsidian Path",        color: "#241830" },
  tranquil_plant:  { label: "Tranquil block (crop/leaves)", color: "#3f6b34" },

  // demon will infrastructure
  demon_crucible:    { label: "Demon Crucible",       color: "#7a2330" },
  demon_crystallizer:{ label: "Demon Crystallizer",   color: "#2f6a70" },
  demon_pylon:       { label: "Demon Pylon",          color: "#9a6a2a" },
  will_crystal:      { label: "Demon Will Cluster",   color: "#c764b4" },
};

/* --------------------------------------------------------------- utilities */
const grid = (rows, cols, fill = null) =>
  Array.from({ length: rows }, () => Array(cols).fill(fill));

// build a grid from ASCII rows + a char->key map ('.' and ' ' = air)
const fromAscii = (rows, map) =>
  rows.map((line) =>
    line.split("").map((ch) => (ch === "." || ch === " " ? null : map[ch] ?? null))
  );

/* ============================================================ BLOOD ALTAR ==
   N = 23, center C = 11. Roles resolved per the brief §4 geometry engine.   */
const N = 23, C = 11;

const ACTIVE_RINGS = {
  1: [], 2: [1], 3: [1, 3], 4: [1, 3, 5], 5: [1, 3, 5, 7], 6: [1, 3, 5, 7, 11],
};
const PILLAR = { 3: { r: 3, cap: "glowstone" }, 4: { r: 5, cap: "bloodstone" }, 6: { r: 11, cap: "crystal" } };

function altarRole(tier, dx, dy) {
  const d = Math.max(dx, dy);
  if (d === 0) return "altar";
  if (tier === 5 && dx === 9 && dy === 9) return "beacon"; // T5 beacons float outward
  const pill = PILLAR[tier];
  const rings = ACTIVE_RINGS[tier].slice().sort((a, b) => b - a); // outer -> in
  for (const rr of rings) {
    if (d === rr) {
      const corner = dx === dy && dx === rr;
      if (corner) {
        if (pill && pill.r === rr) return pill.cap; // pillar cap
        if (rr === 7) return null;                   // r7 corners = spacers (empty)
        return "rune";
      }
      return "rune";
    }
  }
  return null;
}

function altarGrid(tier) {
  const g = grid(N, N);
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++)
      g[r][c] = altarRole(tier, Math.abs(c - C), Math.abs(r - C));
  return g;
}

// canonical per-tier figures (brief §3) — authoritative shopping numbers
const ALTAR_TIERS = [
  { label: "T1", lp: 10000, foot: "1×1", h: "1 high",
    tally: [["altar", "Blood Altar", 1]],
    note: "A bare Blood Altar. Right-click a Sacrificial Dagger to bleed LP into it." },
  { label: "T2", lp: 10000, foot: "3×3", h: "2 high",
    tally: [["altar", "Blood Altar", 1], ["rune", "Blood Runes", 8]],
    note: "First ring: eight Blood Runes one level below the altar. Unlocks Apprentice-tier crafts." },
  { label: "T3", lp: 66000, foot: "7×7", h: "4 high",
    tally: [["rune", "Blood Runes", 28], ["glowstone", "Glowstone (caps)", 4], ["pillar", "Pillar blocks", 8]],
    note: "Adds four 2-tall corner pillars capped with Glowstone (Sea Lantern / Shroomlight also valid)." },
  { label: "T4", lp: 122000, foot: "11×11", h: "6 high",
    tally: [["rune", "Blood Runes", 56], ["bloodstone", "Lg. Bloodstone Brick (caps)", 4], ["pillar", "Pillar blocks", 16]],
    note: "Four 4-tall pillars capped with Large Bloodstone Bricks. Capacity climbs steeply." },
  { label: "T5", lp: 226000, foot: "19×19", h: "7 high",
    tally: [["rune", "Blood Runes", 108], ["beacon", "Beacons", 4]],
    note: "Four active Beacons at the 19×19 corners. This is the practical survival ceiling." },
  { label: "T6", lp: 378000, foot: "23×23", h: "9 high",
    tally: [["rune", "Blood Runes", 184], ["crystal", "Crystal Cluster (caps)", 4], ["pillar", "Pillar blocks", 28]],
    note: "Four 7-tall pillars capped with Crystal Clusters — not survival-craftable without config/creative." },
];

// inverted step-pyramid side elevation (widest ring at the base, altar on top)
function altarElevation(i) {
  const tier = i + 1;
  const s = 7.0, cx = 130, slabH = 13, baseY = 178;
  const rings = ACTIVE_RINGS[tier].slice().sort((a, b) => b - a); // bottom -> top
  const stack = [...rings, 0]; // altar apex on top
  const col = { rune: PAL.rune.color, altar: PAL.altar.color };
  let y = baseY, slabs = "";
  const apexTopY = baseY - stack.length * slabH;
  for (const r of stack) {
    const w = (2 * r + 1) * s;
    const isAltar = r === 0;
    const fill = isAltar ? col.altar : col.rune;
    const stroke = isAltar ? "#b8923f" : "#2a0d0c";
    slabs += `<rect x="${(cx - w / 2).toFixed(1)}" y="${(y - slabH).toFixed(1)}" width="${w.toFixed(1)}" height="${slabH}" rx="1.5" fill="${fill}" stroke="${stroke}" stroke-width="1"/>`;
    if (isAltar) slabs += `<circle cx="${cx}" cy="${y - slabH / 2}" r="2.4" fill="#ff5a3c"/>`;
    y -= slabH;
  }
  // pillars (with cap) for pillar tiers
  let extras = "";
  const pill = PILLAR[tier];
  if (pill) {
    const px = pill.r * s;
    const pTop = apexTopY - (tier >= 6 ? 34 : tier >= 4 ? 24 : 16);
    const capCol = PAL[pill.cap].color;
    for (const sgn of [-1, 1]) {
      const x = cx + sgn * px - 3;
      extras += `<rect x="${x}" y="${pTop}" width="6" height="${baseY - pTop}" fill="#4a3a2a" stroke="#241a10"/>`;
      extras += `<rect x="${x - 1.5}" y="${pTop - 8}" width="9" height="8" rx="1.5" fill="${capCol}" stroke="#241a10"/>`;
    }
  }
  // beacons (T5)
  if (tier === 5) {
    for (const sgn of [-1, 1]) {
      const x = cx + sgn * 9 * s - 5;
      extras += `<rect x="${x}" y="${baseY - 10}" width="10" height="10" rx="2" fill="${PAL.beacon.color}" stroke="#0c3b38"/>`;
      extras += `<line x1="${x + 5}" y1="${baseY - 10}" x2="${x + 5}" y2="18" stroke="${PAL.beacon.color}" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.5"/>`;
    }
  }
  return `<svg viewBox="0 0 260 196" role="img" aria-label="Altar side elevation, tier ${tier}">
    <line x1="20" y1="${baseY}" x2="240" y2="${baseY}" stroke="rgba(201,180,141,0.3)" stroke-width="1" stroke-dasharray="3 4"/>
    ${slabs}${extras}
  </svg>`;
}

export function altarSchematic() {
  return {
    title: "The Blood Altar",
    subtitle: "tiers I – VI · top-down build plate",
    meta: { footprint: "23×23 max", height: "9 max" },
    palette: PAL,
    mode: "cumulative",
    segmented: true,
    coords: false,
    startIndex: 2,
    lpScale: 378000,
    elevation: altarElevation,
    frames: ALTAR_TIERS.map((t, i) => ({
      label: t.label,
      grid: altarGrid(i + 1),
      lp: t.lp,
      note: `${t.note}  (footprint ${t.foot}, ${t.h}, ${t.lp.toLocaleString()} LP)`,
      tally: t.tally.map(([k, label, count]) => ({ label, color: PAL[k].color, count })),
    })),
  };
}

/* ====================================================== DECORATIVE BUILDS ==
   "The Sanguine Crypt" — exact Y-layer maps (bottom → top).                  */

/* 1 — Blood-channel floor (radial veins fanning from the altar) */
function bloodChannelFloor() {
  const S = 11, mid = 5;
  const foundation = grid(S, S, "cobbled_deepslate");
  const surface = grid(S, S);
  for (let r = 0; r < S; r++)
    for (let c = 0; c < S; c++) {
      const dx = Math.abs(c - mid), dy = Math.abs(r - mid), d = Math.max(dx, dy);
      let k;
      if (d === 0) k = "altar";
      else if (dx === dy && d === 5) k = "red_nether";       // corner braziers
      else if (c === mid || r === mid || r === c || r + c === 10) k = "red_concrete"; // veins
      else if (d === 1) k = "red_carpet";                    // carpet ring at altar foot
      else k = "deepslate_brick";
      surface[r][c] = k;
    }
  return {
    title: "Blood-Channel Floor",
    subtitle: "module 1 · radial veins on deepslate",
    meta: { footprint: "11×11", height: "2" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Foundation course", grid: foundation, note: "Cobbled deepslate sub-floor — levels the pit before the show surface goes down." },
      { label: "Show surface", grid: surface, note: "Red-concrete veins fan from the altar along cardinals + diagonals; a red-carpet ring rings the altar foot, red-nether braziers anchor the corners." },
    ],
  };
}

/* small char map for decorative ASCII layers */
const M = {
  B: "blackstone", P: "pol_blackstone", L: "darkoak_log", p: "darkoak_plank",
  c: "crimson_plank", h: "crimson_hyphae", O: "crying_obsidian", g: "glass",
  l: "soul_lantern", n: "chain", D: "deepslate_brick", r: "red_carpet",
  R: "ritual_stone", x: "candle",
};

/* 2 — Wall + ribbed vaulting bay (footprint 4 deep × 7 wide; Y = height course) */
function vaultBay() {
  const f = (rows) => fromAscii(rows, M);
  return {
    title: "Ribbed Vault Bay",
    subtitle: "module 2 · repeatable wall section",
    meta: { footprint: "7×4", height: "6 courses" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Y0 · footing", note: "Polished-blackstone back wall; dark-oak log ribs anchor the corners and frame the bay.",
        grid: f(["PPPPPPP", "L.....L", "L.....L", "......."]) },
      { label: "Y1 · wall", note: "Wall and ribs rise straight. Repeat this course as tall as your ceiling needs.",
        grid: f(["PPPPPPP", "L.....L", "L.....L", "......."]) },
      { label: "Y2 · wall + banner", note: "Hang a crimson banner on the back wall between the ribs.",
        grid: f(["PPcPPcP", "L.....L", "L.....L", "......."]) },
      { label: "Y3 · springing", note: "Ribs turn inward — swap log for dark-oak planks where the vault begins to curve.",
        grid: f(["PPPPPPP", "p.....p", "L.....L", "......."]) },
      { label: "Y4 · arch", note: "Plank ribs arc toward the centre; the bay starts to close overhead.",
        grid: f(["PpPPPpP", ".p...p.", "..p.p..", "......."]) },
      { label: "Y5 · keystone + lantern", note: "Ribs meet at a dark-oak keystone; a soul lantern hangs on chain from the vault.",
        grid: f(["PPPPPPP", "..ppp..", "...n...", "...l..."]) },
    ],
  };
}

/* 3 — Pillar + sconce module (3×3, aligns to the altar's corner pillars) */
function sconcePillar() {
  const f = (rows) => fromAscii(rows, M);
  return {
    title: "Pillar & Sconce",
    subtitle: "module 3 · column with soul sconce",
    meta: { footprint: "3×3", height: "6" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Y0 · base", note: "Blackstone-cornered base with a dark-oak log core. Line these up with the altar's corner pillars.",
        grid: f(["BPB", "PLP", "BPB"]) },
      { label: "Y1 · shaft", note: "Log core continues; corners open up for a slimmer shaft.",
        grid: f(["B.B", ".L.", "B.B"]) },
      { label: "Y2 · shaft", note: "Bare log column.",
        grid: f(["...", ".L.", "..."]) },
      { label: "Y3 · banner + chain", note: "Crimson banners face front and back; chains brace the sides for the sconce.",
        grid: f([".c.", "nLn", ".c."]) },
      { label: "Y4 · soul sconce", note: "Soul lanterns sit on the chains, casting cold blue against the altar's warm glow.",
        grid: f([".l.", ".L.", ".l."]) },
      { label: "Y5 · capital", note: "Blackstone capital crowns the column.",
        grid: f(["BPB", "PLP", "BPB"]) },
    ],
  };
}

/* 4 — Skylight shaft (7×7 hollow ring framing the vertical opening) */
function skylightShaft() {
  const f = (rows) => fromAscii(rows, M);
  const shaft = ["gOOOOOg", "O.....O", "O.....O", "O.....O", "O.....O", "O.....O", "gOOOOOg"];
  return {
    title: "Skylight Shaft",
    subtitle: "module 4 · vertical light well",
    meta: { footprint: "7×7", height: "5+" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Y0 · shaft wall", note: "Crying-obsidian shaft with glass-corner quoins. The hollow centre is the open well above the altar.",
        grid: f(shaft) },
      { label: "Y1 · shaft wall", note: "Repeat the ring upward as far as the spire's skylight — crying obsidian weeps a faint purple.",
        grid: f(shaft) },
      { label: "Y2 · shaft wall", note: "Keep stacking. Tall is good; the beam of daylight reads as a divine shaft.",
        grid: f(shaft) },
      { label: "Y3 · lantern rim", note: "Set soul lanterns at the wall midpoints for a ring of cold light partway up.",
        grid: f(["gOlOlOg", "O.....O", "l.....l", "O.....O", "l.....l", "O.....O", "gOlOlOg"]) },
      { label: "Y4 · glass cap (optional)", note: "Cap with glass to keep weather out while keeping the light — or leave fully open to the sky.",
        grid: f(["ggggggg", "ggggggg", "ggggggg", "ggggggg", "ggggggg", "ggggggg", "ggggggg"]) },
    ],
  };
}

/* 5 — Balcony ring (upper ritual-stone gallery overlooking the pit) */
function balconyRing() {
  const S = 11, mid = 5;
  const D = (r, c) => { const dx = Math.abs(c - mid), dy = Math.abs(r - mid); return Math.max(dx, dy); };
  const floor = grid(S, S), rail = grid(S, S), posts = grid(S, S);
  for (let r = 0; r < S; r++)
    for (let c = 0; c < S; c++) {
      const d = D(r, c), dx = Math.abs(c - mid), dy = Math.abs(r - mid);
      // floor ring: 3 <= d <= 5 (open pit in the middle)
      if (d >= 3 && d <= 5) floor[r][c] = "deepslate_brick";
      // railing layer: outer edge + ritual stones on the walkway
      if (d === 5) rail[r][c] = dx === dy ? "blackstone" : "pol_blackstone";
      if (d === 4 && (r === mid || c === mid)) rail[r][c] = "ritual_stone"; // 4 cardinal ritual stones
      if (d === 3 && (r === mid || c === mid)) rail[r][c] = "deepslate_brick";
      else if (d >= 3 && d <= 5 && rail[r][c] == null && d !== 5) rail[r][c] = null;
      // posts + lanterns
      if (d === 5 && dx === dy) posts[r][c] = "blackstone";          // corner posts
      if (d === 5 && (r === mid || c === mid)) posts[r][c] = "soul_lantern"; // mid lanterns
    }
  return {
    title: "Balcony Ring",
    subtitle: "module 5 · upper ritual gallery",
    meta: { footprint: "11×11", height: "3" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Y0 · walkway", note: "A three-wide deepslate-brick ring overhanging the pit; the centre stays open down to the altar.",
        grid: floor },
      { label: "Y1 · railing + stones", note: "Blackstone railing on the outer edge; four Ritual Stones face inward on the cardinals (lay your real ritual on the pad below — these are decorative markers).",
        grid: rail },
      { label: "Y2 · posts + lanterns", note: "Corner posts and soul lanterns at the cardinal midpoints crown the gallery.",
        grid: posts },
    ],
  };
}

/* ============================================ RITUAL — Well of Suffering ==
   Representative top-down ritual-stone layout. The Ritual Diviner places the
   real stones for you; treat this as orientation, not gospel. (See §7 note.) */
function wellOfSufferingRitual() {
  const S = 11, mid = 5;
  const g = grid(S, S);
  // Master Ritual Stone at centre
  g[mid][mid] = "master_ritual_stone";
  // a representative ring/cross of ritual stones around it
  const stones = [
    [mid, mid - 2], [mid, mid + 2], [mid - 2, mid], [mid + 2, mid],
    [mid - 2, mid - 2], [mid - 2, mid + 2], [mid + 2, mid - 2], [mid + 2, mid + 2],
    [mid, mid - 4], [mid, mid + 4], [mid - 4, mid], [mid + 4, mid],
  ];
  for (const [r, c] of stones) g[r][c] = "ritual_stone";
  return {
    title: "Well of Suffering — Ritual Layout",
    subtitle: "representative · build with the Ritual Diviner",
    meta: { footprint: "≈9×9 pad", height: "1" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Ritual pad", grid: g,
        note: "Master Ritual Stone at the centre, ringed by Ritual Stones. In-game, hold a Ritual Diviner and right-click to ghost-place every stone, then activate with an Activation Crystal. Exact cells vary by version — trust the Diviner over this sketch." },
    ],
  };
}

/* ============================================ INCENSE ALTAR (Tranquility) ==
   Representative top-down. The Incense Altar block sits at the centre; four
   path "roads" radiate on the cardinal axes. The block tier of each road ring
   sets the maximum self-sacrifice bonus (see §09 table). Tranquil blocks
   (crops, leaves, water) scattered in range raise Tranquility further. Exact
   detection radius/levels are config- and version-sensitive — trust the
   Sigil of the Seer's on-screen readout in-game. */
function incenseAltar() {
  const S = 11, mid = 5;
  const g = grid(S, S);
  // distance band -> path tier (closest rings cheap, outer rings need better path)
  const band = (d) => (d <= 1 ? "path_wood" : d === 2 ? "path_wood" : d === 3 ? "path_stone" : d === 4 ? "path_wornstone" : "path_obsidian");
  for (let r = 0; r < S; r++)
    for (let c = 0; c < S; c++) {
      const dx = Math.abs(c - mid), dy = Math.abs(r - mid), d = Math.max(dx, dy);
      if (d === 0) { g[r][c] = "incense_altar"; continue; }
      // four 1-wide cardinal roads
      if ((r === mid || c === mid) && d <= 5) { g[r][c] = band(d); continue; }
      // a few tranquil blocks salted into the quadrants for ambience/bonus
      if (dx === dy && d >= 2 && d <= 4) g[r][c] = "tranquil_plant";
    }
  return {
    title: "Incense Altar — Tranquility",
    subtitle: "module · self-sacrifice multiplier",
    meta: { footprint: "11×11 area", height: "1 (+ altar)" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Path layout", grid: g,
        note: "Incense Altar at the centre; four roads radiate on the cardinals. Ring colour shows the path tier — wood near the altar, upgrading to stone → worn stone → obsidian as you go out, each tier raising the cap. Diagonal tranquil blocks (crops, leaves, water) sweeten the bonus. Representative: confirm the live number on the Sigil of the Seer before you bleed." },
    ],
  };
}

/* ============================================== DEMON WILL GARDEN (aura) ==
   A Demon Crucible burns Will (gems / crystals) into the chunk's invisible
   Demon Will Aura; Demon Crystallizers in the same chunk pull from that aura
   and grow Demon Will Crystal clusters on top of themselves. Placement inside
   the chunk is loose — they share one aura pool — so this is orientation, not
   a strict multiblock. A Demon Pylon equalises aura with neighbouring chunks. */
function willGarden() {
  const S = 7, mid = 3;
  const g = grid(S, S);
  g[mid][mid] = "demon_crucible";
  // crystallizers on the cardinals, two out
  for (const [r, c] of [[mid - 2, mid], [mid + 2, mid], [mid, mid - 2], [mid, mid + 2]])
    g[r][c] = "demon_crystallizer";
  // a grown cluster sitting beside each crystallizer (visual)
  for (const [r, c] of [[mid - 3, mid], [mid + 3, mid], [mid, mid - 3], [mid, mid + 3]])
    if (g[r] && g[r][c] === null) g[r][c] = "will_crystal";
  // pylons at the corners to share aura outward
  for (const [r, c] of [[0, 0], [0, S - 1], [S - 1, 0], [S - 1, S - 1]])
    g[r][c] = "demon_pylon";
  return {
    title: "Demon Will Garden",
    subtitle: "module · passive Will crystal farm",
    meta: { footprint: "≈ one chunk", height: "2" },
    palette: PAL, mode: "layers", segmented: false, coords: true,
    frames: [
      { label: "Crucible + crystallizers", grid: g,
        note: "Centre: a Demon Crucible, fed Will to raise the chunk's aura. Around it: Demon Crystallizers, each growing a Will-crystal cluster (shown beside them) once the aura is high enough — harvest the outer crystals and leave one to regrow. Demon Pylons at the corners bleed aura into neighbour chunks if you want to spread it. Exact spacing is free: they all share the one chunk-wide aura pool." },
    ],
  };
}

/* --------------------------------------------------------------- registry */
export const DECOR = {
  floor: bloodChannelFloor(),
  vault: vaultBay(),
  pillar: sconcePillar(),
  skylight: skylightShaft(),
  balcony: balconyRing(),
};
export const RITUAL = wellOfSufferingRitual();
export const INCENSE = incenseAltar();
export const WILL_GARDEN = willGarden();
