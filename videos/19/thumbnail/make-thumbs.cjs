const { chromium } = require('playwright');
const R = '/home/user/artofagriculture-video';
const css = `@font-face{font-family:Anton;src:url(file://${R}/public/fonts/Anton-Regular.ttf)}@font-face{font-family:Bask;src:url(file://${R}/public/fonts/LibreBaskerville.ttf)}
body{margin:0;width:1280px;height:720px;overflow:hidden;position:relative;background:#000}
.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.t{position:absolute;font-family:Anton;line-height:.92;letter-spacing:1px;text-transform:uppercase;color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.85),0 2px 4px rgba(0,0,0,.9)}
.g{color:#ffcf5a;text-shadow:0 0 34px rgba(255,190,70,.7),0 6px 24px rgba(0,0,0,.85)}
@font-face{font-family:Vazirmatn;src:url(file://${R}/public/fonts/Vazirmatn-Black.ttf)}
.logo{position:absolute;width:118px;height:118px;filter:drop-shadow(0 4px 12px rgba(0,0,0,.6))}`;
const V = {
 A: `<img class="bg" src="file://${R}/public/v19/art/b02.jpg" style="transform:scale(1.12);transform-origin:30% 60%">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.75) 78%)"></div>
  <div class="t" style="right:48px;top:150px;text-align:right;font-size:150px">SOIL IS<br><span class="g">ALIVE</span></div>
  <div style="position:absolute;right:52px;top:470px;font:700 34px Bask;color:#fff;text-shadow:0 3px 12px #000;text-align:right">The hidden world<br>beneath our feet</div>
  <img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="left:28px;top:24px">`,
 B: `<img class="bg" src="file://${R}/public/v19/art/b10.jpg" style="transform:scale(1.05)">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,0) 30%,rgba(0,0,0,.65) 100%)"></div>
  <div class="t" style="left:0;right:0;top:40px;text-align:center;font-size:118px">PLANTS <span class="g">DON'T</span> WORK ALONE</div>
  <div class="t" style="left:0;right:0;bottom:44px;text-align:center;font-size:72px">THE SECRET LIFE OF <span class="g">SOIL</span></div>
  <img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="right:26px;top:300px">`,
 C: `<img class="bg" src="file://${R}/public/v19/art/b02.jpg" style="transform:scale(1.12);transform-origin:30% 60%">
  <div style="position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.75) 78%)"></div>
  <div class="t" style="right:48px;top:150px;text-align:right;font-size:150px">SOIL IS<br><span class="g">ALIVE</span></div>
  <div style="position:absolute;right:52px;top:470px;font:700 34px Bask;color:#fff;text-shadow:0 3px 12px #000;text-align:right">The hidden world<br>beneath our feet</div>
  <img class="logo" src="file://${R}/public/brand/aoa-logo.png" style="left:28px;top:24px">
  <div style="position:absolute;left:28px;bottom:30px;background:#ffcf5a;color:#1b1206;font:900 44px Vazirmatn;padding:8px 26px 14px;border-radius:14px;direction:rtl;box-shadow:0 6px 20px rgba(0,0,0,.6)">زیرنویس فارسی</div>`,
};
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
 for (const [k, h] of Object.entries(V)) { require("fs").writeFileSync(__dirname + "/t.html", `<html><head><style>${css}</style></head><body>${h}</body></html>`); await p.goto("file://" + __dirname + "/t.html"); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300); await p.screenshot({ path: `thumb-${k}.jpg`, type: 'jpeg', quality: 92 }); }
 await b.close(); })();
