// v11 film: the 19 storyboard shots on the voiceover timeline, varied transitions, word-timed subtitles.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Defs, Paper, C, INK, FONT } from "./art";
import { Defs2 } from "./art2";
import { SCENE_FNS, LIVE } from "./scenes2";
import vo from "./vo.json";
import envRaw from "./env.json";

export const FPS = 30;
const env = envRaw as number[];
type Word = { w: string; s: number; e: number; line: number };
const WORDS = vo.words as Word[];
const SEGS = vo.segs as { n: number; start: number; end: number }[];
export const FILM_FRAMES = Math.ceil(vo.total * FPS);

// shot i ↔ voice line i+1 ; cut a few frames before the line starts
const starts = SEGS.map((s, i) => (i === 0 ? 0 : Math.round(s.start * FPS) - 6));
const ends = starts.map((_, i) => (i < starts.length - 1 ? starts[i + 1] : FILM_FRAMES));
const TR = 12; // transition length (frames)
type TrType = "zoom" | "whip" | "flash" | "splash" | "leaf" | "dive" | "rise" | "iris" | "fade" | "whipL";
const TRS: TrType[] = ["zoom", "whip", "flash", "splash", "leaf", "dive", "rise", "zoom", "whipL", "iris", "leaf", "iris", "flash", "iris", "whip", "flash", "zoom", "fade", "leaf"];

const norm = (w: string) => w.toLowerCase().replace(/[^a-z']/g, "");
function cueFor(i: number) {
  const ws = WORDS.filter((w) => w.line === i + 1);
  return (q: string) => { const w = ws.find((x) => norm(x.w).startsWith(q)); return w ? Math.round(w.s * FPS) - starts[i] : undefined; };
}
const CUES = SEGS.map((_, i) => cueFor(i));

const Shot: React.FC<{ i: number; f: number }> = ({ i, f }) => {
  const t = f - starts[i];
  LIVE.talk = (lt: number) => { const k = Math.round(starts[i] + lt); return Math.min(1, (env[k] ?? 0) * 1.2); };
  LIVE.cue = CUES[i];
  const node = SCENE_FNS[i](t, ends[i] - starts[i]);
  LIVE.talk = null; LIVE.cue = null;
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <Defs /><Defs2 />
      <g filter="url(#gwob)">{node}</g>
    </svg>
  );
};

// ---------------------------------------------------------------- subtitles (word-timed chunks)
const KEY = /^(fun|question|soil|handful|survive|attached|hydroponics|nutrients|minerals|nutrient-rich|water|coconut|coir|perlite|cool|recycled|collected|smart|chef|recipe|greenhouses|urban|farm|lettuce|spinach|basil|mint|tomatoes|cucumbers|bell|peppers|strawberries|salad|touching|light|oxygen|effort|future|pipes|tanks|subscribe|artofagriculture)$/;
type Chunk = { words: Word[]; s: number; e: number };
const CHUNKS: Chunk[] = (() => {
  const out: Chunk[] = [];
  for (const seg of SEGS) {
    let ws = WORDS.filter((w) => w.line === seg.n);
    // brand name as one word
    const merged: Word[] = [];
    for (let k = 0; k < ws.length; k++) {
      if (norm(ws[k].w) === "art" && ws[k + 2] && norm(ws[k + 2].w).startsWith("agriculture")) { merged.push({ ...ws[k], w: "ArtofAgriculture", e: ws[k + 2].e }); k += 2; }
      else merged.push(ws[k]);
    }
    ws = merged;
    let cur: Word[] = [];
    const flush = () => { if (cur.length) out.push({ words: cur, s: cur[0].s, e: cur[cur.length - 1].e }); cur = []; };
    for (const w of ws) {
      cur.push(w);
      const len = cur.map((x) => x.w).join(" ").length;
      if (/[.?!,:]$/.test(w.w) && len > 14 || len > 34 || cur.length >= 7) flush();
    }
    flush();
  }
  for (let k = 0; k < out.length; k++) out[k].e = k + 1 < out.length ? Math.min(out[k + 1].s, out[k].e + 0.6) : out[k].e + 0.6;
  return out;
})();

const Subtitle: React.FC<{ f: number }> = ({ f }) => {
  const ts = f / FPS;
  const ch = CHUNKS.find((c) => ts >= c.s - 0.05 && ts < c.e);
  if (!ch) return null;
  const txt = ch.words.map((w) => w.w);
  // split into two lines when long
  const full = txt.join(" ");
  let lines: Word[][] = [ch.words];
  if (full.length > 22) {
    let acc = 0, cut = 1;
    for (let k = 0; k < txt.length; k++) { acc += txt[k].length + 1; if (acc >= full.length / 2) { cut = k + 1; break; } }
    lines = [ch.words.slice(0, cut), ch.words.slice(cut)].filter((l) => l.length);
  }
  const pop = Math.min(1, (ts - ch.s + 0.05) / 0.12);
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(540 1390) scale(${0.92 + 0.08 * pop}) translate(-540 -1390)`} opacity={pop}>
        {lines.map((ln, li) => (
          <text key={li} x="540" y={1390 + li * 78 - (lines.length - 1) * 39} textAnchor="middle" fontFamily={FONT} fontWeight="600" fontSize="64"
            fill="#fff" stroke={INK} strokeWidth="13" strokeLinejoin="round" paintOrder="stroke">
            {ln.map((w, j) => {
              const k = KEY.test(norm(w.w));
              const said = ts >= w.s - 0.02;
              return <tspan key={j} fill={k ? (said ? C.yellow : "#fff3b0") : "#fff"}>{(j ? " " : "") + w.w}</tspan>;
            })}
          </text>
        ))}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- transitions
const LeafWipe: React.FC<{ p: number }> = ({ p }) => {
  const x = -1400 + p * 3000;
  return <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${x} 960) rotate(-20) scale(7)`}>
      <path d="M -120 0 C -60 -110 80 -120 160 0 C 80 120 -60 110 -120 0 Z" fill="#4fae3a" stroke={INK} strokeWidth="2" />
      <path d="M -110 0 L 150 0 M -20 0 L 30 -50 M 40 0 L 90 -40 M -20 0 L 30 50 M 40 0 L 90 40" stroke="#2f6e22" strokeWidth="3" fill="none" />
    </g>
  </svg>;
};
const SplashWipe: React.FC<{ p: number }> = ({ p }) => {
  const h = Math.sin(p * Math.PI) * 2300 - 100;
  let d = `M -50 2000 L -50 ${1920 - h}`;
  for (let x = -50; x <= 1130; x += 40) d += ` L ${x} ${1920 - h + Math.sin(x / 70 + p * 12) * 40}`;
  d += " L 1130 2000 Z";
  return <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
    <path d={d} fill="#3fc1d8" stroke="#1f7f99" strokeWidth="8" />
    {Array.from({ length: 14 }, (_, i) => <circle key={i} cx={(i * 83) % 1080} cy={1920 - h - 60 - (i % 4) * 50} r={12 + (i % 3) * 8} fill="#bff3ff" opacity={Math.sin(p * Math.PI)} />)}
  </svg>;
};

export const Film: React.FC<{ at?: number }> = ({ at }) => {
  const cf = useCurrentFrame();
  const f = at ?? cf;
  let i = starts.length - 1;
  for (let k = 0; k < starts.length; k++) if (f >= starts[k]) i = k;
  // transition window around the cut into shot i (and into i+1)
  const into = i > 0 && f < starts[i] + TR / 2 ? i : i + 1 < starts.length && f >= starts[i + 1] - TR / 2 ? i + 1 : -1;
  let layers: React.ReactNode;
  if (into < 0) layers = <Shot i={i} f={f} />;
  else {
    const p = (f - (starts[into] - TR / 2)) / TR; // 0..1
    const a = into - 1, b = into, type = TRS[into];
    const A = <Shot i={a} f={f} />, B = <Shot i={b} f={f} />;
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    const st = (x: React.CSSProperties) => ({ position: "absolute" as const, inset: 0, ...x });
    switch (type) {
      case "zoom": layers = <><div style={st({ transform: `scale(${1 + e * 1.6})`, opacity: 1 - e })}>{A}</div><div style={st({ transform: `scale(${0.6 + 0.4 * e})`, opacity: e })}>{B}</div></>; break;
      case "whip": case "whipL": { const s = type === "whip" ? -1 : 1; layers = <><div style={st({ transform: `translateX(${s * e * 1080}px)`, filter: `blur(${Math.sin(p * Math.PI) * 18}px)` })}>{A}</div><div style={st({ transform: `translateX(${-s * (1 - e) * 1080}px)`, filter: `blur(${Math.sin(p * Math.PI) * 18}px)` })}>{B}</div></>; break; }
      case "dive": case "rise": { const s = type === "dive" ? -1 : 1; layers = <><div style={st({ transform: `translateY(${s * e * 1920}px)` })}>{A}</div><div style={st({ transform: `translateY(${-s * (1 - e) * 1920}px)` })}>{B}</div></>; break; }
      case "iris": layers = <>{A}<div style={st({ clipPath: `circle(${e * 75}% at 50% 42%)` })}>{B}</div></>; break;
      case "fade": layers = <>{A}<div style={st({ opacity: e })}>{B}</div></>; break;
      case "flash": layers = <>{p < 0.5 ? A : B}<div style={st({ background: "#fffbe6", opacity: Math.sin(p * Math.PI) * 0.95 })} /></>; break;
      case "leaf": layers = <>{p < 0.5 ? A : B}<LeafWipe p={p} /></>; break;
      case "splash": layers = <>{p < 0.5 ? A : B}<SplashWipe p={p} /></>; break;
    }
  }
  return (
    <AbsoluteFill style={{ background: "#fbf6ea", overflow: "hidden" }}>
      <style>{`@font-face { font-family: 'Fredoka'; src: url('${staticFile("fonts/Fredoka.ttf")}') format('truetype'); font-weight: 300 700; }
@font-face { font-family: 'PatrickHand'; src: url('${staticFile("fonts/PatrickHand-Regular.ttf")}') format('truetype'); }`}</style>
      {layers}
      <Img src={staticFile("v11/paper.png")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, mixBlendMode: "multiply" }} />
      <Subtitle f={f} />
    </AbsoluteFill>
  );
};

export const LOOK_FRAMES = starts.map((s, i) => Math.round(s + (ends[i] - s) * 0.6));
export const FilmLook: React.FC = () => { const f = useCurrentFrame(); return <Film at={LOOK_FRAMES[f]} />; };

export const PaperTex: React.FC = () => (
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}><Defs /><Paper /></svg>
);
