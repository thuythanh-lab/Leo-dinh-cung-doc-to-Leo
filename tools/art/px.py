"""Small pixel-art toolkit shared by every art module."""
import math, random
from PIL import Image, ImageDraw

INK = (28, 20, 40, 255)


def hexc(h, a=255):
    if not isinstance(h, str):
        return h if len(h) == 4 else (*h, a)
    h = h.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)


def new(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def lerp(a, b, t):
    a, b = hexc(a), hexc(b)
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(4))


def shade(c, f):
    """f<0 darker (towards cool ink), f>0 lighter (towards warm white)."""
    return lerp(c, (30, 20, 60, 255), -f) if f < 0 else lerp(c, (255, 250, 225, 255), f)


def art(rows, pal):
    h, w = len(rows), max(len(r) for r in rows)
    im = new(w, h); p = im.load()
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in pal and ch not in ' .':
                p[x, y] = hexc(pal[ch])
    return im


def paste(dst, src, x, y):
    dst.alpha_composite(src, (max(0, int(x)), max(0, int(y))),
                        (max(0, -int(x)), max(0, -int(y)))) if int(x) > -src.width and int(y) > -src.height and int(x) < dst.width and int(y) < dst.height else None
    return dst


def outline(im, col=INK, diag=False):
    """1px outline drawn outside the silhouette (image is not enlarged)."""
    w, h = im.size; src = im.load(); out = im.copy(); o = out.load(); col = hexc(col)
    nb = [(1, 0), (-1, 0), (0, 1), (0, -1)] + ([(1, 1), (-1, -1), (1, -1), (-1, 1)] if diag else [])
    for y in range(h):
        for x in range(w):
            if src[x, y][3] < 128:
                for dx, dy in nb:
                    a, b = x + dx, y + dy
                    if 0 <= a < w and 0 <= b < h and src[a, b][3] >= 128:
                        o[x, y] = col; break
    return out


def flip(im):
    return im.transpose(Image.FLIP_LEFT_RIGHT)


def line(im, x0, y0, x1, y1, c, w=1):
    ImageDraw.Draw(im).line([(round(x0), round(y0)), (round(x1), round(y1))], fill=hexc(c), width=w)


def rect(im, x, y, w, h, c):
    if w > 0 and h > 0:
        ImageDraw.Draw(im).rectangle([x, y, x + w - 1, y + h - 1], fill=hexc(c))


def ell(im, x, y, w, h, c, o=None):
    ImageDraw.Draw(im).ellipse([x, y, x + w - 1, y + h - 1], fill=hexc(c) if c else None, outline=hexc(o) if o else None)


def poly(im, pts, c):
    ImageDraw.Draw(im).polygon([(round(a), round(b)) for a, b in pts], fill=hexc(c))


BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def bayer(x, y):
    return (BAYER[y % 4][x % 4] + .5) / 16


def ramp_at(ramp, v, x, y):
    """Dithered lookup into a list of colours; v in 0..1."""
    v = max(0, min(.9999, v)) * (len(ramp) - 1); i = int(v)
    return hexc(ramp[min(len(ramp) - 1, i + (1 if v - i > bayer(x, y) else 0))])


def vgrad(w, h, ramp, power=1):
    im = new(w, h); p = im.load()
    for y in range(h):
        for x in range(w):
            p[x, y] = ramp_at(ramp, (y / max(1, h - 1)) ** power, x, y)
    return im


def ball(im, cx, cy, rx, ry, ramp, lx=-.5, ly=-.6):
    """Shaded ellipse, ramp dark->light."""
    p = im.load()
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if 0 <= x < im.width and 0 <= y < im.height:
                nx, ny = (x + .5 - cx) / rx, (y + .5 - cy) / ry; d = nx * nx + ny * ny
                if d <= 1:
                    nz = math.sqrt(1 - d)
                    p[x, y] = ramp_at(ramp, .12 + .88 * max(0, min(1, (nx * lx + ny * ly) * .6 + nz * .62)), x, y)


def foliage(w, h, ramp, blobs, seed=1, ink='#16301f'):
    """Leafy crown built from shaded blobs with clustered leaf texture. blobs: (cx,cy,r)."""
    im = new(w, h); p = im.load(); rnd = random.Random(seed)
    for cx, cy, r in blobs:
        for y in range(int(cy - r) - 1, int(cy + r) + 2):
            for x in range(int(cx - r) - 1, int(cx + r) + 2):
                if not (0 <= x < w and 0 <= y < h): continue
                a = math.atan2(y - cy, x - cx)
                rr = r * (1 + .07 * math.sin(a * 7 + cx) + .05 * math.sin(a * 11 + cy))
                d = math.hypot(x - cx, (y - cy) * 1.1)
                if d <= rr:
                    v = .52 - (y - cy) / r * .42 - (x - cx) / r * .2 + (rnd.random() - .5) * .22
                    v += .12 * math.sin(x * 1.9 + cy) * math.sin(y * 1.7 + cx)
                    p[x, y] = hexc(ramp[max(0, min(len(ramp) - 1, int(v * len(ramp))))])
    return outline(im, ink)


def trunk(im, x, y0, y1, w, ramp, flare=3):
    p = im.load()
    for y in range(y0, y1):
        f = max(0, 1 - (y1 - y) / 8) * flare
        a, b = int(x - w / 2 - f), int(x + w / 2 + f)
        for xx in range(a, b):
            if 0 <= xx < im.width and 0 <= y < im.height:
                v = (xx - a) / max(1, b - a - 1)
                v = .85 - v * .8 + (.15 if (xx * 3 + y // 3) % 5 == 0 else 0) - (.2 if (xx + y // 4) % 4 == 0 else 0)
                p[xx, y] = hexc(ramp[max(0, min(len(ramp) - 1, int(v * len(ramp))))])


def hue(im, ramp_map):
    """Exact colour replacement."""
    m = {hexc(k): hexc(v) for k, v in ramp_map.items()}; o = im.copy(); p = o.load()
    for y in range(o.height):
        for x in range(o.width):
            if p[x, y] in m: p[x, y] = m[p[x, y]]
    return o


def tint(im, col, amt):
    o = im.copy(); p = o.load(); c = hexc(col)
    for y in range(o.height):
        for x in range(o.width):
            q = p[x, y]
            if q[3]:
                t = lerp(q[:3] + (255,), c, amt); p[x, y] = t[:3] + (q[3],)
    return o


def glow(size, col, levels=6):
    """Stepped radial light sprite for additive blending."""
    im = new(size, size); p = im.load(); c = hexc(col); r = size / 2
    for y in range(size):
        for x in range(size):
            d = math.hypot(x + .5 - r, y + .5 - r) / r
            if d < 1:
                v = (1 - d) ** 1.6 * levels
                v = (int(v) + (1 if v - int(v) > bayer(x, y) else 0)) / levels
                p[x, y] = c[:3] + (int(255 * min(1, v)),)
    return im


# --- 3x5 micro font for lettering inside sprites (stamps, signs) ---
FONT = {k: v.split('/') for k, v in {
    'A': '010/101/111/101/101', 'B': '110/101/110/101/110', 'C': '011/100/100/100/011', 'D': '110/101/101/101/110', 'E': '111/100/110/100/111',
    'F': '111/100/110/100/100', 'G': '011/100/101/101/011', 'H': '101/101/111/101/101', 'I': '111/010/010/010/111', 'J': '001/001/001/101/010',
    'K': '101/101/110/101/101', 'L': '100/100/100/100/111', 'M': '101/111/111/101/101', 'N': '110/101/101/101/101', 'O': '010/101/101/101/010',
    'P': '110/101/110/100/100', 'Q': '010/101/101/110/011', 'R': '110/101/110/101/101', 'S': '011/100/010/001/110', 'T': '111/010/010/010/010',
    'U': '101/101/101/101/111', 'V': '101/101/101/101/010', 'W': '101/101/111/111/101', 'X': '101/101/010/101/101', 'Y': '101/101/010/010/010',
    'Z': '111/001/010/100/111', '0': '111/101/101/101/111', '1': '010/110/010/010/111', '2': '110/001/010/100/111', '3': '110/001/010/001/110',
    '4': '101/101/111/001/001', '5': '111/100/110/001/110', '6': '011/100/111/101/111', '7': '111/001/010/010/010', '8': '111/101/111/101/111',
    '9': '111/101/111/001/110', '?': '110/001/010/000/010', '!': '010/010/010/000/010', '.': '000/000/000/000/010', '-': '000/000/111/000/000',
    '[': '110/100/100/100/110', ']': '011/001/001/001/011', '+': '000/010/111/010/000', '#': '101/111/101/111/101', '%': '101/001/010/100/101',
    '$': '011/110/010/011/110', ' ': '000/000/000/000/000', ':': '000/010/000/010/000', '=': '000/111/000/111/000'}.items()}


def text(im, s, x, y, c, k=1):
    p = im.load(); c = hexc(c)
    for ch in s.upper():
        for j, row in enumerate(FONT.get(ch, FONT[' '])):
            for i, b in enumerate(row):
                if b == '1':
                    for a in range(k):
                        for d in range(k):
                            X, Y = x + i * k + a, y + j * k + d
                            if 0 <= X < im.width and 0 <= Y < im.height: p[X, Y] = c
        x += 4 * k


def twid(s, k=1):
    return len(s) * 4 * k - k
