// v26 · THE STORY OF A SEED — 60 s vertical short, no narration. Painted American-hyperrealism look, all code.
import React, { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, Composition, continueRender, delayRender, Html5Audio, Img, staticFile, useCurrentFrame } from "remotion";
import { C, H, W, canvas, clamp, eio, eo, eob, glow, grain, lin, memo, mix, reset, rng, roundRect, vignette } from "./paint";
import { DUR, T2, T6, T7, TEND, scene1, scene2Macro, scene2Sky, scene5, scene6, scene7, underground } from "./scenes";

const FPS = 30;
export const V26_FRAMES = Math.round(DUR * FPS);
const SERIF = "LibreBaskerville", DISP = "Sora";
const GOLD = "#e9c46a";

let fontsP: Promise<unknown> | null = null;
const loadFonts = () =>
  (fontsP ??= Promise.all([
    new FontFace(SERIF, `url('${staticFile("fonts/LibreBaskerville.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
    new FontFace(DISP, `url('${staticFile("fonts/Sora-Bold.woff2")}') format('woff2')`, { weight: "700" }).load(),
  ]).then((fs) => fs.forEach((f) => document.fonts.add(f))));

// ---------------- frame boxes (the creative transitions) ----------------
type Box = { cx: number; cy: number; s: number; o: number; r?: number };
const FULL: Box = { cx: W / 2, cy: H / 2, s: 1, o: 1 };
const lerpBox = (a: Box, b: Box, p: number): Box => ({ cx: mix(a.cx, b.cx, p), cy: mix(a.cy, b.cy, p), s: mix(a.s, b.s, p), o: mix(a.o, b.o, p), r: mix(a.r ?? 0, b.r ?? 0, p) });
const M = 64;
const corner = (k: "TL" | "TR" | "BL" | "BR", s: number, dy = 0): Box => ({
  cx: k.endsWith("L") ? M + (W * s) / 2 : W - M - (W * s) / 2,
  cy: (k.startsWith("T") ? 170 + (H * s) / 2 : H - 330 - (H * s) / 2) + dy,
  s, o: 1, r: 34,
});

function layer(c: C, buf: HTMLCanvasElement, draw: (c: C) => void, b: Box) {
  if (b.o <= 0.001 || b.s <= 0.001) return;
  if (b.s > 0.999 && b.o > 0.999 && Math.abs(b.cx - W / 2) < 0.5 && Math.abs(b.cy - H / 2) < 0.5) {
    c.save(); draw(c); c.restore(); reset(c);
    return;
  }
  const bc = buf.getContext("2d")!;
  reset(bc); bc.clearRect(0, 0, W, H);
  bc.save(); draw(bc); bc.restore();
  const w = W * b.s, h = H * b.s, x = b.cx - w / 2, y = b.cy - h / 2, r = (b.r ?? 0) * clamp(b.s * 3);
  c.save();
  c.globalAlpha = b.o;
  // soft drop shadow under the floating frame
  c.shadowColor = "rgba(0,0,0,0.55)"; c.shadowBlur = 50 * b.s + 10; c.shadowOffsetY = 18 * b.s;
  roundRect(c, x, y, w, h, r); c.fillStyle = "#000"; c.fill();
  c.shadowColor = "transparent";
  c.save(); roundRect(c, x, y, w, h, r); c.clip();
  c.drawImage(buf, x, y, w, h);
  c.restore();
  // thin warm hairline border, like a mounted print
  if (b.s < 0.98) {
    c.strokeStyle = `rgba(255,236,200,${0.55 * clamp((1 - b.s) * 4)})`; c.lineWidth = 2.5;
    roundRect(c, x, y, w, h, r); c.stroke();
  }
  c.restore();
}

function endBackdrop(c: C, T: number) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#14261a"); g.addColorStop(0.55, "#1d3522"); g.addColorStop(1, "#0d1810");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  glow(c, W / 2, 620, 900, "#e9c46a", 0.16);
  const r = rng(9);
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 60; i++) {
    const x = r() * W + Math.sin(T * 0.6 + i) * 20, y = (r() * H - T * (10 + r() * 20) + H * 3) % H;
    c.fillStyle = `rgba(233,196,106,${0.15 + 0.25 * r()})`;
    c.beginPath(); c.arc(x, y, 1 + r() * 2.4, 0, 6.29); c.fill();
  }
  c.restore();
}

/** draw the whole film at time T */
export function compose(c: C, T: number) {
  const A = memo("bufA", () => canvas(W, H)), B = memo("bufB", () => canvas(W, H));
  reset(c);
  c.fillStyle = "#000"; c.fillRect(0, 0, W, H);
  if (T < T2 + 0.15) {
    // S1, ending in a whip-tilt up to the sky
    const p = eio(lin(T, 7.45, 8.1));
    const blur = Math.sin(p * Math.PI);
    c.save(); c.translate(0, p * H);
    if (blur > 0.05) c.filter = `blur(${blur * 14}px)`;
    scene1(c, T); c.restore(); reset(c);
    if (p > 0) {
      c.save(); c.translate(0, -H + p * H);
      if (blur > 0.05) c.filter = `blur(${blur * 14}px)`;
      scene2Sky(c, Math.max(T, T2 - 0.6)); c.restore(); reset(c);
    }
  } else if (T < 11.3) {
    scene2Sky(c, T); reset(c);
    const p = eio(lin(T, 10.45, 11.3));
    if (p > 0) layer(c, A, (b) => scene2Macro(b, T), lerpBox({ cx: 540, cy: 1450, s: 0.16, o: 0, r: 40 }, FULL, p));
    if (p > 0 && p < 0.08) layer(c, A, (b) => scene2Macro(b, T), { cx: 540, cy: 1450, s: 0.16, o: p / 0.08, r: 40 });
  } else if (T < 15.6) {
    scene2Macro(c, T); reset(c);
  } else if (T < 17.1) {
    // corner hand-off: macro shrinks to the upper-left, underground opens from the lower-right, then takes over
    const a = eio(lin(T, 15.6, 16.2)), b = eio(lin(T, 15.9, 16.35)), cE = eio(lin(T, 16.5, 17.1));
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#1a120b"); bg.addColorStop(1, "#0b0704");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const macroBox = lerpBox(lerpBox(FULL, corner("TL", 0.4), a), { ...corner("TL", 0.4), cx: -300, o: 0 }, eio(lin(T, 16.55, 17.05)));
    const ugBox = lerpBox(lerpBox({ ...corner("BR", 0.4), s: 0.05, o: 0 }, corner("BR", 0.4), b), FULL, cE);
    if (cE < 0.5) { layer(c, A, (x) => scene2Macro(x, Math.min(T, 16.0)), macroBox); layer(c, B, (x) => underground(x, T), ugBox); }
    else { layer(c, B, (x) => underground(x, T), ugBox); layer(c, A, (x) => scene2Macro(x, 16.0), macroBox); }
  } else if (T < 30.6) {
    underground(c, T); reset(c);
  } else if (T < 34.9) {
    // S5 develops while the root keeps working in a small corner frame
    scene5(c, T); reset(c);
    const a = eio(lin(T, 30.6, 31.35)), out = eio(lin(T, 34.1, 34.9));
    const pip = lerpBox(lerpBox(FULL, corner("BL", 0.34, -60), a), { ...corner("BL", 0.34, -60), cx: -260, o: 0 }, out);
    if (a < 1 && T < 31.35) {
      // full underground frame shrinking: draw S5 under it only once it starts to move
    }
    layer(c, A, (x) => underground(x, T), pip);
  } else if (T < 38.0) {
    scene5(c, T); reset(c);
    const p = eio(lin(T, 37.4, 38.0));
    if (p > 0) {
      // close-up shrinks into the wide time-lapse (match on the seedling)
      c.globalAlpha = p; scene6(c, T6); reset(c);
      layer(c, A, (x) => scene5(x, T), { cx: mix(540, 520, p), cy: mix(960, 1100, p), s: mix(1, 0.42, p), o: 1 - p * 0.15, r: 30 * p });
    }
  } else if (T < 38.6) {
    scene6(c, T); reset(c);
    const p = lin(T, 38.0, 38.6);
    layer(c, A, (x) => scene5(x, 37.99), { cx: 520, cy: mix(1100, 1180, p), s: mix(0.42, 0.3, p), o: 0.85 * (1 - eo(p)), r: 30 });
  } else if (T < T7) {
    scene6(c, T); reset(c);
  } else if (T < TEND) {
    scene7(c, T); reset(c);
  } else {
    // branded ending: the oak becomes a framed print above the logo
    endBackdrop(c, T); reset(c);
    const p = eio(lin(T, TEND, TEND + 1.0));
    layer(c, A, (x) => scene7(x, T), lerpBox(FULL, { cx: W / 2, cy: 600, s: 0.5, o: 1, r: 34 }, p));
  }
  reset(c);
  // the light bridge S6 -> S7 (bloom swells on the music, the great oak is revealed)
  const bl = Math.max(0, 1 - Math.abs(T - T7) / 0.55);
  if (bl > 0) {
    c.save(); c.globalCompositeOperation = "lighter";
    glow(c, 300, 640, 1800, "#fff1cf", 0.95 * eo(bl));
    c.restore();
    c.fillStyle = `rgba(255,246,226,${0.75 * Math.pow(bl, 2.2)})`; c.fillRect(0, 0, W, H);
  }
  if (T < TEND + 0.5) vignette(c, 0.4);
  grain(c, T, 0.06);
}

// ---------------- typography ----------------
type Phrase = { a: number; b: number; y: number; text: string; size?: number };
const PHRASES: Phrase[] = [
  { a: 0.25, b: 4.25, y: 300, text: "Every great story begins|with something small..." },
  { a: 12.0, b: 15.1, y: 420, text: "The first taste of life." },
  { a: 18.5, b: 22.7, y: 1330, text: "Every beginning|requires courage." },
  { a: 25.4, b: 29.7, y: 300, text: "Growth is never|without challenges." },
  { a: 34.0, b: 37.3, y: 330, text: "Towards the light." },
  { a: 43.0, b: 47.8, y: 230, text: "Patience turns small beginnings|into something extraordinary.", size: 56 },
];
const FINAL: Phrase = { a: 53.0, b: 99, y: 1420, text: "Every great tree|was once a tiny seed.", size: 60 };

const Words: React.FC<{ p: Phrase; t: number }> = ({ p, t }) => {
  if (t < p.a - 0.1 || t > p.b + 0.7) return null;
  const lines = p.text.split("|");
  const out = lin(t, p.b, p.b + 0.6);
  let wi = 0;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: p.y, textAlign: "center", fontFamily: SERIF, fontSize: p.size ?? 64, lineHeight: 1.3, color: "#fffaf0", letterSpacing: 0.5 }}>
      {/* soft dark halo for legibility on any background */}
      <div style={{ position: "absolute", left: 40, right: 40, top: -30, bottom: -30, background: "radial-gradient(ellipse at center, rgba(10,8,4,0.45) 0%, rgba(10,8,4,0.25) 45%, rgba(10,8,4,0) 72%)", filter: "blur(18px)", opacity: lin(t, p.a, p.a + 0.5) * (1 - out) }} />
      {lines.map((ln, li) => (
        <div key={li} style={{ position: "relative" }}>
          {ln.split(" ").map((w, k) => {
            const d = p.a + 0.11 * wi++;
            const q = eo(lin(t, d, d + 0.7));
            const o = q * (1 - out);
            return (
              <span key={k} style={{ display: "inline-block", marginRight: "0.28em", opacity: o, transform: `translateY(${(1 - q) * 18 - out * 14}px)`, filter: `blur(${(1 - q) * 8 + out * 6}px)`, textShadow: "0 2px 14px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.4)" }}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ---------------- channel marks (CHANNEL.md: moving logo + faint name) ----------------
const WM: { at: number; x: number; y: number }[] = [
  { at: 0, x: W - 64 - 130, y: 80 },
  { at: 8.1, x: 64, y: 1460 },
  { at: 17.1, x: W - 64 - 130, y: 80 },
  { at: 24.2, x: W - 64 - 130, y: 1460 },
  { at: 31.4, x: 64, y: 80 },
  { at: 38.6, x: W - 64 - 130, y: 1460 },
  { at: 50.2, x: 64, y: 80 },
];
const WM_OFF = TEND - 0.3;
const Watermark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  let i = 0; for (let k = 0; k < WM.length; k++) if (t >= WM[k].at) i = k;
  const s = WM[i], next = WM[i + 1];
  const fin = i === 0 ? lin(t, 0.6, 1.2) : lin(t, s.at, s.at + 0.6);
  const fout = Math.max(next ? lin(t, next.at - 0.4, next.at) : 0, lin(t, WM_OFF, WM_OFF + 0.4));
  const o = Math.min(fin, 1 - fout);
  if (o <= 0) return null;
  return <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: s.x, top: s.y, width: 130, height: 130, opacity: 0.9 * o, transform: `scale(${0.9 + 0.1 * eo(fin)})`, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.55))" }} />;
};
const TextMark: React.FC<{ t: number }> = ({ t }) => {
  if (t > WM_OFF + 0.4) return null;
  let i = 0; for (let k = 0; k < WM.length; k++) if (t >= WM[k].at) i = k;
  const s = WM[i], next = WM[i + 1];
  const end = next ? next.at : WM_OFF;
  const o = Math.min(lin(t, s.at + 0.3, s.at + 1.2), 1 - lin(t, end - 0.5, end));
  if (o <= 0) return null;
  const top = s.y < H / 2;
  const p = lin(t, s.at, end);
  const fromLeft = s.x > W / 2;
  const x = fromLeft ? 60 + p * 420 : W - 60 - 560 - p * 420;
  return (
    <div style={{ position: "absolute", left: x, top: top ? 1640 : 96, width: 560, textAlign: fromLeft ? "left" : "right", fontFamily: DISP, fontWeight: 700, fontSize: 34, letterSpacing: 3, color: "#fff", opacity: 0.4 * o, textShadow: "0 2px 8px rgba(0,0,0,.65)" }}>
      Art<span style={{ fontWeight: 400, color: GOLD }}>of</span>Agriculture
    </div>
  );
};

const EndCard: React.FC<{ t: number }> = ({ t }) => {
  const p = lin(t, TEND + 0.6, TEND + 1.5);
  if (p <= 0) return null;
  const q = eo(p);
  const sp = eo(lin(t, TEND + 1.3, TEND + 2.0));
  const pulse = 1 + 0.04 * Math.max(0, Math.sin((t - TEND - 2.2) * 4)) * lin(t, TEND + 2.2, TEND + 2.5);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <Img src={staticFile("brand/aoa-logo.png")} style={{ width: 230, height: 230, opacity: q, filter: "drop-shadow(0 8px 22px rgba(0,0,0,.55))", transform: `scale(${0.8 + 0.2 * eob(q)}) rotate(${(1 - q) * -25}deg)` }} />
      <div style={{ opacity: sp, transform: `translateY(${(1 - sp) * 24}px) scale(${pulse})`, display: "flex", alignItems: "center", gap: 16, background: "#d92a20", color: "#fff", fontFamily: DISP, fontWeight: 700, fontSize: 46, letterSpacing: 3, padding: "16px 44px", borderRadius: 999, boxShadow: "0 10px 30px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.25)" }}>
        <svg width="40" height="40" viewBox="0 0 24 24"><path fill="#fff" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5.5-6.84V3.5a1.5 1.5 0 0 0-3 0v.66A7 7 0 0 0 5 11v5l-2 2v1h18v-1Z"/></svg>
        SUBSCRIBE
      </div>
      <div style={{ opacity: sp * 0.85, fontFamily: SERIF, fontSize: 30, color: "#fffaf0", letterSpacing: 1 }}>@ArtofAgriculture</div>
    </div>
  );
};

// ---------------- player ----------------
const Inner: React.FC<{ t: number; audio?: string }> = ({ t, audio }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [handle] = useState(() => delayRender("v26 fonts"));
  const [ok, setOk] = useState(false);
  useLayoutEffect(() => { loadFonts().then(() => { setOk(true); continueRender(handle); }); }, [handle]);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!;
    compose(c, t);
  }, [t]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <canvas ref={ref} width={W} height={H} style={{ width: "100%", height: "100%" }} />
      {ok && (
        <>
          {PHRASES.map((p, i) => <Words key={i} p={p} t={t} />)}
          <Words p={{ ...FINAL, y: t > TEND ? mix(FINAL.y, 1118, eio(lin(t, TEND, TEND + 1))) : FINAL.y }} t={t} />
          <Watermark t={t} />
          <TextMark t={t} />
          <EndCard t={t} />
        </>
      )}
      {audio && <Html5Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};

export const V26Video: React.FC<{ times?: number[]; audio?: string }> = ({ times, audio }) => {
  const f = useCurrentFrame();
  const t = times ? times[f] ?? 0 : f / FPS;
  return <Inner t={t} audio={times ? undefined : audio} />;
};

// storyboard beats (one or two per scene + the transitions)
export const V26_LOOK = [2.6, 4.9, 7.2, 9.4, 10.9, 13.2, 15.4, 16.35, 20.5, 26.2, 28.2, 30.9, 33.0, 36.4, 37.7, 39.5, 42.0, 44.5, 46.6, 48.8, 50.1, 52.0, 54.5, 57.8];

export const V26: React.FC = () => (
  <>
    <Composition id="V26" component={V26Video} durationInFrames={V26_FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: "v26/mix.wav" }} />
    <Composition id="V26-Silent" component={V26Video} durationInFrames={V26_FRAMES} fps={FPS} width={W} height={H} defaultProps={{}} />
    <Composition id="V26-Look" component={V26Video} durationInFrames={V26_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: V26_LOOK }} />
  </>
);
