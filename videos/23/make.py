# v23 — talking-presenter short (1080x1920) from a lip-synced photo.
# Inputs: face.jpg (original photo), raw.avi (Wav2Lip output at photo size),
# vo.json words (src/v22/vo.json), logo. Writes raw video frames to stdout.
# usage: python make.py FACE RAW_AVI WORDS_JSON LOGO FONT DURATION_SEC [START_SEC] > pipe
import sys, json, math
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FACE, RAW, WORDS, LOGO, FONT, DUR = sys.argv[1:7]
DUR = float(DUR)
FPS = 25
W, H = 1080, 1920

orig = cv2.imread(FACE)
cap = cv2.VideoCapture(RAW)
oh, ow = orig.shape[:2]

# --- mouth blend mask (lower face only; eyes stay sharp from the photo) ---
MX, MY, RX, RY = 531, 500, 150, 100
mask = np.zeros((oh, ow), np.float32)
cv2.ellipse(mask, (MX, MY), (RX, RY), 0, 0, 360, 1.0, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 22)[..., None]

# --- background: blurred, darkened photo covering the frame ---
bs = H / oh
bg = cv2.resize(orig, (int(ow * bs), H))
x0 = (bg.shape[1] - W) // 2
bg = bg[:, x0:x0 + W]
bg = cv2.GaussianBlur(bg, (0, 0), 40)
bg = (bg.astype(np.float32) * 0.45).astype(np.uint8)

# --- main panel geometry ---
PH = 1300                     # panel height on screen
PY = 250                      # panel top
ps = PH / oh
pw = int(ow * ps)
fcx = int(MX * ps)            # face centre x in scaled panel
px0 = max(0, min(pw - W, fcx - W // 2))
# vertical feather so the panel melts into the background
vf = np.ones((PH, 1), np.float32)
F = 140
for i in range(F):
    a = (i / F) ** 1.5
    vf[i] = a; vf[PH - 1 - i] = a
vf = vf[..., None]

# --- captions ---
data = json.load(open(WORDS))
words = [w for w in data["words"] if w["s"] < DUR]
groups, cur = [], []
for w in words:
    cur.append(w)
    end_punct = w["w"][-1] in ".,?!:"
    if len(cur) >= 3 or end_punct:
        groups.append(cur); cur = []
if cur: groups.append(cur)
KEY = {"NITROGEN", "PHOSPHORUS", "POTASSIUM", "N-P-K.", "N-P-K", "NPK", "FERTILIZER"}
font = ImageFont.truetype(FONT, 92)
GOLD = (255, 200, 60); WHITE = (255, 255, 255)

def caption_layer(t):
    g = None
    for gr in groups:
        if gr[0]["s"] - 0.05 <= t <= gr[-1]["e"] + 0.25:
            g = gr
    if g is None:
        return None
    toks = [w["w"].upper().strip(",.") if w["w"][-1] in ",." else w["w"].upper() for w in g]
    im = Image.new("RGBA", (W, 260), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    sp = 26
    widths = [d.textlength(s, font=font) for s in toks]
    total = sum(widths) + sp * (len(toks) - 1)
    scale = min(1.0, (W - 100) / total)
    f = font if scale == 1.0 else ImageFont.truetype(FONT, int(92 * scale))
    widths = [d.textlength(s, font=f) for s in toks]
    total = sum(widths) + sp * (len(toks) - 1)
    x = (W - total) / 2
    age = t - g[0]["s"]
    pop = 1.0 if age > 0.12 else max(0.0, age / 0.12)
    for w, s, wd in zip(g, toks, widths):
        active = w["s"] - 0.03 <= t <= w["e"] + 0.08
        key = s.strip("?!,.").upper() in KEY
        col = GOLD if (active or key) else WHITE
        y = 70 - (8 if active else 0)
        d.text((x, y), s, font=f, fill=col + (int(255 * pop),),
               stroke_width=7, stroke_fill=(0, 0, 0, int(230 * pop)))
        x += wd + sp
    return im

# --- logo watermark: moves corner per section, soft fade ---
logo = Image.open(LOGO).convert("RGBA").resize((130, 130), Image.LANCZOS)
sh = Image.new("RGBA", (170, 170), (0, 0, 0, 0))
sh.paste((0, 0, 0, 120), (20, 24), logo)
sh = sh.filter(ImageFilter.GaussianBlur(8))
spots = [(W - 170, 90), (40, 90), (W - 170, 90)]
bounds = [0, 18.4, 41.4, 1e9]
mfont = ImageFont.truetype(FONT, 34)

def overlay(t):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    k = max(i for i in range(3) if t >= bounds[i])
    edge = min(t - bounds[k], bounds[k + 1] - t)
    a = max(0.0, min(1.0, edge / 0.5)) * 0.9
    lx, ly = spots[k]
    L = Image.new("RGBA", (170, 170), (0, 0, 0, 0))
    L.alpha_composite(sh); L.alpha_composite(logo, (20, 20))
    L.putalpha(L.getchannel("A").point(lambda v: int(v * a)))
    im.alpha_composite(L, (lx - 20, ly - 20))
    # faint sliding handle on the opposite edge
    tx = Image.new("RGBA", (420, 60), (0, 0, 0, 0))
    ImageDraw.Draw(tx).text((0, 0), "ArtofAgriculture", font=mfont, fill=(255, 255, 255, 105))
    slide = (t % 20) / 20
    ox = int(60 + slide * (W - 480)) if k % 2 == 0 else int(W - 480 - slide * (W - 540))
    im.alpha_composite(tx, (ox, H - 120))
    cap_im = caption_layer(t)
    if cap_im is not None:
        im.alpha_composite(cap_im, (0, 1470))
    return im

N = int(round(DUR * FPS))
last = None
out = sys.stdout.buffer
for n in range(N):
    t = n / FPS
    ok, fr = cap.read()
    if ok:
        last = fr
    fr = last
    if fr.shape[:2] != (oh, ow):
        fr = cv2.resize(fr, (ow, oh))
    # colour-match the generated mouth to the photo, then sharpen lightly
    patch = fr.astype(np.float32)
    o = orig.astype(np.float32)
    m = mask[..., 0] > 0.5
    patch += (o[m].mean(0) - patch[m].mean(0))
    blur = cv2.GaussianBlur(patch, (0, 0), 1.6)
    patch = cv2.addWeighted(patch, 1.6, blur, -0.6, 0)
    face = o * (1 - mask) + patch * mask
    # slow push-in + gentle sway
    z = 1.0 + 0.07 * (t / DUR) + 0.006 * math.sin(t * 0.9)
    dx = 6 * math.sin(t * 0.37)
    dy = 4 * math.sin(t * 0.29 + 1)
    sc = ps * z
    M = np.float32([[sc, 0, -(fcx * z - (fcx - px0)) + dx],
                    [0, sc, -(MY * ps * z - MY * ps) + dy]])
    panel = cv2.warpAffine(np.clip(face, 0, 255).astype(np.uint8), M, (W, PH),
                           flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)
    frame = bg.copy().astype(np.float32)
    region = frame[PY:PY + PH]
    frame[PY:PY + PH] = region * (1 - vf) + panel.astype(np.float32) * vf
    # bottom shade for caption legibility
    frame[1380:] *= np.linspace(1.0, 0.55, H - 1380)[:, None, None]
    rgb = Image.fromarray(cv2.cvtColor(frame.clip(0, 255).astype(np.uint8), cv2.COLOR_BGR2RGB)).convert("RGBA")
    rgb.alpha_composite(overlay(t))
    out.write(rgb.convert("RGB").tobytes())
