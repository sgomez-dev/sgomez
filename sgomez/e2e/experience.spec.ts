import { gzipSync } from "node:zlib";
import { test, expect } from "./fixtures";

const CHAPTERS = ["top", "about", "build", "experience", "work", "open-source", "skyquetz", "proof", "contact"];

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  for (const path of ["/", "/en"]) {
    test(`${path}: los 9 capítulos tienen texto y la respuesta es visible`, async ({ page }) => {
      await page.goto(path);
      for (const id of CHAPTERS) {
        const section = page.locator(`section[id="${id}"]`);
        await expect(section, id).toHaveCount(1);
        const text = await section.evaluate((el) => (el as HTMLElement).innerText.trim());
        expect(text.length, `#${id} sin texto`).toBeGreaterThan(0);
      }
      await expect(page.locator("[data-answer]").first()).toBeVisible();
    });
  }

  for (const path of ["/", "/en", "/developers", "/en/privacy"]) {
    test(`${path}: sin desborde horizontal a 375 px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const { scroll, inner } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      expect(scroll).toBeLessThanOrEqual(inner);
    });
  }

  test("las páginas estáticas muestran su respuesta", async ({ page }) => {
    for (const path of ["/about", "/en/contact"]) {
      await page.goto(path);
      await expect(page.locator("[data-answer]").first()).toBeVisible();
    }
  });
});

test.describe("recomendaciones en inglés (Review Focus 5, R12)", () => {
  test("la traducción es la cita visible, etiquetada, y el original va en <details lang=es>", async ({ page }) => {
    await page.goto("/en");
    const first = page.locator("#proof blockquote").first();

    // La etiqueta va justo antes de la traducción, que es lo primero visible.
    await expect(first.getByText("Translated from Spanish")).toBeVisible();
    const order = await first.evaluate((bq) => Array.from(bq.children).map((c) => c.tagName.toLowerCase()));
    expect(order).toEqual(["p", "div", "details"]);
    expect(await first.locator("> p").textContent()).toContain("Translated from Spanish");
    const translation = first.locator("> div > p").first();
    await expect(translation).toHaveAttribute("lang", "en");
    await expect(translation).toBeVisible();

    // El original: dentro de <details>, cerrado, en un contenedor lang="es".
    const details = first.locator("details");
    await expect(details).not.toHaveAttribute("open", /.*/);
    const original = details.locator('[lang="es"]');
    await expect(original).toHaveCount(1);
    expect(((await original.textContent()) ?? "").length).toBeGreaterThan(40);
    await expect(original).toBeHidden();
    await details.locator("summary").click();
    await expect(original).toBeVisible();
  });

  test("en español solo se muestra el original, sin etiqueta de traducción", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#proof blockquote details")).toHaveCount(0);
    await expect(page.locator("#proof").getByText("Translated from Spanish")).toHaveCount(0);
    await expect(page.locator('#proof blockquote p[lang="es"]').first()).toBeVisible();
  });
});

test.describe("presupuesto de JS", () => {
  /**
   * Suma lo que pesa por la red el JS que carga la página. `transferSize` sería
   * la medida directa, pero depende de la máquina: con un antivirus que filtra
   * el tráfico local (ESET en la máquina del autor) Chrome recibe el cuerpo ya
   * descomprimido y `transferSize` sale como el tamaño sin comprimir. Por eso
   * se descarga cada script con Accept-Encoding: gzip y se mide el cuerpo
   * comprimido con zlib al nivel por defecto, el mismo que usa `next start`.
   */
  for (const path of ["/", "/en"]) {
    test(`${path}: el JS inicial no pasa de 170 KB (gzip)`, async ({ page, request }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const urls = await page.evaluate(() =>
        (performance.getEntriesByType("resource") as PerformanceResourceTiming[])
          .filter((r) => r.initiatorType === "script" || /\.js(\?|$)/.test(r.name))
          .map((r) => r.name),
      );
      expect(urls.length).toBeGreaterThan(0);
      let gzipped = 0;
      for (const url of urls) gzipped += gzipSync(await (await request.get(url)).body()).length;
      console.log(`[budget] ${path}: ${(gzipped / 1024).toFixed(1)} KB gzip en ${urls.length} scripts`);
      expect(gzipped).toBeLessThanOrEqual(170 * 1024);
    });
  }
});
