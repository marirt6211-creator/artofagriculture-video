#!/usr/bin/env python3
"""v12 audio: speaker's own voice (cleaned clip timeline) + synthesized music bed ducked under speech + soft UI sfx.
Usage: python3 tools/v12-mix.py <src.mp4> <music.wav> <out.wav> <total_sec>"""
import json, subprocess, sys
import numpy as np
SR = 48000
src, music, out, TOTAL = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
def load(path, ss=0.0):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", str(ss), "-i", path, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
N = int(SR * TOTAL)
def fit(x):
    y = np.zeros((N, 2), np.float32); n = min(N, len(x)); y[:n] = x[:n]; return y
voice = fit(load(src, 2 / 24))
# light cleanup of voice: gentle high-pass via first difference blend
mus = fit(load(music))
# speech envelope → ducking
env = np.abs(voice).mean(1)
box = lambda x, k: np.convolve(np.concatenate([[0], np.cumsum(x)]), [1], "valid")[k:] - np.concatenate([[0], np.cumsum(x)])[:-k] if False else (lambda c: np.pad((c[k:] - c[:-k]) / k, (k // 2, k - k // 2 - 1), "edge"))(np.concatenate([[0], np.cumsum(x)]))
k = int(SR * 0.25); env = box(env, k)
thr = np.percentile(env, 60) * 0.35
duck = np.where(env > thr, 0.45, 1.0)
duck = box(duck, int(SR * 0.4))
vrms = np.sqrt((voice ** 2).mean()); mrms = np.sqrt((mus ** 2).mean()) + 1e-9
mus = mus * (vrms / mrms) * 0.30 * duck[:, None]   # music ~ -10 dB under voice, more under speech
W = json.load(open("src/v12/words.json")); wd = {}
for w in W: wd.setdefault(w["w"], []).append(w["s"])
T = lambda w, n=0: wd[w][n]
sfx = []
def at(name, t, g):
    sfx.append((name, t, g))
at("pop", 0.12, .5); at("pop", T("درخت") + 0.02, .4); at("hop", T("بهار"), .35)
at("blip", T("پروتئینی"), .45); at("blip", T("کربوهیدراتی"), .45)
at("pop", T("هسته") - 0.08, .45); at("ping", T("نیتروژنه"), .25); at("hop", T("سال"), .35)
at("riser", T("خزان") - 1.2, .22); at("paper", T("خزان") - 0.3, .5)
for w in ["ساده", "ببره", "ذخیره"]: at("blip", T(w), .4)
at("chime", T("ذخیره") + 0.1, .18)
at("paper", T("بکنه") + 0.2, .4); at("pop", T("توی", 3), .45); at("stamp", T("سه"), .3)
at("pop", T("پس", 1), .45)
at("riser", T("این", 4) - 0.9, .2); at("paper", T("این", 4) + 0.35, .5)
at("chime", T("بهترین"), .25); at("stamp", T("آخر"), .4)
at("paper", T("اما"), .4); at("blip", T("متراژ"), .4); at("blip", T("عجله", 1), .4)
at("hop", T("پاییز"), .35); at("stamp", T("باید"), .35); at("pop", T("که", 4), .45)
at("chime", 52.75, .3); at("pop", 53.2, .45); at("pop", 53.65, .45)
fx = np.zeros((N, 2), np.float32)
for name, t, g in sfx:
    s = load(f"public/sfx-lib/{name}.wav"); i = int(t * SR); j = min(N, i + len(s))
    if i < N: fx[i:j] += s[: j - i] * g
fx *= vrms / (np.sqrt((fx[fx != 0] ** 2).mean()) + 1e-9) * 0.35
mix = voice + mus + fx
# tail: music already fades in its own file; small fade at the very end
f = int(SR * 0.6); mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.95)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ac", "2", "-ar", str(SR), "-i", "-", out], input=mix.astype(np.float32).tobytes())
print("ok", out, len(sfx), "sfx")
