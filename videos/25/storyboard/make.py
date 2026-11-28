# Storyboard frames for v25 (Humic Acid short). Mock-ups built from the real footage.
import subprocess, os, io
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

R = '/home/user/artofagriculture-video'
OUT = f'{R}/videos/25/storyboard/frames'
os.makedirs(OUT, exist_ok=True)
W, H = 540, 960
F = f'{R}/public/fonts'
GOLD, GREEN, CREAM, RED = (244, 196, 48), (120, 200, 90), (250, 246, 232), (230, 70, 60)

def font(name, size): return ImageFont.truetype(f'{F}/{name}', size)
ANTON = lambda s: font('Anton-Regular.ttf', s)
INTER = lambda s: font('Inter.ttf', s)

def grab(path, t=0.0):
    p = f'{R}/{path}'
    if p.endswith(('.jpg', '.png')):
        return Image.open(p).convert('RGB')
    b = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(t), '-i', p, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'],
                       capture_output=True).stdout
    return Image.open(io.BytesIO(b)).convert('RGB')

def cover(img, w, h, fx=0.5, fy=0.5, zoom=1.0):
    s = max(w / img.width, h / img.height) * zoom
    im = img.resize((int(img.width * s + .5), int(img.height * s + .5)), Image.LANCZOS)
    x = min(max(int(fx * im.width - w / 2), 0), im.width - w)
    y = min(max(int(fy * im.height - h / 2), 0), im.height - h)
    return im.crop((x, y, x + w, y + h))

def rounded(im, r=22, border=None, bw=5):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = Image.new('RGBA', im.size); out.paste(im, (0, 0), m)
    if border:
        ImageDraw.Draw(out).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, outline=border, width=bw)
    return out

def shadow_paste(base, im, xy, blur=14):
    sh = Image.new('RGBA', (im.width + 60, im.height + 60), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((30, 38, 30 + im.width, 38 + im.height), 24, fill=(0, 0, 0, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(sh, (xy[0] - 30, xy[1] - 30))
    base.alpha_composite(im, xy)

def grad(base, top=True, h=380, a=200):
    g = Image.new('L', (1, h))
    for i in range(h): g.putpixel((0, i), int(a * ((h - i) / h if top else i / h) ** 1.4))
    g = g.resize((W, h)); blk = Image.new('RGBA', (W, h), (0, 0, 0, 255)); blk.putalpha(g)
    base.alpha_composite(blk, (0, 0 if top else H - h))

def text(d, xy, s, f, fill=CREAM, anchor='mm', stroke=0, sf=(0, 0, 0)):
    d.text(xy, s, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=sf)

def plate(base, cx, cy, s, f, fg=(20, 30, 20), bg=GOLD, pad=(22, 12)):
    d = ImageDraw.Draw(base); b = d.textbbox((0, 0), s, font=f)
    w, h = b[2] - b[0] + pad[0] * 2, b[3] - b[1] + pad[1] * 2
    d.rounded_rectangle((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2), 14, fill=bg)
    text(d, (cx, cy), s, f, fill=fg)

LOGO = Image.open(f'{R}/public/brand/aoa-logo.png').convert('RGBA').resize((66, 66), Image.LANCZOS)
def watermark(base, corner):
    pos = {'tr': (W - 84, 22), 'tl': (18, 22), 'br': (W - 84, H - 330), 'bl': (18, H - 330)}[corner]
    base.alpha_composite(LOGO, pos)

def caption(base, line, hi):
    d = ImageDraw.Draw(base); f = font('Oswald.ttf', 34)
    words = line.split(); lines = [[]]
    for w in words:
        t = ' '.join(lines[-1] + [w])
        if d.textlength(t, font=f) > W - 70 and lines[-1]: lines.append([w])
        else: lines[-1].append(w)
    y = 790 - 22 * (len(lines) - 1)
    for ln in lines:
        x = (W - d.textlength(' '.join(ln), font=f)) / 2
        for w in ln:
            col = GOLD if w.strip(',.!?').lower() in hi else (255, 255, 255)
            d.text((x, y), w, font=f, fill=col, stroke_width=3, stroke_fill=(0, 0, 0))
            x += d.textlength(w + ' ', font=f)
        y += 46

def arrow(d, a, b, col=GOLD, w=6):
    d.line([a, b], fill=col, width=w)
    import math
    ang = math.atan2(b[1] - a[1], b[0] - a[0])
    for s in (2.6, -2.6):
        d.line([b, (b[0] + 22 * math.cos(ang + s), b[1] + 22 * math.sin(ang + s))], fill=col, width=w)

def save(base, n):
    base.convert('RGB').save(f'{OUT}/f{n:02d}.jpg', quality=88)

# ---------- 00 cover (user thumbnail) ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('uploads/v25/title-cover.png'), W, H, zoom=1.04))
d = ImageDraw.Draw(b)
for i, r in enumerate((250, 300)):
    pass
save(b, 0)

# ---------- 01 hook: struggling plant ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('uploads/v25/clip1.mp4', 0.3), W, H, fy=.45, zoom=1.08))
grad(b, True, 420); d = ImageDraw.Draw(b)
text(d, (W / 2, 150), 'ENOUGH WATER', ANTON(58), fill=CREAM, stroke=3)
text(d, (W / 2, 225), 'ENOUGH FERTILIZER', ANTON(58), fill=CREAM, stroke=3)
text(d, (W / 2, 320), 'STILL WEAK?', ANTON(78), fill=GOLD, stroke=4)
caption(b, 'why some soils struggle to grow healthy plants', {'soils', 'struggle'}); watermark(b, 'br'); save(b, 1)

# ---------- 02 hook b: watering + PiP plant ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s01a.mp4', 3), W, H, fx=.3))
pip = rounded(cover(grab('uploads/v25/clip1.mp4', 1.0), 190, 300, fy=.45), 20, GOLD, 5)
shadow_paste(b, pip, (W - 220, 90))
caption(b, 'even when they receive enough water and fertilizer?', {'water', 'fertilizer'}); watermark(b, 'tl'); save(b, 2)

# ---------- 03 humic acid reveal ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s02a.mp4', 3), W, H, fx=.55))
b = Image.alpha_composite(b, Image.new('RGBA', (W, H), (0, 0, 0, 70))); d = ImageDraw.Draw(b)
text(d, (W / 2, 390), 'HUMIC', ANTON(130), fill=GOLD, stroke=5)
text(d, (W / 2, 520), 'ACID', ANTON(130), fill=CREAM, stroke=5)
caption(b, 'One substance that can help improve soil conditions', {'soil'}); watermark(b, 'tr'); save(b, 3)

# ---------- 04 decomposition: split top/bottom ----------
b = Image.new('RGBA', (W, H), (20, 16, 12, 255))
top = cover(grab('public/v25/footage/s03b.mp4', 2), W, H // 2, fx=.6)
bot = cover(grab('public/v25/footage/s03a.mp4', 4), W, H // 2, fx=.4)
b.paste(top, (0, 0)); b.paste(bot, (0, H // 2)); d = ImageDraw.Draw(b)
d.rectangle((0, H // 2 - 3, W, H // 2 + 3), fill=GOLD)
plate(b, W / 2, H // 2, 'DECOMPOSITION', ANTON(44))
text(d, (W / 2, 70), 'PLANTS + ANIMALS', ANTON(44), fill=CREAM, stroke=3)
caption(b, 'long-term decomposition of plant and animal materials', {'decomposition'}); watermark(b, 'br'); save(b, 4)

# ---------- 05 three benefits: stacked panels ----------
b = Image.new('RGBA', (W, H), (18, 26, 18, 255))
srcs = [('public/v25/footage/s05b.mp4', 3, .5, 'STRUCTURE'), ('public/v25/footage/s04a.mp4', 3, .5, 'MOISTURE'), ('uploads/v25/clip2.mp4', 3.5, .5, 'NUTRIENTS')]
ph = 270
for i, (p, t, fx, lab) in enumerate(srcs):
    im = rounded(cover(grab(p, t), W - 60, ph, fx=fx, fy=.6 if i == 2 else .5), 22, GOLD if i == 2 else None, 5)
    shadow_paste(b, im, (30, 40 + i * (ph + 22)))
    plate(b, 30 + 110, 40 + i * (ph + 22) + 34, lab, ANTON(34), bg=GOLD if i == 2 else CREAM)
caption(b, 'making certain nutrients more available to plants', {'nutrients'}); save(b, 5)

# ---------- 06 nutrients detail: user image push-in ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('uploads/v25/tree-nutrients.jpg'), W, H, fy=.72, zoom=1.35))
d = ImageDraw.Draw(b)
for (x, y) in ((140, 300), (400, 420), (260, 560)):
    d.ellipse((x - 34, y - 34, x + 34, y + 34), outline=GOLD, width=4)
caption(b, 'more available to plants', {'available'}); watermark(b, 'tl'); save(b, 6)

# ---------- 07 roots + life: full + PiP ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s05a.mp4', 3), W, H))
pip = rounded(cover(grab('public/v25/footage/s05b.mp4', 4), 230, 230), 115, GOLD, 5)
shadow_paste(b, pip, (W - 270, 470)); d = ImageDraw.Draw(b)
text(d, (W / 2, 120), 'ROOTS', ANTON(96), fill=GOLD, stroke=4)
caption(b, 'support root development and beneficial biological activity', {'root', 'biological'}); watermark(b, 'tl'); save(b, 7)

# ---------- 08 biological activity: user glowing roots ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('uploads/v25/clip3.mp4', 2), W, H, fy=.6, zoom=1.15))
d = ImageDraw.Draw(b)
text(d, (W / 2, 110), 'LIFE IN THE SOIL', ANTON(64), fill=CREAM, stroke=4)
caption(b, 'increase beneficial biological activity in the soil', {'biological', 'activity'}); watermark(b, 'br'); save(b, 8)

# ---------- 09 three forms triptych ----------
b = Image.new('RGBA', (W, H), (26, 20, 14, 255))
b.paste(cover(grab('uploads/v25/tree-flow.jpg'), W, H, fy=.8).filter(ImageFilter.GaussianBlur(14)))
b = Image.alpha_composite(b, Image.new('RGBA', (W, H), (0, 0, 0, 120))); d = ImageDraw.Draw(b)
text(d, (W / 2, 70), '3 FORMS', ANTON(70), fill=GOLD, stroke=4)
forms = [('uploads/v25/clip1.mp4', 3.2, .7, 'LIQUID'), ('public/v25/footage/s06a.jpg', 0, .5, 'POWDER'), ('public/v25/footage/s06b.jpg', 0, .5, 'GRANULES')]
for i, (p, t, fx, lab) in enumerate(forms):
    im = rounded(cover(grab(p, t), 300, 200, fx=fx), 20, CREAM, 4)
    x = 40 if i % 2 == 0 else W - 340
    shadow_paste(b, im, (x, 140 + i * 205))
    plate(b, x + 150, 140 + i * 205 + 200, lab, ANTON(32))
caption(b, 'liquid, powder, and granules', {'liquid', 'powder', 'granules'}); save(b, 9)

# ---------- 10 application: tractor + big keywords ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s07a.mp4', 3), W, H, fx=.55))
grad(b, True, 460); d = ImageDraw.Draw(b)
text(d, (W / 2, 110), 'THE RIGHT AMOUNT', ANTON(54), fill=GOLD, stroke=4)
for i, s in enumerate(('CONCENTRATION', 'PLANT TYPE', 'SOIL')):
    plate(b, W / 2, 200 + i * 72, s, ANTON(36), bg=CREAM if i else GOLD)
caption(b, 'product concentration, plant type, and soil conditions', {'concentration', 'type', 'conditions'}); watermark(b, 'br'); save(b, 10)

# ---------- 11 not a replacement ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s08a.jpg'), W, H, fx=.5).filter(ImageFilter.GaussianBlur(1)))
b = Image.alpha_composite(b, Image.new('RGBA', (W, H), (0, 0, 0, 90))); d = ImageDraw.Draw(b)
plate(b, W / 2, 300, 'NPK', ANTON(110), bg=CREAM)
d.line((150, 220, 390, 380), fill=RED, width=12)
text(d, (W / 2, 470), 'NOT A', ANTON(78), fill=CREAM, stroke=4)
text(d, (W / 2, 560), 'REPLACEMENT', ANTON(78), fill=RED, stroke=4)
caption(b, 'humic acid is not a replacement for NPK fertilizers', {'not', 'replacement'}); watermark(b, 'tl'); save(b, 11)

# ---------- 12 work together: split left/right ----------
b = Image.new('RGBA', (W, H))
L = cover(grab('public/v25/footage/s09a.mp4', 3), W // 2, H, fx=.5); Rr = cover(grab('uploads/v25/tree-flow.jpg'), W // 2, H, fy=.55)
b.paste(L, (0, 0)); b.paste(Rr, (W // 2, 0)); d = ImageDraw.Draw(b)
d.rectangle((W // 2 - 3, 0, W // 2 + 3, H), fill=GOLD)
plate(b, W / 4, 150, 'NPK', ANTON(54), bg=CREAM); plate(b, 3 * W / 4, 150, 'HUMIC', ANTON(54))
d.ellipse((W / 2 - 46, 330, W / 2 + 46, 422), fill=GOLD); text(d, (W / 2, 374), '+', ANTON(80), fill=(20, 30, 20))
caption(b, 'It works alongside them', {'alongside'}); save(b, 13 - 1)

# ---------- 13 growth ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s09b.mp4', 5), W, H, fx=.5))
caption(b, 'better conditions for plant growth', {'growth'}); watermark(b, 'br'); save(b, 13)

# ---------- 14 ending: transformed plant ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('uploads/v25/clip1.mp4', 7.6), W, H, fy=.45, zoom=1.05))
grad(b, True, 420); d = ImageDraw.Draw(b)
text(d, (W / 2, 120), 'HEALTHY SOIL', ANTON(76), fill=GOLD, stroke=4)
text(d, (W / 2, 205), '=', ANTON(60), fill=CREAM, stroke=3)
text(d, (W / 2, 285), 'HEALTHY PLANTS', ANTON(76), fill=CREAM, stroke=4)
caption(b, 'healthy plants start with healthy soil!', {'healthy', 'soil!'}); watermark(b, 'tl'); save(b, 14)

# ---------- 15 end card (short) ----------
b = Image.new('RGBA', (W, H)); b.paste(cover(grab('public/v25/footage/s10b.mp4', 3), W, H).filter(ImageFilter.GaussianBlur(10)))
b = Image.alpha_composite(b, Image.new('RGBA', (W, H), (0, 0, 0, 110))); d = ImageDraw.Draw(b)
big = Image.open(f'{R}/public/brand/aoa-logo.png').convert('RGBA').resize((250, 250), Image.LANCZOS)
b.alpha_composite(big, ((W - 250) // 2, 260))
text(d, (W / 2, 590), '@ArtofAgriculture', ANTON(46), fill=GOLD, stroke=3)
text(d, (W / 2, 650), 'Knowledge Today, Agriculture Tomorrow', INTER(22), fill=CREAM)
plate(b, W / 2, 740, 'SUBSCRIBE', ANTON(40), fg=(255, 255, 255), bg=RED)
save(b, 15)
print('ok')
