import { test, expect } from "./fixtures";

/**
 * Transiciones de página (Task 7). Se comprueba en Chromium real que la
 * transición ocurre (no solo que la navegación funciona): en navegación de
 * cliente React llama a document.startViewTransition; en navegación de
 * documento (cambio de idioma) el evento pagereveal trae un viewTransition.
 */
const hook = () => {
  const w = window as unknown as { __vt: { client: number; reveal: number }; __startVT?: unknown };
  const prev = sessionStorage.getItem("__vt");
  w.__vt = prev ? JSON.parse(prev) : { client: 0, reveal: 0 };
  const save = () => sessionStorage.setItem("__vt", JSON.stringify(w.__vt));
  const orig = document.startViewTransition?.bind(document);
  if (orig) {
    document.startViewTransition = ((...a: Parameters<typeof orig>) => {
      w.__vt.client++;
      save();
      return orig(...a);
    }) as typeof document.startViewTransition;
  }
  window.addEventListener("pagereveal", (e) => {
    if ((e as unknown as { viewTransition: unknown }).viewTransition) {
      w.__vt.reveal++;
      save();
    }
  });
};
const counts = (page: import("@playwright/test").Page) =>
  page.evaluate(() => JSON.parse(sessionStorage.getItem("__vt") ?? '{"client":0,"reveal":0}') as { client: number; reveal: number });

test.describe("transiciones de página", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "View Transitions: solo se verifica en Chromium");

  test("navegación de cliente al pie: hay transición, la nav se queda quieta y la vuelta funciona", async ({ page }) => {
    await page.addInitScript(hook);
    await page.goto("/");
    const nav = page.locator("header").first();
    const before = (await nav.boundingBox())!;
    await page.evaluate(() => {
      const w = window as unknown as { __pseudo: Set<string> };
      w.__pseudo = new Set();
      const tick = () => {
        for (const a of document.getAnimations()) {
          const pe = (a.effect as KeyframeEffect | null)?.pseudoElement;
          if (pe && a instanceof CSSAnimation) w.__pseudo.add(`${pe}:${a.animationName}`);
        }
        requestAnimationFrame(tick);
      };
      tick();
    });
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toContainText("Santiago Gómez de la Torre Romero");
    const after = (await nav.boundingBox())!;
    expect(after.y).toBe(before.y);
    expect((await counts(page)).client).toBeGreaterThan(0);
    // La pagina sube con nuestra animacion y la nav no entra en la del contenido.
    const seen = await page.evaluate(() => [...(window as unknown as { __pseudo: Set<string> }).__pseudo]);
    expect(seen).toContain("::view-transition-new(page):mo-deco-vt-in");
    expect(seen).toContain("::view-transition-old(page):mo-deco-vt-out");
    expect(seen.filter((s) => s.includes("(site-nav)") && s.includes("mo-deco"))).toEqual([]);
    await page.goBack();
    await expect(page.locator("#about")).toBeVisible();
  });

  test("la nav tiene su propio nombre de transición", async ({ page }) => {
    await page.goto("/");
    const name = await page.locator("header").first().evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(name).toBe("site-nav");
  });

  test("cambio de idioma (documento completo): transición sin movimiento reducido, ninguna con reducido", async ({ page }) => {
    await page.addInitScript(hook);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/about");
    await page.getByRole("link", { name: "English" }).first().click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect((await counts(page)).reveal).toBeGreaterThan(0);

    await page.evaluate(() => sessionStorage.clear());
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.getByRole("link", { name: "Español" }).first().click();
    await expect(page).toHaveURL(/\/es\/about$|\/about$/);
    expect((await counts(page)).reveal).toBe(0);
  });

  test("con movimiento reducido no se anima ninguna transición de cliente", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: /sobre mí|about/i }).first().click();
    await expect(page).toHaveURL(/\/about$/);
    const animations = await page.evaluate(() => document.getAnimations().filter((a) => String((a as CSSAnimation).animationName ?? "").startsWith("mo-deco-vt")).length);
    expect(animations).toBe(0);
  });

  test("las anclas de la misma página no se secuestran", async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 1024, "la barra de anclas solo existe en escritorio");
    await page.addInitScript(hook);
    await page.goto("/en#work");
    await page.locator("header nav a[href$='#about']").first().click();
    await expect(page).toHaveURL(/\/en#about$/);
    expect((await counts(page)).client).toBe(0);
  });
});
