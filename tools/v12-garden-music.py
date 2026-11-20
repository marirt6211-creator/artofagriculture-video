#!/usr/bin/env python3
"""Light, warm 'garden lesson' underscore for v12 (synthesized, no samples, no licence issues).
G major, 92 BPM, I–V–vi–IV. Soft pad + nylon-like plucked arpeggio + marimba motif + soft shaker.
Usage: python3 tools/v12-garden-music.py <out.wav> <dur_sec>"""
import sys
import numpy as np
SR = 44100
out_path, DUR = sys.argv[1], float(sys.argv[2])
BPM = 92.0; BEAT = 60 / BPM; BAR = BEAT * 4
rng = np.random.default_rng(1116)
N = int(SR * (DUR + 4)); L = np.zeros(N); R = np.zeros(N)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)
def add(sig, t0, g=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    j = min(N, i + len(sig)); s = sig[: j - i] * g
    L[i:j] += s * np.sqrt(0.5 * (1 - pan)); R[i:j] += s * np.sqrt(0.5 * (1 + pan))
def pluck(m, dur=1.6, bright=1.0):
    t = np.arange(int(SR * dur)) / SR; f = hz(m); s = np.zeros_like(t)
    for k in range(1, 9):
        if f * k > 9000: break
        s += (1 / k ** 1.3) * np.sin(2 * np.pi * f * k * t + rng.uniform(0, 6)) * np.exp(-t * (2.2 + 1.6 * k * bright))
    att = np.minimum(1, t / 0.004); return s * att
def marimba(m, dur=1.0):
    t = np.arange(int(SR * dur)) / SR; f = hz(m)
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 5) + 0.25 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 18) + 0.1 * np.sin(2 * np.pi * f * 9.2 * t) * np.exp(-t * 40)
    return s * np.minimum(1, t / 0.002)
def pad(notes, dur):
    t = np.arange(int(SR * dur)) / SR; s = np.zeros_like(t)
    for m in notes:
        for det in (-0.06, 0.0, 0.07):
            f = hz(m + det); s += np.sin(2 * np.pi * f * t) + 0.18 * np.sin(2 * np.pi * 2 * f * t)
    env = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.9)
    return s * env / (len(notes) * 3)
def shaker(dur=0.09):
    n = int(SR * dur); x = rng.normal(0, 1, n); x = np.diff(np.concatenate([[0], x]))
    t = np.arange(n) / SR; return x * np.exp(-t * 45) * np.minimum(1, t / 0.01)
def kick():
    t = np.arange(int(SR * 0.35)) / SR; f = 50 + 70 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11)
CH = [[55, 59, 62, 67], [54, 57, 62, 66], [52, 55, 59, 64], [48, 55, 60, 64]]   # G, D/F#, Em, C
BASS = [43, 42, 40, 36]
ARP = [0, 1, 2, 3, 2, 1, 2, 3]
MOTIF = [[71, None, 74, 72, 71, None, 67, None], [69, None, 71, 69, 66, None, 62, None],
         [67, None, 71, 74, 76, None, 74, None], [72, None, 71, 69, 67, None, None, None]]
nbars = int(np.ceil(DUR / BAR)) + 1
for b in range(nbars):
    t0 = b * BAR; c = b % 4; sec = b // 4
    if t0 > DUR: break
    add(pad(CH[c], BAR + 0.9), t0, 0.16)
    add(pluck(BASS[c], 2.4, 0.4), t0, 0.32)
    for k, a in enumerate(ARP):
        add(pluck(CH[c][a] + 12, 1.4), t0 + k * BEAT / 2, 0.15, pan=-0.35 if k % 2 else 0.25)
    if sec >= 1:   # light groove after the first phrase
        for k in range(8):
            add(shaker(), t0 + k * BEAT / 2 + (0.012 if k % 2 else 0), 0.05 if k % 2 else 0.032, pan=0.4)
        add(kick(), t0, 0.18); add(kick(), t0 + 2.5 * BEAT, 0.12)
    if sec % 2 == 1 or sec >= 3:
        for k, m in enumerate(MOTIF[c]):
            if m: add(marimba(m), t0 + k * BEAT / 2, 0.12, pan=0.15)
# ending: G chord rings out
end = DUR - 0.2
for m in [43, 55, 59, 62, 67, 71]:
    add(pluck(m, 3.5, 0.5), end - 2.4, 0.2)
mix = np.stack([L, R], 1)[: int(SR * DUR)]
fade = np.ones(len(mix)); fo = int(SR * 2.2); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
fi = int(SR * 0.3); fade[:fi] = np.linspace(0, 1, fi)
mix *= fade[:, None]; mix /= np.abs(mix).max() + 1e-9; mix *= 0.85
import wave
with wave.open(out_path, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("ok", out_path, DUR)
