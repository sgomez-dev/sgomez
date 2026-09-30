import { test, expect } from "./fixtures";

const HTML = "text/html";
const MD = "text/markdown";

/** Cada URL de las restricciones globales con su tipo de contenido. */
const OK: [string, string][] = [
  ["/", HTML], ["/about", HTML], ["/contact", HTML], ["/developers", HTML], ["/privacy", HTML],
  ["/en", HTML], ["/en/about", HTML], ["/en/contact", HTML], ["/en/developers", HTML], ["/en/privacy", HTML],
  ["/api/v1/profile", "application/json"], ["/api/v1/health", "application/json"],
  ["/openapi.json", "application/json"], ["/api/openapi.json", "application/json"], ["/api/openapi.yaml", "application/yaml"],
  ["/llms.txt", MD], ["/llms-full.txt", MD], ["/agents.md", MD],
  ["/en/llms.txt", MD], ["/en/llms-full.txt", MD], ["/en/agents.md", MD],
  ["/index.md", MD], ["/about.md", MD], ["/en.md", MD], ["/en/about.md", MD],
  ["/sitemap.xml", "application/xml"], ["/robots.txt", "text/plain"], ["/manifest.webmanifest", "application/manifest+json"],
  ["/opengraph-image", "image/png"], ["/en/opengraph-image", "image/png"],
];

const REDIRECTS: [string, number, string][] = [
  ["/es", 308, "/"], ["/es/about", 308, "/about"],
  ["/es.md", 308, "/index.md"], ["/es/about.md", 308, "/about.md"],
  ["/es/llms.txt", 308, "/llms.txt"], ["/es/llms-full.txt", 308, "/llms-full.txt"], ["/es/agents.md", 308, "/agents.md"],
  ["/lab", 301, "/"], ["/lab/terminal", 301, "/"], ["/en/lab", 301, "/en"],
];

test.describe("rutas", () => {
  for (const [path, type] of OK) {
    test(`${path} responde 200 ${type}`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain(type);
    });
  }

  for (const [path, status, location] of REDIRECTS) {
    test(`${path} redirige ${status} a ${location}`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(status);
      expect(new URL(res.headers().location, "http://x").pathname).toBe(location);
    });
  }

  test("una URL inexistente da el 404 bilingüe con estado 404 (R8)", async ({ request }) => {
    for (const path of ["/no-existe", "/en/no-existe"]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
      expect(res.headers()["content-type"]).toContain(HTML);
      const body = await res.text();
      expect(body).toContain("<h1");
      expect(body).toContain("Page not found");
    }
  });

  test("Accept: text/markdown en una página devuelve markdown con la canónica inglesa (Review Focus 3)", async ({ request }) => {
    const res = await request.get("/en/about", { headers: { accept: "text/markdown" }, maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain(MD);
    expect(res.headers().link).toContain('<https://sgomez.dev/en/about>; rel="canonical"');
  });
});

const ALTERNATES: [string, Record<string, string>][] = [
  ["/", { es: "https://sgomez.dev", en: "https://sgomez.dev/en", "x-default": "https://sgomez.dev" }],
  ["/about", { es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about", "x-default": "https://sgomez.dev/about" }],
  ["/en", { es: "https://sgomez.dev", en: "https://sgomez.dev/en", "x-default": "https://sgomez.dev" }],
  ["/en/about", { es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about", "x-default": "https://sgomez.dev/about" }],
];

test.describe("hreflang", () => {
  for (const [path, expected] of ALTERNATES) {
    test(`${path} declara es, en y x-default`, async ({ page }) => {
      await page.goto(path);
      const links = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => Object.fromEntries(els.map((el) => [el.getAttribute("hreflang"), el.getAttribute("href")])));
      expect(links).toMatchObject(expected);
    });
  }
});

test.describe("navegación de cliente (Review Focus 2)", () => {
  test("de / a /about con un Link del pie, sin errores de consola", async ({ page, consoleErrors }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Navegación de cliente de verdad: el documento no se recarga.
    await page.evaluate(() => ((window as unknown as { __marker: boolean }).__marker = true));
    await page.locator('footer a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator("h1")).toContainText("Santiago Gómez de la Torre Romero");
    expect(await page.evaluate(() => (window as unknown as { __marker?: boolean }).__marker)).toBe(true);
    expect(consoleErrors).toEqual([]);
  });

  test("de /en a /en/about con un Link del pie", async ({ page, consoleErrors }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await page.locator('footer a[href="/en/about"]').click();
    await expect(page).toHaveURL(/\/en\/about$/);
    await expect(page.locator("h1")).toContainText("Santiago Gómez de la Torre Romero");
    expect(consoleErrors).toEqual([]);
  });
});

test.describe("cambio de idioma (Review Focus 4)", () => {
  test("desde un 404 el selector lleva a la home inglesa, no a otro 404", async ({ page }) => {
    await page.goto("/no-existe");
    await page.waitForLoadState("networkidle");
    const hrefs = await page.locator("a[hreflang='en']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/en");
  });

  test("desde /about el selector lleva a /en/about", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    const hrefs = await page.locator("a[hreflang='en']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/en/about");
  });
});

test.describe("robots.txt", () => {
  // Lighthouse valida robots.txt con un analizador que no conoce Content-Signal
  // (directiva válida de contentsignals.org) y lo marca como error, así que esa
  // auditoría se salta en lighthouserc*.json. Este test cubre lo que ella miraría.
  test("permite rastrear, anuncia el sitemap y usa Content-Signal", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    const text = body.replace(/\r\n/g, "\n");
    expect(text).toMatch(/^User-agent: \*$/m);
    expect(text).toMatch(/^Allow: \/$/m);
    expect(text).toMatch(/^Sitemap: https:\/\/sgomez\.dev\/sitemap\.xml$/m);
    expect(text).toMatch(/^Content-Signal: .*search=yes/m);
    expect(text).not.toMatch(/^Disallow: \/\s*$/m);
  });
});

test.describe("nombre completo", () => {
  for (const path of ["/", "/en"]) {
    test(`el HTML servido de ${path} no contiene «Santiago Gómez» sin «de la Torre»`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html.match(/Santiago Gómez(?! de la Torre)/g)).toBeNull();
    });
  }
});
