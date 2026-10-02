import { test, expect } from "./fixtures";

test("el nombre se ve entero en el primer fotograma y la luz no cambia su caja ni el LCP", async ({ page }) => {
  await page.goto("/");
  const span = page.locator("h1 [data-light-write]");
  await expect(span).toHaveText("Santiago Gómez de la Torre.");
  const color = await span.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(244, 246, 251)");
  const before = await page.locator("h1").boundingBox();
  await page.waitForTimeout(2500);
  expect(await page.locator("h1").boundingBox()).toEqual(before);
  const lcpTag = await page.evaluate(
    () =>
      new Promise<string>((resolve) =>
        new PerformanceObserver((l) => resolve(((l.getEntries().at(-1) as unknown as { element?: Element })?.element?.tagName) ?? "")).observe({ type: "largest-contentful-paint", buffered: true }),
      ),
  );
  expect(["H1", "IMG", "SPAN"]).toContain(lcpTag);
});

test("movimiento reducido: no hay animación en el nombre ni en el póster", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.getAnimations().filter((a) => (a as CSSAnimation).animationName?.startsWith("mo-light")).length)).toBe(0);
});

test("axe a mitad del barrido", async ({ page }) => {
  const { default: AxeBuilder } = await import("@axe-core/playwright");
  await page.goto("/");
  await page.waitForTimeout(1200);
  const r = await new AxeBuilder({ page }).include("#top").withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(r.violations).toEqual([]);
});
