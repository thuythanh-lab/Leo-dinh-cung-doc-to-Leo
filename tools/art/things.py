"""Props, pickups, enemies, obstacles, bosses, FX."""
from px import *
from bg import gear, wheel, mushroom, shelf, WOOD, vault, building, WALL_A, ROOF_A, WALL_B, ROOF_B, coinpile
import math, random
RED = '#c23a3a'; PAPER = '#f6eed8'; PAPER2 = '#d9ccaa'; INKL = '#8a7f9a'


def sheet_paper(w, h, lines=True, c=PAPER):
    im = new(w, h); rect(im, 0, 0, w, h, c); rect(im, 0, h - 1, w, 1, PAPER2); rect(im, w - 1, 0, 1, h, PAPER2)
    if lines:
        for y in range(3, h - 2, 3): rect(im, 2, y, w - 5 - (y * 5) % 4, 1, INKL)
    return im


def pad(im, w, h, ox=None, oy=None):
    o = new(w, h); paste(o, im, (w - im.width) // 2 if ox is None else ox, h - im.height if oy is None else oy); return o


def items():
    S = {}
    cup = ["..wwwwwwww..", ".wbbBbbbbbw.", ".wwwwwwwwww.", ".wWWwwwwwwvvv", ".wWwwrrwwwv.v", ".wWwrrrrwwv.v", ".wWwwrrwwwvvv", "..wwwwwwwv...", "..vwwwwwvv...", ".ssssssssss..", "..dddddddd..."]
    pal = dict(w='#fbf6ea', W='#ffffff', v='#cfc4b4', b='#5a3018', B='#8a5430', r='#c8484f', s='#e0d4c0', d='#a89880')
    S['coffee'] = []
    for i in range(4):
        im = new(18, 20); paste(im, art(cup, pal), 2, 8 - [0, 1, 1, 0][i])
        for k in range(2):
            for y in range(4): im.putpixel((6 + k * 4 + int(round(math.sin(y * 1.3 + i * 1.57 + k))), 2 + y + (1 - [0, 1, 1, 0][i])), hexc('#ffffff', 210))
        S['coffee'].append(outline(im))
    sp = dict(pal, w='#f8d86c', W='#fff6c0', v='#c08526', s='#f0bc42', d='#9a6418', r='#e2445a'); S['special'] = []
    for i in range(4):
        im = new(22, 24); paste(im, art(cup, sp), 4, 11 - [0, 1, 1, 0][i])
        for k in range(4):
            a = i * .4 + k * 1.57; x, y = 11 + math.cos(a) * 9, 13 + math.sin(a) * 9; rect(im, int(x), int(y), 2, 2, '#fff6c0')
        S['special'].append(outline(im))
    S['machine'] = []
    for i in range(4):
        on = i > 0; im = new(28, 38); rect(im, 3, 4, 22, 32, '#4a4e66'); rect(im, 3, 4, 3, 32, '#7a80a0'); rect(im, 22, 4, 3, 32, '#343850'); rect(im, 1, 34, 26, 3, '#2c3048'); rect(im, 2, 2, 24, 4, '#c8484f'); rect(im, 2, 2, 24, 1, '#f08a7c')
        rect(im, 7, 8, 14, 6, '#8fffc0' if on else '#26304a'); text(im, 'PHD' if not on else ['', 'YES', 'MMM', 'YES'][i], 8, 9, '#1c5a40' if on else '#5a6a90')
        rect(im, 8, 17, 12, 13, '#23263a'); rect(im, 12, 17, 4, 3, '#b8bccc'); rect(im, 11, 25, 6, 5, '#fbf6ea'); rect(im, 11, 25, 6, 1, '#5a3018'); on and rect(im, 13, 20, 2, 5, '#8a5430')
        rect(im, 20, 10, 2, 2, '#6dff9a' if on else '#c23a3a'); rect(im, 7, 31, 14, 2, '#b8bccc')
        if on:
            for y in range(5): im.putpixel((14 + int(round(math.sin(y + i * 2))), 20 - y), hexc('#ffffff', 220))
        S['machine'].append(outline(im))

    def emblem(kind):
        im = new(26, 26); ball(im, 13, 13, 11, 11, ['#8a5a1c', '#c8912c', '#f0c44c', '#fff2b0']); ball(im, 13, 13, 8, 8, {'water': ['#143a6a', '#1f5c9c', '#3a8ad0'], 'ent': ['#1f4a2c', '#2f6f3c', '#4a9a50'], 'infra': ['#2a2068', '#42359a', '#6a5ad0']}[kind])
        if kind == 'water':
            poly(im, [(13, 6), (17, 13), (15, 17), (11, 17), (9, 13)], '#8fe6ff'); rect(im, 11, 12, 2, 3, '#ffffff'); line(im, 7, 19, 19, 19, '#8fe6ff')
        if kind == 'ent':
            for k, c in ((0, '#ff8fc0'), (2.1, '#ffd24a'), (4.2, '#8ff0c0')): ImageDraw.Draw(im).ellipse([13 + math.cos(k) * 3 - 4, 13 + math.sin(k) * 3 - 4, 13 + math.cos(k) * 3 + 4, 13 + math.sin(k) * 3 + 4], outline=hexc(c))
        if kind == 'infra':
            P = [(9, 9), (17, 8), (18, 16), (9, 18), (13, 13)]
            for a in P[:4]: line(im, *a, *P[4], '#c8beff')
            for a in P: rect(im, a[0] - 1, a[1] - 1, 3, 3, '#fff6c0')
        return outline(im)
    for k in ('water', 'ent', 'infra'):
        e = emblem(k); S['emblem_' + k] = [e]
    S['framework'] = []
    for i in range(6):
        im = new(64, 64); a0 = i * math.pi / 9
        d = ImageDraw.Draw(im)
        for r, c in ((29, '#c8912c'), (28, '#fff2b0'), (22, '#8a5a1c')): d.ellipse([32 - r, 32 - r, 32 + r, 32 + r], outline=hexc(c), width=2)
        for k in range(12):
            a = a0 + k * math.pi / 6; rect(im, int(32 + math.cos(a) * 26) - 1, int(32 + math.sin(a) * 26) - 1, 3, 3, '#f0c44c')
        poly(im, [(32, 8), (52, 43), (12, 43)], '#3a2f78'); poly(im, [(32, 14), (47, 40), (17, 40)], '#6a5ad0'); poly(im, [(32, 14), (32, 40), (17, 40)], '#8f80f0')
        ball(im, 32, 32, 8, 8, ['#e0a83c', '#ffe890', '#ffffff'])
        for k, e in enumerate(('water', 'ent', 'infra')):
            a = a0 / 3 * 0 + k * 2.094 - 1.57; paste(im, S['emblem_' + e][0].resize((18, 18), 0), int(32 + math.cos(a) * 21) - 9, int(34 + math.sin(a) * 21) - 9)
        S['framework'].append(outline(im))
    # manuscript page / components / stamps / letter
    S['page'] = []
    for i in range(4):
        im = new(18, 22); w = [13, 9, 5, 9][i]; paste(im, sheet_paper(w, 17), 9 - w // 2, 3); w > 6 and rect(im, 9 - w // 2 + 2, 5, w - 5, 2, '#c8484f'); S['page'].append(outline(im))

    def comp(kind):
        im = new(24, 26)
        if kind == 'proposal':
            rect(im, 4, 3, 16, 20, '#3a6ea8'); rect(im, 4, 3, 2, 20, '#25507e'); paste(im, sheet_paper(12, 15), 7, 5); rect(im, 9, 8, 7, 1, '#3a6ea8'); rect(im, 14, 1, 2, 8, '#f0c44c')
        if kind == 'budget':
            rect(im, 3, 3, 18, 20, '#f6eed8')
            for y in range(3, 23, 4):
                for x in range(3, 21, 6): rect(im, x, y, 5, 3, '#bfe8c0' if (x + y) % 8 else '#ffffff')
            ball(im, 16, 18, 6, 6, ['#8a5414', '#e0a83c', '#fff0a0']); text(im, '$', 15, 16, '#7a4c12')
        if kind == 'just':
            paste(im, sheet_paper(15, 19), 3, 4); ball(im, 17, 18, 5, 5, ['#7a1f2a', '#c8484f', '#f08a7c']); poly(im, [(14, 21), (16, 25), (17, 21)], RED); poly(im, [(18, 21), (20, 25), (21, 21)], RED); text(im, 'WHY', 5, 6, '#5a3a8a')
        return outline(im)
    for k in ('proposal', 'budget', 'just'): S['comp_' + k] = [comp(k)]
    for i, (n, c) in enumerate((('blue', '#3a6ee0'), ('red', '#d0424a'), ('gold', '#e8b43c'))):
        im = new(24, 28); ball(im, 12, 7, 5, 5, [shade(c, -.5), c, shade(c, .5)]); rect(im, 10, 10, 5, 6, shade(c, -.2)); rect(im, 10, 10, 2, 6, shade(c, .3)); rect(im, 4, 16, 17, 5, shade(c, -.1)); rect(im, 4, 16, 17, 1, shade(c, .5)); rect(im, 5, 21, 15, 3, '#2c2038'); rect(im, 5, 24, 15, 1, shade(c, -.4))
        S['stamp_' + n] = [outline(im)]
    im = new(34, 26); paste(im, sheet_paper(28, 20, True, '#fffaf0'), 3, 3); rect(im, 3, 3, 28, 3, '#c8912c'); ball(im, 25, 18, 5, 5, ['#8a1f2a', '#d0424a', '#ff9a8a']); text(im, 'OK', 5, 16, RED); S['letter_ok'] = [outline(im)]
    S['paper'] = [outline(pad(sheet_paper(11, 13), 15, 17, 2, 2))]
    f = new(20, 16); poly(f, [(2, 13), (5, 5), (10, 2), (15, 5), (18, 13), (14, 10), (10, 9), (6, 10)], '#d89a48'); line(f, 5, 6, 8, 10, '#a86a28'); line(f, 10, 3, 10, 8, '#a86a28'); line(f, 15, 6, 12, 10, '#a86a28'); S['food_0'] = [outline(f)]
    f = new(24, 16); ball(f, 12, 9, 10, 5, ['#8a5a24', '#d09a50', '#f0c880']); rect(f, 4, 8, 16, 2, '#6aa84a'); rect(f, 5, 7, 3, 2, '#e8e0f0'); rect(f, 11, 7, 4, 2, '#e8743c'); rect(f, 16, 8, 3, 1, '#c8484f'); S['food_1'] = [outline(f)]
    f = new(18, 18); ball(f, 9, 9, 7, 7, ['#8a5a30', '#c08a50', '#e8bc80']); [rect(f, x, y, 2, 2, '#4a2818') for x, y in ((5, 6), (10, 5), (8, 10), (12, 11), (5, 11))]; S['food_2'] = [outline(f)]
    f = new(18, 18); poly(f, [(9, 2), (16, 14), (2, 14)], '#fbf6ea'); rect(f, 6, 10, 7, 5, '#2f4a3c'); rect(f, 8, 6, 2, 2, '#f08a5c'); S['food_3'] = [outline(f)]
    return S


def blocks():
    S = {}; r = random.Random(2)

    def pile(w, h, seed, face=None, label=None, lc=RED):
        im = new(w, h); q = random.Random(seed); y = h - 3
        while y > 5:
            t = q.choice((3, 4, 5)); o = q.randrange(0, 4); ww = w - 2 - q.randrange(0, 5) - o; c = q.choice([PAPER, '#efe3c4', '#fffaf0', '#e4d4b0'])
            rect(im, 1 + o, y - t + 1, ww, t, c); rect(im, 1 + o, y, ww, 1, '#b8a888')
            if q.random() < .5: rect(im, 1 + o, y - t + 1, ww, 1, '#ffffff')
            if q.random() < .22: rect(im, o + 3, y - t + 1, 6, t, q.choice(['#c8484f', '#3a6ea8', '#4a8f5a', '#e0b23e']))
            if q.random() < .3: rect(im, 1 + o + ww, y - 1, 3, 1, PAPER2)
            y -= t
        im = outline(im)
        if face:
            fx, fy = w // 2, int(h * .38)
            for s in (-7, 3): rect(im, fx + s, fy, 5, 5, '#ffffff'); rect(im, fx + s + 2, fy + 2, 2, 3, '#1c1428'); line(im, fx + s - 1, fy - 2 + (0 if s < 0 else 1), fx + s + 4, fy - 1 + (0 if s < 0 else -2), '#1c1428', 2)
            rect(im, fx - 5, fy + 9, 11, 3, '#5a1f2a'); rect(im, fx - 3, fy + 9, 2, 1, '#fff'); rect(im, fx + 1, fy + 9, 2, 1, '#fff')
        if label:
            wd = twid(label); lx = w // 2 - wd // 2 - 2; ly = int(h * .68); rect(im, lx, ly, wd + 4, 9, '#fffaf0'); rect(im, lx, ly, wd + 4, 1, lc); rect(im, lx, ly + 8, wd + 4, 1, lc); text(im, label, lx + 2, ly + 2, lc)
        return im
    S['barrier_paper'] = [pile(48, 80, 4, True, 'URGENT'), tint(pile(48, 80, 4, True, 'URGENT'), '#fff', .6)]
    S['barrier_admin'] = [pile(32, 64, 9, True, 'FORM 7'), tint(pile(32, 64, 9, True), '#fff', .6)]
    S['barrier_rev'] = [pile(32, 48, 12, False, 'REV 2'), tint(pile(32, 48, 12), '#fff', .6)]
    # stack of books
    im = new(32, 48); q = random.Random(5); y = 46
    while y > 4:
        t = q.choice((4, 5, 6)); o = q.randrange(0, 5); c = q.choice(['#a83a3a', '#3a6ea8', '#4a8f5a', '#d8a83c', '#6f4a86']); rect(im, 1 + o, y - t + 1, 26 - q.randrange(3), t, c); rect(im, 1 + o, y - t + 1, 25, 1, shade(c, .4)); rect(im, 1 + o, y, 25, 1, shade(c, -.4)); rect(im, 5 + o, y - t + 2, 2, t - 2, '#f0d070'); rect(im, 22, y - t + 2, 5, t - 2, '#f4ead0'); y -= t
    S['barrier_books'] = [outline(im), tint(outline(im), '#fff', .6)]
    # official document wall (text is drawn in game, with Vietnamese diacritics)
    for n, c in (('red', '#b02a34'), ('blue', '#2f5ac0'), ('gold', '#b87a1c')):
        im = new(32, 96); rect(im, 0, 0, 32, 96, shade(c, -.5)); q = random.Random(8)
        for yy in range(2, 94, 12):
            for xx in (2, 12, 22):
                pw = 8; rect(im, xx, yy + (xx // 10) % 2 * 2, pw, 9, q.choice(['#f6eed8', '#efe0c4', '#fff6e4'])); [rect(im, xx + 1, yy + 2 + k * 2 + (xx // 10) % 2 * 2, 5, 1, '#b5a0a0') for k in range(3)]
                if q.random() < .6: d = ImageDraw.Draw(im); d.ellipse([xx + 2, yy + 3, xx + 7, yy + 8], outline=hexc(c)); line(im, xx + 2, yy + 8, xx + 7, yy + 3, c)
        for xx in (0, 10, 20, 30): rect(im, xx, 0, 2, 96, c); rect(im, xx, 0, 1, 96, shade(c, .4))
        for yy in (0, 46, 92): rect(im, 0, yy, 32, 4, c); rect(im, 0, yy, 32, 1, shade(c, .5)); [rect(im, k, yy + 1, 2, 2, '#f0d070') for k in (3, 15, 27)]
        S['wall_' + n] = [outline(im), tint(im, '#fff', .6)]
    # writer's block: blank manuscript wall with blinking cursor
    S['writers'] = []
    for k in range(2):
        im = new(32, 64); rect(im, 2, 2, 28, 60, '#fbf7ec'); rect(im, 27, 2, 3, 60, '#d8ccb4'); rect(im, 2, 58, 28, 4, '#d8ccb4'); poly(im, [(22, 2), (30, 2), (30, 10)], '#c8bca4'); poly(im, [(22, 2), (30, 10), (22, 10)], '#ece2cc'); rect(im, 5, 14, 18, 1, '#e4dac4'); rect(im, 5, 48, 18, 1, '#e4dac4')
        if not k: rect(im, 12, 22, 4, 18, '#2c2038')
        S['writers'].append(outline(im))
    im = new(32, 80); [rect(im, x, 0, 4, 80, '#6a7088') or rect(im, x, 0, 1, 80, '#b8bccc') for x in (2, 10, 18, 26)]; [rect(im, 0, y, 32, 5, '#4a5064') or rect(im, 0, y, 32, 1, '#9aa3b8') for y in (4, 70)]
    rect(im, 5, 30, 22, 20, '#e0b23e'); rect(im, 5, 30, 22, 2, '#fff0a0'); rect(im, 5, 48, 22, 2, '#9a6418'); d = ImageDraw.Draw(im); d.arc([10, 18, 21, 36], 180, 360, fill=hexc('#b8bccc'), width=3); text(im, '$39', 10, 36, '#5a3410'); text(im, '.95', 12, 42, '#5a3410'); S['paywall'] = [outline(im), tint(im, '#fff', .6)]
    im = new(16, 64); [line(im, 8 + int(4 * math.sin(y * .25)), y, 8 + int(4 * math.sin(y * .25 + .3)), y + 2, '#2f6b40', 5) for y in range(0, 62)]; [line(im, 8 + int(4 * math.sin(y * .25 + 2.5)), y, 8 + int(4 * math.sin(y * .25 + 2.8)), y + 2, '#4f9a5a', 3) for y in range(0, 62)]; [rect(im, 2 + (y * 5) % 11, y, 3, 2, '#b8f090') for y in range(3, 62, 6)]; S['vinegate'] = [outline(im)]
    im = new(16, 64); rect(im, 1, 0, 14, 64, '#3a5a68'); [rect(im, 1, y, 14, 3, '#5f8a94') or rect(im, 1, y + 3, 14, 1, '#1c3440') for y in range(0, 64, 8)]; rect(im, 1, 0, 2, 64, '#86b4b8'); [rect(im, 6, y, 4, 4, '#e0b04c') for y in (14, 46)]; S['sluice'] = [outline(im)]
    im = new(16, 64); rect(im, 1, 0, 14, 64, '#8a5c18'); rect(im, 3, 0, 10, 64, '#d89a28'); rect(im, 3, 0, 2, 64, '#fff0a0'); [rect(im, 1, y, 14, 4, '#f8cf4c') or rect(im, 1, y + 4, 14, 1, '#7a4c12') for y in (0, 20, 40, 58)]; S['golddoor'] = [outline(im)]
    return S


def platforms():
    S = {}

    def slab(w, h, c, fn=None):
        im = new(w, h); rect(im, 1, 1, w - 2, h - 2, c[1]); rect(im, 1, 1, w - 2, 1, c[3]); rect(im, 1, 2, w - 2, 2, c[2]); rect(im, 1, h - 3, w - 2, 2, c[0])
        if fn: fn(im)
        return outline(im)
    G = ['#7a5420', '#c08526', '#f0bc42', '#fff0a0']; B = ['#3d2216', '#6b3f24', '#96602f', '#c58d4c']
    S['plat_book'] = [slab(48, 14, ['#5a1f2a', '#8f3848', '#b8505c', '#e88f88'], lambda i: (rect(i, 8, 8, 36, 4, '#f4ead0'), rect(i, 8, 10, 36, 1, '#b5a58a'), rect(i, 3, 2, 3, 10, '#f0c44c')))]
    S['plat_wood'] = [slab(48, 12, B, lambda i: [rect(i, x, 4, 1, 5, B[0]) for x in (12, 24, 36)])]
    S['plat_page'] = []
    for a in range(1):
        im = new(48, 12); rect(im, 1, 1, 46, 8, '#fffaf0'); [rect(im, x, 3 + (x // 4) % 2 * 2, 3, 1, '#a89cae') for x in range(4, 44, 4)]; rect(im, 1, 8, 46, 2, '#d9ccaa'); rect(im, 2, 3, 2, 5, '#c8484f'); S['plat_page'].append(outline(im))
    im = new(48, 12); rect(im, 1, 1, 46, 7, '#f4e6c8'); [line(im, x, 1, x + 2, 7, '#c8a878') for x in (9, 22, 37)]; [rect(im, x, 7, 3, 2, '#e0cfa4') for x in range(3, 44, 6)]; S['plat_fragile'] = [outline(im)]
    im = new(52, 18); poly(im, [(2, 6), (12, 2), (40, 2), (50, 6), (40, 12), (12, 12)], '#4f9a5a'); poly(im, [(4, 6), (12, 3), (40, 3), (48, 6)], '#8fd87a'); line(im, 4, 6, 48, 6, '#2f6b40'); [line(im, x, 6, x + 4, 11, '#2f6b40') for x in (12, 20, 28, 36)]; S['plat_leaf'] = [outline(im)]
    S['plat_raft'] = [slab(64, 16, B, lambda i: ([rect(i, x, 1, 1, 12, B[0]) for x in (11, 22, 32, 42, 53)], rect(i, 3, 5, 58, 2, '#d8c8a0'), rect(i, 3, 10, 58, 2, '#a8966c'), rect(i, 1, 14, 62, 1, '#3f7a94')))]
    S['plat_gold'] = [slab(48, 12, G, lambda i: [ball(i, x, 6, 3, 3, G) for x in (10, 24, 38)])]
    S['plat_paddle'] = [slab(40, 12, ['#2a4a3c', '#447058', '#639a70', '#9acb92'], lambda i: [rect(i, x, 3, 2, 6, '#e0b04c') for x in (6, 32)])]
    S['plat_lift'] = [slab(48, 14, ['#2c3048', '#565c7c', '#8a90a8', '#cdd4e0'], lambda i: ([rect(i, x, 7, 4, 4, '#f0c44c') for x in range(4, 44, 8)]))]
    S['plat_cab'] = [slab(40, 32, ['#545a70', '#7a8096', '#9aa0b4', '#cdd4e0'], lambda i: [(rect(i, 4, y, 32, 12, '#868ca2'), rect(i, 4, y, 32, 1, '#b4bac8'), rect(i, 4, y + 11, 32, 1, '#545a70'), rect(i, 14, y + 6, 12, 3, '#3f4458'), rect(i, 15, y + 2, 10, 3, '#ece4cc')) for y in (4, 17)])]
    S['plat_press'] = [slab(56, 20, ['#4a3c38', '#6a5548', '#8a7058', '#c8a878'], lambda i: (rect(i, 8, 6, 40, 3, '#e0b04c'), [rect(i, x, 12, 3, 3, '#f0c860') for x in (6, 18, 34, 46)]))]
    S['plat_cell_a'] = [slab(32, 14, ['#1f6b3c', '#3fa85a', '#8fe08a', '#e0ffc8'], lambda i: (rect(i, 3, 4, 26, 6, '#f4fff0'), text(i, '=SUM', 5, 5, '#1f6b3c')))]
    S['plat_cell_b'] = [slab(32, 14, ['#8a3a2a', '#c8604a', '#f0a080', '#ffe0c8'], lambda i: (rect(i, 3, 4, 26, 6, '#fff4ec'), text(i, '#REF', 5, 5, '#a83a2a')))]
    im = new(32, 14); d = ImageDraw.Draw(im)
    for x in range(1, 31, 3): rect(im, x, 1, 2, 1, '#c8e8d8'); rect(im, x, 11, 2, 1, '#c8e8d8')
    for y in range(1, 12, 3): rect(im, 1, y, 1, 2, '#c8e8d8'); rect(im, 30, y, 1, 2, '#c8e8d8')
    S['plat_cell_off'] = [im]
    S['plat_infra'] = [slab(48, 12, ['#2c3f88', '#4860b8', '#7c96f0', '#e2ecff'], lambda i: ([rect(i, x, 4, 3, 3, '#fff6c0') for x in (5, 22, 40)], rect(i, 8, 5, 14, 1, '#b8c8ff'), rect(i, 25, 5, 15, 1, '#b8c8ff')))]
    im = new(48, 12); [rect(im, x, 1, 2, 1, '#6f8cf0') for x in range(2, 46, 6)]; [im.putpixel((x, 1 + (x * 7) % 5), hexc('#a8bcff')) for x in range(5, 46, 11)]; S['plat_hint'] = [im]
    S['conveyor'] = []
    for k in range(4):
        im = new(32, 14); rect(im, 0, 1, 32, 12, '#3f4458'); rect(im, 0, 1, 32, 3, '#6a7088')
        for x in range(-8, 32, 8): poly(im, [(x + k * 2, 1), (x + k * 2 + 3, 1), (x + k * 2 + 5, 3), (x + k * 2 + 2, 3)], '#f0c44c')
        [ball(im, x, 9, 3, 3, ['#2c3048', '#7a80a0', '#cdd4e0']) for x in (6, 16, 26)]; rect(im, 0, 0, 32, 1, INK); rect(im, 0, 13, 32, 1, INK); S['conveyor'].append(im)
    S['beetle'] = []
    for k in range(4):
        im = new(64, 34); ball(im, 30, 18, 26, 14, ['#5a3a1c', '#9a6a2c', '#d8a44c', '#fff0b0']); rect(im, 0, 22, 64, 12, (0, 0, 0, 0)); rect(im, 4, 21, 54, 5, '#6a4a24'); rect(im, 4, 21, 54, 1, '#f0c860'); line(im, 30, 5, 30, 20, '#5a3a1c')
        g = gear(8, 8, ['#4a3420', '#7a5a34', '#b08a50', '#e8c88a'], rot=k * .4); paste(im, g, 8, 8); paste(im, g, 34, 8); ball(im, 56, 20, 6, 6, ['#3f6b4a', '#5f9a5a', '#a8e08a']); rect(im, 57, 18, 3, 3, '#ffffff'); rect(im, 59, 19, 1, 2, '#1c1428')
        for i, x in enumerate((12, 26, 42)): dx = [2, 0, -2, 0][(k + i) % 4]; line(im, x, 25, x + dx, 32, '#4a3420', 3)
        line(im, 58, 15, 62, 9, '#4a3420'); rect(im, 61, 7, 2, 2, '#8ff0c0'); rect(im, 8, 4, 4, 3, '#4f9a5a'); S['beetle'].append(outline(im))
    return S


def props():
    S = {}
    S['sign'] = [None]; im = new(30, 30); rect(im, 13, 14, 4, 16, '#6b3f24'); rect(im, 13, 14, 1, 16, '#96602f'); rect(im, 2, 3, 26, 15, '#96602f'); rect(im, 2, 3, 26, 2, '#d39a5c'); rect(im, 2, 16, 26, 2, '#6b3f24'); [rect(im, 6, y, 18 - y % 5, 1, '#4a2c1c') for y in (7, 10, 13)]; S['sign'] = [outline(im)]
    im = new(60, 46); rect(im, 5, 8, 4, 38, '#5c3a24'); rect(im, 51, 8, 4, 38, '#5c3a24'); rect(im, 2, 4, 56, 28, '#7a4c2c'); rect(im, 5, 7, 50, 22, '#c8a878'); poly(im, [(0, 5), (30, 0), (59, 5)], '#a8443c'); q = random.Random(3)
    for x, y, w, h, c in ((7, 9, 10, 13, '#fffaf0'), (19, 8, 14, 9, '#ffe890'), (35, 10, 9, 12, '#d0f0ff'), (46, 8, 7, 9, '#ffd0d8'), (20, 19, 11, 8, '#e0ffd8'), (45, 19, 8, 8, '#fffaf0')): rect(im, x, y, w, h, c); [rect(im, x + 1, yy, w - 3, 1, '#9a8fa8') for yy in range(y + 3, y + h - 1, 2)]; rect(im, x + w // 2, y, 1, 2, RED)
    S['notice'] = [outline(im)]
    im = new(40, 28); d = ImageDraw.Draw(im)
    for cx in (9, 31): d.ellipse([cx - 8, 11, cx + 8, 27], outline=hexc('#2c2038'), width=2); d.ellipse([cx - 6, 13, cx + 6, 25], outline=hexc('#8a90a8')); [line(im, cx, 19, cx + math.cos(a) * 6, 19 + math.sin(a) * 6, '#b8bccc') for a in (0, 1, 2.1, 3.1, 4.2, 5.2)]
    for a in ((9, 19, 15, 8), (15, 8, 27, 8), (27, 8, 31, 19), (15, 8, 19, 19), (19, 19, 27, 8), (9, 19, 19, 19)): line(im, *a, '#d0424a', 2)
    line(im, 15, 8, 14, 5, '#2c2038'); rect(im, 11, 3, 7, 2, '#5c3a24'); line(im, 27, 8, 26, 3, '#2c2038'); line(im, 26, 3, 31, 4, '#2c2038', 2); rect(im, 29, 5, 8, 6, '#b8834a'); S['bike'] = [im]
    im = new(44, 24); rect(im, 3, 11, 38, 3, '#a56c3c'); rect(im, 3, 4, 38, 3, '#a56c3c'); rect(im, 3, 4, 38, 1, '#d39a5c'); rect(im, 3, 11, 38, 1, '#d39a5c'); [rect(im, x, 2, 3, 21, '#4a4e66') for x in (6, 35)]; S['bench'] = [outline(im)]
    S['lamp'] = []; im = new(20, 64); rect(im, 9, 16, 3, 46, '#3a3f58'); rect(im, 9, 16, 1, 46, '#6a7090'); rect(im, 6, 60, 9, 4, '#3a3f58'); poly(im, [(5, 4), (15, 4), (13, 16), (7, 16)], '#ffe9a0'); rect(im, 8, 6, 2, 8, '#ffffff'); rect(im, 4, 2, 13, 2, '#3a3f58'); rect(im, 8, 0, 5, 2, '#3a3f58'); S['lamp'] = [outline(im)]
    # doorways
    S['door'] = []
    for k in range(2):
        im = new(44, 60); ell(im, 2, 1, 40, 40, '#8a7060'); rect(im, 2, 20, 40, 40, '#8a7060'); ell(im, 4, 3, 36, 36, '#b89c84'); rect(im, 4, 20, 36, 40, '#b89c84')
        ell(im, 8, 7, 28, 28, '#4a2c22' if not k else '#fff0b4'); rect(im, 8, 20, 28, 40, '#4a2c22' if not k else '#fff0b4')
        if not k:
            for x in range(9, 35, 5): rect(im, x, 14 if 12 < x < 30 else 20, 4, 46, '#7a4c2c'); rect(im, x, 14 if 12 < x < 30 else 20, 1, 46, '#a56c3c')
            rect(im, 21, 8, 2, 52, '#2c1a14'); [rect(im, 8, y, 28, 3, '#3a3f58') for y in (26, 48)]; rect(im, 17, 38, 3, 4, '#f0c44c'); rect(im, 24, 38, 3, 4, '#f0c44c')
        else:
            for y in range(60):
                for x in range(8, 36):
                    if im.getpixel((x, y)) == hexc('#fff0b4') and bayer(x, y) < abs(x - 22) / 16: im.putpixel((x, y), hexc('#f0b860'))
        [rect(im, x, y, 3, 3, '#e0c8ac') for x, y in ((3, 26), (38, 26), (3, 46), (38, 46), (20, 2))]; S['door'].append(outline(im))
    im = new(40, 34); ell(im, 1, 2, 38, 32, '#3a2a3c'); ell(im, 4, 5, 32, 28, '#140e20'); rect(im, 0, 30, 40, 4, (0, 0, 0, 0)); [rect(im, int(20 + math.cos(a) * 18) - 2, int(18 + math.sin(a) * 14) - 1, 5, 4, random.Random(int(a * 9)).choice(['#a83a3a', '#3a6ea8', '#d8a83c', '#4a8f5a'])) for a in [3.2 + i * .32 for i in range(10)]]; S['rabbithole'] = [outline(im)]
    # valve wheel
    S['valve'] = []
    for k in range(4):
        im = new(34, 40); rect(im, 14, 20, 6, 20, '#3a5a68'); rect(im, 14, 20, 2, 20, '#86b4b8'); rect(im, 8, 36, 18, 4, '#2c4450'); wheel(im, 17, 16, 12, ['#7a2030', '#b03a44', '#e0605c', '#ffa890'], 6, k * .26); S['valve'].append(outline(im))
    S['pod'] = []
    for k in range(2):
        im = new(30, 34); line(im, 15, 33, 15, 18, '#2f6b40', 3); poly(im, [(15, 30), (4, 24), (8, 30)], '#4f9a5a'); poly(im, [(15, 30), (26, 24), (22, 30)], '#4f9a5a')
        if not k: ball(im, 15, 13, 9, 11, ['#8a2f6a', '#c8509a', '#f08ac0', '#ffd0e8']); line(im, 15, 3, 15, 22, '#7a2860')
        else: [ball(im, 15 + math.cos(a) * 7, 13 + math.sin(a) * 7, 5, 5, ['#c8509a', '#f08ac0', '#ffd0e8']) for a in (0, 1.05, 2.1, 3.14, 4.2, 5.2)]; ball(im, 15, 13, 5, 5, ['#e0a83c', '#fff0a0', '#ffffff'])
        S['pod'].append(outline(im))
    S['mushsw'] = [mushroom(40, 36, ['#8a3a1c', '#d0642c', '#ff9a4c', '#ffe0a0'], ['#8a7a68', '#b8a890', '#e0d4bc', '#fffaf0'], 3), mushroom(40, 28, ['#1f6b5c', '#3aa88a', '#7ce8c0', '#e0fff0'], ['#8a7a68', '#b8a890', '#e0d4bc', '#fffaf0'], 3)]
    S['rootplate'] = []
    for k in range(2):
        im = new(64, 10); rect(im, 2, 3 + k * 3, 60, 6 - k * 3, '#6a5a3c'); rect(im, 2, 3 + k * 3, 60, 1, '#b8f090' if k else '#d8c08a'); [rect(im, x, 4 + k * 3, 3, 2, '#4f9a5a' if not k else '#b8ffb0') for x in range(6, 60, 10)]; S['rootplate'].append(outline(im))
    S['terminal'] = []
    for k in range(2):
        im = new(30, 38); rect(im, 12, 22, 6, 12, '#3b4c94'); rect(im, 6, 33, 18, 4, '#232c5c'); poly(im, [(3, 22), (27, 22), (24, 27), (6, 27)], '#5a72cc'); rect(im, 4, 3, 22, 18, '#232c5c'); rect(im, 6, 5, 18, 14, '#fff2b0' if k else '#141a38')
        if k: [rect(im, 8, y, 13 - y % 4, 1, '#8a6a1c') for y in (8, 11, 14)]
        else: text(im, '?', 14, 9, '#5f7ce0')
        rect(im, 4, 3, 22, 1, '#93b4ff'); S['terminal'].append(outline(im))
    S['lever'] = []
    for k in range(2):
        im = new(24, 24); line(im, 12, 19, 5 if not k else 19, 5, '#8a90a8', 3); ball(im, 5 if not k else 19, 5, 4, 4, ['#7a1f2a', '#d0424a', '#ff9a8a'] if not k else ['#1f6b3c', '#4fc86a', '#d0ffc0']); rect(im, 4, 18, 16, 5, '#4a4e66'); rect(im, 4, 18, 16, 1, '#8a90a8'); S['lever'].append(outline(im))
    im = new(30, 44); rect(im, 5, 4, 20, 38, '#3a6ea8'); rect(im, 5, 4, 3, 38, '#6aa0d8'); rect(im, 8, 8, 14, 10, '#1c2438'); text(im, '47', 12, 11, '#ff6a5c'); rect(im, 10, 24, 10, 3, '#1c2438'); rect(im, 11, 26, 8, 7, '#fffaf0'); text(im, '99', 12, 27, '#4a4e66'); rect(im, 3, 40, 24, 4, '#25507e'); S['ticket'] = [outline(im)]
    im = new(26, 34); rect(im, 5, 3, 12, 18, '#8f3848'); rect(im, 5, 3, 12, 2, '#e88f88'); rect(im, 5, 18, 16, 6, '#a8443c'); rect(im, 5, 18, 16, 1, '#e88f88'); [rect(im, x, 24, 2, 9, '#4a2c1c') for x in (6, 18)]; S['chair'] = [outline(im)]
    # big scenic window w/ mountain for the quiet room
    from bg import sky, mountains, MT_FAR, SNOW, MT_MID, LEAF
    v = vgrad(120, 76, ['#5a9ee4', '#9ed0f4', '#f3efcf']); paste(v, mountains(41, 46, 12, MT_FAR, SNOW, 36, w=120, h=76, haze='#c9e2ee'), 0, 0); paste(v, mountains(43, 66, 6, MT_MID, w=120, h=76), 0, 0); im = new(128, 84); rect(im, 0, 0, 128, 84, '#6b3f24'); rect(im, 1, 1, 126, 2, '#d39a5c'); paste(im, v, 4, 4); [rect(im, x, 0, 3, 84, '#8a5430') for x in (42, 84)]; rect(im, 0, 80, 128, 4, '#a56c3c'); S['bigwindow'] = [outline(im)]
    # fountain (animated water)
    S['fountain'] = []
    for k in range(4):
        im = new(72, 56); C = ['#6a7088', '#9aa3b8', '#c8cede', '#f0f4ff']; ball(im, 36, 46, 33, 9, C); ell(im, 6, 39, 60, 10, '#3a8ad0'); ell(im, 9, 41, 54, 6, '#6fc0f0'); rect(im, 32, 18, 8, 26, C[1]); rect(im, 32, 18, 3, 26, C[3]); ball(im, 36, 20, 15, 5, C); ell(im, 24, 16, 24, 6, '#6fc0f0'); rect(im, 34, 8, 4, 10, C[2])
        for s in (-1, 1):
            for j in range(14):
                t = (j + k / 4) / 14; x = 36 + s * (2 + t * 12); y = 8 - math.sin(t * 3.14) * 7 + t * 9; rect(im, int(x), int(y), 2, 2, '#e0f6ff' if j % 3 else '#8fd0f8')
                x = 36 + s * (14 + t * 9); y = 20 + t * t * 22; rect(im, int(x), int(y), 2, 3, '#bfeaff' if (j + k) % 3 else '#ffffff')
        for j in range(5): rect(im, 12 + (j * 13 + k * 3) % 46, 42 + j % 3, 5, 1, '#e0f6ff')
        S['fountain'].append(outline(im))
    S['waterfall'] = []
    for k in range(4):
        im = new(32, 32)
        for x in range(32):
            for y in range(32):
                v = math.sin(x * .8) * .5 + math.sin(x * 1.9 + 2) * .3; f = (y - k * 8 + int(v * 9)) % 32
                im.putpixel((x, y), hexc('#e8fbff' if f < 3 else '#a8e0f8' if f < 9 else '#5fb4e8' if v > 0 else '#4a9ad8', 225))
        S['waterfall'].append(im)
    S['watertop'] = []
    for k in range(4):
        im = new(32, 8)
        for x in range(32):
            y = 2 + int(round(math.sin((x + k * 8) * math.pi / 16) * 1.4)); rect(im, x, y, 1, 1, '#f0fdff'); rect(im, x, y + 1, 1, 1, '#a8e8f8'); rect(im, x, y + 2, 1, 8, hexc('#4fb0dc', 170))
        S['watertop'].append(im)
    S['bigwheel'] = []
    im = new(150, 150); wheel(im, 75, 75, 68, ['#2a4a3c', '#447058', '#639a70', '#9acb92'], 8); S['bigwheel'] = [outline(im)]
    S['gearbig'] = [gear(26, 12, ['#6a5238', '#927448', '#b8965c', '#dcc088'])]; S['gearsm'] = [gear(14, 9, ['#6a5238', '#927448', '#b8965c', '#dcc088'])]
    # funding portal
    S['portal'] = []
    for k in range(4):
        im = new(96, 112); C = ['#7a4c12', '#c08526', '#f0bc42', '#fff0a0']; ell(im, 4, 2, 88, 88, C[0]); rect(im, 4, 46, 88, 66, C[0]); ell(im, 7, 5, 82, 82, C[2]); rect(im, 7, 46, 82, 66, C[2]); ell(im, 10, 8, 76, 76, C[1]); rect(im, 10, 46, 76, 66, C[1]); ell(im, 16, 14, 64, 64, '#0f2b2b'); rect(im, 16, 46, 64, 66, '#0f2b2b')
        p = im.load()
        for y in range(16, 112):
            for x in range(17, 79):
                if p[x, y] == hexc('#0f2b2b'):
                    a = math.atan2(y - 60, x - 48); d = math.hypot(x - 48, (y - 60) * .75); v = .5 + .5 * math.sin(a * 3 + d * .25 - k * 1.57); p[x, y] = ramp_at(['#123a5a', '#1f6b8a', '#3fb0b8', '#c8fff0'], v * (1 - d / 70), x, y)
        for i in range(9): a = math.pi + i * math.pi / 8; ball(im, 48 + math.cos(a) * 36, 46 + math.sin(a) * 36, 3, 3, C)
        rect(im, 2, 106, 92, 6, C[2]); rect(im, 2, 106, 92, 1, C[3]); text(im, '$', 45, 5, C[0], 1); S['portal'].append(outline(im))
    S['miniportal'] = []
    for k in range(4):
        im = new(28, 40); p = im.load()
        for y in range(40):
            for x in range(28):
                d = math.hypot((x - 13.5) / 12, (y - 19.5) / 18)
                if d < 1: a = math.atan2(y - 20, x - 14); p[x, y] = hexc('#fff0a0') if d > .88 else hexc('#c08526') if d > .76 else ramp_at(['#5a1f78', '#a03fb0', '#f08ad0', '#fff0ff'], (.5 + .5 * math.sin(a * 2 + d * 9 - k * 1.57)) * (1.1 - d), x, y)
        S['miniportal'].append(outline(im))
    # summit-path gate
    im = new(132, 120); st = ['#4a4464', '#6a6488', '#8a86a8', '#b8b4cc']
    for x in (6, 100):
        for y in range(16, 120, 10): rect(im, x, y, 26, 10, st[1 + (y // 10 + x) % 2]); rect(im, x, y, 26, 1, st[3]); rect(im, x, y + 9, 26, 1, st[0]); rect(im, x + 13 - (y // 10 % 2) * 6, y, 1, 10, st[0])
        poly(im, [(x - 4, 16), (x + 13, 0), (x + 29, 16)], '#4f4a78'); rect(im, x - 3, 14, 32, 4, st[3])
    d = ImageDraw.Draw(im); d.arc([24, 20, 107, 110], 180, 360, fill=hexc(st[2]), width=14); d.arc([24, 20, 107, 110], 180, 360, fill=hexc(st[3]), width=2); poly(im, [(66, 14), (80, 30), (66, 46), (52, 30)], '#f0c44c'); poly(im, [(66, 18), (76, 30), (66, 42), (56, 30)], '#3a2f78'); poly(im, [(66, 22), (73, 35), (59, 35)], '#f0f4ff'); S['mtgate'] = [outline(im)]
    for n, a in (('bld_a', building(120, 130, WALL_A, ROOF_A, 5)), ('bld_b', building(60, 150, WALL_B, ROOF_B, 6, True)), ('bld_hall', building(168, 110, WALL_B, ROOF_A, 9))): S[n] = [a]
    S['shelf_big'] = [outline(pad(shelf(80, 118, WOOD, 4), 82, 120, 1, 1))]; S['shelf_small'] = [outline(pad(shelf(46, 80, WOOD, 8), 48, 82, 1, 1))]
    S['coinpile'] = [coinpile(64, 26, 3)]
    im = new(60, 54); rect(im, 4, 22, 52, 32, '#8f3848'); rect(im, 4, 22, 52, 2, '#e88f88'); [rect(im, x, 0, 6, 16, '#fffaf0' if (x // 6) % 2 else '#c8484f') for x in range(0, 60, 6)]; [ell(im, x, 12, 6, 7, '#fffaf0' if (x // 6) % 2 else '#c8484f') for x in range(0, 60, 6)]; [rect(im, x, 16, 3, 8, '#6b3f24') for x in (3, 54)]; rect(im, 14, 30, 32, 14, '#fff6e0'); text(im, 'COFFEE', 18, 32, '#6a3c22'); text(im, 'FREE!', 21, 38, RED); S['coffeestand'] = [outline(im)]
    im = new(90, 46); rect(im, 2, 16, 86, 10, '#fffaf0'); rect(im, 2, 16, 86, 2, '#ffffff'); [poly(im, [(x, 26), (x + 14, 26), (x + 7, 34)], '#e8dcc4') for x in range(2, 86, 14)]; [rect(im, x, 26, 4, 20, '#6b3f24') for x in (6, 80)]
    for x, c in ((10, '#d89a48'), (28, '#6aa84a'), (46, '#c8484f'), (64, '#f0c44c')): ball(im, x + 6, 12, 8, 5, [shade(c, -.4), c, shade(c, .5)]); rect(im, x - 3, 15, 19, 2, '#b8bccc')
    S['buffet'] = [outline(im)]
    im = new(26, 30); rect(im, 3, 6, 20, 22, '#c8484f'); rect(im, 3, 6, 20, 2, '#f08a7c'); text(im, 'IN', 9, 12, '#fff'); paste(im, sheet_paper(12, 6), 7, 1); S['inbox'] = [outline(im)]
    im = new(44, 22); rect(im, 4, 17, 36, 4, '#7a4c12'); rect(im, 4, 17, 36, 1, '#c08526'); [rect(im, 10, y, 24, 2, '#8a90a8') or rect(im, 10, y, 24, 1, '#cdd4e0') for y in (8, 11, 14)]; ball(im, 22, 5, 20, 4, ['#8a5414', '#e0a83c', '#f8d86c', '#fff6c0']); text(im, '$', 21, 3, '#8a5414'); S['bouncer'] = [outline(im)]
    S['revstation'] = []
    for k in range(2):
        im = new(40, 44); rect(im, 4, 18, 32, 24, '#6a5548'); rect(im, 4, 18, 32, 2, '#c8a878'); rect(im, 7, 4, 26, 16, '#8f6428'); rect(im, 9, 6, 22, 12, '#8fffc0' if k else '#3a2c30'); text(im, 'OK' if k else 'REV', 15 if k else 14, 9, '#1c5a40' if k else '#e08a5c'); rect(im, 10, 28, 20, 3, '#23263a'); [ball(im, x, 36, 2, 2, ['#8a5414', '#f0bc42', '#fff']) for x in (10, 20, 30)]; S['revstation'].append(outline(im))
    return S


def enemies():
    S = {}; S['gremlin'] = []
    for k in range(4):  # walking pile of paperwork
        im = new(24, 24); b = [0, -1, 0, -1][k]
        for i, (w, c) in enumerate(((16, '#e4d4b0'), (17, PAPER), (15, '#efe3c4'), (16, '#fffaf0'))): rect(im, 12 - w // 2 + (i % 2), 15 - i * 3 + b, w, 3, c); rect(im, 12 - w // 2 + (i % 2), 17 - i * 3 + b, w, 1, '#b8a888')
        rect(im, 7, 9 + b, 4, 4, '#fff'); rect(im, 14, 9 + b, 4, 4, '#fff'); rect(im, 8, 11 + b, 2, 2, '#1c1428'); rect(im, 14, 11 + b, 2, 2, '#1c1428'); line(im, 6, 7 + b, 10, 9 + b, '#5a1f2a'); line(im, 18, 7 + b, 14, 9 + b, '#5a1f2a'); rect(im, 9, 14 + b, 7, 2, '#5a1f2a'); rect(im, 10, 14 + b, 1, 1, '#fff'); rect(im, 13, 14 + b, 1, 1, '#fff')
        for x, p in ((8, k), (14, k + 2)): rect(im, x + [0, 1, 0, -1][p % 4], 18 + b, 3, 4 - b - [0, 1, 0, 0][p % 4], '#5a4a6a')
        rect(im, 17, 2 + b, 3, 5, '#c8484f'); S['gremlin'].append(outline(im))
    im = new(24, 24); rect(im, 3, 19, 18, 4, PAPER); rect(im, 2, 21, 20, 1, '#b8a888'); rect(im, 7, 19, 3, 1, INK); rect(im, 14, 19, 3, 1, INK); S['gremlin_dead'] = [outline(im)]
    S['citation'] = []
    for k in range(4):
        im = new(32, 24); wy = [0, -3, -5, -2][k]
        for s in (-1, 1): poly(im, [(16 + s * 7, 12), (16 + s * 14, 8 + wy), (16 + s * 13, 14 + wy // 2)], '#fffaf0'); line(im, 16 + s * 7, 12, 16 + s * 14, 8 + wy, '#b8a888')
        ball(im, 16, 13, 9, 8, ['#4a2c78', '#6f4ab0', '#a080e0', '#e0d0ff']); text(im, '[?]', 11, 11, '#fff6c0'); rect(im, 11, 6, 3, 2, '#fff'); rect(im, 18, 6, 3, 2, '#fff'); rect(im, 12, 7, 1, 1, INK); rect(im, 19, 7, 1, 1, INK); S['citation'].append(outline(im))
    S['tracked'] = []
    for k in range(4):  # flying tracked change: red strike-through worm
        im = new(36, 20)
        for x in range(4, 30): y = 10 + math.sin(x * .5 + k * 1.57) * 3.2; rect(im, x, int(y), 2, 4, '#d0303c'); rect(im, x, int(y), 1, 1, '#ff8a80')
        y = int(10 + math.sin(15 + k * 1.57) * 3); ball(im, 30, y + 2, 5, 5, ['#8a1f2a', '#d0303c', '#ff8a80']); rect(im, 30, y, 3, 3, '#fff'); rect(im, 32, y + 1, 1, 2, INK); line(im, 28, y - 3, 33, y - 1, INK); S['tracked'].append(outline(im))
    S['format'] = []
    for k in range(4):  # pilcrow formatting monster
        im = new(28, 32); b = [0, 1, 1, 0][k]; ball(im, 11, 11 + b, 8, 8, ['#1f4a78', '#2f6fb0', '#58a0e0', '#c0e4ff']); rect(im, 12, 3 + b, 3, 24 - b, '#2f6fb0'); rect(im, 17, 3 + b, 4, 24 - b, '#2f6fb0'); rect(im, 12, 3 + b, 9, 3, '#58a0e0'); rect(im, 17, 3 + b, 1, 24 - b, '#58a0e0'); rect(im, 6, 8 + b, 4, 5, '#fff'); rect(im, 12, 8 + b, 4, 5, '#fff'); rect(im, 7, 10 + b, 2, 3, INK); rect(im, 13, 10 + b, 2, 3, INK); line(im, 5, 6 + b, 9, 8 + b, INK); line(im, 16, 6 + b, 12, 8 + b, INK); rect(im, 8, 15 + b, 6, 2, '#0f2440'); rect(im, 10, 27 + (k % 2), 4, 3, '#1f4a78'); rect(im, 17, 28 - (k % 2), 4, 3, '#1f4a78'); S['format'].append(outline(im))
    S['letter'] = []
    for k in range(4):  # rejection letter
        im = new(40, 30); wy = [0, -3, 0, 3][k]
        for s in (-1, 1): poly(im, [(20 + s * 12, 14), (20 + s * 19, 8 + wy), (20 + s * 17, 17 + wy // 2)], '#ffd0c8')
        rect(im, 7, 6, 26, 19, '#d8404a'); rect(im, 7, 6, 26, 2, '#ff8a80'); rect(im, 7, 23, 26, 2, '#8a1f2a'); line(im, 7, 6, 20, 15, '#8a1f2a', 2); line(im, 32, 6, 20, 15, '#8a1f2a', 2); rect(im, 12, 13, 5, 4, '#fff'); rect(im, 23, 13, 5, 4, '#fff'); rect(im, 14, 15, 2, 2, INK); rect(im, 23, 15, 2, 2, INK); line(im, 11, 11, 16, 13, INK, 2); line(im, 28, 11, 23, 13, INK, 2); rect(im, 15, 20, 10, 2, '#5a0f1a'); rect(im, 17, 20, 2, 1, '#fff'); rect(im, 21, 20, 2, 1, '#fff'); S['letter'].append(outline(im))
    S['stress'] = []
    for k in range(4):
        im = new(40, 34); b = [0, 1, 1, 0][k]; C = ['#2c2440', '#463a60', '#62558a', '#8a7cb8']
        for cx, cy, rr in ((12, 14, 8), (27, 14, 9), (20, 10, 9), (20, 16, 11)): ball(im, cx, cy + b, rr, rr * .85, C)
        rect(im, 13, 11 + b, 4, 4, '#fff0a0'); rect(im, 22, 11 + b, 4, 4, '#fff0a0'); rect(im, 15, 13 + b, 2, 2, INK); rect(im, 22, 13 + b, 2, 2, INK); line(im, 12, 9 + b, 16, 11 + b, INK); line(im, 27, 9 + b, 23, 11 + b, INK); line(im, 16, 19 + b, 19, 17 + b, INK); line(im, 19, 17 + b, 23, 19 + b, INK)
        if k % 2: poly(im, [(20, 25), (16, 30), (19, 30), (17, 34), (24, 28), (20, 28), (23, 25)], '#ffe24a')
        S['stress'].append(outline(im))
    S['dot'] = []; im = new(14, 14); ball(im, 7, 7, 6, 6, ['#2c5a9c', '#4a90e0', '#a8d8ff', '#ffffff']); S['dot'] = [outline(im)]
    # giant stamps
    for n, lab, c in (('stamp_rej', 'REJECTED', '#c8303c'), ('stamp_rev', 'MAJOR', '#c8303c'), ('stamp_app', 'APPROVED', '#2f9a4a')):
        im = new(72, 84); ball(im, 36, 14, 13, 13, ['#4a2414', '#7a4424', '#a86a3c', '#e0a868']); rect(im, 30, 22, 13, 24, '#7a4424'); rect(im, 30, 22, 4, 24, '#a86a3c'); rect(im, 40, 22, 3, 24, '#4a2414'); poly(im, [(30, 42), (43, 42), (62, 56), (10, 56)], '#8a5430'); rect(im, 6, 55, 60, 14, '#a86a3c'); rect(im, 6, 55, 60, 2, '#e0a868'); rect(im, 6, 66, 60, 3, '#4a2414'); rect(im, 4, 69, 64, 11, c); rect(im, 4, 69, 64, 1, shade(c, .4)); rect(im, 4, 78, 64, 2, shade(c, -.5)); text(im, lab, 36 - twid(lab) // 2, 72, '#fff4ec'); S[n] = [outline(im)]
    for n, l1, l2, c in (('ink_rej', 'REJECTED', None, '#d0303c'), ('ink_app', 'APPROVED', None, '#2fae50'), ('ink_rev', 'MAJOR', 'REVISION', '#d0303c')):
        w = 140; im = new(w, 48); d = ImageDraw.Draw(im); d.rectangle([2, 2, w - 3, 45], outline=hexc(c), width=3); d.rectangle([7, 7, w - 8, 40], outline=hexc(c), width=1)
        if l2: text(im, l1, w // 2 - twid(l1, 3) // 2, 10, c, 3); text(im, l2, w // 2 - twid(l2, 2) // 2, 28, c, 2)
        else: text(im, l1, w // 2 - twid(l1, 4) // 2, 14, c, 4)
        q = random.Random(4); p = im.load()
        for _ in range(260):
            x, y = q.randrange(w), q.randrange(48)
            for dx in range(q.randrange(1, 3)):
                if x + dx < w: p[x + dx, y] = (0, 0, 0, 0)
        S[n] = [im]
    return S


def bosses():
    S = {}; S['boss_machine'] = []
    for k in range(6):  # 0-3 run, 4 dramatic pause, 5 accepted
        im = new(176, 112); C = ['#4a3c38', '#6a5548', '#8a7058', '#c8a878']
        rect(im, 12, 34, 152, 74, C[1]); rect(im, 12, 34, 152, 4, C[3]); rect(im, 12, 34, 5, 74, C[2]); rect(im, 158, 34, 6, 74, C[0]); rect(im, 4, 100, 168, 12, C[0]); rect(im, 4, 100, 168, 2, C[2])
        for x in range(20, 160, 12): rect(im, x, 104, 3, 3, '#f0c860')
        for x, h in ((24, 30), (44, 22), (140, 34)): rect(im, x, 34 - h, 12, h, C[2]); rect(im, x, 34 - h, 3, h, C[3]); rect(im, x - 2, 34 - h, 16, 4, '#e0b04c')
        for yy, dirn in ((46, 1), (62, -1)):
            rect(im, 64, yy, 78, 14, C[0])
            for y in range(12): rect(im, 66, yy + 1 + y, 74, 1, ['#8a8494', '#b8b4c0', '#e8e6f0', '#b8b4c0', '#8a8494', '#6a6478'][(y * 6 // 12)])
            for x in range(66, 138, 10): rect(im, x + (k * 2 * dirn) % 10, yy + 1, 2, 12, '#7a7488')
        paste(im, sheet_paper(62, 34, True), 72, 74); rect(im, 72, 74, 62, 3, '#8a7f70'); text(im, 'MANUSCRIPT' if k < 5 else 'ACCEPTED', 84 if k < 5 else 88, 80, RED if k < 5 else '#2f9a4a')
        g1 = gear(19, 12, ['#7a5420', '#c08526', '#f0bc42', '#fff0a0'], rot=k * .26 if k < 4 else 0); g2 = gear(12, 9, ['#6a5238', '#927448', '#b8965c', '#dcc088'], rot=-k * .35 if k < 4 else 0); paste(im, g1, -2, 60); paste(im, g2, 146, 30)
        ex = [0, 1, 0, -1, 0, 0][k]; ec = '#ffe24a' if k < 4 else '#b8c8ff' if k == 4 else '#8fffc0'
        for x in (26, 46):
            ball(im, x, 56, 9, 9, ['#1c1428', '#2c2440', '#3a3054']); ball(im, x, 56, 7, 7, [shade(ec, -.4), ec, '#ffffff']); rect(im, x - 2 + ex, 54, 4, 5, INK)
        if k < 4: line(im, 17, 44, 33, 50, C[0], 4); line(im, 56, 44, 40, 50, C[0], 4)
        if k == 5: rect(im, 18, 46, 16, 6, C[1]); rect(im, 38, 46, 16, 6, C[1])
        rect(im, 22, 74, 30, 14, '#23161c'); [rect(im, x, 74 if not k % 2 else 75, 4, 5, '#f4ead0') for x in range(24, 50, 6)]; [rect(im, x, 83, 4, 5, '#f4ead0') for x in range(24, 50, 6)]
        if k == 5: rect(im, 22, 74, 30, 14, '#23161c'); d = ImageDraw.Draw(im); d.arc([24, 64, 49, 85], 20, 160, fill=hexc('#f4ead0'), width=3)
        rect(im, 146, 78, 8, 8, '#c23a3a' if k < 4 else '#4fc86a'); rect(im, 148, 79, 3, 3, '#fff'); S['boss_machine'].append(outline(im))
    S['boss_stamp'] = []
    for k in range(6):  # 0 idle 1 blink 2 angry 3 raise 4 slam 5 defeated
        im = new(112, 132); sq = 6 if k == 4 else 0; C = ['#5a1f24', '#8f3038', '#c04a4c', '#f0907c']; g = ['#8a5414', '#c08526', '#f0bc42', '#fff0a0']
        y0 = sq; ball(im, 56, 22 + y0, 22, 20, g); rect(im, 46, 38 + y0, 21, 16, g[1]); rect(im, 46, 38 + y0, 6, 16, g[3]); rect(im, 61, 38 + y0, 6, 16, g[0]); rect(im, 42, 50 + y0, 29, 5, g[2])
        poly(im, [(36, 54 + y0), (76, 54 + y0), (100, 106), (12, 106)], C[1]); poly(im, [(36, 54 + y0), (50, 54 + y0), (36, 106), (12, 106)], C[2]); poly(im, [(68, 54 + y0), (76, 54 + y0), (100, 106), (84, 106)], C[0])
        rect(im, 6, 104, 100, 14, C[1]); rect(im, 6, 104, 100, 3, C[3]); rect(im, 6, 115, 100, 3, C[0]); rect(im, 2, 118, 108, 12, '#d0303c' if k != 5 else '#2f9a4a'); text(im, 'REJECTED' if k != 5 else 'APPROVED', 56 - twid('REJECTED', 2) // 2, 120, '#fff4ec', 2)
        for x in (38, 74):
            if k in (1, 5): line(im, x - 8, 74, x + 8, 74, INK, 3)
            else: ell(im, x - 9, 66, 18, 16, '#fff8ec', INK); rect(im, x - 2, 72 + (2 if k == 4 else 0), 5, 6, INK)
        if k in (0, 2, 3, 4): line(im, 26, 60 - (3 if k == 3 else 0), 47, 66 + (2 if k == 2 else 0), INK, 4); line(im, 86, 60 - (3 if k == 3 else 0), 65, 66 + (2 if k == 2 else 0), INK, 4)
        rect(im, 46, 84, 20, 4, '#7a1f2a') if k != 5 else line(im, 46, 88, 66, 88, INK, 2)
        poly(im, [(32, 86), (56, 80), (80, 86), (74, 94), (56, 88), (38, 94)], '#d8d4e0'); line(im, 56, 81, 56, 87, '#9a94a8')  # moustache
        rect(im, 42, 96, 28, 6, g[2]); text(im, 'DEPT', 49, 97, g[0]); ball(im, 22, 98, 4, 4, g); ball(im, 90, 98, 4, 4, g); S['boss_stamp'].append(outline(im))
    return S


def fx():
    S = {}
    S['spark'] = [];
    for k in range(4):
        im = new(12, 12); r = [2, 4, 5, 3][k]; line(im, 6 - r, 6, 6 + r, 6, '#bff8ff'); line(im, 6, 6 - r, 6, 6 + r, '#bff8ff'); rect(im, 5, 5, 3, 3, '#ffffff'); S['spark'].append(im)
    S['bolt'] = []
    for k in range(3):
        im = new(20, 14); ball(im, 13, 7, 5, 5, ['#2c8ad0', '#6fd8ff', '#ffffff']); [rect(im, 7 - j * 3, 6 + int(math.sin(k * 2 + j) * 2), 3, 2, hexc('#8fe6ff', 220 - j * 60)) for j in range(3)]; S['bolt'].append(im)
    S['dust'] = []
    for k in range(4):
        im = new(14, 14); r = [3, 5, 5, 3][k]; ball(im, 7, 8 - k, r, r, ['#c8b8a0', '#e8dcc8', '#ffffff']); p = im.load()
        for y in range(14):
            for x in range(14):
                if k > 1 and bayer(x, y) < (k - 1) * .35: p[x, y] = (0, 0, 0, 0)
        S['dust'].append(im)
    for n, c in (('a', '#ff5f7a'), ('b', '#ffd24a'), ('c', '#5fd88a'), ('d', '#5fb0ff'), ('e', '#c88aff')):
        S['conf_' + n] = []
        for k in range(3): im = new(6, 6); w = [5, 3, 1][k]; rect(im, 3 - w // 2, 1, w, 4, c); rect(im, 3 - w // 2, 1, w, 1, shade(c, .5)); S['conf_' + n].append(im)
    S['bit'] = []
    for k in range(4): im = new(9, 9); poly(im, [[(1, 2), (7, 1), (8, 6), (2, 8)], [(2, 1), (8, 4), (5, 8), (1, 6)], [(1, 1), (6, 3), (7, 8), (2, 6)], [(3, 1), (8, 2), (6, 7), (1, 7)]][k], PAPER); rect(im, 3, 4, 3, 1, INKL); S['bit'].append(im)
    S['brick'] = [];
    for k in range(3): im = new(8, 8); poly(im, [[(1, 2), (6, 1), (7, 6), (2, 7)], [(1, 1), (7, 3), (4, 7)], [(2, 1), (6, 2), (6, 6), (1, 6)]][k], '#b88a58'); rect(im, 2, 2, 2, 1, '#e8c890'); S['brick'].append(outline(im))
    S['coin'] = []
    for k in range(4): im = new(12, 12); w = [5, 4, 1.5, 4][k]; ball(im, 6, 6, w, 5, ['#8a5414', '#e0a83c', '#fff0a0']); S['coin'].append(outline(im))
    S['leaf'] = []
    for k in range(4): im = new(8, 8); ball(im, 4, 4, [3, 2, 3, 2][k], [2, 3, 1.4, 3][k], ['#3f8a3c', '#79c652', '#d8f08a']); S['leaf'].append(im)
    S['petal'] = [];
    for k in range(4): im = new(8, 8); ball(im, 4, 4, [3, 2, 3, 2][k], [2, 3, 1.4, 3][k], ['#c850a0', '#ff9ad0', '#fff0fa']); S['petal'].append(im)
    S['drop'] = [];  im = new(6, 8); poly(im, [(3, 0), (5, 5), (3, 7), (1, 5)], '#8fe0ff'); S['drop'] = [im]
    im = new(4, 4); rect(im, 1, 0, 2, 4, '#fff6d0'); rect(im, 0, 1, 4, 2, '#fff6d0'); S['mote'] = [im]
    S['star'] = [];  im = new(14, 14); poly(im, [(7, 0), (9, 5), (13, 5), (10, 8), (11, 13), (7, 10), (3, 13), (4, 8), (1, 5), (5, 5)], '#ffe24a'); S['star'] = [outline(im)]
    S['bird'] = []
    for k in range(4): im = new(16, 10); y = [0, 3, 5, 3][k]; line(im, 8, 5, 2, y + 1, '#2c3048', 1); line(im, 8, 5, 14, y + 1, '#2c3048', 1); rect(im, 7, 5, 3, 2, '#2c3048'); S['bird'].append(im)
    S['bang'] = [];  im = new(12, 20); rect(im, 4, 2, 4, 10, '#ffe24a'); rect(im, 4, 14, 4, 4, '#ffe24a'); S['bang'] = [outline(im)]
    im = new(16, 14); poly(im, [(8, 12), (2, 4), (14, 4)], '#fff6d0'); S['arrowdn'] = [outline(im)]
    S['glow_w'] = [glow(96, '#fff0c0')]; S['glow_c'] = [glow(96, '#a0f0ff')]; S['glow_p'] = [glow(96, '#e0a0ff')]; S['glow_g'] = [glow(96, '#b0ffb0')]
    S['ring'] = [];  im = new(64, 64); ImageDraw.Draw(im).ellipse([3, 3, 60, 60], outline=hexc('#ffffff'), width=3); S['ring'] = [im]
    S['sigil'] = []
    for k in range(4):
        im = new(64, 64); d = ImageDraw.Draw(im); d.ellipse([2, 2, 61, 61], outline=hexc('#8ff0c0'), width=2); d.ellipse([10, 10, 53, 53], outline=hexc('#c8ffe0')); a0 = k * .26
        P = [(32 + math.cos(a0 + i * 2.094) * 22, 32 + math.sin(a0 + i * 2.094) * 22) for i in range(3)]
        for i in range(3): line(im, *P[i], *P[(i + 1) % 3], '#8ff0c0'); rect(im, int(P[i][0]) - 2, int(P[i][1]) - 2, 4, 4, '#ffffff')
        S['sigil'].append(im)
    S['zzz'] = [];
    return {k: v for k, v in S.items() if v}


def build():
    S = {}
    for f in (items, blocks, platforms, props, enemies, bosses, fx): S.update(f())
    return S


if __name__ == '__main__':
    import sys
    S = build(); im = Image.new('RGBA', (760, 1150), (110, 150, 190, 255)); x = y = rh = 0
    for n, fr in S.items():
        for a in fr[:3]:
            if x + a.width > 760: x = 0; y += rh + 3; rh = 0
            paste(im, a, x, y); x += a.width + 3; rh = max(rh, a.height)
    im.resize((1520, 2300), 0).save(sys.argv[1])
