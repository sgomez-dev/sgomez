import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/** Capítulo 07: el logotipo se forma una vez con un vídeo. La `<img>` es el contenido y la que queda. */
const VIDEO = /\/media\/skyquetz\/monogram\.(webm|mp4)/;
const box = (page: Page) => page.locator("[data-monogram]");
const logo = (page: Page) => page.locator("#skyquetz [data-monogram] img");

test.describe("capítulo 07, logotipo de SkyQuetz", () => {
  test("sin JS: solo la imagen, con su alt, y ninguna descarga de vídeo", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.locator("#skyquetz").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(logo(page)).toHaveAttribute("alt", /SkyQuetz/);
    expect(await page.locator("#skyquetz video").count()).toBe(0);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo la imagen y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#skyquetz").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    await expect(box(page)).toHaveAttribute("data-monogram", "poster");
    expect(await page.locator("#skyquetz video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("Save-Data: solo la imagen y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await page.locator("#skyquetz").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    expect(await page.locator("#skyquetz video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("con JS: no se pide hasta estar cerca, suena una vez y el relevo vuelve a la imagen sin cambiar la caja", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    const size = async () => logo(page).evaluate((i) => [i.clientWidth, i.clientHeight]);
    const before = await size();
    // Instrumenta el vídeo en cuanto exista para saber que llegó a sonar y a acabar.
    await page.evaluate(() => {
      const w = window as unknown as { __mono: string[] };
      w.__mono = [];
      new MutationObserver((ms) => {
        for (const m of ms) for (const n of m.addedNodes) if (n instanceof HTMLVideoElement) for (const ev of ["playing", "ended"]) n.addEventListener(ev, () => w.__mono.push(ev));
      }).observe(document.body, { childList: true, subtree: true });
    });
    await box(page).scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-monogram", "done", { timeout: 20000 });
    expect(await page.evaluate(() => (window as unknown as { __mono: string[] }).__mono)).toEqual(["playing", "ended"]);
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every((u) => u.startsWith("/media/skyquetz/monogram."))).toBe(true);
    // el vídeo se retira y la imagen vuelve visible, en la misma caja
    expect(await page.locator("#skyquetz video").count()).toBe(0);
    expect(await logo(page).evaluate((i) => getComputedStyle(i).opacity)).toBe("1");
    expect(await size()).toEqual(before);
  });

  test("el enlace del logotipo conserva su nombre accesible", async ({ page }) => {
    await page.goto("/");
    const a = page.locator("#skyquetz [data-monogram]").locator("xpath=ancestor::a");
    await expect(a).toHaveAttribute("aria-label", /SkyQuetz Consulting/);
    expect(await page.locator("#skyquetz video").count()).toBe(0);
  });
});
