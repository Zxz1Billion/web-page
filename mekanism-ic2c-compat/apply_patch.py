#!/usr/bin/env python3
"""
Mekanism <-> IC2 Classic energy-bridge compatibility patch
===========================================================

Locks the EU <-> FE <-> Joule exchange rates in a "To the Moon 2.0"
(MC 1.19.2 / Forge) config tree so that every machine on the server agrees
on a single, lossless conversion:

        1 EU  =  4 FE  =  10 J

Forge Energy (FE) is used as the canonical bridge between the two power
systems: IC2 Classic converts EU <-> FE at `fluxBalance` (RF per EU), and
Mekanism converts FE <-> Joules at `JoulePerForgeEnergy`. Picking values
that satisfy  JoulePerEU / JoulePerForgeEnergy == fluxBalance  makes the
round-trip EU -> FE -> EU lossless.

This script is IDEMPOTENT: run it as many times as you like. It only
rewrites a file when a value actually needs to change, and it makes a
timestamped `.bak` before its first edit to any file.

Usage:
    python3 apply_patch.py [--config-dir PATH] [--dry-run] [--allow-direct-eu]

    --config-dir   Path to the pack's `config/` folder.
                   Default: ./config
    --dry-run      Show what would change without writing.
    --allow-direct-eu
                   Leave Mekanism's direct IC2-EU integration ENABLED
                   (blacklistIC2 = false). Default is to disable it so that
                   ALL cross-mod energy is forced through the explicit FE
                   bridge at the locked 1 EU = 4 FE rate (deterministic).
"""

import argparse
import re
import shutil
import sys
import time
from pathlib import Path

# ---- Canonical values -------------------------------------------------------
# IC2 Classic: RF (Forge Energy) produced per 1 EU.
FLUX_BALANCE = 4
# Mekanism: Joules per 1 EU and Joules per 1 FE.
#   JoulePerEU / JoulePerForgeEnergy must equal FLUX_BALANCE  ->  10 / 2.5 = 4
JOULE_PER_EU = "10"
JOULE_PER_FE = "2.5000"


def _set_toml_key(text, key, value):
    """Set `key = value` (TOML, value already formatted incl. any quotes).

    Matches the existing indentation and only the first occurrence, which in
    Mekanism's general.toml is the one inside [general.energy_conversion].
    Returns (new_text, changed: bool).
    """
    pat = re.compile(r'(?m)^(?P<indent>[ \t]*)' + re.escape(key) + r'\s*=\s*(?P<val>.*?)\s*$')
    m = pat.search(text)
    if not m:
        return text, False
    if m.group('val') == value:
        return text, False
    new_line = f"{m.group('indent')}{key} = {value}"
    return text[:m.start()] + new_line + text[m.end():], True


def _set_cfg_key(text, key, value):
    """Set an IC2 Classic Forge-config line, e.g. `I:fluxBalance=4`.

    `key` includes the type prefix (e.g. 'I:fluxBalance' or 'B:mekanism').
    Returns (new_text, changed: bool).
    """
    pat = re.compile(r'(?m)^(?P<indent>[ \t]*)' + re.escape(key) + r'=(?P<val>.*?)\s*$')
    m = pat.search(text)
    if not m:
        return text, False
    if m.group('val') == value:
        return text, False
    new_line = f"{m.group('indent')}{key}={value}"
    return text[:m.start()] + new_line + text[m.end():], True


def _process(path, edits, setter, dry_run):
    """Apply a list of (key, value) edits to `path` using `setter`."""
    if not path.is_file():
        print(f"  !! not found: {path}  (skipped)")
        return False
    original = path.read_text(encoding="utf-8")
    text = original
    changes = []
    for key, value in edits:
        text, changed = setter(text, key, value)
        if changed:
            changes.append(key)
    if not changes:
        print(f"  == {path.name}: already correct")
        return False
    print(f"  ++ {path.name}: set {', '.join(changes)}")
    if dry_run:
        return True
    backup = path.with_suffix(path.suffix + f".bak-{time.strftime('%Y%m%d-%H%M%S')}")
    shutil.copy2(path, backup)
    path.write_text(text, encoding="utf-8")
    print(f"     backup -> {backup.name}")
    return True


def main():
    ap = argparse.ArgumentParser(description="Patch Mekanism/IC2 Classic EU<->FE conversion rates.")
    ap.add_argument("--config-dir", default="config", type=Path,
                    help="Path to the pack's config/ folder (default: ./config)")
    ap.add_argument("--dry-run", action="store_true", help="Show changes without writing.")
    ap.add_argument("--allow-direct-eu", action="store_true",
                    help="Keep Mekanism's direct IC2-EU integration enabled (blacklistIC2 = false).")
    args = ap.parse_args()

    cfg = args.config_dir
    blacklist_ic2 = "false" if args.allow_direct_eu else "true"

    print("Mekanism <-> IC2 Classic energy-bridge patch")
    print(f"  config dir : {cfg.resolve()}")
    print(f"  rate       : 1 EU = {FLUX_BALANCE} FE = {JOULE_PER_EU} J")
    print(f"  bridge     : Forge Energy (FE){'  + direct IC2-EU' if args.allow_direct_eu else '  (FE only; direct IC2-EU disabled)'}")
    if args.dry_run:
        print("  mode       : DRY RUN (no files written)")
    print()

    mek = _process(
        cfg / "Mekanism" / "general.toml",
        [
            ("JoulePerEU", f'"{JOULE_PER_EU}"'),
            ("JoulePerForgeEnergy", f'"{JOULE_PER_FE}"'),
            ("blacklistIC2", blacklist_ic2),
            ("blacklistForge", "false"),
            ("blacklistFluxNetworks", "false"),
        ],
        _set_toml_key,
        args.dry_run,
    )

    ic2 = _process(
        cfg / "ic2c" / "ic2.cfg",
        [
            ("I:fluxBalance", str(FLUX_BALANCE)),
            ("B:mekanism", "true"),
        ],
        _set_cfg_key,
        args.dry_run,
    )

    print()
    if not (mek or ic2):
        print("Nothing to do — configs already match the bridge standard.")
    elif args.dry_run:
        print("Dry run complete. Re-run without --dry-run to apply.")
    else:
        print("Done. Restart the server/world for the conversion rates to take effect.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
