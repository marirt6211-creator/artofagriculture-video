// V16 · «هنر کشاورزی» — the V15 intro re-made in Bauhaus: grid, primary colours, circles/squares/triangles, hard shadows.
// Same narration as V01 (public/v01/vo.wav); new ElevenLabs music in public/v16/mix.wav.
import React from "react";
import { AbsoluteFill, Audio, Composition, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AM, useArtFonts } from "../styles/art-motion";

const FPS = 30, DUR = 20;
const S = [0, 3.15, 7.85, 12.05, 16.15, DUR]; // narration line starts (src/v01/vo.json)
const R = "#D62828", Y = "#F4C20D", B = "#1D4E9E", K = "#151515", P = "#EFE6D2", G = "#D8CCB2";
const k = (t: number, a: number, b: number, e: (x: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(t, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: e });
const back = Easing.out(Easing.back(1.6));
const io = Easing.inOut(Easing.cubic);
const fa = (n: number) => String(n).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[+d]);

// ---------- geometric botany ----------
// stem + quarter-circle leaves; g = growth 0..1
const GeoPlant: React.FC<{ g: number; H: number; t: number; c1?: string; c2?: string }> = ({ g, H, t, c1 = B, c2 = R }) => {
  const st = k(g, 0.05, 0.75, (x) => x), w = Math.sin(t * 2.4) * 4;
  const L = (f: number, i: number) => {
    const s = k(g, f * 0.75 + 0.08, f * 0.75 + 0.22, back) * (H / 300) * (1.1 - f * 0.4);
    const y = -H * f, c = i % 2 ? c1 : c2;
    return s <= 0.001 ? null : i % 2 ? (
      <path key={i} d="M0 0 A70 70 0 0 0 -70 70 L0 70Z" fill={c} transform={`translate(0 ${y - 70 * s}) scale(${s})`} />
    ) : (
      <path key={i} d="M0 0 A70 70 0 0 1 70 -70 L70 0Z" fill={c} transform={`translate(0 ${y}) scale(${s})`} />
    );
  };
  return (
    <g transform={`rotate(${w})`}>
      <circle cx={0} cy={-10} r={14} fill={K} opacity={1 - k(g, 0.2, 0.4)} />
      <rect x={-7} y={-H * st} width={14} height={H * st} fill={K} />
      {[0.25, 0.45, 0.65, 0.82].map(L)}
      {g > 0.85 && <circle cx={0} cy={-H - 26} r={30 * k(g, 0.85, 1, back)} fill={Y} stroke={K} strokeWidth={8} />}
    </g>
  );
};
const GeoTree: React.FC<{ s: number; t: number }> = ({ s, t }) => (
  <g transform={`scale(${s})`}>
    <rect x={-14} y={-150} width={28} height={150} fill={K} />
    <g transform={`rotate(${Math.sin(t * 1.5) * 3} 0 -150)`}>
      <circle cx={0} cy={-230} r={100} fill={B} />
      <path d="M-100 -230 A100 100 0 0 1 100 -230Z" fill={Y} />
      {[[-45, -215], [35, -250], [50, -190], [-15, -165]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={16} fill={R} />)}
    </g>
  </g>
);

// ---------- world ----------
const World: React.FC<{ t: number }> = ({ t }) => {
  const sp = (a: number) => k(t, a, a + 0.6, back);
  return (
    <g>
      <rect width={1080} height={1920} fill={P} />
      {Array.from({ length: 13 }, (_, i) => <line key={i} x1={i * 90} y1={0} x2={i * 90} y2={1920} stroke={G} strokeWidth={2} />)}
      {Array.from({ length: 22 }, (_, i) => <line key={"h" + i} y1={i * 90} x1={0} y2={i * 90} x2={1080} stroke={G} strokeWidth={2} />)}
      {/* sun: yellow disc, rotating red half, black core */}
      <g transform={`translate(170 230) scale(${sp(0)})`}>
        <circle r={150} fill={Y} />
        <path d="M-150 0 A150 150 0 0 1 150 0Z" fill={R} transform={`rotate(${t * 30})`} opacity={0.92} />
        <circle r={44} fill={K} />
      </g>
      <rect x={300} y={420 + Math.sin(t * 1.3) * 10} width={420 * sp(0.1)} height={22} fill={K} />
      <rect x={38} y={430} width={34} height={240 * sp(0.2)} fill={B} />
      <g transform={`translate(1000 ${1180 - Math.abs(Math.sin(t * 2.2)) * 40}) rotate(${t * 25})`}><path d="M0 -50 L44 30 L-44 30Z" fill={Y} /></g>
      <g transform={`translate(70 1160) rotate(${-t * 30})`}><circle r={46} fill="none" stroke={B} strokeWidth={16} strokeDasharray="70 22" /></g>
      {/* field */}
      <rect y={1600} width={1080} height={320} fill={K} transform={`translate(0 ${(1 - sp(0.15)) * 400})`} />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={"f" + i} x={0} y={1640 + i * 46} width={1080} height={20} fill={i % 2 ? B : Y}
          transform={`translate(${(1 - sp(0.25 + i * 0.06)) * (i % 2 ? 1100 : -1100) + Math.sin(t * 0.8 + i) * 14} 0)`} />
      ))}
    </g>
  );
};

// ---------- icons (pure geometry) ----------
const Flask: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <path d="M-70 70 L0 -60 L70 70Z" fill={P} />
    <path d="M-44 22 L44 22 L70 70 L-70 70Z" fill={Y} />
    <rect x={-16} y={-96} width={32} height={50} fill={P} />
    <rect x={-26} y={-104} width={52} height={14} fill={K} />
    {[0, 1, 2].map((i) => { const p = (t * 0.9 + i / 3) % 1; return <circle key={i} cx={-20 + i * 20} cy={60 - p * 110} r={7 + i * 2} fill={P} opacity={1 - p} />; })}
  </g>
);
const Palette: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <circle r={80} fill={P} />
    <circle cx={34} cy={30} r={22} fill={R} />
    {[[-38, -28, Y], [6, -50, B], [-46, 22, K]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r={15 + Math.sin(t * 3 + i) * 2} fill={c as string} />)}
    <g transform={`rotate(${-40 + Math.sin(t * 2.4) * 10})`}><rect x={70} y={-110} width={16} height={120} fill={K} /><path d="M70 -110 L78 -140 L86 -110Z" fill={Y} /></g>
  </g>
);
const Book: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${Math.sin(t * 2) * 3})`}>
    <rect x={-100} y={-60} width={96} height={120} fill={P} />
    <rect x={4} y={-60} width={96} height={120} fill={P} />
    <rect x={-8} y={-66} width={16} height={134} fill={R} />
    {[-34, -10, 14, 38].map((y, i) => <g key={i}><rect x={-86} y={y} width={64} height={8} fill={K} /><rect x={22} y={y} width={64} height={8} fill={B} /></g>)}
  </g>
);
const Can: React.FC<{ t: number }> = ({ t }) => (
  <g transform={`rotate(${-12 + Math.sin(t * 2) * 5})`}>
    <rect x={-54} y={-40} width={110} height={100} fill={Y} />
    <path d="M-40 -40 A45 45 0 0 1 44 -40" fill="none" stroke={K} strokeWidth={14} />
    <path d="M-54 10 L-122 -54 L-108 -66 L-54 -18Z" fill={Y} />
    <rect x={-54} y={14} width={110} height={14} fill={K} />
    {Array.from({ length: 6 }, (_, i) => { const p = (t * 1.6 + i / 6) % 1; return <rect key={i} x={-132 - (i % 3) * 12 - p * 20} y={-50 + p * 120} width={10} height={10} fill={P} opacity={1 - p * 0.5} />; })}
  </g>
);
const Tulip: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x={-6} y={-20} width={12} height={100} fill={K} />
    <path d="M0 80 A60 60 0 0 1 -60 20 L0 20Z" fill={Y} />
    <g transform={`translate(0 -24) rotate(${Math.sin(t * 1.8) * 6})`}>
      <path d="M-44 0 A44 44 0 0 0 44 0Z" fill={R} />
      <path d="M-44 0 L-44 -56 L-22 -30 L0 -64 L22 -30 L44 -56 L44 0Z" fill={R} />
    </g>
  </g>
);
type Shape = "square" | "circle" | "diamond";
const Tile: React.FC<{ x: number; y: number; s: number; t: number; bg: string; shape: Shape; children: React.ReactNode; label?: string; lc?: string }> = ({ x, y, s, t, bg, shape, children, label, lc = R }) =>
  s <= 0.001 ? null : (
    <g transform={`translate(${x} ${y + Math.sin(t * 1.6 + x) * 6}) scale(${s})`}>
      <g transform="translate(16 16)">
        {shape === "circle" ? <circle r={160} fill={K} /> : <rect x={-150} y={-150} width={300} height={300} fill={K} transform={shape === "diamond" ? "rotate(45) scale(0.86)" : undefined} />}
      </g>
      {shape === "circle" ? <circle r={160} fill={bg} /> : <rect x={-150} y={-150} width={300} height={300} fill={bg} transform={shape === "diamond" ? "rotate(45) scale(0.86)" : undefined} />}
      {children}
      {label && (
        <g transform="translate(0 210)">
          <rect x={-100} y={-38} width={200} height={70} fill={lc} />
          <text y={14} textAnchor="middle" style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 42 }} fill={P}>{label}</text>
        </g>
      )}
    </g>
  );

const Block: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ background: c, color: P, padding: "0 16px", margin: "0 4px", display: "inline-block", lineHeight: 1.35 }}>{children}</span>
);
const Line: React.FC<{ q: number; size?: number; color?: string; children: React.ReactNode; out?: number }> = ({ q, size = 64, color = K, children, out = 0 }) => (
  <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: size, color, direction: "rtl", lineHeight: 1.45, opacity: Math.min(1, q * 2) * (1 - out),
    clipPath: `inset(0 0 0 ${(1 - q) * 100}%)`, transform: `translateX(${-out * 60}px)` }}>{children}</div>
);

export const AgriBauhaus: React.FC<{ times?: number[]; music?: boolean }> = ({ times, music = true }) => {
  const ok = useArtFonts();
  const frame = useCurrentFrame();
  const t = times ? times[frame] ?? 0 : frame / FPS;
  if (!ok) return <AbsoluteFill style={{ background: P }} />;
  const outOf = (i: number) => k(t, S[i + 1] - 0.3, S[i + 1], Easing.in(Easing.cubic));
  const s2o = outOf(1), s3o = outOf(2), s4o = outOf(3);

  // logo: centre (S1) → badge top-right → centre (S5)
  const m = k(t, S[1] - 0.25, S[1] + 0.45, io) * (1 - k(t, S[4], S[4] + 0.7, io));
  const lw = interpolate(m, [0, 1], [600, 220]) * k(t, 0.0, 0.5, back);
  const lcx = interpolate(m, [0, 1], [540, 905]), lcy = interpolate(m, [0, 1], [700, 175]);
  const lh = lw * (1170 / 1032);
  const disc = lw * 0.92;

  const stages = [0.12, 0.45, 0.8, 1];
  const prog = k(t, S[2] + 0.55, S[2] + 3.7, Easing.inOut(Easing.quad));
  const wipes: [number, string][] = [[S[1], R], [S[2], B], [S[3], Y], [S[4], K]];

  const card = () => {
    if (t < S[1]) return (
      <>
        <Line q={k(t, 0.2, 0.7)} out={outOf(0)} size={92}><Block c={R}>خوش</Block><Block c={B}>آمدید</Block></Line>
        <Line q={k(t, 0.9, 1.5)} out={outOf(0)} size={36}>کانال آموزش تخصصی کشاورزی در بله</Line>
      </>
    );
    if (t < S[2]) return (
      <>
        <Line q={k(t, S[1] + 0.15, S[1] + 0.6)} out={s2o} size={74}>تلفیق <Block c={B}>علم</Block> و <Block c={R}>خلاقیت</Block></Line>
        <Line q={k(t, S[1] + 2.2, S[1] + 2.7)} out={s2o} size={50}>در کشت و کار</Line>
      </>
    );
    if (t < S[3]) return (
      <>
        <Line q={k(t, S[2] + 0.15, S[2] + 0.6)} out={s3o} size={78}>آموزش <Block c={R}>تخصصی</Block></Line>
        <Line q={k(t, S[2] + 2.55, S[2] + 3.0)} out={s3o} size={52}>از <Block c={K}>صفر</Block> تا <Block c={B}>صد</Block></Line>
      </>
    );
    if (t < S[4]) {
      const w = [S[3] + 0.15, S[3] + 1.15, S[3] + 2.45];
      const sp = (i: number) => ({ display: "inline-block" as const, opacity: k(t, w[i], w[i] + 0.2) * (1 - s4o), transform: `translateY(${(1 - k(t, w[i], w[i] + 0.35, back)) * 40}px)` });
      return (
        <div style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 64, color: K, direction: "rtl", lineHeight: 1.55 }}>
          <span style={sp(0)}><Block c={Y}>بیاموزید</Block>،</span> <span style={sp(1)}><Block c={B}>تجربه</Block> کنید</span>
          <br />
          <span style={sp(2)}>و <Block c={R}>هنرمندانه</Block> بکارید</span>
        </div>
      );
    }
    return (
      <>
        <Line q={k(t, S[4] + 0.3, S[4] + 0.8)} size={54}>ما را در پیام‌رسان <Block c={R}>بله</Block> دنبال کنید</Line>
        <div style={{ marginTop: 20, opacity: k(t, S[4] + 1.35, S[4] + 1.6), transform: `translateX(${(1 - k(t, S[4] + 1.35, S[4] + 1.8, back)) * -300}px)`,
          background: P, border: `7px solid ${K}`, boxShadow: `12px 12px 0 ${B}`, padding: "8px 26px 8px 10px", display: "flex", alignItems: "center", gap: 14, direction: "ltr" }}>
          <Img src={staticFile("v16/bale.png")} style={{ width: 58, height: 58 }} />
          <span style={{ fontFamily: AM.hud, fontWeight: 700, fontSize: 42, color: K }}>ble.ir/<span style={{ color: R }}>ArtofAgriculture</span></span>
        </div>
      </>
    );
  };

  return (
    <AbsoluteFill style={{ background: P, overflow: "hidden" }}>
      {music && !times && <Audio src={staticFile("v16/mix.wav")} />}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <World t={t} />

        {/* logo backdrop: offset red disc + blue square (S1 and S5) */}
        <g opacity={1 - m}>
          <rect x={lcx - disc * 0.62} y={lcy - disc * 0.62 + 40} width={disc * 0.5} height={disc * 0.5} fill={B} transform={`rotate(${t * 8} ${lcx} ${lcy})`} />
          <circle cx={lcx + 22 + Math.sin(t * 2) * 8} cy={lcy + 22} r={disc / 2} fill={R} />
        </g>

        {/* S2 */}
        {t >= S[1] - 0.1 && t < S[2] + 0.4 && (
          <g opacity={1 - s2o * 0.2}>
            <line x1={790} y1={700} x2={560} y2={1000} stroke={K} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[1] + 1.4, S[1] + 1.9)} />
            <line x1={290} y1={700} x2={520} y2={1000} stroke={K} strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k(t, S[1] + 1.5, S[1] + 2.0)} />
            <g transform="translate(540 1150)">
              <rect x={-90} y={-10} width={180} height={70} fill={R} transform={`scale(${k(t, S[1], S[1] + 0.4, back)} 1)`} />
              <GeoPlant g={0.3 + 0.7 * k(t, S[1] + 2.0, S[2] - 0.2, Easing.out(Easing.quad))} H={300} t={t} />
            </g>
            <Tile x={790 + (1 - k(t, S[1] + 0.6, S[1] + 1.05, back)) * 500} y={560} s={0.95 - s2o * 0.3} t={t} bg={B} shape="square" label="علم" lc={K}><Flask t={t} /></Tile>
            <Tile x={290 - (1 - k(t, S[1] + 0.95, S[1] + 1.4, back)) * 500} y={560} s={0.95 - s2o * 0.3} t={t} bg={R} shape="circle" label="خلاقیت" lc={K}><Palette t={t} /></Tile>
          </g>
        )}

        {/* S3 */}
        {t >= S[2] - 0.05 && t < S[3] + 0.3 && (
          <g transform={`translate(${s3o * -1100} 0)`}>
            {stages.map((g, i) => {
              const x = 900 - i * 240, a = k(t, S[2] + 0.25 + i * 0.45, S[2] + 0.65 + i * 0.45, back);
              const bg = [Y, B, R, Y][i];
              return (
                <g key={i} transform={`translate(${x} 900) scale(${a})`}>
                  <rect x={-98} y={-300} width={210} height={330} fill={K} transform="translate(12 12)" />
                  <rect x={-110} y={-312} width={220} height={330} fill={i % 2 ? P : "#fff8e6"} />
                  <rect x={-110} y={-312} width={220} height={26} fill={bg} />
                  <rect x={-110} y={-2} width={220} height={20} fill={K} />
                  <g transform="translate(0 -4)">
                    {i < 3 ? <GeoPlant g={g * k(t, S[2] + 0.4 + i * 0.45, S[2] + 1.5 + i * 0.45)} H={200} t={t + i} c1={i === 1 ? R : B} c2={i === 1 ? B : R} /> : <GeoTree s={0.82 * k(t, S[2] + 1.75, S[2] + 2.3, back)} t={t} />}
                  </g>
                  <text y={80} textAnchor="middle" style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 44 }} fill={K}>{["بذر", "جوانه", "نهال", "ثمر"][i]}</text>
                </g>
              );
            })}
            <rect x={100} y={1050} width={880} height={36} fill={K} transform={`scale(${k(t, S[2] + 0.3, S[2] + 0.6)} 1)`} transform-origin="980 0" />
            <rect x={106 + 868 * (1 - prog)} y={1056} width={868 * prog} height={24} fill={R} />
            <g transform={`translate(${974 - 868 * prog} 1068) scale(${k(t, S[2] + 0.4, S[2] + 0.75, back)})`}>
              <circle r={58} fill={Y} stroke={K} strokeWidth={8} />
              <text y={15} textAnchor="middle" style={{ fontFamily: AM.fa, fontWeight: 900, fontSize: 40 }} fill={K}>{fa(Math.round(prog * 100))}٪</text>
            </g>
          </g>
        )}

        {/* S4 */}
        {t >= S[3] - 0.3 && t < S[4] + 0.4 && (
          <g opacity={1 - s4o}>
            {[
              { x: 790, y: 540, at: S[3] + 0.15, bg: Y, shape: "square" as Shape, el: <Book t={t} /> },
              { x: 540, y: 930, at: S[3] + 1.15, bg: B, shape: "circle" as Shape, el: <Can t={t} /> },
              { x: 290, y: 540, at: S[3] + 2.45, bg: "#FFFFFF", shape: "diamond" as Shape, el: <Tulip t={t} /> },
            ].map((c, i) => (
              <Tile key={i} x={c.x} y={c.y} s={k(t, c.at, c.at + 0.4, back) * (1 - s4o * 0.5)} t={t} bg={c.bg} shape={c.shape}>{c.el}</Tile>
            ))}
          </g>
        )}

        {/* geometric wipes on each scene change */}
        {wipes.map(([p, c], i) => {
          const g = k(t, p - 0.32, p - 0.02, io), o = k(t, p - 0.02, p + 0.3, io);
          if (g <= 0 || o >= 1) return null;
          return i % 2
            ? <rect key={i} x={0} y={1600 - 1600 * g + 1600 * o - 1600 * o} width={1080} height={1600 * (g - o)} fill={c} />
            : <rect key={i} x={1080 - 1080 * g} y={0} width={1080 * (g - o)} height={1600} fill={c} />;
        })}
      </svg>

      <Img src={staticFile("v16/logo.png")} style={{ position: "absolute", left: lcx - lw / 2, top: lcy - lh / 2, width: lw, height: lh }} />

      {/* text card */}
      <div style={{ position: "absolute", left: 70, top: 1250, width: 920, height: 320, opacity: k(t, 0.1, 0.3),
        transform: `translateX(${(1 - k(t, 0.1, 0.55, back)) * 1000}px)` }}>
        <div style={{ position: "absolute", inset: 0, background: P, border: `8px solid ${K}`, boxShadow: `16px 16px 0 ${K}` }} />
        <div style={{ position: "absolute", right: -8, top: -8, width: 60, height: 60, background: R }} />
        <div style={{ position: "absolute", left: -8, bottom: -8, width: 40, height: 40, borderRadius: 20, background: B }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 30px" }}>
          {card()}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const LOOK = [0.3, 1.6, 3.1, 4.6, 6.4, 8.2, 9.6, 11.4, 12.8, 15.0, 16.6, 19.5];
export const V16: React.FC = () => (
  <>
    <Composition id="V16" component={AgriBauhaus} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} />
    <Composition id="V16-Silent" component={AgriBauhaus} durationInFrames={DUR * FPS} fps={FPS} width={1080} height={1920} defaultProps={{ music: false }} />
    <Composition id="V16-Look" component={AgriBauhaus} durationInFrames={LOOK.length} fps={FPS} width={1080} height={1920} defaultProps={{ times: LOOK }} />
  </>
);
