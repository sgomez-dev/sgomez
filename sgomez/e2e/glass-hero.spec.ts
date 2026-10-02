import { test, expect } from "./fixtures";
import { blockGlassWorker, forceGlass, longTasksDuringGlass, watchLcp, watchLongTasks } from "./glass-utils";

const HERO = "#top [data-glass]";
const workers = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0);

test.describe("cristal vivo del hero (escritorio)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    test.setTimeout(90_000);
  });

  test("toma el relevo del póster, sin tareas largas en el hilo principal y sin tocar el LCP", async ({ page }) => {
    await watchLongTasks(page);
    await watchLcp(page);
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await expect(page.locator(`${HERO} canvas`)).toHaveCSS("opacity", "1");
    expect(await longTasksDuringGlass(page, "hero")).toEqual([]);
    const lcp = await page.evaluate(() => ({ ...(window as unknown as { __lcp: { tag: string; t: number } }).__lcp, start: performance.getEntriesByName("glass:start:hero")[0]?.startTime ?? 0 }));
    expect(["H1", "IMG"]).toContain(lcp.tag);
    expect(lcp.t).toBeLessThan(lcp.start);
  });

  test("pausa con aria-pressed y teclado, con la etiqueta «Pausar movimiento»", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    const pause = page.locator(`${HERO} button[aria-pressed]`);
    await expect(pause).toHaveText("Pausar movimiento");
    await expect(pause).toHaveAttribute("aria-pressed", "false");
    await pause.focus();
    await page.keyboard.press("Enter");
    await expect(pause).toHaveAttribute("aria-pressed", "true");
    const box = await pause.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("Review Focus 1: cruzar lg desmonta el lienzo y no vuelve", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.setViewportSize({ width: 800, height: 800 });
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off");
    await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
    await expect(page.locator(`${HERO} button[aria-pressed]`)).toHaveCount(0);
    await expect.poll(() => workers(page)).toBe(0);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(1500);
    await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
  });

  test("Review Focus 2: movimiento reducido a mitad de visita devuelve el póster", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off");
    await expect(page.locator(`${HERO} [data-motion="glass"]`)).toHaveCSS("opacity", "1");
    await expect.poll(() => workers(page)).toBe(0);
  });

  test("Review Focus 3: worker bloqueado, póster completo y sin errores", async ({ page, consoleErrors }) => {
    await forceGlass(page);
    const state = await blockGlassWorker(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off", { timeout: 30_000 });
    expect(state.aborted).toBe(true);
    await expect(page.locator(`${HERO} [data-motion="glass"]`)).toBeVisible();
    // el aborto deja su propio mensaje de red: se filtra solo ese
    consoleErrors.splice(0, consoleErrors.length, ...consoleErrors.filter((e) => !/ERR_FAILED/.test(e)));
  });

  test("Review Focus 3: sin OffscreenCanvas no se monta nada", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => {
      delete (HTMLCanvasElement.prototype as unknown as { transferControlToOffscreen?: unknown }).transferControlToOffscreen;
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
    expect(await workers(page)).toBe(0);
  });

  test("Save-Data: nunca hay worker", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  });

  test("equipo modesto (2 núcleos): póster", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "hardwareConcurrency", { value: 2 }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  });
});

test("móvil y horizontal: nunca hay lienzo ni worker", async ({ page }, info) => {
  test.skip(!["mobile", "landscape", "small", "tablet"].includes(info.project.name), "solo por debajo de lg");
  await forceGlass(page);
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
  await expect(page.locator(`${HERO} canvas`)).toHaveCount(0);
});

test("sin JS: póster en su sitio", async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("http://localhost:" + (process.env.E2E_PORT ?? "3000") + "/");
  await expect(page.locator(`${HERO} [data-motion="glass"]`)).toBeVisible();
  await ctx.close();
});
