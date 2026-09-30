import { describe, expect, it } from "vitest";
import { isRscRequest, routeRequest } from "@/lib/routing/request";
import { decide } from "@/lib/markdown/routing";
import sitemap from "@/app/sitemap";
import { CONTENT_UPDATED, PAGES, ROUTE_CATALOGUE, localizedHtmlRoutes } from "@/lib/routing/pages";
import { HTML_ROUTES } from "@/lib/site";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { agentsMd } from "@/lib/machine/agents-md";
import { readFileSync } from "node:fs";

describe("routeRequest", () => {
  it.each([
    ["/", { kind: "rewrite", to: "/es" }],
    ["/about", { kind: "rewrite", to: "/es/about" }],
    ["/en", { kind: "next" }],
    ["/en/about", { kind: "next" }],
    ["/es", { kind: "redirect", to: "/", status: 308 }],
    ["/es/about", { kind: "redirect", to: "/about", status: 308 }],
    ["/lab", { kind: "redirect", to: "/", status: 301 }],
    ["/lab/terminal", { kind: "redirect", to: "/", status: 301 }],
    ["/en/lab", { kind: "redirect", to: "/en", status: 301 }],
    ["/api/v1/profile", { kind: "next" }],
    ["/llms.txt", { kind: "next" }],
    ["/agents.md", { kind: "next" }],
    ["/openapi.json", { kind: "next" }],
    ["/about.md", { kind: "next" }],
    ["/es/llms.txt", { kind: "redirect", to: "/llms.txt", status: 308 }],
    ["/es/llms-full.txt", { kind: "redirect", to: "/llms-full.txt", status: 308 }],
    ["/es/agents.md", { kind: "redirect", to: "/agents.md", status: 308 }],
    ["/es.md", { kind: "redirect", to: "/index.md", status: 308 }],
    ["/es/about.md", { kind: "redirect", to: "/about.md", status: 308 }],
    ["/es/index.md", { kind: "redirect", to: "/index.md", status: 308 }],
    ["/en/index.md", { kind: "next" }],
    ["/en/llms-full.txt", { kind: "next" }],
    ["/llms-full.txt", { kind: "next" }],
    ["/Santiago_Gómez_de_la_Torre_Romero.png", { kind: "next" }],
    ["/_next/static/x.js", { kind: "next" }],
  ])("%s", (path, expected) => {
    expect(routeRequest(path)).toEqual(expected);
  });
});

describe("negociación localizada", () => {
  it("/en/about con Accept markdown sirve markdown con canónica inglesa", () => {
    expect(decide("/en/about", "text/markdown", false)).toEqual({ kind: "markdown", path: "/en/about", canonical: "/en/about", indexable: true });
  });
  it("/en/about.md no se indexa y apunta a /en/about", () => {
    expect(decide("/en/about.md", null, false)).toEqual({ kind: "markdown", path: "/en/about", canonical: "/en/about", indexable: false });
  });
  it("/en.md es la variante de la home inglesa", () => {
    expect(decide("/en.md", null, false)).toMatchObject({ kind: "markdown", canonical: "/en" });
  });
  it("/en/index.md también resuelve a la home inglesa, y /index.md sigue siendo la española", () => {
    expect(decide("/en/index.md", null, false)).toEqual({ kind: "markdown", path: "/en", canonical: "/en", indexable: false });
    expect(decide("/index.md", null, false)).toEqual({ kind: "markdown", path: "/", canonical: "/", indexable: false });
  });
  it("la imagen Open Graph no entra en la negociación de markdown", () => {
    expect(decide("/opengraph-image", "text/markdown", false)).toEqual({ kind: "skip" });
    expect(decide("/en/opengraph-image", null, false)).toEqual({ kind: "skip" });
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  it("publica las dos versiones de cada página, con alternates recíprocos", () => {
    const about = entries.find((e) => e.url === "https://sgomez.dev/about")!;
    expect(about.alternates?.languages).toEqual({ es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about", "x-default": "https://sgomez.dev/about" });
    expect(entries.some((e) => e.url === "https://sgomez.dev/en/about")).toBe(true);
  });
  it("sin /lab", () => expect(entries.some((e) => e.url.includes("/lab"))).toBe(false));
  it("lastModified viene de CONTENT_UPDATED y nunca es futuro", () => {
    for (const d of Object.values(CONTENT_UPDATED)) expect(new Date(d).getTime()).toBeLessThanOrEqual(Date.now());
    const a = sitemap().map((e) => String(e.lastModified));
    const b = sitemap().map((e) => String(e.lastModified));
    expect(a).toEqual(b);
  });
});

describe("catálogo de rutas", () => {
  it("cada ruta declara su título en español y en inglés, y son distintos", () => {
    for (const logical of PAGES) {
      const { title } = ROUTE_CATALOGUE[logical];
      expect(title.es, logical).toBeTruthy();
      expect(title.en, logical).toBeTruthy();
      // Hoy ningún título es un nombre propio igual en los dos idiomas. Si
      // llegara uno, se exime aquí de forma explícita.
      expect(title.en, logical).not.toBe(title.es);
    }
    expect(ROUTE_CATALOGUE["/about"].title.en).toBe("About me");
  });
  it("HTML_ROUTES es la vista española del catálogo", () => {
    expect(HTML_ROUTES.map((r) => r.path)).toEqual([...PAGES]);
    for (const route of HTML_ROUTES) {
      const entry = ROUTE_CATALOGUE[route.path];
      expect(route.title).toBe(entry.title.es);
      expect(route.changeFrequency).toBe(entry.changeFrequency);
      expect(route.priority).toBe(entry.priority);
    }
  });
  it("localizedHtmlRoutes cubre las dos lenguas", () => {
    expect(localizedHtmlRoutes().map((r) => r.path)).toContain("/en/developers");
    expect(localizedHtmlRoutes("en").every((r) => r.lang === "en")).toBe(true);
  });
  it("site.ts no depende de @/i18n", () => {
    const source = readFileSync("src/lib/site.ts", "utf8").replace(/\r\n/g, "\n");
    expect(source).not.toMatch(/from\s+["']@\/i18n/);
  });
});

describe("llms.txt y agents.md por idioma", () => {
  it("la versión inglesa enlaza las páginas inglesas y la española las españolas", () => {
    expect(llmsTxt("es")).toContain("(https://sgomez.dev/developers)");
    expect(llmsTxt("en")).toContain("(https://sgomez.dev/en/developers)");
    expect(agentsMd("es")).toContain("https://sgomez.dev/contact");
    expect(agentsMd("en")).toContain("[Contact](https://sgomez.dev/en/contact)");
    expect(agentsMd("es")).not.toContain("/lab");
  });
});

// Defensivo (R9): Next elimina las cabeceras rsc / next-router-* antes de que la
// petición llegue al proxy, así que en ejecución `isRsc` nunca es true allí. Estos
// tests cubren solo la lógica pura de `decide` / `isRscRequest`, por si una
// versión futura de Next las conserva. No prueban comportamiento observable: la
// navegación de cliente real la fija el e2e de Review Focus 2.
describe("peticiones RSC (solo lógica defensiva, R9)", () => {
  it("decide() no da markdown a una petición marcada como RSC (camino que el proxy no ve en ejecución)", () => {
    expect(decide("/about", "text/markdown", true)).toEqual({ kind: "skip" });
    expect(decide("/en/about", "text/markdown", true)).toEqual({ kind: "skip" });
  });
  it("isRscRequest reconoce cabecera o parámetro _rsc (defensivo: el proxy no ve las cabeceras)", () => {
    expect(isRscRequest(new Headers({ rsc: "1" }), "")).toBe(true);
    expect(isRscRequest(new Headers({ "next-router-prefetch": "1" }), "")).toBe(true);
    expect(isRscRequest(new Headers(), "?_rsc=abc")).toBe(true);
    expect(isRscRequest(new Headers({ accept: "text/markdown" }), "")).toBe(false);
  });
  it("el enrutado por idioma se aplica igual a la navegación de cliente", () => {
    expect(routeRequest("/about")).toEqual({ kind: "rewrite", to: "/es/about" });
  });
});
