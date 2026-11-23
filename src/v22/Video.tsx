// v22 · Art of Agriculture — YouTube Short: "What is NPK?" (first 55 s of the NPK narration), EN, 9:16.
// Look: the user's reference (uploads/v22/ref.mp4) — light paper background, big flat colour circles behind cut-out
// subjects, two-tier kinetic text (small italic + big bold), keyword in a coloured box with corner handles, icons that
// pop in one after another, growing bar chart, whip transitions. Recoloured to the channel (green / gold) with one
// colour per nutrient (N green · P amber · K blue). NFP footage (src/v22/footage.json) alternates with motion-only scenes.
// All times from the narration (src/v22/vo.json, Sarah, eleven_v4, tempo 1.1).
import React from "react";
import { AbsoluteFill, Audio, Composition, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FootageTime, Media, type Manifest } from "../footage/footage";
import manJson from "./footage.json";
import voJson from "./vo.json";

const MAN = manJson as unknown as Manifest;
type VW = { w: string; s: number; e: number; line: number };
const VO = voJson as unknown as { total: number; segs: { n: number; start: number; end: number }[]; words: VW[] };
const W = 1080, H = 1920, FPS = 30;
const PAPER = "#eef2ea", PAPER2 = "#dfe7da", INK = "#12301c", GREEN = "#2fae5b", GREEN2 = "#8fdc74", GOLD = "#e9b949", GOLD2 = "#f6d27a";
const WARN = "#e5484d";
const NC = "#2fae5b", PC = "#f08a24", KC = "#8b3fd9";
const DISP = "Sora", BODY = "InterV";
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9']/g, "");
const S = (n: number) => VO.segs.find((s) => s.n === n)!.start;
const Wd = (n: number, word: string, k = 0) => VO.words.filter((w) => w.line === n && norm(w.w) === norm(word))[k]?.s ?? S(n);
const LAST = VO.words[VO.words.length - 1].e;
const END = +(LAST + 2.6).toFixed(2);

// ---------- fonts ----------
const fh = delayRender("v22 fonts");
Promise.all([
  new FontFace(DISP, `url('${staticFile("fonts/Sora-Bold.woff2")}') format('woff2')`, { weight: "700" }).load(),
  new FontFace(BODY, `url('${staticFile("fonts/Inter.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); }).catch((e) => { console.error(e); continueRender(fh); });

// ---------- helpers ----------
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eio = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = (x: number) => { x = clamp(x); const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const vis = (t: number, a: number, b: number, fi = 0.2, fo = 0.2) => Math.min(lin(t, a, a + fi), 1 - lin(t, b - fo, b));
const C = (k: string) => MAN.clips[k];
const shadowDark = "0 4px 18px rgba(0,0,0,.65), 0 1px 3px rgba(0,0,0,.6)";

// ---------- scenes ----------
// mode: "paper" = motion only on light paper · "full" = full-bleed footage · "circle" = footage in a big circle on paper
// "card" = footage in a tilted rounded card on paper
type Scene = { id: string; a: number; b: number; mode: "paper" | "full" | "circle" | "card"; clip?: string; from?: number; rate?: number; focus?: [number, number]; push?: number; zoom?: number; tint?: string };
const SC: Scene[] = [
  { id: "bags", a: 0, b: Wd(1, "fertilizer") - 0.05, mode: "card", clip: "s01a", push: 0.18, tint: GREEN },
  { id: "bag", a: Wd(1, "fertilizer") - 0.05, b: S(2) - 0.05, mode: "paper", tint: GREEN },
  { id: "random", a: S(2) - 0.05, b: Wd(2, "they") - 0.05, mode: "paper", tint: GOLD },
  { id: "pellets", a: Wd(2, "they") - 0.05, b: Wd(2, "three") - 0.05, mode: "full", clip: "s02a", push: 0.22 },
  { id: "npk", a: Wd(2, "three") - 0.05, b: Wd(2, "nitrogen") - 0.1, mode: "full", clip: "u_npk", zoom: 1.0, push: 0.05, focus: [0.5, 0.3] },
  { id: "tiles", a: Wd(2, "nitrogen") - 0.1, b: S(3) - 0.05, mode: "paper" },
  { id: "tree", a: S(3) - 0.05, b: S(4) - 0.05, mode: "full", clip: "u_tree", zoom: 1.0, push: 0.05, focus: [0.5, 0.4] },
  { id: "N", a: S(4) - 0.05, b: Wd(4, "it's") - 0.05, mode: "paper", tint: NC },
  { id: "npost", a: Wd(4, "it's") - 0.05, b: Wd(4, "it") - 0.05, mode: "full", clip: "u_n", zoom: 1.0, push: 0.05, focus: [0.5, 0.35] },
  { id: "chloro", a: Wd(4, "it") - 0.05, b: Wd(4, "keeping") - 0.05, mode: "paper", tint: NC },
  { id: "leaves", a: Wd(4, "keeping") - 0.05, b: S(5) - 0.05, mode: "full", clip: "s04b", push: 0.14 },
  { id: "P", a: S(5) - 0.05, b: Wd(5, "which") - 0.05, mode: "paper", tint: PC },
  { id: "energy", a: Wd(5, "which") - 0.05, b: Wd(5, "it") - 0.05, mode: "paper", tint: PC },
  { id: "ppost", a: Wd(5, "it") - 0.05, b: Wd(5, "and") - 0.05, mode: "full", clip: "u_p", zoom: 1.0, push: 0.05, focus: [0.5, 0.55] },
  { id: "bloom", a: Wd(5, "and") - 0.05, b: S(6) - 0.05, mode: "card", clip: "s05b", rate: 6, from: 8, push: 0.1, tint: PC },
  { id: "K", a: S(6) - 0.05, b: Wd(6, "it") - 0.05, mode: "paper", tint: KC },
  { id: "water", a: Wd(6, "it") - 0.05, b: Wd(6, "move") - 0.05, mode: "full", clip: "s06a", push: 0.14 },
  { id: "sugar", a: Wd(6, "move") - 0.05, b: Wd(6, "and", 1) - 0.05, mode: "paper", tint: KC },
  { id: "kpost", a: Wd(6, "and", 1) - 0.05, b: S(7) - 0.05, mode: "full", clip: "u_k", zoom: 1.0, push: 0.05, focus: [0.5, 0.4] },
  { id: "chart", a: S(7) - 0.05, b: S(8) - 0.05, mode: "paper", tint: GREEN },
  { id: "f20", a: S(8) - 0.05, b: Wd(8, "and") - 0.05, mode: "paper", tint: GREEN },
  { id: "rows", a: Wd(8, "and") - 0.05, b: S(9) - 0.05, mode: "full", clip: "s08a", push: 0.14, rate: 0.8 },
  { id: "f30", a: S(9) - 0.05, b: Wd(9, "it's") - 0.05, mode: "paper", tint: NC },
  { id: "seedl", a: Wd(9, "it's") - 0.05, b: S(10) - 0.05, mode: "full", clip: "s09a", push: 0.12, focus: [0.45, 0.6] },
  { id: "f10", a: S(10) - 0.05, b: Wd(10, "and") - 0.05, mode: "paper", tint: PC },
  { id: "sprout", a: Wd(10, "and") - 0.05, b: Wd(10, "and", 1) - 0.05, mode: "full", clip: "s03a", push: 0.12, rate: 0.9 },
  { id: "roots", a: Wd(10, "and", 1) - 0.05, b: S(11) - 0.05, mode: "full", clip: "s05a", zoom: 1.0, push: 0.08, focus: [0.5, 0.45] },
  { id: "f12", a: S(11) - 0.05, b: Wd(11, "it") - 0.05, mode: "paper", tint: KC },
  { id: "tomato", a: Wd(11, "it") - 0.05, b: Wd(11, "and", 1) - 0.05, mode: "circle", clip: "s06b", push: 0.12, tint: KC },
  { id: "apples", a: Wd(11, "and", 1) - 0.05, b: S(12) - 0.05, mode: "full", clip: "s11a", zoom: 1.0, push: 0.08, focus: [0.66, 0.5] },
  { id: "ratio", a: S(12) - 0.05, b: Wd(12, "depending") - 0.05, mode: "paper", tint: GOLD },
  { id: "choose", a: Wd(12, "depending") - 0.05, b: Wd(12, "it") - 0.05, mode: "paper", tint: GREEN },
  { id: "farmer", a: Wd(12, "it") - 0.05, b: S(13) - 0.05, mode: "card", clip: "s07a", push: 0.12, tint: GREEN },
  { id: "warn", a: S(13) - 0.05, b: Wd(13, "more") - 0.05, mode: "paper", tint: WARN },
  { id: "more", a: Wd(13, "more") - 0.05, b: Wd(13, "overusing") - 0.05, mode: "paper", tint: WARN },
  { id: "yellow", a: Wd(13, "overusing") - 0.05, b: Wd(13, "damage") - 0.05, mode: "full", clip: "s13a", push: 0.1 },
  { id: "damage", a: Wd(13, "damage") - 0.05, b: S(14) - 0.05, mode: "paper", tint: WARN },
  { id: "inspect", a: S(14) - 0.05, b: Wd(14, "make") - 0.05, mode: "full", clip: "s14a", push: 0.1, focus: [0.3, 0.55] },
  { id: "know", a: Wd(14, "make") - 0.05, b: S(15) - 0.05, mode: "paper", tint: GREEN },
  { id: "end", a: S(15) - 0.05, b: END + 1, mode: "paper", tint: GREEN },
];
const sceneAt = (t: number) => SC.find((s) => t >= s.a && t < s.b) ?? SC[SC.length - 1];
const local = (t: number, id: string) => { const s = SC.find((x) => x.id === id)!; return { s, d: t - s.a, len: s.b - s.a, on: t >= s.a - 0.01 && t < s.b + 0.01 }; };

// whip-pan between scenes: the outgoing scene slides away blurred, the incoming one slides in
const WHIP = 0.22;
const whipOf = (t: number, s: Scene) => {
  const i = SC.indexOf(s);
  const dir = i % 2 ? -1 : 1;
  const pin = i === 0 ? 1 : eo(lin(t, s.a, s.a + WHIP));
  return { x: (1 - pin) * W * 0.55 * dir, blur: (1 - pin) * 26, s: 1 + (1 - pin) * 0.06 };
};

// keyword punch zoom
const PUNCH = () => [Wd(1, "20-20-20"), Wd(1, "10-52-10"), Wd(2, "random"), Wd(2, "n-p-k"), Wd(4, "nitrogen"), Wd(4, "chlorophyll"), Wd(5, "phosphorus"), Wd(5, "energy"), Wd(6, "potassium"), Wd(6, "sugars"), Wd(7, "n-p-k"), Wd(8, "20-20-20"), Wd(9, "30-10-10"), Wd(10, "10-52-10"), Wd(11, "12-12-36"), Wd(12, "ratio"), Wd(13, "remember"), Wd(13, "damage"), Wd(14, "needs")];
const camera = (t: number) => {
  let z = 1;
  for (const a of PUNCH()) { const d = t - a; if (d > -0.05 && d < 0.7) z += 0.045 * Math.exp(-d * 6) * Math.min(1, (d + 0.05) * 20); }
  return z;
};

// ---------- paper background: soft gradient, faint grid dots, drifting big circles ----------
const Paper: React.FC<{ t: number; tint?: string }> = ({ t, tint = GREEN }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, #f8faf5 0%, ${PAPER} 55%, ${PAPER2} 100%)` }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 14 * 24 }).map((_, i) => <circle key={i} cx={(i % 14) * 80 + 20} cy={Math.floor(i / 14) * 80 + 20} r={2} fill={INK} opacity={0.06} />)}
      <circle cx={-80 + Math.sin(t * 0.4) * 30} cy={1700} r={360} fill={tint} opacity={0.14} />
      <circle cx={1150} cy={180 + Math.cos(t * 0.5) * 30} r={260} fill={tint} opacity={0.12} />
    </svg>
  </AbsoluteFill>
);

/** dashed arc that draws across (ref: blue dashed curve linking elements) */
const DashArc: React.FC<{ t: number; a: number; d: string; color?: string; dur?: number }> = ({ t, a, d, color = INK, dur = 0.7 }) => {
  const p = eio(lin(t, a, a + dur));
  if (p <= 0) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs><mask id={`m${a}`}><path d={d} stroke="#fff" strokeWidth="12" fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} /></mask></defs>
      <path d={d} stroke={color} strokeWidth="5" strokeDasharray="14 14" fill="none" opacity=".55" mask={`url(#m${a})`} strokeLinecap="round" />
    </svg>
  );
};

/** big flat colour disc that scales in behind a subject */
const Disc: React.FC<{ t: number; a: number; x: number; y: number; r: number; color: string; o?: number }> = ({ t, a, x, y, r, color, o = 1 }) => {
  const p = back(lin(t, a, a + 0.5));
  return <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: color, opacity: o, transform: `scale(${p})` }} />;
};

// ---------- footage holders ----------
const Full: React.FC<{ s: Scene }> = ({ s }) => (
  <AbsoluteFill>
    <Media clip={C(s.clip!)} name={s.clip} t0={s.a} len={s.b - s.a} w={W} h={H} focus={s.focus ?? C(s.clip!)?.focus} zoom={s.zoom ?? 1.06} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="vivid" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,.35) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0) 50%, rgba(0,0,0,.7) 100%)" }} />
  </AbsoluteFill>
);
const Circle: React.FC<{ t: number; s: Scene; y?: number; r?: number }> = ({ t, s, y = 860, r = 430 }) => {
  const p = back(lin(t, s.a, s.a + 0.5));
  return (
    <>
      <Disc t={t} a={s.a} x={540 + 70} y={y + 40} r={r + 40} color={s.tint ?? GREEN} o={0.9} />
      <div style={{ position: "absolute", left: 540 - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", overflow: "hidden", transform: `scale(${p})`, boxShadow: "0 30px 60px rgba(18,48,28,.35)", border: "10px solid #fff" }}>
        <Media clip={C(s.clip!)} name={s.clip} t0={s.a} len={s.b - s.a} w={r * 2} h={r * 2} focus={s.focus ?? C(s.clip!)?.focus} zoom={s.zoom ?? 1.08} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="vivid" />
      </div>
    </>
  );
};
const Card: React.FC<{ t: number; s: Scene; y?: number; w?: number; h?: number; rot?: number }> = ({ t, s, y = 820, w = 860, h = 1000, rot = -3 }) => {
  const p = back(lin(t, s.a, s.a + 0.55));
  return (
    <>
      <Disc t={t} a={s.a + 0.05} x={760} y={y + 380} r={330} color={s.tint ?? GREEN} o={0.9} />
      <div style={{ position: "absolute", left: 540 - w / 2, top: y - h / 2, width: w, height: h, borderRadius: 46, overflow: "hidden", transform: `rotate(${rot + (1 - p) * 8}deg) scale(${0.6 + 0.4 * p})`, boxShadow: "0 40px 80px rgba(18,48,28,.4)", border: "10px solid #fff" }}>
        <Media clip={C(s.clip!)} name={s.clip} t0={s.a} len={s.b - s.a} w={w} h={h} focus={s.focus ?? C(s.clip!)?.focus} zoom={s.zoom ?? 1.08} push={s.push} from={s.from ?? 0} rate={s.rate ?? 1} grade="vivid" />
      </div>
    </>
  );
};

// ---------- text ----------
/** two-tier kinetic title: small italic line + big bold line; `box` puts the big line in a colour box with corner handles */
const Title: React.FC<{ t: number; a: number; b: number; small?: string; big: string; y: number; size?: number; color?: string; box?: string; dark?: boolean; smallAt?: number }> = ({ t, a, b, small, big, y, size = 130, color, box, dark = true, smallAt }) => {
  const o = vis(t, a, b, 0.12, 0.18);
  if (o <= 0) return null;
  const sa = smallAt ?? a;
  const ps = eo(lin(t, sa, sa + 0.3));
  const pb = back(lin(t, a + (small ? 0.12 : 0), a + (small ? 0.12 : 0) + 0.4));
  const ink = dark ? INK : "#fff";
  const bw = eio(lin(t, a + 0.05, a + 0.35));
  return (
    <div style={{ position: "absolute", left: 0, width: W, top: y, textAlign: "center", opacity: o }}>
      {small && <div style={{ fontFamily: BODY, fontStyle: "italic", fontWeight: 800, fontSize: 58, color: dark ? INK : "#fff", opacity: ps, transform: `translateY(${(1 - ps) * 30}px)`, textShadow: dark ? "none" : shadowDark, marginBottom: 6 }}>{small}</div>}
      <div style={{ display: "inline-block", position: "relative", padding: box ? "4px 34px 12px" : 0, transform: `scale(${0.6 + 0.4 * pb})` }}>
        {box && <>
          <div style={{ position: "absolute", inset: 0, background: box, borderRadius: 10, transform: `scaleX(${bw})`, transformOrigin: "left", boxShadow: "0 10px 30px rgba(0,0,0,.2)" }} />
          {[[0, 0], [1, 0], [0, 1], [1, 1]].map(([x, yy], i) => <div key={i} style={{ position: "absolute", left: `calc(${x * 100}% - 11px)`, top: `calc(${yy * 100}% - 11px)`, width: 22, height: 22, borderRadius: "50%", background: "#fff", border: `5px solid ${box}`, opacity: bw }} />)}
        </>}
        <div style={{ position: "relative", fontFamily: DISP, fontWeight: 700, fontSize: size, lineHeight: 1.05, letterSpacing: 1, color: box ? "#fff" : color ?? ink, textShadow: !dark && !box ? shadowDark : "none" }}>{big}</div>
      </div>
    </div>
  );
};

// ---------- motion pieces ----------
/** a fertilizer sack (SVG) that drops in; numbers printed on it roll from 20-20-20 to 10-52-10 */
const Bag: React.FC<{ t: number }> = ({ t }) => {
  const { s, on } = local(t, "bag");
  if (!on) return null;
  const a = s.a;
  const drop = back(lin(t, a, a + 0.5));
  const y = 1000 - (1 - drop) * 900;
  const sq = 1 + 0.08 * Math.exp(-(t - a - 0.45) * 10) * (t > a + 0.45 ? 1 : 0);
  const swap = lin(t, Wd(1, "10-52-10") - 0.1, Wd(1, "10-52-10") + 0.25);
  const n1 = ["20", "20", "20"], n2 = ["10", "52", "10"];
  const cols = [NC, PC, KC];
  return (
    <>
      <Disc t={t} a={a} x={540} y={1000} r={470} color={GREEN} o={0.9} />
      <DashArc t={t} a={a + 0.3} d="M 60 560 C 300 380, 760 380, 1020 600" />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 ${y}) scale(${1 / sq} ${sq}) rotate(${Math.sin(t * 2) * 1.5})`}>
          <path d="M -290 -380 Q -300 -420 -250 -430 L 250 -430 Q 300 -420 290 -380 L 320 360 Q 330 420 270 430 L -270 430 Q -330 420 -320 360 Z" fill="#fbfaf4" stroke={INK} strokeWidth="8" />
          <path d="M -250 -430 L -230 -470 L 230 -470 L 250 -430" fill="#e8e4d4" stroke={INK} strokeWidth="8" />
          <rect x={-230} y={-350} width={460} height={120} rx={18} fill={GREEN} />
          <text x={0} y={-268} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={84} fill="#fff" letterSpacing="10">NPK</text>
          <path d="M -60 -170 C -60 -230, 0 -250, 0 -250 C 0 -250, 60 -230, 60 -170 C 60 -130, 0 -110, 0 -110 C 0 -110, -60 -130, -60 -170 Z" fill={GREEN2} stroke={INK} strokeWidth="5" />
          {[0, 1, 2].map((i) => {
            const x = -190 + i * 190;
            const ro = swap * 120;
            return (
              <g key={i}>
                <rect x={x - 82} y={-60} width={164} height={170} rx={20} fill={cols[i]} />
                <g clipPath={`url(#bc${i})`}>
                  <text x={x} y={70 - ro} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={104} fill="#fff">{n1[i]}</text>
                  <text x={x} y={190 - ro} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={104} fill="#fff">{n2[i]}</text>
                </g>
                <clipPath id={`bc${i}`}><rect x={x - 82} y={-60} width={164} height={170} rx={20} /></clipPath>
                <text x={x} y={175} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={52} fill={INK}>{["N", "P", "K"][i]}</text>
              </g>
            );
          })}
          <rect x={-230} y={240} width={460} height={22} rx={11} fill={INK} opacity=".12" />
          <rect x={-170} y={290} width={340} height={22} rx={11} fill={INK} opacity=".12" />
        </g>
      </svg>
    </>
  );
};

/** "aren't random": digits rain and scatter, then lock into place */
const Random: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "random");
  if (!on) return null;
  const lock = eio(lin(t, Wd(2, "random") + 0.15, Wd(2, "random") + 0.6));
  const digits = "2052103612301052";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: 26 }).map((_, i) => {
        const ch = digits[i % digits.length];
        const x0 = (i * 397) % 1000 + 40, y0 = ((i * 271) % 1500) + 200 + Math.sin(d * 3 + i) * 40;
        const tx = 540 + ((i % 3) - 1) * 220, ty = 960;
        const x = x0 + (tx - x0) * lock, y = y0 + (ty - y0) * lock;
        const r = (1 - lock) * (i * 37 + d * 140);
        const col = [NC, PC, KC][i % 3];
        return <text key={i} x={x} y={y} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={110 + (i % 4) * 30} fill={col} opacity={(1 - lock) * 0.85} transform={`rotate(${r} ${x} ${y})`}>{ch}</text>;
      })}
      {s && [NC, PC, KC].map((c, i) => {
        const p = back(lin(t, Wd(2, "random") + 0.4 + i * 0.08, Wd(2, "random") + 0.8 + i * 0.08));
        return <g key={i} transform={`translate(${540 + (i - 1) * 260} 1000) scale(${p})`}><rect x={-110} y={-110} width={220} height={220} rx={30} fill={c} /><text y={40} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={110} fill="#fff">?</text></g>;
      })}
    </svg>
  );
};

/** periodic-table style element tile */
const Tile: React.FC<{ x: number; y: number; sym: string; num: number; name: string; color: string; scale?: number; o?: number; rot?: number }> = ({ x, y, sym, num, name, color, scale = 1, o = 1, rot = 0 }) => (
  <div style={{ position: "absolute", left: x - 150, top: y - 170, width: 300, height: 340, borderRadius: 34, background: color, opacity: o, transform: `scale(${scale}) rotate(${rot}deg)`, boxShadow: "0 24px 50px rgba(18,48,28,.3)", border: "8px solid #fff" }}>
    <div style={{ position: "absolute", left: 24, top: 14, fontFamily: DISP, fontWeight: 700, fontSize: 46, color: "rgba(255,255,255,.85)" }}>{num}</div>
    <div style={{ position: "absolute", left: 0, width: "100%", top: 60, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 180, color: "#fff", lineHeight: 1 }}>{sym}</div>
    <div style={{ position: "absolute", left: 0, width: "100%", top: 260, textAlign: "center", fontFamily: BODY, fontWeight: 800, fontSize: 36, color: "#fff", letterSpacing: 1 }}>{name}</div>
  </div>
);
const ELEM = [
  { sym: "N", num: 7, name: "Nitrogen", color: NC, word: "nitrogen" },
  { sym: "P", num: 15, name: "Phosphorus", color: PC, word: "phosphorus" },
  { sym: "K", num: 19, name: "Potassium", color: KC, word: "potassium" },
];

/** N · P · K tiles pop in on each word, then slide together into "NPK" */
const Tiles: React.FC<{ t: number }> = ({ t }) => {
  const { on } = local(t, "tiles");
  if (!on) return null;
  const join = eio(lin(t, Wd(2, "n-p-k") - 0.25, Wd(2, "n-p-k") + 0.2));
  const flash = Math.exp(-Math.max(0, t - Wd(2, "n-p-k") - 0.1) * 5) * (t > Wd(2, "n-p-k") + 0.1 ? 1 : 0);
  return (
    <>
      <DashArc t={t} a={Wd(2, "nitrogen")} d="M 120 1300 C 300 1500, 780 1500, 960 1300" />
      {ELEM.map((e, i) => {
        const at = Wd(2, e.word) - 0.05;
        const p = back(lin(t, at, at + 0.45));
        const x0 = 540 + (i - 1) * 320, y0 = 900 + (i === 1 ? -120 : 60);
        const x1 = 540 + (i - 1) * 300, y1 = 980;
        const x = x0 + (x1 - x0) * join, y = y0 + (y1 - y0) * join;
        return <Tile key={e.sym} x={x} y={y} sym={e.sym} num={e.num} name={e.name} color={e.color} scale={p * (0.85 + 0.15 * join)} rot={(1 - join) * (i - 1) * 6} />;
      })}
      {flash > 0 && <AbsoluteFill style={{ background: `rgba(255,255,255,${0.7 * flash})` }} />}
    </>
  );
};

/** a nutrient intro: tile zooms in big on its colour circle with orbiting particles */
const Hero: React.FC<{ t: number; id: "N" | "P" | "K" }> = ({ t, id }) => {
  const { s, d, on } = local(t, id);
  if (!on) return null;
  const e = ELEM.find((x) => x.sym === id)!;
  const p = back(lin(t, s.a + 0.05, s.a + 0.5));
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={900} r={440} color={e.color} o={0.22} />
      <Disc t={t} a={s.a + 0.08} x={540} y={900} r={330} color={e.color} o={0.35} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => { const ang = (i / 16) * Math.PI * 2 + d * 1.2; const R = 420 + (i % 3) * 30; return <circle key={i} cx={540 + Math.cos(ang) * R * p} cy={900 + Math.sin(ang) * R * p} r={8 + (i % 3) * 4} fill={e.color} opacity={0.75} />; })}
      </svg>
      <Tile x={540} y={900} sym={e.sym} num={e.num} name={e.name} color={e.color} scale={1.35 * p} rot={(1 - p) * -12} />
    </>
  );
};

/** chlorophyll: a leaf outline fills with green, veins draw, sparkle */
const Chloro: React.FC<{ t: number }> = ({ t }) => {
  const { s, on } = local(t, "chloro");
  if (!on) return null;
  const fill = eio(lin(t, Wd(4, "chlorophyll") - 0.3, Wd(4, "chlorophyll") + 0.6));
  const p = back(lin(t, s.a, s.a + 0.5));
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={900} r={420} color={NC} o={0.85} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <clipPath id="leafc"><path d="M 540 520 C 820 600, 860 1000, 540 1300 C 220 1000, 260 600, 540 520 Z" /></clipPath>
          <linearGradient id="lg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#1f8a43" /><stop offset="1" stopColor={GREEN2} /></linearGradient>
        </defs>
        <g transform={`translate(540 910) scale(${p}) rotate(${Math.sin(t * 2) * 3}) translate(-540 -910)`}>
          <path d="M 540 520 C 820 600, 860 1000, 540 1300 C 220 1000, 260 600, 540 520 Z" fill="#fff" stroke={INK} strokeWidth="8" />
          <g clipPath="url(#leafc)"><rect x={200} y={1300 - 800 * fill} width={700} height={800} fill="url(#lg)" />
            <path d={`M 200 ${1300 - 800 * fill} q 90 -24 175 0 t 175 0 t 175 0 t 175 0`} fill={GREEN2} opacity=".8" transform={`translate(${-((t * 200) % 350)} 0)`} /></g>
          <path d="M 540 560 L 540 1300 M 540 760 L 420 680 M 540 760 L 660 680 M 540 920 L 390 820 M 540 920 L 690 820 M 540 1080 L 420 1000 M 540 1080 L 660 1000" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" opacity=".6" />
          <path d="M 540 1300 L 540 1420" stroke={INK} strokeWidth="10" strokeLinecap="round" />
        </g>
      </svg>
    </>
  );
};

/** energy: a battery charges inside an amber circle, bolts fly out */
const Energy: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "energy");
  if (!on) return null;
  const p = back(lin(t, s.a, s.a + 0.45));
  const ch = eio(lin(t, Wd(5, "energy") - 0.3, Wd(5, "processes") + 0.6));
  const segs = 5;
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={920} r={430} color={PC} o={0.9} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 920) scale(${p})`}>
          <rect x={-190} y={-320} width={380} height={640} rx={50} fill="#fff" stroke={INK} strokeWidth="12" />
          <rect x={-70} y={-370} width={140} height={60} rx={16} fill={INK} />
          {Array.from({ length: segs }).map((_, i) => {
            const on2 = ch * segs > i;
            const k = clamp(ch * segs - i);
            return <rect key={i} x={-150} y={250 - i * 118 - 90} width={300} height={98} rx={18} fill={on2 ? (i > 2 ? GOLD : "#ffb347") : "#f1ede2"} opacity={on2 ? 0.4 + 0.6 * k : 1} />;
          })}
          <path d="M 25 -190 L -60 30 L 10 30 L -25 200 L 75 -40 L 5 -40 Z" fill="#fff" stroke={INK} strokeWidth="10" strokeLinejoin="round" opacity={ch > 0.9 ? 1 : 0.5} />
        </g>
        {Array.from({ length: 8 }).map((_, i) => {
          const q = ((d * 0.9 + i / 8) % 1);
          const ang = (i / 8) * Math.PI * 2;
          const R = 420 + q * 260;
          return <path key={i} d="M 14 -40 L -16 6 L 6 6 L -10 40 L 22 -6 L 0 -6 Z" fill={GOLD2} stroke={INK} strokeWidth="3" opacity={(1 - q) * ch} transform={`translate(${540 + Math.cos(ang) * R} ${920 + Math.sin(ang) * R}) scale(1.8) rotate(${ang * 57})`} />;
        })}
      </svg>
    </>
  );
};

/** sugars moving through a plant: a stem/leaf diagram with glowing particles flowing in the veins */
const Sugar: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "sugar");
  if (!on) return null;
  const p = back(lin(t, s.a, s.a + 0.45));
  const paths = [
    "M 540 1420 L 540 600",
    "M 540 1000 C 460 920, 360 880, 260 860",
    "M 540 840 C 620 760, 720 720, 820 700",
    "M 540 1180 C 640 1120, 740 1100, 840 1100",
  ];
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={980} r={460} color={KC} o={0.9} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 1000) scale(${p}) translate(-540 -1000)`}>
          <ellipse cx={230} cy={850} rx={120} ry={60} fill={GREEN2} stroke={INK} strokeWidth="6" transform="rotate(10 230 850)" />
          <ellipse cx={850} cy={690} rx={120} ry={60} fill={GREEN2} stroke={INK} strokeWidth="6" transform="rotate(-15 850 690)" />
          <ellipse cx={870} cy={1100} rx={110} ry={55} fill={GREEN2} stroke={INK} strokeWidth="6" />
          {paths.map((pa, i) => <path key={i} d={pa} stroke="#fff" strokeWidth={i ? 26 : 40} fill="none" strokeLinecap="round" />)}
          {paths.map((pa, i) => <path key={"o" + i} d={pa} stroke={INK} strokeWidth={i ? 6 : 8} fill="none" strokeLinecap="round" opacity=".25" />)}
          <circle cx={540} cy={560} r={70} fill="#ff6b5a" stroke={INK} strokeWidth="6" />
          {paths.map((pa, i) => Array.from({ length: 6 }).map((_, k) => {
            const q = (d * 0.7 + k / 6 + i * 0.13) % 1;
            return <circle key={i + "-" + k} r={12} fill={GOLD} stroke="#fff" strokeWidth="3" style={{ offsetPath: `path('${pa}')`, offsetDistance: `${(i === 0 ? q : 1 - q) * 100}%` } as React.CSSProperties} />;
          }))}
        </g>
      </svg>
    </>
  );
};

/** stacked bar chart: each common formula as N / P / K stacked bars that grow (ref: blue bars rising) */
const FORMULAS: [number, number, number][] = [[20, 20, 20], [30, 10, 10], [10, 52, 10], [12, 12, 36]];
const Chart: React.FC<{ t: number }> = ({ t }) => {
  const { s, on } = local(t, "chart");
  if (!on) return null;
  const base = 1520, scale = 13.5, bw = 74, gap = 14;
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={70} y1={base} x2={1010} y2={base} stroke={INK} strokeWidth="6" strokeLinecap="round" opacity={eo(lin(t, s.a, s.a + 0.4))} />
        {FORMULAS.map((f, i) => {
          const at = s.a + 0.35 + i * 0.55;
          const cx = 175 + i * 243;
          const lab = eo(lin(t, at + 0.25, at + 0.6));
          return (
            <g key={i}>
              {f.map((v, k) => {
                const g = back(lin(t, at + k * 0.08, at + k * 0.08 + 0.55));
                const h = v * scale * g;
                const x = cx + (k - 1) * (bw + gap) - bw / 2;
                return (
                  <g key={k}>
                    <rect x={x} y={base - h} width={bw} height={h} rx={12} fill={[NC, PC, KC][k]} />
                    <text x={x + bw / 2} y={base - h - 14} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={36} fill={[NC, PC, KC][k]} opacity={lab}>{v}</text>
                  </g>
                );
              })}
              <rect x={cx - 120} y={base + 26} width={240} height={74} rx={16} fill={INK} opacity={lab} />
              <text x={cx} y={base + 78} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={42} fill="#fff" opacity={lab}>{f.join("-")}</text>
            </g>
          );
        })}
        {/* legend */}
        {ELEM.map((e, k) => <g key={e.sym} opacity={eo(lin(t, s.a + 2.6, s.a + 3))} transform={`translate(${250 + k * 230} 1700)`}><rect x={-26} y={-26} width={52} height={52} rx={10} fill={e.color} /><text x={42} y={16} fontFamily={DISP} fontWeight={700} fontSize={44} fill={INK}>{e.sym}</text></g>)}
      </svg>
    </>
  );
};

/** small icon chips that pop beside the footage (ref: Excel / SQL icons popping) */
const Chip: React.FC<{ t: number; at: number; until: number; x: number; y: number; color: string; icon: "leaf" | "stem" | "root" | "flower" | "seed" | "drop" | "shield" | "sun" }> = ({ t, at, until, x, y, color, icon }) => {
  const o = vis(t, at, until, 0.1, 0.15);
  if (o <= 0) return null;
  const p = back(lin(t, at, at + 0.4));
  const bob = Math.sin((t - at) * 3) * 8;
  const g: Record<string, React.ReactNode> = {
    leaf: <path d="M 0 -50 C 45 -30, 45 30, 0 50 C -45 30, -45 -30, 0 -50 Z M 0 -40 L 0 50" fill="#fff" stroke="#fff" strokeWidth="6" />,
    stem: <path d="M 0 55 L 0 -50 M 0 10 C 20 -5, 35 -10, 45 -25 M 0 -15 C -20 -30, -35 -30, -45 -45" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" />,
    root: <path d="M 0 -55 L 0 10 M 0 10 C -15 30, -30 35, -40 55 M 0 10 C 15 30, 30 35, 40 55 M 0 10 L 0 55" stroke="#fff" strokeWidth="9" fill="none" strokeLinecap="round" />,
    flower: <g fill="#fff">{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={0} cy={-28} rx={17} ry={26} transform={`rotate(${a})`} />)}<circle r={16} fill={GOLD} /></g>,
    seed: <g fill="#fff"><ellipse cx={-18} cy={0} rx={14} ry={22} transform="rotate(-20 -18 0)" /><ellipse cx={18} cy={-10} rx={14} ry={22} transform="rotate(20 18 -10)" /><ellipse cx={4} cy={26} rx={14} ry={22} /></g>,
    drop: <path d="M 0 -55 C 30 -10, 42 10, 42 25 C 42 48, 22 60, 0 60 C -22 60, -42 48, -42 25 C -42 10, -30 -10, 0 -55 Z" fill="#fff" />,
    shield: <path d="M 0 -55 L 45 -38 L 45 5 C 45 35, 20 52, 0 60 C -20 52, -45 35, -45 5 L -45 -38 Z M -18 2 L -4 18 L 22 -14" fill="#fff" stroke={color} strokeWidth="8" strokeLinejoin="round" />,
    sun: <g fill="#fff"><circle r={24} />{Array.from({ length: 8 }).map((_, i) => <rect key={i} x={-5} y={-55} width={10} height={20} rx={5} transform={`rotate(${i * 45})`} />)}</g>,
  };
  return (
    <svg width={220} height={220} style={{ position: "absolute", left: x - 110, top: y - 110 + bob, opacity: o, transform: `scale(${p})`, overflow: "visible" }}>
      <circle cx={110} cy={110} r={92} fill={color} stroke="#fff" strokeWidth="8" style={{ filter: "drop-shadow(0 12px 18px rgba(0,0,0,.3))" }} />
      <g transform="translate(110 110)">{g[icon]}</g>
    </svg>
  );
};

/** star glint (channel default since v21) */
const Sparkle: React.FC<{ t: number; at: number; x: number; y: number; size?: number }> = ({ t, at, x, y, size = 1 }) => {
  const d = t - at;
  if (d < 0 || d > 1.1) return null;
  const g = Math.sin(Math.PI * clamp(d / 1.1));
  const s2 = Math.sin(Math.PI * clamp((d - 0.25) / 0.6));
  const star = (cx: number, cy: number, r: number, k: number, rot: number) => (
    <g transform={`translate(${cx} ${cy}) rotate(${rot}) scale(${k})`}>
      <path d={`M0 ${-r} C ${r * 0.08} ${-r * 0.08} ${r * 0.08} ${-r * 0.08} ${r} 0 C ${r * 0.08} ${r * 0.08} ${r * 0.08} ${r * 0.08} 0 ${r} C ${-r * 0.08} ${r * 0.08} ${-r * 0.08} ${r * 0.08} ${-r} 0 C ${-r * 0.08} ${-r * 0.08} ${-r * 0.08} ${-r * 0.08} 0 ${-r} Z`} fill="#fff" />
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs><radialGradient id={`sg${at}`}><stop offset="0" stopColor="#fffbe8" stopOpacity=".95" /><stop offset=".35" stopColor={GOLD2} stopOpacity=".55" /><stop offset="1" stopColor={GOLD2} stopOpacity="0" /></radialGradient></defs>
      <circle cx={x} cy={y} r={170 * size * g} fill={`url(#sg${at})`} />
      {[0, 45].map((a) => <rect key={a} x={x - 420 * size * g} y={y - 2} width={840 * size * g} height={4} fill="#fff" opacity={0.6 * g} transform={`rotate(${a + d * 30} ${x} ${y})`} />)}
      {star(x, y, 110 * size, g, d * 90)}
      {star(x + 150 * size, y - 90 * size, 40 * size, s2, -d * 120)}
      {star(x - 130 * size, y + 70 * size, 28 * size, Math.sin(Math.PI * clamp((d - 0.4) / 0.5)), d * 140)}
    </svg>
  );
};

/** floating motes over everything (subtle life) */
const Motes: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => (
  <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.8 }}>
    {Array.from({ length: 24 }).map((_, i) => {
      const x = ((i * 211 + t * (30 + (i % 7) * 12)) % (W + 80)) - 40;
      const y = ((i * 389) % H) + Math.sin(t * (0.6 + (i % 5) * 0.2) + i) * 40;
      const r = 3 + (i % 4) * 2;
      return <circle key={i} cx={x} cy={y} r={r} fill={dark ? "#fff6d8" : [NC, PC, KC][i % 3]} opacity={(dark ? 0.5 : 0.28) + 0.2 * Math.sin(t * 2.3 + i * 1.7)} />;
    })}
  </svg>
);

// ---------- part 2: formulas, ratio, choose, warnings ----------
const SYM = ["N", "P", "K"], COLS = [NC, PC, KC];
/** one formula: big label + three N/P/K bars that grow; hi = the nutrient that stands out (-1 = all equal) */
const Formula: React.FC<{ t: number; id: string; f: number[]; hi: number }> = ({ t, id, f, hi }) => {
  const { s, d, on } = local(t, id);
  if (!on) return null;
  const lab = back(lin(t, s.a + 0.05, s.a + 0.5));
  const base = 1420, sc = 11.5, bw = 220, gap = 50;
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={980} r={470} color={hi < 0 ? GREEN : COLS[hi]} o={0.16} />
      <div style={{ position: "absolute", left: 0, width: W, top: 230, textAlign: "center", transform: `scale(${lab})` }}>
        <span style={{ display: "inline-block", padding: "6px 44px 14px", borderRadius: 24, background: INK, fontFamily: DISP, fontWeight: 700, fontSize: 170, color: "#fff", letterSpacing: 4, boxShadow: "0 20px 50px rgba(18,48,28,.35)" }}>
          {f.map((v, k) => <span key={k}>{k ? <span style={{ opacity: 0.5 }}>-</span> : null}<span style={{ color: k === hi || hi < 0 ? [GREEN2, "#ffb46b", "#c79bff"][k] : "#fff" }}>{v}</span></span>)}
        </span>
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={120} y1={base} x2={960} y2={base} stroke={INK} strokeWidth="8" strokeLinecap="round" />
        {f.map((v, k) => {
          const g = back(lin(t, s.a + 0.3 + k * 0.12, s.a + 0.9 + k * 0.12));
          const h = v * sc * g;
          const x = 540 + (k - 1) * (bw + gap) - bw / 2;
          const pulse = k === hi ? 1 + 0.04 * Math.sin(d * 8) : 1;
          return (
            <g key={k} transform={`translate(${x + bw / 2} ${base}) scale(${pulse}) translate(${-(x + bw / 2)} ${-base})`}>
              {k === hi && <rect x={x - 14} y={base - h - 14} width={bw + 28} height={h + 14} rx={30} fill={COLS[k]} opacity={0.25 + 0.15 * Math.sin(d * 6)} />}
              <rect x={x} y={base - h} width={bw} height={h} rx={24} fill={COLS[k]} />
              <text x={x + bw / 2} y={base - h - 24} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={70} fill={COLS[k]} opacity={clamp(g)}>{v}</text>
              <text x={x + bw / 2} y={base + 110} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={96} fill={INK}>{SYM[k]}</text>
              {hi < 0 && k < 2 && <text x={x + bw + gap / 2} y={base - h / 2 + 30} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={80} fill={INK} opacity={clamp(g)}>=</text>}
              {k === hi && <path d={`M ${x + bw / 2} ${base - h - 120 - 16 * Math.abs(Math.sin(d * 5))} l -36 -50 l 22 0 l 0 -60 l 28 0 l 0 60 l 22 0 Z`} fill={COLS[k]} opacity={clamp(g)} />}
            </g>
          );
        })}
      </svg>
    </>
  );
};

/** amount & ratio: the three bars morph through all four formulas */
const Ratio: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "ratio");
  if (!on) return null;
  const step = 1.25, i = Math.floor(d / step) % 4, k2 = (i + 1) % 4;
  const m = eio(clamp((d % step - 0.75) / 0.45));
  const cur = FORMULAS[i].map((v, k) => v + (FORMULAS[k2][k] - v) * m);
  const lbl = m < 0.5 ? FORMULAS[i] : FORMULAS[k2];
  const base = 1440, sc = 12, bw = 220, gap = 50;
  const pin = back(lin(t, s.a, s.a + 0.45));
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={1000} r={470} color={GOLD} o={0.18} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 ${base}) scale(${pin}) translate(-540 ${-base})`}>
          <line x1={120} y1={base} x2={960} y2={base} stroke={INK} strokeWidth="8" strokeLinecap="round" />
          {cur.map((v, k) => { const x = 540 + (k - 1) * (bw + gap) - bw / 2; const h = v * sc; return (
            <g key={k}><rect x={x} y={base - h} width={bw} height={h} rx={24} fill={COLS[k]} />
              <text x={x + bw / 2} y={base - h - 24} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={64} fill={COLS[k]}>{Math.round(v)}</text>
              <text x={x + bw / 2} y={base + 110} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={96} fill={INK}>{SYM[k]}</text></g>); })}
        </g>
        <g opacity={pin}><rect x={290} y={1610} width={500} height={110} rx={26} fill={INK} /><text x={540} y={1690} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={76} fill="#fff">{lbl.join("-")}</text></g>
      </svg>
    </>
  );
};

/** which formula for which need: leafy → 30-10-10 · roots → 10-52-10 · fruit → 12-12-36 */
const NEED: [string, string, number, string][] = [["leafy", "leaf", 0, "30-10-10"], ["root", "root", 1, "10-52-10"], ["fruit", "fruit", 2, "12-12-36"]];
const Choose: React.FC<{ t: number }> = ({ t }) => {
  const { on } = local(t, "choose");
  if (!on) return null;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {NEED.map(([word, icon, k, fm], i) => {
        const at = Wd(12, word) - 0.15;
        const p = back(lin(t, at, at + 0.45));
        const a2 = eio(lin(t, at + 0.25, at + 0.6));
        const q = back(lin(t, at + 0.45, at + 0.9));
        const y = 640 + i * 330;
        return (
          <g key={word} opacity={clamp(p)}>
            <g transform={`translate(230 ${y}) scale(${p})`}>
              <circle r={120} fill={COLS[k]} stroke="#fff" strokeWidth="10" />
              {icon === "leaf" && <path d="M 0 -70 C 60 -40, 60 40, 0 70 C -60 40, -60 -40, 0 -70 Z M 0 -55 L 0 70" fill="#fff" stroke={COLS[k]} strokeWidth="6" />}
              {icon === "root" && <path d="M 0 -75 L 0 10 M 0 10 C -20 35, -40 45, -55 75 M 0 10 C 20 35, 40 45, 55 75 M 0 10 L 0 75 M -25 40 L -45 30 M 25 40 L 45 30" stroke="#fff" strokeWidth="12" fill="none" strokeLinecap="round" />}
              {icon === "fruit" && <g><circle cx={0} cy={12} r={58} fill="#ff5a4e" stroke="#fff" strokeWidth="8" /><path d="M 0 -46 C 10 -70, 30 -76, 46 -70 C 34 -56, 18 -50, 0 -46 Z" fill={GREEN2} /></g>}
            </g>
            <line x1={380} y1={y} x2={380 + 150 * a2} y2={y} stroke={INK} strokeWidth="12" strokeLinecap="round" />
            {a2 > 0.9 && <path d={`M ${545} ${y - 30} L ${585} ${y} L ${545} ${y + 30}`} stroke={INK} strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <g transform={`translate(790 ${y}) scale(${q})`}><rect x={-190} y={-75} width={380} height={150} rx={30} fill={INK} /><text y={30} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={84} fill={[GREEN2, "#ffb46b", "#c79bff"][k]}>{fm}</text></g>
          </g>
        );
      })}
    </svg>
  );
};

/** big warning sign */
const Warn: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "warn");
  if (!on) return null;
  const p = back(lin(t, s.a, s.a + 0.45));
  const shake = Math.sin(d * 40) * 6 * Math.exp(-d * 3);
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={860} r={420} color={WARN} o={0.9} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${540 + shake} 860) scale(${p * (1 + 0.04 * Math.sin(d * 9))})`}>
          <path d="M 0 -250 L 280 220 L -280 220 Z" fill="#fff" stroke={INK} strokeWidth="22" strokeLinejoin="round" />
          <rect x={-22} y={-120} width={44} height={210} rx={20} fill={WARN} />
          <circle cx={0} cy={160} r={28} fill={WARN} />
        </g>
      </svg>
    </>
  );
};

/** more fertilizer ≠ better: sacks pile up next to a plant that wilts */
const More: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "more");
  if (!on) return null;
  const wilt = eio(lin(t, Wd(13, "better") - 0.2, Wd(13, "growth") + 0.4));
  const sacks = [[0, 0], [1, 0], [2, 0], [0.5, 1], [1.5, 1], [1, 2]];
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={1000} r={470} color={WARN} o={0.14} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={80} y1={1420} x2={1000} y2={1420} stroke="#7a5a3a" strokeWidth="16" strokeLinecap="round" />
        {sacks.map(([cx, row], i) => {
          const at = s.a + 0.1 + i * 0.28;
          const p = back(lin(t, at, at + 0.35));
          const x = 170 + cx * 175, y = 1420 - 80 - row * 145 - (1 - clamp(p)) * 700;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(1.18)`} opacity={clamp(lin(t, at, at + 0.05))}>
              <path d="M -66 -60 Q -70 -76 -50 -78 L 50 -78 Q 70 -76 66 -60 L 72 56 Q 74 66 60 66 L -60 66 Q -74 66 -72 56 Z" fill="#fbfaf4" stroke={INK} strokeWidth="6" />
              <rect x={-44} y={-40} width={88} height={34} rx={8} fill={GREEN} />
              <text y={-15} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={24} fill="#fff">NPK</text>
            </g>
          );
        })}
        {/* the plant */}
        <g transform="translate(740 1420) scale(1.5)">
          <path d={`M 0 0 C 0 -120, ${40 * wilt} -220, ${110 * wilt} ${-330 + 110 * wilt}`} stroke={wilt > 0.5 ? "#9a8a3a" : "#3c9a4a"} strokeWidth="18" fill="none" strokeLinecap="round" />
          {[0.45, 0.75, 1].map((k, i) => {
            const x = 110 * wilt * k * k, y = (-330 + 110 * wilt) * k;
            const c = wilt > 0.4 ? `hsl(${120 - 75 * wilt}, 55%, ${45 + 10 * wilt}%)` : GREEN2;
            return <ellipse key={i} cx={x + (i % 2 ? 50 : -50)} cy={y + 30 * wilt} rx={70} ry={28} fill={c} stroke={INK} strokeWidth="5" transform={`rotate(${(i % 2 ? -30 : 30) + 60 * wilt * (i % 2 ? 1 : -1)} ${x + (i % 2 ? 50 : -50)} ${y + 30 * wilt})`} />;
          })}
        </g>
        {wilt > 0.3 && <g opacity={wilt} transform={`translate(760 ${700 - 20 * Math.sin(d * 5)})`}><path d="M 0 60 L -50 0 L -20 0 L -20 -70 L 20 -70 L 20 0 L 50 0 Z" fill={WARN} /></g>}
      </svg>
    </>
  );
};

/** damaged roots + falling quality meter */
const Damage: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "damage");
  if (!on) return null;
  const burn = eio(lin(t, s.a + 0.2, s.a + 1.0));
  const qa = Wd(13, "reduce") - 0.1;
  const q = eio(lin(t, qa, qa + 0.9));
  const show2 = lin(t, qa - 0.2, qa);
  const roots = ["M 540 620 L 540 900", "M 540 760 C 470 820, 400 860, 330 960", "M 540 760 C 610 820, 680 860, 750 960", "M 540 860 C 500 940, 470 1010, 430 1100", "M 540 860 C 580 940, 610 1010, 650 1100", "M 540 900 L 540 1130"];
  return (
    <>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g opacity={1 - show2} transform={`translate(${Math.sin(d * 30) * 4 * burn} 0)`}>
          <rect x={140} y={600} width={800} height={620} rx={40} fill="#6b4a2f" />
          {roots.map((r, i) => <path key={i} d={r} stroke={burn > 0.5 ? "#4a2a1a" : "#f1d9a8"} strokeWidth={16 - i} fill="none" strokeLinecap="round" />)}
          {roots.map((r, i) => <path key={"b" + i} d={r} stroke={WARN} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - burn} opacity=".85" />)}
          <path d="M 540 620 L 540 470" stroke="#3c9a4a" strokeWidth="18" strokeLinecap="round" />
          <g transform={`translate(800 680) scale(${back(lin(t, s.a + 0.6, s.a + 1))})`}><circle r={80} fill={WARN} stroke="#fff" strokeWidth="8" /><path d="M -34 -34 L 34 34 M 34 -34 L -34 34" stroke="#fff" strokeWidth="16" strokeLinecap="round" /></g>
        </g>
        <g opacity={show2}>
          <circle cx={540} cy={880} r={300} fill="#fff" stroke={INK} strokeWidth="10" />
          {Array.from({ length: 5 }).map((_, i) => { const lit = (1 - q) * 5 > i; return <path key={i} d={`M ${540} ${880} L ${540 + 260 * Math.cos(Math.PI + (i + 0.08) * Math.PI / 5)} ${880 + 260 * Math.sin(Math.PI + (i + 0.08) * Math.PI / 5)} A 260 260 0 0 1 ${540 + 260 * Math.cos(Math.PI + (i + 0.92) * Math.PI / 5)} ${880 + 260 * Math.sin(Math.PI + (i + 0.92) * Math.PI / 5)} Z`} fill={["#e5484d", "#f08a24", "#f6d27a", "#8fdc74", "#2fae5b"][i]} opacity={lit ? 1 : 0.18} />; })}
          <line x1={540} y1={880} x2={540 + 220 * Math.cos(Math.PI + (0.92 - 0.82 * q) * Math.PI)} y2={880 + 220 * Math.sin(Math.PI + (0.92 - 0.82 * q) * Math.PI)} stroke={INK} strokeWidth="16" strokeLinecap="round" />
          <circle cx={540} cy={880} r={26} fill={INK} />
          <g transform="translate(540 1060)"><circle cx={0} cy={0} r={70} fill={q > 0.5 ? "#a8794a" : "#ff5a4e"} stroke={INK} strokeWidth="6" /><path d="M 0 -60 C 10 -86, 30 -92, 46 -86 C 34 -72, 18 -66, 0 -60 Z" fill={q > 0.5 ? "#9a8a3a" : GREEN2} /></g>
        </g>
      </svg>
    </>
  );
};

/** know what your plant needs: a plant with N? P? K? bubbles that get ticked */
const Know: React.FC<{ t: number }> = ({ t }) => {
  const { s, d, on } = local(t, "know");
  if (!on) return null;
  const p = back(lin(t, s.a, s.a + 0.5));
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={1060} r={430} color={GREEN} o={0.85} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(540 1420) scale(${p})`}>
          <path d="M -150 0 L 150 0 L 120 170 L -120 170 Z" fill="#c9784a" stroke={INK} strokeWidth="8" />
          <path d={`M 0 0 C 0 -150, ${10 * Math.sin(d * 2)} -300, 0 -460`} stroke="#2f7a3a" strokeWidth="20" fill="none" strokeLinecap="round" />
          {[[-1, -200], [1, -300], [-1, -380]].map(([sd, y], i) => <ellipse key={i} cx={sd * 80} cy={y} rx={95} ry={38} fill={GREEN2} stroke={INK} strokeWidth="6" transform={`rotate(${sd * -25} ${sd * 80} ${y})`} />)}
        </g>
        {SYM.map((sy, k) => {
          const at = s.a + 0.35 + k * 0.3;
          const q = back(lin(t, at, at + 0.4));
          const tick = eio(lin(t, Wd(14, "needs") - 0.2 + k * 0.15, Wd(14, "needs") + 0.2 + k * 0.15));
          const x = 220 + k * 320, y = 740 + (k === 1 ? -30 : 30) + Math.sin(d * 3 + k) * 12;
          return (
            <g key={sy} transform={`translate(${x} ${y}) scale(${q})`}>
              <circle r={110} fill={COLS[k]} stroke="#fff" strokeWidth="10" />
              <text y={36} textAnchor="middle" fontFamily={DISP} fontWeight={700} fontSize={100} fill="#fff">{sy}{tick < 0.5 ? "?" : ""}</text>
              {tick > 0 && <g transform={`translate(80 -80) scale(${back(tick)})`}><circle r={44} fill="#fff" stroke={COLS[k]} strokeWidth="6" /><path d="M -20 0 L -5 16 L 22 -16" stroke={COLS[k]} strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>}
            </g>
          );
        })}
      </svg>
    </>
  );
};

// ---------- end card ----------
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const { s, on } = local(t, "end");
  if (!on) return null;
  const p = back(lin(t, s.a, s.a + 0.55));
  const f = eo(lin(t, s.a + 0.3, s.a + 0.7));
  return (
    <>
      <Disc t={t} a={s.a} x={540} y={820} r={330} color={GREEN} o={0.9} />
      <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: 540 - 260, top: 820 - 260, width: 520, height: 520, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, filter: "drop-shadow(0 16px 30px rgba(18,48,28,.4))" }} />
      <div style={{ position: "absolute", left: 0, width: W, top: 1200, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 92, color: INK, opacity: f, transform: `translateY(${(1 - f) * 30}px)` }}>Art<span style={{ color: GREEN }}> of </span>Agriculture</div>
      <div style={{ position: "absolute", left: 0, width: W, top: 1330, textAlign: "center", opacity: f }}>
        <span style={{ display: "inline-block", padding: "10px 34px", borderRadius: 60, background: GREEN, fontFamily: BODY, fontWeight: 800, fontSize: 52, color: "#fff" }}>@ArtofAgriculture</span>
      </div>
      {[["Knowledge Today,", Wd(15, "knowledge"), INK], ["Better Farming Tomorrow!", Wd(15, "better"), GREEN]].map(([txt, at, c], i) => {
        const q = back(lin(t, (at as number) - 0.05, (at as number) + 0.4));
        return <div key={i} style={{ position: "absolute", left: 0, width: W, top: 1490 + i * 100, textAlign: "center", fontFamily: DISP, fontWeight: 700, fontSize: 70, color: c as string, opacity: clamp(q), transform: `scale(${0.7 + 0.3 * q})` }}>{txt as string}</div>;
      })}
    </>
  );
};

// ---------- watermark (channel rule: small logo that changes corner per section + faint moving text) ----------
const WM_SPOTS = [
  { at: 0, x: W - 160, y: 60 },
  { at: S(3) - 0.05, x: 50, y: 60 },
  { at: S(4) - 0.05, x: W - 160, y: H - 170 },
  { at: S(5) - 0.05, x: 50, y: H - 170 },
  { at: S(6) - 0.05, x: W - 160, y: 60 },
  { at: S(7) - 0.05, x: 50, y: 60 },
  { at: S(8) - 0.05, x: W - 160, y: 50 },
  { at: S(9) - 0.05, x: 50, y: 50 },
  { at: S(10) - 0.05, x: W - 160, y: 50 },
  { at: S(11) - 0.05, x: 50, y: 50 },
  { at: S(12) - 0.05, x: W - 160, y: H - 170 },
  { at: S(13) - 0.05, x: 50, y: H - 170 },
  { at: S(14) - 0.05, x: W - 160, y: 50 },
];
const WM_OFF = S(15) - 0.3;
const spotAt = (t: number) => { let i = 0; for (let k = 0; k < WM_SPOTS.length; k++) if (t >= WM_SPOTS[k].at) i = k; return i; };
const Watermark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  const i = spotAt(t), s = WM_SPOTS[i], next = WM_SPOTS[i + 1];
  const fin = i === 0 ? lin(t, 0.8, 1.4) : lin(t, s.at, s.at + 0.6);
  const fout = Math.max(next ? lin(t, next.at - 0.4, next.at) : 0, lin(t, WM_OFF, WM_OFF + 0.4));
  const o = Math.min(fin, 1 - fout);
  if (o <= 0) return null;
  return <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: s.x, top: s.y, width: 120, height: 120, opacity: 0.9 * o, transform: `scale(${0.9 + 0.1 * eo(fin)})`, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.45))" }} />;
};
const TextMark: React.FC<{ t: number; dark: boolean }> = ({ t, dark }) => {
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
    <div style={{ position: "absolute", left: x, top: top ? H - 120 : 90, width: 560, textAlign: fromLeft ? "left" : "right", fontFamily: DISP, fontWeight: 700, fontSize: 38, letterSpacing: 3, color: dark ? "#fff" : INK, opacity: 0.4 * o, textShadow: dark ? "0 2px 8px rgba(0,0,0,.65)" : "none" }}>
      Art<span style={{ fontWeight: 400, color: dark ? GOLD2 : GREEN }}>of</span>Agriculture
    </div>
  );
};

// ---------- words (big keywords only) ----------
type Tt = { a: number; b: number; small?: string; big: string; y: number; size?: number; box?: string; color?: string; smallAt?: number };
const TITLES: Tt[] = [
  { a: Wd(1, "numbers") - 0.1, b: Wd(1, "fertilizer") - 0.05, small: "the", big: "NUMBERS", y: 1560, size: 150, box: GREEN },
  { a: Wd(1, "fertilizer") - 0.05, b: Wd(1, "20-20-20") - 0.05, small: "on fertilizer", big: "BAGS", y: 200, size: 150 },
  { a: Wd(1, "20-20-20") - 0.05, b: Wd(1, "10-52-10") - 0.05, small: "like", big: "20-20-20", y: 200, size: 140, box: GREEN },
  { a: Wd(1, "10-52-10") - 0.05, b: S(2) - 0.05, small: "or", big: "10-52-10", y: 200, size: 140, box: PC },
  { a: Wd(2, "aren't") - 0.05, b: Wd(2, "they") - 0.05, small: "not", big: "RANDOM!", y: 260, size: 160, box: GOLD, smallAt: Wd(2, "aren't") - 0.05 },
  { a: Wd(2, "how") - 0.1, b: Wd(2, "three") - 0.05, small: "they tell us", big: "HOW MUCH", y: 1420, size: 130 },
  { a: Wd(2, "nutrients") - 0.05, b: Wd(2, "nitrogen") - 0.1, small: "of three", big: "NUTRIENTS", y: 1480, size: 140, box: GREEN },
  { a: Wd(2, "n-p-k") - 0.1, b: S(3) - 0.05, small: "also known as", big: "N P K", y: 300, size: 190, box: INK, smallAt: Wd(2, "also") },
  { a: Wd(3, "each") - 0.05, b: S(4) - 0.05, small: "what does", big: "EACH ONE DO?", y: 1440, size: 120 },
  { a: Wd(4, "nitrogen") - 0.1, b: Wd(4, "it's") - 0.05, small: "let's start with", big: "NITROGEN", y: 1460, size: 128, box: NC },
  { a: Wd(4, "leaves") - 0.1, b: Wd(4, "it") - 0.05, small: "grows", big: "LEAVES & STEMS", y: 1480, size: 110 },
  { a: Wd(4, "chlorophyll") - 0.15, b: Wd(4, "keeping") - 0.05, small: "produces", big: "CHLOROPHYLL", y: 220, size: 120, box: NC },
  { a: Wd(4, "green") - 0.1, b: S(5) - 0.05, small: "keeps leaves", big: "GREEN", y: 1440, size: 170, color: GREEN2 },
  { a: Wd(5, "phosphorus") - 0.1, b: Wd(5, "which") - 0.05, small: "next comes", big: "PHOSPHORUS", y: 1460, size: 110, box: PC },
  { a: Wd(5, "energy") - 0.1, b: Wd(5, "it") - 0.05, small: "the plant's", big: "ENERGY", y: 220, size: 170, box: PC },
  { a: Wd(5, "roots") - 0.1, b: Wd(5, "and") - 0.05, small: "helps", big: "ROOTS", y: 1440, size: 170, color: GOLD2 },
  { a: Wd(5, "flowering") - 0.1, b: S(6) - 0.05, small: "flowering &", big: "SEEDS", y: 240, size: 150, box: PC, smallAt: Wd(5, "flowering") - 0.1 },
  { a: Wd(6, "potassium") - 0.1, b: Wd(6, "it") - 0.05, small: "and then", big: "POTASSIUM", y: 1460, size: 120, box: KC },
  { a: Wd(6, "regulate") - 0.1, b: Wd(6, "move") - 0.05, small: "regulates", big: "WATER", y: 1440, size: 170, color: "#d9b8ff" },
  { a: Wd(6, "sugars") - 0.1, b: Wd(6, "and", 1) - 0.05, small: "moves", big: "SUGARS", y: 220, size: 160, box: KC },
  { a: Wd(6, "tolerant") - 0.1, b: S(7) - 0.05, small: "more tolerant to", big: "STRESS", y: 1480, size: 160, box: KC, smallAt: Wd(6, "tolerant") - 0.1 },
  { a: Wd(7, "commonly") - 0.1, b: S(8) - 0.05, small: "most commonly used", big: "NPK FORMULAS", y: 250, size: 116, box: GREEN },
  { a: Wd(8, "equal") - 0.1, b: Wd(8, "and") - 0.05, small: "contains", big: "EQUAL AMOUNTS", y: 1660, size: 104 },
  { a: Wd(8, "general") - 0.1, b: S(9) - 0.05, small: "general feeding of", big: "MANY PLANTS", y: 1440, size: 130 },
  { a: Wd(9, "more") - 0.1, b: Wd(9, "it's") - 0.05, small: "contains", big: "MORE NITROGEN", y: 1660, size: 104, color: NC },
  { a: Wd(9, "leaves") - 0.1, b: S(10) - 0.05, small: "more leaves, stems &", big: "GREEN GROWTH", y: 1440, size: 116, color: GREEN2 },
  { a: Wd(10, "rich") - 0.1, b: Wd(10, "and") - 0.05, small: "especially rich in", big: "PHOSPHORUS", y: 1660, size: 110, color: PC },
  { a: Wd(10, "early") - 0.1, b: Wd(10, "and", 1) - 0.05, small: "used in", big: "EARLY GROWTH", y: 1440, size: 124, color: GOLD2 },
  { a: Wd(10, "root") - 0.1, b: S(11) - 0.05, small: "supports", big: "ROOT DEVELOPMENT", y: 1440, size: 100, color: GOLD2 },
  { a: Wd(11, "high") - 0.1, b: Wd(11, "it") - 0.05, small: "a high amount of", big: "POTASSIUM", y: 1660, size: 110, color: KC },
  { a: Wd(11, "sugar") - 0.1, b: Wd(11, "and", 1) - 0.05, small: "helps", big: "SUGAR TRANSPORT", y: 1480, size: 104, box: KC },
  { a: Wd(11, "fruit") - 0.1, b: S(12) - 0.05, small: "improves", big: "FRUIT QUALITY", y: 1440, size: 124, color: "#ffb4b4" },
  { a: Wd(12, "difference") - 0.1, b: Wd(12, "depending") - 0.05, small: "the main difference", big: "AMOUNT & RATIO", y: 230, size: 116, box: GOLD },
  { a: Wd(12, "depending") - 0.1, b: Wd(12, "it") - 0.05, small: "it depends on", big: "WHAT IT NEEDS", y: 230, size: 116, box: GREEN },
  { a: Wd(12, "different") - 0.1, b: S(13) - 0.05, small: "a different", big: "NPK FORMULA", y: 1520, size: 124, box: GREEN },
  { a: Wd(13, "important") - 0.1, b: Wd(13, "more") - 0.05, small: "something important to", big: "REMEMBER!", y: 1460, size: 140, box: WARN },
  { a: Wd(13, "more") - 0.05, b: Wd(13, "overusing") - 0.05, small: "more fertilizer", big: "≠ BETTER GROWTH", y: 230, size: 104, box: WARN },
  { a: Wd(13, "overusing") - 0.1, b: Wd(13, "damage") - 0.05, small: "overuse upsets the", big: "BALANCE", y: 1440, size: 160, color: "#ffd166" },
  { a: Wd(13, "damage") - 0.1, b: Wd(13, "even") - 0.05, small: "can", big: "DAMAGE ROOTS", y: 230, size: 120, box: WARN },
  { a: Wd(13, "reduce") - 0.1, b: S(14) - 0.05, small: "and reduce", big: "CROP QUALITY", y: 230, size: 120, box: WARN },
  { a: Wd(14, "before") - 0.1, b: Wd(14, "make") - 0.05, small: "before choosing", big: "A FERTILIZER", y: 1440, size: 124 },
  { a: Wd(14, "know") - 0.1, b: S(15) - 0.05, small: "know what your plant", big: "ACTUALLY NEEDS", y: 230, size: 110, box: GREEN },
];

// ---------- frame ----------
const Frame: React.FC<{ t: number; preview: boolean }> = ({ t, preview }) => {
  const cur = sceneAt(t);
  const i = SC.indexOf(cur);
  const prev = i > 0 && t < cur.a + WHIP ? SC[i - 1] : null;
  const dark = cur.mode === "full";
  const z = camera(t);
  const render = (s: Scene) => {
    const w = whipOf(t, s);
    let outX = 0, outBlur = 0;
    if (s !== cur) { const q = eo(lin(t, cur.a, cur.a + WHIP)); const dir = SC.indexOf(cur) % 2 ? -1 : 1; outX = -q * W * 0.55 * dir; outBlur = q * 26; }
    return (
      <AbsoluteFill key={s.id} style={{ transform: `translateX(${s === cur ? w.x : outX}px) scale(${s === cur ? w.s : 1})`, filter: `blur(${s === cur ? w.blur : outBlur}px)` }}>
        {s.mode !== "full" && <Paper t={t} tint={s.tint} />}
        {s.mode === "full" && <Full s={s} />}
        {s.mode === "circle" && <Circle t={t} s={s} />}
        {s.mode === "card" && <Card t={t} s={s} />}
        {s.id === "bag" && <Bag t={t} />}
        {s.id === "random" && <Random t={t} />}
        {s.id === "tiles" && <Tiles t={t} />}
        {(s.id === "N" || s.id === "P" || s.id === "K") && <Hero t={t} id={s.id} />}
        {s.id === "chloro" && <Chloro t={t} />}
        {s.id === "energy" && <Energy t={t} />}
        {s.id === "sugar" && <Sugar t={t} />}
        {s.id === "chart" && <Chart t={t} />}
        {s.id === "end" && <EndCard t={t} />}
        {s.id === "f20" && <Formula t={t} id="f20" f={[20, 20, 20]} hi={-1} />}
        {s.id === "f30" && <Formula t={t} id="f30" f={[30, 10, 10]} hi={0} />}
        {s.id === "f10" && <Formula t={t} id="f10" f={[10, 52, 10]} hi={1} />}
        {s.id === "f12" && <Formula t={t} id="f12" f={[12, 12, 36]} hi={2} />}
        {s.id === "ratio" && <Ratio t={t} />}
        {s.id === "choose" && <Choose t={t} />}
        {s.id === "warn" && <Warn t={t} />}
        {s.id === "more" && <More t={t} />}
        {s.id === "damage" && <Damage t={t} />}
        {s.id === "know" && <Know t={t} />}
      </AbsoluteFill>
    );
  };
  return (
    <FootageTime.Provider value={t}>
      <AbsoluteFill style={{ background: PAPER, overflow: "hidden" }}>
        <AbsoluteFill style={{ transform: `scale(${z})` }}>
          {prev && render(prev)}
          {render(cur)}
        </AbsoluteFill>
        <Motes t={t} dark={dark} />
        {/* icon chips beside the footage */}
        <Chip t={t} at={Wd(5, "flowering") - 0.05} until={S(6) - 0.05} x={170} y={1400} color={PC} icon="flower" />
        <Chip t={t} at={Wd(5, "seed") - 0.05} until={S(6) - 0.05} x={910} y={1420} color={PC} icon="seed" />
        <Chip t={t} at={Wd(6, "water") - 0.2} until={Wd(6, "move") - 0.05} x={540} y={420} color={KC} icon="drop" />
        {TITLES.map((w) => <Title key={w.big + w.a} t={t} {...w} dark={sceneAt((w.a + w.b) / 2).mode !== "full"} />)}
        <Sparkle t={t} at={Wd(2, "n-p-k") + 0.15} x={860} y={420} />
        <Sparkle t={t} at={Wd(4, "green") + 0.1} x={860} y={1500} size={1.1} />
        <Sparkle t={t} at={Wd(15, "tomorrow") + 0.2} x={880} y={1560} size={0.9} />
        <Watermark t={t} />
        <TextMark t={t} dark={dark} />
        {!preview && <Audio src={staticFile("v22/mix.wav")} />}
      </AbsoluteFill>
    </FootageTime.Provider>
  );
};

const V22Video: React.FC<{ times?: number[]; silent?: boolean }> = ({ times, silent }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return <Frame t={times ? times[f] ?? 0 : f / fps} preview={!!times || !!silent} />;
};

export const LOOK = SC.map((s) => {
  const tt = TITLES.filter((x) => x.a >= s.a - 0.1 && x.a < s.b).pop();
  const at = tt ? Math.min(s.b - 0.08, tt.a + 0.55) : s.a + Math.max(0.6, (s.b - s.a) * 0.6);
  return +Math.min(s.b - 0.08, at).toFixed(2);
}).concat([+(Wd(1, "20-20-20") + 0.5).toFixed(2), +(Wd(4, "chlorophyll") + 0.9).toFixed(2), +(Wd(5, "processes") + 0.5).toFixed(2), +(S(7) + 2.6).toFixed(2), +(Wd(12, "production") + 0.6).toFixed(2), +(Wd(13, "growth") + 0.5).toFixed(2), +(Wd(13, "damage") + 0.9).toFixed(2), +(Wd(14, "needs") + 0.6).toFixed(2), +(Wd(15, "tomorrow") + 0.6).toFixed(2)]).sort((a, b) => a - b);
export const V22: React.FC = () => (
  <>
    <Composition id="V22-NPK" component={V22Video} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="V22-NPK-Silent" component={V22Video} durationInFrames={Math.round(END * FPS)} fps={FPS} width={W} height={H} defaultProps={{ silent: true }} />
    <Composition id="V22-NPK-Look" component={V22Video} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
  </>
);
