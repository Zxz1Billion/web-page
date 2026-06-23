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
| 4 | Meat yields | **1.5×** | 24 land-animal entities (`entities/land/*`) | `meat.json` ⚠ pending 1.22.3 re-extract |
| 5 | Crop yields | **1.5×** (+50%) | 17 crops (`blocktypes/plant/crop/*`) | `crops.json` |
| 6 | Armor durability | **2×** | `itemtypes/wearable/seraph/armor.json` (50 variants) | `armor.json` |
| 7 | Knife forging output | **exactly 2** | `recipes/smithing/knife.json` | `forgeyields.json` (spear ⚠ pending) |

> **1.22.3 verification status.** Values for fuel, leaves, ore, crops, and armor were
> regenerated from a real 1.22.3 `assets/survival` extract and are exact. The extract found
> two version changes vs. older data: **armor moved to `itemtypes/wearable/seraph/armor.json`**
> (durability numbers unchanged) and **grains were rebalanced down** (rice/rye/spelt/sunflower/
> amaranth/flax) — both corrected here. New crops **fennel** and **licorice** are included;
> **bell pepper** is no longer a yielding crop. **Meat** (`entities/land/`) and the **spear-head
> smithing recipe** were not present in the partial asset folder used, so those two are pending a
> second extract — `meat.json` currently holds best-effort values and the spear patch is omitted
> until its real recipe path is confirmed.

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

**5. Crops (`crops.json`)** — ripe-stage food `avg` ×1.5, using **actual 1.22.3** baselines:
vegetables carrot `11→16.5`, onion `12→18`, parsnip `12→18`, turnip `7→10.5`, cabbage `2→3`,
cassava `16→24`, fennel `11→16.5`, peanut `10→15`, soybean `6→9`, pineapple fruit `1→1.5`,
licorice spice `11→16.5`; grains (rebalanced down in 1.22) rice `6.5→9.75`, rye `5.5→8.25`,
spelt `6→9`, sunflower `6.5→9.75`, amaranth `3→4.5`, flax grain `3→4.5` **and** flax fibers `4→6`.
Seeds left vanilla. Bell pepper is no longer a yielding crop in 1.22.3, so it is not patched.

**6. Armor (`armor.json`)** — every `durabilityByType` entry doubled (improvised/cloth/leather,
lamellar, brigandine, chain, scale, plate across all metals, plus antique blackguard/forlorn).
E.g. iron plate `2200 → 4400`, steel plate `5500 → 11000`, iron chain `800 → 1600`.
File is `game:itemtypes/wearable/seraph/armor.json` (1.22.3 location).
Mirrors the `/worldconfig toolDurability 2` setting used for tools.

**7. Forging (`forgeyields.json`)** — adds `output.stacksize = 2` to the anvil smithing recipe
that forges a **metal knife blade** (`knifeblade-{metal}`); one op covers every metal variant
(the recipe iterates metals via `output.code`). The grid assembly recipe is untouched.
The **spear-head** recipe is **not** at `recipes/smithing/spear.json` in 1.22.3 (the forge
rework moved/renamed it) — that patch is omitted until the real path is confirmed (see below).

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

## Getting ACTUAL 1.22.3 values — `build_from_assets.py`

VS core JSON patches cannot multiply, so every "2×"/"×1.5" is written as a pre-computed literal,
which means each one has to be derived from the real vanilla baseline for the exact game version.
Those baselines live in the game install (`assets/survival`), not on GitHub. To guarantee the
literals match **your** 1.22.3 server, regenerate them from your install:

```bash
# point it at your 1.22.3 server's asset tree (the folder that contains blocktypes/, itemtypes/, ...)
python3 build_from_assets.py --assets /path/to/Vintagestory/assets/survival --out ./out

# rebuild the zip (modinfo.json must sit at the zip root)
cd out/serverbalancepatches && zip -r -X ../serverbalancepatches_v1.0.0.zip modinfo.json assets
```

The script reads each real file, computes the scaled literal from the actual value, and writes all
seven patch files + `modinfo.json`. It is version-independent (handles per-variant `quantityByType`,
finds each crop's true ripe stage, locates the `harvestable` behavior index per entity, etc.), so it
also tracks any 1.22.3 changes automatically. Tunable multipliers are constants at the top of the file.
Validation: run against a 1.20.x asset dump it reproduces the values in this repo's committed patches,
so the logic is verified.

## Important note on value provenance / version
The **JSON structure and asset paths** were verified against the Vintage Story **1.22.2**
C# source (`anegostudios/vssurvivalmod`, e.g. `SmithingRecipe`/`LayeredVoxelRecipe` confirm the
forge output uses `stacksize`).

The **numeric baselines in the pre-built `serverbalancepatches_v1.0.0.zip`** were read from the most
complete *publicly reachable* vanilla-asset extract, which is a **1.20.x dump** — the official 1.22.3
assets ship only inside the game/server download, which was not reachable from the build environment.
These values have been stable across recent versions but are **not guaranteed identical in 1.22.3**.
**For a server you care about, regenerate with `build_from_assets.py` against your 1.22.3 install
(above) and use that zip** — that is the only way to be certain every literal is the true 1.22.3 value.

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
