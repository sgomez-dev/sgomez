import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "./fixtures";

/** Los tres casos publicados, con un trozo literal de cada texto que el dueño aprobó. */
const CASES = [
  { slug: "claude-canvas", title: "Claude Canvas", es: "devuelve tu respuesta como un valor exacto", en: "returns your answer as an exact value" },
  { slug: "nudaui-semantic-search-rag", title: "NudaUI Semantic Search (RAG)", es: "Hacía falta buscar por significado", en: "It needed search by meaning" },
  { slug: "nudaui", title: "NudaUI", es: "1.503 componentes en 81 categorías", en: "1,503 components across 81 categories" },
] as const;
const LANG_PREFIX = { es: "", en: "/en" } as const;
const LANGS = ["es", "en"] as const;

const url = (lang: "es" | "en", slug: string) => `${LANG_PREFIX[lang]}/work/${slug}`;

// Estas leen el HTML servido o miden con un solo viewport: basta el proyecto desktop.
// El de móvil mide su propio ancho en la sección de desborde.
const onlyDesktop = (info: { project: { name: string } }) => info.project.name !== "desktop";

test.describe("caso de estudio: contenido", () => {
  test.beforeEach(({}, info) => test.skip(onlyDesktop(info), "no depende del viewport"));

  for (const lang of LANGS) {
    for (const c of CASES) {
      test(`${url(lang, c.slug)}: título, frase de respuesta, textos, fecha y enlaces`, async ({ page }) => {
        const res = await page.goto(url(lang, c.slug));
        expect(res!.status()).toBe(200);
        await expect(page.locator("h1")).toHaveText(c.title);
        await expect(page.locator("[data-answer]")).toBeVisible();
        await expect(page.locator("article")).toContainText(lang === "es" ? c.es : c.en);
        for (const id of ["problem", "role", "stack", "outcome", "links"]) await expect(page.locator(`section#${id} h2`)).toBeVisible();
        // <time datetime> visible, con el `updated` del caso
        const time = page.locator("time[datetime]");
        await expect(time).toBeVisible();
        await expect(time).toHaveAttribute("datetime", "2026-10-02");
        await expect(time).toContainText("2026");
        // enlace «Fuente» a la URL indicada
        const source = page.getByRole("link", { name: lang === "es" ? "Fuente" : "Source", exact: true });
        await expect(source).toBeVisible();
        expect(await source.getAttribute("href")).toMatch(/^https:\/\//);
        // al menos un enlace interno a otro caso y la variante markdown
        await expect(page.locator(`a[href="${url(lang, CASES.find((o) => o.slug !== c.slug)!.slug)}"]`)).toBeVisible();
        await expect(page.locator(`a[href="${url(lang, c.slug)}.md"]`)).toBeVisible();
      });
    }
  }

  test("Claude Canvas enlaza su repositorio y el original del que es fork", async ({ page }) => {
    await page.goto("/work/claude-canvas");
    await expect(page.locator('a[href="https://github.com/sgomez-dev/claude-canvas"]')).toBeVisible();
    await expect(page.locator('a[href="https://github.com/dvdsgl/claude-canvas"]')).toContainText("David Siegel");
  });

  test("el reel de Claude Canvas se pinta con su póster (decorativo)", async ({ page }) => {
    await page.goto("/work/claude-canvas");
    await expect(page.locator('[data-motion="reel"] img')).toHaveAttribute("src", "/media/reels/claude-canvas.webp");
  });
});

test.describe("caso de estudio: sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test.beforeEach(({}, info) => test.skip(onlyDesktop(info), "no depende del viewport"));

  for (const lang of LANGS) {
    test(`${url(lang, "nudaui")}: el texto completo está en el DOM servido`, async ({ page }) => {
      await page.goto(url(lang, "nudaui"));
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("[data-answer]")).toBeVisible();
      await expect(page.locator("section#outcome")).toContainText(lang === "es" ? "1.503 componentes" : "1,503 components");
      await expect(page.locator("time[datetime]")).toBeVisible();
    });
  }
});

test.describe("caso de estudio: cabecera, SEO y negociación", () => {
  test.beforeEach(({}, info) => test.skip(onlyDesktop(info), "no depende del viewport"));

  for (const lang of LANGS) {
    test(`${url(lang, "claude-canvas")}: canónica, hreflang recíproco, variante .md y Open Graph propia`, async ({ page, request }) => {
      const path = url(lang, "claude-canvas");
      await page.goto(path);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://sgomez.dev${path}`);
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((els) => Object.fromEntries(els.map((e) => [e.getAttribute("hreflang"), e.getAttribute("href")])));
      expect(alternates).toEqual({
        es: "https://sgomez.dev/work/claude-canvas",
        en: "https://sgomez.dev/en/work/claude-canvas",
        "x-default": "https://sgomez.dev/work/claude-canvas",
      });
      await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute("href", `${path}.md`);
      await expect(page.locator('html')).toHaveAttribute("lang", lang === "es" ? "es-ES" : "en");

      const og = `https://sgomez.dev${path}/opengraph-image`;
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", new RegExp(`${path}/opengraph-image`));
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
        "content",
        lang === "es" ? "Caso de estudio de Claude Canvas, por Santiago Gómez de la Torre" : "Case study of Claude Canvas, by Santiago Gómez de la Torre",
      );
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
      expect(await page.title()).toContain(lang === "es" ? "caso de estudio" : "case study");

      const img = await request.get(og.replace("https://sgomez.dev", ""));
      expect(img.status()).toBe(200);
      expect(img.headers()["content-type"]).toContain("image/png");
    });
  }

  test("el @graph lleva el caso como SoftwareSourceCode con author hacia #person y el isBasedOn del original", async ({ page }) => {
    await page.goto("/en/work/claude-canvas");
    const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}")));
    expect(graphs).toHaveLength(1);
    const nodes = graphs[0]["@graph"] as Record<string, unknown>[];
    const types = (n: Record<string, unknown>) => ([] as unknown[]).concat(n["@type"]);
    const code = nodes.find((n) => n["@id"] === "https://sgomez.dev/en/work/claude-canvas#case")!;
    expect(types(code)).toEqual(["SoftwareSourceCode"]);
    expect(code.author).toEqual({ "@id": "https://sgomez.dev/#person" });
    expect(code.dateModified).toBe("2026-10-02");
    expect(code.isBasedOn).toMatchObject({ url: "https://github.com/dvdsgl/claude-canvas" });
    expect(nodes.some((n) => n["@id"] === "https://sgomez.dev/#person")).toBe(true);
    expect(nodes.find((n) => types(n).includes("WebPage"))).toMatchObject({ dateModified: "2026-10-02", mainEntity: { "@id": code["@id"] } });
  });

  for (const lang of LANGS) {
    test(`${url(lang, "nudaui")}.md es markdown con noindex y con su fecha`, async ({ request }) => {
      const res = await request.get(`${url(lang, "nudaui")}.md`, { maxRedirects: 0 });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("text/markdown");
      expect(res.headers()["x-robots-tag"]).toBe("noindex, follow");
      expect(res.headers()["link"]).toContain(`<https://sgomez.dev${url(lang, "nudaui")}>; rel="canonical"`);
      expect(res.headers()["link"]).toContain('hreflang="x-default"');
      const body = await res.text();
      expect(body).toContain("2026-10-02");
      expect(body).toContain(lang === "es" ? "1.503 componentes" : "1,503 components");
    });
  }

  test("Accept: text/markdown en la URL canónica da el markdown sin noindex", async ({ request }) => {
    const res = await request.get("/work/nudaui", { headers: { accept: "text/markdown" }, maxRedirects: 0 });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("text/markdown");
    expect(res.headers()["x-robots-tag"]).toBeUndefined();
  });

  test("el sitemap lista cada caso en los dos idiomas con su lastmod y sus hreflang", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const c of CASES) {
      for (const lang of LANGS) {
        const loc = `https://sgomez.dev${url(lang, c.slug)}`;
        const entry = new RegExp(`<url><loc>${loc}</loc><lastmod>2026-10-02[^<]*</lastmod>[\\s\\S]*?</url>`).exec(xml);
        expect(entry, loc).not.toBeNull();
        expect(entry![0]).toContain(`hreflang="x-default" href="https://sgomez.dev/work/${c.slug}"`);
        expect(entry![0]).toContain(`hreflang="en" href="https://sgomez.dev/en/work/${c.slug}"`);
      }
    }
  });

  test("llms.txt y llms-full.txt enlazan cada caso", async ({ request }) => {
    const [es, en, full] = await Promise.all(["/llms.txt", "/en/llms.txt", "/llms-full.txt"].map(async (p) => (await request.get(p)).text()));
    for (const c of CASES) {
      expect(es).toContain(`](https://sgomez.dev/work/${c.slug})`);
      expect(en).toContain(`](https://sgomez.dev/en/work/${c.slug})`);
      expect(full).toContain(`Canonical URL: https://sgomez.dev/work/${c.slug}`);
    }
  });
});

test.describe("caso de estudio: un slug sin caso da el 404 a medida", () => {
  test.beforeEach(({}, info) => test.skip(onlyDesktop(info), "no depende del viewport"));

  for (const [path, lang] of [["/work/geeklab", 'lang="es-ES"'], ["/en/work/geeklab", 'lang="en"'], ["/work", 'lang="es-ES"'], ["/en/work/no-existe/opengraph-image", 'lang="en"']] as const) {
    test(`${path} responde 404 con la experiencia a medida`, async ({ request }) => {
      const res = await request.get(path, { maxRedirects: 0 });
      expect(res.status()).toBe(404);
      expect(res.headers()["content-type"]).toContain("text/html");
      expect(res.headers()["x-robots-tag"]).toBe("noindex, follow");
      const body = await res.text();
      expect(body).toContain(`<html ${lang}`);
      expect(body).toContain('id="mapa"');
    });
  }

  test("un .md sin caso es el 404 en markdown", async ({ request }) => {
    const res = await request.get("/work/geeklab.md", { maxRedirects: 0 });
    expect(res.status()).toBe(404);
    expect(res.headers()["content-type"]).toContain("text/markdown");
  });
});

test.describe("la ficha de la home enlaza al caso", () => {
  test.beforeEach(({}, info) => test.skip(onlyDesktop(info), "mismo DOM en todos los viewports"));

  for (const lang of LANGS) {
    test(`${LANG_PREFIX[lang] || "/"}: un segundo enlace interno visible por caso, sin enlaces anidados`, async ({ page }) => {
      await page.goto(LANG_PREFIX[lang] || "/");
      for (const c of CASES) {
        const link = page.locator(`#work a[data-case-link="${c.slug}"]`);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", url(lang, c.slug));
        await expect(link).not.toHaveAttribute("target", /.*/);
        // la ficha sigue siendo el enlace externo del proyecto
        await expect(page.locator(`#work li:has(a[data-case-link="${c.slug}"]) > a[target="_blank"]`)).toHaveCount(1);
      }
      expect(await page.locator("#work a a").count()).toBe(0);
      // los proyectos sin caso no reciben enlace
      await expect(page.locator("#work a[data-case-link]")).toHaveCount(3);
    });
  }

  test("el enlace lleva al caso y el selector de idioma mantiene el caso", async ({ page }) => {
    await page.goto("/");
    await page.locator('#work a[data-case-link="claude-canvas"]').click();
    await page.waitForURL("**/work/claude-canvas");
    await expect(page.locator("h1")).toHaveText("Claude Canvas");
    const toEn = page.locator('header a[hreflang="en"]:visible, footer a[hreflang="en"]:visible').first();
    await expect(toEn).toHaveAttribute("href", "/en/work/claude-canvas");
    await toEn.click();
    await page.waitForURL("**/en/work/claude-canvas");
    await expect(page.locator("h1")).toHaveText("Claude Canvas");
    await expect(page.locator("[data-answer]")).toContainText("This case study");
  });

  test("la ficha lleva el 1.500 de NudaUI y el RAG conserva su 1.000+", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('#work li:has(a[data-case-link="nudaui"])')).toContainText("más de 1.500 componentes");
    await expect(page.locator('#work li:has(a[data-case-link="nudaui-semantic-search-rag"])')).toContainText("1.000+");
    await page.goto("/en");
    await expect(page.locator('#work li:has(a[data-case-link="nudaui"])')).toContainText("more than 1,500");
  });
});

test.describe("caso de estudio: accesibilidad y diseño adaptable", () => {
  for (const lang of LANGS) {
    for (const c of CASES) {
      test(`axe WCAG 2 A/AA sin violaciones en ${url(lang, c.slug)}`, async ({ page }, info) => {
        test.skip(onlyDesktop(info) && info.project.name !== "mobile", "desktop y móvil bastan");
        await page.goto(url(lang, c.slug));
        await page.waitForLoadState("networkidle");
        const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
        const summary = violations.map((v) => `${v.id} (${v.impact}) ${v.nodes[0]?.target.join(" ")}`);
        expect(summary, summary.join("\n")).toEqual([]);
      });
    }
  }

  test("sin desborde horizontal en el viewport del proyecto", async ({ page }) => {
    for (const lang of LANGS) {
      for (const c of CASES) {
        await page.goto(url(lang, c.slug));
        const { scroll, inner } = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, inner: document.documentElement.clientWidth }));
        expect(scroll, `${url(lang, c.slug)} @${inner}`).toBeLessThanOrEqual(inner);
      }
    }
  });

  test("las áreas táctiles de los enlaces del caso miden 44 px en móvil", async ({ page }, info) => {
    test.skip(info.project.name !== "mobile", "solo en móvil");
    await page.goto("/work/claude-canvas");
    const small: string[] = [];
    for (const el of await page.locator("article a").all()) {
      const box = await el.boundingBox();
      if (box && box.height < 43.5) small.push(`${await el.textContent()} ${box.height}`);
    }
    expect(small).toEqual([]);
  });
});
