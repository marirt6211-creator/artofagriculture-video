// V15 · «هنر کشاورزی» — same 20 s narration as V01 (public/v01/vo.wav), re-made in modern flat illustration with the channel logo.
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AM, useArtFonts } from "../styles/art-motion";

const FPS = 30, DUR = 20;
const S = [0, 3.15, 7.85, 12.05, 16.15, DUR]; // narration line starts (src/v01/vo.json)
const C = {
  sky1: "#DDF3FD", sky2: "#AEE2F8", sun: "#FFD21F", sunD: "#FFA41B", grass: "#7CC242", grassL: "#A6D84E", green: "#3E9B35", deep: "#1F6A2A",
  ink: "#1C3A20", card: "#FFFFFF", cream: "#FFFBEA", soil: "#A8693B", soilD: "#7E4C27", blue: "#3BA7E0", red: "#F0563E", pink: "#FF8FA3", purple: "#8E6CEB",
};
const k = (t: number, a: number, b: number, e: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const pop = Easing.out(Easing.back(1.8));
const io = Easing.inOut(Easing.cubic);
const rnd = (i: number) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);
const SH = "drop-shadow(0 14px 18px rgba(20,60,30,.18))";

// ---------- flat parts ----------
const LEAF = "M0 0 C 24 -30, 80 -34, 116 0 C 80 24, 24 26, 0 0Z";
const Leaf: React.FC<{ x: number; y: number; r: number; s: number; c?: string }> = ({ x, y, r, s, c = C.green }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d={LEAF} fill={c} />
      <path d="M0 0 C 24 -30, 80 -34, 116 0 Z" fill="#fff" opacity={0.14} />
    </g>
  );
const Plant: React.FC<{ g: number; H: number; t: number }> = ({ g, H, t }) => {
  const st = k(g, 0.05, 0.8, (x) => x);
  const lv = [0.2, 0.36, 0.52, 0.68, 0.82];
  return (
    <g transform={`rotate(${Math.sin(t * 1.4) * 2.5})`}>
      <ellipse cx={0} cy={-6} rx={15} ry={10} fill={C.soilD} opacity={1 - k(g, 0.25, 0.45)} />
      <path d={`M0 0 C ${-H * 0.05} ${-H * 0.35}, ${H * 0.06} ${-H * 0.65}, 0 ${-H}`} fill="none" stroke={C.deep} strokeWidth={Math.max(7, H * 0.028)}
        strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - st} />
      {lv.map((f, i) => {
        const s = k(g, f * 0.8 + 0.05, f * 0.8 + 0.2, pop) * (H / 480) * (1.3 - f * 0.5);
        return <Leaf key={i} x={0} y={-H * f} r={i % 2 ? 205 + Math.sin(t * 2 + i) * 5 : -25 + Math.sin(t * 2 + i) * 5} s={s} c={i % 2 ? C.grass : C.green} />;
      })}
      {st > 0.15 && <Leaf x={0} y={-H * st} r={-80} s={(H / 900) * k(g, 0.1, 0.3)} c={C.grassL} />}
    </g>
  );
};
const Tree: React.FC<{ s: number; t: number }> = ({ s, t }) => (
  <g transform={`scale(${s})`}>
    <rect x={-14} y={-150} width={28} height={150} rx={8} fill={C.soilD} />
    <g transform={`rotate(${Math.sin(t * 1.2) * 2} 0 -170)`}>
      <circle cx={0} cy={-210} r={92} fill={C.green} />
      <circle cx={-60} cy={-170} r={60} fill={C.green} />
      <circle cx={62} cy={-172} r={62} fill={C.green} />
      <circle cx={-20} cy={-250} r={50} fill={C.grass} opacity={0.6} />
      {[[-40, -200], [30, -235], [55, -165], [-70, -150], [5, -170]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={14} fill={i % 2 ? C.red : C.sunD} />)}
    </g>
  </g>
);
const Pot: React.FC = () => (
  <g>
    <path d="M-70 0 L70 0 L56 90 L-56 90 Z" fill={C.sunD} />
    <rect x={-80} y={-18} width={160} height={26} rx={8} fill={C.sun} />
  </g>
);

// background: flat sky, sun, clouds, three hills with crop rows
const World: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect width={1080} height={1920} fill={C.sky1} />
    <rect y={420} width={1080} height={1500} fill={C.sky2} opacity={0.55} />
    <g transform={`translate(170 280) scale(${k(t, 0, 0.6, pop)})`}>
      <g transform={`rotate(${t * 12})`}>{Array.from({ length: 12 }, (_, i) => <path key={i} d="M-14 -150 L0 -200 L14 -150 Z" fill={C.sun} transform={`rotate(${i * 30})`} />)}</g>
      <circle r={118} fill={C.sun} opacity={0.35} />
      <circle r={92} fill={C.sun} />
      <circle cx={-26} cy={-28} r={30} fill="#fff" opacity={0.3} />
    </g>
    {[0, 1, 2].map((i) => {
      const x = ((i * 430 + t * (18 + i * 8)) % 1500) - 260, y = 470 + i * 160;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + i * 0.15})`} opacity={0.95}>
          <ellipse cx={0} cy={0} rx={110} ry={34} fill="#fff" /><circle cx={-30} cy={-24} r={44} fill="#fff" /><circle cx={30} cy={-34} r={52} fill="#fff" />
        </g>
      );
    })}
    <path d={`M-50 1420 Q 300 ${1300 + Math.sin(t * 0.5) * 8}, 620 1380 T 1130 1340 L1130 1920 L-50 1920Z`} fill={C.grassL} />
    <path d={`M-50 1520 Q 400 ${1410 + Math.sin(t * 0.6 + 1) * 8}, 1130 1500 L1130 1920 L-50 1920Z`} fill={C.grass} />
    <path d="M-50 1640 Q 540 1540, 1130 1640 L1130 1920 L-50 1920Z" fill={C.green} />
    {Array.from({ length: 6 }, (_, i) => (
      <path key={i} d={`M${-60 + i * 230} 1920 Q ${200 + i * 140} 1700, ${520 + i * 100} 1600`} fill="none" stroke={C.grassL} strokeWidth={10} opacity={0.55} strokeLinecap="round" />
    ))}
  </g>
);

const Leaves: React.FC<{ t: number; from: number; n?: number }> = ({ t, from, n = 22 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const p = t - from - rnd(i) * 1.2;
      if (p < 0) return null;
      const y = -60 + p * (260 + rnd(i + 1) * 200), x = rnd(i + 2) * 1080 + Math.sin(p * 2 + i) * 50;
      return <Leaf key={i} x={x} y={y} r={p * 140 + i * 40} s={0.32 + rnd(i + 4) * 0.25} c={[C.green, C.grass, C.sun, C.grassL][i % 4]} />;
    })}
  </g>
);

// flat icons
const Flask: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-26 -80 L-26 -30 L-72 56 Q-78 74 -58 74 L58 74 Q78 74 72 56 L26 -30 L26 -80 Z" fill="#E9F7FF" />
    <path d="M-46 14 L46 14 L72 56 Q78 74 58 74 L-58 74 Q-78 74 -72 56 Z" fill={C.grass} />
    <rect x={-34} y={-94} width={68} height={16} rx={6} fill={C.blue} />
    {[0, 1, 2].map((i) => { const p = (t * 0.8 + i / 3) % 1; return <circle key={i} cx={-18 + i * 18} cy={60 - p * 100} r={6 + i * 2} fill="#fff" opacity={0.9 * (1 - p)} />; })}
  </g>
);
const PaletteI: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-80 10 C -90 -60, 20 -90, 70 -40 C 100 -10, 60 10, 40 6 C 20 2, 10 30, 30 48 C 50 70, -60 80, -80 10 Z" fill="#FFE7B8" />
    {[[-50, -30, C.red], [-12, -52, C.sun], [30, -40, C.blue], [-55, 22, C.purple]].map(([x, y, c], i) => (
      <circle key={i} cx={x as number} cy={y as number} r={13 + Math.sin(t * 3 + i) * 2} fill={c as string} />
    ))}
    <g transform={`rotate(${-35 + Math.sin(t * 2.4) * 8})`}>
      <rect x={52} y={-96} width={14} height={110} rx={6} fill={C.soilD} />
      <path d="M50 -96 Q59 -134 68 -96 Z" fill={C.red} />
    </g>
  </g>
);
const Book: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M0 -40 C -40 -60, -80 -55, -96 -44 L-96 56 C -80 46, -40 42, 0 60 Z" fill="#fff" />
    <path d="M0 -40 C 40 -60, 80 -55, 96 -44 L96 56 C 80 46, 40 42, 0 60 Z" fill="#F1F6EC" />
    <path d="M-100 58 C -80 48, -40 46, 0 64 C 40 46, 80 48, 100 58 L100 70 C 80 60, 40 58, 0 76 C -40 58, -80 60, -100 70Z" fill={C.green} />
    {[-20, -2, 16, 34].map((y, i) => <g key={i}><rect x={-80} y={y - 8} width={60} height={6} rx={3} fill={C.grassL} /><rect x={20} y={y - 8} width={60} height={6} rx={3} fill={C.grassL} /></g>)}
    <g transform={`translate(0 -46) rotate(${Math.sin(t * 2) * 6})`}><Leaf x={0} y={0} r={-70} s={0.45} /><Leaf x={0} y={0} r={-110} s={0.45} c={C.grass} /></g>
  </g>
);
const Can: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${-14 + Math.sin(t * 2) * 5})`}>
    <path d="M-60 -30 L50 -30 L58 64 L-68 64 Z" fill={C.blue} />
    <path d="M-40 -30 C -40 -84, 30 -84, 30 -30" fill="none" stroke={C.blue} strokeWidth={12} />
    <path d="M-62 4 L-116 -50" stroke={C.blue} strokeWidth={16} strokeLinecap="round" />
    <ellipse cx={-122} cy={-56} rx={16} ry={10} fill={C.sun} transform="rotate(-45 -122 -56)" />
    <rect x={-62} y={14} width={116} height={12} fill="#fff" opacity={0.35} />
    {Array.from({ length: 6 }, (_, i) => { const p = (t * 1.6 + i / 6) % 1; return <circle key={i} cx={-134 - (i % 3) * 12 - p * 20} cy={-44 + p * 120} r={7} fill={C.blue} opacity={1 - p * 0.6} />; })}
  </g>
);
const Tulip: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-4} y={-20} width={8} height={100} rx={4} fill={C.deep} />
    <Leaf x={0} y={64} r={-60 + Math.sin(t * 2) * 4} s={0.55} />
    <Leaf x={0} y={74} r={240 + Math.sin(t * 2) * 4} s={0.5} c={C.grass} />
    <g transform={`translate(0 -30) rotate(${Math.sin(t * 1.8) * 6})`}>
      <path d="M-36 0 C -42 -42, -24 -68, -14 -72 L0 -46 L14 -72 C 24 -68, 42 -42, 36 0 C 24 24, -24 24, -36 0 Z" fill={C.red} />
      <path d="M0 -46 L14 -72 C 24 -68, 42 -42, 36 0 C 24 24, 0 22, 0 22Z" fill="#000" opacity={0.08} />
    </g>
  </g>
);
const Tile: React.FC<{ x: number; y: number; s: number; t: number; bg: string; children: React.ReactNode; label?: string }> = ({ x, y, s, t, bg, children, label }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t * 1.6 + x) * 8}) scale(${s * 1.25})`} style={{ filter: SH }}>
      <rect x={-140} y={-140} width={280} height={280} rx={60} fill={bg} />
      <circle cx={70} cy={-80} r={34} fill="#fff" opacity={0.25} />
      {children}
      {label && (
        <g transform="translate(0 175)">
          <rect x={-90} y={-34} width={180} height={62} rx={31} fill={C.card} />
          <text y={12} textAnchor="middle" style={{ fontFamily: "Lalezar", fontSize: 40 }} fill={C.deep}>{label}</text>
        </g>
      )}
    </g>
  );

const Line: React.FC<{ q: number; size?: number; color?: string; font?: string; w?: number; children: React.ReactNode; out?: number }> = ({ q, size = 64, color = C.ink, font = AM.fa, w = 800, children, out = 0 }) => (
  <div style={{ fontFamily: font, fontWeight: w, fontSize: size, color, direction: "rtl", lineHeight: 1.4, opacity: q * (1 - out),
    transform: `translateY(${(1 - q) * 30 - out * 20}px) scale(${0.9 + 0.1 * q})` }}>{children}</div>
);
const Hi: React.FC<{ c?: string; children: React.ReactNode }> = ({ c = C.green, children }) => <span style={{ color: c }}>{children}</span>;

export const AgriFlat: React.FC<{ times?: number[]; music?: boolean }> = ({ times, music = true }) => {
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const t = times ? times[frame] ?? 0 : frame / FPS;
  if (!ok) return <AbsoluteFill style={{ background: C.sky1 }} />;
  const outOf = (i: number) => k(t, S[i + 1] - 0.3, S[i + 1], Easing.in(Easing.cubic));
  const s2o = outOf(1), s3o = outOf(2), s4o = outOf(3);

  // logo: big centre (S1) → badge top-right (S2..S4) → big again (S5)
  const toBadge = k(t, S[1] - 0.25, S[1] + 0.45, io), back = k(t, S[4], S[4] + 0.7, io);
  const m = toBadge * (1 - back);
  const big = { cx: 540, cy: 640, w: 640 }, badge = { cx: 905, cy: 170, w: 230 };
  const lw = interpolate(m, [0, 1], [big.w, badge.w]) * k(t, 0.0, 0.55, pop) * (t >= S[4] ? 0.95 + 0.05 * k(t, S[4] + 0.4, S[4] + 1.0, pop) : 1);
  const lcx = interpolate(m, [0, 1], [big.cx, badge.cx]), lcy = interpolate(m, [0, 1], [big.cy, badge.cy]) + (m < 0.5 ? Math.sin(t * 1.8) * 8 : 0);
  const lh = lw * (1170 / 1032);

  const wipe = k(t, S[2] - 0.3, S[2] + 0.35, io); // T2: green circle iris
  const stages = [0.12, 0.45, 0.8, 1];
  const prog = k(t, S[2] + 0.55, S[2] + 3.7, Easing.inOut(Easing.quad));

  const card = () => {
    if (t < S[1]) return (
      <>
        <Line q={k(t, 0.25, 0.75, pop)} out={outOf(0)} font="Lalezar" w={400} size={92} color={C.deep}>خوش آمدید!</Line>
        <Line q={k(t, 0.9, 1.4)} out={outOf(0)} size={38} w={700} color={C.green}>کانال آموزش تخصصی کشاورزی در بله</Line>
      </>
    );
    if (t < S[2]) return (
      <>
        <Line q={k(t, S[1] + 0.15, S[1] + 0.6, pop)} out={s2o} font="Lalezar" w={400} size={84}>تلفیق <Hi c={C.blue}>علم</Hi> و <Hi c={C.red}>خلاقیت</Hi></Line>
        <Line q={k(t, S[1] + 2.2, S[1] + 2.7)} out={s2o} size={50} w={800} color={C.green}>در کشت و کار</Line>
      </>
    );
    if (t < S[3]) return (
      <>
        <Line q={k(t, S[2] + 0.15, S[2] + 0.6, pop)} out={s3o} font="Lalezar" w={400} size={86}>آموزش <Hi>تخصصی</Hi></Line>
        <Line q={k(t, S[2] + 2.55, S[2] + 3.0)} out={s3o} size={52} w={800} color={C.green}>از صفر تا صد</Line>
      </>
    );
    if (t < S[4]) {
      const w = [S[3] + 0.15, S[3] + 1.15, S[3] + 2.45];
      const sp = (i: number) => ({ display: "inline-block" as const, opacity: k(t, w[i], w[i] + 0.3) * (1 - s4o), transform: `translateY(${(1 - k(t, w[i], w[i] + 0.4, pop)) * 30}px)` });
      return (
        <div style={{ fontFamily: "Lalezar", fontSize: 74, color: C.ink, direction: "rtl", lineHeight: 1.3 }}>
          <span style={sp(0)}><Hi c={C.green}>بیاموزید</Hi>،</span> <span style={sp(1)}><Hi c={C.blue}>تجربه</Hi> کنید</span>
          <br />
          <span style={sp(2)}>و <Hi c={C.red}>هنرمندانه</Hi> بکارید</span>
        </div>
      );
    }
    return (
      <>
        <Line q={k(t, S[4] + 0.3, S[4] + 0.8)} size={58} w={900} color={C.ink}>ما را در پیام‌رسان <Hi>بله</Hi><br />دنبال کنید</Line>
        <div style={{ marginTop: 18, opacity: k(t, S[4] + 1.35, S[4] + 1.75), transform: `scale(${0.6 + 0.4 * k(t, S[4] + 1.35, S[4] + 1.9, pop)})`,
          background: C.green, borderRadius: 60, padding: "10px 30px 10px 14px", boxShadow: "0 8px 0 #1F6A2A", display: "flex", alignItems: "center", gap: 14, direction: "ltr" }}>
          <Img src={staticFile("v15/bale.png")} style={{ width: 58, height: 58, background: "#fff", borderRadius: 29, padding: 4 }} />
          <span style={{ fontFamily: AM.hud, fontWeight: 700, fontSize: 42, color: "#fff", direction: "ltr" }}>ble.ir/<span style={{ color: C.sun }}>ArtofAgriculture</span></span>
        </div>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ background: C.sky1, overflow: "hidden" }}>
      {music && !times && <Audio src={staticFile("v15/mix.wav")} />}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <g transform={`translate(540 960) scale(${1.03 + t * 0.002}) translate(-540 -960)`}><World t={t} /></g>

        {/* S1: burst behind the logo */}
        {t < S[1] + 0.3 && [0, 1].map((i) => {
          const p = k(t, 0.1 + i * 0.25, 1.4 + i * 0.25);
          return <circle key={i} cx={540} cy={640} r={200 + p * 420} fill="none" stroke={i ? C.sun : "#fff"} strokeWidth={40 * (1 - p)} opacity={1 - p} />;
        })}
        {t < S[1] + 0.3 && Array.from({ length: 12 }, (_, i) => {
          const p = k(t, 0.35, 1.3), a = (i / 12) * Math.PI * 2;
          return <Leaf key={i} x={540 + Math.cos(a) * (150 + p * 380)} y={640 + Math.sin(a) * (150 + p * 380)} r={(a * 180) / Math.PI} s={0.4 * (1 - k(t, 1.3, 2.4))} c={i % 2 ? C.grass : C.sun} />;
        })}

        {/* S2: science ⟷ creativity → the plant */}
        {t >= S[1] - 0.1 && t < S[2] + 0.4 && (
          <g opacity={1 - s2o * 0.2}>
            <g transform={`translate(540 1150)`}>
              <g transform={`scale(${k(t, S[1], S[1] + 0.5, pop)})`}><Pot /></g>
              <g transform="translate(0 -16)"><Plant g={0.3 + 0.7 * k(t, S[1] + 2.0, S[2] - 0.2, Easing.out(Easing.quad))} H={330} t={t} /></g>
            </g>
            <path d="M800 800 C 810 900, 680 900, 590 960" fill="none" stroke={C.blue} strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" opacity={k(t, S[1] + 1.5, S[1] + 2.0)} strokeDashoffset={-t * 40} />
            <path d="M280 800 C 270 900, 400 900, 490 960" fill="none" stroke={C.red} strokeWidth={10} strokeDasharray="4 22" strokeLinecap="round" opacity={k(t, S[1] + 1.6, S[1] + 2.1)} strokeDashoffset={-t * 40} />
            <Tile x={800 + (1 - k(t, S[1] + 0.6, S[1] + 1.1, pop)) * 400} y={560} s={1 - s2o * 0.3} t={t} bg="#D5EEFC" label="علم"><Flask t={t} /></Tile>
            <Tile x={280 - (1 - k(t, S[1] + 0.95, S[1] + 1.45, pop)) * 400} y={560} s={1 - s2o * 0.3} t={t} bg="#FFE1DA" label="خلاقیت"><PaletteI t={t} /></Tile>
          </g>
        )}

        {/* S3: seed → fruit, 0 → 100 */}
        {t >= S[2] - 0.05 && t < S[3] + 0.3 && (
          <g transform={`translate(0 ${-s3o * 900})`}>
            {stages.map((g, i) => {
              const x = 900 - i * 240, y = 880 - Math.sin(((i + 0.5) / 4) * Math.PI) * 60, a = k(t, S[2] + 0.25 + i * 0.45, S[2] + 0.7 + i * 0.45, pop);
              return (
                <g key={i} transform={`translate(${x} ${y}) scale(${a * 1.05})`}>
                  <circle cx={0} cy={-120} r={112} fill={C.cream} style={{ filter: SH }} />
                  <ellipse cx={0} cy={-40} rx={80} ry={18} fill={C.soil} />
                  <g transform="translate(0 -44)">
                    {i < 3 ? <Plant g={g * k(t, S[2] + 0.4 + i * 0.45, S[2] + 1.6 + i * 0.45)} H={150} t={t + i} /> : <Tree s={0.62 * k(t, S[2] + 1.7, S[2] + 2.4, pop)} t={t} />}
                  </g>
                  <rect x={-62} y={8} width={124} height={54} rx={27} fill={C.green} />
                  <text y={46} textAnchor="middle" style={{ fontFamily: "Lalezar", fontSize: 36 }} fill="#fff">{["بذر", "جوانه", "نهال", "ثمر"][i]}</text>
                </g>
              );
            })}
            {/* progress track (RTL) */}
            <rect x={110} y={1080} width={860} height={34} rx={17} fill="#fff" style={{ filter: SH }} opacity={k(t, S[2] + 0.3, S[2] + 0.6)} />
            <rect x={110 + 860 * (1 - prog)} y={1080} width={860 * prog} height={34} rx={17} fill={C.sunD} />
            <g transform={`translate(${970 - 860 * prog} 1097) scale(${k(t, S[2] + 0.4, S[2] + 0.8, pop)})`}>
              <circle r={52} fill={C.deep} />
              <text y={14} textAnchor="middle" style={{ fontFamily: "Lalezar", fontSize: 40 }} fill="#fff">{fa(Math.round(prog * 100))}٪</text>
            </g>
          </g>
        )}
        {/* T2 iris */}
        {wipe > 0 && wipe < 1 && <circle cx={540} cy={800} r={Math.sin(wipe * Math.PI) * 1100} fill={C.grassL} />}

        {/* S4: learn · try · plant */}
        {t >= S[3] - 0.3 && t < S[4] + 0.4 && (
          <g transform={`translate(0 ${(1 - k(t, S[3] - 0.3, S[3] + 0.2, io)) * 900})`} opacity={1 - s4o}>
            {[
              { x: 790, y: 520, at: S[3] + 0.15, bg: "#DFF2D0", el: <Book t={t} /> },
              { x: 540, y: 900, at: S[3] + 1.15, bg: "#D5EEFC", el: <Can t={t} /> },
              { x: 290, y: 520, at: S[3] + 2.45, bg: "#FFE1DA", el: <Tulip t={t} /> },
            ].map((c, i) => (
              <Tile key={i} x={c.x} y={c.y} s={k(t, c.at, c.at + 0.45, pop) * (1 - s4o * 0.5)} t={t} bg={c.bg}>{c.el}</Tile>
            ))}
          </g>
        )}

        {/* S5: leaves rain around the logo */}
        {t >= S[4] && <Leaves t={t} from={S[4] + 0.2} />}
      </svg>

      {/* logo */}
      <Img src={staticFile("v15/logo.png")} style={{ position: "absolute", left: lcx - lw / 2, top: lcy - lh / 2, width: lw, height: lh,
        transform: `rotate(${(1 - k(t, 0, 0.7, pop)) * -12}deg)`, filter: "drop-shadow(0 18px 22px rgba(20,60,30,.25))" }} />

      {/* text card */}
      <div style={{ position: "absolute", left: 70, top: t >= S[4] ? 1250 : 1240, width: 940, height: 330, opacity: k(t, 0.15, 0.45),
        transform: `translateY(${(1 - k(t, 0.15, 0.6, pop)) * 80}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: C.card, borderRadius: 48, boxShadow: "0 14px 0 rgba(31,106,42,.18), 0 20px 40px rgba(20,60,30,.18)" }} />
        <div style={{ position: "absolute", right: 60, top: -26, width: 52, height: 52, borderRadius: 26, background: C.sun }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 30px" }}>
          {card()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LOOK = [0.3, 1.6, 3.6, 4.6, 6.4, 8.2, 9.6, 11.4, 12.8, 15.0, 16.6, 19.5];
export const V15: React.FC = () => (
  <>
    <Composition id="V15" component={AgriFlat} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="V15-Silent" component={AgriFlat} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="V15-Look" component={AgriFlat} durationInFrames={LOOK.length} fps={FPS} width={1080} height={1920} defaultProps={{ times: LOOK }} />
  </>
);
