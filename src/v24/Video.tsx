// v24 · Art of Agriculture — "Village Dawn": the user's raw phone footage (uploads/v24/raw.mp4, a misty hillside
// village, then a foggy pasture with sheep), edited to Kevin MacLeod's "Village Dawn" (CC BY 4.0). No narration.
// Signature move: dynamic expanding / shrinking frames — the playing frame shrinks into one corner while the next
// shot opens from the opposite corner, floats, then expands to full screen as the old one drifts away.
// Used at 3 selected moments; the other cuts are a soft "lift-away" (frame shrinks off a full-screen next shot).
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Freeze, Img, OffthreadVideo, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const W = 1080, H = 1920, FPS = 30;
const INK = "#2b2e27", CREAM = "#ebe8df", CREAM2 = "#f6f4ee", GOLD = "#d9b86a";
const SERIF = "LibreBaskerville", DISP = "Sora";

const fh = delayRender("v24 fonts");
Promise.all([
  new FontFace(SERIF, `url('${staticFile("fonts/LibreBaskerville.ttf")}') format('truetype')`, { weight: "100 900" }).load(),
  new FontFace(DISP, `url('${staticFile("fonts/Sora-Bold.woff2")}') format('woff2')`, { weight: "700" }).load(),
]).then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(fh); }).catch(() => continueRender(fh));

const clamp = (x: number) => Math.max(0, Math.min(1, x));
const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const ease = Easing.bezier(0.65, 0, 0.35, 1);
const eo = Easing.bezier(0.22, 1, 0.36, 1);
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

// ---------- shots (output in/out seconds, source start, playback rate) ----------
type Shot = { id: string; a: number; b: number; src: number; rate: number; kb: [number, number]; drift: [number, number] };
const SHOTS: Shot[] = [
  { id: "hill", a: 0, b: 12.7, src: 0.3, rate: 0.85, kb: [1.0, 1.07], drift: [0, -20] },
  { id: "village", a: 9.35, b: 21.9, src: 10.5, rate: 0.85, kb: [1.08, 1.0], drift: [10, 0] },
  { id: "houses", a: 20.78, b: 32.7, src: 20.2, rate: 0.85, kb: [1.0, 1.06], drift: [-14, 0] },
  { id: "pasture", a: 29.18, b: 41.5, src: 33.2, rate: 0.85, kb: [1.06, 1.0], drift: [0, 12] },
  { id: "sheep", a: 40.36, b: 52.3, src: 43.6, rate: 0.85, kb: [1.0, 1.07], drift: [12, 0] },
  { id: "pylon", a: 48.79, b: 60.6, src: 53.3, rate: 0.8, kb: [1.0, 1.08], drift: [0, -16] },
];
export const V24_DUR = 60.6;
const FRAMES = Math.round(V24_DUR * FPS);

// ---------- frame geometry ----------
type Box = { cx: number; cy: number; s: number; o: number; z: number };
const FULL: Box = { cx: W / 2, cy: H / 2, s: 1, o: 1, z: 1 };
const M = 70; // corner margin
const corner = (c: "TL" | "TR" | "BL" | "BR", s: number): [number, number] => {
  const x = c.endsWith("L") ? M + (W * s) / 2 : W - M - (W * s) / 2;
  const y = c.startsWith("T") ? M + 90 + (H * s) / 2 : H - M - 90 - (H * s) / 2;
  return [x, y];
};
const lerpBox = (a: Box, b: Box, p: number): Box => ({ cx: mix(a.cx, b.cx, p), cy: mix(a.cy, b.cy, p), s: mix(a.s, b.s, p), o: mix(a.o, b.o, p), z: b.z });

// corner swap: outgoing shrinks into `to`, incoming opens from the opposite corner, floats, then takes over
type Swap = { kind: "swap"; t0: number; to: "TL" | "TR"; from: "BR" | "BL"; out: string; inn: string };
type Lift = { kind: "lift"; t0: number; out: string; inn: string };
type EndCard = { kind: "end"; t0: number; out: string };
const D = 3.4, P1 = 1.4, P2 = 2.1;
const TRANS: (Swap | Lift | EndCard)[] = [
  { kind: "swap", t0: 9.35, to: "TL", from: "BR", out: "hill", inn: "village" },
  { kind: "lift", t0: 20.78, out: "village", inn: "houses" },
  { kind: "swap", t0: 29.18, to: "TR", from: "BL", out: "houses", inn: "pasture" },
  { kind: "lift", t0: 40.36, out: "pasture", inn: "sheep" },
  { kind: "swap", t0: 48.79, to: "TL", from: "BR", out: "sheep", inn: "pylon" },
  { kind: "end", t0: 57.0, out: "pylon" },
];

const boxFor = (id: string, t: number): Box | null => {
  const sh = SHOTS.find((s) => s.id === id)!;
  if (t < sh.a || t >= sh.b) return null;
  let box: Box = { ...FULL };
  for (const tr of TRANS) {
    if (tr.kind === "swap" && t >= tr.t0 && t < tr.t0 + D) {
      const u = t - tr.t0, sIn = 0.5, sOut = 0.44;
      const [ox, oy] = corner(tr.to, sOut), [ix, iy] = corner(tr.from, sIn);
      const sway = Math.sin(lin(u, P1, P2) * Math.PI) * 14;
      const away = tr.to === "TL" ? -1 : 1;
      if (id === tr.out) {
        const small: Box = { cx: ox + away * sway, cy: oy - sway, s: sOut, o: 1, z: 2 };
        if (u < P1) box = lerpBox(FULL, small, ease(lin(u, 0, P1)));
        else if (u < P2) box = small;
        else box = lerpBox(small, { cx: ox + away * 520, cy: oy - 700, s: 0.3, o: 0, z: 1 }, ease(lin(u, P2, D)));
        box.z = u < P2 ? 2 : 1;
      }
      if (id === tr.inn) {
        const [x0, y0] = corner(tr.from, 0.06);
        const seed: Box = { cx: x0, cy: y0, s: 0.06, o: 0, z: 3 };
        const mid: Box = { cx: ix - away * sway, cy: iy + sway, s: sIn, o: 1, z: 3 };
        if (u < P1) box = lerpBox(seed, mid, ease(lin(u, 0.15, P1)));
        else if (u < P2) box = mid;
        else box = lerpBox(mid, { ...FULL, z: 3 }, ease(lin(u, P2, D)));
        box.o = Math.min(1, lin(u, 0.15, 0.55));
      }
    }
    if (tr.kind === "lift" && t >= tr.t0 && t < tr.t0 + 1.8) {
      const u = t - tr.t0;
      if (id === tr.out) {
        const p = ease(lin(u, 0, 1.5));
        box = { cx: W / 2, cy: H / 2 + 90 * p, s: mix(1, 0.8, p), o: 1 - lin(u, 0.7, 1.6), z: 3 };
      }
      if (id === tr.inn) box = { ...FULL, z: 1 };
    }
    if (tr.kind === "end" && id === tr.out && t >= tr.t0) {
      const p = ease(lin(t, tr.t0, tr.t0 + 1.6));
      box = { cx: W / 2, cy: mix(H / 2, H * 0.4, p), s: mix(1, 0.6, p), o: 1, z: 2 };
    }
  }
  return box;
};

// ---------- one framed shot ----------
const Shot: React.FC<{ sh: Shot; t: number }> = ({ sh, t }) => {
  const box = boxFor(sh.id, t);
  if (!box || box.o <= 0.001) return null;
  const w = W * box.s, h = H * box.s;
  const framed = clamp((1 - box.s) / 0.12); // 0 full screen -> 1 when clearly a card
  const p = lin(t, sh.a, sh.b);
  const kb = mix(sh.kb[0], sh.kb[1], p);
  const dx = mix(0, sh.drift[0], p), dy = mix(0, sh.drift[1], p);
  return (
    <div style={{ position: "absolute", left: box.cx - w / 2, top: box.cy - h / 2, width: w, height: h, zIndex: box.z, opacity: box.o,
      borderRadius: 44 * framed * box.s + 6 * framed, overflow: "hidden",
      boxShadow: `0 ${30 * framed}px ${90 * framed}px rgba(30,32,25,${0.32 * framed}), 0 0 0 ${7 * framed}px rgba(255,255,255,${0.92 * framed})` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `scale(${box.s})` }}>
        <div style={{ width: W, height: H, transform: `translate(${dx}px, ${dy}px) scale(${kb})` }}>
          <Sequence from={Math.round(sh.a * FPS)} durationInFrames={Math.round((sh.b - sh.a) * FPS)} layout="none">
            <OffthreadVideo src={staticFile("v24/raw.mp4")} muted trimBefore={Math.round(sh.src * FPS)} playbackRate={sh.rate}
              style={{ width: W, height: H, objectFit: "cover" }} />
          </Sequence>
        </div>
        {sh.id === "village" && <DawnGlow t={t} />}
      </div>
    </div>
  );
};

// gentle warm light that blooms as the village appears out of the fog
const DawnGlow: React.FC<{ t: number }> = ({ t }) => {
  const o = Math.sin(lin(t, 12.4, 21.5) * Math.PI) * 0.32;
  return <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 45% at ${55 + 10 * lin(t, 12, 21)}% 28%, rgba(255,214,150,1), rgba(255,214,150,0) 70%)`, opacity: o, mixBlendMode: "soft-light" }} />;
};

// ---------- title (start) ----------
const Title: React.FC<{ t: number }> = ({ t }) => {
  const i = eo(lin(t, 1.1, 3.0)), o = Math.min(lin(t, 1.1, 2.4), 1 - lin(t, 6.2, 7.6));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", opacity: o, zIndex: 10 }}>
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 128, color: INK, letterSpacing: mix(14, 4, i), transform: `translateY(${(1 - i) * 26}px)`,
        textShadow: "0 0 40px rgba(255,255,255,.75), 0 0 12px rgba(255,255,255,.6)" }}>Village Dawn</div>
      <div style={{ margin: "26px auto 0", width: mix(0, 260, eo(lin(t, 2.0, 3.6))), height: 3, background: GOLD, borderRadius: 2 }} />
    </div>
  );
};

// ---------- end: framed last shot + channel logo ----------
const End: React.FC<{ t: number }> = ({ t }) => {
  const p = eo(lin(t, 57.7, 59.0));
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.4 + (H * 0.6) / 2 + 70, textAlign: "center", zIndex: 10, opacity: p }}>
      <Img src={staticFile("brand/aoa-logo.png")} style={{ display: "block", margin: "0 auto", width: 150, height: 150, transform: `scale(${0.85 + 0.15 * p})`, filter: "drop-shadow(0 6px 16px rgba(0,0,0,.25))" }} />
      <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 54, color: INK, marginTop: 14, letterSpacing: 2 }}>Art of Agriculture</div>
    </div>
  );
};

// ---------- logo watermark + moving text mark (channel rules); hidden during the corner swaps ----------
const WM: { a: number; b: number; x: number; y: number }[] = [
  { a: 0.8, b: 9.2, x: W - 165, y: 70 },
  { a: 12.9, b: 20.6, x: 40, y: H - 190 },
  { a: 22.2, b: 29.0, x: 40, y: 70 },
  { a: 32.8, b: 40.2, x: W - 165, y: 70 },
  { a: 41.8, b: 48.6, x: 40, y: H - 190 },
  { a: 52.4, b: 56.8, x: 40, y: 70 },
];
const Marks: React.FC<{ t: number }> = ({ t }) => {
  const s = WM.find((w) => t >= w.a && t < w.b);
  if (!s) return null;
  const o = Math.min(lin(t, s.a, s.a + 0.6), 1 - lin(t, s.b - 0.5, s.b));
  const top = s.y < H / 2, fromLeft = s.x > W / 2, q = lin(t, s.a, s.b);
  const x = fromLeft ? 60 + q * 420 : W - 60 - 560 - q * 420;
  return (
    <>
      <Img src={staticFile("brand/aoa-logo.png")} style={{ position: "absolute", left: s.x, top: s.y, width: 125, height: 125, zIndex: 20, opacity: 0.9 * o, filter: "drop-shadow(0 3px 10px rgba(0,0,0,.45))" }} />
      <div style={{ position: "absolute", left: x, top: top ? H - 92 : 48, width: 560, zIndex: 20, textAlign: fromLeft ? "left" : "right", fontFamily: DISP, fontWeight: 700, fontSize: 36, letterSpacing: 3, color: "#fff", opacity: 0.4 * o, textShadow: "0 2px 8px rgba(0,0,0,.55)" }}>
        Art<span style={{ fontWeight: 400, color: "#f6dfa0" }}>of</span>Agriculture
      </div>
    </>
  );
};

const Inner: React.FC<{ silent?: boolean }> = ({ silent }) => {
  const t = useCurrentFrame() / FPS;
  const vol = (fr: number) => { const s = fr / FPS; return 0.9 * Math.min(lin(s, 0, 0.6), 1 - lin(s, V24_DUR - 3.4, V24_DUR)); };
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${CREAM2}, ${CREAM} 70%)` }}>
      {!silent && <Audio src={staticFile("music/village-dawn-kevin-macleod.mp3")} volume={vol} />}
      {SHOTS.map((sh) => <Shot key={sh.id} sh={sh} t={t} />)}
      <Title t={t} />
      <Marks t={t} />
      <End t={t} />
    </AbsoluteFill>
  );
};

export const V24Video: React.FC<{ times?: number[]; silent?: boolean }> = ({ times, silent }) => {
  const f = useCurrentFrame();
  if (times) return <Freeze frame={Math.round(times[f] * FPS)}><Inner silent /></Freeze>;
  return <Inner silent={silent} />;
};

// Look stills: the storyboard beats
export const V24_LOOK = [3.2, 6.0, 9.9, 10.9, 11.9, 12.5, 16.5, 21.3, 21.9, 26, 29.9, 30.9, 31.9, 36, 41.0, 45.5, 49.6, 50.7, 51.8, 54.5, 58.0, 60.3];

export const V24: React.FC = () => (
  <>
    <Composition id="V24" component={V24Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="V24-Silent" component={V24Video} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ silent: true }} />
    <Composition id="V24-Look" component={V24Video} durationInFrames={V24_LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: V24_LOOK }} />
  </>
);
