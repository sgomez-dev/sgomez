import { test, expect } from "./fixtures";

/** Capítulo 05: el reel de cada ficha destacada. El póster va en el SSR; el vídeo solo a petición (hover o foco) con puntero fino y movimiento permitido. */
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

  test("con puntero fino: solo se reproduce a petición (hover o foco), sin CLS, y al salir se pausa en el fotograma 0", async ({ page }, info) => {
    test.skip(/mobile|landscape/.test(info.project.name), "táctil: sin hover no hay reproducción");
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    const first = reels(page).first();
    await first.scrollIntoViewIfNeeded();
    // en pantalla pero sin interacción: ni vídeo ni petición (WCAG 2.2.2)
    await page.waitForTimeout(2500);
    expect(await page.locator("#work video").count()).toBe(0);
    expect(asked).toEqual([]);
    const before = await first.boundingBox();
    // hover sobre la ficha entera, no solo sobre el reel
    const card = page.locator("#work li").first().locator('a[target="_blank"]');
    // un punto del texto de la ficha (debajo o al lado del reel), dentro de la pantalla
    const text = (await card.locator("h3").boundingBox())!;
    const pt = { x: text.x + 8, y: text.y + 8 };
    await page.mouse.move(pt.x, pt.y);
    await expect(first).toHaveAttribute("data-reel", "live", { timeout: 20000 });
    const video = first.locator("video");
    expect(await video.evaluate((v: HTMLVideoElement) => !v.paused && v.muted && v.loop)).toBe(true);
    expect(await first.boundingBox()).toEqual(before);
    expect(asked.some((u) => u.startsWith("/media/reels/claude-canvas."))).toBe(true);
    expect(asked.some((u) => u.startsWith("/media/reels/nudaui."))).toBe(false);
    // decorativo y sin foco
    await expect(video).toHaveAttribute("aria-hidden", "true");
    // al salir se pausa y vuelve al fotograma 0, sin destruir el vídeo
    await page.mouse.move(2, 2);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBe(0);
    expect(await page.locator("#work video").count()).toBe(1);
    // y al volver, sigue siendo a petición
    await page.mouse.move(pt.x, pt.y);
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
  });

  test("con teclado: el foco en la ficha reproduce y al salir se pausa", async ({ page }, info) => {
    test.skip(/mobile|landscape/.test(info.project.name), "táctil: sin hover no hay reproducción");
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    const first = reels(page).first();
    await first.scrollIntoViewIfNeeded();
    expect(await page.locator("#work video").count()).toBe(0);
    await page.locator("#work li").first().locator('a[target="_blank"]').focus();
    await expect(first).toHaveAttribute("data-reel", "live", { timeout: 20000 });
    const video = first.locator("video");
    expect(await video.evaluate((v: HTMLVideoElement) => !v.paused)).toBe(true);
    await page.locator("#work li").first().locator('a[target="_blank"]').blur();
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  test("táctil: solo el póster, aunque se toque la ficha", async ({ page }, info) => {
    test.skip(!/mobile|landscape/.test(info.project.name), "solo táctil");
    const asked: string[] = [];
    page.on("request", (r) => REELS.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    const first = reels(page).first();
    await first.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2500);
    await first.dispatchEvent("pointerenter");
    await page.waitForTimeout(1000);
    expect(await page.locator("#work video").count()).toBe(0);
    await expect(first).toHaveAttribute("data-reel", "poster");
    expect(asked).toEqual([]);
  });

  test("la ficha sigue siendo un único enlace accesible con su nombre", async ({ page }) => {
    await page.goto("/");
    // la ficha es el enlace externo; el del caso de estudio es un segundo enlace interno, aparte y sin anidar
    const card = page.locator("#work li").first().locator('a[target="_blank"]');
    await expect(page.locator("#work li").first().locator("a")).toHaveCount(2);
    await expect(card).toHaveCount(1);
    await expect(card).toHaveAttribute("rel", /noopener/);
    expect(await card.getAttribute("aria-label")).toBeNull();
    expect((await card.innerText()).length).toBeGreaterThan(10);
    expect(await card.locator("[data-reel]").getAttribute("aria-hidden")).toBe("true");
  });
});
