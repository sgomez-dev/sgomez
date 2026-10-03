import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";


const ready = (page: Page) => page.waitForFunction(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ === 1);
const FIRST = '#about dd[data-motion="count"]';

test.describe("capitulo 02", () => {
  test("a mitad, unas palabras encendidas y otras no, todas AA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on"); // el CSS es estatico: vivo desde el primer pintado
    // La bio es sticky desde lg: manda la rejilla, no el parrafo. Se baja hasta pillarla a medias.
    let colors = 0;
    for (let y = 0; y < 2200 && colors < 2; y += 60) {
      await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), await page.evaluate(() => document.querySelector("#about")!.getBoundingClientRect().top + scrollY) + y - 200);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      colors = await page.locator('#about [data-motion="word-reveal"] [data-w]').evaluateAll((els) => new Set(els.map((e) => getComputedStyle(e).color)).size);
    }
    expect(colors).toBeGreaterThan(1);
    const r = await new AxeBuilder({ page }).include("#about").withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
  });

  test("las cifras cuentan y acaban en su valor", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const first = page.locator(FIRST).first();
    const value = await first.getAttribute("data-value");
    test.skip(await first.evaluate((el) => el.getBoundingClientRect().top < innerHeight), "la fila ya esta a la vista al cargar: se queda con su numero");
    await expect(first.locator("[data-count]")).toHaveText("0");
    await first.scrollIntoViewIfNeeded();
    await expect(first.locator("[data-count]")).toHaveText(value!, { timeout: 4000 });
  });

  test("Review Focus 2: con reducido a mitad de la cuenta, el numero real al instante", async ({ page }) => {
    await page.goto("/");
    await ready(page);
    const first = page.locator(FIRST).first();
    const value = await first.getAttribute("data-value");
    test.skip(await first.evaluate((el) => el.getBoundingClientRect().top < innerHeight), "la fila ya esta a la vista al cargar");
    await expect(first.locator("[data-count]")).toHaveText("0");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(first.locator("[data-count]")).toHaveText(value!);
  });

  test("una cifra ya visible al llegar el runtime no se toca", async ({ page }) => {
    await page.goto("/#about");
    const first = page.locator(FIRST).first();
    await first.scrollIntoViewIfNeeded();
    await ready(page);
    await page.waitForTimeout(300);
    await expect(first.locator("[data-count]")).toHaveText((await first.getAttribute("data-value"))!);
  });

  test("sin JS la bio y las cifras estan completas", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    const first = page.locator(FIRST).first();
    await expect(first.locator("[data-count]")).toHaveText((await first.getAttribute("data-value"))!);
    await expect(page.locator('#about [data-motion="word-reveal"]')).toBeVisible();
    await ctx.close();
  });
});
