import { test, expect } from "./fixtures";

/** Capítulo 05: el reel de cada ficha destacada. El póster va en el SSR; el vídeo solo con movimiento, en pantalla y tras load e idle. */
const REELS = /\/media\/reels\/[\w-]+\.(webm|mp4)/;
const reels = (page: import("@playwright/test").Page) => page.locator("#work [data-reel]");

test.describe("capítulo 05, reels de proyectos", () => {
  test("sin JS: tres pósters, ningún vídeo y las fichas siguen siendo enlaces", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    expect(await reels(page).count()).toBe(3);
    expect(await page.locator("#work video").count()).toBe(0);
    for (const img of await reels(page).locator("img").all()) expect(await img.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    expect(await page.locator("#work li > a[href^='https://']").count()).toBeGreaterThanOrEqual(3);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo pósters y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    for (const r of await reels(page).all()) await expect(r).toHaveAttribute("data-reel", "poster");
    expect(await page.locator("#work video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("Save-Data: solo pósters y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(r.url()));
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await page.locator("#work").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    expect(await page.locator("#work video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("con JS: lejos no se pide nada; al llegar suena solo el reel visible, sin CLS y la ficha mantiene su caja", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    const first = reels(page).first();
    await first.scrollIntoViewIfNeeded();
    const before = await first.boundingBox();
    await expect(first).toHaveAttribute("data-reel", "live", { timeout: 20000 });
    const after = await first.boundingBox();
    expect(after).toEqual(before);
    expect(await first.locator("video").evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.loop)).toBe(true);
    // en pantallas bajas puede haber entrado también la ficha siguiente, pero nunca la tercera sin haber llegado a ella
    expect(asked.some((u) => u.startsWith("/media/reels/claude-canvas."))).toBe(true);
    expect(asked.some((u) => u.startsWith("/media/reels/nudaui."))).toBe(false);
    // el vídeo es decorativo y no se puede enfocar
    await expect(first.locator("video")).toHaveAttribute("aria-hidden", "true");
    // al alejarse se pausa
    await page.locator("#top").scrollIntoViewIfNeeded();
    await expect.poll(() => first.locator("video").evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("la ficha sigue siendo un único enlace accesible con su nombre", async ({ page }) => {
    await page.goto("/");
    const card = page.locator("#work li").first().locator("a");
    await expect(card).toHaveCount(1);
    await expect(card).toHaveAttribute("rel", /noopener/);
    expect(await card.getAttribute("aria-label")).toBeNull();
    expect((await card.innerText()).length).toBeGreaterThan(10);
    expect(await card.locator("[data-reel]").getAttribute("aria-hidden")).toBe("true");
  });
});
