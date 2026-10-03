import { test, expect } from "./fixtures";

test.beforeEach(({}, info) => {
  test.skip(info.project.name !== "desktop", "solo escritorio");
  test.setTimeout(90_000);
});

const force = (page: import("@playwright/test").Page) =>
  page.addInitScript(() => ((window as unknown as { __LOST_FORCE_GATE__: boolean }).__LOST_FORCE_GATE__ = true));

for (const width of [1024, 1280, 1366, 1440, 1600, 1920, 1111]) {
  test(`la capa del vídeo y el escenario son la misma caja a ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/no-existe");
    const rects = await page.evaluate(() => {
      const r = (el: Element | null) => el!.getBoundingClientRect();
      const layer = r(document.querySelector("[data-lost-layer]"));
      const stage = r(document.querySelector("[data-lost-layer]")!.nextElementSibling);
      return { layer: [layer.x, layer.y, layer.width, layer.height], stage: [stage.x, stage.y, stage.width, stage.height] };
    });
    rects.layer.forEach((v, i) => expect(Math.abs(v - rects.stage[i]!), `${width} ${i}`).toBeLessThanOrEqual(0.5));
  });
}

test("las líneas no se apagan de golpe durante el vídeo ni en el relevo", async ({ page }) => {
  await force(page);
  await page.addInitScript(() => {
    const w = window as unknown as { __lines: number[] };
    w.__lines = [];
    const tick = () => {
      const st = document.querySelector<HTMLElement>('[data-stage="lost"]');
      const svg = st?.querySelector<SVGElement>("svg[data-lost-lines].hidden");
      const canvasOn = st?.dataset.lostCover === "scene";
      w.__lines.push(canvasOn ? 1 : svg ? Number(getComputedStyle(svg).opacity) : 1);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await page.goto("/en/no-existe");
  await expect(page.locator('[data-stage="lost"]')).toHaveAttribute("data-lost-phase", "idle", { timeout: 60_000 });
  const lines = await page.evaluate(() => (window as unknown as { __lines: number[] }).__lines);
  // Durante el estallido las líneas se van con un fundido (no de golpe) y vuelven antes del relevo.
  const drops = lines.map((v, i) => (i ? lines[i - 1]! - v : 0));
  expect(Math.max(...drops), "ninguna caída de opacidad en un solo fotograma").toBeLessThan(0.34);
  expect(lines.at(-1)).toBe(1);
});
