import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import About from "@/chapters/About";
import Build from "@/chapters/Build";
import Experience from "@/chapters/Experience";
import Projects from "@/chapters/Projects";
import OpenSource from "@/chapters/OpenSource";
import SkyQuetz from "@/chapters/SkyQuetz";
import Forgia from "@/chapters/Forgia";
import Proof from "@/chapters/Proof";
import Contact from "@/chapters/Contact";
import SiteMap from "@/chapters/lost/SiteMap";
import { personGraph } from "@/app/seo";
import { LANGS } from "@/i18n/languages";
import { getDictionary } from "@/i18n";
import { pageGraph, staticPageGraph } from "@/lib/seo/jsonld";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { llmsFullTxt } from "@/lib/machine/llms-full";
import { agentsMd } from "@/lib/machine/agents-md";
import { MARKDOWN_PATHS, markdownForPath, notFoundMarkdown } from "@/lib/markdown/documents";
import { staticPages } from "@/lib/content/pages";
import { getAbout, getExperience, getProfile, getProjects, getSkills, getCertifications, getEducation } from "@/lib/api/data";
import manifest from "@/app/manifest";
import { openApiDocument } from "@/lib/api/openapi";
import { SITE_NAME, buildMetadata } from "@/lib/seo/metadata";

/**
 * Estilo de texto: nada de raya (—), semirraya (–) ni doble guion (--) en ningún
 * texto que lea una persona o un agente. Las citas de las recomendaciones son
 * palabras de sus autores y se excluyen: ni `comment`/`commentEn` en los datos ni
 * los `<blockquote>` en el HTML.
 */
const DASHES = /—|–| -- /;
const QUOTE_KEYS = new Set(["comment", "commentEn", "reviewBody"]);

function serialize(value: unknown): string {
  return JSON.stringify(value, (key, v) => (QUOTE_KEYS.has(key) ? undefined : v));
}

function expectNoDashes(label: string, text: string) {
  const match = DASHES.exec(text);
  const where = match ? text.slice(Math.max(0, match.index - 60), match.index + 60).replace(/\n/g, " ") : "";
  expect(match, `${label}: «…${where}…»`).toBeNull();
}

const stripQuotes = (html: string) => html.replace(/<blockquote[\s\S]*?<\/blockquote>/g, "");

describe("A2: sin rayas ni dobles guiones en el texto", () => {
  it("el detector detecta lo que busca", () => {
    for (const bad of ["a — b", "a – b", "a -- b"]) expect(() => expectNoDashes("x", bad)).toThrow();
    expect(() => expectNoDashes("x", "full-stack, 2021-2026 y --flag")).not.toThrow();
  });

  for (const lang of LANGS) {
    describe(lang, () => {
      it("diccionario", () => expectNoDashes("diccionario", serialize(getDictionary(lang))));

      it("grafos JSON-LD: persona y cada tipo de página", () => {
        expectNoDashes("personGraph", serialize(personGraph(lang)));
        for (const type of ["ProfilePage", "WebPage", "ContactPage", "AboutPage"] as const) {
          expectNoDashes(`pageGraph ${type}`, serialize(pageGraph({ lang, path: "/", title: "t", description: "d", type })));
        }
        for (const page of staticPages(lang)) expectNoDashes(`staticPageGraph ${page.path}`, serialize(staticPageGraph(page)));
      });

      it("ficheros de máquina", () => {
        expectNoDashes("llms.txt", llmsTxt(lang));
        expectNoDashes("llms-full.txt", llmsFullTxt(lang));
        expectNoDashes("agents.md", agentsMd(lang));
      });

      it("páginas estáticas (título, descripción, secciones)", () => {
        for (const page of staticPages(lang)) expectNoDashes(`staticPages ${page.path}`, serialize(page));
      });

      it("datos de la API", () => {
        expectNoDashes("getProjects", serialize(getProjects(lang)));
        expectNoDashes("getExperience", serialize(getExperience(lang)));
        expectNoDashes("getAbout", serialize(getAbout(lang)));
        expectNoDashes("getProfile", serialize(getProfile(lang)));
        expectNoDashes("getSkills", serialize(getSkills(lang)));
        expectNoDashes("getCertifications", serialize(getCertifications(lang)));
        expectNoDashes("getEducation", serialize(getEducation(lang)));
      });

      it("metadatos de página", () => {
        for (const page of staticPages(lang)) {
          expectNoDashes(`metadata ${page.path}`, serialize(buildMetadata({ lang, path: `/${page.slug}`, title: page.metaTitle, description: page.description })));
        }
      });

      it("capítulos de la home en HTML (sin las citas de recomendaciones)", () => {
        const html = renderToStaticMarkup(
          <>
            <Hero lang={lang} />
            <About lang={lang} />
            <Build lang={lang} />
            <Experience lang={lang} />
            <Projects lang={lang} />
            <OpenSource lang={lang} />
            <SkyQuetz lang={lang} />
            <Forgia lang={lang} />
            <Proof lang={lang} />
            <Contact lang={lang} />
          </>,
        );
        expectNoDashes("home html", stripQuotes(html));
      });

      it("404 en HTML y en markdown", () => {
        expectNoDashes("404 html", renderToStaticMarkup(<SiteMap lang={lang} />));
        expectNoDashes("404 markdown", notFoundMarkdown("/no-existe", lang));
        expectNoDashes("404 markdown sin ruta", notFoundMarkdown(undefined, lang));
      });
    });
  }

  it("el markdown de cada ruta", () => {
    expect(MARKDOWN_PATHS.length).toBeGreaterThanOrEqual(10);
    for (const path of MARKDOWN_PATHS) expectNoDashes(`markdown ${path}`, markdownForPath(path)!);
  });

  it("manifiesto, OpenAPI y nombre del sitio", () => {
    expectNoDashes("manifest", serialize(manifest()));
    expectNoDashes("openapi", serialize(openApiDocument()));
    expectNoDashes("SITE_NAME", SITE_NAME);
  });
});
