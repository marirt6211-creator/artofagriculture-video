// v26 scenes — each draws a full 1080×1920 frame for global time T (seconds).
import {
  C, H, W, acorn, cloudBank, blade, bokeh, canvas, clamp, cloudSheet, cut, drop, ei, eio, eo, eob, flare, glow, lin, memo, mix, mixHex,
  noise1, oakLeaf, plen, rays, rgba, rng, root, soilPattern, spline, taper, bird,
} from "./paint";
import { Season, drawTree, fallingLeaf } from "./tree";

// ---------------- timeline ----------------
export const T1 = 0, T2 = 8.0, T2M = 11.0, T3 = 16.0, T4 = 24.0, T5 = 31.0, T6 = 38.0, T7 = 50.0, TEND = 56.0, DUR = 60.5;

// ---------------- S1 · the beginning ----------------
/** tall blurred forest strip (540×2000 painted, shown 2×): canopy light at the top, trunks, ground haze */
function forestStrip() {
  return memo("forest", () => {
    const w = 540, h = 2000;
    const a = canvas(w, h), c = a.getContext("2d")!;
    const g = c.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#f6dc9c"); g.addColorStop(0.18, "#d9b86a"); g.addColorStop(0.45, "#6f7a3a"); g.addColorStop(0.75, "#3d4a22"); g.addColorStop(1, "#4a3b22");
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rng(8);
    // trunks
    for (let i = 0; i < 9; i++) {
      const x = r() * w, ww = 18 + r() * 60;
      const tg = c.createLinearGradient(x - ww, 0, x + ww, 0);
      tg.addColorStop(0, "rgba(30,26,14,0)"); tg.addColorStop(0.5, `rgba(30,24,12,${0.35 + r() * 0.4})`); tg.addColorStop(1, "rgba(30,26,14,0)");
      c.fillStyle = tg; c.fillRect(x - ww, 300 + r() * 300, ww * 2, h);
    }
    // canopy leaf masses
    for (let i = 0; i < 90; i++) {
      const y = r() * 900, x = r() * w;
      c.fillStyle = rgba(mixHex("#24361a", "#6f8a35", r()), 0.25 + r() * 0.35);
      c.beginPath(); c.ellipse(x, y, 20 + r() * 70, 14 + r() * 40, r() * 3, 0, 6.29); c.fill();
    }
    // sun bokeh through the canopy
    for (let i = 0; i < 120; i++) {
      const y = Math.pow(r(), 1.6) * 1500, x = r() * w;
      bokeh(c, x, y, 6 + r() * 26, r() < 0.7 ? "#fff1c4" : "#d7f09a", 0.18 + r() * 0.5 * (1 - y / 1600));
    }
    // ground haze + grass bokeh near the bottom
    for (let i = 0; i < 60; i++) {
      const y = 1500 + r() * 500, x = r() * w;
      bokeh(c, x, y, 8 + r() * 30, r() < 0.5 ? "#c8d77a" : "#f1d38a", 0.12 + r() * 0.25);
    }
    const b = canvas(w, h), bc = b.getContext("2d")!;
    bc.filter = "blur(7px)"; bc.drawImage(a, 0, 0);
    return b;
  });
}

function twig(c: C, x: number, y: number, s: number, t: number) {
  // oak twig with two leaves, slightly soft (just behind the focus plane)
  c.save();
  c.translate(x, y);
  c.rotate(Math.sin(t * 1.3) * 0.02);
  c.filter = "blur(1.5px)";
  taper(c, [[-640, -170], [-380, -140], [-150, -90], [0, -40]], 34, 16, "#4a3826");
  c.save(); c.translate(-330, -150); c.rotate(-2.2); oakLeaf(c, 420, "#5d8f2e", { gloss: 0.6 }); c.restore();
  c.save(); c.translate(-200, -110); c.rotate(-0.4); oakLeaf(c, 360, "#4e8228", { gloss: 0.5 }); c.restore();
  c.filter = "none";
  c.restore();
}

function groundMacro(c: C, horizonY: number, t: number, wet = 0) {
  // far ground (soft) → near ground (crisp), perspective faked with pattern scale bands
  const bands = 14;
  for (let i = 0; i < bands; i++) {
    const y0 = horizonY + Math.pow(i / bands, 1.6) * (H - horizonY + 200);
    const y1 = horizonY + Math.pow((i + 1) / bands, 1.6) * (H - horizonY + 200);
    const sc = mix(0.35, 1.5, i / bands);
    const p = soilPattern(c, "top");
    p.setTransform(new DOMMatrix().scale(sc, sc * 0.55).translate(i * 137, i * 71));
    c.save();
    c.filter = i < 4 ? `blur(${(4 - i) * 1.6}px)` : "none";
    c.fillStyle = p; c.fillRect(0, y0, W, y1 - y0 + 1);
    c.restore();
  }
  // atmospheric haze at the far edge + low sun warmth
  const hz = c.createLinearGradient(0, horizonY - 30, 0, horizonY + 260);
  hz.addColorStop(0, "rgba(220,190,120,0.9)"); hz.addColorStop(1, "rgba(220,190,120,0)");
  c.fillStyle = hz; c.fillRect(0, horizonY - 30, W, 290);
  if (wet > 0) {
    c.fillStyle = `rgba(10,8,12,${0.38 * wet})`; c.fillRect(0, horizonY, W, H - horizonY);
  }
  // light falloff toward the camera (dark foreground)
  const fg = c.createLinearGradient(0, H - 420, 0, H);
  fg.addColorStop(0, "rgba(10,5,2,0)"); fg.addColorStop(1, "rgba(10,5,2,0.55)");
  c.fillStyle = fg; c.fillRect(0, H - 420, W, 420);
}

function fallenLeaf(c: C, x: number, y: number, s: number, rot: number) {
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(1, 0.42);
  c.fillStyle = "rgba(0,0,0,0.35)"; c.filter = "blur(8px)";
  c.beginPath(); c.ellipse(20, s * -0.45 + 25, s * 0.3, s * 0.5, 0, 0, 6.29); c.fill();
  c.filter = "none";
  oakLeaf(c, s, "#a7652a", { gloss: 0.35 });
  c.restore();
}

function ladybug(c: C, x: number, y: number, s: number, t: number, dir: number) {
  c.save(); c.translate(x, y); c.scale(dir, 1);
  c.fillStyle = "rgba(0,0,0,0.4)"; c.beginPath(); c.ellipse(4, s * 0.28, s * 0.62, s * 0.18, 0, 0, 6.29); c.fill();
  // legs
  c.strokeStyle = "#111"; c.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const ph = Math.sin(t * 18 + i * 2.1) * 4;
    c.beginPath(); c.moveTo(-s * 0.2 + i * s * 0.2, s * 0.05); c.lineTo(-s * 0.3 + i * s * 0.22 + ph, s * 0.3); c.stroke();
  }
  const g = c.createRadialGradient(-s * 0.2, -s * 0.25, 2, 0, 0, s * 0.6);
  g.addColorStop(0, "#ff7a5a"); g.addColorStop(0.5, "#d0251a"); g.addColorStop(1, "#5a0806");
  c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, s * 0.55, s * 0.36, 0, Math.PI, 0); c.lineTo(s * 0.55, s * 0.04); c.lineTo(-s * 0.55, s * 0.04); c.fill();
  c.fillStyle = "#0b0b0b";
  for (const [dx, dy, r] of [[-0.25, -0.14, 0.08], [0.05, -0.22, 0.07], [0.3, -0.1, 0.07], [-0.02, -0.06, 0.05]] as const) {
    c.beginPath(); c.arc(dx * s, dy * s, r * s, 0, 6.29); c.fill();
  }
  c.fillStyle = "#111"; c.beginPath(); c.ellipse(s * 0.55, -s * 0.02, s * 0.16, s * 0.13, 0, 0, 6.29); c.fill();
  c.fillStyle = "rgba(255,255,255,0.85)"; c.beginPath(); c.ellipse(-s * 0.22, -s * 0.27, s * 0.1, s * 0.04, -0.3, 0, 6.29); c.fill();
  c.restore();
}

export function scene1(c: C, T: number) {
  const t = T - T1;
  const detach = 1.3, land = 4.3;
  const fall = lin(t, detach, land);
  // camera vertical position along the forest strip (0 canopy .. 1 ground)
  const camP = eio(lin(t, detach - 0.1, land + 0.2));
  const strip = forestStrip();
  const sh = strip.height * 2; // display height
  const offY = -mix(0, sh - H, camP);
  const vel = Math.max(0, Math.sin(Math.PI * lin(t, detach, land + 0.2)));
  // background with vertical motion blur while falling
  const taps = vel > 0.15 ? 5 : 1;
  for (let i = 0; i < taps; i++) {
    c.globalAlpha = i === 0 ? 1 : 0.22;
    c.drawImage(strip, 0, offY + (i - (taps - 1) / 2) * 34 * vel, W, sh);
  }
  c.globalAlpha = 1;
  // ground rises into view
  const horizon = mix(H + 300, 1180, eio(lin(t, 3.2, land + 0.3)));
  // post-landing slow pull back (zoom around the seed)
  const zoom = mix(1.55, 1.0, eio(lin(t, land + 0.4, 8.2)));
  const seedX = 560, seedRest = 1395;
  c.save();
  if (horizon < H) {
    c.translate(seedX, seedRest); c.scale(zoom, zoom); c.translate(-seedX, -seedRest);
    groundMacro(c, horizon, t);
    // background grass (soft) on the horizon line
    c.save(); c.filter = "blur(5px)";
    const r = rng(3);
    for (let i = 0; i < 46; i++) {
      const x = r() * W * 1.3 - W * 0.15;
      blade(c, x, horizon + 30 + r() * 40, 160 + r() * 260, 10 + r() * 10, (r() - 0.5) * 0.5 + Math.sin(t + i) * 0.03, mixHex("#4b6a22", "#a3b54a", r()));
    }
    c.restore();
    fallenLeaf(c, 250, horizon + 330, 330, 0.9);
    fallenLeaf(c, 870, horizon + 210, 230, -0.7);
    // ladybug crossing for scale
    const lb = lin(t, 5.2, 8.6);
    if (lb > 0) ladybug(c, mix(1150, 760, lb), horizon + 290 - lb * 30, 46, t, -1);
  }
  // the acorn
  let ax = seedX, ay: number, rot: number;
  if (t < detach) {
    ay = 700 + Math.sin(t * 1.3) * 6; rot = Math.sin(t * 1.3) * 0.04;
  } else if (t < land) {
    const k = ei(fall);
    // screen-space: camera follows, seed drifts from 700 to resting height
    ay = mix(700, seedRest - 175, eio(fall)) + Math.sin(k * 9) * 10;
    rot = fall * 2.2;
    ax = seedX + Math.sin(fall * 5) * 22;
  } else {
    const b = lin(t, land, land + 0.7);
    ay = seedRest - 175 - Math.abs(Math.sin(b * Math.PI * 2)) * 60 * (1 - b);
    rot = mix(2.2, 1.95, eo(b)); // settles on its side
  }
  const L = t < land ? 230 : 230;
  if (t >= land - 0.05) {
    // contact shadow on the soil
    c.save(); c.filter = "blur(10px)"; c.fillStyle = "rgba(15,8,3,0.65)";
    c.beginPath(); c.ellipse(ax + 10, seedRest - 60, 150, 26, 0, 0, 6.29); c.fill(); c.restore();
  }
  if (t < detach + 0.3) twig(c, ax + 70, 700 - 210 + offY * 0.05 - (t > detach ? (t - detach) * 900 : 0), 1, t);
  c.save();
  c.translate(ax, ay);
  c.rotate(rot);
  acorn(c, L, { t, cap: true });
  c.restore();
  // landing dust puff
  const dp = lin(t, land, land + 1.4);
  if (dp > 0 && dp < 1) {
    const r = rng(5);
    for (let i = 0; i < 30; i++) {
      const a = Math.PI + r() * Math.PI, d = eo(dp) * (60 + r() * 140);
      c.fillStyle = `rgba(190,150,100,${0.35 * (1 - dp) * r()})`;
      c.beginPath(); c.arc(ax + Math.cos(a) * d * 1.6, seedRest - 60 + Math.sin(a) * d * 0.6, 3 + r() * 9, 0, 6.29); c.fill();
    }
  }
  c.restore();
  // foreground grass (very out of focus) framing the tiny seed after the pull-back
  const fgA = lin(t, land + 0.5, 6.5);
  if (fgA > 0) {
    c.save(); c.globalAlpha = fgA; c.filter = "blur(16px)";
    blade(c, -40, H + 40, 1300, 70, 0.35 + Math.sin(t * 0.9) * 0.02, "#5f8a2a");
    blade(c, 60, H + 60, 900, 50, 0.55, "#7ea13a");
    blade(c, W + 20, H + 40, 1150, 64, -0.4 + Math.sin(t * 0.8 + 1) * 0.02, "#4f7a24");
    blade(c, W - 120, H + 80, 760, 44, -0.25, "#8aac44");
    c.restore();
  }
  // god-light from upper left
  rays(c, -80, -120, 2300, 0.55, 1.25, 9, "#ffe2a6", 0.11, t, 4);
  glow(c, 120, 80, 700, "#ffe6b0", 0.35);
}

// ---------------- S2 · the first drop of life ----------------
export function scene2Sky(c: C, T: number) {
  const t = T - T2;
  const storm = eio(lin(t, 0.2, 2.6));
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, mixHex("#5e8fc4", "#2d3640", storm)); g.addColorStop(0.6, mixHex("#a9c4dc", "#56606a", storm)); g.addColorStop(1, mixHex("#e9d6a8", "#707670", storm));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // clouds gather: two layers converge from both sides
  const fair = cloudBank("fair", 1), st = cloudBank("storm", 2), st2 = cloudBank("storm", 5);
  c.filter = "blur(3px)";
  const drift = t * 18;
  c.globalAlpha = 1 - storm * 0.6;
  c.drawImage(fair, -220 + drift - (1 - storm) * 160, -100, 1520, 1900);
  c.globalAlpha = storm;
  c.drawImage(st, -300 - drift * 0.6 + (1 - storm) * 500, -160, 1600, 2000);
  c.drawImage(st2, -200 + drift * 0.4 - (1 - storm) * 600, 200, 1500, 1880);
  c.globalAlpha = 1; c.filter = "none";
  // oak canopy edge looking up (soft, framing)
  c.save(); c.filter = "blur(4px)";
  c.save(); c.translate(-60, -30); c.rotate(0.9); oakLeaf(c, 520, mixHex("#3e6a25", "#1d2c14", storm)); c.restore();
  c.save(); c.translate(W + 40, 120); c.rotate(-2.2); oakLeaf(c, 460, mixHex("#4b7a2a", "#1d2c14", storm)); c.restore();
  c.restore();
  // grass tips at the bottom, sharp: we are lying next to the seed
  const r = rng(6);
  for (let i = 0; i < 26; i++) {
    const x = r() * W;
    blade(c, x, H + 30, 260 + r() * 420, 18 + r() * 12, (r() - 0.5) * 0.6 + Math.sin(t * 2 + i) * 0.04 * (1 + storm * 2), mixHex("#5d8a2c", "#2f4418", storm * 0.7 + r() * 0.2));
  }
  // rain begins
  const rain = lin(t, 1.6, 2.8);
  if (rain > 0) rainStreaks(c, T, rain, 1);
  // a flash of sheet lightning (soft, local)
  const fl = Math.max(0, 1 - Math.abs(t - 2.05) / 0.12);
  if (fl > 0) glow(c, 700, 380, 900, "#dfe8ff", 0.35 * fl);
}

function rainStreaks(c: C, T: number, amt: number, scale: number) {
  const r = rng(17);
  c.save(); c.lineCap = "round";
  const N = Math.floor(160 * amt);
  for (let i = 0; i < N; i++) {
    const speed = 2400 + r() * 1200, x0 = r() * (W + 300), ph = r() * 3;
    const y = ((T * speed + ph * H) % (H + 400)) - 200;
    const x = x0 - (y / H) * 260;
    const len = (60 + r() * 90) * scale;
    const near = r();
    c.strokeStyle = `rgba(220,232,245,${(0.12 + near * 0.3) * amt})`;
    c.lineWidth = (1 + near * 2.4) * scale;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - len * 0.14, y + len); c.stroke();
  }
  c.restore();
}

/** macro: the acorn lying on wet soil while rain falls; absorbs, swells, cracks */
export function scene2Macro(c: C, T: number) {
  const t = T - T2M; // 0..5
  const wet = eo(lin(t, 0.2, 3.6));
  const crack = eio(lin(t, 3.0, 5.0));
  // background: soft wet soil + cool light, puddle sheen
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#2a2f33"); g.addColorStop(0.35, "#3b3328"); g.addColorStop(1, "#1d140c");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // out-of-focus far soil and grass
  c.save(); c.filter = "blur(14px)";
  const r = rng(21);
  for (let i = 0; i < 18; i++) blade(c, r() * W, 760 + r() * 120, 500 + r() * 400, 40 + r() * 30, (r() - 0.5) * 0.4, mixHex("#33461f", "#5f7838", r()));
  for (let i = 0; i < 40; i++) bokeh(c, r() * W, r() * 800, 20 + r() * 40, "#c8d6e0", 0.05 + r() * 0.12);
  c.restore();
  // soil bed (macro scale)
  const p = soilPattern(c, "top");
  p.setTransform(new DOMMatrix().scale(2.2, 1.3).translate(40, 10));
  c.save();
  const bedTop = 900;
  c.beginPath(); c.moveTo(0, bedTop + 40);
  for (let x = 0; x <= W; x += 30) c.lineTo(x, bedTop + Math.sin(x * 0.01) * 25 + noise1(x * 0.02, 3) * 20);
  c.lineTo(W, H); c.lineTo(0, H); c.closePath();
  c.clip();
  c.filter = "blur(2px)";
  c.fillStyle = p; c.fillRect(0, bedTop - 60, W, H);
  c.filter = "none";
  c.fillStyle = `rgba(8,6,10,${0.25 + 0.35 * wet})`; c.fillRect(0, bedTop - 60, W, H);
  // wet sheen: sky reflections on the soil
  c.globalCompositeOperation = "screen";
  for (let i = 0; i < 26; i++) {
    const x = r() * W, y = bedTop + 60 + r() * 900;
    c.fillStyle = `rgba(150,170,190,${0.08 * wet + r() * 0.06 * wet})`;
    c.beginPath(); c.ellipse(x, y, 40 + r() * 120, 6 + r() * 14, 0, 0, 6.29); c.fill();
  }
  c.globalCompositeOperation = "source-over";
  c.restore();
  // the acorn, big — lying on its side, swelling slightly as it drinks
  const sw = 1 + 0.04 * eo(lin(t, 1.5, 4.5));
  const ax = 540, ay = 1080;
  c.save(); c.filter = "blur(14px)"; c.fillStyle = "rgba(0,0,0,0.7)";
  c.beginPath(); c.ellipse(ax + 40, ay + 230, 380, 70, -0.1, 0, 6.29); c.fill(); c.restore();
  c.save();
  c.translate(ax - 230, ay - 70); c.rotate(-1.75 + Math.sin(t * 0.6) * 0.005); c.scale(sw, sw);
  acorn(c, 600, { wet, crack, t });
  c.restore();
  // rain: near streaks, impacts on the acorn and soil
  rainStreaks(c, T, 0.7, 1.6);
  const imp = rng(33);
  for (let i = 0; i < 14; i++) {
    const period = 0.9 + imp() * 0.9, off = imp() * period;
    const ph = ((t + off) % period) / period;
    const onSeed = i < 6;
    const x = onSeed ? 300 + imp() * 520 : imp() * W;
    const y = onSeed ? 900 + imp() * 260 : 1050 + imp() * 800;
    splash(c, x, y, ph, onSeed ? 1.3 : 0.9);
  }
  // one hero drop, slow-motion, lands on the shell at t≈1.2
  const hd = lin(t, 0.4, 1.25);
  if (hd < 1) drop(c, 600, mix(-80, 905, ei(hd)), 34, 1);
  else splash(c, 600, 905, lin(t, 1.25, 2.0), 2.2);
  // cool rim light from the overcast sky, then a faint warm hope glow when the crack appears
  glow(c, 540, 300, 900, "#9fb6cc", 0.18);
  if (crack > 0) glow(c, 760, 1180, 260, "#fff0c8", 0.35 * crack);
}

function splash(c: C, x: number, y: number, ph: number, s: number) {
  if (ph <= 0 || ph >= 1) return;
  const r = 10 + 60 * eo(ph) * s;
  c.save();
  c.strokeStyle = `rgba(230,240,250,${0.55 * (1 - ph)})`; c.lineWidth = 2 * s * (1 - ph) + 0.5;
  c.beginPath(); c.ellipse(x, y, r, r * 0.3, 0, 0, 6.29); c.stroke();
  const rr = rng(Math.floor(x * 3 + y));
  for (let k = 0; k < 7; k++) {
    const a = Math.PI + rr() * Math.PI, d = r * (0.6 + rr() * 0.6);
    const hgt = Math.sin(ph * Math.PI) * 50 * s * rr();
    drop(c, x + Math.cos(a) * d, y + Math.sin(a) * d * 0.3 - hgt, (2 + rr() * 3) * s * (1 - ph * 0.6), 1 - ph);
  }
  c.restore();
}

// ---------------- S3 / S4 · underground ----------------
const ACORN = { x: -60, y: 190, rot: -1.0, L: 250 };
const tipW = (): [number, number] => [ACORN.x - Math.sin(ACORN.rot) * ACORN.L, ACORN.y + Math.cos(ACORN.rot) * ACORN.L];
const ROCK = { x: 300, y: 1300, rx: 170, ry: 125 };
let ROOT_PTS: [number, number][] | null = null;
function rootPath() {
  if (ROOT_PTS) return ROOT_PTS;
  const [tx, ty] = tipW();
  const cp: [number, number][] = [[tx, ty], [tx + 40, ty + 40], [tx + 62, ty + 120], [tx + 66, ty + 260], [tx + 50, ty + 430], [tx + 36, ty + 620], [tx + 28, 1100], [160, 1180], [134, 1232], [116, 1300], [114, 1400], [126, 1500], [121, 1600], [116, 1700], [110, 1830], [104, 1960]];
  ROOT_PTS = spline(cp, 260);
  return ROOT_PTS;
}
const ROOT_TOTAL = () => plen(rootPath());
/** root length over time: steady, then stalled at the rock, sliding round it, pushing through the hardpan */
function rootLen(T: number) {
  const atRock = lenToY(1150), pastRock = lenToY(1420), pastPan = lenToY(1700);
  if (T < 16.8) return 0;
  if (T < 24) return mix(0, lenToY(900), eo(lin(T, 16.8, 24)));
  if (T < 25.5) return mix(lenToY(900), atRock, lin(T, 24, 25.5));
  if (T < 27) return atRock + 12 * eo(lin(T, 25.5, 27)); // stuck, pressing
  if (T < 28.6) return mix(atRock + 12, pastRock, eio(lin(T, 27, 28.6)));
  if (T < 30) return mix(pastRock, pastPan, eio(lin(T, 28.6, 30)));
  return mix(pastPan, ROOT_TOTAL(), eo(lin(T, 30, 36)));
}
const lenCache = new Map<number, number>();
function lenToY(y: number) {
  const k = lenCache.get(y);
  if (k !== undefined) return k;
  const P = rootPath();
  let acc = 0;
  for (let i = 1; i < P.length; i++) {
    acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]);
    if (P[i][1] >= y) { lenCache.set(y, acc); return acc; }
  }
  lenCache.set(y, acc);
  return acc;
}
const SHOOT_CP = (): [number, number][] => { const [tx, ty] = tipW(); return [[tx - 6, ty - 6], [tx + 10, ty - 60], [tx + 2, ty - 140], [tx - 22, ty - 220], [tx - 30, ty - 300], [tx - 24, ty - 380]]; };

type Cam = { x: number; y: number; z: number };
export function camUnder(T: number): Cam {
  const k: [number, number, number, number][] = [
    // time, x, y, z
    [16.0, 40, 240, 1.0],
    [24.0, 140, 640, 1.12],
    [25.4, 190, 1080, 1.5],
    [27.0, 200, 1180, 1.62],
    [28.6, 170, 1360, 1.55],
    [29.8, 140, 1560, 1.4],
    [31.0, 90, 900, 0.62],
    [36.0, 80, 960, 0.6],
  ];
  if (T <= k[0][0]) return { x: k[0][1], y: k[0][2], z: k[0][3] };
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (T <= b[0]) {
      const p = eio(lin(T, a[0], b[0]));
      return { x: mix(a[1], b[1], p), y: mix(a[2], b[2], p), z: mix(a[3], b[3], p) };
    }
  }
  const e = k[k.length - 1];
  return { x: e[1], y: e[2], z: e[3] };
}

type Stone = { x: number; y: number; r: number; e: number; rot: number; tone: number; seed: number };
let STONES: Stone[] | null = null;
function stones() {
  if (STONES) return STONES;
  const r = rng(404);
  const out: Stone[] = [];
  for (let i = 0; i < 150; i++) {
    const y = 40 + r() * 2100, x = -700 + r() * 1500;
    const rr = 6 + Math.pow(r(), 2.6) * 55;
    // keep the root corridor clear (except the hero rock)
    const P = rootPath();
    let near = false;
    for (let k = 0; k < P.length; k += 6) if (Math.hypot(P[k][0] - x, P[k][1] - y) < rr + 40) { near = true; break; }
    if (Math.hypot(x - ROCK.x, y - ROCK.y) < ROCK.rx + rr + 30) near = true;
    if (Math.hypot(x - ACORN.x - 60, y - ACORN.y - 60) < 200) near = true;
    if (!near) out.push({ x, y, r: rr, e: 0.6 + r() * 0.35, rot: r() * 3, tone: r(), seed: i });
  }
  STONES = out;
  return out;
}

function stone(c: C, x: number, y: number, rx: number, ry: number, rot: number, tone: number, seed: number, wetLook = 0.5) {
  const r = rng(seed * 7 + 1);
  const n = 12;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * 6.283;
    const k = 0.82 + r() * 0.3;
    pts.push([Math.cos(a) * rx * k, Math.sin(a) * ry * k]);
  }
  c.save(); c.translate(x, y); c.rotate(rot);
  const path = new Path2D();
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const m: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    if (i === 0) path.moveTo(m[0], m[1]);
    else path.quadraticCurveTo(a[0], a[1], m[0], m[1]);
  }
  path.quadraticCurveTo(pts[0][0], pts[0][1], (pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2);
  path.closePath();
  // contact shadow in the soil
  c.save(); c.filter = `blur(${Math.max(2, rx * 0.15)}px)`; c.fillStyle = "rgba(10,5,2,0.6)";
  c.translate(rx * 0.12, ry * 0.18); c.fill(path); c.restore();
  const base = mixHex("#6d6458", "#a39684", tone);
  const g = c.createRadialGradient(-rx * 0.35, -ry * 0.4, rx * 0.05, 0, 0, Math.max(rx, ry) * 1.1);
  g.addColorStop(0, mixHex(base, "#f2ead8", 0.55)); g.addColorStop(0.5, base); g.addColorStop(1, mixHex(base, "#120c06", 0.75));
  c.fillStyle = g; c.fill(path);
  c.save(); c.clip(path);
  // mineral speckle
  for (let i = 0; i < Math.min(140, rx * 3); i++) {
    const sx = (r() - 0.5) * rx * 2, sy = (r() - 0.5) * ry * 2;
    c.fillStyle = r() < 0.5 ? "rgba(20,15,10,0.25)" : "rgba(240,230,210,0.22)";
    c.fillRect(sx, sy, 1 + r() * 2.5, 1 + r() * 2.5);
  }
  c.restore();
  // crisp wet specular
  c.fillStyle = `rgba(255,250,235,${0.35 + wetLook * 0.4})`;
  c.beginPath(); c.ellipse(-rx * 0.38, -ry * 0.42, rx * 0.16, ry * 0.08, -0.5, 0, 6.29); c.fill();
  c.restore();
}

function worm(c: C, T: number, cam: (x: number, y: number) => [number, number], z: number) {
  const p = lin(T, 18.5, 30);
  if (p <= 0 || p >= 1) return;
  const pts: [number, number][] = [];
  for (let i = 0; i < 26; i++) {
    const s = p * 1300 - i * 9;
    const wx = -620 + s, wy = 620 + Math.sin(s * 0.012) * 50 + Math.sin(s * 0.031 + T * 3) * 8;
    pts.push(cam(wx, wy));
  }
  const g = c.createLinearGradient(pts[0][0], pts[0][1] - 10, pts[0][0], pts[0][1] + 10);
  g.addColorStop(0, "#e3a39a"); g.addColorStop(0.5, "#b56a62"); g.addColorStop(1, "#5e2f2a");
  taper(c, pts, 20 * z, 12 * z, g);
  c.strokeStyle = "rgba(70,30,25,0.35)"; c.lineWidth = 1.2;
  for (let i = 2; i < pts.length - 1; i += 1) {
    const [x, y] = pts[i];
    c.beginPath(); c.arc(x, y, 9 * z, -1.9, -1.2); c.stroke();
  }
  c.fillStyle = "rgba(255,240,235,0.5)";
  c.beginPath(); c.ellipse(pts[2][0], pts[2][1] - 5 * z, 12 * z, 2.5 * z, 0, 0, 6.29); c.fill();
}

export function underground(c: C, T: number, camOverride?: Cam) {
  const cm = camOverride ?? camUnder(T);
  const z = cm.z;
  const S = (x: number, y: number): [number, number] => [W / 2 + (x - cm.x) * z, H / 2 + (y - cm.y) * z];
  c.save();
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cm.x, -cm.y);
  // world-space painting from here
  const top = cm.y - H / 2 / z - 40, bot = cm.y + H / 2 / z + 40, lft = cm.x - W / 2 / z - 40, rgt = cm.x + W / 2 / z + 40;
  // air above ground
  if (top < 0) {
    const g = c.createLinearGradient(0, top, 0, 0);
    g.addColorStop(0, "#f4d79c"); g.addColorStop(1, "#c7b07a");
    c.fillStyle = g; c.fillRect(lft, top, rgt - lft, -top + 2);
    c.save(); c.filter = "blur(6px)";
    const r0 = rng(12);
    for (let i = 0; i < 30; i++) bokeh(c, lft + r0() * (rgt - lft), top + r0() * Math.min(-top, 600), 10 + r0() * 30, "#fff4d0", 0.2 + r0() * 0.3);
    c.restore();
  }
  // soil body
  const p1 = soilPattern(c, "top");
  c.fillStyle = p1;
  c.beginPath(); c.moveTo(lft, 8);
  for (let x = Math.floor(lft / 20) * 20; x <= rgt; x += 20) c.lineTo(x, 6 + noise1(x * 0.02, 9) * 10);
  c.lineTo(rgt, bot); c.lineTo(lft, bot); c.closePath(); c.fill();
  // subsoil: paler, blended in gradually
  const p2 = soilPattern(c, "deep");
  for (let i = 0; i < 8; i++) {
    const y0 = 760 + i * 70;
    c.globalAlpha = (i + 1) / 8;
    c.fillStyle = p2; c.fillRect(lft, Math.max(y0, top), rgt - lft, Math.max(0, bot - Math.max(y0, top)));
  }
  c.globalAlpha = 1;
  // strata tints: dark humus band at the top, compacted grey hardpan deep down
  const st = c.createLinearGradient(0, 0, 0, 2100);
  st.addColorStop(0, "rgba(25,12,5,0.55)"); st.addColorStop(0.05, "rgba(25,12,5,0.2)"); st.addColorStop(0.3, "rgba(0,0,0,0)");
  st.addColorStop(0.7, "rgba(0,0,0,0)"); st.addColorStop(0.72, "rgba(70,62,58,0.55)"); st.addColorStop(0.8, "rgba(60,54,50,0.6)"); st.addColorStop(0.82, "rgba(0,0,0,0.1)"); st.addColorStop(1, "rgba(0,0,0,0.35)");
  c.fillStyle = st; c.fillRect(lft, Math.max(0, top), rgt - lft, bot - Math.max(0, top));
  // hardpan cracks (the only way through)
  c.strokeStyle = "rgba(12,8,6,0.7)"; c.lineWidth = 2.2;
  const rc = rng(70);
  for (let i = 0; i < 16; i++) {
    let x = -600 + i * 85 + rc() * 40, y = 1510;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (rc() - 0.5) * 30; y += 30 + rc() * 10; c.lineTo(x, y); }
    c.stroke();
  }
  // the real crack the root uses
  c.lineWidth = 5; c.strokeStyle = "rgba(8,5,3,0.85)";
  c.beginPath(); c.moveTo(130, 1505); c.lineTo(124, 1560); c.lineTo(128, 1610); c.lineTo(120, 1690); c.stroke();
  // old dead roots & fungal threads
  const rr = rng(88);
  c.lineCap = "round";
  for (let i = 0; i < 26; i++) {
    let x = -700 + rr() * 1500, y = 40 + rr() * 900;
    c.strokeStyle = `rgba(40,22,10,${0.5 + rr() * 0.3})`; c.lineWidth = 1.5 + rr() * 3;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 8; k++) { x += (rr() - 0.5) * 70; y += 20 + rr() * 50; c.lineTo(x, y); }
    c.stroke();
  }
  for (let i = 0; i < 40; i++) {
    let x = -700 + rr() * 1500, y = 100 + rr() * 1300;
    c.strokeStyle = `rgba(245,240,225,${0.08 + rr() * 0.12})`; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 6; k++) { x += (rr() - 0.5) * 90; y += (rr() - 0.5) * 60; c.quadraticCurveTo(x + 20, y - 10, x, y); }
    c.stroke();
  }
  // grass roots hanging from the surface
  for (let i = 0; i < 40; i++) {
    let x = -700 + rr() * 1500, y = 10;
    c.strokeStyle = `rgba(210,180,130,${0.25 + rr() * 0.25})`; c.lineWidth = 1 + rr() * 1.5;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 5; k++) { x += (rr() - 0.5) * 30; y += 20 + rr() * 30; c.lineTo(x, y); }
    c.stroke();
  }
  // stones
  for (const s of stones()) {
    if (s.y + s.r < top || s.y - s.r > bot || s.x + s.r < lft || s.x - s.r > rgt) continue;
    stone(c, s.x, s.y, s.r, s.r * s.e, s.rot, s.tone, s.seed, 0.3);
  }
  // hero rock
  const press = lin(T, 25.5, 27) * (1 - lin(T, 27, 27.6));
  const shake = press > 0 ? Math.sin(T * 60) * 1.5 * press : 0;
  stone(c, ROCK.x + shake, ROCK.y, ROCK.rx, ROCK.ry, 0.15, 0.55, 9, 0.8);
  // worm
  c.restore();
  worm(c, T, S, z);
  c.save();
  c.translate(W / 2, H / 2); c.scale(z, z); c.translate(-cm.x, -cm.y);
  // surface line: litter & grass above
  if (top < 30) {
    const r3 = rng(19);
    for (let i = 0; i < 70; i++) {
      const x = lft + r3() * (rgt - lft);
      blade(c, x, 10, 90 + r3() * 220, 7 + r3() * 7, (r3() - 0.5) * 0.7 + Math.sin(T * 1.4 + i) * 0.04, mixHex("#4e7424", "#9db84a", r3()));
    }
    // leaf litter on the surface edge
    for (let i = 0; i < 12; i++) {
      c.save(); c.translate(lft + r3() * (rgt - lft), 4); c.rotate(-1.57 + (r3() - 0.5) * 0.6); c.scale(0.25, 1);
      oakLeaf(c, 120 + r3() * 80, r3() < 0.5 ? "#8a5a2a" : "#6e4a22", { veins: false, gloss: 0.2 });
      c.restore();
    }
  }
  // seed cavity + seed (cracked open, lying on its side)
  c.save(); c.filter = "blur(10px)"; c.fillStyle = "rgba(8,4,2,0.75)";
  c.beginPath(); c.ellipse(ACORN.x + 120, ACORN.y + 80, 210, 150, -0.6, 0, 6.29); c.fill(); c.restore();
  c.save(); c.translate(ACORN.x, ACORN.y); c.rotate(ACORN.rot); acorn(c, ACORN.L, { wet: 0.75, crack: 1, t: T }); c.restore();
  // shoot (pale, hooked) rising toward the surface
  const shootL = mix(0, 300, eo(lin(T, 19.5, 31)));
  if (shootL > 4) {
    const sp = cut(spline(SHOOT_CP(), 60), shootL);
    const e = sp[sp.length - 1];
    const sg = c.createLinearGradient(sp[0][0], sp[0][1], e[0], e[1]);
    sg.addColorStop(0, "#e9dcb4"); sg.addColorStop(1, "#d6dd8a");
    taper(c, sp, 22, 15, sg);
    // plumule hook at the tip
    c.save(); c.translate(e[0], e[1]); c.rotate(-0.4);
    c.strokeStyle = "#c9d27a"; c.lineWidth = 13; c.lineCap = "round";
    c.beginPath(); c.arc(-14, 0, 14, 0, -Math.PI * 0.95, true); c.stroke();
    c.restore();
  }
  // the root
  const L = rootLen(T);
  if (L > 2) {
    let pts = cut(rootPath(), L);
    // buckling while it presses against the rock
    if (press > 0) {
      const n = pts.length;
      pts = pts.map(([x, y], i) => {
        const k = i / (n - 1);
        const b = Math.sin(clamp((k - 0.55) / 0.45) * Math.PI) * 26 * press;
        return [x - b, y] as [number, number];
      });
    }
    root(c, pts, 26, T);
    // lateral roots branching out once the taproot is through
    const lat = lin(T, 26.5, 36);
    if (lat > 0) {
      const rL = rng(55);
      const P = pts;
      for (let i = 0; i < 9; i++) {
        const at = Math.floor(P.length * (0.18 + i * 0.07));
        if (at >= P.length - 5) break;
        const [bx, by] = P[at];
        const side = i % 2 ? 1 : -1;
        const len = (120 + rL() * 220) * clamp(lat * 2.2 - i * 0.18);
        if (len < 6) continue;
        const cp: [number, number][] = [[bx, by], [bx + side * len * 0.4, by + len * 0.12], [bx + side * len * 0.8, by + len * 0.36], [bx + side * len, by + len * 0.7]];
        root(c, spline(cp, 24), 9, T, len > 80);
      }
    }
    // dust shaken loose at the rock
    if (press > 0) {
      const e = pts[pts.length - 1];
      const rd = rng(Math.floor(T * 12));
      for (let i = 0; i < 18; i++) {
        c.fillStyle = `rgba(170,130,90,${0.5 * press * rd()})`;
        c.beginPath(); c.arc(e[0] + (rd() - 0.5) * 80, e[1] - rd() * 60, 1.5 + rd() * 3.5, 0, 6.29); c.fill();
      }
      glow(c, e[0], e[1], 90, "#ffe9c4", 0.25 * press);
    }
  }
  c.restore();
  // lighting: warm key from the surface, dramatic cool rim deeper down
  const depthK = clamp((cm.y - 500) / 900);
  const lg = c.createLinearGradient(0, S(0, -200)[1], 0, S(0, 700)[1]);
  lg.addColorStop(0, "rgba(255,220,150,0.35)"); lg.addColorStop(1, "rgba(255,220,150,0)");
  c.globalCompositeOperation = "soft-light";
  c.fillStyle = lg; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = "source-over";
  const vg = c.createRadialGradient(W / 2, H * 0.5, H * 0.2, W / 2, H * 0.5, H * 0.72);
  vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, `rgba(4,2,1,${0.45 + depthK * 0.35})`);
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (depthK > 0) {
    c.save(); c.globalCompositeOperation = "lighter";
    glow(c, W + 100, 600, 900, "#7fa0c8", 0.12 * depthK);
    c.restore();
  }
  // floating soil motes in front (depth of field)
  const rm = rng(3);
  c.save();
  for (let i = 0; i < 26; i++) {
    const x = (rm() * W + Math.sin(T * 0.4 + i) * 30) % W, y = (rm() * H + T * (8 + rm() * 14)) % H;
    const big = rm() < 0.25;
    c.filter = big ? "blur(7px)" : "none";
    c.fillStyle = `rgba(200,160,110,${big ? 0.25 : 0.4})`;
    c.beginPath(); c.arc(x, y, big ? 14 + rm() * 10 : 1.5 + rm() * 2, 0, 6.29); c.fill();
  }
  c.restore();
}

// ---------------- S5 · finding the light ----------------
export function scene5(c: C, T: number) {
  const t = T - T5; // 0..7
  const sunY = mix(980, 700, eo(lin(t, 0, 7)));
  const sunX = 300;
  const g = c.createLinearGradient(0, 0, 0, 1250);
  g.addColorStop(0, "#5f84ad"); g.addColorStop(0.45, "#c7b8a6"); g.addColorStop(0.75, "#f6c588"); g.addColorStop(1, "#ffdfae");
  c.fillStyle = g; c.fillRect(0, 0, W, 1300);
  glow(c, sunX, sunY, 900, "#ffd28a", 0.65);
  // distant meadow & trees, soft
  c.save(); c.filter = "blur(10px)";
  c.fillStyle = "#6a6a3e";
  c.beginPath(); c.moveTo(0, 1120);
  for (let x = 0; x <= W; x += 40) c.lineTo(x, 1080 - Math.max(0, Math.sin(x * 0.006 + 1) * 120) - noise1(x * 0.01, 4) * 30);
  c.lineTo(W, 1250); c.lineTo(0, 1250); c.fill();
  const r = rng(51);
  for (let i = 0; i < 40; i++) blade(c, r() * W, 1220, 120 + r() * 200, 14 + r() * 10, (r() - 0.5) * 0.4, mixHex("#4f5f2a", "#8f8a45", r()));
  c.restore();
  // dew sparkle bokeh
  for (let i = 0; i < 34; i++) bokeh(c, r() * W, 900 + r() * 340, 8 + r() * 26, r() < 0.6 ? "#fff0c0" : "#ffd28a", 0.15 + r() * 0.35);
  // soil surface, macro, warm side light
  groundMacro(c, 1180, t);
  c.save(); c.globalCompositeOperation = "soft-light";
  const wl = c.createLinearGradient(0, 1180, W, 1500);
  wl.addColorStop(0, "rgba(255,190,110,0.7)"); wl.addColorStop(1, "rgba(255,190,110,0)");
  c.fillStyle = wl; c.fillRect(0, 1180, W, H - 1180); c.restore();
  // the mound: soil lifts and splits where the shoot pushes
  const mx = 560, my = 1300;
  const bulge = eo(lin(t, 0.4, 2.0));
  const brk = lin(t, 1.9, 2.6);
  if (bulge > 0) {
    const mg = c.createRadialGradient(mx - 30, my - 30 * bulge, 10, mx, my, 210);
    mg.addColorStop(0, `rgba(150,105,65,${0.7 * bulge})`); mg.addColorStop(0.6, `rgba(90,58,34,${0.6 * bulge})`); mg.addColorStop(1, "rgba(60,38,22,0)");
    c.fillStyle = mg; c.beginPath(); c.ellipse(mx, my - 18 * bulge, 220, 70 + 26 * bulge, 0, 0, 6.29); c.fill();
    // cracks radiating
    c.strokeStyle = `rgba(20,10,5,${0.8 * bulge})`; c.lineWidth = 3; c.lineCap = "round";
    const rk = rng(61);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * 6.283 + rk();
      let x = mx, y = my - 18 * bulge;
      c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 4; k++) { x += Math.cos(a + (rk() - 0.5)) * 40 * bulge; y += Math.sin(a + (rk() - 0.5)) * 14 * bulge; c.lineTo(x, y); }
      c.stroke();
    }
    // crumbs tumbling away after the break
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * 6.283, d = 30 + eo(brk) * (60 + rk() * 80);
      const cx = mx + Math.cos(a) * d * 1.6, cy = my - 20 * bulge + Math.sin(a) * d * 0.4 - Math.sin(brk * Math.PI) * 30 * rk();
      stoneCrumb(c, cx, cy, 8 + rk() * 14, i);
    }
  }
  // the shoot breaks through, hook straightens, first leaves unfold
  const rise = eo(lin(t, 1.9, 4.6));
  const hook = 1 - eio(lin(t, 2.6, 4.4));
  const open = eio(lin(t, 3.6, 6.2));
  if (rise > 0) {
    const h = mix(20, 560, rise);
    const sway = Math.sin(t * 1.3) * 10 * rise;
    const base: [number, number] = [mx, my - 10];
    const pts: [number, number][] = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24;
      const x = base[0] + sway * u * u + Math.sin(u * 3) * 8;
      const y = base[1] - h * u;
      pts.push([x, y]);
    }
    // hook: last part curls downward
    const e = pts[pts.length - 1];
    const sg = c.createLinearGradient(base[0], base[1], e[0], e[1]);
    sg.addColorStop(0, "#8a6a3a"); sg.addColorStop(0.25, "#7e8f3a"); sg.addColorStop(1, "#a04a2a");
    c.save(); c.filter = "blur(8px)";
    taper(c, pts.map(([x, y]) => [x + 22, y + 8] as [number, number]), 22, 10, "rgba(20,10,5,0.35)");
    c.restore();
    taper(c, pts, 24, 12, sg);
    c.strokeStyle = "rgba(255,240,200,0.5)"; c.lineWidth = 3;
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - 6, y) : c.moveTo(x - 6, y))); c.stroke();
    c.save(); c.translate(e[0], e[1]);
    c.rotate(hook * 2.6);
    // young leaves: bronze-red -> fresh green as they open to the sun
    const col = mixHex("#9a4a26", "#6fa236", open);
    const leaves: [number, number, number][] = [[-0.95, 250, 0], [0.85, 230, 0.15], [0.05, 290, 0.3]];
    for (const [ang, len, delay] of leaves) {
      const o = clamp((open - delay) / (1 - delay));
      c.save(); c.rotate(ang * mix(0.15, 1, o));
      oakLeaf(c, len * mix(0.32, 1, eob(o)), col, { fold: 1 - o, gloss: 0.8 });
      c.restore();
    }
    c.restore();
    // dew drop on the tip of the top leaf, catching the sun
    const dw = lin(t, 5.6, 6.3);
    if (dw > 0) {
      const tipX = e[0] + 4, tipY = e[1] - 285 * mix(0.32, 1, eob(clamp((open - 0.3) / 0.7)));
      drop(c, tipX, tipY, 13 * dw, 1);
      const sp = Math.max(0, Math.sin(lin(t, 6.0, 6.9) * Math.PI));
      if (sp > 0) sparkle(c, tipX - 4, tipY - 4, 90 * sp, sp);
    }
  }
  // sunlight: rays from the low sun + lens flare as the leaves open
  rays(c, sunX, sunY, 2200, -0.25, 1.1, 12, "#ffdca0", 0.16 + 0.12 * open, t, 9);
  flare(c, sunX, sunY, 0.35 + 0.4 * open);
  // foreground blurred crumbs for depth
  c.save(); c.filter = "blur(12px)";
  stoneCrumb(c, 140, 1830, 90, 3); stoneCrumb(c, 980, 1760, 70, 4);
  c.restore();
}
function stoneCrumb(c: C, x: number, y: number, r: number, i: number) {
  const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r);
  g.addColorStop(0, "#c08a55"); g.addColorStop(0.5, "#7a4e2c"); g.addColorStop(1, "#2c1a0d");
  c.fillStyle = g;
  c.beginPath(); c.ellipse(x, y, r, r * (0.7 + (i % 3) * 0.08), i, 0, 6.29); c.fill();
}
export function sparkle(c: C, x: number, y: number, r: number, a: number) {
  c.save(); c.globalCompositeOperation = "lighter";
  glow(c, x, y, r * 0.8, "#fff6dc", 0.8 * a);
  for (const [ang, k] of [[0, 1], [Math.PI / 2, 1], [Math.PI / 4, 0.45], [-Math.PI / 4, 0.45]] as const) {
    const g = c.createLinearGradient(x - Math.cos(ang) * r * k, y - Math.sin(ang) * r * k, x + Math.cos(ang) * r * k, y + Math.sin(ang) * r * k);
    g.addColorStop(0, "rgba(255,250,230,0)"); g.addColorStop(0.5, `rgba(255,250,230,${0.95 * a})`); g.addColorStop(1, "rgba(255,250,230,0)");
    c.strokeStyle = g; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - Math.cos(ang) * r * k, y - Math.sin(ang) * r * k); c.lineTo(x + Math.cos(ang) * r * k, y + Math.sin(ang) * r * k); c.stroke();
  }
  c.restore();
}

// ---------------- S6 · the transformation (time-lapse) ----------------
type SeasonState = { a: Season; b: Season; mixAB: number; density: number; snow: number; ground: string; sky: [string, string, string] };
const SEASONS: [number, Season][] = [[38, "spring"], [40.6, "summer"], [43.0, "autumn"], [45.6, "winter"], [47.6, "spring"], [49.2, "summer"]];
const GROUND: Record<Season, string> = { spring: "#7ea43a", summer: "#5e852c", autumn: "#9a843c", winter: "#dde6ee" };
const SKY: Record<Season, [string, string, string]> = {
  spring: ["#5d8fc8", "#a9cbe8", "#f0e6c6"],
  summer: ["#3f7fc4", "#8fc0ea", "#e8eed8"],
  autumn: ["#6f86a8", "#d6b48e", "#f3c27e"],
  winter: ["#8a9bb0", "#c6d0da", "#e9edf1"],
};
export function seasonAt(T: number): SeasonState {
  let i = 0;
  for (let k = 0; k < SEASONS.length; k++) if (T >= SEASONS[k][0]) i = k;
  const cur = SEASONS[i][1], nxt = SEASONS[Math.min(SEASONS.length - 1, i + 1)];
  const m = i + 1 < SEASONS.length ? lin(T, nxt[0] - 0.7, nxt[0]) : 0;
  const nb = nxt[1];
  const col = (f: (s: Season) => string) => mixHex(f(cur), f(nb), m);
  const sky: [string, string, string] = [0, 1, 2].map((j) => mixHex(SKY[cur][j], SKY[nb][j], m)) as [string, string, string];
  // leaf amount through the year
  let density = 1;
  if (T < 40.6) density = mix(0.35, 0.95, lin(T, 38, 40.4));
  else if (T < 43.6) density = 1;
  else if (T < 45.6) density = mix(1, 0, eio(lin(T, 43.6, 45.4)));
  else if (T < 47.6) density = 0;
  else density = mix(0, 1, eo(lin(T, 47.6, 49.2)));
  const snow = lin(T, 45.5, 46.1) * (1 - lin(T, 47.2, 47.8));
  return { a: cur, b: nb, mixAB: m, density, snow, ground: col((s) => GROUND[s]), sky };
}
export const growth = (T: number) => { const p = lin(T, 38.3, 49.6); return Math.pow(p, 1.15) * (3 - 2 * p) * 0.5 + 0.5 * eio(p); };

function meadow(c: C, T: number, s: SeasonState, horizon: number) {
  const g = c.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, s.sky[0]); g.addColorStop(0.6, s.sky[1]); g.addColorStop(1, s.sky[2]);
  c.fillStyle = g; c.fillRect(0, 0, W, horizon + 4);
  // time-lapse sun: quick arcs across the sky (days flying by)
  const day = ((T - 38) / 1.25) % 1;
  const sx = mix(-120, W + 120, day), sy = horizon - 120 - Math.sin(day * Math.PI) * 700;
  glow(c, sx, sy, 520, "#fff0c8", 0.55 * Math.sin(day * Math.PI));
  // clouds racing
  const cl = cloudSheet("fair", 3);
  c.globalAlpha = 0.85;
  const off = ((T * 160) % 2200) - 1100;
  c.drawImage(cl, off - 300, horizon - 1350, 1700, 1100);
  c.drawImage(cl, off + 1300, horizon - 1250, 1700, 1100);
  c.globalAlpha = 1;
  // hills with aerial perspective
  const hills: [number, string, number][] = [[horizon - 150, mixHex(s.sky[1], "#4d6a50", 0.35), 0.004], [horizon - 70, mixHex(s.sky[1], "#3f5c34", 0.6), 0.007], [horizon - 10, mixHex(s.ground, "#2a3d1a", 0.4), 0.011]];
  hills.forEach(([y, col, f], i) => {
    c.fillStyle = col;
    c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x += 24) c.lineTo(x, y - Math.sin(x * f + i * 2) * 60 - noise1(x * 0.01 + i, 7 + i) * 40);
    c.lineTo(W, H); c.closePath(); c.fill();
  });
  // meadow
  const mg = c.createLinearGradient(0, horizon, 0, H);
  mg.addColorStop(0, mixHex(s.ground, "#fff", 0.1)); mg.addColorStop(1, mixHex(s.ground, "#16210a", 0.5));
  c.fillStyle = mg; c.fillRect(0, horizon, W, H - horizon);
  // sun-moving tree shadow + grass texture strokes
  const r = rng(71);
  for (let i = 0; i < 420; i++) {
    const y = horizon + Math.pow(r(), 1.4) * (H - horizon), x = r() * W;
    const k = (y - horizon) / (H - horizon);
    c.strokeStyle = rgba(mixHex(s.ground, r() < 0.5 ? "#0f1a06" : "#f6f3c0", 0.35), 0.6);
    c.lineWidth = 1 + k * 3;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + (r() - 0.5) * 6 + Math.sin(T * 2 + i) * 2, y - (6 + k * 34)); c.stroke();
  }
  // wildflowers in spring/summer
  const fl = s.snow > 0 ? 0 : (s.a === "spring" || s.a === "summer" ? 1 - (s.b === "autumn" ? s.mixAB : 0) : s.b === "spring" ? s.mixAB : 0);
  if (fl > 0) {
    for (let i = 0; i < 90; i++) {
      const y = horizon + 30 + Math.pow(r(), 1.3) * (H - horizon - 30), x = r() * W, k = (y - horizon) / (H - horizon);
      c.fillStyle = rgba(["#f4e7a0", "#ffffff", "#e9a9c8", "#ffd36a"][i % 4], 0.9 * fl);
      c.beginPath(); c.arc(x, y, 2 + k * 6, 0, 6.29); c.fill();
    }
  }
  if (s.snow > 0) {
    c.fillStyle = `rgba(240,245,250,${0.85 * s.snow})`; c.fillRect(0, horizon, W, H - horizon);
  }
}

export function scene6(c: C, T: number) {
  const s = seasonAt(T);
  const horizon = 1240;
  // camera: starts close on the seedling, pulls back & cranes up as the oak grows
  const p = eio(lin(T, 38, 46.5));
  const z = mix(3.2, 1, p);
  const baseX = 540, baseY = 1560;
  const fy = mix(baseY - 120, 1080, p); // focus point
  c.save();
  c.translate(W / 2, H * 0.55); c.scale(z, z); c.translate(-baseX, -fy);
  meadow(c, T, s, horizon);
  const g = growth(T);
  // shadow cast by the tree, swinging with the time-lapse sun
  const day = ((T - 38) / 1.25) % 1;
  c.save(); c.filter = "blur(14px)";
  c.fillStyle = `rgba(10,20,5,${0.28 * Math.sin(day * Math.PI) * (1 - s.snow * 0.4)})`;
  c.beginPath(); c.ellipse(baseX - (day - 0.5) * 500 * g, baseY + 20, 60 + 520 * g, 24 + 70 * g, 0, 0, 6.29); c.fill(); c.restore();
  const scale = 0.52;
  const opts = { g, density: s.density, snow: s.snow, t: T, wind: 1.2 };
  if (g < 0.07) {
    c.save(); c.globalAlpha = 1 - lin(g, 0.035, 0.07); seedling(c, baseX, baseY, g / 0.07, T); c.restore();
  }
  if (g >= 0.03) {
    c.save(); c.globalAlpha = lin(g, 0.03, 0.07);
    if (s.mixAB > 0 && s.a !== s.b && s.density > 0.05) {
      drawTree(c, baseX, baseY, scale, { ...opts, season: s.a });
      c.globalAlpha *= s.mixAB;
      drawTree(c, baseX, baseY, scale, { ...opts, season: s.b });
    } else drawTree(c, baseX, baseY, scale, { ...opts, season: s.mixAB > 0.5 ? s.b : s.a });
    c.restore();
  }
  // autumn leaves drifting down
  if (T > 43.2 && T < 46.5) {
    for (let i = 0; i < 70; i++) {
      const f = fallingLeaf(i, T, 43.3, baseX - 40, baseY - 640, 760, 700);
      if (!f) continue;
      c.save(); c.translate(f.x, f.y); c.rotate(f.rot); c.scale(1, 0.6 + 0.4 * Math.sin(f.rot * 2));
      oakLeaf(c, 26 * f.s, f.col, { veins: false, gloss: 0.3 });
      c.restore();
    }
  }
  c.restore();
  // snowfall in screen space
  if (s.snow > 0) {
    const r = rng(91);
    for (let i = 0; i < 160; i++) {
      const sp = 120 + r() * 220, x0 = r() * W, y = ((T * sp + r() * H) % (H + 40)) - 20;
      const x = x0 + Math.sin(T * 1.5 + i) * 24;
      const big = r() < 0.15;
      c.fillStyle = `rgba(255,255,255,${(big ? 0.5 : 0.85) * s.snow})`;
      c.beginPath(); c.arc(x, y, big ? 7 : 2 + r() * 2.5, 0, 6.29); c.fill();
    }
  }
  // seasonal grade
  const tint = s.a === "autumn" ? "#ffb060" : s.a === "winter" ? "#9fb8d8" : "#fff0c0";
  c.save(); c.globalCompositeOperation = "soft-light"; c.fillStyle = rgba(tint, 0.25); c.fillRect(0, 0, W, H); c.restore();
}
/** the same seedling as scene 5 (stem + three young oak leaves), for the opening of the time-lapse */
export function seedling(c: C, x: number, y: number, k: number, T: number) {
  const h = mix(80, 120, k);
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push([x + Math.sin(T * 1.3) * 3 * u * u + Math.sin(u * 3) * 2.5, y - h * u]); }
  const e = pts[pts.length - 1];
  const sg = c.createLinearGradient(x, y, e[0], e[1]);
  sg.addColorStop(0, "#8a6a3a"); sg.addColorStop(0.3, "#7e8f3a"); sg.addColorStop(1, "#7a7a30");
  taper(c, pts, 9, 5, sg);
  c.save(); c.translate(e[0], e[1]);
  for (const [ang, len] of [[-0.95, 80], [0.85, 74], [0.05, 92]] as const) {
    c.save(); c.rotate(ang); oakLeaf(c, len * mix(0.6, 0.75, k), "#6fa236", { gloss: 0.7 }); c.restore();
  }
  c.restore();
}

// ---------------- S7 · a new life ----------------
const BIRDS = [
  { from: [1250, 300], tip: 0, t0: 50.6, dur: 1.5 },
  { from: [-180, 520], tip: 1, t0: 51.4, dur: 1.6 },
  { from: [1250, 900], tip: 2, t0: 52.3, dur: 1.5 },
];
let PERCH: number[] | null = null;
export function scene7(c: C, T: number) {
  const t = T - T7;
  // golden hour, low angle under the great oak
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#3d6d9c"); g.addColorStop(0.45, "#9db7c4"); g.addColorStop(0.8, "#f1c37a"); g.addColorStop(1, "#f7d79a");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  const sunX = 300, sunY = 640;
  glow(c, sunX, sunY, 1100, "#ffd690", 0.75);
  // far horizon meadow (warm haze)
  c.save(); c.filter = "blur(6px)";
  c.fillStyle = "#8a8a4a";
  c.beginPath(); c.moveTo(0, 1650);
  for (let x = 0; x <= W; x += 30) c.lineTo(x, 1620 - Math.sin(x * 0.005) * 50 - noise1(x * 0.01, 2) * 30);
  c.lineTo(W, H); c.lineTo(0, H); c.fill();
  c.restore();
  const gr = c.createLinearGradient(0, 1640, 0, H);
  gr.addColorStop(0, "#6f8a35"); gr.addColorStop(1, "#24300f");
  c.fillStyle = gr; c.fillRect(0, 1700, W, H - 1700);
  // slow push-in + slight rise
  const z = mix(1.0, 1.08, eio(lin(t, 0, 6.5)));
  c.save();
  c.translate(W / 2, H * 0.45); c.scale(z, z); c.translate(-W / 2, -H * 0.45);
  const tips = drawTree(c, 560, 1960, 0.6, { g: 1, season: "summer", density: 1, t: T, wind: 0.8 });
  // perches: three sturdy outer twigs in view
  if (!PERCH) {
    const near = (tx: number, ty: number) => { let bi = 0, bd = 1e9; tips.forEach((p, i) => { const d = Math.hypot(p.x - tx, p.y - ty); if (d < bd) { bd = d; bi = i; } }); return bi; };
    PERCH = [near(840, 1030), near(300, 1010), near(600, 900)];
  }
  // light through the leaves: rays drawn over the crown, additive
  rays(c, sunX, sunY, 2400, -0.3, 1.6, 16, "#ffe2a8", 0.13, T, 12);
  // birds arriving
  BIRDS.forEach((b, k) => {
    const tip = tips[PERCH![k]];
    if (!tip) return;
    const p = lin(T, b.t0, b.t0 + b.dur);
    if (p <= 0) return;
    const e = eio(p);
    const x = mix(b.from[0], tip.x, e), y = mix(b.from[1], tip.y - 18, e) - Math.sin(p * Math.PI) * 120;
    const flip = b.from[0] > tip.x ? -1 : 1;
    c.save(); c.translate(x, y);
    bird(c, 92, T * 26 + k, lin(p, 0.9, 1), flip);
    c.restore();
  });
  // the circle of life: an acorn drops from the crown at the very end
  const ad = lin(T, 55.1, 56.4);
  if (ad > 0 && ad < 1) {
    c.save(); c.translate(720, mix(760, 1900, ei(ad))); c.rotate(ad * 4); acorn(c, 34, { t: T }); c.restore();
  }
  c.restore();
  // pollen / dust motes in the sunbeams
  const r = rng(42);
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 0; i < 70; i++) {
    const x = (r() * W + Math.sin(T * 0.5 + i) * 40 + T * 10) % W, y = (r() * H - T * (6 + r() * 10) + H) % H;
    c.fillStyle = `rgba(255,236,190,${0.25 + 0.35 * Math.sin(T * 2 + i) ** 2})`;
    c.beginPath(); c.arc(x, y, 1.2 + r() * 2.5, 0, 6.29); c.fill();
  }
  c.restore();
  flare(c, sunX, sunY, 0.5);
}
