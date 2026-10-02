import { test, expect } from "./fixtures";

const starts = (page: import("@playwright/test").Page) => page.evaluate(() => (window as { __MOTION_STARTS__?: number }).__MOTION_STARTS__ ?? 0);

test.describe("puerta del movimiento", () => {
  test("con movimiento: estado on y el runtime se carga tras idle", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "on");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
  });

  test("movimiento reducido: off, sin runtime y sin animaciones", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(2500);
    expect(await starts(page)).toBe(0);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Review Focus 2: cambiar a reducido a mitad de visita lo apaga todo", async ({ page }) => {
    await page.goto("/");
    await page.mouse.wheel(0, 2500);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("Review Focus 5: sin JS no hay atributo ni animaciones", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.locator("html").getAttribute("data-motion-state")).toBeNull();
    await ctx.close();
  });

  test("Review Focus 5: Save-Data apaga el movimiento", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-motion-state", "off");
    await page.waitForTimeout(2500);
    expect(await starts(page)).toBe(0);
  });

  test("Review Focus 4: ida y vuelta por navegación de cliente re-engancha una sola vez", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    await page.locator('footer a[href$="/about"]').first().click();
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => starts(page)).toBe(2);
    await page.goBack();
    await expect(page.locator("#about")).toBeVisible();
    await expect.poll(() => starts(page)).toBe(3);
  });

  test("E2: sin animation-timeline (Firefox), un titular fuera de pantalla se revela al entrar y no se cae la página", async ({ page }) => {
    await page.addInitScript(() => {
      const orig = CSS.supports.bind(CSS);
      CSS.supports = ((p: string, v?: string) => (String(p).includes("animation-timeline") ? false : v === undefined ? orig(p) : orig(p, v))) as typeof CSS.supports;
    });
    await page.goto("/");
    await expect.poll(() => starts(page), { timeout: 5000 }).toBe(1);
    const h2 = page.locator('h2[data-motion="text-reveal"]').nth(1);
    expect(await h2.evaluate((el) => el.getAnimations().length)).toBe(0);
    await h2.scrollIntoViewIfNeeded();
    await expect.poll(() => h2.evaluate((el) => el.getAnimations().length), { timeout: 3000 }).toBeGreaterThan(0);
    await expect(h2).toBeVisible();
  });
});
