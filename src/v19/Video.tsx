// v19 · Art of Agriculture — "The Hidden World Beneath Our Feet" (YouTube, 16:9, ~3:52).
// NFP footage style: the user's art (public/v19/art) + free footage (src/v19/footage.json) + a teal/gold motion-graphics layer.
// Every time comes from the narration (src/v19/vo.json, Sarah, eleven_v4, tempo 1.1). Storyboard: videos/19/storyboard.html.
// Channel rule: the logo watermark changes position between scenes (CHANNEL.md).
import React from "react";
import { AbsoluteFill, Audio, Composition, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageTime, Media, type FootageClip, type Manifest } from "../footage/footage";
import manJson from "./footage.json";
import voJson from "./vo.json";

const MAN = manJson as unknown as Manifest;
type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as unknown as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const W = 1920, H = 1080, FPS = 30;
const TEAL = "#5fe6d6", TEAL2 = "#a6fff4", GOLD = "#f2b84b", GOLD2 = "#ffd98a", BLUE = "#7cc8ff", ROOT = "#e9d6b0";
const DISP = "AoaSerif", BODY = "InterV";

// ---------- fonts ----------
const fh = delayRender("v19 fonts");
Promise.all([
  new FontFace(DISP, `url('${staticFile("fonts/LibreBaskerville.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
  new FontFace(BODY, `url('${staticFile("fonts/Inter.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); }).catch((e) => { console.error(e); continueRender(fh); });

// ---------- helpers ----------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const vis = (t: number, a: number, b: number, fi = 0.35, fo = 0.35) => Math.min(lin(t, a, a + fi), 1 - lin(t, b - fo, b));
const rng = (seed: number) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let r = Math.imul(seed ^ (seed >>> 15), 1 | seed); r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r; return ((r ^ (r >>> 14)) >>> 0) / 4294967296; };
const norm = (s: string) => s.toLowerCase().replace(/[^a-z']/g, "");
const L = (n: number) => VO.segs.find((s) => s.n === n)!;
const S = (n: number) => L(n).start;
const E = (n: number) => L(n).end;
/** start of the k-th occurrence of a word in line n */
const Wd = (n: number, word: string, k = 0) => { const m = VO.words.filter((w) => w.line === n && norm(w.w) === norm(word)); return m[k]?.s ?? S(n); };
const END = E(39) + 10.5;

// ---------- media ----------
const art = (file: string, w: number, h: number, video = false): FootageClip => ({ file: `v19/art/${file}`, kind: video ? "video" : "image", w, h, dur: video ? 12 : undefined });
const ART: Record<string, FootageClip> = {
  a01: art("a01.jpg", 1408, 768), a02: art("a02.jpg", 1376, 768), a03: art("a03.jpg", 1376, 768), a04: art("a04.jpg", 1672, 941), a05: art("a05.jpg", 1376, 768),
  a10: art("a10-rain-erosion.jpg", 1376, 768), a11: art("a11-wind-erosion.jpg", 1376, 768), a13: art("a13-bacteria-leaf.jpg", 1376, 768),
  g06: art("a06.mp4", 1920, 1080, true), g07: art("a07.mp4", 1920, 1080, true), g08: art("a08.mp4", 1920, 1080, true), g09: art("a09.mp4", 1920, 1080, true),
  g12: art("a12-wind-erosion.mp4", 1920, 1080, true), g14: art("a14-bacteria-leaf.mp4", 1920, 1080, true), g16: art("a16.mp4", 1280, 720, true),
};
const clip = (k: string) => ART[k] ?? MAN.clips[k];

type Tin = "fade" | "cut" | "zoom" | "whip" | "flash";
type Shot = { k: string; at: number; until: number; focus?: [number, number]; pan?: [number, number]; zoom?: number; push?: number; from?: number; rate?: number; tin?: Tin; filter?: string };

// ---------- timeline ----------
const T_DIVE = Wd(1, "lies") + 0.1;
const SHOTS: Shot[] = [
  // Scene 1 — the hidden world
  { k: "f11", at: 0, until: T_DIVE + 0.6, focus: [0.45, 0.6], push: 0.12, rate: 0.7, tin: "cut" },
  { k: "a01", at: T_DIVE + 0.35, until: S(2) + 0.4, focus: [0.5, 0.5], zoom: 1.25, push: -0.12, tin: "zoom" },
  { k: "g09", at: S(2), until: Wd(2, "mysterious") + 0.3, focus: [0.45, 0.55], zoom: 1.05, push: 0.1, tin: "fade" },
  { k: "g08", at: Wd(2, "mysterious"), until: Wd(2, "incredible") + 0.3, focus: [0.5, 0.65], zoom: 1.02, push: 0.06, tin: "fade" },
  { k: "a04", at: Wd(2, "incredible"), until: S(3) + 0.3, focus: [0.5, 0.5], zoom: 1.12, push: -0.1, pan: [0.04, 0], tin: "fade" },
  { k: "a03", at: S(4) - 0.2, until: S(5) + 0.4, focus: [0.5, 0.35], zoom: 1.35, push: -0.22, pan: [0, 0.25], tin: "flash" },
  // Scene 2 — more than dirt
  { k: "f21", at: S(6) - 0.4, until: S(7) + 0.4, focus: [0.55, 0.5], push: 0.1, tin: "fade" },
  { k: "a04", at: S(7), until: E(7) + 0.3, focus: [0.5, 0.5], zoom: 1.1, push: 0.05, filter: "blur(14px) brightness(.42)", tin: "fade" },
  { k: "f23", at: S(8) - 0.1, until: Wd(8, "returning") + 0.4, focus: [0.55, 0.5], push: 0.14, rate: 0.8, tin: "whip" },
  { k: "a13", at: Wd(8, "returning"), until: E(8) + 0.4, focus: [0.55, 0.5], zoom: 1.4, push: -0.25, tin: "zoom" },
  { k: "a04", at: S(9) - 0.1, until: E(9) + 0.3, focus: [0.86, 0.74], zoom: 2.6, push: 0.15, tin: "zoom" },
  { k: "f25", at: S(10) - 0.2, until: E(11) + 0.4, focus: [0.45, 0.4], push: 0.1, rate: 0.85, tin: "whip" },
  { k: "a04", at: S(12) - 0.1, until: S(13) + 0.4, focus: [0.5, 0.5], zoom: 1.0, push: 0.08, tin: "fade" },
  // Scene 3 — the secret connection
  { k: "a02", at: S(13) - 0.1, until: E(13) + 0.3, focus: [0.5, 0.2], zoom: 1.35, push: 0.0, pan: [0, 0.55], tin: "fade" },
  { k: "a01", at: S(14) - 0.1, until: E(15) + 0.3, focus: [0.3, 0.6], zoom: 1.7, push: 0.12, pan: [0.15, -0.05], tin: "whip" },
  { k: "a04", at: S(16) - 0.1, until: Wd(16, "mycorrhizae") + 0.3, focus: [0.86, 0.74], zoom: 2.2, push: 0.25, tin: "fade" },
  { k: "a04", at: Wd(16, "mycorrhizae"), until: E(16) + 0.4, focus: [0.86, 0.74], zoom: 2.8, push: 0.1, filter: "blur(12px) brightness(.35)", tin: "fade" },
  { k: "f35", at: S(18) - 0.2, until: Wd(18, "photosynthesis") + 0.3, focus: [0.5, 0.45], push: 0.1, tin: "flash" },
  { k: "a02", at: Wd(18, "photosynthesis"), until: E(19) + 0.3, focus: [0.5, 0.5], zoom: 1.08, push: 0.05, tin: "fade" },
  { k: "f37", at: S(20) - 0.2, until: E(21) + 0.4, focus: [0.5, 0.5], push: 0.12, rate: 0.9, tin: "fade" },
  { k: "g07", at: S(22) - 0.1, until: E(22) + 0.3, focus: [0.5, 0.6], zoom: 1.04, push: 0.06, tin: "fade" },
  { k: "a05", at: S(23) - 0.1, until: Wd(23, "greatly") + 0.3, focus: [0.4, 0.45], zoom: 1.1, push: 0.15, tin: "zoom" },
  { k: "g06", at: Wd(23, "greatly"), until: E(23) + 0.3, focus: [0.4, 0.45], zoom: 1.02, push: 0.06, tin: "fade" },
  { k: "a02", at: S(24) - 0.1, until: E(24) + 0.3, focus: [0.5, 0.9], zoom: 1.3, push: 0.0, pan: [0, -0.8], tin: "whip" },
  { k: "f311", at: S(25) - 0.1, until: S(26) + 0.4, focus: [0.5, 0.5], push: 0.08, tin: "fade" },
  // Scene 4 — fragile
  { k: "a04", at: S(26), until: E(26) + 0.3, focus: [0.5, 0.5], zoom: 1.12, push: 0.06, filter: "saturate(.25) brightness(.62)", tin: "fade" },
  { k: "f42a", at: Wd(27, "deforestation") - 0.05, until: Wd(27, "soil") + 0.05, focus: [0.5, 0.5], push: 0.08, tin: "cut" },
  { k: "a10", at: Wd(27, "soil"), until: Wd(27, "excessive") + 0.05, focus: [0.5, 0.6], zoom: 1.05, push: 0.08, tin: "cut" },
  { k: "f42c", at: Wd(27, "excessive"), until: Wd(27, "unsustainable") + 0.05, focus: [0.5, 0.5], push: 0.12, tin: "cut" },
  { k: "f42d", at: Wd(27, "unsustainable"), until: E(27) + 0.4, focus: [0.5, 0.5], push: 0.1, tin: "cut" },
  { k: "a10", at: S(28) - 0.1, until: Wd(28, "carry") + 0.3, focus: [0.6, 0.55], zoom: 1.08, push: 0.12, tin: "fade" },
  { k: "g12", at: Wd(28, "carry"), until: Wd(28, "carry") + 1.4, focus: [0.5, 0.5], zoom: 1.0, push: 0.04, tin: "fade" },
  { k: "a11", at: Wd(28, "carry") + 1.2, until: E(28) + 0.4, focus: [0.5, 0.5], zoom: 1.05, push: 0.06, pan: [0.05, 0], tin: "fade" },
  { k: "f44a", at: S(29) - 0.1, until: Wd(29, "water") + 0.2, focus: [0.5, 0.5], zoom: 1.05, push: 0.1, tin: "fade" },
  { k: "f44b", at: Wd(29, "water"), until: E(29) + 0.3, focus: [0.5, 0.5], push: 0.1, filter: "saturate(.6) brightness(.85)", tin: "fade" },
  { k: "a04", at: S(30) - 0.1, until: E(30) + 0.3, focus: [0.5, 0.5], zoom: 1.0, push: 0.05, filter: "saturate(.2) brightness(.55)", tin: "fade" },
  { k: "f46", at: S(31) - 0.2, until: S(32) + 0.4, focus: [0.5, 0.5], push: 0.1, tin: "flash" },
  { k: "a03", at: S(33) - 0.2, until: E(33) + 0.9, focus: [0.5, 0.5], zoom: 1.45, push: -0.28, tin: "fade" },
  // Scene 5 — the world we must protect
  { k: "f11", at: S(34) - 0.2, until: E(34) + 0.3, from: 4, focus: [0.45, 0.6], push: 0.08, rate: 0.6, tin: "fade" },
  { k: "f53", at: S(36) - 0.1, until: E(37) + 0.6, focus: [0.5, 0.55], push: 0.12, rate: 0.9, tin: "fade" },
];

// ---------- background bed ----------
const Bed: React.FC<{ t: number }> = ({ t }) => (
  <>
    {SHOTS.filter((s) => t >= s.at - 0.02 && t < s.until).map((s) => {
      const tin = s.tin ?? "fade";
      const p = lin(t, s.at, s.at + (tin === "cut" ? 0.01 : tin === "whip" ? 0.32 : 0.45));
      const c = clip(s.k);
      let style: React.CSSProperties = { opacity: tin === "cut" || s.at === 0 ? 1 : eo(p) };
      if (tin === "zoom") style = { opacity: eo(p), transform: `scale(${1.25 - 0.25 * eo(p)})`, filter: `blur(${(1 - eo(p)) * 18}px)` };
      if (tin === "whip") style = { opacity: clamp(p * 3), transform: `translateX(${(1 - eo(p)) * 260}px)`, filter: `blur(${(1 - eo(p)) * 24}px)` };
      return (
        <div key={s.k + s.at} style={{ position: "absolute", inset: 0, ...style }}>
          <div style={{ position: "absolute", inset: 0, filter: s.filter }}>
            <Media clip={c} name={s.k} t0={s.at} len={s.until - s.at} w={W} h={H} focus={s.focus} pan={s.pan} zoom={s.zoom ?? 1.04} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="clean" />
          </div>
        </div>
      );
    })}
  </>
);
const FLASHES = SHOTS.filter((s) => s.tin === "flash").map((s) => s.at);
const Flash: React.FC<{ t: number }> = ({ t }) => {
  const f = FLASHES.find((a) => t > a - 0.25 && t < a + 0.6);
  if (f === undefined) return null;
  const o = t < f ? lin(t, f - 0.25, f) : 1 - lin(t, f, f + 0.6);
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 30%, rgba(255,226,170,.85), rgba(255,190,110,.25) 40%, transparent 70%)", opacity: o * 0.8, mixBlendMode: "screen" }} />;
};

// ---------- generic motion-graphics pieces ----------
const Svg: React.FC<{ children: React.ReactNode; o?: number }> = ({ children, o = 1 }) => (
  <svg viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: o, overflow: "visible" }}>
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16" /></filter>
    </defs>
    {children}
  </svg>
);

/** floating motes */
const Motes: React.FC<{ t: number; n: number; seed: number; color: string; x?: number; y?: number; w?: number; h?: number; size?: number; speed?: number; o?: number; dir?: [number, number] }> = ({ t, n, seed, color, x = 0, y = 0, w = W, h = H, size = 3, speed = 14, o = 1, dir = [0, -1] }) => {
  const r = rng(seed);
  const pts = Array.from({ length: n }, () => ({ x: r() * w, y: r() * h, s: 0.6 + r() * size, ph: r() * 6.28, v: 0.4 + r(), a: 0.35 + r() * 0.65 }));
  return (
    <Svg o={o}>
      {pts.map((p, i) => {
        const px = x + ((p.x + dir[0] * t * speed * p.v + Math.sin(t * 0.7 + p.ph) * 12) % w + w) % w;
        const py = y + ((p.y + dir[1] * t * speed * p.v + Math.cos(t * 0.5 + p.ph) * 8) % h + h) % h;
        return <circle key={i} cx={px} cy={py} r={p.s} fill={color} opacity={p.a * (0.6 + 0.4 * Math.sin(t * 2 + p.ph))} />;
      })}
    </Svg>
  );
};

/** a target ring that draws itself in and breathes */
const Ring: React.FC<{ t: number; at: number; until: number; x: number; y: number; r: number; color?: string }> = ({ t, at, until, x, y, r, color = TEAL }) => {
  const o = vis(t, at, until, 0.3, 0.3);
  if (o <= 0) return null;
  const p = eo(lin(t, at, at + 0.6));
  const rr = r * (0.6 + 0.4 * p) * (1 + 0.03 * Math.sin(t * 3));
  return (
    <Svg o={o}>
      <circle cx={x} cy={y} r={rr} fill="none" stroke={color} strokeWidth={3} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} filter="url(#glow)" transform={`rotate(-90 ${x} ${y})`} />
      <circle cx={x} cy={y} r={rr + 16} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="5 11" opacity={0.7 * p} transform={`rotate(${t * 30} ${x} ${y})`} />
      {[0, 90, 180, 270].map((a) => <line key={a} x1={x + (rr + 24) * Math.cos((a * Math.PI) / 180)} y1={y + (rr + 24) * Math.sin((a * Math.PI) / 180)} x2={x + (rr + 38) * Math.cos((a * Math.PI) / 180)} y2={y + (rr + 38) * Math.sin((a * Math.PI) / 180)} stroke={color} strokeWidth={2} opacity={p} />)}
    </Svg>
  );
};

/** a path that draws itself, optional pulses running along it */
type Pt = [number, number];
const bez = (P: Pt[], u: number): Pt => { // cubic bezier through 4 points
  const [a, b, c, d] = P; const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};
const Flow: React.FC<{ t: number; at: number; until: number; P: Pt[]; color?: string; width?: number; draw?: number; pulses?: number; speed?: number; dash?: boolean }> = ({ t, at, until, P, color = TEAL, width = 3, draw = 0.9, pulses = 3, speed = 0.45, dash }) => {
  const o = vis(t, at, until, 0.3, 0.4);
  if (o <= 0) return null;
  const p = eo(lin(t, at, at + draw));
  const d = `M${P[0][0]},${P[0][1]} C${P[1][0]},${P[1][1]} ${P[2][0]},${P[2][1]} ${P[3][0]},${P[3][1]}`;
  return (
    <Svg o={o}>
      <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={dash ? "0.012 0.018" : "1"} strokeDashoffset={dash ? -t * 0.05 : 1 - p} filter="url(#glow)" opacity={0.85} />
      {p > 0.98 && Array.from({ length: pulses }, (_, i) => {
        const u = ((t - at) * speed + i / pulses) % 1;
        const [x, y] = bez(P, u);
        return <circle key={i} cx={x} cy={y} r={width * 2.4} fill={color} filter="url(#glow)" opacity={Math.sin(u * Math.PI)} />;
      })}
    </Svg>
  );
};

/** procedural branching filaments (hyphae / roots) that grow over time */
type Seg = { a: Pt; c: Pt; b: Pt; d: number; w: number };
const makeTree = (seed: number, x: number, y: number, ang: number, len: number, depth: number, w: number, spread = 0.5): Seg[] => {
  const r = rng(seed); const out: Seg[] = [];
  const go = (x: number, y: number, ang: number, len: number, dep: number, w: number) => {
    if (dep > depth || len < 10) return;
    const bx = x + Math.cos(ang) * len, by = y + Math.sin(ang) * len;
    const cx = (x + bx) / 2 + (r() - 0.5) * len * 0.45, cy = (y + by) / 2 + (r() - 0.5) * len * 0.45;
    out.push({ a: [x, y], c: [cx, cy], b: [bx, by], d: dep, w });
    go(bx, by, ang + spread * (0.4 + r() * 0.8), len * (0.62 + r() * 0.2), dep + 1, w * 0.74);
    go(bx, by, ang - spread * (0.4 + r() * 0.8), len * (0.62 + r() * 0.2), dep + 1, w * 0.74);
    if (r() < 0.3) go(bx, by, ang + (r() - 0.5) * 0.3, len * 0.7, dep + 1, w * 0.7);
  };
  go(x, y, ang, len, 0, w);
  return out;
};
const TREES = new Map<string, Seg[]>();
const Grow: React.FC<{ t: number; at: number; until: number; id: string; seed: number; x: number; y: number; ang: number; len: number; depth?: number; w?: number; color?: string; rate?: number; spread?: number }> = ({ t, at, until, id, seed, x, y, ang, len, depth = 7, w = 5, color = GOLD2, rate = 3.2, spread }) => {
  const o = vis(t, at, until, 0.2, 0.5);
  if (o <= 0) return null;
  if (!TREES.has(id)) TREES.set(id, makeTree(seed, x, y, ang, len, depth, w, spread));
  const g = (t - at) * rate; // depth levels grown so far
  return (
    <Svg o={o}>
      <g filter="url(#glow)">
        {TREES.get(id)!.map((s, i) => {
          const p = clamp(g - s.d);
          if (p <= 0) return null;
          return <path key={i} d={`M${s.a[0]},${s.a[1]} Q${s.c[0]},${s.c[1]} ${s.b[0]},${s.b[1]}`} stroke={color} strokeWidth={s.w} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} opacity={0.9} />;
        })}
      </g>
    </Svg>
  );
};

// ---------- typography ----------
const shadow = "0 4px 30px rgba(0,0,0,.75), 0 1px 4px rgba(0,0,0,.6)";
const Word: React.FC<{ t: number; text: React.ReactNode; at: number; until: number; y: number; size?: number; color?: string; track?: number; font?: string; glow?: string; x?: number; align?: "center" | "left" | "right"; w?: number }> = ({ t, text, at, until, y, size = 110, color = "#fff", track = 8, font = DISP, glow = "rgba(95,230,214,.35)", x = 0, align = "center", w = W }) => {
  if (t < at - 0.05 || t > until + 0.05) return null;
  const p = eo(lin(t, at, at + 0.5));
  const out = lin(t, until - 0.3, until);
  return (
    <div style={{ position: "absolute", left: x, width: w, top: y, textAlign: align, fontFamily: font, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: track + (1 - p) * 14, color, textShadow: `${shadow}, 0 0 40px ${glow}`, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 26 - out * 12}px) scale(${1 + (t - at) * 0.008})`, filter: `blur(${(1 - p) * 10 + out * 6}px)` }}>
      {text}
    </div>
  );
};
const Label: React.FC<{ t: number; at: number; until: number; x: number; y: number; text: string; color?: string; size?: number; anchor?: "start" | "end" | "middle" }> = ({ t, at, until, x, y, text, color = "#fff", size = 40, anchor = "start" }) => {
  const o = vis(t, at, until, 0.3, 0.3);
  if (o <= 0) return null;
  const p = eo(lin(t, at, at + 0.45));
  const left = anchor === "start" ? x : anchor === "end" ? x - 900 : x - 450;
  return <div style={{ position: "absolute", left, width: 900, top: y - size * 0.6, textAlign: anchor === "start" ? "left" : anchor === "end" ? "right" : "center", fontFamily: BODY, fontWeight: 800, fontSize: size, letterSpacing: 5, color, textShadow: shadow, opacity: o, transform: `translateX(${(1 - p) * (anchor === "end" ? 30 : -30)}px)` }}>{text}</div>;
};

// ---------- logo watermark (channel rule: position changes between scenes) ----------
const WM_SPOTS: { at: number; x: number; y: number }[] = [
  { at: 0, x: W - 150, y: 40 },            // scene 1: top right
  { at: S(6) - 0.4, x: 40, y: 40 },          // scene 2: top left
  { at: S(13) - 0.1, x: W - 150, y: H - 150 }, // scene 3: bottom right
  { at: S(20) - 0.2, x: 40, y: H - 150 },      // scene 3b: bottom left
  { at: S(26), x: W - 150, y: 40 },          // scene 4: top right
  { at: S(31) - 0.2, x: 40, y: 40 },          // scene 4b: top left
  { at: S(34) - 0.2, x: W - 150, y: H - 150 }, // scene 5: bottom right
];
const WM_OFF = S(38) - 0.4; // end card carries the big logo
const Watermark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  let i = 0; for (let k = 0; k < WM_SPOTS.length; k++) if (t >= WM_SPOTS[k].at) i = k;
  const s = WM_SPOTS[i], next = WM_SPOTS[i + 1];
  const fin = i === 0 ? lin(t, 1.0, 1.6) : lin(t, s.at, s.at + 0.6);
  const fout = Math.max(next ? lin(t, next.at - 0.4, next.at) : 0, lin(t, WM_OFF, WM_OFF + 0.4));
  const o = Math.min(fin, 1 - fout);
  if (o <= 0) return null;
  return <Img src={staticFile("v19/art/logo.png")} style={{ position: "absolute", left: s.x, top: s.y, width: 110, height: 110, opacity: 0.9 * o, transform: `scale(${0.9 + 0.1 * eo(fin)})`, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.55))" }} />;
};

// ================= scene-specific motion graphics =================

// 1.1 footsteps: pulses ripple into the ground, then the ground splits along a glowing line
const Steps: React.FC<{ t: number }> = ({ t }) => {
  if (t > T_DIVE + 0.7) return null;
  const hits = [1.0, 2.2, 3.4].filter((h) => h < T_DIVE);
  const crack = eo(lin(t, T_DIVE - 0.6, T_DIVE + 0.1));
  return (
    <Svg>
      {hits.map((h) => {
        const p = lin(t, h, h + 1.6);
        if (p <= 0 || p >= 1) return null;
        return [0, 0.18, 0.36].map((d) => { const q = clamp(p - d); return q > 0 ? <ellipse key={h + d} cx={900} cy={880} rx={80 + q * 900} ry={12 + q * 130} fill="none" stroke={TEAL} strokeWidth={3 * (1 - q)} opacity={(1 - q) * 0.9} filter="url(#glow)" /> : null; });
      })}
      {crack > 0 && <path d="M-20,930 L420,915 L610,960 L800,925 L960,970 L1130,920 L1320,965 L1560,925 L1940,945" stroke={TEAL2} strokeWidth={4 + crack * 6} fill="none" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - crack} filter="url(#glow)" />}
    </Svg>
  );
};
// 1.2 dive: soil layers rush past the camera
const Dive: React.FC<{ t: number }> = ({ t }) => {
  const p = lin(t, T_DIVE, T_DIVE + 1.1);
  if (p <= 0 || p >= 1) return null;
  const r = rng(11);
  const layers = ["#3b2a1a", "#2a1d12", "#4a3726", "#1d140c"];
  return (
    <AbsoluteFill>
      {layers.map((c, i) => {
        const q = clamp(p * 1.6 - i * 0.18);
        const y = H * (1 - q * 2.2);
        return <div key={i} style={{ position: "absolute", left: -100, width: W + 200, top: y, height: H * 0.9, background: `radial-gradient(ellipse at 50% 0%, ${c}, #0b0805 80%)`, opacity: q > 0 && q < 1 ? 1 : 0, borderTop: `3px solid rgba(95,230,214,${0.5 * (1 - q)})` }} />;
      })}
      <Svg>
        {Array.from({ length: 160 }, (_, i) => { const x = r() * W, y0 = r() * H, s = 2 + r() * 8; const y = ((y0 - p * 2600 * (0.5 + r())) % H + H) % H; return <ellipse key={i} cx={x} cy={y} rx={s} ry={s * (2 + p * 6)} fill={r() < 0.2 ? TEAL : "#8a6a48"} opacity={0.7} />; })}
      </Svg>
      <AbsoluteFill style={{ background: "#000", opacity: Math.sin(p * Math.PI) * 0.35 }} />
    </AbsoluteFill>
  );
};
// 1.3 MILLIONS: rings lock onto organisms
const Millions: React.FC<{ t: number }> = ({ t }) => {
  const a = S(2), m = Wd(2, "millions"), b = Wd(2, "mysterious");
  if (t < a || t > b + 0.4) return null;
  return (
    <>
      <Motes t={t} n={90} seed={3} color={TEAL2} size={2.6} speed={10} o={vis(t, a, b + 0.3)} />
      <Ring t={t} at={m - 0.5} until={b + 0.2} x={700} y={560} r={90} />
      <Ring t={t} at={m - 0.2} until={b + 0.2} x={1260} y={520} r={70} />
      <Ring t={t} at={m + 0.1} until={b + 0.2} x={520} y={330} r={55} color={GOLD} />
      <Ring t={t} at={m + 0.35} until={b + 0.2} x={1500} y={300} r={50} />
      <Word t={t} text="MILLIONS" at={m} until={b + 0.15} y={770} size={150} track={22} />
    </>
  );
};
// 1.4 networks: light races along the roots
const RootPulse: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(2, "mysterious"), b = Wd(2, "incredible") + 0.2;
  return (
    <>
      <Flow t={t} at={a} until={b} P={[[960, 560], [860, 700], [520, 780], [-20, 870]]} pulses={3} speed={0.8} />
      <Flow t={t} at={a + 0.1} until={b} P={[[960, 560], [1080, 700], [1400, 760], [1940, 840]]} pulses={3} speed={0.8} />
      <Flow t={t} at={a + 0.2} until={b} P={[[960, 600], [930, 760], [900, 900], [860, 1100]]} pulses={2} speed={0.8} />
      <Word t={t} text="NETWORKS" at={a + 0.2} until={b} y={130} size={90} track={20} />
    </>
  );
};
// 1.5 + 4.5 the web of life on a04 (healthy / breaking)
const WEB_NODES: Pt[] = [[340, 230], [1100, 470], [1560, 560], [640, 840], [1810, 900], [210, 640]];
const WEB_EDGES: [number, number][] = [[0, 1], [1, 2], [1, 3], [0, 3], [2, 4], [3, 5], [0, 5]];
const Web: React.FC<{ t: number; at: number; until: number; broken?: boolean }> = ({ t, at, until, broken }) => {
  const o = vis(t, at, until, 0.4, 0.4);
  if (o <= 0) return null;
  const z = 1 + (broken ? 0.05 : 0.12) * lin(t, at, until); // follow the bed zoom roughly
  const P = (p: Pt): Pt => [W / 2 + (p[0] - W / 2) * z, H / 2 + (p[1] - H / 2) * z];
  return (
    <Svg o={o}>
      {WEB_EDGES.map(([i, j], k) => {
        const a = P(WEB_NODES[i]), b = P(WEB_NODES[j]);
        const p = eo(lin(t, at + k * 0.25, at + k * 0.25 + 0.7));
        const snap = broken ? lin(t, at + 0.8 + k * 0.55, at + 1.1 + k * 0.55) : 0;
        const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2 - 60;
        return (
          <g key={k} opacity={broken ? 0.75 * (1 - snap * 0.8) : 0.9}>
            <path d={`M${a[0]},${a[1]} Q${mx},${my} ${b[0]},${b[1]}`} stroke={broken ? "#8fb5b0" : TEAL} strokeWidth={broken ? 2 : 3} fill="none" pathLength={1} strokeDasharray={snap > 0 ? `${0.45 - snap * 0.25} ${0.1 + snap * 0.5}` : "1"} strokeDashoffset={broken ? 0 : 1 - p} filter="url(#glow)" />
            {!broken && p > 0.95 && (() => { const u = ((t - at) * 0.5 + k * 0.3) % 1; const x = (1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * mx + u * u * b[0]; const y = (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * my + u * u * b[1]; return <circle cx={x} cy={y} r={7} fill={TEAL2} filter="url(#glow)" />; })()}
          </g>
        );
      })}
      {WEB_NODES.map((n, i) => {
        const p = P(n); const fade = broken ? 1 - lin(t, at + 0.6 + i * 0.6, at + 1.2 + i * 0.6) * 0.85 : eo(lin(t, at + i * 0.2, at + i * 0.2 + 0.5));
        return <g key={i} opacity={fade}><circle cx={p[0]} cy={p[1]} r={10} fill={broken ? "#9aa" : i === 2 ? GOLD : TEAL} filter="url(#glow)" /><circle cx={p[0]} cy={p[1]} r={34 + 4 * Math.sin(t * 3 + i)} fill="none" stroke={broken ? "#9aa" : TEAL} strokeWidth={2} opacity={0.7} /></g>;
      })}
    </Svg>
  );
};
// 1.6 split screen: busy surface above, glowing life below
const Split: React.FC<{ t: number }> = ({ t }) => {
  const a = S(3) - 0.2, b = E(3) + 0.35;
  const o = vis(t, a, b, 0.4, 0.4);
  if (o <= 0) return null;
  const p = eo(lin(t, a, a + 0.8));
  const lineY = H / 2;
  return (
    <AbsoluteFill style={{ opacity: o, background: "#000" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: lineY, overflow: "hidden", filter: `saturate(${1 - 0.7 * lin(t, a, b)})` }}>
        <div style={{ position: "absolute", left: 0, top: -H / 4 }}><Media clip={clip("f16")} name="f16" t0={a} len={b - a} w={W} h={H} focus={[0.5, 0.6]} push={0.06} /></div>
      </div>
      <div style={{ position: "absolute", left: 0, top: lineY, width: W, height: H - lineY, overflow: "hidden", transform: `translateY(${(1 - p) * 200}px)` }}>
        <div style={{ position: "absolute", left: 0, top: -H / 4 }}><Media clip={clip("a01")} name="a01" t0={a} len={b - a} w={W} h={H} focus={[0.5, 0.5]} zoom={1.1} push={0.08} /></div>
      </div>
      <Svg><line x1={0} y1={lineY} x2={W * p} y2={lineY} stroke={TEAL} strokeWidth={4} filter="url(#glow)" /></Svg>
      <Motes t={t} n={60} seed={8} color={TEAL2} y={lineY} h={H - lineY} size={2.5} />
    </AbsoluteFill>
  );
};
// 1.7 title card
const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S(4), b = E(4) + 0.5;
  const o = vis(t, a - 0.2, b, 0.3, 0.4);
  if (o <= 0) return null;
  const wds = ["THE", "HIDDEN", "WORLD"], wds2 = ["BENEATH", "OUR", "FEET"];
  const ws = (k: string) => Wd(4, k);
  const sweep = lin(t, a + 0.3, b);
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,.55), rgba(0,0,0,.15) 60%, transparent)" }} />
      <div style={{ position: "absolute", left: 0, width: W, top: 330, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 28, letterSpacing: 12, color: TEAL, textShadow: shadow, opacity: eo(lin(t, a - 0.2, a + 0.4)) }}>ART OF AGRICULTURE PRESENTS</div>
      {[wds, wds2].map((row, ri) => (
        <div key={ri} style={{ position: "absolute", left: 0, width: W, top: 400 + ri * 130, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 112, letterSpacing: 6, color: "#fff", textShadow: `${shadow}, 0 0 40px rgba(95,230,214,.35)` }}>
          {row.map((w, i) => { const p = eo(lin(t, ws(w.toLowerCase()) - 0.15, ws(w.toLowerCase()) + 0.3)); return <span key={w} style={{ display: "inline-block", margin: "0 22px", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 8}px)` }}>{w}</span>; })}
        </div>
      ))}
      <AbsoluteFill style={{ background: `linear-gradient(100deg, transparent ${sweep * 140 - 30}%, rgba(255,240,200,.22) ${sweep * 140 - 15}%, transparent ${sweep * 140}%)`, mixBlendMode: "screen" }} />
      <Svg><line x1={960 - 300 * eo(lin(t, a + 0.6, a + 1.4))} y1={690} x2={960 + 300 * eo(lin(t, a + 0.6, a + 1.4))} y2={690} stroke={GOLD} strokeWidth={3} filter="url(#glow)" /></Svg>
    </AbsoluteFill>
  );
};
// 1.8 SOIL from particles, then crumbles
const SoilWord: React.FC<{ t: number }> = ({ t }) => {
  const a = S(5) - 0.4, s = Wd(5, "soil"), b = S(6) + 0.2;
  const o = vis(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const form = eo(lin(t, a, s + 0.2));
  const crumble = eio(lin(t, b - 1.0, b));
  const r = rng(21);
  return (
    <AbsoluteFill style={{ opacity: o, background: "radial-gradient(circle at 50% 50%, #2b1d12, #0a0806 72%)" }}>
      <Svg>
        {Array.from({ length: 700 }, (_, i) => { const x0 = r() * W, y0 = r() * H, s2 = 1 + r() * 3.5; r(); r(); const x = x0 + Math.sin(t + i) * 3; const y = y0 + Math.cos(t * 0.8 + i) * 3; return <circle key={i} cx={x} cy={y + crumble * (300 + r() * 600)} r={s2} fill={r() < 0.12 ? TEAL : "#7b5a3a"} opacity={0.45} />; })}
      </Svg>
      <div style={{ position: "absolute", left: 0, width: W, top: 360, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 270, letterSpacing: 40 + (1 - form) * 80, color: "#ecd6b4", textShadow: "0 0 50px rgba(242,184,75,.35), 0 6px 30px rgba(0,0,0,.8)", opacity: form * (1 - crumble), filter: `blur(${(1 - form) * 18 + crumble * 14}px)`, transform: `translateY(${crumble * 120}px)` }}>SOIL</div>
    </AbsoluteFill>
  );
};
// 2.1 the surface peels away
const Peel: React.FC<{ t: number }> = ({ t }) => {
  const a = S(6), b = E(6) + 0.3;
  if (t < a || t > b + 0.3) return null;
  const p = eo(lin(t, Wd(6, "surface") - 0.4, Wd(6, "surface") + 0.6));
  const y = 520 - p * 160;
  return (
    <>
      <Svg o={vis(t, a, b + 0.3)}>
        <path d={`M0,${y + 50} C400,${y - 20} 900,${y + 80} 1300,${y} S1800,${y + 30} 1920,${y - 10}`} stroke={TEAL} strokeWidth={4} fill="none" filter="url(#glow)" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - eo(lin(t, a + 0.3, a + 1.3))} />
        <rect x={0} y={y + 40} width={W} height={H} fill={TEAL} opacity={0.12 * p} />
      </Svg>
      <Motes t={t} n={80} seed={5} color={TEAL2} y={560} h={520} size={2.5} o={p} />
      <Word t={t} text="MORE THAN DIRT" at={Wd(6, "dirt") - 0.4} until={E(6) + 0.2} y={150} size={92} track={14} />
    </>
  );
};
// 2.2 soil composition ring
const Composition2: React.FC<{ t: number }> = ({ t }) => {
  const a = S(7), b = E(7) + 0.3;
  const o = vis(t, a, b, 0.4, 0.3);
  if (o <= 0) return null;
  const cx = 960, cy = 560, r = 270;
  const segs: [number, string, string, number][] = [
    [0.45, "#c9a47a", "MINERALS", Wd(7, "minerals")], [0.05, GOLD, "ORGANIC MATTER", Wd(7, "organic")], [0.25, BLUE, "WATER", Wd(7, "water")], [0.25, "#e6eef0", "AIR", Wd(7, "air")],
  ];
  let off = 0;
  const life = eo(lin(t, Wd(7, "living", 1) - 0.2, Wd(7, "living", 1) + 0.6));
  return (
    <Svg o={o}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={64} />
      {segs.map(([f, c, label, at], i) => {
        const p = eo(lin(t, at - 0.15, at + 0.5));
        const start = off; off += f;
        const mid = (start + f / 2) * 2 * Math.PI - Math.PI / 2;
        const lx = cx + Math.cos(mid) * (r + 110), ly = cy + Math.sin(mid) * (r + 85);
        const hl = i === segs.findIndex((s) => t >= s[3] - 0.15 && t < (segs[segs.indexOf(s) + 1]?.[3] ?? Wd(7, "living", 1)) - 0.15);
        return (
          <g key={label}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={hl ? 78 : 64} pathLength={1} strokeDasharray={`${Math.max(0, f * p - 0.006)} 1`} strokeDashoffset={-start} transform={`rotate(-90 ${cx} ${cy})`} filter={hl ? "url(#glow)" : undefined} />
            <text x={lx} y={ly + 14} fill="#fff" fontFamily={BODY} fontWeight={800} fontSize={40} letterSpacing={4} textAnchor={Math.cos(mid) > 0.15 ? "start" : Math.cos(mid) < -0.15 ? "end" : "middle"} opacity={p}>{label}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={r + 64 + 8 * Math.sin(t * 3)} fill="none" stroke={TEAL} strokeWidth={4} strokeDasharray="2 14" opacity={life} filter="url(#glow)" transform={`rotate(${t * 12} ${cx} ${cy})`} />
      <text x={cx} y={cy + 22} fill={TEAL} fontFamily={DISP} fontWeight={700} fontSize={66} textAnchor="middle" opacity={life} filter="url(#glow)">LIFE</text>
      {Array.from({ length: 24 }, (_, i) => { const an = (i / 24) * 6.283 + t * 0.4; const rr = r + 64 + 10 * Math.sin(t * 2 + i); return <circle key={i} cx={cx + Math.cos(an) * rr} cy={cy + Math.sin(an) * rr} r={4} fill={TEAL2} opacity={life} />; })}
    </Svg>
  );
};
// 2.3 leaf turns to nutrients
const Nutrients: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(8, "returning"), b = E(8) + 0.3, n = Wd(8, "nutrients");
  if (t < S(8) || t > b + 0.3) return null;
  const p = eo(lin(t, n - 0.3, n + 0.6));
  return (
    <>
      <Word t={t} text="BACTERIA" at={Wd(8, "bacteria") - 0.1} until={a + 0.2} y={820} size={96} track={18} />
      <Ring t={t} at={a + 0.3} until={b} x={820} y={420} r={110} />
      <Svg o={vis(t, n - 0.3, b)}>
        {(["N", "P", "K"] as const).map((k, i) => { const x = 1380 + i * 140, y = 300 + i * 110 + (1 - p) * -80 + Math.sin(t * 2 + i) * 8; return <g key={k} opacity={eo(lin(t, n - 0.2 + i * 0.15, n + 0.3 + i * 0.15))}><circle cx={x} cy={y - 22} r={54} fill="rgba(20,14,8,.55)" stroke={GOLD} strokeWidth={3} filter="url(#glow)" /><text x={x} y={y} fill={GOLD2} fontFamily={BODY} fontWeight={800} fontSize={62} textAnchor="middle">{k}</text></g>; })}
      </Svg>
      <Motes t={t} n={70} seed={13} color={GOLD} x={1200} y={200} w={600} h={700} size={3} dir={[0, 1]} speed={30} o={p} />
      <Word t={t} text="NUTRIENTS" at={n} until={b} y={880} size={84} track={16} color={GOLD2} glow="rgba(242,184,75,.4)" />
    </>
  );
};
// 2.4 fungal network grows
const Fungi: React.FC<{ t: number }> = ({ t }) => {
  const a = S(9), b = E(9) + 0.3;
  return (
    <>
      <Grow t={t} at={a + 0.3} until={b} id="f1" seed={4} x={-20} y={900} ang={-0.35} len={330} depth={7} w={6} />
      <Grow t={t} at={a + 0.8} until={b} id="f2" seed={9} x={1940} y={250} ang={3.0} len={300} depth={7} w={5} />
      <Grow t={t} at={a + 1.4} until={b} id="f3" seed={17} x={900} y={1100} ang={-1.6} len={260} depth={6} w={5} />
      <Word t={t} text="FUNGI" at={Wd(9, "fungi") - 0.1} until={Wd(9, "connecting")} y={130} size={110} track={30} color={GOLD2} glow="rgba(242,184,75,.4)" />
      <Word t={t} text="UNDERGROUND NETWORKS" at={Wd(9, "networks") - 0.2} until={b - 0.1} y={880} size={78} track={12} />
    </>
  );
};
// 2.5 earthworm engineers: tunnel cut-away inset
const Worm: React.FC<{ t: number }> = ({ t }) => {
  const a = S(10), tun = Wd(11, "tunnels"), b = E(11) + 0.3;
  const o = vis(t, tun - 0.3, b, 0.4, 0.4);
  const p = eo(lin(t, tun - 0.1, tun + 1.0));
  const r = rng(30);
  const flowT = lin(t, Wd(11, "air"), b);
  return (
    <>
      <Word t={t} text="EARTHWORMS" at={a} until={Wd(11, "engineers") - 0.1} y={820} size={100} track={18} />
      <Word t={t} text="NATURE'S ENGINEERS" at={Wd(11, "engineers") - 0.2} until={tun + 0.3} y={820} size={88} track={10} color={GOLD2} glow="rgba(242,184,75,.4)" />
      {o > 0 && (
        <div style={{ position: "absolute", left: 120, top: 120, width: 1680, height: 640, borderRadius: 20, overflow: "hidden", border: `3px solid ${TEAL}`, boxShadow: `0 0 40px rgba(95,230,214,.45), 0 20px 60px rgba(0,0,0,.6)`, opacity: o, transform: `scale(${0.92 + 0.08 * p})` }}>
          <svg viewBox="0 0 1680 640" style={{ width: "100%", height: "100%" }}>
            <defs><linearGradient id="sl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3420" /><stop offset=".5" stopColor="#36261a" /><stop offset="1" stopColor="#5a4632" /></linearGradient></defs>
            <rect width={1680} height={640} fill="url(#sl)" />
            {Array.from({ length: 420 }, (_, i) => <ellipse key={i} cx={r() * 1680} cy={r() * 640} rx={3 + r() * 9} ry={2 + r() * 7} fill={r() < 0.5 ? "#6e523a" : "#2a1c10"} opacity={0.8} />)}
            <path d="M-40,250 C280,170 460,420 760,370 S1260,170 1720,330" stroke="#120b06" strokeWidth={110} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />
            {flowT > 0 && Array.from({ length: 26 }, (_, i) => { const u = ((t - tun) * 0.18 + i / 26) % 1; const P: Pt[] = [[-40, 250], [280, 170], [460, 420], [760, 370]]; const P2: Pt[] = [[760, 370], [1060, 320], [1260, 170], [1720, 330]]; const [x, y] = u < 0.5 ? bez(P, u * 2) : bez(P2, (u - 0.5) * 2); const air = i % 2 === 0; return <circle key={i} cx={x} cy={y + (air ? -18 : 18)} r={air ? 9 : 8} fill={air ? "#ffffff" : BLUE} opacity={0.9 * clamp(flowT * 3)} filter="url(#glow)" />; })}
            <g stroke={TEAL} strokeWidth={3} opacity={p}><line x1={760} y1={300} x2={760} y2={440} /><line x1={735} y1={300} x2={785} y2={300} /><line x1={735} y1={440} x2={785} y2={440} /></g>
            <text x={40} y={600} fill="#fff" fontFamily={BODY} fontWeight={800} fontSize={40} letterSpacing={6} opacity={clamp(flowT * 3)}><tspan fill="#fff">AIR</tspan><tspan fill={TEAL}>  +  </tspan><tspan fill={BLUE}>WATER</tspan></text>
          </svg>
        </div>
      )}
    </>
  );
};
// 2.6 every organism: rings in turn, then a balanced circle
const Balance: React.FC<{ t: number }> = ({ t }) => {
  const a = S(12), b = S(13) + 0.3, bal = Wd(12, "balanced");
  const spots: [number, number, number][] = [[1500, 470, 80], [600, 830, 60], [340, 220, 70], [1740, 150, 45], [960, 600, 70]];
  const circ = eo(lin(t, bal - 0.3, bal + 0.8));
  return (
    <>
      {spots.map(([x, y, r], i) => <Ring key={i} t={t} at={a + 0.3 + i * 0.55} until={b} x={x} y={y} r={r} color={i === 4 ? GOLD : TEAL} />)}
      <Svg o={vis(t, bal - 0.3, b)}>
        <circle cx={960} cy={540} r={480} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="10 12" pathLength={1} filter="url(#glow)" transform={`rotate(${-90 + t * 6} 960 540)`} opacity={circ} />
      </Svg>
      <Word t={t} text="ALIVE AND BALANCED" at={Wd(12, "alive") - 0.2} until={b} y={890} size={76} track={14} color={GOLD2} glow="rgba(242,184,75,.4)" />
    </>
  );
};
// 3.1 halo around roots
const Halo: React.FC<{ t: number }> = ({ t }) => {
  const a = S(13), b = E(13) + 0.3;
  const o = vis(t, a + 1.0, b, 1.0, 0.4);
  if (o <= 0) return null;
  return (
    <>
      <Svg o={o * 0.6}><ellipse cx={960} cy={780} rx={620} ry={250} fill={TEAL} filter="url(#soft)" opacity={0.25} /></Svg>
      <Motes t={t} n={140} seed={41} color={TEAL2} x={360} y={560} w={1200} h={480} size={2.6} speed={8} o={o} />
      <Word t={t} text="ROOTS" at={Wd(13, "roots") - 0.1} until={b} y={140} x={160} w={800} align="left" size={84} track={16} color={GOLD2} glow="rgba(242,184,75,.4)" />
      <Word t={t} text="+ MICROBES" at={Wd(13, "microscopic") - 0.1} until={b} y={140} x={960} w={800} align="right" size={84} track={16} />
    </>
  );
};
// 3.2 signals between organisms
const Signals: React.FC<{ t: number }> = ({ t }) => {
  const a = S(14), b = E(15) + 0.3;
  return (
    <>
      <Flow t={t} at={a + 0.4} until={b} P={[[300, 640], [700, 300], [1100, 340], [1500, 520]]} dash color={TEAL} pulses={4} speed={0.5} />
      <Flow t={t} at={a + 0.9} until={b} P={[[420, 860], [900, 960], [1300, 820], [1650, 640]]} dash color={TEAL2} pulses={4} speed={0.45} />
      <Word t={t} text="NOT ALONE" at={Wd(14, "not") - 0.1} until={S(15)} y={460} size={130} track={20} />
      <Word t={t} text="COUNTLESS MICROORGANISMS" at={Wd(15, "countless") - 0.1} until={b} y={860} size={70} track={10} />
    </>
  );
};
// 3.3 MYCORRHIZAE
const Myco: React.FC<{ t: number }> = ({ t }) => {
  const m = Wd(16, "mycorrhizae"), b = E(16) + 0.4;
  const o = vis(t, m - 0.3, b, 0.3, 0.3);
  const join = eio(lin(t, m - 0.2, m + 0.7));
  return (
    <>
      <Word t={t} text="PARTNERSHIPS" at={Wd(16, "partnerships") - 0.2} until={m - 0.2} y={860} size={90} track={18} color={GOLD2} glow="rgba(242,184,75,.4)" />
      {o > 0 && (
        <AbsoluteFill style={{ opacity: o }}>
          <div style={{ position: "absolute", left: 0, width: W, top: 410, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 156, letterSpacing: 12, textShadow: shadow }}>
            <span style={{ display: "inline-block", color: GOLD2, transform: `translateX(${-(1 - join) * 260}px)`, textShadow: `${shadow}, 0 0 40px rgba(242,184,75,.45)` }}>MYCO</span>
            <span style={{ display: "inline-block", color: TEAL, transform: `translateX(${(1 - join) * 260}px)`, textShadow: `${shadow}, 0 0 40px rgba(95,230,214,.45)` }}>RRHIZAE</span>
          </div>
          <div style={{ position: "absolute", left: 0, width: W, top: 640, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 40, letterSpacing: 12, color: "#fff", opacity: eo(lin(t, m + 0.6, m + 1.2)), textShadow: shadow }}>
            <span style={{ color: GOLD2 }}>FUNGUS</span>  +  <span style={{ color: TEAL }}>ROOT</span>
          </div>
          <Svg><line x1={960 - 420 * join} y1={612} x2={960 + 420 * join} y2={612} stroke="#fff" strokeWidth={2} opacity={0.6} /></Svg>
        </AbsoluteFill>
      )}
    </>
  );
};
// 3.4 diagram: hyphae reach far beyond the root; water and phosphorus flow in
const Reach: React.FC<{ t: number }> = ({ t }) => {
  const a = S(17) - 0.2, b = E(17) + 0.3, ph = Wd(17, "phosphorus"), wa = Wd(17, "water");
  const o = vis(t, a, b, 0.4, 0.4);
  if (o <= 0) return null;
  const root = eo(lin(t, a, a + 0.8));
  const zone = eo(lin(t, a + 0.8, a + 1.5));
  const r = rng(51);
  const phP = eo(lin(t, ph - 0.2, ph + 0.5));
  return (
    <AbsoluteFill style={{ opacity: o, background: "radial-gradient(circle at 50% 40%, #2a1e14, #0c0907 80%)" }}>
      <Svg>
        {Array.from({ length: 420 }, (_, i) => <circle key={i} cx={r() * W} cy={r() * H} r={1 + r() * 4} fill="#5b4330" opacity={0.45} />)}
        <path d="M960,-20 C950,200 980,380 960,620 C955,700 965,760 960,830" stroke={ROOT} strokeWidth={36} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - root} />
        <ellipse cx={960} cy={420} rx={210} ry={440} fill="none" stroke="#fff" strokeWidth={2} strokeDasharray="8 10" opacity={0.5 * zone} />
        <text x={1190} y={110} fill="#fff" fontFamily={BODY} fontWeight={700} fontSize={26} letterSpacing={4} opacity={0.6 * zone}>ROOT ALONE</text>
      </Svg>
      <Grow t={t} at={a + 1.2} until={b + 1} id="r1" seed={61} x={975} y={360} ang={0.15} len={270} depth={7} w={4} />
      <Grow t={t} at={a + 1.4} until={b + 1} id="r2" seed={62} x={945} y={520} ang={3.0} len={270} depth={7} w={4} />
      <Grow t={t} at={a + 1.6} until={b + 1} id="r3" seed={63} x={965} y={700} ang={0.6} len={240} depth={6} w={3.5} />
      <Grow t={t} at={a + 1.8} until={b + 1} id="r4" seed={64} x={952} y={250} ang={2.6} len={230} depth={6} w={3.5} />
      <Flow t={t} at={wa} until={b} P={[[180, 640], [420, 560], [700, 580], [950, 520]]} color={BLUE} width={4} pulses={5} speed={0.6} />
      <Flow t={t} at={ph - 0.1} until={b} P={[[1740, 420], [1500, 380], [1200, 330], [975, 360]]} color={GOLD} width={4} pulses={5} speed={0.6} />
      <Label t={t} at={wa} until={b} x={150} y={700} text="WATER" color={BLUE} size={44} />
      {phP > 0 && (
        <div style={{ position: "absolute", left: 1560, top: 230, width: 150, height: 170, borderRadius: 14, border: `3px solid ${GOLD}`, background: "rgba(26,20,16,.85)", boxShadow: `0 0 ${30 + 20 * Math.sin(t * 4)}px rgba(242,184,75,.6)`, opacity: phP, transform: `scale(${0.6 + 0.4 * phP})` }}>
          <div style={{ position: "absolute", left: 14, top: 8, fontFamily: BODY, fontSize: 26, color: GOLD }}>15</div>
          <div style={{ position: "absolute", left: 0, width: 150, top: 32, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 96, color: GOLD2 }}>P</div>
        </div>
      )}
      <Label t={t} at={ph} until={b} x={1770} y={470} text="PHOSPHORUS" color={GOLD2} size={44} anchor="end" />
      <Word t={t} text="FAR BEYOND THE ROOTS" at={Wd(17, "far") - 0.1} until={wa} y={900} size={70} track={12} />
    </AbsoluteFill>
  );
};
// 3.5 sugars from photosynthesis flow down
const Sugars: React.FC<{ t: number }> = ({ t }) => {
  const b = E(18) + 0.3, s = Wd(18, "sugars");
  const o = vis(t, s - 0.3, b, 0.3, 0.3);
  if (o <= 0) return null;
  const hex = (x: number, y: number, r: number) => Array.from({ length: 6 }, (_, k) => `${x + r * Math.cos((k * Math.PI) / 3)},${y + r * Math.sin((k * Math.PI) / 3)}`).join(" ");
  const onA02 = t >= Wd(18, "photosynthesis");
  return (
    <>
      <Svg o={o}>
        {Array.from({ length: 7 }, (_, i) => {
          const u = ((t - s) * 0.35 + i / 7) % 1;
          const x = onA02 ? 700 + Math.sin(u * 6 + i) * 20 : 900 + u * 260;
          const y = onA02 ? 120 + u * 700 : 120 + u * 900;
          return <polygon key={i} points={hex(x, y, 34)} fill="rgba(242,184,75,.15)" stroke={GOLD} strokeWidth={6} filter="url(#glow)" opacity={Math.sin(u * Math.PI)} transform={`rotate(${t * 40 + i * 20} ${x} ${y})`} />;
        })}
      </Svg>
      <Word t={t} text="SUGARS" at={s - 0.1} until={Wd(18, "photosynthesis")} y={110} size={100} track={18} color={GOLD2} glow="rgba(242,184,75,.45)" />
      <Word t={t} text="PHOTOSYNTHESIS" at={Wd(18, "photosynthesis") - 0.1} until={b} y={110} size={84} track={12} color={GOLD2} glow="rgba(242,184,75,.45)" />
    </>
  );
};
// 3.6 exchange loop
const Exchange: React.FC<{ t: number }> = ({ t }) => {
  const a = S(19), b = E(19) + 0.3, en = Wd(19, "energy"), re = Wd(19, "resources");
  return (
    <>
      <Flow t={t} at={en - 0.3} until={b} P={[[820, 170], [690, 400], [690, 650], [820, 900]]} color={GOLD} width={10} pulses={4} speed={0.5} />
      <Flow t={t} at={Wd(19, "fungi") - 0.2} until={b} P={[[1100, 900], [1230, 650], [1230, 400], [1100, 170]]} color={BLUE} width={10} pulses={4} speed={0.5} />
      <Label t={t} at={en - 0.2} until={b} x={640} y={520} text="ENERGY" color={GOLD2} size={56} anchor="end" />
      <Label t={t} at={re - 0.4} until={b} x={1290} y={500} text="WATER + NUTRIENTS" color={BLUE} size={46} />
      <Word t={t} text="A REMARKABLE PARTNERSHIP" at={a} until={en - 0.3} y={880} size={72} track={10} />
    </>
  );
};
// 3.7 water through pores (also reused, reversed, as compaction in 4.4)
const PORE = (() => { const r = rng(71); return Array.from({ length: 52 }, () => ({ x: r() * 760, y: r() * 760, rx: 42 + r() * 46, rot: r() * 180 })); })();
const Pores: React.FC<{ t: number; at: number; until: number; compact?: number; x?: number; y?: number; size?: number; label?: string }> = ({ t, at, until, compact = 0, x = 1080, y = 120, size = 760, label }) => {
  const o = vis(t, at, until, 0.4, 0.4);
  if (o <= 0) return null;
  const fill = eo(lin(t, at + 0.4, at + 4));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", overflow: "hidden", border: `4px solid ${compact > 0 ? "#c98a6a" : TEAL}`, boxShadow: `0 0 40px ${compact > 0 ? "rgba(201,138,106,.5)" : "rgba(95,230,214,.5)"}, 0 20px 60px rgba(0,0,0,.6)`, opacity: o, transform: `scale(${0.85 + 0.15 * eo(lin(t, at, at + 0.6))})`, background: "#2a1d12" }}>
      <svg viewBox="0 0 760 760" style={{ width: "100%", height: "100%" }}>
        <defs><clipPath id={`wc${at}`}><rect x={0} y={760 - fill * 900 + 140} width={760} height={900} /></clipPath></defs>
        <g clipPath={compact > 0 ? undefined : `url(#wc${at})`}><rect width={760} height={760} fill={BLUE} opacity={compact > 0 ? 0.15 : 0.55} /></g>
        {PORE.map((p, i) => { const cx = 380 + (p.x - 380) * (1 - compact * 0.28), cy = 380 + (p.y - 380) * (1 - compact * 0.28); const rr = p.rx * (1 + compact * 0.18); return <ellipse key={i} cx={cx} cy={cy} rx={rr} ry={rr * 0.78} transform={`rotate(${p.rot} ${cx} ${cy})`} fill="#8b6a48" stroke="#5a4330" strokeWidth={3} />; })}
        {compact === 0 && Array.from({ length: 30 }, (_, i) => { const u = ((t - at) * 0.12 + i / 30) % 1; const px = 80 + ((i * 97) % 600) + Math.sin(u * 12 + i) * 30; const py = u * 760; return <circle key={i} cx={px} cy={py} r={6} fill="#dff3ff" opacity={0.8} />; })}
        {compact > 0 && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={120 + ((i * 131) % 520)} cy={160 + ((i * 89) % 440)} r={7} fill="#8899a0" opacity={0.85} />)}
      </svg>
      {label && <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 38, letterSpacing: 6, color: "#fff", textShadow: shadow }}>{label}</div>}
    </div>
  );
};
const WaterMoves: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Pores t={t} at={S(21) - 0.3} until={E(21) + 0.4} />
    <Word t={t} text="BENEATH THE SURFACE" at={Wd(20, "beneath") - 0.2} until={S(21)} y={860} size={76} track={14} />
    <Word t={t} text="TINY SPACES" at={Wd(21, "tiny") - 0.1} until={E(21) + 0.3} y={860} x={60} w={900} align="left" size={80} track={12} />
  </>
);
// 3.8 stored vs travels
const Stored: React.FC<{ t: number }> = ({ t }) => {
  const b = E(22) + 0.3;
  const o = vis(t, Wd(22, "stored") - 0.3, b);
  return (
    <>
      <Svg o={o}>
        <ellipse cx={1580} cy={950} rx={200} ry={50} fill={BLUE} opacity={0.5 + 0.15 * Math.sin(t * 3)} filter="url(#soft)" />
      </Svg>
      <Flow t={t} at={Wd(22, "travels") - 0.3} until={b} P={[[1500, 940], [1300, 860], [1150, 760], [980, 700]]} color={BLUE} width={7} pulses={4} speed={0.6} />
      <Label t={t} at={Wd(22, "stored") - 0.2} until={b} x={1580} y={880} text="STORED" anchor="middle" size={44} color="#fff" />
      <Label t={t} at={Wd(22, "travels") - 0.1} until={b} x={720} y={640} text="TO THE ROOTS" anchor="end" size={44} color={BLUE} />
    </>
  );
};
// 3.9 root hairs: magnifier + smooth vs hairy comparison
const Hairs: React.FC<{ t: number }> = ({ t }) => {
  const a = S(23), g = Wd(23, "greatly"), b = E(23) + 0.3;
  const o = vis(t, g - 0.2, b, 0.4, 0.4);
  const grow = eo(lin(t, Wd(23, "surface") - 0.2, Wd(23, "surface") + 0.8));
  return (
    <>
      <Ring t={t} at={a + 0.4} until={g + 0.1} x={760} y={480} r={170} />
      <Word t={t} text="ROOT HAIRS" at={Wd(23, "root") - 0.1} until={g} y={860} size={100} track={18} />
      {o > 0 && (
        <div style={{ position: "absolute", left: 1180, top: 0, width: 740, height: H, background: "linear-gradient(90deg, rgba(8,18,17,.0), rgba(8,18,17,.88) 18%)", opacity: o }}>
          <svg viewBox="0 0 740 1080" style={{ width: "100%", height: "100%" }}>
            <g transform="translate(200,220)">
              <rect x={0} y={0} width={44} height={460} rx={22} fill={ROOT} />
              <text x={22} y={540} fill="#fff" fontFamily={BODY} fontWeight={700} fontSize={28} textAnchor="middle" letterSpacing={3}>SMOOTH</text>
              <rect x={300} y={0} width={44} height={460} rx={22} fill={ROOT} />
              {Array.from({ length: 44 }, (_, i) => { const yy = 8 + i * 10.3; const l = 60 * grow; return <line key={i} x1={i % 2 ? 344 : 300} y1={yy} x2={i % 2 ? 344 + l : 300 - l} y2={yy - 6 * grow} stroke={ROOT} strokeWidth={2} />; })}
              <text x={322} y={540} fill={TEAL} fontFamily={BODY} fontWeight={700} fontSize={28} textAnchor="middle" letterSpacing={3}>ROOT HAIRS</text>
              <rect x={-8} y={780 - 40} width={60} height={40} fill="#7a6a58" />
              <rect x={262} y={780 - 40 - 150 * grow} width={120} height={40 + 150 * grow} fill={TEAL} filter="url(#glow)" />
              <text x={170} y={830} fill="#fff" fontFamily={BODY} fontWeight={700} fontSize={26} textAnchor="middle" letterSpacing={3} opacity={0.8}>ABSORBING SURFACE</text>
            </g>
          </svg>
        </div>
      )}
      <Word t={t} text="MORE SURFACE" at={Wd(23, "surface") - 0.1} until={b} y={880} x={0} w={1180} size={84} track={12} color={TEAL2} />
    </>
  );
};
// 3.10 water climbs the plant
const Climb: React.FC<{ t: number }> = ({ t }) => {
  const b = E(24) + 0.3, up = Wd(24, "upward");
  return (
    <>
      <Flow t={t} at={Wd(24, "roots") - 0.3} until={b} P={[[690, 1080], [700, 900], [690, 760], [695, 560]]} color={BLUE} width={12} pulses={4} speed={0.7} />
      <Flow t={t} at={up - 0.3} until={b} P={[[695, 560], [700, 420], [690, 300], [700, 120]]} color={BLUE} width={12} pulses={4} speed={0.7} />
      <Svg o={vis(t, up + 0.3, b)}><ellipse cx={720} cy={140} rx={420} ry={150} fill={TEAL} opacity={0.18 + 0.1 * Math.sin(t * 4)} filter="url(#soft)" /></Svg>
      <Word t={t} text="UPWARD" at={up - 0.1} until={b} y={460} x={900} w={900} align="left" size={110} track={20} color={BLUE} glow="rgba(124,200,255,.5)" />
    </>
  );
};
// 3.11 the network glows under the forest
const UnderForest: React.FC<{ t: number }> = ({ t }) => {
  const a = S(25), b = S(26) + 0.3;
  return (
    <>
      <Grow t={t} at={a + 0.6} until={b} id="u1" seed={81} x={960} y={1100} ang={-1.57} len={170} depth={7} w={4} color={TEAL} spread={0.7} />
      <Grow t={t} at={a + 1.0} until={b} id="u2" seed={82} x={400} y={1100} ang={-1.3} len={150} depth={6} w={3} color={TEAL} spread={0.7} />
      <Grow t={t} at={a + 1.2} until={b} id="u3" seed={83} x={1520} y={1100} ang={-1.8} len={150} depth={6} w={3} color={TEAL} spread={0.7} />
      <Word t={t} text="INVISIBLE" at={Wd(25, "invisible") - 0.1} until={Wd(25, "essential")} y={150} size={110} track={24} />
      <Word t={t} text="ESSENTIAL" at={Wd(25, "essential") - 0.1} until={b - 0.2} y={150} size={110} track={24} color={GOLD2} glow="rgba(242,184,75,.45)" />
    </>
  );
};
// 4.1 cracks + FRAGILE
const Fragile: React.FC<{ t: number }> = ({ t }) => {
  const a = S(26), b = E(26) + 0.3, f = Wd(26, "fragile");
  const p = eo(lin(t, f - 0.4, f + 0.5));
  const o = vis(t, a, b);
  if (o <= 0) return null;
  return (
    <>
      <Svg o={o}>
        <g stroke="#eef3f3" strokeWidth={2.2} fill="none" opacity={0.8} filter="url(#glow)">
          {["M960,540 L700,300 L620,120 L560,-10", "M700,300 L420,260 L160,300", "M960,540 L1280,330 L1400,80", "M1280,330 L1600,360 L1940,330", "M960,540 L1100,860 L1050,1090", "M960,540 L640,760 L300,900 L-10,940"].map((d, i) => <path key={i} d={d} pathLength={1} strokeDasharray="1" strokeDashoffset={1 - p} />)}
        </g>
      </Svg>
      <Word t={t} text="FRAGILE" at={f - 0.15} until={b} y={460} size={140} track={30} glow="rgba(255,255,255,.2)" />
    </>
  );
};
// 4.2 threats: one word per cut, then a 2x2 grid on "balance"
const Threats: React.FC<{ t: number }> = ({ t }) => {
  const words: [string, number, number][] = [["DEFORESTATION", Wd(27, "deforestation"), Wd(27, "soil")], ["EROSION", Wd(27, "soil"), Wd(27, "excessive")], ["CHEMICALS", Wd(27, "excessive"), Wd(27, "unsustainable")], ["OVER-FARMING", Wd(27, "unsustainable"), Wd(27, "can")]];
  const g = Wd(27, "delicate") - 0.2, b = E(27) + 0.4;
  const gp = eio(lin(t, g, g + 0.7));
  const keys = ["f42a", "a10", "f42c", "f42d"];
  return (
    <>
      {words.map(([w, a, e]) => <Word key={w} t={t} text={w} at={a} until={e} y={800} size={104} track={14} glow="rgba(0,0,0,0)" />)}
      {gp > 0 && t < b && (
        <AbsoluteFill style={{ background: `rgba(6,5,4,${gp})` }}>
          {keys.map((k, i) => {
            const gx = (i % 2) * 960, gy = Math.floor(i / 2) * 540;
            const x = gx * gp + (i === 3 ? 0 : (1 - gp) * -2000), y = gy * gp;
            return (
              <div key={k} style={{ position: "absolute", left: (i === 3 ? 0 : x) + 6, top: (i === 3 ? 0 : y) + 6, width: i === 3 ? W - (W - 948) * gp : 948, height: i === 3 ? H - (H - 528) * gp : 528, transform: i === 3 ? `translate(${960 * gp}px, ${540 * gp}px)` : undefined, overflow: "hidden", borderRadius: 8 * gp, filter: "saturate(.55)" }}>
                <Media clip={clip(k)} name={k} t0={g - 3} len={6} w={i === 3 ? W : 948} h={i === 3 ? H : 528} zoom={1.05} push={0.05} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 44, letterSpacing: 8, color: "#fff", textShadow: shadow, opacity: gp }}>{words[i][0]}</div>
              </div>
            );
          })}
          <Svg o={gp}><line x1={760} y1={540 + 30 * Math.sin(lin(t, g + 0.6, b) * 2)} x2={1160} y2={540 - 30 * Math.sin(lin(t, g + 0.6, b) * 2)} stroke={GOLD} strokeWidth={5} filter="url(#glow)" /><circle cx={960} cy={540} r={14} fill={GOLD} filter="url(#glow)" /></Svg>
        </AbsoluteFill>
      )}
    </>
  );
};
// 4.3 erosion: rain streaks, runoff inset, wind dust, topsoil panel
const Rain: React.FC<{ t: number; at: number; until: number; n?: number }> = ({ t, at, until, n = 420 }) => {
  const o = vis(t, at, until, 0.3, 0.3);
  if (o <= 0) return null;
  const r = rng(91);
  return (
    <Svg o={o}>
      {Array.from({ length: n }, (_, i) => { const x0 = r() * 2300 - 200, y0 = r() * H, l = 30 + r() * 60, sp = 1400 + r() * 900; const y = ((y0 + t * sp) % (H + 200)) - 100; const x = x0 - (y / H) * 260; return <line key={i} x1={x} y1={y} x2={x - l * 0.25} y2={y + l} stroke="#e4edf2" strokeWidth={1 + r() * 1.6} opacity={0.18 + r() * 0.3} />; })}
    </Svg>
  );
};
const Dust: React.FC<{ t: number; at: number; until: number }> = ({ t, at, until }) => {
  const o = vis(t, at, until, 0.4, 0.4);
  if (o <= 0) return null;
  const r = rng(93);
  return (
    <Svg o={o}>
      <g filter="url(#soft)" opacity={0.35}>{Array.from({ length: 10 }, (_, i) => { const x = ((r() * 2600 + t * (180 + r() * 120)) % 2600) - 400; return <ellipse key={i} cx={x} cy={380 + r() * 420} rx={260 + r() * 260} ry={40 + r() * 50} fill="#dcc6a2" />; })}</g>
      {Array.from({ length: 260 }, (_, i) => { const x = ((r() * 2200 + t * (260 + r() * 300)) % 2200) - 140; const y = 360 + r() * 520 + Math.sin(t * 2 + i) * 14; return <circle key={i} cx={x} cy={y} r={1 + r() * 3.2} fill="#e0c9a6" opacity={0.25 + r() * 0.4} />; })}
    </Svg>
  );
};
const Erosion: React.FC<{ t: number }> = ({ t }) => {
  const a = S(28), c = Wd(28, "carry"), b = E(28) + 0.4;
  const inset = vis(t, Wd(28, "rain") - 0.3, c + 0.2, 0.4, 0.3);
  const panel = vis(t, Wd(28, "fertile") - 0.4, b, 0.4, 0.4);
  const peel = eo(lin(t, Wd(28, "fertile") - 0.2, b - 0.2));
  const r = rng(95);
  return (
    <>
      <Rain t={t} at={a - 0.1} until={c + 0.3} />
      <Dust t={t} at={c} until={b} />
      {inset > 0 && (
        <div style={{ position: "absolute", left: W - 640, top: 90, width: 560, height: 315, border: "3px solid #fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 12px 50px rgba(0,0,0,.7)", opacity: inset, transform: `translateY(${(1 - eo(lin(t, Wd(28, "rain") - 0.3, Wd(28, "rain") + 0.3))) * -40}px)` }}>
          <Media clip={clip("g16")} name="g16" t0={Wd(28, "rain") - 0.3} len={c - Wd(28, "rain") + 0.6} w={560} h={315} zoom={1.02} push={0.04} />
        </div>
      )}
      <Word t={t} text="WIND" at={Wd(28, "wind") - 0.1} until={c + 0.3} y={780} x={0} w={760} size={110} track={20} />
      <Word t={t} text="& RAIN" at={Wd(28, "rain") - 0.1} until={c + 0.3} y={780} x={700} w={760} align="left" size={110} track={20} />
      {panel > 0 && (
        <div style={{ position: "absolute", left: W - 700, top: H - 560, width: 620, height: 470, borderRadius: 14, overflow: "hidden", border: `3px solid ${GOLD}`, background: "#1b130c", opacity: panel, boxShadow: "0 12px 50px rgba(0,0,0,.7)" }}>
          <svg viewBox="0 0 620 470" style={{ width: "100%", height: "100%" }}>
            <rect y={240} width={620} height={230} fill="#a88a64" />
            {Array.from({ length: 180 }, (_, i) => <circle key={i} cx={r() * 620} cy={250 + r() * 210} r={2 + r() * 4} fill="#8b7050" />)}
            <rect x={620 * peel} y={110} width={620} height={130} fill="#3a2716" />
            {Array.from({ length: 140 }, (_, i) => { const sx = r() * 620, sy = 110 + r() * 130; const go = clamp(peel * 1.4 - sx / 620); return <circle key={i} cx={sx + go * (300 + r() * 400)} cy={sy - go * (60 + r() * 120)} r={2 + r() * 4} fill="#3a2716" opacity={sx > 620 * peel || go > 0 ? 1 - go * 0.6 : 0} />; })}
            <text x={24} y={185} fill={GOLD2} fontFamily={BODY} fontWeight={800} fontSize={40} letterSpacing={4} opacity={1 - peel * 0.6}>TOPSOIL</text>
            <text x={24} y={370} fill="#fff" fontFamily={BODY} fontWeight={800} fontSize={34} letterSpacing={4} opacity={0.85}>SUBSOIL</text>
          </svg>
        </div>
      )}
      <Word t={t} text="FERTILE LAYERS" at={Wd(28, "fertile") - 0.2} until={b} y={150} x={80} w={1000} align="left" size={78} track={10} color={GOLD2} glow="rgba(242,184,75,.4)" />
    </>
  );
};
// 4.4 compaction
const Compact: React.FC<{ t: number }> = ({ t }) => {
  const b = E(29) + 0.3, d = Wd(29, "damaged"), h = Wd(29, "harder");
  const c = eio(lin(t, d - 0.2, d + 1.5));
  return (
    <>
      <Pores t={t} at={d - 0.4} until={b} compact={Math.max(0.0001, c)} x={1100} y={130} size={720} label="COMPACTED" />
      <Word t={t} text="DAMAGED STRUCTURE" at={Wd(29, "structure") - 0.2} until={h} y={880} x={60} w={1000} align="left" size={66} track={8} />
      <Word t={t} text="HARDER FOR LIFE" at={h - 0.1} until={b} y={880} x={60} w={1000} align="left" size={66} track={8} color="#ffb4a0" glow="rgba(255,120,90,.3)" />
    </>
  );
};
// 4.7 why it matters: four tiles
const Matters: React.FC<{ t: number }> = ({ t }) => {
  const a = S(32) - 0.2, b = E(32) + 0.35;
  const o = vis(t, a, b, 0.4, 0.4);
  if (o <= 0) return null;
  const tiles: [string, string, number][] = [["f47a", "FOOD SECURITY", Wd(32, "food")], ["a04", "BIODIVERSITY", Wd(32, "biodiversity")], ["f47c", "CLEAN WATER", Wd(32, "clean")], ["f47d", "OUR PLANET", Wd(32, "planet") - 0.4]];
  const join = eo(lin(t, Wd(32, "planet") + 0.2, Wd(32, "planet") + 0.9));
  return (
    <AbsoluteFill style={{ opacity: o, background: "#0b0907" }}>
      {tiles.map(([k, label, at], i) => {
        const p = eo(lin(t, at - 0.3, at + 0.3));
        return (
          <div key={k} style={{ position: "absolute", left: 8 + i * 478, top: 8 + (1 - p) * 60, width: 470, height: 980, overflow: "hidden", borderRadius: 10, opacity: p, boxShadow: p > 0.9 && t < (tiles[i + 1]?.[2] ?? b) ? `0 0 0 3px ${GOLD}` : undefined }}>
            <Media clip={clip(k)} name={k} t0={a} len={b - a} w={470} h={980} zoom={1.05} push={0.06} focus={k === "a04" ? [0.4, 0.5] : [0.5, 0.5]} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 55%, rgba(0,0,0,.8))" }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 5, color: "#fff" }}>{label}</div>
          </div>
        );
      })}
      <Svg o={join}><line x1={240} y1={1040} x2={240 + 1440 * join} y2={1040} stroke={GOLD} strokeWidth={5} filter="url(#glow)" />{[0, 1, 2, 3].map((i) => <line key={i} x1={243 + i * 478} y1={990} x2={243 + i * 478} y2={1040} stroke={GOLD} strokeWidth={4} filter="url(#glow)" />)}</Svg>
    </AbsoluteFill>
  );
};
// 4.8 foundation of life
const Foundation: React.FC<{ t: number }> = ({ t }) => {
  const a = S(33), b = E(33) + 0.9, f = Wd(33, "foundation");
  return (
    <>
      <Svg o={vis(t, a, b)}><rect x={0} y={560} width={W} height={520} fill={GOLD} opacity={0.14 * eo(lin(t, f - 0.4, f + 0.6))} /></Svg>
      <Word t={t} text={<>THE FOUNDATION<br />OF LIFE</>} at={f - 0.2} until={b} y={640} size={100} track={8} color="#fff7e6" glow="rgba(242,184,75,.6)" />
      <Word t={t} text="PROTECT THE SOIL" at={Wd(33, "protecting") - 0.1} until={f - 0.2} y={720} size={88} track={14} />
    </>
  );
};
// 5.1 remember (ripple returns)
const Remember: React.FC<{ t: number }> = ({ t }) => {
  const a = S(34), b = E(34) + 0.3;
  if (t < a - 0.2 || t > b) return null;
  return (
    <>
      <Svg o={vis(t, a, b)}>{[0, 0.4, 0.8].map((d) => { const q = ((t - a + d) % 1.6) / 1.6; return <ellipse key={d} cx={900} cy={880} rx={80 + q * 900} ry={12 + q * 130} fill="none" stroke={TEAL} strokeWidth={3 * (1 - q)} opacity={1 - q} filter="url(#glow)" />; })}</Svg>
      <Word t={t} text="REMEMBER" at={Wd(34, "remember") - 0.1} until={b} y={160} size={110} track={30} />
    </>
  );
};
// 5.2 montage
const Montage: React.FC<{ t: number }> = ({ t }) => {
  const a = S(35) - 0.2, b = E(35) + 0.35;
  const o = vis(t, a, b, 0.3, 0.35);
  if (o <= 0) return null;
  const cuts: [string, string, number][] = [["g09", "TINY ORGANISMS", Wd(35, "tiny") - 0.25], ["g08", "DELICATE NETWORKS", Wd(35, "delicate") - 0.25], ["g07", "FLOWING WATER", Wd(35, "flowing") - 0.25], ["a04", "ENDLESS INTERACTIONS", Wd(35, "endless") - 0.25]];
  let i = 0; for (let k = 0; k < cuts.length; k++) if (t >= cuts[k][2]) i = k;
  const [k, label, at] = cuts[i];
  const p = eo(lin(t, at, at + 0.4));
  return (
    <AbsoluteFill style={{ opacity: o, background: "#000" }}>
      <div style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : 0.35 + 0.65 * p, transform: `scale(${1.08 - 0.08 * p})` }}>
        <Media clip={clip(k)} name={k} t0={at} len={3} w={W} h={H} zoom={1.05} push={0.08} />
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(100deg, transparent ${p * 160 - 40}%, rgba(255,220,160,.35) ${p * 160 - 20}%, transparent ${p * 160}%)`, mixBlendMode: "screen" }} />
      <Word t={t} text={label} at={at + 0.05} until={(cuts[i + 1]?.[2] ?? b) + 0.02} y={860} size={84} track={14} />
    </AbsoluteFill>
  );
};
// 5.3 where life begins
const Begins: React.FC<{ t: number }> = ({ t }) => {
  const g = Wd(37, "begins");
  return (
    <>
      <Word t={t} text="NOT SIMPLY WHERE LIFE GROWS" at={S(36)} until={S(37)} y={150} size={70} track={10} />
      <Word t={t} text="WHERE LIFE BEGINS" at={g - 0.35} until={E(37) + 0.6} y={140} size={108} track={12} color="#fff7e6" glow="rgba(242,184,75,.55)" />
      <Motes t={t} n={70} seed={101} color={GOLD2} y={300} h={780} size={2.8} speed={18} o={vis(t, g - 0.3, E(37) + 0.6)} />
    </>
  );
};
// 5.4 end card (clean last seconds for YouTube end-screen elements)
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S(38) - 0.4;
  if (t < a) return null;
  const p = eo(lin(t, a, a + 1.0));
  const sub = Wd(38, "subscribe"), sh = Wd(38, "share"), tag = S(39);
  const tap = (at: number) => { const q = lin(t, at, at + 0.5); return q > 0 && q < 1 ? 1 - 0.08 * Math.sin(q * Math.PI) : 1; };
  const subbed = t > sub + 0.35;
  const clean = lin(t, E(39) + 1.5, E(39) + 2.5); // free the lower area for end-screen elements
  return (
    <AbsoluteFill style={{ opacity: p }}>
      <AbsoluteFill style={{ filter: "blur(18px) brightness(.32)" }}><Media clip={clip("a03")} name="a03" t0={a} len={END - a} w={W} h={H} zoom={1.15} push={0.08} /></AbsoluteFill>
      <Motes t={t} n={90} seed={111} color={GOLD2} size={2.6} speed={10} o={0.7} />
      <div style={{ position: "absolute", left: 960 - 160, top: 120 - clean * 40, width: 320, height: 320, transform: `scale(${0.7 + 0.3 * eo(lin(t, a + 0.2, a + 1.2))})`, filter: "drop-shadow(0 10px 40px rgba(0,0,0,.6))" }}><Img src={staticFile("v19/art/logo.png")} style={{ width: 320, height: 320 }} /></div>
      <Grow t={t} at={a + 0.6} until={END + 1} id="e1" seed={121} x={900} y={430 - clean * 40} ang={2.0} len={90} depth={5} w={3} color={GOLD} spread={0.6} />
      <Grow t={t} at={a + 0.6} until={END + 1} id="e2" seed={122} x={1020} y={430 - clean * 40} ang={1.15} len={90} depth={5} w={3} color={GOLD} spread={0.6} />
      <div style={{ position: "absolute", left: 0, width: W, top: 470 - clean * 40, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 64, letterSpacing: 2, color: "#fff", textShadow: shadow, opacity: eo(lin(t, a + 0.5, a + 1.1)) }}>@ArtofAgriculture</div>
      <div style={{ position: "absolute", left: 0, width: W, top: 580 - clean * 40, display: "flex", justifyContent: "center", gap: 30, opacity: eo(lin(t, sub - 0.5, sub)) * (1 - clean) }}>
        <div style={{ background: subbed ? "#444" : "#e62117", color: "#fff", fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 3, padding: "18px 44px", borderRadius: 12, transform: `scale(${tap(sub + 0.1)})` }}>{subbed ? "SUBSCRIBED ✓" : "SUBSCRIBE"}</div>
        <div style={{ border: "3px solid #fff", color: "#fff", fontFamily: BODY, fontWeight: 800, fontSize: 40, letterSpacing: 3, padding: "15px 44px", borderRadius: 12, transform: `scale(${tap(sh + 0.1)})`, background: t > sh + 0.35 ? "rgba(255,255,255,.15)" : undefined }}>SHARE ↗</div>
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 740 - clean * 160, textAlign: "center", fontFamily: DISP, fontStyle: "italic", fontWeight: 700, fontSize: 60, color: GOLD2, textShadow: `${shadow}, 0 0 30px rgba(242,184,75,.35)`, opacity: eo(lin(t, tag + 0.6, tag + 1.4)) }}>Discover the science behind life.</div>
    </AbsoluteFill>
  );
};

// ---------- global look ----------
const Grade: React.FC<{ t: number }> = ({ t }) => {
  const dark = vis(t, S(26), S(31), 0.8, 0.8); // scene 4 cools down
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,.55) 100%)" }} />
      <AbsoluteFill style={{ background: "rgba(40,70,90,1)", mixBlendMode: "soft-light", opacity: 0.35 * dark }} />
    </>
  );
};
const FadeIO: React.FC<{ t: number }> = ({ t }) => <AbsoluteFill style={{ background: "#000", opacity: Math.max(1 - lin(t, 0, 0.35), lin(t, END - 0.8, END)) }} />;

// ---------- frame ----------
const Frame: React.FC<{ t: number; preview: boolean }> = ({ t, preview }) => (
  <FootageTime.Provider value={t}>
    <AbsoluteFill style={{ background: "#0b0907", overflow: "hidden" }}>
      <Bed t={t} />
      <Grade t={t} />
      <Steps t={t} />
      <Dive t={t} />
      <Motes t={t} n={60} seed={2} color={TEAL2} size={2.2} speed={8} o={vis(t, T_DIVE + 0.8, S(2) + 0.3)} />
      <Millions t={t} />
      <RootPulse t={t} />
      <Web t={t} at={Wd(2, "incredible")} until={S(3) + 0.3} />
      <Split t={t} />
      <TitleCard t={t} />
      <SoilWord t={t} />
      <Peel t={t} />
      <Composition2 t={t} />
      <Nutrients t={t} />
      <Fungi t={t} />
      <Worm t={t} />
      <Balance t={t} />
      <Halo t={t} />
      <Signals t={t} />
      <Myco t={t} />
      <Reach t={t} />
      <Sugars t={t} />
      <Exchange t={t} />
      <WaterMoves t={t} />
      <Stored t={t} />
      <Hairs t={t} />
      <Climb t={t} />
      <UnderForest t={t} />
      <Fragile t={t} />
      <Threats t={t} />
      <Erosion t={t} />
      <Compact t={t} />
      <Web t={t} at={S(30) - 0.1} until={E(30) + 0.3} broken />
      <Word t={t} text="BIODIVERSITY" at={Wd(30, "biodiversity") - 0.1} until={E(30) + 0.2} y={860} size={96} track={16} glow="rgba(255,255,255,.15)" />
      <Word t={t} text="NOT JUST AGRICULTURE" at={S(31) + 0.2} until={E(31) + 0.3} y={150} size={84} track={12} />
      <Matters t={t} />
      <Foundation t={t} />
      <Remember t={t} />
      <Montage t={t} />
      <Begins t={t} />
      <Flash t={t} />
      <EndCard t={t} />
      <Watermark t={t} />
      <FadeIO t={t} />
      {!preview && <Audio src={staticFile("v19/mix.wav")} />}
    </AbsoluteFill>
  </FootageTime.Provider>
);

const V19Video: React.FC<{ times?: number[]; silent?: boolean }> = ({ times, silent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times || !!silent} />;
};

const mid = (a: number, b: number) => +(((a + b) / 2).toFixed(2));
export const LOOK: number[] = [
  1.5, T_DIVE + 0.4, mid(T_DIVE, S(2)), Wd(2, "millions") + 0.6, Wd(2, "mysterious") + 0.7, Wd(2, "incredible") + 1.5, mid(S(3), E(3)), E(4) - 0.2, Wd(5, "soil") + 0.5,
  E(6) - 0.3, Wd(7, "living", 1) + 0.5, Wd(8, "bacteria") + 0.3, Wd(8, "nutrients") + 0.8, E(9) - 0.5, Wd(10, "earthworms"), Wd(11, "air") + 0.8, Wd(12, "balanced") + 0.5,
  E(13) - 0.6, E(15) - 0.5, Wd(16, "mycorrhizae") + 1.0, Wd(17, "phosphorus") + 0.6, Wd(18, "sugars") + 0.4, E(18) - 0.3, E(19) - 0.4, E(21) - 0.5, E(22) - 0.4, E(23) - 0.4, E(24) - 0.4, E(25) - 0.6,
  Wd(26, "fragile") + 0.5, Wd(27, "deforestation") + 0.3, Wd(27, "soil") + 0.3, Wd(27, "excessive") + 0.4, E(27) - 0.1, Wd(28, "rain") + 0.6, Wd(28, "fertile") + 0.8, Wd(29, "harder") + 0.3,
  E(30) - 0.6, E(31) - 0.4, Wd(32, "planet") + 0.8, E(33) - 0.2, E(34) - 0.5, Wd(35, "delicate") + 0.4, Wd(35, "endless") + 0.4, E(37) - 0.1, Wd(38, "share") + 0.6, E(39) + 1.0, END - 1.2,
].map((x) => +x.toFixed(2));
export const V19_FRAMES = Math.round(END * FPS);
export const V19: React.FC = () => (
  <>
    <Composition id="V19-HiddenWorld" component={V19Video} durationInFrames={V19_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="V19-HiddenWorld-Silent" component={V19Video} durationInFrames={V19_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ silent: true }} />
    <Composition id="V19-HiddenWorld-Look" component={V19Video} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
