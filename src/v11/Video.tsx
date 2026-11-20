// v11 · ArtofAgriculture – Hydroponics (YouTube Shorts, 1080×1920).
// Stage 2: visual storyboard. Board pages = real frames of the scenes + production notes.
import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame, staticFile } from "remotion";
import { Defs, Paper, C, INK, FONT } from "./art";
import { SCENE_FNS } from "./scenes2";
import { Defs2 } from "./art2";
import { SB2 as SB } from "./storyboard2";
import { Film, FilmLook, FILM_FRAMES, LOOK_FRAMES, PaperTex } from "./film";

export const V11_FPS = 30;

const fontCss = `
@font-face { font-family: 'Fredoka'; src: url('${staticFile("fonts/Fredoka.ttf")}') format('truetype'); font-weight: 300 700; }
@font-face { font-family: 'PatrickHand'; src: url('${staticFile("fonts/PatrickHand-Regular.ttf")}') format('truetype'); }
`;

// subtitle with highlighted words (*word* = highlight)
export const Sub: React.FC<{ text: string; y?: number }> = ({ text, y = 1390 }) => {
  const lines = text.split("\n");
  return (
    <g>
      {lines.map((ln, i) => (
        <text key={i} x="540" y={y + i * 74 - (lines.length - 1) * 37} textAnchor="middle" fontFamily={FONT} fontWeight="600" fontSize="60"
          fill="#fff" stroke={INK} strokeWidth="12" strokeLinejoin="round" paintOrder="stroke">
          {ln.split(/(\*[^*]+\*)/).map((p, j) => p.startsWith("*") ? <tspan key={j} fill={C.yellow}>{p.slice(1, -1)}</tspan> : <tspan key={j}>{p}</tspan>)}
        </text>
      ))}
    </g>
  );
};

export const SceneFrame: React.FC<{ i: number; t: number; sub?: string }> = ({ i, t, sub }) => {
  const D = SB[i].dur * V11_FPS;
  return (
    <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ display: "block" }}>
      <Defs />
      <Defs2 />
      <g>{SCENE_FNS[i](t, D)}</g>
      <Paper />
      {sub && <Sub text={sub} />}
    </svg>
  );
};

// ---------------------------------------------------------------- storyboard page (one per scene)
const Board: React.FC = () => {
  const i = useCurrentFrame();
  const s = SB[i];
  const t = Math.round(s.at * s.dur * V11_FPS);
  const row = (k: string, v: string, c = "#2b5a2a") => (
    <div style={{ marginBottom: 14 }}>
      <span style={{ fontWeight: 700, color: c }}>{k}: </span><span>{v}</span>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#fbf6ea", fontFamily: FONT, color: INK }}>
      <style>{fontCss}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 36px 14px" }}>
        <div style={{ background: C.green, color: "#fff", borderRadius: 40, padding: "6px 26px", fontSize: 40, fontWeight: 700 }}>Scene {i + 1}/{SB.length}</div>
        <div style={{ fontSize: 32, fontWeight: 700, flex: 1, whiteSpace: "nowrap", overflow: "hidden" }}>{s.title}</div>
        <div style={{ fontSize: 34, color: "#7a5a2a", fontWeight: 600 }}>≈ {s.dur}s</div>
      </div>
      <div style={{ display: "flex", gap: 24, padding: "0 30px" }}>
        <div style={{ width: 540, height: 960, borderRadius: 22, overflow: "hidden", border: `5px solid ${INK}`, flexShrink: 0 }}>
          <div style={{ transform: "scale(0.5)", transformOrigin: "0 0" }}><SceneFrame i={i} t={t} sub={s.sub} /></div>
        </div>
        <div style={{ fontSize: 27, lineHeight: 1.3, flex: 1 }}>
          {row("Background", s.bg)}
          {row("Characters & objects", s.chars)}
          {row("Mascot", s.mascot, "#b5651d")}
          {row("Camera / transition", s.cam, "#1f7fa0")}
          {row("Funny detail", s.fun, "#c0392b")}
        </div>
      </div>
      <div style={{ margin: "22px 30px 0", background: "#fff", border: `4px solid ${INK}`, borderRadius: 22, padding: "18px 26px", fontSize: 34, lineHeight: 1.35 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#7a5a2a", marginBottom: 6 }}>NARRATION</div>
        <i>“{s.vo}”</i>
      </div>
    </AbsoluteFill>
  );
};

// contact sheet: all scenes, 6 × 3
const Overview: React.FC = () => (
  <AbsoluteFill style={{ background: "#fbf6ea", fontFamily: FONT }}>
    <style>{fontCss}</style>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 12 }}>
      {SB.map((s, i) => (
        <div key={i} style={{ width: 340, height: 604, position: "relative", borderRadius: 12, overflow: "hidden", border: `3px solid ${INK}` }}>
          <div style={{ transform: `scale(${340 / 1080})`, transformOrigin: "0 0" }}><SceneFrame i={i} t={Math.round(s.at * s.dur * V11_FPS)} sub={s.sub} /></div>
          <div style={{ position: "absolute", left: 8, top: 8, background: C.green, color: "#fff", borderRadius: 20, padding: "2px 14px", fontSize: 26, fontWeight: 700, border: `2px solid ${INK}` }}>{i + 1}</div>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);

export const V11: React.FC = () => (
  <>
    <Composition id="V11-Board" component={Board} durationInFrames={SB.length} fps={1} width={1080} height={1330} />
    <Composition id="V11-Silent" component={Film} durationInFrames={FILM_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="V11-Look" component={FilmLook} durationInFrames={LOOK_FRAMES.length} fps={30} width={1080} height={1920} />
    <Composition id="V11-PaperTex" component={PaperTex} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="V11-Overview" component={Overview} durationInFrames={1} fps={1} width={1080} height={4324} />
  </>
);
