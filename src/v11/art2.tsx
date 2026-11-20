// v11 · art v2: lighting, depth, richer environments, limbs/props for plant characters, extra characters.
import React from "react";
import { C, INK, FONT, clamp, mix, rng, ridge, blob, Face, PExpr, Leaf, Sparkle, Bubbles, Particle, Roots, NetPot } from "./art";

type ArmA = [number, number];

export const Defs2: React.FC = () => (
  <defs>
    <filter id="b3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3" /></filter>
    <filter id="b8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8" /></filter>
    <filter id="b20" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="20" /></filter>
    <filter id="b40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
    <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff6d0" stopOpacity="0.9" /><stop offset="1" stopColor="#fff6d0" stopOpacity="0" /></linearGradient>
    <linearGradient id="morning" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fbdf0" /><stop offset="0.55" stopColor="#bfe8f7" /><stop offset="1" stopColor="#fff3cf" /></linearGradient>
    <linearGradient id="golden" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a7fd1" /><stop offset="0.45" stopColor="#f6a76b" /><stop offset="0.75" stopColor="#ffd37a" /><stop offset="1" stopColor="#ffe9b0" /></linearGradient>
    <linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b3f8f" /><stop offset="0.4" stopColor="#c45f8e" /><stop offset="0.7" stopColor="#ff9d5c" /><stop offset="1" stopColor="#ffd27a" /></linearGradient>
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d1b45" /><stop offset="1" stopColor="#3b2a6b" /></linearGradient>
    <linearGradient id="deepwater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8ff0f0" /><stop offset="0.35" stopColor="#2bb8cf" /><stop offset="1" stopColor="#0d5f86" /></linearGradient>
    <linearGradient id="ghglass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2fbff" /><stop offset="1" stopColor="#d6f2e6" /></linearGradient>
    <linearGradient id="floorWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c98c55" /><stop offset="1" stopColor="#8f5a30" /></linearGradient>
    <linearGradient id="curtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a1f2b" /><stop offset="0.5" stopColor="#c8323f" /><stop offset="1" stopColor="#8a1f2b" /></linearGradient>
    <radialGradient id="vig" cx="0.5" cy="0.48" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1a0f05" stopOpacity="0.55" /></radialGradient>
    <radialGradient id="warmglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff1b8" stopOpacity="0.95" /><stop offset="1" stopColor="#ffcf6b" stopOpacity="0" /></radialGradient>
    <radialGradient id="spot" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#fff8d6" stopOpacity="0.85" /><stop offset="1" stopColor="#fff8d6" stopOpacity="0" /></radialGradient>
    <radialGradient id="pinkled" cx="0.5" cy="0" r="1"><stop offset="0" stopColor="#ff7ae0" stopOpacity="0.55" /><stop offset="1" stopColor="#8a5cff" stopOpacity="0" /></radialGradient>
  </defs>
);

// ---------------------------------------------------------------- light & depth
export const GodRays: React.FC<{ x: number; y: number; ang?: number; spread?: number; len?: number; n?: number; o?: number; t?: number; w?: number }> = ({ x, y, ang = 30, spread = 40, len = 2200, n = 7, o = 0.35, t = 0, w = 70 }) => (
  <g style={{ mixBlendMode: "screen" }} opacity={o} filter="url(#b8)">
    {Array.from({ length: n }, (_, i) => {
      const a = ang - spread / 2 + (spread * i) / (n - 1) + Math.sin(t / 40 + i) * 1.2;
      const ww = w * (0.6 + ((i * 37) % 10) / 10);
      return <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}><path d={`M ${-ww * 0.2} 0 L ${ww * 0.2} 0 L ${ww} ${len} L ${-ww} ${len} Z`} fill="url(#ray)" opacity={0.5 + 0.5 * Math.sin(t / 25 + i * 2)} /></g>;
    })}
  </g>
);
export const Vignette: React.FC<{ o?: number }> = ({ o = 1 }) => <rect x="-100" y="-100" width="1280" height="2120" fill="url(#vig)" opacity={o} />;
export const Glow: React.FC<{ x: number; y: number; r: number; o?: number; c?: string }> = ({ x, y, r, o = 0.8 }) => <circle cx={x} cy={y} r={r} fill="url(#warmglow)" opacity={o} style={{ mixBlendMode: "screen" }} />;
export const Tint: React.FC<{ c: string; o: number; mode?: string }> = ({ c, o, mode = "soft-light" }) => <rect x="-100" y="-100" width="1280" height="2120" fill={c} opacity={o} style={{ mixBlendMode: mode as never }} />;
export const Bokeh: React.FC<{ n?: number; seed?: number; cols?: string[]; r?: [number, number]; area?: [number, number, number, number]; t?: number; o?: number }> = ({ n = 16, seed = 3, cols = ["#fff6c4", "#c8f7a8", "#ffffff"], r = [20, 60], area = [0, 0, 1080, 1300], t = 0, o = 0.5 }) => {
  const R = rng(seed);
  return <g filter="url(#b3)" style={{ mixBlendMode: "screen" }}>{Array.from({ length: n }, (_, i) => {
    const x = area[0] + R() * area[2], y = area[1] + R() * area[3], rr = mix(r[0], r[1], R());
    return <circle key={i} cx={x + Math.sin(t / 50 + i) * 10} cy={y} r={rr} fill={cols[i % cols.length]} opacity={o * (0.4 + 0.6 * R())} />;
  })}</g>;
};
// big out-of-focus foreground leaves (depth of field)
export const FgLeaves: React.FC<{ side: "l" | "r" | "b"; y?: number; s?: number; t?: number; c?: string; blur?: string }> = ({ side, y = 1700, s = 1, t = 0, c = "#2f7d2f", blur = "b8" }) => {
  const x = side === "l" ? -40 : side === "r" ? 1120 : 540;
  const base = side === "l" ? -30 : side === "r" ? 30 : 0;
  return <g filter={`url(#${blur})`} transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => <path key={i} d="M 0 0 C 60 -60 70 -200 0 -300 C -70 -200 -60 -60 0 0 Z" fill={i % 2 ? c : "#3f9a3a"} transform={`rotate(${base + (i - 2) * 22 + Math.sin(t / 30 + i) * 3}) scale(${1 - i * 0.07})`} />)}
  </g>;
};

// ---------------------------------------------------------------- plant limbs & accessories
export const Limbs: React.FC<{
  x: number; y: number; s?: number; w: number; armY: number; legY?: number; aL?: ArmA; aR?: ArmA; c?: string; walk?: number; legLen?: number; feet?: string;
  children: React.ReactNode; propR?: React.ReactNode; propL?: React.ReactNode; rot?: number; noLegs?: boolean;
}> = ({ x, y, s = 1, w, armY, legY = 0, aL = [30, 20], aR = [30, 20], c = "#2f6e25", walk, legLen = 48, feet = "#2f6e25", children, propR, propL, rot = 0, noLegs }) => {
  const r = Math.PI / 180;
  const arm = (sd: number, a: ArmA) => {
    const sx = sd * w, sy = armY;
    const ex = sx + sd * Math.sin(a[0] * r) * 40, ey = sy + Math.cos(a[0] * r) * 40;
    const hx = ex + sd * Math.sin(a[1] * r) * 36, hy = ey + Math.cos(a[1] * r) * 36;
    return { sx, sy, ex, ey, hx, hy };
  };
  const L = arm(-1, aL), R = arm(1, aR);
  const drawArm = (A: ReturnType<typeof arm>) => <g>
    <path d={`M ${A.sx} ${A.sy} Q ${A.ex} ${A.ey} ${A.hx} ${A.hy}`} stroke={INK} strokeWidth="10" fill="none" strokeLinecap="round" />
    <path d={`M ${A.sx} ${A.sy} Q ${A.ex} ${A.ey} ${A.hx} ${A.hy}`} stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx={A.hx} cy={A.hy} r="11" fill="#fff" stroke={INK} strokeWidth="3.5" />
    <path d={`M ${A.hx - 5} ${A.hy - 9} l 0 6 M ${A.hx + 1} ${A.hy - 11} l 0 7`} stroke={INK} strokeWidth="2" />
  </g>;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
      <ellipse cx="0" cy={legY + legLen + 6} rx={w * 1.1} ry="10" fill="#000" opacity="0.15" filter="url(#b3)" />
      {!noLegs && [-1, 1].map((sd) => {
        const ph = walk === undefined ? 0 : walk + (sd > 0 ? Math.PI : 0);
        const fx = walk === undefined ? 0 : Math.sin(ph) * 14, fy = walk === undefined ? 0 : -Math.max(0, Math.cos(ph)) * 10;
        return <g key={sd}>
          <path d={`M ${sd * w * 0.35} ${legY} L ${sd * w * 0.42 + fx} ${legY + legLen + fy}`} stroke={INK} strokeWidth="10" strokeLinecap="round" />
          <path d={`M ${sd * w * 0.35} ${legY} L ${sd * w * 0.42 + fx} ${legY + legLen + fy}`} stroke={c} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx={sd * w * 0.42 + fx + sd * 9} cy={legY + legLen + fy + 2} rx="17" ry="9" fill={feet} stroke={INK} strokeWidth="3.5" />
        </g>;
      })}
      {children}
      <g>{drawArm(L)}{drawArm(R)}</g>
      {propL && <g transform={`translate(${L.hx} ${L.hy})`}>{propL}</g>}
      {propR && <g transform={`translate(${R.hx} ${R.hy})`}>{propR}</g>}
    </g>
  );
};
export const ARMS: Record<string, ArmA> = {
  rest: [25, 15], up: [160, 175], wave: [125, 165], hips: [40, -60], point: [85, 95], shrug: [100, 30], cheer: [140, 150], hold: [40, 100], scratch: [150, -130], chin: [40, -140], out: [90, 90], cover: [60, -170],
};

export const ChefHat: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -40 0 L -36 -50 Q -70 -70 -50 -100 Q -40 -130 -10 -112 Q 6 -140 30 -116 Q 66 -120 54 -82 Q 64 -60 36 -50 L 40 0 Z" fill="#fff" stroke={INK} strokeWidth="4" />
    <path d="M -38 -14 L 38 -14" stroke="#ddd" strokeWidth="4" />
  </g>
);
export const Glasses: React.FC<{ x: number; y: number; k?: number }> = ({ x, y, k = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`} fill="#e9fbff" fillOpacity="0.35" stroke={INK} strokeWidth="4.5">
    <circle cx="-20" cy="0" r="22" /><circle cx="20" cy="0" r="22" /><path d="M -2 -2 Q 0 -6 2 -2" fill="none" />
  </g>
);
export const Napkin: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <path d="M -34 0 L 34 0 L 0 46 Z" transform={`translate(${x} ${y}) scale(${s})`} fill="#fff" stroke={INK} strokeWidth="3.5" />
);
export const Towel: React.FC = () => <path d="M -10 -10 L 40 -30 L 46 30 L 0 40 Z" fill="#7fd0f0" stroke={INK} strokeWidth="3" />;

// ---------------------------------------------------------------- new characters
export const Droplet: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; aL?: ArmA; aR?: ArmA; look?: [number, number] }> = ({ x, y, s = 1, expr = "happy", t = 0, aL = ARMS.rest, aR = ARMS.rest, look }) => (
  <Limbs x={x} y={y} s={s} w={42} armY={-10} legY={40} aL={aL} aR={aR} c="#1f9fb8" feet="#7fdcea" legLen={30}>
    <g>
      <path d="M 0 -90 Q 50 -20 46 14 Q 42 52 0 52 Q -42 52 -46 14 Q -50 -20 0 -90 Z" fill="#59d0e6" stroke={INK} strokeWidth="4" />
      <path d="M -24 -10 Q -28 14 -14 30" stroke="#fff" strokeWidth="7" fill="none" opacity="0.7" strokeLinecap="round" />
    </g>
    <Face y={8} k={0.75} expr={expr} look={look} blink={(t + 13) % 90 > 86} />
  </Limbs>
);
export const Coconut: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; aL?: ArmA; aR?: ArmA }> = ({ x, y, s = 1, expr = "proud", t = 0, aL = ARMS.hips, aR = ARMS.point }) => (
  <Limbs x={x} y={y} s={s} w={56} armY={0} legY={46} aL={aL} aR={aR} c="#6b3f1f" feet="#5e3a1f">
    <g>
      <circle r="62" fill="#7a4a26" stroke={INK} strokeWidth="4.5" />
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 50} ${Math.sin(a) * 50} q ${Math.cos(a + 1) * 14} ${Math.sin(a + 1) * 14} ${Math.cos(a) * 22} ${Math.sin(a) * 22}`} stroke="#b07a48" strokeWidth="3" fill="none" />; })}
      <path d="M -40 -50 Q -50 -90 -20 -96 M 0 -60 Q 4 -100 30 -100 M 30 -50 Q 60 -80 70 -60" stroke="#b07a48" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
    <Face y={0} k={0.85} expr={expr} blink={(t + 33) % 90 > 86} />
  </Limbs>
);
export const PerliteBud: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; seed?: number }> = ({ x, y, s = 1, expr = "happy", t = 0, seed = 1 }) => (
  <g transform={`translate(${x} ${y - Math.abs(Math.sin(t / 6 + seed)) * 30 * s}) scale(${s})`}>
    <path d={blob(0, 0, 40, 36, 5, 0.12, seed)} fill="#fbfbf6" stroke={INK} strokeWidth="3.5" />
    {[[-14, -10], [12, 8], [-6, 14], [16, -14]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="3.5" fill="#d7d7cf" />)}
    <Face y={2} k={0.45} expr={expr} />
  </g>
);
export const BulbBuddy: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; aL?: ArmA; aR?: ArmA }> = ({ x, y, s = 1, expr = "happy", t = 0, aL = ARMS.rest, aR = ARMS.wave }) => (
  <Limbs x={x} y={y} s={s} w={44} armY={-10} legY={50} aL={aL} aR={aR} c="#c98d22" feet="#888" legLen={34}>
    <circle cy="-20" r="90" fill="url(#warmglow)" opacity="0.7" />
    <g>
      <path d="M -30 40 Q -60 0 -50 -40 Q -36 -90 0 -90 Q 36 -90 50 -40 Q 60 0 30 40 Z" fill="#ffe14d" stroke={INK} strokeWidth="4" />
      <rect x="-26" y="38" width="52" height="24" rx="6" fill="#aaa" stroke={INK} strokeWidth="4" />
    </g>
    <Face y={-26} k={0.7} expr={expr} blink={(t + 7) % 90 > 86} />
  </Limbs>
);
export const O2Buddy: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; aL?: ArmA; aR?: ArmA }> = ({ x, y, s = 1, expr = "happy", t = 0, aL = ARMS.rest, aR = ARMS.rest }) => (
  <Limbs x={x} y={y + Math.sin(t / 10) * 8} s={s} w={52} armY={0} legY={50} aL={aL} aR={aR} c="#5fb9e0" feet="#bfe9ff" legLen={26}>
    <g>
      <circle r="58" fill="#e6fbff" fillOpacity="0.85" stroke={INK} strokeWidth="4" />
      <ellipse cx="-22" cy="-26" rx="16" ry="9" fill="#fff" />
    </g>
    <text x="0" y="-30" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="26" fill="#3a8fb5">O₂</text>
    <Face y={8} k={0.62} expr={expr} blink={(t + 51) % 90 > 86} />
  </Limbs>
);
export const NutriBuddy: React.FC<{ x: number; y: number; s?: number; expr?: PExpr; t?: number; i?: number; aL?: ArmA; aR?: ArmA }> = ({ x, y, s = 1, expr = "happy", t = 0, i = 0, aL = ARMS.rest, aR = ARMS.rest }) => {
  const cols = ["#3b82f6", "#f97316", "#a855f7", "#22c55e", "#ef4444"];
  const lab = ["N", "P", "K", "Mg", "Fe"];
  return (
    <Limbs x={x} y={y} s={s} w={46} armY={0} legY={42} aL={aL} aR={aR} c={cols[i % 5]} feet={cols[i % 5]} legLen={28}>
      <circle r="70" fill={cols[i % 5]} opacity="0.3" filter="url(#b8)" />
      <circle r="50" fill={cols[i % 5]} stroke={INK} strokeWidth="4" />
      <text x="0" y="-22" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="26" fill="#fff">{lab[i % 5]}</text>
      <Face y={10} k={0.55} expr={expr} />
    </Limbs>
  );
};

// ---------------------------------------------------------------- garden nature
export const Flower: React.FC<{ x: number; y: number; s?: number; c?: string; kind?: "daisy" | "tulip" | "round"; t?: number }> = ({ x, y, s = 1, c = "#ff6b8a", kind = "daisy", t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t / 22 + x) * 4})`}>
    <path d="M 0 0 Q -4 -40 0 -80" stroke="#3f8f2f" strokeWidth="5" fill="none" />
    <path d="M 0 -30 Q -24 -44 -30 -30 Q -16 -22 0 -30 Z" fill="#5fb33a" />
    {kind === "tulip" ? <path d="M -20 -110 L -12 -84 Q 0 -74 12 -84 L 20 -110 L 8 -96 L 0 -114 L -8 -96 Z" fill={c} stroke={INK} strokeWidth="3" />
      : kind === "round" ? <circle cx="0" cy="-90" r="20" fill={c} stroke={INK} strokeWidth="3" />
        : <g>{Array.from({ length: 7 }, (_, i) => <ellipse key={i} cx="0" cy="-104" rx="8" ry="16" fill={c} stroke={INK} strokeWidth="2.5" transform={`rotate(${i * 51} 0 -88)`} />)}<circle cx="0" cy="-88" r="9" fill="#ffd23a" stroke={INK} strokeWidth="2.5" /></g>}
  </g>
);
export const Butterfly: React.FC<{ x: number; y: number; s?: number; t: number; c?: string }> = ({ x, y, s = 1, t, c = "#ffb03a" }) => {
  const f = Math.abs(Math.sin(t / 2.5));
  return <g transform={`translate(${x + Math.sin(t / 20) * 40} ${y + Math.sin(t / 9) * 20}) scale(${s})`}>
    <g transform={`scale(${0.3 + f * 0.7} 1)`}><path d="M 0 0 Q -30 -36 -40 -10 Q -40 10 0 0 Z M 0 0 Q -26 26 -10 30 Q 0 20 0 0 Z" fill={c} stroke={INK} strokeWidth="2.5" /><path d="M 0 0 Q 30 -36 40 -10 Q 40 10 0 0 Z M 0 0 Q 26 26 10 30 Q 0 20 0 0 Z" fill={c} stroke={INK} strokeWidth="2.5" /></g>
    <line x1="0" y1="-12" x2="0" y2="14" stroke={INK} strokeWidth="4" strokeLinecap="round" />
  </g>;
};
export const Bush: React.FC<{ x: number; y: number; s?: number; c?: string; berries?: string }> = ({ x, y, s = 1, c = "#3f9a3a", berries }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g><circle cx="-50" cy="-40" r="56" fill={c} /><circle cx="30" cy="-60" r="70" fill={c} /><circle cx="90" cy="-30" r="50" fill={c} /><circle cx="20" cy="-20" r="60" fill="#2f7d2f" opacity="0.6" /></g>
    {berries && [[-60, -60], [10, -90], [60, -50], [-20, -30], [90, -40]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="9" fill={berries} stroke={INK} strokeWidth="2" />)}
  </g>
);
// little cabbage/lettuce heads for background beds
export const MiniHead: React.FC<{ x: number; y: number; s?: number; c?: string }> = ({ x, y, s = 1, c = "#8fd14f" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><path d={blob(0, 0, 30, 22, 7, 0.1)} fill={c} stroke={INK} strokeWidth="2.5" /><path d={blob(0, -4, 16, 12, 5, 0.1)} fill="#c3ea86" /></g>
);
export const GreenhouseFar: React.FC<{ x: number; y: number; s?: number; glow?: number }> = ({ x, y, s = 1, glow = 0.6 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx="0" cy="-90" r="200" fill="url(#warmglow)" opacity={glow * 0.6} />
    <g>
      <path d="M -150 0 L -150 -110 Q 0 -230 150 -110 L 150 0 Z" fill="url(#ghglass)" fillOpacity="0.9" stroke={INK} strokeWidth="4" />
      {[-100, -50, 0, 50, 100].map((dx) => <line key={dx} x1={dx} y1={-110 - (150 - Math.abs(dx)) * 0.55} x2={dx} y2="0" stroke="#8fc4b4" strokeWidth="3" />)}
      <path d="M -150 -110 Q 0 -230 150 -110" stroke="#8fc4b4" strokeWidth="3" fill="none" />
      {[-110, -60, -10, 40, 90].map((dx, i) => <circle key={dx} cx={dx + 10} cy={-26} r="16" fill={[C.green, C.red, C.lime, "#f7b52a", C.green][i]} opacity="0.85" />)}
    </g>
  </g>
);

// ---------------------------------------------------------------- environments
// lush morning garden with a path running into depth
export const GardenBG: React.FC<{ t: number; hz?: number; path?: boolean; gh?: boolean }> = ({ t, hz = 880, path = true, gh = true }) => (
  <g>
    <rect x="-200" y="-200" width="1480" height="2400" fill="url(#morning)" />
    <circle cx="180" cy="230" r="300" fill="url(#warmglow)" opacity="0.9" />
    <circle cx="180" cy="230" r="70" fill="#fff8d8" />
    <g opacity="0.9">
      <ellipse cx={330 + t * 0.3} cy="300" rx="140" ry="40" fill="#fff" /><ellipse cx={380 + t * 0.3} cy="275" rx="80" ry="45" fill="#fff" />
      <ellipse cx={850 - t * 0.2} cy="460" rx="110" ry="30" fill="#fff" />
    </g>
    {/* distant tree line */}
    <path d={ridge(hz - 90, 30, 3.2, 0.5)} fill="#8fbf9a" opacity="0.8" />
    {[60, 210, 380, 760, 930].map((x, i) => <g key={x} opacity="0.85"><circle cx={x} cy={hz - 120 - (i % 2) * 30} r={60 + (i % 3) * 14} fill={i % 2 ? "#6aa86a" : "#5c9c62"} /></g>)}
    <path d={ridge(hz - 20, 14, 2, 1)} fill="#9fd46a" />
    {gh && <GreenhouseFar x={760} y={hz + 10} s={0.8} />}
    {/* field + beds */}
    <rect x="-100" y={hz} width="1280" height={2000 - hz} fill="#86c94e" />
    {[0, 1, 2, 3, 4].map((r) => {
      const y = hz + 40 + r * r * 34 + r * 30, sc = 0.45 + r * 0.22;
      return <g key={r}>
        <path d={`M -100 ${y + 18 * sc} Q 540 ${y + 6} 1180 ${y + 18 * sc} L 1180 ${y + 36 * sc} Q 540 ${y + 26 * sc} -100 ${y + 36 * sc} Z`} fill="#a9733f" opacity="0.8" />
        {Array.from({ length: 12 - r }, (_, i) => { const x = -40 + i * (1160 / (11 - r)) + (r % 2) * 40; const near = Math.abs(x - 540) < 120 + r * 40 && path; return near ? null : (r % 2 ? <MiniHead key={i} x={x} y={y + 14 * sc} s={sc} c={i % 3 ? "#8fd14f" : "#6fbf3a"} /> : <Flower key={i} x={x} y={y + 20 * sc} s={sc * 0.8} c={["#ff6b8a", "#ffd23a", "#ff8c42", "#b98cff", "#fff"][i % 5]} kind={(["daisy", "tulip", "round"] as const)[i % 3]} t={t} />); })}
      </g>;
    })}
    {path && <path d={`M 470 ${hz} L 610 ${hz} L 900 2000 L 180 2000 Z`} fill="#e3c08a" />}
    {path && <path d={`M 470 ${hz} L 180 2000 M 610 ${hz} L 900 2000`} stroke="#c49a63" strokeWidth="6" opacity="0.6" />}
  </g>
);

// greenhouse interior in one-point perspective, sun streaming in
export const GHInterior: React.FC<{ t: number; vp?: [number, number]; rows?: boolean; warm?: number; floor?: string }> = ({ t, vp = [540, 820], rows = true, warm = 1, floor = "#c9a06b" }) => {
  const [vx, vy] = vp;
  const R = rng(17);
  // channel rails from foreground to vanishing point
  const rail = (x0: number, y0: number) => ({ x0, y0, x1: vx + (x0 - vx) * 0.12, y1: vy + (y0 - vy) * 0.12 });
  const rails = [rail(-200, 1150), rail(-200, 1450), rail(1280, 1150), rail(1280, 1450)];
  return (
    <g>
      <rect x="-200" y="-200" width="1480" height="2400" fill="#dff3ea" />
      {/* back wall window */}
      <rect x={vx - 150} y={vy - 260} width="300" height="300" fill="#fffbe6" />
      <circle cx={vx} cy={vy - 120} r="260" fill="url(#warmglow)" opacity={0.9 * warm} />
      {/* roof frame lines to vp */}
      <g stroke="#9cc9bd" strokeWidth="7" opacity="0.95">
        {[-400, -100, 200, 540, 880, 1180, 1480].map((x) => <line key={x} x1={x} y1={-100} x2={vx + (x - vx) * 0.25} y2={vy - 260} />)}
        {[0.25, 0.45, 0.7].map((k) => <rect key={k} x={vx - (vx + 200) * (1 - k) - 150 * k} y={vy - 260 - (vy + 100) * (1 - k) * 1.0} width={(1480) * (1 - k) + 300 * k} height={(2100) * (1 - k) + 300 * k} fill="none" />)}
        <line x1="-200" y1="2000" x2={vx - 150} y2={vy + 40} /><line x1="1280" y1="2000" x2={vx + 150} y2={vy + 40} />
      </g>
      {/* floor */}
      <path d={`M -200 2100 L ${vx - 150} ${vy + 40} L ${vx + 150} ${vy + 40} L 1280 2100 Z`} fill={floor} />
      <path d={`M ${vx - 60} ${vy + 40} L ${vx - 260} 2100 M ${vx + 60} ${vy + 40} L ${vx + 260} 2100`} stroke="#e8d3ad" strokeWidth="10" opacity="0.6" />
      {/* hanging baskets */}
      {[[200, 330], [880, 300]].map(([x, y], i) => <g key={i}><line x1={x} y1={-20} x2={x} y2={y - 40} stroke="#6b4320" strokeWidth="3" /><path d={`M ${x - 60} ${y - 40} Q ${x} ${y + 30} ${x + 60} ${y - 40} Z`} fill={C.woodL} stroke={INK} strokeWidth="3.5" />{[-50, -20, 10, 40].map((d, j) => <path key={j} d={`M ${x + d} ${y - 30} q ${(j - 1.5) * 10} 60 ${(j - 1.5) * 20} ${90 + j * 20}`} stroke={j % 2 ? "#3f9a3a" : "#5fb33a"} strokeWidth="7" fill="none" strokeLinecap="round" />)}<circle cx={x - 30} cy={y + 50} r="8" fill={C.red} /><circle cx={x + 25} cy={y + 70} r="8" fill="#ff6b8a" /></g>)}
      {/* channels in perspective with crops */}
      {rows && rails.map((r, k) => (
        <g key={k}>
          <path d={`M ${r.x0} ${r.y0} L ${r.x1} ${r.y1} L ${r.x1} ${r.y1 + 10} L ${r.x0} ${r.y0 + 60} Z`} fill="url(#pipe)" stroke={INK} strokeWidth="4" />
          {Array.from({ length: 9 }, (_, i) => {
            const f = 1 - Math.pow(i / 9, 0.6) * 0.95;
            const x = mix(r.x1, r.x0, f), y = mix(r.y1, r.y0, f), sc = 0.12 + f * 0.95;
            const kind = (k + i) % 4;
            return kind === 0 ? <MiniHead key={i} x={x} y={y - 8 * sc} s={sc * 1.3} />
              : kind === 1 ? <g key={i}><MiniHead x={x} y={y - 8 * sc} s={sc * 1.2} c="#5fb33a" /><circle cx={x + 10 * sc} cy={y - 30 * sc} r={12 * sc} fill={C.red} stroke={INK} strokeWidth={2 * sc} /></g>
                : kind === 2 ? <g key={i}><MiniHead x={x} y={y - 8 * sc} s={sc * 1.2} c="#3f9a3a" /><circle cx={x - 8 * sc} cy={y + 4 * sc} r={9 * sc} fill="#ec3b4a" stroke={INK} strokeWidth={2 * sc} /></g>
                  : <MiniHead key={i} x={x} y={y - 8 * sc} s={sc * 1.25} c="#a6dd56" />;
          })}
        </g>
      ))}
      <GodRays x={vx - 420} y={-120} ang={-28} spread={30} n={6} o={0.45 * warm} t={t} w={90} />
      {/* floating dust specks */}
      {Array.from({ length: 24 }, (_, i) => <circle key={i} cx={(R() * 1080 + t * (0.3 + R())) % 1080} cy={200 + R() * 900 + Math.sin(t / 20 + i) * 10} r={1.5 + R() * 2.5} fill="#fffbe0" opacity="0.8" />)}
    </g>
  );
};

// underwater macro inside the tank: roots like a jungle, caustics
export const Underwater: React.FC<{ t: number }> = ({ t }) => {
  const R = rng(29);
  return (
    <g>
      <rect x="-200" y="-200" width="1480" height="2400" fill="url(#deepwater)" />
      {/* caustic light ripples */}
      <g opacity="0.35" style={{ mixBlendMode: "screen" }} filter="url(#b3)">
        {Array.from({ length: 22 }, (_, i) => { const x = R() * 1080, y = R() * 900; return <path key={i} d={blob(x + Math.sin(t / 30 + i) * 20, y, 40 + R() * 50, 20 + R() * 20, 5, 0.25, i + t / 20)} fill="none" stroke="#e6ffff" strokeWidth="5" />; })}
      </g>
      <GodRays x={540} y={-300} ang={0} spread={50} n={7} o={0.4} t={t} w={70} />
      {/* raft silhouette at the top */}
      <rect x="-60" y="-20" width="1200" height="140" fill="#2c5f6d" opacity="0.85" />
      {[180, 540, 900].map((x) => <path key={x} d={`M ${x - 70} 120 L ${x + 70} 120 L ${x + 50} 220 L ${x - 50} 220 Z`} fill="#1d3a42" stroke={INK} strokeWidth="4" />)}
      {/* distant root curtains */}
      <g opacity="0.45" filter="url(#b3)">{[90, 300, 720, 980].map((x, i) => <Roots key={x} x={x} y={150} len={900} s={1.2} t={t + i * 40} n={9} />)}</g>
    </g>
  );
};

// golden-hour city seen from a balcony
export const CityGolden: React.FC<{ t: number }> = ({ t }) => {
  const R = rng(41);
  return (
    <g>
      <rect x="-200" y="-200" width="1480" height="2400" fill="url(#golden)" />
      <circle cx="760" cy="760" r="420" fill="url(#warmglow)" opacity="0.9" />
      <circle cx="760" cy="760" r="90" fill="#fff2c2" />
      {/* far skyline */}
      <g opacity="0.7">{Array.from({ length: 12 }, (_, i) => <rect key={i} x={i * 95 - 20} y={600 + R() * 260} width={80 + R() * 40} height="900" fill="#c58d84" />)}</g>
      {/* mid skyline with rooftop greenhouses */}
      <g>{Array.from({ length: 7 }, (_, i) => <rect key={i} x={i * 160 - 30} y={820 + R() * 220} width={140} height="900" fill={["#8a6f86", "#7a6582", "#93788a"][i % 3]} />)}</g>
      {[[130, 880], [610, 900], [930, 950]].map(([x, y], i) => <g key={i}><GreenhouseFar x={x} y={y} s={0.42} glow={1} /></g>)}
      <g opacity="0.85">{Array.from({ length: 50 }, (_, i) => <rect key={i} x={(i * 71) % 1080} y={980 + ((i * 47) % 500)} width="16" height="22" fill={i % 3 ? "#ffe39a" : "#f6c46b"} />)}</g>
      {/* birds */}
      {[0, 1, 2].map((i) => <path key={i} d="M -14 0 Q -6 -8 0 0 Q 6 -8 14 0" stroke="#4a3a5a" strokeWidth="3" fill="none" transform={`translate(${300 + i * 60 + t * 1.2} ${400 + i * 24 + Math.sin(t / 8 + i) * 6})`} />)}
    </g>
  );
};

// theatre stage with leafy curtains and spotlights
export const Stage: React.FC<{ t: number; open: number }> = ({ t, open }) => (
  <g>
    <rect x="-200" y="-200" width="1480" height="2400" fill="#2a1d3a" />
    <rect x="60" y="200" width="960" height="1100" fill="#3d2c55" />
    {[200, 540, 880].map((x, i) => <path key={x} d={`M ${x} 140 L ${x - 260} 1300 L ${x + 260} 1300 Z`} fill="url(#spot)" opacity={0.55 + 0.15 * Math.sin(t / 15 + i)} style={{ mixBlendMode: "screen" }} />)}
    {/* stage floor */}
    <path d="M -100 1240 L 1180 1240 L 1180 2100 L -100 2100 Z" fill="url(#floorWood)" />
    <path d="M -100 1240 L 1180 1240" stroke="#f5d29a" strokeWidth="10" />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={i * 140 - 40} y1="1240" x2={i * 220 - 340} y2="2100" stroke="#7a4a26" strokeWidth="3" opacity="0.5" />)}
    {/* marquee bulbs on top */}
    <rect x="-20" y="80" width="1120" height="110" fill="#6b2030" stroke={INK} strokeWidth="5" />
    {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={30 + i * 68} cy="135" r="13" fill={(i + Math.floor(t / 6)) % 2 ? "#fff3a0" : "#ffb347"} stroke={INK} strokeWidth="2.5" />)}
    {/* curtains */}
    {[-1, 1].map((sd) => {
      const w = mix(560, 150, open);
      const x = sd < 0 ? -20 : 1100 - w;
      return <g key={sd}>
        <rect x={x} y="190" width={w} height="1120" fill="url(#curtain)" stroke={INK} strokeWidth="5" />
        {Array.from({ length: 6 }, (_, i) => <line key={i} x1={x + (w / 6) * (i + 0.5)} y1="200" x2={x + (w / 6) * (i + 0.5) + sd * 10} y2="1300" stroke="#6e1520" strokeWidth="6" opacity="0.6" />)}
        <path d={`M ${x} 200 L ${x + w} 200 L ${x + w} 250 Q ${x + w / 2} 290 ${x} 250 Z`} fill="#4fa83a" stroke={INK} strokeWidth="4" />
        {[0.15, 0.4, 0.65, 0.9].map((k) => <Leaf key={k} x={x + w * k} y={270} rot={180 + (k - 0.5) * 40} s={1.1} c="#5fb33a" />)}
      </g>;
    })}
  </g>
);

// evening home interior (warm lamp)
export const HomeEvening: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x="-200" y="-200" width="1480" height="2400" fill="#f4d7a8" />
    {/* wallpaper stripes */}
    <g opacity="0.25">{Array.from({ length: 14 }, (_, i) => <rect key={i} x={i * 90} y="0" width="30" height="1100" fill="#e3a96a" />)}</g>
    {/* window with dusk */}
    <g>
      <rect x="620" y="200" width="380" height="460" rx="12" fill="url(#sunset)" stroke={INK} strokeWidth="8" />
      <path d="M 810 200 L 810 660 M 620 430 L 1000 430" stroke={INK} strokeWidth="7" />
      <circle cx="720" cy="560" r="28" fill="#ffe08a" />
    </g>
    {/* hanging lamp */}
    <line x1="330" y1="-20" x2="330" y2="230" stroke={INK} strokeWidth="4" />
    <path d="M 240 300 Q 330 200 420 300 Z" fill="#2f7d3a" stroke={INK} strokeWidth="5" />
    <circle cx="330" cy="330" r="380" fill="url(#warmglow)" opacity="0.85" />
    {/* shelf with potted herbs */}
    <rect x="40" y="610" width="440" height="22" fill={C.woodD} stroke={INK} strokeWidth="4" />
    {[100, 220, 360].map((x, i) => <g key={x}><path d={`M ${x - 34} 610 L ${x + 34} 610 L ${x + 26} 560 L ${x - 26} 560 Z`} transform={`rotate(180 ${x} 585)`} fill={["#d0743d", "#6fa8dc", "#e9c46a"][i]} stroke={INK} strokeWidth="3" />{[-1, 0, 1].map((d) => <ellipse key={d} cx={x + d * 18} cy={548 - Math.abs(d) * -6} rx="16" ry="26" fill="#4fae3a" stroke={INK} strokeWidth="2.5" transform={`rotate(${d * 25} ${x} 570)`} />)}</g>)}
    {/* table */}
    <path d="M -100 1060 L 1180 1060 L 1180 2100 L -100 2100 Z" fill="#c9774a" />
    <path d="M -100 1060 L 1180 1060 L 1180 1110 L -100 1110 Z" fill="#e8f0f8" />
    <g opacity="0.35">{Array.from({ length: 10 }, (_, i) => <path key={i} d={`M ${i * 130 - 40} 1110 L ${i * 170 - 300} 2100`} stroke="#fff" strokeWidth="26" />)}</g>
    <path d="M -100 1110 L 1180 1110" stroke={INK} strokeWidth="5" />
  </g>
);

// night greenhouse with pink-purple LED grow lights
export const NightLED: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x="-200" y="-200" width="1480" height="2400" fill="url(#night)" />
    {Array.from({ length: 40 }, (_, i) => <circle key={i} cx={(i * 131) % 1080} cy={(i * 67) % 600} r={1.5 + (i % 3)} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t / 10 + i)} />)}
    <circle cx="880" cy="200" r="60" fill="#fff6d8" opacity="0.9" />
    <g stroke="#6b5a9a" strokeWidth="7" opacity="0.8"><path d="M -40 640 Q 540 240 1120 640" fill="none" />{[100, 320, 540, 760, 980].map((x) => <line key={x} x1={x} y1={x === 540 ? 340 : 640 - (540 - Math.abs(540 - x)) * 0.55} x2={x} y2="1300" />)}</g>
    {[220, 540, 860].map((x) => <g key={x}><rect x={x - 130} y="560" width="260" height="30" rx="10" fill="#444" stroke={INK} strokeWidth="4" /><rect x={x - 120} y="586" width="240" height="10" fill="#ff8ae6" /><path d={`M ${x - 120} 596 L ${x - 260} 1300 L ${x + 260} 1300 L ${x + 120} 596 Z`} fill="url(#pinkled)" style={{ mixBlendMode: "screen" }} /></g>)}
    <rect x="-100" y="1300" width="1280" height="800" fill="#2d2648" />
  </g>
);

// sunset future city: glass farm towers + glowing water pipes
export const FutureCity: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x="-200" y="-200" width="1480" height="2400" fill="url(#sunset)" />
    <circle cx="540" cy="1020" r="480" fill="url(#warmglow)" opacity="0.9" />
    <circle cx="540" cy="1020" r="120" fill="#ffe7a8" />
    <g opacity="0.55">{Array.from({ length: 10 }, (_, i) => <rect key={i} x={i * 115 - 20} y={760 + ((i * 97) % 200)} width="90" height="800" fill="#9a6f9c" />)}</g>
    {[[170, 260, 200], [520, 160, 180], [880, 330, 190]].map(([x, top, w], k) => (
      <g key={k}>
        <g>
          <path d={`M ${x - w / 2} 1400 L ${x - w / 2} ${top + 60} Q ${x} ${top - 40} ${x + w / 2} ${top + 60} L ${x + w / 2} 1400 Z`} fill="#dff6f0" fillOpacity="0.88" stroke={INK} strokeWidth="5" />
          {Array.from({ length: Math.floor((1400 - top - 80) / 80) }, (_, i) => <g key={i}>
            <line x1={x - w / 2} y1={top + 120 + i * 80} x2={x + w / 2} y2={top + 120 + i * 80} stroke="#7fb5a8" strokeWidth="4" />
            {Array.from({ length: 5 }, (_, j) => <circle key={j} cx={x - w / 2 + 22 + j * ((w - 44) / 4)} cy={top + 104 + i * 80} r={13} fill={[C.green, C.lime, C.red, "#3f9a3a", "#f7b52a"][(i + j + k) % 5]} stroke={INK} strokeWidth="2" />)}
          </g>)}
        </g>
        <rect x={x - w / 2 + 14} y={top + 70} width="16" height={1300 - top} fill="#fff" opacity="0.4" />
      </g>
    ))}
    {[["M 270 700 C 360 640 400 760 430 700", 0], ["M 610 900 C 700 860 740 980 785 930", 1], ["M 270 1100 C 400 1040 640 1180 785 1120", 2]].map(([d, i]) => <g key={i as number}>
      <path d={d as string} stroke={INK} strokeWidth="30" fill="none" />
      <path d={d as string} stroke="#9ff3ff" strokeWidth="18" fill="none" strokeDasharray="20 14" strokeDashoffset={-t * 5} />
    </g>)}
    {[0, 1].map((i) => <g key={i} transform={`translate(${(200 + t * 2 + i * 400) % 1200 - 60} ${560 + i * 90 + Math.sin(t / 7) * 8})`}><rect x="-26" y="-6" width="52" height="12" rx="6" fill="#555" /><line x1="-30" y1="-12" x2="-10" y2="-12" stroke="#555" strokeWidth="4" /><line x1="10" y1="-12" x2="30" y2="-12" stroke="#555" strokeWidth="4" /><circle cx="0" cy="8" r="5" fill="#9ff3ff" /></g>)}
  </g>
);

export { Sparkle, Bubbles, Particle, Roots, NetPot, Leaf, clamp };
