import { gzipSync } from "node:zlib";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "./fixtures";

const CHAPTERS = ["top", "about", "build", "experience", "work", "open-source", "skyquetz", "proof", "contact"];

/**
 * Estilos calculados del elemento y de todos sus ancestros hasta <body>: lo que
 * esconde contenido sin JS es justo un `opacity: 0` (o visibility/display) a la
 * espera de un script, y `toBeVisible()` / `innerText` lo ignoran.
 */
function hiddenBy(el: Element): string[] {
  const problems: string[] = [];
  for (let n: Element | null = el; n && n !== document.documentElement; n = n.parentElement) {
    const cs = getComputedStyle(n);
    const name = n.tagName.toLowerCase() + (n.id ? "#" + n.id : "");
    if (parseFloat(cs.opacity) <= 0) problems.push(name + " opacity " + cs.opacity);
    if (cs.visibility === "hidden") problems.push(name + " visibility hidden");
    if (cs.display === "none") problems.push(name + " display none");
  }
  return problems;
}

test.describe("sin JavaScript", () => {
  test.beforeEach(({}, info) => test.skip(!["desktop", "mobile"].includes(info.project.name), "solo desktop y mobile"));
  test.use({ javaScriptEnabled: false });

  for (const path of ["/", "/en"]) {
    test(`${path}: los 9 capítulos tienen texto y la respuesta es visible`, async ({ page }) => {
      await page.goto(path);
      for (const id of CHAPTERS) {
        const section = page.locator(`section[id="${id}"]`);
        await expect(section, id).toHaveCount(1);
        const text = await section.evaluate((el) => (el as HTMLElement).innerText.trim());
        expect(text.length, `#${id} sin texto`).toBeGreaterThan(0);
        // Texto que no sea un titular: los h1-h3 solos no bastan.
        const body = await section.evaluate((el) =>
          Array.from(el.querySelectorAll<HTMLElement>("p, li, a, span, blockquote, dd, dt, small, figcaption"))
            .filter((n) => !n.closest("h1, h2, h3"))
            .map((n) => n.innerText.trim())
            .join("")
            .length,
        );
        expect(body, `#${id} solo tiene titulares`).toBeGreaterThan(0);
        expect(await section.evaluate(hiddenBy), `#${id} oculta por estilo`).toEqual([]);
      }
      await expect(page.locator("[data-answer]").first()).toBeVisible();
      expect(await page.locator("[data-answer]").first().evaluate(hiddenBy), "[data-answer] oculto por estilo").toEqual([]);
    });
  }

  for (const path of ["/", "/en", "/developers", "/en/privacy"]) {
    test(`${path}: sin desborde horizontal a 375 px`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const { scroll, inner } = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: document.documentElement.clientWidth,
      }));
      expect(scroll).toBeLessThanOrEqual(inner);
    });
  }

  test("las páginas estáticas muestran su respuesta", async ({ page }) => {
    for (const path of ["/about", "/en/contact"]) {
      await page.goto(path);
      await expect(page.locator("[data-answer]").first()).toBeVisible();
      expect(await page.locator("[data-answer]").first().evaluate(hiddenBy)).toEqual([]);
    }
  });
});

test.describe("recomendaciones en inglés (Review Focus 5, R12)", () => {
  test("la traducción es la cita visible, etiquetada, y el original va en <details lang=es>", async ({ page }) => {
    await page.goto("/en");
    const first = page.locator("#proof blockquote").first();

    // La etiqueta es texto visible del sitio, fuera del blockquote y justo encima de él.
    const label = page.locator("#proof figure").first().getByText("Translated from Spanish");
    await expect(label).toBeVisible();
    await expect(first.getByText("Translated from Spanish")).toHaveCount(0);
    expect(await label.evaluate((p) => p.nextElementSibling?.tagName.toLowerCase())).toBe("blockquote");
    expect(await label.getAttribute("aria-hidden")).toBeNull();
    const order = await first.evaluate((bq) => Array.from(bq.children).map((c) => c.tagName.toLowerCase()));
    expect(order).toEqual(["div", "details"]);
    const translation = first.locator("> div > p").first();
    await expect(translation).toHaveAttribute("lang", "en");
    await expect(translation).toBeVisible();

    // El original: dentro de <details>, cerrado, en un contenedor lang="es".
    const details = first.locator("details");
    await expect(details).not.toHaveAttribute("open", /.*/);
    const original = details.locator('[lang="es"]');
    await expect(original).toHaveCount(1);
    const originalText = ((await original.textContent()) ?? "").trim();
    expect(originalText.length).toBeGreaterThan(40);
    // Es el original en español y no una copia de la traducción.
    expect(originalText).not.toBe(((await translation.textContent()) ?? "").trim());
    expect(originalText).toMatch(/[áéíóúñ¿¡]/i);
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
   * Incluye el runtime perezoso del movimiento: `waitUntil: "networkidle"` espera a que
   * se pida tras idle, así que su peso (y el de las primitivas) cuenta en el total.
   * Suma lo que pesa por la red el JS que carga la página. `transferSize` sería
   * la medida directa, pero depende de la máquina: con un antivirus que filtra
   * el tráfico local (ESET en la máquina del autor) Chrome recibe el cuerpo ya
   * descomprimido y `transferSize` sale como el tamaño sin comprimir. Por eso
   * se descarga cada script con Accept-Encoding: gzip y se mide el cuerpo
   * comprimido con zlib al nivel por defecto, el mismo que usa `next start`.
   */
  for (const path of ["/", "/en", "/en/no-existe"]) {
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

  /**
   * El chunk perezoso de la escena 3D (three + R3F) tiene su propio presupuesto. El
   * Chromium sin GPU de CI usa WebGL por software y la escena no se carga (puerta de
   * `LostExperience`), así que el chunk se mide en disco, como lo sirve `next start`.
   */
  test("el chunk 3D perezoso no pasa de 250 KB (gzip)", () => {
    const dir = join(process.cwd(), ".next", "static", "chunks");
    const files = readdirSync(dir).filter((f) => f.endsWith(".js") && readFileSync(join(dir, f), "utf8").match(/PMREMGenerator|webglcontextlost|__r3f/));
    expect(files.length).toBeGreaterThan(0);
    // el import dinámico reparte three y R3F en varios chunks: se suman todos, los que contienen three (PMREMGenerator), la escena (webglcontextlost) o R3F (__r3f)
    const gz = files.reduce((sum, f) => sum + gzipSync(readFileSync(join(dir, f))).length, 0);
    console.log(`[budget] chunk 3D: ${(gz / 1024).toFixed(1)} KB gzip`);
    expect(gz).toBeLessThanOrEqual(250 * 1024);
  });
});
