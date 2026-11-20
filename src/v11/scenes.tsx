// v11 scenes. Each scene draws one full 1080×1920 SVG frame at local frame t (0..D).
import React from "react";
import {
  C, INK, FONT, HAND, clamp, mix, ease, backOut, pr, rng, ridge, blob,
  Sky, Cloud, Hills, Tree, Grass, Fence, Sun, Mascot, Face, Lettuce, Tomato, Cucumber, Strawberry, Basil, Mint, Spinach, Pepper,
  Roots, NetPot, Bubbles, Particle, NUTRIENTS, Tank, Pipe, WoodSign, Leaf, Sparkle, Badge, Label, Bubble,
} from "./art";

export type SceneFn = (t: number, D: number) => React.ReactNode;
const Cam: React.FC<{ z?: number; x?: number; y?: number; children: React.ReactNode }> = ({ z = 1, x = 0, y = 0, children }) => (
  <g transform={`translate(${540 + x} ${960 + y}) scale(${z}) translate(-540 -960)`}>{children}</g>
);
const talkOf = (t: number) => clamp(0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1));

// common farm backdrop
const Farm: React.FC<{ t: number; y?: number }> = ({ t, y = 1150 }) => (
  <g>
    <Sky />
    <Sun x={860} y={260} r={62} t={t} />
    <Cloud x={200 + t * 0.4} y={260} s={1.1} />
    <Cloud x={760 - t * 0.25} y={430} s={0.8} o={0.85} />
    <Hills y={y} t={t} />
    <Tree x={110} y={y - 40} s={1.05} t={t} />
    <Tree x={990} y={y - 70} s={0.75} t={t} />
  </g>
);

// greenhouse interior backdrop
const GreenhouseBG: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <rect x="-100" y="-100" width="1280" height="2200" fill="#e7f6ee" />
    <g filter="url(#wc)" opacity="0.9">
      <path d="M -40 1100 L -40 520 Q 540 120 1120 520 L 1120 1100 Z" fill="#cfeee6" />
    </g>
    <g stroke="#9cc9bd" strokeWidth="8" fill="none" filter="url(#wob)" opacity="0.9">
      <path d="M -40 520 Q 540 120 1120 520" />
      {[100, 300, 540, 780, 980].map((x) => <path key={x} d={`M ${x} ${x === 540 ? 220 : x < 540 ? 520 - (x + 40) * 0.55 : 520 - (1120 - x) * 0.55} L ${x} 1100`} />)}
      <path d="M -40 760 L 1120 760" />
    </g>
    <rect x="-100" y="1100" width="1280" height="900" fill="#c99a63" filter="url(#wc)" />
    <path d={ridge(1100, 8, 3, 0)} fill="#b8854f" opacity="0.6" filter="url(#wc)" />
    <Cloud x={300 + t * 0.3} y={330} s={0.7} o={0.5} />
  </g>
);

// ============================================================ 1 · hook
export const S1: SceneFn = (t) => {
  const pop = backOut(pr(t, 4, 16));
  const q = backOut(pr(t, 20, 14));
  return (
    <Cam z={mix(1.08, 1.0, ease(pr(t, 0, 90)))}>
      <Farm t={t} />
      <WoodSign x={540} y={430} w={760} h={150} posts rot={-2}>
        <text x="0" y="22" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="74" fill="#3a2414">ArtofAgriculture</text>
      </WoodSign>
      <Fence x={-40} y={1260} n={3} />
      <Fence x={760} y={1250} n={3} />
      <Lettuce x={880} y={1300} s={0.9} t={t} expr="surprised" look={[-1, 0]} rot={-6} />
      <g transform={`translate(0 ${(1 - pop) * 700})`}>
        <Mascot x={500} y={1560} s={1.9} t={t} expr="talk" talk={talkOf(t)} armR="wave" armL="hip" />
      </g>
      <g transform={`translate(760 760) scale(${q})`}>
        <Bubble x={0} y={0} w={170} h={150} tail={[-40, -1]}>
          <text x="0" y="38" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="120" fill={C.orange} stroke={INK} strokeWidth="5" paintOrder="stroke">?</text>
        </Bubble>
      </g>
      {[[140, 1330], [330, 1380], [700, 1370], [980, 1340]].map(([x, y], i) => <Grass key={i} x={x} y={y} s={1.3} t={t} />)}
    </Cam>
  );
};

// ============================================================ 2 · no soil?
export const S2: SceneFn = (t) => {
  const crumble = pr(t, 40, 50);
  const R = rng(4);
  return (
    <Cam z={mix(1.0, 1.06, ease(pr(t, 0, 150)))}>
      <Farm t={t} y={1050} />
      {/* table */}
      <g filter="url(#wob)">
        <rect x="560" y="1080" width="440" height="34" rx="10" fill={C.wood} stroke={INK} strokeWidth="5" />
        <rect x="600" y="1110" width="26" height="200" fill={C.woodD} stroke={INK} strokeWidth="4" />
        <rect x="940" y="1110" width="26" height="200" fill={C.woodD} stroke={INK} strokeWidth="4" />
      </g>
      {/* glass jar with lettuce, roots in water */}
      <Tank x={650} y={760} w={280} h={320} t={t} level={0.12} />
      <Roots x={790} y={790} len={240} t={t} n={9} />
      <Bubbles x={680} y={820} w={220} h={250} t={t} n={10} r={6} />
      <Lettuce x={790} y={790} s={0.95} t={t} expr="happy" />
      <Sparkle x={960} y={700} t={t} />
      <Sparkle x={630} y={640} s={0.7} t={t} c="#bdf3ff" />
      {/* mascot holding a handful of soil that crumbles */}
      <Mascot x={300} y={1560} s={1.75} t={t} expr={t < 40 ? "talk" : "surprised"} talk={talkOf(t)} armL="hip" armR={[62, 96]}
        handProp={<g transform="translate(14 -10)">
          <path d={blob(0, -12, 34 * (1 - crumble * 0.6), 18 * (1 - crumble * 0.5), 6, 0.2)} fill={C.soil} stroke={INK} strokeWidth="3" />
          {/* worm */}
          <g opacity={1 - crumble}><path d="M 6 -22 q 4 -16 12 -14 q 6 2 2 10" stroke="#e98fa0" strokeWidth="6" fill="none" strokeLinecap="round" /><circle cx="17" cy="-36" r="1.6" fill={INK} /></g>
        </g>} />
      {Array.from({ length: 14 }, (_, i) => {
        const p = clamp(crumble * 1.3 - R() * 0.3);
        return <circle key={i} cx={300 + 120 + R() * 50 + p * (R() - 0.5) * 60} cy={1560 - 290 + p * p * 420} r={4 + R() * 7} fill={C.soilD} opacity={p > 0 && p < 1 ? 1 : 0} />;
      })}
      <Label x={790} y={660} text="0 g soil!" c={C.redD} rot={-4} s={backOut(pr(t, 30, 14))} />
    </Cam>
  );
};

// ============================================================ 3 · don't plants need soil?!
export const S3: SceneFn = (t, D) => {
  const lookDown = t < D * 0.45;
  const shake = !lookDown ? Math.sin(t * 1.4) * 2 * clamp(1 - (t - D * 0.45) / 20) : 0;
  return (
    <Cam z={1.15} y={-40}>
      <Farm t={t} y={1000} />
      {/* raft on a water tub */}
      <Tank x={150} y={980} w={780} h={420} t={t} level={0.06} />
      <Roots x={430} y={980} len={280} t={t} n={9} />
      <Roots x={760} y={980} len={240} t={t} n={7} />
      <rect x="170" y="950" width="740" height="44" rx="12" fill="#f7f3e6" stroke={INK} strokeWidth="5" filter="url(#wob)" />
      <NetPot x={430} y={950} s={0.9} />
      <NetPot x={760} y={950} s={0.8} />
      <g transform={`translate(${shake} 0)`}>
        <Lettuce x={430} y={940} s={1.3} t={t} expr={lookDown ? "surprised" : "confused"} look={lookDown ? [0, 1.4] : [0, 0]} rot={lookDown ? 8 : 0} />
      </g>
      <Cucumber x={760} y={930} s={1.1} t={t} expr="confused" look={[-1, 0]} arms armUp={0.8} />
      <text x="860" y="640" fontFamily={FONT} fontWeight="700" fontSize="110" fill={C.orange} stroke={INK} strokeWidth="5" paintOrder="stroke" transform={`rotate(12 860 640)`}>?</text>
      <text x="300" y="610" fontFamily={FONT} fontWeight="700" fontSize="90" fill={C.red} stroke={INK} strokeWidth="5" paintOrder="stroke" opacity={lookDown ? 1 : 0}>!</text>
      {!lookDown && <path d="M 510 700 Q 520 720 512 730 Q 500 722 510 700 Z" fill="#9fe3f5" stroke={INK} strokeWidth="3" />}
    </Cam>
  );
};

// ============================================================ 4 · not attached to soil
export const S4: SceneFn = (t) => {
  const jump = pr(t, 30, 40);
  const jx = mix(320, 720, ease(jump)), jy = mix(1000, 1060, jump) - Math.sin(jump * Math.PI) * 420;
  const splash = pr(t, 70, 20);
  const R = rng(9);
  return (
    <Cam z={mix(1.0, 1.05, pr(t, 0, 130))}>
      <Farm t={t} />
      {/* clay pot of soil */}
      <g filter="url(#wob)">
        <path d="M 200 1060 L 440 1060 L 410 1300 L 230 1300 Z" fill="#d0743d" stroke={INK} strokeWidth="5" />
        <rect x="186" y="1036" width="268" height="44" rx="10" fill="#e2884e" stroke={INK} strokeWidth="5" />
        <ellipse cx="320" cy="1046" rx="118" ry="16" fill={C.soilD} />
      </g>
      {/* water tub */}
      <g filter="url(#wob)">
        <path d="M 560 1120 L 1000 1120 L 970 1320 L 590 1320 Z" fill="#9fb7c4" stroke={INK} strokeWidth="5" />
        <ellipse cx="780" cy="1122" rx="220" ry="26" fill={C.water} stroke={INK} strokeWidth="5" />
      </g>
      {splash > 0 && Array.from({ length: 12 }, (_, i) => {
        const a = -Math.PI * (0.15 + 0.7 * (i / 11));
        const d = splash * (120 + R() * 80);
        return <circle key={i} cx={780 + Math.cos(a) * d} cy={1110 + Math.sin(a) * d + splash * splash * 140} r={10 * (1 - splash) + 4} fill={C.waterL} stroke={C.waterD} strokeWidth="3" />;
      })}
      {/* dirt flying off roots */}
      {jump > 0 && jump < 1 && Array.from({ length: 10 }, (_, i) => <circle key={i} cx={jx + (R() - 0.5) * 160 * jump} cy={jy + 120 + R() * 80 + jump * 60} r={5 + R() * 6} fill={C.soilD} />)}
      <g transform={`translate(${jx} ${jy}) rotate(${Math.sin(jump * Math.PI) * 20})`}>
        <Roots x={0} y={50} len={140} t={t} n={7} />
        <Tomato x={0} y={0} s={1.5} t={t} expr={splash > 0 ? "laugh" : "mischief"} arms armUp={jump > 0 ? 1 : 0.3} look={[1, 0]} />
      </g>
      <Mascot x={170} y={1600} s={1.15} t={t} expr="laugh" armL="hip" armR="hip" />
      <Sparkle x={900} y={880} t={t} />
    </Cam>
  );
};

// ============================================================ 5 · hydroponics title
export const S5: SceneFn = (t) => {
  const drop = backOut(pr(t, 6, 18));
  return (
    <g>
      <GreenhouseBG t={t} />
      <Bubbles x={60} y={300} w={960} h={1100} t={t} n={22} seed={3} r={12} />
      <g transform={`translate(0 ${(1 - drop) * -700})`}>
        <WoodSign x={540} y={560} w={900} h={210} rot={Math.sin(t / 10) * 1.5}>
          <text x="0" y="34" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="112" fill="#fff" stroke="#3a2414" strokeWidth="9" paintOrder="stroke">HYDROPONICS</text>
        </WoodSign>
      </g>
      <g opacity={pr(t, 26, 12)}>
        <Label x={330} y={760} text="hydro = water" c={C.waterD} rot={-3} />
        <Label x={760} y={770} text="ponos = work" c={C.woodD} rot={3} />
        <text x="540" y="850" textAnchor="middle" fontFamily={HAND} fontSize="40" fill="#4a6a5a">(from Greek)</text>
      </g>
      <Mascot x={540} y={1560} s={1.75} t={t} expr="talk" talk={talkOf(t)} armR="point" armL="present" />
      <g transform={`translate(760 1000) scale(${backOut(pr(t, 14, 12))})`}>
        <circle r="60" fill="#fff6b0" opacity="0.6" filter="url(#glow)" />
        <path d="M -22 20 Q -40 -6 -30 -30 Q -16 -54 0 -54 Q 16 -54 30 -30 Q 40 -6 22 20 Z" fill="#ffe14d" stroke={INK} strokeWidth="4" filter="url(#wob)" />
        <rect x="-18" y="20" width="36" height="22" rx="5" fill="#bbb" stroke={INK} strokeWidth="4" />
        <g stroke="#f0a91a" strokeWidth="5" strokeLinecap="round"><line x1="-56" y1="-40" x2="-72" y2="-52" /><line x1="56" y1="-40" x2="72" y2="-52" /><line x1="0" y1="-70" x2="0" y2="-90" /></g>
      </g>
      <Basil x={150} y={1360} s={1.1} t={t} expr="happy" />
      <Strawberry x={940} y={1320} s={1.1} t={t} expr="happy" />
    </g>
  );
};

// ============================================================ 6 · nutrient water
export const S6: SceneFn = (t) => {
  const R = rng(21);
  const pour = pr(t, 20, 40);
  return (
    <Cam z={mix(1.08, 1.0, ease(pr(t, 0, 200)))}>
      <GreenhouseBG t={t} />
      <Tank x={130} y={700} w={820} h={560} t={t} level={0.14} />
      {/* raft + lettuces */}
      <rect x="150" y="730" width="780" height="40" rx="12" fill="#f7f3e6" stroke={INK} strokeWidth="5" filter="url(#wob)" />
      {[300, 540, 780].map((x, i) => <g key={x}><Roots x={x} y={770} len={300} t={t + i * 20} n={9} /><NetPot x={x} y={740} s={0.75} /><Lettuce x={x} y={730} s={0.95} t={t + i * 13} expr={["sip", "happy", "smile"][i] as never} /></g>)}
      {Array.from({ length: 18 }, (_, i) => {
        const bx = 190 + R() * 700, by = 830 + R() * 380;
        return <Particle key={i} i={i} x={bx + Math.sin(t / 15 + i) * 22} y={by + Math.cos(t / 19 + i * 2) * 18} r={20} />;
      })}
      {/* bottle being poured */}
      <g transform={`translate(860 520) rotate(${mix(0, 120, ease(pour))})`} filter="url(#wob)">
        <rect x="-40" y="-110" width="80" height="140" rx="16" fill="#fffdf4" stroke={INK} strokeWidth="5" />
        <rect x="-16" y="-136" width="32" height="30" rx="5" fill={C.green} stroke={INK} strokeWidth="4" />
        <rect x="-34" y="-70" width="68" height="56" rx="6" fill={C.lime} />
        <text x="0" y="-34" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="20" fill={INK}>NPK+</text>
      </g>
      {pour > 0.6 && Array.from({ length: 6 }, (_, i) => <Particle key={"p" + i} i={i} x={880 - i * 8 + Math.sin(t + i) * 6} y={560 + ((t * 9 + i * 30) % 160)} r={13} />)}
      <Label x={360} y={420} text="minerals + nutrients" s={backOut(pr(t, 10, 14))} c={C.waterD} rot={-2} />
      {/* soil bag shrugging, crossed */}
      <g transform="translate(140 560) scale(0.8)" filter="url(#wob)">
        <path d="M -60 60 L -50 -60 Q 0 -80 50 -60 L 60 60 Z" fill="#c9a77a" stroke={INK} strokeWidth="5" />
        <text y="10" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="32" fill="#5e3a1f">SOIL</text>
        <path d="M -70 -70 L 70 70 M 70 -70 L -70 70" stroke={C.red} strokeWidth="12" strokeLinecap="round" opacity={pr(t, 30, 8)} />
      </g>
      <Mascot x={120} y={1560} s={1.0} t={t} expr="talk" talk={talkOf(t)} armR="point" armL="hip" />
    </Cam>
  );
};

// ============================================================ 7 · roots in water / coir & perlite
export const S7: SceneFn = (t) => {
  const R = rng(5);
  return (
    <g>
      <rect x="0" y="0" width="1080" height="1920" fill="#e9f7f4" />
      {/* top: macro of roots drinking */}
      <rect x="40" y="170" width="1000" height="640" rx="40" fill="url(#water)" stroke={INK} strokeWidth="5" filter="url(#wob)" />
      <Roots x={540} y={150} len={600} s={1} t={t} n={11} />
      <Bubbles x={80} y={200} w={920} h={600} t={t} n={18} seed={7} r={10} />
      {Array.from({ length: 10 }, (_, i) => {
        const p = ((t * 0.012 + R()) % 1);
        const sx = 120 + R() * 840, sy = 300 + R() * 460;
        const tx = 540 + (sx - 540) * 0.35, ty = 250 + (sy - 250) * 0.6;
        return <Particle key={i} i={i} x={mix(sx, tx, ease(p))} y={mix(sy, ty, ease(p))} r={26 * (1 - p * 0.5)} />;
      })}
      <Face x={380} y={640} k={1.2} expr="sip" />
      <Face x={700} y={600} k={1.2} expr="happy" />
      <Label x={540} y={140} text="roots in nutrient water" c={C.waterD} />
      {/* bottom: two growing media */}
      <g transform="translate(0 0)">
        <rect x="40" y="880" width="485" height="440" rx="36" fill="#fff6e8" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        <rect x="555" y="880" width="485" height="440" rx="36" fill="#f3f6f6" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        <NetPot x={250} y={1110} s={1.4} fill="coir" />
        <NetPot x={800} y={1110} s={1.4} fill="perlite" />
        <Basil x={250} y={1090} s={0.95} t={t} expr="happy" />
        <Mint x={800} y={1090} s={1.0} t={t} expr="wink" />
        {/* coconut buddy */}
        <g transform="translate(440 1230)" filter="url(#wob)">
          <circle r="48" fill="#7a4a26" stroke={INK} strokeWidth="4" />
          <circle r="34" fill="#fffaf0" stroke="#5e3a1f" strokeWidth="3" />
        </g>
        <Face x={440} y={1230} k={0.55} expr="happy" />
        <Label x={260} y={1290} text="coconut coir" s={0.9} c={C.woodD} />
        <Label x={800} y={1290} text="perlite" s={0.9} c="#5c6a70" />
      </g>
    </g>
  );
};

// ============================================================ 8 · why so cool?
export const S8: SceneFn = (t) => (
  <Cam z={mix(1.0, 1.08, ease(pr(t, 0, 90)))}>
    <GreenhouseBG t={t} />
    {["1", "2", "3"].map((n, i) => {
      const s = backOut(pr(t, 8 + i * 6, 12));
      return <g key={n} transform={`translate(${260 + i * 280} ${420 + Math.sin(t / 10 + i) * 14}) scale(${s})`}>
        <circle r="70" fill={[C.water, C.orange, C.green][i]} stroke={INK} strokeWidth="6" filter="url(#wob)" />
        <text y="30" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="88" fill="#fff" stroke={INK} strokeWidth="6" paintOrder="stroke">{n}</text>
      </g>;
    })}
    <Mascot x={540} y={1530} s={1.8} t={t} expr="curious" armR="chin" armL="hip" lx={4} ly={-4} />
    <Tomato x={170} y={1180} s={1.25} t={t} expr="cool" arms armUp={0.6} />
    <Lettuce x={900} y={1210} s={1.05} t={t} expr="smile" look={[-1, -0.6]} rot={-10} />
    <Cucumber x={920} y={1440} s={0.7} t={t} expr="smile" look={[-1, -1]} rot={-14} />
  </Cam>
);

// ============================================================ 9 · saves water (recirculating NFT)
export const S9: SceneFn = (t) => {
  // loop path: reservoir → pump up left pipe → along 3 channels → down return → reservoir
  const loop = "M 160 1330 L 160 520 L 920 520 L 920 700 L 160 700 L 160 880 L 920 880 L 920 1300";
  const drops = Array.from({ length: 22 }, (_, i) => (t * 6 + i * 150) % 3450);
  const pt = (d: number) => {
    const segs: [number, number, number, number][] = [[160, 1330, 160, 520], [160, 520, 920, 520], [920, 520, 920, 700], [920, 700, 160, 700], [160, 700, 160, 880], [160, 880, 920, 880], [920, 880, 920, 1300]];
    for (const [a, b, c, e] of segs) { const L = Math.hypot(c - a, e - b); if (d <= L) return [a + ((c - a) * d) / L, b + ((e - b) * d) / L]; d -= L; }
    return [920, 1300];
  };
  const rd = (t * 6 + 900) % 3450;
  const [rx, ry] = pt(rd);
  return (
    <Cam z={mix(1.05, 1.0, ease(pr(t, 0, 240)))}>
      <GreenhouseBG t={t} />
      <g transform="translate(0 -110)">
      <path d={loop} stroke="#cfe7ec" strokeWidth="40" fill="none" strokeLinejoin="round" filter="url(#wob)" />
      <path d={loop} stroke={INK} strokeWidth="46" fill="none" strokeLinejoin="round" opacity="0.9" filter="url(#wob)" />
      <path d={loop} stroke="#eef6f7" strokeWidth="36" fill="none" strokeLinejoin="round" />
      <path d={loop} stroke={C.water} strokeWidth="14" fill="none" strokeLinejoin="round" strokeDasharray="30 22" strokeDashoffset={-t * 6} />
      {[520, 700, 880].map((y, r) => [300, 480, 660, 840].map((x, i) => (
        <g key={`${r}-${i}`}><NetPot x={x} y={y - 26} s={0.55} /><Lettuce x={x} y={y - 34} s={0.62} t={t + i * 9 + r * 21} expr={(["smile", "happy", "sip", "wink"] as const)[(i + r) % 4]} /></g>
      )))}
      {drops.map((d, i) => { const [x, y] = pt(d); return <circle key={i} cx={x} cy={y} r="7" fill={C.waterL} stroke={C.waterD} strokeWidth="2" />; })}
      {/* reservoir + pump */}
      <Tank x={120} y={1260} w={860} h={220} t={t} level={0.3} />
      <g filter="url(#wob)"><rect x="120" y="1280" width="90" height="80" rx="14" fill="#5d6b72" stroke={INK} strokeWidth="5" /><text x="165" y="1332" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="24" fill="#fff">PUMP</text></g>
      {/* rider droplet */}
      <g transform={`translate(${rx} ${ry - 30})`}>
        <path d="M 0 -50 Q 34 -6 30 16 Q 26 40 0 40 Q -26 40 -30 16 Q -34 -6 0 -50 Z" fill={C.water} stroke={INK} strokeWidth="4" filter="url(#wob)" />
        <path d="M -24 0 L -44 -30 M 24 0 L 44 -30" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <Face y={12} k={0.55} expr="laugh" />
      </g>
      </g>
      <Badge x={180} y={250} n="1" label="Saves water" c={C.water} s={backOut(pr(t, 4, 14))} />
      <g transform={`translate(560 1230) scale(${backOut(pr(t, 60, 14))})`}>
        <circle r="56" fill="#fff" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        <text y="22" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="62" fill={C.green}>♻</text>
      </g>
      <Mascot x={880} y={1590} s={1.0} t={t} expr="wink" armR="thumb" armL="hip" />
    </Cam>
  );
};

// ============================================================ 10 · personal chef
export const S10: SceneFn = (t) => {
  const ladle = Math.sin(t / 8) * 10;
  return (
    <Cam z={mix(1.0, 1.06, ease(pr(t, 0, 240)))}>
      <rect x="-100" y="-100" width="1280" height="2200" fill="#fff4e2" />
      <g filter="url(#wc)" opacity="0.8"><rect x="-40" y="200" width="1160" height="820" fill="#ffe2b8" /></g>
      <g filter="url(#wob)" stroke="#e8c48f" strokeWidth="4">{[260, 420, 580, 740, 900].map((y) => <line key={y} x1="-40" y1={y} x2="1120" y2={y} />)}</g>
      {/* recipe card */}
      <g transform={`translate(720 470) rotate(4) scale(${backOut(pr(t, 10, 14))})`}>
        <rect x="-220" y="-170" width="440" height="330" rx="18" fill="#fffdf4" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        <text x="0" y="-110" textAnchor="middle" fontFamily={HAND} fontSize="50" fill={C.redD}>Lettuce recipe</text>
        {["Nitrogen  ✓", "Phosphorus  ✓", "Potassium  ✓", "pH 5.5–6.5  ✓"].map((s, i) => <text key={s} x="-180" y={-44 + i * 54} fontFamily={HAND} fontSize="42" fill={INK}>{s}</text>)}
      </g>
      {/* table */}
      <rect x="-40" y="1080" width="1160" height="60" rx="12" fill={C.wood} stroke={INK} strokeWidth="5" filter="url(#wob)" />
      <rect x="-40" y="1140" width="1160" height="800" fill="#e8b57c" filter="url(#wc)" />
      {/* diners with napkins + bowls */}
      {[[640, "smile"], [900, "happy"]].map(([x, e], i) => (
        <g key={i}>
          {i === 0 ? <Lettuce x={x as number} y={1010} s={1.0} t={t} expr={e as never} /> : <Basil x={x as number} y={1060} s={0.95} t={t} expr={e as never} />}
          <path d={`M ${(x as number) - 30} ${i ? 960 : 990} L ${(x as number) + 30} ${i ? 960 : 990} L ${x} ${i ? 1010 : 1040} Z`} fill="#fff" stroke={INK} strokeWidth="3" />
          <path d={`M ${(x as number) - 70} 1070 Q ${x} 1130 ${(x as number) + 70} 1070 Z`} fill="#fff" stroke={INK} strokeWidth="4" filter="url(#wob)" />
          <ellipse cx={x as number} cy={1072} rx="62" ry="10" fill={C.water} />
        </g>
      ))}
      {/* chef tomato with ladle */}
      <g>
        <g transform="translate(300 830)" filter="url(#wob)">
          <path d="M -50 -60 L -44 -110 Q -70 -150 -30 -160 Q -10 -200 20 -170 Q 64 -176 54 -130 L 46 -60 Z" fill="#fff" stroke={INK} strokeWidth="4" />
        </g>
        <Tomato x={300} y={900} s={1.5} t={t} expr="proud" arms armUp={0.4} />
        <g transform={`translate(430 ${880 + ladle}) rotate(${20 + ladle})`} filter="url(#wob)">
          <line x1="0" y1="0" x2="120" y2="-90" stroke="#888" strokeWidth="8" strokeLinecap="round" />
          <path d="M -30 0 Q 0 40 30 0 Z" fill="#aaa" stroke={INK} strokeWidth="4" />
        </g>
        {NUTRIENTS.slice(0, 3).map((n, i) => <Particle key={i} i={i} x={480 + i * 40} y={950 + ((t * 2 + i * 20) % 80)} r={12} />)}
      </g>
      <Badge x={160} y={250} n="2" label="Perfect nutrients" c={C.orange} s={backOut(pr(t, 4, 14))} />
      <Mascot x={160} y={1660} s={1.0} t={t} expr="happy" armR={[50, 150]} armL="hip"
        handProp={<g transform="rotate(-10)" filter="url(#wob)"><rect x="-14" y="-74" width="28" height="64" rx="8" fill="#fff" stroke={INK} strokeWidth="3" /><rect x="-9" y="-66" width="18" height="16" rx="3" fill={C.lime} /><text x="0" y="-27" textAnchor="middle" fontFamily={FONT} fontSize="11" fontWeight="700" fill={INK}>pH</text></g>} />
    </Cam>
  );
};

// ============================================================ 11 · small spaces (vertical tower on a rooftop)
export const S11: SceneFn = (t) => {
  const tilt = ease(pr(t, 0, 200));
  return (
    <Cam z={1} y={mix(-260, 120, tilt)}>
      <Sky />
      <Cloud x={260 + t * 0.3} y={200} />
      <Cloud x={820 - t * 0.2} y={420} s={0.7} />
      {/* city skyline */}
      <g filter="url(#wc)" opacity="0.85">
        {[[0, 760, 160], [150, 640, 140], [280, 820, 150], [420, 560, 130], [540, 700, 170], [700, 600, 140], [830, 780, 120], [940, 660, 160]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={1500} fill={["#b9c9d8", "#a6b9cc", "#c5d3df"][i % 3]} />)}
      </g>
      <g opacity="0.55">{Array.from({ length: 40 }, (_, i) => <rect key={i} x={20 + (i * 97) % 1040} y={680 + ((i * 53) % 400)} width="22" height="30" fill="#eef4fa" />)}</g>
      {/* rooftop */}
      <rect x="-60" y="1250" width="1200" height="700" fill="#c8b8a6" stroke={INK} strokeWidth="5" filter="url(#wob)" />
      {/* small greenhouse */}
      <g transform="translate(780 1250)" filter="url(#wob)">
        <path d="M -150 0 L -150 -190 L 0 -300 L 150 -190 L 150 0 Z" fill="#dff6f0" fillOpacity="0.8" stroke={INK} strokeWidth="5" />
        <path d="M -150 -190 L 150 -190 M 0 -300 L 0 0 M -75 -245 L -75 0 M 75 -245 L 75 0" stroke="#7fb5a8" strokeWidth="4" />
        {[-110, -40, 40, 110].map((x) => <circle key={x} cx={x} cy={-60} r="28" fill={x % 80 ? C.green : C.red} opacity="0.8" />)}
      </g>
      {/* vertical tower */}
      <g transform="translate(340 1250)">
        <rect x="-36" y="-1010" width="72" height="1010" rx="30" fill="url(#pipe)" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        {Array.from({ length: 8 }, (_, i) => {
          const y = -110 - i * 118, side = i % 2 ? 1 : -1;
          const P = [Lettuce, Strawberry, Basil, Mint, Pepper, Spinach, Lettuce, Strawberry][i];
          return <g key={i}><path d={`M ${side * 30} ${y} l ${side * 50} -30 l ${side * 10} 40 Z`} fill="#fff" stroke={INK} strokeWidth="4" />
            <P x={side * 100} y={y + 4} s={0.55} t={t + i * 11} expr={(["happy", "smile", "wink", "laugh"] as const)[i % 4]} /></g>;
        })}
      </g>
      <Badge x={140} y={mix(560, 160, tilt) + 0} n="3" label="Less space" c={C.green} s={backOut(pr(t, 6, 14))} />
      <Mascot x={600} y={1560} s={1.25} t={t} expr="talk" talk={talkOf(t)} armR="up" armL="hip" lx={-6} ly={-6} />
      <Label x={780} y={900} text="greenhouse" s={0.8} />
    </Cam>
  );
};

// ============================================================ 12 · what can we grow?
export const S12: SceneFn = (t) => {
  const open = ease(pr(t, 20, 30));
  return (
    <Cam z={mix(1.0, 1.1, ease(pr(t, 10, 100)))}>
      <Farm t={t} />
      <g transform="translate(540 1250)">
        <path d="M -380 0 L -380 -520 L 0 -760 L 380 -520 L 380 0 Z" fill="#dff6f0" stroke={INK} strokeWidth="6" filter="url(#wob)" />
        <rect x="-170" y="-440" width="340" height="440" fill="url(#burst)" />
        <circle cx="0" cy="-240" r={260 * open} fill="url(#burst)" />
        {/* plants peeking from inside */}
        <g opacity={open}>
          <Lettuce x={-90} y={-60} s={0.8} t={t} expr="happy" />
          <Tomato x={60} y={-90} s={0.8} t={t} expr="laugh" arms armUp={1} />
          <Strawberry x={-20} y={-230} s={0.8} t={t} expr="happy" />
          <Pepper x={110} y={-270} s={0.7} t={t} expr="happy" />
          <Basil x={-120} y={-200} s={0.6} t={t} expr="smile" />
        </g>
        {/* doors */}
        <g filter="url(#wob)">
          <rect x={-170 - open * 150} y="-440" width="170" height="440" fill="#c9ece4" fillOpacity="0.85" stroke={INK} strokeWidth="5" transform={`skewY(${open * 8})`} />
          <rect x={0 + open * 150} y="-440" width="170" height="440" fill="#c9ece4" fillOpacity="0.85" stroke={INK} strokeWidth="5" transform={`skewY(${-open * 8})`} />
        </g>
        <path d="M -380 -520 L 380 -520 M -190 -640 L -190 -520 M 190 -640 L 190 -520" stroke="#7fb5a8" strokeWidth="5" />
      </g>
      {Array.from({ length: 8 }, (_, i) => <Sparkle key={i} x={540 + Math.cos(i) * 360 * open} y={900 + Math.sin(i * 1.7) * 300 * open} s={0.7} t={t + i * 9} />)}
      <Mascot x={190} y={1600} s={1.2} t={t} expr="happy" armR="wide" armL="hip" />
    </Cam>
  );
};

// ============================================================ 13 · crop parade
const CROPS: { name: string; P: React.FC<any>; e: string; k: number }[] = [
  { name: "Lettuce", P: Lettuce, e: "happy", k: 0.85 }, { name: "Spinach", P: Spinach, e: "proud", k: 0.85 },
  { name: "Basil", P: Basil, e: "smile", k: 0.8 }, { name: "Mint", P: Mint, e: "wink", k: 0.85 },
  { name: "Tomatoes", P: Tomato, e: "mischief", k: 0.95 }, { name: "Cucumbers", P: Cucumber, e: "smile", k: 0.62 },
  { name: "Bell peppers", P: Pepper, e: "happy", k: 0.95 }, { name: "Strawberries", P: Strawberry, e: "laugh", k: 0.9 },
];
export const S13: SceneFn = (t, D) => (
  <g>
    <GreenhouseBG t={t} />
    {[0, 1, 2, 3].map((r) => <Pipe key={r} x={60} y={420 + r * 262} w={960} h={56} />)}
    {CROPS.map((c, i) => {
      const r = Math.floor(i / 2), col = i % 2;
      const x = 290 + col * 500, y = 420 + r * 262;
      const s = backOut(pr(t, 6 + i * (D - 50) / 8, 12));
      const P = c.P;
      return <g key={c.name} transform={`translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})`}>
        {c.name === "Strawberries" ? <g><Strawberry x={x - 70} y={y - 50} s={0.7} t={t} expr="happy" /><Strawberry x={x + 70} y={y - 50} s={0.7} t={t + 20} expr="wink" /><P x={x} y={y - 60} s={c.k} t={t} expr={c.e} /></g>
          : <P x={x} y={y - (c.name === "Tomatoes" || c.name === "Bell peppers" ? 66 : 0)} s={c.k * 1.15} t={t + i * 7} expr={c.e} arms={c.name === "Tomatoes"} armUp={1} />}
        <Label x={x} y={y + 30} text={c.name} s={0.95} c={INK} />
      </g>;
    })}
  </g>
);

// ============================================================ 14 · salad
export const S14: SceneFn = (t) => (
  <Cam z={mix(1.0, 1.07, ease(pr(t, 0, 240)))}>
    <rect x="-100" y="-100" width="1280" height="2200" fill="#fff4e2" />
    <g filter="url(#wc)"><rect x="-40" y="1080" width="1160" height="900" fill="#e8b57c" /></g>
    <g filter="url(#wob)" stroke="#f0d6ac" strokeWidth="18" opacity="0.6">{[-40, 120, 280, 440, 600, 760, 920].map((x) => <line key={x} x1={x} y1="1080" x2={x - 100} y2="1960" />)}</g>
    {/* thought bubble: baby lettuce in a pipe */}
    <Bubble x={640} y={430} w={600} h={380} tail={[-120, 1]} thought>
      <rect x="-250" y="20" width="500" height="60" rx="30" fill="url(#pipe)" stroke={INK} strokeWidth="4" />
      <path d="M -230 68 L 230 68" stroke={C.water} strokeWidth="12" strokeDasharray="20 14" strokeDashoffset={-t * 4} />
      <Lettuce x={-60} y={20} s={0.55} t={t} expr="happy" />
      <Lettuce x={110} y={20} s={0.45} t={t + 9} expr="smile" />
      <text x="0" y="-120" textAnchor="middle" fontFamily={HAND} fontSize="44" fill={C.waterD}>never touched soil!</text>
    </Bubble>
    {/* bowl */}
    <g filter="url(#wob)">
      <path d="M 260 1060 Q 540 1340 820 1060 Z" fill="#fff" stroke={INK} strokeWidth="6" />
      <ellipse cx="540" cy="1062" rx="282" ry="40" fill="#f3f0e6" stroke={INK} strokeWidth="5" />
    </g>
    {[[360, 1040, C.red], [700, 1030, C.red], [440, 1000, "#f7b52a"], [640, 1004, "#4f9a3a"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r="34" fill={c as string} stroke={INK} strokeWidth="4" filter="url(#wob)" />)}
    <Lettuce x={540} y={1020} s={1.15} t={t} expr="proud" />
    <Sparkle x={680} y={830} t={t} s={0.8} />
    <Sparkle x={400} y={860} t={t + 30} s={0.6} />
    {/* fork */}
    <g transform={`translate(${880 - pr(t, 40, 80) * 60} ${760 + Math.sin(t / 9) * 8}) rotate(-35)`} filter="url(#wob)">
      <rect x="-8" y="0" width="16" height="200" rx="8" fill="#c9cfd2" stroke={INK} strokeWidth="3.5" />
      <path d="M -26 0 L -26 -60 M -9 0 L -9 -64 M 9 0 L 9 -64 M 26 0 L 26 -60 M -26 0 Q 0 20 26 0" stroke={INK} strokeWidth="6" fill="none" strokeLinecap="round" />
    </g>
    <Mascot x={170} y={1700} s={1.05} t={t} expr="surprised" armR="hold" armL="hip" />
  </Cam>
);

// ============================================================ 15 · still needs water, light, oxygen, nutrients
export const S15: SceneFn = (t, D) => {
  const items = [
    { l: "Water", c: C.water, icon: <path d="M 0 -42 Q 30 -4 26 14 Q 22 36 0 36 Q -22 36 -26 14 Q -30 -4 0 -42 Z" fill={C.water} stroke={INK} strokeWidth="4" /> },
    { l: "Light", c: C.yellow, icon: <g><circle r="26" fill="#ffd93d" stroke={INK} strokeWidth="4" />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={Math.cos(i * 0.785) * 34} y1={Math.sin(i * 0.785) * 34} x2={Math.cos(i * 0.785) * 46} y2={Math.sin(i * 0.785) * 46} stroke="#f0a91a" strokeWidth="5" strokeLinecap="round" />)}</g> },
    { l: "Oxygen", c: "#bfe9ff", icon: <g fill="#e9fdff" stroke={INK} strokeWidth="4"><circle cx="-12" cy="8" r="20" /><circle cx="18" cy="-14" r="13" /><text x="-12" y="16" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="22" fill={INK} stroke="none">O₂</text></g> },
    { l: "Nutrients", c: C.lime, icon: <g><rect x="-22" y="-30" width="44" height="64" rx="10" fill="#fff" stroke={INK} strokeWidth="4" /><rect x="-16" y="-8" width="32" height="26" rx="4" fill={C.lime} /></g> },
  ];
  const pos = [[260, 470], [820, 470], [260, 1080], [820, 1080]];
  return (
    <g>
      <GreenhouseBG t={t} />
      {/* grow light */}
      <g filter="url(#wob)"><rect x="380" y="300" width="320" height="40" rx="12" fill="#555" stroke={INK} strokeWidth="5" /><line x1="540" y1="200" x2="540" y2="300" stroke={INK} strokeWidth="5" /></g>
      <path d="M 390 340 L 300 900 L 780 900 L 690 340 Z" fill="#ffb6f0" opacity="0.18" />
      <Tank x={360} y={900} w={360} h={260} t={t} level={0.16} />
      <Roots x={540} y={890} len={220} t={t} n={9} />
      <Bubbles x={400} y={940} w={280} h={200} t={t} n={10} r={7} />
      <NetPot x={540} y={880} s={0.9} />
      <Basil x={540} y={870} s={1.35} t={t} expr="happy" />
      {items.map((it, i) => {
        const s = backOut(pr(t, 6 + i * (D * 0.6) / 4, 12));
        const ck = pr(t, 16 + i * (D * 0.6) / 4, 8);
        const [x, y] = pos[i];
        return <g key={it.l} transform={`translate(${x} ${y + Math.sin(t / 12 + i) * 10}) scale(${s})`}>
          <circle r="92" fill="#fffdf4" stroke={INK} strokeWidth="5" filter="url(#wob)" />
          <g transform="translate(0 -14) scale(1.2)">{it.icon}</g>
          <text y="70" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="30" fill={INK}>{it.l}</text>
          <g transform={`translate(66 -66) scale(${backOut(ck)})`}><circle r="28" fill={C.green} stroke={INK} strokeWidth="4" /><path d="M -12 0 L -3 10 L 14 -10" stroke="#fff" strokeWidth="7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
        </g>;
      })}
    </g>
  );
};

// ============================================================ 16 · not farming without effort
export const S16: SceneFn = (t) => (
  <Cam z={1.05}>
    <GreenhouseBG t={t} />
    <Pipe x={80} y={1000} w={920} h={64} />
    {[220, 420, 640, 860].map((x, i) => <g key={x}><NetPot x={x} y={980} s={0.6} />{i % 2 ? <Lettuce x={x} y={970} s={0.75} t={t + i * 8} expr="laugh" /> : <Strawberry x={x} y={930} s={0.85} t={t + i * 8} expr="laugh" />}</g>)}
    <g transform="translate(540 500)">
      <rect x="-410" y="-100" width="820" height="200" rx="30" fill="#fffdf4" stroke={INK} strokeWidth="5" filter="url(#wob)" />
      <text x="0" y="-22" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="56" fill={C.waterD}>farming without soil</text>
      <text x="0" y="58" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="56" fill={C.redD}>≠ without effort!</text>
    </g>
    {/* clipboard */}
    <Mascot x={540} y={1620} s={1.45} t={t} expr="laugh" sweat armL={[40, 120]} armR={[50, 140]}
      handPropL={<g transform="rotate(-20)" filter="url(#wob)"><rect x="-34" y="-90" width="68" height="90" rx="6" fill="#fffdf4" stroke={INK} strokeWidth="3.5" /><path d="M -22 -70 h 40 M -22 -52 h 40 M -22 -34 h 30" stroke="#999" strokeWidth="3" /></g>}
      handProp={<g transform="rotate(10)" filter="url(#wob)"><rect x="-12" y="-70" width="24" height="60" rx="7" fill="#fff" stroke={INK} strokeWidth="3" /><rect x="-8" y="-62" width="16" height="14" rx="3" fill={C.lime} /></g>} />
  </Cam>
);

// ============================================================ 17 · future of farming
export const S17: SceneFn = (t) => (
  <Cam z={mix(1.15, 1.0, ease(pr(t, 0, 180)))}>
    <Sky id="dusk" />
    <Sun x={540} y={900} r={90} t={t} />
    <g filter="url(#wc)" opacity="0.8">
      {[[40, 700, 170], [600, 620, 180], [840, 760, 160]].map(([x, y, w], i) => <rect key={i} x={x} y={y} width={w} height={900} fill={["#9aa9c9", "#8d9ec2", "#a8b5d0"][i]} />)}
    </g>
    {/* vertical farm towers with green floors */}
    {[[250, 380, 260], [780, 470, 220]].map(([x, top, w], k) => (
      <g key={k} filter="url(#wob)">
        <rect x={x - w / 2} y={top} width={w} height={1300 - top} rx="20" fill="#e8f7f2" fillOpacity="0.92" stroke={INK} strokeWidth="5" />
        {Array.from({ length: Math.floor((1300 - top) / 90) }, (_, i) => <g key={i}>
          <line x1={x - w / 2} y1={top + 80 + i * 90} x2={x + w / 2} y2={top + 80 + i * 90} stroke="#8fbfb2" strokeWidth="4" />
          {Array.from({ length: 5 }, (_, j) => <circle key={j} cx={x - w / 2 + 28 + j * ((w - 56) / 4)} cy={top + 62 + i * 90} r={15} fill={[C.green, C.lime, C.red, C.green, "#f7b52a"][(i + j) % 5]} stroke={INK} strokeWidth="2.5" />)}
        </g>)}
      </g>
    ))}
    {/* pipes between towers */}
    <path d="M 380 800 C 520 760 560 860 670 820" stroke={INK} strokeWidth="30" fill="none" filter="url(#wob)" />
    <path d="M 380 800 C 520 760 560 860 670 820" stroke={C.water} strokeWidth="18" fill="none" strokeDasharray="22 14" strokeDashoffset={-t * 5} />
    <rect x="-60" y="1300" width="1200" height="700" fill={C.hill3} filter="url(#wc)" />
    <path d={ridge(1300, 14, 2, 1)} fill={C.hill2} filter="url(#wc)" />
    <Mascot x={540} y={1640} s={1.6} t={t} expr="curious" armR="chin" armL="hip" lx={0} ly={2} />
    <Tomato x={170} y={1460} s={0.9} t={t} expr="surprised" look={[0, 0]} />
    <Lettuce x={910} y={1480} s={0.85} t={t} expr="smile" />
    <text x="760" y="1060" fontFamily={FONT} fontWeight="700" fontSize="120" fill={C.orange} stroke={INK} strokeWidth="5" paintOrder="stroke" transform={`rotate(${Math.sin(t / 10) * 8} 790 1020)`}>?</text>
  </Cam>
);

// ============================================================ 18 · outro / subscribe
export const S18: SceneFn = (t) => {
  const btn = backOut(pr(t, 40, 14));
  const press = t > 120 && t < 132 ? 0.92 : 1;
  const ring = t > 70 ? Math.sin(t * 1.3) * 14 * clamp(1 - ((t - 70) % 90) / 30) : 0;
  return (
    <g>
      <Farm t={t} />
      {Array.from({ length: 10 }, (_, i) => <Leaf key={i} x={(i * 113 + t * 1.5) % 1080} y={(i * 191 + t * 3) % 1900} rot={t * 2 + i * 40} c={i % 2 ? C.green : C.lime} s={0.8} />)}
      <Mascot x={540} y={1250} s={2.0} t={t} expr={t % 120 < 70 ? "talk" : "happy"} talk={talkOf(t)} armR="wave" armL={[60, 120]} />
      <WoodSign x={540} y={1180} w={820} h={250} rot={-1}>
        <text x="0" y="-10" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="96" fill="#fff" stroke="#3a2414" strokeWidth="8" paintOrder="stroke">Artof</text>
        <text x="0" y="84" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="96" fill={C.yellow} stroke="#3a2414" strokeWidth="8" paintOrder="stroke">Agriculture</text>
      </WoodSign>
      <g transform={`translate(450 1580) scale(${btn * press})`}>
        <rect x="-170" y="-50" width="340" height="100" rx="26" fill="#e62117" stroke={INK} strokeWidth="5" filter="url(#wob)" />
        <rect x="-140" y="-22" width="62" height="44" rx="12" fill="#fff" />
        <path d="M -118 -12 L -96 0 L -118 12 Z" fill="#e62117" />
        <text x="40" y="16" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="46" fill="#fff">Subscribe</text>
      </g>
      <g transform={`translate(720 1580) scale(${btn}) rotate(${ring})`} filter="url(#wob)">
        <path d="M -30 20 Q -30 -34 0 -38 Q 30 -34 30 20 L 38 30 L -38 30 Z" fill="#ffd93d" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="0" cy="38" r="9" fill="#ffd93d" stroke={INK} strokeWidth="4" />
      </g>
      {Array.from({ length: 5 }, (_, i) => <Sparkle key={i} x={[180, 900, 140, 940, 540][i]} y={[700, 640, 1100, 1060, 380][i]} s={0.7} t={t + i * 13} />)}
    </g>
  );
};

export const SCENE_FNS = [S1, S2, S3, S4, S5, S6, S7, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18];
