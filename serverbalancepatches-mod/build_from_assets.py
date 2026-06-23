#!/usr/bin/env python3
"""
build_from_assets.py — generate the serverbalancepatches mod from a REAL Vintage Story
assets/survival tree, so every patch literal reflects the ACTUAL values of that game version.

Why this exists: VS core JSON patches cannot multiply (no arithmetic op), so each "2x"/"x1.5"
must be written as a pre-computed literal. That requires reading the vanilla baseline for the
exact game version. The vanilla assets ship inside the game install (assets/survival), not on
GitHub. Point this script at a 1.22.3 install and it regenerates the mod with true 1.22.3 values.

Usage:
    python3 build_from_assets.py --assets /path/to/Vintagestory/assets/survival --out ./out
    # then zip:  cd out/serverbalancepatches && zip -r -X ../serverbalancepatches_v1.0.0.zip modinfo.json assets

Where to find assets/survival:
    Linux server:   <serverdir>/assets/survival
    Windows client: %appdata%/Vintagestory/assets/survival  (or the install dir)
    Or extract the official server tarball: vs_server_linux-x64_<ver>.tar.gz -> assets/survival

Tunables (edit these):
"""
import argparse, json, os, re, glob

SAPLING_MULT = 2.0      # tree-seed / sapling drop from leaves
ORE_MULT     = 1.2      # ore-block drops (keep < 1.25)
FUEL_MULT    = 2.0      # firewood / charcoal burn duration
MEAT_MULT    = 1.5      # harvestable meat
CROP_MULT    = 1.5      # crop harvest yield
ARMOR_MULT   = 2.0      # armor durability
FORGE_OUT    = 2        # knife blade / spear head forging output (exact)
GAME_VERSION = "1.22.3"

# ----- relaxed (HJSON-ish) -> strict JSON ----------------------------------
def relax(s):
    # 1. mask double-quoted strings so later transforms can't corrupt their contents
    store = []
    def stash(m):
        store.append(m.group(0))
        return '\x00%d\x00' % (len(store) - 1)
    s = re.sub(r'"(?:[^"\\]|\\.)*"', stash, s)
    # 2. strip comments (now safe — no real strings remain)
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'//[^\n]*', '', s)
    # 3. single-quoted strings -> mask as double-quoted
    def stash_sq(m):
        store.append('"' + m.group(1).replace('"', '\\"') + '"')
        return '\x00%d\x00' % (len(store) - 1)
    s = re.sub(r"'((?:[^'\\]|\\.)*)'", stash_sq, s)
    # 4. quote bare identifier keys, drop trailing commas
    s = re.sub(r'([{\[,]\s*)([A-Za-z_]\w*)(\s*):', r'\1"\2"\3:', s)
    s = re.sub(r',(\s*[}\]])', r'\1', s)
    # 5. restore
    s = re.sub(r'\x00(\d+)\x00', lambda m: store[int(m.group(1))], s)
    return s

def load(fp):
    return json.loads(relax(open(fp, encoding='utf-8').read()))

def num(x):
    # keep ints int, round floats to 4 dp
    if isinstance(x, int): return x
    r = round(float(x), 4)
    return int(r) if r == int(r) else r

def cap1(x):
    return min(x, 1.0)

# JSON pointer escaping (~ and /); our keys contain neither, but be safe.
def esc(tok):
    return str(tok).replace('~', '~0').replace('/', '~1')

# ---------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--assets', required=True, help='path to assets/survival')
    ap.add_argument('--out', default='./out')
    a = ap.parse_args()
    A = a.assets.rstrip('/')
    root = os.path.join(a.out, 'serverbalancepatches')
    pdir = os.path.join(root, 'assets', 'serverbalancepatches', 'patches')
    os.makedirs(pdir, exist_ok=True)

    def fexists(rel): return os.path.isfile(os.path.join(A, rel))
    def write(name, ops):
        json.dump(ops, open(os.path.join(pdir, name), 'w'), indent=2)
        open(os.path.join(pdir, name), 'a').write('\n')
        print(f"  {name}: {len(ops)} ops")

    print("Generating patches from", A)

    # ---- 1. fuel ----------------------------------------------------------
    ops = []
    for code in ('firewood', 'firewood-aged', 'charcoal'):
        rel = f'itemtypes/resource/{code}.json'
        if not fexists(rel): continue
        d = load(os.path.join(A, rel))
        cp = d.get('combustibleProps')
        if isinstance(cp, dict) and 'burnDuration' in cp:
            ops.append({"op": "replace", "file": f"game:{rel}",
                        "path": "/combustibleProps/burnDuration",
                        "value": num(cp['burnDuration'] * FUEL_MULT)})
    write('fuel.json', ops)

    # ---- 2. tree seeds (leaves) ------------------------------------------
    ops = []
    for code in ('normal', 'branchy', 'narrow', 'bamboo'):
        rel = f'blocktypes/plant/leaves/{code}.json'
        if not fexists(rel): continue
        d = load(os.path.join(A, rel))
        for di, drop in enumerate(d.get('drops', [])):
            c = drop.get('code', '')
            if 'treeseed' not in c and 'sapling' not in c: continue
            if 'quantityByType' in drop:
                newobj = {k: {**v, 'avg': num(cap1(v['avg'] * SAPLING_MULT))}
                          for k, v in drop['quantityByType'].items()}
                ops.append({"op": "replace", "file": f"game:{rel}",
                            "path": f"/drops/{di}/quantityByType", "value": newobj})
            elif 'quantity' in drop:
                ops.append({"op": "replace", "file": f"game:{rel}",
                            "path": f"/drops/{di}/quantity/avg",
                            "value": num(cap1(drop['quantity']['avg'] * SAPLING_MULT))})
    write('treeseeds.json', ops)

    # ---- 3. ore drops -----------------------------------------------------
    ops = []
    for code in ('ore-graded', 'ore-ungraded'):
        rel = f'blocktypes/stone/{code}.json'
        if not fexists(rel): continue
        d = load(os.path.join(A, rel))
        for key, arr in d.get('dropsByType', {}).items():
            for i, drop in enumerate(arr):
                c = drop.get('code', '')
                if 'ore' not in c: continue          # skip clearquartz/flint side drops
                q = drop.get('quantity', {})
                if 'avg' in q:
                    ops.append({"op": "replace", "file": f"game:{rel}",
                                "path": f"/dropsByType/{esc(key)}/{i}/quantity/avg",
                                "value": num(q['avg'] * ORE_MULT)})
    write('oredrops.json', ops)

    # ---- 4. meat (harvestable on land entities) ---------------------------
    ops = []
    for fp in sorted(glob.glob(os.path.join(A, 'entities/**/*.json'), recursive=True)):
        rel = os.path.relpath(fp, A).replace('\\', '/')
        try: d = load(fp)
        except Exception: continue
        behs = (d.get('server') or {}).get('behaviors', [])
        for bi, b in enumerate(behs):
            if not isinstance(b, dict) or b.get('code') != 'harvestable': continue
            for di, drop in enumerate(b.get('drops', [])):
                c = drop.get('code', '')
                if not any(k in c for k in ('redmeat-raw', 'bushmeat-raw', 'poultry-raw')):
                    continue
                base = f"/server/behaviors/{bi}/drops/{di}"
                if 'quantity' in drop and 'avg' in drop['quantity']:
                    ops.append({"op": "replace", "file": f"game:{rel}",
                                "path": f"{base}/quantity/avg",
                                "value": num(drop['quantity']['avg'] * MEAT_MULT)})
                elif 'quantityByType' in drop:
                    for k, v in drop['quantityByType'].items():
                        ops.append({"op": "replace", "file": f"game:{rel}",
                                    "path": f"{base}/quantityByType/{esc(k)}/avg",
                                    "value": num(v['avg'] * MEAT_MULT)})
    write('meat.json', ops)

    # ---- 5. crops (DISABLED) ---------------------------------------------
    # Crop yield changes were intentionally removed from this mod. Logic kept
    # for reference; flip ENABLE_CROPS to re-enable.
    ENABLE_CROPS = False
    if ENABLE_CROPS:
        ops = []
        for fp in sorted(glob.glob(os.path.join(A, 'blocktypes/plant/crop/*.json'))):
            rel = os.path.relpath(fp, A).replace('\\', '/')
            if os.path.basename(fp) == 'dead.json': continue
            try: d = load(fp)
            except Exception: continue
            db = d.get('dropsByType')
            if not db: continue
            staged = [(int(k.split('-')[-1]), k) for k in db if re.fullmatch(r'\*-\d+', k)]
            if not staged: continue
            _, ripe = max(staged)
            for i, drop in enumerate(db[ripe]):
                c = drop.get('code', '')
                if 'seeds' in c: continue
                q = drop.get('quantity', {})
                if 'avg' in q:
                    ops.append({"op": "replace", "file": f"game:{rel}",
                                "path": f"/dropsByType/{esc(ripe)}/{i}/quantity/avg",
                                "value": num(q['avg'] * CROP_MULT)})
        write('crops.json', ops)

    # ---- 6. armor durability ---------------------------------------------
    ops = []
    rel = 'itemtypes/wearable/armor.json'
    if not fexists(rel) and fexists('itemtypes/wearable/seraph/armor.json'):
        rel = 'itemtypes/wearable/seraph/armor.json'
    if fexists(rel):
        d = load(os.path.join(A, rel))
        for key, val in d.get('durabilityByType', {}).items():
            ops.append({"op": "replace", "file": f"game:{rel}",
                        "path": f"/durabilityByType/{esc(key)}",
                        "value": int(round(val * ARMOR_MULT))})
    write('armor.json', ops)

    # ---- 7. forge yields (knife blade / spear head) -----------------------
    ops = []
    for code in ('knife', 'spear'):
        rel = f'recipes/smithing/{code}.json'
        if not fexists(rel): continue
        d = load(os.path.join(A, rel))
        out = d.get('output', {})
        op = 'replace' if 'stacksize' in {k.lower() for k in out} else 'add'
        ops.append({"op": op, "file": f"game:{rel}",
                    "path": "/output/stacksize", "value": FORGE_OUT})
    write('forgeyields.json', ops)

    # ---- modinfo ----------------------------------------------------------
    json.dump({
        "type": "content", "modid": "serverbalancepatches",
        "name": "Server Balance Patches",
        "description": "Drop, yield, fuel, durability and recipe tweaks for our server.",
        "authors": ["esnavarr"], "version": "1.0.0", "side": "Universal",
        "dependencies": {"game": GAME_VERSION}
    }, open(os.path.join(root, 'modinfo.json'), 'w'), indent=2)
    print("Done ->", root)

if __name__ == '__main__':
    main()
