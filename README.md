# The Sanguine Scientum

An unofficial, fan-made field guide for **Blood Magic 3.3.0** on **Minecraft 1.19.2 (Forge)** —
the version repackaged as `BloodMagic-1.19.2-3.3.0-42.jar` for the Ragnarok Reincarnated server.

It pairs a full step-by-step progression guide with **interactive, layer-by-layer schematics**
for both the functional **Blood Altar** and a decorative **"Sanguine Crypt"** ritual space.

> Heads-up on versioning: WayofTime's Blood Magic went **1.18.2 → 1.20.1**, and the `3.3.0` tag
> belongs to the 1.20.1 line — there is no *official* 1.19.2 build. The Ragnarok jar is a
> backport/repackage of that same **3.3.x codebase**, so every number here (read from the 3.3.x
> source and the in-game *Sanguine Scientum* guidebook) applies. If your pack disagrees, trust the
> in-game book — sigil/recipe values are configurable.

## Structure

```
blood-magic-guide.html         the guide (single page, anchored sections)
assets/
  css/site.css                 grimoire/blueprint design system
  js/
    schematic-viewer.js        reusable top-down layer/tier schematic widget
    main.js                    mounts the widgets + nav/scroll-spy
  data/schematics.js           altar tiers + 5 decorative builds + ritual layout

index.html, index2.html, weekly_perks_table.html   pre-existing pages (untouched)
```

### The schematic engine

`SchematicViewer` renders any build as stacked top-down layers with a stepper, a block legend,
and an auto-computed materials tally. It powers two modes:

- **`cumulative`** — the Blood Altar's tier selector (T1–T6); each tier adds a ring that "pops"
  in when you step up, with an LP-capacity meter and an SVG side elevation.
- **`layers`** — the decorative builds; step through Y-layers (bottom → top) and the rail tallies
  the **full-build block shopping list**.

Add a new build by exporting a definition (palette + frames) from `assets/data/schematics.js`,
then `mountSchematic(def, "#selector")` in `main.js`.

## Hosting on GitHub Pages

This is a static site — no build step. In the repo's **Settings → Pages**, set the source to this
branch with the root (`/`) folder. The included `.nojekyll` ensures the `assets/` tree is served
as-is. The pre-existing `index.html` remains the site root; the guide lives at
`blood-magic-guide.html` (e.g. `https://<user>.github.io/web-page/blood-magic-guide.html`).
ES modules require HTTPS (which Pages provides); opening the guide directly via `file://` will not
load the modules — use a local server for testing:

```
python3 -m http.server 8099   # then open http://localhost:8099/blood-magic-guide.html
```

## Credits

Blood Magic is by [WayofTime](https://github.com/WayofTime/BloodMagic). This guide is fan-made and
not affiliated with the mod or the Ragnarok server.
