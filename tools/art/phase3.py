"""python tools/art/phase3.py : appends final-phase art to the atlas (run after phase2.py; earlier pixels never move)."""
import os, json, sys, math, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from px import *
import bg, ui, things
import phase2
from phase2 import book, paragraph
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')); OUT = os.path.join(ROOT, 'public/assets/art')
GOLD = ['#8a5414', '#c08526', '#f0bc42', '#fff0a0']; SKIN = ['#b87a58', '#e0a880', '#f4cca4']; RED = '#c23a3a'
SHEET = Image.open(os.path.join(ROOT, 'public/assets/characters/leo.png')).convert('RGBA'); ROWS = json.load(open(os.path.join(ROOT, 'public/assets/characters/leo.json')))['rows']


def head(kind='stare', f=0):
    r = ROWS[kind][0]; h = SHEET.crop((f * 32, r * 36, f * 32 + 32, r * 36 + 36)); b = h.getbbox(); return h.crop((0, b[1], 32, b[1] + 18))


def body(c, shirt='#f4f0e8', tie=None, gown=False, arms=(0, 0), shoes='#2c2038', legs='#3a3450'):
    """40x48, feet on the bottom row, body from y=26."""
    im = new(40, 48)
    if gown:
        poly(im, [(13, 25), (27, 25), (33, 45), (7, 45)], c[1]); poly(im, [(13, 25), (17, 25), (14, 45), (7, 45)], c[2]); poly(im, [(24, 25), (27, 25), (33, 45), (27, 45)], c[0]); rect(im, 7, 44, 26, 2, GOLD[2]); poly(im, [(16, 25), (24, 25), (20, 33)], shirt); line(im, 14, 26, 18, 45, GOLD[2]); line(im, 26, 26, 22, 45, GOLD[2])
        rect(im, 14, 46, 5, 2, shoes); rect(im, 22, 46, 5, 2, shoes)
    else:
        rect(im, 15, 38, 4, 8, legs); rect(im, 21, 38, 4, 8, legs); rect(im, 13, 45, 6, 3, shoes); rect(im, 21, 45, 6, 3, shoes); rect(im, 13, 26, 14, 14, c[1]); rect(im, 13, 26, 3, 14, c[2]); rect(im, 25, 26, 2, 14, c[0]); poly(im, [(16, 26), (24, 26), (20, 34)], shirt)
        if tie: rect(im, 19, 27, 2, 8, tie)
    for s, up in ((-1, arms[0]), (1, arms[1])):
        x = 20 + s * 8; line(im, x, 28, x + s * (3 if up else 2), 28 + (-9 if up else 9), c[1 if s < 0 else 0], 4); rect(im, x + s * (3 if up else 2) - 1, 28 + (-12 if up else 10), 4, 4, SKIN[2])
    return im


def leo(c, top=None, hd='stare', f=0, **k):
    im = body(c, **k); paste(im, head(hd, f), 4, 8);
    if top: top(im)
    return outline(im)


def cap(im):
    poly(im, [(20, 2), (36, 8), (20, 13), (3, 8)], '#1f2448'); poly(im, [(20, 2), (36, 8), (20, 10), (3, 8)], '#38407a'); rect(im, 11, 11, 18, 3, '#1f2448'); line(im, 20, 7, 33, 9, GOLD[2]); rect(im, 32, 9, 2, 7, GOLD[2]); rect(im, 31, 15, 4, 3, GOLD[3])
def shades(im): rect(im, 10, 17, 20, 2, INK); rect(im, 11, 18, 8, 5, '#1c1830'); rect(im, 21, 18, 8, 5, '#1c1830'); rect(im, 12, 19, 2, 1, '#8fa0e0'); rect(im, 22, 19, 2, 1, '#8fa0e0')
def chef(im): rect(im, 14, 28, 12, 13, '#fff8ec'); rect(im, 14, 28, 12, 1, '#e0d4c0'); rect(im, 16, 34, 8, 5, '#f0d8d0'); text(im, 'NEM', 15, 30, RED); rect(im, 12, 10, 18, 4, '#d8404a'); rect(im, 12, 10, 18, 1, '#ff8a80'); rect(im, 28, 13, 4, 3, '#d8404a')


def person(hair, jacket, kind=0, hairc2=None, arms=(0, 0), look=0, gl=True):
    im = body(jacket, tie='#8f2f3c' if kind == 0 else None, arms=arms); ball(im, 20, 18, 8, 9, SKIN); h2 = hairc2 or shade(hair, .3)
    if kind == 0: rect(im, 12, 9, 16, 5, hair); rect(im, 13, 8, 13, 2, h2); rect(im, 11, 12, 3, 6, hair); rect(im, 27, 12, 2, 6, hair); rect(im, 16, 23, 8, 2, hair)
    if kind == 1: ball(im, 20, 12, 10, 7, [shade(hair, -.3), hair, h2]); rect(im, 10, 13, 4, 14, hair); rect(im, 26, 13, 4, 14, hair); rect(im, 14, 15, 12, 2, SKIN[2])
    if kind == 2: ball(im, 20, 9, 5, 5, [hair, h2]); rect(im, 12, 11, 16, 4, hair); rect(im, 14, 10, 11, 2, h2)
    e = {0: 0, 1: 1, 2: -1}[look]
    for x in (15, 22):
        if gl: rect(im, x - 1, 16, 6, 5, INK); rect(im, x, 17, 4, 3, '#f4f8ff')
        rect(im, x + 1 + e, 17 + (1 if look == 2 else 0), 2, 2, INK)
    rect(im, 18, 25 if kind == 0 else 24, 4, 1, '#8f3848'); return outline(im)


def reviewer(k):
    im = new(88, 100); C = ['#2c1430', '#4a1f40', '#742c50', '#a84868']; b = [0, 2, 0, 0][k]
    poly(im, [(44, 4 + b), (72, 34 + b), (80, 94), (60, 86), (44, 96), (28, 86), (8, 94), (16, 34 + b)], C[1]); poly(im, [(44, 4 + b), (34, 36 + b), (28, 86), (8, 94), (16, 34 + b)], C[2]); poly(im, [(62, 30 + b), (72, 34 + b), (80, 94), (66, 88)], C[0]); ball(im, 44, 30 + b, 18, 19, ['#140a1c', '#1c1028', '#241632'])
    for x in (36, 52):
        if k == 3: line(im, x - 4, 24 + b, x + 4, 32 + b, '#fff', 2); line(im, x + 4, 24 + b, x - 4, 32 + b, '#fff', 2)
        else: ball(im, x, 28 + b, 5, 4 if k != 2 else 6, ['#c8202c', '#ff5050', '#ffd0c0']); rect(im, x - 1, 27 + b, 2, 3, INK)
    if k != 3: line(im, 29, 20 + b, 40, 25 + b, '#ff5050', 2); line(im, 59, 20 + b, 48, 25 + b, '#ff5050', 2)
    line(im, 38, 41 + b, 50, 41 + b - (2 if k == 2 else 0), '#ff8a80', 2)
    rect(im, 30, 52 + b, 28, 20, '#f6eed8'); rect(im, 30, 52 + b, 28, 2, RED); text(im, 'REVIEWER', 44 - twid('REVIEWER') // 2 + 1, 56 + b, RED) if False else text(im, 'NO', 41, 55 + b, RED); text(im, '2', 41, 61 + b, RED, 2)
    a = 70 if k != 2 else 74; line(im, a, 70 + b, 82, 42 + b - (10 if k == 2 else 0), RED, 5); line(im, 82, 42 + b - (10 if k == 2 else 0), 84, 34 + b - (10 if k == 2 else 0), '#fff', 2); ball(im, 14, 64 + b, 5, 5, SKIN); ball(im, a + 2, 64 + b, 5, 5, SKIN); return outline(im)


def sprites():
    S = {}; P = ['#141836', '#1f2448', '#38407a']
    S['grad'] = [leo(P, cap, 'stare', 0, gown=True), leo(P, cap, 'stare', 2, gown=True)]; S['grad_yay'] = [leo(P, cap, 'idle', 0, gown=True, arms=(1, 1)), leo(P, cap, 'idle', 1, gown=True, arms=(0, 1))]
    J = ['#4a3428', '#7a5840', '#a07a58']; S['profleo'] = [leo(J, None, 'stare', 0, tie='#3a6ea8', legs='#5a5470'), leo(J, None, 'idle', 1, tie='#3a6ea8', legs='#5a5470')]; S['coolleo'] = [leo(J, shades, 'stare', 0, tie='#f0bc42', legs='#5a5470', arms=(0, 1)), leo(J, shades, 'stare', 0, tie='#f0bc42', legs='#5a5470', arms=(1, 1))]
    U = ['#1c2438', '#2f3c5c', '#4c5f88']; S['suitleo'] = [leo(U, None, 'stare', 0, tie='#c8303c', legs='#2f3c5c'), leo(U, None, 'idle', 1, tie='#c8303c', legs='#2f3c5c', arms=(0, 1))]
    N = ['#1f5a5a', '#2f8a84', '#5fc0b0']; S['nemleo'] = [leo(N, chef, 'stare', 0, legs='#3a3450', arms=(0, 1)), leo(N, chef, 'stare', 0, legs='#3a3450'), leo(N, chef, 'stare', 2, legs='#3a3450', arms=(1, 1))]
    S['headleo'] = [outline(phase2.pad(head('stare', 0), 34, 22, 1, 2)), outline(phase2.pad(head('stare', 2), 34, 22, 1, 2))]
    SJ = ['#3a3428', '#5c5440', '#80765a']; S['sup'] = [person('#8a8494', SJ), person('#8a8494', SJ, look=2), person('#8a8494', SJ, look=1), person('#8a8494', SJ, arms=(0, 1))]
    f = new(24, 24); rect(f, 0, 0, 24, 24, '#4a4436'); paste(f, S['sup'][0].crop((8, 6, 32, 30)), 0, 0); S['face_sup'] = [f, f]
    S['comm_a'] = [person('#2c2038', ['#5a1f34', '#8f3848', '#b8606c'], 1), person('#2c2038', ['#5a1f34', '#8f3848', '#b8606c'], 1, look=1, arms=(1, 1))]; S['comm_b'] = [person('#b8b4c0', ['#1f3a5a', '#2f5c8c', '#5a8cc0'], 0), person('#b8b4c0', ['#1f3a5a', '#2f5c8c', '#5a8cc0'], 0, arms=(1, 1))]; S['comm_c'] = [person('#7a4420', ['#2a4a2c', '#447048', '#6a9a6a'], 2), person('#7a4420', ['#2a4a2c', '#447048', '#6a9a6a'], 2, arms=(1, 1))]
    S['taxman'] = [person('#1c1428', ['#14141c', '#2c2c38', '#4a4a5c'], 0, gl=True), person('#1c1428', ['#14141c', '#2c2c38', '#4a4a5c'], 0, arms=(1, 0))]
    hat = new(40, 48); rect(hat, 9, 8, 22, 3, '#14141c'); rect(hat, 13, 1, 14, 8, '#2c2c38'); rect(hat, 13, 6, 14, 2, RED); [paste(q, outline(hat), 0, 1) for q in S['taxman']]
    S['reviewer2'] = [reviewer(k) for k in range(4)]
    im = new(34, 34); ball(im, 17, 15, 13, 12, ['#5a2c78', '#8f50b0', '#c890e0', '#f4e0ff']); poly(im, [(12, 25), (9, 33), (19, 26)], '#8f50b0'); text(im, '?', 12, 8, '#fff6c0', 3); S['q_vague'] = [outline(im)]
    im = new(30, 28); ball(im, 13, 18, 11, 8, GOLD); ball(im, 20, 9, 6, 6, GOLD[1:]); poly(im, [(25, 9), (30, 11), (25, 12)], '#e0702c'); rect(im, 21, 7, 2, 2, INK); poly(im, [(6, 15), (14, 15), (8, 20)], GOLD[1]); S['q_odd'] = [outline(im)]
    im = new(30, 28); rect(im, 4, 9, 22, 16, '#a8b0c0'); rect(im, 4, 9, 22, 2, '#e8ecf4'); rect(im, 8, 4, 6, 7, '#c8884a'); rect(im, 16, 2, 6, 9, '#c8884a'); rect(im, 9, 4, 4, 1, '#f0c890'); rect(im, 22, 14, 3, 5, INK); S['q_odd'].append(outline(im))
    im = new(30, 28); ball(im, 13, 14, 10, 7, ['#2c5a9c', '#4a90d0', '#a8d8ff']); poly(im, [(22, 14), (29, 7), (29, 21)], '#4a90d0'); rect(im, 7, 11, 3, 3, '#fff'); rect(im, 8, 12, 1, 1, INK); S['q_odd'].append(outline(im))
    S['q_giant'] = []
    for k in range(2):
        im = new(116, 132); paste(im, book(96, 122, '#6a1f3c'), 8, 4); rect(im, 20, 18, 74, 92, '#8f2f50'); d = ImageDraw.Draw(im); d.rectangle([20, 18, 93, 109], outline=hexc('#f0c44c'), width=2); text(im, 'SECOND', 57 - twid('SECOND', 2) // 2, 26, '#fff0a0', 2); text(im, 'DISSERTATION', 57 - twid('DISSERTATION', 1) // 2, 40, '#fff0a0')
        for x in (40, 72): ball(im, x, 62, 10, 10, ['#c8c0b0', '#fff8ec', '#ffffff']); rect(im, x - 2, 60 + k * 2, 6, 7, INK)
        line(im, 28, 48, 47, 54, INK, 4); line(im, 85, 48, 66, 54, INK, 4); rect(im, 40, 82, 34, 16 - k * 5, '#2c1028'); [rect(im, x, 82, 5, 5, '#fff6e0') for x in range(42, 72, 8)]; text(im, '?', 5, 6, '#ff8a80', 4); S['q_giant'].append(outline(im))
    S['scope'] = []
    for k in range(4):
        im = new(40, 40); d = ImageDraw.Draw(im); ball(im, 20, 20, 14, 14, ['#1f6b5a', '#35a884', '#a0f0c8', '#f0fff8']); d.ellipse([8, 8, 31, 31], outline=hexc('#fff0a0'), width=2); line(im, 12, 28, 28, 12, '#fff', 3)
        for i in range(8): a = i * .785 + k * .2; line(im, 20 + math.cos(a) * 16, 20 + math.sin(a) * 16, 20 + math.cos(a) * 19, 20 + math.sin(a) * 19, '#fff0a0')
        S['scope'].append(outline(im))
    S['tc'] = []
    for s in ('[DELETE]', '[MOVED]', 'WHY?', '[???]', 'CITE!'): im = new(40, 14); rect(im, 1, 1, 38, 12, '#ffe0dc'); rect(im, 1, 1, 3, 12, RED); text(im, s, 22 - twid(s) // 2, 5, RED); S['tc'].append(outline(im))
    # letter
    im = new(180, 120); rect(im, 2, 2, 176, 116, '#f0e0bc'); poly(im, [(2, 118), (90, 52), (178, 118)], '#e4d0a4'); line(im, 2, 118, 90, 54, '#b89868', 2); line(im, 178, 118, 90, 54, '#b89868', 2); ImageDraw.Draw(im).rectangle([6, 6, 173, 113], outline=hexc('#d8b878')); S['envelope'] = [outline(im)]
    for k in range(2):
        im = new(180, 72)
        poly(im, [(2, 2), (178, 2), (90, 70)] if k == 0 else [(2, 70), (178, 70), (90, 2)], '#f8ecd0'); d = ImageDraw.Draw(im); d.line([(2, 2), (90, 70), (178, 2)] if k == 0 else [(2, 70), (90, 2), (178, 70)], fill=hexc('#b89868'), width=2); S.setdefault('flap', []).append(outline(im))
    im = new(44, 44); r = random.Random(4); ball(im, 22, 22, 18, 18, GOLD)
    for i in range(14): a = i * .449; ball(im, 22 + math.cos(a) * 17, 22 + math.sin(a) * 17, 4 + r.random() * 2, 4, GOLD)
    ball(im, 22, 22, 13, 13, GOLD[:3]); text(im, 'DR', 22 - twid('DR', 2) // 2, 17, '#fff6d0', 2); S['seal'] = [outline(im)]
    a1, b1 = S['seal'][0].copy(), S['seal'][0].copy(); a1.paste(new(22, 44), (22, 0)); b1.paste(new(22, 44), (0, 0)); S['seal'] += [a1, b1]
    # oracle
    S['crystal'] = []
    for k in range(4):
        im = new(112, 124); poly(im, [(28, 92), (84, 92), (96, 120), (16, 120)], GOLD[1]); poly(im, [(28, 92), (44, 92), (34, 120), (16, 120)], GOLD[2]); rect(im, 12, 117, 88, 5, GOLD[0]); rect(im, 22, 88, 68, 7, GOLD[2]); rect(im, 22, 88, 68, 2, GOLD[3]); ball(im, 56, 48, 44, 44, ['#1c1048', '#3a2488', '#6a50c8', '#b0a0f8', '#f0e8ff']); p = im.load()
        for y in range(6, 91):
            for x in range(13, 100):
                q = ((x - 56) ** 2 + (y - 48) ** 2) / 44 ** 2
                if q < .86:
                    v = math.sin(x * .09 + k * 1.57 + math.sin(y * .1 + k) * 2) + math.sin(y * .13 - k * 1.57)
                    if v > 1.05: p[x, y] = lerp(p[x, y], '#f8a8e8' if (x + y) % 3 else '#a8f0ff', .55)
        ball(im, 40, 28, 9, 6, ['#c8b8ff', '#ffffff']); [rect(im, int(56 + math.cos(i * 1.3 + k * .6) * 30), int(48 + math.sin(i * 1.7 + k * .5) * 28), 2, 2, '#fff6c0') for i in range(9)]; ball(im, 56, 106, 6, 6, ['#5a1f78', '#c060e0', '#ffd0ff']); S['crystal'].append(outline(im))
    im = new(26, 26); ball(im, 13, 15, 10, 10, ['#6a4a1c', '#a8803c', '#d8b45c']); poly(im, [(8, 6), (18, 6), (16, 1), (10, 1)], '#a8803c'); text(im, '$', 11, 13, '#fff0a0'); S['money'] = [outline(im)]
    im = new(24, 14); rect(im, 1, 1, 22, 12, '#4a9a5a'); rect(im, 3, 3, 18, 8, '#a8e0a0'); ball(im, 12, 7, 3, 3, ['#2f7a44', '#6ac080']); S['money'].append(outline(im))
    S['hustle'] = []
    for i, (t, c) in enumerate((('RICH', '#d8a83c'), ('5AM', '#3a6ea8'), ('GRIND', '#a83a4a'), ('SYNERGY', '#4a8f6a'), ('HUSTLE', '#8f5aa8'))): im = new(60, 20); paste(im, book(54, 14, c, False), 1, 2); rect(im, 15, 5, 34, 9, '#fff6e0'); text(im, t, 32 - twid(t) // 2, 7, c); S['hustle'].append(im)
    im = new(46, 34); rect(im, 1, 1, 44, 32, '#fffaf0'); line(im, 6, 28, 18, 20, RED, 2); line(im, 18, 20, 26, 24, RED, 2); line(im, 26, 24, 40, 5, RED, 2); text(im, 'STONKS', 4, 3, '#2f7a44'); S['plan'] = [outline(im)]; im = new(46, 34); rect(im, 1, 1, 44, 32, '#fff0c0'); text(im, 'STEP 1: ?', 5, 6, INK); text(im, 'STEP 2: $', 5, 15, INK); text(im, 'UBER 4 GOATS', 0, 25, RED); S['plan'].append(outline(im))
    S['wok'] = []
    for k in range(3):
        im = new(86, 46); poly(im, [(6, 14), (74, 14), (60, 34), (20, 34)], '#2c2c38'); rect(im, 4, 12, 72, 4, '#5a5a6c'); rect(im, 72, 12, 13, 4, '#7a4c2c'); rect(im, 10, 14, 60, 4, '#e0a030'); [ball(im, x, 13 - (i + k) % 2, 7, 4, ['#8a4a14', '#c8782c', '#f0b050']) for i, x in enumerate((20, 34, 48, 61))]; [ball(im, 14 + (i * 17 + k * 7) % 52, 15, 2, 2, ['#f8d060', '#fff6c0']) for i in range(5)]
        for i in range(5): poly(im, [(22 + i * 8, 44), (25 + i * 8, 35 - (i + k) % 3 * 2), (29 + i * 8, 44)], ['#ff8a30', '#ffd050', '#ff6030'][(i + k) % 3])
        rect(im, 14, 42, 54, 3, '#3a3a48'); S['wok'].append(outline(im))
    im = new(24, 14); ball(im, 12, 7, 10, 5, ['#8a4a14', '#c8782c', '#f0b050', '#ffe0a0']); line(im, 5, 5, 8, 10, '#8a4a14'); line(im, 12, 3, 15, 11, '#8a4a14'); S['nem'] = [outline(im)]
    # kitchen, hall, office backdrops for vignettes (baked 240x130)
    def frame(fill): im = new(240, 130); rect(im, 0, 0, 240, 130, fill); return im
    k = frame('#f0d8a0'); [rect(k, x, y, 15, 11, '#f8e8c0' if (x // 16 + y // 12) % 2 else '#a8d8c8') for x in range(0, 240, 16) for y in range(0, 84, 12)]; rect(k, 0, 88, 240, 42, '#8f5a3c'); rect(k, 0, 88, 240, 4, '#c88a5c'); rect(k, 8, 12, 60, 44, '#6b3f24'); rect(k, 12, 16, 52, 36, '#86c8f0'); poly(k, [(12, 52), (30, 30), (44, 46), (54, 36), (64, 52)], '#4a9a5a'); rect(k, 37, 16, 2, 36, '#6b3f24'); rect(k, 150, 18, 78, 5, '#6b3f24'); [ball(k, x, 10, 6, 8, [c, shade(c, .4)]) for x, c in ((160, '#c8484f'), (176, '#d8a83c'), (192, '#4a8f6a'), (210, '#a83a3a'))]; [rect(k, x, 4, 3, 24, '#c8484f') for x in (86, 92, 98)]; ball(k, 124, 22, 13, 15, ['#a8202c', '#e0404a', '#ff9a80']); rect(k, 118, 5, 12, 3, '#f0c44c'); rect(k, 118, 36, 12, 3, '#f0c44c'); rect(k, 123, 39, 2, 9, '#f0c44c'); text(k, 'NEM', 176, 44, RED, 3); text(k, '24/7', 182, 64, '#2f6b6b', 2); S['vg_nem'] = [k]
    o = frame('#c8dcf0'); [rect(o, x, 0, 1, 90, '#8fa8c8') for x in range(0, 240, 40)]
    for i in range(12): h = 30 + (i * 37) % 48; rect(o, i * 20, 90 - h, 17, h, ['#8fa8d0', '#7a94c0', '#a0b8dc'][i % 3]); [rect(o, i * 20 + 3 + a * 5, 94 - h + q * 8, 3, 4, '#fff0b0') for a in range(3) for q in range(max(0, h // 8 - 1)) if (a + q + i) % 3]
    rect(o, 0, 90, 240, 40, '#4c5470'); rect(o, 0, 90, 240, 3, '#8a94b0'); S['vg_suit'] = [o]
    c = frame('#5a3a44'); [rect(c, x, 0, 18, 92, '#6a4650' if x % 40 else '#7a5058') for x in range(0, 240, 20)]; rect(c, 24, 14, 92, 50, '#8f5a30'); rect(c, 28, 18, 84, 42, '#244a3c'); text(c, 'E = MC HMMM', 34, 26, '#d8f0e0'); text(c, 'TAX = ?', 34, 38, '#d8f0e0', 2); rect(c, 0, 92, 240, 38, '#7a4c2c'); rect(c, 0, 92, 240, 3, '#c08a5c'); paste(c, bg.shelf(60, 76, bg.WOOD, 4), 168, 16); S['vg_class'] = [c]
    g = frame('#3a2c10'); p = g.load()
    for y in range(130):
        for x in range(240): p[x, y] = ramp_at(['#7a4c12', '#c08526', '#f0bc42', '#fff0a0'], 1 - math.hypot(x - 120, y - 60) / 130 + .15 * math.sin(math.atan2(y - 60, x - 120) * 12), x, y)
    for i in range(5): paste(g, things.coinpile(90, 44 + i * 5, i), i * 46 - 18, 130 - 44 - i * 5)
    S['vg_money'] = [g]
    u = frame('#e8e0f0'); [rect(u, x, 0, 1, 130, '#d8cce4') for x in range(0, 240, 12)]; rect(u, 0, 100, 240, 30, '#8a7a9c'); rect(u, 0, 100, 240, 3, '#b8a8cc'); text(u, 'GARAGE STARTUP', 14, 12, '#8f5aa8', 2); text(u, 'PRE-REVENUE. PRE-PRODUCT. PRE-IDEA.', 16, 28, '#a83a4a'); rect(u, 180, 34, 50, 34, '#5a5470'); rect(u, 184, 38, 42, 26, '#2c2c48'); line(u, 188, 58, 200, 50, '#6ae08a', 2); line(u, 200, 50, 222, 62, '#ff6060', 2); S['vg_hustle'] = [u]
    im = new(20, 26); ball(im, 10, 13, 8, 11, ['#e0a83c', '#fff0a0']); S['lantern'] = [outline(im)]
    # icons
    a = new(30, 30); [line(a, 15, 15, 15 + math.cos(i * .524) * 17, 15 + math.sin(i * .524) * 17, '#fff0a0') for i in range(12)]; paste(a, S['sup'][0].crop((7, 5, 33, 32)), 2, 2); S['icon_notbad'] = [ui.frame_icon(a, ('#7a4c12', '#c08526', '#f8d86c'))]
    a = new(30, 30); paste(a, ui.fit(S['reviewer2'][3], 24, 28), 3, 1); line(a, 3, 27, 27, 3, '#6ae08a', 3); S['icon_reviewers'] = [ui.frame_icon(a, ('#4a1f2c', '#8f3040', '#e06060'))]
    a = new(30, 30); paste(a, S['grad'][0].crop((2, 0, 38, 30)), -3, 1); S['icon_phd'] = [ui.frame_icon(a, ('#2a3a7a', '#4a60b8', '#a8c0ff'))]
    return S


def horizon():
    """Beyond the summit: the climbed mountain is small; the world goes on."""
    w, h = 960, 540; im = bg.sky(['#28346c', '#4a5fa8', '#8f90cc', '#e8a8b0', '#ffd0a0', '#fff0c8'], (640, 250, 24, '#fff8e0', '#ffe0a0'), 60, w, h)
    MT = ['#5a5f9c', '#7a7cb4', '#a09cc8', '#d0c4dc']; SN = ['#c8b8dc', '#f0d8dc', '#ffece0', '#ffffff']
    paste(im, tint(ui.bigmountain(w, h, [(520, 120, .5), (690, 60, .62), (860, 100, .55), (300, 150, .42), (120, 180, .4)], 91, MT, SN, 180, 420), '#e8b8b8', .3), 0, 0)
    c = bg.clouds(['#d8a8b8', '#f0c8c0', '#ffe4d0', '#fff6ec'], 12, 7, 150, 260, 2); paste(im, c, 0, 20); paste(im, c, 512, 20)
    paste(im, ui.bigmountain(w, h, [(820, 62, .78), (640, 170, .66), (420, 226, .5)], 44, ['#3c4a80', '#54689c', '#7890b8', '#a8bcd8'], SN, 200, 500), 0, 0)
    # sea and lake with sun path
    for y in range(392, 470):
        for x in range(w):
            if x > 250 + (470 - y) * .6 + math.sin(y * .3) * 6 and x < 960: q_ = ramp_at(['#3a6aa8', '#5a90c8', '#90c0e0', '#ffe8c0'], .3 + .5 * math.exp(-((x - 640) / 70) ** 2) + .14 * math.sin(x * .2 + y * 1.7), x, y); im.putpixel((x, y), lerp(im.getpixel((x, y)), q_, min(1, (y - 388) / 22 + .1 * math.sin(x * .07))))
    for cx, top, wd, s in ((330, 424, 110, 3), (560, 440, 90, 4), (820, 418, 140, 5)): # wooded islands
        for x in range(cx - wd, cx + wd):
            y0 = top + ((x - cx) / wd) ** 2 * 34 + math.sin(x * .2 + s) * 2
            for y in range(int(y0), int(top + 38)): im.putpixel((min(w - 1, x), y), ramp_at(['#2f6b5c', '#458a68', '#70b078', '#b0d890'], .8 - (y - y0) / 40 + .2 * math.sin(x * .5 + y), x, y))
        for i in range(9): t = 12 + i * 5 % 9; paste(im, bg.tree(t, int(t * 1.5), bg.LEAF_D, i + s * 10), cx - wd // 2 + i * wd // 9, top - 6 - t // 3)
    m = ui.bigmountain(700, 270, [(400, 18, .7), (280, 127, .46), (165, 182, .37), (55, 224, .3)], 51, ['#34467c', '#4c6298', '#7088b8', '#a4b8d8'], ui.SN, 79, 265); paste(im, m, 60, 270)
    v = phase2.vista(False).resize((480, 270), Image.LANCZOS); paste(im, v, 60, 270)
    g = bg.mountains(77, 522, 8, ['#2f6b4c', '#458a58', '#6aa868', '#a8d080'], w=w, h=h, haze='#5a9c78', rough=.5); paste(im, g, 0, 0)
    for i, (x, y, t) in enumerate(((20, 520, 30), (90, 530, 24), (560, 516, 26), (640, 532, 34), (740, 520, 26), (820, 536, 34), (910, 522, 30), (480, 534, 26))): paste(im, bg.tree(t, int(t * 1.45), bg.LEAF, i + 50), x, y - int(t * 1.4))
    for P in ([(556, 520), (610, 500), (700, 488), (780, 470)], [(640, 400), (668, 340), (640, 290), (690, 250)], [(800, 400), (850, 320), (800, 240), (836, 160), (818, 90)]):  # many trails, all optional
        for (a, b), (cc, d) in zip(P, P[1:]):
            n = int(math.hypot(cc - a, d - b))
            for t in range(0, n, 7): rect(im, int(a + (cc - a) * t / n + math.sin(t / n * 3.1) * 6), int(b + (d - b) * t / n), 3, 1, '#fff0b8')
    return im


def main():
    S = sprites(); at = Image.open(f'{OUT}/atlas.png').convert('RGBA'); meta = json.load(open(f'{OUT}/atlas.json')); M = meta['meta']; base = M.get('phase2end', at.height)
    for n in M.get('phase3', []): M['counts'].pop(n, None); meta['frames'] = {k: v for k, v in meta['frames'].items() if k.rsplit('/', 1)[0] != n}
    at = at.crop((0, 0, 1024, base)); items = sorted([(n, i, f) for n, fr in S.items() for i, f in enumerate(fr)], key=lambda t: (-t[2].height, t[0], t[1])); x, y, rh, pos = 1, base + 2, 0, []
    for n, i, f in items:
        if x + f.width + 2 > 1024: x = 1; y += rh + 2; rh = 0
        pos.append((n, i, f, x, y)); x += f.width + 2; rh = max(rh, f.height)
    out = new(1024, y + rh + 2); out.paste(at, (0, 0))
    for n, i, f, x, y in pos: paste(out, f, x, y); meta['frames'][f'{n}/{i}'] = dict(frame=dict(x=x, y=y, w=f.width, h=f.height), rotated=False, trimmed=False, spriteSourceSize=dict(x=0, y=0, w=f.width, h=f.height), sourceSize=dict(w=f.width, h=f.height))
    for n, fr in S.items(): M['counts'][n] = len(fr)
    M.update(phase2end=base, phase3=list(S), size={'w': 1024, 'h': out.height}); out.save(f'{OUT}/atlas.png', optimize=True); json.dump(meta, open(f'{OUT}/atlas.json', 'w')); print('atlas', out.size)
    horizon().save(f'{OUT}/horizon.png', optimize=True)
    if len(sys.argv) > 1:
        c = out.crop((0, base, 1024, out.height)); c = c.resize((1536, c.height * 3 // 2), 0); o = Image.new('RGBA', c.size, (110, 150, 190, 255)); paste(o, c, 0, 0); o.save(sys.argv[1])


main()
