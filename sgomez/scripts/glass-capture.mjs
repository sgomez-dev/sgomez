// Capturas y sondas de píxel del relevo póster → cristal del hero (fase 3, tarea 5).
// Uso: con el build servido en :3101, HEADED=1 node scripts/glass-capture.mjs <carpeta> [all|quick].
// HEADED=1 usa la GPU real; en headless Chromium pinta con SwiftShader y el color no vale. ONE=1 solo mide 1440x900.
// SEC=contact mide el cristal del contacto (por defecto, el hero).
// "poster body" y "3d relay frame" dan la caja de la silueta y el color medio (total y por tercios) de cada capa aislada.
import { chromium } from "@playwright/test";
import sharp from "sharp";
const OUT = process.argv[2];
const ONLY = process.argv[3] ?? "all";
const BASE = process.env.BASE ?? "http://localhost:3101/";
const b = await chromium.launch({ headless: process.env.HEADED ? false : true, args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const SEC = `#${process.env.SEC ?? "top"}`;
const STAGE = `${SEC} [data-glass]`;
const isolate = `${SEC} *{visibility:hidden!important} ${STAGE}, ${STAGE} *{visibility:visible!important} ${STAGE} button{visibility:hidden!important}`;

async function mask(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels, W = info.width, H = info.height;
  const bg = [data[0], data[1], data[2]];
  let x0 = W, y0 = H, x1 = -1, y1 = -1, n = 0, r = 0, g = 0, bl = 0, lum = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * ch;
    const d = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]);
    if (d < 60) continue;
    n++; r += data[i]; g += data[i + 1]; bl += data[i + 2];
    lum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
  }
  const band = (a, z) => { let k = 0, s = [0, 0, 0]; for (let y = Math.round(y0 + (y1 - y0) * a); y < y0 + (y1 - y0) * z; y++) for (let x = x0; x <= x1; x++) { const i = (y * W + x) * ch; if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) < 60) continue; k++; s[0] += data[i]; s[1] += data[i + 1]; s[2] += data[i + 2]; } return s.map((v) => Math.round(v / k)); };
  return { bbox: [x0, y0, x1, y1], w: x1 - x0 + 1, h: y1 - y0 + 1, rgb: [r / n, g / n, bl / n].map(Math.round), lum: Math.round(lum / n), top: band(0, 1 / 3), mid: band(1 / 3, 2 / 3), bot: band(2 / 3, 1) };
}

for (const [W, H] of (process.env.ONE ? [[1440, 900]] : [[1440, 900], [1920, 1080]])) {
  const tag = `${W}x${H}`;
  // póster solo: sin OffscreenCanvas no hay cristal vivo
  {
    const ctx = await b.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    await p.addInitScript(() => { delete HTMLCanvasElement.prototype.transferControlToOffscreen; });
    await p.goto(BASE, { waitUntil: "networkidle" });
    await p.locator(SEC).scrollIntoViewIfNeeded();
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${OUT}/fase-3-${process.env.SEC ?? "task5"}-${tag}-1-poster.png` });
    await p.addStyleTag({ content: isolate + ` ${STAGE} svg > g > path:first-child{visibility:hidden!important}` });
    const buf = await p.locator(STAGE).screenshot({ path: `${OUT}/iso-${tag}-poster.png` });
    const m = await mask(buf);
    console.log(tag, "poster body", JSON.stringify(m));
    await ctx.close();
  }
  // relevo y vivo
  {
    const ctx = await b.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__GLASS_FORCE_GATE__ = true; });
    await p.goto(BASE);
    await p.locator(SEC).scrollIntoViewIfNeeded();
    await p.waitForSelector(`${STAGE}[data-glass="live"]`, { timeout: 45000 });
    await p.locator(`${STAGE} button`).click(); // congela t en el fotograma del relevo
    await p.waitForTimeout(1200);
    await p.addStyleTag({ content: isolate + ` ${STAGE} svg, ${STAGE} svg *{visibility:hidden!important}` });
    const buf = await p.locator(STAGE).screenshot({ path: `${OUT}/iso-${tag}-3d.png` });
    const m = await mask(buf);
    console.log(tag, "3d relay frame", JSON.stringify(m));
    await ctx.close();
  }
  {
    const ctx = await b.newContext({ viewport: { width: W, height: H } });
    const p = await ctx.newPage();
    await p.addInitScript(() => { window.__GLASS_FORCE_GATE__ = true; });
    await p.goto(BASE);
    await p.locator(SEC).scrollIntoViewIfNeeded();
    await p.waitForSelector(`${STAGE}[data-glass="live"]`, { timeout: 45000 });
    await p.waitForTimeout(400);
    await p.screenshot({ path: `${OUT}/fase-3-${process.env.SEC ?? "task5"}-${tag}-2-fundido.png` });
    await p.waitForTimeout(2600);
    await p.screenshot({ path: `${OUT}/fase-3-${process.env.SEC ?? "task5"}-${tag}-3-vivo.png` });
    if (ONLY === "all") {
      await p.waitForTimeout(57000);
      await p.screenshot({ path: `${OUT}/fase-3-${process.env.SEC ?? "task5"}-${tag}-4-a-60s.png` });
    }
    const gl = await p.evaluate(() => { const c = document.createElement("canvas").getContext("webgl2"); const e = c.getExtension("WEBGL_debug_renderer_info"); return e ? c.getParameter(e.UNMASKED_RENDERER_WEBGL) : "?"; });
    console.log(tag, "renderer", gl);
    await ctx.close();
  }
}
await b.close();
