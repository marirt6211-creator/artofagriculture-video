// Thumbnails for v24 "Village Dawn": cream paper + floating framed cards (the video's corner-swap look).
const { chromium } = require('playwright');
const R = '/home/user/artofagriculture-video', O = R + '/out/th24';
const css = `@font-face{font-family:Bask;src:url(file://${R}/public/fonts/LibreBaskerville.ttf)}
body{margin:0;overflow:hidden;position:relative;background:radial-gradient(ellipse at 50% 40%,#f7f5ef,#e6e2d6 75%)}
.card{position:absolute;overflow:hidden;border-radius:34px;box-shadow:0 0 0 10px #fff,0 40px 90px rgba(40,38,28,.35)}
.card img{width:100%;height:100%;object-fit:cover;display:block}
.t{position:absolute;font-family:Bask;font-style:italic;color:#2b2e27;text-shadow:0 0 30px rgba(255,255,255,.9)}
.line{position:absolute;height:6px;background:#d9b86a;border-radius:3px}
.logo{position:absolute;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3))}`;
const img = (f, pos) => `<img src="file://${O}/${f}" style="object-position:${pos}">`;
const logo = (s) => `<img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="${s}">`;
const V = {
  'A-vertical': [1080, 1920, `
  <div class="card" style="left:60px;top:150px;width:720px;height:1080px;transform:rotate(-3deg)">${img("f13.jpg", "20% 85%")}</div>
  <div class="card" style="left:470px;top:880px;width:550px;height:720px;transform:rotate(3deg)">${img('f41.jpg', '50% 75%')}</div>
  <div class="t" style="left:0;right:0;top:1640px;text-align:center;font-size:150px">Village Dawn</div>
  <div class="line" style="left:400px;width:280px;top:1835px"></div>
  ${logo('width:150px;height:150px;right:50px;top:60px')}`],
  'B-horizontal': [1280, 720, `
  <div class="t" style="left:60px;top:200px;font-size:118px;line-height:1.15">Village<br>Dawn</div>
  <div class="line" style="left:66px;width:220px;top:520px"></div>
  <div class="card" style="left:650px;top:60px;width:330px;height:560px;transform:rotate(-4deg);border-radius:24px;box-shadow:0 0 0 7px #fff,0 30px 70px rgba(40,38,28,.35)">${img('f13.jpg', '30% 80%')}</div>
  <div class="card" style="left:900px;top:150px;width:310px;height:520px;transform:rotate(4deg);border-radius:24px;box-shadow:0 0 0 7px #fff,0 30px 70px rgba(40,38,28,.35)">${img('f41.jpg', '50% 75%')}</div>
  ${logo('width:110px;height:110px;left:60px;top:40px')}`],
};
(async () => { const b = await chromium.launch();
 for (const [k, [w, h, html]] of Object.entries(V)) { const p = await b.newPage({ viewport: { width: w, height: h } });
  require('fs').writeFileSync(O + '/t.html', `<html><head><style>${css}</style></head><body style="width:${w}px;height:${h}px">${html}</body></html>`);
  await p.goto('file://' + O + '/t.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${__dirname}/thumb-${k}.jpg`, type: 'jpeg', quality: 92 }); await p.close(); }
 await b.close(); })();
