// v21 · Art of Agriculture — YouTube Short: "Wind makes plants stronger" (Thigmomorphogenesis), EN, 9:16.
// NFP footage (Pixabay / Coverr / Mixkit, src/v21/footage.json) + the user's own two-tree image and animation
// (uploads/v21) + green/gold motion graphics. All times from the narration (src/v21/vo.json, Sarah).
// Channel rules: no small text, only big keywords; moving logo watermark + faint text mark; short end hold.
import React from "react";
import { AbsoluteFill, Audio, Composition, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageTime, Media, type Manifest } from "../footage/footage";
import manJson from "./footage.json";
import voJson from "./vo.json";

const MAN = manJson as unknown as Manifest;
type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as unknown as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const W = 1080, H = 1920, FPS = 30;
const GOLD = "#e9b949", GOLD2 = "#f6d27a", LEAF = "#8fdc74", WARN = "#ff7a4d", DEEP = "#0d1a10";
const DISP = "Sora", BODY = "InterV";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z']/g, "");
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;
const Wd = (n: number, word: string) => VO.words.find((w) => w.line === n && norm(w.w) === norm(word))?.s ?? S(n);
const LAST = VO.words[VO.words.length - 1].e;
const END = +(LAST + 2.2).toFixed(2);

// ---------- fonts ----------
const fh = delayRender("v21 fonts");
Promise.all([
  new FontFace(DISP, `url('${staticFile("fonts/Sora-Bold.woff2")}') format('woff2')`, { weight: "700" }).load(),
  new FontFace(BODY, `url('${staticFile("fonts/Inter.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); }).catch((e) => { console.error(e); continueRender(fh); });

// ---------- helpers ----------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x: number) => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const vis = (t: number, a: number, b: number, fi = 0.25, fo = 0.25) => Math.min(lin(t, a, a + fi), 1 - lin(t, b - fo, b));
const C = (k: string) => MAN.clips[k];
const shadow = "0 4px 18px rgba(0,0,0,.7), 0 1px 3px rgba(0,0,0,.6)";

// ---------- footage ----------
type Sh = { k: string; at: number; until: number; focus?: [number, number]; pan?: [number, number]; zoom?: number; push?: number; from?: number; rate?: number; shake?: number };
const SHOTS: Sh[] = [
  { k: "s01a", at: 0, until: S(2) - 0.05, push: 0.12, rate: 0.8 },
  { k: "s02a", at: S(2) - 0.2, until: S(3) + 0.05, zoom: 1.0, push: 0.05 },
  { k: "s03a", at: S(3) - 0.1, until: S(4) - 0.05, zoom: 1.0, push: 0.03, rate: 0.9 },
  { k: "s04a", at: S(4) - 0.2, until: S(5) - 0.05, push: 0.1 },
  { k: "s05a", at: S(5) - 0.2, until: S(6) - 0.05, push: 0.08 },
  { k: "s06a", at: S(6) - 0.2, until: S(7) - 0.05, push: 0.06, focus: [0.57, 0.3], pan: [0.04, 0], from: 0.3 },
  { k: "s07a", at: S(7) - 0.2, until: Wd(7, "and"), push: 0.1 },
  { k: "s07b", at: Wd(7, "and") - 0.15, until: S(8) - 0.05, push: 0.08 },
  { k: "s08a", at: S(8) - 0.2, until: S(9) - 0.05, zoom: 1.02, push: 0.08 },
  { k: "s09a", at: S(9) - 0.2, until: S(10) - 0.05, push: 0.06 },
  { k: "s10a", at: S(10) - 0.2, until: Wd(10, "damage"), push: 0.06, from: 8, shake: 1 },
  { k: "s10b", at: Wd(10, "damage") - 0.15, until: S(11) - 0.05, push: 0.08 },
  { k: "s11a", at: S(11) - 0.2, until: S(12) - 0.05, push: 0.07 },
  { k: "s12a", at: S(12) - 0.2, until: S(13) - 0.05, push: 0.1, rate: 0.85 },
  { k: "s13a", at: S(13) - 0.2, until: END, push: 0.06 },
];
const XF = 0.25;

const Bed: React.FC<{ t: number }> = ({ t }) => (
  <>
    {SHOTS.filter((s) => t >= s.at - 0.05 && t < s.until + 0.05).map((s) => {
      const o = lin(t, s.at, s.at + XF);
      const sh = s.shake ? Math.sin(t * 37) * 6 + Math.sin(t * 23) * 4 : 0;
      return (
        <div key={s.k} style={{ position: "absolute", inset: 0, opacity: s.at === 0 ? 1 : o, transform: `translate(${sh}px, ${sh * 0.5}px)` }}>
          <Media clip={C(s.k)} name={s.k} t0={s.at} len={s.until - s.at} w={W} h={H} focus={s.focus ?? C(s.k)?.focus} pan={s.pan} zoom={s.zoom ?? 1.06} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="clean" />
        </div>
      );
    })}
  </>
);

const Shade: React.FC<{ t: number }> = ({ t }) => {
  const o = 1 - lin(t, S(13) - 0.2, S(13) + 0.4) * 0.2;
  return (
    <>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 16%, rgba(0,0,0,0) 52%, rgba(0,0,0,.55) 100%)", opacity: o }} />
    </>
  );
};

// ---------- kinetic words ----------
const Word: React.FC<{ t: number; text: string; at: number; until: number; y: number; size?: number; color?: string; track?: number }> = ({ t, text, at, until, y, size = 130, color = "#fff", track = 4 }) => {
  if (t < at - 0.1 || t > until + 0.1) return null;
  const p = eo(lin(t, at, at + 0.35));
  const out = lin(t, until - 0.22, until);
  const drift = (t - at) * 6;
  return (
    <div style={{ position: "absolute", left: 40, width: W - 80, top: y, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: size, color, letterSpacing: track, lineHeight: 1.05,
      textShadow: shadow, opacity: p * (1 - out), transform: `translateY(${(1 - p) * 50 - drift + out * -20}px) scale(${0.92 + 0.08 * p})`, filter: `blur(${(1 - p) * 10 + out * 6}px)` }}>
      {text}
    </div>
  );
};

/** pill label sitting on a half of the split-screen image */
const Pill: React.FC<{ t: number; text: string; at: number; until: number; y: number; icon: "calm" | "wind"; color?: string }> = ({ t, text, at, until, y, icon, color = "#fff" }) => {
  const o = vis(t, at, until, 0.3, 0.25);
  if (o <= 0) return null;
  const p = back(lin(t, at, at + 0.45));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: y, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "18px 40px", borderRadius: 80, background: "rgba(8,20,10,.62)", border: `3px solid ${icon === "wind" ? GOLD : "rgba(255,255,255,.55)"}`, transform: `scale(${0.7 + 0.3 * p})`, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          {icon === "calm" ? (
            <g stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none"><line x1="12" y1="36" x2="60" y2="36" /><circle cx="36" cy="36" r="28" opacity=".5" /></g>
          ) : (
            <g stroke={GOLD2} strokeWidth="5" strokeLinecap="round" fill="none">
              {[0, 1, 2].map((i) => { const d = ((t * 60 + i * 18) % 40) - 10; return <path key={i} d={`M${6 + d * 0.3} ${20 + i * 16} C ${30} ${12 + i * 16}, ${44} ${30 + i * 16}, ${66} ${18 + i * 16}`} opacity={0.6 + 0.4 * Math.sin(t * 6 + i)} />; })}
            </g>
          )}
        </svg>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 62, letterSpacing: 3, color }}>{text}</div>
      </div>
    </div>
  );
};

// ---------- motion graphics ----------
/** flowing wind streaks across the frame; k = strength */
const Wind: React.FC<{ t: number; a: number; b: number; k?: number; y0?: number; y1?: number }> = ({ t, a, b, k = 1, y0 = 250, y1 = 1500 }) => {
  const o = vis(t, a, b, 0.5, 0.5);
  if (o <= 0) return null;
  const n = Math.round(7 + 9 * k);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs>
        <linearGradient id="wg" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
      </defs>
      {Array.from({ length: n }).map((_, i) => {
        const sp = (420 + (i % 5) * 120) * (0.8 + k * 0.7);
        const len = 240 + (i % 4) * 90;
        const x = ((t * sp + i * 397) % (W + len * 2)) - len;
        const y = y0 + ((i * 173) % (y1 - y0));
        const amp = 14 + (i % 3) * 8;
        const ph = t * 3 + i;
        return <path key={i} d={`M${x} ${y} q ${len / 4} ${-amp * Math.sin(ph)} ${len / 2} 0 t ${len / 2} 0`} stroke="url(#wg)" strokeWidth={2.5 + (i % 3)} fill="none" strokeLinecap="round" opacity={0.35 + 0.25 * k} />;
      })}
    </svg>
  );
};

/** "they sense": touch-sensing pulse rings on the plant */
const Sense: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(5, "sense") - 0.1, b = S(6) - 0.1;
  const o = vis(t, a, b, 0.25, 0.3);
  if (o <= 0) return null;
  const cx = 540, cy = 820;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      {[0, 1, 2, 3].map((i) => { const p = ((t - a) * 0.8 + i / 4) % 1; return <circle key={i} cx={cx} cy={cy} r={40 + p * 360} fill="none" stroke={GOLD2} strokeWidth={6 * (1 - p)} opacity={(1 - p) * 0.9} />; })}
      <circle cx={cx} cy={cy} r={22 + 4 * Math.sin(t * 8)} fill={GOLD2} opacity=".95" />
    </svg>
  );
};

/** THIGMO · MORPHO · GENESIS title */
const Thigmo: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(6, "thigmomorphogenesis") - 0.08, b = S(7) + 0.35;
  const o = vis(t, a, b, 0.2, 0.3);
  if (o <= 0) return null;
  const parts: [string, string][] = [["THIGMO", "touch"], ["MORPHO", "shape"], ["GENESIS", "growth"]];
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: 520, opacity: o }}>
      <div style={{ position: "absolute", left: 60, width: W - 120, top: -80, height: 860, borderRadius: 40, background: "rgba(8,20,10,.55)" }} />
      <div style={{ position: "absolute", left: 90, width: W - 180, top: -40, height: 4, background: GOLD, transform: `scaleX(${eio(lin(t, a, a + 0.6))})` }} />
      {parts.map(([p, g], i) => {
        const q = eo(lin(t, a + i * 0.28, a + i * 0.28 + 0.4));
        return (
          <div key={p} style={{ position: "relative", height: 250, textAlign: "center", opacity: q, transform: `translateX(${(1 - q) * (i % 2 ? 80 : -80)}px)` }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 150, letterSpacing: 6, color: i === 1 ? GOLD2 : "#fff", textShadow: shadow, lineHeight: 1 }}>{p}</div>
            <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 60, letterSpacing: 12, color: LEAF, textShadow: "0 3px 10px rgba(0,0,0,.95), 0 0 22px rgba(0,0,0,.8)", marginTop: 4, opacity: eo(lin(t, a + 0.9 + i * 0.25, a + 1.3 + i * 0.25)) }}>{g.toUpperCase()}</div>
          </div>
        );
      })}
    </div>
  );
};

/** two stems: calm (thin, tall) vs. wind (short, thick) */
const Stems: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(7, "plants"), b = Wd(7, "and") + 0.1;
  const o = vis(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const g = eio(lin(t, a + 0.2, Wd(7, "thicker") + 0.3));
  const panel = back(lin(t, a, a + 0.5));
  const stem = (x: number, hgt: number, wdt: number, sway: number) => {
    const top = 1180 - hgt * g;
    return (
      <g>
        <path d={`M${x - wdt / 2} 1180 Q ${x - wdt / 2 + sway} ${(1180 + top) / 2} ${x - wdt / 4 + sway * 1.6} ${top} L ${x + wdt / 4 + sway * 1.6} ${top} Q ${x + wdt / 2 + sway} ${(1180 + top) / 2} ${x + wdt / 2} 1180 Z`} fill={LEAF} stroke="#2f6b2a" strokeWidth="4" />
        {g > 0.6 && [0.55, 0.8].map((k, i) => <ellipse key={i} cx={x + sway * 1.6 * k + (i ? 30 : -30)} cy={1180 - hgt * k * g} rx={46} ry={18} fill={LEAF} opacity={(g - 0.6) * 2.5} transform={`rotate(${i ? -25 : 25} ${x + sway * 1.6 * k + (i ? 30 : -30)} ${1180 - hgt * k * g})`} />)}
      </g>
    );
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <rect x={110} y={560} width={860} height={700} rx={40} fill="rgba(8,20,10,.72)" stroke={GOLD} strokeWidth="3" transform={`translate(540 910) scale(${panel}) translate(-540 -910)`} />
      <line x1={170} y1={1180} x2={910} y2={1180} stroke="#8a6a3a" strokeWidth="8" strokeLinecap="round" />
      {stem(340, 520, 26, Math.sin(t * 1.2) * 4)}
      {stem(740, 330, 74, Math.sin(t * 3) * 14)}
      <g fontFamily={DISP} fontWeight={700} fontSize={46} textAnchor="middle" fill="#fff">
        <text x={340} y={630} opacity={g}>NO WIND</text>
        <text x={740} y={630} fill={GOLD2} opacity={g}>WIND</text>
      </g>
      {/* wind lines into the right stem */}
      {[0, 1, 2].map((i) => { const d = ((t * 1.4 + i / 3) % 1); return <path key={i} d={`M${560 + d * 60} ${900 + i * 50} q 40 -14 80 0 t 80 0`} stroke="#fff" strokeWidth="4" fill="none" opacity={g * (1 - d)} strokeLinecap="round" />; })}
    </svg>
  );
};

/** stem cross-section: growth rings drawing = stronger supporting tissue */
const Rings: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(7, "stronger"), b = S(8) - 0.15;
  const o = vis(t, a, b, 0.3, 0.3);
  if (o <= 0) return null;
  const cx = 540, cy = 760;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <circle cx={cx} cy={cy} r={250 * back(lin(t, a, a + 0.5))} fill="rgba(8,20,10,.6)" stroke={GOLD} strokeWidth="4" />
      {Array.from({ length: 7 }).map((_, i) => {
        const r = 40 + i * 30;
        const d = eo(lin(t, a + 0.3 + i * 0.15, a + 0.7 + i * 0.15));
        const L = 2 * Math.PI * r;
        return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={i % 2 ? GOLD2 : LEAF} strokeWidth={6 + i * 1.2} strokeDasharray={L} strokeDashoffset={L * (1 - d)} transform={`rotate(-90 ${cx} ${cy})`} opacity=".9" />;
      })}
    </svg>
  );
};

/** dumbbell icon for "gentle workout" */
const Dumbbell: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(9, "gentle"), b = S(10) - 0.1;
  const o = vis(t, a, b, 0.2, 0.25);
  if (o <= 0) return null;
  const p = back(lin(t, a, a + 0.45));
  const lift = Math.sin((t - a) * 6) * 30;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <g transform={`translate(540 ${760 + lift}) scale(${p}) rotate(${Math.sin((t - a) * 6) * 8})`}>
        <rect x={-150} y={-12} width={300} height={24} rx={12} fill="#fff" />
        {[-1, 1].map((s) => <g key={s}><rect x={s * 150 - 30} y={-70} width={60} height={140} rx={16} fill={GOLD} stroke="#fff" strokeWidth="5" /><rect x={s * 105 - 16} y={-50} width={32} height={100} rx={10} fill={GOLD2} stroke="#fff" strokeWidth="4" /></g>)}
      </g>
    </svg>
  );
};

/** warning triangle for too much wind */
const Warn: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd(10, "too") - 0.1, b = S(11) - 0.1;
  const o = vis(t, a, b, 0.2, 0.3);
  if (o <= 0) return null;
  const p = back(lin(t, a, a + 0.45));
  const pulse = 1 + 0.06 * Math.sin(t * 10);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: o }}>
      <g transform={`translate(540 640) scale(${p * pulse})`}>
        <path d="M0 -130 L 150 120 L -150 120 Z" fill="rgba(20,8,4,.55)" stroke={WARN} strokeWidth="14" strokeLinejoin="round" />
        <rect x={-11} y={-60} width={22} height={110} rx={10} fill={WARN} />
        <circle cx={0} cy={82} r={13} fill={WARN} />
      </g>
    </svg>
  );
};

/** soft light leak at a cut */
const Leak: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  const p = 1 - Math.abs(lin(t, at - 0.35, at + 0.35) * 2 - 1);
  if (p <= 0) return null;
  return <AbsoluteFill style={{ background: `radial-gradient(circle at 80% 20%, rgba(255,214,120,${0.55 * p}), rgba(255,180,60,0) 60%)`, mixBlendMode: "screen" }} />;
};

// ---------- end card ----------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const a = S(13) - 0.1;
  if (t < a) return null;
  const p = back(lin(t, a, a + 0.6));
  const f1 = eo(lin(t, Wd(13, "art") - 0.1, Wd(13, "art") + 0.35));
  const f2 = eo(lin(t, Wd(13, "secrets"), Wd(13, "secrets") + 0.4));
  const ring = eio(lin(t, a, a + 1.2));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, rgba(8,20,10,.15), rgba(8,20,10,.78) 70%)`, opacity: eo(lin(t, a, a + 0.6)) }} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={700} r={300} fill="none" stroke={GOLD} strokeWidth="5" strokeDasharray={1885} strokeDashoffset={1885 * (1 - ring)} transform="rotate(-90 540 700)" />
        {Array.from({ length: 24 }).map((_, i) => { const ang = (i / 24) * Math.PI * 2 + t * 0.3; return <circle key={i} cx={540 + Math.cos(ang) * 330} cy={700 + Math.sin(ang) * 330} r={4} fill={GOLD2} opacity={ring * (0.4 + 0.6 * ((i % 3) / 2))} />; })}
      </svg>
      <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: 540 - 250, top: 700 - 250, width: 500, height: 500, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, filter: "drop-shadow(0 10px 30px rgba(0,0,0,.6))" }} />
      <div style={{ position: "absolute", left: 0, width: W, top: 1090, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 64, letterSpacing: 10, color: GOLD2, textShadow: shadow, opacity: eo(lin(t, Wd(13, "follow") - 0.05, Wd(13, "follow") + 0.3)) }}>FOLLOW</div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1180, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 96, color: "#fff", textShadow: shadow, opacity: f1, transform: `translateY(${(1 - f1) * 30}px)` }}>
        Art<span style={{ color: GOLD2 }}> of </span>Agriculture
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1330, textAlign: "center", fontFamily: BODY, fontWeight: 700, fontSize: 52, color: "#fff", letterSpacing: 2, textShadow: shadow, opacity: f2 }}>@ArtofAgriculture</div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1460, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 60, color: LEAF, letterSpacing: 4, textShadow: shadow, opacity: f2, transform: `translateY(${(1 - f2) * 30}px)` }}>SECRETS OF THE PLANT WORLD</div>
    </AbsoluteFill>
  );
};

// ---------- watermark (channel rule) ----------
const WM_SPOTS = [
  { at: 0, x: W - 160, y: 60 },
  { at: S(4) - 0.2, x: 50, y: 60 },
  { at: S(7) - 0.2, x: W - 160, y: H - 330 },
  { at: S(9) - 0.2, x: 50, y: H - 330 },
  { at: S(11) - 0.2, x: W - 160, y: 60 },
];
const WM_OFF = S(13) - 0.4;
const spotAt = (t: number) => { let i = 0; for (let k = 0; k < WM_SPOTS.length; k++) if (t >= WM_SPOTS[k].at) i = k; return i; };
const Watermark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  const i = spotAt(t), s = WM_SPOTS[i], next = WM_SPOTS[i + 1];
  const fin = i === 0 ? lin(t, 0.8, 1.4) : lin(t, s.at, s.at + 0.6);
  const fout = Math.max(next ? lin(t, next.at - 0.4, next.at) : 0, lin(t, WM_OFF, WM_OFF + 0.4));
  const o = Math.min(fin, 1 - fout);
  if (o <= 0) return null;
  return <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: s.x, top: s.y, width: 120, height: 120, opacity: 0.9 * o, transform: `scale(${0.9 + 0.1 * eo(fin)})`, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.55))" }} />;
};
const TextMark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  const i = spotAt(t), s = WM_SPOTS[i], next = WM_SPOTS[i + 1];
  const end = next ? next.at : WM_OFF;
  const o = Math.min(lin(t, s.at + 0.3, s.at + 1.2), 1 - lin(t, end - 0.5, end));
  if (o <= 0) return null;
  const top = s.y < H / 2;
  const p = lin(t, s.at, end);
  const fromLeft = s.x > W / 2;
  const x = fromLeft ? 50 + p * 380 : W - 50 - 560 - p * 380;
  return (
    <div style={{ position: "absolute", left: x, top: top ? H - 300 : 80, width: 560, textAlign: fromLeft ? "left" : "right", fontFamily: DISP, fontWeight: 700, fontSize: 38, letterSpacing: 3, color: "#fff", opacity: 0.42 * o, textShadow: "0 2px 8px rgba(0,0,0,.65)" }}>
      Art<span style={{ fontWeight: 400, color: GOLD2 }}>of</span>Agriculture
    </div>
  );
};

// ---------- words ----------
const WORDS: { text: string; at: number; until: number; y: number; size?: number; color?: string }[] = [
  { text: "GENTLE BREEZE", at: Wd(1, "gentle"), until: Wd(1, "grow"), y: 1300, size: 120 },
  { text: "STRONGER?", at: Wd(1, "stronger"), until: S(2) - 0.05, y: 1300, size: 140, color: GOLD2 },
  { text: "IDENTICAL", at: Wd(2, "identical"), until: S(3) - 0.05, y: 890, size: 140, color: GOLD2 },
  { text: "STRONGER", at: Wd(4, "stronger"), until: S(5) - 0.1, y: 1250, size: 160, color: GOLD2 },
  { text: "STRUCTURE", at: Wd(4, "structure"), until: S(5) - 0.1, y: 1430, size: 130 },
  { text: "SWAY", at: Wd(5, "sway"), until: Wd(5, "they") - 0.05, y: 1300, size: 170 },
  { text: "MECHANICAL", at: Wd(5, "mechanical"), until: S(6) - 0.05, y: 1300, size: 120 },
  { text: "STIMULATION", at: Wd(5, "stimulation"), until: S(6) - 0.05, y: 1440, size: 120, color: GOLD2 },
  { text: "BIOLOGICAL", at: Wd(6, "biological"), until: Wd(6, "thigmomorphogenesis") - 0.1, y: 1300, size: 124 },
  { text: "RESPONSE", at: Wd(6, "response"), until: Wd(6, "thigmomorphogenesis") - 0.1, y: 1440, size: 124, color: GOLD2 },
  { text: "SHORTER", at: Wd(7, "shorter"), until: Wd(7, "and"), y: 1330, size: 124 },
  { text: "THICKER STEMS", at: Wd(7, "thicker"), until: Wd(7, "and"), y: 1460, size: 116, color: GOLD2 },
  { text: "STRONGER", at: Wd(7, "stronger"), until: Wd(7, "helping"), y: 1120, size: 130 },
  { text: "TISSUES", at: Wd(7, "tissues"), until: Wd(7, "helping"), y: 1260, size: 130, color: GOLD2 },
  { text: "WITHSTAND", at: Wd(7, "withstand"), until: S(8) - 0.1, y: 1120, size: 130 },
  { text: "STRESS", at: Wd(7, "stress"), until: S(8) - 0.1, y: 1260, size: 130, color: GOLD2 },
  { text: "ROOTS", at: Wd(8, "roots"), until: Wd(8, "in") , y: 1380, size: 170, color: GOLD2 },
  { text: "ADAPT", at: Wd(8, "adjust"), until: S(9) - 0.1, y: 1560, size: 150 },
  { text: "GENTLE", at: Wd(9, "gentle"), until: S(10) - 0.1, y: 1080, size: 140 },
  { text: "WORKOUT", at: Wd(9, "workout"), until: S(10) - 0.1, y: 1230, size: 160, color: GOLD2 },
  { text: "TOO MUCH WIND", at: Wd(10, "too"), until: Wd(10, "damage") - 0.05, y: 880, size: 116, color: WARN },
  { text: "DAMAGE", at: Wd(10, "damage"), until: S(11) - 0.1, y: 880, size: 160, color: WARN },
  { text: "A LITTLE", at: Wd(11, "little"), until: Wd(11, "resilient") - 0.05, y: 1280, size: 120 },
  { text: "MOVEMENT", at: Wd(11, "movement"), until: Wd(11, "resilient") - 0.05, y: 1410, size: 140, color: GOLD2 },
  { text: "RESILIENT", at: Wd(11, "resilient"), until: S(12) - 0.1, y: 1330, size: 160, color: GOLD2 },
  { text: "NATURE", at: Wd(12, "nature"), until: S(13) - 0.15, y: 1240, size: 150 },
  { text: "BUILDS STRENGTH", at: Wd(12, "building"), until: S(13) - 0.15, y: 1390, size: 112, color: GOLD2 },
];

// ---------- frame ----------
const Frame: React.FC<{ t: number; preview: boolean }> = ({ t, preview }) => (
  <FootageTime.Provider value={t}>
    <AbsoluteFill style={{ background: DEEP }}>
      <Bed t={t} />
      <Shade t={t} />
      <Wind t={t} a={0.2} b={S(2) - 0.05} k={0.5} />
      <Wind t={t} a={Wd(5, "sway") - 0.2} b={Wd(5, "they")} k={0.7} />
      <Wind t={t} a={Wd(9, "nature")} b={S(10) - 0.05} k={0.5} y0={200} y1={900} />
      <Wind t={t} a={Wd(10, "too")} b={S(11) - 0.05} k={1.6} />
      <Pill t={t} text="NO WIND" at={Wd(3, "windless") - 0.1} until={S(4) - 0.1} y={300} icon="calm" />
      <Pill t={t} text="GENTLE BREEZE" at={Wd(3, "gentle") - 0.1} until={S(4) - 0.1} y={1260} icon="wind" color={GOLD2} />
      <Leak t={t} at={S(4) - 0.1} />
      <Sense t={t} />
      <Thigmo t={t} />
      <Stems t={t} />
      <Rings t={t} />
      <Dumbbell t={t} />
      <Warn t={t} />
      <Leak t={t} at={S(11) - 0.1} />
      <EndCard t={t} />
      {WORDS.map((w) => <Word key={w.text + w.at} t={t} {...w} />)}
      <Watermark t={t} />
      <TextMark t={t} />
      {!preview && <Audio src={staticFile("v21/mix.wav")} />}
    </AbsoluteFill>
  </FootageTime.Provider>
);

const V21Video: React.FC<{ times?: number[]; silent?: boolean }> = ({ times, silent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times || !!silent} />;
};

export const LOOK = [
  0.5, Wd(1, "gentle") + 0.4, Wd(1, "stronger") + 0.5, Wd(2, "identical") + 0.5, Wd(3, "windless") + 0.6, Wd(3, "breeze") + 0.5,
  Wd(4, "structure") + 0.5, Wd(5, "sway") + 0.3, Wd(5, "stimulation") + 0.5, Wd(6, "response") + 0.3, Wd(6, "thigmomorphogenesis") + 1.4,
  Wd(7, "thicker") + 0.5, Wd(7, "tissues") + 0.6, Wd(7, "stress") + 0.4, Wd(8, "roots") + 0.4, Wd(8, "adjust") + 1.5,
  Wd(9, "workout") + 0.3, Wd(10, "too") + 0.5, Wd(10, "damage") + 0.8, Wd(11, "movement") + 0.4, Wd(11, "resilient") + 0.4,
  Wd(12, "building") + 0.3, Wd(13, "art") + 0.5, END - 0.3,
].map((x) => +x.toFixed(2));
export const V21: React.FC = () => (
  <>
    <Composition id="V21-Wind" component={V21Video} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="V21-Wind-Silent" component={V21Video} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} defaultProps={{ silent: true }} />
    <Composition id="V21-Wind-Look" component={V21Video} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
