# Remove burned-in subtitles (v12). Text = dense sharp edges + light fill inside a band.
# Word blobs are found per frame, unioned over ±2 frames (fades), filled box-wise with
# OpenCV inpaint, softened; grain re-added.
# Usage: python3 tools/v12-desub.py in.mp4 out.mp4 [debug_dir] [start_frame]
import cv2, numpy as np, sys, subprocess
src, dst = sys.argv[1], sys.argv[2]
dbg = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != "-" else None
START = int(sys.argv[4]) if len(sys.argv) > 4 else 0
Y0, Y1 = 770, 1000
def blobs(im):
    band = im[Y0:Y1]
    g = cv2.cvtColor(band, cv2.COLOR_BGR2GRAY)
    hsv = cv2.cvtColor(band, cv2.COLOR_BGR2HSV)
    # thin dark strokes (outline) and thin bright strokes (fill) via morphological hats
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    bh = cv2.morphologyEx(g, cv2.MORPH_BLACKHAT, k)
    th = cv2.morphologyEx(g, cv2.MORPH_TOPHAT, k)
    light = (hsv[..., 1] < 60) & (g > 170)
    strokes = ((bh > 38) | ((th > 22) & light)).astype(np.uint8)
    dens = cv2.boxFilter(strokes.astype(np.float32), -1, (21, 13))
    cand = (dens > 0.16).astype(np.uint8)
    cand = cv2.morphologyEx(cand, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_RECT, (31, 11)))
    n, lab, st, _ = cv2.connectedComponentsWithStats(cand)
    m = np.zeros(g.shape, np.uint8)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if w < 30 or h < 18 or h > 200: continue
        reg = lab == i
        if light[reg].mean() < 0.10: continue   # text fill must be light
        # fill the whole word-box (robust against half-detected strokes)
        m[max(0, y - 8):y + h + 8, max(0, x - 14):x + w + 14] = 1
    full = np.zeros(im.shape[:2], np.uint8); full[Y0:Y1] = m * 255
    return full
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS); W = int(cap.get(3)); H = int(cap.get(4))
frames = []
while True:
    ok, im = cap.read()
    if not ok: break
    frames.append(im)
frames = frames[START:]
N = len(frames)
masks = [blobs(f) for f in frames]
print("masks done", N, flush=True)
p = None
if dst != "-":
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-",
                          "-c:v", "libx264", "-crf", "14", "-preset", "medium", "-pix_fmt", "yuv420p", dst], stdin=subprocess.PIPE)
rng = np.random.default_rng(1)
for i in range(N):
    m = masks[i].copy()
    for d in (-3, -2, -1, 1, 2, 3):
        if 0 <= i + d < N: m = cv2.max(m, masks[i + d])
    im = frames[i]
    out = im
    if m.any():
        out = cv2.inpaint(im, m, 7, cv2.INPAINT_TELEA)
        out = cv2.GaussianBlur(out, (9, 9), 0)  # Telea streaks → soft patch (it sits under cards most of the time)
        mm = cv2.GaussianBlur(m, (11, 11), 0)[..., None] / 255.0
        noise = rng.normal(0, 3.0, im.shape).astype(np.float32)
        out = np.clip(im * (1 - mm) + (out + noise) * mm, 0, 255).astype(np.uint8)
    if dbg and i % 60 == 0:
        cv2.imwrite(f"{dbg}/d{i:04d}.jpg", np.hstack([im, cv2.cvtColor(m, cv2.COLOR_GRAY2BGR), out])[700:1050])
    if p: p.stdin.write(out.tobytes())
if p: p.stdin.close(); p.wait()
print("frames", N)
