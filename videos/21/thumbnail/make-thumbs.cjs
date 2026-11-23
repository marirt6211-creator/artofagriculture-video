const { chromium } = require('playwright');
const R = '/home/user/artofagriculture-video', O = R + '/out/th';
const css = `@font-face{font-family:Anton;src:url(file://${R}/public/fonts/Anton-Regular.ttf)}
body{margin:0;overflow:hidden;position:relative;background:#000}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.t{position:absolute;font-family:Anton;line-height:.92;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.85),0 2px 4px rgba(0,0,0,.9)}
.g{color:#ffcf5a;text-shadow:0 0 34px rgba(255,190,70,.7),0 6px 24px rgba(0,0,0,.85)}
.pill{position:absolute;font-family:Anton;letter-spacing:2px;color:#fff;background:rgba(8,20,10,.7);border:4px solid #ffcf5a;border-radius:60px;padding:10px 34px}
.logo{position:absolute;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}
.star{position:absolute;width:150px;height:150px;background:radial-gradient(circle,#fff 0 6%,rgba(255,226,140,.8) 12%,rgba(255,207,90,0) 60%)}
.star:before,.star:after{content:"";position:absolute;left:50%;top:50%;width:260px;height:6px;margin:-3px 0 0 -130px;background:linear-gradient(90deg,transparent,#fff,transparent)}.star:after{transform:rotate(90deg)}`;
const logo = (s) => `<img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="${s}">`;
const V = {
 // vertical Shorts cover: the user's two-tree comparison
 'A-vertical': [1080, 1920, `<img class="bg" src="file://${R}/uploads/v21/two-trees.jpg">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 22%,rgba(0,0,0,0) 70%,rgba(0,0,0,.75) 100%)"></div>
  <div class="t" style="left:0;right:0;top:70px;text-align:center;font-size:150px">WIND MAKES<br>PLANTS <span class="g">STRONGER?</span></div>
  <div class="pill" style="left:60px;top:840px;font-size:64px;border-color:#fff">NO WIND</div>
  <div class="pill" style="right:60px;top:1010px;font-size:64px;color:#ffcf5a">WIND</div>
  <div class="star" style="left:770px;top:1120px"></div>
  <div class="t" style="left:0;right:0;bottom:90px;text-align:center;font-size:96px">THIGMO<span class="g">MORPHO</span>GENESIS</div>
  ${logo('width:150px;height:150px;left:30px;top:1500px')}`],
 // horizontal (feeds / community post)
 'B-horizontal': [1280, 720, `<img class="bg" src="file://${O}/trunk.jpg" style="transform:scale(1.08);transform-origin:80% 50%">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.8) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,0) 80%)"></div>
  <div class="t" style="left:50px;top:110px;font-size:120px">A BREEZE<br>MAKES TREES<br><span class="g">STRONGER</span></div>
  <div class="star" style="left:470px;top:400px"></div>
  ${logo('width:120px;height:120px;right:28px;top:24px')}`],
};
(async () => { const b = await chromium.launch();
 for (const [k, [w, h, html]] of Object.entries(V)) { const p = await b.newPage({ viewport: { width: w, height: h } });
  require('fs').writeFileSync(O + '/t.html', `<html><head><style>${css}</style></head><body style="width:${w}px;height:${h}px">${html}</body></html>`);
  await p.goto('file://' + O + '/t.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: `${__dirname}/thumb-${k}.jpg`, type: 'jpeg', quality: 92 }); await p.close(); }
 await b.close(); })();
