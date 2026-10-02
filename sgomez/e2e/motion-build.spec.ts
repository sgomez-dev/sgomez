import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { scrollToProgress, settledInViewport } from "./motion-utils";

/** El CSS de las primitivas lo inyecta el runtime tras idle: se espera a que esté. */
const motionCss = (page: Page) => page.waitForSelector("style[data-motion-css]", { state: "attached" });

test.describe("titulares y open source", () => {
  test("a mitad de la entrada la tarjeta esta a medio construir y sin violaciones de axe", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await scrollToProgress(page, "#open-source ul", 0.85);
    const progress = await page.locator('#open-source [data-layer="content"]').first().evaluate((el) => el.getAnimations()[0]?.effect?.getComputedTiming().progress ?? null);
    expect(progress).not.toBeNull();
    expect(progress).toBeLessThan(1);
    const r = await new AxeBuilder({ page }).include("#open-source").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("entera en pantalla, la tarjeta esta terminada", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await scrollToProgress(page, "#open-source ul", 0.15);
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("Review Focus 1: al final del documento todo lo visible esta terminado", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    expect(await settledInViewport(page)).toEqual([]);
  });

  test("el h1 del hero no tiene animacion", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    expect(await page.locator("h1").first().evaluate((el) => el.getAnimations().length)).toBe(0);
  });

  test("movimiento reducido: sin estilo de movimiento y todo el contenido visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(2500);
    expect(await page.locator("style[data-motion-css]").count()).toBe(0);
    await scrollToProgress(page, "#open-source ul", 0.85);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(page.locator('#open-source [data-layer="content"]').first()).toBeVisible();
    await expect(page.locator("#open-source h2")).toBeVisible();
  });

  test("Review Focus 2: pasar a reducido a mitad de visita retira el CSS y deja todo en su estado final", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await scrollToProgress(page, "#open-source ul", 0.85);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("style[data-motion-css]")).toHaveCount(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
