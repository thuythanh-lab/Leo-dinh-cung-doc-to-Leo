"""Character sprites. Every humanoid is a head (ASCII) + a posed body rig, on 32x32 frames, feet at y=31."""
from px import *
import math

SK, SK2 = '#f4c9a0', '#d99a78'
# ---------------------------------------------------------------- heads (16 wide, face right)
LEO_H = [
    "......hh....h.....",
    "..hh..hhh..hh..h..",
    "...hhhhhhhhhhhhh..",
    "hh.hhhHHhhhhhhh...",
    ".hhhhHhhhhHHhhhhhh",
    "..hhhhhhhhhhHhhhh.",
    "hhhhHhhhhhhhhhhhh.",
    ".hhhhhhhshhhshhhh.",
    "..hhhhhssshssshh..",
    ".hhhhsgggsgggsshh.",
    ".hhhsgwwwgwwwgsh..",
    "..hgggwwwgwwwgs...",
    "..hhsgwwegwwegs...",
    "..sSsgwwegwwegs...",
    "...SssgggsgggSs...",
    "...SsssssssssSs...",
    "....Ssssmmsss.....",
    ".....SSSSSSS......",
]
LEO_P = dict(h='#3a2418', H='#6b452b', s=SK, S=SK2, g='#1b1426', w='#eaf6ff', e='#2c5a3c', m='#a4505a')
RA_H = [
    ".......kkkk.....",
    "......kKkkkk....",
    "......kkkkkk....",
    "....hhhHHhhhhh..",
    "...hhHHhhhhHhhh.",
    "..hhHhhhhhhhhhh.",
    "..hhhhhhhhhhhhh.",
    "..hhhhshhhsshhs.",
    "..phhssssssssss.",
    ".pPphsssssssss..",
    ".pPpsswessswess.",
    ".pPpsswessswess.",
    "..ppsSsssssssSs.",
    "...hssssssssss..",
    "...hhSssmmmss...",
    ".....hSSSSSS....",
]
RA_P = dict(h='#b8562c', H='#ec8f4a', k='#9c4526', K='#ec8f4a', s='#f7d3ae', S='#dfa283', w='#ffffff', e='#24405e', m='#a4505a', p='#2f3d63', P='#5f7bb8')

OLD_M = [  # the Supervisor-ish campus professor NPC
    "................",
    "....qqqqqqqq....",
    "..qqQQqqqqqqqq..",
    ".qqQsssssssqqqq.",
    ".qqssssssssssqqq",
    ".qqssssssssssqq.",
    ".qqsbbbssbbbsq..",
    "..qggggsggggs...",
    "..sgxegggxeggs..",
    "..ssggsssggss...",
    "...sssSSSsss....",
    "...qqqqqqqqq....",
    "...qqqmmmqqq....",
    "....qqqqqqq.....",
    ".....qqqqq......",
    "......qqq.......",
]
OLD_P = dict(q='#c9c5d4', Q='#f3f1fa', s=SK, S=SK2, b='#8f8aa0', g='#4a3b30', x='#f5fbff', e='#2b2338', m='#a4505a')
STU_H = [
    "................",
    "....hhhhhhhh....",
    "..hhhHHHhhhhhh..",
    ".hhHHhhhhhhhhhh.",
    ".hhhhhhhhhhhhhh.",
    ".hhhhhhhhhhhhhh.",
    ".hhhsshhhsshhhh.",
    ".hhssssssssssh..",
    ".hhssssssssssh..",
    ".hhsswessswessh.",
    ".hhsswessswessh.",
    ".hhsSssssssssSh.",
    ".hhhsssssssssh..",
    ".hhhhSsssmmss...",
    ".hhh..SSSSSS....",
]
STU_P = dict(h='#1f1c2e', H='#474069', s='#eec39a', S='#c98f6c', w='#ffffff', e='#1f1c2e', m='#a4505a')
MAR_H = [
    ".....hhhhhh.....",
    "...hhHHHHhhhh...",
    "..hHHHhhhhHHhh..",
    ".hhHhhhhhhhhHhh.",
    ".hHhhhhhhhhhhhh.",
    ".hhhhhhshhhhhhh.",
    ".hhhhssssshhhhh.",
    ".hhhsssssssshhh.",
    ".hhhsssssssssh..",
    "..hhsswessswess.",
    "..hhsswessswess.",
    "..hhsSssssssSss.",
    "...hsssssssssh..",
    "...hhsssmmmsh...",
    "....hhSSSSSh....",
]
MAR_P = dict(h='#8a6a3e', H='#c9a565', s='#f6d0ac', S='#dba283', w='#fff', e='#2d5f86', m='#b05a62')
DON_H = [
    ".....hhhhhh.....",
    "...hhhHHhhhhh...",
    "..hhHHHhHHHhhh..",
    ".hhHHhhHhhhHhhh.",
    ".hHhhhhhhhhhhhh.",
    ".hhhhhhhhhhhhhhh",
    "..hhhssshhsshhh.",
    ".hhhssssssssshh.",
    "..hhsssssssss...",
    "..hgggggsgggg...",
    "..hsgwegsgweg...",
    "..ssgggsssggg...",
    "..sSsssssssSs...",
    "...ssssmmmmss...",
    "....ssssmmss....",
    ".....SSSSSS.....",
]
DON_P = dict(h='#8e8a9c', H='#d4d1de', s='#f4cda9', S='#d79f80', w='#fff', e='#3f6b3a', m='#b4525a', g='#6a3f7d')
SLS_H = [
    ".....hhhhhhh....",
    "...hhhHHHhhhhh..",
    "..hhHHhhhhHHhhh.",
    ".hhHhhhhhhhhHhhh",
    ".hHhhhhhhhhhhhh.",
    "hhhhhhsshhhhhhhh",
    ".hhhhssssshhhhh.",
    "hhhhssssssssshh.",
    "hhhhsssssssssshh",
    ".hhhsswessswesh.",
    "hhhhsswessswessh",
    ".hhhsSssssssSshh",
    "hhhhhssssssssshh",
    ".hhhhhssmmmsshh.",
    "hhhhhh.SSSSShhh.",
    ".hhh..........h.",
]
SLS_P = dict(h='#6d5fb0', H='#c3b8ff', s='#e9e2ff', S='#b7a9ea', w='#fff', e='#4a3f8f', m='#8f78cf')

# ---------------------------------------------------------------- outfits
LEO_O = dict(coat='#2d2f55', coat2='#1f2040', coatl='#454a7d', trim='#c9a04a', shirt='#e9e2d0', scarf='#2f9c95', scarf2='#1f6d6b',
             leg='#4a4350', leg2='#38323f', shoe='#5b3826', skin=SK, skin2=SK2, bag='#a56a35', bag2='#7b4a24', strap='#8a5428')
RA_O = dict(coat='#4f9a4a', coat2='#357037', coatl='#7cc46a', trim='#e8f0d8', shirt='#f5efe0', scarf=None, scarf2=None,
            leg='#3b5488', leg2='#2d4170', shoe='#e8e4ee', skin='#f7d3ae', skin2='#dfa283', bag=None, bag2=None, strap='#e2564f')
PROF_O = dict(coat='#7a4a32', coat2='#593322', coatl='#a0684a', trim='#d9b070', shirt='#e9e2d0', scarf='#a83a3a', scarf2='#7d2a30',
              leg='#4b4454', leg2='#3a3443', shoe='#3a261c', skin=SK, skin2=SK2, bag=None, bag2=None, strap=None)
STU_O = dict(coat='#c65a6c', coat2='#973e54', coatl='#e88592', trim='#ffe0a8', shirt='#fff', scarf=None, scarf2=None,
             leg='#4a5a8a', leg2='#384570', shoe='#f0eaf0', skin='#eec39a', skin2='#c98f6c', bag='#e0b23e', bag2='#b0832c', strap='#b0832c')


def rig(head, pal, o, hx=0, hy=0, lean=0, bob=0, feet=((-3, 0), (3, 0)), front=(2, 7), back=(-3, 6), tail=0, eyes=None, item=None,
        robe=True, hidebag=False, W=32, H=36, long=False):
    """feet: (dx,dy) from neutral; front/back: hand offset from shoulder."""
    im = new(W, H); cx = W // 2 - 1; base = H - 1
    hipy = base - 6 + bob; shy = hipy - 7; tx = cx + lean
    bsh = (tx - 2, shy + 1); fsh = (tx + 2, shy + 1)

    def limb(a, b, c, c2, w=3):
        line(im, *a, *b, c2, w); line(im, a[0], a[1] - 1, b[0], b[1] - 1, c, w - 1)
    # back arm
    bh = (bsh[0] + back[0], bsh[1] + back[1]); limb(bsh, bh, o['coat2'], o['coat2'])
    rect(im, bh[0] - 1, bh[1] - 1, 2, 2, o['skin2'])
    # legs
    for k, (fx, fy) in enumerate(feet):
        hip = (cx + (-2 if k == 0 else 1), hipy); ft = (cx + fx, base - 1 + fy)
        c = o['leg2'] if k == 0 else o['leg']
        kn = ((hip[0] + ft[0]) / 2 + (1 if fy < 0 else 0), (hip[1] + ft[1]) / 2)
        line(im, *hip, *kn, c, 3); line(im, *kn, ft[0], ft[1] - 1, c, 3)
        rect(im, int(ft[0]) - 1, int(ft[1]) - 1, 4, 2, o['shoe'])
        rect(im, int(ft[0]) - 1, int(ft[1]), 4, 1, shade(o['shoe'], -.35))
    # coat tail
    if robe:
        ln = 5 if long else 3
        poly(im, [(tx - 4, shy + 3), (tx + 3, shy + 3), (cx + 3 + max(0, tail) * .5, hipy + ln), (cx - 6 + tail, hipy + ln)], o['coat2'])
        poly(im, [(tx - 3, shy + 3), (tx + 3, shy + 3), (cx + 2, hipy + ln - 1), (cx - 4 + tail, hipy + ln - 1)], o['coat'])
        line(im, cx - 5 + tail, hipy + ln, cx + 2, hipy + ln, o['trim'])
    # torso
    poly(im, [(tx - 4, shy), (tx + 4, shy), (cx + 4, hipy), (cx - 4, hipy)], o['coat'])
    line(im, tx - 4, shy, cx - 4, hipy, o['coat2'], 2)
    rect(im, tx + 1, shy, 3, 7, o['shirt']); rect(im, tx + 3, shy + 1, 1, 6, shade(o['shirt'], -.2))
    line(im, tx + 1, shy, cx + 1, hipy, o['coatl'])
    if o['strap']:
        line(im, tx - 4, shy, cx + 3, hipy - 1, o['strap'])
    if o['bag'] and not hidebag:
        bx, by = cx - 8 + (tail // 2), hipy - 4
        rect(im, bx, by, 7, 6, o['bag']); rect(im, bx, by + 4, 7, 2, o['bag2']); rect(im, bx, by, 7, 2, shade(o['bag'], .2))
        rect(im, bx + 3, by + 2, 1, 2, '#f0d070'); rect(im, bx + 1, by - 1, 3, 1, '#f5efe0')
    # head
    hd = art(head, pal)
    if eyes: hd = eye_edit(hd, head, pal, eyes)
    paste(im, hd, cx - 8 + lean + hx, shy - len(head) + hy)
    # scarf
    if o['scarf']:
        rect(im, tx - 4, shy - 1, 9, 2, o['scarf']); rect(im, tx - 4, shy + 1, 8, 1, o['scarf2'])
        line(im, tx - 4, shy, tx - 7 + min(0, tail), shy + 3 - (abs(tail) // 2), o['scarf'], 2)
        rect(im, tx + 2, shy + 1, 2, 4, o['scarf']); rect(im, tx + 2, shy + 4, 2, 1, o['scarf2'])
    # front arm
    fh = (fsh[0] + front[0], fsh[1] + front[1]); limb(fsh, fh, o['coatl'], o['coat'])
    rect(im, int(fh[0]) - 1, int(fh[1]) - 1, 3, 2, o['skin'])
    if item == 'pen':
        line(im, fh[0], fh[1], fh[0] + 5, fh[1] - 3, '#f0d070', 1); line(im, fh[0] + 1, fh[1] + 1, fh[0] + 4, fh[1] - 1, '#b07a2a', 1)
        im.putpixel((min(W - 1, int(fh[0]) + 5), max(0, int(fh[1]) - 4)), hexc('#9ff5ff'))
    if item == 'penup':
        line(im, fh[0], fh[1], fh[0] + 1, fh[1] - 6, '#f0d070', 2); rect(im, int(fh[0]) + 1, max(0, int(fh[1]) - 8), 1, 2, '#9ff5ff')
    if item == 'cup':
        x, y = int(fh[0]), int(fh[1]) - 4; rect(im, x, y, 4, 4, '#f8f4ea'); rect(im, x, y, 4, 1, '#6a3c22'); rect(im, x, y + 2, 4, 1, '#c65a4c')
    if item == 'phone':
        x, y = int(fh[0]), int(fh[1]) - 4; rect(im, x, y, 4, 6, '#22202e'); rect(im, x + 1, y + 1, 2, 4, '#8fe3ff')
    if item == 'papers':
        x, y = int(fh[0]) - 1, int(fh[1]) - 3; rect(im, x, y, 6, 6, '#fbf6e6'); rect(im, x + 1, y + 1, 4, 1, '#9a93b0'); rect(im, x + 1, y + 3, 3, 1, '#9a93b0')
    return outline(im)


def hd_pad(hd):
    n = new(hd.width, hd.height); n.alpha_composite(hd); return n


def eye_edit(hd, head, pal, mode):
    p = hd.load()
    for y, r in enumerate(head):
        for x, ch in enumerate(r):
            if ch in 'we' or (ch == 'x'):
                above = head[y - 1][x] if y and x < len(head[y - 1]) else '.'
                below = head[y + 1][x] if y + 1 < len(head) and x < len(head[y + 1]) else '.'
                first = above not in 'wex'; last = below not in 'wex'
                glasses = 'g' in pal and pal.get('w') == '#eaf6ff'
                if mode == 'blink':
                    p[x, y] = hexc(pal['g'] if glasses and last else pal['e'] if last else pal['s'])
                elif mode == 'glint':
                    p[x, y] = hexc('#ffffff' if (x + y) % 3 else '#bfe9ff')
                elif mode == 'hurt':
                    p[x, y] = hexc('#ffffff' if not (x + y) % 2 else '#7a3040')
                elif mode == 'wide':
                    p[x, y] = hexc('#ffffff') if not last else hexc(pal['e'])
                elif mode == 'away':
                    p[x, y] = hexc(pal['e'] if (first and ch == 'e') else '#eaf6ff')
                elif mode == 'down':
                    p[x, y] = hexc(pal['e'] if last else pal['s'] if first else '#eaf6ff')
                elif mode == 'happy':
                    p[x, y] = hexc(pal['e'] if first else pal['s'])
    return hd


def run_cycle(h, p, o, n=8, **k):
    out = []
    for i in range(n):
        a = i / n * 2 * math.pi
        f = lambda ph: (round(5.5 * math.cos(a + ph)), round(min(0, -4.2 * math.sin(a + ph))))
        out.append(rig(h, p, o, lean=1, bob=-1 if i % (n // 2) in (1, 2) else 0, feet=(f(math.pi), f(0)),
                       front=(round(4 * math.cos(a + math.pi)) + 1, 5), back=(round(4 * math.cos(a)) - 1, 5), tail=-2 - (i % 2), **k))
    return out


def leo():
    H, P, O = LEO_H, LEO_P, LEO_O; R = lambda **k: rig(H, P, O, **k); A = {}
    A['idle'] = [R(), R(), R(bob=0, hy=1), R(hy=1), R(hy=1), R(), R(eyes='blink'), R()]
    A['run'] = run_cycle(H, P, O)
    A['jump'] = [R(feet=((-4, -1), (3, -4)), front=(4, -2), back=(-5, 2), tail=1, hy=0, bob=-1), R(feet=((-3, -2), (3, -3)), front=(4, -3), back=(-5, 1), tail=1, bob=-1)]
    A['fall'] = [R(feet=((-5, -2), (3, -1)), front=(5, 0), back=(-5, -2), tail=-2, hy=-1, bob=-1, eyes='wide'), R(feet=((-5, -1), (4, -2)), front=(5, -1), back=(-5, -1), tail=-1, hy=-1, bob=-1, eyes='wide')]
    A['land'] = [R(feet=((-5, 0), (5, 0)), bob=3, hy=1, front=(4, 5), back=(-5, 5), tail=-1, eyes='blink'), R(feet=((-4, 0), (4, 0)), bob=1, hy=1)]
    A['slide'] = [slide(0), slide(1)]
    A['climb'] = [R(feet=((-3, -3), (2, 0)), front=(4, -4), back=(0, 2), eyes=None), R(feet=((-2, -1), (3, -2)), front=(4, -1), back=(1, -2)),
                  R(feet=((-3, 0), (2, -3)), front=(3, 2), back=(2, -4)), R(feet=((-2, -2), (3, -1)), front=(4, -1), back=(1, -2))]
    A['cast'] = [R(front=(-1, 2), item='penup', lean=-1, feet=((-4, 0), (3, 0))), R(front=(6, 1), item='pen', lean=1, feet=((-5, 0), (4, 0)), eyes='glint', tail=-2),
                 R(front=(6, 2), item='pen', lean=1, feet=((-5, 0), (4, 0)), tail=-1), R(front=(4, 4), item='pen', feet=((-4, 0), (3, 0)))]
    A['hurt'] = [R(lean=-2, feet=((-2, -3), (5, -2)), front=(4, -3), back=(-5, -3), eyes='hurt', tail=2, hy=0, bob=-1), R(lean=-2, feet=((-1, -2), (5, -3)), front=(4, -4), back=(-5, -2), eyes='hurt', tail=3, bob=-1)]
    A['talk'] = [R(front=(5, 3)), R(front=(5, 1), hy=1), R(front=(5, 3)), R(front=(4, 4), hy=1)]
    A['celebrate'] = [R(front=(3, -8), back=(-4, -7), item='penup', eyes='happy', bob=1), R(front=(3, -9), back=(-4, -8), item='penup', eyes='happy', bob=-1, feet=((-4, -2), (4, -2))),
                      R(front=(4, -9), back=(-3, -8), item='penup', eyes='happy', bob=-2, feet=((-4, -3), (4, -3))), R(front=(3, -8), back=(-4, -7), item='penup', eyes='happy', bob=0)]
    A['sit'] = [sit(0), sit(0), sit(1), sit(1)]
    A['glasses'] = [R(front=(3, 2)), R(front=(4, -4)), R(front=(4, -5), eyes='glint'), R(front=(4, -5), eyes='glint'), R(front=(4, -4)), R()]
    A['email'] = [R(front=(4, 3), item='phone', eyes='down'), R(front=(4, 3), item='phone', eyes='down'), R(front=(4, 3), item='phone', eyes='wide'),
                  R(front=(4, 3), item='phone', eyes='hurt', hy=1), R(front=(2, 6), item='phone', eyes='away', hy=0), R(front=(2, 6), eyes='blink', hy=1)]
    A['coffee'] = [R(front=(3, 4), item='cup'), R(front=(3, 0), item='cup'), R(front=(3, -2), item='cup', eyes='blink'), R(front=(3, -2), item='cup', eyes='blink', hy=1), R(front=(3, 2), item='cup', eyes='happy'), R(front=(3, 4), item='cup', eyes='happy')]
    A['stare'] = [R(eyes='away', hy=-1), R(eyes='away', hy=-1), R(eyes='away'), R(eyes='away', hy=1), R(eyes='blink', hy=1), R(eyes='away', hy=1)]
    A['carry'] = [R(front=(5, 1), item='papers', eyes=None), R(front=(5, 2), item='papers', hy=1)]
    return A


def drop(im):
    n = new(32, 36); n.alpha_composite(im.crop((0, 0, 32, 32)), (0, 4)); return n


def slide(i):
    im = new(32, 36); hd = eye_edit(art(LEO_H, LEO_P), LEO_H, LEO_P, 'glint'); O = LEO_O
    # leaning back, legs forward
    poly(im, [(7, 24), (14, 21), (20, 27), (9, 31)], O['coat']); line(im, 5, 27, 15, 30, O['coat2'], 3)
    line(im, 16, 28, 27, 29 - i, O['leg'], 3); line(im, 15, 30, 25, 30, O['leg2'], 2); rect(im, 26, 27 - i, 3, 4, O['shoe'])
    line(im, 2, 29 - i, 9, 29, O['coat2'], 3); line(im, 3, 30, 8, 30, O['trim'])
    line(im, 11, 24, 5, 27, O['coatl'], 3); rect(im, 3, 27, 3, 2, O['skin'])
    paste(im, hd, 5, 7); rect(im, 8, 24, 8, 2, O['scarf']); line(im, 8, 24, 3, 22 - i, O['scarf'], 2)
    return drop(outline(im))


def sit(i):
    im = new(32, 36); O = LEO_O
    hd = eye_edit(art(LEO_H, LEO_P), LEO_H, LEO_P, 'away' if not i else 'blink')
    poly(im, [(9, 21), (18, 21), (20, 30), (8, 30)], O['coat']); line(im, 9, 21, 8, 30, O['coat2'], 2); rect(im, 15, 21, 3, 6, O['shirt'])
    line(im, 17, 29, 24, 28, O['leg'], 3); line(im, 15, 30, 24, 30, O['leg2'], 2); rect(im, 24, 26, 3, 5, O['shoe'])
    rect(im, 2, 25, 7, 6, O['bag']); rect(im, 2, 29, 7, 2, O['bag2']); rect(im, 2, 25, 7, 2, shade(O['bag'], .2))
    line(im, 16, 23, 20, 27, O['coatl'], 3); rect(im, 20, 26, 2, 2, O['skin'])
    paste(im, hd, 6, 3 + i); rect(im, 9, 20 + i, 9, 2, O['scarf'])
    return drop(outline(im))


def ra():
    H, P, O = RA_H, RA_P, RA_O; R = lambda **k: rig(H, P, O, **k); A = {}
    A['idle'] = [R(), R(hy=1), R(hy=1), R(eyes='blink')]
    A['run'] = run_cycle(H, P, O)
    A['jump'] = [R(feet=((-4, -1), (3, -4)), front=(4, -2), back=(-5, 2), tail=1, bob=-1)]
    A['attack'] = [R(front=(-3, -3), lean=-1, item='papers'), R(front=(6, -2), lean=2, feet=((-5, 0), (5, 0)), eyes='wide'), R(front=(7, 1), lean=2, feet=((-5, 0), (5, 0)), eyes='hurt'), R(front=(5, 4), lean=1)]
    A['wave'] = [R(front=(4, -7), eyes='happy'), R(front=(6, -6), eyes='happy', hy=1), R(front=(3, -8), eyes='happy'), R(front=(6, -6), eyes='happy', hy=1)]
    A['shrug'] = [R(front=(5, 2), back=(-6, 2), eyes='blink', hy=1), R(front=(5, 1), back=(-6, 1), eyes='away')]
    return A


def npc(h, p, o, **k):
    R = lambda **q: rig(h, p, o, **{**k, **q})
    return {'idle': [R(), R(hy=1), R(hy=1), R(eyes='blink')], 'talk': [R(front=(5, 2)), R(front=(5, 4), hy=1)]}


def scholar(head, pal, o, kind):
    """Robed scholar, 40x44, with an attribute that stands for the work."""
    fr = []
    for i in range(4):
        im = new(48, 48); cx = 23; sw = [0, 1, 0, -1][i]; by = 47 - (1 if i in (1, 2) else 0)
        poly(im, [(cx - 6, 24), (cx + 6, 24), (cx + 11 + sw, 46), (cx - 11 + sw, 46)], o['coat2'])
        poly(im, [(cx - 5, 24), (cx + 5, 24), (cx + 8 + sw, 45), (cx - 8 + sw, 45)], o['coat'])
        for k, xx in enumerate((-5, 0, 5)):
            line(im, cx + xx * .6, 28, cx + xx * 1.2 + sw, 45, o['coatl'] if k == 2 else o['coat2'])
        line(im, cx - 10 + sw, 46, cx + 10 + sw, 46, o['trim']); line(im, cx - 10 + sw, 45, cx + 10 + sw, 45, o['trim'])
        rect(im, cx - 2, 24, 5, 9, o['shirt'])
        # arms
        line(im, cx - 5, 26, cx - 10, 33 + sw, o['coat2'], 4); rect(im, cx - 12, 32 + sw, 3, 3, o['skin'])
        line(im, cx + 5, 26, cx + 11, 30 - sw, o['coatl'], 4); rect(im, cx + 11, 28 - sw, 3, 3, o['skin'])
        rect(im, cx - 5, 23, 11, 3, o['scarf']); rect(im, cx - 5, 25, 11, 1, o['scarf2'])
        line(im, cx - 5, 24, cx - 9, 30 + sw, o['scarf'], 3)
        hd = eye_edit(art(head, pal), head, pal, 'blink') if i == 3 else art(head, pal)
        paste(im, hd, cx - 8, 24 - len(head) + (1 if i in (1, 2) else 0))
        x, y = cx + 14, 26 - sw
        if kind == 'water':
            for a in range(3):
                q = a * 2.09 + i * .5
                rect(im, int(x + 1 + math.cos(q) * 8), int(y + math.sin(q) * 8), 2, 2, '#8fe6ff')
            poly(im, [(x + 1, y - 6), (x + 5, y + 1), (x + 1, y + 5), (x - 3, y + 1)], '#3fa8e8'); rect(im, x - 1, y, 2, 2, '#d7f6ff')
        if kind == 'garden':
            dog = art(["...bb.......", "..bddb......", ".bdkdd......", "kdddddb...b.", ".dwwddd..bd.", "..wwdddddddd", "...dddddddd.", "...dwwwdddd.", "...dw..dd.d.", "...dw..dd.d.", "...bb..bb.b."], dict(b='#6b4526', d='#b5803f', w='#f3e6cc', k='#1c1428'))
            paste(im, dog, 0, 36 - (1 if sw < 0 else 0))
            line(im, x, y + 4, x, y - 5, '#4f9a4a', 1); ball(im, x, y - 6, 3, 3, ['#a03a7d', '#e070b0', '#ffc0e0']); rect(im, x - 3, y - 1, 3, 2, '#7cc46a')
        if kind == 'infra':
            for a in range(6):
                q = a * math.pi / 3 + i * .26
                px_, py_ = x + math.cos(q) * 7, y + math.sin(q) * 7
                line(im, x, y, px_, py_, '#8f7ff0'); rect(im, int(px_) - 1, int(py_) - 1, 2, 2, '#e8e0ff')
            rect(im, x - 1, y - 1, 3, 3, '#fff6c0')
        im = outline(im, '#1c1428' if kind != 'infra' else '#4b3f94')
        fr.append(im)
    return fr


def build():
    S = {}
    for n, A in (('leo', leo()), ('ra', ra()), ('prof', npc(OLD_M, OLD_P, PROF_O)), ('student', npc(STU_H, STU_P, STU_O, robe=False))):
        for a, f in A.items(): S[f'{n}_{a}'] = f
    mk = lambda **k: {**PROF_O, 'shirt': '#f4efe4', **k}
    S['margreet'] = scholar(MAR_H, MAR_P, mk(coat='#2f6fa8', coat2='#1f4c7d', coatl='#58a5d8', trim='#bfeaff', scarf='#54c8d8', scarf2='#2f93a8'), 'water')
    S['donna'] = scholar(DON_H, DON_P, mk(coat='#3f7a4a', coat2='#2a5638', coatl='#6cb065', trim='#f0c060', scarf='#c65a9c', scarf2='#8f3a74'), 'garden')
    S['star'] = scholar(SLS_H, SLS_P, mk(coat='#5a4da8', coat2='#42378a', coatl='#9c8ff0', trim='#fff2b0', scarf='#e8e0ff', scarf2='#b0a2ea', shirt='#d8d0ff', skin='#e9e2ff'), 'infra')
    # portraits: 2x nearest head crops
    for n, h, p, bg in (('leo', LEO_H, LEO_P, '#39406b'), ('ra', RA_H, RA_P, '#4a6b3f'), ('prof', OLD_M, OLD_P, '#6b4a39'), ('student', STU_H, STU_P, '#8a4a5a'),
                        ('margreet', MAR_H, MAR_P, '#2a5a80'), ('donna', DON_H, DON_P, '#35603a'), ('star', SLS_H, SLS_P, '#3d3478')):
        fr = []
        for e in (None, 'blink'):
            a = art(h, p); a = eye_edit(a, h, p, e) if e else a
            a = outline(a) if 0 else a
            im = vgrad(24, 24, [shade(bg, .12), bg, shade(bg, -.35)]); paste(im, outline(a, '#1c1428'), 4, 24 - len(h))
            fr.append(im)
        S[f'face_{n}'] = fr
    return S


if __name__ == '__main__':
    import sys
    S = build(); W = 32 * 12; rows = list(S.items()); im = Image.new('RGBA', (W, sum(50 if f[0].height > 40 else 38 for _, f in rows)), (110, 150, 190, 255)); y = 0
    for n, f in rows:
        for i, a in enumerate(f): paste(im, a, i * (a.width + 2), y)
        y += 50 if f[0].height > 40 else 38
    im.resize((W * 3, im.height * 3), 0).save(sys.argv[1])
