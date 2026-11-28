// v26 — the oak. One procedural tree (fixed seed) drawn at every growth stage, so sprout, sapling and the
// great oak are the same living subject. Growth g: 0 (seedling) .. 1 (mature). Light from upper-left.
import { C, canvas, clamp, lin, memo, mix, mixHex, rng } from "./paint";

type Node = { parent: number; ang: number; len: number; w: number; depth: number; k1: number; k2: number; order: number };
export type Season = "spring" | "summer" | "autumn" | "winter";
const D = 6;

let TREE: Node[] | null = null;
export function tree(): Node[] {
  if (TREE) return TREE;
  const r = rng(2026);
  const nodes: Node[] = [];
  const add = (parent: number, ang: number, len: number, w: number, depth: number) => {
    const i = nodes.length;
    nodes.push({ parent, ang, len, w, depth, k1: (r() - 0.5) * 0.35, k2: (r() - 0.5) * 0.35, order: r() });
    if (depth >= D) return;
    // oak: short thick trunk that splits into wide, spreading limbs
    const kids = depth === 0 ? 4 : depth < 3 ? (r() < 0.6 ? 3 : 2) : 2;
    const spread = depth === 0 ? 0.85 : depth === 1 ? 0.62 : 0.55;
    for (let k = 0; k < kids; k++) {
      const u = k / (kids - 1) - 0.5;
      const a = u * 2 * spread + (r() - 0.5) * 0.35;
      const shrink = depth === 0 ? 0.78 : 0.72 + r() * 0.1;
      add(i, a, len * shrink * (depth === 0 ? 1 - Math.abs(u) * 0.25 : 1), w * (0.62 + r() * 0.08), depth + 1);
    }
  };
  add(-1, 0, 330, 74, 0);
  TREE = nodes;
  return nodes;
}

let KIDS_: number[][] | null = null;
function KIDS() {
  if (KIDS_) return KIDS_;
  const N = tree();
  KIDS_ = N.map(() => []);
  N.forEach((n, i) => { if (n.parent >= 0) KIDS_![n.parent].push(i); });
  return KIDS_;
}

export type TreeOpts = {
  g: number; // growth 0..1
  season: Season; // leaf palette
  density: number; // leaf amount 0..1
  snow?: number;
  t: number; // time for wind
  wind?: number;
  falling?: number; // autumn: leaves leaving
};
export type Tip = { x: number; y: number; depth: number; w: number };

const PAL: Record<Season, string[]> = {
  spring: ["#9cc84e", "#b5d867", "#7aa93a", "#c9e27a"],
  summer: ["#3f7d28", "#56923a", "#2d6420", "#6aa448"],
  autumn: ["#cf7a26", "#e0a33a", "#b2521d", "#9a6a22"],
  winter: ["#6b5a40", "#6b5a40", "#6b5a40", "#6b5a40"],
};
/** a cluster of small oak leaves, lit from the upper-left. tone 0 shadow .. 2 sunlit */
export function foliage(season: Season, tone: number, v: number) {
  return memo(`fol-${season}-${tone}-${v}`, () => {
    const S = 256, cv = canvas(S, S), c = cv.getContext("2d")!;
    const r = rng(500 + tone * 31 + v * 7 + season.length * 101);
    const pal = PAL[season];
    const N = 120;
    const leaves: [number, number, number, number, string, number][] = [];
    for (let i = 0; i < N; i++) {
      const a = r() * 6.283, d = Math.sqrt(r()) * 96;
      const x = 128 + Math.cos(a) * d * 1.08, y = 132 + Math.sin(a) * d * 0.88;
      const light = clamp(0.55 - (x - 128) / 260 - (y - 128) / 220 + (r() - 0.5) * 0.35);
      leaves.push([x, y, 10 + r() * 9, r() * 6.28, pal[Math.floor(r() * pal.length)], light]);
    }
    leaves.sort((a, b) => a[5] - b[5]); // shadowed first, lit on top
    const toneMul = [0.42, 0.72, 1.0][tone];
    for (const [x, y, s, rot, col, light] of leaves) {
      c.save(); c.translate(x, y); c.rotate(rot);
      const base = mixHex("#0b1406", col, clamp(toneMul * (0.55 + light * 0.6)));
      const hi = mixHex(base, "#fbffd8", 0.32 * light * toneMul);
      const g = c.createLinearGradient(-s, -s, s, s);
      g.addColorStop(0, hi); g.addColorStop(0.6, base); g.addColorStop(1, mixHex(base, "#050a02", 0.45));
      c.fillStyle = g;
      // small lobed leaf
      c.beginPath();
      c.moveTo(0, s);
      c.bezierCurveTo(-s * 0.75, s * 0.55, -s * 0.35, s * 0.1, -s * 0.6, -s * 0.15);
      c.bezierCurveTo(-s * 0.35, -s * 0.55, -s * 0.3, -s * 0.85, 0, -s);
      c.bezierCurveTo(s * 0.3, -s * 0.85, s * 0.35, -s * 0.55, s * 0.6, -s * 0.15);
      c.bezierCurveTo(s * 0.35, s * 0.1, s * 0.75, s * 0.55, 0, s);
      c.fill();
      c.strokeStyle = `rgba(250,255,220,${0.18 * light * toneMul})`; c.lineWidth = 0.8;
      c.beginPath(); c.moveTo(0, s * 0.9); c.lineTo(0, -s * 0.85); c.stroke();
      if (tone === 2 && light > 0.7) { // sun glint on a waxy leaf
        c.fillStyle = "rgba(255,250,215,0.55)";
        c.beginPath(); c.ellipse(-s * 0.2, -s * 0.3, s * 0.18, s * 0.42, 0.3, 0, 6.29); c.fill();
      }
      c.restore();
    }
    return cv;
  });
}

/** draw the oak with its base at (x0,y0). scale: px per unit. returns branch tips (for perching birds) */
export function drawTree(c: C, x0: number, y0: number, scale: number, o: TreeOpts): Tip[] {
  const N = tree();
  const g = clamp(o.g);
  // stage timing per depth: trunk first, finer twigs later
  const st = (d: number) => (d === 0 ? 0 : 0.06 + (d - 1) * 0.135);
  const size = mix(0.3, 1, Math.pow(g, 0.9));
  const pos: { x: number; y: number; a: number; vis: number }[] = [];
  const tips: Tip[] = [];
  const wind = o.wind ?? 1;
  type Seg = { pts: [number, number][]; w0: number; w1: number; d: number };
  const segs: Seg[] = [];
  const clusters: { x: number; y: number; s: number; d: number; h: number }[] = [];
  for (let i = 0; i < N.length; i++) {
    const n = N[i];
    const p = n.parent >= 0 ? pos[n.parent] : { x: x0, y: y0, a: -Math.PI / 2, vis: 1 };
    const vis = clamp((g - st(n.depth)) / 0.16) * (n.parent >= 0 ? clamp((p.vis - 0.55) / 0.45) : 1);
    const sway = Math.sin(o.t * 1.1 + n.order * 6 + n.depth * 0.7) * 0.018 * n.depth * wind + Math.sin(o.t * 2.7 + i) * 0.006 * n.depth * wind;
    let a = p.a + n.ang * (n.depth <= 1 ? mix(0.35, 1, g) : 1) + sway;
    a += (-Math.PI / 2 - a) * 0.1 * n.depth / D; // twigs turn up toward the light
    const L = n.len * scale * size * (0.15 + 0.85 * vis);
    if (vis <= 0) { pos.push({ x: p.x, y: p.y, a, vis: 0 }); continue; }
    // gnarled oak limb: three-point curve with kinks
    const x1 = p.x + Math.cos(a + n.k1) * L * 0.5, y1 = p.y + Math.sin(a + n.k1) * L * 0.5;
    const x2 = x1 + Math.cos(a + n.k2) * L * 0.5, y2 = y1 + Math.sin(a + n.k2) * L * 0.5;
    const w0 = n.w * scale * size * Math.pow(g, 0.35) * (n.depth === 0 ? 1 : 1), w1 = w0 * 0.72;
    segs.push({ pts: [[p.x, p.y], [x1, y1], [x2, y2]], w0: Math.max(1, w0), w1: Math.max(0.7, w1), d: n.depth });
    const endA = Math.atan2(y2 - y1, x2 - x1);
    pos.push({ x: x2, y: y2, a: endA, vis });
    const h = (n.order * 997) % 1;
    // frontier: the newest visible twig carries leaves (young trees stay leafy)
    const kids = KIDS()[i];
    const kidsVis = kids.length ? clamp((g - st(n.depth + 1)) / 0.16) * clamp((vis - 0.55) / 0.45) : 0;
    if (n.depth < 3 && kidsVis < 1) clusters.push({ x: x2, y: y2, s: scale * size * mix(420, 230, n.depth / 3) * vis * (1 - kidsVis * 0.7), d: n.depth, h: h * 0.6 });
    if (n.depth >= 1 && n.depth <= 3) clusters.push({ x: mix(p.x, x2, 0.8), y: mix(p.y, y2, 0.8) - 20 * scale, s: scale * size * 330 * vis, d: -1, h: h * 0.5 });
    if (n.depth >= 2) {
      clusters.push({ x: x2, y: y2, s: (n.depth >= 5 ? 1 : 1.25) * scale * size * 185 * vis, d: n.depth, h });
      clusters.push({ x: x1, y: y1, s: scale * size * (n.depth <= 3 ? 230 : 150) * vis, d: n.depth, h: (h * 7.3) % 1 });
    }
    if (n.depth >= 5) tips.push({ x: x2, y: y2, depth: n.depth, w: w1 });
  }
  const dens = o.density;
  // back foliage (shadowed) for crown depth
  if (dens > 0) {
    for (const k of clusters) {
      if (k.h > dens) continue;
      const s = k.s * 1.25 * mix(0.6, 1, dens);
      c.drawImage(foliage(o.season, 0, Math.floor(k.h * 3)), k.x - s / 2 + s * 0.08, k.y - s / 2 + s * 0.06, s, s);
    }
  }
  // branches
  for (const s of segs) limb(c, s.pts, s.w0, s.w1, s.d, o.snow ?? 0);
  // front foliage: mid then lit, sorted so the sunlit upper-left sits on top
  if (dens > 0) {
    const sorted = clusters.slice().sort((a, b) => b.x + b.y - (a.x + a.y));
    for (const k of sorted) {
      if (k.h > dens || k.d === -1) continue;
      const s = k.s * mix(0.6, 1, dens);
      const lit = (x0 - k.x) / (scale * 600) + (y0 - k.y) / (scale * 900);
      const tone = lit > 0.55 ? 2 : 1;
      c.drawImage(foliage(o.season, tone, Math.floor(k.h * 5) % 3), k.x - s / 2, k.y - s / 2, s, s);
    }
  }
  return tips;
}

function limb(c: C, pts: [number, number][], w0: number, w1: number, d: number, snow: number) {
  const [a, b, e] = pts;
  const dx = e[0] - a[0], dy = e[1] - a[1], m = Math.hypot(dx, dy) || 1;
  const nx = -dy / m, ny = dx / m;
  const path = new Path2D();
  path.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2);
  path.quadraticCurveTo(b[0] + nx * (w0 + w1) / 4, b[1] + ny * (w0 + w1) / 4, e[0] + nx * w1 / 2, e[1] + ny * w1 / 2);
  path.lineTo(e[0] - nx * w1 / 2, e[1] - ny * w1 / 2);
  path.quadraticCurveTo(b[0] - nx * (w0 + w1) / 4, b[1] - ny * (w0 + w1) / 4, a[0] - nx * w0 / 2, a[1] - ny * w0 / 2);
  path.closePath();
  // bark: lit on the left (sun), deep shade on the right
  const sideL = nx < 0 ? 1 : -1;
  const gx = c.createLinearGradient(b[0] + nx * w0 * 0.6 * sideL, b[1] + ny * w0 * 0.6 * sideL, b[0] - nx * w0 * 0.6 * sideL, b[1] - ny * w0 * 0.6 * sideL);
  gx.addColorStop(0, "#a08a6a"); gx.addColorStop(0.3, "#6d5a42"); gx.addColorStop(0.75, "#3a2e22"); gx.addColorStop(1, "#1d1610");
  c.fillStyle = gx; c.fill(path);
  if (w0 > 7) {
    c.save(); c.clip(path);
    const r = rng(Math.floor(a[0] * 13 + a[1] * 7));
    const nLines = Math.min(14, Math.floor(w0 / 5));
    for (let i = 0; i < nLines; i++) {
      const u = (r() - 0.5) * 0.9;
      c.strokeStyle = r() < 0.6 ? "rgba(20,14,8,0.5)" : "rgba(200,180,150,0.22)";
      c.lineWidth = Math.max(0.6, w0 * (0.02 + r() * 0.04));
      c.beginPath();
      const s0 = r() * 0.3, s1 = 0.6 + r() * 0.4;
      for (let k = 0; k <= 6; k++) {
        const f = mix(s0, s1, k / 6);
        const x = mix(mix(a[0], b[0], f), mix(b[0], e[0], f), f) + nx * u * mix(w0, w1, f) + Math.sin(f * 20 + i) * w0 * 0.03;
        const y = mix(mix(a[1], b[1], f), mix(b[1], e[1], f), f) + ny * u * mix(w0, w1, f);
        k ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke();
    }
    c.restore();
  }
  if (snow > 0 && d > 0) {
    c.strokeStyle = `rgba(250,252,255,${0.9 * snow})`; c.lineWidth = Math.max(1, w0 * 0.28); c.lineCap = "round";
    const up = ny < 0 ? 1 : -1;
    c.beginPath();
    c.moveTo(a[0] + nx * w0 * 0.45 * up, a[1] + ny * w0 * 0.45 * up);
    c.quadraticCurveTo(b[0] + nx * w0 * 0.4 * up, b[1] + ny * w0 * 0.4 * up, e[0] + nx * w1 * 0.4 * up, e[1] + ny * w1 * 0.4 * up);
    c.stroke();
  }
}

/** a single falling oak leaf position (deterministic) */
export function fallingLeaf(i: number, t: number, t0: number, x0: number, y0: number, spreadX: number, fallH: number) {
  const r = rng(i * 31 + 3);
  const start = t0 + r() * 3;
  const p = lin(t, start, start + 3.2 + r() * 1.5);
  if (p <= 0 || p >= 1) return null;
  const x = x0 + (r() - 0.5) * spreadX + Math.sin(p * 8 + r() * 6) * 40 + p * 90;
  const y = y0 + (r() - 0.3) * spreadX * 0.3 + p * fallH;
  return { x, y, rot: p * 9 * (r() < 0.5 ? -1 : 1) + r() * 6, s: 0.7 + r() * 0.6, col: ["#cf7a26", "#e0a33a", "#b2521d"][i % 3] };
}
