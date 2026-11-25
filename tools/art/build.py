"""python tools/art/build.py -> public/assets/art/*. Originals in /assets are only read."""
import os, json, glob, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from px import *
import bg, tiles, chars, things, ui
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); OUT = os.path.join(ROOT, 'public/assets/art'); os.makedirs(OUT, exist_ok=True)
LIB = os.path.join(ROOT, 'assets'); FL = os.path.join(os.environ.get('LEO_PACKS', os.path.join(ROOT, 'packs')), 'fantasy-lands/Fantasy Lands Basic Package/Sprites')
# borrowed sprites: name, path, frame w, h, (first,count)
BORROW = [('b_chandelier', 'castle/keep/chandelier.png', 32, 16, 0, 1), ('b_lectern', 'castle/keep/lectern.png', 16, 24, 0, 1), ('b_statue', 'castle/keep/statue.png', 16, 32, 0, 2), ('b_torch', 'castle/torch.png', 16, 16, 0, 3),
          ('b_glass', 'castle/keep/glass.png', 16, 32, 1, 1), ('b_portrait', 'castle/keep/portraits.png', 16, 24, 0, 8), ('b_founder', 'village/founders.png', 32, 32, 0, 8), ('b_clock', 'props/clock.png', 16, 32, 0, 1),
          ('b_orrery', 'tower/spire/orrery.png', 64, 64, 0, 2), ('b_armillary', 'tower/spire/armillary.png', 32, 32, 0, 1), ('b_console', 'tower/spire/console.png', 16, 16, 0, 2), ('b_pendulum', 'tower/spire/pendulum.png', 16, 64, 0, 1),
          ('b_clockface', 'tower/spire/clockface.png', 48, 48, 0, 1), ('b_engine', 'tower/spire/engine.png', 64, 48, 0, 3), ('b_desk', 'palace/desk.png', 16, 16, 0, 1), ('b_banner', 'palace/banner.png', 32, 32, 0, 1),
          ('b_tall', 'palace/halls/tall.png', 16, 32, 0, 10), ('b_gcrystal', 'cavern/goldcrystal.png', 16, 16, 0, 2), ('b_crystal', 'palace/crystal.png', 16, 16, 0, 2), ('b_moth', 'forest/hollow/moths.png', 8, 8, 0, 6)]
FLB = [('fl_bush', 'Greenery/Bushes.png', 32, 16, [(0, 0), (0, 2)]), ('fl_berry', 'Greenery/Bushes With Berries.png', 32, 16, [(0, 0)]), ('fl_shroom', 'Greenery/Brown Mushrooms.png', 16, 16, [(0, 0), (1, 0), (2, 0)]), ('fl_rock', 'Props/Rocks.png', 16, 16, [(0, 0), (1, 0), (2, 0)])]


def main():
    print('characters'); C = chars.build(); print('things'); T = things.build(); S = {**C, **T, **ui.icons(T, C), **ui.hud(T, C), **ui.trees()}
    for n, p, w, h, a, k in BORROW:
        f = os.path.join(LIB, p)
        if not os.path.exists(f): print('missing', f); continue
        im = Image.open(f).convert('RGBA'); S[n] = [im.crop((i * w, 0, i * w + w, h)) for i in range(a, a + k) if (i + 1) * w <= im.width]
    for n, p, w, h, cells in FLB:
        f = os.path.join(FL, p)
        if os.path.exists(f):
            im = Image.open(f).convert('RGBA'); S[n] = [im.crop((x * w, y * h, x * w + w, y * h + h)) for x, y in cells if im.crop((x * w, y * h, x * w + w, y * h + h)).getbbox()]
    # editable character sheet (swap art without touching code): row order is listed in leo_sheet.json
    leo = {k[4:]: v for k, v in C.items() if k.startswith('leo_')}; cols = max(len(v) for v in leo.values()); sh = new(32 * cols, 36 * len(leo))
    for j, (k, v) in enumerate(leo.items()):
        for i, f in enumerate(v): paste(sh, f, i * 32, j * 36)
    os.makedirs(os.path.join(ROOT, 'public/assets/characters'), exist_ok=True); sh.save(os.path.join(ROOT, 'public/assets/characters/leo.png'))
    json.dump({'frameWidth': 32, 'frameHeight': 36, 'columns': cols, 'rows': {k: [j, len(v)] for j, (k, v) in enumerate(leo.items())}}, open(os.path.join(ROOT, 'public/assets/characters/leo.json'), 'w'), indent=1)
    for k in list(S):
        if k.startswith('leo_'): del S[k]
    items = [(n, i, f) for n, fr in S.items() for i, f in enumerate(fr)]; items.sort(key=lambda t: (-t[2].height, t[0], t[1]))
    W = 1024; x = y = rh = 1; pos = []; rh = 0
    for n, i, f in items:
        if x + f.width + 2 > W: x = 1; y += rh + 2; rh = 0
        pos.append((n, i, f, x, y)); x += f.width + 2; rh = max(rh, f.height)
    at = new(W, y + rh + 2); fr = {}
    for n, i, f, x, y in pos:
        paste(at, f, x, y); fr[f'{n}/{i}'] = dict(frame=dict(x=x, y=y, w=f.width, h=f.height), rotated=False, trimmed=False, spriteSourceSize=dict(x=0, y=0, w=f.width, h=f.height), sourceSize=dict(w=f.width, h=f.height))
    at.save(f'{OUT}/atlas.png', optimize=True); json.dump({'frames': fr, 'meta': {'image': 'atlas.png', 'size': {'w': at.width, 'h': at.height}, 'scale': '1', 'counts': {n: len(v) for n, v in S.items()}}}, open(f'{OUT}/atlas.json', 'w'))
    print('atlas', at.size, len(fr), 'frames')
    for t in tiles.TH: tiles.sheet(t).save(f'{OUT}/tiles_{t}.png', optimize=True)
    print('backgrounds')
    for n, f in bg.ALL.items():
        for k, im in f().items(): im.save(f'{OUT}/bg_{n}_{k}.png', optimize=True)
    ui.title_mountain().save(f'{OUT}/title_mountain.png', optimize=True); ui.title_town().save(f'{OUT}/title_town.png', optimize=True); ui.worldmap().save(f'{OUT}/worldmap.png', optimize=True); ui.fieldscape().save(f'{OUT}/fieldscape.png', optimize=True); ui.notebook().save(f'{OUT}/notebook.png', optimize=True)
    bg.clouds(['#a9c8e8', '#d4e6f6', '#f6fbff', '#ffffff'], 9, 5, 0, 70, 2).save(f'{OUT}/clouds_big.png', optimize=True)


main()
