#!/usr/bin/env python3
"""
extract_remote.py — run this on a machine that has the Vintage Story 1.22.3 files.
It reads assets/survival and prints ONE small JSON blob (a few KB) to stdout with the
exact vanilla values + structural facts needed to build the serverbalancepatches mod.

Usage:
    python3 extract_remote.py --assets /path/to/Vintagestory/assets/survival

assets/survival is the folder that contains blocktypes/, itemtypes/, entities/, recipes/.
  Linux dedicated server: <serverdir>/assets/survival
  Windows install:        C:\\Users\\<you>\\AppData\\Roaming\\Vintagestory\\assets\\survival
                          (or the game install dir's assets/survival)

Then copy the entire printed JSON (between the BEGIN/END markers) and paste it back in chat.
This file READS ONLY — it changes nothing.
"""
import argparse, json, os, re, glob

def relax(s):
    store = []
    def stash(m):
        store.append(m.group(0)); return '\x00%d\x00' % (len(store)-1)
    s = re.sub(r'"(?:[^"\\]|\\.)*"', stash, s)
    s = re.sub(r'/\*.*?\*/', '', s, flags=re.S)
    s = re.sub(r'//[^\n]*', '', s)
    def stash_sq(m):
        store.append('"' + m.group(1).replace('"','\\"') + '"'); return '\x00%d\x00' % (len(store)-1)
    s = re.sub(r"'((?:[^'\\]|\\.)*)'", stash_sq, s)
    s = re.sub(r'([{\[,]\s*)([A-Za-z_]\w*)(\s*):', r'\1"\2"\3:', s)
    s = re.sub(r',(\s*[}\]])', r'\1', s)
    s = re.sub(r'\x00(\d+)\x00', lambda m: store[int(m.group(1))], s)
    return s

def load(fp): return json.loads(relax(open(fp, encoding='utf-8').read()))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--assets', required=True)
    A = ap.parse_args().assets.rstrip('/')
    def P(rel): return os.path.join(A, rel)
    def ex(rel): return os.path.isfile(P(rel))
    out = {"warnings": []}

    # version hint (best-effort)
    for vh in ('config/general.json', '../version.txt'):
        if ex(vh):
            try: out["version_hint"] = open(P(vh)).read()[:200]
            except Exception: pass

    # 1 fuel
    out["fuel"] = {}
    for c in ('firewood','firewood-aged','charcoal'):
        rel=f'itemtypes/resource/{c}.json'
        if ex(rel):
            d=load(P(rel)); cp=d.get('combustibleProps',{})
            if 'burnDuration' in cp: out["fuel"][rel]=cp['burnDuration']
        else: out["warnings"].append("missing "+rel)

    # 2 leaves
    out["leaves"]={}
    for c in ('normal','branchy','narrow','bamboo'):
        rel=f'blocktypes/plant/leaves/{c}.json'
        if not ex(rel): out["warnings"].append("missing "+rel); continue
        d=load(P(rel)); entry=[]
        for di,drop in enumerate(d.get('drops',[])):
            code=drop.get('code','')
            if 'treeseed' in code or 'sapling' in code:
                e={"i":di,"code":code}
                if 'quantityByType' in drop: e["quantityByType"]={k:v.get('avg') for k,v in drop['quantityByType'].items()}
                elif 'quantity' in drop: e["avg"]=drop['quantity'].get('avg')
                entry.append(e)
        out["leaves"][rel]=entry

    # 3 ore
    out["ore"]={}
    for c in ('ore-graded','ore-ungraded'):
        rel=f'blocktypes/stone/{c}.json'
        if not ex(rel): out["warnings"].append("missing "+rel); continue
        d=load(P(rel)); db={}
        for key,arr in d.get('dropsByType',{}).items():
            db[key]=[{"i":i,"code":dr.get('code',''),"avg":dr.get('quantity',{}).get('avg')} for i,dr in enumerate(arr)]
        out["ore"][rel]=db

    # 4 meat  (animals live under entities/animal/ in 1.22; recurse to be layout-proof)
    out["meat"]={}
    for fp in sorted(glob.glob(P('entities/**/*.json'), recursive=True)):
        rel=os.path.relpath(fp,A).replace('\\','/')
        try: d=load(fp)
        except Exception as ee: out["warnings"].append(f"parsefail {rel}: {str(ee)[:40]}"); continue
        behs=(d.get('server') or {}).get('behaviors',[])
        rec=[]
        for bi,b in enumerate(behs):
            if not isinstance(b,dict) or b.get('code')!='harvestable': continue
            for di,drop in enumerate(b.get('drops',[])):
                code=drop.get('code','')
                if not any(k in code for k in ('redmeat-raw','bushmeat-raw','poultry-raw')): continue
                e={"bi":bi,"di":di,"code":code}
                if 'quantity' in drop: e["avg"]=drop['quantity'].get('avg')
                elif 'quantityByType' in drop: e["quantityByType"]={k:v.get('avg') for k,v in drop['quantityByType'].items()}
                rec.append(e)
        if rec: out["meat"][rel]=rec

    # 5 crops
    out["crops"]={}
    for fp in sorted(glob.glob(P('blocktypes/plant/crop/*.json'))):
        rel=os.path.relpath(fp,A)
        if os.path.basename(fp)=='dead.json': continue
        try: d=load(fp)
        except Exception as ee: out["warnings"].append(f"parsefail {rel}: {str(ee)[:40]}"); continue
        db=d.get('dropsByType')
        if not db: continue
        staged=[(int(k.split('-')[-1]),k) for k in db if re.fullmatch(r'\*-\d+',k)]
        if not staged: continue
        _,ripe=max(staged)
        drops=[{"i":i,"code":dr.get('code',''),"type":dr.get('type'),"avg":dr.get('quantity',{}).get('avg')} for i,dr in enumerate(db[ripe])]
        out["crops"][rel]={"ripe":ripe,"drops":drops}

    # 6 armor
    rel='itemtypes/wearable/armor.json'
    if not ex(rel) and ex('itemtypes/wearable/seraph/armor.json'): rel='itemtypes/wearable/seraph/armor.json'
    if ex(rel):
        d=load(P(rel)); out["armor"]={"path":rel,"durabilityByType":d.get('durabilityByType',{})}
    else: out["warnings"].append("armor.json not found in itemtypes/wearable")

    # 7 forge — list the whole smithing folder and auto-find knife & spear by output code
    out["forge"]={}
    smdir=P('recipes/smithing')
    out["smithing_dir"]=sorted(os.path.basename(p) for p in glob.glob(os.path.join(smdir,'*.json'))) if os.path.isdir(smdir) else []
    for fp in glob.glob(os.path.join(smdir,'*.json')):
        rel=os.path.relpath(fp,A).replace('\\','/')
        try: d=load(fp)
        except Exception as ee: out["warnings"].append(f"parsefail {rel}: {str(ee)[:40]}"); continue
        recipes=d if isinstance(d,list) else [d]
        for ri,r in enumerate(recipes):
            if not isinstance(r,dict): continue
            o=r.get('output',{}) or {}
            code=str(o.get('code',''))
            if any(k in code for k in ('knifeblade','spearhead')) or (isinstance(d,dict) and os.path.basename(fp) in ('knife.json','spear.json','spearhead.json')):
                out["forge"].setdefault(rel,[]).append({
                    "isArray": isinstance(d,list), "index": ri if isinstance(d,list) else None,
                    "hasStacksize": 'stacksize' in {k.lower() for k in o}, "outputCode": code})
    if not out["forge"]: out["warnings"].append("no knife/spear smithing recipe found under recipes/smithing")
    # also check whether entities/land exists (meat source) + diagnostics to locate animals
    out["entities_land_exists"]=os.path.isdir(P('entities/land'))
    out["survival_dirs"]=sorted(os.path.basename(p) for p in glob.glob(P('*')) if os.path.isdir(p))
    edir=P('entities')
    out["entities_dirs"]=sorted(os.path.basename(p) for p in glob.glob(os.path.join(edir,'*')) if os.path.isdir(p)) if os.path.isdir(edir) else []
    # count any entity json that has a meat harvestable drop, anywhere under entities/
    out["entity_meat_files_found"]=0
    for fp in glob.glob(P('entities/**/*.json'), recursive=True):
        try: d=load(fp)
        except Exception: continue
        behs=(d.get('server') or {}).get('behaviors',[])
        if any(isinstance(b,dict) and b.get('code')=='harvestable' for b in behs):
            out["entity_meat_files_found"]+=1

    print("=====BEGIN serverbalancepatches EXTRACT=====")
    print(json.dumps(out, separators=(',',':')))
    print("=====END serverbalancepatches EXTRACT=====")

if __name__=='__main__': main()
