// v14 backgrounds + themes: Ghibli watercolor, Surrealism, Chinese ink, Flat 2026, Bauhaus.
import React from "react";
import { AbsoluteFill, Composition, Html5Audio, staticFile, useCurrentFrame } from "remotion";
import { FPS, FRAMES, H, Heart, P2, P3, Shell, W, back, clamp, k, rnd, type Theme } from "./core";

const hill = (y: number, amp: number, ph: number, n = 3) => {
  let d = `M0 ${y}`;
  for (let x = 0; x <= W; x += 40) d += ` L${x} ${y + Math.sin((x / W) * Math.PI * n + ph) * amp}`;
  return d + ` L${W} ${H} L0 ${H}Z`;
};

// ======================= 1. GHIBLI WATERCOLOR =======================
const Cloud: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} filter="url(#wc)">
    {[[0, 0, 90], [80, -40, 110], [180, -10, 95], [260, 20, 70], [-80, 25, 70], [100, 40, 90]].map(([a, b, r], i) => (
      <circle key={i} cx={a} cy={b} r={r} fill="#fff" />
    ))}
    {[[60, 70, 80], [170, 65, 70]].map(([a, b, r], i) => <circle key={"s" + i} cx={a} cy={b} r={r} fill="#d6e6f2" opacity={0.7} />)}
  </g>
);
const GhibliBg: React.FC<{ t: number }> = ({ t }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
    <defs>
      <linearGradient id="gsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5fb2e6" /><stop offset="0.55" stopColor="#bfe3f4" /><stop offset="1" stopColor="#f4f0d8" /></linearGradient>
      <filter id="wc"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="3" /><feDisplacementMap in="SourceGraphic" scale="28" /><feGaussianBlur stdDeviation="2.2" /></filter>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 0 0.3  0 0 0 0.16 0" /></filter>
      <radialGradient id="gsun"><stop offset="0" stopColor="#fff6c8" /><stop offset="0.3" stopColor="#ffe48a" stopOpacity="0.8" /><stop offset="1" stopColor="#ffe48a" stopOpacity="0" /></radialGradient>
    </defs>
    <rect width={W} height={H} fill="url(#gsky)" />
    <circle cx={880} cy={260} r={300 + Math.sin(t * 2) * 12} fill="url(#gsun)" />
    <Cloud x={-200 + t * 14} y={240} s={1.3} />
    <Cloud x={620 + t * 9} y={150} s={0.9} />
    <Cloud x={360 + t * 20} y={1050} s={1.1} />
    <path d={hill(1250, 40, 1.2, 2)} fill="#8ab7d6" opacity={0.65} filter="url(#wc)" />
    <path d={hill(1400 + Math.sin(t) * 4, 60, 0.4 + t * 0.03, 2)} fill="#a5cf6f" filter="url(#wc)" />
    {/* farmhouse + tree on the hill */}
    <g transform="translate(150 1335)" filter="url(#wc)">
      <rect x={0} y={20} width={120} height={80} fill="#f3e3c3" /><path d="M-15 25 L60 -30 L135 25Z" fill="#d1553c" />
      <rect x={45} y={55} width={30} height={45} fill="#7a4a2b" />
    </g>
    <g transform={`translate(860 1360) rotate(${Math.sin(t * 1.6) * 2})`} filter="url(#wc)">
      <rect x={-10} y={0} width={20} height={110} fill="#6b4a2b" />
      <circle cx={0} cy={-30} r={80} fill="#4f9a45" /><circle cx={-50} cy={0} r={55} fill="#5fae4f" /><circle cx={55} cy={-5} r={60} fill="#3f8a3b" />
    </g>
    <path d={hill(1560, 50, 2.0 + t * 0.05, 3)} fill="#6aae4a" filter="url(#wc)" />
    {/* crop rows */}
    {Array.from({ length: 9 }).map((_, i) => (
      <path key={i} d={`M${-100 + i * 150} ${H} Q ${400 + i * 40} ${1700 - i * 6} ${700 + i * 60} 1610`} stroke="#4b8f37" strokeWidth={14} fill="none" opacity={0.6} filter="url(#wc)" />
    ))}
    <path d={hill(1760, 40, 0.8 - t * 0.04, 2)} fill="#4f8f3c" filter="url(#wc)" />
    {/* grass blades */}
    {Array.from({ length: 46 }).map((_, i) => {
      const x = i * 24 + rnd(i) * 10, h = 60 + rnd(i + 9) * 70, sw = Math.sin(t * 2.4 + i * 0.5) * 16;
      return <path key={"g" + i} d={`M${x} ${H} Q ${x + sw * 0.5} ${H - h * 0.5} ${x + sw} ${H - h}`} stroke={i % 3 ? "#3d7d31" : "#5aa043"} strokeWidth={7} fill="none" strokeLinecap="round" />;
    })}
    {/* drifting leaves / dandelion seeds */}
    {Array.from({ length: 14 }).map((_, i) => {
      const x = ((rnd(i) * W + t * (40 + rnd(i + 3) * 50)) % (W + 100)) - 50, y = 300 + rnd(i + 5) * 1300 + Math.sin(t * 1.5 + i) * 40;
      return <ellipse key={"l" + i} cx={x} cy={y} rx={14} ry={6} fill={i % 2 ? "#8cc152" : "#fff8e0"} opacity={0.85} transform={`rotate(${t * 90 + i * 40} ${x} ${y})`} />;
    })}
    <rect width={W} height={H} filter="url(#paper)" opacity={0.9} />
  </svg>
);
const ghibli: Theme = {
  font: "V14Lalezar", ink: "#2c4a26", key: "#e0702a", accent: "#f5b72a", entry: "bleed",
  title: { fontFamily: "V14Lalezar", fontSize: 150, color: "#ffe04a", textShadow: "5px 0px 0 #2f7d2a, -5px 0px 0 #2f7d2a, 0px 5px 0 #2f7d2a, 0px -5px 0 #2f7d2a, 5px 5px 0 #2f7d2a, -5px 5px 0 #2f7d2a, 5px -5px 0 #2f7d2a, -5px -5px 0 #2f7d2a, 0 14px 20px rgba(0,0,0,0.3)", gap: 48 },
  pill: { background: "rgba(255,251,236,0.96)", borderRadius: 80, boxShadow: "0 14px 30px rgba(40,70,40,0.25)" },
  handle: "#2c4a26", btn: ["#e0702a", "#fff"], btnDone: "#3f9a3c", avatar: ["#e0702a", "#5aa043", "#4a90c8"],
  logoBack: (t) => <div style={{ position: "absolute", inset: "-8%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,250,225,0.9) 45%, rgba(255,250,225,0) 70%)", transform: `scale(${1 + Math.sin(t * 2) * 0.03})` }} />,
};

// ======================= 2. SURREALISM =======================
const SurrealBg: React.FC<{ t: number }> = ({ t }) => {
  const hz = 1330;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <linearGradient id="ssky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#173b5c" /><stop offset="0.45" stopColor="#4f8fa8" /><stop offset="0.78" stopColor="#f0c27e" /><stop offset="1" stopColor="#fbe3a8" /></linearGradient>
        <linearGradient id="sgr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d79b55" /><stop offset="1" stopColor="#7d4a22" /></linearGradient>
        <linearGradient id="ssun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff2b0" /><stop offset="1" stopColor="#f39a3c" /></linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ssky)" />
      {/* melting sun */}
      <g transform="translate(250 360)">
        <circle r={110} fill="url(#ssun)" />
        {[-70, -25, 20, 60].map((x, i) => { const L = 60 + 120 * (0.5 + 0.5 * Math.sin(t * 1.3 + i * 1.7)); return <path key={i} d={`M${x - 16} 80 L${x - 16} ${80 + L} A16 16 0 0 0 ${x + 16} ${80 + L} L${x + 16} 80Z`} fill="#f39a3c" />; })}
      </g>
      {/* floating stones with shadows */}
      {[[780, 300, 70, 0], [930, 560, 40, 1], [120, 820, 50, 2]].map(([x, y, r, i]) => {
        const b = Math.sin(t * 1.2 + i * 2) * 25;
        return (
          <g key={i}>
            <ellipse cx={x} cy={y + b} rx={r * 1.3} ry={r} fill="#e9dcc4" />
            <ellipse cx={x - r * 0.3} cy={y + b - r * 0.3} rx={r * 0.5} ry={r * 0.3} fill="#fff" opacity={0.6} />
            <ellipse cx={x + 40} cy={hz + 60 + (i * 70)} rx={r * 1.3 * (1 - b / 200)} ry={r * 0.22} fill="#3b2412" opacity={0.35} />
          </g>
        );
      })}
      {/* cliffs */}
      <path d={`M700 ${hz} L760 ${hz - 160} L840 ${hz - 190} L900 ${hz - 120} L1000 ${hz - 150} L1080 ${hz - 80} L1080 ${hz}Z`} fill="#c98a45" />
      <path d={`M760 ${hz - 160} L840 ${hz - 190} L860 ${hz} L760 ${hz}Z`} fill="#a86c33" opacity={0.6} />
      <rect y={hz} width={W} height={H - hz} fill="url(#sgr)" />
      {Array.from({ length: 9 }).map((_, i) => <line key={i} x1={540} y1={hz} x2={-600 + i * 285} y2={H} stroke="#5a3417" strokeWidth={2} opacity={0.25} />)}
      {/* dead branch with melting clock */}
      <g transform="translate(90 1500)">
        <path d="M0 420 L20 0 L60 -60 M20 0 L-30 -40" stroke="#3b2412" strokeWidth={22} fill="none" strokeLinecap="round" />
        <g transform={`translate(60 -60) rotate(${Math.sin(t * 0.8) * 3})`}>
          <path d={`M-90 0 C-90 -70 90 -70 90 0 C 90 40 70 ${110 + Math.sin(t * 1.5) * 15} 40 ${160 + Math.sin(t * 1.5) * 20} C 20 ${190 + Math.sin(t * 1.5) * 20} -10 120 -20 70 C -40 40 -90 40 -90 0Z`} fill="#e8d7a4" stroke="#7a5a1e" strokeWidth={6} />
          <line x1={0} y1={-10} x2={Math.cos(t * 2) * 45} y2={-10 + Math.sin(t * 2) * 30} stroke="#2b1d12" strokeWidth={6} strokeLinecap="round" />
          <line x1={0} y1={-10} x2={Math.cos(t * 0.3) * 30} y2={-10 + Math.sin(t * 0.3) * 20} stroke="#2b1d12" strokeWidth={8} strokeLinecap="round" />
        </g>
      </g>
      {/* rain cloud over a giant sprout growing on the plain */}
      <g transform={`translate(${800 + Math.sin(t * 0.7) * 20} 1440)`}>
        {Array.from({ length: 10 }).map((_, i) => { const yy = ((t * 400 + i * 47) % 240); return <line key={i} x1={-70 + i * 16} y1={yy} x2={-74 + i * 16} y2={yy + 20} stroke="#bfe4ff" strokeWidth={4} />; })}
        <ellipse cx={0} cy={0} rx={110} ry={42} fill="#f8f4ea" /><ellipse cx={-50} cy={-20} rx={55} ry={40} fill="#fff" /><ellipse cx={40} cy={-25} rx={60} ry={45} fill="#fff" />
      </g>
      <g transform="translate(800 1830)">
        <ellipse cx={20} cy={8} rx={160} ry={18} fill="#3b2412" opacity={0.35} />
        <g transform={`scale(${0.5 + 0.5 * k(t, 0, 3)}) rotate(${Math.sin(t * 1.5) * 4})`}>
          <path d="M0 0 C0 -60 0 -110 0 -150" stroke="#2f6b2a" strokeWidth={14} fill="none" />
          <path d="M0 -120 C-60 -120 -100 -160 -110 -220 C-50 -215 -10 -180 0 -120Z" fill="#4f9a3a" />
          <path d="M0 -150 C40 -200 90 -215 130 -205 C115 -150 70 -130 0 -140Z" fill="#6cbf3f" />
        </g>
      </g>
      {/* drawer-in-ground perspective (Dalí wink) */}
      <g transform="translate(330 1700)"><path d="M0 0 L220 0 L250 40 L-30 40Z" fill="#5a3417" /><rect x={90} y={12} width={40} height={10} rx={5} fill="#e8c46a" /></g>
    </svg>
  );
};
const surreal: Theme = {
  font: "V14Black", ink: "#2b1d12", key: "#c0392b", accent: "#f39a3c", entry: "melt",
  title: { fontFamily: "V14Black", fontSize: 128, color: "#fbe3a8", textShadow: "4px 0px 0 #5a3417, -4px 0px 0 #5a3417, 0px 4px 0 #5a3417, 0px -4px 0 #5a3417, 4px 4px 0 #5a3417, -4px 4px 0 #5a3417, 4px -4px 0 #5a3417, -4px -4px 0 #5a3417, 0 28px 0 rgba(43,29,18,0.35)", gap: 44 },
  pill: { background: "#f6ecd3", borderRadius: 80, border: "6px solid #b8862f", boxShadow: "0 22px 40px rgba(30,15,5,0.4)" },
  handle: "#2b1d12", btn: ["#c0392b", "#fff"], btnDone: "#2f6b2a", avatar: ["#c0392b", "#4f8fa8", "#d79b55"],
  logoBack: (t) => <div style={{ position: "absolute", left: "15%", right: "15%", bottom: "-14%", height: "8%", borderRadius: "50%", background: "rgba(20,10,0,0.35)", filter: "blur(8px)", transform: `scaleX(${1 - Math.sin(t * 2.4) * 0.12})` }} />,
};

// ======================= 3. CHINESE INK =======================
const InkBg: React.FC<{ t: number }> = ({ t }) => {
  const draw = (a: number) => 1 - k(t, a, a + 1.6);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="rice"><feTurbulence type="fractalNoise" baseFrequency="0.6 0.05" numOctaves="3" seed="4" /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.28  0 0 0 0.13 0" /></filter>
        <filter id="wash"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="9" /><feDisplacementMap in="SourceGraphic" scale="40" /><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="brush"><feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="2" /><feDisplacementMap in="SourceGraphic" scale="6" /></filter>
        <linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d1d1d" /><stop offset="1" stopColor="#1d1d1d" stopOpacity="0" /></linearGradient>
        <filter id="mist"><feGaussianBlur stdDeviation="30" /></filter>
      </defs>
      <rect width={W} height={H} fill="#f1e9d6" />
      <rect width={W} height={H} filter="url(#rice)" />
      <circle cx={760} cy={300} r={120} fill="#c8372d" opacity={0.85} filter="url(#wash)" />
      {/* far peaks */}
      <g transform={`translate(${-t * 4} 0)`} filter="url(#wash)">
        <path d="M-100 1100 L60 640 L180 820 L330 520 L470 900 L600 700 L760 980 L900 600 L1060 860 L1200 700 L1200 1250 L-100 1250Z" fill="url(#mt)" opacity={0.55} />
      </g>
      <rect x={-200 + ((t * 30) % 300)} y={950} width={1500} height={140} fill="#f7f1e3" opacity={0.85} filter="url(#mist)" />
      <g transform={`translate(${t * 3} 0)`} filter="url(#wash)">
        <path d="M-100 1350 L120 960 L260 1150 L420 1000 L560 1250 L700 1120 L820 1300 L980 1050 L1200 1300 L1200 1450 L-100 1450Z" fill="url(#mt)" opacity={0.85} />
      </g>
      <rect x={200 - ((t * 40) % 400)} y={1260} width={1500} height={150} fill="#f7f1e3" opacity={0.8} filter="url(#mist)" />
      {/* terraced rice fields — strokes draw on */}
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M-40 ${1450 + i * 60} C 300 ${1400 + i * 62} 700 ${1500 + i * 55} 1120 ${1430 + i * 64}`} stroke="#1d1d1d" strokeWidth={6 - i * 0.3} fill="none" opacity={0.75}
          strokeDasharray={1400} strokeDashoffset={1400 * draw(0.1 + i * 0.12)} filter="url(#brush)" />
      ))}
      {Array.from({ length: 30 }).map((_, i) => {
        const x = 40 + (i % 10) * 105 + rnd(i) * 30, y = 1520 + Math.floor(i / 10) * 120 + rnd(i + 2) * 30, sw = Math.sin(t * 2 + i) * 5;
        return <path key={"r" + i} d={`M${x} ${y} l${-10 + sw} -40 M${x} ${y} l${sw} -50 M${x} ${y} l${10 + sw} -40`} stroke="#3c5a2a" strokeWidth={4} opacity={k(t, 1 + i * 0.03, 1.5 + i * 0.03) * 0.8} />;
      })}
      {/* farmer with conical hat */}
      <g transform={`translate(${300 + Math.sin(t * 0.6) * 10} 1600)`} filter="url(#brush)">
        <path d="M-50 -40 L0 -80 L50 -40Z" fill="#1d1d1d" />
        <path d="M-12 -40 C-20 0 -20 30 -30 70 M12 -40 C20 0 26 30 34 70 M0 -30 L-40 10" stroke="#1d1d1d" strokeWidth={9} fill="none" strokeLinecap="round" />
      </g>
      {/* bamboo on the right */}
      {[0, 1, 2].map((b) => (
        <g key={b} transform={`translate(${960 + b * 55} ${H + 40}) rotate(${Math.sin(t * 1.3 + b) * 2 - 3 - b * 2})`} filter="url(#brush)">
          {Array.from({ length: 9 }).map((_, j) => <path key={j} d={`M-${9 - b * 2} ${-j * 170 - 6} L-${8 - b * 2} ${-(j + 1) * 170 + 6} L${8 - b * 2} ${-(j + 1) * 170 + 6} L${9 - b * 2} ${-j * 170 - 6}Z`} fill="#1d1d1d" opacity={0.8 - b * 0.2} />)}
          {Array.from({ length: 4 }).map((_, j) => {
            const y = -380 - j * 300 - b * 90, sw = Math.sin(t * 2 + j + b) * 8;
            return [0, 1, 2].map((q) => <path key={j + "-" + q} d={`M0 ${y} q ${-60 - q * 10} ${-20 + q * 30 + sw} ${-150 + q * 10} ${-10 + q * 45 + sw} q ${70} ${-5} ${150 - q * 10} ${10 - q * 45 - sw}Z`} fill="#1d1d1d" opacity={0.7 - b * 0.15} transform={`rotate(${q * 12 - 10} 0 ${y})`} />);
          })}
        </g>
      ))}
      {/* birds */}
      {Array.from({ length: 4 }).map((_, i) => {
        const x = 100 + ((t * 60 + i * 70) % 900), y = 560 + i * 40 + Math.sin(t * 3 + i) * 10, f = Math.sin(t * 9 + i) * 10;
        return <path key={"b" + i} d={`M${x - 22} ${y - f} Q ${x - 8} ${y - 6} ${x} ${y} Q ${x + 8} ${y - 6} ${x + 22} ${y - f}`} stroke="#1d1d1d" strokeWidth={4} fill="none" />;
      })}
      {/* ink bloom bursts on phase changes */}
      {[P2, P3].map((p, i) => {
        const g = k(t, p - 0.1, p + 0.9);
        return g > 0 && g < 1 ? <circle key={i} cx={540} cy={860} r={80 + 700 * g} fill="#1d1d1d" opacity={0.18 * (1 - g)} filter="url(#wash)" /> : null;
      })}
    </svg>
  );
};
const ink: Theme = {
  font: "V14Nastaliq", ink: "#141414", key: "#b3261e", accent: "#b3261e", entry: "ink",
  title: { fontFamily: "V14Nastaliq", fontSize: 120, lineHeight: 1.9, color: "#141414", textShadow: "0 0 30px rgba(241,233,214,1), 0 0 12px rgba(241,233,214,1)", gap: 44 },
  titleWord: (i) => (i ? { color: "#b3261e" } : {}),
  pill: { background: "#f6f0e0", borderRadius: 16, border: "5px solid #141414", boxShadow: "8px 8px 0 #b3261e" },
  handle: "#141414", btn: ["#b3261e", "#fff"], btnDone: "#141414", avatar: ["#141414", "#b3261e", "#56604a"],
  logoBack: (t) => <div style={{ position: "absolute", inset: "-4%", borderRadius: "50%", background: "radial-gradient(circle, rgba(241,233,214,1) 50%, rgba(241,233,214,0) 70%)" }} />,
};

// ======================= 4. FLAT 2026 =======================
const FlatBg: React.FC<{ t: number }> = ({ t }) => {
  const tr = ((t * 110) % 1400) - 200;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#ffe9b8" />
      <circle cx={540} cy={1500} r={1150} fill="#ffd77a" />
      <g transform={`translate(860 240) rotate(${t * 20})`}>
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-8} y={-190} width={16} height={50} rx={8} fill="#ffb21f" transform={`rotate(${i * 30})`} />)}
      </g>
      <circle cx={860} cy={240} r={110 + Math.sin(t * 3) * 5} fill="#ffb21f" />
      {[[120 + t * 25, 200, 1], [600 + t * 15, 120, 0.7], [-100 + t * 30, 1080, 0.9]].map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${s})`}><rect x={-120} y={-30} width={240} height={70} rx={35} fill="#fff" /><circle cx={-30} cy={-30} r={55} fill="#fff" /><circle cx={45} cy={-20} r={40} fill="#fff" /></g>
      ))}
      {/* iris rings on phase changes */}
      {[0, P2, P3].map((p, i) => {
        const g = k(t, p, p + 1.1);
        return g > 0 && g < 1 ? [0, 1, 2].map((j) => <circle key={i + "-" + j} cx={540} cy={i === 0 ? 660 : 860} r={(200 + j * 120) * (0.3 + g * 2)} fill="none" stroke={["#20a35a", "#ffb21f", "#ff6b4a"][j]} strokeWidth={40 * (1 - g)} />) : null;
      })}
      <path d={hill(1380, 50, 1 + t * 0.1, 2)} fill="#9fdc6a" />
      {/* lollipop trees */}
      {[[140, 1340], [330, 1310], [930, 1330]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 2 + i) * 3})`}><rect x={-7} y={0} width={14} height={70} rx={7} fill="#7a4a2b" /><circle cy={-10} r={48} fill={i % 2 ? "#1e8c5a" : "#2bb673"} /></g>
      ))}
      <path d={hill(1520, 40, 2 + t * 0.15, 1.5)} fill="#2bb673" />
      {/* tractor driving along the hill */}
      <g transform={`translate(${tr} ${1500 + Math.sin(((tr) / W) * Math.PI * 1.5 + 2 + t * 0.15) * 40 - 70})`}>
        <rect x={-60} y={-40} width={120} height={50} rx={10} fill="#ff6b4a" /><rect x={-10} y={-90} width={60} height={55} rx={8} fill="#ff6b4a" /><rect x={0} y={-80} width={40} height={30} rx={4} fill="#bfefff" />
        <rect x={-50} y={-70} width={10} height={30} fill="#333" />
        <g transform={`translate(-35 15) rotate(${t * 300})`}><circle r={30} fill="#283a4a" /><rect x={-4} y={-26} width={8} height={52} fill="#5d7489" /></g>
        <g transform={`translate(42 22) rotate(${t * 400})`}><circle r={22} fill="#283a4a" /><rect x={-3} y={-18} width={6} height={36} fill="#5d7489" /></g>
        {[0, 1, 2].map((j) => { const p = ((t * 2 + j / 3) % 1); return <circle key={j} cx={-55 - p * 60} cy={-80 - p * 70} r={8 + p * 14} fill="#fff" opacity={1 - p} />; })}
      </g>
      <rect y={1640} width={W} height={H - 1640} fill="#1e8c5a" />
      {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={-40} y={1680 + i * 36} width={W + 80} height={14} rx={7} fill="#177a4d" />)}
      {/* growing sprouts in front */}
      {Array.from({ length: 6 }).map((_, i) => {
        const g = k(t, 0.3 + i * 0.25, 1.1 + i * 0.25, back), x = 90 + i * 180;
        return (
          <g key={"s" + i} transform={`translate(${x} 1700) scale(${g}) rotate(${Math.sin(t * 3 + i) * 5})`}>
            <rect x={-5} y={-90} width={10} height={90} rx={5} fill="#0f6b3f" />
            <ellipse cx={-30} cy={-90} rx={34} ry={16} fill="#9fdc6a" transform="rotate(-25 -30 -90)" /><ellipse cx={30} cy={-105} rx={34} ry={16} fill="#c6ef7e" transform="rotate(25 30 -105)" />
          </g>
        );
      })}
      {[0, 1, 2].map((i) => { const x = ((t * 80 + i * 300) % 1300) - 100, y = 520 + i * 60 + Math.sin(t * 4 + i) * 12; return <path key={"bd" + i} d={`M${x - 18} ${y - 8} Q${x} ${y + 4} ${x} ${y} Q${x} ${y + 4} ${x + 18} ${y - 8}`} stroke="#283a4a" strokeWidth={5} fill="none" strokeLinecap="round" />; })}
    </svg>
  );
};
const flat: Theme = {
  font: "V14Lalezar", ink: "#12352a", key: "#20a35a", accent: "#ffb21f", entry: "pop",
  title: { fontFamily: "V14Lalezar", fontSize: 150, color: "#fff", textShadow: "8px 10px 0 #12352a", gap: 44 },
  titleWord: (i) => ({ color: i ? "#20a35a" : "#ff6b4a", WebkitTextFillColor: undefined }),
  pill: { background: "#fff", borderRadius: 80, boxShadow: "10px 12px 0 #12352a" },
  handle: "#12352a", btn: ["#ff6b4a", "#fff"], btnDone: "#20a35a", avatar: ["#ff6b4a", "#20a35a", "#3a8dde"],
  logoBack: (t) => <div style={{ position: "absolute", inset: "4%", borderRadius: "50%", background: "#fff", boxShadow: "14px 16px 0 #12352a", transform: `scale(${1 + Math.sin(t * 3) * 0.02})` }} />,
};

// ======================= 5. BAUHAUS =======================
const BauhausBg: React.FC<{ t: number }> = ({ t }) => {
  const R = "#d62828", Y = "#f4c20d", B = "#1d4e9e", K = "#151515";
  const sp = (a: number) => k(t, a, a + 0.6, back);
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#efe6d2" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 90} y1={0} x2={i * 90} y2={H} stroke="#d8ccb2" strokeWidth={2} />)}
      {Array.from({ length: 22 }).map((_, i) => <line key={"h" + i} y1={i * 90} x1={0} y2={i * 90} x2={W} stroke="#d8ccb2" strokeWidth={2} />)}
      {/* sun = big yellow circle, rotating red half */}
      <g transform={`translate(900 210) scale(${sp(0)})`}>
        <circle r={190} fill={Y} />
        <path d="M-190 0 A190 190 0 0 1 190 0Z" fill={R} transform={`rotate(${t * 36})`} opacity={0.9} />
        <circle r={60} fill={K} />
      </g>
      <rect x={-20 + Math.sin(t * 1.5) * 20} y={120} width={360} height={46} fill={K} transform={`scale(${sp(0.1)} 1)`} />
      <rect x={60} y={200} width={46} height={260} fill={B} transform={`translate(0 ${(1 - sp(0.2)) * -400})`} />
      {/* triangles bouncing on phase changes */}
      <g transform={`translate(110 ${1240 - Math.abs(Math.sin(t * 2.2)) * 40}) rotate(${t * 20})`}><path d="M0 -70 L60 40 L-60 40Z" fill={Y} /></g>
      {/* field: stripes + quarter-circle sprouts */}
      <rect y={1640} width={W} height={H - 1640} fill={K} transform={`translate(0 ${(1 - sp(0.15)) * 500})`} />
      {Array.from({ length: 6 }).map((_, i) => <rect key={"f" + i} x={0} y={1680 + i * 45} width={W} height={20} fill={i % 2 ? B : Y} transform={`translate(${(1 - sp(0.25 + i * 0.08)) * (i % 2 ? 1100 : -1100)} 0)`} />)}
      {[200, 540, 880].map((x, i) => {
        const g = sp(0.6 + i * 0.2), w = Math.sin(t * 2.5 + i) * 6;
        return (
          <g key={"p" + i} transform={`translate(${x} 1650) scale(${g}) rotate(${w})`}>
            <rect x={-9} y={-170} width={18} height={170} fill={K} />
            <path d="M0 -150 A90 90 0 0 0 -90 -60 L0 -60Z" fill={i === 1 ? R : B} />
            <path d="M0 -170 A80 80 0 0 1 80 -250 L80 -170Z" fill={i === 1 ? B : R} />
          </g>
        );
      })}
      {/* rotating ring + dots (alive) */}
      <g transform={`translate(1000 1150) rotate(${-t * 30})`}><circle r={70} fill="none" stroke={B} strokeWidth={22} strokeDasharray="110 30" /></g>
      {Array.from({ length: 5 }).map((_, i) => <circle key={"d" + i} cx={40 + i * 50} cy={1080 + Math.sin(t * 4 + i) * 12} r={12} fill={i % 2 ? R : K} />)}
      {/* geometric wipes on phase changes */}
      {[P2, P3].map((p, i) => {
        const g = k(t, p - 0.15, p + 0.5), o = k(t, p + 0.2, p + 0.75);
        return g > 0 && o < 1 ? <rect key={i} x={W - W * g + W * o} y={660} width={W} height={400} fill={[R, B][i]} /> : null;
      })}
    </svg>
  );
};
const bauhaus: Theme = {
  font: "V14Black", ink: "#151515", key: "#d62828", accent: "#f4c20d", entry: "geo",
  title: { fontFamily: "V14Black", fontSize: 112, color: "#efe6d2", lineHeight: 1.45, padding: "0 28px", boxShadow: "12px 12px 0 #151515", gap: 22 },
  titleWord: (i) => ({ background: i ? "#1d4e9e" : "#d62828" }),
  pill: { background: "#efe6d2", border: "8px solid #151515", boxShadow: "14px 14px 0 #1d4e9e" },
  handle: "#151515", btn: ["#d62828", "#fff"], btnDone: "#1d4e9e", avatar: ["#d62828", "#1d4e9e", "#151515"],
  logoBack: (t) => <div style={{ position: "absolute", inset: "6%", borderRadius: "50%", background: "#d62828", transform: `translate(${18 + Math.sin(t * 2) * 6}px, 18px)` }} />,
};

// ======================= compositions =======================
const STYLES = [
  { id: "Ghibli", th: ghibli, Bg: GhibliBg },
  { id: "Surreal", th: surreal, Bg: SurrealBg },
  { id: "Ink", th: ink, Bg: InkBg },
  { id: "Flat", th: flat, Bg: FlatBg },
  { id: "Bauhaus", th: bauhaus, Bg: BauhausBg },
];
export const LOOK = [0.15, 1.3, 3.0, 4.3, 5.6, 7.0, 8.0, 9.3];

const makeVideo = (s: (typeof STYLES)[number]) => {
  const C: React.FC<{ times?: number[]; audio?: boolean }> = ({ times, audio }) => {
    const f = useCurrentFrame();
    const t = times ? times[f] ?? 0 : f / FPS;
    return (
      <AbsoluteFill style={{ background: "#fff" }}>
        <Shell t={t} th={s.th} bg={<s.Bg t={t} />} />
        {audio && <Html5Audio src={staticFile("v14/mix.wav")} />}
      </AbsoluteFill>
    );
  };
  return C;
};

const COMPS = STYLES.map((s) => ({ id: s.id, C: makeVideo(s) }));
export const V14Compositions: React.FC = () => (
  <>
    {COMPS.map(({ id, C }) => {
      const s = { id };
      return (
        <React.Fragment key={s.id}>
          <Composition id={`V14-${s.id}`} component={C} durationInFrames={FRAMES} fps={FPS} width={W} height={H} defaultProps={{ audio: true }} />
          <Composition id={`V14-${s.id}-Look`} component={C} durationInFrames={LOOK.length} fps={FPS} width={W} height={H} defaultProps={{ times: LOOK }} />
        </React.Fragment>
      );
    })}
  </>
);
void clamp; void Heart;
