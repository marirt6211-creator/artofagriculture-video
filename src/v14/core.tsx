// v14 · End card «هنر کشاورزی» — 10s vertical, 5 art styles sharing one timeline (words from Rashnow VO, tempo 1.1).
import React from "react";
import { AbsoluteFill, Easing, Img, continueRender, delayRender, interpolate, staticFile } from "remotion";
import words from "./words.json";

export const FPS = 30;
export const FRAMES = 300;
export const W = 1080;
export const H = 1920;

// ---------- fonts (extra to fonts.ts) ----------
const extra: [string, string][] = [
  ["V14Lalezar", "fonts/Lalezar-Regular.ttf"],
  ["V14Black", "fonts/Vazirmatn-Black.ttf"],
  ["V14Bold", "fonts/Vazirmatn-Bold.ttf"],
  ["V14Nastaliq", "fonts/NotoNastaliqUrdu.ttf"],
  ["V14Fredoka", "fonts/Fredoka.ttf"],
];
if (typeof document !== "undefined") {
  const h = delayRender("v14 fonts");
  Promise.all(extra.map(([f, file]) => new FontFace(f, `url('${staticFile(file)}')`).load().then((x) => document.fonts.add(x))))
    .then(() => continueRender(h))
    .catch((e) => { console.error(e); continueRender(h); });
}

// ---------- helpers ----------
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const k = (t: number, a: number, b: number, ease: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
export const back = Easing.out(Easing.back(1.8));
export const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
export const WT = words as { w: string; s: number; e: number }[];

// phases
export const P2 = 2.05;
export const P3 = 6.2;
export const TAP = 5.45; // «دنبال کن»
export const BALE = WT[12].s; // «بله»

export type Entry = "bleed" | "melt" | "ink" | "pop" | "geo";
export type Theme = {
  font: string;
  ink: string;
  key: string;
  accent: string;
  title: React.CSSProperties & { gap?: number };
  titleWord?: (i: number) => React.CSSProperties;
  pill: React.CSSProperties;
  handle: string;
  btn: [string, string]; // bg, text
  btnDone: string;
  entry: Entry;
  logoBack?: (t: number) => React.ReactNode;
  avatar: [string, string, string];
};


const Sprout: React.FC<{ s: number; c: string; t: number }> = ({ s, c, t }) => {
  const g = k(t, 0.0, 0.5, back);
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" style={{ transform: `scale(${0.3 + 0.7 * g}) rotate(${Math.sin(t * 4) * 6}deg)`, transformOrigin: "50% 100%" }}>
      <path d="M50 95 C50 75 50 60 50 48" stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M50 55 C30 55 16 42 14 22 C34 22 48 34 50 55Z" fill={c} />
      <path d="M50 48 C62 30 78 24 92 26 C88 46 72 56 50 52Z" fill={c} opacity="0.85" />
    </svg>
  );
};
export const Heart: React.FC<{ s: number; c: string; style?: React.CSSProperties }> = ({ s, c, style }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={style}>
    <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C40 8 46 14 50 22 C54 14 60 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88Z" fill={c} />
  </svg>
);

// title entry per style (no subtitles — only the brand name and handle are typed on screen)
const wordIn = (entry: Entry, p: number, i: number): React.CSSProperties => {
  switch (entry) {
    case "bleed": return { opacity: clamp(p * 1.5), filter: `blur(${(1 - p) * 14}px)`, transform: `scale(${0.85 + 0.15 * p})` };
    case "melt": return { opacity: clamp(p * 2), transform: `translateY(${(1 - p) * -260}px) scaleY(${1 + (1 - p) * 0.8})`, transformOrigin: "50% 0%" };
    case "ink": return { opacity: clamp(p * 1.3), filter: `blur(${(1 - p) * 10}px)`, transform: `scale(${1.25 - 0.25 * p})` };
    case "pop": return { opacity: clamp(p * 3), transform: `scale(${p}) rotate(${(1 - p) * (i ? 20 : -20)}deg)` };
    case "geo": return { clipPath: `inset(0 0 0 ${100 - 100 * clamp(p)}%)`, transform: `translateX(${(1 - p) * 120}px)` };
  }
};

const Burst: React.FC<{ t: number; at: number; c: string[]; n?: number; r?: number }> = ({ t, at, c, n = 10, r = 260 }) => {
  const p = k(t, at, at + 0.9);
  if (p <= 0 || p >= 1) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + rnd(i + at) * 0.4, d = r * (0.3 + 0.7 * p) * (0.7 + rnd(i * 3 + at) * 0.5);
        return <Heart key={i} s={34 + rnd(i) * 30} c={c[i % c.length]} style={{ position: "absolute", left: Math.cos(a) * d - 25, top: Math.sin(a) * d - 25, opacity: 1 - p, transform: `scale(${1 - p * 0.5}) rotate(${a * 50}deg)` }} />;
      })}
    </>
  );
};

export const Overlay: React.FC<{ t: number; th: Theme }> = ({ t, th }) => {
  const mv = k(t, 1.85, 2.45, Easing.inOut(Easing.cubic));
  const size = interpolate(mv, [0, 1], [600, 420]) * (0.72 + 0.28 * k(t, 0, 0.45, back));
  const cy = interpolate(mv, [0, 1], [660, 370]);
  const bob = Math.sin(t * 2.4) * 10;
  const beat = (a: number, d = 0.35, amt = 0.08) => (t > a && t < a + d ? Math.sin(((t - a) / d) * Math.PI) * amt : 0);
  const lb = beat(WT[12].s) + beat(9.05, 0.4, 0.1);

  // phase 1: the «like» heart
  const hIn = k(t, 0.2, 0.55, back), hOut = k(t, 1.85, 2.2, Easing.in(Easing.cubic));
  const hb = beat(WT[2].s, 0.3, 0.14) + beat(WT[4].s, 0.35, 0.16);

  // phase 2: title words
  const tw = [WT[7].s - 0.05, WT[8].s - 0.05];
  const titleY = 790;

  // bale pill
  const pIn = k(t, BALE - 0.1, BALE + 0.35, back);
  const tapP = clamp((t - TAP) / 0.6);
  const done = t > TAP + 0.08;
  const pillY = 1065;
  const handle = "@ArtofAgriculture";
  const typed = Math.round(clamp((t - BALE - 0.05) / 0.5) * handle.length);

  // share
  const plane = k(t, 6.5, 8.7, Easing.inOut(Easing.sin));
  const av = [WT[20].s, WT[21].s, WT[23].s];
  const ax = [800, 540, 280];
  const ay = 1320;
  const px = interpolate(plane, [0, 0.33, 0.66, 1], [880, 800, 540, 280]);
  const py = interpolate(plane, [0, 0.33, 0.66, 1], [pillY, ay - 130, ay - 150, ay - 130]) + Math.sin(plane * Math.PI * 3) * 30;

  return (
    <AbsoluteFill>
      {/* phase 1: big pulsing heart + sprouts + floating hearts */}
      {t < 2.3 && (
        <div style={{ position: "absolute", left: 540, top: 1250, opacity: 1 - hOut, transform: `scale(${1 - hOut * 0.6})` }}>
          <Burst t={t} at={WT[4].s} c={["#2fbf5a", th.key, th.accent]} n={12} r={300} />
          <Burst t={t} at={WT[2].s} c={["#2fbf5a", th.accent]} n={8} r={220} />
          <div style={{ position: "absolute", left: -150, top: -140, transform: `scale(${hIn * (1 + hb)})` }}>
            <Heart s={300} c="#2fbf5a" style={{ filter: `drop-shadow(${th.entry === "pop" || th.entry === "geo" ? "12px 14px 0 rgba(0,0,0,0.85)" : "0 16px 24px rgba(0,0,0,0.3)"})` }} />
            <div style={{ position: "absolute", left: 95, top: 70 }}><Sprout s={110} c="#fff" t={t - 0.3} /></div>
          </div>
          {[-1, 1].map((d, i) => {
            const p = k(t, 0.5 + i * 0.25, 1.0 + i * 0.25, back);
            return <div key={i} style={{ position: "absolute", left: d * 260 - 60, top: -40 - i * 30, transform: `scale(${p}) rotate(${d * 12 + Math.sin(t * 4 + i) * 8}deg)` }}><Sprout s={130} c={i ? th.accent : th.key} t={t} /></div>;
          })}
        </div>
      )}

      {/* logo */}
      <div style={{ position: "absolute", left: W / 2 - size / 2, top: cy - size / 2 + bob, width: size, height: size, transform: `scale(${1 + lb}) rotate(${beat(WT[7].s, 0.5, 4)}deg)` }}>
        {th.logoBack?.(t)}
        <Img src={staticFile("v14/logo.png")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.28))" }} />
      </div>

      {/* phase 2-3: animated brand name */}
      {t > tw[0] - 0.05 && (
        <div style={{ position: "absolute", left: 0, width: W, top: titleY - 110, height: 220, display: "flex", justifyContent: "center", alignItems: "center", gap: th.title.gap ?? 34, direction: "rtl" }}>
          {["هنر", "کشاورزی"].map((w, i) => {
            const p = k(t, tw[i], tw[i] + 0.5, th.entry === "pop" || th.entry === "melt" ? back : Easing.out(Easing.cubic));
            const wave = t > P3 ? Math.sin(t * 5 - i * 1.2) * 10 : 0;
            return (
              <span key={i} style={{ display: "inline-block", ...th.title, ...(th.titleWord?.(i) ?? {}), ...wordIn(th.entry, p, i), translate: `0 ${wave}px`, scale: `${1 + beat(9.05, 0.4, 0.08)}` }}>{w}</span>
            );
          })}
        </div>
      )}

      {/* bale pill with typed handle */}
      {t > BALE - 0.12 && (
        <div style={{ position: "absolute", left: 40, width: W - 80, top: pillY - 75, height: 150, transform: `scale(${pIn * (1 + beat(9.05, 0.4, 0.05))})`, display: "flex", justifyContent: "center" }}>
          <div style={{ ...th.pill, display: "flex", alignItems: "center", gap: 20, direction: "rtl", height: 150, padding: "0 22px 0 18px", position: "relative", overflow: "hidden" }}>
            <Img src={staticFile("v14/bale.png")} style={{ width: 104, height: 104, objectFit: "contain", transform: `rotate(${Math.sin(t * 5) * 6}deg)` }} />
            <span style={{ direction: "ltr", fontFamily: "V14Fredoka", fontWeight: 700, fontSize: 58, color: th.handle, letterSpacing: 0.5, width: 540, textAlign: "left", whiteSpace: "nowrap" }}>
              {handle.slice(0, typed)}<span style={{ opacity: typed < handle.length && Math.floor(t * 6) % 2 ? 1 : 0 }}>|</span>
            </span>
            <span style={{
              fontFamily: "V14Black", fontSize: 34, padding: "12px 22px", borderRadius: 40, whiteSpace: "nowrap",
              background: done ? th.btnDone : th.btn[0], color: th.btn[1],
              transform: `scale(${1 - beat(TAP - 0.1, 0.25, 0.14) + (done ? beat(TAP + 0.1, 0.3, 0.12) : 0)})`,
            }}>{done ? "✓ دنبال شد" : "+ دنبال کن"}</span>
            {tapP > 0 && tapP < 1 && (
              <div style={{ position: "absolute", left: 90 - 100 * tapP, top: 75 - 100 * tapP, width: 200 * tapP, height: 200 * tapP, borderRadius: "50%", background: "rgba(255,255,255,0.6)", opacity: 1 - tapP }} />
            )}
          </div>
        </div>
      )}
      {t > TAP - 0.5 && t < TAP + 0.7 && (
        <div style={{ position: "absolute", left: 130 + (1 - k(t, TAP - 0.5, TAP - 0.05)) * -200, top: pillY + 10 + (1 - k(t, TAP - 0.5, TAP - 0.05)) * 200, opacity: 1 - k(t, TAP + 0.4, TAP + 0.7), transform: `scale(${t > TAP - 0.05 && t < TAP + 0.12 ? 0.88 : 1})`, transformOrigin: "20% 0%" }}>
          <svg width="120" height="140" viewBox="0 0 60 70"><path d="M20 4 C24 4 26 7 26 10 L26 30 L42 33 C49 34 52 38 51 45 L48 60 C47 65 43 68 38 68 L24 68 C20 68 17 66 15 63 L5 46 C3 42 5 38 9 38 C12 38 14 40 15 42 L14 42 L14 10 C14 7 16 4 20 4Z" fill="#fff" stroke="#222" strokeWidth="3" /></svg>
        </div>
      )}
      {done && t < TAP + 1.2 && <div style={{ position: "absolute", left: 220, top: pillY }}><Burst t={t} at={TAP + 0.05} c={["#2fbf5a", th.accent]} n={8} r={160} /></div>}

      {/* phase 3: friends + paper plane + hearts */}
      {t > 6.3 && ax.map((x, i) => {
        const p = k(t, av[i] - 0.1, av[i] + 0.25, back);
        const h = k(t, av[i] + 0.1, av[i] + 0.9);
        return (
          <div key={i} style={{ position: "absolute", left: x - 85, top: ay - 85, width: 170, height: 170, transform: `scale(${p * (1 + beat(9.05 + i * 0.08, 0.35, 0.12))}) translateY(${Math.sin(t * 3 + i) * 6}px)` }}>
            <svg width="170" height="170" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="47" fill={th.avatar[i]} stroke="#fff" strokeWidth="4" />
              <circle cx="50" cy="40" r="15" fill="#fff" opacity="0.92" />
              <path d="M24 82 C26 62 38 58 50 58 C62 58 74 62 76 82 Z" fill="#fff" opacity="0.92" />
            </svg>
            <Heart s={64} c="#2fbf5a" style={{ position: "absolute", right: -6, top: -10 - h * 60, opacity: 1 - k(t, av[i] + 0.7, av[i] + 1.2), transform: `scale(${k(t, av[i] + 0.05, av[i] + 0.3, back)})` }} />
          </div>
        );
      })}
      {plane > 0 && plane < 1 && (
        <div style={{ position: "absolute", left: px - 55, top: py - 55, transform: `rotate(${-20 - 25 * Math.cos(plane * Math.PI * 3)}deg) scale(${0.6 + 0.4 * k(t, 6.5, 6.8, back)})` }}>
          <svg width="110" height="110" viewBox="0 0 100 100"><path d="M92 10 L8 44 L36 54 L42 86 L56 62 L80 76 Z" fill="#fff" stroke={th.key} strokeWidth="5" strokeLinejoin="round" /><path d="M36 54 L92 10 L56 62" fill="none" stroke={th.key} strokeWidth="4" /></svg>
        </div>
      )}
      <div style={{ position: "absolute", left: 540, top: 1320 }}><Burst t={t} at={9.05} c={["#2fbf5a", th.key, th.accent]} n={16} r={480} /></div>
    </AbsoluteFill>
  );
};

export const Shell: React.FC<{ t: number; th: Theme; bg: React.ReactNode }> = ({ t, th, bg }) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <AbsoluteFill style={{ transform: `scale(${1.04 + 0.04 * (t / 10)})` }}>{bg}</AbsoluteFill>
    <Overlay t={t} th={th} />
  </AbsoluteFill>
);
