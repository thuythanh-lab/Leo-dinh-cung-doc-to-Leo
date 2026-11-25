"""Original gameplay theme: "Waltz for an Unfinished Thesis" (composed for this game, fully synthesised, no samples).
python tools/audio/wizard.py -> public/assets/audio/music/wizard.mp3   (needs numpy + soundfile)"""
import os, re, numpy as np, soundfile as sf
SR = 44100; R = np.random.RandomState(7)
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'public/assets/audio/music/wizard.mp3')
N = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}


def midi(s): return N[s[0]] + (s.count('b') - s.count('#')) * -1 + 12 * (int(s[-1]) + 1)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
def line(s):
    """'G5:1.5 Ab5:.5 r:1' -> [(midi|None, beats)]"""
    return [(None if a[0] == 'r' else midi(a.split(':')[0]), float(a.split(':')[1])) for a in s.replace('|', ' ').split()]


CH = {'Cm': (0, 3, 7), 'Ab': (8, 12, 15), 'Fm': (5, 8, 12), 'Db': (1, 5, 8), 'G7': (7, 11, 14, 17), 'G': (7, 11, 14), 'Eb': (3, 7, 10), 'Bb': (10, 14, 17), 'Bbm': (10, 13, 17), 'C7': (0, 4, 7, 10), 'Abm': (8, 11, 15), 'Em': (4, 7, 11), 'D7': (2, 6, 9, 12), 'Dd': (2, 5, 8), 'F#d': (6, 9, 12), 'C': (0, 4, 7), 'B': (11, 15, 18)}
A_CH = 'Cm Cm Ab Ab Fm Db G7 G7 Cm Eb Ab Db Fm G7 Cm Cm'.split()
A = line('G5:1.5 Ab5:.5 G5:1 | C6:1 Eb5:2 | F5:.5 G5:.5 Ab5:1 C6:1 | Eb6:2 D6:.5 C6:.5 | Ab5:1.5 Bb5:.5 C6:1 | Db6:1 F5:1 Ab5:1 | G5:1 B5:1 D6:1 | F6:2.5 D6:.5 | Eb6:1.5 D6:.5 C6:1 | Bb5:1 G5:2 | C6:.5 Bb5:.5 Ab5:1 Eb5:1 | F5:1 Ab5:1 Db6:1 | C6:1.5 Ab5:.5 F5:1 | B5:1 D6:1 G5:1 | C6:3 | r:3')
A_CT = line('Eb4:3 | G4:2 F4:1 | Ab4:3 | C5:2 Bb4:1 | Ab4:3 | F4:2 Db4:1 | D4:3 | B3:1 D4:1 F4:1 | G4:3 | Eb4:2 G4:1 | Ab4:3 | Ab4:2 F4:1 | Ab4:3 | F4:1 D4:1 B3:1 | C4:1 D4:1 Eb4:1 | G4:3')
B_CH = 'Cm Cm Fm Fm Bb Bb Eb Eb Ab Db G7 Cm Ab Db G7 G7'.split()
B = line('C5:.5 D5:.5 Eb5:.5 F5:.5 G5:.5 Eb5:.5 | G5:1 F#5:.5 G5:.5 C6:1 | F5:.5 G5:.5 Ab5:.5 Bb5:.5 C6:.5 Ab5:.5 | C6:1 B5:.5 C6:.5 F5:1 | D5:.5 F5:.5 Bb5:.5 Ab5:.5 F5:.5 D5:.5 | Ab5:1 G5:.5 F5:.5 D5:1 | Eb5:.5 G5:.5 Bb5:.5 Eb6:.5 D6:.5 Bb5:.5 | G5:2 r:1 | Ab5:.5 C6:.5 Eb6:1 C6:1 | Db6:.5 C6:.5 Ab5:1 F5:1 | B5:.5 D6:.5 F6:1 D6:1 | Eb6:1 C6:1 G5:1 | C6:1 Ab5:1 Eb5:1 | F5:.5 Ab5:.5 Db6:2 | D6:1 B5:1 G5:1 | F5:.5 Eb5:.5 D5:.5 F5:.5 Ab5:.5 B5:.5')
C_CH = 'Ab Eb Fm Cm Db Ab Bbm Eb Ab C7 Fm Db Ab Eb Ab G7'.split()
C = line('C5:2 Eb5:1 | G5:2 F5:.5 Eb5:.5 | Ab5:2 G5:.5 F5:.5 | Eb5:3 | F5:1 Ab5:1 Db6:1 | C6:2 Ab5:1 | Bb5:1.5 Ab5:.5 F5:1 | G5:3 | C6:2 Eb6:1 | G5:1 Bb5:1 E6:1 | F6:2 Eb6:.5 Db6:.5 | Db6:2 F5:1 | Ab5:1 C6:1 Eb6:1 | Db6:1.5 C6:.5 Bb5:1 | Ab5:3 | G5:1 F5:1 D5:1')
D_CH = 'Cm Cm Abm Abm Em Em Cm Cm Fm Abm Db B Cm F#d G7 G7'.split()
D = line('C4:3 | Eb4:2 D4:1 | B3:3 | Eb4:2 Ab3:1 | G3:2 B3:1 | E4:3 | Eb4:2 C4:1 | G4:3 | Ab4:1.5 G4:.5 F4:1 | Eb4:2 B3:1 | Db4:1 F4:1 Ab4:1 | F#4:2 Eb4:1 | G4:3 | F#4:1 A4:1 C5:1 | B4:3 | D5:1 B4:1 G4:1')

# form: (name, chords, bars). Tempo eases at the seams so it breathes like players would.
FORM = [('intro', 'Cm Cm Ab Ab Dd G7 Cm Cm'.split()), ('A1', A_CH), ('A2', A_CH), ('B1', B_CH), ('C1', C_CH), ('D', D_CH), ('B2', B_CH), ('C2', C_CH), ('A3', A_CH), ('coda', 'Cm Abm Cm Db Fm G7 Cm Cm Ab Fm Dd G7'.split())]
BPM = dict(intro=104, A1=116, A2=120, B1=136, C1=112, D=108, B2=140, C2=116, A3=122, coda=104)
beats = []; secs = []; t = 0.0
for n, ch in FORM:
    s = len(beats); k = len(ch) * 3
    for i in range(k):
        b = 60 / BPM[n] * (1 + .03 * np.sin(i / 12 * 2 * np.pi) + (.16 * max(0, (i - k + 5) / 5) ** 1.5 if n not in ('B1', 'B2') else .05 * max(0, (i - k + 4) / 4))); beats.append(t); t += b
    secs.append((n, ch, s))
TOTAL = t; LEN = int(TOTAL * SR); beats.append(t); print(f'{TOTAL:.1f}s')
def at(b): i = min(int(b), len(beats) - 2); return beats[i] + (b - i) * (beats[i + 1] - beats[i])


DRY = np.zeros((LEN, 2)); WET = np.zeros((LEN, 2))
def put(y, t0, pan, send, vel):
    i = int((t0 + R.randn() * .006) * SR) % LEN; idx = (i + np.arange(len(y))) % LEN  # tails wrap round: the loop has no seam
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    for c, g in ((0, l), (1, r)): np.add.at(DRY[:, c], idx, y * vel * g); np.add.at(WET[:, c], idx, y * vel * g * send)


def T(d): return np.arange(int(d * SR)) / SR
def adsr(n, a, r, hold):
    e = np.ones(n); A_ = max(2, int(a * SR)); e[:A_] = np.sin(np.linspace(0, np.pi / 2, A_))[:n] ** 1.5; h = int(hold * SR)
    if h < n: e[h:] *= np.exp(-np.arange(n - h) / (r * SR))
    q = min(400, n); e[-q:] *= np.linspace(1, 0, q); return e
def vib(x, rate, depth, delay=.25): return np.cumsum(1 + depth * np.sin(2 * np.pi * rate * x + R.rand() * 6) * np.clip((x - delay) / .4, 0, 1)) / SR


def celesta(m, d, v):
    f = hz(m); x = T(min(3.2, 1.5 + 160 / f)); y = 0
    for k, a, dc in ((1, 1, 2.0), (2.0, .16, 3.4), (3.01, .2, 5), (4.1, .34 * v, 9), (6.8, .12 * v, 16)):
        if f * k < 15000: y = y + a * np.sin(2 * np.pi * f * k * x + R.rand()) * np.exp(-dc * x * (f / 800) ** .3)
    return y * adsr(len(x), .002, 1, 99) * .5
def glock(m, d, v): f = hz(m); x = T(2.4); return (np.sin(2 * np.pi * f * x) * np.exp(-2.2 * x) + .5 * np.sin(2 * np.pi * f * 2.76 * x) * np.exp(-5 * x) + .2 * np.sin(2 * np.pi * f * 5.4 * x) * np.exp(-12 * x)) * adsr(len(x), .001, 1, 99) * .3
def harp(m, d, v):
    f = hz(m); x = T(2.2); y = 0
    for k in range(1, 12):
        if f * k < 12000: y = y + np.sin(np.pi * k * .23) / k ** 1.1 * np.sin(2 * np.pi * f * k * (1 + .0002 * k * k) * x + R.rand()) * np.exp(-(1.6 + .75 * k) * x * (f / 300) ** .35)
    return y * adsr(len(x), .003, 1, 99) * .75
def pizz(m, d, v):
    f = hz(m); x = T(.9); y = 0
    for k in range(1, 9):
        if f * k < 9000: y = y + np.sin(2 * np.pi * f * k * x + R.rand()) / k ** 1.3 * np.exp(-(5 + 3.5 * k) * x)
    return y * adsr(len(x), .004, 1, 99) * .7
def strings(m, d, v, att=.16, voices=5, trem=0, bright=1.0):
    f = hz(m); x = T(d + .55); y = 0
    for _ in range(voices):
        p = vib(x, 5 + R.rand() * 1.1, .0035) * f * 2 ** (R.randn() * 5 / 1200); w = 0
        for k in range(1, 15):
            if f * k > 9000: break
            body = 1 + .5 * np.exp(-((f * k - 520) / 260) ** 2) + .45 * np.exp(-((f * k - 1500) / 600) ** 2)  # violin-ish body
            w = w + body / k ** (1.25 + .25 / bright) * np.sin(2 * np.pi * k * p + R.rand() * 6)
        y = y + w
    y = y / voices * adsr(len(x), att, .18, d * .96)
    if trem: y = y * (.6 + .4 * np.abs(np.sin(np.pi * 13 * x + R.rand())))
    return y * .6
def flute(m, d, v):
    f = hz(m); x = T(d + .2); p = vib(x, 5.2, .005, .18) * f; n = R.randn(len(x)); n = np.convolve(n, np.ones(6) / 6, 'same')
    return (np.sin(2 * np.pi * p) + .28 * np.sin(4 * np.pi * p) + .1 * np.sin(6 * np.pi * p) + .035 * n * (1 + 4 * np.exp(-x * 30))) * adsr(len(x), .045, .06, d * .9) * .5
def clar(m, d, v):
    f = hz(m); x = T(d + .2); p = vib(x, 4.6, .0015, .3) * f; y = 0
    for k, a in ((1, 1), (2, .05), (3, .5), (4, .06), (5, .26), (7, .16), (9, .07)):
        if f * k < 9000: y = y + a * np.sin(2 * np.pi * k * p)
    return y * adsr(len(x), .05, .07, d * .92) * .38
def oboe(m, d, v):
    f = hz(m); x = T(d + .2); p = vib(x, 5.4, .004, .2) * f; y = 0
    for k in range(1, 11):
        if f * k < 9000: y = y + (.45 + 1.1 * np.exp(-((f * k - 1150) / 480) ** 2)) / k ** .55 * np.sin(2 * np.pi * k * p)
    return y * adsr(len(x), .04, .06, d * .92) * .24
def bassoon(m, d, v):
    f = hz(m); x = T(d + .2); p = vib(x, 4.8, .002) * f; y = 0
    for k in range(1, 13): y = y + (.4 + np.exp(-((f * k - 470) / 220) ** 2)) / k ** .5 * np.sin(2 * np.pi * k * p)
    return y * adsr(len(x), .04, .06, d * .88) * .3
def horn(m, d, v):
    f = hz(m); x = T(d + .4); p = vib(x, 4.4, .0015, .4) * f; y = 0
    for k in range(1, 8): y = y + np.exp(-(k - 1) * .75) * np.sin(2 * np.pi * k * p) * np.minimum(1, x / (.03 + .04 * k))
    return y * adsr(len(x), .09, .15, d * .95) * .3
def timp(m, d, v): f = hz(m); x = T(1.8); return (np.sin(2 * np.pi * f * x * (1 + .02 * np.exp(-x * 18))) * np.exp(-2.6 * x) + .4 * np.sin(2 * np.pi * f * 1.5 * x) * np.exp(-4 * x) + .2 * R.randn(len(x)) * np.exp(-60 * x)) * adsr(len(x), .003, 1, 99) * .8
def triangle(m, d, v): x = T(2.2); return sum(np.sin(2 * np.pi * q * x + R.rand()) * np.exp(-3 * x) for q in (3210, 4870, 6940, 9120)) * adsr(len(x), .001, 1, 99) * .07
def shimmer(d):  # swelling cymbal air
    x = T(d); n = R.randn(len(x)); n = n - np.convolve(n, np.ones(5) / 5, 'same'); return n * (x / d) ** 2.5 * np.minimum(1, (d - x) / .25) * .09


INS = dict(celesta=(celesta, -.25, .55), glock=(glock, .35, .6), harp=(harp, -.55, .45), pizz=(pizz, .2, .35), strings=(strings, .1, .5), vln=(lambda m, d, v: strings(m, d, v, .12, 6, 0, 1.4), -.3, .5), cello=(lambda m, d, v: strings(m, d, v, .12, 4, 0, .8), .45, .4), trem=(lambda m, d, v: strings(m, d, v, .5, 4, 1, .8), -.1, .5), flute=(flute, -.15, .45), clar=(clar, .25, .45), oboe=(oboe, .05, .4), bassoon=(bassoon, .35, .4), horn=(horn, .55, .65), timp=(timp, .05, .5), tri=(triangle, .5, .5))
def play(ins, m, b, d, v=.5):
    f, pan, send = INS[ins]; t0 = at(b); dur = at(b + d) - t0; put(f(m, dur, v), t0, pan, send, v * (1 + R.randn() * .05))
def melody(ins, notes, b, v=.5, tr=0, leg=1.0, swell=.14):
    tot = sum(d for _, d in notes); p = 0
    for m, d in notes:
        if m is not None: play(ins, m + tr, b + p, d * leg, v * (1 - swell + swell * 2 * np.sin(np.pi * ((p / 12) % 1)) ** 2) * (1.08 if p % 3 == 0 else 1))
        p += d
def voice(ch, lo, n=3):  # notes of a chord from `lo` upwards, close position
    pcs = [q % 12 for q in CH[ch]]; out = []; m = lo
    while len(out) < n:
        if m % 12 in pcs: out.append(m)
        m += 1
    return out
def bass(ch, lo=36): r = CH[ch][0] % 12; return lo + (r - lo) % 12
def oompah(chs, s, v=.3, b1='pizz', b2='pizz', skip=0):
    for i, c in enumerate(chs):
        b = s + i * 3; play(b1, bass(c, 36) + (12 if i % 2 and skip else 0), b, 1, v * 1.35)
        for q in (1, 2): [play(b2, m, b + q, .8, v * .6) for m in voice(c, 55, 3)]
def pad(chs, s, v=.2, ins='strings', lo=53, n=3):
    i = 0
    while i < len(chs):
        j = i
        while j + 1 < len(chs) and chs[j + 1] == chs[i]: j += 1
        for m in voice(chs[i], lo, n): play(ins, m, s + i * 3, (j - i + 1) * 3, v)
        i = j + 1
def arp(ins, chs, s, v=.25, lo=60, pat=(0, 1, 2, 3, 2, 1), n=4):
    for i, c in enumerate(chs):
        vs = voice(c, lo, n)
        for q, k in enumerate(pat): play(ins, vs[k % n], s + i * 3 + q * 3 / len(pat), .5, v * (1.15 if q == 0 else .9 + R.rand() * .1))
def low(chs, s, v=.3, ins='cello', d=2.9, lo=36):
    for i, c in enumerate(chs): play(ins, bass(c, lo), s + i * 3, d, v)
def run(ins, s, e, n, b, d, v):  # harp sweep in C harmonic minor
    sc = [m for m in range(s, e) if m % 12 in (0, 2, 3, 5, 7, 8, 11)][:n]
    for i, m in enumerate(sc): play(ins, m, b + d * i / len(sc), .5, v * (.5 + .5 * i / len(sc)))


for n, ch, s in secs:
    end = s + len(ch) * 3
    if n == 'intro':
        pad(ch, s, .13, 'trem', 60); low(ch, s, .16, 'cello'); arp('celesta', ch, s, .2, 72, (0, 2, 1, 3, 2, 1)); melody('horn', line('r:12 | C4:2 Eb4:1 | Ab4:3 | F4:2 D4:1 | G4:3'), s, .16); run('harp', 55, 92, 18, end - 2, 2, .3)
    if n == 'A1': melody('celesta', A, s, .62); pad(ch, s, .12); oompah(ch, s, .2); melody('clar', A_CT, s, .17)
    if n == 'A2': melody('celesta', A, s, .5, 12); melody('flute', A, s, .36); pad(ch, s, .17); low(ch, s, .24); arp('harp', ch, s, .2, 55); melody('bassoon', A_CT, s, .2, -12); [play('tri', 60, s + i * 12, 1, .4) for i in range(4)]
    if n == 'B1': melody('clar', B[:], s, .36, 0, .8); melody('flute', B, s, .22, 12, .75); oompah(ch, s, .3, 'bassoon', 'pizz', 1); melody('glock', [(m if i % 4 == 0 else None, d) for i, (m, d) in enumerate(B)], s, .22, 12)
    if n == 'C1': melody('vln', C, s, .5, 0, 1.02, .22); pad(ch, s, .2, 'strings', 50); low(ch, s, .34); arp('harp', ch, s, .24, 56); melody('horn', line('r:24 | Ab3:3 | G3:3 | Ab3:3 | F3:3 | Eb4:3 | Db4:3 | C4:3 | B3:3'), s, .22); arp('celesta', ch[8:], s + 24, .12, 84, (3, 2, 1))
    if n == 'D':
        melody('clar', D, s, .3); melody('bassoon', D, s + 0, .16, -12); pad(ch, s, .17, 'trem', 57); arp('celesta', ch, s, .24, 79, (3, 1, 2, 0, 2, 1)); low(ch, s, .22)
        for i in (0, 4, 8, 12): play('timp', 36, s + i * 3, 2, .34); play('glock', 91 - i // 4, s + i * 3 + 1.5, 2, .16)
        put(shimmer(at(end) - at(end - 6)), at(end - 6), 0, .5, .8); run('harp', 55, 96, 20, end - 2, 2, .34)
    if n == 'B2': melody('oboe', B, s, .34, 0, .8); melody('flute', B, s, .26, 12, .75); oompah(ch, s, .34, 'pizz', 'pizz', 1); pad(ch, s, .13); low(ch, s, .24, 'cello', .9); melody('celesta', [(m if i % 3 == 0 else None, d) for i, (m, d) in enumerate(B)], s, .28, 12); [play('tri', 60, s + i * 6, 1, .35) for i in range(8)]
    if n == 'C2': melody('vln', C, s, .52, 0, 1.02, .24); melody('vln', C, s, .22, 12, 1.02, .24); melody('horn', C, s, .24, -12); pad(ch, s, .22, 'strings', 48, 4); low(ch, s, .42); arp('harp', ch, s, .3, 56, (0, 1, 2, 3, 2, 1)); [play('timp', bass(ch[i], 36), s + i * 3, 2, .3) for i in (0, 4, 8, 12, 15)]; put(shimmer(at(s + 24) - at(s + 18)), at(s + 18), 0, .5, .9); melody('flute', line('r:24 | Eb6:1.5 F6:.5 Eb6:1 | C6:3 | Ab5:1 C6:1 F6:1 | Ab6:3 | Eb6:3 | G6:2 F6:1 | Eb6:3 | D6:1 B5:1 G5:1'), s, .2)
    if n == 'A3': melody('celesta', A, s, .56, 12); melody('glock', A, s, .16, 12); melody('oboe', A, s, .26); melody('vln', A, s, .24); melody('cello', A_CT, s, .36, -12); pad(ch, s, .2); oompah(ch, s, .26); arp('harp', ch, s, .2, 56); [play('timp', bass(ch[i], 36), s + i * 3, 2, .28) for i in (0, 6, 8, 13)]; [play('tri', 60, s + i * 12, 1, .4) for i in range(4)]
    if n == 'coda': pad(ch, s, .14, 'trem', 60); low(ch, s, .2); arp('celesta', ch[:8], s, .26, 72, (3, 2, 1, 0, 1, 2)); melody('flute', line('G5:1.5 Ab5:.5 G5:1 | B5:1 Eb5:2 | G5:3 | F5:1 Ab5:1 Db6:1 | C6:1.5 Ab5:.5 F5:1 | B5:1 D6:1 G5:1 | C6:3 | r:3'), s, .26); melody('clar', line('r:24 | C4:2 Eb4:1 | Ab4:2 F4:1 | D4:3 | G3:3'), s, .2); arp('harp', ch[8:], s + 24, .22, 60); melody('celesta', line('r:24 | C6:1.5 Eb6:.5 C6:1 | Ab5:2 F5:1 | D5:1 F5:1 Ab5:1 | G5:3'), s, .36)

# hall reverb (circular, so the tail of the coda rings into the introduction)
x = T(2.8); F = np.fft.rfft; size = LEN
wet = np.zeros_like(WET)
for c in (0, 1):
    n = R.randn(len(x)); lp = np.zeros_like(n); k = 14; n = np.convolve(n, np.hanning(k) / np.hanning(k).sum(), 'same'); ir = n * np.exp(-x * 2.3); ir[:int(.018 * SR)] = 0
    for dl, g in ((.013, .5), (.023, .4), (.037, .3), (.051, .25)): ir[int(dl * SR) + c * 130] += g * 3
    ir /= np.sqrt((ir ** 2).sum()); I = np.zeros(size); I[:len(ir)] = ir; wet[:, c] = np.fft.irfft(F(WET[:, c]) * F(I), size)
y = DRY + wet * .85; f = np.fft.rfftfreq(size, 1 / SR); eq = np.where(f < 35, 0, 1) * (1 + .25 * np.exp(-((f - 220) / 160) ** 2)) / (1 + (f / 13500) ** 6)
y = np.stack([np.fft.irfft(F(y[:, c]) * eq, size) for c in (0, 1)], 1)
y /= np.percentile(np.abs(y), 99.9); y = np.tanh(y * .85) ; y *= .92 / np.abs(y).max(); print('rms', np.sqrt((y ** 2).mean()))
for n, ch, s in secs: a, b = int(at(s) * SR), int(at(s + len(ch) * 3 - .01) * SR); print(n, f'{at(s):.1f}s rms {np.sqrt((y[a:b] ** 2).mean()):.3f}')
sf.write(OUT, y.astype('f4'), SR, format='MP3', subtype='MPEG_LAYER_III', bitrate_mode='VARIABLE', compression_level=.45); print(os.path.getsize(OUT) // 1024, 'KB')
