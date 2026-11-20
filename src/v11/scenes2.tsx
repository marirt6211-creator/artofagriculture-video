// v11 scenes, version 2: cinematic storybook. Each scene = one full 1080×1920 SVG frame at local frame t.
import React from "react";
import {
  C, INK, FONT, HAND, clamp, mix, ease, backOut, pr, rng, blob, ridge,
  Mascot, Face, PExpr, Lettuce, Tomato, Cucumber, Strawberry, Basil, Mint, Spinach, Pepper,
  Roots, NetPot, Bubbles, Particle, Tank, WoodSign, Leaf, Sparkle, Bubble,
} from "./art";
import {
  GodRays, Vignette, Glow, Tint, Bokeh, FgLeaves, Limbs, ARMS, ChefHat, Glasses, Napkin, Towel,
  Droplet, Coconut, PerliteBud, BulbBuddy, O2Buddy, NutriBuddy, Flower, Butterfly, Bush, MiniHead,
  GardenBG, GHInterior, Underwater, CityGolden, Stage, HomeEvening, NightLED, FutureCity,
} from "./art2";

export type SceneFn = (t: number, D: number) => React.ReactNode;
type ArmA = [number, number];
const Cam: React.FC<{ z?: number; x?: number; y?: number; r?: number; children: React.ReactNode }> = ({ z = 1, x = 0, y = 0, r = 0, children }) => (
  <g transform={`translate(${540 + x} ${960 + y}) rotate(${r}) scale(${z}) translate(-540 -960)`}>{children}</g>
);
// set by the film for the shot being drawn: lip-sync envelope + word cues (local frames)
export const LIVE: { talk: ((t: number) => number) | null; cue: ((w: string) => number | undefined) | null } = { talk: null, cue: null };
const talkOf = (t: number) => LIVE.talk ? LIVE.talk(t) : clamp(0.5 + 0.5 * Math.sin(t * 0.9) * Math.sin(t * 0.37 + 1));
const cw = (w: string, fb: number) => { const v = LIVE.cue?.(w); return v === undefined ? fb : v; };
const Blur: React.FC<{ id?: string; children: React.ReactNode }> = ({ id = "b3", children }) => <g filter={`url(#${id})`}>{children}</g>;

// ---- plant character with arms and legs
type Kind = "lettuce" | "tomato" | "cucumber" | "strawberry" | "basil" | "mint" | "spinach" | "pepper";
const RIG: Record<Kind, { w: number; armY: number; legY: number; c: string; P: React.FC<any> }> = {
  lettuce: { w: 64, armY: -46, legY: -6, c: "#4f9a2a", P: Lettuce },
  tomato: { w: 60, armY: 4, legY: 48, c: "#3f8f2f", P: Tomato },
  cucumber: { w: 40, armY: -84, legY: 4, c: "#2f6e25", P: Cucumber },
  strawberry: { w: 44, armY: -6, legY: 50, c: "#3f8f2f", P: Strawberry },
  basil: { w: 46, armY: -120, legY: 0, c: "#2f7a2f", P: Basil },
  mint: { w: 40, armY: -110, legY: 0, c: "#3f8f4a", P: Mint },
  spinach: { w: 46, armY: -110, legY: 0, c: "#256b2f", P: Spinach },
  pepper: { w: 58, armY: 6, legY: 56, c: "#3f8f2f", P: Pepper },
};
const Cast: React.FC<{ k: Kind; x: number; y: number; s?: number; expr?: PExpr; t?: number; aL?: ArmA; aR?: ArmA; walk?: number; look?: [number, number]; rot?: number; noLegs?: boolean; propR?: React.ReactNode; propL?: React.ReactNode; acc?: React.ReactNode; color?: string }> =
  ({ k, x, y, s = 1, expr, t = 0, aL = ARMS.rest, aR = ARMS.rest, walk, look, rot = 0, noLegs, propR, propL, acc, color }) => {
    const r = RIG[k];
    const P = r.P;
    return <Limbs x={x} y={y} s={s} w={r.w} armY={r.armY} legY={r.legY} aL={aL} aR={aR} c={r.c} walk={walk} rot={rot} noLegs={noLegs} propR={propR} propL={propL}>
      <P x={0} y={0} s={1} expr={expr} t={t} look={look} color={color} />
      {acc}
    </Limbs>;
  };

// ============================================================ 1 · HOOK — wide, morning garden, mascot strolls in
export const S1: SceneFn = (t) => {
  const walkIn = ease(pr(t, 0, 50));
  const q = backOut(pr(t, cw("question", 46) - 6, 14));
  return (
    <Cam z={mix(1.12, 1.0, ease(pr(t, 0, 90)))} y={mix(40, 0, ease(pr(t, 0, 90)))}>
      <GardenBG t={t} />
      <GodRays x={180} y={230} ang={-35} spread={60} n={8} o={0.4} t={t} w={80} />
      <Butterfly x={300} y={760} t={t} c="#ffb03a" s={0.9} />
      <Butterfly x={820} y={640} t={t + 40} c="#8fd3ff" s={0.7} />
      <Mascot x={mix(620, 540, walkIn)} y={mix(1180, 1300, walkIn)} s={mix(0.95, 1.2, walkIn)} t={t} walk={walkIn < 1 ? t / 3.5 : undefined}
        expr={walkIn < 1 ? "smile" : "talk"} talk={talkOf(t)} armR={walkIn < 1 ? "down" : "wave"} armL="hold"
        handPropL={<g transform="rotate(10)"><path d="M -30 -10 L 26 -10 L 20 40 L -24 40 Z" fill="#6fa8dc" stroke={INK} strokeWidth="3.5" /><path d="M 26 0 L 60 -26 L 66 -20 L 30 10" fill="#6fa8dc" stroke={INK} strokeWidth="3.5" /></g>} />
      <g transform={`translate(${mix(620, 540, walkIn) + 170} 620) scale(${q})`}>
        <Bubble x={0} y={0} w={170} h={150} tail={[-40, -1]}>
          <text x="0" y="38" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="120" fill={C.orange} stroke={INK} strokeWidth="5" paintOrder="stroke">?</text>
        </Bubble>
      </g>
      {/* foreground characters in the beds turn to look */}
      <Cast k="lettuce" x={150} y={1560} s={1.45} t={t} expr="surprised" look={[1, -0.5]} aL={ARMS.rest} aR={[70, 120]} noLegs />
      <Cast k="tomato" x={940} y={1500} s={1.25} t={t} expr="happy" look={[-1, -0.5]} aL={ARMS.wave} aR={ARMS.rest} noLegs />
      <Flower x={300} y={1640} s={1.6} c="#ff6b8a" t={t} /><Flower x={780} y={1650} s={1.5} c="#ffd23a" kind="tulip" t={t} />
      <FgLeaves side="l" y={1950} s={1.3} t={t} />
      <FgLeaves side="r" y={1980} s={1.2} t={t} />
      <Vignette o={0.6} />
    </Cam>
  );
};

// ============================================================ 2 · MEDIUM CLOSE-UP — soil slips through the mascot's fingers
export const S2: SceneFn = (t) => {
  const crumble = pr(t, cw("handful", 40), 60);
  const R = rng(4);
  const hand = { x: 760, y: 820 };
  return (
    <Cam z={mix(1.0, 1.05, ease(pr(t, 0, 150)))}>
      <Blur id="b8"><GardenBG t={t} hz={1000} path={false} /></Blur>
      <Bokeh n={18} t={t} area={[0, 100, 1080, 1100]} r={[25, 70]} o={0.6} />
      {/* jar with lettuce, sharp, mid-ground */}
      <g transform="translate(-40 0)">
        <rect x="720" y="1120" width="420" height="40" rx="10" fill={C.wood} stroke={INK} strokeWidth="5" />
        <Tank x={800} y={830} w={250} h={290} t={t} level={0.14} />
        <Roots x={925} y={850} len={230} t={t} n={9} />
        <Bubbles x={820} y={880} w={200} h={220} t={t} n={10} r={6} />
        <Cast k="lettuce" x={925} y={850} s={0.85} t={t} expr="happy" aL={ARMS.wave} aR={ARMS.rest} noLegs />
        <Sparkle x={1060} y={780} t={t} />
      </g>
      <Mascot x={360} y={1690} s={3.1} t={t} expr={t < cw("soil", 50) ? "talk" : "surprised"} talk={talkOf(t)} armL="down" armR={[78, 150]} lx={6}
        handProp={<g transform="translate(6 -12)"><path d={blob(0, -10, 30 * (1 - crumble * 0.5), 16 * (1 - crumble * 0.4), 6, 0.2)} fill={C.soil} stroke={INK} strokeWidth="2.5" />
          <g opacity={1 - crumble}><path d="M 4 -18 q 4 -14 11 -12 q 5 2 2 9" stroke="#e98fa0" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="14" cy="-30" r="1.4" fill={INK} /></g></g>} />
      {Array.from({ length: 22 }, (_, i) => {
        const p = clamp(crumble * 1.4 - R() * 0.4);
        return <circle key={i} cx={hand.x - 90 + R() * 120} cy={hand.y - 30 + p * p * 900} r={5 + R() * 9} fill={i % 3 ? C.soilD : C.soil} opacity={p > 0 && p < 1 ? 1 : 0} />;
      })}
      <Vignette o={0.7} />
    </Cam>
  );
};

// ============================================================ 3 · EXTREME CLOSE-UP, low angle — "where did my soil go?!"
export const S3: SceneFn = (t, D) => {
  const lookDown = t < cw("survive", D * 0.5);
  return (
    <Cam z={1.0} r={-3}>
      <Blur id="b8"><GHInterior t={t} vp={[540, 1100]} /></Blur>
      <Bokeh n={12} t={t} area={[0, 0, 1080, 900]} cols={["#fff6c4", "#ffffff"]} r={[30, 80]} o={0.5} />
      {/* raft + water below, low angle */}
      <rect x="-100" y="1240" width="1280" height="900" fill="url(#deepwater)" opacity="0.95" />
      <Roots x={520} y={1250} len={520} s={1.6} t={t} n={11} />
      <rect x="-100" y="1180" width="1280" height="80" fill="#f7f3e6" stroke={INK} strokeWidth="6" />
      <NetPot x={520} y={1190} s={1.7} />
      <Cast k="lettuce" x={520} y={1180} s={2.7} t={t} expr={lookDown ? "shock" : "confused"} look={lookDown ? [0, 1.6] : [0.2, 0]} rot={lookDown ? 6 : -4}
        aL={lookDown ? ARMS.cover : ARMS.scratch} aR={lookDown ? [100, 60] : ARMS.shrug} noLegs />
      {/* tomato behind leaps up in shock */}
      <Cast k="tomato" x={900} y={mix(800, 600, Math.abs(Math.sin(t / 8)))} s={1.1} t={t} expr="shock" aL={ARMS.up} aR={ARMS.up} />
      <text x="140" y="480" fontFamily={FONT} fontWeight="700" fontSize="150" fill={C.red} stroke={INK} strokeWidth="6" paintOrder="stroke" transform="rotate(-12 140 480)">!?</text>
      {!lookDown && <path d="M 700 560 Q 714 590 700 604 Q 686 590 700 560 Z" fill="#9fe3f5" stroke={INK} strokeWidth="4" />}
      <FgLeaves side="b" y={2020} s={1.4} t={t} c="#3f8f2f" blur="b20" />
      <Vignette o={0.7} />
    </Cam>
  );
};

// ============================================================ 4 · ACTION, dutch angle — tomato cannonballs out of its pot
export const S4: SceneFn = (t) => {
  const j0 = cw("attached", 34) - 10;
  const jump = pr(t, j0, 46);
  const jx = mix(260, 760, ease(jump)), jy = mix(1080, 1120, jump) - Math.sin(jump * Math.PI) * 520;
  const splash = pr(t, j0 + 44, 22);
  const R = rng(9);
  return (
    <Cam z={1.04} r={-7}>
      <GardenBG t={t} hz={900} path={false} gh={false} />
      <GodRays x={900} y={-100} ang={25} spread={30} n={5} o={0.35} t={t} />
      {/* fence + potting bench */}
      <g>
        {Array.from({ length: 12 }, (_, i) => <rect key={i} x={-60 + i * 100} y="900" width="70" height="300" rx="10" fill="#e8c999" stroke={INK} strokeWidth="4" />)}
        <rect x="-60" y="960" width="1240" height="26" fill="#d9b27e" stroke={INK} strokeWidth="4" />
      </g>
      <Bush x={120} y={1210} s={1.1} berries="#ff6b8a" />
      <Bush x={960} y={1190} s={0.9} />
      <rect x="-100" y="1200" width="1280" height="900" fill="#c49a63" />
      {/* clay pot (left) */}
      <g>
        <path d="M 140 1130 L 380 1130 L 350 1370 L 170 1370 Z" fill="#d0743d" stroke={INK} strokeWidth="5" />
        <rect x="126" y="1106" width="268" height="44" rx="10" fill="#e2884e" stroke={INK} strokeWidth="5" />
        <ellipse cx="260" cy="1116" rx="118" ry="16" fill={C.soilD} />
      </g>
      <Mascot x={900} y={1230} s={0.8} t={t} expr="laugh" armL={[30, -60]} armR={[30, -60]} tilt={-6} />
      {/* water trough (right) */}
      <g>
        <path d="M 560 1180 L 1040 1180 L 1000 1400 L 600 1400 Z" fill="#8fb3c4" stroke={INK} strokeWidth="5" />
        <ellipse cx="800" cy="1182" rx="240" ry="28" fill={C.water} stroke={INK} strokeWidth="5" />
      </g>
      {/* motion arc */}
      {jump > 0.05 && <path d={`M 260 1040 Q 510 ${1100 - 520 * 1.6} 760 1080`} stroke="#fff" strokeWidth="10" strokeDasharray="4 26" strokeLinecap="round" fill="none" opacity="0.9" />}
      {splash > 0 && Array.from({ length: 16 }, (_, i) => {
        const a = -Math.PI * (0.1 + 0.8 * (i / 15)); const d = splash * (140 + R() * 110);
        return <path key={i} d={blob(800 + Math.cos(a) * d, 1170 + Math.sin(a) * d + splash * splash * 160, 12 * (1 - splash) + 5, 16 * (1 - splash) + 6, 3, 0.1)} fill={C.waterL} stroke={C.waterD} strokeWidth="3" />;
      })}
      {jump > 0 && jump < 1 && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={jx + (R() - 0.5) * 220 * jump} cy={jy + 140 + R() * 120} r={5 + R() * 8} fill={C.soilD} />)}
      <g transform={`translate(${jx} ${jy}) rotate(${Math.sin(jump * Math.PI) * 25})`}>
        <Roots x={0} y={50} len={150} t={t} n={7} />
        <Cast k="tomato" x={0} y={0} s={1.6} t={t} expr={splash > 0 ? "laugh" : "mischief"} aL={ARMS.cheer} aR={ARMS.cheer} noLegs />
        {[0, 1, 2].map((i) => <line key={i} x1={-140 - i * 30} y1={-40 + i * 40} x2={-220 - i * 30} y2={-10 + i * 40} stroke="#fff" strokeWidth="8" strokeLinecap="round" />)}
      </g>
      <Vignette o={0.6} />
    </Cam>
  );
};

// ============================================================ 5 · REVEAL, over-the-shoulder — the hydroponic greenhouse
export const S5: SceneFn = (t) => {
  const sign = backOut(pr(t, cw("hydroponics", 22) - 14, 22));
  return (
    <Cam z={mix(1.0, 1.08, ease(pr(t, 0, 110)))} y={mix(0, 40, ease(pr(t, 0, 110)))}>
      <GHInterior t={t} vp={[540, 880]} />
      <Glow x={540} y={760} r={420} o={0.6} />
      {/* hanging title sign */}
      <g transform={`translate(0 ${(1 - sign) * -600})`}>
        <line x1="260" y1="-40" x2="300" y2="420" stroke="#6b4320" strokeWidth="5" /><line x1="820" y1="-40" x2="780" y2="420" stroke="#6b4320" strokeWidth="5" />
        <WoodSign x={540} y={470} w={860} h={190} rot={Math.sin(t / 12) * 2}>
          <text x="0" y="32" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="108" fill="#bff3ff" stroke="#14576a" strokeWidth="10" paintOrder="stroke">HYDROPONICS</text>
          {[-330, -120, 90, 300].map((x, i) => <path key={i} d="M 0 -14 Q 9 2 7 8 Q 5 16 0 16 Q -5 16 -7 8 Q -9 2 0 -14 Z" transform={`translate(${x} ${70 + ((t * 2 + i * 23) % 60)})`} fill="#59d0e6" stroke={INK} strokeWidth="2" />)}
        </WoodSign>
      </g>
      {/* plant characters waving from the channels */}
      <Cast k="strawberry" x={930} y={1080} s={0.95} t={t} expr="happy" aL={ARMS.wave} aR={ARMS.rest} noLegs />
      <Cast k="lettuce" x={150} y={1120} s={0.95} t={t} expr="happy" aR={ARMS.wave} noLegs />
      <Sparkle x={300} y={700} t={t} /><Sparkle x={820} y={760} t={t + 20} s={0.8} /><Sparkle x={560} y={640} t={t + 40} s={0.6} />
      {/* mascot from behind, big in the foreground */}
      <Mascot x={300} y={1790} s={2.1} t={t} back armL={[110, 120]} armR={[110, 120]} hatTilt={6} />
      <Tint c="#ffb347" o={0.25} />
      <Vignette o={0.55} />
    </Cam>
  );
};

// ============================================================ 6 · TWO-SHOT at the lab bench — Dr. Cucumber mixes the nutrient water
export const S6: SceneFn = (t) => {
  const pour = ease(pr(t, cw("special", 24) - 12, 30));
  const R = rng(21);
  return (
    <Cam z={mix(1.06, 1.0, ease(pr(t, 0, 200)))}>
      <Blur id="b8"><GHInterior t={t} vp={[540, 760]} /></Blur>
      <GodRays x={-100} y={-100} ang={-30} spread={25} n={5} o={0.35} t={t} />
      {/* bench */}
      <rect x="-100" y="1240" width="1280" height="60" fill={C.wood} stroke={INK} strokeWidth="5" />
      <rect x="-100" y="1300" width="1280" height="800" fill="#8f5a30" />
      {/* big reservoir */}
      <Tank x={280} y={880} w={520} h={360} t={t} level={0.12} />
      <rect x="290" y="900" width="500" height="30" rx="8" fill="#f7f3e6" stroke={INK} strokeWidth="4" />
      <Roots x={420} y={930} len={260} t={t} n={7} /><Roots x={660} y={930} len={240} t={t + 30} n={7} />
      {Array.from({ length: 20 }, (_, i) => {
        const p = clamp(pour * 1.3 - R() * 0.3), a = R() * Math.PI * 2, d = 60 + R() * 200;
        return <Particle key={i} i={i} x={540 + Math.cos(a + t / 30) * d * p} y={1060 + Math.sin(a + t / 30) * d * 0.5 * p} r={18} />;
      })}
      <Cast k="lettuce" x={420} y={905} s={0.75} t={t} expr="sip" noLegs />
      <Cast k="lettuce" x={660} y={905} s={0.7} t={t + 20} expr="love" aL={ARMS.cheer} noLegs />
      {/* Dr. Cucumber with lab coat + glasses, pouring */}
      <Cast k="cucumber" x={150} y={1230} s={1.6} t={t} expr="serious" aL={ARMS.rest} aR={[110, mix(150, 60, pour)]}
        acc={<g><path d="M -46 -100 L 46 -100 L 52 12 L -52 12 Z" fill="#fff" stroke={INK} strokeWidth="4" /><path d="M -14 -100 L 0 -60 L 14 -100" fill="none" stroke={INK} strokeWidth="3" /><rect x="14" y="-70" width="22" height="18" fill="none" stroke="#88a" strokeWidth="2.5" /><Glasses x={0} y={-110} k={0.85} /></g>}
        propR={<g transform={`rotate(${mix(0, 110, pour)})`}><rect x="-22" y="-80" width="44" height="80" rx="10" fill="#fffdf4" stroke={INK} strokeWidth="4" /><rect x="-10" y="-96" width="20" height="18" rx="4" fill={C.green} stroke={INK} strokeWidth="3" /><rect x="-18" y="-56" width="36" height="30" rx="5" fill={C.lime} /></g>} />
      {pour > 0.5 && Array.from({ length: 6 }, (_, i) => <Particle key={"p" + i} i={i + 2} x={340 + Math.sin(t + i) * 8} y={760 + ((t * 8 + i * 28) % 170)} r={12} />)}
      {/* mascot leaning in, curious */}
      <Mascot x={900} y={1700} s={1.75} t={t} expr="curious" armR="chin" armL="hip" lx={-8} ly={2} tilt={-6} />
      <Vignette o={0.6} />
    </Cam>
  );
};

// ============================================================ 7a · MACRO JOURNEY underwater — nutrients swim to the roots
export const S7a: SceneFn = (t) => {
  const R = rng(5);
  return (
    <Cam z={mix(1.12, 1.0, ease(pr(t, 0, 120)))} y={mix(-80, 0, ease(pr(t, 0, 120)))}>
      <Underwater t={t} />
      <Roots x={540} y={180} len={1000} s={2.2} t={t} n={11} />
      <Bubbles x={60} y={200} w={960} h={1200} t={t} n={26} seed={7} r={14} />
      {/* a stream of nutrient buddies swimming towards the roots */}
      {[0, 1, 2, 3, 4].map((i) => {
        const p = (t * 0.008 + i * 0.2) % 1;
        const x = mix(1100, 560, p) + Math.sin(p * 9 + i) * 60, y = mix(1300, 760, p) - i * 30;
        return <g key={i}>
          <path d={`M ${x + 40} ${y + 10} q 60 10 120 40`} stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.5" fill="none" />
          <NutriBuddy x={x} y={y} s={0.75 - p * 0.2} i={i} t={t} expr={p > 0.75 ? "love" : "happy"} aL={ARMS.out} aR={ARMS.out} />
        </g>;
      })}
      {/* roots that just absorbed something glow */}
      <circle cx="560" cy="700" r="90" fill="url(#warmglow)" opacity={0.5 + 0.3 * Math.sin(t / 6)} style={{ mixBlendMode: "screen" }} />
      <Face x={560} y={600} k={1.1} expr="sip" />
      <Face x={330} y={860} k={0.9} expr="happy" />
      {Array.from({ length: 10 }, (_, i) => <Particle key={i} i={i} x={R() * 1080} y={900 + R() * 600 + Math.sin(t / 15 + i) * 20} r={10 + R() * 8} />)}
      <Vignette o={0.8} />
    </Cam>
  );
};

// ============================================================ 7b · CLOSE-UP on the shelf — coconut coir & perlite
export const S7b: SceneFn = (t) => (
  <Cam z={mix(1.0, 1.06, ease(pr(t, 0, 120)))}>
    <rect x="-100" y="-100" width="1280" height="2200" fill="#f1dcb4" />
    {/* window with garden outside */}
    <g><rect x="560" y="140" width="460" height="560" rx="16" fill="url(#morning)" stroke={INK} strokeWidth="8" /><path d="M 790 140 L 790 700 M 560 420 L 1020 420" stroke={INK} strokeWidth="7" /></g>
    <Blur><Bush x={640} y={700} s={0.9} /><Bush x={900} y={700} s={0.8} berries="#ff6b8a" /></Blur>
    <GodRays x={800} y={300} ang={40} spread={20} n={5} o={0.55} t={t} w={110} />
    {/* shelf */}
    <rect x="-100" y="1180" width="1280" height="40" fill={C.wood} stroke={INK} strokeWidth="5" />
    <rect x="-100" y="1220" width="1280" height="900" fill="#d9b88a" />
    {/* coir pot + coconut */}
    <NetPot x={280} y={1040} s={2.0} fill="coir" />
    <Cast k="basil" x={280} y={1030} s={1.3} t={t} expr="happy" aL={ARMS.wave} noLegs />
    <Coconut x={530} y={1080} s={0.95} t={t} expr="proud" aL={[70, 80]} aR={ARMS.hips} />
    {/* perlite pot + popcorn buddies */}
    <NetPot x={810} y={1040} s={2.0} fill="perlite" />
    <Cast k="mint" x={810} y={1030} s={1.35} t={t} expr="wink" aR={ARMS.wave} noLegs />
    {[0, 1, 2].map((i) => <PerliteBud key={i} x={700 + i * 110} y={1250 - (i % 2) * 20} s={0.7} t={t} seed={i * 3} expr={i % 2 ? "laugh" : "happy"} />)}
    {/* chalk-style labels */}
    {[[280, "coconut coir"], [810, "perlite"]].map(([x, l]) => <g key={l as string} transform={`translate(${x} 720) rotate(${Math.sin(t / 12) * 3})`}><line x1="0" y1="-120" x2="0" y2="-40" stroke="#6b4320" strokeWidth="3" /><rect x="-130" y="-40" width="260" height="70" rx="12" fill="#fffdf4" stroke={INK} strokeWidth="4" /><text y="14" textAnchor="middle" fontFamily={HAND} fontSize="46" fill="#5e3a1f">{l as string}</text></g>)}
    {/* over-the-shoulder: mascot's hat + pointing hand, out of focus */}
    <Blur id="b3"><Mascot x={-80} y={2720} s={3.4} t={t} back armR={[100, 110]} armL="down" /></Blur>
    <Vignette o={0.6} />
  </Cam>
);

// ============================================================ 8 · HERO LOW ANGLE — "so cool" (sunglasses)
export const S8: SceneFn = (t) => {
  const g = ease(pr(t, cw("cool", 38) - 10, 14));
  return (
    <Cam z={mix(1.0, 1.1, ease(pr(t, 0, 90)))} r={4}>
      <Blur id="b8"><GHInterior t={t} vp={[540, 1300]} /></Blur>
      <GodRays x={540} y={-200} ang={0} spread={70} n={9} o={0.5} t={t} w={90} />
      <Mascot x={850} y={1080} s={0.95} t={t} expr="curious" armR="chin" armL="hip" lx={-6} />
      <Cast k="lettuce" x={170} y={1120} s={1.0} t={t} expr="surprised" look={[1, 0.3]} rot={10} noLegs />
      <Cast k="tomato" x={540} y={1140} s={2.6} t={t} expr={g > 0.9 ? "cool" : "mischief"} aL={[150, mix(60, 175, g)]} aR={[150, mix(60, 175, g)]} />
      {g < 0.95 && <g transform={`translate(540 ${mix(780, 1120, g)})`}><path d="M -110 0 L 110 0 L 100 34 Q 60 52 10 36 L 0 20 L -10 36 Q -60 52 -100 34 Z" fill="#1b1b22" stroke={INK} strokeWidth="4" /></g>}
      {g > 0.9 && <Sparkle x={680} y={1060} s={1.4} t={t} c="#fff" />}
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={540 + Math.cos(i) * 360} y1={1100 + Math.sin(i) * 360} x2={540 + Math.cos(i) * 430} y2={1100 + Math.sin(i) * 430} stroke="#fff6c4" strokeWidth="10" strokeLinecap="round" opacity={g} />)}
      <Vignette o={0.7} />
    </Cam>
  );
};

// ============================================================ 9 · ROLLER-COASTER PIPE — water is collected, recycled, used again
const tubePt = (u: number): [number, number] => {
  const w = clamp((u - 0.25) / 0.4), L = 210 * (1 - u * 0.5);
  return [mix(880, 540, u) - L * Math.sin(2 * Math.PI * w), mix(1380, 820, ease(u)) - L * (1 - Math.cos(2 * Math.PI * w))];
};
export const S9: SceneFn = (t) => {
  const pts = Array.from({ length: 121 }, (_, i) => tubePt(i / 120));
  const d = "M " + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L ");
  const rider = (t * 0.006) % 1;
  const [rx, ry] = tubePt(rider);
  return (
    <Cam z={mix(1.05, 1.0, ease(pr(t, 0, 240)))}>
      <GHInterior t={t} vp={[540, 820]} />
      {/* return pipe from far end down to the reservoir (recycling) */}
      <path d="M 540 820 C 160 840 60 1300 240 1540 L 700 1540" stroke={INK} strokeWidth="34" fill="none" opacity="0.85" />
      <path d="M 540 820 C 160 840 60 1300 240 1540 L 700 1540" stroke="#bff3ff" strokeWidth="24" fill="none" />
      <path d="M 540 820 C 160 840 60 1300 240 1540 L 700 1540" stroke={C.water} strokeWidth="10" fill="none" strokeDasharray="24 18" strokeDashoffset={-t * 5} />
      {/* transparent coaster tube */}
      <path d={d} stroke={INK} strokeWidth="76" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <path d={d} stroke="#dff9ff" strokeWidth="64" fill="none" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />
      <path d={d} stroke={C.water} strokeWidth="22" fill="none" strokeLinejoin="round" strokeDasharray="34 22" strokeDashoffset={-t * 7} />
      <path d={d} stroke="#fff" strokeWidth="8" fill="none" opacity="0.7" transform="translate(-10 -16)" />
      {[0.1, 0.22, 0.5, 0.78].map((u, i) => { const [x, y] = tubePt((u + rider * 0.3) % 1); return <Droplet key={i} x={x} y={y - 10} s={0.45} t={t + i * 10} expr="happy" aL={ARMS.up} aR={ARMS.up} />; })}
      <Droplet x={rx} y={ry - 20} s={0.8} t={t} expr="laugh" aL={ARMS.up} aR={ARMS.cheer} />
      {/* reservoir + pump, bottom left */}
      <Tank x={680} y={1380} w={380} h={240} t={t} level={0.25} />
      <g><rect x="930" y="1400" width="110" height="80" rx="16" fill="#5d6b72" stroke={INK} strokeWidth="5" /><circle cx="985" cy="1440" r="22" fill="#8a9aa2" stroke={INK} strokeWidth="4" /><path d="M 973 1440 L 997 1440 M 985 1428 L 985 1452" stroke={INK} strokeWidth="4" transform={`rotate(${t * 10} 985 1440)`} /></g>
      <g transform={`translate(300 1660) rotate(${t * 2})`}><circle r="52" fill="#fff" stroke={INK} strokeWidth="5" /><text y="22" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="62" fill={C.green}>♻</text></g>
      <Mascot x={170} y={1250} s={0.95} t={t} expr="wink" armR="thumb" armL="hip" lx={6} />
      <Vignette o={0.55} />
    </Cam>
  );
};

// ============================================================ 10 · WIDE, warm bistro — Chef Tomato's perfect recipes
export const S10: SceneFn = (t) => {
  const ladle = Math.sin(t / 8) * 10;
  return (
    <Cam z={mix(1.0, 1.06, ease(pr(t, 0, 240)))}>
      <Blur id="b8"><GHInterior t={t} vp={[540, 700]} warm={1.3} /></Blur>
      <Tint c="#ff9a3c" o={0.35} />
      {/* string lights */}
      {[0, 1].map((k) => <g key={k}>
        <path d={`M -40 ${260 + k * 180} Q 540 ${420 + k * 180} 1120 ${260 + k * 180}`} stroke="#4a3a2a" strokeWidth="3" fill="none" />
        {Array.from({ length: 12 }, (_, i) => { const u = i / 11; const x = mix(-40, 1120, u), y = (1 - u) * (1 - u) * (260 + k * 180) + 2 * u * (1 - u) * (420 + k * 180) + u * u * (260 + k * 180); return <g key={i}><circle cx={x} cy={y + 14} r="24" fill="url(#warmglow)" /><circle cx={x} cy={y + 14} r="9" fill="#fff3a0" stroke={INK} strokeWidth="2" /></g>; })}
      </g>)}
      {/* chef behind the table */}
      <Cast k="tomato" x={540} y={830} s={1.55} t={t} expr="proud" aL={[60, 150]} aR={[80, 100 + ladle]}
        acc={<ChefHat x={0} y={-50} s={0.9} />}
        propR={<g transform={`rotate(${40 + ladle})`}><line x1="0" y1="0" x2="0" y2="80" stroke="#999" strokeWidth="8" strokeLinecap="round" /><path d="M -26 80 Q 0 116 26 80 Z" fill="#bbb" stroke={INK} strokeWidth="4" /></g>} />
      {/* table in perspective */}
      <path d="M 160 1000 L 920 1000 L 1180 1500 L -100 1500 Z" fill="#fff6e6" stroke={INK} strokeWidth="5" />
      <path d="M 160 1000 L -100 1500 M 920 1000 L 1180 1500" stroke="#e8c48f" strokeWidth="8" />
      <rect x="-100" y="1500" width="1280" height="600" fill="#9a5a2e" />
      {/* diners on the sides, each with a different soup */}
      {[[110, 1180, "lettuce", "#9be15d", "love"], [960, 1180, "basil", "#ffb35c", "happy"], [230, 1460, "strawberry", "#ff8fb3", "laugh"], [860, 1460, "pepper", "#7fd3ff", "happy"]].map(([x, y, k, soup, e], i) => (
        <g key={i}>
          <Cast k={k as Kind} x={x as number} y={(y as number) - 40} s={k === "basil" ? 0.8 : 0.9} t={t + i * 9} expr={e as PExpr} noLegs aL={i % 2 ? ARMS.rest : ARMS.cheer} />
          <Napkin x={x as number} y={(y as number) - (k === "basil" ? 140 : k === "lettuce" ? 90 : 30)} s={0.8} />
          <g transform={`translate(${(x as number) + (i % 2 ? -150 : 150)} ${y})`}>
            <ellipse rx="80" ry="24" fill="#fff" stroke={INK} strokeWidth="4" /><ellipse rx="56" ry="14" fill={soup as string} />
            <path d="M -20 -30 q 10 -20 0 -40 M 12 -30 q 10 -20 0 -40" stroke="#fff" strokeWidth="5" opacity="0.7" fill="none" strokeLinecap="round" />
          </g>
          <g transform={`translate(${(x as number) + (i % 2 ? -150 : 150)} ${(y as number) + 50}) rotate(${i % 2 ? 4 : -4})`}><rect x="-50" y="-16" width="100" height="32" rx="4" fill="#fffdf4" stroke={INK} strokeWidth="2.5" /><text y="8" textAnchor="middle" fontFamily={HAND} fontSize="22" fill={C.redD}>{["N+K", "N+Mg", "P+K", "Ca+K"][i]}</text></g>
        </g>
      ))}
      <Mascot x={540} y={1820} s={1.0} t={t} expr="happy" armR={[60, 150]} armL={[60, 150]}
        handProp={<g transform="rotate(-10)"><rect x="-40" y="-90" width="80" height="100" rx="8" fill="#fffdf4" stroke={INK} strokeWidth="3.5" /><text x="0" y="-60" textAnchor="middle" fontFamily={HAND} fontSize="20" fill={C.redD}>recipe</text><path d="M -26 -40 h 52 M -26 -24 h 40 M -26 -8 h 46" stroke="#999" strokeWidth="3" /></g>} />
      <Vignette o={0.7} />
    </Cam>
  );
};

// ============================================================ 11 · GOLDEN HOUR balcony — farms on rooftops and balconies
export const S11: SceneFn = (t) => (
  <Cam z={mix(1.08, 1.0, ease(pr(t, 0, 220)))} x={mix(-30, 0, ease(pr(t, 0, 220)))}>
    <CityGolden t={t} />
    {/* neighbour balcony with planters */}
    <g><rect x="-40" y="1040" width="330" height="26" fill="#d9c7b0" stroke={INK} strokeWidth="4" />{[0, 1, 2].map((i) => <rect key={i} x={10 + i * 95} y="990" width="80" height="50" rx="8" fill="#fff" stroke={INK} strokeWidth="3" />)}</g>
    {[50, 145, 240].map((x, i) => <MiniHead key={x} x={x} y={985} s={0.8} c={i % 2 ? "#5fb33a" : "#8fd14f"} />)}
    {/* our balcony: tower garden */}
    <g transform="translate(860 1420)">
      <rect x="-34" y="-900" width="68" height="900" rx="30" fill="url(#pipe)" stroke={INK} strokeWidth="5" />
      {Array.from({ length: 7 }, (_, i) => {
        const y = -110 - i * 118, sd = i % 2 ? 1 : -1;
        const ks: Kind[] = ["lettuce", "strawberry", "basil", "mint", "pepper", "spinach", "strawberry"];
        return <g key={i}><path d={`M ${sd * 28} ${y} l ${sd * 48} -30 l ${sd * 10} 40 Z`} fill="#fff" stroke={INK} strokeWidth="4" />
          <Cast k={ks[i]} x={sd * 96} y={y + 6} s={0.5} t={t + i * 11} expr={(["happy", "smile", "wink", "laugh"] as const)[i % 4]} aR={i === 1 ? ARMS.wave : ARMS.rest} aL={i === 4 ? ARMS.wave : ARMS.rest} noLegs /></g>;
      })}
    </g>
    {/* railing */}
    <rect x="-60" y="1370" width="1200" height="20" fill="#3a3a44" />
    {Array.from({ length: 18 }, (_, i) => <rect key={i} x={i * 66} y="1380" width="10" height="300" fill="#3a3a44" />)}
    <rect x="-60" y="1660" width="1200" height="400" fill="#c9a98a" />
    {/* pigeon on the rail */}
    <g transform="translate(140 1370)"><ellipse cx="0" cy="-26" rx="34" ry="24" fill="#9aa3b5" stroke={INK} strokeWidth="3" /><circle cx="26" cy="-50" r="14" fill="#9aa3b5" stroke={INK} strokeWidth="3" /><circle cx="30" cy="-52" r="2.5" fill={INK} /><path d="M 38 -48 l 10 3 l -10 3" fill="#e8a33a" /></g>
    <Mascot x={470} y={1660} s={1.5} t={t} expr="talk" talk={talkOf(t)} armL={[100, 95]} armR="hip" lx={-10} ly={-3} />
    <Vignette o={0.55} />
  </Cam>
);

// ============================================================ 12 · STAGE — "what can we grow? quite a lot!"
export const S12: SceneFn = (t) => {
  const open = ease(pr(t, cw("quite", 40) - 8, 30));
  return (
    <Cam z={mix(1.0, 1.06, ease(pr(t, 0, 120)))}>
      <Stage t={t} open={open * 0.35} />
      {/* glowing eyes peeking through the gap */}
      {[[480, 760], [600, 700], [540, 900], [630, 1000]].map(([x, y], i) => <g key={i} opacity={0.3 + open}><ellipse cx={x - 14} cy={y} rx="11" ry="14" fill="#fff" stroke={INK} strokeWidth="2.5" /><ellipse cx={x + 14} cy={y} rx="11" ry="14" fill="#fff" stroke={INK} strokeWidth="2.5" /><circle cx={x - 12} cy={y + 2} r="5" fill={INK} /><circle cx={x + 16} cy={y + 2} r="5" fill={INK} /></g>)}
      {/* rope */}
      <path d="M 260 190 Q 250 600 230 1000" stroke="#d9b27e" strokeWidth="10" fill="none" />
      <circle cx="232" cy="1010" r="20" fill="#e8c48f" stroke={INK} strokeWidth="4" />
      <Mascot x={260} y={1560} s={1.6} t={t} expr="happy" armL={[150, 170]} armR={[95, 110]} tilt={-8} />
      <Vignette o={0.6} />
    </Cam>
  );
};

// ============================================================ 13 · THE BIG SHOW — every crop gets its entrance
const CROPS: { k: Kind; name: string; x: number; y: number; s: number; e: PExpr; aL: ArmA; aR: ArmA; color?: string }[] = [
  { k: "lettuce", name: "Lettuce", x: 190, y: 820, s: 1.0, e: "happy", aL: ARMS.cheer, aR: ARMS.wave },
  { k: "spinach", name: "Spinach", x: 420, y: 860, s: 0.95, e: "proud", aL: ARMS.up, aR: ARMS.up },
  { k: "basil", name: "Basil", x: 650, y: 860, s: 0.9, e: "laugh", aL: ARMS.out, aR: ARMS.cheer },
  { k: "mint", name: "Mint", x: 880, y: 860, s: 0.95, e: "wink", aL: ARMS.hips, aR: ARMS.wave },
  { k: "tomato", name: "Tomatoes", x: 170, y: 1170, s: 1.05, e: "mischief", aL: ARMS.up, aR: ARMS.up },
  { k: "cucumber", name: "Cucumbers", x: 400, y: 1180, s: 0.85, e: "serious", aL: ARMS.rest, aR: ARMS.point },
  { k: "pepper", name: "Bell peppers", x: 640, y: 1170, s: 0.95, e: "happy", aL: ARMS.wave, aR: ARMS.rest, color: "#e8412f" },
  { k: "strawberry", name: "Strawberries", x: 900, y: 1180, s: 1.0, e: "laugh", aL: ARMS.cheer, aR: ARMS.cheer },
];
export const S13: SceneFn = (t, D) => (
  <Cam z={mix(1.04, 1.0, ease(pr(t, 0, D)))}>
    <Stage t={t} open={1} />
    {/* risers */}
    <path d="M 60 980 L 1020 980 L 1040 1010 L 40 1010 Z" fill="#7a4a26" stroke={INK} strokeWidth="4" />
    {CROPS.map((c, i) => {
      const sc = backOut(pr(t, cw(c.name.split(" ")[0].toLowerCase(), 4 + i * (D - 40) / 8) - 5, 12));
      return <g key={c.name} transform={`translate(${c.x} ${c.y}) scale(${sc}) translate(${-c.x} ${-c.y})`}>
        <circle cx={c.x} cy={c.y - 60} r="140" fill="url(#warmglow)" opacity="0.5" />
        <Cast k={c.k} x={c.x} y={c.y - (c.k === "tomato" || c.k === "pepper" || c.k === "strawberry" ? 50 : 0)} s={c.s} t={t + i * 7} expr={c.e} aL={c.aL} aR={c.aR} color={c.color}
          acc={c.k === "cucumber" ? <Glasses x={0} y={-112} k={0.75} /> : undefined} />
        {c.k === "pepper" && <><Cast k="pepper" x={c.x - 70} y={c.y - 10} s={0.6} t={t} expr="happy" color="#f7b52a" noLegs /><Cast k="pepper" x={c.x + 70} y={c.y - 10} s={0.6} t={t + 5} expr="wink" color="#4fa83a" noLegs /></>}
        {c.k === "strawberry" && <><Cast k="strawberry" x={c.x - 80} y={c.y - 20} s={0.6} t={t + 9} expr="happy" noLegs aL={ARMS.cheer} /><Cast k="strawberry" x={c.x + 70} y={c.y - 10} s={0.55} t={t + 19} expr="love" noLegs aR={ARMS.cheer} /></>}
        {c.k === "tomato" && [0, 1, 2].map((j) => <circle key={j} cx={c.x + Math.cos(t / 5 + j * 2.1) * 70} cy={c.y - 150 + Math.sin(t / 5 + j * 2.1) * 20} r="16" fill={C.red} stroke={INK} strokeWidth="3" />)}
        <g transform={`translate(${c.x} ${c.y + 105})`}><rect x={-c.name.length * 11 - 18} y="-24" width={c.name.length * 22 + 36} height="46" rx="10" fill="#3b1f2b" stroke="#ffd166" strokeWidth="4" /><text y="12" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="30" fill="#ffe9a8">{c.name}</text></g>
      </g>;
    })}
    {Array.from({ length: 30 }, (_, i) => { const R = rng(i + 1); return <rect key={i} x={R() * 1080} y={((R() * 1400 + t * (3 + R() * 3)) % 1400)} width="12" height="18" fill={[C.red, C.yellow, C.green, "#59d0e6", "#ff6b8a"][i % 5]} transform={`rotate(${t * 4 + i * 30} ${R() * 1080} 600)`} opacity="0.85" />; })}
  </Cam>
);

// ============================================================ 14 · OVER-THE-SHOULDER at dinner — the lettuce that never touched soil
export const S14: SceneFn = (t) => (
  <Cam z={mix(1.0, 1.07, ease(pr(t, 0, 240)))}>
    <HomeEvening t={t} />
    {/* thought bubble flashback */}
    <Bubble x={640} y={430} w={600} h={400} tail={[-110, 1]} thought>
      <rect x="-260" y="-200" width="520" height="400" rx="190" fill="#dff3ea" opacity="0.9" />
      <rect x="-250" y="30" width="500" height="60" rx="30" fill="url(#pipe)" stroke={INK} strokeWidth="4" />
      <path d="M -230 78 L 230 78" stroke={C.water} strokeWidth="12" strokeDasharray="20 14" strokeDashoffset={-t * 4} />
      <Cast k="lettuce" x={-70} y={30} s={0.55} t={t} expr="happy" noLegs aL={ARMS.wave} />
      <Cast k="lettuce" x={110} y={30} s={0.45} t={t + 9} expr="smile" noLegs />
      <g transform="translate(150 -110) rotate(8)"><rect x="-90" y="-30" width="180" height="60" rx="8" fill={C.soil} stroke={INK} strokeWidth="3" /><text y="10" textAnchor="middle" fontFamily={HAND} fontSize="34" fill="#fff">soil? never!</text></g>
    </Bubble>
    {/* bowl */}
    <g>
      <path d="M 300 1080 Q 560 1360 820 1080 Z" fill="#fff" stroke={INK} strokeWidth="6" />
      <path d="M 330 1130 Q 560 1260 790 1130" stroke="#6fa8dc" strokeWidth="10" fill="none" />
      <ellipse cx="560" cy="1082" rx="262" ry="38" fill="#f3f0e6" stroke={INK} strokeWidth="5" />
    </g>
    {[[400, 1060, C.red], [720, 1050, C.red], [470, 1020, "#f7b52a"], [660, 1024, "#4f9a3a"], [600, 1060, "#e8412f"]].map(([x, y, c], i) => <circle key={i} cx={x as number} cy={y as number} r="30" fill={c as string} stroke={INK} strokeWidth="4" />)}
    <Cast k="lettuce" x={560} y={1040} s={1.2} t={t} expr="proud" aL={ARMS.hips} aR={[120, 160]} noLegs />
    <Sparkle x={700} y={860} t={t} s={0.9} c="#fff" /><Sparkle x={420} y={880} t={t + 30} s={0.7} c="#fff" />
    {/* mascot from behind with a fork, foreground */}
    <Mascot x={170} y={2150} s={2.6} t={t} back armR={[70, 110]} armL="down"
      handProp={<g transform="rotate(-50)"><rect x="-5" y="0" width="10" height="110" rx="5" fill="#c9cfd2" stroke={INK} strokeWidth="3" /><path d="M -16 0 L -16 -40 M -5 0 L -5 -42 M 5 0 L 5 -42 M 16 0 L 16 -40 M -16 0 Q 0 14 16 0" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" /></g>} />
    <Vignette o={0.65} />
  </Cam>
);

// ============================================================ 15 · NIGHT, LED glow — still needs water, light, oxygen, nutrients
export const S15: SceneFn = (t, D) => {
  const WORDS4 = ["water", "light", "oxygen", "nutrients"];
  const on = (i: number) => backOut(pr(t, cw(WORDS4[i], 6 + i * (D * 0.55) / 4) - 5, 14));
  return (
    <Cam z={mix(1.08, 1.0, ease(pr(t, 0, D)))}>
      <NightLED t={t} />
      <Glow x={540} y={1000} r={380} o={0.5} />
      <Tank x={380} y={1080} w={320} h={240} t={t} level={0.16} />
      <Roots x={540} y={1070} len={200} t={t} n={9} />
      <Bubbles x={410} y={1120} w={260} h={190} t={t} n={10} r={7} />
      <NetPot x={540} y={1060} s={0.9} />
      <Cast k="basil" x={540} y={1050} s={1.45} t={t} expr="love" aL={ARMS.cheer} aR={ARMS.cheer} noLegs />
      {/* the four helpers dance in a ring around the basil */}
      <g transform={`translate(240 ${1240 + Math.sin(t / 8) * 10}) scale(${on(0)})`}><Droplet x={0} y={0} s={1.05} t={t} expr="happy" aR={ARMS.out} aL={ARMS.wave} /></g>
      <g transform={`translate(800 ${680 + Math.sin(t / 8 + 1) * 10}) scale(${on(1)})`}><BulbBuddy x={0} y={0} s={1.0} t={t} expr="laugh" /></g>
      <g transform={`translate(240 ${700 + Math.sin(t / 8 + 2) * 10}) scale(${on(2)})`}><O2Buddy x={0} y={0} s={1.05} t={t} expr="happy" aL={ARMS.cheer} aR={ARMS.out} /></g>
      <g transform={`translate(840 ${1250 + Math.sin(t / 8 + 3) * 10}) scale(${on(3)})`}><NutriBuddy x={0} y={0} s={1.1} t={t} i={0} expr="wink" aL={ARMS.out} aR={ARMS.wave} /></g>
      {[[240, 1080, "water"], [800, 520, "light"], [240, 560, "oxygen"], [840, 1090, "nutrients"]].map(([x, y, l], i) => <g key={i} opacity={pr(t, cw(WORDS4[i], 14 + i * (D * 0.55) / 4) + 4, 8)}><text x={x as number} y={(y as number) - 30} textAnchor="middle" fontFamily={HAND} fontSize="44" fill="#fff6c4">{l as string} ✓</text></g>)}
      <Bubbles x={0} y={300} w={1080} h={1000} t={t} n={14} seed={9} r={6} />
      <Vignette o={0.7} />
    </Cam>
  );
};

// ============================================================ 16 · COMEDY — "not farming without effort!"
export const S16: SceneFn = (t) => {
  const jit = Math.sin(t * 1.7) * 3;
  return (
    <Cam z={1.04} r={2}>
      <Blur id="b8"><GHInterior t={t} vp={[540, 800]} /></Blur>
      {/* mascot juggling chores */}
      <g transform={`translate(${jit} 0)`}>
        <Mascot x={540} y={1560} s={1.85} t={t} expr="laugh" sweat armL={[60, 140]} armR={[70, 150]} tilt={jit * 0.5}
          handPropL={<g transform="rotate(-20)"><rect x="-34" y="-90" width="68" height="90" rx="6" fill="#fffdf4" stroke={INK} strokeWidth="3.5" /><path d="M -22 -70 h 40 M -22 -52 h 40 M -22 -34 h 30" stroke="#999" strokeWidth="3" /><path d="M -24 -20 l 6 6 l 12 -12" stroke={C.green} strokeWidth="4" fill="none" /></g>}
          handProp={<g transform="rotate(10)"><rect x="-12" y="-70" width="24" height="60" rx="7" fill="#fff" stroke={INK} strokeWidth="3" /><rect x="-8" y="-62" width="16" height="14" rx="3" fill={C.lime} /></g>} />
      </g>
      {/* flying tools */}
      {[0, 1, 2, 3].map((i) => {
        const [x, y] = [[200, 560], [880, 560], [880, 860], [190, 900]][i];
        const icon = [
          <g><rect x="-8" y="-50" width="16" height="80" rx="6" fill="#9aa3ad" stroke={INK} strokeWidth="4" /><path d="M -26 -50 a 26 26 0 1 1 52 0 l -14 0 l 0 14 l -24 0 l 0 -14 Z" fill="#9aa3ad" stroke={INK} strokeWidth="4" /></g>,
          <path d="M 0 -50 Q 34 -6 30 16 Q 26 40 0 40 Q -26 40 -30 16 Q -34 -6 0 -50 Z" fill={C.water} stroke={INK} strokeWidth="4" />,
          <g><rect x="-10" y="-56" width="20" height="80" rx="10" fill="#fff" stroke={INK} strokeWidth="4" /><circle cx="0" cy="30" r="18" fill={C.red} stroke={INK} strokeWidth="4" /><rect x="-4" y="-20" width="8" height="40" fill={C.red} /></g>,
          <g><circle r="40" fill="#fff" stroke={INK} strokeWidth="5" /><rect x="-8" y="-56" width="16" height="12" fill={INK} /><path d="M 0 0 L 0 -26 M 0 0 L 18 8" stroke={C.red} strokeWidth="5" strokeLinecap="round" /></g>,
        ][i];
        return <g key={i} transform={`translate(${x + Math.sin(t / 6 + i) * 30} ${y + Math.cos(t / 5 + i) * 40}) rotate(${Math.sin(t / 8 + i) * 40})`}>{icon}</g>;
      })}
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${300 + i * 160} 420 q 10 -30 0 -60`} stroke={INK} strokeWidth="5" fill="none" opacity="0.5" strokeLinecap="round" />)}
      {/* plants laughing; cucumber offers a towel */}
      <Cast k="cucumber" x={880} y={1460} s={1.25} t={t} expr="laugh" aL={[90, 70]} aR={ARMS.cover} propL={<Towel />} />
      <Cast k="lettuce" x={160} y={1440} s={1.1} t={t} expr="laugh" aL={ARMS.cover} aR={[40, -60]} />
      <Cast k="strawberry" x={300} y={1300} s={0.8} t={t + 9} expr="laugh" aL={ARMS.cheer} aR={ARMS.cover} />
      <g transform="translate(540 300) rotate(-3)">
        <rect x="-420" y="-80" width="840" height="160" rx="24" fill="#fffdf4" stroke={INK} strokeWidth="5" />
        <text x="0" y="-12" textAnchor="middle" fontFamily={HAND} fontSize="58" fill={C.waterD}>without soil ✓</text>
        <text x="0" y="52" textAnchor="middle" fontFamily={HAND} fontSize="58" fill={C.redD}>without effort ✗</text>
      </g>
      <Vignette o={0.6} />
    </Cam>
  );
};

// ============================================================ 17 · EPIC WIDE at sunset — the future of farming?
export const S17: SceneFn = (t) => (
  <Cam z={mix(1.15, 1.0, ease(pr(t, 0, 180)))} y={mix(-60, 0, ease(pr(t, 0, 180)))}>
    <FutureCity t={t} />
    <GodRays x={540} y={1020} ang={180} spread={300} n={14} o={0.25} t={t} len={1400} w={50} />
    {/* foreground hill */}
    <path d={ridge(1360, 40, 0.8, 2.2)} fill="#2f6b3a" />
    <path d={ridge(1480, 20, 1.5, 0.6)} fill="#245a30" />
    <Flower x={120} y={1520} s={1.2} c="#ff6b8a" t={t} /><Flower x={980} y={1530} s={1.1} c="#ffd23a" t={t} kind="tulip" />
    {/* friends sitting on the hill, watching */}
    <Cast k="tomato" x={300} y={1390} s={0.95} t={t} expr="love" aL={ARMS.rest} aR={[60, 120]} />
    <Mascot x={560} y={1440} s={1.1} t={t} back armL={[40, 60]} armR={[100, 150]} hatTilt={8} />
    <Cast k="lettuce" x={800} y={1400} s={0.9} t={t} expr="surprised" look={[0, -1]} />
    <text x="760" y="1000" fontFamily={FONT} fontWeight="700" fontSize="130" fill="#fff" stroke={INK} strokeWidth="6" paintOrder="stroke" transform={`rotate(${Math.sin(t / 10) * 8} 790 960)`}>?</text>
    <Vignette o={0.6} />
  </Cam>
);

// ============================================================ 18 · OUTRO — the mascot and the whole cast say goodbye
export const S18: SceneFn = (t) => {
  const sub = cw("subscribe", 54);
  const btn = backOut(pr(t, sub - 30, 14));
  const press = t > sub && t < sub + 12 ? 0.9 : 1;
  const ring = t > 70 ? Math.sin(t * 1.3) * 14 * clamp(1 - ((t - 70) % 90) / 30) : 0;
  return (
    <g>
      <GardenBG t={t} hz={1000} path={false} />
      <GodRays x={180} y={230} ang={-35} spread={60} n={8} o={0.4} t={t} w={80} />
      {Array.from({ length: 10 }, (_, i) => <Leaf key={i} x={(i * 113 + t * 1.5) % 1080} y={(i * 191 + t * 3) % 1900} rot={t * 2 + i * 40} c={i % 2 ? C.green : C.lime} s={0.8} />)}
      <Mascot x={540} y={1300} s={2.0} t={t} expr="talk" talk={talkOf(t)} armR="wave" armL={[60, 120]} />
      {/* friends pop up behind the sign */}
      <Cast k="tomato" x={170} y={1040} s={1.0} t={t} expr="happy" aL={ARMS.wave} noLegs />
      <Cast k="strawberry" x={920} y={1050} s={0.95} t={t} expr="laugh" aR={ARMS.wave} noLegs />
      <Cast k="cucumber" x={330} y={1080} s={0.65} t={t} expr="happy" aL={ARMS.cheer} noLegs />
      <Cast k="lettuce" x={760} y={1090} s={0.8} t={t} expr="happy" aR={ARMS.cheer} noLegs />
      <WoodSign x={540} y={1200} w={860} h={250} rot={-1}>
        <text x="0" y="-10" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="96" fill="#fff" stroke="#3a2414" strokeWidth="8" paintOrder="stroke">Artof</text>
        <text x="0" y="84" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="96" fill={C.yellow} stroke="#3a2414" strokeWidth="8" paintOrder="stroke">Agriculture</text>
      </WoodSign>
      <g transform={`translate(830 470) scale(${backOut(pr(t, 20, 14))})`}>
        <Bubble x={0} y={0} w={380} h={220} tail={[-120, 1]}>
          <text x="0" y="-36" textAnchor="middle" fontFamily={HAND} fontSize="40" fill={INK}>Subscribe for more</text>
          <text x="0" y="8" textAnchor="middle" fontFamily={HAND} fontSize="40" fill={INK}>fun and fascinating</text>
          <text x="0" y="52" textAnchor="middle" fontFamily={HAND} fontSize="40" fill={INK}>facts!</text>
        </Bubble>
      </g>
      <g transform={`translate(450 1580) scale(${btn * press})`}>
        <rect x="-170" y="-50" width="340" height="100" rx="26" fill="#e62117" stroke={INK} strokeWidth="5" />
        <rect x="-140" y="-22" width="62" height="44" rx="12" fill="#fff" />
        <path d="M -118 -12 L -96 0 L -118 12 Z" fill="#e62117" />
        <text x="40" y="16" textAnchor="middle" fontFamily={FONT} fontWeight="700" fontSize="46" fill="#fff">Subscribe</text>
      </g>
      <g transform={`translate(720 1580) scale(${btn}) rotate(${ring})`}>
        <path d="M -30 20 Q -30 -34 0 -38 Q 30 -34 30 20 L 38 30 L -38 30 Z" fill="#ffd93d" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
        <circle cx="0" cy="38" r="9" fill="#ffd93d" stroke={INK} strokeWidth="4" />
      </g>
      <Vignette o={0.45} />
    </g>
  );
};

export const SCENE_FNS = [S1, S2, S3, S4, S5, S6, S7a, S7b, S8, S9, S10, S11, S12, S13, S14, S15, S16, S17, S18];
