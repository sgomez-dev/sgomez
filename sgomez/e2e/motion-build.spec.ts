import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { scrollToProgress, settledInViewport, unfinishedWhenMostlyVisible } from "./motion-utils";

/** El CSS de las primitivas lo inyecta el runtime tras idle: se espera a que esté. */
/** El CSS de movimiento es estatico (E5 revisada): esta vivo en cuanto el estado es on. */
const motionCss = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");

test.describe("titulares y open source", () => {
  test("a mitad de la entrada la tarjeta esta a medio construir y sin violaciones de axe", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await scrollToProgress(page, "#open-source ul", 0.93);
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

  test("movimiento reducido: sin movimiento y todo el contenido visible", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(2500);
    expect(await page.locator("style[data-motion-css]").count()).toBe(0);
    await scrollToProgress(page, "#open-source ul", 0.85);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(page.locator('#open-source [data-layer="content"]').first()).toBeVisible();
    await expect(page.locator("#open-source h2")).toBeVisible();
  });

  test("Review Focus 2: pasar a reducido a mitad de visita apaga el movimiento y deja todo en su estado final", async ({ page }) => {
    await page.goto("/");
    await motionCss(page);
    await scrollToProgress(page, "#open-source ul", 0.85);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("style[data-motion-css]")).toHaveCount(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});

/** Cada ancla de la navegacion aterriza con lo que se ve ya construido, a los tamanos en que el scroll del ancla deja tarjetas cortadas abajo. */
const LANDINGS = [
  { w: 1366, h: 700 },
  { w: 1280, h: 800 },
  { w: 1440, h: 900 },
  { w: 375, h: 812 },
];
for (const v of LANDINGS) {
  test.describe(`ancla aterriza terminada ${v.w}x${v.h}`, () => {
    test.use({ viewport: { width: v.w, height: v.h } });
    for (const id of ["about", "work", "open-source", "contact"]) {
      test(`#${id}`, async ({ page }, info) => {
        test.skip(info.project.name !== "desktop", "el tamano lo fija la propia prueba; basta con un proyecto");
        await page.goto(`/#${id}`);
        await motionCss(page);
        await page.waitForTimeout(400);
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        expect(await unfinishedWhenMostlyVisible(page, '[data-motion="build"]', 0.6)).toEqual([]);
        expect(await settledInViewport(page)).toEqual([]);
      });
    }
  });
}
