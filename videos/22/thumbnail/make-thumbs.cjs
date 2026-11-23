const { chromium } = require('playwright');
const R = '/home/user/artofagriculture-video', O = R + '/out/th';
const css = `@font-face{font-family:Anton;src:url(file://${R}/public/fonts/Anton-Regular.ttf)}
body{margin:0;overflow:hidden;position:relative;background:#000}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.t{position:absolute;font-family:Anton;line-height:.95;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.85),0 2px 4px rgba(0,0,0,.9)}
.g{color:#ffcf5a;text-shadow:0 0 34px rgba(255,190,70,.7),0 6px 24px rgba(0,0,0,.85)}
.chip{display:inline-block;font-family:Anton;color:#fff;border:6px solid #fff;border-radius:22px;text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.logo{position:absolute;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}
.star{position:absolute;width:150px;height:150px;background:radial-gradient(circle,#fff 0 6%,rgba(255,226,140,.8) 12%,rgba(255,207,90,0) 60%)}
.star:before,.star:after{content:"";position:absolute;left:50%;top:50%;width:260px;height:6px;margin:-3px 0 0 -130px;background:linear-gradient(90deg,transparent,#fff,transparent)}.star:after{transform:rotate(90deg)}`;
const logo = (s) => `<img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="${s}">`;
const chips = (sz, gap) => [['N', '#2fae5b'], ['P', '#f08a24'], ['K', '#8b3fd9']].map(([s, c]) => `<span class="chip" style="background:${c};width:${sz}px;height:${sz}px;line-height:${sz}px;font-size:${sz * 0.7}px;margin:0 ${gap}px">${s}</span>`).join('');
const V = {
 'A-vertical': [1080, 1920, `<img class="bg" src="file://${R}/uploads/v22/bags.png">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.7) 0%,rgba(0,0,0,.2) 26%,rgba(0,0,0,0) 45%,rgba(0,0,0,0) 72%,rgba(0,0,0,.8) 100%)"></div>
  <div class="t" style="left:0;right:0;top:70px;text-align:center;font-size:140px">WHAT DO THESE<br><span class="g">NUMBERS</span> MEAN?</div>
  <div class="star" style="left:820px;top:1080px"></div>
  <div class="t" style="left:0;right:0;bottom:90px;text-align:center;font-size:110px">NPK <span class="g">EXPLAINED</span></div>
  ${logo('width:140px;height:140px;right:30px;top:420px')}`],
 'B-horizontal': [1280, 720, `<div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 50%,#1f4a2a,#0b1a0f)"></div>
  <img src="file://${R}/uploads/v22/npk.png" style="position:absolute;right:-10px;top:-40px;width:560px">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,26,15,1) 0%,rgba(11,26,15,.9) 45%,rgba(11,26,15,0) 62%)"></div>
  <div class="t" style="left:50px;top:70px;font-size:94px">WHAT DO<br>FERTILIZER<br><span class="g">NUMBERS</span> MEAN?</div>
  <div style="position:absolute;left:44px;bottom:60px">${chips(110, 10)}</div>
  ${logo('width:120px;height:120px;left:560px;bottom:44px')}`],
};
(async () => { const b = await chromium.launch();
 for (const [k, [w, h, html]] of Object.entries(V)) { const p = await b.newPage({ viewport: { width: w, height: h } });
  require('fs').writeFileSync(O + '/t.html', `<html><head><style>${css}</style></head><body style="width:${w}px;height:${h}px">${html}</body></html>`);
  await p.goto('file://' + O + '/t.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${__dirname}/thumb-${k}.jpg`, type: 'jpeg', quality: 92 }); await p.close(); }
 await b.close(); })();
