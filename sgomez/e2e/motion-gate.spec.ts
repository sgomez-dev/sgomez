import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const starts = (page: Page) => page.evaluate(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ ?? 0);

/**
 * Hoy el registro está vacío: en Chromium (con animation-timeline) el runtime no
 * se pide, a propósito. Para ejercitar la puerta de verdad se simula un navegador
 * sin animation-timeline, que sí lo necesita (respaldo de Firefox). Cuando la
 * Task 4 registre `count`, estos tests pueden volver a prescindir de la simulación.
 */
const withoutTimeline = (page: Page) =>
  page.addInitScript(() => {
    const orig = CSS.supports.bind(CSS);
    CSS.supports = ((p: string, v?: string) => (String(p).includes("animation-timeline") ? false : v === undefined ? orig(p) : orig(p, v))) as typeof CSS.supports;
  });

test.describe("puerta del movimiento", () => {
  test("sin nada que animar, el runtime no se pide (Chromium con animation-timeline)", async ({ page }) => {
    // Desde la Task 5/6 la home tiene primitivas registradas; la política legal no tiene ninguna.
    await page.goto("/es/privacy");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");
    await page.waitForTimeout(2500);
    expect(await starts(page)).toBe(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", /.*/);
  });

  test("con movimiento: estado on y el runtime se engancha tras idle y avisa con data-motion-ready", async ({ page }) => {
    await withoutTimeline(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
  });

  test("movimiento reducido: off, sin runtime, sin ready y sin animaciones", async ({ page }) => {
    await withoutTimeline(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(2500);
    expect(await starts(page)).toBe(0);
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", /.*/);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Review Focus 2: cambiar a reducido a mitad de visita para el runtime y lo apaga todo", async ({ page }) => {
    await withoutTimeline(page);
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    await expect(page.locator("html")).toHaveAttribute("data-motion-ready", "");
    await page.mouse.wheel(0, 2500);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion-ready", /.*/);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(await page.evaluate(() => document.querySelectorAll('[style*="clip-path"]').length)).toBe(0);
  });

  test("Review Focus 5: sin JS no hay atributo ni animaciones", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.locator("html").getAttribute("data-motion-state")).toBeNull();
    await ctx.close();
  });

  test("Review Focus 5: Save-Data apaga el movimiento", async ({ page }) => {
    await withoutTimeline(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await page.waitForTimeout(2500);
    expect(await starts(page)).toBe(0);
  });

  test("Review Focus 4: ida y vuelta por navegación de cliente re-engancha una sola vez", async ({ page }) => {
    await withoutTimeline(page);
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    await page.locator('footer a[href$="/about"]').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await page.goBack();
    await expect(page.locator("#about")).toBeVisible();
    await expect.poll(() => starts(page), { timeout: 5000 }).toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(500);
    const n = await starts(page);
    expect(n).toBeLessThanOrEqual(3);
  });

  test("E2: sin animation-timeline (Firefox), lo de abajo no parpadea: se esconde de antemano y se revela al entrar", async ({ page }) => {
    await withoutTimeline(page);
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    const h2 = page.locator('main h2[data-motion="text-reveal"]').last();
    // fuera de pantalla ya está escondido, sin que haya empezado ninguna animación
    expect(await h2.evaluate((el) => (el as HTMLElement).style.clipPath)).not.toBe("");
    expect(await h2.evaluate((el) => el.getAnimations().length)).toBe(0);
    await h2.scrollIntoViewIfNeeded();
    await expect.poll(() => h2.evaluate((el) => el.getAnimations().length), { timeout: 3000 }).toBeGreaterThan(0);
    await expect.poll(() => h2.evaluate((el) => (el as HTMLElement).style.clipPath), { timeout: 3000 }).toBe("");
    await expect(h2).toBeVisible();
  });

  test("E2: Nav y Footer quedan fuera del alcance del runtime", async ({ page }) => {
    await withoutTimeline(page);
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    expect(await page.evaluate(() => document.querySelectorAll('nav [style*="clip-path"], footer [style*="clip-path"]').length)).toBe(0);
  });
});
