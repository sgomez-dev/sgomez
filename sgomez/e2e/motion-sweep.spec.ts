import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { layoutShiftDuring, scrollToProgress, settledInViewport } from "./motion-utils";

const CHAPTERS = ["#about", "#experience", "#open-source", "#proof", "#contact"];
const WIDTHS = [320, 375, 414, 768, 1024, 1280, 1440, 1920];

/** Simula un navegador sin animation-timeline (Firefox): el JS lo ve y el CSS estático se anula. */
const withoutTimeline = (page: Page) =>
  page.addInitScript(() => {
    const orig = CSS.supports.bind(CSS);
    CSS.supports = ((p: string, v?: string) => (String(p).includes("animation-timeline") ? false : v === undefined ? orig(p) : orig(p, v))) as typeof CSS.supports;
    document.addEventListener("DOMContentLoaded", () => {
      const st = document.createElement("style");
      st.textContent = "[data-motion], [data-motion] * { animation: none !important; }";
      document.head.append(st);
    });
  });

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

for (const path of ["/", "/en"]) {
  test.describe(`barrido ${path}`, () => {
    test("axe en estado intermedio de cada capítulo", async ({ page }) => {
      await page.goto(path);
      for (const id of CHAPTERS) {
        await scrollToProgress(page, `${id} h2`, 0.92);
        const r = await new AxeBuilder({ page }).include(id).withTags(["wcag2a", "wcag2aa"]).analyze();
        expect(r.violations.map((v) => `${id} ${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
      }
    });

    test("CLS al recorrer la página entera", async ({ page }) => {
      await page.goto(path);
      const cls = await layoutShiftDuring(page, async () => {
        const h = await page.evaluate(() => document.documentElement.scrollHeight);
        for (let y = 0; y < h; y += 500) {
          await page.mouse.wheel(0, 500);
          await page.waitForTimeout(30);
        }
      });
      expect(cls).toBeLessThan(0.05);
    });

    test("sin scroll horizontal en ningún ancho y en ningún punto del recorrido", async ({ page }, info) => {
      test.skip(info.project.name !== "desktop", "fija sus propios anchos");
      await page.goto(path);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 800 });
        for (const id of CHAPTERS) {
          await scrollToProgress(page, id, 0.5);
          expect(await noOverflow(page), `${width}px ${id}`).toBe(true);
        }
      }
      await page.setViewportSize({ width: 844, height: 390 });
      for (const id of CHAPTERS) {
        await scrollToProgress(page, id, 0.5);
        expect(await noOverflow(page), `844x390 ${id}`).toBe(true);
      }
    });

    test("Review Focus 1: al final del documento todo lo visible está terminado", async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      expect(await settledInViewport(page)).toEqual([]);
    });

    test("movimiento reducido: todo el texto de los capítulos visible y sin animaciones", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(path);
      for (const id of CHAPTERS) {
        await page.locator(id).scrollIntoViewIfNeeded();
        expect((await page.locator(id).innerText()).trim().length, id).toBeGreaterThan(20);
      }
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    });

    test("ningún long task de más de 50 ms al recorrer la página", async ({ page }, info) => {
      test.skip(info.project.name !== "desktop", "el escritorio es el caso de referencia");
      await page.goto(path, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        const w = window as unknown as { __lt: number[] };
        w.__lt = [];
        new PerformanceObserver((l) => l.getEntries().forEach((e) => w.__lt.push(e.duration))).observe({ type: "longtask" });
      });
      for (let i = 0; i < 30; i++) {
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(30);
      }
      const tasks = await page.evaluate(() => (window as unknown as { __lt: number[] }).__lt);
      expect(tasks.filter((d) => d > 50)).toEqual([]);
    });

    test("Firefox simulado: contenido completo, sin desborde y a salvo de CLS", async ({ page }) => {
      await withoutTimeline(page);
      await page.goto(path);
      const cls = await layoutShiftDuring(page, async () => {
        for (const id of CHAPTERS) await scrollToProgress(page, id, 0.3);
      });
      expect(cls).toBeLessThan(0.05);
      for (const id of CHAPTERS) {
        await scrollToProgress(page, id, 0.3);
        expect((await page.locator(id).innerText()).trim().length, id).toBeGreaterThan(20);
        expect(await noOverflow(page), id).toBe(true);
      }
      const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
      expect(r.violations.map((v) => `${v.id} ${v.nodes[0]?.target}`)).toEqual([]);
    });

    test("sin JS: todos los capítulos tienen su texto en el documento", async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(path);
      for (const id of CHAPTERS) {
        expect((await page.locator(id).innerText()).trim().length, id).toBeGreaterThan(20);
        await expect(page.locator(`${id} h2`).first()).toBeVisible();
      }
      expect(await noOverflow(page)).toBe(true);
      await ctx.close();
    });
  });
}
