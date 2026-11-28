// v26 "The Story of a Seed" — painted hyperrealism toolkit (Canvas 2D).
// Everything is drawn by code: airbrushed gradients, crisp specular highlights, macro depth of field.
// Key light: warm sun from the upper-left in every scene (continuity).
export type C = CanvasRenderingContext2D;
export const W = 1080, H = 1920;

// ---------- math ----------
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lin = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;
export const eio = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const eo = (p: number) => 1 - Math.pow(1 - p, 3);
export const ei = (p: number) => p * p * p;
export const eob = (p: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (x: number, y: number, s: number) => {
  let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** periodic value noise (period p cells) */
function vnoise(x: number, y: number, p: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y);
  const fx = x - xi, fy = y - yi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const m = (n: number) => ((n % p) + p) % p;
  const a = hash(m(xi), m(yi), s), b = hash(m(xi + 1), m(yi), s), c = hash(m(xi), m(yi + 1), s), d = hash(m(xi + 1), m(yi + 1), s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm(x: number, y: number, p: number, s: number, oct = 5) {
  let sum = 0, amp = 0.5, f = 1, norm = 0;
  for (let i = 0; i < oct; i++) {
    sum += amp * vnoise(x * f, y * f, p * f, s + i * 17);
    norm += amp; amp *= 0.5; f *= 2;
  }
  return sum / norm;
}
export const noise1 = (x: number, s = 0) => vnoise(x, 0.5, 4096, s) * 2 - 1;

// ---------- canvas utilities ----------
const isBrowser = typeof document !== "undefined";
export function canvas(w: number, h: number) {
  const c = isBrowser ? document.createElement("canvas") : (null as unknown as HTMLCanvasElement);
  c.width = w; c.height = h;
  return c;
}
const cache = new Map<string, HTMLCanvasElement>();
export function memo(key: string, make: () => HTMLCanvasElement) {
  let c = cache.get(key);
  if (!c) { c = make(); cache.set(key, c); }
  return c;
}
export function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
export function mixHex(h1: string, h2: string, p: number) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(mix((a >> 16) & 255, (b >> 16) & 255, p));
  const g = Math.round(mix((a >> 8) & 255, (b >> 8) & 255, p));
  const bl = Math.round(mix(a & 255, b & 255, p));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}
export function roundRect(c: C, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}
export function reset(c: C) {
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalAlpha = 1;
  c.globalCompositeOperation = "source-over";
  c.filter = "none";
  c.shadowBlur = 0; c.shadowColor = "transparent";
}

// ---------- textures ----------
/** soil tile 1024², periodic: fbm color + grains + mineral glints. Hyperreal: crisp grains on a soft body. */
export function soilTile(variant: "top" | "deep" = "top") {
  return memo("soil-" + variant, () => {
    const S = 1024, cv = canvas(S, S), c = cv.getContext("2d")!;
    const img = c.createImageData(S, S), d = img.data;
    const base = variant === "top" ? [74, 46, 28] : [104, 74, 48];
    const hi = variant === "top" ? [128, 86, 52] : [150, 112, 74];
    for (let y = 0; y < S; y++)
      for (let x = 0; x < S; x++) {
        const n = fbm(x / 64, y / 64, 16, variant === "top" ? 3 : 9, 5);
        const g = hash(x, y, 5) * 0.18;
        const k = clamp(n * 1.25 - 0.15 + g - 0.09);
        const i = (y * S + x) * 4;
        d[i] = base[0] + (hi[0] - base[0]) * k;
        d[i + 1] = base[1] + (hi[1] - base[1]) * k;
        d[i + 2] = base[2] + (hi[2] - base[2]) * k;
        d[i + 3] = 255;
      }
    c.putImageData(img, 0, 0);
    const r = rng(variant === "top" ? 11 : 12);
    // grains: little crumbs with lit top-left and shadow bottom-right (drawn 3x3 tiled for seamlessness)
    const grains: [number, number, number, number, number][] = [];
    for (let i = 0; i < 2600; i++) grains.push([r() * S, r() * S, 1 + Math.pow(r(), 3) * 9, r(), r()]);
    for (const [gx, gy, gr, tone, rot] of grains)
      for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
        const x = gx + ox, y = gy + oy;
        if (x < -gr * 2 || y < -gr * 2 || x > S + gr * 2 || y > S + gr * 2) continue;
        c.save(); c.translate(x, y); c.rotate(rot * 6.28);
        c.fillStyle = "rgba(15,8,4,0.45)";
        c.beginPath(); c.ellipse(gr * 0.35, gr * 0.4, gr, gr * 0.75, 0, 0, 6.29); c.fill();
        const col = variant === "top" ? mixHex("#3d2414", "#a9774a", tone) : mixHex("#6b4a2c", "#c49a6a", tone);
        const gg = c.createRadialGradient(-gr * 0.35, -gr * 0.35, 0, 0, 0, gr * 1.1);
        gg.addColorStop(0, mixHex(col, "#f0d2a8", 0.45)); gg.addColorStop(0.55, col); gg.addColorStop(1, mixHex(col, "#1a0d05", 0.5));
        c.fillStyle = gg;
        c.beginPath(); c.ellipse(0, 0, gr, gr * 0.75, 0, 0, 6.29); c.fill();
        c.restore();
      }
    // mineral glints (quartz/mica)
    for (let i = 0; i < 380; i++) {
      const x = r() * S, y = r() * S, s = 0.6 + r() * 1.6;
      c.fillStyle = `rgba(255,240,215,${0.35 + r() * 0.5})`;
      c.fillRect(x, y, s, s);
    }
    return cv;
  });
}
export function soilPattern(c: C, v: "top" | "deep" = "top") {
  return c.createPattern(soilTile(v), "repeat")!;
}

/** cloud sheet: alpha-lit fbm clouds, 540×960, two looks */
export function cloudSheet(kind: "fair" | "storm", seed = 1) {
  return memo(`cloud-${kind}-${seed}`, () => {
    const w = 540, h = 640, cv = canvas(w, h), c = cv.getContext("2d")!;
    const img = c.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const wx = fbm(x / 140, y / 110, 64, seed + 40, 3) * 2.2, wy = fbm(x / 140 + 5, y / 110, 64, seed + 41, 3) * 2.2;
        const nx = x / 150 + wx, ny = y / 100 + wy;
        const n = fbm(nx, ny, 64, seed * 7 + (kind === "storm" ? 3 : 0), 5);
        const n2 = fbm(nx + 0.05, ny - 0.08, 64, seed * 7 + (kind === "storm" ? 3 : 0), 5);
        const vfall = kind === "storm" ? 1 - Math.pow(y / h, 1.4) * 0.35 : Math.sin((y / h) * Math.PI) ;
        const dens = clamp((n - (kind === "storm" ? 0.36 : 0.5)) * 3.2 * vfall);
        const light = clamp(0.5 + (n - n2) * 9); // lit from above-left
        const i = (y * w + x) * 4;
        if (kind === "storm") {
          const v = 70 + light * 80;
          d[i] = v * 0.92; d[i + 1] = v * 0.95; d[i + 2] = v * 1.05 + 6;
        } else {
          d[i] = 200 + light * 55; d[i + 1] = 196 + light * 52; d[i + 2] = 198 + light * 50;
        }
        d[i + 3] = dens * 255;
      }
    c.putImageData(img, 0, 0);
    return cv;
  });
}

/** film grain tile (gray, centered on 128) */
export function grainTile() {
  return memo("grain", () => {
    const S = 256, cv = canvas(S, S), c = cv.getContext("2d")!;
    const img = c.createImageData(S, S), d = img.data;
    const r = rng(99);
    for (let i = 0; i < S * S; i++) {
      const v = 128 + (r() + r() + r() - 1.5) * 90;
      d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return cv;
  });
}
export function grain(c: C, t: number, amt = 0.07) {
  const r = rng(Math.floor(t * 30) + 7);
  c.save(); reset(c);
  c.globalCompositeOperation = "overlay";
  c.globalAlpha = amt;
  const p = c.createPattern(grainTile(), "repeat")!;
  c.translate(-r() * 256, -r() * 256);
  c.fillStyle = p;
  c.fillRect(0, 0, W + 256, H + 256);
  c.restore();
}
export function vignette(c: C, amt = 0.5, col = "#000") {
  c.save();
  const g = c.createRadialGradient(W / 2, H * 0.48, H * 0.25, W / 2, H * 0.5, H * 0.75);
  g.addColorStop(0, rgba(col, 0)); g.addColorStop(1, rgba(col, amt));
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.restore();
}

// ---------- light ----------
/** soft round glow */
export function glow(c: C, x: number, y: number, r: number, col: string, a: number) {
  if (a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(0.35, rgba(col, a * 0.35)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
/** realistic bokeh disc: flat body, brighter rim */
export function bokeh(c: C, x: number, y: number, r: number, col: string, a: number) {
  if (a <= 0 || r < 1) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(col, a * 0.55)); g.addColorStop(0.78, rgba(col, a * 0.62)); g.addColorStop(0.92, rgba(col, a * 0.85)); g.addColorStop(1, rgba(col, 0));
  c.fillStyle = g;
  c.beginPath(); c.arc(x, y, r, 0, 6.29); c.fill();
}
/** volumetric god rays from a point, additive */
export function rays(c: C, x: number, y: number, len: number, ang0: number, ang1: number, n: number, col: string, a: number, t: number, seed = 1) {
  if (a <= 0) return;
  c.save();
  c.globalCompositeOperation = "lighter";
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const base = mix(ang0, ang1, (i + r() * 0.8) / n);
    const wob = 0.012 * Math.sin(t * 0.7 + i * 1.7);
    const wdt = 0.012 + r() * 0.035;
    const aa = a * (0.35 + 0.65 * r()) * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 2.1));
    const g = c.createRadialGradient(x, y, 0, x, y, len * (0.6 + 0.4 * r()));
    g.addColorStop(0, rgba(col, aa)); g.addColorStop(0.5, rgba(col, aa * 0.35)); g.addColorStop(1, rgba(col, 0));
    c.fillStyle = g;
    c.beginPath(); c.moveTo(x, y);
    c.arc(x, y, len, base + wob - wdt, base + wob + wdt);
    c.closePath(); c.fill();
  }
  c.restore();
}
/** anamorphic-ish lens flare chain along the line from sun through centre */
export function flare(c: C, sx: number, sy: number, a: number) {
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = "lighter";
  glow(c, sx, sy, 520, "#ffd9a0", 0.55 * a);
  glow(c, sx, sy, 140, "#fff6e0", 0.9 * a);
  const g = c.createLinearGradient(sx - 700, sy, sx + 700, sy);
  g.addColorStop(0, "rgba(255,200,140,0)"); g.addColorStop(0.5, rgba("#ffe2b8", 0.35 * a)); g.addColorStop(1, "rgba(255,200,140,0)");
  c.fillStyle = g; c.fillRect(sx - 700, sy - 3, 1400, 6);
  const cx = W / 2, cy = H / 2;
  const ghosts: [number, number, string, number][] = [[0.6, 40, "#9fd8ff", 0.12], [1.2, 90, "#ffcf8a", 0.09], [1.55, 26, "#c8ffb0", 0.14], [1.9, 150, "#ffb070", 0.06]];
  for (const [k, r, col, al] of ghosts) bokeh(c, sx + (cx - sx) * k * 1.2, sy + (cy - sy) * k * 1.2, r, col, al * a);
  c.restore();
}

// ---------- organic shapes ----------
/** hyperreal acorn. Local frame: cap rim at y=0, tip at y=+L. light from upper-left.
 *  wet 0..1 darkens + beads; crack 0..1 splits from the tip; glossy specular always. */
export function acorn(c: C, L: number, opt: { wet?: number; crack?: number; t?: number; cap?: boolean; capOpen?: number } = {}) {
  const wet = opt.wet ?? 0, crack = opt.crack ?? 0, t = opt.t ?? 0;
  const R = L * 0.4;
  // contact shadow handled by caller
  // ---- nut body
  c.save();
  const body = new Path2D();
  body.moveTo(-R * 0.98, 0);
  body.bezierCurveTo(-R * 1.08, L * 0.42, -R * 0.62, L * 0.86, -R * 0.07, L * 0.985);
  body.quadraticCurveTo(0, L * 1.03, R * 0.07, L * 0.985);
  body.bezierCurveTo(R * 0.62, L * 0.86, R * 1.08, L * 0.42, R * 0.98, 0);
  body.closePath();
  const dark = mixHex("#4a2510", "#2a1307", wet), mid = mixHex("#9a5523", "#6a3412", wet), lite = mixHex("#d99555", "#a96433", wet);
  const g = c.createLinearGradient(-R, 0, R, 0);
  g.addColorStop(0, dark); g.addColorStop(0.18, mid); g.addColorStop(0.36, lite); g.addColorStop(0.55, mid); g.addColorStop(0.85, dark); g.addColorStop(1, mixHex(dark, "#000", 0.3));
  c.fillStyle = g; c.fill(body);
  c.save(); c.clip(body);
  // tip darkening + base band (where cap protects -> paler, matte)
  const gv = c.createLinearGradient(0, 0, 0, L);
  gv.addColorStop(0, "rgba(232,196,140,0.55)"); gv.addColorStop(0.12, "rgba(200,150,90,0.0)"); gv.addColorStop(0.75, "rgba(0,0,0,0)"); gv.addColorStop(1, "rgba(20,8,2,0.55)");
  c.fillStyle = gv; c.fillRect(-R * 1.2, 0, R * 2.4, L * 1.05);
  // fine longitudinal striations
  c.lineWidth = Math.max(0.6, L * 0.004);
  for (let i = -10; i <= 10; i++) {
    const x = (i / 10) * R;
    c.strokeStyle = `rgba(${i % 3 === 0 ? "30,12,4" : "235,190,130"},${i % 3 === 0 ? 0.16 : 0.07})`;
    c.beginPath(); c.moveTo(x, 0);
    c.quadraticCurveTo(x * 1.05, L * 0.55, x * 0.1, L * 0.98);
    c.stroke();
  }
  // big glossy specular (sharp core + soft halo) — the hyperreal signature
  c.filter = `blur(${L * 0.03}px)`;
  c.fillStyle = `rgba(255,236,205,${0.42 + wet * 0.3})`;
  c.beginPath(); c.ellipse(-R * 0.42, L * 0.36, R * 0.16, L * 0.24, -0.12, 0, 6.29); c.fill();
  c.filter = "none";
  c.fillStyle = `rgba(255,250,240,${0.75 + wet * 0.2})`;
  c.beginPath(); c.ellipse(-R * 0.45, L * 0.3, R * 0.05, L * 0.1, -0.12, 0, 6.29); c.fill();
  // secondary sky-reflection on the right
  c.fillStyle = `rgba(170,200,230,${0.1 + wet * 0.18})`;
  c.beginPath(); c.ellipse(R * 0.62, L * 0.45, R * 0.07, L * 0.22, 0.15, 0, 6.29); c.fill();
  // wet sheen streaks
  if (wet > 0) {
    c.globalAlpha = wet * 0.55;
    c.strokeStyle = "rgba(255,255,255,0.6)"; c.lineWidth = L * 0.008;
    c.beginPath(); c.moveTo(-R * 0.2, L * 0.15); c.quadraticCurveTo(-R * 0.15, L * 0.55, -R * 0.02, L * 0.86); c.stroke();
    c.globalAlpha = 1;
  }
  c.restore();
  // rim light (warm) on left edge
  c.strokeStyle = `rgba(255,205,140,${0.25 + 0.1 * wet})`; c.lineWidth = L * 0.01;
  c.save(); c.clip(body); c.translate(L * 0.012, 0); c.stroke(body); c.restore();
  // tip nub
  c.fillStyle = "#24110a";
  c.beginPath(); c.ellipse(0, L * 0.995, R * 0.07, L * 0.025, 0, 0, 6.29); c.fill();
  // crack from the tip, root-cream peeking inside
  if (crack > 0) {
    const r = rng(41);
    const pts: [number, number][] = [[0, L]];
    const n = 9;
    for (let i = 1; i <= n; i++) {
      const p = i / n;
      if (p > crack) break;
      pts.push([(r() - 0.5) * R * 0.25 + Math.sin(p * 5) * R * 0.05, L * (1 - p * 0.62)]);
    }
    c.lineCap = "round"; c.lineJoin = "round";
    c.strokeStyle = "#140803"; c.lineWidth = L * 0.022 * (0.4 + crack);
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
    c.strokeStyle = `rgba(235,210,160,${0.5 * crack})`; c.lineWidth = L * 0.005 * crack;
    c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x + L * 0.003, y) : c.moveTo(x + L * 0.003, y))); c.stroke();
  }
  // water beads
  if (wet > 0.05) {
    const r = rng(77);
    const N = Math.floor(14 * wet);
    for (let i = 0; i < N; i++) {
      const u = r() * 2 - 1, v = 0.12 + r() * 0.78;
      const x = u * R * 0.85 * Math.sin(Math.PI * (0.2 + v * 0.75)), y = v * L + Math.min(t * 6 * r(), 0) ;
      drop(c, x, y, L * (0.018 + r() * 0.035) * clamp(wet * 1.4 - r() * 0.3), 0.95);
    }
  }
  c.restore();
  // ---- cap (cupule)
  if (opt.cap !== false) acornCap(c, L, R);
}
export function acornCap(c: C, L: number, R: number) {
  c.save();
  const cap = new Path2D();
  cap.moveTo(-R * 1.12, L * 0.04);
  cap.bezierCurveTo(-R * 1.2, -L * 0.2, -R * 0.6, -L * 0.36, 0, -L * 0.36);
  cap.bezierCurveTo(R * 0.6, -L * 0.36, R * 1.2, -L * 0.2, R * 1.12, L * 0.04);
  cap.quadraticCurveTo(0, L * 0.12, -R * 1.12, L * 0.04);
  cap.closePath();
  const g = c.createLinearGradient(-R, -L * 0.3, R, L * 0.05);
  g.addColorStop(0, "#8b7246"); g.addColorStop(0.4, "#6a5330"); g.addColorStop(1, "#2c2112");
  c.fillStyle = g; c.fill(cap);
  c.save(); c.clip(cap);
  // overlapping scales, row by row (cupule bracts)
  const rows = 6;
  for (let rI = 0; rI < rows; rI++) {
    const yy = -L * 0.32 + (rI / (rows - 1)) * L * 0.38;
    const n = 9 + rI * 2;
    const ww = R * (0.62 + rI * 0.1);
    for (let k = 0; k < n; k++) {
      const u = (k + (rI % 2) * 0.5) / n * 2 - 1;
      const x = u * ww * 1.1;
      const s = R * 0.17;
      const lit = clamp(0.65 - u * 0.45 - rI * 0.03);
      const sg = c.createLinearGradient(x, yy - s, x, yy + s);
      sg.addColorStop(0, mixHex("#3a2c18", "#c8ad78", lit)); sg.addColorStop(1, mixHex("#1e160b", "#7a6038", lit));
      c.fillStyle = sg;
      c.beginPath(); c.ellipse(x, yy, s * 0.95, s * 0.7, u * 0.4, 0, 6.29); c.fill();
      c.strokeStyle = "rgba(20,12,5,0.55)"; c.lineWidth = Math.max(0.6, L * 0.004);
      c.beginPath(); c.ellipse(x, yy + s * 0.12, s * 0.95, s * 0.62, u * 0.4, 0.2, 2.9); c.stroke();
    }
  }
  // shading of the rounded cap
  const sh = c.createRadialGradient(-R * 0.5, -L * 0.28, 0, 0, -L * 0.1, R * 1.4);
  sh.addColorStop(0, "rgba(255,230,180,0.25)"); sh.addColorStop(0.6, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.5)");
  c.fillStyle = sh; c.fillRect(-R * 1.3, -L * 0.4, R * 2.6, L * 0.6);
  c.restore();
  // rim lip
  c.strokeStyle = "rgba(30,20,10,0.8)"; c.lineWidth = L * 0.012;
  c.beginPath(); c.moveTo(-R * 1.1, L * 0.04); c.quadraticCurveTo(0, L * 0.12, R * 1.1, L * 0.04); c.stroke();
  c.strokeStyle = "rgba(220,190,140,0.35)"; c.lineWidth = L * 0.005;
  c.beginPath(); c.moveTo(-R * 1.05, L * 0.03); c.quadraticCurveTo(0, L * 0.1, R * 0.4, L * 0.07); c.stroke();
  // stem stub
  const st = c.createLinearGradient(-R * 0.1, 0, R * 0.12, 0);
  st.addColorStop(0, "#6e5732"); st.addColorStop(1, "#2a1f10");
  c.fillStyle = st;
  c.beginPath(); c.moveTo(-R * 0.09, -L * 0.35); c.quadraticCurveTo(-R * 0.14, -L * 0.48, -R * 0.02, -L * 0.53); c.lineTo(R * 0.1, -L * 0.5); c.quadraticCurveTo(R * 0.04, -L * 0.44, R * 0.1, -L * 0.35); c.fill();
  c.restore();
}

/** refractive water drop — dark lower rim, inverted bright caustic, sharp specular */
export function drop(c: C, x: number, y: number, r: number, a = 1) {
  if (r < 0.6) return;
  c.save(); c.globalAlpha = a;
  c.fillStyle = "rgba(0,0,0,0.25)";
  c.beginPath(); c.ellipse(x + r * 0.25, y + r * 0.35, r * 1.02, r * 0.92, 0, 0, 6.29); c.fill();
  const g = c.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
  g.addColorStop(0, "rgba(255,255,255,0.10)"); g.addColorStop(0.65, "rgba(160,190,210,0.12)"); g.addColorStop(0.9, "rgba(20,30,40,0.45)"); g.addColorStop(1, "rgba(10,15,20,0.6)");
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.29); c.fill();
  c.fillStyle = "rgba(255,248,230,0.55)";
  c.beginPath(); c.ellipse(x + r * 0.2, y + r * 0.48, r * 0.45, r * 0.22, 0, 0, 6.29); c.fill();
  c.fillStyle = "rgba(255,255,255,0.95)";
  c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.4, r * 0.2, r * 0.13, -0.6, 0, 6.29); c.fill();
  c.restore();
}

/** tapered stroke along a polyline (root, stem). w0 at start, w1 at end. */
export function taper(c: C, pts: [number, number][], w0: number, w1: number, fill: string | CanvasGradient) {
  if (pts.length < 2) return;
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1];
    const m = Math.hypot(dx, dy) || 1; dx /= m; dy /= m;
    const w = mix(w0, w1, i / (pts.length - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]);
    R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  c.fillStyle = fill;
  c.beginPath();
  L.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  const e = pts[pts.length - 1];
  c.lineTo(e[0], e[1]);
  for (let i = R.length - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
  c.closePath(); c.fill();
}
/** catmull-rom resample of control points to N points; returns cumulative length too */
export function spline(cp: [number, number][], N: number): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const u = (i / (N - 1)) * (cp.length - 1);
    const k = Math.min(cp.length - 2, Math.floor(u)), f = u - k;
    const p0 = cp[Math.max(0, k - 1)], p1 = cp[k], p2 = cp[k + 1], p3 = cp[Math.min(cp.length - 1, k + 2)];
    const f2 = f * f, f3 = f2 * f;
    const q = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * f + (2 * a - 5 * b + 4 * cc - d) * f2 + (-a + 3 * b - 3 * cc + d) * f3);
    out.push([q(p0[0], p1[0], p2[0], p3[0]), q(p0[1], p1[1], p2[1], p3[1])]);
  }
  return out;
}
/** take the first `len` px of a polyline */
export function cut(pts: [number, number][], len: number): [number, number][] {
  const out: [number, number][] = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (acc + d >= len) {
      const f = (len - acc) / d;
      out.push([mix(pts[i - 1][0], pts[i][0], f), mix(pts[i - 1][1], pts[i][1], f)]);
      return out;
    }
    acc += d; out.push(pts[i]);
  }
  return out;
}
export function plen(pts: [number, number][]) {
  let a = 0;
  for (let i = 1; i < pts.length; i++) a += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return a;
}

/** a young root: ivory, translucent tip, fuzzy root-hair zone behind the tip */
export function root(c: C, pts: [number, number][], w0: number, t: number, hairs = true) {
  if (pts.length < 2) return;
  const n = pts.length;
  // shadow/depth
  c.save();
  c.filter = "blur(6px)";
  taper(c, pts.map(([x, y]) => [x + 6, y + 8] as [number, number]), w0 * 1.1, w0 * 0.3, "rgba(15,6,2,0.55)");
  c.filter = "none";
  const e = pts[n - 1], s = pts[0];
  const g = c.createLinearGradient(s[0], s[1], e[0], e[1]);
  g.addColorStop(0, "#c9a777"); g.addColorStop(0.6, "#efe2c4"); g.addColorStop(1, "#fff6e2");
  taper(c, pts, w0, w0 * 0.28, g);
  // specular line along the root
  c.strokeStyle = "rgba(255,255,250,0.55)"; c.lineWidth = Math.max(1, w0 * 0.12); c.lineCap = "round";
  c.beginPath();
  pts.forEach(([x, y], i) => { const k = i / (n - 1); const o = -w0 * 0.22 * (1 - k * 0.7); i ? c.lineTo(x + o, y + o * 0.3) : c.moveTo(x + o, y + o * 0.3); });
  c.stroke();
  // root hairs
  if (hairs && n > 6) {
    const r = rng(n * 13 + 5);
    c.lineWidth = 1;
    const from = Math.max(1, n - 1 - Math.floor(n * 0.45)), to = Math.max(1, n - 4);
    for (let i = from; i < to; i++) {
      const a = pts[i - 1], b = pts[i];
      const dx = b[0] - a[0], dy = b[1] - a[1], m = Math.hypot(dx, dy) || 1;
      for (let k = 0; k < 4; k++) {
        const side = r() < 0.5 ? -1 : 1;
        const len = 8 + r() * 22 * (1 - Math.abs((i - from) / (to - from) - 0.5));
        const ang = Math.atan2(dy, dx) + side * (1.2 + r() * 0.6) + Math.sin(t * 2 + i) * 0.05;
        c.strokeStyle = `rgba(255,248,232,${0.35 + r() * 0.4})`;
        c.beginPath(); c.moveTo(b[0], b[1]);
        c.quadraticCurveTo(b[0] + Math.cos(ang) * len * 0.6 + dx / m * 4, b[1] + Math.sin(ang) * len * 0.6 + dy / m * 4, b[0] + Math.cos(ang) * len, b[1] + Math.sin(ang) * len);
        c.stroke();
      }
    }
  }
  // glowing translucent tip (root cap)
  glow(c, e[0], e[1], w0 * 1.6, "#fff4d8", 0.45);
  c.restore();
}

/** lobed oak leaf, base at (0,0), pointing up (-y). light upper-left. col = base green. */
export function oakLeaf(c: C, L: number, col: string, opt: { fold?: number; gloss?: number; veins?: boolean; edge?: string } = {}) {
  const fold = opt.fold ?? 0; // 0 open .. 1 closed (narrow)
  const Wd = L * 0.36 * (1 - fold * 0.8);
  const N = 40, lobes = 4.5;
  const left: [number, number][] = [], right: [number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const env = Math.pow(Math.sin(Math.PI * Math.pow(u, 0.85)), 0.75) * (0.55 + 0.45 * u);
    const lobe = 0.62 + 0.38 * Math.abs(Math.sin(lobes * Math.PI * u + 0.3));
    const w = Wd * env * lobe;
    const y = -L * u;
    left.push([-w, y]); right.push([w * 0.96, y]);
  }
  const leaf = new Path2D();
  leaf.moveTo(0, 0);
  left.forEach(([x, y]) => leaf.lineTo(x, y));
  for (let i = right.length - 1; i >= 0; i--) leaf.lineTo(right[i][0], right[i][1]);
  leaf.closePath();
  c.save();
  const g = c.createLinearGradient(-Wd, -L * 0.8, Wd, 0);
  g.addColorStop(0, mixHex(col, "#f6ffd0", 0.35)); g.addColorStop(0.45, col); g.addColorStop(1, mixHex(col, "#0d1a05", 0.55));
  c.fillStyle = g; c.fill(leaf);
  c.save(); c.clip(leaf);
  // half-fold shading: right half darker
  c.fillStyle = "rgba(10,25,5,0.22)"; c.fillRect(0, -L, Wd, L);
  if (opt.edge) { c.strokeStyle = opt.edge; c.lineWidth = L * 0.05; c.stroke(leaf); }
  if (opt.veins !== false) {
    c.strokeStyle = rgba(mixHex(col, "#f4ffd8", 0.6), 0.75); c.lineWidth = Math.max(0.8, L * 0.018);
    c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.02, -L * 0.5, 0, -L * 0.98); c.stroke();
    c.lineWidth = Math.max(0.5, L * 0.008);
    for (let k = 1; k <= 4; k++) {
      const u = (k - 0.6) / lobes;
      for (const s of [-1, 1]) {
        c.beginPath(); c.moveTo(0, -L * u * 0.95);
        c.quadraticCurveTo(s * Wd * 0.35, -L * (u + 0.03), s * Wd * 0.8, -L * (u + 0.07)); c.stroke();
      }
    }
  }
  // gloss sheen
  const gl = opt.gloss ?? 0.5;
  const sg = c.createLinearGradient(-Wd * 0.6, -L * 0.7, Wd * 0.2, -L * 0.3);
  sg.addColorStop(0, "rgba(255,255,240,0)"); sg.addColorStop(0.5, `rgba(255,255,240,${0.32 * gl})`); sg.addColorStop(1, "rgba(255,255,240,0)");
  c.fillStyle = sg; c.fillRect(-Wd, -L, Wd * 2, L);
  c.restore();
  c.restore();
}

/** grass blade: tapered curved blade with midrib highlight */
export function blade(c: C, x: number, y: number, h: number, w: number, bend: number, col: string) {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 12; i++) {
    const u = i / 12;
    pts.push([x + bend * h * u * u, y - h * u]);
  }
  const g = c.createLinearGradient(x, y, x + bend * h, y - h);
  g.addColorStop(0, mixHex(col, "#0b1404", 0.6)); g.addColorStop(0.55, col); g.addColorStop(1, mixHex(col, "#e8f5b0", 0.35));
  taper(c, pts, w, 0.5, g);
}

/** bird (side view, wings flapping). s ~ body length. phase drives flap; perch=1 folds wings */
export function bird(c: C, s: number, phase: number, perch: number, flip = 1) {
  c.save(); c.scale(flip, 1);
  const flap = Math.sin(phase) * (1 - perch);
  // tail
  c.fillStyle = "#2b2218";
  c.beginPath(); c.moveTo(-s * 0.35, 0); c.lineTo(-s * 0.85, -s * 0.06 + perch * s * 0.12); c.lineTo(-s * 0.8, s * 0.1 + perch * s * 0.14); c.closePath(); c.fill();
  // body
  const g = c.createLinearGradient(0, -s * 0.25, 0, s * 0.25);
  g.addColorStop(0, "#5a4632"); g.addColorStop(0.55, "#8a6a48"); g.addColorStop(1, "#d8c3a0");
  c.fillStyle = g;
  c.beginPath(); c.ellipse(0, 0, s * 0.42, s * 0.2, -0.1 - perch * 0.25, 0, 6.29); c.fill();
  // head
  c.fillStyle = "#4a3828";
  c.beginPath(); c.arc(s * 0.36, -s * 0.12 - perch * s * 0.06, s * 0.14, 0, 6.29); c.fill();
  c.fillStyle = "#c89a5a";
  c.beginPath(); c.moveTo(s * 0.48, -s * 0.14 - perch * s * 0.06); c.lineTo(s * 0.6, -s * 0.1 - perch * s * 0.06); c.lineTo(s * 0.47, -s * 0.08 - perch * s * 0.06); c.fill();
  c.fillStyle = "#0a0806"; c.beginPath(); c.arc(s * 0.4, -s * 0.15 - perch * s * 0.06, s * 0.025, 0, 6.29); c.fill();
  c.fillStyle = "rgba(255,255,255,0.8)"; c.beginPath(); c.arc(s * 0.395, -s * 0.158 - perch * s * 0.06, s * 0.008, 0, 6.29); c.fill();
  // wing
  c.fillStyle = "#3a2c1f";
  c.beginPath(); c.moveTo(-s * 0.1, -s * 0.05);
  if (perch > 0.5) {
    c.quadraticCurveTo(-s * 0.25, -s * 0.12, -s * 0.5, s * 0.04); c.quadraticCurveTo(-s * 0.1, s * 0.12, s * 0.15, 0);
  } else {
    c.quadraticCurveTo(-s * 0.05, -s * 0.5 * flap - s * 0.1, -s * 0.35, -s * 0.9 * flap); c.quadraticCurveTo(-s * 0.2, -s * 0.2 * flap, s * 0.2, 0);
  }
  c.closePath(); c.fill();
  c.restore();
}
