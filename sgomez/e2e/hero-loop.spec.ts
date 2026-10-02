import { test, expect } from "./fixtures";

/** Capítulo 01 por debajo de lg: el bucle del cristal es la reserva del 3D en vivo. Desde lg manda el 3D y no hay vídeo. */
const LOOP = /\/media\/hero\/loop\.(webm|mp4)/;

test.describe("hero, bucle del cristal", () => {
  test("sin JS: solo el póster SVG y ninguna descarga de vídeo", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => LOOP.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.waitForTimeout(2500);
    expect(await page.locator("#top [data-motion=glass]").count()).toBe(1);
    expect(await page.locator("#top video").count()).toBe(0);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo el póster y ninguna descarga", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => LOOP.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(3500);
    expect(await page.locator("#top video").count()).toBe(0);
    expect(await page.locator("#top button").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("Save-Data: solo el póster y ninguna descarga", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => LOOP.test(r.url()) && asked.push(r.url()));
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await page.waitForTimeout(3500);
    expect(await page.locator("#top video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("desde lg no hay bucle: manda el 3D en vivo", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    const asked: string[] = [];
    page.on("request", (r) => LOOP.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.waitForTimeout(3500);
    expect(await page.locator("#top video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("por debajo de lg: tras load suena en bucle, mudo, con «Pausar movimiento» y sin CLS", async ({ page }, info) => {
    test.skip(info.project.name === "desktop", "solo por debajo de lg");
    const asked: string[] = [];
    let loaded = false;
    page.on("load", () => (loaded = true));
    page.on("request", (r) => {
      if (LOOP.test(r.url())) asked.push(loaded ? "after-load" : "before-load");
    });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) (window as unknown as { __cls: number }).__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/");
    const stage = page.locator("#top [data-hero-loop]");
    const box0 = await page.locator("#top [data-glass]").evaluate((e) => [e.clientWidth, e.clientHeight]);
    await expect(stage).toHaveAttribute("data-hero-loop", "live", { timeout: 20000 });
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every((a) => a === "after-load")).toBe(true);
    // el vídeo no está en el documento (si no, sería candidato a LCP): suena sin árbol y la caja lo anuncia
    expect(await page.locator("#top video").count()).toBe(0);
    await expect(stage).toHaveAttribute("data-playing", "true");
    expect(await page.locator("#top [data-glass]").evaluate((e) => [e.clientWidth, e.clientHeight])).toEqual(box0);
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(0.01);
    // los fotogramas llegan al lienzo visible, con alfa
    const alpha = await stage.locator("canvas").evaluate((c: HTMLCanvasElement) => {
      const d = c.getContext("2d")!.getImageData(0, 0, c.width, c.height).data;
      let solid = 0;
      let clear = 0;
      for (let i = 3; i < d.length; i += 4) {
        if (d[i]! > 200) solid++;
        else if (d[i]! === 0) clear++;
      }
      return { solid, clear };
    });
    expect(alpha.solid).toBeGreaterThan(20000);
    expect(alpha.clear).toBeGreaterThan(20000);
    const btn = page.getByRole("button", { name: "Pausar movimiento" });
    await expect(btn).toBeVisible();
    await btn.click();
    await expect(btn).toHaveAttribute("aria-pressed", "true");
    await expect(stage).toHaveAttribute("data-playing", "false");
    await btn.click();
    await expect(stage).toHaveAttribute("data-playing", "true");
  });
});
