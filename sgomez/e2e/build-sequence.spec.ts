import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

/** Capítulo 03 con su secuencia real (public/media/build). La lista de capas del DOM es el contenido; la secuencia es decorativa. */
const FRAMES = /\/media\/build\/(desktop|mobile)\//;
const box = (page: Page) => page.locator("[data-sequence-id=build]");

test.describe("capítulo 03, secuencia de las seis losas", () => {
  test("sin JS: solo el póster, ningún fotograma y las seis capas en el DOM", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.locator("#build").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(box(page).locator("img")).toHaveAttribute("src", "/media/build/poster.webp");
    expect(await box(page).locator("canvas").count()).toBe(0);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo el póster, visible, y las seis capas", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#build").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    await expect(box(page)).toHaveAttribute("data-sequence", "poster");
    expect(await box(page).locator("canvas").count()).toBe(0);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
    expect(await box(page).locator("img").evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    expect(asked).toEqual([]);
  });

  test("con JS: lejos no se pide nada, al llegar pinta y pide el tamaño que toca", async ({ page }, info) => {
    const asked: string[] = [];
    page.on("request", (r) => FRAMES.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    await page.locator("#build").scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-sequence", "live", { timeout: 20000 });
    const size = info.project.name === "desktop" ? "desktop" : "mobile";
    await expect.poll(() => asked.length, { timeout: 20000 }).toBe(90);
    expect(asked.every((u) => u.startsWith(`/media/build/${size}/`))).toBe(true);
    expect(await page.locator("#build [data-motion=layer]").count()).toBe(6);
  });

  test("memoria: recorrer el capítulo no deja más de 17 ImageBitmap vivos, y al alejarse ninguno", async ({ page }) => {
    test.setTimeout(90_000);
    // Cuenta las ImageBitmap vivas de la página principal: las que crea createImageBitmap menos las que se cierran.
    await page.addInitScript(() => {
      const w = window as unknown as { __bmp: { live: number; max: number; created: number; closed: number } };
      w.__bmp = { live: 0, max: 0, created: 0, closed: 0 };
      const seen = new WeakSet<object>();
      const create = window.createImageBitmap.bind(window) as (...a: unknown[]) => Promise<ImageBitmap>;
      (window as unknown as { createImageBitmap: typeof create }).createImageBitmap = async (...a) => {
        const b = await create(...a);
        seen.add(b);
        w.__bmp.created++;
        w.__bmp.max = Math.max(w.__bmp.max, ++w.__bmp.live);
        return b;
      };
      const close = ImageBitmap.prototype.close;
      ImageBitmap.prototype.close = function () {
        if (seen.delete(this)) {
          w.__bmp.live--;
          w.__bmp.closed++;
        }
        return close.call(this);
      };
    });
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    const bounds = await page.evaluate(() => {
      const el = document.querySelector("#build") as HTMLElement;
      const r = el.getBoundingClientRect();
      return { top: r.top + scrollY, height: r.height, vh: innerHeight };
    });
    const from = bounds.top - bounds.vh;
    const to = bounds.top + bounds.height;
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), from);
    await expect(box(page)).toHaveAttribute("data-sequence", "live", { timeout: 20000 });
    // Todo el recorrido dentro de la página, sin ida y vuelta por paso: baja de a poco por el capítulo, salta al final,
    // vuelve de golpe al principio y otra vez abajo, apuntando qué fotograma se pinta en cada paso.
    const seen = await page.evaluate(
      async ({ from, to }) => {
        const frames = new Set<string>();
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const at = async (y: number) => {
          window.scrollTo({ top: y, behavior: "instant" });
          await sleep(70);
          const f = document.querySelector<HTMLCanvasElement>("[data-sequence-id=build] canvas")?.dataset.frame;
          if (f) frames.add(f);
        };
        for (let y = from; y <= to; y += 90) await at(y);
        await at(to);
        await at(from);
        await at(to);
        return frames.size;
      },
      { from, to },
    );
    await page.waitForTimeout(400);
    const during = await page.evaluate(() => (window as unknown as { __bmp: { live: number; max: number; created: number; closed: number } }).__bmp);
    console.log(`ImageBitmap: máximo vivos ${during.max}, creados ${during.created}, cerrados ${during.closed}, fotogramas distintos pintados ${seen}`);
    expect(during.created, "se decodificó algo").toBeGreaterThan(0);
    expect(during.closed, "la ventana se desplaza: lo que sale se cierra").toBeGreaterThan(0);
    expect(during.max, "ImageBitmap vivos a la vez").toBeLessThanOrEqual(17);
    expect(seen, "el scroll pasa por varios fotogramas").toBeGreaterThan(5);
    // Muy lejos del capítulo se sueltan todas.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    if (bounds.top > bounds.vh * 3) await expect.poll(() => page.evaluate(() => (window as unknown as { __bmp: { live: number } }).__bmp.live)).toBe(0);
  });

  test("escritorio bajo: la caja pegajosa no se sale de su contenedor a 1280x800 ni a 1920x850", async ({ page }, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    for (const vp of [{ width: 1280, height: 800 }, { width: 1920, height: 850 }, { width: 1920, height: 1080 }]) {
      await page.setViewportSize(vp);
      await page.goto("/");
      await page.locator("#build").scrollIntoViewIfNeeded();
      const m = await box(page).evaluate((el) => {
        const r = el.getBoundingClientRect();
        const outer = el.parentElement!.getBoundingClientRect();
        return { w: r.width, h: r.height, outerW: outer.width, outerH: outer.height, vh: innerHeight };
      });
      expect(m.h, `${vp.width}x${vp.height}`).toBeLessThanOrEqual(0.7 * m.vh + 1);
      expect(m.w).toBeLessThanOrEqual(m.outerW + 1);
      expect(m.h).toBeLessThanOrEqual(m.outerH + 1);
    }
  });
});
