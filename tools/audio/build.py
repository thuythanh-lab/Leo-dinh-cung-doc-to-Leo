"""Builds public/assets/audio from the local asset library (originals are only read).
Needs numpy + soundfile. Set LEO_PACKS to the folder holding rpg-music / kenney-* packs."""
import os, shutil, numpy as np, soundfile as sf
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PACKS = os.environ.get('LEO_PACKS', os.path.join(ROOT, 'packs'))
OUT = os.path.join(ROOT, 'public/assets/audio')
for d in ('audio/music', 'audio/sfx', 'licenses'):
    os.makedirs(os.path.join(ROOT, 'public/assets', d), exist_ok=True)
MUSIC = {'menu': '05. Long Journey', 'map': '04. Peaceful Village', 'campus': '02. Lively City', 'library': '22. Ancient Library',
         'water': '17. Unknown Island', 'garden': '07. Spirits Forest (loop)', 'archive': '18. The Old Magician', 'tower': '10. Dwarven Mine',
         'boss': '09. Battle Theme II (loop)', 'treasury': '19. East Town', 'office': '12. Goofy Monster',
         'boss2': '16. Battle Theme III (loop)', 'ending': '14. Traveling the Sky'}


def rs(y, a, b):
    n = int(len(y) * b / a)
    return np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y).astype('f4')


def save(y, sr, p):
    sf.write(p, np.clip(y, -1, 1), sr, format='MP3', subtype='MPEG_LAYER_III')


for k, n in MUSIC.items():
    y, sr = sf.read(os.path.join(PACKS, 'rpg-music/ogg', n + '.ogg'), dtype='f4')
    y = y.mean(1) if y.ndim > 1 else y
    if sr > 32000:
        y = rs(y, sr, 32000); sr = 32000
    y = y * (0.8 / max(1e-6, np.abs(y).max()))
    save(y, sr, f'{OUT}/music/{k}.mp3')
    print(k, round(len(y) / sr), 's', os.path.getsize(f'{OUT}/music/{k}.mp3') // 1024, 'KB')

KEN = {'step': 'rpg-audio:footstep05', 'land': 'rpg-audio:footstep02', 'break': 'rpg-audio:chop', 'book': 'rpg-audio:bookFlip2',
       'page': 'rpg-audio:bookFlip1', 'bookopen': 'rpg-audio:bookOpen', 'bookclose': 'rpg-audio:bookClose', 'door': 'rpg-audio:doorOpen_1',
       'creak': 'rpg-audio:creak2', 'coins': 'rpg-audio:handleCoins', 'cloth': 'rpg-audio:cloth1', 'metal': 'rpg-audio:metalLatch',
       'pot': 'rpg-audio:metalPot2', 'move': 'interface-sounds:select_002', 'ok': 'interface-sounds:confirmation_001',
       'back': 'interface-sounds:back_002', 'tick': 'interface-sounds:tick_002', 'text': 'interface-sounds:tick_001',
       'error': 'interface-sounds:error_006', 'glitch': 'interface-sounds:glitch_001', 'switch': 'interface-sounds:switch_003',
       'open': 'interface-sounds:maximize_006', 'close': 'interface-sounds:minimize_006', 'pluck': 'interface-sounds:pluck_001',
       'glass': 'interface-sounds:glass_005', 'bong': 'interface-sounds:bong_001', 'question': 'interface-sounds:question_001'}
for k, v in KEN.items():
    p, n = v.split(':')
    y, sr = sf.read(os.path.join(PACKS, f'kenney-{p}/Audio/{n}.ogg'), dtype='f4')
    y = y.mean(1) if y.ndim > 1 else y
    y = rs(y, sr, 32000)
    save(y * (0.8 / max(1e-6, np.abs(y).max())), 32000, f'{OUT}/sfx/{k}.mp3')

# --- original synthesised effects (chip style) ---
SR = 32000
def t(d): return np.arange(int(SR * d)) / SR
def sq(f, d, duty=.5, vol=.4, dec=6):
    x = t(d); ph = np.cumsum(f) / SR if np.ndim(f) else f * x
    return (np.where((ph % 1) < duty, 1, -1) * vol * np.exp(-dec * x)).astype('f4')
def tri(f, d, vol=.5, dec=5):
    x = t(d); return ((2 * np.abs(2 * ((f * x) % 1) - 1) - 1) * vol * np.exp(-dec * x)).astype('f4')
def noise(d, vol=.5, dec=10, lp=.4, seed=1):
    r = np.random.RandomState(seed).randn(int(SR * d)); o = np.zeros_like(r); a = 0
    for i in range(len(r)):
        a += lp * (r[i] - a); o[i] = a
    return (o * vol * np.exp(-dec * t(d))).astype('f4')
def seq(notes, gap, fn):
    L = int(SR * (gap * len(notes) + .7)); o = np.zeros(L, 'f4')
    for i, n in enumerate(notes):
        if n is None: continue
        for m in (n if isinstance(n, (tuple, list)) else [n]):
            s = fn(440 * 2 ** ((m - 69) / 12)); a = int(i * gap * SR)
            s = s[:L - a]; o[a:a + len(s)] += s
    return o
def mix(*xs):
    o = np.zeros(max(map(len, xs)), 'f4')
    for x in xs: o[:len(x)] += x
    return o
def delay(x, s): return np.concatenate([np.zeros(int(s * SR), 'f4'), x])
def bell(f): return mix(tri(f, .6, .35, 6), sq(f * 2, .4, .5, .05, 9))
def lead(f): return mix(sq(f, .45, .25, .22, 5), tri(f, .45, .3, 5))

E = {}
E['jump'] = sq(300 + 1900 * t(.16), .16, .25, .35, 9)
E['coffee'] = seq([83, 88], .06, lambda f: sq(f, .22, .25, .3, 9))[:int(SR * .36)]
E['special'] = seq([72, 76, 79, 84], .07, bell)
E['hurt'] = mix(sq(500 - 1100 * t(.28), .28, .5, .35, 8), noise(.2, .6, 14))
E['cast'] = mix(sq(900 + 700 * np.sin(40 * t(.2)), .2, .125, .2, 10), noise(.12, .25, 25, .8))
E['stomp'] = mix(sq(260 - 700 * t(.15), .15, .5, .4, 12), noise(.1, .5, 25))
E['thud'] = mix(tri(62, .5, 1, 7), noise(.35, 1.2, 12, .15), sq(110 - 60 * t(.3), .3, .5, .25, 10))
E['stampno'] = mix(E['thud'], delay(sq(98, .4, .5, .3, 5), .12), delay(sq(104, .4, .5, .3, 5), .12))
E['stampyes'] = mix(E['thud'], delay(seq([67, 72, 76, 79, (84, 88)], .08, lead), .2))
E['achieve'] = seq([67, 71, 74, 79, None, (79, 83, 86), (79, 83, 86, 91)], .11, lead)
E['fanfare'] = seq([60, 60, 60, (64, 67), None, (62, 65), (64, 67), None, (67, 72, 76), None, (72, 76, 79, 84)], .15, lead)
E['secret'] = seq([79, 78, 75, 69, 68, 76, 80, 84], .09, bell)
E['summon'] = mix(seq([60, 67, 72, 79, 84, 91], .045, bell), noise(.4, .3, 6, .7))
E['vanish'] = seq([84, 79, 72, 67], .06, bell)
E['checkpoint'] = mix(seq([72, 79, 76, 84], .08, bell), noise(.6, .25, 4, .5))
E['splash'] = noise(.5, .9, 8, .35)
E['cooked'] = seq([67, 66, 65, 64, None, 58], .17, lambda f: sq(f, .3, .5, .3, 5))
E['boing'] = sq(180 + 500 * np.abs(np.sin(18 * t(.25))), .25, .5, .3, 8)
E['rumble'] = noise(1.0, 1.4, 3, .08)
E['laser'] = sq(1200 - 2500 * t(.3), .3, .25, .25, 9)
E['confetti'] = mix(noise(.25, .7, 16, .8), seq([88, 91, 95], .05, bell))
E['typing'] = noise(.03, .4, 90, .9)
for k, y in E.items():
    y = np.asarray(y, 'f4'); save(y * (0.75 / np.abs(y).max()), SR, f'{OUT}/sfx/{k}.mp3')

# peaceful ambience: wind + birds (Emergency Existential Crisis Room)
N = SR * 12; w = np.random.RandomState(4).randn(N); o = np.zeros(N); a = 0
for i in range(N):
    a += .02 * (w[i] - a); o[i] = a
o = o / np.abs(o).max() * .35 * (.6 + .4 * np.sin(2 * np.pi * np.arange(N) / N * 2))
r = np.random.RandomState(9)
for _ in range(16):
    p = r.randint(0, N - SR // 2); f = 2200 + r.rand() * 1500
    for j in range(r.randint(2, 5)):
        d = t(.09); s = np.sin(2 * np.pi * np.cumsum(f + 800 * np.sin(60 * d)) / SR) * np.hanning(len(d)) * .14; q = p + int(j * .12 * SR)
        if q + len(s) < N: o[q:q + len(s)] += s
save(o.astype('f4'), SR, f'{OUT}/music/nature.mp3')

for s, d in (('rpg-music/readme.txt', 'hydrogene-music.txt'), ('kenney-rpg-audio/License.txt', 'kenney-rpg-audio.txt'),
             ('kenney-interface-sounds/License.txt', 'kenney-interface-sounds.txt'),
             ('fantasy-lands/Fantasy Lands Basic Package/LICENSE.txt', 'fantasy-lands.txt')):
    if os.path.exists(os.path.join(PACKS, s)):
        shutil.copy(os.path.join(PACKS, s), os.path.join(ROOT, 'public/assets/licenses', d))
