# Mekanism ⇄ IC2 Classic — EU/FE conversion patch

A drop-in compatibility patch for the **To the Moon 2.0** server
(Minecraft **1.19.2** / Forge 43.5.0) that locks the energy exchange rate
between **Mekanism 10.3.9.13** and **IC2 Classic 2.1.3.3** so the two power
systems interoperate cleanly and losslessly.

> **TL;DR** — the bridge is **Forge Energy (FE)**, and the locked rate is
> **`1 EU = 4 FE = 10 J`**. There is *no* coremod/mixin to install — EU/FE
> interop on 1.19.2 is entirely config-driven, so this patch is just a small,
> idempotent edit to two config files plus a wiring guide.

A reader-friendly version of this guide (matching the site's Osmium Codex
style) lives at [`../mekanism-ic2c-bridge.html`](../mekanism-ic2c-bridge.html).

---

## Why a patch is needed

Mekanism and IC2 Classic measure power in **different units on different
networks**:

- **Mekanism** runs on **Joules (J)** and speaks **Forge Energy (FE/RF)**
  natively. It does *not* speak IC2 Classic's EU network reliably on 1.19.2.
- **IC2 Classic** runs on **EU** on its own EnergyNet, and exposes **Forge
  Energy** conversion through its FE-aware blocks (rate = `fluxBalance`).

The common language both mods *always* speak is **Forge Energy**, so FE is the
bridge. The only thing that has to be right is the **exchange rate** — and it
has to be consistent on both sides, or every EU↔FE↔EU round-trip silently
multiplies or destroys power.

## The rate

| Mod | Config key | File | Value | Means |
|---|---|---|---|---|
| IC2 Classic | `I:fluxBalance` | `config/ic2c/ic2.cfg` | `4` | 1 EU = 4 FE |
| Mekanism | `JoulePerEU` | `config/Mekanism/general.toml` | `10` | 1 EU = 10 J |
| Mekanism | `JoulePerForgeEnergy` | `config/Mekanism/general.toml` | `2.5000` | 1 FE = 2.5 J |

**Consistency requirement:** `JoulePerEU ÷ JoulePerForgeEnergy = fluxBalance`
→ `10 ÷ 2.5 = 4`. ✔

So Mekanism's internal view (1 EU = 10 J = 4 FE) and IC2 Classic's view
(1 EU = 4 FE) **agree**, which makes the round-trip lossless:

```
1 EU  →  ×fluxBalance        →  4 FE
4 FE  →  ×JoulePerForgeEnergy →  10 J
10 J  →  ÷JoulePerEU (as FE)  →  back to 1 EU
```

These happen to be the stock defaults for both mods — they were *already*
aligned in this pack. The value of the patch is to **lock and enforce** that
alignment across everyone's `config/` folder and to make the cross-mod path
**deterministic** (see `blacklistIC2` below).

## What the patch changes

`config/Mekanism/general.toml` → `[general.energy_conversion]`:

| Key | Set to | Why |
|---|---|---|
| `JoulePerEU` | `"10"` | lock 1 EU = 10 J |
| `JoulePerForgeEnergy` | `"2.5000"` | lock 1 FE = 2.5 J (⇒ 1 EU = 4 FE) |
| `blacklistForge` | `false` | keep FE interop on — this *is* the bridge |
| `blacklistFluxNetworks` | `false` | allow Flux Networks' high-throughput FE |
| `blacklistIC2` | `true` | **disable Mekanism's direct EU coupling** so all cross-mod energy goes through the explicit FE bridge (deterministic). Pass `--allow-direct-eu` to keep it `false`. |

`config/ic2c/ic2.cfg`:

| Key | Set to | Why |
|---|---|---|
| `I:fluxBalance` | `4` | lock 1 EU = 4 FE |
| `B:mekanism` (`[plugins]`) | `true` | keep IC2 Classic's Mekanism cross-mod plugin on |

It does **not** touch `energyEasyMode` (left at the pack's `false`) — see the
overvolting note below.

### Why `blacklistIC2 = true` by default

Leaving Mekanism's direct IC2-EU integration on means there are *two* ways for
energy to cross between the mods (Mekanism-as-an-EU-tile **and** the FE
bridge), which can double-handle or mis-meter power. Since the task is a clean
**EU/FE conversion**, the patch standardises on the single FE boundary and
disables the direct path. It's fully reversible — run with `--allow-direct-eu`
(or set `blacklistIC2 = false`) if you'd rather let Mekanism cables read EU
directly as well.

## How to apply

From the pack/server root (the folder that contains `config/`):

```bash
# preview only — writes nothing
python3 mekanism-ic2c-compat/apply_patch.py --config-dir config --dry-run

# apply (makes a timestamped .bak of each file it edits)
python3 mekanism-ic2c-compat/apply_patch.py --config-dir config
```

The script is **idempotent** — re-running it is a no-op once the values match.
Distribute the patched `config/Mekanism/general.toml` and `config/ic2c/ic2.cfg`
to every server member (these are server-authoritative, world-restart options).
**Restart the server/world** for the rates to take effect.

Prefer to edit by hand? The exact patched blocks are in
[`reference/`](reference/).

## Wiring it in-game (the part the config can't do for you)

The config sets the *rate*; you still place a block at the boundary that
actually converts:

1. **Mekanism side** accepts/emits FE everywhere — Universal Cables, Energy
   Cubes, and machine energy ports all take FE directly. Nothing special
   needed.
2. **IC2 Classic side** converts at its **FE-aware block** (e.g. an LV/MV/HV
   Transformer / energy interface — confirm the exact block in your build via
   JEI and its tooltip). Feed FE *into* that block to get EU, or pull FE *out*
   of it to drain an EU grid.
3. **Match the IC2 voltage tier to your FE throughput.** IC2 is tiered; with
   `energyEasyMode=false` an over-voltage feed doesn't explode the block —
   **the energy just won't flow.** Bridge at the right tier:

   | IC2 tier | EU/t | = FE/t (×4) |
   |---|---|---|
   | LV | 32 | 128 |
   | MV | 128 | 512 |
   | HV | 512 | 2048 |
   | EV | 2048 | 8192 |

   Throttle the Mekanism cable/cube output (or step IC2 voltage up/down with
   transformers) so the FE you push matches the tier you're bridging at.

> **Verify in-world:** put a known load on one side and read the other with an
> IC2 EU-Reader / Mekanism Network Reader (or just watch a battery fill). At a
> correct setup, EU·4 in = FE out, with no drift.

## Compatibility notes

- **World/server restart required** — the conversion options are flagged
  *Requires world restart* and are server-side in SMP.
- **Flux Networks** is in this pack and rides the same FE; `blacklistFluxNetworks
  = false` keeps its higher-throughput path available across the bridge.
- **Versions:** written against Mekanism `1.19.2-10.3.9.13` and IC2 Classic
  `1.19.2-2.1.3.3`. If a future update renames a key or changes a default,
  trust the in-game tooltips/JEI and re-check the consistency equation above.

*Fan-made server patch. Mekanism is by Aidan Brady & team; IC2 Classic is by
Speiger & the IC2 Classic team. Not affiliated with either.*
