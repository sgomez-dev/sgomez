import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

const CASES = [
  { path: "/no-existe", lang: "es-ES", h1: /Esta página/, nav: "Volver al inicio" },
  { path: "/en/no-existe", lang: "en", h1: /This page/, nav: "Back to home" },
];

test.describe.configure({ timeout: 90_000 }); // WebGL por software con varios workers es lento

test.describe("404 por idioma", () => {
  for (const { path, lang, h1 } of CASES) {
    test(`${path}: estado 404, idioma, h1, noindex, caché y Vary`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res!.status()).toBe(404);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.locator("h1")).toHaveText(h1);
      await expect(page.locator("header nav a").first()).toHaveAttribute("href", lang === "en" ? /^\/en/ : /^\/(?!en)/);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      const headers = res!.headers();
      expect(headers["x-robots-tag"]).toContain("noindex");
      expect(headers["cache-control"]).toBe("public, max-age=60, s-maxage=60");
      expect(headers["vary"] ?? "").toMatch(/accept/i);
    });
  }

  for (const path of ["/perdido", "/en/perdido"]) {
    test(`${path} directo también es 404`, async ({ request }) => {
      expect((await request.get(path, { maxRedirects: 0 })).status()).toBe(404);
    });
  }
});

test.describe("sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "solo escritorio"));

  test("los siete fragmentos son enlaces visibles y #mapa tiene el mapa del sitio", async ({ page }) => {
    await page.goto("/en/no-existe");
    const anchors = page.locator("a[data-shard-id]");
    await expect(anchors).toHaveCount(7);
    for (const a of await anchors.all()) {
      await expect(a).toBeVisible();
      await expect(a).toHaveAttribute("href", /.+/);
    }
    const links = await page.locator("#mapa a").count();
    expect(links).toBeGreaterThan(10);
    await expect(page.locator('#mapa a[href="/en/llms.txt"]')).toHaveCount(1);
  });
});

test.describe("movimiento", () => {
  test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "solo escritorio"));

  test("prefers-reduced-motion: ni vídeo ni lienzo", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.addInitScript(() => ((window as unknown as { __LOST_FORCE_GATE__: boolean }).__LOST_FORCE_GATE__ = true));
    await page.goto("/en/no-existe");
    await page.waitForTimeout(1500);
    await expect(page.locator("video")).toHaveCount(0);
    await expect(page.locator("canvas")).toHaveCount(0);
  });

  test("con movimiento: el vídeo suena y después aparece el lienzo", async ({ page }) => {
    await page.addInitScript(() => ((window as unknown as { __LOST_FORCE_GATE__: boolean }).__LOST_FORCE_GATE__ = true));
    await page.goto("/en/no-existe");
    await expect(page.locator("[data-lost-video]")).toBeAttached({ timeout: 10_000 });
    await expect(page.locator("[data-lost-canvas]")).toBeAttached({ timeout: 30_000 });
  });
});

test("Review Focus 4: navegación de cliente a un enlace desconocido acaba en el 404 inglés sin errores de consola", async ({ page, consoleErrors }) => {
  await page.goto("/en");
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => (window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push("/en/does-not-exist"));
  await expect(page).toHaveURL(/\/en\/does-not-exist$/, { timeout: 20_000 });
  await expect(page.locator("h1")).toHaveText(/This page/, { timeout: 20_000 });
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  // Chromium escribe «Failed to load resource … 404» cuando el DOCUMENTO pedido es un 404; es esperado y solo se filtra para esta URL
  const rest = consoleErrors.filter((e) => !(/status of 404/.test(e) && /does-not-exist/.test(e)));
  consoleErrors.splice(0, consoleErrors.length, ...rest);
});

test("cada enlace de fragmento responde 200", async ({ page, request }) => {
  for (const path of ["/no-existe", "/en/no-existe"]) {
    await page.goto(path);
    await expect(page.locator("a[data-shard-id]")).toHaveCount(7);
    const hrefs = await page.locator("a[data-shard-id]").evaluateAll((els) => els.map((e) => e.getAttribute("href")!));
    expect(hrefs).toHaveLength(7);
    for (const href of hrefs) {
      const res = await request.get(href.startsWith("#") ? path : href, { maxRedirects: 0 });
      expect(res.status(), `${path} → ${href}`).toBe(200);
    }
  }
});

test("Accept: text/markdown en /en/does-not-exist devuelve el 404 en markdown inglés", async ({ request }) => {
  const res = await request.get("/en/does-not-exist", { headers: { accept: "text/markdown" }, maxRedirects: 0 });
  expect(res.status()).toBe(404);
  expect(res.headers()["content-type"]).toContain("text/markdown");
  expect(await res.text()).toMatch(/not found|404/i);
});

test("axe en /en/no-existe", async ({ page }) => {
  await page.goto("/en/no-existe");
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(violations.map((v) => `${v.id} ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
});

test("áreas táctiles de 44 px en /en/no-existe (móvil)", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile", "solo en móvil");
  await page.goto("/en/no-existe");
  await page.waitForLoadState("networkidle");
  const items = page.locator('a[data-shard-id], #mapa a, [data-stage="lost"] button');
  const failures: string[] = [];
  let measured = 0;
  for (const el of await items.all()) {
    const box = await el.boundingBox();
    if (!box) continue;
    measured++;
    if (box.width < 43.5 || box.height < 43.5) failures.push(`${await el.evaluate((n) => n.getAttribute("href") ?? n.tagName)}: ${Math.round(box.width)}x${Math.round(box.height)}`);
  }
  expect(measured).toBeGreaterThan(7);
  expect(failures).toEqual([]);
});
