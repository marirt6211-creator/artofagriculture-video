// v18 · Art of Agriculture — first YouTube Short (channel intro, EN, 9:16).
// Real footage (Pixabay / Mixkit, src/v18/footage.json) + green/gold motion graphics + 2.5D science animations.
// Every time comes from the narration (src/v18/vo.json, Sarah). No small text on screen (user preference).
import React from "react";
import { AbsoluteFill, Audio, Composition, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageTime, Media, type Manifest } from "../footage/footage";
import manJson from "./footage.json";

const MAN = manJson as unknown as Manifest;
const W = 1080, H = 1920, FPS = 30, END = 50;
const GOLD = "#e9b949", GOLD2 = "#f6d27a", LEAF = "#7fcf6a", DEEP = "#0d1a10";
const DISP = "Sora", BODY = "InterV";

// ---------- fonts ----------
const fh = delayRender("v18 fonts");
Promise.all([
  new FontFace(DISP, `url('${staticFile("fonts/Sora-Bold.woff2")}') format('woff2')`, { weight: "700" }).load(),
  new FontFace(BODY, `url('${staticFile("fonts/Inter.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); }).catch((e) => { console.error(e); continueRender(fh); });

// ---------- helpers ----------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3); // ease out
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x: number) => { x = clamp(x); const c = 1.5; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
/** visible from a to b with fade in/out */
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(lin(t, a, a + fi), 1 - lin(t, b - fo, b));
const C = (k: string) => MAN.clips[k];

// ---------- footage shots ----------
type S = { k: string; at: number; until: number; focus?: [number, number]; pan?: [number, number]; zoom?: number; push?: number; from?: number; rate?: number };
const SHOTS: S[] = [
  { k: "c01", at: 0, until: 2.75, focus: [0.55, 0.5], push: 0.12 },
  { k: "c02", at: 4.5, until: 6.85, push: 0.08 },
  { k: "c03", at: 6.6, until: 9.85, push: 0.1 },
  { k: "c04", at: 9.7, until: 13.5, focus: [0.5, 0.5], pan: [0.06, 0], push: 0.07 },
  { k: "c05", at: 13.35, until: 15.55, focus: [0.47, 0.45], push: 0.12, from: 1 },
  { k: "c06", at: 15.4, until: 18.25, focus: [0.5, 0.5], push: 0.1 },
  { k: "c07", at: 18.1, until: 19.4, push: 0.08 },
  { k: "c09", at: 20.2, until: 21.85, focus: [0.5, 0.5], push: 0.1 },
  { k: "c10", at: 21.7, until: 23.15, focus: [0.62, 0.5], push: 0.06, rate: 0.8 },
  { k: "c11", at: 23.0, until: 25.2, focus: [0.55, 0.5], push: 0.08 },
  { k: "c12c", at: 30.2, until: 32.4, focus: [0.5, 0.5], push: 0.06, from: 4 },
  { k: "c13a", at: 32.2, until: 33.95, focus: [0.4, 0.5], push: 0.08 },
  { k: "c13b", at: 33.8, until: 35.65, focus: [0.48, 0.5], push: 0.08 },
  { k: "c13c", at: 35.5, until: 37.7, focus: [0.5, 0.5], push: 0.1 },
  { k: "c13b", at: 37.5, until: 39.9, focus: [0.6, 0.5], push: 0.04, from: 4 },
  { k: "c14", at: 39.6, until: 44.95, focus: [0.5, 0.5], push: 0.08 },
  { k: "c15", at: 44.7, until: END, focus: [0.42, 0.5], push: 0.06 },
];
const XF = 0.25; // crossfade

const Bed: React.FC<{ t: number }> = ({ t }) => (
  <>
    {SHOTS.filter((s) => t >= s.at - 0.05 && t < s.until).map((s, i) => {
      const o = lin(t, s.at, s.at + XF);
      return (
        <div key={s.k + s.at} style={{ position: "absolute", inset: 0, opacity: s.at === 0 ? 1 : o }}>
          <Media clip={C(s.k)} name={s.k} t0={s.at} len={s.until - s.at} w={W} h={H} focus={s.focus ?? C(s.k)?.focus} pan={s.pan} zoom={s.zoom ?? 1.04} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="clean" />
        </div>
      );
    })}
  </>
);

// ---------- typography ----------
const shadow = "0 4px 18px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.6)";
/** one big kinetic word (or two lines) — rises in with a blur, holds, fades */
const Word: React.FC<{ t: number; text: string; at: number; until: number; y: number; size?: number; color?: string; track?: number; font?: string }> = ({ t, text, at, until, y, size = 120, color = "#fff", track = 4, font = DISP }) => {
  if (t < at - 0.1 || t > until + 0.1) return null;
  const p = eo(lin(t, at, at + 0.35));
  const out = lin(t, until - 0.22, until);
  const drift = (t - at) * 6;
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: y, textAlign: "center", fontFamily: font, fontWeight: 700, fontSize: size, color, letterSpacing: track, lineHeight: 1.05,
      textShadow: shadow, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 50 - drift + out * -20}px) scale(${0.92 + 0.08 * p})`, filter: `blur(${(1 - p) * 10 + out * 6}px)` }}>
      {text}
    </div>
  );
};
/** a soft dark plate behind text areas for phone readability */
const Shade: React.FC<{ o: number; from?: number; to?: number; strength?: number }> = ({ o, from = 0.5, to = 1, strength = 0.65 }) => (
  <AbsoluteFill style={{ opacity: o, background: `linear-gradient(180deg, rgba(0,0,0,0) ${from * 100}%, rgba(0,0,0,${strength}) ${to * 100}%)` }} />
);

// ---------- line icons (drawn, 100×100 box) ----------
const ICON: Record<string, React.ReactNode> = {
  soil: (<g><path d="M14 52 Q50 40 86 52" /><path d="M14 66 Q50 56 86 66" /><path d="M14 80 Q50 72 86 80" /><path d="M50 52 V24 M50 34 Q36 22 30 30 Q40 40 50 34 M50 30 Q64 18 72 26 Q60 36 50 30" /></g>),
  sprout: (<g><path d="M50 88 V40" /><path d="M50 58 Q26 56 20 34 Q44 34 50 58Z" /><path d="M50 46 Q72 42 80 20 Q56 22 50 46Z" /><path d="M30 88 H70" /></g>),
  chip: (<g><rect x="28" y="28" width="44" height="44" rx="6" /><path d="M38 28 V16 M50 28 V16 M62 28 V16 M38 72 V84 M50 72 V84 M62 72 V84 M28 38 H16 M28 50 H16 M28 62 H16 M72 38 H84 M72 50 H84 M72 62 H84" /><path d="M50 40 Q40 50 50 62 Q60 50 50 40Z" /></g>),
  drop: (<g><path d="M50 26 Q34 48 34 58 A16 16 0 0 0 66 58 Q66 48 50 26Z" /><path d="M20 50 A30 30 0 0 1 44 20 M80 50 A30 30 0 0 1 56 80" /><path d="M38 18 L44 20 L40 26 M62 82 L56 80 L60 74" /></g>),
  chart: (<g><path d="M16 84 H86" /><rect x="22" y="60" width="12" height="22" /><rect x="42" y="48" width="12" height="34" /><rect x="62" y="32" width="12" height="50" /><path d="M20 50 L42 34 L56 40 L82 16 M70 16 H82 V28" /></g>),
  wheat: (<g><path d="M50 90 V20" /><path d="M50 30 Q38 26 36 16 Q48 18 50 30 M50 30 Q62 26 64 16 Q52 18 50 30 M50 46 Q38 42 36 32 Q48 34 50 46 M50 46 Q62 42 64 32 Q52 34 50 46 M50 62 Q38 58 36 48 Q48 50 50 62 M50 62 Q62 58 64 48 Q52 50 50 62" /></g>),
  leaf: (<g><path d="M22 80 Q20 30 78 20 Q82 74 22 80Z" /><path d="M22 80 Q46 54 70 30" /></g>),
  lens: (<g><circle cx="42" cy="42" r="24" /><path d="M60 60 L82 82" strokeWidth={9} /><path d="M32 36 A12 12 0 0 1 44 28" /></g>),
  sun: (<g><circle cx="50" cy="50" r="16" /><path d="M50 14 V24 M50 76 V86 M14 50 H24 M76 50 H86 M24 24 L31 31 M69 69 L76 76 M76 24 L69 31 M31 69 L24 76" /></g>),
  temp: (<g><path d="M44 62 V22 A6 6 0 0 1 56 22 V62 A14 14 0 1 1 44 62Z" /><path d="M50 40 V70" /></g>),
};
const Icon: React.FC<{ name: string; x: number; y: number; size?: number; p?: number; ring?: boolean; color?: string }> = ({ name, x, y, size = 120, p = 1, ring = true, color = GOLD }) => {
  if (p <= 0) return null;
  const s = back(p);
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${s})`, opacity: clamp(p * 2) }}>
      {ring && <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(10,22,13,.72)", border: `3px solid ${color}`, boxShadow: "0 6px 24px rgba(0,0,0,.45)" }} />}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: ring ? size * 0.2 : 0, width: ring ? size * 0.6 : size, height: ring ? size * 0.6 : size, overflow: "visible" }}>
        <g fill="none" stroke={ring ? "#fff" : color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round">{ICON[name]}</g>
      </svg>
    </div>
  );
};

// ---------- scene 1: gold ring around the seed ----------
const SeedRing: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 0.5, 2.9, 0.4, 0.2);
  if (o <= 0) return null;
  const draw = eo(lin(t, 0.5, 1.6));
  const cx = 540, cy = 900, r = 200 + (t - 0.5) * 8;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth={4} strokeDasharray={`${2 * Math.PI * r * draw} 9999`} transform={`rotate(${-90 + t * 20} ${cx} ${cy})`} />
      <circle cx={cx} cy={cy} r={r + 26} fill="none" stroke={GOLD2} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="4 16" transform={`rotate(${-t * 14} ${cx} ${cy})`} />
      {[0, 90, 180, 270].map((a) => {
        const rad = ((a + t * 20) * Math.PI) / 180;
        return <circle key={a} cx={cx + Math.cos(rad) * r} cy={cy + Math.sin(rad) * r} r={7 * draw} fill={GOLD2} />;
      })}
    </svg>
  );
};

// ---------- scene 2: seed cross-section (2.5D science animation) ----------
const SeedSection: React.FC<{ t: number }> = ({ t }) => {
  const a = 2.55, b = 4.75;
  if (t < a || t > b + 0.3) return null;
  const iris = eio(lin(t, a, a + 0.45)); // opens from the ring
  const out = lin(t, b - 0.05, b + 0.3);
  const split = eio(lin(t, 3.2, 3.9)); // halves part
  const root = eo(lin(t, 3.6, 4.7));
  const shoot = eo(lin(t, 3.9, 4.75));
  const zoom = 1 + (t - a) * 0.05;
  const R = 2200 * iris + 190;
  return (
    <AbsoluteFill style={{ clipPath: `circle(${R}px at 540px 900px)`, opacity: 1 - out }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #2b4a2a 0%, #13261a 55%, #08120b 100%)` }} />
      {/* floating particles */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 263) % W, y = ((i * 547 + t * 40 * (1 + (i % 3))) % H);
          return <circle key={i} cx={x} cy={H - y} r={1.5 + (i % 4)} fill={GOLD2} opacity={0.12 + (i % 5) * 0.05} />;
        })}
      </svg>
      <svg viewBox="0 0 1080 1920" width={W} height={H} style={{ position: "absolute", inset: 0, transform: `scale(${zoom})`, transformOrigin: "540px 960px" }}>
        <defs>
          <radialGradient id="coat" cx="40%" cy="35%" r="70%"><stop offset="0" stopColor="#d9a866" /><stop offset=".7" stopColor="#9a6a36" /><stop offset="1" stopColor="#5b3a1c" /></radialGradient>
          <radialGradient id="endo" cx="45%" cy="40%" r="65%"><stop offset="0" stopColor="#fff6dc" /><stop offset=".8" stopColor="#ecd8a0" /><stop offset="1" stopColor="#cdb377" /></radialGradient>
          <linearGradient id="emb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b6e37c" /><stop offset="1" stopColor="#5d9a3a" /></linearGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="18" /></filter>
        </defs>
        <ellipse cx="540" cy="1250" rx="300" ry="50" fill="#000" opacity=".35" filter="url(#soft)" />
        {/* left half */}
        <g transform={`translate(${-split * 70} 0) rotate(${-split * 6} 540 1220)`}>
          <path d="M540 640 C 380 660 330 820 340 980 C 350 1130 430 1230 540 1240 Z" fill="url(#coat)" />
          <path d="M540 672 C 400 690 368 830 376 980 C 386 1110 450 1196 540 1206 Z" fill="url(#endo)" />
        </g>
        {/* right half */}
        <g transform={`translate(${split * 70} 0) rotate(${split * 6} 540 1220)`}>
          <path d="M540 640 C 700 660 750 820 740 980 C 730 1130 650 1230 540 1240 Z" fill="url(#coat)" />
          <path d="M540 672 C 680 690 712 830 704 980 C 694 1110 630 1196 540 1206 Z" fill="url(#endo)" />
        </g>
        {/* embryo */}
        <g>
          <path d="M540 1180 C 500 1100 505 980 540 900 C 575 980 580 1100 540 1180 Z" fill="url(#emb)" opacity={0.95} />
          <path d={`M540 900 C 520 ${880 - shoot * 120} ${470 - shoot * 40} ${860 - shoot * 210} ${440 - shoot * 30} ${820 - shoot * 260}`} stroke="#8fd16a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={shoot} />
          <path d={`M540 900 C 560 ${880 - shoot * 120} ${610 + shoot * 40} ${860 - shoot * 210} ${640 + shoot * 30} ${820 - shoot * 260}`} stroke="#8fd16a" strokeWidth={14} fill="none" strokeLinecap="round" opacity={shoot} />
          {/* radicle */}
          <path d={`M540 1180 C 545 ${1230 + root * 120} ${530} ${1280 + root * 220} ${548} ${1240 + root * 380}`} stroke="#f4ead0" strokeWidth={16 - root * 6} fill="none" strokeLinecap="round" opacity={root > 0 ? 1 : 0} />
          {[0.35, 0.55, 0.75].map((k, i) => (
            <path key={i} d={`M540 ${1240 + k * 380 * root} q ${i % 2 ? 60 : -60} 30 ${i % 2 ? 110 : -110} 90`} stroke="#efe2c0" strokeWidth={6} fill="none" strokeLinecap="round" opacity={clamp((root - k) * 4)} />
          ))}
        </g>
        {/* gold light rim */}
        <ellipse cx="540" cy="940" rx={250 + split * 80} ry="330" fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="6 14" opacity={0.6} transform={`rotate(${t * 10} 540 940)`} />
      </svg>
    </AbsoluteFill>
  );
};

// ---------- scene 3: title + light leak ----------
const LightLeak: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = 1 - Math.abs(lin(t, at - 0.3, at + 0.3) * 2 - 1);
  if (p <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${30 + p * 40}% 35%, rgba(255,214,120,${0.85 * p}) 0%, rgba(255,190,80,${0.35 * p}) 35%, rgba(0,0,0,0) 70%)`, mixBlendMode: "screen" }} />;
};
const Title: React.FC<{ t: number }> = ({ t }) => {
  const a = 7.6, b = 9.75;
  if (t < a - 0.1 || t > b + 0.1) return null;
  const p1 = eo(lin(t, a, a + 0.4)), p2 = eo(lin(t, a + 0.25, a + 0.7)), ln = eio(lin(t, a + 0.5, a + 1.2));
  const out = lin(t, b - 0.25, b);
  return (
    <div style={{ position: "absolute", left: 0, top: 1180, width: W, textAlign: "center", opacity: 1 - out, filter: `blur(${out * 8}px)` }}>
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 120, color: "#fff", textShadow: shadow, opacity: p1, transform: `translateY(${(1 - p1) * 40}px)` }}>Art of</div>
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 132, color: GOLD2, textShadow: shadow, opacity: p2, transform: `translateY(${(1 - p2) * 40}px)`, marginTop: -6 }}>Agriculture</div>
      <div style={{ margin: "18px auto 0", width: 720 * ln, height: 6, borderRadius: 3, background: `linear-gradient(90deg, rgba(233,185,73,0), ${GOLD} 20%, ${GOLD2} 50%, ${GOLD} 80%, rgba(233,185,73,0))`, boxShadow: `0 0 18px ${GOLD}` }} />
    </div>
  );
};

// ---------- scene 4: leaf veins + sun ----------
const LeafLines: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 10.0, 13.45, 0.3, 0.3);
  if (o <= 0) return null;
  const d = eio(lin(t, 10.1, 11.6));
  const veins = ["M540 1500 C 520 1250 530 980 560 720", "M545 1300 C 470 1240 410 1200 360 1130", "M548 1150 C 630 1090 690 1040 740 960", "M552 1010 C 480 950 430 900 400 840", "M556 880 C 610 840 650 800 690 740"];
  const sun = eo(lin(t, 10.6, 11.2));
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs><filter id="glw"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
      <g filter="url(#glw)" fill="none" stroke={GOLD2} strokeWidth={4} strokeLinecap="round">
        {veins.map((v, i) => <path key={i} d={v} pathLength={1} strokeDasharray={`${clamp(d * 1.6 - i * 0.15)} 1`} />)}
      </g>
      {/* sun + rays travelling to the leaf */}
      <g opacity={sun} transform={`translate(860 330) scale(${0.6 + 0.4 * sun}) rotate(${t * 12})`}>
        <circle r="46" fill={GOLD} opacity=".95" />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x="-4" y="-92" width="8" height="28" rx="4" fill={GOLD2} transform={`rotate(${i * 30})`} />)}
      </g>
      {[0, 1, 2].map((i) => {
        const k = ((t - 10.8) * 0.9 + i / 3) % 1;
        if (t < 10.8) return null;
        const x = 860 + (560 - 860) * k, y = 330 + (900 - 330) * k;
        return <circle key={i} cx={x} cy={y} r={9} fill={GOLD2} opacity={sun * (1 - k)} filter="url(#glw)" />;
      })}
    </svg>
  );
};

// ---------- scene 5: magnifier ring ----------
const Magnifier: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 13.6, 15.5, 0.3, 0.25);
  if (o <= 0) return null;
  const p = back(lin(t, 13.6, 14.2));
  const cx = 540, cy = 860, r = 250 * p;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={5} opacity={0.9} />
      <circle cx={cx} cy={cy} r={r + 22} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="2 18" transform={`rotate(${t * 25} ${cx} ${cy})`} />
      {Array.from({ length: 36 }).map((_, i) => {
        const a = (i * 10 * Math.PI) / 180, l = i % 3 ? 10 : 22;
        return <line key={i} x1={cx + Math.cos(a) * (r - 4)} y1={cy + Math.sin(a) * (r - 4)} x2={cx + Math.cos(a) * (r - 4 - l)} y2={cy + Math.sin(a) * (r - 4 - l)} stroke="#fff" strokeWidth={3} opacity={0.75} />;
      })}
    </svg>
  );
};

// ---------- scene 6: precision-farming HUD + drone ----------
const Drone: React.FC<{ x: number; y: number; s?: number; t: number }> = ({ x, y, s = 1, t }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-70, -50], [70, -50], [-70, 50], [70, 50]].map(([dx, dy], i) => (
      <g key={i}><line x1={0} y1={0} x2={dx} y2={dy} stroke="#fff" strokeWidth={8} />
        <ellipse cx={dx} cy={dy} rx={40} ry={10} fill="#fff" opacity={0.55} transform={`rotate(${t * 2400 + i * 45} ${dx} ${dy})`} />
        <circle cx={dx} cy={dy} r={7} fill="#fff" /></g>
    ))}
    <rect x={-34} y={-22} width={68} height={44} rx={14} fill="#f4f7f2" stroke={GOLD} strokeWidth={4} />
    <circle cx={0} cy={0} r={8} fill={LEAF} />
  </g>
);
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 15.6, 18.25, 0.3, 0.25);
  if (o <= 0) return null;
  const scan = eio(lin(t, 16.0, 17.6));
  const sy = 300 + scan * 1300;
  const dp = lin(t, 15.6, 18.2);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <g stroke={GOLD} strokeOpacity={0.35} strokeWidth={2}>
        {Array.from({ length: 13 }).map((_, i) => <line key={"h" + i} x1={0} y1={300 + i * 110} x2={W} y2={300 + i * 110} />)}
        {Array.from({ length: 9 }).map((_, i) => <line key={"v" + i} x1={60 + i * 120} y1={300} x2={60 + i * 120} y2={1620} />)}
      </g>
      <rect x={0} y={300} width={W} height={sy - 300} fill={LEAF} opacity={0.22} />
      {/* health cells */}
      {Array.from({ length: 12 * 9 }).map((_, i) => {
        const c = i % 9, r = Math.floor(i / 9), y = 300 + r * 110;
        if (y + 110 > sy) return null;
        const h = (Math.sin(c * 1.7 + r * 0.9) + 1) / 2;
        return <rect key={i} x={60 + c * 120 - 60} y={y} width={120} height={110} fill={h > 0.75 ? GOLD : LEAF} opacity={0.08 + h * 0.14} />;
      })}
      <line x1={0} y1={sy} x2={W} y2={sy} stroke={GOLD2} strokeWidth={6} />
      <rect x={0} y={sy - 40} width={W} height={40} fill={GOLD2} opacity={0.18} />
      {/* corners */}
      {[[80, 340, 1, 1], [1000, 340, -1, 1], [80, 1580, 1, -1], [1000, 1580, -1, -1]].map(([x, y, sx, sy2], i) => (
        <path key={i} d={`M${x} ${y + 60 * sy2} V${y} H${x + 60 * sx}`} stroke="#fff" strokeWidth={6} fill="none" />
      ))}
      <path d="M140 1500 C 300 1300 700 1250 940 700" stroke="#fff" strokeOpacity={0.5} strokeWidth={3} strokeDasharray="10 14" fill="none" />
      <Drone x={140 + 800 * dp} y={1500 - 800 * Math.sin(dp * 1.4)} s={1.1} t={t} />
    </svg>
  );
};

// ---------- chapter rail (scenes 7–11): five icons on a growing gold line ----------
const RAIL = [
  { at: 18.45, icon: "soil" }, { at: 19.5, icon: "sprout" }, { at: 20.4, icon: "chip" }, { at: 21.75, icon: "drop" }, { at: 23.35, icon: "chart" },
];
const Rail: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 18.3, 25.15, 0.3, 0.35);
  if (o <= 0) return null;
  const x0 = 140, dx = 200, y = 300;
  const n = RAIL.filter((r) => t >= r.at).length;
  const lineTo = n === 0 ? x0 : x0 + (n - 1) * dx + dx * eo(lin(t, RAIL[Math.min(n, 4)]?.at - 0.6, RAIL[Math.min(n, 4)]?.at)) * (n < 5 ? 1 : 0);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={x0} y1={y} x2={x0 + 4 * dx} y2={y} stroke="#fff" strokeOpacity={0.25} strokeWidth={4} />
        <line x1={x0} y1={y} x2={Math.min(lineTo, x0 + 4 * dx)} y2={y} stroke={GOLD} strokeWidth={6} strokeLinecap="round" />
      </svg>
      {RAIL.map((r, i) => {
        const p = lin(t, r.at, r.at + 0.35);
        const active = i === n - 1;
        return <Icon key={i} name={r.icon} x={x0 + i * dx} y={y} size={active ? 132 : 104} p={p} color={active ? GOLD2 : GOLD} />;
      })}
    </div>
  );
};

// ---------- scene 7: water seeping through soil ----------
const SoilDrops: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 18.2, 19.45, 0.2, 0.2);
  if (o <= 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: 14 }).map((_, i) => {
        const x = 90 + ((i * 337) % 900), sp = 380 + (i % 4) * 90, y = 520 + (((t - 18.2) * sp + i * 173) % 1100);
        return <path key={i} d={`M${x} ${y - 22} Q${x - 12} ${y} ${x} ${y + 8} Q${x + 12} ${y} ${x} ${y - 22}Z`} fill="#bfe6ff" opacity={0.75} />;
      })}
    </svg>
  );
};

// ---------- scene 8: plant growth cutaway (2.5D) ----------
const Growth: React.FC<{ t: number }> = ({ t }) => {
  const a = 19.25, b = 20.4;
  if (t < a || t > b + 0.1) return null;
  const o = vis(t, a, b + 0.1, 0.2, 0.25);
  const g = eo(lin(t, a, b));
  const ground = 1000;
  return (
    <AbsoluteFill style={{ opacity: o }}>
      {/* top: real shoots */}
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: ground, overflow: "hidden" }}>
        <Media clip={C("c08")} name="c08" t0={a} len={b - a} w={W} h={ground} focus={[0.3, 0.6]} push={0.06} from={2} />
      </div>
      {/* bottom: soil cutaway */}
      <svg width={W} height={H - ground} style={{ position: "absolute", left: 0, top: ground }}>
        <defs><linearGradient id="soilg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a3c22" /><stop offset=".45" stopColor="#3d2814" /><stop offset="1" stopColor="#1e140a" /></linearGradient></defs>
        <rect width={W} height={H - ground} fill="url(#soilg)" />
        {Array.from({ length: 60 }).map((_, i) => <circle key={i} cx={(i * 197) % W} cy={30 + ((i * 89) % 880)} r={4 + (i % 6) * 2} fill={i % 3 ? "#6e4b2c" : "#2a1b0e"} opacity={0.7} />)}
        <path d="M0 330 Q 540 300 1080 340" stroke="#7a5233" strokeWidth={3} fill="none" opacity={0.6} />
        <path d="M0 620 Q 540 590 1080 640" stroke="#7a5233" strokeWidth={3} fill="none" opacity={0.6} />
        {/* roots growing */}
        <g stroke="#f1e4c4" fill="none" strokeLinecap="round">
          {[["M540 0 C 545 200 530 420 545 760", 10], ["M540 140 C 470 220 400 260 300 380", 6], ["M542 240 C 620 320 700 360 800 470", 6], ["M543 420 C 480 500 430 560 360 680", 5], ["M544 520 C 610 600 650 650 720 760", 5], ["M300 380 C 260 430 240 480 230 560", 3], ["M800 470 C 850 520 870 580 880 650", 3]].map(([d, w], i) => (
            <path key={i} d={d as string} pathLength={1} strokeWidth={w as number} strokeDasharray={`${clamp(g * 1.5 - i * 0.12)} 1`} />
          ))}
        </g>
        {/* water rising up the root */}
        {[0, 1, 2, 3].map((i) => { const k = ((t - a) * 1.2 + i / 4) % 1; return <circle key={i} cx={542} cy={700 - k * 700} r={8} fill="#9fd8ff" opacity={g * (1 - k)} />; })}
      </svg>
      <div style={{ position: "absolute", left: 0, top: ground - 4, width: W, height: 8, background: GOLD, boxShadow: `0 0 20px ${GOLD}` }} />
    </AbsoluteFill>
  );
};

// ---------- scene 9: sensor icons ----------
const Sensors: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 20.35, 21.9, 0.2, 0.25);
  if (o <= 0) return null;
  const pts: [string, number, number, number][] = [["drop", 230, 760, 20.5], ["temp", 850, 880, 20.65], ["sun", 300, 1080, 20.8]];
  const hub: [number, number] = [560, 1180];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {pts.map(([, x, y, at], i) => { const p = eo(lin(t, at + 0.15, at + 0.6)); return <line key={i} x1={x} y1={y} x2={x + (hub[0] - x) * p} y2={y + (hub[1] - y) * p} stroke={GOLD} strokeWidth={3} strokeDasharray="8 10" />; })}
        <circle cx={hub[0]} cy={hub[1]} r={14 + 6 * Math.sin(t * 8)} fill={GOLD2} opacity={eo(lin(t, 20.9, 21.2))} />
      </svg>
      {pts.map(([n, x, y, at]) => <Icon key={n} name={n} x={x} y={y} size={124} p={lin(t, at, at + 0.35)} />)}
    </div>
  );
};

// ---------- scene 10: recycle drop ----------
const Cycle: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 21.85, 23.1, 0.2, 0.2);
  if (o <= 0) return null;
  const d = eio(lin(t, 21.9, 22.7));
  const cx = 540, cy = 980, r = 150;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={cx} cy={cy} r={r + 40} fill="rgba(10,22,13,.45)" />
      <g transform={`rotate(${t * 40} ${cx} ${cy})`}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${0.42 * d} 0.08 ${0.42 * d} 1`} />
        <path d={`M${cx + r} ${cy - 30} l 22 40 l -46 0 z`} fill={GOLD} opacity={d} />
        <path d={`M${cx - r} ${cy + 30} l -22 -40 l 46 0 z`} fill={GOLD} opacity={d} />
      </g>
      <path d={`M${cx} ${cy - 80} Q${cx - 62} ${cy} ${cx - 62} ${cy + 26} A62 62 0 0 0 ${cx + 62} ${cy + 26} Q${cx + 62} ${cy} ${cx} ${cy - 80}Z`} fill="#a8dcff" opacity={eo(lin(t, 22.1, 22.5))} transform={`translate(0 ${-10 * Math.sin(t * 4)})`} />
    </svg>
  );
};

// ---------- scene 11: growth curve ----------
const Curve: React.FC<{ t: number }> = ({ t }) => {
  const o = vis(t, 23.2, 25.15, 0.2, 0.3);
  if (o <= 0) return null;
  const d = eio(lin(t, 23.4, 24.6));
  const path = "M80 1360 C 260 1330 330 1250 440 1270 C 560 1290 600 1120 720 1100 C 830 1080 900 900 1000 820";
  const end = d >= 0.98;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs><filter id="cg"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GOLD} stopOpacity=".35" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient></defs>
      <path d={path + " L1000 1500 L80 1500Z"} fill="url(#ar)" opacity={d} />
      <path d={path} pathLength={1} strokeDasharray={`${d} 1`} stroke={GOLD2} strokeWidth={9} fill="none" strokeLinecap="round" filter="url(#cg)" />
      {end && <circle cx={1000} cy={820} r={16 + 6 * Math.sin(t * 9)} fill={GOLD2} filter="url(#cg)" />}
    </svg>
  );
};

// ---------- scene 12: three panels ----------
const PANELS = [
  { k: "c12a", at: 25.15, word: "DISCOVERIES", wAt: 26.46, focus: [0.62, 0.5] as [number, number], from: 0 },
  { k: "c12b", at: 27.45, word: "KNOWLEDGE", wAt: 27.9, focus: [0.5, 0.42] as [number, number], from: 0 },
  { k: "c12c", at: 29.0, word: "STORIES", wAt: 29.5, focus: [0.5, 0.5] as [number, number], from: 0 },
];
const Panels: React.FC<{ t: number }> = ({ t }) => {
  if (t < 25.0 || t > 30.8) return null;
  const merge = eio(lin(t, 30.25, 30.75));
  const ph = (H - 2 * 14) / 3;
  return (
    <AbsoluteFill style={{ background: DEEP, opacity: 1 - lin(t, 30.55, 30.8) }}>
      {PANELS.map((p, i) => {
        const slide = eo(lin(t, p.at, p.at + 0.45));
        if (slide <= 0) return null;
        const top = i * (ph + 14);
        const x = (1 - slide) * W;
        const full = H - top;
        const shrinkAt = i === 0 ? 27.45 : i === 1 ? 29.0 : 99;
        const hh = i === 2 ? ph : full - (full - ph) * eio(lin(t, shrinkAt, shrinkAt + 0.45));
        const wp = eo(lin(t, p.wAt, p.wAt + 0.35));
        return (
          <div key={p.k} style={{ position: "absolute", left: x, top, width: W, height: hh, overflow: "hidden" }}>
            <Media clip={C(p.k)} name={p.k} t0={p.at} len={6} w={W} h={hh} focus={p.focus} push={0.08} from={p.from} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.6) 100%)" }} />
            <div style={{ position: "absolute", left: 0, width: W, bottom: 40, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 92, letterSpacing: 4, color: i === 1 ? GOLD2 : "#fff", textShadow: shadow, opacity: wp, transform: `translateY(${(1 - wp) * 30}px)` }}>{p.word}</div>
          </div>
        );
      })}
      {/* gold separators */}
      {[1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 0, top: i * (ph + 14) - 14, width: W * eo(lin(t, PANELS[i].at, PANELS[i].at + 0.5)), height: 14, background: GOLD, opacity: 1 - merge }} />)}
    </AbsoluteFill>
  );
};

// ---------- scene 13: labels + "for you" circle ----------
const ForYou: React.FC<{ t: number }> = ({ t }) => {
  const a = 37.55, b = 39.75;
  if (t < a - 0.1 || t > b + 0.1) return null;
  const o = vis(t, a, b, 0.3, 0.3);
  const cx = 540, cy = 900, R = 300;
  const pts: [string, number][] = [["wheat", -90], ["leaf", 30], ["lens", 150]];
  const ring = eio(lin(t, a + 0.3, a + 1.2));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 47%, rgba(8,18,10,.25) 0%, rgba(8,18,10,.7) 70%)" }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={GOLD} strokeWidth={6} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(-90 ${cx} ${cy})`} />
        {pts.map(([, ang], i) => { const r1 = (ang * Math.PI) / 180, p = eo(lin(t, a + 0.15 * i + 0.2, a + 0.15 * i + 0.7)); return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(r1) * R * p} y2={cy + Math.sin(r1) * R * p} stroke={GOLD2} strokeWidth={3} strokeDasharray="6 10" />; })}
        <circle cx={cx} cy={cy} r={18} fill={GOLD2} opacity={ring} />
      </svg>
      {pts.map(([n, ang], i) => { const r1 = (ang * Math.PI) / 180; return <Icon key={n} name={n} x={cx + Math.cos(r1) * R} y={cy + Math.sin(r1) * R} size={150} p={lin(t, a + 0.15 * i, a + 0.15 * i + 0.4)} />; })}
    </div>
  );
};

// ---------- logo, brand reveal and end card ----------
const LOGO = "brand/aoa-logo.png";
const Brand: React.FC<{ t: number }> = ({ t }) => {
  const a = 39.55;
  if (t < a) return null;
  const ring = eio(lin(t, a, a + 0.8));
  const lp = back(lin(t, a + 0.35, a + 1.05));
  const sweep = lin(t, a + 0.9, a + 1.9);
  const toEnd = eio(lin(t, 44.55, 45.25)); // logo moves up + shrinks for the end card
  const size = 640 - toEnd * 180, cx = 540, cy = 860 - toEnd * 240;
  const dark = 0.55 + toEnd * 0.1;
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(10,22,13,${dark - 0.25}) 0%, rgba(6,14,8,${dark + 0.2}) 75%)`, opacity: lin(t, a, a + 0.5) }} />
      {/* soft gold glow behind the badge */}
      <div style={{ position: "absolute", left: cx - size * 0.75, top: cy - size * 0.75, width: size * 1.5, height: size * 1.5, borderRadius: "50%", background: `radial-gradient(circle, rgba(246,210,122,.45) 0%, rgba(246,210,122,0) 65%)`, opacity: lp }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={cx} cy={cy} r={size / 2 + 26} fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} strokeDasharray={`${ring} 1`} transform={`rotate(${-90 + (t - a) * 8} ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={size / 2 + 50} fill="none" stroke={GOLD2} strokeOpacity={0.5} strokeWidth={2} strokeDasharray="3 14" transform={`rotate(${-(t - a) * 10} ${cx} ${cy})`} opacity={ring} />
      </svg>
      <div style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, width: size, height: size, transform: `scale(${lp})`, opacity: clamp(lp * 1.5), borderRadius: "50%", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,.5)" }}>
        <Img src={staticFile(LOGO)} style={{ width: "100%", height: "100%" }} />
        {/* light sweep */}
        <div style={{ position: "absolute", top: -size * 0.2, left: -size + sweep * size * 2.6, width: size * 0.35, height: size * 1.4, transform: "rotate(20deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.55), rgba(255,255,255,0))", opacity: sweep > 0 && sweep < 1 ? 1 : 0 }} />
      </div>
    </>
  );
};
const Tagline: React.FC<{ t: number }> = ({ t }) => {
  if (t < 41.3 || t > 45.0) return null;
  const out = lin(t, 44.45, 44.8);
  const w = (at: number) => eo(lin(t, at, at + 0.35));
  const st = (p: number): React.CSSProperties => ({ display: "inline-block", opacity: p, transform: `translateY(${(1 - p) * 30}px)`, filter: `blur(${(1 - p) * 8}px)`, margin: "0 12px" });
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 1290, textAlign: "center", fontFamily: DISP, fontWeight: 700, color: "#fff", textShadow: shadow, opacity: 1 - out, lineHeight: 1.15 }}>
      <div style={{ fontSize: 84 }}><span style={st(w(41.38))}>Knowledge</span><span style={st(w(41.86))}>Today,</span></div>
      <div style={{ fontSize: 84, color: GOLD2 }}><span style={st(w(42.66))}>Agriculture</span><span style={st(w(43.46))}>Tomorrow.</span></div>
    </div>
  );
};
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = 44.9;
  if (t < a) return null;
  const h = back(lin(t, a, a + 0.5));
  const sub = back(lin(t, a + 0.35, a + 0.85));
  const click = lin(t, 46.6, 46.9), clicked = t > 46.75;
  const g1 = eo(lin(t, 45.58, 45.95)), g2 = eo(lin(t, 46.22, 46.6));
  return (
    <>
      {/* handle pill */}
      <div style={{ position: "absolute", left: 540 - 380, top: 1000, width: 760, height: 124, borderRadius: 62, background: "#fff", boxShadow: "0 14px 40px rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${h})`, opacity: clamp(h * 1.5) }}>
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 64, color: "#1d3a22", letterSpacing: 0.5 }}>@ArtofAgriculture</span>
      </div>
      {/* subscribe button */}
      <div style={{ position: "absolute", left: 540 - 290, top: 1170, width: 580, height: 132, borderRadius: 20, background: clicked ? "#3b3b3b" : "#d6312b", display: "flex", alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${sub * (1 - 0.08 * Math.sin(click * Math.PI))})`, opacity: clamp(sub * 1.5), boxShadow: "0 12px 30px rgba(0,0,0,.4)" }}>
        <svg width="60" height="60" viewBox="0 0 24 24"><path d="M12 22a2.5 2.5 0 0 0 2.4-2h-4.8a2.5 2.5 0 0 0 2.4 2Zm7-6V11a7 7 0 0 0-5-6.7V3.5a2 2 0 0 0-4 0v.8A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2Z" fill="#fff" /></svg>
        <span style={{ fontFamily: BODY, fontWeight: 800, fontSize: 60, color: "#fff", letterSpacing: 2 }}>{clicked ? "SUBSCRIBED" : "SUBSCRIBE"}</span>
      </div>
      {/* tap */}
      {t > 46.4 && t < 47.3 && <div style={{ position: "absolute", left: 700 - 40, top: 1260 - 40 + (1 - lin(t, 46.4, 46.65)) * 120, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.85)", boxShadow: "0 0 0 10px rgba(255,255,255,.3)", opacity: 1 - lin(t, 47.0, 47.3), transform: `scale(${1 - 0.25 * Math.sin(click * Math.PI)})` }} />}
      <div style={{ position: "absolute", left: 0, width: W, top: 1380, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 104, color: "#fff", textShadow: shadow, lineHeight: 1.1 }}>
        <div style={{ opacity: g1, transform: `translateY(${(1 - g1) * 30}px)` }}>Let's grow</div>
        <div style={{ opacity: g2, transform: `translateY(${(1 - g2) * 30}px)`, color: GOLD2 }}>together!</div>
      </div>
    </>
  );
};
/** drifting leaves on the end card */
const Leaves: React.FC<{ t: number }> = ({ t }) => {
  if (t < 44.8) return null;
  const o = lin(t, 44.8, 45.6);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const sp = 70 + (i % 4) * 30, x = ((i * 211) % W) + Math.sin(t * 1.3 + i) * 50, y = ((t - 44.8) * sp + i * 160) % (H + 100) - 50;
        return <path key={i} d="M0 0 Q18 -22 40 0 Q18 22 0 0Z" fill={i % 3 ? LEAF : GOLD} opacity={0.75} transform={`translate(${x} ${y}) rotate(${t * 60 + i * 40}) scale(${0.8 + (i % 3) * 0.4})`} />;
      })}
    </svg>
  );
};

// ---------- words ----------
const WORDS: { text: string; at: number; until: number; y: number; size?: number; color?: string }[] = [
  { text: "SCIENCE", at: 1.86, until: 2.7, y: 1330, size: 140, color: GOLD2 },
  { text: "INNOVATION", at: 2.66, until: 3.65, y: 1480, size: 118 },
  { text: "WONDER", at: 3.7, until: 4.75, y: 1480, size: 140, color: GOLD2 },
  { text: "PLANTS", at: 12.81, until: 13.45, y: 1380, size: 150 },
  { text: "NATURE", at: 14.73, until: 15.5, y: 1340, size: 150, color: GOLD2 },
  { text: "TECHNOLOGY", at: 16.89, until: 18.2, y: 1680, size: 112 },
  { text: "SOIL HEALTH", at: 18.53, until: 19.35, y: 1380, size: 120, color: GOLD2 },
  { text: "PLANT GROWTH", at: 19.57, until: 20.3, y: 1500, size: 110 },
  { text: "SMART", at: 20.45, until: 21.75, y: 1390, size: 140 },
  { text: "AGRICULTURE", at: 20.93, until: 21.75, y: 1540, size: 112, color: GOLD2 },
  { text: "SUSTAINABLE", at: 21.78, until: 23.05, y: 1380, size: 116, color: GOLD2 },
  { text: "PROFITABLE", at: 23.41, until: 25.1, y: 1560, size: 124 },
  { text: "CROPS", at: 24.01, until: 25.1, y: 1700, size: 124, color: GOLD2 },
  { text: "FARMER", at: 32.95, until: 33.85, y: 1400, size: 150 },
  { text: "NATURE LOVER", at: 33.83, until: 35.55, y: 1400, size: 118, color: GOLD2 },
  { text: "CURIOUS", at: 35.67, until: 37.55, y: 1400, size: 150 },
  { text: "FOR YOU", at: 38.47, until: 39.6, y: 1360, size: 150, color: GOLD2 },
];

// ---------- frame ----------
const Frame: React.FC<{ t: number; preview: boolean }> = ({ t, preview }) => {
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: DEEP }}>
        <Bed t={t} />
        <Shade o={t < 39.6 ? 0.9 : 0} from={0.55} strength={0.6} />
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 14%)" }} />
        <SeedRing t={t} />
        <SeedSection t={t} />
        <LightLeak t={t} at={6.7} />
        <Title t={t} />
        <LeafLines t={t} />
        <Magnifier t={t} />
        <Hud t={t} />
        <SoilDrops t={t} />
        <Growth t={t} />
        <Sensors t={t} />
        <Cycle t={t} />
        <Curve t={t} />
        <Rail t={t} />
        <Panels t={t} />
        <LightLeak t={t} at={30.45} />
        <ForYou t={t} />
        <Brand t={t} />
        <Tagline t={t} />
        <Leaves t={t} />
        <EndCard t={t} />
        {WORDS.map((w) => <Word key={w.text + w.at} t={t} {...w} />)}
        {!preview && <Audio src={staticFile("v18/mix.wav")} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

const V18Video: React.FC<{ times?: number[]; silent?: boolean }> = ({ times, silent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times || !!silent} />;
};

export const LOOK = [0.3, 1.2, 2.3, 3.0, 3.9, 4.6, 5.6, 6.7, 8.6, 11.3, 13.1, 14.9, 17.2, 18.8, 19.8, 21.2, 22.5, 24.4, 26.8, 28.4, 29.9, 31.2, 33.2, 34.6, 36.5, 38.9, 40.4, 42.2, 43.9, 45.3, 46.8, 49.5];
export const V18: React.FC = () => (
  <>
    <Composition id="V18-AoA-Intro" component={V18Video} durationInFrames={END * FPS} fps={FPS} width={W} height={H} />
    <Composition id="V18-AoA-Intro-Silent" component={V18Video} durationInFrames={END * FPS} fps={FPS} width={W} height={H} defaultProps={{ silent: true }} />
    <Composition id="V18-AoA-Intro-Look" component={V18Video} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
