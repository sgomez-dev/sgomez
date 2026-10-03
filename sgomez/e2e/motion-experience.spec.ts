import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { layoutShiftDuring } from "./motion-utils";

const noPageOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const raf2 = (page: Page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

/** La escena es CSS global y no espera al runtime: basta con que la página haya cargado. */
async function ready(page: Page) {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");
}

/** Coloca el scroll en la fracción `f` del recorrido de la escena (0 = se acaba de pegar, 1 = a punto de soltarse). */
async function scrollPin(page: Page, f: number) {
  await page.evaluate((f) => {
    const s = document.querySelector<HTMLElement>("#experience")!;
    const top = s.getBoundingClientRect().top + scrollY;
    scrollTo({ top: top - 64 + f * (s.offsetHeight - innerHeight + 64), behavior: "instant" });
  }, f);
  await raf2(page);
}

test.describe("capítulo 04 fijado", () => {
  test.skip(({ viewport }) => !viewport || viewport.width < 1024 || viewport.height < 768, "solo en pantallas anchas y altas");

  test("bajar desliza la pista y nunca desborda la página", async ({ page }) => {
    await ready(page);
    const track = page.locator('#experience [data-motion="timeline"]');
    await scrollPin(page, 0);
    const x0 = await track.evaluate((el) => el.getBoundingClientRect().left);
    await scrollPin(page, 0.5);
    const x1 = await track.evaluate((el) => el.getBoundingClientRect().left);
    expect(x1).toBeLessThan(x0 - 100);
    expect(await noPageOverflow(page)).toBe(true);
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
  });

  test("la escena se pega al inicio y al final del recorrido, y la barra de progreso crece", async ({ page }) => {
    await ready(page);
    const bar = page.locator("[data-pin-progress]");
    await scrollPin(page, 0);
    expect(await page.locator("[data-pin-stage]").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(64);
    const w0 = await bar.evaluate((el) => el.getBoundingClientRect().width);
    await scrollPin(page, 1);
    expect(await page.locator("[data-pin-stage]").evaluate((el) => Math.round(el.getBoundingClientRect().top))).toBe(64);
    const w1 = await bar.evaluate((el) => el.getBoundingClientRect().width);
    expect(w1).toBeGreaterThan(w0 + 200);
  });

  test("al final del recorrido la última tarjeta está entera en pantalla", async ({ page }) => {
    await ready(page);
    await scrollPin(page, 1);
    const box = (await page.locator('#experience [data-motion="card"]').last().boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("Review Focus 1: aterrizar en /#contact deja el contacto a la vista aunque la escena haga la página más alta", async ({ page }) => {
    await page.goto("/#contact");
    await page.waitForTimeout(2500);
    const top = await page.locator("#contact").evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(200);
  });

  test("el contenido de la escena cabe: nada queda cortado por el clip", async ({ page }) => {
    await ready(page);
    await scrollPin(page, 0.5);
    const fit = await page.locator("[data-pin-stage]").evaluate((el) => ({ sh: el.scrollHeight, ch: el.clientHeight }));
    expect(fit.sh).toBeLessThanOrEqual(fit.ch);
    const bar = (await page.locator("[data-pin-progress]").boundingBox())!;
    expect(bar.y + bar.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  });

  test("sin desplazamientos de layout al llegar el runtime ni al recorrer la escena", async ({ page }) => {
    await page.goto("/");
    await page.locator("#experience").scrollIntoViewIfNeeded();
    const cls = await layoutShiftDuring(page, async () => {
      await page.waitForTimeout(2500);
      for (let i = 0; i < 20; i++) await page.mouse.wheel(0, 400);
    });
    expect(cls).toBeLessThan(0.05);
  });

  test("con el teclado, la pista se enfoca y las flechas desplazan la página y la pista", async ({ page }) => {
    await ready(page);
    await scrollPin(page, 0);
    const track = page.locator('#experience [data-motion="timeline"]');
    await track.focus();
    await expect(track).toBeFocused();
    const x0 = await track.evaluate((el) => el.getBoundingClientRect().left);
    for (let i = 0; i < 12; i++) await page.keyboard.press("ArrowDown");
    await raf2(page);
    expect(await track.evaluate((el) => el.getBoundingClientRect().left)).toBeLessThan(x0 - 50);
  });

  test("Review Focus 3: cruzar a apaisado a mitad devuelve la lista estática sin desbordes", async ({ page }) => {
    await ready(page);
    await scrollPin(page, 0.5);
    // alturas estáticas medidas: 844x390 ≈ 1000 px, 1024x560 ≈ 1000 px; con la escena serían > 3700 px
    for (const size of [{ width: 844, height: 390 }, { width: 1024, height: 560 }]) {
      await page.setViewportSize(size);
      await raf2(page);
      expect(await noPageOverflow(page)).toBe(true);
      expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
      expect(await page.locator("#experience").evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(size.height * 4);
    }
  });

  test("con movimiento reducido no hay escena fijada", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(1500);
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    expect(await page.locator("#experience").evaluate((el) => el.getBoundingClientRect().height)).toBeLessThan(page.viewportSize()!.height * 3);
  });

  test("cambiar a movimiento reducido a mitad de visita suelta la escena", async ({ page }) => {
    await ready(page);
    await scrollPin(page, 0.5);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    expect(await noPageOverflow(page)).toBe(true);
  });
});

test.describe("capítulo 04 en cualquier pantalla", () => {
  test("sin JS es la lista de la fase 1, sin escena ni desbordes", async ({ browser, viewport }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: viewport ?? { width: 1280, height: 800 } });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    expect(await noPageOverflow(page)).toBe(true);
    await expect(page.locator('#experience [data-motion="card"]')).not.toHaveCount(0);
    await ctx.close();
  });

  test("sin escena no hay desbordes de página y todas las tarjetas existen", async ({ page, viewport }) => {
    test.skip(!!viewport && viewport.width >= 1024 && viewport.height >= 768, "aquí hay escena");
    await page.goto("/");
    await page.waitForTimeout(1500);
    expect(await noPageOverflow(page)).toBe(true);
    expect(await page.locator("[data-pin-stage]").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
  });
});
