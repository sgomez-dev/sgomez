import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";
import { forceGlass } from "./glass-utils";
import { layoutShiftDuring } from "./motion-utils";

const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1366, 1440, 1920];

for (const path of ["/", "/en"]) {
  test.describe(`barrido del cristal ${path}`, () => {
    test.beforeEach(({}, info) => {
      test.skip(info.project.name !== "desktop", "el barrido cambia el viewport él mismo");
      test.setTimeout(180_000);
    });

    test("axe con el cristal vivo, en hero y contacto", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
      for (const id of ["#top", "#contact"]) {
        await page.locator(id).scrollIntoViewIfNeeded();
        if (id === "#contact") await expect(page.locator("#contact [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
        const r = await new AxeBuilder({ page }).include(id).withTags(["wcag2a", "wcag2aa"]).analyze();
        expect(r.violations.map((v) => `${id} ${v.id}`)).toEqual([]);
      }
    });

    test("CLS del relevo póster→cristal", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      const cls = await layoutShiftDuring(page, async () => {
        await expect(page.locator("#top [data-glass]")).toHaveAttribute("data-glass", "live", { timeout: 45_000 });
      });
      expect(cls).toBeLessThan(0.05);
    });

    test("sin scroll horizontal en ningún ancho ni en horizontal, con el cristal en cualquier estado", async ({ page }) => {
      await forceGlass(page);
      await page.goto(path);
      for (const [w, h] of [...WIDTHS.map((w) => [w, 900]), [844, 390]] as [number, number][]) {
        await page.setViewportSize({ width: w, height: h });
        for (const id of ["#top", "#contact"]) {
          await page.locator(id).scrollIntoViewIfNeeded();
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${w}x${h} ${id}`).toBe(true);
        }
      }
    });
  });
}
