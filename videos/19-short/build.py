# v19 Short (9:16, ~2 min): best sentences of the v19 narration, cut from the v19 render (picture + voice stay in sync),
# 16:9 panel over a blurred copy, logo + title on top, English word-by-word captions, music A underneath.
import json, re, subprocess, sys
VO = json.load(open('src/v19/vo.json'))
seg = {s['n']: s for s in VO['segs']}
GROUPS = [[1, 2], [4, 5], [7, 8, 9, 10, 11], [14, 15, 16, 17], [19], [26, 27, 28], [33], [36, 37], [39]]
XF = 0.3
cuts = []
for g in GROUPS:
    a = seg[g[0]]['start'] - 0.15
    b = seg[g[-1]]['end'] + (1.4 if g[-1] == 39 else 0.35)
    cuts.append((round(a, 3), round(b, 3), g))
offs, o = [], 0.0
for i, (a, b, g) in enumerate(cuts):
    offs.append(o); o += (b - a) - XF
T = o + XF
print('total', round(T, 2))
# ---- video + voice
V, AU = 'out/video.mp4', 'public/v19/vo.wav'
import os
os.makedirs('out/short', exist_ok=True)
for i, (a, b, g) in enumerate(cuts):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{a}', '-i', V, '-ss', f'{a}', '-i', AU, '-t', f'{b - a:.3f}', '-map', '0:v', '-map', '1:a',
                    '-c:v', 'libx264', '-crf', '14', '-preset', 'veryfast', '-r', '30', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', f'out/short/s{i:02d}.mkv'], check=True)
ins, fc = [], []
for i in range(len(cuts)): ins += ['-i', f'out/short/s{i:02d}.mkv']
last, lasta = '0:v', '0:a'
for i in range(1, len(cuts)):
    vo, ao = ('vout', 'aout') if i == len(cuts) - 1 else (f'x{i}', f'y{i}')
    fc.append(f"[{last}][{i}:v]xfade=transition=fade:duration={XF}:offset={offs[i]:.3f}[{vo}]")
    fc.append(f"[{lasta}][{i}:a]acrossfade=d={XF}[{ao}]")
    last, lasta = vo, ao
open('out/short-fc.txt', 'w').write(';\n'.join(fc))
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex_script', 'out/short-fc.txt', '-map', '[vout]', '-map', '[aout]',
                '-c:v', 'libx264', '-crf', '14', '-preset', 'veryfast', '-c:a', 'pcm_s16le', 'out/short-panel.mkv'], check=True)
# ---- word timings on the new timeline
words = []
for i, (a, b, g) in enumerate(cuts):
    for w in VO['words']:
        if w['line'] in g and a <= w['s'] < b:
            words.append({'w': w['w'], 's': offs[i] + w['s'] - a, 'e': offs[i] + w['e'] - a, 'line': w['line']})
json.dump({'total': T, 'words': words, 'cuts': cuts, 'offs': offs}, open('videos/19-short/short-words.json', 'w'))
# ---- captions (ASS): 3–4 word chunks, the spoken word turns gold
def ts(x): return f"{int(x // 3600)}:{int(x % 3600 // 60):02d}:{x % 60:05.2f}"
chunks, cur = [], []
for w in words:
    cur.append(w)
    end_punct = re.search(r"[.,?!:;]$", w['w'])
    if len(cur) >= 4 or end_punct or (len(cur) >= 2 and len(' '.join(x['w'] for x in cur)) > 18):
        chunks.append(cur); cur = []
if cur: chunks.append(cur)
ev = []
for ci, ch in enumerate(chunks):
    st = ch[0]['s'] - 0.05
    en = chunks[ci + 1][0]['s'] - 0.03 if ci + 1 < len(chunks) and chunks[ci + 1][0]['s'] - ch[-1]['e'] < 0.6 else ch[-1]['e'] + 0.25
    for wi, w in enumerate(ch):
        a = st if wi == 0 else w['s']
        b = ch[wi + 1]['s'] if wi + 1 < len(ch) else en
        txt = ' '.join(("{\\c&H4BB8F2&}" + x['w'].upper() + "{\\c&HFFFFFF&}") if xi == wi else x['w'].upper() for xi, x in enumerate(ch))
        pop = "{\\fscx104\\fscy104\\t(0,90,\\fscx100\\fscy100)}" if wi == 0 else ""
        ev.append(f"Dialogue: 0,{ts(a)},{ts(b)},CAP,,0,0,0,,{pop}{txt}")
head = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "WrapStyle: 0", "", "[V4+ Styles]",
 "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
 "Style: CAP,Anton,84,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,2,0,1,6,3,5,70,70,0,1",
 "Style: TTL,Libre Baskerville,54,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,3,0,1,3,2,8,60,60,0,1",
 "Style: SUB,Anton,40,&H004BB8F2,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,6,0,1,3,1,8,60,60,0,1",
 "", "[Events]", "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"]
ev = [e.replace(',CAP,,0,0,0,,', ',CAP,,0,0,0,,{\\pos(540,1390)}') for e in ev]
ev.append(f"Dialogue: 0,{ts(0)},{ts(T - 2.2)},TTL,,0,0,0,,{{\\pos(540,330)\\fad(400,300)}}THE HIDDEN WORLD\\NBENEATH OUR FEET")
ev.append(f"Dialogue: 0,{ts(0.4)},{ts(T - 2.2)},SUB,,0,0,0,,{{\\pos(540,505)\\fad(400,300)}}THE SECRET LIFE OF SOIL")
ev.append(f"Dialogue: 0,{ts(0.6)},{ts(T)},SUB,,0,0,0,,{{\\pos(540,1680)\\fad(400,300)\\c&HFFFFFF&\\alpha&H40&}}@ARTOFAGRICULTURE")
open('videos/19-short/captions.ass', 'w').write('\n'.join(head + ev) + '\n')
print(len(chunks), 'caption chunks')
