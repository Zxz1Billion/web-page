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
| `mekanism-guide.html` | The Osmium Codex | Mekanism + Generators + Tools |
| `blood-magic-guide.html` | The Sanguine Scientum | Blood Magic |
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

## Structure

```
index.html                     the guide hub (landing page)
*-guide.html                   one self-contained page per guide / category
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
    main.js                    Blood Magic guide bootstrap
    mekanism-main.js           Mekanism guide bootstrap
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
