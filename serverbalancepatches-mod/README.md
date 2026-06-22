# Server Balance Patches — Vintage Story content mod

A **JSON-only content mod** (no C#) that adjusts a handful of gameplay values via
Vintage Story's asset-patching system. Server-authoritative, but `side: Universal`
so the game auto-downloads it to clients on join (keeps handbook/tooltip numbers
correct, no mod-list mismatch).

- **modid:** `serverbalancepatches`
- **version:** `1.0.0`
- **target game version:** `1.22.3` (dependency `game: 1.22.3`)
- **build:** `serverbalancepatches_v1.0.0.zip` (modinfo.json sits at the zip root)

No world regen needed — every value here is read at runtime (block break, harvest,
burn, forge), so changes apply to already-explored chunks on restart.

## Changes and tuned values

| # | Concern | Change | Patched file(s) | Patch file |
|---|---------|--------|-----------------|------------|
| 1 | Tree seed drops from leaves | **2×** drop chance (capped < 1.0) | `blocktypes/plant/leaves/{normal,branchy,narrow,bamboo}.json` | `treeseeds.json` |
| 2 | Ore drops per block mined | **1.2×** (+20%, under +25% cap) | `blocktypes/stone/{ore-graded,ore-ungraded}.json` | `oredrops.json` |
| 3 | Fuel burn duration | **2×** | `itemtypes/resource/{firewood,firewood-aged,charcoal}.json` | `fuel.json` |
| 4 | Meat yields | **1.5×** | 24 land-animal entities (`entities/land/*`) | `meat.json` |
| 5 | Crop yields | **1.5×** (+50%) | 15 crops (`blocktypes/plant/crop/*`) | `crops.json` |
| 6 | Armor durability | **2×** | `itemtypes/wearable/armor.json` (50 variants) | `armor.json` |
| 7 | Knife & spear-head forging output | **exactly 2** | `recipes/smithing/{knife,spear}.json` | `forgeyields.json` |

### Exact values

**1. Tree seeds (`treeseeds.json`)** — `treeseed-{wood}` drop `avg` doubled per leaf shape.
Vanilla → patched (default `*`): normal `0.02 → 0.04`, branchy `0.05 → 0.1`, narrow `0.16 → 0.32`,
bamboo sapling `0.08 → 0.16`. Per-species overrides (pine, acacia, larch, redwood, ebony,
purpleheart, crimsonkingmaple) are doubled too. All results stay well below the 1.0 probability cap.

**2. Ore drops (`oredrops.json`)** — `×1.2` on the drop `avg`:
- `ore-graded` (all metal ores): nugget `1.25 → 1.5`, crystallized ore `0.01 → 0.012`.
- `ore-ungraded` default ore `1.25 → 1.5`, quartz ore `1.25 → 1.5`, sylvite `2.5 → 3.0`.
- *Not* touched: `globalDepositSpawnRate` (deposit frequency, new-chunks only — explicitly out of scope),
  gem ore (`ore-gem`) and loose surface ore (`looseores`) are left vanilla.
- Per-grade nugget scaling is applied on top by the `BlockOre` class; scaling the base `avg`
  scales every grade (poor/medium/rich/bountiful) proportionally by 1.2×.

**3. Fuel (`fuel.json`)** — `combustibleProps.burnDuration` doubled:
firewood `24 → 48`, aged firewood `24 → 48`, charcoal `40 → 80`.

**4. Meat (`meat.json`)** — `harvestable` drop `avg` ×1.5 on every meat-bearing land animal:
gazelle `13→19.5`, wild sheep (male `13→19.5`, female `16→24`, lamb `1.5→2.25`),
wild pig (`9→13.5`, piglet `1.5→2.25`), wolf (`7→10.5`, pup `2→3`), hyena (`9→13.5`, pup `1→1.5`),
fox/raccoon (`2→3`), hare (`2→3`), bear bushmeat by colour (`9–22 → 13.5–33`),
chicken poultry (`1.25/1.75 → 1.875/2.625`). Hides/fat/feathers left vanilla.

**5. Crops (`crops.json`)** — ripe-stage food `avg` ×1.5 (e.g. carrot `11→16.5`, onion `12→18`,
cassava `16→24`, rice/sunflower `13→19.5`, rye `11→16.5`, spelt/parsnip `12→18`, flax grain `6→9`
**and** flax fibers `8→12`, pineapple fruit `1→1.5`, etc.). Seeds left vanilla.
Bell pepper is skipped — its block break yields only seeds (peppers are picked off the plant,
not a block drop), so there is no meaningful "+50%" target there.

**6. Armor (`armor.json`)** — every `durabilityByType` entry doubled (improvised/cloth/leather,
lamellar, brigandine, chain, scale, plate across all metals, plus antique blackguard/forlorn).
E.g. iron plate `2200 → 4400`, steel plate `5500 → 11000`, iron chain `800 → 1600`.
Mirrors the `/worldconfig toolDurability 2` setting used for tools.

**7. Forging (`forgeyields.json`)** — adds `output.stacksize = 2` to the anvil smithing recipes
that forge a **metal knife blade** and a **metal spear head** (`knifeblade-{metal}`,
`spearhead-{metal}`). These are the "forge metal → blade/head" steps; the grid assembly recipes
are untouched. One op each covers every metal variant (the recipe iterates metals via
`output.code: "...-{metal}"`).

## Install
1. Drop `serverbalancepatches_v1.0.0.zip` into the server's `Mods/` folder.
2. Restart the server. Clients auto-download it on join (Universal mod).

## Validate (do this once after first load)
1. `Logs/server-main.log` should load the mod with **zero failed patches**. VS logs any patch
   whose target file/path was not found — treat each as a bug to fix.
2. Spot-check the in-game handbook: firewood burn time, knife & spear-head recipe outputs (= 2),
   an ore's drop, armor durability.

## Out of scope (handle via console / serverconfig, not this mod)
- Hunger rate: `/worldconfig playerHungerSpeed 0.5`
- Crop growth speed ×3: `/worldconfigcreate double cropGrowthRateMul 3`
- Tool durability ×2: `/worldconfig toolDurability 2`
- (Optional) winter meat penalty: `/worldconfig harshWinters false`

## Important note on value provenance / version
The **JSON structure and asset paths** were verified against the Vintage Story **1.22.2**
C# source (`anegostudios/vssurvivalmod`, e.g. `SmithingRecipe`/`LayeredVoxelRecipe` confirm the
forge output uses `stacksize`). The exact **vanilla numeric baselines** were read from the most
complete public vanilla-asset extract (a 1.20.x dump); these values have been stable across recent
versions but are not guaranteed identical in 1.22.3.

Because VS core JSON patches can only set literal values (no arithmetic/multiply op), each "2×"
or "×1.5" is written as a pre-computed literal derived from those baselines. If your 1.22.3 install
differs, the validation step above (server log + handbook) will surface it — adjust the affected
literal and rebuild. Notes on version-sensitive bits:
- **Meat** uses array-index pointers (`/server/behaviors/<i>/drops/0/...`). In this data the
  `harvestable` behavior is index 6 for all animals except `chicken-hen` (index 5). If a future
  update reorders entity behaviors, those ops would fail-log and need the index updated.
- **Armor** is patched per-key with `replace`; any armor key renamed/removed upstream (or new
  1.21+ armors like hide armor) is simply left vanilla rather than breaking other entries.

## Rebuild the zip
```
cd src/serverbalancepatches && zip -r -X ../../serverbalancepatches_v1.0.0.zip modinfo.json assets
```
