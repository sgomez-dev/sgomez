import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { serializeJsonLd, pageGraph } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import NotFoundBody from "@/app/components/NotFoundBody";
import { notFoundMarkdown, markdownForPath } from "@/lib/markdown/documents";
import { machineHref } from "@/lib/routing/pages";
import { MACHINE_ROUTES, absolute } from "@/lib/site";
import { IDENTITY, IDENTITY_TEXT, personGraph } from "@/app/seo";
import { LANGS } from "@/i18n/languages";
import { getDictionary } from "@/i18n";

const read = (file: string) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

describe("serializeJsonLd", () => {
  it("escapa lo que puede cerrar un <script>", () => {
    const out = serializeJsonLd({ a: "</script><b>&\u2028\u2029" });
    expect(out).not.toMatch(/<|>|&|\u2028|\u2029/);
    expect(out).toContain("\\u003c/script\\u003e");
    expect(JSON.parse(out)).toEqual({ a: "</script><b>&\u2028\u2029" });
  });
});

describe("grafo por página", () => {
  const g = pageGraph({ lang: "en", path: "/contact", title: "Contact", description: "d", type: "ContactPage", faq: [{ q: "Q?", a: "A." }] }) as { "@graph": { "@type": string; [k: string]: unknown }[] };
  const types = g["@graph"].map((n) => n["@type"]);
  it("lleva Person, WebSite, la página y el FAQ", () => {
    for (const t of ["Person", "WebSite", "ContactPage", "FAQPage"]) expect(types).toContain(t);
  });
  it("la persona enlaza skills.sgomez.dev y declara credenciales", () => {
    const p = g["@graph"].find((n) => n["@type"] === "Person")!;
    expect(p.sameAs as string[]).toContain("https://skills.sgomez.dev");
    expect(p.sameAs as string[]).toContain("https://www.linkedin.com/in/sgomez-dev/");
    expect((p.hasCredential as unknown[]).length).toBeGreaterThan(10);
  });
  it("la página tiene idioma, fecha y speakable", () => {
    const page = g["@graph"].find((n) => n["@type"] === "ContactPage")!;
    expect(page.inLanguage).toBe("en");
    expect(page.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}/);
    expect(JSON.stringify(page.speakable)).toContain("[data-answer]");
  });
  it("sin valoraciones inventadas", () => expect(JSON.stringify(g)).not.toMatch(/aggregateRating|"Review"/));
});

describe("un solo grafo por página y por idioma, sin español en el inglés", () => {
  const home = (lang: "es" | "en") =>
    pageGraph({ lang, path: "/", title: "t", description: "d", type: "ProfilePage" }) as { "@graph": Record<string, unknown>[] };
  it("el WebSite declara los dos idiomas", () => {
    const site = home("es")["@graph"].find((n) => n["@type"] === "WebSite")!;
    expect(site.inLanguage).toEqual(["es-ES", "en"]);
  });
  it("la persona en inglés usa la descripción y el cargo ingleses", () => {
    const person = home("en")["@graph"].find((n) => n["@type"] === "Person")!;
    expect(person.description).toBe(IDENTITY_TEXT.description.en);
    expect(person.jobTitle).toContain("Co-founder of SkyQuetz Consulting");
    expect(JSON.stringify(person.jobTitle)).not.toContain("Cofundador");
    expect(person.knowsLanguage).toEqual(["es", "en"]);
  });
  it("la persona en español conserva la descripción y el cargo españoles", () => {
    const person = home("es")["@graph"].find((n) => n["@type"] === "Person")!;
    expect(person.description).toBe(IDENTITY.description);
    expect(person.jobTitle).toContain("Cofundador de SkyQuetz Consulting");
  });
  it("el grafo inglés no arrastra la descripción española de la empresa ni del FAQ", () => {
    const text = JSON.stringify(home("en"));
    expect(text).not.toContain("Consultora tecnológica");
    expect(text).not.toContain("¿Quién es");
    expect(text).toContain("Who is Santiago");
  });
  it("personGraph() sin argumentos es la home española, con las mismas entidades", () => {
    const ids = (personGraph()["@graph"] as Record<string, unknown>[]).map((n) => n["@id"]);
    expect(ids).toContain("https://sgomez.dev/#person");
    expect(ids).toContain("https://sgomez.dev/#skyquetz-org");
    expect(ids).toContain("https://sgomez.dev/#claude-canvas");
  });
});

describe("FAQ de /contact", () => {
  it("sus cuatro preguntas salen del diccionario y sus respuestas dicen cosas ciertas", () => {
    for (const lang of LANGS) {
      const faq = getDictionary(lang).contactFaq;
      expect(Object.keys(faq)).toHaveLength(4);
      const all = Object.values(faq).map((e) => e.q + e.a).join(" ");
      expect(all).toContain(IDENTITY.email);
      expect(all).toMatch(/CET\/CEST/);
      expect(all).toMatch(/Evenbytes/);
      expect(all).toMatch(/SkyQuetz/);
    }
  });
});

describe("metadata", () => {
  it("hreflang recíproco y variante markdown", () => {
    const m = buildMetadata({ lang: "en", path: "/about", title: "t", description: "d" });
    expect(m.alternates?.canonical).toBe("/en/about");
    expect(m.alternates?.languages).toMatchObject({ es: "https://sgomez.dev/about", en: "https://sgomez.dev/en/about" });
    expect((m.alternates?.types as Record<string, string>)["text/markdown"]).toBe("/en/about.md");
  });
  it("un solo esquema de códigos de idioma: es, en y x-default", () => {
    const m = buildMetadata({ lang: "es", path: "/", title: "t", description: "d" });
    expect(Object.keys(m.alternates!.languages as object).sort()).toEqual(["en", "es", "x-default"]);
    expect(m.alternates?.canonical).toBe("/");
    expect((m.alternates?.types as Record<string, string>)["text/markdown"]).toBe("/index.md");
  });
  it("Open Graph por idioma, con la imagen de ese idioma y su alt", () => {
    const en = buildMetadata({ lang: "en", path: "/about", title: "t", description: "d" });
    const es = buildMetadata({ lang: "es", path: "/about", title: "t", description: "d" });
    expect(en.openGraph).toMatchObject({ locale: "en_US", alternateLocale: ["es_ES"] });
    expect(es.openGraph).toMatchObject({ locale: "es_ES", alternateLocale: ["en_US"] });
    const enImage = (en.openGraph!.images as { url: string; alt: string; width: number; height: number }[])[0];
    const esImage = (es.openGraph!.images as { url: string; alt: string }[])[0];
    expect(enImage.url).toBe("/en/opengraph-image");
    expect(esImage.url).toBe("/opengraph-image");
    expect(enImage).toMatchObject({ width: 1200, height: 630 });
    expect(enImage.alt).not.toBe(esImage.alt);
  });
});

describe("enlaces a los ficheros de máquina: HTML y markdown coinciden", () => {
  it("machineHref antepone /en solo a los ficheros con versión inglesa", () => {
    expect(machineHref("/llms.txt", "en")).toBe("/en/llms.txt");
    expect(machineHref("/agents.md", "en")).toBe("/en/agents.md");
    expect(machineHref("/llms.txt", "es")).toBe("/llms.txt");
    expect(machineHref("/openapi.json", "en")).toBe("/openapi.json");
  });
  for (const lang of LANGS) {
    it(`el 404 en ${lang}: cada enlace del HTML está en el markdown`, () => {
      const html = renderToStaticMarkup(NotFoundBody({ lang }));
      const markdown = notFoundMarkdown(undefined, lang);
      for (const route of MACHINE_ROUTES) {
        const href = machineHref(route.path, lang);
        expect(html, `${lang} html ${href}`).toContain(`href="${href}"`);
        expect(markdown, `${lang} md ${href}`).toContain(`(${absolute(href)})`);
      }
    });
    it(`la home en ${lang} enlaza los mismos ficheros`, () => {
      const markdown = markdownForPath(lang === "es" ? "/" : "/en")!;
      for (const route of MACHINE_ROUTES) expect(markdown).toContain(`(${absolute(machineHref(route.path, lang))})`);
    });
  }
});

describe("llms-full.txt", () => {
  it("existe en los dos idiomas y cabe en 300 KB", async () => {
    const { GET: es } = await import("@/app/llms-full.txt/route");
    const { GET: en } = await import("@/app/[lang]/llms-full.txt/route");
    for (const res of [es(), en()]) {
      const text = await res.text();
      expect(res.headers.get("content-type")).toBe("text/markdown; charset=utf-8");
      expect(Buffer.byteLength(text)).toBeLessThan(300 * 1024);
      expect(text).toContain("Santiago Gómez de la Torre");
    }
    expect(await es().text()).toContain("# Sobre Santiago Gómez de la Torre Romero");
    expect(await en().text()).toContain("# About Santiago Gómez de la Torre Romero");
  });
});

describe("robots.txt", () => {
  const robots = read("public/robots.txt");
  it("Content-Signal y sin Host", () => {
    expect(robots).toMatch(/^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/m);
    expect(robots).not.toMatch(/^Host:/m);
  });
  it("el Content-Signal está justo bajo User-agent: *", () => {
    expect(robots).toContain("User-agent: *\nAllow: /\nContent-Signal: search=yes, ai-input=yes, ai-train=yes\n");
  });
  it("bots nuevos permitidos", () => {
    for (const bot of ["DuckAssistBot", "MistralAI-User", "GPTBot", "ClaudeBot", "PerplexityBot"]) expect(robots).toMatch(new RegExp(`^User-agent: ${bot}$`, "m"));
  });
  it("anuncia las dos llms.txt y llms-full.txt", () => {
    for (const p of ["/en/llms.txt", "/llms-full.txt"]) expect(robots).toContain(`https://sgomez.dev${p}`);
  });
});
