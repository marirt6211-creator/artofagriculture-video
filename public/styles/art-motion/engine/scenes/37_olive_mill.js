// 37o · «باغ زیتون» — Persian-miniature olive garden, six shots for the v13 reel (NFP-Alvana original, same rules as 37_persian):
// gold sky with tchi-cloud ribbons, high horizon and stacked planes, flat jewel colours, ornament, moon-faced figures.
// The main subject of every shot sits in the centre strip (x≈660–1260) so a vertical 9:16 crop around focus 0.5 holds it.
// One file registers all six ids (each id has an identical copy so the loader can find any of them first).
//   37_olive_grove   the ancient tree on the terraced hill, rows of olives behind, silver shimmer runs through the leaves
//   37_olive_leaves  close-up: branches in the wind, leaves flip their silver undersides as gusts pass
//   37_olive_ripen   close-up: clusters ripen green → violet → black, autumn leaves fall
//   37_olive_harvest a gardener beats the branches with a long pole, olives rain onto a red cloth, a woman gathers
//   37_olive_mill    a stone wheel rolls round the basin, pushed by a man on the beam, paste glistens
//   37_olive_oil     green-gold oil pours from the press spout into a lapis jar, the light glows
//   37_olive_peace   golden evening over the grove, a white dove with an olive twig hovers above the old tree
(() => {
if (SCENES['37_olive_grove']) return;
const W = 1920, H = 1080, TAU = Math.PI * 2, CX = 960;
const C = {
  gold: '#d6a845', goldHi: '#f3d88a', goldDk: '#8f6a1e', lapis: '#1f3a8a', lapisDk: '#13245a', turq: '#2aa3a3', turqHi: '#7fd6cf',
  ver: '#c23a2b', verDk: '#7e2118', ivory: '#f3e7c8', rose: '#d97b8c', green: '#2f6b3d', greenHi: '#5d9a4c', greenDk: '#1d4528',
  hill: '#c9a6c8', hill2: '#e2c48e', brick: '#d9b48a', ink: '#2a1a12', skin: '#f2d6b8', white: '#fbf6ea',
  leaf: '#4f6b3a', leafDk: '#33482a', silver: '#cfd8c6', bark: '#6b5442', barkDk: '#3f2f24', barkHi: '#a08b70',
  olG: '#8ea443', olV: '#6b2d5c', olB: '#2a1a2a', oil: '#c9b13a', oilHi: '#f4e48a', stone: '#a9a39a', stoneDk: '#6e6a63',
};
const rng = U.rng;
const S = (a, b, x) => U.ss(a, b, x);
const mix = (a, b, q) => { const p = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * q)).join(',')})`; };

// ---------- cached layers ----------
let tile = null, borderC = null, lawn = null;
function girihTile(sz) {
  const c = document.createElement('canvas'); c.width = sz; c.height = sz; const g = c.getContext('2d');
  g.fillStyle = C.ivory; g.fillRect(0, 0, sz, sz);
  const star = (x, y, r, fill, line) => { g.beginPath(); for (let i = 0; i < 16; i++) { const a = i * TAU / 16 - Math.PI / 2, rr = i % 2 ? r * 0.62 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = sz * 0.025; g.strokeStyle = line; g.stroke(); };
  for (const [x, y] of [[0, 0], [sz, 0], [0, sz], [sz, sz]]) star(x, y, sz * 0.32, C.lapis, C.goldDk);
  star(sz / 2, sz / 2, sz * 0.36, C.turq, C.goldDk);
  g.beginPath(); g.arc(sz / 2, sz / 2, sz * 0.1, 0, TAU); g.fillStyle = C.gold; g.fill();
  g.fillStyle = C.ver; for (const [x, y] of [[sz / 2, 0], [0, sz / 2], [sz, sz / 2], [sz / 2, sz]]) { g.beginPath(); g.arc(x, y, sz * 0.07, 0, TAU); g.fill(); }
  return c;
}
function makeBorder() {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d');
  g.fillStyle = C.lapisDk; g.fillRect(0, 0, W, H); g.clearRect(70, 70, W - 140, H - 140);
  const band = (x0, y0, x1, y1, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.strokeRect(x0, y0, x1 - x0, y1 - y0); };
  band(14, 14, W - 14, H - 14, C.gold, 6); band(62, 62, W - 62, H - 62, C.gold, 5); band(70, 70, W - 70, H - 70, C.ver, 3);
  g.strokeStyle = C.gold; g.fillStyle = C.goldHi; g.lineWidth = 3.2;
  const vine = (L, at) => { g.beginPath(); for (let s = 0; s <= L; s += 4) { const [x, y] = at(s, Math.sin(s / 38) * 12); s ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    for (let s = 19; s < L; s += 76) { const [x, y] = at(s, Math.sin(s / 38) * 12); g.beginPath(); g.ellipse(x, y, 9, 4.5, Math.cos(s / 38), 0, TAU); g.fill(); } };
  vine(W - 76, (s, d) => [38 + s, 38 + d]); vine(W - 76, (s, d) => [38 + s, H - 38 + d]);
  vine(H - 76, (s, d) => [38 + d, 38 + s]); vine(H - 76, (s, d) => [W - 38 + d, 38 + s]);
  for (const [x, y] of [[38, 38], [W - 38, 38], [38, H - 38], [W - 38, H - 38]]) { g.fillStyle = C.ver; g.beginPath(); g.arc(x, y, 18, 0, TAU); g.fill(); g.strokeStyle = C.gold; g.stroke(); }
  return c;
}
function makeLawn() {
  const c = document.createElement('canvas'); c.width = W; c.height = 520; const g = c.getContext('2d');
  g.fillStyle = C.green; g.fillRect(0, 0, W, 520);
  const r = rng(41);
  for (let y = 14; y < 520; y += 30) for (let x = (y / 30 % 2) * 22; x < W; x += 44) {
    const jx = x + (r() - 0.5) * 10, jy = y + (r() - 0.5) * 8, col = [C.rose, C.ivory, C.goldHi, C.ver][Math.floor(r() * 4)];
    g.strokeStyle = C.greenHi; g.lineWidth = 2; g.beginPath(); g.moveTo(jx, jy + 9); g.lineTo(jx, jy); g.stroke();
    g.fillStyle = col; for (let k = 0; k < 5; k++) { const a = k * TAU / 5; g.beginPath(); g.arc(jx + Math.cos(a) * 4, jy + Math.sin(a) * 4, 3, 0, TAU); g.fill(); }
    g.fillStyle = C.gold; g.beginPath(); g.arc(jx, jy, 2, 0, TAU); g.fill();
  }
  return c;
}

// ---------- shared pieces ----------
function sky(c, t, y1 = 400, top = '#e8c46a', bot = C.gold) {
  const g = c.createLinearGradient(0, 70, 0, y1); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(70, 70, W - 140, y1 - 70);
  const r = rng(11);
  for (let k = 0; k < 6; k++) {
    const x0 = ((r() * W + t * (16 + k * 5)) % (W + 600)) - 300, y0 = 120 + r() * 170, s = 0.7 + r() * 0.5;
    c.save(); c.translate(x0, y0); c.scale(s, s); c.lineCap = 'round';
    for (const [col, w] of [[C.lapis, 16], [C.white, 9]]) {
      c.strokeStyle = col; c.lineWidth = w; c.beginPath();
      for (let q = 0; q <= 60; q++) { const u = q / 60, x = u * 260, y = Math.sin(u * TAU * 1.5 + t * 0.6 + k) * 16; q ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      c.beginPath(); c.arc(0, 0, 18, Math.PI * 0.2, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(260, Math.sin(TAU * 1.5 + t * 0.6 + k) * 16, 14, -Math.PI * 0.8, Math.PI * 0.9); c.stroke();
    }
    c.restore();
  }
}
function hills(c, base = 330) {
  for (const [y, col, amp, fr, ph] of [[base, C.hill, 50, 0.004, 1], [base + 50, C.hill2, 36, 0.006, 3]]) {
    c.fillStyle = col; c.beginPath(); c.moveTo(70, H);
    for (let x = 70; x <= W - 70; x += 10) c.lineTo(x, y - Math.abs(Math.sin(x * fr + ph)) * amp - Math.sin(x * fr * 3.1) * amp * 0.25);
    c.lineTo(W - 70, H); c.closePath(); c.fill(); c.strokeStyle = 'rgba(80,40,60,.35)'; c.lineWidth = 2; c.stroke();
  }
}
function birds(c, t, n = 4, y0 = 170) {
  for (let k = 0; k < n; k++) {
    const x = ((t * (70 + k * 18) + k * 420) % (W + 300)) - 150, y = y0 + k * 38 + Math.sin(t * 1.4 + k) * 14, flap = Math.floor(t * 8 + k) % 2;
    c.save(); c.translate(x, y); c.strokeStyle = C.ink; c.fillStyle = C.lapis; c.lineWidth = 3;
    c.beginPath(); c.ellipse(0, 0, 14, 6, 0, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(-4, 0); c.quadraticCurveTo(-10, flap ? -24 : 10, -22, flap ? -20 : 14); c.moveTo(4, 0); c.quadraticCurveTo(10, flap ? -24 : 10, 22, flap ? -20 : 14); c.stroke();
    c.fillStyle = C.ver; c.beginPath(); c.moveTo(14, -1); c.lineTo(22, 1); c.lineTo(14, 3); c.fill();
    c.restore();
  }
}
function cypress(c, x, y, h, t, seed) {
  const sw = Math.sin(t * 0.9 + seed) * 0.025;
  c.save(); c.translate(x, y); c.rotate(sw); c.fillStyle = C.greenDk; c.beginPath(); c.moveTo(0, -h);
  for (let q = 0; q <= 1; q += 0.05) c.lineTo(Math.sin(q * Math.PI) * h * 0.13 * (1 - q * 0.25) + Math.sin(q * 40) * 3, -h + q * h);
  for (let q = 1; q >= 0; q -= 0.05) c.lineTo(-Math.sin(q * Math.PI) * h * 0.13 * (1 - q * 0.25) - Math.sin(q * 40 + 1) * 3, -h + q * h);
  c.closePath(); c.fill();
  c.strokeStyle = C.green; c.lineWidth = 3; for (let q = 0.12; q < 0.95; q += 0.09) { c.beginPath(); c.arc(0, -h + q * h, h * 0.08, Math.PI * 0.15, Math.PI * 0.85); c.stroke(); }
  c.fillStyle = C.ink; c.fillRect(-5, -6, 10, 18); c.restore();
}
function glint(c, t) {
  const per = 2 * (W + H), d = (t * 520) % per;
  const at = s => s < W ? [s, 38] : s < W + H ? [W - 38, s - W] : s < 2 * W + H ? [W - (s - W - H), H - 38] : [38, H - (s - 2 * W - H)];
  const [gx, gy] = at(d), g = c.createRadialGradient(gx, gy, 0, gx, gy, 90);
  g.addColorStop(0, 'rgba(255,246,200,.85)'); g.addColorStop(1, 'rgba(255,246,200,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(gx - 90, gy - 90, 180, 180); c.restore();
}
function stream(c, t, y0 = 960) {
  const path = q => [70 + q * (W - 140), y0 + Math.sin(q * 6.5) * 22];
  c.save(); c.lineCap = 'round'; c.strokeStyle = '#5f8fae'; c.lineWidth = 60; c.beginPath();
  for (let q = 0; q <= 1; q += 0.01) { const [x, y] = path(q); q ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  c.strokeStyle = '#9fc4d6'; c.lineWidth = 48; c.stroke(); c.strokeStyle = C.white; c.lineWidth = 3;
  for (let k = 0; k < 40; k++) { const q = ((k / 40 + t * 0.025) % 1), [x, y] = path(q); c.beginPath(); c.arc(x, y - 4, 10, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.beginPath(); c.arc(x + 14, y + 8, 8, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
  c.restore();
}

// one olive leaf: narrow lance, dark green on top, silver underneath (flip 0..1 = how much underside shows)
function leaf(c, x, y, a, L, flip) {
  c.save(); c.translate(x, y); c.rotate(a);
  const w = L * 0.17 * (1 - 0.45 * Math.abs(flip - 0.5) * 2 * 0);
  c.fillStyle = mix(C.leaf, C.silver, flip); c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(L * 0.45, -w, L, 0); c.quadraticCurveTo(L * 0.45, w, 0, 0); c.fill();
  c.strokeStyle = mix(C.leafDk, '#e9eee4', flip); c.lineWidth = 1.2; c.beginPath(); c.moveTo(L * 0.05, 0); c.lineTo(L * 0.9, 0); c.stroke();
  c.restore();
}
function olive(c, x, y, r, col) {
  c.fillStyle = col; c.beginPath(); c.ellipse(x, y, r * 0.78, r, 0.25, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x - r * 0.25, y - r * 0.35, r * 0.18, r * 0.3, 0.3, 0, TAU); c.fill();
}

// a gnarled old olive tree: twisted split trunk with a hollow, a broad canopy of clumps with shimmering leaves
// opts: { s, seed, gust(x,y)→0..1 silver amount, olives: colour|null, shake: px }
function oldTree(c, x, y, t, o) {
  const s = o.s || 1, r = rng(o.seed || 7);
  c.save(); c.translate(x, y); c.scale(s, s);
  // roots and trunk: three twisted strands
  c.lineCap = 'round';
  const strands = [[-60, -0.5], [10, 0.3], [70, 0.9]];
  for (const [dx, ph] of strands) {
    c.strokeStyle = C.barkDk; c.lineWidth = 64; c.beginPath();
    for (let q = 0; q <= 1; q += 0.05) { const yy = -q * 300, xx = dx * (1 - q) * 1.05 + Math.sin(q * 5 + ph) * 22 * (1 - q * 0.5); q ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
    c.stroke(); c.strokeStyle = C.bark; c.lineWidth = 50; c.stroke();
    c.strokeStyle = C.barkHi; c.lineWidth = 4;
    for (let k = 0; k < 4; k++) { c.beginPath(); for (let q = 0; q <= 1; q += 0.05) { const yy = -q * 300, xx = dx * (1 - q) * 1.05 + Math.sin(q * 5 + ph) * 22 * (1 - q * 0.5) + (k - 1.5) * 9 + Math.sin(q * 14 + k) * 3; q ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
  }
  // the hollow
  c.fillStyle = '#2a1d14'; c.beginPath(); c.ellipse(-8, -120, 20, 46, 0.12, 0, TAU); c.fill();
  c.strokeStyle = C.barkHi; c.lineWidth = 3; c.stroke();
  // roots
  c.strokeStyle = C.barkDk; c.lineWidth = 16;
  for (const [a, b] of [[-90, -150], [-30, -60], [60, 120], [100, 170]]) { c.beginPath(); c.moveTo(a * 0.6, -10); c.quadraticCurveTo(a, 0, b, 14); c.stroke(); }
  // main limbs
  c.strokeStyle = C.bark; c.lineWidth = 28;
  const limbs = [[-0.9, 170], [-0.35, 190], [0.25, 180], [0.85, 160], [-0.1, 210]];
  const ends = [];
  for (const [a, L] of limbs) { const x1 = Math.sin(a) * L, y1 = -300 - Math.cos(a) * L * 0.8; c.beginPath(); c.moveTo(0, -290); c.quadraticCurveTo(x1 * 0.4, -330, x1, y1); c.stroke(); ends.push([x1, y1]); }
  // canopy clumps (miniature trees are drawn as outlined clumps of leaves)
  const sh = o.shake || 0;
  const clumps = [];
  for (let k = 0; k < 9; k++) clumps.push([(r() - 0.5) * 380, -450 + (r() - 0.5) * 110, 62 + r() * 18]);
  for (let k = 0; k < 21; k++) { const a = -Math.PI + (k / 20) * Math.PI, rr = 240 + r() * 50; clumps.push([Math.cos(a) * rr * 1.3, -400 + Math.sin(a) * rr * 0.6 + 50, 58 + r() * 20]); }
  for (const [cx0, cy0, cr] of clumps) {
    const jx = sh ? Math.sin(t * 40 + cx0) * sh : 0, cx = cx0 + jx, cy = cy0 + (sh ? Math.cos(t * 37 + cy0) * sh * 0.5 : 0);
    c.fillStyle = '#2c4024'; c.beginPath(); c.arc(cx, cy, cr, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(214,168,69,.35)'; c.lineWidth = 2.5; c.stroke();
    const n = 30;
    for (let j = 0; j < n; j++) {
      const a = (j / n) * TAU + cx0, d = cr * (0.35 + 0.65 * ((j * 7) % 5) / 4), lx = cx + Math.cos(a) * d, ly = cy + Math.sin(a) * d;
      const g = o.gust ? o.gust(x + (lx) * s, y + ly * s, t) : 0.15;
      const sway = Math.sin(t * 2.4 + j + cx0 * 0.01) * 0.15;
      leaf(c, lx, ly, a + 0.6 + sway, 24 + (j % 3) * 4, g);
    }
    if (o.olives) { const rr2 = rng(Math.round(cx0 * 13 + cy0)); for (let j = 0; j < 7; j++) { const a = rr2() * TAU, d = rr2() * cr * 0.8; olive(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 8, o.olives); } }
  }
  c.restore();
}
// a small round olive tree for the rows behind (cheap: no individual leaves, a few silver flecks)
function smallTree(c, x, y, s, t, seed, gust) {
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = C.bark; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(8, -30, -4, -60); c.stroke();
  c.fillStyle = C.leafDk; c.beginPath(); c.ellipse(0, -100, 62, 50, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(20,30,15,.5)'; c.lineWidth = 2.5; c.stroke();
  const r = rng(seed);
  for (let k = 0; k < 18; k++) { const a = r() * TAU, d = Math.sqrt(r()) * 50, lx = Math.cos(a) * d, ly = -100 + Math.sin(a) * d * 0.8;
    const g = gust ? gust(x + lx * s, y + ly * s, t) : 0.2; leaf(c, lx, ly, a + Math.sin(t * 2 + k) * 0.2, 16, g); }
  c.restore();
}
// a moon-faced figure. pose: { arms: [[sx,sy,hx,hy],…] in figure units, robe, under, hat: 'turban'|'scarf' }, origin = feet centre
function figure(c, x, y, s, p) {
  c.save(); c.translate(x, y); c.scale(p.flip ? -s : s, s); c.lineCap = 'round'; c.lineJoin = 'round';
  // boots
  c.fillStyle = C.ink; c.beginPath(); c.ellipse(-22, -6, 20, 9, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(24, -6, 20, 9, 0, 0, TAU); c.fill();
  // robe
  c.fillStyle = p.robe; c.beginPath(); c.moveTo(-62, -10); c.quadraticCurveTo(-50, -150, -36, -250); c.lineTo(36, -250); c.quadraticCurveTo(52, -150, 62, -10); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(40,20,10,.45)'; c.lineWidth = 3; c.stroke();
  c.fillStyle = C.gold; const r = rng(p.seed || 3); for (let k = 0; k < 26; k++) { const px = (r() - 0.5) * 100, py = -20 - r() * 220; if (Math.abs(px) < 36 + (-py < 250 ? (250 + py) * 0.1 : 0)) { c.beginPath(); c.arc(px, py, 2.6, 0, TAU); c.fill(); } }
  c.fillStyle = p.under; c.beginPath(); c.moveTo(-14, -248); c.lineTo(14, -248); c.lineTo(20, -20); c.lineTo(-20, -20); c.closePath(); c.fill();
  c.fillStyle = C.gold; c.fillRect(-40, -170, 80, 11);
  // arms
  for (const [sx, sy, hx, hy] of p.arms) {
    c.strokeStyle = p.robe; c.lineWidth = 22; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo((sx + hx) / 2 + 8, (sy + hy) / 2 + 12, hx, hy); c.stroke();
    c.fillStyle = C.skin; c.beginPath(); c.arc(hx, hy, 9, 0, TAU); c.fill();
  }
  // head
  if (p.hat === 'scarf') { c.fillStyle = C.white; c.beginPath(); c.ellipse(0, -282, 40, 48, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,60,40,.35)'; c.lineWidth = 2; c.stroke(); }
  c.fillStyle = C.skin; c.beginPath(); c.ellipse(4, -278, 26, 30, 0, 0, TAU); c.fill();
  c.fillStyle = C.ink; c.beginPath(); c.ellipse(-6, -282, 5, 2.2, 0.1, 0, TAU); c.fill(); c.beginPath(); c.ellipse(14, -282, 5, 2.2, -0.1, 0, TAU); c.fill();
  c.strokeStyle = C.ink; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -290); c.quadraticCurveTo(4, -296, 20, -290); c.stroke();
  c.fillStyle = C.ver; c.beginPath(); c.ellipse(4, -264, 5, 2.4, 0, 0, TAU); c.fill();
  if (p.hat === 'turban') {
    if (p.beard) { c.fillStyle = C.ink; c.beginPath(); c.moveTo(-20, -270); c.quadraticCurveTo(4, -228, 28, -270); c.quadraticCurveTo(4, -256, -20, -270); c.fill(); }
    c.fillStyle = C.white; c.beginPath(); c.ellipse(2, -310, 36, 22, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,60,40,.4)'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(150,130,110,.6)'; for (let k = -1; k <= 1; k++) { c.beginPath(); c.ellipse(2, -310 + k * 7, 34, 6, 0, Math.PI * 0.1, Math.PI * 0.9); c.stroke(); }
    c.fillStyle = p.cap || C.ver; c.beginPath(); c.moveTo(-10, -326); c.lineTo(2, -352); c.lineTo(14, -326); c.closePath(); c.fill();
  }
  c.restore();
}
function cartouche(c, t, text, x, y, w, h, t0 = 0.4) {
  c.save(); c.fillStyle = C.ivory; c.fillRect(x, y, w, h); c.strokeStyle = C.gold; c.lineWidth = 6; c.strokeRect(x, y, w, h); c.strokeStyle = C.lapis; c.lineWidth = 2; c.strokeRect(x + 10, y + 10, w - 20, h - 20);
  const p = S(t0, t0 + 2.2, t);
  c.beginPath(); c.rect(x + w - 30 - (w - 60) * p, y, (w - 60) * p + 30, h); c.clip();
  c.fillStyle = C.ink; c.font = `${Math.round(h * 0.42)}px "LXGWWenKai-500"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x + w / 2, y + h / 2 + 6);
  c.restore();
}
const frame = (c, t, body) => { c.save(); c.beginPath(); c.rect(70, 70, W - 140, H - 140); c.clip(); body(); c.restore(); c.drawImage(borderC, 0, 0); glint(c, t); };
// a gust: a silver band that travels right→left across the painting
const gustOf = (speed, width, base) => (x, y, t) => { const ph = (x + y * 0.3) * 0.004 + t * speed; return Math.min(1, base + Math.max(0, Math.sin(ph)) ** width); };

// ---------- shots ----------
function grove(c, lt, peace) {
  const g0 = gustOf(1.4, 6, 0.08), gust = (x, y, t) => g0(x, y, t) * 0.6;
  sky(c, lt, 420, peace ? '#f0c27a' : '#e8c46a', peace ? '#e09a4e' : C.gold);
  if (peace) { const g = c.createRadialGradient(CX, 330, 10, CX, 330, 260); g.addColorStop(0, 'rgba(255,240,190,.95)'); g.addColorStop(0.3, 'rgba(255,220,150,.6)'); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(CX - 300, 70, 600, 500);
    c.fillStyle = '#fff1c4'; c.beginPath(); c.arc(CX, 330, 70, 0, TAU); c.fill(); }
  if (!peace) birds(c, lt, 3, 180);
  hills(c, 360);
  // terraces with rows of small olive trees (stacked planes, back to front)
  const rows = [[420, 0.55, '#d9b98a'], [500, 0.7, '#cfae7c'], [590, 0.85, '#c4a26e']];
  rows.forEach(([y, s, col], i) => {
    c.fillStyle = col; c.beginPath(); c.moveTo(70, y + 30); for (let x = 70; x <= W - 70; x += 20) c.lineTo(x, y + 20 + Math.sin(x * 0.006 + i) * 8); c.lineTo(W - 70, H); c.lineTo(70, H); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(90,60,30,.4)'; c.lineWidth = 2; c.stroke();
    for (let x = 110 + i * 40; x < W - 90; x += 150 * s + 20) if (Math.abs(x - CX) > 170 || i === 0) smallTree(c, x, y + 26 + Math.sin(x * 0.006 + i) * 8, s, lt, x + i * 99, gust);
  });
  c.drawImage(lawn, 0, 660);
  cypress(c, 300, 900, 520, lt, 0); cypress(c, 1640, 900, 480, lt, 2); cypress(c, 640, 760, 470, lt, 1); cypress(c, 1290, 760, 440, lt, 3);
  oldTree(c, CX, 770, lt, { s: 0.85, seed: 7, gust });
  stream(c, lt, 900);
}
function dove(c, t) {
  const x = CX + Math.sin(t * 0.7) * 50, y = 370 + Math.sin(t * 1.3) * 12, f = Math.sin(t * 6.5), lift = 0.5 + 0.5 * f;
  c.save(); c.translate(x, y);
  const g = c.createRadialGradient(0, -20, 10, 0, -20, 200); g.addColorStop(0, 'rgba(255,250,230,.5)'); g.addColorStop(1, 'rgba(255,250,230,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, -20, 200, 0, TAU); c.fill();
  c.scale(1.35, 1.35); c.lineJoin = 'round';
  const line = 'rgba(70,60,50,.8)';
  // a wing = a fan of 6 long feathers rising from the shoulder; far wing first (greyer, smaller)
  const wing = (sx, col, k) => {
    for (let i = 5; i >= 0; i--) {
      const ang = -Math.PI / 2 - 0.15 - (i * 0.16) + (1 - lift) * 1.1, L = (70 + i * 9) * k;
      c.save(); c.translate(sx + i * 6, -6); c.rotate(ang);
      c.fillStyle = col; c.strokeStyle = line; c.lineWidth = 1.8;
      c.beginPath(); c.ellipse(L / 2, 0, L / 2, 11 * k, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(214,168,69,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(6, 0); c.lineTo(L - 8, 0); c.stroke();
      c.restore();
    }
  };
  wing(-4, '#e6e1d6', 0.85);
  // tail fan
  for (let i = -1; i <= 1; i++) { c.save(); c.translate(-44, 6); c.rotate(Math.PI + i * 0.22); c.fillStyle = C.white; c.strokeStyle = line; c.lineWidth = 1.8; c.beginPath(); c.ellipse(24, 0, 26, 9, 0, 0, TAU); c.fill(); c.stroke(); c.restore(); }
  // body and head
  c.fillStyle = C.white; c.strokeStyle = line; c.lineWidth = 2.2;
  c.beginPath(); c.moveTo(-50, 6); c.bezierCurveTo(-30, -22, 30, -26, 46, -10); c.bezierCurveTo(40, 20, -10, 28, -50, 6); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.arc(50, -18, 15, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = C.ink; c.beginPath(); c.arc(55, -21, 2.8, 0, TAU); c.fill();
  c.fillStyle = C.ver; c.beginPath(); c.moveTo(63, -18); c.lineTo(76, -14); c.lineTo(63, -11); c.closePath(); c.fill();
  wing(4, C.white, 1);
  // the olive twig in its beak
  c.strokeStyle = C.barkDk; c.lineWidth = 2.5; c.beginPath(); c.moveTo(72, -14); c.quadraticCurveTo(88, 4, 82, 30); c.stroke();
  for (let k = 0; k < 6; k++) leaf(c, 76 + (k % 2 ? 6 : 0), -8 + k * 7, (k % 2 ? 0.5 : 2.6) + Math.sin(t * 3 + k) * 0.1, 20, 0.2);
  olive(c, 84, 32, 6, C.olG);
  c.restore();
}
// close-up branches across a gold ground
function branches(c, lt, mode) {
  const g = c.createLinearGradient(0, 70, 0, H); g.addColorStop(0, '#ecc874'); g.addColorStop(1, '#d1a043'); c.fillStyle = g; c.fillRect(70, 70, W - 140, H - 140);
  // faint arabesque medallion behind
  c.save(); c.globalAlpha = 0.18; c.strokeStyle = C.goldDk; c.lineWidth = 4;
  for (let k = 0; k < 12; k++) { const a = k * TAU / 12 + lt * 0.05; c.beginPath(); c.ellipse(CX + Math.cos(a) * 150, 460 + Math.sin(a) * 150, 150, 60, a, 0, TAU); c.stroke(); }
  c.beginPath(); c.arc(CX, 460, 330, 0, TAU); c.stroke(); c.beginPath(); c.arc(CX, 460, 345, 0, TAU); c.stroke(); c.restore();
  if (mode === 'leaves') { // wind ribbons crossing the frame
    c.save(); c.lineCap = 'round';
    for (let k = 0; k < 5; k++) { const y = 200 + k * 140, x0 = W - ((lt * 520 + k * 380) % (W + 900)) + 200;
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 5; c.beginPath(); for (let q = 0; q <= 1; q += 0.02) { const xx = x0 + q * 520, yy = y + Math.sin(q * 9 + k) * 14; q ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
      c.beginPath(); c.arc(x0, y, 16, Math.PI * 0.3, Math.PI * 1.9); c.stroke(); }
    c.restore();
  }
  const gust = mode === 'leaves' ? gustOf(3.2, 3, 0.05) : (x, y, t) => 0.12 + 0.12 * Math.max(0, Math.sin(x * 0.01 + t * 1.5));
  const wind = mode === 'leaves' ? 1 : 0.35;
  // twigs: [start x, y, angle, length]
  const twigs = [[70, 200, -0.02, 1250], [W - 70, 340, Math.PI + 0.1, 1250], [70, 470, -0.08, 1200], [W - 70, 600, Math.PI + 0.04, 1150]];
  twigs.forEach(([x0, y0, a0, L], ti) => {
    const pts = []; for (let q = 0; q <= 1.0001; q += 0.025) { const a = a0 + Math.sin(q * 3 + ti) * 0.2 + Math.sin(lt * 1.7 + ti) * 0.03 * wind * q; const p = pts.length ? pts[pts.length - 1] : [x0, y0]; pts.push(pts.length ? [p[0] + Math.cos(a) * L * 0.025, p[1] + Math.sin(a) * L * 0.025] : [x0, y0]); }
    c.strokeStyle = C.barkDk; c.lineCap = 'round';
    for (let i = 1; i < pts.length; i++) { c.lineWidth = 16 * (1 - i / pts.length) + 3; c.beginPath(); c.moveTo(...pts[i - 1]); c.lineTo(...pts[i]); c.stroke(); }
    for (let i = 2; i < pts.length; i++) {
      const [px, py] = pts[i];
      for (const side of [-1, 1]) {
        const sway = Math.sin(lt * 4 * wind + i * 0.7 + ti) * 0.25 * wind;
        const fl = gust(px, py, lt);
        leaf(c, px, py, a0 + side * 0.9 + sway, 66 + ((i * 5) % 3) * 8, fl);
      }
      if (i % 5 === 2) { // olive clusters
        const ripe = mode === 'ripen' ? S(0.25, 3.3, lt - (i % 3) * 0.25 - ti * 0.15) : 0;
        const col = ripe < 0.5 ? mix(C.olG, C.olV, ripe * 2) : mix(C.olV, C.olB, (ripe - 0.5) * 2);
        const big = mode === 'ripen' ? 1.7 : 1;
        for (let j = 0; j < (mode === 'ripen' ? 4 : 2); j++) { c.strokeStyle = C.barkDk; c.lineWidth = 2; const ox = px + (j - 1.5) * 18 * big, oy = py + 30 * big + (j % 2) * 12;
          c.beginPath(); c.moveTo(px, py); c.lineTo(ox, oy - 12); c.stroke(); olive(c, ox, oy, 12 * big, col); }
      }
    }
  });
  if (mode === 'ripen') { // autumn leaves drifting down
    const r = rng(9);
    for (let k = 0; k < 16; k++) { const x0 = 300 + r() * 1300, sp = 50 + r() * 50, y = 80 + ((lt * sp + r() * 900) % 960), x = x0 + Math.sin(lt * 1.3 + k) * 40;
      leaf(c, x, y, lt * 2 + k, 40, 0.1); c.save(); c.globalCompositeOperation = 'source-atop'; c.restore();
      c.fillStyle = 'rgba(214,168,69,.55)'; c.beginPath(); c.ellipse(x + 18 * Math.cos(lt * 2 + k), y + 18 * Math.sin(lt * 2 + k), 14, 4, lt * 2 + k, 0, TAU); c.fill(); }
  }
}
function harvest(c, lt) {
  sky(c, lt, 380); birds(c, lt, 3, 150); hills(c, 300);
  c.drawImage(lawn, 0, 420);
  for (const [x, s] of [[230, 0.7], [420, 0.6], [1500, 0.65], [1700, 0.75], [690, 0.5], [1250, 0.5]]) smallTree(c, x, 470, s, lt, x, null);
  // the red cloth under the tree, with a gold border (seen from above-front, like a carpet)
  c.save(); c.fillStyle = C.ver; c.beginPath(); c.moveTo(700, 615); c.lineTo(1280, 615); c.lineTo(1340, 780); c.lineTo(640, 780); c.closePath(); c.fill();
  c.strokeStyle = C.gold; c.lineWidth = 6; c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(722, 628); c.lineTo(1258, 628); c.lineTo(1312, 766); c.lineTo(668, 766); c.closePath(); c.stroke(); c.restore();
  // the pole hits: a rhythm of ~1.15s, the tree shakes right after each hit
  const per = 1.15, ph = (lt % per) / per, hit = ph < 0.2 ? 1 - ph / 0.2 : 0;
  oldTree(c, 1000, 650, lt, { s: 0.7, seed: 12, olives: C.olV, shake: hit * 8, gust: (x, y, t) => 0.1 + hit * 0.45 * Math.max(0, Math.sin(x * 0.02)) });
  // olives falling (each hit releases a shower) and the pile growing on the cloth
  const r = rng(5);
  for (let k = 0; k < 70; k++) { const sx = 760 + r() * 480, sy = 270 + r() * 160, ex = sx + (r() - 0.5) * 50, ey = 630 + r() * 140, off = r() * per;
    const tt = ((lt + off) % per) / 0.85; if (tt > 1) continue; olive(c, sx + (ex - sx) * tt, sy + (ey - sy) * tt * tt, 8, r() < 0.5 ? C.olV : C.olB); }
  const n = Math.floor(40 + lt * 40), r2 = rng(17);
  for (let k = 0; k < Math.min(n, 240); k++) { const y = 625 + r2() * 145, f = (y - 615) / 165, x = 700 - 60 * f + r2() * (580 + 120 * f); olive(c, x, y, 7.5, r2() < 0.5 ? C.olV : C.olB); }
  // the gardener with the long pole (left), swinging it up into the canopy
  const sw = -1.05 + 0.32 * (1 - Math.abs(Math.sin(ph * Math.PI)));
  const gx = 790, gy = 770, s = 0.85, hx = 40, hy = -205;
  c.save(); c.translate(gx + hx * s, gy + hy * s); c.rotate(sw); c.strokeStyle = '#8a6a3a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-70, 0); c.lineTo(470, 0); c.stroke(); c.restore();
  figure(c, gx, gy, s, { robe: C.lapis, under: C.turq, hat: 'turban', beard: true, seed: 4, arms: [[30, -230, hx, hy], [-24, -226, hx - 22, hy + 30]] });
  // the woman gathering (right), reaching down to the cloth and back to the basket
  const reach = 0.5 + 0.5 * Math.sin(lt * 2.2);
  figure(c, 1190, 775, 0.72, { flip: true, robe: '#2f6b3d', under: C.goldHi, hat: 'scarf', seed: 8, arms: [[30, -230, 70 + reach * 30, -110 + reach * 70], [-24, -226, 30 + reach * 30, -100 + reach * 60]] });
  // a wicker basket, filling up
  c.save(); c.translate(1100, 790); c.scale(0.7, 0.7); c.fillStyle = '#b5874a'; c.beginPath(); c.moveTo(-70, -70); c.lineTo(70, -70); c.lineTo(52, 10); c.lineTo(-52, 10); c.closePath(); c.fill();
  c.strokeStyle = '#7d5a2c'; c.lineWidth = 3; for (let k = -60; k <= 60; k += 16) { c.beginPath(); c.moveTo(k, -70); c.lineTo(k * 0.76, 10); c.stroke(); } for (let y = -55; y < 10; y += 14) { c.beginPath(); c.moveTo(-68 + (y + 70) * 0.25, y); c.lineTo(68 - (y + 70) * 0.25, y); c.stroke(); }
  const fill = S(0, 4, lt), r3 = rng(3); for (let k = 0; k < 28; k++) { const x = (r3() - 0.5) * 120, y = -70 - r3() * 26 * fill; if (r3() < fill + 0.2) olive(c, x, y, 8, r3() < 0.5 ? C.olV : C.olB); }
  c.restore();
  stream(c, lt, 930);
}
function wall(c, lt, y0 = 140, y1 = 880) {     // brick wall with a girih dado and a pointed arch window
  c.fillStyle = C.brick; c.fillRect(70, y0, W - 140, y1 - y0);
  c.strokeStyle = 'rgba(140,100,60,.35)'; c.lineWidth = 2; for (let y = y0 + 20; y < y1; y += 22) { c.beginPath(); c.moveTo(70, y); c.lineTo(W - 70, y); c.stroke(); for (let x = 70 + ((y / 22) % 2) * 30; x < W - 70; x += 60) { c.beginPath(); c.moveTo(x, y - 22); c.lineTo(x, y); c.stroke(); } }
  c.save(); c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(70, y1 - 150, W - 140, 150); c.restore();
  c.strokeStyle = C.goldDk; c.lineWidth = 4; c.strokeRect(70, y1 - 150, W - 140, 150);
  c.fillStyle = C.turq; c.fillRect(70, y0 - 24, W - 140, 26);
  c.fillStyle = C.lapis; for (let x = 76; x < W - 70; x += 46) { c.beginPath(); c.moveTo(x, y0 - 22); c.lineTo(x + 18, y0 - 54); c.lineTo(x + 36, y0 - 22); c.fill(); }
}
function archWin(c, ax, top, w, ab, fill) {
  const p = new Path2D(); p.moveTo(ax - w / 2, ab); p.lineTo(ax - w / 2, top + w * 0.45); p.quadraticCurveTo(ax - w / 2, top, ax, top - w * 0.12); p.quadraticCurveTo(ax + w / 2, top, ax + w / 2, top + w * 0.45); p.lineTo(ax + w / 2, ab); p.closePath();
  c.fillStyle = C.lapis; c.save(); c.translate(0, 0); c.restore(); c.fillStyle = fill; c.fill(p); c.strokeStyle = C.gold; c.lineWidth = 5; c.stroke(p); return p;
}
function lantern(c, x, y, t) {
  const fl = 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 7.3 + 1);
  c.strokeStyle = C.gold; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - 100); c.lineTo(x, y - 18); c.stroke();
  const gl = c.createRadialGradient(x, y, 4, x, y, 150 * fl); gl.addColorStop(0, `rgba(255,214,130,${0.6 * fl})`); gl.addColorStop(1, 'rgba(255,214,130,0)'); c.fillStyle = gl; c.beginPath(); c.arc(x, y, 160, 0, TAU); c.fill();
  c.fillStyle = C.gold; c.beginPath(); c.moveTo(x - 18, y - 18); c.lineTo(x + 18, y - 18); c.lineTo(x + 12, y + 20); c.lineTo(x - 12, y + 20); c.closePath(); c.fill();
  c.fillStyle = `rgba(255,236,170,${fl})`; c.beginPath(); c.arc(x, y, 8, 0, TAU); c.fill();
}
function basketAt(c, x, y, s, seed) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = '#b5874a'; c.beginPath(); c.moveTo(-70, -70); c.lineTo(70, -70); c.lineTo(52, 10); c.lineTo(-52, 10); c.closePath(); c.fill();
  c.strokeStyle = '#7d5a2c'; c.lineWidth = 3; for (let k = -60; k <= 60; k += 16) { c.beginPath(); c.moveTo(k, -70); c.lineTo(k * 0.76, 10); c.stroke(); }
  const r = rng(seed); for (let k = 0; k < 26; k++) olive(c, (r() - 0.5) * 120, -72 - r() * 24, 8, r() < 0.5 ? C.olV : C.olB);
  c.restore();
}
function mill(c, lt) {
  wall(c, lt, 150, 470);
  archWin(c, CX, 200, 250, 320, '#2a1e3a');
  lantern(c, CX, 250, lt);
  c.fillStyle = '#c9b08a'; c.fillRect(70, 470, W - 140, H - 470);
  c.strokeStyle = 'rgba(120,90,60,.3)'; c.lineWidth = 2; for (let y = 490; y < H; y += 40) { c.beginPath(); c.moveTo(70, y); c.lineTo(W - 70, y); c.stroke(); }
  basketAt(c, 520, 620, 1, 2); basketAt(c, 1420, 630, 1.05, 6); basketAt(c, 700, 540, 0.65, 9); basketAt(c, 1230, 545, 0.65, 4);
  const bx = CX, by = 590, rx = 240, ry = 76, a = lt * 1.05;
  const wheelAt = ang => [bx + Math.cos(ang) * 140, by - 30 + Math.sin(ang) * 44];
  const manAt = ang => [bx + Math.cos(ang) * 320, by + 110 + Math.sin(ang) * 80];
  const drawWheel = () => { const [wx, wy] = wheelAt(a), R = 86, ex = Math.max(16, R * Math.abs(Math.sin(a)));
    c.fillStyle = C.stoneDk; c.beginPath(); c.ellipse(wx, wy, ex + 8, R, 0, 0, TAU); c.fill();
    c.fillStyle = C.stone; c.beginPath(); c.ellipse(wx, wy, ex, R, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(70,60,50,.45)'; c.lineWidth = 3; c.beginPath(); c.ellipse(wx, wy, ex * 0.85, R * 0.85, 0, 0, TAU); c.stroke();
    const rot = a * 2.4; for (let k = 0; k < 6; k++) { const q = rot + k * TAU / 6; c.beginPath(); c.moveTo(wx + Math.cos(q) * ex * 0.2, wy + Math.sin(q) * R * 0.2); c.lineTo(wx + Math.cos(q) * ex * 0.8, wy + Math.sin(q) * R * 0.8); c.stroke(); }
    c.fillStyle = '#5a3a24'; c.beginPath(); c.ellipse(wx, wy, Math.max(6, ex * 0.12), 11, 0, 0, TAU); c.fill(); };
  const drawBeam = () => { const [mx, my] = manAt(a); c.strokeStyle = '#7a5530'; c.lineWidth = 13; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, by - 140); c.lineTo(mx, my - 170); c.stroke(); };
  const drawMan = () => { const [mx, my] = manAt(a), walk = Math.sin(lt * 7);
    figure(c, mx, my, 0.74, { flip: Math.sin(a) > 0, robe: C.ver, under: C.goldHi, hat: 'turban', beard: true, cap: C.lapis, seed: 11, arms: [[30, -230, 44, -215 + walk * 4], [-24, -226, 26, -210 - walk * 4]] }); };
  c.fillStyle = C.stoneDk; c.beginPath(); c.ellipse(bx, by + 10, rx + 24, ry + 18, 0, 0, TAU); c.fill();
  c.fillStyle = C.stone; c.beginPath(); c.ellipse(bx, by, rx + 24, ry + 18, 0, 0, TAU); c.fill();
  c.fillStyle = '#3a2232'; c.beginPath(); c.ellipse(bx, by, rx, ry, 0, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.ellipse(bx, by, rx, ry, 0, 0, TAU); c.clip();
  const r = rng(4); for (let k = 0; k < 110; k++) { const ang = r() * TAU, d = 0.25 + r() * 0.75; const crushed = ((a - ang) % TAU + TAU) % TAU < 2.5; const x = bx + Math.cos(ang) * rx * d, y = by + Math.sin(ang) * ry * d;
    if (crushed) { c.fillStyle = 'rgba(110,60,80,.7)'; c.beginPath(); c.ellipse(x, y, 11, 5, 0, 0, TAU); c.fill(); } else olive(c, x, y, 8, r() < 0.5 ? C.olV : C.olB); }
  for (let k = 0; k < 3; k++) { const ang = a - 0.4 - k * 0.5; c.strokeStyle = `rgba(244,228,138,${0.6 - k * 0.15})`; c.lineWidth = 6; c.beginPath(); c.ellipse(bx, by, rx * 0.58, ry * 0.58, 0, ang - 0.4, ang); c.stroke(); }
  c.restore();
  const back = Math.sin(a) < 0;
  if (back) { drawMan(); drawBeam(); drawWheel(); }
  c.fillStyle = '#7a5530'; c.fillRect(bx - 13, by - 180, 26, 180); c.fillStyle = C.gold; c.fillRect(bx - 19, by - 186, 38, 12);
  if (!back) { drawWheel(); drawBeam(); drawMan(); }
  c.fillStyle = C.stoneDk; c.beginPath(); c.ellipse(bx, by + ry + 4, rx + 10, 15, 0, 0, Math.PI); c.fill();
}
function oilShot(c, lt) {
  wall(c, lt, 130, 820);
  c.fillStyle = '#c9b08a'; c.fillRect(70, 820, W - 140, H - 820); c.strokeStyle = 'rgba(120,90,60,.3)'; c.lineWidth = 2; for (let y = 840; y < H; y += 40) { c.beginPath(); c.moveTo(70, y); c.lineTo(W - 70, y); c.stroke(); }
  // niches with small jars either side
  for (const nx of [360, 1560, 690, 1230]) { const nw = nx > 600 && nx < 1300 ? 170 : 220; archWin(c, nx, 330, nw, 600, '#2a1e3a');
    for (const [jx, jy, s] of nw < 200 ? [[nx, 600, 0.42]] : [[nx - 50, 600, 0.5], [nx + 50, 600, 0.42]]) jar(c, jx, jy, s, lt, 0); }
  // the stone press block and the bronze spout
  c.fillStyle = C.stone; c.fillRect(CX - 210, 130, 420, 170); c.strokeStyle = C.stoneDk; c.lineWidth = 4; c.strokeRect(CX - 210, 130, 420, 170);
  c.fillStyle = C.stoneDk; for (let k = 0; k < 4; k++) c.fillRect(CX - 190 + k * 100, 150, 70, 10);
  c.save(); c.fillStyle = c.createPattern(tile, 'repeat'); c.fillRect(CX - 180, 180, 360, 96); c.restore(); c.strokeStyle = C.gold; c.lineWidth = 4; c.strokeRect(CX - 180, 180, 360, 96);
  c.fillStyle = C.gold; c.fillRect(CX - 220, 120, 440, 12);
  c.fillStyle = '#b07a32'; c.beginPath(); c.moveTo(CX - 26, 280); c.lineTo(CX + 26, 280); c.lineTo(CX + 50, 330); c.lineTo(CX + 20, 336); c.lineTo(CX - 6, 300); c.closePath(); c.fill();
  c.strokeStyle = '#6e4a1a'; c.lineWidth = 3; c.stroke();
  // the stream of oil: a golden ribbon with highlights running down
  const sx = CX + 34, sy = 334, ex = CX + 8, ey = 470, wob = Math.sin(lt * 5) * 3;
  const glow = c.createRadialGradient(CX, 470, 10, CX, 470, 380); glow.addColorStop(0, 'rgba(255,226,120,.55)'); glow.addColorStop(1, 'rgba(255,226,120,0)');
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = glow; c.beginPath(); c.arc(CX, 470, 380, 0, TAU); c.fill(); c.restore();
  c.save(); c.lineCap = 'round';
  c.strokeStyle = C.oil; c.lineWidth = 24; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx - 6 + wob, (sy + ey) / 2, ex, ey); c.stroke();
  c.strokeStyle = 'rgba(160,140,30,.9)'; c.lineWidth = 8; c.beginPath(); c.moveTo(sx + 5, sy); c.quadraticCurveTo(sx + wob, (sy + ey) / 2, ex + 5, ey); c.stroke();
  for (let k = 0; k < 8; k++) { const q = ((lt * 1.6 + k / 8) % 1), x = sx + (ex - sx) * q + wob * Math.sin(q * Math.PI), y = sy + (ey - sy) * q;
    c.fillStyle = C.oilHi; c.beginPath(); c.ellipse(x - 3, y, 3, 14, 0, 0, TAU); c.fill(); }
  c.restore();
  // the big lapis jar (khumreh) with a turquoise arabesque band; the oil surface ripples at its mouth
  jar(c, CX, 760, 1.15, lt, 1);
  // splashes at the mouth
  for (let k = 0; k < 6; k++) { const q = ((lt * 2 + k / 6) % 1), a = -Math.PI / 2 + (k - 2.5) * 0.4; c.fillStyle = `rgba(244,228,138,${1 - q})`; c.beginPath(); c.arc(ex + Math.cos(a) * 50 * q, 476 + Math.sin(a) * 40 * q + 60 * q * q, 4, 0, TAU); c.fill(); }
  // sparkles in the glow
  const r = rng(8); for (let k = 0; k < 14; k++) { const x = CX - 220 + r() * 440, y = 200 + r() * 300, tw = Math.max(0, Math.sin(lt * 3 + k * 1.7)); c.fillStyle = `rgba(255,248,210,${tw * 0.9})`; c.beginPath(); for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? 2 : 9 * tw; c.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr); } c.closePath(); c.fill(); }
}
function jar(c, x, y, s, t, fillLvl) {     // origin = base centre
  c.save(); c.translate(x, y); c.scale(s, s);
  c.fillStyle = 'rgba(40,20,10,.25)'; c.beginPath(); c.ellipse(0, 4, 130, 18, 0, 0, TAU); c.fill();
  const body = new Path2D(); body.moveTo(-60, 0); body.bezierCurveTo(-170, -60, -170, -170, -90, -220); body.lineTo(-60, -232); body.lineTo(-60, -250); body.lineTo(60, -250); body.lineTo(60, -232); body.lineTo(90, -220); body.bezierCurveTo(170, -170, 170, -60, 60, 0); body.closePath();
  c.fillStyle = C.lapis; c.fill(body); c.strokeStyle = C.goldDk; c.lineWidth = 4; c.stroke(body);
  c.save(); c.clip(body);
  c.fillStyle = C.turq; c.fillRect(-200, -170, 400, 46); c.strokeStyle = C.gold; c.lineWidth = 3; c.strokeRect(-200, -170, 400, 46);
  c.strokeStyle = C.white; c.lineWidth = 3; c.beginPath(); for (let k = -200; k <= 200; k += 4) { const yy = -147 + Math.sin(k / 16) * 12; k === -200 ? c.moveTo(k, yy) : c.lineTo(k, yy); } c.stroke();
  c.fillStyle = C.white; for (let k = -180; k <= 180; k += 64) { c.beginPath(); c.ellipse(k, -147 + Math.sin(k / 16) * 12, 7, 4, 0, 0, TAU); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(-70, -110, 22, 70, 0.2, 0, TAU); c.fill();
  c.restore();
  // mouth
  c.fillStyle = C.lapisDk; c.beginPath(); c.ellipse(0, -250, 60, 14, 0, 0, TAU); c.fill(); c.strokeStyle = C.gold; c.lineWidth = 4; c.stroke();
  if (fillLvl) { c.fillStyle = C.oil; c.beginPath(); c.ellipse(0, -249, 52, 10, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,245,190,.85)'; c.lineWidth = 2; for (let k = 0; k < 3; k++) { const q = (t * 0.9 + k / 3) % 1; c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(-6, -249, 8 + q * 40, 2 + q * 8, 0, 0, TAU); c.stroke(); } c.globalAlpha = 1; }
  c.restore();
}

const reg = (id, draw) => { SCENES[id] = { init() { tile = tile || girihTile(96); borderC = borderC || makeBorder(); lawn = lawn || makeLawn(); }, draw(c, lt, t) { frame(c, lt, () => draw(c, lt, t)); } }; };
reg('37_olive_grove', (c, lt) => grove(c, lt, false));
reg('37_olive_leaves', (c, lt) => branches(c, lt, 'leaves'));
reg('37_olive_ripen', (c, lt) => branches(c, lt, 'ripen'));
reg('37_olive_harvest', (c, lt) => harvest(c, lt));
reg('37_olive_mill', (c, lt) => mill(c, lt));
reg('37_olive_oil', (c, lt) => oilShot(c, lt));
reg('37_olive_peace', (c, lt) => { grove(c, lt, true); cartouche(c, lt, window.OLIVE_VERSE || 'باغ زیتون', CX - 230, 96, 460, 120, 0.6); dove(c, lt); });
})();
