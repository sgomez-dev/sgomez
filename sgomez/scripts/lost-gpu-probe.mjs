// Sonda del 404 en el worker con GPU real (fase 3, tarea 9). Uso: servir el build en :3201 y
// `node scripts/lost-gpu-probe.mjs <carpeta de capturas>`. Abre Chromium con ventana y ANGLE Metal: en headless pinta con SwiftShader.
import { chromium } from "@playwright/test";
const OUT = process.argv[2];
const BASE = process.env.BASE ?? "http://localhost:3201";
const b = await chromium.launch({ headless: false, args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: process.env.VIDEO ? { dir: process.env.VIDEO, size: { width: 1440, height: 900 } } : undefined });
const p = await ctx.newPage();
const errors = [];
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
p.on("pageerror", (e) => errors.push(String(e)));
// muestreo por rAF: fase, opacidades de lineas, video y lienzo
await p.addInitScript(() => {
  window.__log = [];
  const tick = () => {
    const st = document.querySelector('[data-stage="lost"]');
    const op = (sel) => { const e = document.querySelector(sel); return e ? +getComputedStyle(e).opacity : null; };
    const a = document.querySelector('a[data-shard-id="s3"]');
    window.__log.push({ t: Math.round(performance.now()), phase: st?.dataset.lostPhase ?? "", cover: st?.dataset.lostCover ?? "", lines: op("[data-lost-lines]"), video: op("[data-lost-video]"), canvas: op("[data-lost-canvas]"), tf: a ? a.style.transform : "" });
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
await p.goto(`${BASE}/en/no-existe`, { waitUntil: "load" });
await p.waitForSelector("[data-lost-video]", { timeout: 30000 });
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/fase-3-task9-1-video.png` });
await p.waitForSelector('[data-stage="lost"][data-lost-phase="idle"]', { timeout: 60000 });
await p.waitForTimeout(2500);
console.log("workers", await p.evaluate(() => window.__GLASS_LIVE_WORKERS__));
await p.screenshot({ path: `${OUT}/fase-3-task9-2-vivo.png` });

// relevo: opacidades alrededor del paso a escena
const log = await p.evaluate(() => window.__log);
const iScene = log.findIndex((r) => r.phase === "scene");
const around = log.slice(Math.max(0, iScene - 8), iScene + 40);
const minLines = Math.min(...log.slice(iScene - 10).map((r) => r.lines ?? 1));
console.log("relevo, fotogramas desde la entrada a escena (t, lines, video, canvas):");
for (const r of around.filter((_, i) => i % 3 === 0)) console.log(" ", r.t, r.phase, "lines", r.lines, "video", r.video, "canvas", r.canvas);
console.log("minimo de lineas desde 10 fotogramas antes del relevo:", minLines);

// los enlaces siguen a sus fragmentos: barrido de puntero y pasos del transform
const a = p.locator('a[data-shard-id="s3"]');
const bbox0 = await a.boundingBox();
await p.evaluate(() => { window.__log.length = 0; });
await p.mouse.move(60, 60);
await p.waitForTimeout(1500);
await p.mouse.move(60, 60);
for (let i = 0; i <= 40; i++) { await p.mouse.move(60 + (1320 * i) / 40, 60 + (780 * i) / 40); await p.waitForTimeout(16); }
await p.screenshot({ path: `${OUT}/fase-3-task9-3-barrido.png` });
await p.waitForTimeout(1500);
const sw = await p.evaluate(() => window.__log.map((r) => r.tf));
const parse = (s) => { const m = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(s); return m ? [+m[1], +m[2]] : null; };
const pts = sw.map(parse).filter(Boolean);
let maxStep = 0, changes = 0, total = 0;
for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d > 0) changes++; if (d > maxStep) maxStep = d; }
if (pts.length) total = Math.hypot(pts.at(-1)[0] - pts[0][0], pts.at(-1)[1] - pts[0][1]);
console.log("enlace s3: muestras", pts.length, "actualizaciones", changes, "paso maximo entre actualizaciones (px)", maxStep.toFixed(2), "recorrido total (px)", total.toFixed(1));
console.log("caja de s3 antes", JSON.stringify(bbox0), "despues", JSON.stringify(await a.boundingBox()));

// hover: brillo del fragmento
await a.hover();
await p.waitForTimeout(700);
await p.screenshot({ path: `${OUT}/fase-3-task9-4-hover.png` });
console.log("errores de consola:", errors.length ? errors.join(" | ") : "ninguno");
await ctx.close();
await b.close();
