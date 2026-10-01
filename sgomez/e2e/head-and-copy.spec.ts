import { test, expect } from "./fixtures";

// Solo hace falta un proyecto: leen el HTML servido, no dependen del viewport.
test.beforeEach(({}, info) => test.skip(info.project.name !== "desktop", "no depende del viewport"));

test.describe("D4: metadatos de cabecera", () => {
  for (const path of ["/", "/en", "/about", "/en/about", "/contact", "/developers", "/privacy", "/en/privacy"]) {
    test(`${path}: un solo rel="author"`, async ({ page }) => {
      await page.goto(path);
      const authors = await page.locator('link[rel="author"]').evaluateAll((els) => els.map((e) => e.getAttribute("href")));
      expect(authors, path).toHaveLength(1);
      expect(authors[0]).toMatch(/\/about$/);
    });
  }

  const TYPES: [string, string][] = [
    ["/about", "profile"],
    ["/en/about", "profile"],
    ["/", "website"],
    ["/en", "website"],
    ["/contact", "website"],
    ["/developers", "website"],
    ["/privacy", "website"],
    ["/en/contact", "website"],
  ];
  for (const [path, type] of TYPES) {
    test(`${path}: og:type es ${type}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", type);
    });
  }
});

test.describe("D8: el WebPage de la home se llama como su <title>", () => {
  for (const path of ["/", "/en"]) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      const graphs = await page.locator('script[type="application/ld+json"]').evaluateAll((els) => els.map((e) => JSON.parse(e.textContent ?? "{}")));
      const nodes = graphs.flatMap((g) => g["@graph"] ?? [g]) as { "@type": string | string[]; name?: string }[];
      const pageNode = nodes.find((n) => [n["@type"]].flat().some((t) => t === "ProfilePage" || t === "WebPage"));
      expect(pageNode?.name).toBe(title);
    });
  }
});

test.describe("A2: el texto visible no lleva rayas", () => {
  for (const path of ["/", "/en", "/about", "/en/about"]) {
    test(`${path}: sin — ni – fuera de las citas de recomendaciones`, async ({ page }) => {
      await page.goto(path);
      const text = await page.evaluate(() => {
        // Se mide el cuerpo real y se restan las citas, que son palabras de sus autores.
        const quotes = Array.from(document.querySelectorAll("#proof blockquote")).map((q) => (q as HTMLElement).innerText);
        let all = document.body.innerText;
        for (const q of quotes) all = all.replace(q, "");
        return all;
      });
      expect(text, path).not.toMatch(/[—–]/);
    });
  }
});
