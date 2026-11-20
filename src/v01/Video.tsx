// V01 · «هنر کشاورزی» — channel intro, 20 s vertical, custom Art Nouveau (Mucha) in React/SVG. Music-only.
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AM, useArtFonts } from "../styles/art-motion";

const FPS = 30, DUR = 20;
const C = {
  bg: "#F1E3C3", bg2: "#E4CFA0", paper: "#F8EFD8", sage: "#93AC7B", leaf: "#6E8B55", olive: "#46612F", deep: "#2E4524",
  gold: "#C4953A", goldL: "#E7C673", rose: "#C8695A", blush: "#E8AE98", ink: "#43301F", sky: "#CFE0CC", lav: "#A796C2",
};
const S = [0, 3.15, 7.85, 12.05, 16.15, DUR]; // scene cuts just before each narration line (src/v01/vo.json)

const k = (t: number, a: number, b: number, e: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = Easing.out(Easing.back(1.7));
const io = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- botanical parts ----------
const LEAF = "M0 0 C 26 -30, 84 -34, 120 0 C 84 26, 26 28, 0 0Z";
const Leaf: React.FC<{ x: number; y: number; r: number; s: number; fill?: string }> = ({ x, y, r, s, fill = C.leaf }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={LEAF} fill={fill} stroke={C.ink} strokeWidth={3.2} strokeLinejoin="round" />
      <path d="M6 0 C 40 -3, 80 -3, 112 0" fill="none" stroke={C.goldL} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );

const Flower: React.FC<{ x: number; y: number; s: number; open: number; col?: string; t: number }> = ({ x, y, s, open, col = C.rose, t }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${t * 6})`}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx={0} cy={-26 * (0.4 + 0.6 * open)} rx={15} ry={28 * (0.5 + 0.5 * open)} fill={i % 2 ? col : C.blush}
          stroke={C.ink} strokeWidth={2.6} transform={`rotate(${i * 45 + (1 - open) * 20})`} />
      ))}
      <circle r={15} fill={C.gold} stroke={C.ink} strokeWidth={2.6} />
      <circle r={6} fill={C.goldL} />
    </g>
  );

// a plant that grows with g (0 seed → 1 in flower); base at (0,0), height H
const Plant: React.FC<{ g: number; H: number; t: number; sway?: number; flower?: string }> = ({ g, H, t, sway = 1, flower }) => {
  const st = k(g, 0.05, 0.75, (x) => x);
  const lv = [0.16, 0.3, 0.44, 0.58, 0.72, 0.84];
  const pt = (f: number) => ({ x: Math.sin(f * 3.4) * H * 0.05, y: -H * f });
  const top = pt(Math.max(0.02, st));
  return (
    <g transform={`rotate(${Math.sin(t * 1.3) * 2.2 * sway})`}>
      {/* seed */}
      <ellipse cx={0} cy={-6} rx={16} ry={11} fill="#8A5A34" stroke={C.ink} strokeWidth={3} opacity={1 - k(g, 0.3, 0.5)} />
      <path d={`M0 0 C ${-H * 0.06} ${-H * 0.3}, ${H * 0.07} ${-H * 0.6}, 0 ${-H}`} fill="none" stroke={C.olive} strokeWidth={Math.max(6, H * 0.022)}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - st} />
      {lv.map((f, i) => {
        const p = pt(f * 0.98);
        const s = k(g, f * 0.75 + 0.06, f * 0.75 + 0.2, pop) * (H / 520) * (1.25 - f * 0.45);
        const side = i % 2 ? -1 : 1;
        return <Leaf key={i} x={p.x} y={p.y} r={side > 0 ? -28 + Math.sin(t * 1.7 + i) * 4 : 208 + Math.sin(t * 1.7 + i) * 4} s={s} fill={i % 3 === 1 ? C.sage : C.leaf} />;
      })}
      {g > 0.78 && <Flower x={top.x} y={top.y - 8} s={(H / 480) * k(g, 0.78, 0.95, pop) * 1.25} open={k(g, 0.85, 1)} t={t} col={flower} />}
      {g <= 0.78 && st > 0.2 && <ellipse cx={top.x} cy={top.y} rx={9} ry={14} fill={C.sage} stroke={C.ink} strokeWidth={2.5} />}
    </g>
  );
};

const Soil: React.FC<{ w: number }> = ({ w }) => (
  <g>
    <path d={`M${-w / 2} 0 Q 0 ${-w * 0.16}, ${w / 2} 0 Z`} fill="#9B6B43" stroke={C.ink} strokeWidth={3.5} />
    {Array.from({ length: 9 }, (_, i) => (
      <circle key={i} cx={-w / 2 + (w / 10) * (i + 1)} cy={-6 - Math.sin(((i + 1) / 10) * Math.PI) * w * 0.05} r={4} fill={C.goldL} opacity={0.8} />
    ))}
  </g>
);

// ---------- ornament ----------
const Halo: React.FC<{ t: number; cx: number; cy: number; r: number; o?: number }> = ({ t, cx, cy, r, o = 1 }) => (
  <g transform={`translate(${cx} ${cy})`} opacity={o}>
    <circle r={r} fill="url(#haloFill)" stroke={C.gold} strokeWidth={10} />
    <circle r={r - 22} fill="none" stroke={C.ink} strokeWidth={2.5} />
    <g transform={`rotate(${t * 4})`}>
      {Array.from({ length: 48 }, (_, i) => (
        <line key={i} x1={0} y1={-(r - 40)} x2={0} y2={-r * 0.42} stroke={C.goldL} strokeWidth={i % 2 ? 2 : 5} opacity={0.55} transform={`rotate(${i * 7.5})`} />
      ))}
    </g>
    <g transform={`rotate(${-t * 6})`}>
      {Array.from({ length: 36 }, (_, i) => (
        <circle key={i} cx={0} cy={-(r - 11)} r={5.5} fill={i % 3 === 0 ? C.rose : i % 3 === 1 ? C.sage : C.paper} stroke={C.ink} strokeWidth={1.5} transform={`rotate(${i * 10})`} />
      ))}
    </g>
  </g>
);

// whiplash vine along a side, flowers open over the film
const SideVine: React.FC<{ t: number; right?: boolean }> = ({ t, right }) => {
  const grow = k(t, 0.1, 2.2, io);
  const sw = Math.sin(t * 1.1 + (right ? 1 : 0)) * 6;
  const d = "M70 1640 C 30 1400, 120 1250, 60 1050 C 10 880, 110 700, 70 520 C 40 400, 95 300, 120 210";
  const leaves = [[60, 1460, -40], [92, 1300, 200], [55, 1120, -35], [80, 940, 210], [70, 780, -30], [78, 620, 205], [90, 400, -45]];
  const flowers: [number, number, number, string][] = [[118, 1240, 2.4, C.rose], [40, 860, 6.0, C.blush], [120, 560, 9.6, C.rose], [122, 210, 13.4, C.lav]];
  return (
    <g transform={right ? `translate(1080 0) scale(-1 1)` : undefined}>
      <g transform={`translate(${sw} 0)`}>
        <path d={d} fill="none" stroke={C.olive} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
        {leaves.map(([x, y, r], i) => (
          <Leaf key={i} x={x} y={y} r={r + Math.sin(t * 1.6 + i) * 5} s={0.62 * k(t, 0.3 + (1640 - y) / 1640 * 1.8, 0.7 + (1640 - y) / 1640 * 1.8, pop)} fill={i % 2 ? C.sage : C.leaf} />
        ))}
        {flowers.map(([x, y, at, col], i) => (
          <Flower key={i} x={x} y={y} s={0.85 * k(t, at, at + 0.7, pop)} open={k(t, at + 0.2, at + 1.2)} col={col} t={t + i} />
        ))}
      </g>
    </g>
  );
};

const Frame: React.FC<{ t: number }> = ({ t }) => {
  const d = k(t, 0, 1.3, io);
  const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - d } as const;
  return (
    <g fill="none">
      <rect x={24} y={24} width={1032} height={1872} rx={18} stroke={C.gold} strokeWidth={10} {...dash} />
      <rect x={44} y={44} width={992} height={1832} rx={10} stroke={C.ink} strokeWidth={2.5} {...dash} />
      {/* top arch ornament */}
      <path d="M150 140 C 300 40, 420 120, 540 70 C 660 120, 780 40, 930 140" stroke={C.gold} strokeWidth={6} {...dash} />
      <circle cx={540} cy={70} r={14 * k(t, 1, 1.4, pop)} fill={C.rose} stroke={C.ink} strokeWidth={2.5} />
    </g>
  );
};

const Mosaic: React.FC<{ y: number; t: number }> = ({ y, t }) => {
  const cols = [C.rose, C.paper, C.sage, C.gold, C.paper, C.lav, C.paper, C.leaf];
  const n = 30, w = 960 / n;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={60 + i * w + 2} y={y} width={w - 4} height={22} fill={cols[(i + Math.floor(t * 2)) % cols.length]} stroke={C.ink} strokeWidth={1.5}
          opacity={k(t, 0.4 + Math.abs(i - n / 2) * 0.04, 0.7 + Math.abs(i - n / 2) * 0.04)} />
      ))}
    </g>
  );
};

const Pollen: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 34 }, (_, i) => {
      const sp = 40 + rnd(i) * 70;
      const y = 1900 - ((t * sp + rnd(i + 9) * 1900) % 1900);
      const x = rnd(i + 3) * 1080 + Math.sin(t * 0.9 + i) * 30;
      return <circle key={i} cx={x} cy={y} r={2 + rnd(i + 5) * 4} fill={i % 3 ? C.goldL : C.paper} opacity={0.75} />;
    })}
  </g>
);

// ---------- icons for cartouches ----------
const Flask: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-28 -84 L-28 -34 L-74 52 Q-80 70 -62 70 L62 70 Q80 70 74 52 L28 -34 L28 -84 Z" fill={C.paper} stroke={C.ink} strokeWidth={4} />
    <path d="M-50 14 L50 14 L74 52 Q80 70 62 70 L-62 70 Q-80 70 -74 52 Z" fill={C.sage} stroke={C.ink} strokeWidth={3} />
    {[0, 1, 2].map((i) => { const p = (t * 0.7 + i / 3) % 1; return <circle key={i} cx={-20 + i * 20} cy={60 - p * 110} r={5 + i} fill="none" stroke={C.olive} strokeWidth={2.5} opacity={1 - p} />; })}
    <rect x={-36} y={-96} width={72} height={14} rx={4} fill={C.gold} stroke={C.ink} strokeWidth={3} />
    <g transform={`translate(0 30) scale(0.5)`}><Leaf x={-10} y={0} r={-35} s={0.7} /></g>
  </g>
);
const Palette: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-80 10 C -90 -60, 20 -90, 70 -40 C 100 -10, 60 10, 40 6 C 20 2, 10 30, 30 48 C 50 70, -60 80, -80 10 Z" fill={C.paper} stroke={C.ink} strokeWidth={4} />
    {[[-50, -30, C.rose], [-12, -52, C.gold], [30, -40, C.leaf], [-55, 22, C.lav]].map(([x, y, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={13 + Math.sin(t * 3 + i) * 1.5} fill={c as string} stroke={C.ink} strokeWidth={2.5} />
    ))}
    <g transform={`rotate(${-38 + Math.sin(t * 2.4) * 6} 0 0)`}>
      <rect x={-6} y={-20} width={12} height={110} rx={5} fill="#8A5A34" stroke={C.ink} strokeWidth={3} transform="translate(60 -70)" />
      <path d="M54 -90 Q60 -118 66 -90 Z" fill={C.rose} stroke={C.ink} strokeWidth={2.5} />
    </g>
  </g>
);
const Book: React.FC<{ t: number }> = ({ t }) => {
  const f = Math.sin(t * 2) * 8;
  return (
    <g>
      <path d="M0 -40 C -40 -60, -80 -55, -96 -44 L-96 56 C -80 46, -40 42, 0 60 Z" fill={C.paper} stroke={C.ink} strokeWidth={4} />
      <path d="M0 -40 C 40 -60, 80 -55, 96 -44 L96 56 C 80 46, 40 42, 0 60 Z" fill={C.paper} stroke={C.ink} strokeWidth={4} />
      {[-20, -4, 12, 28].map((y, i) => (
        <g key={i}><line x1={-82} y1={y - 6} x2={-14} y2={y} stroke={C.olive} strokeWidth={3} /><line x1={14} y1={y} x2={82} y2={y - 6} stroke={C.olive} strokeWidth={3} /></g>
      ))}
      <path d={`M0 -40 C 30 ${-70 + f}, 60 ${-62 + f}, 78 ${-50 + f}`} fill="none" stroke={C.gold} strokeWidth={4} />
      <g transform="translate(0 -44)"><Leaf x={0} y={0} r={-70} s={0.45} /><Leaf x={0} y={0} r={-110} s={0.45} fill={C.sage} /></g>
    </g>
  );
};
const Can: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${-12 + Math.sin(t * 2) * 5})`}>
    <path d="M-60 -30 L50 -30 L58 60 L-68 60 Z" fill={C.sage} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
    <path d="M-40 -30 C -40 -80, 30 -80, 30 -30" fill="none" stroke={C.ink} strokeWidth={6} />
    <path d="M-62 0 L-112 -50" stroke={C.ink} strokeWidth={14} strokeLinecap="round" />
    <path d="M-62 0 L-112 -50" stroke={C.sage} strokeWidth={8} strokeLinecap="round" />
    <ellipse cx={-118} cy={-56} rx={14} ry={9} fill={C.gold} stroke={C.ink} strokeWidth={3} transform="rotate(-45 -118 -56)" />
    <rect x={-62} y={10} width={116} height={10} fill={C.gold} />
    {Array.from({ length: 6 }, (_, i) => { const p = (t * 1.6 + i / 6) % 1; return <path key={i} d="M0 -8 Q 6 0 0 6 Q -6 0 0 -8Z" fill="#7FB2C8" stroke={C.ink} strokeWidth={1.5} transform={`translate(${-128 - (i % 3) * 10 - p * 20} ${-40 + p * 110})`} opacity={1 - p * 0.6} />; })}
  </g>
);
const Tulip: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M0 80 C 4 30, -4 0, 0 -20" stroke={C.olive} strokeWidth={7} fill="none" />
    <Leaf x={0} y={60} r={-60 + Math.sin(t * 2) * 4} s={0.55} />
    <Leaf x={0} y={70} r={240 + Math.sin(t * 2) * 4} s={0.5} fill={C.sage} />
    <g transform={`translate(0 -30) rotate(${Math.sin(t * 1.8) * 5})`}>
      <path d="M-34 0 C -40 -40, -22 -66, -14 -70 L0 -44 L14 -70 C 22 -66, 40 -40, 34 0 C 22 22, -22 22, -34 0 Z" fill={C.rose} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M-14 -70 C -4 -40, 4 -40, 14 -70" fill="none" stroke={C.ink} strokeWidth={3} />
    </g>
  </g>
);

const Cartouche: React.FC<{ x: number; y: number; r: number; s: number; t: number; children: React.ReactNode }> = ({ x, y, r, s, t, children }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t * 1.5 + x) * 6}) scale(${s})`}>
      <circle r={r + 14} fill={C.gold} stroke={C.ink} strokeWidth={3} />
      <circle r={r} fill="url(#cartFill)" stroke={C.ink} strokeWidth={3} />
      <g transform={`rotate(${t * 10})`}>
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={0} cy={-(r + 7)} r={3.5} fill={C.paper} transform={`rotate(${i * 22.5})`} />)}
      </g>
      {children}
    </g>
  );

// ---------- text ----------
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const Line: React.FC<{ q: number; size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; out?: number; lh?: number }> = ({ q, size = 64, color = C.ink, font = AM.fa, w = 800, children, out = 0, lh = 1.45 }) => (
  <div style={{ fontFamily: font, fontWeight: w, fontSize: size, color, direction: "rtl", lineHeight: lh, opacity: q * (1 - out),
    filter: `blur(${(1 - q) * 10 + out * 8}px)`, transform: `translateY(${(1 - q) * 26 - out * 20}px)` }}>{children}</div>
);
const G: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: C.gold, textShadow: `0 0 1px ${C.ink}` }}>{children}</span>;

// ---------- video ----------
export const AgriIntro: React.FC<{ times?: number[]; music?: boolean }> = ({ times, music = true }) => {
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const t = times ? times[frame] ?? 0 : frame / FPS;
  if (!ok) return <AbsoluteFill style={{ background: C.bg }} />;
  const sc = (i: number) => ({ a: S[i], b: S[i + 1], on: t >= S[i] - 0.5 && t < S[i + 1] + 0.5 });
  const outOf = (i: number) => k(t, S[i + 1] - 0.35, S[i + 1], Easing.in(Easing.cubic));
  const cam = 1 + t * 0.0025;

  // scene 1: sprout in the halo + title
  const s1o = outOf(0);
  // scene 2: science ⟷ creativity
  const s2i = k(t, S[1] - 0.05, S[1] + 0.45), s2o = outOf(1);
  // scene 3: from zero to a hundred
  const s3o = outOf(2);
  // scene 4: learn · try · plant
  const s4o = outOf(3);
  const s5 = k(t, S[4], S[4] + 0.6);
  const stages = [0.12, 0.4, 0.68, 1];
  const prog = k(t, S[2] + 0.55, S[2] + 3.7, Easing.inOut(Easing.quad));
  const wipe = k(t, S[2] - 0.3, S[2] + 0.25, io); // T2: whiplash sweep
  const burst = k(t, S[4] - 0.3, S[4] + 0.9, Easing.out(Easing.quad)); // T4: petal burst

  const plaqueText = () => {
    if (t < S[1]) return (
      <>
        <Line q={k(t, 0, 0.5)} out={s1o} font={AM.nast} size={118} w={400} color={C.deep} lh={1.9}>هنر کشاورزی</Line>
        <Line q={k(t, 1.3, 2.0)} out={s1o} size={38} w={600} color={C.olive}>کانال آموزش تخصصی کشاورزی در بله</Line>
      </>
    );
    if (t < S[2]) return (
      <>
        <Line q={k(t, S[1] + 0.2, S[1] + 0.8)} out={s2o} size={70}>تلفیق <G>علم</G> و <G>خلاقیت</G></Line>
        <Line q={k(t, S[1] + 2.2, S[1] + 2.8)} out={s2o} size={58} w={700} color={C.olive}>در کشت و کار</Line>
      </>
    );
    if (t < S[3]) return (
      <>
        <Line q={k(t, S[2] + 0.15, S[2] + 0.7)} out={s3o} size={70}>آموزش <G>تخصصی</G></Line>
        <Line q={k(t, S[2] + 2.55, S[2] + 3.1)} out={s3o} size={58} w={700} color={C.olive}>از صفر تا صد</Line>
      </>
    );
    if (t < S[4]) {
      const w = [S[3] + 0.15, S[3] + 1.15, S[3] + 2.45];
      const lw = (i: number) => ({ opacity: k(t, w[i], w[i] + 0.4) * (1 - s4o), filter: `blur(${(1 - k(t, w[i], w[i] + 0.4)) * 8}px)`, display: "inline-block" as const, transform: `translateY(${(1 - k(t, w[i], w[i] + 0.4, pop)) * 30}px)` });
      return (
        <div style={{ fontFamily: AM.fa, fontWeight: 800, fontSize: 62, color: C.ink, direction: "rtl", lineHeight: 1.5 }}>
          <span style={lw(0)}>بیاموزید،</span> <span style={lw(1)}>تجربه کنید</span>
          <br />
          <span style={lw(2)}>و <G>هنرمندانه</G> بکارید</span>
        </div>
      );
    }
    return (
      <>
        <Line q={k(t, S[4] + 0.1, S[4] + 0.7)} font={AM.nast} size={96} w={400} color={C.deep} lh={1.95}>هنر کشاورزی</Line>
        <Line q={k(t, S[4] + 0.35, S[4] + 0.9)} size={34} w={600} color={C.olive}>ما را در پیام‌رسان بله دنبال کنید</Line>
        <div style={{ marginTop: 14, opacity: k(t, S[4] + 1.5, S[4] + 2.0), transform: `translateY(${(1 - k(t, S[4] + 1.5, S[4] + 2.1, pop)) * 30}px)`,
          background: C.deep, border: `5px solid ${C.gold}`, borderRadius: 60, padding: "10px 34px", boxShadow: "0 6px 16px rgba(60,40,20,.3)" }}>
          <span style={{ fontFamily: AM.hud, fontWeight: 700, fontSize: 38, color: "#FFF4DA", direction: "ltr", letterSpacing: 1 }}>ble.ir/<span style={{ color: C.goldL }}>ArtofAgriculture</span></span>
        </div>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      {music && !times && <Audio src={staticFile("v01/mix.wav")} />}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <radialGradient id="bgG" cx="50%" cy="38%" r="75%"><stop offset="0" stopColor="#FAF0D6" /><stop offset="1" stopColor={C.bg2} /></radialGradient>
          <radialGradient id="haloFill" cx="50%" cy="45%" r="60%"><stop offset="0" stopColor="#FBF3DD" /><stop offset="0.7" stopColor={C.sky} /><stop offset="1" stopColor={C.sage} /></radialGradient>
          <radialGradient id="cartFill" cx="50%" cy="40%" r="65%"><stop offset="0" stopColor="#FFF8E6" /><stop offset="1" stopColor="#E9D9AF" /></radialGradient>
          <pattern id="dots" width="54" height="54" patternUnits="userSpaceOnUse">
            <circle cx="27" cy="27" r="5" fill="none" stroke={C.gold} strokeWidth="1.6" opacity="0.35" /><circle cx="0" cy="0" r="2.5" fill={C.sage} opacity="0.35" />
          </pattern>
          <clipPath id="haloClip"><circle cx={540} cy={720} r={348} /></clipPath>
        </defs>
        <rect width={1080} height={1920} fill="url(#bgG)" />
        <rect width={1080} height={1920} fill="url(#dots)" transform={`translate(0 ${-(t * 8) % 54})`} />
        <g transform={`translate(540 960) scale(${cam}) translate(-540 -960)`}>
          <Halo t={t} cx={540} cy={720} r={360} o={(0.6 + 0.4 * k(t, 0, 0.5)) * (1 - 0.75 * k(t, S[2] - 0.3, S[2] + 0.2) * (1 - k(t, S[3] - 0.3, S[3] + 0.2)))} />
          {/* bottom: soil band with roots + mosaic */}
          <Mosaic y={1585} t={t} />
          <path d="M60 1640 L1020 1640 L1020 1860 L60 1860 Z" fill="#B9875A" stroke={C.ink} strokeWidth={3} opacity={k(t, 0.3, 0.9)} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M${130 + i * 135} 1640 C ${110 + i * 135} 1700, ${160 + i * 135} 1740, ${125 + i * 135} 1820`} fill="none" stroke={C.goldL} strokeWidth={3}
              pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, 1 + i * 0.25, 3 + i * 0.25)} />
          ))}

          {/* ===== scene 1 ===== */}
          {sc(0).on && (
            <g clipPath="url(#haloClip)" transform={`translate(540 1000) scale(${1 - s1o * 0.6}) translate(-540 -1000)`} opacity={1 - s1o}>
              <g transform="translate(540 1010)"><Soil w={360} /></g>
              <g transform="translate(540 990)"><Plant g={k(t, 0.6, 3.9, Easing.out(Easing.quad)) * 0.72} H={400} t={t} /></g>
            </g>
          )}
          {/* T1: gold ring pulse */}
          <circle cx={540} cy={720} r={120 + k(t, S[1] - 0.2, S[1] + 0.5) * 300} fill="none" stroke={C.goldL} strokeWidth={14 * (1 - k(t, S[1] - 0.2, S[1] + 0.5))} opacity={t > S[1] - 0.2 && t < S[1] + 0.5 ? 1 : 0} />

          {/* ===== scene 2 ===== */}
          {sc(1).on && t >= S[1] - 0.05 && (
            <g opacity={1 - s2o}>
              <g clipPath="url(#haloClip)">
                <g transform={`translate(540 1010) scale(${s2i})`}><Soil w={260} /></g>
                <g transform={`translate(540 990) scale(${s2i})`}><Plant g={0.55 + k(t, S[1] + 2.3, S[2] - 0.4) * 0.45} H={300} t={t} /></g>
              </g>
              {/* vines from both cartouches into the plant */}
              <path d="M790 860 C 760 980, 640 900, 560 880" fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[1] + 1.6, S[1] + 2.4)} />
              <path d="M290 860 C 320 980, 440 900, 520 880" fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[1] + 1.8, S[1] + 2.6)} />
              <Cartouche x={800} y={600} r={135} s={k(t, S[1] + 0.7, S[1] + 1.25, pop)} t={t}><Flask t={t} /></Cartouche>
              <Cartouche x={280} y={600} r={135} s={k(t, S[1] + 1.0, S[1] + 1.55, pop)} t={t}><Palette t={t} /></Cartouche>
            </g>
          )}

          {/* ===== scene 3 ===== */}
          {sc(2).on && t >= S[2] - 0.3 && (
            <g transform={`translate(540 780) scale(${1 + s3o * 0.35}) translate(-540 -780)`} opacity={1 - s3o}>
              {stages.map((g, i) => {
                const x = 862 - i * 215, a = k(t, S[2] + 0.2 + i * 0.4, S[2] + 0.7 + i * 0.4, pop);
                return (
                  <g key={i} transform={`translate(${x} 1000) scale(${a}) translate(0 -1000)`}>
                    <path d="M-90 1000 L-90 620 A90 90 0 0 1 90 620 L90 1000 Z" fill="url(#haloFill)" stroke={C.gold} strokeWidth={9} />
                    <path d="M-77 1000 L-77 624 A77 77 0 0 1 77 624 L77 1000" fill="none" stroke={C.ink} strokeWidth={2.5} />
                    <g transform="translate(0 990)"><Soil w={170} /></g>
                    <g transform="translate(0 975)"><Plant g={g * k(t, S[2] + 0.4 + i * 0.4, S[2] + 1.6 + i * 0.4)} H={300} t={t + i} /></g>
                    <text x={0} y={1060} textAnchor="middle" style={{ fontFamily: AM.fa, fontWeight: 800, fontSize: 34 }} fill={C.ink} direction="rtl">
                      {["بذر", "جوانه", "نهال", "ثمر"][i]}
                    </text>
                  </g>
                );
              })}
              {/* progress vine 0 → 100, right to left */}
              <path d="M920 1110 C 790 1140, 700 1080, 540 1110 C 380 1140, 290 1080, 160 1110" fill="none" stroke={C.gold} strokeWidth={8} strokeLinecap="round"
                pathLength={1} strokeDasharray={1} strokeDashoffset={1 - prog} />
              <g transform={`translate(${920 - prog * 760} ${1110 + Math.sin(prog * Math.PI * 2) * 12})`} opacity={k(t, S[2] + 0.4, S[2] + 0.7)}>
                <circle r={46} fill={C.rose} stroke={C.ink} strokeWidth={3} />
                <text y={14} textAnchor="middle" style={{ fontFamily: "Lalezar", fontSize: 40 }} fill="#FFF6E2">{fa(Math.round(prog * 100))}</text>
              </g>
            </g>
          )}
          {/* T2: whiplash sweep */}
          {wipe > 0 && wipe < 1 && (
            <g transform={`translate(${1300 - wipe * 1700} 0)`}>
              <path d="M0 330 C 80 520, -60 700, 40 880 C 120 1040, 0 1100, 30 1140 L 400 1140 L 400 330 Z" fill={C.bg} opacity={0.96} />
              <path d="M0 330 C 80 520, -60 700, 40 880 C 120 1040, 0 1100, 30 1140" fill="none" stroke={C.gold} strokeWidth={14} />
              <path d="M28 330 C 108 520, -32 700, 68 880 C 148 1040, 28 1100, 58 1140" fill="none" stroke={C.olive} strokeWidth={5} />
            </g>
          )}

          {/* ===== scene 4 ===== */}
          {sc(3).on && t >= S[3] - 0.3 && (
            <g transform={`translate(540 720) scale(${0.85 + 0.15 * k(t, S[3] - 0.3, S[3] + 0.3)}) translate(-540 -720)`} opacity={k(t, S[3] - 0.3, S[3] + 0.1) * (1 - s4o * 0.9)}>
              {[
                { x: 790, y: 560, at: S[3] + 0.15, el: <Book t={t} /> },
                { x: 540, y: 820, at: S[3] + 1.15, el: <Can t={t} /> },
                { x: 290, y: 560, at: S[3] + 2.45, el: <Tulip t={t} /> },
              ].map((c, i) => (
                <Cartouche key={i} x={c.x} y={c.y} r={140} s={k(t, c.at, c.at + 0.5, pop) * (1 - s4o * 0.3)} t={t}>{c.el}</Cartouche>
              ))}
              <path d="M790 700 C 740 800, 660 760, 640 800" fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[3] + 1.2, S[3] + 1.7)} />
              <path d="M440 800 C 420 760, 340 800, 290 700" fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[3] + 2.5, S[3] + 3.0)} />
            </g>
          )}

          {/* ===== scene 5: end card ===== */}
          {t >= S[4] - 0.2 && (
            <g opacity={k(t, S[4] - 0.2, S[4] + 0.3)}>
              <g clipPath="url(#haloClip)">
                <g transform={`translate(540 1010) scale(${s5})`}><Soil w={380} /></g>
                <g transform="translate(540 990)"><Plant g={0.3 + 0.7 * k(t, S[4], S[4] + 2.2, Easing.out(Easing.quad))} H={520} t={t} flower={C.rose} /></g>
              </g>
            </g>
          )}
          {/* T4: petal burst */}
          {burst > 0 && burst < 1 && Array.from({ length: 26 }, (_, i) => {
            const a = (i / 26) * Math.PI * 2 + rnd(i) * 0.3, d = burst * (500 + rnd(i + 2) * 500);
            return <ellipse key={i} cx={540 + Math.cos(a) * d} cy={720 + Math.sin(a) * d} rx={18} ry={32} fill={i % 2 ? C.rose : C.blush} stroke={C.ink} strokeWidth={2}
              opacity={1 - burst} transform={`rotate(${a * 57 + burst * 200} ${540 + Math.cos(a) * d} ${720 + Math.sin(a) * d})`} />;
          })}

          <SideVine t={t} />
          <SideVine t={t} right />
          <Pollen t={t} />
        </g>
        <Frame t={t} />
      </svg>

      {/* text plaque */}
      <div style={{ position: "absolute", left: 110, top: 1150, width: 860, height: 400, opacity: k(t, 0, 0.35), transform: `scale(${0.96 + 0.04 * k(t, 0, 0.6, pop)})` }}>
        <svg width={860} height={400} style={{ position: "absolute" }}>
          <path d="M40 20 L820 20 Q840 20 840 40 L840 360 Q840 380 820 380 L40 380 Q20 380 20 360 L20 40 Q20 20 40 20Z" fill={C.paper} stroke={C.gold} strokeWidth={9} />
          <path d="M50 36 L810 36 Q824 36 824 50 L824 350 Q824 364 810 364 L50 364 Q36 364 36 350 L36 50 Q36 36 50 36Z" fill="none" stroke={C.ink} strokeWidth={2} />
          {[[20, 20], [840, 20], [20, 380], [840, 380]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={16} fill={C.rose} stroke={C.ink} strokeWidth={2.5} />)}
          <path d="M330 20 C 380 -14, 480 -14, 530 20" fill={C.paper} stroke={C.gold} strokeWidth={7} />
          <circle cx={430} cy={6} r={9} fill={C.sage} stroke={C.ink} strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 40px" }}>
          {plaqueText()}
        </div>
      </div>

    </AbsoluteFill>
  );
};

const LOOK = [0.28, 1.5, 3.9, 4.4, 6.0, 8.6, 10.6, 11.6, 13.4, 15.0, 16.6, 19.5];
export const V01: React.FC = () => (
  <>
    <Composition id="V01" component={AgriIntro} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="V01-Silent" component={AgriIntro} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="V01-Look" component={AgriIntro} durationInFrames={LOOK.length} fps={FPS} width={1080} height={1920} defaultProps={{ times: LOOK }} />
  </>
);
