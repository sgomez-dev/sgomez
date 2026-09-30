import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";

const PAGES = ["/", "/en", "/about", "/en/contact", "/developers", "/en/privacy", "/no-existe"];
const WIDTHS = [
  { width: 320, height: 640 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const overflow = (page: Page) =>
  page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: window.innerWidth }));

test.describe("sin desborde horizontal", () => {
  // El proyecto desktop recorre todos los anchos con setViewportSize; los demás
  // comprueban su propio viewport (que también está en la lista).
  test("a cada ancho, en cada página", async ({ page }, info) => {
    const sizes = info.project.name === "desktop" ? WIDTHS : [page.viewportSize()!];
    const failures: string[] = [];
    for (const path of PAGES) {
      await page.goto(path);
      for (const size of sizes) {
        await page.setViewportSize(size);
        const { scroll, inner } = await overflow(page);
        if (scroll > inner) failures.push(`${path} @${size.width}: scrollWidth ${scroll} > ${inner}`);
      }
    }
    expect(failures).toEqual([]);
  });
});

test.describe("áreas táctiles de 44×44 px", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "mobile", "solo en móvil"));

  test("enlaces y botones de nav, pie, #contact y #proof", async ({ page }) => {
    const failures: string[] = [];
    let measured = 0;
    for (const path of ["/", "/en"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // El menú móvil va en un <details>: se abre para medir también sus enlaces.
      await page.locator("header summary").click();
      const items = page.locator(
        "header :is(a, button, summary), footer :is(a, button, summary), #contact :is(a, button, summary), #proof :is(a, button, summary)",
      );
      const count = await items.count();
      for (let i = 0; i < count; i++) {
        const el = items.nth(i);
        if ((await el.evaluate((n) => getComputedStyle(n).display)) === "none") continue;
        const box = await el.boundingBox();
        if (!box) continue; // no se renderiza (dentro de un <details> cerrado)
        measured++;
        if (box.width < 43.5 || box.height < 43.5) {
          const label = await el.evaluate(
            (n) => `${n.tagName.toLowerCase()} "${(n.textContent ?? "").trim().slice(0, 30)}" ${n.getAttribute("href") ?? ""}`,
          );
          failures.push(`${path} ${label}: ${Math.round(box.width)}x${Math.round(box.height)}`);
        }
      }
    }
    // Guarda contra un selector que deje de casar y haga pasar el test en vacío.
    expect(measured).toBeGreaterThan(20);
    expect(failures).toEqual([]);
  });
});
