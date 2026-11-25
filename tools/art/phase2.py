"""python tools/art/phase2.py : appends Phase 2 art to the existing atlas (Phase 1 pixels are never moved or redrawn)."""
import os, json, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from px import *
import bg, tiles, ui
from things import sheet_paper, pad, PAPER, PAPER2, INKL, RED
from bg import W, H
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); OUT = os.path.join(ROOT, 'public/assets/art')
WOOD = ['#3d2216', '#6b3f24', '#96602f', '#c58d4c']


# ------------------------------------------------------------------ tiles
def paperfill(x, y):
    x %= 32; y %= 32
    if y % 8 == 4 and 3 < (x + y * 3) % 32 < 27 and (x * 7 + y) % 9 > 1: return '#b8a88e'
    if (x, y) == (1, 4) or (y in (12, 13) and x == 1): return RED
    return '#f1e6cb' if (x // 16 + y // 16) % 2 else '#eadebf'


def make_tiles():
    tiles.TH['field'] = dict(fill=tiles.rocky(['#5c3a2c', '#8a5638', '#a06a42', '#c08a56'], 17), top='grass', g=['#3f7a34', '#6aa83c', '#a8d04c', '#e4f08a'], edge='#3f2620', plank=['#4a3018', '#7f5a2c', '#b0853f', '#e0bc70'])
    tiles.TH['manuscript'] = dict(fill=paperfill, top='trim', g=['#9c2f3c', '#d0505a', '#f4ead0', '#fffdf4'], edge='#5c4468', plank=['#8a7a64', '#d8ccaf', '#f6eed8', '#fffdf4'])
    for t in ('field', 'manuscript'):
        s = tiles.sheet(t)
        if t == 'field':  # brambles instead of red pens, wild flowers, campus style bridge
            for k in (0, 1): s.paste(new(16, 16), (96 + k * 16, 64)); paste(s, tiles.hazard('campus', k), 96 + k * 16, 64)
            cols = ['#ffe24a', '#ff8fa8', '#ffffff', '#c09aff']
            for k in range(4):
                s.paste(new(16, 16), (160 + k * 16, 64)); d = new(16, 16); r = random.Random(k + 40)
                for i in range(6):
                    x = 1 + i * 3 - i // 3; h = 4 + r.randrange(6); line(d, x, 15, x + r.choice((-1, 0, 1)), 15 - h, ['#3f7a34', '#6aa83c', '#a8d04c'][i % 3])
                    if i % 2 == k % 2: rect(d, x - 1, 14 - h, 3, 2, cols[(k + i) % 4]); rect(d, x, 14 - h, 1, 1, '#fff6c0')
                paste(s, d, 160 + k * 16, 64)
        s.save(f'{OUT}/tiles_{t}.png', optimize=True)


# ------------------------------------------------------------------ scenery helpers
def terraces(seed, specs, ramps, w=W, h=H):
    """Rice-terraced hills, tileable in x."""
    im = new(w, h); p = im.load()
    for k, (cx, top, wd) in enumerate(specs):
        ramp = ramps[k % len(ramps)]
        for x in range(w):
            dx = min(abs(x - cx), w - abs(x - cx)); y0 = top + (dx / wd) ** 2 * 80 + math.sin(x * 2 * math.pi / w * 6 + k) * 4 + math.sin(x * 2 * math.pi / w * 17 + k * 2) * 1.5
            for y in range(max(0, int(y0)), h):
                q = y - y0 + math.sin(x * 2 * math.pi / w * 9 + k * 2) * 4; band = int(q // 10); ed = q % 10
                c = ramp[4] if ed < 1.2 and band > 0 else ramp[3] if ed < 3 else ramp[2] if ed < 7.5 and (band + k) % 3 else ramp[1]
                if (band + k) % 3 == 0 and 1.2 <= ed < 7 and bayer(x, y) < .4: c = '#b8e4ee'
                if ed > 8.6: c = ramp[0]
                p[x, y] = hexc(c)
    return im


def stilt(w, h, roof, seed=0):
    """House on stilts: thatch roof, bamboo wall, veranda."""
    im = new(w, h); rh = int(h * .42); fl = int(h * .72); r = random.Random(seed)
    for x in (8, w // 2 - 2, w - 12): rect(im, x, fl, 4, h - fl, WOOD[1]); rect(im, x, fl, 1, h - fl, WOOD[2])
    for i in range(7, 0, -1): rect(im, w // 2 + 8 + i * 2, fl + 2 + (7 - i) * 0 + i * 0, 1, 1, WOOD[0])
    rect(im, 9, rh - 2, w - 18, fl - rh + 2, '#a87a44')
    for x in range(9, w - 9, 4): rect(im, x, rh - 2, 1, fl - rh + 2, '#7f5a2c'); rect(im, x + 1, rh - 2, 1, fl - rh + 2, '#c89c5c')
    dx = w // 2 - 7; rect(im, dx, rh + 1, 14, fl - rh - 1, '#4a2c1c'); rect(im, dx + 2, rh + 3, 10, fl - rh - 3, '#6b3f24'); rect(im, dx + 9, rh + 9, 1, 2, '#f0c860')
    for x in (15, w - 27): rect(im, x, rh + 3, 11, 9, '#4a2c1c'); rect(im, x + 1, rh + 4, 9, 7, '#ffd978'); rect(im, x + 5, rh + 4, 1, 7, '#4a2c1c'); rect(im, x - 1, rh + 12, 13, 2, '#3f7a34'); [rect(im, x + q, rh + 11, 2, 2, c) for q, c in ((1, '#ff8fa8'), (5, '#ffe24a'), (9, '#ff8fa8'))]
    rect(im, 3, fl - 1, w - 6, 5, WOOD[2]); rect(im, 3, fl - 1, w - 6, 1, WOOD[3]); rect(im, 3, fl + 3, w - 6, 1, WOOD[0])
    for x in range(4, w - 6, 8):
        if not dx - 4 < x < dx + 14: rect(im, x, fl - 8, 2, 8, WOOD[1])
    rect(im, 3, fl - 9, dx - 6, 2, WOOD[2]); rect(im, dx + 18, fl - 9, w - dx - 22, 2, WOOD[2])
    poly(im, [(1, rh + 1), (w // 2 - 12, 3), (w // 2 + 12, 3), (w - 2, rh + 1)], roof[1])
    for y in range(4, rh + 1, 4):
        k = (y - 3) / max(1, rh - 3); a = int(w // 2 - 12 - (w // 2 - 13) * k); b = int(w // 2 + 12 + (w // 2 - 14) * k)
        rect(im, a, y, b - a, 1, roof[0]); rect(im, a, y - 1, b - a, 1, roof[2]); [rect(im, x, y + 1, 1, 2, roof[2 if r.random() < .5 else 0]) for x in range(a + 2, b - 2, 5)]
    rect(im, w // 2 - 13, 2, 26, 3, roof[3]); rect(im, 1, rh, w - 3, 2, roof[0])
    poly(im, [(dx + 2, fl + 3), (dx + 12, fl + 3), (dx + 16, h), (dx + 6, h)], WOOD[1]); [rect(im, dx + 3 + (y - fl) // 4, y, 11, 2, WOOD[3]) for y in range(fl + 4, h, 5)]
    return outline(im)


def book(w, h, c, vertical=True):
    im = new(w, h); rect(im, 0, 0, w, h, c); rect(im, 0, 0, w, 1, shade(c, .4)); rect(im, 0, 0, 1, h, shade(c, .3)); rect(im, w - 1, 0, 1, h, shade(c, -.4)); rect(im, 0, h - 1, w, 1, shade(c, -.5))
    if vertical:
        rect(im, 2, h // 6, w - 4, 2, '#f0c44c'); rect(im, 2, h - h // 5, w - 4, 2, '#f0c44c'); rect(im, w // 2 - 1, h // 3, 2, h // 4, '#f8e8c0')
    else:
        rect(im, w - 5, 2, 4, h - 4, '#f4ead0'); rect(im, 4, 1, 3, h - 2, '#f0c44c'); rect(im, 12, h // 2, w // 3, 1, '#f8e8c0')
    return outline(pad(im, w + 2, h + 2, 1, 1))


def paragraph(w, n, seed=0, red=True, c=None):
    r = random.Random(seed); im = new(w, n * 6 + 8); rect(im, 0, 0, w, n * 6 + 8, c or '#fffaf0')
    for i in range(n):
        x = 5 if i else 12
        end = w - 5 if i < n - 1 else w - w // 3
        while x < end:
            q = min(r.randrange(4, 12), end - x); rect(im, x, 5 + i * 6, q, 2, '#8a7f9a'); x += q + 3
    if red:
        y = 5 + r.randrange(n) * 6; rect(im, 4, y, w - 12, 1, RED); rect(im, 4, y + 1, w - 14, 1, '#f08080'); rect(im, 2, 3, 2, n * 6, RED)
    return im


# ------------------------------------------------------------------ backgrounds
def bg_field():
    far = bg.mountains(47, 168, 58, ['#6a8fc4', '#86a8d4', '#a4c2e4', '#c8dff2'], bg.SNOW, 128, haze='#d8ecec')
    R = [['#3f7a5a', '#579464', '#7cb472', '#a6d084', '#dcf0a4'], ['#34704c', '#4c8c54', '#74b060', '#a0cc70', '#e0f09a']]
    mid = terraces(3, [(90, 178, 120), (350, 160, 150), (230, 214, 110), (470, 216, 90)], R)
    haze = mid.load()
    for y in range(H):
        for x in range(W):
            if haze[x, y][3]: haze[x, y] = lerp(haze[x, y], '#bfe0dc', .34)
    for x, y, s in ((120, 214, 1), (330, 190, 2), (372, 200, 3), (250, 232, 4)): hs = stilt(52, 46, ['#6a4a34', '#98704a', '#bc9460', '#dcb880'], s); wrapim(mid, hs.resize((40, 35), 0), x, y)
    near = bg.bush_row(14, 284, ['#1f5a3c', '#2f743f', '#4f9a44', '#86c454', '#c0e070'], 24, 8, 18)
    for i, (x, w) in enumerate(((20, 44), (150, 54), (292, 48), (410, 58))): bg.wrap(near, bg.tree(w, int(w * 1.5), ['#1f5a3c', '#2f743f', '#4f9a44', '#86c454', '#c0e070'], 120 + i), x, 296 - int(w * 1.5))
    for x in (96, 236, 372, 486):  # bamboo
        for i in range(5):
            bx = x + i * 5; h = 70 + (i * 23) % 34
            for y in range(300 - h, 300, 9): rect(near, bx % W, y, 2, 8, '#6aa83c'); rect(near, bx % W, y + 8, 3, 1, '#c0e070')
            for q in range(4): line(near, bx % W, 302 - h + q * 11, (bx + (7 if q % 2 else -7)) % W if 8 < bx % W < W - 8 else bx % W, 298 - h + q * 11, '#86c454', 2)
    return dict(sky=bg.sky(['#2f80d4', '#54a4ea', '#8ccbf4', '#c8ecf6', '#fff4d0'], (350, 70, 18, '#fff6c0', '#fff3c0')), far=far, clouds=bg.clouds(['#b4d4ec', '#dcecf8', '#f8fcff', '#ffffff'], 7, 6), mid=mid, near=near)


def wrapim(im, s, x, y): bg.wrap(im, s, x, y)


def bg_manuscript():
    r = random.Random(21); sk = bg.sky(['#34265e', '#5c3f86', '#9a5f9c', '#e09aa4', '#ffd8b0', '#fff2d6'], (110, 90, 26, '#fff8e0', '#ffe8c8'), 40)
    far = new(W, H)
    for i in range(13):  # skyline of colossal books
        w = r.choice((28, 34, 42)); h = r.randrange(90, 190); c = r.choice(['#5f4a8c', '#7a568f', '#8c5f8a', '#6a6299']); bg.wrap(far, tint(book(w, h, c), '#b078a4', .25), int(i * W / 13), 300 - h)
    for i in range(9):
        s = paragraph(30 + r.randrange(20), 4, i); s = s.rotate(r.choice((-12, 9, 16, -6)), expand=True, resample=0); bg.wrap(far, tint(s, '#9a6aa8', .45), int(i * W / 9) + r.randrange(20), 20 + r.randrange(110))
    mid = new(W, H)
    for i, x in enumerate((14, 150, 262, 398)):  # leaning towers of paper and books
        y = 300
        for j in range(10 + (i * 5) % 7):
            w = 50 - j + r.randrange(14); h = r.choice((8, 10, 12)); c = r.choice(['#a83a4a', '#3a6ea8', '#d8a83c', '#4a8f6a', '#8f5aa8', '#f1e6cb']); y -= h + 1; b = book(w, h, c, False) if c != '#f1e6cb' else outline(pad(sheet_paper(w, h, True), w + 2, h + 2, 1, 1)); bg.wrap(mid, tint(b, '#c88aa4', .28), x + 30 - w // 2 + r.randrange(-5, 6), y)
    for i, (x, y) in enumerate(((90, 70), (222, 120), (330, 56), (470, 104))): s = outline(pad(paragraph(54, 5, 30 + i), 58, 42, 2, 2)); bg.wrap(mid, tint(s.rotate((-7, 6, 4, -9)[i], expand=True, resample=0), '#d0a0b8', .2), x, y)
    near = new(W, H)
    for i in range(15):
        x = int(i * W / 15); h = 16 + r.randrange(24); s = new(50, h + 6); poly(s, [(2, h + 5), (6 + r.randrange(8), 4), (36 + r.randrange(10), 1 + r.randrange(6)), (48, h + 5)], '#f4ead4'); [rect(s, 9, y, 26 - (y * 7) % 9, 1, '#a89aac') for y in range(9, h, 5)]; rect(s, 8, 9, 22, 1, RED) if i % 3 == 0 else None
        bg.wrap(near, tint(outline(s), '#e0b0b8', .18), x, 300 - h)
    return dict(sky=sk, far=far, mid=mid, near=near)


# ------------------------------------------------------------------ sprites
def sprites():
    S = {}
    S['stilt'] = [stilt(100, 92, ['#6a4224', '#9c6c34', '#c89a4c', '#f0cc7c'], 1), stilt(84, 80, ['#5a3a3c', '#8f5a4c', '#b88060', '#e0ac84'], 5)]
    # research finding: field notebook with a magnifier
    S['finding'] = []
    for k in range(4):
        im = new(26, 26); b = [0, -1, -1, 0][k]; rect(im, 5, 4 + b, 14, 17, '#2f7a5c'); rect(im, 5, 4 + b, 3, 17, '#1f5a44'); rect(im, 9, 6 + b, 9, 13, '#fffaf0'); [rect(im, 10, y + b, 6, 1, '#8a7f9a') for y in (8, 10, 12, 14)]; d = ImageDraw.Draw(im); d.ellipse([13, 11 + b, 21, 19 + b], fill=hexc('#c8f0ff'), outline=hexc('#e0a83c')); line(im, 20, 18 + b, 23, 22 + b, '#8a5430', 2); rect(im, 15 + k % 2, 13 + b, 2, 2, '#fff'); S['finding'].append(outline(im))
    # water buffalo, unimpressed
    S['buffalo'] = []
    for k in range(4):
        im = new(72, 46); C = ['#2c2a38', '#4a4656', '#6a6474', '#96909c']; b = [0, 1, 0, 1][k]
        for i, x in enumerate((12, 20, 42, 50)): dx = [3, 0, -3, 0][(k + i * 2 + i // 2) % 4]; line(im, x, 30, x + dx, 43, C[0], 5); rect(im, x + dx - 2, 41, 6, 4, '#1c1824')
        ball(im, 30, 22 + b, 25, 14, C); rect(im, 8, 10 + b, 44, 3, C[2]); ball(im, 58, 20 + b, 10, 9, C); ball(im, 63, 24 + b, 7, 6, ['#5a4a54', '#8a727a', '#b89aa0'])
        d = ImageDraw.Draw(im); d.arc([44, 2 + b, 62, 20 + b], 190, 330, fill=hexc('#e8dcc0'), width=3); d.arc([52, 2 + b, 70, 20 + b], 200, 350, fill=hexc('#c8b894'), width=3)
        rect(im, 58, 16 + b, 4, 3 if k % 4 else 1, '#fff'); rect(im, 60, 17 + b, 2, 2 if k % 4 else 0, INK); rect(im, 66, 23 + b, 2, 2, INK); line(im, 60, 28 + b, 68, 28 + b, INK); line(im, 5, 18 + b, 2 + k % 2 * 2, 32, C[1], 2); rect(im, 16, 9 + b, 26, 5, '#c8484f'); [rect(im, x, 9 + b, 3, 5, '#f0c44c') for x in (18, 26, 34)]; S['buffalo'].append(outline(im))
    S['goat'] = []
    for k in range(4):
        im = new(36, 32); b = [0, 0, 1, 1][k]; [rect(im, x, 21, 3, 10, '#b8b0a8') for x in (8, 13, 21, 25)]; [rect(im, x, 28, 3, 3, '#3a3040') for x in (8, 13, 21, 25)]; ball(im, 17, 17, 11, 7, ['#a8a09c', '#d8d2cc', '#fffaf4']); ball(im, 28, 10 + b, 6, 5, ['#b8b0a8', '#e8e2dc', '#fffdf8']); line(im, 26, 6 + b, 22, 1 + b, '#8a7050', 2); rect(im, 29, 8 + b, 3, 2, '#f8e08a'); rect(im, 29, 9 + b, 3, 1, INK); rect(im, 30, 15 + b, 2, 4, '#e8e2dc'); rect(im, 5, 11, 3, 4, '#fffaf4'); rect(im, 31, 12 + b + k % 2, 3, 2, '#e8a0a0')
        rect(im, 32, 13 + b, 4, 5 - k % 3, '#fffaf0'); S['goat'].append(outline(im))
    S['chicken'] = []
    for k in range(2): im = new(20, 18); ball(im, 9, 10, 6, 5, ['#a85a24', '#d8863c', '#f8c070']); ball(im, 14, 6, 3, 3, ['#d8863c', '#f8c070']); rect(im, 13, 1, 3, 2, '#d8303c'); rect(im, 17, 6, 2, 2, '#f0c030'); rect(im, 15, 5, 1, 1, INK); poly(im, [(4, 9), (0, 3 + k), (5, 12)], '#8a4420'); rect(im, 7 + k * 2, 14, 1, 3, '#f0c030'); rect(im, 11 - k * 2, 14, 1, 3, '#f0c030'); S['chicken'].append(outline(im))
    S['mosquito'] = []
    for k in range(4):
        im = new(32, 24); wy = [0, 3, 6, 3][k]
        for s in (-1, 1): poly(im, [(15, 11), (15 + s * 7, 2 + wy), (15 + s * 12, 5 + wy)], '#d8f0ff')
        ball(im, 15, 14, 6, 5, ['#3a2c4a', '#6a4a6a', '#a87a90']); rect(im, 11, 15, 8, 1, '#e8d08a'); rect(im, 11, 11, 4, 4, '#fff'); rect(im, 16, 11, 4, 4, '#fff'); rect(im, 13, 12, 2, 2, RED); rect(im, 16, 12, 2, 2, RED); line(im, 20, 16, 26, 20, '#c8484f'); [line(im, x, 18, x + d, 23, INK) for x, d in ((11, -2), (15, 0), (19, 2))]; S['mosquito'].append(outline(im))
    # landslide
    S['barrier_rock'] = []
    for k in range(2):
        im = new(56, 80); C = ['#4a3a34', '#7a6250', '#a08468', '#ccb08c'] if not k else ['#8a7a70', '#b8a290', '#e0c8a8', '#fff0d8']
        for x, y, rx, ry in ((14, 66, 14, 13), (40, 66, 16, 14), (28, 48, 17, 15), (14, 36, 11, 11), (41, 34, 12, 12), (28, 20, 13, 12)): ball(im, x, y, rx, ry, C); ell(im, x - rx + 3, y - 1, 5, 2, C[0])
        rect(im, 20, 38, 17, 11, '#f4ead0'); text(im, 'OOPS', 21, 41, RED); [rect(im, x, 78 - i % 3, 5, 2, '#6aa83c') for i, x in enumerate(range(2, 52, 8))]; S['barrier_rock'].append(outline(im))
    S['boulder'] = []; im = new(24, 24); ball(im, 12, 12, 10, 10, ['#4a3a34', '#7a6250', '#a08468', '#ccb08c']); line(im, 8, 8, 13, 14, '#4a3a34'); rect(im, 15, 6, 3, 2, '#4a3a34'); S['boulder'] = [outline(im)]
    im = new(50, 16); [(rect(im, x, 4, 8, 7, WOOD[2]), rect(im, x, 4, 8, 1, WOOD[3]), rect(im, x, 10, 8, 1, WOOD[0]), rect(im, x + 2, 6, 1, 2, WOOD[0])) for x in (2, 11, 20, 29, 38)]; rect(im, 1, 2, 48, 2, '#d8c8a0'); S['plat_rope'] = [outline(im)]
    im = new(66, 24); paste(im, paragraph(60, 2, 7, False), 3, 2); rect(im, 3, 2, 60, 1, '#ffffff'); rect(im, 3, 20, 60, 2, PAPER2); S['plat_para'] = [outline(im)]
    im = new(58, 16); rect(im, 2, 2, 54, 11, '#ffd8d4'); rect(im, 2, 2, 54, 1, '#fff4f0'); rect(im, 2, 12, 54, 1, RED); rect(im, 2, 2, 3, 11, RED); text(im, 'SEE COMMENT', 9, 5, RED); S['plat_track'] = [outline(im)]
    # Writer's Block: the cursor
    S['cursor'] = []
    for k in range(2):
        im = new(36, 160); c = ['#1c1428', '#7a6a9a'][k]
        for x, y, w, h in ((14, 6, 8, 148), (4, 2, 28, 7), (4, 151, 28, 7)): rect(im, x, y, w, h, c)
        rect(im, 15, 9, 2, 142, shade(c, .35))
        if k == 0: rect(im, 10, 58, 7, 7, '#fff'); rect(im, 20, 58, 7, 7, '#fff'); rect(im, 12, 61, 3, 4, RED); rect(im, 20, 61, 3, 4, RED); rect(im, 14, 72, 9, 2, '#fff')
        else: rect(im, 10, 61, 7, 2, '#fff'); rect(im, 20, 61, 7, 2, '#fff'); rect(im, 14, 72, 9, 2, '#fff')
        S['cursor'].append(outline(im, '#fff6e0'))
    S['bulb'] = []
    for k in range(4):
        im = new(28, 32); ball(im, 14, 13, 8, 8, ['#d88a1c', '#f8c83c', '#fff0a0', '#ffffff']); rect(im, 10, 20, 8, 3, '#b8b4c0'); rect(im, 11, 23, 6, 2, '#8a8494'); rect(im, 12, 25, 4, 2, '#5a5470'); line(im, 12, 13, 14, 16, '#c8601c'); line(im, 16, 13, 14, 16, '#c8601c')
        for i in range(8):
            a = i * .785 + k * .2; r0 = 11 + (k + i) % 2; line(im, 14 + math.cos(a) * r0, 13 + math.sin(a) * r0, 14 + math.cos(a) * (r0 + 2), 13 + math.sin(a) * (r0 + 2), '#fff6c0')
        S['bulb'].append(outline(im))
    # Supervisor feedback
    im = new(128, 96); C = ['#4a2414', '#7a4424', '#a86a3c', '#e0a868']; ball(im, 64, 14, 15, 13, C); rect(im, 56, 22, 17, 26, C[1]); rect(im, 56, 22, 5, 26, C[2]); rect(im, 69, 22, 4, 26, C[0]); poly(im, [(56, 46), (73, 46), (112, 60), (16, 60)], '#8a5430'); rect(im, 6, 59, 116, 24, C[2]); rect(im, 6, 59, 116, 2, C[3]); rect(im, 6, 81, 116, 2, C[0]); rect(im, 12, 61, 104, 21, '#fffaf0'); text(im, 'REWRITE', 64 - twid('REWRITE', 2) // 2, 62, RED, 2); text(im, 'THIS CHAPTER', 64 - twid('THIS CHAPTER') // 2, 75, RED); rect(im, 2, 83, 124, 11, '#d0303c'); rect(im, 2, 83, 124, 2, '#ff8a80'); ell(im, 46, 52, 8, 5, '#fff'); ell(im, 75, 52, 8, 5, '#fff'); rect(im, 49, 53, 3, 3, INK); rect(im, 77, 53, 3, 3, INK); line(im, 44, 49, 54, 52, INK, 2); line(im, 85, 49, 75, 52, INK, 2); S['stamp_rewrite'] = [outline(im)]
    w = 172; im = new(w, 56); d = ImageDraw.Draw(im); d.rectangle([2, 2, w - 3, 53], outline=hexc('#d0303c'), width=3); d.rectangle([7, 7, w - 8, 48], outline=hexc('#d0303c')); text(im, 'REWRITE', w // 2 - twid('REWRITE', 4) // 2, 11, '#d0303c', 4); text(im, 'THIS CHAPTER', w // 2 - twid('THIS CHAPTER', 2) // 2, 36, '#d0303c', 2); q = random.Random(9)
    for _ in range(300): rect(im, q.randrange(w), q.randrange(56), q.randrange(1, 3), 1, (0, 0, 0, 0))
    S['ink_rewrite'] = [im]
    # thesis
    im = new(44, 52); rect(im, 5, 4, 34, 44, '#8f2f3c'); rect(im, 5, 4, 6, 44, '#6a1f2c'); rect(im, 39, 7, 3, 40, '#f4ead0'); rect(im, 8, 47, 33, 3, '#d9ccaa'); rect(im, 13, 7, 23, 38, '#a83a48'); d = ImageDraw.Draw(im); d.rectangle([14, 8, 35, 43], outline=hexc('#f0c44c')); text(im, 'DR?', 19, 12, '#fff0a0'); text(im, 'THESIS', 14, 30, '#fff6d0') if False else [rect(im, 18, y, 14, 1, '#f0c44c') for y in (21, 24, 27)]; ball(im, 25, 36, 4, 4, ['#8a5414', '#f0bc42', '#fff6c0']); rect(im, 33, 2, 3, 15, '#4fa6d8'); S['thesis'] = [outline(im)]
    # field station tent + table
    im = new(96, 66); poly(im, [(4, 64), (40, 8), (78, 64)], '#d8863c'); poly(im, [(40, 8), (92, 64), (78, 64)], '#a85a28'); poly(im, [(28, 64), (40, 24), (52, 64)], '#4a2818'); poly(im, [(4, 64), (40, 8), (34, 64)], '#f0a858'); line(im, 40, 8, 40, 1, WOOD[1], 2); poly(im, [(41, 1), (54, 4), (41, 8)], '#4fa6d8'); rect(im, 34, 50, 12, 14, '#ffd978'); S['tent'] = [outline(im)]
    S['basket'] = []; im = new(22, 20); rect(im, 3, 8, 16, 10, '#b0853f'); [rect(im, x, 8, 1, 10, '#7f5a2c') for x in range(5, 19, 3)]; rect(im, 2, 7, 18, 2, '#e0bc70'); [ball(im, x, 6, 3, 3, ['#a8281c', '#e8602c', '#ffb060']) for x in (7, 12, 16)]; S['basket'] = [outline(im)]
    im = new(30, 40); rect(im, 14, 10, 3, 30, WOOD[1]); d = ImageDraw.Draw(im); rect(im, 2, 4, 26, 14, '#fffaf0'); rect(im, 2, 4, 26, 2, '#c8484f'); rect(im, 5, 14, 3, 2, '#3a6ea8'); rect(im, 10, 11, 3, 5, '#3a6ea8'); rect(im, 15, 9, 3, 7, '#3a6ea8'); rect(im, 20, 13, 3, 3, '#3a6ea8'); S['fieldsign'] = [outline(im)]
    # floating words for writer's block
    S['word'] = []
    for s in ('HENCE', 'THUS', 'DATA', 'ETC.', 'OK SO'): im = new(26, 10); text(im, s, 13 - twid(s) // 2, 3, '#2c2038'); S['word'].append(outline(im, '#fff6e0'))
    S['rain'] = []; im = new(3, 12); rect(im, 1, 0, 1, 12, hexc('#b8dcf8', 200)); S['rain'] = [im]
    # icons
    a = new(30, 30); rect(a, 0, 22, 30, 8, '#4a9a44'); [line(a, x, 23, x + (x % 3) - 1, 15 + x % 5, ['#79c652', '#b9e86b', '#2f6b3a'][x % 3], 2) for x in range(1, 30, 3)]; paste(a, S['finding'][0], 3, -1); ball(a, 24, 6, 4, 4, ['#f0bc42', '#fff6c0']); S['icon_fieldwork'] = [ui.frame_icon(a, ('#2a5a7a', '#4a90c0', '#a8dcf0'))]
    a = new(30, 30)
    for i in range(10): t = i * .628; line(a, 15, 15, 15 + math.cos(t) * 15, 15 + math.sin(t) * 15, '#fff0a0', 1)
    paste(a, ui.fit(S['thesis'][0], 24, 28), 5, 1); S['icon_chapters'] = [ui.frame_icon(a, ('#6a2430', '#a83a48', '#f0a060'))]
    return S


# ------------------------------------------------------------------ phase 2 ending vista
def vista(backdrop=True):
    w, h = 960, 540; im = bg.sky(['#1f3a7c', '#3a68b8', '#78a4dc', '#f0b8a8', '#ffe0b0', '#fff4d8'], None, 0, w, h)
    far = bg.mountains(5, 252, 36, bg.MT_FAR, bg.SNOW, 222, w=w, h=h, haze='#f0d8c8'); paste(im, far, 0, 0) if backdrop else im.paste(new(w, h), (0, 0))
    m = ui.bigmountain(w, h, [(800, 30, .7), (560, 243, .46), (330, 342, .37), (110, 422, .3)], 51, ['#34467c', '#4c6298', '#7088b8', '#a4b8d8'], ui.SN, 158, 530); paste(im, m, 0, 0)
    g = bg.mountains(63, 486, 12, ['#2f6b4c', '#458a58', '#6aa868', '#a0cc7c'], w=w, h=h, haze='#5a9c78', rough=.5); paste(im, g, 0, 0)
    # flat ridge Léo stands on
    for x in range(500, 700):
        y0 = 263 + math.sin(x * .07) * 1.5
        for y in range(int(y0), int(y0) + int(40 * (1 - ((x - 600) / 100) ** 2) + 8 * abs(math.sin(x * .13)) + 5 * abs(math.sin(x * .37)))):
            c = '#dff0ff' if y < y0 + 2 else '#a8cc6a' if y < y0 + 5 else ramp_at(['#34467c', '#4c6298', '#7088b8', '#b4c8e4'], .85 - (y - y0) / 60 + math.sin((x + (y - y0) * .6) * .4) * .18, x, y); im.putpixel((x, y), hexc(c))
    P = [(20, 518), (130, 502), (76, 481), (190, 460), (130, 441), (270, 419), (220, 398), (350, 377), (300, 355), (420, 337), (390, 318), (500, 300), (470, 283), (520, 265), (600, 264)]
    for i in range(len(P) - 1):
        (a, b), (c, d) = P[i], P[i + 1]; n = int(math.hypot(c - a, d - b))
        for t in range(n):
            x = a + (c - a) * t / n; y = b + (d - b) * t / n + math.sin(t / n * 3.14) * 3; rect(im, int(x) - 1, int(y), max(3, 7 - i // 3), max(2, 4 - i // 4), '#f4dca8'); rect(im, int(x) - 1, int(y) + max(2, 4 - i // 4), max(3, 7 - i // 3), 1, '#6a5448')
    Q = [(690, 263), (740, 229), (700, 201), (770, 170), (738, 139), (792, 106), (772, 78), (800, 50)]
    for i in range(len(Q) - 1):
        (a, b), (c, d) = Q[i], Q[i + 1]; n = int(math.hypot(c - a, d - b))
        for t in range(0, n, 9): rect(im, int(a + (c - a) * t / n), int(b + (d - b) * t / n), 4, 2, '#fff0a0')
    B = bg.building
    for x, y, bw, bh, t, s in ((8, 518, 34, 40, 0, 1), (46, 519, 16, 62, 1, 2), (150, 488, 40, 34, 0, 3), (214, 451, 18, 84, 1, 7)): b = B(bw, bh, bg.WALL_A if s % 2 else bg.WALL_B, bg.ROOF_A if s % 2 else bg.ROOF_B, s, bool(t)); paste(im, b, x, y - bh)
    for x, y, s in ((262, 416, 1), (330, 376, 2), (300, 413, 3)): hs = stilt(52, 48, ['#6a4224', '#9c6c34', '#c89a4c', '#f0cc7c'], s); hs = hs.resize((44, 40), 0); paste(im, hs, x, y - 36)
    for i, (x, y, tw) in enumerate(((100, 496, 26), (190, 518, 30), (20, 481, 24), (250, 460, 24), (360, 422, 24), (400, 377, 20), (280, 496, 34), (420, 466, 30), (520, 422, 26), (600, 481, 34), (720, 451, 30), (840, 496, 36), (900, 437, 28), (480, 518, 36), (760, 525, 36))): paste(im, bg.tree(tw, int(tw * 1.45), bg.LEAF_D, i + 70), x, y - int(tw * 1.4))
    for i, (x, y) in enumerate(((436, 330), (452, 324), (470, 333), (444, 339))): s = book(13, 20 + i * 4, ['#a83a4a', '#3a6ea8', '#d8a83c', '#4a8f6a'][i]); paste(im, s, x, y - 18 - i * 4)
    f = new(14, 22); rect(f, 2, 0, 2, 22, '#4a2c1c'); poly(f, [(4, 1), (13, 5), (4, 9)], '#ffd24a'); paste(im, outline(f), 798, 16)
    return im


def main():
    make_tiles(); print('tiles')
    for n, f in (('field', bg_field), ('manuscript', bg_manuscript)):
        for k, im in f().items(): im.save(f'{OUT}/bg_{n}_{k}.png', optimize=True)
    vista().save(f'{OUT}/vista.png', optimize=True); print('backgrounds')
    S = sprites(); at = Image.open(f'{OUT}/atlas.png').convert('RGBA'); meta = json.load(open(f'{OUT}/atlas.json')); base = meta['meta'].get('phase1', at.height)
    for n in meta['meta'].get('phase2', []): meta['meta']['counts'].pop(n, None); meta['frames'] = {k: v for k, v in meta['frames'].items() if k.rsplit('/', 1)[0] != n}
    at = at.crop((0, 0, 1024, base)); items = sorted([(n, i, f) for n, fr in S.items() for i, f in enumerate(fr)], key=lambda t: (-t[2].height, t[0], t[1])); x, y, rh, pos = 1, base + 2, 0, []
    for n, i, f in items:
        if x + f.width + 2 > 1024: x = 1; y += rh + 2; rh = 0
        pos.append((n, i, f, x, y)); x += f.width + 2; rh = max(rh, f.height)
    out = new(1024, y + rh + 2); out.paste(at, (0, 0))
    for n, i, f, x, y in pos: paste(out, f, x, y); meta['frames'][f'{n}/{i}'] = dict(frame=dict(x=x, y=y, w=f.width, h=f.height), rotated=False, trimmed=False, spriteSourceSize=dict(x=0, y=0, w=f.width, h=f.height), sourceSize=dict(w=f.width, h=f.height))
    for n, fr in S.items(): meta['meta']['counts'][n] = len(fr)
    meta['meta'].update(phase1=base, phase2=list(S), size={'w': 1024, 'h': out.height}); out.save(f'{OUT}/atlas.png', optimize=True); json.dump(meta, open(f'{OUT}/atlas.json', 'w')); print('atlas', out.size)
    if len(sys.argv) > 1:  # contact sheet
        c = Image.new('RGBA', (1500, 1500), (110, 150, 190, 255)); x = y = rh = 0
        for n, i, f in items:
            f = f.resize((f.width * 2, f.height * 2), 0)
            if x + f.width > 1500: x = 0; y += rh + 4; rh = 0
            paste(c, f, x, y); x += f.width + 4; rh = max(rh, f.height)
        y += rh + 6; x = 0
        for n in ('field', 'manuscript'):
            o = Image.open(f'{OUT}/bg_{n}_sky.png').convert('RGBA')
            for k in ('far', 'clouds', 'mid', 'near'):
                if os.path.exists(f'{OUT}/bg_{n}_{k}.png'): o.alpha_composite(Image.open(f'{OUT}/bg_{n}_{k}.png').convert('RGBA').crop((0, 0, 480, 300)))
            paste(c, o, x, y); paste(c, Image.open(f'{OUT}/tiles_{n}.png').convert('RGBA'), x, y + 305); x += 490
        paste(c, Image.open(f'{OUT}/vista.png').convert('RGBA').resize((480, 360)), x, y); c.crop((0, 0, 1500, y + 400)).save(sys.argv[1])


if __name__ == '__main__': main()
