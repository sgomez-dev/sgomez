import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/** Capítulo 03 con su secuencia real (public/media/build). La lista de capas del DOM es el contenido; la secuencia es decorativa. */
const FRAMES = /\/media\/build\/(desktop|mobile)\//;
const box = (page: Page) => page.locator("[data-sequence-id=build]");

test.describe("capítulo 03, secuencia de las seis losas", () => {
  test("sin JS: solo el póster, ningún fotograma y las seis capas en el DOM", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.locator("#build").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(box(page).locator("img")).toHaveAttribute("src", "/media/build/poster.webp");
    expect(await box(page).locator("canvas").count()).toBe(0);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo el póster, visible, y las seis capas", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#build").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    await expect(box(page)).toHaveAttribute("data-sequence", "poster");
    expect(await box(page).locator("canvas").count()).toBe(0);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
    expect(await box(page).locator("img").evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    expect(asked).toEqual([]);
  });

  test("con JS: lejos no se pide nada, al llegar pinta y pide el tamaño que toca", async ({ page }, info) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    await page.locator("#build").scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-sequence", "live", { timeout: 20000 });
    const size = info.project.name === "desktop" ? "desktop" : "mobile";
    await expect.poll(() => asked.length).toBe(90);
    expect(asked.every((u) => u.startsWith(`/media/build/${size}/`))).toBe(true);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
  });
});
