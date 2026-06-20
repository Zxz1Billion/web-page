# To the Moon 2.0 — Field Guides

A set of in-depth, fan-made field guides for the mods in the **To the Moon 2.0** modpack
(**Minecraft 1.19.2 · Forge**). Every major mod gets its own themed, single-page guide; smaller
mods are gathered into category "hub" guides so the whole ~100-mod pack is covered.

The landing page (`index.html`) is the guide hub. Two flagships lead it:

- **The Osmium Codex** — Mekanism (ore 1×→5×, the machine roster, the chemical chain, QIO, the
  MekaSuit, and interactive top-down schematics for the tanks, evaporation, boiler, turbine and
  the fission & fusion reactors).
- **The Sanguine Scientum** — Blood Magic 3.3.0 (altar tiers, runes, the full ritual roster, the
  Demon Will economy, Living Armor, alchemy and a decorative "Sanguine Crypt" build).

## The guides

| File | Guide | Covers |
| --- | --- | --- |
| `mekanism-guide.html` | The Osmium Codex | Mekanism + Generators + Tools (reference **and** the 8-stage "Assembly Line" progression) |
| `blood-magic-guide.html` | The Sanguine Scientum | Blood Magic (reference **and** the 8-Act "Long Bleed" progression) |
| `create-guide.html` | Brass & Cogs | Create |
| `ae2-guide.html` | The ME Network | Applied Energistics 2 (+ add-ons) |
| `ad-astra-guide.html` | Ad Astra, Per Aspera | Ad Astra (space travel) |
| `tinkers-guide.html` | The Smeltery Ledger | Tinkers' Construct (+ Tinkers Delight) |
| `twilight-forest-guide.html` | The Twilight Atlas | The Twilight Forest |
| `cataclysm-guide.html` | The Cataclysm Bestiary | L_Ender's Cataclysm |
| `spellbooks-guide.html` | The Arcane Codex | Iron's Spells 'n Spellbooks |
| `apotheosis-guide.html` | The Affix Grimoire | Apotheosis |
| `farmers-delight-guide.html` | The Country Cookbook | Farmer's Delight (+ delight add-ons) |
| `storage-guide.html` | The Quartermaster | Backpacks, drawers, pipes & terminals |
| `automation-guide.html` | The Control Bus | XNet, Integrated Dynamics, Flux, RFTools, IC2 |
| `exploration-guide.html` | The Cartographer's Journal | YUNG's, When Dungeons Arise, dungeons |
| `mobs-guide.html` | The Wilds Bestiary | Mowzie's, Mutant Monsters, Tombstone, Aquaculture |
| `building-guide.html` | The Pattern Book | Chipped, Supplementaries, Building Gadgets |
| `quality-of-life-guide.html` | The Operator's Handbook | JEI, maps, performance, FTB, libraries |

Plus a compatibility extra: **`mekanism-ic2c-bridge.html`** ("The EU/FE Bridge") — a drop-in
server patch and wiring guide for the Mekanism ↔ IC2 Classic power exchange (the patcher and
config snippets live in `mekanism-ic2c-compat/`).

## The Drifter's Almanac — a Vintage Story guide (a different game)

The site also hosts a complete, **iPad-friendly** field guide to **Vintage Story** (the
standalone survival game by Anego Studios — *not* a Minecraft mod), targeting **v1.22.3**,
Standard world, Commoner class. Its hub is **`vintage-story.html`** (linked from the top of
`index.html`), leading to 18 self-contained chapters that lean hard into clear, numbered
How-Tos and interactive build plans:

| File | Guide | Covers |
| --- | --- | --- |
| `vintage-story.html` | The Drifter's Almanac | Vintage Story hub / landing |
| `vs-getting-started.html` | The First Day | Survival start, knapping, fire, first-night shelter (interactive plan) + a saved Day-One checklist |
| `vs-questline.html` | The Questline | An **FTB-Quests-style** quest book — 10 chapters of tickable objectives + rewards, browser-saved |
| `vs-progression.html` | The Long Road | Flagship Stone→Copper→Bronze→Iron→Steel ladder as a 40-step browser-saved checklist with a progress meter |
| `vs-crafting.html` | The Four Crafts | Knapping, clay forming, smithing & casting — with interactive grid/voxel pattern viewers |
| `vs-metalworking.html` | Fire & Metal | Ores, crucible smelting, alloys, the 1.22 forge, bloomery, blast furnace, cementation steel |
| `vs-mechanical-power.html` | The Turning World | Axles, gears, windmill & 1.22 waterwheel, quern/helve hammer/pulverizer (with wiring schematics) |
| `vs-food.html` | The Larder | Nutrition groups, foraging, farming & soil nutrients, cooking, 1.22 fishing |
| `vs-clothing-cold.html` | Warmth & Wear | Body temperature & cold, clothing warmth, winter prep, the 8 armor types & protection tiers |
| `vs-structures.html` | The Homestead | House, food cellar, charcoal pit, smithy & greenhouse — five interactive layer-by-layer plans |
| `vs-architect.html` | The Architect | Decorative building: chiseling, palettes, roofs, walls, interiors, six styles + a full cottage build (interactive plans) |
| `vs-builds.html` | The Pattern Book | 3D isometric gallery of 62 structures across 10 themes (shelters, homes, grand, workshops, furnaces, farming, power, defence, crossings, mining) with footprint, materials and use |
| `vs-temporal.html` | The Rust & The Gear | Temporal stability, rifts, storms, temporal gears, storm-proofing |
| `vs-world.html` | The World | Climate & biomes, seasons, geology, ore-by-depth, the prospecting-pick How-To |
| `vs-creatures.html` | The Bestiary | Prey, predators, drifters/locusts, fish, animal husbandry |
| `vs-locations.html` | Ruins & Wayfarers | Ruins, translocators, traders, the 1.22 dynamic dungeon, spoiler-light story |
| `vs-reference.html` | The Codex | A fact-checked reference appendix: 15 tables (melting points, alloys, ores, fuels, tool/anvil tiers, prospecting, crops, nutrition, preservation, temporal, creatures, classes, calendar, controls) |
| `vs-glossary.html` | The Glossary | An A–Z of terms, each defined in a line and deep-linked to its chapter |
| `vs-whatsnew.html` | What's New in 1.22 | A changelog-style tour of the 1.22 update, each feature linked to its chapter |
| `vs-cheatsheet.html` | The Cheat Sheet | A printable one-page poster of every load-bearing number, with a progression-flow diagram |

These pages reuse the shared `assets/css/guide.css` framework and the `SchematicViewer` engine,
add a Vintage Story theme + iPad/touch hardening in **`assets/css/vs.css`**, and bootstrap via
**`assets/js/vs-guide.js`**. That shared layer also provides:

- a CSS **hero banner** motif (geological strata + a temporal-gear ring) on every guide hero;
- a **wired chapter pager** auto-injected at the foot of each page (prev/next chapter, an
  "all chapters" link, and a **Print / Save-as-PDF** button), driven by the `ALMANAC` order in
  `vs-guide.js`;
- **print/PDF styles** that drop the chrome, go full-width and keep each schematic's auto-tallied
  **build-materials list**, so the structure pages double as printable build sheets;
- a generic localStorage **checklist/progress meter** covering every `data-ck` checkbox (the
  progression checklist *and* the questline's tasks), keyed by each page's `data-ckstore`;
- **instant client-side search** (`assets/js/vs-search.js` + the generated
  `assets/data/vs-search-index.js`) — a floating button and a `/` or Ctrl/Cmd-K overlay that
  searches every page/section; regenerate the index with `node` over the pages after edits;
- **hover-to-copy permalinks** on every section heading;
- per-page **Sources & further reading** citations, injected from a map in `vs-guide.js`;
- a site-wide **favicon** (`favicon.svg`), an OpenGraph **cover image** (`assets/og-cover.svg`),
  plus `sitemap.xml` and `robots.txt` for discoverability, and OpenGraph/Twitter meta on the hub.

The reference data has also been fact-checked down to the hard cases: **exact armor stats**
(flat/percent/tier per type, the damage-tier interaction, and slot hit-chances) in
`vs-clothing-cold.html`, and **mechanical-power numbers** (kPa per sail set, altitude/turbulence,
per-machine resistance) in `vs-mechanical-power.html`.

## Structure

```
index.html                     the guide hub (landing page)
*-guide.html                   one self-contained page per guide / category
                               (every page is reference + an in-page Progression section)
roadmap-guide.html             pack-wide progression roadmap ("The Ascent")
questline-guide.html           FTB-Quests-style questline companion
mekanism-ic2c-bridge.html      Mekanism ⇄ IC2 Classic power compat guide
mekanism-ic2c-compat/          the apply_patch.py patcher + config snippets
assets/
  css/
    guide.css                  shared, theme-able guide framework (token-driven)
    site.css                   the Blood Magic guide's bespoke grimoire styling
    mekanism.css               the Mekanism guide's industrial-datasheet styling
  js/
    schematic-viewer.js        reusable top-down layer/tier schematic widget (shared)
    guide-chrome.js            shared nav/scroll-spy + re-exports mountSchematic
    main.js                    Blood Magic guide bootstrap (schematics + checklist/progress)
    mekanism-main.js           Mekanism guide bootstrap (multiblock schematics)
  data/
    schematics.js              Blood Magic altar + decorative builds + ritual layout
    mekanism-schematics.js     Mekanism tanks, evaporation, boiler, turbine, fission, fusion
```

### Theming

Most guides link the shared `assets/css/guide.css` and override a handful of CSS custom
properties (`--accent`, `--bg-*`, `--f-display`, …) in a per-page `:root` block, so every mod
wears its own colour identity while sharing the same chrome and the `SchematicViewer` engine. The
two flagships predate the shared framework and keep their own bespoke stylesheets (`site.css` for
Blood Magic, `mekanism.css` for Mekanism).

Every guide is **one complete page** that pairs reference with an in-page **Progression**
section. The two flagships go deepest: Mekanism's page folds in the 8-stage *Assembly Line*
(goals, build checklists and gates, linking to its multiblock schematics), and Blood Magic's
page folds in the 8-Act *Long Bleed* (with browser-saved checklists and a progress meter). The
pack-wide **The Ascent** (`roadmap-guide.html`) and **The Questline** (`questline-guide.html`)
sequence the whole pack across mods.

### The schematic engine

`SchematicViewer` (in `assets/js/schematic-viewer.js`) renders any build as stacked top-down
layers with a stepper, a block legend and an auto-computed materials tally. Guides that show
multiblocks mount it via `mountSchematic(config, "#selector")` — the framework guides import it
through `guide-chrome.js` (see `tinkers-guide.html` / `ad-astra-guide.html`), while the flagships
mount it from their own bootstraps. Schematics are **representative** — many multiblocks are
player-sized.

## Accuracy

All guides are **fan-made and unofficial**. Mechanics target the 1.19.2 Forge versions in the
pack; rates, energy, capacities and recipes are configurable, so the **in-game guidebooks and
JEI are ground truth** when a number disagrees.

## Hosting on GitHub Pages

Static site — no build step. In **Settings → Pages**, set the source to this branch, root (`/`).
The included `.nojekyll` serves the `assets/` tree as-is. ES modules require HTTPS (which Pages
provides); to test locally:

```
python3 -m http.server 8099   # then open http://localhost:8099/
```

## Credits

Each mod belongs to its respective author (credited in each guide's footer). These guides are
fan-made and not affiliated with any mod or server.
