# v26 "The Story of a Seed" — all sound effects synthesized here (100% original, no licence risk).
# Writes out/v26/sfx.wav (48 kHz stereo, 60.5 s), timed to the picture (src/v26/scenes.ts timeline).
import numpy as np
from scipy.signal import butter, sosfilt
import wave, sys

SR = 48000
DUR = 60.5
N = int(SR * DUR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(26)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)
def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)
def env(n, a, d, shape=3.0):
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * shape / max(d, 1e-4))
    return e
def add(x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[: N - i]
    l = gain * np.cos((pan + 1) * np.pi / 4); r = gain * np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(x)] += x * l * 1.414; R[i:i + len(x)] += x * r * 1.414
def ramp(n, pts):
    """piecewise-linear envelope from (time, value) points relative to start"""
    t = np.arange(n) / SR
    return np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
def noise(sec):
    return rng.standard_normal(int(sec * SR))

# ---- beds ----
def wind(sec, lo=150, hi=900, wob=0.25):
    x = bp(noise(sec), lo, hi)
    t = np.arange(len(x)) / SR
    m = 0.6 + 0.4 * np.sin(2 * np.pi * wob * t + rng.random() * 6) * np.sin(2 * np.pi * wob * 0.37 * t + 1)
    return x * m
def leaves(sec, dens=40):
    x = hp(noise(sec), 2500) * 0.0
    n = len(x)
    for _ in range(int(dens * sec)):
        i = rng.integers(0, n - 4000); k = rng.integers(400, 3000)
        x[i:i + k] += hp(rng.standard_normal(k), 3000) * env(k, 0.002, k / SR) * rng.random()
    return x
def rain(sec, dens=600):
    base = bp(noise(sec), 400, 7000) * 0.35
    n = len(base)
    for _ in range(int(dens * sec)):
        i = rng.integers(0, n - 2000); k = rng.integers(150, 900)
        f = rng.uniform(1500, 6000)
        tt = np.arange(k) / SR
        base[i:i + k] += np.sin(2 * np.pi * f * tt * (1 + tt * 30)) * env(k, 0.0005, k / SR / 2, 4) * rng.random() * 0.8
    return base
def birdsong(sec, calls=6):
    x = np.zeros(int(sec * SR))
    for _ in range(calls):
        t0 = rng.uniform(0, sec - 1.2)
        f0 = rng.uniform(2600, 4200)
        for j in range(rng.integers(3, 7)):
            k = int(rng.uniform(0.05, 0.12) * SR)
            tt = np.arange(k) / SR
            f = f0 * (1 + 0.35 * np.sin(np.pi * tt / tt[-1]) * rng.choice([-1, 1])) + 400 * np.sin(2 * np.pi * 38 * tt)
            ph = 2 * np.pi * np.cumsum(f) / SR
            s = np.sin(ph) * np.sin(np.pi * tt / tt[-1]) ** 2
            i = int((t0 + j * rng.uniform(0.09, 0.16)) * SR)
            if i + k < len(x): x[i:i + k] += s * rng.uniform(0.4, 1)
    return x

# ---- one-shots ----
def thud(f=70, sec=0.5):
    k = int(sec * SR); tt = np.arange(k) / SR
    body = np.sin(2 * np.pi * f * tt * (1 - tt * 0.6)) * env(k, 0.003, 0.18, 4)
    click = lp(rng.standard_normal(k), 2000) * env(k, 0.001, 0.03, 5) * 0.5
    return mixs(body, click)
def crumbs(sec=0.6, n=40):
    k = int(sec * SR); x = np.zeros(k)
    for _ in range(n):
        i = int(rng.uniform(0, 0.8) ** 2 * (k - 800)); m = rng.integers(100, 700)
        x[i:i + m] += bp(rng.standard_normal(m), 800, 5000) * env(m, 0.0005, m / SR / 2, 5) * rng.random()
    return x
def whoosh(sec=0.8, lo=300, hi=3000):
    k = int(sec * SR); tt = np.arange(k) / SR
    x = bp(noise(sec), lo, hi) * np.sin(np.pi * tt / sec) ** 2
    return x
def drip(f=900):
    k = int(0.25 * SR); tt = np.arange(k) / SR
    fr = f * (1 + 2.5 * np.exp(-tt * 40))
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(k, 0.001, 0.08, 4)
def splash():
    return mixs(drip(700) * 0.8, crumbs(0.4, 25) * 0.5, bp(noise(0.4), 1500, 8000) * env(int(0.4 * SR), 0.001, 0.1, 5) * 0.6)
def crack(sec=0.35):
    k = int(sec * SR); x = np.zeros(k)
    for _ in range(14):
        i = rng.integers(0, k - 600); m = rng.integers(60, 400)
        x[i:i + m] += hp(rng.standard_normal(m), 1500) * env(m, 0.0002, m / SR, 6)
    return x
def creak(sec=0.9, f=110):
    k = int(sec * SR); tt = np.arange(k) / SR
    pulses = (np.sin(2 * np.pi * (f + 30 * np.sin(2 * np.pi * 2 * tt)) * tt) > 0.92).astype(float)
    return bp(pulses, 200, 2500) * np.sin(np.pi * tt / sec)
def rumble(sec=2.0):
    k = int(sec * SR); tt = np.arange(k) / SR
    return lp(noise(sec), 120, 4) * np.sin(np.pi * tt / sec) ** 0.5 * 4
def scrape(sec=1.5):
    k = int(sec * SR); tt = np.arange(k) / SR
    g = bp(noise(sec), 300, 2200) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 9 * tt)))
    return g * np.sin(np.pi * tt / sec)
def pop():
    k = int(0.15 * SR); tt = np.arange(k) / SR
    return mixs(np.sin(2 * np.pi * 420 * tt * (1 - tt * 3)) * env(k, 0.001, 0.05, 5), crumbs(0.15, 8) * 0.4)
def chime(f=1568, sec=2.5):
    k = int(sec * SR); tt = np.arange(k) / SR
    x = sum(np.sin(2 * np.pi * f * h * tt) * a for h, a in [(1, 1), (2.01, 0.35), (3.02, 0.15), (4.3, 0.08)])
    return x * env(k, 0.002, sec * 0.6, 3)
def sparkle():
    x = np.zeros(int(1.2 * SR))
    for j, f in enumerate([2093, 2637, 3136, 4186]):
        c = chime(f, 0.9) * 0.5; i = int(j * 0.06 * SR); x[i:i + len(c)] += c
    return x
def flaps(n=6):
    x = np.zeros(int(0.6 * SR))
    for j in range(n):
        m = 1800; i = int(j * 0.075 * SR)
        x[i:i + m] += lp(rng.standard_normal(m), 1200) * env(m, 0.004, 0.03, 4)
    return x
def riser(sec=1.4):
    k = int(sec * SR); tt = np.arange(k) / SR
    x = bp(noise(sec), 500, 6000) * (tt / sec) ** 2
    s = sum(np.sin(2 * np.pi * f * tt * (1 + tt / sec * 0.5)) for f in [523, 784, 1046]) * (tt / sec) ** 3 * 0.15
    return x + s

def mixs(*xs):
    n = max(len(x) for x in xs); o = np.zeros(n)
    for x in xs: o[:len(x)] += x
    return o

def norm(x):
    return x / (np.max(np.abs(x)) + 1e-9)

# ================= placement (seconds = picture time) =================
# S1 forest
add(norm(wind(8.2, 200, 1200)) * ramp(int(8.2 * SR), [(0, 0), (0.5, 1), (7.4, 1), (8.2, 0.3)]), 0, 0.10)
add(norm(leaves(8, 18)) * ramp(int(8 * SR), [(0, 0), (0.4, 1), (8, 0.6)]), 0, 0.10, -0.3)
add(norm(birdsong(8, 3)), 0.2, 0.035, 0.6)
add(norm(crack(0.12)), 1.3, 0.25, 0.1)                  # stem lets go
add(norm(whoosh(2.6, 200, 1800)), 1.5, 0.16)            # fall
add(norm(thud(85)), 4.3, 0.55); add(norm(crumbs(0.7)), 4.32, 0.25)
add(norm(thud(110, 0.3)), 4.75, 0.18)
add(norm(whoosh(0.7, 400, 4000)), 7.4, 0.3)             # whip tilt
# S2 storm & rain
add(norm(wind(8, 80, 600, 0.4)) * ramp(int(8 * SR), [(0, 0.3), (2.5, 1), (8, 0.6)]), 8.0, 0.14)
add(norm(rumble(3.0)), 9.9, 0.45)                       # distant thunder with the flash
rb = norm(rain(14.5)) * ramp(int(14.5 * SR), [(0, 0), (1.2, 0.5), (3.5, 1), (7.6, 1), (8.2, 0.35), (14.5, 0.2)])
add(rb, 9.5, 0.12)                                       # continues muffled under the soil change
add(norm(whoosh(0.8, 600, 5000)), 10.4, 0.18)            # close-up frame opens
for i in range(16):                                      # close drops on the shell
    add(norm(drip(rng.uniform(650, 1300))), 11.3 + i * 0.27 + rng.uniform(0, 0.12), rng.uniform(0.05, 0.12), rng.uniform(-0.6, 0.6))
add(norm(splash()), 12.25, 0.4)                          # hero drop, slow motion
add(norm(creak(0.8, 140)), 14.1, 0.16); add(norm(crack(0.3)), 14.5, 0.3); add(norm(crack(0.4)), 15.2, 0.32)
add(norm(whoosh(1.0, 300, 3000)), 15.6, 0.22, -0.4); add(norm(whoosh(0.7, 250, 2000)), 16.4, 0.15, 0.4)
# S3/S4 underground
add(norm(lp(noise(15), 220)) * ramp(int(15 * SR), [(0, 0), (1, 1), (14, 1), (15, 0)]), 16.4, 0.10)
for t0 in [17.6, 19.4, 21.2, 23.0]: add(norm(creak(1.0, rng.uniform(90, 150))), t0, 0.11, rng.uniform(-0.3, 0.3))
add(norm(thud(55, 0.8)), 25.5, 0.5); add(norm(rumble(1.6)), 25.5, 0.4)
add(norm(scrape(1.5)), 25.6, 0.18); add(norm(creak(1.2, 80)), 26.0, 0.14)
add(norm(scrape(1.6)), 27.0, 0.2, -0.2)
add(norm(crack(0.4)), 28.9, 0.35); add(norm(crack(0.35)), 29.3, 0.3); add(norm(crumbs(0.8)), 29.0, 0.25)
add(norm(whoosh(1.0, 300, 3000)), 30.5, 0.2, -0.4)
# S5 sunrise
add(norm(birdsong(7.5, 7)), 31.0, 0.06, 0.4)
add(norm(wind(7, 300, 1500, 0.15)), 31.0, 0.05)
add(norm(crumbs(1.2, 60)), 31.6, 0.22); add(norm(crack(0.3)), 32.6, 0.28)
add(norm(pop()), 32.9, 0.35); add(norm(crumbs(0.6, 30)), 32.95, 0.25)
add(norm(sparkle()), 37.35, 0.16, -0.2)
add(norm(whoosh(0.9, 300, 3000)), 37.3, 0.18)
# S6 time-lapse
w6 = norm(wind(12, 250, 1800, 0.5)) * ramp(int(12 * SR), [(0, 0.3), (5, 0.9), (7.6, 1), (9.4, 0.6), (12, 0.8)])
add(w6, 38.0, 0.13)
add(norm(leaves(12, 45)) * ramp(int(12 * SR), [(0, 0.2), (2.6, 0.8), (5, 1), (7.5, 0.1), (9.5, 0.1), (12, 0.8)]), 38.0, 0.12, 0.2)
add(norm(wind(2.4, 400, 3000, 0.9)), 45.6, 0.08)       # cold winter gust
add(norm(birdsong(2.5, 3)), 47.8, 0.04, -0.5)
add(norm(riser(1.4)), 48.65, 0.2)
add(norm(chime(1046, 3.0)) + norm(chime(1568, 3.0)) * 0.6, 50.0, 0.12)
# S7 great oak
add(norm(birdsong(6.5, 9)), 50.2, 0.07, 0.3)
add(norm(leaves(6.5, 25)), 50.0, 0.07, -0.3)
for t0, pan in [(52.0, 0.5), (52.9, -0.5), (53.7, 0.4)]: add(norm(flaps()), t0, 0.14, pan)
add(mixs(norm(drip(500)) * 0.6, norm(crumbs(0.2, 6)) * 0.3), 56.35, 0.12)
# ending
add(norm(chime(784, 3.5)) + norm(chime(1175, 3.5)) * 0.5, 56.7, 0.12)
add(norm(pop()), 57.4, 0.12)                             # subscribe button lands

mx = np.max(np.abs(np.stack([L, R])))
out = np.stack([L, R], 1) / max(mx, 1e-9) * 0.9
path = sys.argv[1] if len(sys.argv) > 1 else "out/v26/sfx.wav"
with wave.open(path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((out * 32767).astype(np.int16).tobytes())
print("wrote", path, f"peak was {mx:.2f}")
