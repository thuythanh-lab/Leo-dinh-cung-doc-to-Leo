"""Autotiled platformer terrain: one 256x80 sheet per theme.
rows 0-3 = 16 neighbour masks (1 up,2 right,4 down,8 left) x 4 texture phases ; row4 = specials:
0-3 one-way L M R single, 4 ladder, 5 ladder top, 6 hazard, 7 hazard b, 8 breakable, 9 book block, 10-13 surface decor, 14 bridge, 15 bridge"""
from px import *
import random, math
T = 16


def rocky(c, seed, size=9):
    """Voronoi cobble fill on a wrapped 32x32 field."""
    r = random.Random(seed); pts = [(r.randrange(32), r.randrange(32), r.random()) for _ in range(int(32 * 32 / size ** 2 * 1.2))]

    def f(x, y):
        x %= 32; y %= 32; b = []
        for px_, py_, v in pts:
            dx = min(abs(x - px_), 32 - abs(x - px_)); dy = min(abs(y - py_), 32 - abs(y - py_)); b.append((dx * dx + dy * dy * 1.3, v, (y - py_ + 32) % 32 - 32))
        b.sort()
        if b[1][0] ** .5 - b[0][0] ** .5 < 1.1: return c[0]
        hi = b[0][2] < -2 and b[1][0] ** .5 - b[0][0] ** .5 > 2
        return c[3] if hi and b[0][1] > .35 else c[2] if b[0][1] > .5 else c[1]
    return f


def bricks(c, bw=8, bh=8, seed=1, joint=True):
    r = random.Random(seed); tone = [r.random() for _ in range(32)]

    def f(x, y):
        x %= 32; y %= 32; row = y // bh; xx = (x + (bw // 2 if row % 2 else 0)) % 32; k = tone[(row * 8 + xx // bw) % 32]
        if joint and (y % bh == bh - 1 or xx % bw == bw - 1): return c[0]
        if y % bh == 0 or xx % bw == 0: return c[3]
        return c[2] if k > .45 else c[1]
    return f


def panels(c, s=16, rivet=True):
    def f(x, y):
        a, b = x % s, y % s
        if a == s - 1 or b == s - 1: return c[0]
        if a == 0 or b == 0: return c[3]
        if rivet and (a, b) in ((3, 3), (s - 5, 3), (3, s - 5), (s - 5, s - 5)): return c[3]
        if rivet and (a, b) in ((4, 4), (s - 4, 4), (4, s - 4), (s - 4, s - 4)): return c[0]
        return c[2] if (x // s + y // s) % 2 else c[1]
    return f


def circuits(c):
    def f(x, y):
        x %= 64; y %= 64
        if (x % 16 == 7 and (x // 16 + y // 8) % 3) or (y % 16 == 11 and (y // 16 + x // 8) % 3): return c[3]
        if x % 16 in (6, 7, 8) and y % 16 in (10, 11, 12): return c[3] if (x % 16, y % 16) != (7, 11) else c[0]
        return c[1] if (x // 4 + y // 4) % 2 else c[2]
    return f


TH = {
    'campus': dict(fill=rocky(['#68432f', '#7f553a', '#8a5f3f', '#9c7048'], 3), top='grass', g=['#2f6b3a', '#4a9a44', '#79c652', '#b9e86b'], edge='#4a2d24', plank=['#4a2c1c', '#7a4c2c', '#a56c3c', '#d39a5c']),
    'library': dict(fill=bricks(['#2c1f33', '#4a3550', '#5a4260', '#75587a'], 16, 8, 2), top='trim', g=['#5a3420', '#8f5a30', '#c98f4a', '#f2c878'], edge='#221628', plank=['#3d2216', '#6b3f24', '#96602f', '#c58d4c']),
    'water': dict(fill=bricks(['#1b3542', '#2c5261', '#376475', '#4f8593'], 16, 8, 7), top='trim', g=['#2f6f78', '#4fa6a4', '#86d6c4', '#d2fbe4'], edge='#132833', plank=['#2a4a3c', '#447058', '#639a70', '#9acb92']),
    'garden': dict(fill=rocky(['#2a1f45', '#40305f', '#523f78', '#6f5a98'], 11), top='grass', g=['#2b5a5c', '#3f8f7a', '#66c48f', '#b4f5a8'], edge='#1f1636', plank=['#30503a', '#4c7a48', '#7aab58', '#b9de7d']),
    'archive': dict(fill=circuits(['#141a38', '#1f2850', '#243060', '#3d55a0']), top='trim', g=['#3c4f9e', '#5f7ce0', '#93b4ff', '#e2ecff'], edge='#0d1128', plank=['#232c5c', '#3b4c94', '#5a72cc', '#93acf8']),
    'tower': dict(fill=bricks(['#7a6250', '#b09a7c', '#c4b08f', '#e2d3b0'], 16, 8, 5), top='trim', g=['#8f6428', '#c9953c', '#f0c860', '#fff0b4'], edge='#5c4638', plank=['#8a7a64', '#d8ccaf', '#f1e8cf', '#fffaea']),
    'treasury': dict(fill=bricks(['#143a35', '#1f5a4c', '#27705a', '#3f9272'], 16, 16, 9), top='trim', g=['#9a6418', '#d89a28', '#f8cf4c', '#fff3a8'], edge='#0f2b2b', plank=['#7a4c12', '#c08526', '#f0bc42', '#fff0a0']),
    'office': dict(fill=panels(['#565a6e', '#8a8f9f', '#969bab', '#b7bcc8'], 16), top='carpet', g=['#5c2434', '#8f3848', '#bf5560', '#e88f88'], edge='#3f4254', plank=['#5f5348', '#93826c', '#b8a486', '#dcccaa']),
}


def tile(th, mask, ox, oy):
    im = new(T, T); p = im.load(); f = th['fill']; up, rt, dn, lf = mask & 1, mask & 2, mask & 4, mask & 8; g = th['g']; e = th['edge']
    for y in range(T):
        for x in range(T): p[x, y] = hexc(f(x + ox, y + oy))
    for i in range(T):
        for d, k in ((0, 1), (1, .45), (2, .2)):
            if not lf: p[d, i] = lerp(p[d, i], e, k)
            if not rt: p[T - 1 - d, i] = lerp(p[T - 1 - d, i], e, k)
            if not dn: p[i, T - 1 - d] = lerp(p[i, T - 1 - d], e, k)
    if not up:
        if th['top'] == 'grass':
            for x in range(T):
                h = 4 + [0, 1, 2, 1, 0, 2, 3, 1, 0, 1, 3, 2, 0, 1, 2, 1][(x + ox) % 16]
                for y in range(h): p[x, y] = hexc(g[3] if y == 0 else g[2] if y < 3 else g[1] if y < h - 1 else g[0])
                if (x * 5 + ox) % 7 == 0: p[x, 2] = hexc(g[3])
                for y in range(h, h + 2): p[x, y] = lerp(p[x, y], e, .5)
        elif th['top'] == 'carpet':
            for x in range(T):
                for y, c in ((0, g[3]), (1, g[2]), (2, g[2] if x % 2 else g[1]), (3, g[1]), (4, g[0]), (5, '#2c2438')): p[x, y] = hexc(c)
                if x % 8 == 4: p[x, 2] = hexc('#f0c860')
        else:
            for x in range(T):
                for y, c in ((0, g[3]), (1, g[2]), (2, g[2]), (3, g[1]), (4, g[0]), (5, e)): p[x, y] = hexc(c)
                if x % 8 in (3, 4): p[x, 3] = hexc(g[3])
                if x % 8 == 7: p[x, 2] = hexc(g[1])
                p[x, 6] = lerp(p[x, 6], e, .5)
        for side, xx in ((lf, 0), (rt, 15)):
            if not side:
                for y in range(0, 6): p[xx, y] = hexc(e)
                p[xx, 0] = (0, 0, 0, 0)
    return im


def oneway(th, k, theme):
    im = new(T, T); c = th['plank']; x0 = 1 if k in (0, 3) else 0; x1 = 15 if k in (2, 3) else 16
    if theme == 'tower':  # stacked manuscript
        for yy, col in ((0, c[3]), (1, c[3]), (2, c[2]), (3, c[0]), (4, c[2]), (5, c[0])): rect(im, x0, yy, x1 - x0, 1, col)
        for x in range(x0 + 1, x1 - 1, 3): rect(im, x, 1, 2, 1, '#b5a98c')
        rect(im, 6, 3, 4, 3, '#b04a42')
    elif theme == 'treasury':
        rect(im, x0, 0, x1 - x0, 7, c[1]); rect(im, x0, 0, x1 - x0, 2, c[3]); rect(im, x0, 2, x1 - x0, 1, c[2]); rect(im, x0, 5, x1 - x0, 2, c[0])
        rect(im, 4, 2, 8, 3, c[2]); rect(im, 5, 3, 6, 1, c[0])
    elif theme == 'garden':
        for x in range(x0, x1):
            d = 2 if (x % 8) in (3, 4, 5) else 0
            rect(im, x, 0, 1, 5 + d, c[1]); rect(im, x, 0, 1, 1, c[3]); rect(im, x, 1, 1, 2, c[2]); rect(im, x, 4 + d, 1, 1, c[0])
    else:
        rect(im, x0, 0, x1 - x0, 6, c[1]); rect(im, x0, 0, x1 - x0, 1, c[3]); rect(im, x0, 1, x1 - x0, 2, c[2]); rect(im, x0, 5, x1 - x0, 1, c[0])
        for x in range(x0 + 2, x1 - 1, 5): rect(im, x, 2, 2, 1, c[1])
        for s in {0: [0], 2: [2], 3: [0, 2]}.get(k, []):
            poly(im, [(x0, 6), (x0 + 4, 6), (x0, 10)] if s == 0 else [(x1 - 1, 6), (x1 - 5, 6), (x1 - 1, 10)], c[0])
    for x in range(x0, x1):
        for y in range(15, 0, -1):
            if im.getpixel((x, y - 1))[3]:
                im.putpixel((x, y), hexc(th['edge'])); break
    for y in range(0, 7):
        if k in (0, 3): im.putpixel((0, y), hexc(th['edge']))
        if k in (2, 3): im.putpixel((15, y), hexc(th['edge']))
    return im


def hazard(theme, k):
    im = new(T, T)
    if theme in ('campus', 'garden'):  # brambles
        c = ('#3a2340', '#6a3a5c', '#b0507a', '#ff9ab0') if theme == 'garden' else ('#3a2418', '#6b3a22', '#a8542e', '#ffb060')
        for i in range(3):
            x = 2 + i * 5; line(im, x, 15, x + 2 + k, 6 + i % 2 * 2, c[1], 2); line(im, x + 2 + k, 7 + i % 2 * 2, x + 4, 12, c[0], 2)
            for q in ((x - 1, 11), (x + 3, 8), (x + 2 + k, 4 + i % 2 * 2)): rect(im, q[0], q[1], 1, 2, c[3])
    elif theme == 'water':
        for i in range(4):
            poly(im, [(i * 4, 15), (i * 4 + 2, 5 + i % 2 * 2 - k), (i * 4 + 3, 15)], '#7fd0c8'); line(im, i * 4 + 1, 14, i * 4 + 2, 7, '#e2fff6')
    else:  # red pens, points up
        for i in range(4):
            x = i * 4; rect(im, x, 9 + i % 2, 3, 7, '#c23a3a'); rect(im, x, 9 + i % 2, 1, 7, '#f0706a'); rect(im, x, 12, 3, 1, '#7a1f2a')
            rect(im, x, 7 + i % 2, 3, 2, '#e8dcc0'); rect(im, x + 1, 4 + i % 2 - k, 1, 4, '#2c2030')
    return outline(im, '#1c1428')


def breakable(theme):
    im = new(T, T)
    c = {'campus': ['#5a2f1c', '#8c4c2a', '#b86c38', '#e09c5c'], 'garden': ['#5a2f1c', '#8c4c2a', '#b86c38', '#e09c5c'], 'treasury': ['#7a4c12', '#b87a22', '#e0ac3c', '#fff0a0'],
         'office': ['#4a5064', '#6f7890', '#9aa3b8', '#cdd4e0'], 'tower': ['#8a6a3c', '#c09a58', '#e4c684', '#fff2c8']}.get(theme, ['#3c2a4a', '#5f4470', '#86629a', '#b591c8'])
    rect(im, 0, 0, 16, 16, c[0]); rect(im, 1, 1, 14, 14, c[1]); rect(im, 1, 1, 13, 1, c[3]); rect(im, 1, 1, 1, 13, c[3]); rect(im, 2, 2, 12, 11, c[2])
    for a in ((5, 2, 7, 6), (7, 6, 4, 9), (7, 6, 11, 8), (11, 8, 10, 13), (4, 9, 5, 13)): line(im, *a, c[0])
    for x, y in ((3, 4), (12, 4), (3, 11), (12, 11)): rect(im, x, y, 1, 1, c[3])
    return im


def bookblock():
    im = new(T, T)
    for j, (y, h, c) in enumerate(((0, 5, '#a83a3a'), (5, 4, '#3a6ea8'), (9, 3, '#d8a83c'), (12, 4, '#4a8f5a'))):
        o = [0, 1, 0, 1][j]; rect(im, o, y, 16 - o, h, c); rect(im, o, y, 16 - o, 1, shade(c, .35)); rect(im, o, y + h - 1, 16 - o, 1, shade(c, -.45))
        rect(im, 11 if j % 2 else 2, y + 1, 3, h - 2, '#f4ead0'); rect(im, 6, y + 1, 2, max(1, h - 2), shade(c, .5))
    for i in range(16):
        for q in ((0, i), (15, i), (i, 15), (i, 0)): im.putpixel(q, INK)
    return im


def ladder(theme, top):
    im = new(T, T); c = TH[theme]['plank']
    if theme == 'garden':
        for y in range(T):
            x = 7 + int(round(2 * math.sin(y * math.pi / 8))); rect(im, x, y, 2, 1, c[1]); rect(im, x, y, 1, 1, c[3])
        for x, y in ((3, 3), (11, 6), (2, 11), (11, 13)): rect(im, x, y, 3, 2, c[2]); rect(im, x, y, 1, 1, c[3])
        return outline(im, '#1f1636')
    for x in (2, 12):
        rect(im, x, 0, 2, 16, c[2]); rect(im, x, 0, 1, 16, c[3]); rect(im, x + 2, 0, 1, 16, INK); rect(im, x - 1, 0, 1, 16, INK)
    for y in (2, 7, 12):
        rect(im, 4, y, 8, 2, c[2]); rect(im, 4, y, 8, 1, c[3]); rect(im, 4, y + 2, 8, 1, INK)
    return im


def decor(theme, k):
    im = new(T, T); g = TH[theme]['g']; r = random.Random(k + 5)
    if theme in ('campus', 'garden', 'water'):
        cols = {'campus': ['#f8f4ff', '#ffd24a', '#ff8fa8', '#9ab8ff'], 'garden': ['#ff9ae0', '#8ff0ff', '#ffe08a', '#c09aff'], 'water': ['#bfffe8', '#e8ffff', '#8fe6ff', '#d8f8c0']}[theme]
        for i in range(5):
            x = 1 + i * 3 + r.randrange(2); h = 3 + r.randrange(5)
            line(im, x, 15, x + r.choice((-1, 0, 1)), 15 - h, g[1 + r.randrange(2)])
            if k % 2 == 0 and i % 2 == 0:
                c = cols[(k + i) % 4]; y = 15 - h
                for dx, dy in ((0, -1), (1, 0), (-1, 0), (0, 1)):
                    if 0 <= x + dx < 16: im.putpixel((x + dx, y + dy), hexc(c))
                im.putpixel((x, y), hexc('#ffe9a0'))
    elif k % 2:
        rect(im, 2, 11, 11, 5, '#f2e9d0'); rect(im, 2, 11, 11, 1, '#fffaf0'); rect(im, 4, 13, 7, 1, '#a89c88'); rect(im, 3, 9, 8, 2, '#e4d8bc'); im = outline(im)
    else:
        for j, c in enumerate(('#a83a3a', '#3a6ea8', '#4a8f5a')[:2]):
            rect(im, 2 + j, 13 - j * 3, 11 - j, 3, c); rect(im, 2 + j, 13 - j * 3, 11 - j, 1, shade(c, .35)); rect(im, 11, 14 - j * 3, 2, 1, '#f4ead0')
        im = outline(im)
    return im


def bridge(theme):
    im = new(T, T); c = TH[theme]['plank']
    for x in range(0, 16, 4):
        rect(im, x, 0, 3, 5, c[2]); rect(im, x, 0, 3, 1, c[3]); rect(im, x, 4, 3, 1, c[0]); rect(im, x + 3, 0, 1, 5, INK)
    rect(im, 0, 5, 16, 1, INK); rect(im, 0, 2, 16, 1, c[1])
    return im


def sheet(theme):
    """rows 0-3: texture phase (x%2 + 2*(y%2)); row 4: specials"""
    th = TH[theme]; im = new(256, 80)
    for m in range(16):
        for v in range(4): paste(im, tile(th, m, (v % 2) * 16, (v // 2) * 16), m * 16, v * 16)
    sp = [oneway(th, k, theme) for k in range(4)] + [ladder(theme, 0), ladder(theme, 1), hazard(theme, 0), hazard(theme, 1), breakable(theme), bookblock()] + [decor(theme, k) for k in range(4)] + [bridge(theme), bridge(theme)]
    for i, s in enumerate(sp): paste(im, s, i * 16, 64)
    return im
