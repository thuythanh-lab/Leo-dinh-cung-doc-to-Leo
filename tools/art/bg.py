"""Parallax backgrounds. Each theme = sky (480x300, static) + 2-3 layers (512x300, horizontally tileable)."""
from px import *
import math, random
W, H = 512, 300


def ridge(seed, base, amp, octaves=(1, 2, 3, 5, 8, 13, 21, 34), w=W, rough=.62):
    r = random.Random(seed); ph = [(r.random() * 6.28, rough ** i * (.7 + r.random() * .6)) for i in range(len(octaves))]
    out = []
    for x in range(w):
        v = sum(a * (1 - 2 * abs(((x * o / w + p / 6.28) % 1) * 2 - 1)) for (p, a), o in zip(ph, octaves))
        out.append(base - v * amp)
    return out


def mountains(seed, base, amp, ramp, snow=None, snowline=999, w=W, h=H, haze=None, rough=.62):
    """Faceted pixel mountains. ramp: dark..light (4)."""
    im = new(w, h); p = im.load(); top = ridge(seed, base, amp, w=w, rough=rough); det = ridge(seed + 9, 0, 10, (3, 7, 11, 17, 29, 41), w=w)
    for x in range(w):
        t = int(top[x])
        for y in range(max(0, t), h):
            d = y - t
            sl = top[(x + 2 + d // 6) % w] - top[(x - 2 + d // 6) % w]
            v = .5 - sl * .16 + (det[(x + d // 2) % w] * .025) + math.sin((x + d * .9) * .16 + det[x] * .2) * .12
            c = ramp_at(ramp, v, x, y)
            if snow and y < snowline + det[(x + d) % w] * 1.3 and d < 46 + det[x] * 1.5:
                c = ramp_at(snow, v + .1, x, y)
            if d < 1: c = lerp(c, ramp[-1], .5)
            if haze:
                k = min(1, d / 110); c = lerp(c, haze, k if k > bayer(x, y) * .5 else k * .8)
            p[x, y] = c
    return im


def sky(ramp, sun=None, stars=0, w=480, h=H):
    im = vgrad(w, h, ramp)
    if sun:
        sx, sy, sr, sc, hc = sun
        p = im.load()
        for y in range(h):
            for x in range(w):
                d = math.hypot(x - sx, y - sy)
                if d < sr * 4: p[x, y] = lerp(p[x, y], hc, max(0, (1 - d / (sr * 4))) ** 2 * .8 if bayer(x, y) < .95 else 0)
        ball(im, sx, sy, sr, sr, [sc, lerp(sc, '#ffffff', .5)])
    r = random.Random(3)
    for _ in range(stars):
        x, y = r.randrange(w), r.randrange(int(h * .65)); im.putpixel((x, y), hexc(r.choice(['#ffffff', '#b9c8ff', '#8fa0e0'])))
    return im


def cloud(w, h, seed, ramp):
    r = random.Random(seed); im = new(w, h); n = w // 9
    blobs = [(r.uniform(w * .15, w * .85), h * .72 - abs(math.sin(i * 1.7)) * h * .25 * (1 - abs(i / n - .5)), r.uniform(h * .16, h * .33)) for i in range(n)]
    p = im.load()
    for y in range(h):
        for x in range(w):
            best = 9
            for cx, cy, rr in blobs:
                d = math.hypot((x - cx) / 1.35, y - cy) / rr
                best = min(best, d)
            if best < 1 and y < h * .82:
                v = 1 - (y / h) * 1.05 + (1 - best) * .25
                p[x, y] = ramp_at(ramp, v, x, y)
    return im


def clouds(ramp, seed=1, n=7, ylo=20, yhi=120, big=1):
    im = new(W, H); r = random.Random(seed)
    for i in range(n):
        w = r.randrange(50, 110) * big; c = cloud(int(w), int(w * .36), seed * 13 + i, ramp); x = int(i * W / n + r.randrange(-15, 15)) % W; y = r.randrange(ylo, yhi)
        paste(im, c, x, y); paste(im, c, x - W, y)
    return im


def wrap(im, s, x, y):
    paste(im, s, x, y); paste(im, s, x - W, y); paste(im, s, x + W, y)


# -------------------------------------------------------------------- buildings
def building(w, h, wall, roof, seed=0, tower=False, lit='#ffd978', glass='#3a4a72', arched=True):
    """Old-university facade, ornamented. wall/roof: 4-step ramps."""
    rh = max(14, int(w * .55)) if tower else max(12, int(w * .22)); im = new(w + 8, h + rh + 8); r = random.Random(seed); p = im.load(); ox, oy = 4, rh + 6
    for y in range(h):
        for x in range(w):
            c = wall[2] if x > 3 and x < w - 6 else wall[1]
            row = y // 5
            if y % 5 == 4: c = lerp(c, wall[0], .35)
            elif (x + row * 7) % 14 == 0: c = lerp(c, wall[0], .3)
            elif ((x // 14) * 5 + row * 3) % 7 == 0: c = lerp(c, wall[3], .35)
            p[x + ox, y + oy] = hexc(c)
    for x in (0, w - 5):  # quoins
        for y in range(0, h, 8): rect(im, ox + x, oy + y, 5, 5, wall[3]); rect(im, ox + x, oy + y + 4, 5, 1, wall[1])
    rect(im, ox - 2, oy, w + 4, 3, wall[3]); rect(im, ox - 2, oy + 3, w + 4, 1, wall[0])
    for yy in range(34, h - 10, 34): rect(im, ox - 1, oy + yy, w + 2, 2, wall[3]); rect(im, ox - 1, oy + yy + 2, w + 2, 1, wall[0])
    if tower:
        poly(im, [(ox - 3, oy), (ox + w / 2, 4), (ox + w + 2, oy)], roof[1]); poly(im, [(ox - 3, oy), (ox + w / 2, 4), (ox + w / 2, oy)], roof[2])
        line(im, ox + w // 2, 0, ox + w // 2, 6, '#f0c860'); rect(im, ox + w // 2 + 1, 0, 4, 3, '#c8484f')
    else:
        poly(im, [(ox - 3, oy), (ox + 6, 6), (ox + w - 7, 6), (ox + w + 2, oy)], roof[1])
    q = im.load()
    for y in range(4, oy):
        for x in range(im.width):
            if q[x, y][3] and q[x, y] in (hexc(roof[1]), hexc(roof[2])):
                if y % 4 == 0: q[x, y] = lerp(q[x, y], roof[0], .6)
                elif (x + (y // 4) * 3) % 6 == 0: q[x, y] = lerp(q[x, y], roof[0], .35)
                elif y % 4 == 1: q[x, y] = lerp(q[x, y], roof[3], .35)
    ww, wh = 8, 14
    cols = max(1, (w - 14) // 17); gap = (w - cols * ww) / (cols + 1)
    for j in range(max(1, (h - 8) // 34)):
        for i in range(cols):
            x, y = int(ox + gap + i * (ww + gap)), oy + 10 + j * 34
            if y + wh > oy + h - 3: continue
            on = r.random() < .55
            rect(im, x - 2, y - 2, ww + 4, wh + 4, wall[3]); rect(im, x - 1, y - 1, ww + 2, wh + 2, wall[0])
            if arched: ell(im, x - 2, y - 6, ww + 4, 11, wall[3]); ell(im, x, y - 4, ww, 8, lit if on else glass)
            rect(im, x, y, ww, wh, lit if on else glass)
            if on: rect(im, x, y + wh - 5, ww, 5, lerp(lit, '#e08a3c', .4))
            else: line(im, x + 1, y + wh - 3, x + ww - 2, y + 1, lerp(glass, '#ffffff', .25))
            rect(im, x + ww // 2, y - 3, 1, wh + 3, wall[0]); rect(im, x, y + 5, ww, 1, wall[0]); rect(im, x - 2, y + wh + 1, ww + 4, 2, wall[3])
    return outline(im, lerp(wall[0], INK, .5))


WALL_A = ['#6a4a48', '#a0705c', '#b98970', '#dcb894']; ROOF_A = ['#3a3452', '#4f4a78', '#6a68a0', '#908ec6']
WALL_B = ['#7a6858', '#b8a284', '#cfbb98', '#efe0bd']; ROOF_B = ['#7a2f30', '#a8443c', '#c8604a', '#e88f6a']


def tree(w, h, ramp, seed, tr=('#3a2418', '#5c3a24', '#7d5436', '#9c7248')):
    im = new(w, h); r = random.Random(seed); cw = w
    trunk(im, w // 2, int(h * .5), h, max(4, w // 9), list(tr), 4)
    bl = [(w * .5, h * .34, w * .34)] + [(w * .5 + math.cos(a) * w * .22, h * .36 + math.sin(a) * h * .15, w * .24) for a in (0.2, 1.4, 2.6, 3.6, 4.7, 5.6)]
    crown = foliage(w, h, ramp, sorted(bl, key=lambda b: -b[1]), seed); paste(im, outline(im, '#2a1a18'), 0, 0); paste(im, crown, 0, 0)
    return im


def bush_row(seed, base, ramp, n=26, rmin=10, rmax=24):
    im = new(W, H); r = random.Random(seed)
    for i in range(n):
        R = r.uniform(rmin, rmax); x = int(i * W / n + r.uniform(-6, 6)); f = foliage(int(R * 2 + 6), int(R * 2 + 6), ramp, [(R + 3, R + 3, R)], seed + i, lerp(ramp[0], INK, .4)); wrap(im, f, x - int(R), int(base - R * .9 + r.uniform(-4, 6)))
    rect(im, 0, int(base + rmin * .6), W, H, ramp[1]); p = im.load()
    for y in range(int(base + rmin * .6), H):
        for x in range(W): p[x, y] = ramp_at([ramp[1], ramp[0], lerp(ramp[0], INK, .35)], (y - base) / (H - base), x, y)
    return im


# -------------------------------------------------------------------- themes
SKY_DAY = ['#3f7fd0', '#5a9ee4', '#86c2f2', '#b9e2f8', '#f3efcf']
MT_FAR = ['#7596c8', '#8aacd8', '#a4c4e6', '#c0daf0']; SNOW = ['#b7cbe8', '#dbe8f6', '#f4f9ff', '#ffffff']
MT_MID = ['#3f6a8e', '#527f9c', '#6a98a8', '#8cb8b4']
LEAF = ['#1f4a34', '#2f6b3c', '#4a9144', '#78b84e', '#aedb68']
LEAF_D = ['#234f52', '#2f6b60', '#458a6a', '#62a872', '#8ac684']


def campus():
    far = mountains(5, 190, 46, MT_FAR, SNOW, 150, haze='#c9e2ee'); mid = mountains(21, 226, 22, MT_MID, haze='#9fc7b4')
    nb = new(W, H)
    hills = bush_row(4, 262, LEAF_D, 30, 12, 26); paste(nb, hills, 0, 0)
    for x, w, h, t, s in ((14, 64, 92, 0, 1), (84, 26, 138, 1, 2), (118, 92, 78, 0, 3), (236, 22, 108, 1, 4), (262, 74, 86, 0, 5), (352, 30, 150, 1, 6), (388, 84, 72, 0, 7)):
        a, b = (WALL_A, ROOF_A) if s % 2 else (WALL_B, ROOF_B)
        wl = [lerp(c, '#9fc3d8', .28) for c in a]; rf = [lerp(c, '#9fc3d8', .28) for c in b]
        bd = building(w, h, wl, rf, s, bool(t), glass='#5a7a9c'); wrap(nb, bd, x, 296 - bd.height)
    fr = bush_row(8, 280, LEAF, 22, 8, 18)
    for i, (x, w) in enumerate(((10, 52), (140, 60), (220, 46), (330, 58), (470, 50))): wrap(fr, tree(w, int(w * 1.5), LEAF, 60 + i), x, 292 - int(w * 1.5))
    paste(nb, fr, 0, 0)
    return dict(sky=sky(SKY_DAY, (380, 60, 16, '#fff3b0', '#fff6cf')), far=far, clouds=clouds(['#a9c8e8', '#d4e6f6', '#f6fbff', '#ffffff'], 2, 6), mid=mid, near=nb)


def arch_window(im, x, y, w, h, view, frame):
    """Tall gothic window showing a view image."""
    for yy in range(h):
        for xx in range(w):
            if yy < w // 2 and math.hypot(xx - w / 2 + .5, yy - w / 2) > w / 2: continue
            im.putpixel(((x + xx) % W, y + yy), view.getpixel(((x + xx) % view.width, min(view.height - 1, yy + 20))))
    d = frame
    for yy in range(h):
        for xx in range(-3, w + 3):
            inside = 0 <= xx < w and not (yy < w // 2 and math.hypot(xx - w / 2 + .5, yy - w / 2) > w / 2)
            edge = not inside and (math.hypot(xx - w / 2 + .5, yy - w / 2) < w / 2 + 3 if yy < w // 2 else True)
            if edge: im.putpixel(((x + xx) % W, y + yy), hexc(d[2] if (xx + yy) % 9 else d[3]))
    for k in (w // 3, 2 * w // 3):
        for yy in range(6, h): im.putpixel(((x + k) % W, y + yy), hexc(d[1]))
    for yy in range(w // 2, h, 18):
        for xx in range(w): im.putpixel(((x + xx) % W, y + yy), hexc(d[1]))
    for xx in range(-5, w + 5):
        for yy in range(4): im.putpixel(((x + xx) % W, y + h + yy), hexc(d[3 - yy if yy < 3 else 0]))


def wallpaper(c, seed=1, bh=10, bw=20):
    im = new(W, H); p = im.load()
    for y in range(H):
        for x in range(W):
            row = y // bh; xx = (x + (bw // 2) * (row % 2)) % W
            k = c[0] if y % bh == bh - 1 or xx % bw == bw - 1 else c[2] if ((xx // bw) * 7 + row * 5) % 9 == 0 else c[1]
            p[x, y] = lerp(k, c[0], (y / H) * .45 if bayer(x, y) < .5 else (y / H) * .3)
    return im


BOOKS = ['#8f3a3f', '#3f5f8f', '#c0963c', '#4a7a52', '#6f4a86', '#b5683a', '#d8cba8', '#2f4f5f']


def shelf(w, h, wood, seed, dark=0):
    im = new(w, h); r = random.Random(seed); rect(im, 0, 0, w, h, wood[0]); rect(im, 0, 0, 3, h, wood[2]); rect(im, w - 3, 0, 3, h, wood[1]); rect(im, 0, 0, 1, h, wood[3]); y = 4
    while y + 18 < h:
        x = 4
        while x < w - 5:
            bw = r.randrange(2, 5); bh = r.randrange(9, 15); c = r.choice(BOOKS)
            if r.random() < .07: x += 4; continue
            if dark: c = lerp(c, '#241a38', dark)
            bw = min(bw, w - 4 - x); rect(im, x, y + 15 - bh, bw, bh, c); rect(im, x, y + 15 - bh, 1, bh, shade(c, .25))
            if bw > 2 and bh > 10: rect(im, x + 1, y + 18 - bh, bw - 1, 1, shade(c, .5))
            x += bw + (1 if r.random() < .12 else 0)
        rect(im, 0, y + 15, w, 2, wood[2]); rect(im, 0, y + 15, w, 1, wood[3]); rect(im, 0, y + 17, w, 1, lerp(wood[0], INK, .6)); y += 19
    return im


def mountain_view(skyr, seed, far=MT_FAR, snow=SNOW):
    v = vgrad(W, 180, skyr); paste(v, mountains(seed, 110, 34, far, snow, 92, h=180, haze='#b8cde0'), 0, 0); paste(v, mountains(seed + 3, 140, 18, MT_MID, h=180, haze='#86a8b8'), 0, 0); return v


WOOD = ['#2c1a1c', '#4a2c22', '#6b402a', '#94603a']


def library():
    wl = wallpaper(['#2a1d3a', '#3a2a4c', '#43325a']); v = mountain_view(['#46366e', '#8a5a8e', '#e08a7c', '#ffcf8a'], 31, ['#4f4a80', '#62609a', '#7c7ab4', '#a09ad0'])
    for x in (40, 210, 380): arch_window(wl, x, 34, 54, 150, v, ['#1c1428', '#2c2038', '#8a6034', '#c89448'])
    for x in (112, 160, 284, 332, 452, 500): pass
    mid = new(W, H)
    for i, x in enumerate((108, 278, 448)):
        s = shelf(84, 236, [lerp(c, '#2a1d3a', .35) for c in WOOD], 40 + i, .42); wrap(mid, s, x, 64)
        rect(mid, x % W, 60, 84, 4, '#6b4a3c')
    near = new(W, H)
    for i, x in enumerate((0, 250)):
        for k in range(18):  # column
            c = ['#241a38', '#3f2f58', '#59456f', '#6f5986', '#59456f', '#46355f', '#34264a', '#2a1e3e', '#241a38'][k // 2]; rect(near, x + k, 0, 1, H, c)
        for yy in (40, 46, 262): rect(near, x - 3, yy, 24, 4, '#c08f4a'); rect(near, x - 3, yy, 24, 1, '#f2c878'); rect(near, x - 3, yy + 4, 24, 1, '#4a2c22')
    for i, x in enumerate((30, 300, 420)):
        s = shelf(64, 92, [lerp(c, '#1c1428', .2) for c in WOOD], 70 + i, .25); wrap(near, s, x, 208)
    sk = new(480, H); rect(sk, 0, 0, 480, H, '#2a1d3a')
    return dict(sky=sk, far=wl, mid=mid, near=near)


def water():
    wl = wallpaper(['#143040', '#1d4454', '#245264'], 2, 12, 24); v = mountain_view(['#2f6fa8', '#5aa8d0', '#a8e2e8', '#e8fbe8'], 44)
    for x in (70, 326): arch_window(wl, x, 30, 92, 170, v, ['#0f2430', '#1c3c48', '#3f7a80', '#7cc0b4'])
    mid = new(W, H); r = random.Random(4)
    for i, x in enumerate((20, 200, 270, 440)):  # aqueduct piers & arches
        for k in range(30): rect(mid, (x + k) % W, 120, 1, 180, ['#163642', '#245462', '#2f6674', '#2f6674', '#245462', '#163642'][k // 5])
        for yy in range(120, 300, 12): rect(mid, x % W, yy, 30, 1, '#122c38')
    rect(mid, 0, 100, W, 22, '#2f6674'); rect(mid, 0, 100, W, 3, '#6fb0b0'); rect(mid, 0, 119, W, 3, '#163642'); rect(mid, 0, 104, W, 6, '#4fb4e0'); rect(mid, 0, 104, W, 1, '#bdf0ff')
    for x in range(0, W, 16): rect(mid, x, 111, 1, 8, '#1c4452')
    near = new(W, H)
    for x, rad in ((130, 44), (390, 34)): wheel(near, x, 226, rad, ['#15323a', '#265058', '#3c7074', '#62a09a'])
    for x in range(0, W, 2):
        h = int(14 + 6 * math.sin(x * .05) + 4 * math.sin(x * .13)); rect(near, x, 300 - h, 2, h, '#12303c')
    sk = new(480, H); rect(sk, 0, 0, 480, H, '#143040')
    return dict(sky=sk, far=wl, mid=mid, near=near)


def wheel(im, cx, cy, r, c, paddles=10, rot=0):
    d = ImageDraw.Draw(im)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=hexc(c[2]), width=4); d.ellipse([cx - r, cy - r, cx + r, cy + r], outline=hexc(c[3]), width=1)
    d.ellipse([cx - r + 10, cy - r + 10, cx + r - 10, cy + r - 10], outline=hexc(c[1]), width=2)
    for i in range(paddles):
        a = rot + i * 2 * math.pi / paddles; x, y = cx + math.cos(a) * r, cy + math.sin(a) * r
        line(im, cx, cy, x, y, c[1], 3); line(im, cx, cy, x, y, c[2], 1)
        px_, py_ = math.cos(a + 1.57) * 6, math.sin(a + 1.57) * 6
        line(im, x - px_, y - py_, x + px_, y + py_, c[3], 3); line(im, x - px_, y - py_ + 1, x + px_, y + py_ + 1, c[0], 1)
    ball(im, cx, cy, 6, 6, c)


def mushroom(w, h, cap, stem, seed):
    im = new(w, h); ch = int(h * .42)
    for y in range(ch - 3, h):
        t = (y - ch) / (h - ch); sw = w * (.10 + .05 * t); x0 = w / 2 - sw + math.sin(y * .08 + seed) * 2
        for x in range(int(x0), int(x0 + sw * 2)):
            if 0 <= x < w: im.putpixel((x, y), hexc(stem[min(3, int((1 - (x - x0) / (sw * 2)) * 4))]))
    tmp = new(w, ch * 2); ball(tmp, w / 2, ch, w / 2 - 1, ch - 1, cap); im.alpha_composite(tmp.crop((0, 0, w, ch)))
    r = random.Random(seed)
    for _ in range(max(3, w // 8)):
        x, y = r.randrange(int(w * .15), int(w * .8)), r.randrange(int(ch * .25), int(ch * .85)); q = r.choice((2, 3))
        if im.getpixel((x, y))[3] and im.getpixel((min(w - 1, x + q), y))[3]: ell(im, x, y, q + 1, q, shade(cap[-1], .5))
    rect(im, int(w * .08), ch, int(w * .84), 2, shade(cap[0], -.3))
    for x in range(int(w * .15), int(w * .85), 3): rect(im, x, ch + 1, 1, 2, stem[1])
    return outline(im, lerp(cap[0], INK, .6))


def gear(r, teeth, c, hole=.35, rot=0):
    s = r * 2 + 4; im = new(s, s); m = s / 2
    for y in range(s):
        for x in range(s):
            dx, dy = x + .5 - m, y + .5 - m; d = math.hypot(dx, dy); a = math.atan2(dy, dx) + rot
            lim = r if math.sin(a * teeth) > -.1 else r * .82
            if d < lim and d > r * hole * .6:
                v = .55 - (dx + dy) / (r * 3)
                if abs(d - r * .62) < 1.2: v -= .35
                if d < r * hole * .6 + 2: v -= .3
                im.putpixel((x, y), ramp_at(c, v, x, y))
            elif d <= r * hole * .6 and d > r * .1 and (abs(dx) < 1.6 or abs(dy) < 1.6): im.putpixel((x, y), hexc(c[1]))
    return outline(im, lerp(c[0], INK, .6))


def garden():
    far = mountains(61, 170, 40, ['#4a3f90', '#5f52a8', '#7c6cc4', '#a08ee0'], ['#9a8ee8', '#c8bcff', '#eae2ff', '#fff'], 130, haze='#8f70c4')
    mid = new(W, H); r = random.Random(7)
    caps = [['#3f2f78', '#5a3f98', '#8058b8', '#b088dc'], ['#2f4f78', '#3a7090', '#58a0a8', '#90d8c8'], ['#6a2f70', '#90408a', '#b860a4', '#e090c8']]; stem = ['#3a3468', '#504888', '#6f66a4', '#9a90c4']
    for i in range(9):
        w = r.randrange(46, 90); h = r.randrange(110, 210); wrap(mid, mushroom(w, h, caps[i % 3], stem, i), int(i * W / 9) - 10, 300 - h)
    for i, (x, y, rad) in enumerate(((60, 70, 24), (250, 50, 30), (410, 90, 20))): wrap(mid, gear(rad, 10, ['#3f3470', '#5a4a8c', '#7a68a8', '#a894cc']), x, y)
    near = bush_row(14, 270, ['#1c2450', '#263a64', '#2f5a74', '#3f8484', '#6cc0a0'], 24, 10, 20)
    for i in range(6):
        w = r.randrange(26, 40); h = r.randrange(50, 80); wrap(near, mushroom(w, h, [['#8a2f78', '#c04a90', '#f078b0', '#ffc0dc'], ['#b06a24', '#e09a3c', '#ffd06a', '#fff0b8']][i % 2], ['#6a5a98', '#8f80bc', '#beb0e0', '#e8dcff'], i + 20), int(i * W / 6) + 14, 290 - h)
    for i in range(8):  # vines
        x = int(i * W / 8 + 20)
        for y in range(0, 60 + (i * 37) % 70): rect(near, int(x + math.sin(y * .09 + i) * 6) % W, y, 2, 1, '#2f5a74' if y % 3 else '#3f8484'); (y % 13 == 5) and rect(near, int(x + math.sin(y * .09 + i) * 6 + 2) % W, y, 4, 2, '#4f9a88')
    return dict(sky=sky(['#1f1650', '#3a2478', '#7a3f9c', '#d070a8', '#ffc0a0'], None, 80), far=far, mid=mid, near=near)


def archive():
    sk = vgrad(480, H, ['#070a1c', '#0d1330', '#141d48']); far = new(W, H); p = far.load()
    for y in range(H):
        for x in range(W):
            if x % 32 == 0 or y % 32 == 0: p[x, y] = hexc('#1c2858')
            if x % 32 == 0 and y % 32 == 0: p[x, y] = hexc('#4860b8')
    mid = new(W, H); r = random.Random(3)
    for i in range(8):  # filing towers, drawn as blueprint
        w = r.choice((36, 44, 52)); h = r.randrange(120, 260); x = int(i * W / 8); rect(mid, x, 300 - h, w, h, '#10183c')
        d = ImageDraw.Draw(mid); d.rectangle([x, 300 - h, x + w - 1, 301], outline=hexc('#2c3f88'))
        for yy in range(300 - h + 4, 296, 16):
            d.rectangle([x + 4, yy, x + w - 5, yy + 12], outline=hexc('#24346e')); rect(mid, x + w // 2 - 4, yy + 5, 8, 2, '#3f58b0')
            if r.random() < .12: rect(mid, x + 5, yy + 1, w - 10, 11, '#28408c')
    near = new(W, H)
    for i in range(7):  # pipes & cables
        x = int(i * W / 7 + 15); y = r.randrange(30, 90)
        for a in range(0, 300): rect(near, x, a, 5, 1, '#16204c') if a > y else None
        rect(near, x, y, 5, 300, '#18244f'); rect(near, x + 1, y, 1, 300, '#34489a'); rect(near, x - 2, y + 40, 9, 5, '#24346e'); rect(near, x - 2, y + 180, 9, 5, '#24346e')
        rect(near, x, y, W // 7 + 5 if i % 2 else 30, 5, '#18244f'); rect(near, x, y + 1, W // 7 if i % 2 else 28, 1, '#34489a')
    return dict(sky=sk, far=far, mid=mid, near=near)


def tower():
    far = mountains(91, 220, 40, MT_FAR, SNOW, 190, haze='#d8e6ee')
    wl = new(W, H); r = random.Random(5)
    for i, x in enumerate((0, 170, 341)):  # pillars between open arches
        for k in range(40): rect(wl, (x + k) % W, 0, 1, H, ['#8a7460', '#b59c7c', '#cbb593', '#d8c4a2', '#cbb593', '#b59c7c', '#9c8468', '#846c56'][k // 5])
        for yy in range(0, 300, 14): rect(wl, x, yy, 40, 1, '#8a7460')
        for yy in (30, 250): rect(wl, x - 4 if x else 0, yy, 46, 8, '#e0b04c'); rect(wl, x - 4 if x else 0, yy, 46, 2, '#fff0b4'); rect(wl, x - 4 if x else 0, yy + 7, 46, 1, '#7a5420')
    for i, (x, y, rad) in enumerate(((60, 60, 34), (128, 30, 20), (250, 150, 28), (400, 70, 40), (460, 140, 22), (230, 220, 18))): wrap(wl, gear(rad, 12, ['#6a5238', '#927448', '#b8965c', '#dcc088']), x - rad, y - rad)
    near = new(W, H)
    for x in (70, 300):  # printing press silhouettes
        for yy in (110, 146, 182):
            for k in range(26): rect(near, x, yy + k, 110, 1, ['#4a3c38', '#6a5548', '#8a7058', '#a08666', '#8a7058', '#6a5548', '#4a3c38'][k * 7 // 26])
            rect(near, x - 8, yy + 8, 8, 10, '#4a3c38'); rect(near, x + 110, yy + 8, 8, 10, '#4a3c38')
        rect(near, x + 14, 96, 70, 16, '#efe6cc'); rect(near, x + 14, 206, 70, 94, '#efe6cc')
        for yy in range(214, 296, 6): rect(near, x + 20, yy, 40 + (yy * 7) % 18, 2, '#b5a98c')
        rect(near, x - 14, 92, 8, 208, '#5a4638'); rect(near, x + 116, 92, 8, 208, '#5a4638'); rect(near, x - 14, 92, 2, 208, '#8a6c50')
    near = tint(near, '#c8b48c', .35)
    return dict(sky=sky(['#4a8fd8', '#7ab8ee', '#b4def6', '#e8f2e4', '#fdf0cf']), far=far, clouds=clouds(['#bcd4ec', '#dcebf8', '#f8fcff', '#ffffff'], 6, 6, 60, 220), mid=wl, near=near)


def coinpile(w, h, seed, dk=0):
    im = new(w, h); r = random.Random(seed); c = ['#8a5414', '#c08526', '#f0bc42', '#fff0a0']
    c = [lerp(k, '#0f2b2b', dk) for k in c]
    for i in range(w * h // 18):
        x = r.gauss(w / 2, w * .22); t = abs(x - w / 2) / (w / 2); y = h - r.random() * h * max(0, 1 - t) ** .8
        if 2 < x < w - 8 and y < h - 2: rect(im, int(x), int(y), 6, 3, c[1]); rect(im, int(x) + 1, int(y), 4, 1, c[3] if r.random() < .5 else c[2]); rect(im, int(x), int(y) + 3, 6, 1, c[0])
    return im


def treasury():
    wl = wallpaper(['#0f302e', '#164640', '#1c544a'], 3, 20, 20); v = mountain_view(['#3a5a9c', '#6a9ccc', '#f0d8a0', '#fff0c8'], 77)
    for x in (40, 300): arch_window(wl, x, 26, 70, 120, v, ['#0c2422', '#163c38', '#c08526', '#f8d86c'])
    mid = new(W, H)
    for x in (0, 128, 256, 384):
        for k in range(22): rect(mid, x + k, 0, 1, H, ['#0f2f2c', '#1a4a42', '#276458', '#35806c', '#276458', '#1a4a42', '#0f2f2c'][k * 7 // 22])
        for yy in (20, 28, 270): rect(mid, x - 3 if x else 0, yy, 28, 5, '#c08526'); rect(mid, x - 3 if x else 0, yy, 28, 1, '#fff0a0')
    for x in (60, 316): vault(mid, x + 10, 170, 52)
    near = new(W, H)
    for i in range(6): wrap(near, coinpile(110, 40 + (i * 17) % 34, i, .25), int(i * W / 6) - 12, 300 - (40 + (i * 17) % 34))
    sk = new(480, H); rect(sk, 0, 0, 480, H, '#0f302e')
    return dict(sky=sk, far=wl, mid=mid, near=near)


def vault(im, x, y, r, c=('#3a4a50', '#5a6c70', '#84979a', '#b8cacb')):
    c = [lerp(k, '#164640', .3) for k in c]
    t = new(r * 2 + 2, r * 2 + 2); ball(t, r, r, r, r, [c[0], c[1], c[2], c[3]]); paste(im, outline(t), x, y - r)
    d = ImageDraw.Draw(im); cx, cy = x + r, y
    for rr, cc in ((r - 8, c[0]), (r - 10, c[3])): d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=hexc(cc), width=2)
    for i in range(12):
        a = i * math.pi / 6; rect(im, int(cx + math.cos(a) * (r - 5)) - 1, int(cy + math.sin(a) * (r - 5)) - 1, 3, 3, '#e0b04c')
    for i in range(6):
        a = i * math.pi / 3; line(im, cx, cy, cx + math.cos(a) * r * .5, cy + math.sin(a) * r * .5, '#b88a34', 3); rect(im, int(cx + math.cos(a) * r * .5) - 2, int(cy + math.sin(a) * r * .5) - 2, 5, 5, '#e8c05c')
    ball(im, cx, cy, 7, 7, ['#7a5420', '#c08526', '#f8d86c'])


def office():
    sk = vgrad(480, H, ['#3a3f5c', '#565c7c', '#7c8098', '#a8a4a8']); far = new(W, H); r = random.Random(8)
    for i in range(10):  # endless tower blocks of identical offices
        w = r.choice((38, 46, 54)); h = r.randrange(150, 280); x = int(i * W / 10); b = new(w, h); rect(b, 0, 0, w, h, '#4f5470'); rect(b, 0, 0, 2, h, '#6a7090')
        for yy in range(5, h, 11):
            for xx in range(5, w - 5, 9):
                on = r.random() < .4; rect(b, xx, yy, 6, 7, '#f0dca0' if on else '#3a3f58'); on and rect(b, xx + 1, yy + 4, 3, 3, '#8a8468')
        wrap(far, b, x, 300 - h)
    mid = new(W, H)
    for x in range(0, W, 64):  # cabinet wall
        h = [120, 150, 96, 138, 110, 160, 128, 100][x // 64]; b = new(52, h); rect(b, 0, 0, 52, h, '#7a8096'); rect(b, 0, 0, 2, h, '#a4aabc'); rect(b, 50, 0, 2, h, '#545a70')
        for yy in range(3, h - 8, 20):
            rect(b, 4, yy, 44, 17, '#868ca2'); rect(b, 4, yy, 44, 1, '#b4bac8'); rect(b, 4, yy + 16, 44, 1, '#545a70'); rect(b, 19, yy + 9, 14, 3, '#464c62'); rect(b, 17, yy + 3, 18, 4, '#ece4cc')
            if r.random() < .25: rect(b, 10 + r.randrange(10), yy - 3, 18, 4, '#f4ead0')
        wrap(mid, outline(b), x, 300 - h)
    near = new(W, H)
    for i, x in enumerate((30, 200, 360)):  # floating doors
        b = new(34, 58); y = [70, 120, 50][i]; rect(b, 1, 1, 32, 56, '#6a4434'); rect(b, 4, 4, 26, 52, '#8f5f44'); rect(b, 4, 4, 26, 1, '#c08a60')
        for yy in (8, 32): rect(b, 8, yy, 18, 19, '#7a4f38'); rect(b, 8, yy, 18, 1, '#5a3828'); rect(b, 8, yy + 18, 18, 1, '#b07c58')
        rect(b, 26, 30, 3, 3, '#f0c860'); rect(b, 11, 11, 12, 6, '#efe6cc'); text(b, ['404', '7B', '???'][i], 12, 12, '#5a3828'); wrap(near, tint(outline(b), '#7c8098', .25), x, y)
    for i in range(9):
        x = int(i * W / 9); s = new(22, 16); rect(s, 1, 1, 18, 12, '#f4ead0'); [rect(s, 3, yy, 13 - yy % 5, 1, '#a89c88') for yy in (3, 5, 7, 9)]; wrap(near, tint(outline(s), '#7c8098', .25), x, 20 + (i * 83) % 200)
    return dict(sky=sk, far=far, mid=mid, near=near)


def sunset():
    far = mountains(5, 180, 50, ['#6a4a88', '#8a5a94', '#b8709a', '#e89a98'], ['#c88ab0', '#f0b0a8', '#ffd8b0', '#fff0cf'], 145, haze='#f0a890')
    mid = mountains(21, 222, 26, ['#4a3468', '#5f3f74', '#7c4c7c', '#a0607c'], haze='#8a5078')
    near = bush_row(8, 276, ['#1f2444', '#2f3456', '#4a4464', '#6a5470', '#94686c'], 24, 9, 20)
    for i, (x, w) in enumerate(((20, 48), (190, 56), (330, 44))): wrap(near, tree(w, int(w * 1.5), ['#1f2444', '#2f3456', '#4a4464', '#6a5470', '#a8786c'], 90 + i), x, 290 - int(w * 1.5))
    return dict(sky=sky(['#2f2a6a', '#6a3f8c', '#c85a88', '#ff9a6a', '#ffd88a', '#fff2c0'], (330, 170, 22, '#fff0b0', '#ffd890')), far=far, clouds=clouds(['#a8507c', '#e07a80', '#ffb488', '#ffe0a8'], 3, 7, 20, 120), mid=mid, near=near)


ALL = dict(campus=campus, library=library, water=water, garden=garden, archive=archive, tower=tower, treasury=treasury, office=office, sunset=sunset)

if __name__ == '__main__':
    import sys
    out = Image.new('RGBA', (480 * 3 + 20, 310 * 3)); i = 0
    for n, f in ALL.items():
        L = f(); im = L['sky'].convert('RGBA')
        for k in ('far', 'clouds', 'mid', 'near'):
            if k in L: im.alpha_composite(L[k].crop((0, 0, 480, 300)))
        out.paste(im, ((i % 3) * 490, (i // 3) * 310)); i += 1
    out.save(sys.argv[1])
