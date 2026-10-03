import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const LANGS = [
  { home: "/", about: "/about", work: "Proyectos", aboutLabel: "Sobre mí" },
  { home: "/en", about: "/en/about", work: "Work", aboutLabel: "About" },
];

/** Enlace de la nav en el viewport actual: barra en escritorio, panel desplegable en móvil. */
async function navLink(page: Page, name: string) {
  const bar = page.locator("header nav").first();
  if (await bar.isVisible()) return bar.getByRole("link", { name, exact: true });
  await page.locator("header summary").click();
  return page.locator("header details nav").getByRole("link", { name, exact: true });
}

const hashCount = (url: string) => (url.match(/#/g) ?? []).length;

for (const l of LANGS) {
  test.describe(l.home, () => {
    test("pulsar Work, recargar, desplazarse, pulsar Work y About deja una sola almohadilla", async ({ page }) => {
      await page.goto(l.home);
      await (await navLink(page, l.work)).click();
      await expect(page).toHaveURL(new RegExp(`#work$`));
      // Con la almohadilla ya en la URL (recarga o enlace compartido) el router duplicaba el fragmento.
      await page.reload();
      await page.mouse.wheel(0, 1500);
      await (await navLink(page, l.work)).click();
      await page.waitForTimeout(300);
      expect(hashCount(page.url()), page.url()).toBe(1);
      await (await navLink(page, l.aboutLabel)).click();
      await page.waitForTimeout(300);
      expect(page.url().endsWith("#about"), page.url()).toBe(true);
      expect(hashCount(page.url()), page.url()).toBe(1);
    });

    test("desde otra página, la nav lleva a la home con su ancla", async ({ page }) => {
      await page.goto(l.about);
      await (await navLink(page, l.work)).click();
      await expect(page).toHaveURL(new RegExp(`${l.home === "/" ? "" : l.home}#work$`));
      expect(hashCount(page.url())).toBe(1);
      await page.mouse.wheel(0, 1500);
      await (await navLink(page, l.work)).click();
      await (await navLink(page, l.aboutLabel)).click();
      await page.waitForTimeout(300);
      expect(page.url().endsWith("#about"), page.url()).toBe(true);
      expect(hashCount(page.url()), page.url()).toBe(1);
    });

    test("los anclas de la nav siguen el orden de las secciones de la home", async ({ page }) => {
      await page.goto(l.home);
      const bar = page.locator("header nav").first();
      const links = (await bar.isVisible()) ? bar : (await page.locator("header summary").click(), page.locator("header details nav"));
      const hrefs = await links.locator("a").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
      const anchors = hrefs.filter((h) => h.includes("#")).map((h) => h.split("#")[1]);
      expect(anchors).toEqual(["about", "work", "open-source", "contact"]);
      const sectionIds = await page.locator("main section[id]").evaluateAll((s) => s.map((x) => x.id));
      const positions = anchors.map((a) => sectionIds.indexOf(a));
      expect(positions.every((p) => p >= 0)).toBe(true);
      expect([...positions].sort((a, b) => a - b)).toEqual(positions);
      // Después de las anclas van los dos enlaces externos: Skills y Blog.
      const rest = hrefs.filter((h) => !h.includes("#") && h.startsWith("https://"));
      expect(rest).toEqual(["https://skills.sgomez.dev", "https://blog.sgomez.dev"]);
    });
  });
}
