import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { FORGIA_REVEAL } from "../src/lib/monogram";

/**
 * El logotipo de Forgia se forma una vez con el cristal, como el de SkyQuetz. La `<img>` es el contenido y la que queda.
 * La brasa del punto no se ve mientras suena el vídeo y, al terminar, se enciende por tiempo.
 */
const VIDEO = /\/media\/forgia\/reveal\.(webm|mp4)/;
const box = (page: Page) => page.locator("#forgia [data-monogram]");
const logo = (page: Page) => page.locator("#forgia [data-monogram] img");
const ember = (page: Page) => page.locator("#forgia [data-monogram] [data-ember]");

test.describe("Forgia, logotipo que se forma con cristal", () => {
  test("sin JS: la imagen con su alt, la brasa encendida y ninguna descarga de vídeo", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.goto("/");
    await page.locator("#forgia").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await expect(logo(page)).toHaveAttribute("alt", /Forgia/);
    expect(await ember(page).evaluate((e) => getComputedStyle(e).opacity)).toBe("1");
    expect(await page.locator("#forgia video").count()).toBe(0);
    expect(asked).toEqual([]);
    await ctx.close();
  });

  test("movimiento reducido: solo la imagen y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("#forgia").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    await expect(box(page)).toHaveAttribute("data-monogram", "poster");
    expect(await page.locator("#forgia video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("Save-Data: solo la imagen y ninguna descarga de vídeo", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(r.url()));
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await page.locator("#forgia").scrollIntoViewIfNeeded();
    await page.waitForTimeout(3500);
    expect(await page.locator("#forgia video").count()).toBe(0);
    expect(asked).toEqual([]);
  });

  test("con JS: suena una vez en su caja, la brasa se esconde y al acabar vuelve la imagen y la brasa se enciende", async ({ page }) => {
    const asked: string[] = [];
    page.on("request", (r) => VIDEO.test(r.url()) && asked.push(new URL(r.url()).pathname));
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(2500);
    expect(asked).toEqual([]);
    const size = async () => logo(page).evaluate((i) => [i.clientWidth, i.clientHeight]);
    const before = await size();
    // Se anota cómo entra el vídeo (solo al sonar: oculto en el DOM contaría para el LCP), su caja frente a la de la
    // imagen, la opacidad de la brasa mientras suena y que acaba.
    await page.evaluate(() => {
      const w = window as unknown as { __forgia: string[]; __geo: number[]; __ember: string };
      w.__forgia = [];
      new MutationObserver((ms) => {
        for (const m of ms)
          for (const n of m.addedNodes)
            if (n instanceof HTMLVideoElement && n.querySelector("source")?.src.includes("/media/forgia/")) {
              w.__forgia.push(n.paused || n.readyState < 2 ? "entra sin sonar" : "entra sonando");
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  const v = n.getBoundingClientRect();
                  const i = document.querySelector("#forgia [data-monogram] img")!.getBoundingClientRect();
                  w.__geo = [v.left - i.left, v.top - i.top, v.width, v.height, i.width, i.height];
                }),
              );
              n.addEventListener("ended", () => w.__forgia.push("ended"));
            }
      }).observe(document.body, { childList: true, subtree: true });
      // La brasa, en cuanto la caja pasa a "playing" (la imagen ya está oculta y el vídeo suena).
      const host = document.querySelector("#forgia [data-monogram]")!;
      new MutationObserver(() => {
        if (host.getAttribute("data-monogram") === "playing")
          requestAnimationFrame(() => (w.__ember = getComputedStyle(host.querySelector("[data-ember]")!).opacity));
      }).observe(host, { attributes: true, attributeFilter: ["data-monogram"] });
    });
    await box(page).scrollIntoViewIfNeeded();
    await expect(box(page)).toHaveAttribute("data-monogram", "done", { timeout: 20000 });
    const got = await page.evaluate(() => {
      const w = window as unknown as { __forgia: string[]; __geo: number[]; __ember: string };
      return { log: w.__forgia, geo: w.__geo, ember: w.__ember };
    });
    expect(got.log).toEqual(["entra sonando", "ended"]);
    expect(got.ember).toBe("0");
    // La caja del vídeo es la de FORGIA_REVEAL escalada a la imagen (más el ajuste de redondeo, menos de un píxel).
    const [dx, dy, vw, vh, iw, ih] = got.geo;
    const k = iw! / FORGIA_REVEAL.logo.w;
    expect(Math.abs(dx! + FORGIA_REVEAL.logo.x * k)).toBeLessThan(1);
    expect(Math.abs(dy! + FORGIA_REVEAL.logo.y * (ih! / FORGIA_REVEAL.logo.h))).toBeLessThan(1);
    expect(Math.abs(vw! - FORGIA_REVEAL.video.w * k)).toBeLessThan(1);
    expect(Math.abs(vh! - FORGIA_REVEAL.video.h * (ih! / FORGIA_REVEAL.logo.h))).toBeLessThan(1);
    expect(asked.length).toBeGreaterThan(0);
    expect(asked.every((u) => u.startsWith("/media/forgia/reveal."))).toBe(true);
    expect(await page.locator("#forgia video").count()).toBe(0);
    expect(await logo(page).evaluate((i) => getComputedStyle(i).opacity)).toBe("1");
    expect(await size()).toEqual(before);
    // La brasa toma el relevo apagada y se enciende por tiempo: acaba en el oro, visible.
    await expect
      .poll(() => ember(page).evaluate((e) => [getComputedStyle(e).opacity, getComputedStyle(e).backgroundColor].join(" ")), { timeout: 5000 })
      .toBe("1 rgb(201, 169, 110)");
  });

  test("el enlace del logotipo conserva su nombre accesible", async ({ page }) => {
    await page.goto("/");
    const a = box(page).locator("xpath=ancestor::a");
    await expect(a).toHaveAttribute("aria-label", /Forgia/);
    expect(await page.locator("#forgia video").count()).toBe(0);
  });
});
