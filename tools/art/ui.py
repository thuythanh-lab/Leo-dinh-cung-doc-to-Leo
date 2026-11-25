"""HUD, achievement icons, panels, world map, notebook, title mountain."""
from px import *
import bg, things, chars
import math, random


def frame_icon(im, c=('#3a2f5c', '#5a4a8c', '#8070b8')):
    o = new(36, 36); rect(o, 1, 1, 34, 34, '#c08526'); rect(o, 1, 1, 34, 1, '#fff0a0'); rect(o, 1, 34, 34, 1, '#7a4c12'); g = vgrad(30, 30, [c[2], c[1], c[0]]); paste(o, g, 3, 3); paste(o, im, 18 - im.width // 2, 18 - im.height // 2)
    for x, y in ((1, 1), (34, 1), (1, 34), (34, 34)): o.putpixel((x, y), (0, 0, 0, 0))
    return outline(o)


def fit(im, w, h):
    b = im.getbbox(); im = im.crop(b); k = min(1, w / im.width, h / im.height)
    return im if k == 1 else im.resize((max(1, int(im.width * k)), max(1, int(im.height * k))), 0)


def icons(T, C):
    I = {}
    half = lambda n, f=0: C[n][f].crop((0, 2, 32, 30))
    a = new(30, 30); paste(a, half('ra_wave'), -2, 4); paste(a, T['spark'][2], 18, 1); paste(a, T['paper'][0], 1, 14); I['ra'] = (a, ('#2a4a2c', '#3f7040', '#74a860'))
    a = new(30, 30); paste(a, C['margreet'][0].crop((10, 5, 40, 35)), 0, 0); I['margreet'] = (a, ('#143a5a', '#1f5c8c', '#58a5d8'))
    a = new(30, 30); paste(a, C['donna'][0].crop((10, 5, 40, 35)), 0, 0); I['donna'] = (a, ('#2a4a2c', '#4a7a3c', '#a8c860'))
    a = new(30, 30); paste(a, C['star'][0].crop((10, 5, 40, 35)), 0, 0); I['star'] = (a, ('#1c1a48', '#2f2a70', '#5a4da8'))
    a = new(30, 30); p = things.sheet_paper(18, 23, True, '#fffaf0'); paste(a, outline(things.pad(p, 22, 27, 2, 2)), 2, 2); rect(a, 6, 6, 12, 5, '#3a6ea8'); text(a, 'Q1', 9, 6, '#fff'); ball(a, 22, 22, 6, 6, ['#8a5414', '#f0bc42', '#fff6c0']); text(a, '1', 21, 20, '#7a4c12'); I['q1'] = (a, ('#5a2430', '#8f3848', '#d07060'))
    a = new(30, 30); paste(a, T['coinpile'][0].resize((32, 13), 0), -1, 16); ball(a, 15, 10, 8, 8, ['#8a5414', '#e0a83c', '#fff0a0']); text(a, '$', 14, 8, '#7a4c12'); I['fund'] = (outline(a), ('#143a35', '#1f5a4c', '#3f9272'))
    a = new(30, 30); paste(a, fit(T['letter_ok'][0], 30, 24), -1, 4); paste(a, fit(T['stamp_red'][0], 14, 17), 16, 0); I['letter'] = (a, ('#6a3a24', '#a8683c', '#e8b060'))
    a = new(30, 30); [paste(a, half('ra_run', k).crop((6, 0, 27, 28)), x, 3) for k, x in ((0, -5), (2, 3), (4, 12))]; I['delegator'] = (a, ('#2f2a5c', '#4a3f8c', '#7c6cc4'))
    a = new(30, 30); [paste(a, T['coffee'][0], x, y) for x, y in ((0, 8), (12, 8), (6, -2))]; I['caffeine'] = (a, ('#4a2818', '#7a4428', '#b87a44'))
    a = new(30, 30); paste(a, fit(T['rabbithole'][0], 28, 24), 1, 6); ball(a, 15, 16, 4, 4, ['#b8b4c0', '#fff']); rect(a, 12, 6, 2, 7, '#f0ecf4'); rect(a, 16, 6, 2, 7, '#f0ecf4'); rect(a, 13, 15, 1, 1, INK); rect(a, 16, 15, 1, 1, INK); I['rabbit'] = (outline(a), ('#2a1d3a', '#43325a', '#75587a'))
    a = new(30, 30); gh = new(22, 24); ball(gh, 11, 10, 9, 9, ['#c8c4e0', '#f0ecff', '#fff']); rect(gh, 2, 10, 18, 11, '#e8e4f8'); [rect(gh, x, 20, 3, 3, '#e8e4f8') for x in (2, 8, 14)]; rect(gh, 7, 8, 3, 4, INK); rect(gh, 13, 8, 3, 4, INK); rect(gh, 9, 15, 5, 2, INK); paste(a, outline(gh), 0, 2); paste(a, fit(T['letter'][0], 16, 14), 14, 15); I['ghosted'] = (a, ('#3a2030', '#6a3048', '#a85060'))
    a = new(30, 30); ball(a, 13, 17, 10, 9, ['#a04a68', '#e88aa8', '#ffd0dc']); rect(a, 5, 24, 4, 4, '#c8688a'); rect(a, 16, 24, 4, 4, '#c8688a'); rect(a, 20, 15, 4, 5, '#ffb0c4'); rect(a, 16, 12, 2, 2, INK); ball(a, 13, 4, 4, 4, ['#8a5414', '#f0bc42', '#fff6c0']); rect(a, 10, 9, 6, 1, '#7a2f48'); I['uncooked'] = (outline(a), ('#1f4a5a', '#2f7080', '#6ab8b0'))
    a = new(30, 30); paste(a, half('leo_celebrate', 2), -1, 3); paste(a, T['star'][0], 18, 14); I['productive'] = (a, ('#6a4a14', '#b8862c', '#f8d86c'))
    a = new(30, 30); paste(a, fit(T['buffet'][0], 30, 18), 0, 13); paste(a, T['food_0'][0], -1, 1); paste(a, T['food_1'][0], 10, 1); I['buffet'] = (a, ('#4a2440', '#7a3c64', '#b870a0'))
    out = {'icon_' + k: [frame_icon(im, c)] for k, (im, c) in I.items()}
    a = new(30, 30); rect(a, 9, 14, 13, 11, '#5a5470'); rect(a, 9, 14, 13, 1, '#8a84a0'); d = ImageDraw.Draw(a); d.arc([10, 5, 20, 21], 180, 360, fill=hexc('#8a84a0'), width=2); text(a, '?', 14, 17, '#1c1428'); out['icon_locked'] = [frame_icon(outline(a), ('#1c1a28', '#2c2a3c', '#3c3a50'))]
    return out


def hud(T, C):
    S = {}; h = [".hh...hh.", "hHHh.hhhh", "hHHhhhhhh", "hHhhhhhhd", "hhhhhhhdd", ".hhhhhdd.", "..hhhdd..", "...hdd...", "....d...."]
    S['heart'] = [outline(things.pad(art(h, dict(h='#e8404e', H='#ffb0a8', d='#a8202e')), 13, 13, 2, 2)), outline(things.pad(art(h, dict(h='#4a4660', H='#5c5874', d='#36324a')), 13, 13, 2, 2))]
    im = new(30, 30); ball(im, 15, 15, 14, 14, ['#1f1c34', '#2f2a50', '#4a4278']); ImageDraw.Draw(im).ellipse([1, 1, 28, 28], outline=hexc('#c08526'), width=2); paste(im, C['face_ra'][0].crop((3, 2, 23, 22)), 5, 5); S['hud_ra'] = [outline(im)]
    S['hud_coffee'] = [T['coffee'][0]]
    for n in ('left', 'right', 'jump', 'cast', 'ra', 'down', 'pause', 'full', 'up'):
        im = new(48, 48); ball(im, 24, 24, 22, 22, ['#1f1c34', '#37315c', '#5a5090']); ImageDraw.Draw(im).ellipse([2, 2, 45, 45], outline=hexc('#f0d890'), width=2)
        P = dict(left=[(30, 12), (14, 24), (30, 36)], right=[(18, 12), (34, 24), (18, 36)], jump=[(12, 30), (24, 12), (36, 30)], up=[(12, 30), (24, 12), (36, 30)], down=[(12, 18), (24, 36), (36, 18)]).get(n)
        if P: poly(im, P, '#fff6d8')
        if n == 'jump': rect(im, 19, 28, 11, 8, '#fff6d8')
        if n == 'cast': line(im, 12, 36, 28, 18, '#f0c44c', 4); line(im, 28, 18, 33, 13, '#fffaf0', 3); paste(im, T['spark'][2], 28, 6)
        if n == 'ra': paste(im, C['face_ra'][0], 12, 11)
        if n == 'pause': rect(im, 16, 14, 6, 20, '#fff6d8'); rect(im, 26, 14, 6, 20, '#fff6d8')
        if n == 'full': [rect(im, x, y, 8, 3, '#fff6d8') for x, y in ((13, 14), (27, 14), (13, 31), (27, 31))]; [rect(im, x, y, 3, 8, '#fff6d8') for x, y in ((13, 14), (32, 14), (13, 26), (32, 26))]
        S['btn_' + n] = [outline(im)]
    # nine-slice panels (48x48, 12px corners)
    def panel(c, edge, hi, deco):
        im = new(48, 48); rect(im, 2, 2, 44, 44, edge); rect(im, 3, 3, 42, 42, hi); rect(im, 4, 4, 40, 40, edge); rect(im, 5, 5, 38, 38, c)
        for x, y in ((2, 2), (41, 2), (2, 41), (41, 41)): rect(im, x, y, 5, 5, deco); rect(im, x + 1, y + 1, 2, 2, '#fff6d0')
        return outline(im)
    S['panel_dark'] = [panel('#221c38', '#8a5c1c', '#f0c44c', '#e0a83c')]; S['panel_paper'] = [panel('#f4e8cc', '#6b3f24', '#b8834a', '#8a5430')]; S['panel_btn'] = [panel('#3a2f5c', '#5a4a8c', '#a08ee0', '#8070b8')]; S['panel_hot'] = [panel('#7a4c9c', '#c08526', '#fff0a0', '#f8d86c')]
    for k, (c1, c2) in {'node_open': ('#e8b43c', '#fff0a0'), 'node_done': ('#4fc86a', '#d0ffc0'), 'node_lock': ('#4a4660', '#8a84a0')}.items():
        im = new(26, 18); ball(im, 13, 10, 11, 7, [shade(c1, -.5), c1, c2]); ell(im, 6, 5, 14, 8, shade(c1, -.2)); ell(im, 8, 6, 10, 5, c2); S[k] = [outline(im)]
    im = new(20, 26); rect(im, 4, 2, 2, 24, '#6b3f24'); poly(im, [(6, 2), (18, 6), (6, 11)], '#d0424a'); poly(im, [(6, 2), (18, 6), (6, 5)], '#ff8a80'); S['flag'] = [outline(im)]
    return S


def bigmountain(w, h, peaks, seed, ramp, snow, snowline, base):
    """Massif from a list of (x, y, slope) peaks, faceted."""
    im = new(w, h); p = im.load(); n1 = bg.ridge(seed, 0, 1, (2, 3, 5, 9, 17, 31, 53), w=w, rough=.66); n2 = bg.ridge(seed + 2, 0, 1, (5, 9, 17, 29, 47, 67), w=w, rough=.7); r = random.Random(seed)
    for x in range(w):
        top = h; own = None
        for pk in peaks:
            y = pk[1] + abs(x - pk[0]) * pk[2] + n1[x] * 9 + n2[x] * 3
            if y < top: top = y; own = pk
        if own is None: continue
        for y in range(max(0, int(top)), h):
            d = y - top; ridge_x = own[0] + math.sin(d * .06 + own[0]) * (6 + d * .06) + math.sin(d * .21) * 3
            left = x < ridge_x
            v = (.68 if left else .24) + math.sin((x * .9 + d * 1.3) * .085 + n2[x] * 1.6) * .16 + n1[(x + int(d)) % w] * .05
            vein = math.sin((x - own[0]) * .24 + d * (.11 if left else -.11) + n1[x] * 2)
            if vein > .86: v += .16
            if vein < -.9: v -= .14
            c = ramp_at(ramp, v, x, y)
            if y < snowline + math.sin(x * .23) * 9 + n2[x] * 12 - d * .12 + (14 if vein > .5 else 0): c = ramp_at(snow, v + .12, x, y)
            k = max(0, min(1, (y - base + 60) / 110)); c = lerp(c, '#8fb8b4', k * .75)
            p[x, y] = c
    return im


MT = ['#3f4f86', '#546a9e', '#7488b4', '#9cb0cc']; SN = ['#a9bce0', '#d0dff2', '#f4f9ff', '#ffffff']


def title_mountain():
    """480x300 foreground-less range; summit is left for clouds to cover."""
    im = bigmountain(480, 300, [(340, 18, .92), (230, 96, .8), (440, 84, .85), (120, 150, .62), (20, 168, .5)], 12, MT, SN, 118, 250)
    hills = bg.mountains(31, 250, 16, ['#3f7a64', '#4f8f68', '#6aa870', '#9ac888'], w=480, haze='#7fb87c', rough=.5); paste(im, hills, 0, 0)
    pts = [(60, 296), (130, 284), (96, 270), (180, 258), (150, 246), (236, 236), (214, 222), (276, 206), (258, 190), (304, 172), (288, 156), (322, 138), (312, 122), (336, 104)]
    for i in range(len(pts) - 1):
        (a, b), (c, d) = pts[i], pts[i + 1]; n = int(math.hypot(c - a, d - b))
        wd = max(1, int(5 - i * .33))
        for t in range(n):
            x = a + (c - a) * t / n; y = b + (d - b) * t / n + math.sin(t / n * 3.14) * 3
            rect(im, int(x), int(y), wd + 2, max(1, wd // 2 + 1), '#e8d0a0' if i % 2 else '#d8bc88'); rect(im, int(x), int(y) + max(1, wd // 2 + 1), wd + 2, 1, hexc('#7a6448', 255))
    return im


def title_town():
    im = new(480, 300)
    specs = [(4, 70, 74, 0, 1), (78, 24, 112, 1, 2), (106, 84, 60, 0, 3), (196, 22, 92, 1, 4), (372, 26, 126, 1, 6), (402, 80, 70, 0, 7), (340, 34, 58, 0, 8)]
    for x, w, h, t, s in specs:
        a, b = (bg.WALL_A, bg.ROOF_A) if s % 2 else (bg.WALL_B, bg.ROOF_B); bd = bg.building(w, h, a, b, s, bool(t)); paste(im, bd, x, 292 - bd.height)
    f = bg.bush_row(8, 276, bg.LEAF, 22, 8, 16).crop((0, 0, 480, 300))
    for i, (x, w) in enumerate(((58, 44), (176, 50), (318, 46), (446, 50))): paste(im, bg.tree(w, int(w * 1.5), bg.LEAF, 60 + i), x, 290 - int(w * 1.5))
    paste(im, f, 0, 0); return im


NODES = [(58, 226), (136, 196), (212, 208), (278, 164), (352, 146)]


def worldmap():
    im = bg.sky(['#3f7fd0', '#6aa8e8', '#a8d4f4', '#e8f2e4'], None, 0, 480, 270); paste(im, bg.mountains(5, 120, 30, bg.MT_FAR, bg.SNOW, 96, w=480, h=270, haze='#c9e2ee'), 0, 0)
    m = bigmountain(480, 270, [(440, -30, .78), (330, 66, .62), (210, 110, .5), (90, 150, .42)], 22, MT, SN, 60, 230); paste(im, m, 0, 0)
    g = bg.mountains(63, 216, 11, ['#3f7a4c', '#4f9450', '#70b060', '#a4d07c'], w=480, h=270, rough=.5); paste(im, g, 0, 0)
    P = [(20, 252)] + NODES + [(428, 112), (446, 54)]
    for i in range(len(P) - 1):
        (a, b), (c, d) = P[i], P[i + 1]; n = int(math.hypot(c - a, d - b)); col = '#f0d8a4' if i < 5 else '#8a90b0'
        for t in range(n):
            x = a + (c - a) * t / n; y = b + (d - b) * t / n + math.sin(t / n * 6.28) * 7
            if i >= 5 and t % 8 > 4: continue
            rect(im, int(x) - 2, int(y) - 1, 5, 3, col); rect(im, int(x) - 2, int(y) + 2, 5, 1, '#7a6448' if i < 5 else '#5a6088')

    def small(b, k): return b.resize((max(1, int(b.width * k)), max(1, int(b.height * k))), Image.NEAREST)
    B = bg.building
    for x, w, h, t, s in ((10, 26, 30, 0, 1), (38, 13, 44, 1, 2), (66, 30, 26, 0, 3)): b = B(w, h, bg.WALL_A if s % 2 else bg.WALL_B, bg.ROOF_A if s % 2 else bg.ROOF_B, s, bool(t)); paste(im, b, x, 214 - b.height)
    b = B(44, 34, ['#4a3550', '#6f5580', '#86689a', '#b598c8'], ['#5a3420', '#8f5a30', '#c98f4a', '#f2c878'], 4); paste(im, b, 112, 188 - b.height); b = B(14, 52, ['#4a3550', '#6f5580', '#86689a', '#b598c8'], ['#5a3420', '#8f5a30', '#c98f4a', '#f2c878'], 5, True); paste(im, b, 150, 188 - b.height)
    b = B(24, 78, bg.WALL_B, ['#8f6428', '#c9953c', '#f0c860', '#fff0b4'], 7, True); paste(im, b, 198, 202 - b.height); paste(im, bg.gear(9, 9, ['#6a5238', '#927448', '#b8965c', '#dcc088']), 190, 168)
    b = B(44, 30, ['#143a35', '#27705a', '#3f9272', '#8fd0a8'], ['#9a6418', '#d89a28', '#f8cf4c', '#fff3a8'], 8); paste(im, b, 254, 156 - b.height); paste(im, things.coinpile(24, 10, 3), 296, 150)
    for k, (x, h) in enumerate(((318, 40), (334, 54), (352, 36), (368, 46))): b = B(16, h, ['#565a6e', '#8a8f9f', '#a4a8b8', '#c8ccd8'], ['#3a2430', '#5c2434', '#8f3848', '#bf5560'], k, False, arched=False); paste(im, b, x, 140 - b.height)
    for i, (x, y, w) in enumerate(((90, 230, 22), (168, 224, 26), (236, 226, 24), (300, 222, 20), (20, 262, 26), (120, 258, 28), (262, 250, 26), (340, 240, 22), (410, 236, 24), (450, 250, 28))): paste(im, bg.tree(w, int(w * 1.4), bg.LEAF, i + 3), x, y - int(w * 1.4) + 6)
    # future silhouettes
    sil = new(480, 270)
    for x, y, w in ((406, 98, 12), (421, 94, 15), (440, 97, 12)): poly(sil, [(x - 2, y), (x + w // 2, y - 8), (x + w + 2, y)], '#3a4274'); rect(sil, x, y, w, 9, '#3a4274')
    for k in range(4): ImageDraw.Draw(sil).arc([400 + k * 4, 104 + k * 5, 458 - k * 2, 130 + k * 4], 10, 170, fill=hexc('#4a5488'))
    rect(sil, 430, 30, 34, 14, '#465088'); poly(sil, [(426, 30), (447, 18), (468, 30)], '#465088'); [rect(sil, x, 32, 3, 12, '#5a649c') for x in (433, 441, 449, 457)]
    paste(im, sil, 0, 0)
    rect(im, 0, 262, 480, 8, '#3f7a4c')
    return im.crop((0, 0, 480, 270))


def fieldscape():
    """Unexplored fieldwork country at sunset: terraced hills, stilt houses, a winding trail."""
    w, h = 420, 170; im = new(w, h); R = random.Random(8)
    for k, (cx, top, wd, ramp) in enumerate(((330, 20, 190, ['#5a3a6c', '#6f4678', '#8a5684', '#a86c8c']), (120, 48, 170, ['#4a3a68', '#5c4672', '#7a587c', '#9a7084']), (250, 80, 260, ['#3c3a5c', '#4c4a64', '#66606c', '#8a7c74']))):
        for x in range(w):
            y0 = top + ((x - cx) / wd) ** 2 * 90 + math.sin(x * .05 + k) * 4
            if y0 < 8: y0 = 8
            for y in range(int(y0), h):
                d = y - y0; band = int((d + math.sin(x * .04 + k * 2) * 5) // 9); ed = (d + math.sin(x * .04 + k * 2) * 5) % 9
                im.putpixel((x, y), hexc('#ffc890' if ed < 1 and band > 0 and bayer(x, y) < .8 else ramp[3] if ed < 2.5 else ramp[2] if band % 2 else ramp[1] if ed < 7 else ramp[0]))
    pts = [(0, 166), (70, 156), (40, 142), (130, 130), (190, 112), (150, 98), (250, 80), (330, 60), (300, 44), (360, 24)]
    for i in range(len(pts) - 1):
        (a, b), (c, d) = pts[i], pts[i + 1]; n = int(math.hypot(c - a, d - b))
        for t in range(n): rect(im, int(a + (c - a) * t / n), int(b + (d - b) * t / n + math.sin(t / n * 3.14) * 4), max(2, 5 - i // 2), max(1, 3 - i // 3), '#ffe0b0' if i % 2 else '#f0c898')
    for x, y, s in ((96, 104, 1), (220, 70, 0), (206, 126, 1), (318, 100, 1), (286, 34, 0), (360, 72, 0)):
        k = 1 if s else 0; poly(im, [(x - 3, y), (x + 8 + k * 3, y - 9 - k * 2), (x + 19 + k * 6, y)], '#3a2a48'); rect(im, x, y, 16 + k * 6, 8, '#5c3f50'); rect(im, x + 5, y + 2, 4, 4, '#ffd978'); [rect(im, xx, y + 8, 2, 5, '#3a2a48') for xx in (x + 1, x + 13 + k * 6)]
    for i in range(9): x = R.randrange(10, 400); paste(im, tint(bg.tree(26, 38, bg.LEAF_D, i), '#5a3a6c', .45), x, 120 + R.randrange(0, 10))
    return im


def notebook():
    im = new(480, 270); w = vgrad(480, 270, ['#4a2c22', '#3d2216', '#2c1a14']); paste(im, w, 0, 0)
    for y in range(0, 270, 18):
        rect(im, 0, y, 480, 1, '#2a1810')
        for x in range((y * 7) % 60, 480, 97): rect(im, x, y + 5, 30, 1, '#55331f')
    rect(im, 14, 8, 452, 254, '#5a1f2a'); rect(im, 16, 10, 448, 250, '#8f3848'); rect(im, 16, 10, 448, 2, '#c8606a')
    for x in (18, 452): rect(im, x, 12, 10, 10, '#e0b04c'); rect(im, x, 248, 10, 10, '#e0b04c')
    for k in range(3): rect(im, 24 + k, 15 + k, 432 - 2 * k, 240 - k, ['#b8a27c', '#d8c49a', '#f4e8cc'][k])
    for y in range(44, 250, 12): rect(im, 32, y, 196, 1, '#e4d2ac'); rect(im, 252, y, 196, 1, '#e4d2ac')
    for d, c in ((0, '#8a744c'), (1, '#b8a27c'), (2, '#d8c49a'), (4, '#e8d8b4')): rect(im, 240 - d - 1, 16, 1, 238, c); rect(im, 240 + d, 16, 1, 238, c)
    rect(im, 44, 18, 1, 234, '#e0a0a0'); r = random.Random(5)
    for _ in range(90): x, y = r.randrange(28, 450), r.randrange(18, 250); im.putpixel((x, y), hexc('#dcc8a0'))
    d = ImageDraw.Draw(im); d.ellipse([396, 214, 430, 246], outline=hexc('#d8bc8c'), width=2)  # coffee ring
    poly(im, [(430, 8), (444, 8), (444, 40), (437, 34), (430, 40)], '#2f9c95'); poly(im, [(430, 8), (433, 8), (433, 38), (430, 40)], '#1f6d6b')
    return im


def sway(t):
    out = []
    for s in (0, 1, 1, 0, -1, -1):
        o = new(t.width, t.height); cut = int(t.height * .6)
        o.alpha_composite(t.crop((0, cut, t.width, t.height)), (0, cut)); up = t.crop((0, 0, t.width, cut)); paste(o, up, s, 0); out.append(o)
    return out


def trees():
    S = {}
    for i, w in enumerate((56, 72, 46)): S[f'tree_{i}'] = sway(bg.tree(w, int(w * 1.5), bg.LEAF, 80 + i))
    S['tree_p'] = sway(bg.tree(60, 92, ['#4a2f6a', '#7a3f8c', '#b058a8', '#e080c0', '#ffc0e0'], 91))
    for i, (cap, w, h) in enumerate(((['#8a2f78', '#c04a90', '#f078b0', '#ffc0dc'], 52, 70), (['#1f5c6b', '#2f8a98', '#58c0c0', '#c0fff0'], 70, 96), (['#b06a24', '#e09a3c', '#ffd06a', '#fff0b8'], 34, 40))): S[f'shroom_{i}'] = [bg.mushroom(w, h, cap, ['#6a5a98', '#8f80bc', '#beb0e0', '#e8dcff'], i)]
    return S
