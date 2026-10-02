import { test, expect } from "./fixtures";
import { blockGlassWorker, forceGlass, glassMessages, longTasksDuringGlass, posterOpacityWhenOff, spyGlassMessages, watchLcp, watchLongTasks } from "./glass-utils";

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
    // El LCP sigue siendo el titular o el retrato y llega antes de que el cristal esté listo (no compite con él).
    const lcp = await page.evaluate(() => ({ ...(window as unknown as { __lcp: { tag: string; t: number } }).__lcp, ready: performance.getEntriesByName("glass:ready:hero")[0]?.startTime ?? 0 }));
    expect(["H1", "IMG"]).toContain(lcp.tag);
    expect(lcp.t).toBeLessThan(lcp.ready);
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
    const opacity = posterOpacityWhenOff(page, HERO);
    await page.setViewportSize({ width: 800, height: 800 });
    expect(await opacity).toBe("1");
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
    const opacity = posterOpacityWhenOff(page, HERO);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await opacity).toBe("1");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "off");
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
    const workerRequests: string[] = [];
    page.on("request", (r) => /turbopack-worker/.test(r.url()) && workerRequests.push(r.url()));
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
    expect(await workers(page)).toBe(0);
    expect(workerRequests).toEqual([]);
  });

  test("memoria baja (2 GB): póster y sin worker", async ({ page }) => {
    await forceGlass(page);
    await page.addInitScript(() => Object.defineProperty(navigator, "deviceMemory", { value: 2 }));
    await page.goto("/", { waitUntil: "networkidle" });
    await page.waitForTimeout(3500);
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "poster");
    expect(await workers(page)).toBe(0);
  });

  test("visibilidad: avisa al montar y al ocultar la pestaña", async ({ page }) => {
    await forceGlass(page);
    await spyGlassMessages(page);
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    const types = (await glassMessages(page)).map((m) => m.type);
    // la primera visibilidad sale justo tras init, sin esperar a que cambie nada
    expect(types.slice(types.indexOf("init"))).toContain("visible");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await expect.poll(async () => (await glassMessages(page)).at(-1)).toMatchObject({ type: "visible", id: "hero", visible: false });
  });

  test("vigilante de DPR: otra densidad de pantalla redimensiona el lienzo", async ({ page }) => {
    await forceGlass(page);
    await spyGlassMessages(page);
    // La emulación de CDP cambia devicePixelRatio pero no dispara `change` en la consulta de resolución:
    // se guarda el listener que registra el vigilante y se dispara a mano con el DPR nuevo.
    await page.addInitScript(() => {
      const w = window as unknown as { __dprListeners: (() => void)[] };
      w.__dprListeners = [];
      const mm = window.matchMedia.bind(window);
      window.matchMedia = (q: string) => {
        const list = mm(q);
        if (/resolution/.test(q)) {
          const add = list.addEventListener.bind(list);
          list.addEventListener = ((type: string, cb: () => void, o?: AddEventListenerOptions) => {
            if (type === "change") w.__dprListeners.push(cb);
            add(type, cb, o);
          }) as typeof list.addEventListener;
        }
        return list;
      };
    });
    await page.goto("/");
    await expect(page.locator(HERO)).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    const fire = (dpr: number) =>
      page.evaluate((dpr) => {
        Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => dpr });
        const w = window as unknown as { __dprListeners: (() => void)[] };
        w.__dprListeners.at(-1)?.();
      }, dpr);
    await fire(2);
    await expect.poll(async () => (await glassMessages(page)).some((m) => m.type === "resize" && m.dpr === 2)).toBe(true);
    // se vuelve a armar con la densidad nueva
    await fire(1.5);
    await expect.poll(async () => (await glassMessages(page)).some((m) => m.type === "resize" && m.dpr === 1.5)).toBe(true);
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
