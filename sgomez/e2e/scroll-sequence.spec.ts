import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { layoutShiftDuring } from "./motion-utils";

/** La página /e2e-sequence solo existe con E2E_FIXTURES=1 (playwright.config.ts). 24 fotogramas, ver scripts/make-fixture-sequence.mjs. */
const FRAMES = /\/media\/__fixture\/(desktop|mobile)\//;
const FRAMES_N = 24;

/** Pone la sección al progreso `p` (0 entrando por abajo, 1 saliendo por arriba) con el mismo cálculo del reproductor. */
async function seekTo(page: Page, p: number) {
  await page.evaluate((p) => {
    const el = document.querySelector("[data-sequence]")!;
    const top = el.getBoundingClientRect().top + scrollY;
    const h = el.getBoundingClientRect().height;
    scrollTo({ top: top - (innerHeight - p * (innerHeight + h)), behavior: "instant" });
  }, p);
}
const frameOf = (page: Page) => page.locator("[data-sequence-canvas]").getAttribute("data-frame");

test.describe("sin canvas: solo el póster y ningún fotograma", () => {
  test("sin JS", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.goto("/e2e-sequence");
    await page.locator("#seq").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(page.locator("[data-sequence] img")).toHaveAttribute("src", "/media/__fixture/poster.webp");
    expect(await page.locator("canvas").count()).toBe(0);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/e2e-sequence");
    await seekTo(page, 0.5);
    await page.waitForTimeout(3500);
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "poster");
    expect(await page.locator("canvas").count()).toBe(0);
    expect(asked).toEqual([]);
    // el póster se ve de verdad
    expect(await page.locator("[data-sequence] img").evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
  });

  test("pasar a reducido a mitad de visita apaga el canvas y vuelve el póster", async ({ page }) => {
    await page.goto("/e2e-sequence");
    await seekTo(page, 0.5);
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "live");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "off");
    expect(await page.locator("canvas").count()).toBe(0);
    await expect(page.locator("[data-sequence] img")).toHaveCSS("opacity", "1");
  });
});

test.describe("reproductor", () => {
  test("lejos de la sección no se pide nada; a un viewport empieza, 1 de cada 4 primero", async ({ page }, info) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/e2e-sequence");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    await seekTo(page, 0.2);
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "live");
    await expect.poll(() => asked.length).toBe(FRAMES_N);
    const size = info.project.name === "desktop" ? "desktop" : "mobile";
    const n = (u: string) => Number(u.match(/(\d{4})\.webp$/)![1]);
    expect(asked.every((u) => u.startsWith(`/media/__fixture/${size}/`))).toBe(true);
    // el orden de petición: primero 1,5,9,13,17,21,24 (índices 0,4,...,23), después el resto
    expect(asked.slice(0, 7).map(n)).toEqual([1, 5, 9, 13, 17, 21, 24]);
    expect(new Set(asked).size).toBe(FRAMES_N);
  });

  test("con el scroll el canvas cambia de fotograma y de píxeles, sin CLS", async ({ page }) => {
    await page.goto("/e2e-sequence");
    await page.waitForLoadState("load");
    const shift = await layoutShiftDuring(page, async () => {
      await seekTo(page, 0.05);
      await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "live");
      await expect.poll(() => frameOf(page)).toBe("2");
      const a = await page.locator("[data-sequence-canvas]").evaluate((c: HTMLCanvasElement) => c.toDataURL());
      await seekTo(page, 0.52);
      await expect.poll(() => frameOf(page)).toBe("13");
      const b = await page.locator("[data-sequence-canvas]").evaluate((c: HTMLCanvasElement) => c.toDataURL());
      await seekTo(page, 0.99);
      await expect.poll(() => frameOf(page)).toBe("24");
      const c = await page.locator("[data-sequence-canvas]").evaluate((c: HTMLCanvasElement) => c.toDataURL());
      expect(new Set([a, b, c]).size).toBe(3);
      // el canvas ocupa la misma caja que el póster
      const box = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const cv = r("[data-sequence-canvas]");
        const bx = r("[data-sequence]");
        return [Math.abs(cv.width - bx.width), Math.abs(cv.height - bx.height)];
      });
      expect(box).toEqual([0, 0]);
    });
    expect(shift).toBe(0);
  });

  test("la caja tiene su proporción desde el SSR (sin CLS al montar el canvas)", async ({ page }) => {
    await page.goto("/e2e-sequence");
    const before = await page.locator("[data-sequence]").boundingBox();
    await seekTo(page, 0.3);
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "live");
    const after = await page.locator("[data-sequence]").boundingBox();
    expect(after!.width).toBe(before!.width);
    expect(after!.height).toBe(before!.height);
    expect(Math.abs(after!.width / after!.height - 16 / 9)).toBeLessThan(0.01);
  });

  test("al alejarse se sueltan los fotogramas y al volver se recargan", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.goto("/e2e-sequence");
    await seekTo(page, 0.3);
    await expect.poll(() => asked.length).toBe(FRAMES_N);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(500);
    const kept = await page.locator("[data-sequence-canvas]").evaluate((c: HTMLCanvasElement) => c.width > 0);
    expect(kept).toBe(true);
    await seekTo(page, 0.6);
    await expect.poll(() => frameOf(page)).toBe("15");
  });

  test("axe sobre la página en vivo", async ({ page }) => {
    await page.goto("/e2e-sequence");
    await seekTo(page, 0.4);
    await expect(page.locator("[data-sequence]")).toHaveAttribute("data-sequence", "live");
    const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });
});
