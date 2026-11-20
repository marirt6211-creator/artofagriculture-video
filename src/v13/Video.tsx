// v13 · «باغ زیتون» — 30s vertical reel, Persian miniature (custom engine scenes 37_olive_*, see public/styles/art-motion/engine/scenes/37_olive.js).
// Same layout as Art Motion «Story» (vertical pan around focus, word-by-word caption, signature transitions),
// but each beat names its own scene + transition instead of a catalog style.
import React from "react";
import { AbsoluteFill, Composition, Easing, Html5Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voJson from "./vo.json";
import { ArtFilmCanvas, AM, ART, useArtFonts, type Seg, type Transition, type VO } from "../styles/art-motion";

type Beat = { scene: string; tr?: Transition; text: string; key?: string; focus?: number };
type Props = { beats: Beat[]; vo?: VO; each?: number; tail?: number; title?: string; sub?: string; audio?: string; accent?: string; t?: number };

export const BEATS: Beat[] = [
  { scene: "37_olive_grove", text: "توی دامنه‌ی کوه، درخت زیتونی هست که صدها سال عمر داره.", key: "صدها" },
  { scene: "37_olive_leaves", tr: { type: "girih", dur: 0.9 }, text: "باد که می‌وزه، برگ‌هاش نقره‌ای می‌درخشن.", key: "نقره‌ای" },
  { scene: "37_olive_ripen", tr: { type: "organic", dur: 0.9 }, text: "پاییز، زیتون‌ها آروم‌آروم از سبز به سیاه می‌رسن.", key: "سیاه" },
  { scene: "37_olive_harvest", tr: { type: "pageTurn", dur: 0.9 }, text: "باغبون شاخه‌ها رو می‌تکونه و زیتون مثل بارون می‌ریزه.", key: "بارون" },
  { scene: "37_olive_mill", tr: { type: "mosaic", dur: 0.8 }, text: "سنگ آسیاب می‌چرخه و زیتون‌ها رو له می‌کنه.", key: "آسیاب" },
  { scene: "37_olive_oil", tr: { type: "goldLeaf", dur: 0.9 }, text: "و روغنی سبز و طلایی، توی کوزه جاری می‌شه.", key: "طلایی" },
  { scene: "37_olive_peace", tr: { type: "girih", dur: 1.0 }, text: "زیتون؛ درخت صبر، نور و صلح.", key: "صلح" },
];

const k01 = (t: number, a: number, b: number) => interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
const times = (p: Props) => p.beats.map((_, i) => p.vo?.segs[i]?.start ?? i * (p.each ?? 4.2));
export const lengthOf = (p: Props) => {
  const T = times(p);
  return Math.max(p.vo ? p.vo.total : 0, T[T.length - 1] + (p.vo ? 0.5 : (p.each ?? 4.2))) + (p.tail ?? 1.2);
};
const wordTimes = (p: Props, i: number, n: number, T: number[]) => {
  const seg = p.vo?.segs[i];
  if (seg) {
    const ws = p.vo!.words.filter((w) => w.line === seg.n);
    if (ws.length === n) return ws.map((w) => Math.max(0, w.s - T[i]));
    return Array.from({ length: n }, (_, j) => ((seg.end - seg.start) * 0.85 * j) / Math.max(1, n));
  }
  return Array.from({ length: n }, (_, j) => 0.1 + j * 0.28);
};
const segsOf = (p: Props): Seg[] => {
  const T = times(p), L = lengthOf(p);
  return p.beats.map((b, i) => {
    const pre = b.tr ? Math.min(0.35, b.tr.dur * 0.5) : 0;
    const nx = p.beats[i + 1];
    const t0 = Math.max(0, T[i] - pre), t1 = nx ? Math.max(t0 + 0.4, T[i + 1] - Math.min(0.35, (nx.tr?.dur ?? 0) * 0.5)) : L;
    return { id: b.scene, dur: i === 0 ? t1 : t1 - t0, ...(b.tr && i > 0 ? { transition: b.tr } : {}) };
  });
};

export const Olive: React.FC<Props> = (p) => {
  const { beats, title, sub, audio, accent = "#F3D88A", t: tIn } = p;
  ART.labels = "off";
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = tIn ?? frame / fps;
  const segs = segsOf(p);
  const T = times(p);
  let k = 0;
  T.forEach((s, i) => t >= s - 0.12 && (k = i));
  const B = beats[k];
  const sc = height / 1080, wide = 1920 * sc, span = Math.max(0, wide - width);
  const fx = (i: number) => (((beats[i].focus ?? 0.5) * wide - width / 2) / span);
  const ends = (i: number): [number, number] => { const d = i % 2 ? -0.025 : 0.025; return [fx(i) - d, fx(i) + d]; };
  const beatEnd = (i: number) => (i < beats.length - 1 ? T[i + 1] : lengthOf(p));
  const posIn = (i: number, tt: number) => { const [a, b] = ends(i); return a + (b - a) * interpolate(tt, [T[i], beatEnd(i)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) }); };
  let pos = posIn(k, t);
  if (k > 0) { const g = k01(t, T[k] - 0.12, T[k] + 0.5); pos = posIn(k - 1, t) * (1 - g) + pos * g; }
  const x = -span * Math.min(1, Math.max(0, pos));
  // slow push-in on every beat (camera never still)
  const zoom = 1 + 0.06 * interpolate(t, [T[k] - 0.1, beatEnd(k)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const words = B.text.split(/\s+/).filter(Boolean);
  const lt = t - T[k];
  const WT = wordTimes(p, k, words.length, T);
  const out = k < beats.length - 1 ? 1 - k01(t, T[k + 1] - 0.3, T[k + 1] - 0.05) : 1;
  const ttl = title ? 1 - k01(t, Math.max(1.6, (T[1] ?? 2) - 0.5), Math.max(2, (T[1] ?? 2) - 0.1)) : 0;

  if (!ok) return <AbsoluteFill style={{ background: "#d6a845" }} />;
  return (
    <AbsoluteFill style={{ background: "#13245a", overflow: "hidden" }}>
      {audio && <Html5Audio src={staticFile(audio)} />}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 35%" }}>
        <div style={{ position: "absolute", left: x, top: 0, width: wide, height }}>
          <ArtFilmCanvas segs={segs} t={t} dpr={sc} />
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 58%, rgba(10,8,20,.5) 65%, rgba(10,8,20,.55) 78%, rgba(10,8,20,.3) 100%)" }} />
      <div
        style={{
          position: "absolute", left: 70, width: 940, top: 1260, direction: "rtl", textAlign: "center", opacity: out,
          fontFamily: AM.fa, fontWeight: 700, fontSize: 66, lineHeight: 1.5, color: "#F7F1E8", textShadow: "0 3px 18px rgba(0,0,0,.85)",
        }}
      >
        {words.map((w, i) => {
          const q = k01(lt, WT[i], WT[i] + 0.3);
          const hot = B.key && w.replace(/[،.؟!:;؛«»]/g, "") === B.key;
          return (
            <span key={i} style={{ display: "inline-block", marginLeft: "0.28em", opacity: q, transform: `translateY(${(1 - q) * 16}px) scale(${hot ? 1 + 0.1 * k01(lt, WT[i] + 0.2, WT[i] + 0.45) : 1})`, filter: `blur(${(1 - q) * 6}px)`, color: hot ? accent : undefined }}>
              {w}
            </span>
          );
        })}
      </div>
      {title && (
        <div style={{ position: "absolute", top: 330, left: 0, width, textAlign: "center", direction: "rtl", opacity: ttl * k01(t, 0.3, 0.7) }}>
          <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 40, color: accent, letterSpacing: 2, textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>{sub}</div>
        </div>
      )}
      {title && (
        <div style={{ position: "absolute", top: 120, left: 0, width, textAlign: "center", direction: "rtl", opacity: ttl * k01(t, 0, 0.3), transform: `translateY(${(1 - k01(t, 0, 0.5)) * -30}px)` }}>
          <div style={{ display: "inline-block", padding: "14px 56px 22px", background: "#f3e7c8", border: "6px solid #d6a845", outline: "3px solid #1f3a8a", outlineOffset: -16, fontFamily: AM.fa, fontWeight: 900, fontSize: 96, color: "#2a1a12", lineHeight: 1.25 }}>{title}</div>
        </div>
      )}
    </AbsoluteFill>
  );
};

const VO_: VO | undefined = voJson as VO;
export const PROPS: Props = { beats: BEATS, vo: VO_, tail: 0.2, title: "باغ زیتون", sub: "به سبک نگارگری ایرانی", ...(VO_ ? { audio: "v13/mix.wav" } : {}) };

const LookC: React.FC<{ times: number[] }> = ({ times }) => { const f = useCurrentFrame(); return <Olive {...PROPS} t={times[Math.min(f, times.length - 1)]} />; };
const Silent: React.FC = () => <Olive {...PROPS} audio={undefined} />;
const D = Math.round(lengthOf(PROPS) * 30);
const lookTimes = () => { const T = times(PROPS); return [0.25, ...T.slice(1).flatMap((s) => [s + 0.2, s + 1.6]), lengthOf(PROPS) - 0.3]; };

export const V13: React.FC = () => (
  <>
    <Composition id="V13" component={() => <Olive {...PROPS} />} durationInFrames={D} fps={30} width={1080} height={1920} />
    <Composition id="V13-Silent" component={Silent} durationInFrames={D} fps={30} width={1080} height={1920} />
    <Composition id="V13-Look" component={LookC} durationInFrames={lookTimes().length} fps={30} width={1080} height={1920} defaultProps={{ times: lookTimes() }} />
  </>
);
