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

  test("una URL inexistente da el 404 real en el idioma de la URL (R8)", async ({ request }) => {
    const cases = [
      { path: "/no-existe", lang: 'lang="es-ES"', h1: "Esta página", llms: 'href="/llms.txt"', other: "Volver al inicio" },
      { path: "/en/no-existe", lang: 'lang="en"', h1: "This page", llms: 'href="/en/llms.txt"', other: "Back to home" },
    ];
    for (const { path, lang, h1, llms, other } of cases) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status(), path).toBe(404);
      expect(res.headers()["content-type"]).toContain(HTML);
      expect(res.headers()["cache-control"]).toBe("public, max-age=60, s-maxage=60");
      expect(res.headers()["x-robots-tag"]).toBe("noindex, follow");
      const body = await res.text();
      expect(body, path).toContain(`<html ${lang}`);
      expect(body).toMatch(new RegExp("<h1[^>]*>" + h1));
      expect(body).toContain(llms);
      expect(body).toContain(other);
      expect(body).toContain('id="mapa"');
    }
    // El idioma de una URL no se cuela en la otra.
    // Se compara solo el HTML visible: el payload RSC lleva el aviso por defecto de Next.
    const visible = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "");
    const es = visible(await (await request.get("/no-existe")).text());
    const en = visible(await (await request.get("/en/no-existe")).text());
    expect(es).not.toContain("This page");
    expect(en).not.toContain("Esta página");
  });

  test("assets y API desconocidos no reciben la experiencia HTML", async ({ request }) => {
    const png = await request.get("/foo.png", { maxRedirects: 0 });
    expect(png.status()).toBe(404);
    expect(await png.text()).not.toContain('id="mapa"');
    const api = await request.get("/api/nope", { maxRedirects: 0 });
    expect(api.status()).toBe(404);
    expect(api.headers()["content-type"]).toContain("application/json");
  });

  test("Accept: text/markdown en una página devuelve markdown con la canónica inglesa (Review Focus 3)", async ({ request }) => {
    const res = await request.get("/en/about", { headers: { accept: "text/markdown" }, maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain(MD);
    expect(res.headers().link).toContain('<https://sgomez.dev/en/about>; rel="canonical"');
  });

  test("las variantes .md anuncian hreflang en Link, y el 404 en markdown se cachea un minuto", async ({ request }) => {
    for (const [path, canonical] of [
      ["/about.md", "https://sgomez.dev/about"],
      ["/en/about.md", "https://sgomez.dev/en/about"],
    ]) {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      const link = res.headers().link;
      expect(link, path).toContain(`<${canonical}>; rel="canonical"`);
      expect(link, path).toContain('<https://sgomez.dev/about>; rel="alternate"; hreflang="es"');
      expect(link, path).toContain('<https://sgomez.dev/en/about>; rel="alternate"; hreflang="en"');
      expect(link, path).toContain('<https://sgomez.dev/about>; rel="alternate"; hreflang="x-default"');
    }
    const missing = await request.get("/no-existe.md", { maxRedirects: 0 });
    expect(missing.status()).toBe(404);
    expect(missing.headers()["cache-control"]).toBe("public, max-age=60, s-maxage=60");
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

  test("desde /en/no-existe el selector lleva a la home española", async ({ page }) => {
    await page.goto("/en/no-existe");
    await page.waitForLoadState("networkidle");
    const hrefs = await page.locator("a[hreflang='es']").evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toBe("/");
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
