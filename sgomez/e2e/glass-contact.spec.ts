import { test, expect } from "./fixtures";
import { forceGlass, longTasksDuringGlass, watchLongTasks } from "./glass-utils";

const live = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { __GLASS_LIVE_WORKERS__?: number }).__GLASS_LIVE_WORKERS__ ?? 0);

test.describe("cristal del contacto (escritorio)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name !== "desktop", "solo escritorio");
    test.setTimeout(120_000);
  });

  test("se monta al acercarse, comparte worker con el hero y la pausa es una sola", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "poster");
    await page.locator("#contact").scrollIntoViewIfNeeded();
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
    await page.locator("#contact button[aria-pressed]").click();
    await expect(page.locator("#top button[aria-pressed]")).toHaveAttribute("aria-pressed", "true");
  });

  test("Review Focus 5: aterrizar en /#contact", async ({ page }) => {
    await watchLongTasks(page);
    await forceGlass(page);
    await page.goto("/#contact");
    await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await longTasksDuringGlass(page, "contact")).toEqual([]);
  });

  test("Review Focus 4: ida y vuelta por navegación de cliente y cambio de idioma, un solo worker", async ({ page }) => {
    await forceGlass(page);
    await page.goto("/");
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    await page.locator('footer a[href="/about"]').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => live(page)).toBe(0);
    await page.goBack();
    // Al volver se restaura el scroll del pie: el hero no pinta fuera de pantalla hasta que vuelve a verse.
    await page.evaluate(() => scrollTo(0, 0));
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
    await expect(page.locator("#top canvas")).toHaveCount(1);
    await page.locator('nav a[hreflang="en"]').first().click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
    expect(await live(page)).toBe(1);
  });
});
