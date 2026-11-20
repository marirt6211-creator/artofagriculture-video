// v11 · ArtofAgriculture – Hydroponics. Shared art: watercolor storybook look, the official mascot rig,
// cartoon plant characters and hydroponic props. Everything is SVG code (no AI images in the cloud).
import React from "react";
import { staticFile } from "remotion";
const NOISE = staticFile("v11/noise.png");
const NOISE_FULL = staticFile("v11/noise-full.png");

// ---------------------------------------------------------------- helpers
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const ease = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const backOut = (x: number) => { x = clamp(x); const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const pr = (t: number, a: number, len: number) => clamp((t - a) / len);
export function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export const INK = "#2b2320";
export const LIMB = "#3a2a20";
export const C = {
  sky1: "#7cc8ee", sky2: "#d6f0fa", cloud: "#ffffff",
  hill1: "#a9d96b", hill2: "#7cc04f", hill3: "#4f9c3d", deep: "#2f7a35",
  soil: "#a9733f", soilD: "#7a4f2a", wood: "#b0703a", woodD: "#7a4524", woodL: "#d39456",
  water: "#4cc6dc", waterD: "#1f9fb8", waterL: "#bff0f6", glass: "#e9fbff",
  red: "#e8412f", redD: "#b72a1d", yellow: "#ffcf33", orange: "#f59a23", lime: "#9bd94a",
  green: "#5bb33a", leaf: "#3f9b3f", hood: "#74bf3f", overall: "#3f7f2e", straw: "#f2bd45", strawD: "#c98d22", band: "#6b4320",
};
export const FONT = "Fredoka";
export const HAND = "PatrickHand";

// wavy ridge (hills) path from x=-60 to w+60, closed to bottom
export function ridge(y0: number, amp: number, waves: number, ph: number, w = 1080, bottom = 2100) {
  let d = `M -60 ${bottom} L -60 ${y0}`;
  for (let x = -60; x <= w + 60; x += 30) {
    const y = y0 + amp * Math.sin((x / w) * waves * Math.PI * 2 + ph) + amp * 0.33 * Math.sin((x / w) * waves * 5.3 * Math.PI + ph * 1.7);
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  return d + ` L ${w + 60} ${bottom} Z`;
}
// wobbly closed blob
export function blob(cx: number, cy: number, rx: number, ry: number, n: number, amp: number, ph = 0) {
  let d = "";
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const k = 1 + amp * Math.sin(a * n + ph);
    const x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
    d += (i ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
  }
  return d + " Z";
}

// ---------------------------------------------------------------- defs (filters, gradients)
export const Defs: React.FC = () => (
  <defs>
    <filter id="wob" x="-4%" y="-4%" width="108%" height="108%" primitiveUnits="objectBoundingBox">
      <feImage href={NOISE} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="0.018" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="wc" x="-4%" y="-4%" width="108%" height="108%" primitiveUnits="objectBoundingBox">
      <feImage href={NOISE} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="0.02" xChannelSelector="R" yChannelSelector="G" result="d" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 -0.45 0 1.12" result="m" />
      <feComposite in="d" in2="m" operator="in" />
    </filter>
    <filter id="gwob" x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
      <feImage href={NOISE_FULL} x="0" y="0" width="1080" height="1920" preserveAspectRatio="none" result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="soft"><feGaussianBlur stdDeviation="6" /></filter>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="5" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer><feFuncA type="linear" slope="0" intercept="0.10" /></feComponentTransfer>
    </filter>
    <filter id="blot" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0035" numOctaves="3" seed="11" />
      <feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 1.2 -0.45" />
    </filter>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.sky1} /><stop offset="1" stopColor={C.sky2} /></linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fb6e8" /><stop offset="0.55" stopColor="#ffd38a" /><stop offset="1" stopColor="#ffb36b" /></linearGradient>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7fdcea" stopOpacity="0.85" /><stop offset="1" stopColor="#1fa3bd" stopOpacity="0.9" /></linearGradient>
    <linearGradient id="pipe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor="#e8eef0" /><stop offset="1" stopColor="#b9c6cb" /></linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={C.woodL} /><stop offset="1" stopColor={C.wood} /></linearGradient>
    <radialGradient id="tomato" cx="0.38" cy="0.35" r="0.75"><stop offset="0" stopColor="#ff7a5c" /><stop offset="0.55" stopColor={C.red} /><stop offset="1" stopColor={C.redD} /></radialGradient>
    <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff6c4" /><stop offset="0.5" stopColor="#ffe066" /><stop offset="1" stopColor="#ffd23a" stopOpacity="0" /></radialGradient>
    <radialGradient id="burst" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fffbe0" stopOpacity="1" /><stop offset="1" stopColor="#fff3b0" stopOpacity="0" /></radialGradient>
  </defs>
);

// paper grain + pigment blotches, laid over the finished frame
export const Paper: React.FC = () => (
  <g style={{ pointerEvents: "none" }}>
    <rect x="0" y="0" width="1080" height="1920" filter="url(#blot)" opacity="0.18" style={{ mixBlendMode: "multiply" }} />
    <rect x="0" y="0" width="1080" height="1920" filter="url(#grain)" style={{ mixBlendMode: "multiply" }} />
  </g>
);

// ---------------------------------------------------------------- background pieces
export const Sky: React.FC<{ id?: string }> = ({ id = "sky" }) => <rect x="-200" y="-200" width="1480" height="2400" fill={`url(#${id})`} />;

export const Cloud: React.FC<{ x: number; y: number; s?: number; o?: number }> = ({ x, y, s = 1, o = 0.95 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <g>
      <ellipse cx="0" cy="0" rx="120" ry="44" fill="#fff" />
      <ellipse cx="-50" cy="-26" rx="58" ry="44" fill="#fff" />
      <ellipse cx="40" cy="-38" rx="66" ry="54" fill="#fff" />
    </g>
    <path d="M -110 8 Q 0 30 112 6" stroke="#a9d6ea" strokeWidth="6" fill="none" opacity="0.6" />
  </g>
);

export const Hills: React.FC<{ y?: number; t?: number; far?: boolean }> = ({ y = 1150, t = 0, far = true }) => (
  <g>
    {far && <path d={ridge(y - 230, 26, 1.2, 0.4)} fill="#c7d9b0" opacity="0.85" />}
    {far && <path d="M 720 920 L 840 800 L 900 850 L 960 790 L 1100 930 Z" fill="#b7b4c4" opacity="0.6" transform={`translate(0 ${y - 1150})`} />}
    <path d={ridge(y - 120, 30, 1.6, 1.3 + t * 0.002)} fill={C.hill1} />
    <path d={ridge(y, 36, 1.1, 2.4)} fill={C.hill2} />
    <path d={ridge(y + 160, 22, 2.1, 0.2)} fill={C.hill3} opacity="0.9" />
  </g>
);

export const Tree: React.FC<{ x: number; y: number; s?: number; t?: number }> = ({ x, y, s = 1, t = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${Math.sin(t / 40 + x) * 1.2})`}>
    <path d="M -10 0 Q -6 -80 -4 -150 L 6 -150 Q 8 -80 12 0 Z" fill="#7a5131" stroke={INK} strokeWidth="3" />
    <g>
      <circle cx="0" cy="-190" r="78" fill="#4f9d3a" />
      <circle cx="-56" cy="-160" r="52" fill="#5fb043" />
      <circle cx="56" cy="-162" r="56" fill="#3f8a34" />
      <circle cx="10" cy="-226" r="50" fill="#6cc04b" />
    </g>
  </g>
);

export const Grass: React.FC<{ x: number; y: number; s?: number; t?: number; c?: string }> = ({ x, y, s = 1, t = 0, c = "#3f8f2f" }) => {
  const sw = Math.sin(t / 18 + x * 0.05) * 4;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-26, -14, -3, 8, 20, 30].map((dx, i) => (
        <path key={i} d={`M ${dx} 0 Q ${dx + sw * 0.5} -${30 + (i % 3) * 14} ${dx + sw + (i % 2 ? 10 : -8)} -${52 + (i % 3) * 18}`} stroke={i % 2 ? c : "#5fb33a"} strokeWidth="5" fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

export const Fence: React.FC<{ x: number; y: number; n?: number; s?: number }> = ({ x, y, n = 4, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x="-10" y="-80" width={n * 90 + 20} height="16" rx="5" fill={C.woodL} stroke={INK} strokeWidth="3" />
    <rect x="-10" y="-40" width={n * 90 + 20} height="16" rx="5" fill={C.woodL} stroke={INK} strokeWidth="3" />
    {Array.from({ length: n + 1 }, (_, i) => <path key={i} d={`M ${i * 90 - 9} 0 L ${i * 90 - 9} -110 L ${i * 90} -122 L ${i * 90 + 9} -110 L ${i * 90 + 9} 0 Z`} fill={C.wood} stroke={INK} strokeWidth="3" />)}
  </g>
);

export const Sun: React.FC<{ x: number; y: number; r?: number; t?: number }> = ({ x, y, r = 70, t = 0 }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r * 2.4} fill="url(#sun)" opacity="0.7" />
    <g transform={`rotate(${t * 0.5})`} stroke="#ffc928" strokeWidth="7" strokeLinecap="round">
      {Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2; return <line key={i} x1={Math.cos(a) * (r + 18)} y1={Math.sin(a) * (r + 18)} x2={Math.cos(a) * (r + 40)} y2={Math.sin(a) * (r + 40)} />; })}
    </g>
    <circle r={r} fill="#ffd93d" stroke="#f0a91a" strokeWidth="5" />
  </g>
);

// ---------------------------------------------------------------- the official mascot (from the character sheet)
type ArmA = [number, number];
export const POSES: Record<string, ArmA> = {
  hip: [32, -52], wave: [128, 168], point: [58, 168], present: [58, 100], down: [12, 6], hold: [28, 92],
  chin: [22, -150], up: [165, 178], thumb: [40, 128], pour: [60, 70], wide: [95, 110], scratch: [140, -150],
};
export type Expr = "smile" | "talk" | "happy" | "surprised" | "curious" | "laugh" | "wink" | "worried";

function arm(side: number, sx: number, sy: number, a: ArmA, L1 = 58, L2 = 52) {
  const r = Math.PI / 180;
  const ex = sx + side * Math.sin(a[0] * r) * L1, ey = sy + Math.cos(a[0] * r) * L1;
  const hx = ex + side * Math.sin(a[1] * r) * L2, hy = ey + Math.cos(a[1] * r) * L2;
  return { ex, ey, hx, hy };
}

const MascotFace: React.FC<{ expr: Expr; talk: number; blink: boolean; lx: number; ly: number }> = ({ expr, talk, blink, lx, ly }) => {
  const ex = -21 + lx, ex2 = 21 + lx, ey = -306 + ly;
  const eyes = () => {
    if (blink) return <g stroke={INK} strokeWidth="4" strokeLinecap="round"><line x1={ex - 6} y1={ey} x2={ex + 6} y2={ey} /><line x1={ex2 - 6} y1={ey} x2={ex2 + 6} y2={ey} /></g>;
    if (expr === "happy") return <g stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round"><path d={`M ${ex - 8} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 8} ${ey + 3}`} /><path d={`M ${ex2 - 8} ${ey + 3} Q ${ex2} ${ey - 9} ${ex2 + 8} ${ey + 3}`} /></g>;
    if (expr === "laugh") return <g stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round"><path d={`M ${ex - 8} ${ey - 6} L ${ex + 5} ${ey} L ${ex - 8} ${ey + 6}`} /><path d={`M ${ex2 + 8} ${ey - 6} L ${ex2 - 5} ${ey} L ${ex2 + 8} ${ey + 6}`} /></g>;
    if (expr === "wink") return <g><path d={`M ${ex - 8} ${ey + 2} Q ${ex} ${ey - 7} ${ex + 8} ${ey + 2}`} stroke={INK} strokeWidth="4.5" fill="none" strokeLinecap="round" /><ellipse cx={ex2} cy={ey} rx="5.5" ry="7.5" fill={INK} /></g>;
    const big = expr === "surprised" ? 1.25 : 1;
    return <g fill={INK}><ellipse cx={ex} cy={ey - (big - 1) * 8} rx={5.5 * big} ry={7.5 * big} /><ellipse cx={ex2} cy={ey - (big - 1) * 8} rx={5.5 * big} ry={7.5 * big} />
      <circle cx={ex + 1.6} cy={ey - 2.5} r="1.6" fill="#fff" /><circle cx={ex2 + 1.6} cy={ey - 2.5} r="1.6" fill="#fff" /></g>;
  };
  const brows = () => {
    if (expr === "curious") return <path d={`M ${ex2 - 9} ${ey - 20} Q ${ex2} ${ey - 27} ${ex2 + 9} ${ey - 21}`} stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    if (expr === "worried") return <g stroke={INK} strokeWidth="3.5" strokeLinecap="round"><line x1={ex - 9} y1={ey - 16} x2={ex + 7} y2={ey - 21} /><line x1={ex2 + 9} y1={ey - 16} x2={ex2 - 7} y2={ey - 21} /></g>;
    if (expr === "surprised") return <g stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round"><path d={`M ${ex - 8} ${ey - 24} Q ${ex} ${ey - 30} ${ex + 8} ${ey - 24}`} /><path d={`M ${ex2 - 8} ${ey - 24} Q ${ex2} ${ey - 30} ${ex2 + 8} ${ey - 24}`} /></g>;
    return null;
  };
  const mx = lx * 0.8, my = -280 + ly * 0.6;
  const mouth = () => {
    if (expr === "surprised") return <ellipse cx={mx} cy={my + 6} rx="7" ry="9" fill="#d9493f" stroke={INK} strokeWidth="3.5" />;
    if (expr === "curious") return <path d={`M ${mx - 9} ${my + 4} Q ${mx} ${my + 1} ${mx + 9} ${my - 2}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />;
    if (expr === "worried") return <path d={`M ${mx - 11} ${my + 6} Q ${mx} ${my} ${mx + 11} ${my + 6}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />;
    if (expr === "laugh" || expr === "happy") return <g><path d={`M ${mx - 18} ${my - 3} Q ${mx} ${my + 24} ${mx + 18} ${my - 3} Z`} fill="#d9493f" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" /><path d={`M ${mx - 8} ${my + 10} Q ${mx} ${my + 4} ${mx + 9} ${my + 10} Q ${mx} ${my + 16} ${mx - 8} ${my + 10}`} fill="#ff8a7a" /></g>;
    const o = expr === "talk" ? talk : 0;
    if (o > 0.12) return <path d={`M ${mx - 14} ${my - 1} Q ${mx} ${my + 6 + 16 * o} ${mx + 14} ${my - 1} Q ${mx} ${my + 3} ${mx - 14} ${my - 1}`} fill="#d9493f" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />;
    return <path d={`M ${mx - 15} ${my - 2} Q ${mx} ${my + 12} ${mx + 15} ${my - 2}`} stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />;
  };
  return <g>{eyes()}{brows()}{mouth()}</g>;
};

export const Mascot: React.FC<{
  x: number; y: number; s?: number; flip?: boolean; expr?: Expr; armL?: string | ArmA; armR?: string | ArmA;
  t?: number; talk?: number; lx?: number; ly?: number; tilt?: number; hatTilt?: number; bob?: number; handProp?: React.ReactNode; handPropL?: React.ReactNode; sweat?: boolean; walk?: number; back?: boolean;
}> = ({ x, y, s = 1, flip = false, expr = "smile", armL = "hip", armR = "hip", t = 0, talk = 0, lx = 0, ly = 0, tilt = 0, hatTilt = -4, bob = 1, handProp, handPropL, sweat, walk, back }) => {
  const A = (a: string | ArmA): ArmA => (typeof a === "string" ? POSES[a] : a);
  let aL = A(armL), aR = A(armR);
  if (armR === "wave") aR = [aR[0], aR[1] + Math.sin(t / 3.2) * 22];
  if (armL === "wave") aL = [aL[0], aL[1] + Math.sin(t / 3.2) * 22];
  const breathe = Math.sin(t / 14) * 3 * bob;
  const blink = t % 97 > 92;
  const L = arm(-1, -44, -228, aL), R = arm(1, 44, -228, aR);
  const drawArm = (sx: number, a: { ex: number; ey: number; hx: number; hy: number }) => (
    <g>
      <path d={`M ${sx} -228 L ${a.ex} ${a.ey} L ${a.hx} ${a.hy}`} stroke={LIMB} strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1={sx} y1={-228} x2={sx + (a.ex - sx) * 0.38} y2={-228 + (a.ey + 228) * 0.38} stroke={C.hood} strokeWidth="24" strokeLinecap="round" />
      <circle cx={a.hx} cy={a.hy} r="10" fill={LIMB} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${tilt})`}>
      <ellipse cx="0" cy="2" rx="80" ry="14" fill="#000" opacity="0.13" filter="url(#soft)" />
      <g>
        {/* legs + shoes */}
        {[-1, 1].map((sd) => {
          const ph = walk === undefined ? 0 : walk + (sd > 0 ? Math.PI : 0);
          const fx = walk === undefined ? 0 : Math.sin(ph) * 22, fy = walk === undefined ? 0 : -Math.max(0, Math.cos(ph)) * 16;
          return <g key={sd}>
            <path d={`M ${sd * 16} -116 L ${sd * 24 + fx} ${-24 + fy}`} stroke={LIMB} strokeWidth="9" strokeLinecap="round" />
            <path transform={`translate(${fx} ${fy})`} d={sd < 0 ? "M -60 -12 Q -60 -30 -32 -30 Q -8 -30 -6 -14 Q -6 0 -32 0 Q -60 0 -60 -12 Z" : "M 60 -12 Q 60 -30 32 -30 Q 8 -30 6 -14 Q 6 0 32 0 Q 60 0 60 -12 Z"} fill="#fff" stroke={INK} strokeWidth="4" />
          </g>;
        })}
        <g transform={`translate(0 ${breathe * 0.4})`}>
          {/* shorts */}
          <path d="M -45 -168 L 45 -168 L 48 -110 L 6 -110 L 0 -130 L -6 -110 L -48 -110 Z" fill={C.overall} stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          {/* hood behind neck */}
          <path d="M -38 -236 Q 0 -262 38 -236 Q 30 -226 0 -228 Q -30 -226 -38 -236 Z" fill="#5aa52f" stroke={INK} strokeWidth="3.5" />
          {/* hoodie torso */}
          <path d="M -42 -236 Q -50 -200 -45 -162 L 45 -162 Q 50 -200 42 -236 Q 0 -246 -42 -236 Z" fill={C.hood} stroke={INK} strokeWidth="4" />
          {/* hood strings */}
          <path d="M -7 -232 L -9 -212 M 7 -232 L 9 -212" stroke="#e8f5d0" strokeWidth="2.5" strokeLinecap="round" />
          {back ? <g><path d="M -34 -232 L 30 -166 M 34 -232 L -30 -166" stroke={C.overall} strokeWidth="10" strokeLinecap="round" /><path d="M -40 -250 Q 0 -270 40 -250 Q 44 -215 0 -205 Q -44 -215 -40 -250 Z" fill="#5aa52f" stroke={INK} strokeWidth="3.5" /></g> : <g>
          {/* overall bib + straps */}
          <path d="M -31 -222 L 31 -222 L 34 -160 L -34 -160 Z" fill={C.overall} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M -27 -222 L -37 -238 M 27 -222 L 37 -238" stroke={C.overall} strokeWidth="7" strokeLinecap="round" />
          <circle cx="-24" cy="-216" r="3.6" fill={C.yellow} stroke={INK} strokeWidth="1.5" />
          <circle cx="24" cy="-216" r="3.6" fill={C.yellow} stroke={INK} strokeWidth="1.5" />
          {/* logo */}
          <path d="M 0 -200 Q -9 -210 -12 -206 Q -8 -199 0 -200 Z M 0 -200 Q 9 -212 13 -207 Q 8 -199 0 -200 Z" fill={C.yellow} />
          <path d="M 0 -200 Q 1 -206 4 -211" stroke={C.lime} strokeWidth="2" fill="none" />
          <text x="0" y="-187" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="13" fill="#fff">Artof</text>
          <text x="0" y="-173" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="12.4" fill={C.yellow} stroke="#1f4a17" strokeWidth="2" paintOrder="stroke">Agriculture</text>
          </g>}
          {drawArm(-44, L)}
          {drawArm(44, R)}
          {handPropL && <g transform={`translate(${L.hx} ${L.hy})`}>{handPropL}</g>}
          {handProp && <g transform={`translate(${R.hx} ${R.hy})`}>{handProp}</g>}
        </g>
        {/* head */}
        <g transform={`translate(0 ${breathe})`}>
          <circle cx="0" cy="-300" r="62" fill="#fdfdfb" stroke={INK} strokeWidth="5" />
          {!back && <><ellipse cx="-36" cy="-284" rx="9" ry="5" fill="#ff9c9c" opacity="0.35" />
          <ellipse cx="36" cy="-284" rx="9" ry="5" fill="#ff9c9c" opacity="0.35" /></>}
          {!back && <MascotFace expr={expr} talk={talk} blink={blink && expr !== "happy" && expr !== "laugh" && expr !== "wink"} lx={lx} ly={ly} />}
          {sweat && <path d="M 58 -330 Q 66 -314 60 -306 Q 52 -312 58 -330 Z" fill="#9fe3f5" stroke={INK} strokeWidth="2.5" />}
          {/* straw hat */}
          <g transform={`rotate(${hatTilt} 0 -350)`}>
            <ellipse cx="0" cy="-346" rx="106" ry="26" fill={C.straw} stroke={INK} strokeWidth="4" />
            <ellipse cx="0" cy="-350" rx="70" ry="13" fill={C.strawD} opacity="0.45" />
            <g stroke={C.strawD} strokeWidth="2.2" opacity="0.8" strokeLinecap="round">
              <path d="M -92 -340 l 12 -3 M -72 -333 l 14 -2 M 64 -334 l 14 2 M 84 -340 l 10 3 M -40 -327 l 14 0 M 22 -327 l 14 0" />
            </g>
            <path d="M -52 -350 C -52 -396 -22 -414 0 -414 C 22 -414 52 -396 52 -350 Q 0 -340 -52 -350 Z" fill={C.straw} stroke={INK} strokeWidth="4" />
            <path d="M -30 -400 q 8 -4 16 -2 M 14 -404 q 10 0 18 6 M -40 -380 q 10 -2 18 2" stroke={C.strawD} strokeWidth="2.2" fill="none" opacity="0.8" />
            <path d="M -52 -358 Q 0 -368 52 -358 L 52 -346 Q 0 -354 -52 -346 Z" fill={C.band} stroke={INK} strokeWidth="2.5" />
            {/* leaf sprout */}
            <path d="M 14 -412 Q 18 -424 22 -430" stroke="#3d7f2a" strokeWidth="3" fill="none" />
            <path d="M 22 -430 Q 14 -456 -12 -458 Q -6 -436 22 -430 Z" fill="#4fae3a" stroke={INK} strokeWidth="3" />
            <path d="M 22 -430 Q 40 -452 64 -446 Q 54 -424 22 -430 Z" fill="#6cc24a" stroke={INK} strokeWidth="3" />
            <path d="M 20 -432 Q 6 -446 -6 -452 M 24 -432 Q 42 -442 56 -444" stroke="#2f6e22" strokeWidth="1.8" fill="none" />
          </g>
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- cartoon plant faces
export type PExpr = "smile" | "happy" | "surprised" | "confused" | "mischief" | "laugh" | "worried" | "wink" | "sip" | "proud" | "cool" | "shock" | "talk" | "serious" | "love";
export const Face: React.FC<{ x?: number; y?: number; k?: number; expr?: PExpr; look?: [number, number]; blink?: boolean; mouthC?: string; talk?: number }> = ({ x = 0, y = 0, k = 1, expr = "smile", look = [0, 0], blink = false, mouthC = "#c7372d", talk = 0.5 }) => {
  const [lx, ly] = look;
  const S = { stroke: INK, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const eye = (ex: number, sd: number) => {
    if (expr === "laugh") return <path d={sd > 0 ? `M ${ex - 11} -9 L ${ex + 7} 0 L ${ex - 11} 9` : `M ${ex + 11} -9 L ${ex - 7} 0 L ${ex + 11} 9`} {...S} strokeWidth="5" fill="none" />;
    if (blink || expr === "happy" || (expr === "wink" && ex > 0)) return <path d={`M ${ex - 13} 4 Q ${ex} -12 ${ex + 13} 4`} {...S} strokeWidth="5" fill="none" />;
    if (expr === "love") return <path d={`M ${ex} 10 C ${ex - 22} -4 ${ex - 10} -20 ${ex} -8 C ${ex + 10} -20 ${ex + 22} -4 ${ex} 10 Z`} fill="#ff4d6d" {...S} strokeWidth="3" />;
    const big = expr === "shock" ? 1.35 : expr === "surprised" ? 1.18 : 1;
    const rx = 15 * big, ry = 19 * big, pr_ = expr === "shock" ? 4.5 : expr === "surprised" ? 6.5 : 8.5;
    const lid = expr === "mischief" || expr === "proud" || expr === "serious" || expr === "cool";
    return <g>
      <ellipse cx={ex} cy={0} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth="3.5" />
      <circle cx={ex + lx * 5} cy={ly * 6 + 2} r={pr_} fill={INK} />
      <circle cx={ex + lx * 5 + 3} cy={ly * 6 - 2} r={pr_ * 0.38} fill="#fff" />
      <circle cx={ex + lx * 5 - 2.5} cy={ly * 6 + 5} r={pr_ * 0.18} fill="#fff" />
      {lid && <path d={`M ${ex - rx - 1} -2 Q ${ex} ${-ry - 6} ${ex + rx + 1} -2 L ${ex + rx + 1} ${-ry - 4} L ${ex - rx - 1} ${-ry - 4} Z`} fill="#fff" />}
      {lid && <path d={`M ${ex - rx} -2 Q ${ex} ${-ry * 0.2} ${ex + rx} -2`} {...S} strokeWidth="3.5" fill="none" />}
      {expr === "cool" && <path d={`M ${ex - 20} -14 L ${ex + 20} -14 L ${ex + 17} 8 Q ${ex} 14 ${ex - 17} 8 Z`} fill="#1b1b22" stroke={INK} strokeWidth="3" />}
    </g>;
  };
  const brows = () => {
    const st = { ...S, strokeWidth: 6, fill: "none" };
    const B: Record<string, [string, string]> = {
      mischief: ["M -36 -30 L -12 -21", "M 36 -32 L 12 -21"], confused: ["M -36 -27 Q -24 -38 -10 -30", "M 10 -38 L 36 -30"],
      worried: ["M -36 -24 L -12 -34", "M 36 -24 L 12 -34"], surprised: ["M -34 -38 Q -20 -48 -6 -38", "M 6 -38 Q 20 -48 34 -38"],
      shock: ["M -36 -44 Q -20 -56 -6 -44", "M 6 -44 Q 20 -56 36 -44"], proud: ["M -34 -30 Q -20 -36 -8 -30", "M 8 -30 Q 20 -36 34 -30"],
      serious: ["M -36 -28 L -10 -26", "M 10 -26 L 36 -28"], talk: ["M -34 -32 Q -20 -38 -8 -32", "M 8 -32 Q 20 -38 34 -32"],
      smile: ["M -34 -32 Q -20 -38 -8 -32", "M 8 -32 Q 20 -38 34 -32"], happy: ["M -34 -30 Q -20 -38 -8 -30", "M 8 -30 Q 20 -38 34 -30"],
      laugh: ["M -34 -28 Q -20 -36 -8 -28", "M 8 -28 Q 20 -36 34 -28"],
    };
    const b = B[expr]; if (!b) return null;
    return <g {...st}><path d={b[0]} /><path d={b[1]} /></g>;
  };
  const mouth = () => {
    const s = { ...S, strokeWidth: 4.5 };
    switch (expr) {
      case "shock": return <g><path d="M -16 22 Q -18 54 0 56 Q 18 54 16 22 Q 0 16 -16 22 Z" fill="#7a1f1a" {...s} /><path d="M -10 24 L 10 24 L 9 30 L -9 30 Z" fill="#fff" /><path d="M -9 48 Q 0 40 9 48 Q 0 54 -9 48" fill="#ff8a7a" /></g>;
      case "surprised": return <ellipse cx="0" cy="32" rx="10" ry="13" fill={mouthC} {...s} />;
      case "sip": return <g><circle cx="3" cy="30" r="6" fill={mouthC} {...s} /><path d="M 22 4 Q 30 0 34 -6" stroke="#9fe3f5" strokeWidth="4" fill="none" /></g>;
      case "confused": return <path d="M -16 32 Q -6 24 2 32 Q 10 40 18 28" fill="none" {...s} />;
      case "worried": return <path d="M -16 36 Q 0 24 16 36" fill="none" {...s} />;
      case "serious": return <path d="M -12 32 L 12 32" fill="none" {...s} />;
      case "mischief": return <g><path d="M -18 24 Q 6 44 24 18 Q 4 34 -18 24 Z" fill={mouthC} {...s} /></g>;
      case "talk": { const o = 6 + talk * 18; return <g><path d={`M -18 22 Q 0 ${22 + o * 1.6} 18 22 Q 0 26 -18 22 Z`} fill="#7a1f1a" {...s} /><path d={`M -8 ${22 + o * 0.9} Q 0 ${18 + o * 0.6} 8 ${22 + o * 0.9}`} fill="#ff8a7a" /></g>; }
      case "laugh": case "happy": case "love": return <g><path d="M -24 18 Q 0 58 24 18 Q 0 24 -24 18 Z" fill="#7a1f1a" {...s} /><path d="M -18 20 L 18 20 L 16 26 L -16 26 Z" fill="#fff" /><path d="M -10 40 Q 0 32 10 40 Q 0 48 -10 40" fill="#ff8a7a" /></g>;
      case "proud": case "cool": return <path d="M -16 24 Q 2 40 22 20" fill="none" {...s} />;
      default: return <path d="M -18 22 Q 0 42 18 22" fill="none" {...s} />;
    }
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx="-36" cy="20" rx="10" ry="6" fill="#ff5e6c" opacity="0.4" />
      <ellipse cx="36" cy="20" rx="10" ry="6" fill="#ff5e6c" opacity="0.4" />
      {eye(-19, 1)}{eye(19, -1)}{brows()}{mouth()}
    </g>
  );
};

const leafPath = (len: number, w: number) => `M 0 0 C ${w} ${-len * 0.25} ${w * 0.8} ${-len * 0.8} 0 ${-len} C ${-w * 0.8} ${-len * 0.8} ${-w} ${-len * 0.25} 0 0 Z`;

type PP = { x: number; y: number; s?: number; expr?: PExpr; look?: [number, number]; t?: number; rot?: number; arms?: boolean; armUp?: number; prop?: React.ReactNode };
const blinkAt = (t: number, off: number) => (t + off) % 83 > 79;

export const Lettuce: React.FC<PP> = ({ x, y, s = 1, expr = "smile", look, t = 0, rot = 0 }) => {
  const sw = Math.sin(t / 16) * 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + sw * 0.4})`}>
      <g>
        {[-70, -40, -12, 14, 42, 70].map((a, i) => (
          <path key={i} d={blob(0, 0, 44, 74, 9, 0.07, i)} transform={`rotate(${a + sw}) translate(0 -58)`} fill={i % 2 ? "#6fbf3a" : "#86cf45"} stroke={INK} strokeWidth="3.5" />
        ))}
        <path d={blob(0, -48, 70, 62, 11, 0.06, 1)} fill="#a6dd56" stroke={INK} strokeWidth="3.5" />
        <path d="M 0 0 L 0 -90 M 0 -40 Q -26 -64 -40 -70 M 0 -40 Q 26 -64 40 -70" stroke="#d8f2a6" strokeWidth="4" fill="none" opacity="0.7" />
      </g>
      <Face y={-58} k={1} expr={expr} look={look} blink={blinkAt(t, 7)} />
    </g>
  );
};

export const Tomato: React.FC<PP> = ({ x, y, s = 1, expr = "mischief", look, t = 0, rot = 0, arms, armUp = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot})`}>
    <g>
      {arms && <g stroke="#3f8f2f" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d={`M -56 4 Q -84 ${-10 - armUp * 30} -90 ${-30 - armUp * 50}`} /><path d={`M 56 4 Q 84 ${-10 - armUp * 30} 90 ${-30 - armUp * 50}`} />
      </g>}
      <path d={blob(0, 0, 66, 58, 5, 0.04)} fill="url(#tomato)" stroke={INK} strokeWidth="4" />
      <ellipse cx="-24" cy="-26" rx="14" ry="8" fill="#fff" opacity="0.45" transform="rotate(-25 -24 -26)" />
      <path d="M 0 -56 L -26 -70 L -10 -58 L -30 -48 L -6 -54 L 0 -40 L 6 -54 L 30 -48 L 10 -58 L 26 -70 Z" fill="#4fa83a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M 0 -62 Q 2 -76 8 -82" stroke="#3f8f2f" strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
    <Face y={0} k={0.95} expr={expr} look={look} blink={blinkAt(t, 23)} />
  </g>
);

export const Cucumber: React.FC<PP> = ({ x, y, s = 1, expr = "confused", look, t = 0, rot = 0, arms, armUp = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 20) * 2})`}>
    <g>
      {arms && <g stroke="#2f7a2a" strokeWidth="6" strokeLinecap="round" fill="none">
        <path d={`M -36 -60 Q -64 -70 -70 ${-90 - armUp * 40}`} /><path d="M 36 -60 Q 60 -40 66 -20" />
      </g>}
      <rect x="-42" y="-180" width="84" height="190" rx="42" fill="#4f9a3a" stroke={INK} strokeWidth="4" />
      <path d="M -18 -160 L -18 -10 M 14 -165 L 14 -15" stroke="#7cc05a" strokeWidth="7" opacity="0.6" strokeLinecap="round" />
      {[[-28, -130], [26, -100], [-26, -40], [28, -50], [0, -150], [-8, -20]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r="3" fill="#2f6a26" />)}
      <path d="M -6 -180 Q 0 -196 8 -198" stroke="#7a5a2a" strokeWidth="5" strokeLinecap="round" fill="none" />
    </g>
    <Face y={-110} k={0.85} expr={expr} look={look} blink={blinkAt(t, 41)} />
  </g>
);

export const Strawberry: React.FC<PP> = ({ x, y, s = 1, expr = "happy", look, t = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 7 + x) * 4})`}>
    <g>
      <path d="M 0 60 C -40 40 -62 -6 -54 -34 C -46 -58 -14 -60 0 -52 C 14 -60 46 -58 54 -34 C 62 -6 40 40 0 60 Z" fill="#ec3b4a" stroke={INK} strokeWidth="4" />
      <ellipse cx="-22" cy="-28" rx="10" ry="6" fill="#fff" opacity="0.4" />
      {[[-34, -14], [-18, 6], [0, -18], [18, 4], [34, -16], [-10, 30], [12, 32], [-30, 14], [30, 14]].map(([a, b], i) => <ellipse key={i} cx={a} cy={b} rx="2.5" ry="4" fill="#ffe27a" />)}
      <path d="M 0 -52 L -30 -66 L -12 -54 L -36 -46 L -8 -48 L 0 -38 L 8 -48 L 36 -46 L 12 -54 L 30 -66 Z" fill="#4fae3a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
    </g>
    <Face y={-6} k={0.7} expr={expr} look={look} blink={blinkAt(t, 11)} />
  </g>
);

export const Basil: React.FC<PP> = ({ x, y, s = 1, expr = "smile", look, t = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 18) * 2})`}>
    <g>
      <path d="M 0 0 L 0 -110" stroke="#3a7f2c" strokeWidth="6" />
      {[[-50, -40, -62], [50, -40, 62], [-44, -90, -40], [44, -90, 40]].map(([lx, ly, a], i) => (
        <path key={i} d={leafPath(70, 30)} transform={`translate(0 ${ly}) rotate(${a})`} fill={i < 2 ? "#3aa14a" : "#4fb85a"} stroke={INK} strokeWidth="3" />
      ))}
      <path d={blob(0, -150, 56, 52, 4, 0.05)} fill="#45b04f" stroke={INK} strokeWidth="3.5" />
      <ellipse cx="-22" cy="-176" rx="14" ry="7" fill="#fff" opacity="0.35" />
    </g>
    <Face y={-148} k={0.78} expr={expr} look={look} blink={blinkAt(t, 31)} />
  </g>
);

export const Mint: React.FC<PP> = ({ x, y, s = 1, expr = "wink", look, t = 0, rot = 0 }) => {
  const serr = (len: number, w: number) => { let d = "M 0 0"; for (let i = 1; i <= 8; i++) { const f = i / 8; d += ` L ${w * Math.sin(f * Math.PI) * (i % 2 ? 1.1 : 0.9)} ${-len * f}`; } for (let i = 7; i >= 0; i--) { const f = i / 8; d += ` L ${-w * Math.sin(f * Math.PI) * (i % 2 ? 1.1 : 0.9)} ${-len * f}`; } return d + " Z"; };
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 15) * 2})`}>
      <g>
        <path d="M 0 0 L 0 -100" stroke="#4a8f3c" strokeWidth="6" />
        {[[-40, -30, -70], [40, -30, 70], [-36, -70, -45], [36, -70, 45]].map(([lx, ly, a], i) => <path key={i} d={serr(56, 22)} transform={`translate(0 ${ly}) rotate(${a})`} fill="#7fd68a" stroke={INK} strokeWidth="2.6" />)}
        <path d={serr(110, 52)} transform="translate(0 -88)" fill="#8fe09a" stroke={INK} strokeWidth="3.2" />
      </g>
      <Face y={-140} k={0.68} expr={expr} look={look} blink={blinkAt(t, 53)} />
    </g>
  );
};

export const Spinach: React.FC<PP> = ({ x, y, s = 1, expr = "proud", look, t = 0, rot = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 17) * 2})`}>
    <g>
      {[[-34, -40], [34, 40], [-14, -15], [14, 15]].map(([a, sh], i) => <g key={i} transform={`rotate(${a})`}><path d="M 0 0 L 0 -50" stroke="#6aa64a" strokeWidth="6" /><path d={blob(0, -100, 34, 52, 3, 0.04, i)} fill={i < 2 ? "#2f7d3a" : "#3a8f43"} stroke={INK} strokeWidth="3" /></g>)}
      <path d={blob(0, -120, 50, 62, 3, 0.04)} fill="#3d9446" stroke={INK} strokeWidth="3.5" />
      <path d="M 0 -64 L 0 -170" stroke="#7fc07a" strokeWidth="3" opacity="0.7" />
    </g>
    <Face y={-122} k={0.75} expr={expr} look={look} blink={blinkAt(t, 61)} />
  </g>
);

export const Pepper: React.FC<PP & { color?: string }> = ({ x, y, s = 1, expr = "happy", look, t = 0, rot = 0, color = "#f7b52a" }) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot + Math.sin(t / 13) * 3})`}>
    <g>
      <path d="M -52 -40 C -70 0 -56 52 -30 60 C -16 66 -8 52 0 60 C 8 52 16 66 30 60 C 56 52 70 0 52 -40 C 40 -64 16 -56 0 -60 C -16 -56 -40 -64 -52 -40 Z" fill={color} stroke={INK} strokeWidth="4" />
      <path d="M -22 -40 Q -32 0 -20 48 M 22 -40 Q 32 0 20 48" stroke="#d98a12" strokeWidth="4" fill="none" opacity="0.5" />
      <ellipse cx="-30" cy="-26" rx="9" ry="14" fill="#fff" opacity="0.4" />
      <path d="M -16 -58 Q 0 -70 16 -58 Q 6 -52 0 -54 Q -6 -52 -16 -58 Z" fill="#4fa83a" stroke={INK} strokeWidth="3" />
      <path d="M 0 -62 Q 2 -84 14 -92" stroke="#3f8f2f" strokeWidth="7" strokeLinecap="round" fill="none" />
    </g>
    <Face y={2} k={0.8} expr={expr} look={look} blink={blinkAt(t, 71)} />
  </g>
);

// ---------------------------------------------------------------- hydroponic props
export const Roots: React.FC<{ x: number; y: number; len?: number; s?: number; t?: number; n?: number; faces?: boolean }> = ({ x, y, len = 200, s = 1, t = 0, n = 7, faces }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: n }, (_, i) => {
      const dx = (i - (n - 1) / 2) * 12, sw = Math.sin(t / 20 + i) * 10, l = len * (0.7 + ((i * 37) % 10) / 30);
      return <path key={i} d={`M ${dx * 0.3} 0 C ${dx} ${l * 0.3} ${dx * 2 + sw} ${l * 0.6} ${dx * 2.4 + sw * 1.4} ${l}`} stroke="#f4e7c6" strokeWidth={7 - (i % 3)} fill="none" strokeLinecap="round" />;
    })}
    {Array.from({ length: n }, (_, i) => {
      const dx = (i - (n - 1) / 2) * 12, sw = Math.sin(t / 20 + i) * 10, l = len * (0.7 + ((i * 37) % 10) / 30);
      return <path key={"o" + i} d={`M ${dx * 0.3} 0 C ${dx} ${l * 0.3} ${dx * 2 + sw} ${l * 0.6} ${dx * 2.4 + sw * 1.4} ${l}`} stroke="#b89a64" strokeWidth="1.5" fill="none" opacity="0.6" />;
    })}
  </g>
);

export const NetPot: React.FC<{ x: number; y: number; s?: number; fill?: "coir" | "perlite" | "clay" | "empty" }> = ({ x, y, s = 1, fill = "empty" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {fill === "coir" && <g><path d="M -50 -6 Q 0 -30 50 -6 L 40 70 L -40 70 Z" fill="#8a5a33" />{Array.from({ length: 26 }, (_, i) => <path key={i} d={`M ${-44 + (i * 37) % 88} ${-4 + (i * 13) % 60} q 10 ${-6 + (i % 5) * 3} 18 ${(i % 3) - 1}`} stroke={i % 2 ? "#c48a55" : "#5e3a1f"} strokeWidth="3" fill="none" strokeLinecap="round" />)}</g>}
    {fill === "perlite" && <g><path d="M -50 -6 Q 0 -30 50 -6 L 40 70 L -40 70 Z" fill="#dcdcd4" />{Array.from({ length: 22 }, (_, i) => <path key={i} d={blob(-38 + (i * 29) % 78, -2 + (i * 17) % 64, 9, 8, 4, 0.18, i)} fill="#fbfbf6" stroke="#9a9a90" strokeWidth="1.6" />)}</g>}
    {fill === "clay" && <g>{Array.from({ length: 16 }, (_, i) => <circle key={i} cx={-36 + (i * 23) % 72} cy={(i * 19) % 60} r="11" fill="#c8693a" stroke="#7a3a1a" strokeWidth="2" />)}</g>}
    <path d="M -54 -8 L 54 -8 L 42 74 L -42 74 Z" fill="none" stroke="#2b2b2b" strokeWidth="5" strokeLinejoin="round" />
    {[-30, -10, 10, 30].map((dx) => <path key={dx} d={`M ${dx * 1.15} 4 L ${dx * 0.95} 66`} stroke="#2b2b2b" strokeWidth="5" />)}
    <path d="M -46 30 L 46 30" stroke="#2b2b2b" strokeWidth="4" />
    <rect x="-62" y="-16" width="124" height="14" rx="5" fill="#333" />
  </g>
);

export const Bubbles: React.FC<{ x: number; y: number; w: number; h: number; t: number; n?: number; seed?: number; r?: number }> = ({ x, y, w, h, t, n = 14, seed = 1, r = 8 }) => {
  const R = rng(seed);
  return <g>{Array.from({ length: n }, (_, i) => {
    const bx = x + R() * w, sp = 1 + R() * 2, ph = R() * h, rr = r * (0.5 + R());
    const by = y + h - ((t * sp + ph) % h);
    return <circle key={i} cx={bx + Math.sin(t / 8 + i) * 5} cy={by} r={rr} fill="#e9fdff" fillOpacity="0.35" stroke="#ffffff" strokeWidth="2.5" />;
  })}</g>;
};

export const NUTRIENTS = [
  { l: "N", c: "#3b82f6" }, { l: "P", c: "#f97316" }, { l: "K", c: "#a855f7" }, { l: "Ca", c: "#f8fafc" }, { l: "Mg", c: "#22c55e" }, { l: "Fe", c: "#ef4444" },
];
export const Particle: React.FC<{ x: number; y: number; i: number; r?: number }> = ({ x, y, i, r = 22 }) => {
  const n = NUTRIENTS[i % NUTRIENTS.length];
  return <g transform={`translate(${x} ${y})`}>
    <circle r={r * 1.5} fill={n.c} opacity="0.25" filter="url(#soft)" />
    <circle r={r} fill={n.c} stroke={INK} strokeWidth="3" />
    <circle cx={-r * 0.35} cy={-r * 0.35} r={r * 0.25} fill="#fff" opacity="0.6" />
    <text y={r * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize={r * 0.95} fill={n.l === "Ca" ? INK : "#fff"}>{n.l}</text>
  </g>;
};

export const Tank: React.FC<{ x: number; y: number; w: number; h: number; t: number; level?: number }> = ({ x, y, w, h, t, level = 0.12 }) => {
  const wl = y + h * level;
  let wave = `M ${x} ${wl}`;
  for (let i = 0; i <= 24; i++) wave += ` L ${x + (w * i) / 24} ${wl + Math.sin(i / 2.2 + t / 9) * 5}`;
  wave += ` L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="18" fill={C.glass} fillOpacity="0.5" />
      <path d={wave} fill="url(#water)" />
      <rect x={x} y={y} width={w} height={h} rx="18" fill="none" stroke={INK} strokeWidth="5" />
      <path d={`M ${x + 22} ${y + 30} L ${x + 22} ${y + h - 40}`} stroke="#fff" strokeWidth="10" opacity="0.5" strokeLinecap="round" />
    </g>
  );
};

export const Pipe: React.FC<{ x: number; y: number; w: number; h?: number }> = ({ x, y, w, h = 70 }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="url(#pipe)" stroke={INK} strokeWidth="4.5" />
    <rect x={x + 10} y={y + 10} width={w - 20} height={h * 0.18} rx="6" fill="#fff" opacity="0.8" />
  </g>
);

export const WoodSign: React.FC<{ x: number; y: number; w: number; h: number; children?: React.ReactNode; rot?: number; posts?: boolean }> = ({ x, y, w, h, children, rot = 0, posts }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <g>
      {posts && <><rect x={-w / 2 + 30} y={-h / 2} width="26" height={h + 260} fill={C.wood} stroke={INK} strokeWidth="4" /><rect x={w / 2 - 56} y={-h / 2} width="26" height={h + 260} fill={C.wood} stroke={INK} strokeWidth="4" /></>}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx="22" fill="url(#wood)" stroke={INK} strokeWidth="5" />
      <path d={`M ${-w / 2 + 20} ${-h / 6} Q 0 ${-h / 6 - 8} ${w / 2 - 20} ${-h / 6} M ${-w / 2 + 30} ${h / 5} Q 0 ${h / 5 + 6} ${w / 2 - 40} ${h / 5}`} stroke={C.woodD} strokeWidth="3" opacity="0.5" fill="none" />
      <path d={leafPath(50, 22)} transform={`translate(${-w / 2 + 30} ${-h / 2 + 10}) rotate(-60)`} fill={C.green} stroke={INK} strokeWidth="3" />
      <path d={leafPath(40, 18)} transform={`translate(${w / 2 - 30} ${-h / 2 + 10}) rotate(60)`} fill="#6cc24a" stroke={INK} strokeWidth="3" />
    </g>
    {children}
  </g>
);

export const Leaf: React.FC<{ x: number; y: number; s?: number; rot?: number; c?: string }> = ({ x, y, s = 1, rot = 0, c = C.green }) => (
  <path d={leafPath(40, 18)} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} fill={c} stroke={INK} strokeWidth="2.5" />
);

export const Sparkle: React.FC<{ x: number; y: number; s?: number; c?: string; t?: number }> = ({ x, y, s = 1, c = "#ffd93d", t = 0 }) => {
  const k = s * (0.75 + 0.25 * Math.sin(t / 5 + x));
  return <path d="M 0 -26 Q 4 -4 26 0 Q 4 4 0 26 Q -4 4 -26 0 Q -4 -4 0 -26 Z" transform={`translate(${x} ${y}) scale(${k}) rotate(${t * 2})`} fill={c} stroke={INK} strokeWidth="2.5" />;
};

export const Badge: React.FC<{ x: number; y: number; n: string; label: string; c?: string; s?: number }> = ({ x, y, n, label, c = C.water, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <g>
      <rect x="-20" y="-50" width={label.length * 30 + 140} height="100" rx="50" fill="#fffdf4" stroke={INK} strokeWidth="5" />
      <circle cx="30" cy="0" r="40" fill={c} stroke={INK} strokeWidth="5" />
    </g>
    <text x="30" y="17" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="50" fill="#fff" stroke={INK} strokeWidth="5" paintOrder="stroke">{n}</text>
    <text x="90" y="16" fontFamily={FONT} fontWeight="700" fontSize="46" fill={INK}>{label}</text>
  </g>
);

export const Label: React.FC<{ x: number; y: number; text: string; s?: number; c?: string; bg?: string; rot?: number }> = ({ x, y, text, s = 1, c = INK, bg = "#fffdf4", rot = 0 }) => {
  const w = text.length * 22 + 50;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <rect x={-w / 2} y={-34} width={w} height={64} rx="32" fill={bg} stroke={INK} strokeWidth="4" />
    <text y="12" textAnchor="middle" fontFamily={FONT} fontWeight="600" fontSize="38" fill={c}>{text}</text>
  </g>;
};

// speech/thought bubble
export const Bubble: React.FC<{ x: number; y: number; w: number; h: number; tail?: [number, number]; children?: React.ReactNode; thought?: boolean }> = ({ x, y, w, h, tail = [0, 1], children, thought }) => (
  <g transform={`translate(${x} ${y})`}>
    <g>
      {thought ? <><circle cx={tail[0] * 0.7} cy={h / 2 + 30} r="16" fill="#fff" stroke={INK} strokeWidth="4" /><circle cx={tail[0]} cy={h / 2 + 64} r="10" fill="#fff" stroke={INK} strokeWidth="4" /></>
        : <path d={`M ${tail[0] - 26} ${h / 2 - 10} L ${tail[0] + tail[1] * 30} ${h / 2 + 60} L ${tail[0] + 26} ${h / 2 - 10} Z`} fill="#fff" stroke={INK} strokeWidth="4" strokeLinejoin="round" />}
      <path d={blob(0, 0, w / 2, h / 2, thought ? 9 : 3, thought ? 0.05 : 0.015)} fill="#fff" stroke={INK} strokeWidth="4.5" />
    </g>
    {children}
  </g>
);
