// Capturas de las URL públicas de los tres proyectos destacados (las mismas de content/index.tsx).
// Para cada una: la primera pantalla (top.png) y otra a media página (mid.png), a 1440x900.
// Las imágenes se commitean en video/public/projects/<slug>/. Si una URL no responde, ese proyecto no tiene reel.
//
//   node scripts/capture-projects.mjs
//   node scripts/capture-projects.mjs claude-canvas
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Playwright vive en la app (sgomez/), no en video/.
const { chromium } = createRequire(join(root, "..", "sgomez", "package.json"))("@playwright/test");

import { PROJECTS } from "./projects.mjs";

const only = process.argv.slice(2);
const browser = await chromium.launch();
for (const p of PROJECTS.filter((x) => only.length === 0 || only.includes(x.slug))) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: "es-ES", colorScheme: "dark" });
  const page = await ctx.newPage();
  const res = await page.goto(p.url, { waitUntil: "networkidle", timeout: 45000 }).catch((e) => {
    console.error(`${p.slug}: ${e.message}`);
    return null;
  });
  if (!res || res.status() >= 400) {
    console.error(`${p.slug}: sin respuesta útil (${res?.status()}), sin reel`);
    await ctx.close();
    continue;
  }
  await page.waitForTimeout(2500);
  const dir = join(root, "public", "projects", p.slug);
  mkdirSync(dir, { recursive: true });
  await page.screenshot({ path: join(dir, "top.png") });
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, Math.round(h / 2 - 450)));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: join(dir, "mid.png") });
  console.log(`${p.slug}: ${res.status()} altura ${h}`);
  await ctx.close();
}
await browser.close();
