// V12 · «هرس پاییز: عجله نکن!» — the user's talking-head reel (burned-in subtitles removed by tools/v12-desub.py)
// + cheerful green educational motion: key points pop up at different places, two short full-screen explainer
// inserts (speaker in a PiP bubble) and a recap card. No narration: the speaker's own voice + a soft music bed.
// Every beat is keyed to a spoken word from STT (words.json, already shifted by the 2 trimmed cover frames).
import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT_NUM, FONT_TEXT } from "../fonts";
import wordsJson from "./words.json";

export const V12_FPS = 30;
const CLIP = 52.95; // cleaned clip length (s)
const TOTAL = 55.6;
export const V12_FRAMES = Math.round(TOTAL * V12_FPS);
export const V12_LOOK = [0.9, 2.6, 6.2, 8.6, 13.4, 15.6, 21.0, 23.8, 25.4, 28.9, 31.6, 35.2, 38.4, 41.6, 44.9, 48.6, 51.2, 54.6];

const words = wordsJson as { w: string; s: number; e: number }[];
const Wd = (w: string, nth = 0) => {
  const m = words.filter((x) => x.w === w);
  if (!m[nth]) throw new Error("Wd " + w + " " + nth);
  return m[nth].s;
};

// palette: one green family + sunny yellow accent
const C = { deep: "#0B4D2C", leaf: "#1FA65A", lime: "#7ED957", mint: "#EAFBE4", pale: "#C8F3BC", sun: "#FFC93C", white: "#FFFFFF" };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const eob = (x: number) => { x = clamp(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const ei = (x: number) => Math.pow(clamp(x), 2.2);
const sm = (a: number, b: number, t: number) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
// visibility window: enter (back-ease) at a, leave by b
const win = (t: number, a: number, b: number, din = 0.42, dout = 0.3) => ({
  i: eob((t - a) / din), o: 1 - ei((t - (b - dout)) / dout), on: t > a - 0.01 && t < b + 0.01,
});
// little "hit" bump when a keyword is spoken
const hit = (t: number, at: number, amp = 0.12, len = 0.35) => (t < at || t > at + len ? 0 : Math.sin(((t - at) / len) * Math.PI) * amp);

const fa = (s: string | number) => String(s).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ---------------------------------------------------------------- icons (SVG)
const Leaf: React.FC<{ s?: number; c?: string; v?: string; rot?: number }> = ({ s = 80, c = C.leaf, v = C.deep, rot = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)`, overflow: "visible" }}>
    <path d="M50 94 C18 72 14 34 50 6 C86 34 82 72 50 94Z" fill={c} />
    <path d="M50 94 L50 18" stroke={v} strokeWidth="4" strokeLinecap="round" opacity=".55" />
    <path d="M50 60 L33 46 M50 46 L66 33 M50 74 L68 60 M50 34 L38 25" stroke={v} strokeWidth="3" strokeLinecap="round" opacity=".45" />
  </svg>
);
const Shears: React.FC<{ s?: number; open?: number }> = ({ s = 120, open = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 120 120" style={{ overflow: "visible" }}>
    <g transform={`rotate(${-open * 14} 60 62)`}>
      <path d="M60 62 L100 14 C104 10 110 14 106 20 L66 66Z" fill="#DDE7E0" stroke={C.deep} strokeWidth="3" />
      <path d="M60 62 L30 100" stroke={C.leaf} strokeWidth="16" strokeLinecap="round" />
    </g>
    <g transform={`rotate(${open * 14} 60 62)`}>
      <path d="M60 62 L20 14 C16 10 10 14 14 20 L54 66Z" fill="#F4F8F5" stroke={C.deep} strokeWidth="3" />
      <path d="M60 62 L90 100" stroke={C.lime} strokeWidth="16" strokeLinecap="round" />
    </g>
    <circle cx="60" cy="62" r="7" fill={C.sun} stroke={C.deep} strokeWidth="3" />
  </svg>
);
const StopHand: React.FC<{ s?: number }> = ({ s = 110 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="48" fill={C.sun} />
    <path d="M36 74 C30 66 28 58 28 50 L28 36 C28 32 34 32 34 36 L34 48 L35 26 C35 21 42 21 42 26 L42 46 L43 22 C43 17 50 17 50 22 L50 46 L51 25 C51 20 58 20 58 25 L58 50 L62 42 C65 37 71 40 69 45 L62 64 C59 72 54 76 46 76Z" fill={C.white} stroke={C.deep} strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const Apple: React.FC<{ s?: number }> = ({ s = 120 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <path d="M50 30 C36 18 12 24 14 52 C16 78 34 94 50 86 C66 94 84 78 86 52 C88 24 64 18 50 30Z" fill="#E8483B" />
    <path d="M30 40 C26 48 26 56 28 62" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".55" fill="none" />
    <path d="M50 30 C50 22 52 14 56 8" stroke="#6B3E1E" strokeWidth="5" strokeLinecap="round" fill="none" />
    <path d="M54 18 C62 6 78 8 82 12 C76 22 62 24 54 18Z" fill={C.leaf} />
  </svg>
);
const Hourglass: React.FC<{ s?: number; k?: number }> = ({ s = 90, k = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <rect x="22" y="8" width="56" height="8" rx="4" fill={C.deep} />
    <rect x="22" y="84" width="56" height="8" rx="4" fill={C.deep} />
    <path d="M28 16 L72 16 C72 36 56 44 52 50 C56 56 72 64 72 84 L28 84 C28 64 44 56 48 50 C44 44 28 36 28 16Z" fill="#fff" stroke={C.deep} strokeWidth="4" />
    <path d={`M${34 + k * 12} ${22 + k * 22} L${66 - k * 12} ${22 + k * 22} C60 38 52 44 50 50 C48 44 40 38 ${34 + k * 12} ${22 + k * 22}Z`} fill={C.sun} />
    <path d={`M30 82 L70 82 C66 ${80 - k * 22} 56 ${76 - k * 16} 50 ${76 - k * 18} C44 ${76 - k * 16} 34 ${80 - k * 22} 30 82Z`} fill={C.sun} />
    <rect x="49" y="50" width="2" height="30" fill={C.sun} opacity={k < 0.98 ? 1 : 0} />
  </svg>
);
const Check: React.FC<{ s?: number; k?: number; bg?: string }> = ({ s = 70, k = 1, bg = C.leaf }) => (
  <svg width={s} height={s} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="46" fill={bg} />
    <path d="M28 52 L44 68 L74 34" fill="none" stroke="#fff" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="80" strokeDashoffset={80 * (1 - clamp(k))} />
  </svg>
);
const Sprout: React.FC<{ s?: number; g?: number }> = ({ s = 90, g = 1 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <ellipse cx="50" cy="90" rx="34" ry="8" fill="#8B5E34" />
    <path d={`M50 90 L50 ${90 - 46 * g}`} stroke={C.leaf} strokeWidth="6" strokeLinecap="round" />
    <g transform={`translate(50 ${90 - 40 * g}) scale(${g})`}>
      <path d="M0 0 C-6 -22 -30 -26 -40 -16 C-30 -4 -10 -2 0 0Z" fill={C.lime} />
      <path d="M0 -6 C6 -30 30 -36 40 -26 C30 -12 10 -8 0 -6Z" fill={C.leaf} />
    </g>
  </svg>
);
const Cycle: React.FC<{ s?: number; r?: number }> = ({ s = 140, r = 0 }) => (
  <svg width={s} height={s} viewBox="0 0 100 100" style={{ overflow: "visible" }}>
    <g transform={`rotate(${r} 50 50)`}>
      <path d="M50 12 A38 38 0 0 1 88 50" fill="none" stroke={C.leaf} strokeWidth="9" strokeLinecap="round" />
      <path d="M84 40 L88 54 L96 42Z" fill={C.leaf} stroke={C.leaf} strokeWidth="4" strokeLinejoin="round" />
      <path d="M88 50 A38 38 0 0 1 50 88" fill="none" stroke={C.lime} strokeWidth="9" strokeLinecap="round" />
      <path d="M50 88 A38 38 0 0 1 12 50" fill="none" stroke={C.sun} strokeWidth="9" strokeLinecap="round" />
      <path d="M12 50 A38 38 0 0 1 50 12" fill="none" stroke="#38C172" strokeWidth="9" strokeLinecap="round" />
    </g>
    <g transform="translate(30 28) scale(.4)"><path d="M50 94 C18 72 14 34 50 6 C86 34 82 72 50 94Z" fill={C.leaf} /></g>
  </svg>
);

// ---------------------------------------------------------------- shared bits
const font = (size: number, num = false, weight = 600): React.CSSProperties => ({
  fontFamily: num ? FONT_NUM : FONT_TEXT, fontSize: size, fontWeight: weight, direction: "rtl", lineHeight: 1.25, whiteSpace: "nowrap",
});
const CHEST: React.CSSProperties = { minHeight: 370, display: "flex", flexDirection: "column", justifyContent: "center" };
const CY = 1150;
const shadow = "0 18px 40px rgba(6,40,22,.28), 0 4px 10px rgba(6,40,22,.18)";
const Card: React.FC<{ x: number; y: number; w?: number; i: number; o: number; from?: "up" | "down" | "left" | "right" | "pop"; bg?: string; children: React.ReactNode; t: number; float?: number; style?: React.CSSProperties }> = ({ x, y, w, i, o, from = "pop", bg = C.mint, children, t, float = 6, style }) => {
  const d = 1 - i;
  const tx = from === "left" ? -260 * d : from === "right" ? 260 * d : 0;
  const ty = from === "up" ? -200 * d : from === "down" ? 200 * d : 0;
  const sc = from === "pop" ? lerp(0.4, 1, i) : 1;
  const fy = Math.sin(t * 1.7 + x * 0.01) * float;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, transform: `translate(${tx}px, ${ty + fy}px) scale(${sc * lerp(0.9, 1, o)})`, opacity: clamp(i * 3) * o, background: bg, borderRadius: 34, boxShadow: shadow, padding: "22px 30px", boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
};
const Chip: React.FC<{ t: number; at: number; label: string; bg?: string; color?: string; size?: number }> = ({ t, at, label, bg = C.leaf, color = "#fff", size = 44 }) => {
  const k = eob((t - at) / 0.35);
  return (
    <div style={{ display: "inline-block", transform: `scale(${lerp(0.2, 1, k) + hit(t, at + 0.25, 0.08)})`, opacity: clamp(k * 3), background: bg, color, borderRadius: 999, padding: "8px 28px 12px", margin: "0 8px", ...font(size) }}>
      {label}
    </div>
  );
};
// words appear one by one (Persian words are never split into letters)
const Words: React.FC<{ t: number; text: string; at: number[]; style: React.CSSProperties; hl?: number[] }> = ({ t, text, at, style, hl = [] }) => (
  <div style={{ ...style, direction: "rtl" }}>
    {text.split(" ").map((w, k) => {
      const a = at[Math.min(k, at.length - 1)] + (k >= at.length ? (k - at.length + 1) * 0.07 : 0);
      const p = eo((t - a) / 0.28);
      return (
        <span key={k} style={{ display: "inline-block", marginLeft: "0.26em", opacity: clamp(p * 2), transform: `translateY(${(1 - p) * 26}px)`, color: hl.includes(k) ? C.sun : undefined }}>{w}</span>
      );
    })}
  </div>
);
// falling leaves decoration
const LeafRain: React.FC<{ t: number; a: number; b: number; n?: number; x0?: number; x1?: number; y0?: number; y1?: number; seed?: number }> = ({ t, a, b, n = 8, x0 = 0, x1 = 1080, y0 = -80, y1 = 1100, seed = 1 }) => {
  if (t < a || t > b + 3) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, k) => {
        const r = Math.sin(k * 91.7 + seed * 13.1) * 0.5 + 0.5, r2 = Math.sin(k * 37.3 + seed) * 0.5 + 0.5;
        const st = a + r * (b - a) * 0.6;
        const life = 2.6 + r2 * 1.4;
        const p = (t - st) / life;
        if (p < 0 || p > 1) return null;
        const x = lerp(x0, x1, r2) + Math.sin(p * 7 + k) * 60;
        const y = lerp(y0, y1, p);
        const col = [C.sun, "#F29E38", C.lime, "#E3B23C"][k % 4];
        return <div key={k} style={{ position: "absolute", left: x, top: y, opacity: Math.min(1, (1 - p) * 3) }}><Leaf s={46 + r * 30} c={col} v="#8a5a1a" rot={p * 400 + k * 50} /></div>;
      })}
    </>
  );
};

// ---------------------------------------------------------------- the speaker video
// the clip always shows source time t (also in the -Look composition, where frame ≠ time)
const Clip: React.FC<{ t: number; style?: React.CSSProperties }> = ({ t, style }) => {
  const f = useCurrentFrame();
  const T = Math.min(Math.round(t * V12_FPS), Math.round(CLIP * V12_FPS) - 2);
  return (
    <Sequence from={f - T} layout="none">
      <OffthreadVideo src={staticFile("v12/clean.mp4")} muted style={style} />
    </Sequence>
  );
};
const Speaker: React.FC<{ t: number }> = ({ t }) => {
  const punch = 0;
  const s = 1.015 + 0.01 * Math.sin(t * 0.35) + punch;
  const end = sm(CLIP - 0.4, CLIP + 0.5, t);
  return (
    <AbsoluteFill style={{ transform: `scale(${s + end * 0.06})`, transformOrigin: "50% 34%", filter: `saturate(1.08) contrast(1.03) blur(${end * 18}px) brightness(${1 - end * 0.15})` }}>
      <Clip t={t} style={{ width: 1080, height: 1920, objectFit: "cover" }} />
    </AbsoluteFill>
  );
};
const PiP: React.FC<{ t: number; a: number; b: number; x: number; y: number }> = ({ t, a, b, x, y }) => {
  const w = win(t, a + 0.15, b, 0.5, 0.3);
  if (!w.on) return null;
  const d = 300;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: d, height: d, borderRadius: "50%", overflow: "hidden", border: `10px solid ${C.white}`, boxShadow: `0 0 0 8px ${C.leaf}, ${shadow}`, transform: `scale(${w.i * w.o})` }}>
      <div style={{ position: "absolute", left: -112, top: -205, width: 1080, height: 1920, transform: "scale(.45)", transformOrigin: "0 0" }}>
        <Clip t={t} style={{ width: 1080, height: 1920 }} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- beats on top of the speaker
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const w = win(t, 0.05, Wd("درخت") + 0.2);
  if (!w.on) return null;
  const k = eob((t - 0.1) / 0.45);
  return (
    <>
      <div style={{ position: "absolute", top: 200, width: 1080, textAlign: "center", opacity: clamp(k * 3) * w.o, transform: `translateY(${(1 - k) * -120 + Math.sin(t * 2) * 5}px)` }}>
        <div style={{ display: "inline-block", background: C.leaf, borderRadius: 40, padding: "10px 56px 24px", boxShadow: shadow, position: "relative" }}>
          <div style={{ position: "absolute", left: -60, top: -10, transform: `rotate(${-20 + Math.sin(t * 6) * 6}deg)` }}><Shears s={130} open={0.5 + 0.5 * Math.sin(t * 7)} /></div>
          <Words t={t} text="هرس پاییز؟" at={[0.15, 0.32]} style={{ ...font(130, true), color: C.white }} />
        </div>
      </div>
      <Card t={t} x={130} y={CY} w={820} i={w.i} o={w.o} from="down" bg={C.white} style={{ ...CHEST, alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 26 }}>
          <div style={{ transform: `rotate(${hit(t, Wd("عجله"), 40)}deg) scale(${eob((t - 0.35) / 0.4) + hit(t, Wd("عجله"), 0.25)})` }}><StopHand s={170} /></div>
          <div style={{ textAlign: "right" }}>
            <div style={{ ...font(46), color: C.leaf, opacity: clamp((t - 0.3) * 4) }}>اصلاً</div>
            <div style={{ ...font(104, true), color: C.deep, transform: `scale(${eob((t - Wd("عجله")) / 0.35) + hit(t, Wd("نکنید"), 0.1)})`, transformOrigin: "right center" }}>
              عجله <span style={{ color: C.leaf }}>نکن!</span>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
const LeafFactory: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("درخت") - 0.1, b = Wd("و", 2) + 0.3;
  const w = win(t, a, b);
  if (!w.on) return null;
  return (
    <>
      {/* seasons badge on the right, over the trees */}
      <Card t={t} x={760} y={640} w={280} i={eob((t - Wd("بهار")) / 0.4)} o={w.o} from="right" bg={C.white} style={{ textAlign: "center", padding: "16px 18px 20px" }}>
        <svg width="90" height="90" viewBox="0 0 100 100" style={{ transform: `rotate(${t * 30}deg)` }}>
          {Array.from({ length: 8 }).map((_, k) => <rect key={k} x="47" y="4" width="6" height="18" rx="3" fill={C.sun} transform={`rotate(${k * 45} 50 50)`} />)}
          <circle cx="50" cy="50" r="24" fill={C.sun} />
        </svg>
        <Words t={t} text="بهار و تابستان" at={[Wd("بهار"), Wd("و"), Wd("تابستون")]} style={{ ...font(40), color: C.deep }} />
      </Card>
      {/* the main point, on the chest */}
      <Card t={t} x={70} y={CY} w={940} i={w.i} o={w.o} from="pop" style={{ ...CHEST, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 18 }}>
          <div style={{ transform: `rotate(${Math.sin(t * 2) * 8}deg) scale(${1 + hit(t, Wd("برگش"), 0.2)})` }}><Leaf s={96} /></div>
          <Words t={t} text="برگ‌ها کارخانه‌ی غذا هستند" at={[a + 0.15, a + 0.4, a + 0.65, a + 0.85]} hl={[1]} style={{ ...font(56), color: C.deep }} />
        </div>
        <div style={{ marginTop: 18 }}>
          <Chip t={t} at={Wd("پروتئینی")} label="پروتئین" />
          <span style={{ ...font(54, true), color: C.leaf, opacity: clamp((t - Wd("و", 1)) * 4) }}>+</span>
          <Chip t={t} at={Wd("کربوهیدراتی")} label="کربوهیدرات" bg={C.lime} color={C.deep} />
        </div>
      </Card>
    </>
  );
};
const Atom: React.FC<{ t: number; s?: number }> = ({ t, s = 170 }) => (
  <div style={{ position: "relative", width: s, height: s }}>
    <svg width={s} height={s} viewBox="0 0 200 200" style={{ position: "absolute", left: 0, top: 0 }}>
      {[0, 60, 120].map((r, k) => (
        <g key={k} transform={`rotate(${r} 100 100)`}>
          <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke={C.leaf} strokeWidth="4" opacity=".6" />
          <circle cx={100 + 92 * Math.cos(t * 2.4 + k * 2)} cy={100 + 34 * Math.sin(t * 2.4 + k * 2)} r="10" fill={C.sun} stroke={C.deep} strokeWidth="2" />
        </g>
      ))}
      <circle cx="100" cy="100" r="46" fill={C.leaf} />
    </svg>
    <div style={{ position: "absolute", left: 0, top: 0, width: s, height: s, textAlign: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: s * 0.42, color: "#fff", lineHeight: `${s}px` }}>N</div>
  </div>
);
const Nitrogen: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("هسته") - 0.15, b = Wd("خزان") + 0.3;
  const w = win(t, a, b);
  if (!w.on) return null;
  const N = Wd("نیتروژنه");
  const k2 = eob((t - Wd("سال")) / 0.4);
  const know = eob((t - Wd("میدونه")) / 0.4);
  return (
    <>
      <Card t={t} x={70} y={CY} w={940} i={w.i} o={w.o} from="right" bg={C.mint} style={{ ...CHEST }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 26, justifyContent: "center" }}>
          <div style={{ transform: `scale(${eob((t - N + 0.4) / 0.45) + hit(t, N, 0.18) + hit(t, Wd("نیتروژن"), 0.15)})` }}><Atom t={t} /></div>
          <div style={{ textAlign: "right" }}>
            <Words t={t} text="هسته‌ی مرکزی این ترکیبات" at={[Wd("هسته"), Wd("مرکزی"), Wd("این"), Wd("ترکیبات", 1)]} style={{ ...font(44), color: C.leaf }} />
            <div style={{ ...font(112, true), color: C.deep, opacity: clamp((t - N) * 4), transform: `translateY(${(1 - eo((t - N) / 0.3)) * 30}px)` }}>نیتروژن</div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, opacity: clamp(know * 3), transform: `scale(${lerp(0.5, 1, know)})` }}>
          <span style={{ display: "inline-block", background: C.leaf, color: "#fff", borderRadius: 999, padding: "6px 30px 12px", ...font(42) }}>درخت می‌داند که به آن نیاز دارد</span>
        </div>
      </Card>
      {/* why it matters — top of the frame, over the sky */}
      <Card t={t} x={120} y={190} w={840} i={k2} o={w.o} from="up" bg={C.white} style={{ padding: "18px 30px 24px" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 20, justifyContent: "center" }}>
          <Sprout s={110} g={sm(Wd("استارت") - 0.2, Wd("استارت") + 0.6, t) * 0.8 + 0.2} />
          <div style={{ textAlign: "right" }}>
            <Words t={t} text="سوخت شروعِ سال بعد" at={[Wd("سال"), Wd("آینده"), Wd("استارت")]} hl={[1]} style={{ ...font(60, true), color: C.deep }} />
            <Words t={t} text="درخت به‌شدت به آن نیاز دارد" at={[Wd("شدت"), Wd("بهش"), Wd("لازم"), Wd("داره")]} style={{ ...font(38), color: C.leaf }} />
          </div>
        </div>
      </Card>
    </>
  );
};

// ---------------------------------------------------------------- insert 1: where nitrogen goes in autumn
const TreeInsert: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("خزان") - 0.35, b = Wd("بکنه") + 0.5;
  if (t < a - 0.01 || t > b + 0.01) return null;
  const open = eo((t - a) / 0.55), close = ei((t - (b - 0.4)) / 0.4);
  const rad = (open - close) * 1500;
  const yellow = sm(Wd("خزان"), Wd("خزان") + 1.6, t);
  const simple = sm(Wd("ساده") - 0.1, Wd("ساده") + 0.5, t);
  const flow = clamp((t - Wd("ببره")) / 1.4);
  const store = sm(Wd("ذخیره") - 0.1, Wd("ذخیره") + 0.4, t);
  const leafCol = (k: number) => {
    const g = [31, 166, 90], y = [255, 190, 60];
    const m = clamp(yellow * 1.3 - (k % 3) * 0.15);
    return `rgb(${lerp(g[0], y[0], m)},${lerp(g[1], y[1], m)},${lerp(g[2], y[2], m)})`;
  };
  const leaves = [[300, 520], [420, 440], [560, 400], [700, 450], [800, 540], [360, 640], [520, 560], [660, 600], [250, 760], [820, 700], [460, 700], [600, 740]];
  const steps = [
    { at: Wd("خزان"), label: "خزان می‌رسد" },
    { at: Wd("ساده"), label: "برگ ترکیبات را ساده می‌کند" },
    { at: Wd("ببره"), label: "می‌فرستد توی چوب" },
    { at: Wd("ذخیره"), label: "ذخیره برای بهار" },
  ];
  return (
    <AbsoluteFill style={{ clipPath: `circle(${rad}px at 540px 980px)`, background: `linear-gradient(180deg, #DDF7D2 0%, ${C.mint} 45%, #F7FFF2 100%)` }}>
      {/* soft sun + ground */}
      <div style={{ position: "absolute", left: 760, top: 200, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, #FFE58A 0%, rgba(255,229,138,0) 70%)", transform: `scale(${1 + Math.sin(t * 2) * 0.05})` }} />
      <div style={{ position: "absolute", left: -100, top: 1250, width: 1280, height: 300, borderRadius: "50%", background: C.pale }} />
      <div style={{ ...font(66, true), color: C.deep, position: "absolute", top: 150, width: 1080, textAlign: "center", transform: `translateY(${(1 - open) * -60}px)` }}>
        مسیر غذای درخت در <span style={{ color: C.leaf }}>خزان</span>
      </div>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, transform: `scale(${1 + t * 0.004})`, transformOrigin: "540px 900px" }}>
        {/* trunk & branches */}
        <path d="M500 1330 C505 1150 500 1000 520 880 L560 880 C580 1000 575 1150 580 1330Z" fill="#8B5E34" />
        <path d="M530 900 C470 800 380 720 300 640" stroke="#8B5E34" strokeWidth="34" fill="none" strokeLinecap="round" />
        <path d="M550 900 C620 790 720 700 800 600" stroke="#8B5E34" strokeWidth="34" fill="none" strokeLinecap="round" />
        <path d="M540 900 C540 760 560 600 560 430" stroke="#8B5E34" strokeWidth="30" fill="none" strokeLinecap="round" />
        {/* storage glow in the wood */}
        <rect x="508" y={1330 - 380 * store} width="64" height={380 * store} rx="26" fill={C.sun} opacity={0.85} />
        <rect x="496" y={1330 - 380 * store - 10} width="88" height={380 * store + 20} rx="40" fill={C.sun} opacity={0.25 + 0.15 * Math.sin(t * 6)} />
        {leaves.map(([x, y], k) => (
          <g key={k} transform={`translate(${x} ${y}) rotate(${(k * 47) % 360 + Math.sin(t * 2 + k) * 8})`}>
            <path d="M0 60 C-40 30 -40 -20 0 -60 C40 -20 40 30 0 60Z" fill={leafCol(k)} />
            <path d="M0 60 L0 -48" stroke="#0B4D2C" strokeWidth="4" opacity=".35" />
          </g>
        ))}
        {/* complex molecules in leaves → break into small dots → flow down into trunk */}
        {leaves.map(([x, y], k) => {
          const dots = [];
          for (let d = 0; d < 3; d++) {
            const ph = clamp(flow * 1.25 - d * 0.12 - (k % 4) * 0.05);
            const px = lerp(x + (d - 1) * 16 * simple, 540, ph), py = lerp(y + (1 - simple) * 0 + d * 10 * simple, 1200, ph * ph);
            const r = lerp(16, 8, simple);
            dots.push(<circle key={d} cx={px} cy={py} r={r} fill={d === 1 ? C.deep : C.leaf} stroke="#fff" strokeWidth="3" opacity={clamp(1.4 - ph * 1.1) * clamp((t - a - 0.8) * 3)} />);
            if (simple < 0.5 && d > 0) break;
          }
          return <g key={k}>{dots}</g>;
        })}
      </svg>
      {/* step list */}
      <div style={{ position: "absolute", left: 90, top: 1390, width: 900 }}>
        {steps.map((s, k) => {
          const p = eob((t - s.at) / 0.4);
          const active = t >= s.at && (k === 3 || t < steps[k + 1].at);
          return (
            <div key={k} style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 18, marginBottom: 10, opacity: clamp(p * 3), transform: `translateX(${(1 - p) * 120}px) scale(${active ? 1.04 : 0.96})`, transformOrigin: "right center" }}>
              <div style={{ width: 62, height: 62, borderRadius: "50%", background: active ? C.sun : C.leaf, color: active ? C.deep : "#fff", textAlign: "center", ...font(44, true), lineHeight: "66px" }}>{fa(k + 1)}</div>
              <div style={{ ...font(48), color: active ? C.deep : C.leaf, background: active ? "#fff" : "transparent", borderRadius: 18, padding: "2px 20px 8px", boxShadow: active ? shadow : "none" }}>{s.label}</div>
            </div>
          );
        })}
      </div>
      <PiP t={t} a={a} b={b - 0.1} x={60} y={300} />
    </AbsoluteFill>
  );
};

const AppleFact: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("بکنه") + 0.2, b = Wd("پس", 1) + 0.3;
  const w = win(t, a, b);
  if (!w.on) return null;
  const days = eob((t - Wd("سه")) / 0.4);
  return (
    <>
      <LeafRain t={t} a={Wd("بریزن") - 0.6} b={Wd("هستن")} n={9} x0={60} x1={1000} y0={-60} y1={1150} seed={3} />
      <Card t={t} x={80} y={CY} w={920} i={w.i} o={w.o} from="down" bg={C.white} style={{ ...CHEST, padding: "24px 34px 30px" }}>
        <div style={{ position: "absolute", left: -20, top: -70, transform: `rotate(${-10 + Math.sin(t * 3) * 6}deg) scale(${1 + hit(t, Wd("سیب"), 0.25)})` }}><Apple s={150} /></div>
        <div style={{ ...font(40), color: C.leaf, textAlign: "right" }}>پژوهش روی درخت سیب</div>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 22, marginTop: 6 }}>
          <div style={{ background: C.leaf, color: "#fff", borderRadius: 26, padding: "4px 26px 12px", transform: `scale(${lerp(0.3, 1, days) + hit(t, Wd("روز"), 0.08)})`, opacity: clamp(days * 3), ...font(84, true) }}>{fa("3")} تا {fa("4")} روز</div>
          <Words t={t} text="قبل از ریزش برگ‌ها" at={[Wd("قبل"), Wd("از"), Wd("برگ‌ها"), Wd("بریزن")]} style={{ ...font(50), color: C.deep }} />
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 14, opacity: clamp((t - Wd("هنوز")) * 4), transform: `translateY(${(1 - eo((t - Wd("هنوز")) / 0.3)) * 20}px)` }}>
          <Leaf s={60} c={C.sun} v="#8a5a1a" rot={Math.sin(t * 3) * 10} />
          <div style={{ ...font(48), color: C.deep }}>ترکیبات <span style={{ color: C.leaf }}>هنوز</span> در برگ‌اند!</div>
        </div>
      </Card>
    </>
  );
};
const WaitBanner: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("پس", 1) - 0.05, b = Wd("این", 4) + 0.9;
  const w = win(t, a, b);
  if (!w.on) return null;
  return (
    <>
      <Card t={t} x={90} y={CY} w={900} i={w.i} o={w.o} from="pop" bg={C.leaf} style={{ ...CHEST, padding: "18px 34px 24px" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 22 }}>
          <div style={{ transform: `rotate(${t > Wd("صبر") && t < Wd("صبر") + 0.5 ? (t - Wd("صبر")) * 360 : 0}deg)` }}><Hourglass s={110} k={sm(Wd("صبر"), Wd("بشه") + 0.4, t)} /></div>
          <div style={{ textAlign: "right" }}>
            <Words t={t} text="حتماً صبر کن" at={[Wd("حتما"), Wd("صبر"), Wd("بکنید")]} hl={[1]} style={{ ...font(70, true), color: "#fff" }} />
            <Words t={t} text="تا خزان کامل شود" at={[Wd("خزان", 1), Wd("خزان", 1) + 0.15, Wd("تکمیل"), Wd("بشه")]} style={{ ...font(46), color: C.pale }} />
          </div>
        </div>
        <div style={{ marginTop: 14, height: 18, background: "rgba(255,255,255,.25)", borderRadius: 9, overflow: "hidden" }}>
          <div style={{ width: `${100 * sm(Wd("خزان", 1) - 0.2, Wd("بشه") + 0.4, t)}%`, height: "100%", background: C.sun, borderRadius: 9 }} />
        </div>
      </Card>
      <LeafRain t={t} a={Wd("خزان", 1) - 0.3} b={Wd("بشه") + 0.4} n={7} x0={80} x1={980} y0={-60} y1={1150} seed={7} />
    </>
  );
};

// ---------------------------------------------------------------- insert 2: best time to prune
const SeasonInsert: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("این", 4) + 0.35, b = Wd("اما") + 0.05;
  if (t < a - 0.01 || t > b + 0.01) return null;
  const open = eo((t - a) / 0.5), close = ei((t - (b - 0.35)) / 0.35);
  const best = Wd("بهترین"), late = Wd("آخر");
  const seasons = [
    { n: "تابستان", c: "#FFE07A" }, { n: "پاییز", c: "#F6B562" }, { n: "زمستان", c: "#D9F0FF" }, { n: "بهار", c: C.pale },
  ];
  // marker travels along autumn → winter, lands at "late winter"
  const mk = lerp(0.3, 1.4, sm(a + 0.3, Wd("چوبی") + 0.3, t)) + sm(best, late + 0.3, t) * 1.1;
  const X = (u: number) => 960 - u * 210; // RTL track: summer at right
  const stamp = eob((t - late) / 0.4);
  return (
    <AbsoluteFill style={{ transform: `translateY(${(1 - open) * 1920 + close * -1920}px)`, background: `linear-gradient(180deg, ${C.leaf} 0%, #178A4A 100%)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: 0.12, backgroundImage: "radial-gradient(#fff 2px, transparent 2.5px)", backgroundSize: "44px 44px", transform: `translateY(${(t * 20) % 44}px)` }} />
      <div style={{ ...font(54), color: C.pale, position: "absolute", top: 520, width: 1080, textAlign: "center" }}>ترکیبات برمی‌گردند به بافت چوبی…</div>
      <div style={{ position: "absolute", top: 610, width: 1080, textAlign: "center", ...font(96, true), color: "#fff", opacity: clamp((t - best) * 4), transform: `scale(${lerp(0.5, 1, eob((t - best) / 0.4))})` }}>
        بهترین زمان هرس
      </div>
      {/* season track */}
      <div style={{ position: "absolute", left: 120, top: 860, width: 840, height: 120, borderRadius: 60, background: "rgba(255,255,255,.15)" }} />
      {seasons.map((s, k) => (
        <div key={k} style={{ position: "absolute", left: X(k) - 105 + 15, top: 870, width: 180, height: 100, borderRadius: 50, background: s.c, textAlign: "center", ...font(42, true), lineHeight: "100px", color: C.deep, opacity: clamp((t - a - 0.2 - k * 0.08) * 4), transform: `scale(${eob((t - a - 0.2 - k * 0.08) / 0.4)})` }}>{s.n}</div>
      ))}
      {/* marker */}
      <div style={{ position: "absolute", left: X(mk) - 15 - 45, top: 760, width: 120, textAlign: "center", transform: `translateY(${Math.abs(Math.sin(t * 5)) * -10 * (1 - stamp)}px)` }}>
        <svg width="90" height="100" viewBox="0 0 90 100"><path d="M45 96 L20 60 A32 32 0 1 1 70 60Z" fill={C.sun} stroke={C.deep} strokeWidth="5" /><circle cx="45" cy="38" r="13" fill={C.deep} /></svg>
      </div>
      {/* answer card */}
      <div style={{ position: "absolute", left: 140, top: 1060, width: 800, borderRadius: 40, background: "#fff", boxShadow: shadow, padding: "30px 30px 36px", boxSizing: "border-box", textAlign: "center", opacity: clamp(stamp * 3), transform: `scale(${lerp(0.4, 1, stamp)}) rotate(${(1 - stamp) * -6}deg)` }}>
        <div style={{ position: "absolute", right: -40, top: -50, transform: `rotate(18deg) scale(${1 + hit(t, late + 0.1, 0.2)})` }}><Shears s={130} open={0.5 + 0.5 * Math.sin(t * 8)} /></div>
        <div style={{ ...font(110, true), color: C.leaf }}>آخر زمستان</div>
        <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 14, marginTop: 4 }}>
          <Check s={64} k={(t - late - 0.2) / 0.4} />
          <div style={{ ...font(44), color: C.deep }}>درخت در خواب است و انبارش پُر</div>
        </div>
      </div>
      <PiP t={t} a={a} b={b - 0.05} x={720} y={180} />
    </AbsoluteFill>
  );
};

const BigGarden: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("اما") - 0.2, b = Wd("که", 4) + 0.3;
  const w = win(t, a, b);
  if (!w.on) return null;
  const rows = [
    { at: Wd("متراژ"), label: "باغت بزرگه؟" },
    { at: Wd("عجله", 1), label: "عجله داری؟" },
  ];
  const ans = eob((t - Wd("باید")) / 0.4);
  return (
    <>
      <Card t={t} x={80} y={CY} w={920} i={w.i} o={w.o} from="left" bg={C.white} style={{ ...CHEST, padding: "24px 34px 30px" }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", justifyContent: "space-between" }}>
          {rows.map((r, k) => {
            const p = eob((t - r.at) / 0.35);
            return (
              <div key={k} style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 12, opacity: clamp(p * 3), transform: `scale(${lerp(0.5, 1, p)})` }}>
                <Check s={56} k={(t - r.at - 0.15) / 0.35} bg={C.lime} />
                <div style={{ ...font(50), color: C.deep }}>{r.label}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 22, background: C.leaf, borderRadius: 26, padding: "10px 24px 18px", textAlign: "center", opacity: clamp(ans * 3), transform: `scale(${lerp(0.5, 1, ans) + hit(t, Wd("خزان", 2), 0.07)})` }}>
          <div style={{ ...font(40), color: C.pale }}>هرس پاییزه؟ فقط…</div>
          <div style={{ ...font(78, true), color: "#fff" }}>بعد از <span style={{ color: C.sun }}>خزانِ کامل</span></div>
        </div>
      </Card>
      {/* small autumn badge on the left */}
      <Card t={t} x={40} y={640} w={250} i={eob((t - Wd("پاییز")) / 0.4)} o={w.o} from="left" bg={C.sun} style={{ textAlign: "center", padding: "14px 14px 20px" }}>
        <Leaf s={80} c="#F29E38" v="#8a5a1a" rot={Math.sin(t * 2) * 20} />
        <div style={{ ...font(46, true), color: C.deep }}>پاییز</div>
      </Card>
    </>
  );
};
const CycleBadge: React.FC<{ t: number }> = ({ t }) => {
  const a = Wd("که", 4) - 0.05, b = CLIP + 0.4;
  const w = win(t, a, b);
  if (!w.on) return null;
  return (
    <Card t={t} x={90} y={CY} w={900} i={w.i} o={w.o} from="pop" bg={C.white} style={{ ...CHEST, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 20, justifyContent: "center" }}>
        <Cycle s={130} r={t * 90} />
        <div style={{ textAlign: "right" }}>
          <Words t={t} text="چرخه‌ی طبیعی درخت" at={[Wd("چرخه"), Wd("طبیعی"), Wd("درخت", 4)]} hl={[0]} style={{ ...font(64, true), color: C.deep }} />
          <Words t={t} text="حفظ می‌شود" at={[Wd("حفظ"), Wd("بکنی", 1)]} style={{ ...font(54, true), color: C.leaf }} />
        </div>
      </div>
    </Card>
  );
};
const Recap: React.FC<{ t: number }> = ({ t }) => {
  const a = CLIP - 0.2;
  if (t < a) return null;
  const k = eob((t - a) / 0.5), k2 = eob((t - a - 0.45) / 0.5), k3 = eob((t - a - 0.9) / 0.5);
  return (
    <AbsoluteFill style={{ background: `rgba(11,77,44,${0.55 * clamp((t - a) * 2)})` }}>
      <LeafRain t={t} a={a} b={a + 2} n={10} seed={11} y0={-80} y1={1950} />
      <div style={{ position: "absolute", top: 470, width: 1080, textAlign: "center", ...font(70, true), color: C.sun, opacity: clamp(k * 3), transform: `translateY(${(1 - k) * -60}px)` }}>خلاصه‌ی درس</div>
      <div style={{ position: "absolute", left: 110, top: 600, width: 860, borderRadius: 40, background: "#fff", boxShadow: shadow, padding: "28px 34px 34px", boxSizing: "border-box", opacity: clamp(k2 * 3), transform: `scale(${lerp(0.5, 1, k2)})` }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 18 }}>
          <Shears s={100} open={0.5 + 0.5 * Math.sin(t * 6)} />
          <div style={{ textAlign: "right" }}>
            <div style={{ ...font(42), color: C.leaf }}>بهترین زمان هرس</div>
            <div style={{ ...font(84, true), color: C.deep }}>آخر زمستان</div>
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 960, width: 860, borderRadius: 40, background: C.leaf, boxShadow: shadow, padding: "26px 34px 32px", boxSizing: "border-box", opacity: clamp(k3 * 3), transform: `scale(${lerp(0.5, 1, k3)})` }}>
        <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 18 }}>
          <Leaf s={100} c={C.sun} v="#8a5a1a" rot={Math.sin(t * 2) * 12} />
          <div style={{ textAlign: "right" }}>
            <div style={{ ...font(42), color: C.pale }}>اگر مجبوری پاییز هرس کنی</div>
            <div style={{ ...font(74, true), color: "#fff" }}>فقط بعد از خزانِ کامل</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// thin lesson progress bar + topic pill (educational frame)
const Chrome: React.FC<{ t: number }> = ({ t }) => {
  const k = eo((t - 0.1) / 0.6) * (1 - sm(CLIP - 0.4, CLIP, t));
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 12, background: "rgba(255,255,255,.35)" }}>
        <div style={{ position: "absolute", right: 0, top: 0, height: 12, width: `${(100 * t) / TOTAL}%`, background: `linear-gradient(270deg, ${C.lime}, ${C.leaf})` }} />
      </div>
      <div style={{ position: "absolute", right: 40, top: 70, opacity: k, transform: `translateY(${(1 - k) * -40}px)`, display: "flex", flexDirection: "row-reverse", alignItems: "center", gap: 10, background: "rgba(11,77,44,.82)", borderRadius: 999, padding: "6px 22px 10px 26px" }}>
        <Leaf s={40} c={C.lime} v={C.deep} rot={Math.sin(t * 1.5) * 15} />
        <div style={{ ...font(34), color: "#fff" }}>آموزش باغبانی · هرس</div>
      </div>
    </>
  );
};

export const V12: React.FC<{ times?: number[] }> = ({ times }) => {
  const f = useCurrentFrame();
  const t = times ? times[Math.min(f, times.length - 1)] : f / V12_FPS;
  return (
    <AbsoluteFill style={{ background: C.deep, overflow: "hidden" }}>
      <Speaker t={t} />
      <Hook t={t} />
      <LeafFactory t={t} />
      <Nitrogen t={t} />
      <AppleFact t={t} />
      <WaitBanner t={t} />
      <BigGarden t={t} />
      <CycleBadge t={t} />
      <TreeInsert t={t} />
      <SeasonInsert t={t} />
      <Recap t={t} />
      <Chrome t={t} />
    </AbsoluteFill>
  );
};
