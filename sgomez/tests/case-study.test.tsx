import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CaseStudy from "@/chapters/CaseStudy";
import Projects from "@/chapters/Projects";
import sitemap from "@/app/sitemap";
import { generateMetadata, generateStaticParams } from "@/app/[lang]/work/[slug]/page";
import { generateStaticParams as ogStaticParams } from "@/app/[lang]/work/[slug]/opengraph-image";
import { CLAUDE_CANVAS } from "@/app/seo";
import { projects, type ProjectContent } from "@/app/content";
import { LANGS, type Lang } from "@/i18n/languages";
import { getDictionary } from "@/i18n";
import { hardPercent } from "@/lib/content/localized";
import { buildCaseStudies, getCaseStudies, getCaseStudy, getProjects } from "@/lib/api/data";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { llmsFullTxt } from "@/lib/machine/llms-full";
import { MARKDOWN_PATHS, markdownForPath } from "@/lib/markdown/documents";
import { decide } from "@/lib/markdown/routing";
import { caseRoutes, caseSlugs } from "@/lib/routing/cases";
import { isUnknownHtmlPath } from "@/lib/routing/request";
import { caseStudyGraph } from "@/lib/seo/jsonld";
import { absolute } from "@/lib/site";

type Node = Record<string, unknown>;
const nodes = (graph: Record<string, unknown>) => graph["@graph"] as Node[];
const typeOf = (node: Node) => ([] as unknown[]).concat(node["@type"]);

/** Proyecto de prueba: la infraestructura no depende de que un proyecto real tenga o no caso. */
const full = { problem: { es: "Problema.", en: "Problem." }, role: { es: "Rol.", en: "Role." }, outcome: { es: "Resultado.", en: "Outcome." }, updated: "2026-03-04" };
const fixture = (over: Partial<ProjectContent> = {}): ProjectContent => ({
  title: "Fixture App",
  desc: { es: "Descripción", en: "Description" },
  stack: "TypeScript, React",
  link: "https://fixture.example",
  caseStudy: full,
  ...over,
});

describe("casos de estudio: qué se publica", () => {
  it("un proyecto con los tres textos en los dos idiomas se publica, con su fecha", () => {
    const [study] = buildCaseStudies([fixture()], "en");
    expect(study).toMatchObject({ slug: "fixture-app", problem: "Problem.", role: "Role.", outcome: "Outcome.", updated: "2026-03-04", path: "/en/work/fixture-app" });
    expect(study!.stack).toEqual(["TypeScript", "React"]);
    expect(buildCaseStudies([fixture()], "es")[0]!.path).toBe("/work/fixture-app");
  });

  it("sin caso, con un texto vacío, sin un idioma o con una fecha rara no se publica nada", () => {
    expect(buildCaseStudies([fixture({ caseStudy: undefined })])).toEqual([]);
    expect(buildCaseStudies([fixture({ caseStudy: { ...full, role: { es: "Rol.", en: "  " } } })])).toEqual([]);
    expect(buildCaseStudies([fixture({ caseStudy: { ...full, outcome: { es: "", en: "Outcome." } } })])).toEqual([]);
    expect(buildCaseStudies([fixture({ caseStudy: { ...full, updated: "ayer" } })])).toEqual([]);
  });

  it("los proyectos reales con caso son Claude Canvas, NudaUI Semantic Search y NudaUI, con la misma lista en los dos idiomas", () => {
    expect(caseSlugs()).toEqual(["claude-canvas", "nudaui-semantic-search-rag", "nudaui"]);
    expect(getCaseStudies("en").map((c) => c.slug)).toEqual(getCaseStudies("es").map((c) => c.slug));
    expect(getProjects("es").filter((p) => !caseSlugs().includes(p.slug)).length).toBeGreaterThan(0);
    for (const lang of LANGS) {
      for (const c of getCaseStudies(lang)) {
        expect(c.updated).toBe("2026-10-02");
        for (const text of [c.problem, c.role, c.outcome]) expect(text.length).toBeGreaterThan(60);
      }
    }
  });

  it("los textos aprobados por el dueño están tal cual", () => {
    expect(getCaseStudy("claude-canvas", "es")!.outcome).toContain("los bloques de cuadrante dan un 61 % menos de error que los de media celda");
    expect(getCaseStudy("claude-canvas", "en")!.role).toContain("nine canvas types (picker, form, table, image, diff, dashboard, calendar, document and flight)");
    expect(getCaseStudy("nudaui-semantic-search-rag", "es")!.problem).toContain("«un loader con puntos» no llevaba a «Pulse Dots»");
    expect(getCaseStudy("nudaui-semantic-search-rag", "en")!.outcome).toContain("hit@1 from 66.7% to 80%");
    expect(getCaseStudy("nudaui", "es")!.outcome).toContain("1.503 componentes en 81 categorías");
    expect(getCaseStudy("nudaui", "en")!.problem).toContain("Laravel, Django, Rails or plain HTML");
  });

  it("la fuente de cada caso es la URL indicada", () => {
    expect(getCaseStudy("claude-canvas")!.url).toBe("https://claude-canvas.sgomez.dev");
    expect(getCaseStudy("nudaui-semantic-search-rag")!.url).toBe("https://blog.sgomez.dev/rag-busqueda-semantica-nudaui");
    expect(getCaseStudy("nudaui")!.url).toBe("https://nudaui.dev");
  });

  it("generateStaticParams devuelve solo los publicados, en los dos idiomas, y el OG igual", () => {
    expect(generateStaticParams()).toHaveLength(LANGS.length * 3);
    expect(ogStaticParams()).toEqual(generateStaticParams());
    expect(generateStaticParams().map((p) => p.slug).sort()).toEqual([...new Set(caseSlugs())].sort().flatMap((s) => [s, s]));
  });
});

describe("NudaUI pasa a más de 1.500 componentes sin tocar el RAG", () => {
  it("la ficha de NudaUI de la home lo dice en los dos idiomas", () => {
    const nudaui = projects.find((p) => p.title === "NudaUI")!;
    expect(nudaui.desc.es).toContain("más de 1.500 componentes");
    expect(nudaui.desc.en).toContain("more than 1,500");
    expect(nudaui.desc.es + nudaui.desc.en).not.toMatch(/1\.000|1,000/);
  });
  it("la ficha del RAG conserva su 1.000+ (el artículo es de cuando eran 1.022)", () => {
    const rag = projects.find((p) => p.title === "NudaUI Semantic Search (RAG)")!;
    expect(rag.desc.es).toContain("1.000+");
    expect(rag.desc.en).toContain("1,000+");
  });
});

describe("enrutado de los casos", () => {
  it.each([
    ["/work/claude-canvas", false], ["/en/work/nudaui", false], ["/work/nudaui-semantic-search-rag/", false],
    ["/work/claude-canvas/opengraph-image", false], ["/en/work/nudaui/opengraph-image", false],
    ["/work/no-existe", true], ["/en/work/no-existe", true], ["/work", true], ["/en/work", true],
    ["/work/no-existe/opengraph-image", true], ["/work/claude-canvas/otra", true], ["/work/claude-canvas.md", false],
  ])("%s, desconocida: %s", (path, unknown) => expect(isUnknownHtmlPath(path)).toBe(unknown));

  it("la variante .md de un caso es markdown con noindex y un slug sin caso no tiene markdown", () => {
    expect(decide("/work/claude-canvas.md", null, false)).toEqual({ kind: "markdown", path: "/work/claude-canvas", canonical: "/work/claude-canvas", indexable: false });
    expect(decide("/en/work/nudaui.md", null, false)).toMatchObject({ kind: "markdown", path: "/en/work/nudaui", indexable: false });
    expect(decide("/work/nudaui", "text/markdown", false)).toMatchObject({ kind: "markdown", indexable: true });
    expect(markdownForPath("/work/no-existe")).toBeUndefined();
    expect(markdownForPath("/en/work/no-existe")).toBeUndefined();
  });

  it("cada caso, en cada idioma, tiene su markdown con sus tres textos y su fecha", () => {
    for (const route of caseRoutes()) {
      expect(MARKDOWN_PATHS).toContain(route.path);
      const study = getCaseStudy(route.slug, route.lang)!;
      const md = markdownForPath(route.path)!;
      expect(md).toContain(`Canonical URL: ${absolute(route.path)}`);
      for (const text of [study.problem, study.role, study.outcome]) expect(md).toContain(text);
      expect(md).toContain(study.updated);
      expect(md).toContain(`(${study.url})`);
    }
  });
});

describe("sitemap", () => {
  const entries = sitemap();
  it("cada caso aparece en los dos idiomas con el lastmod de su `updated` y los hreflang recíprocos", () => {
    for (const route of caseRoutes()) {
      const entry = entries.find((e) => e.url === absolute(route.path));
      expect(entry, route.path).toBeDefined();
      expect(entry!.lastModified).toEqual(new Date(route.updated));
      expect(entry!.alternates?.languages).toEqual({
        es: absolute(`/work/${route.slug}`),
        en: absolute(`/en/work/${route.slug}`),
        "x-default": absolute(`/work/${route.slug}`),
      });
    }
    expect(entries.filter((e) => e.url.includes("/work/"))).toHaveLength(6);
  });
});

describe("grafo JSON-LD del caso", () => {
  for (const lang of LANGS) {
    it(`Claude Canvas (${lang}) es un SoftwareSourceCode con author hacia #person y conserva el isBasedOn del original`, () => {
      const study = getCaseStudy("claude-canvas", lang)!;
      const graph = nodes(caseStudyGraph(study, lang));
      const code = graph.find((n) => typeOf(n).includes("SoftwareSourceCode") && n["@id"] === `${absolute(study.path)}#case`)!;
      expect(code).toBeDefined();
      expect(code.author).toEqual({ "@id": "https://sgomez.dev/#person" });
      expect(code.codeRepository).toBe(CLAUDE_CANVAS.repo);
      expect(code.dateModified).toBe("2026-10-02");
      expect(code.isBasedOn).toMatchObject({ "@type": "SoftwareSourceCode", url: CLAUDE_CANVAS.basedOn, author: { name: CLAUDE_CANVAS.basedOnAuthor } });
      const page = graph.find((n) => n["@id"] === `${absolute(study.path)}#webpage`)!;
      expect(page).toMatchObject({ "@type": "WebPage", dateModified: "2026-10-02", mainEntity: { "@id": code["@id"] } });
      // la persona sigue en el grafo, así que el `author` no cuelga
      expect(graph.some((n) => n["@id"] === "https://sgomez.dev/#person")).toBe(true);
    });
  }

  it("los tres casos reales llevan repositorio, así que son SoftwareSourceCode, y solo Canvas tiene isBasedOn", () => {
    for (const slug of caseSlugs()) {
      const study = getCaseStudy(slug, "es")!;
      const code = nodes(caseStudyGraph(study, "es")).find((n) => n["@id"] === `${absolute(study.path)}#case`)!;
      expect(code["@type"]).toBe("SoftwareSourceCode");
      expect(code.about).toBeDefined();
      expect("isBasedOn" in code).toBe(slug === "claude-canvas");
    }
  });

  it("sin repositorio es un CreativeWork, también con author hacia #person", () => {
    const [study] = buildCaseStudies([fixture()], "es");
    const code = nodes(caseStudyGraph(study!, "es")).find((n) => n["@id"] === `${absolute(study!.path)}#case`)!;
    expect(code["@type"]).toBe("CreativeWork");
    expect(code.author).toEqual({ "@id": "https://sgomez.dev/#person" });
    expect("codeRepository" in code).toBe(false);
    expect("isBasedOn" in code).toBe(false);
    expect(code.dateModified).toBe("2026-03-04");
  });

  it("las migas son Inicio, Proyectos y el caso, con URLs absolutas", () => {
    const study = getCaseStudy("nudaui", "en")!;
    const crumbs = nodes(caseStudyGraph(study, "en")).find((n) => typeOf(n).includes("BreadcrumbList"))!.itemListElement as Node[];
    expect(crumbs.map((c) => c.item)).toEqual(["https://sgomez.dev/en", "https://sgomez.dev/en#work", "https://sgomez.dev/en/work/nudaui"]);
    expect(crumbs.map((c) => c.position)).toEqual([1, 2, 3]);
  });
});

describe("metadatos del caso", () => {
  for (const lang of LANGS) {
    it(`canónica, hreflang, variante .md y Open Graph propia en ${lang}`, async () => {
      const meta = await generateMetadata({ params: Promise.resolve({ lang, slug: "claude-canvas" }) });
      const path = lang === "es" ? "/work/claude-canvas" : "/en/work/claude-canvas";
      expect(meta.alternates?.canonical).toBe(path);
      expect(meta.alternates?.languages).toEqual({
        es: "https://sgomez.dev/work/claude-canvas",
        en: "https://sgomez.dev/en/work/claude-canvas",
        "x-default": "https://sgomez.dev/work/claude-canvas",
      });
      expect(meta.alternates?.types).toEqual({ "text/markdown": `${path}.md` });
      const image = (meta.openGraph?.images as { url: string; alt: string; width: number; height: number }[])[0]!;
      expect(image).toMatchObject({ url: `${path}/opengraph-image`, width: 1200, height: 630 });
      expect(image.alt).toBe(lang === "es" ? "Caso de estudio de Claude Canvas, por Santiago Gómez de la Torre" : "Case study of Claude Canvas, by Santiago Gómez de la Torre");
      expect(meta.twitter?.images).toEqual([{ url: image.url, alt: image.alt }]);
    });
  }

  it("un slug sin caso no genera metadatos (404)", async () => {
    await expect(generateMetadata({ params: Promise.resolve({ lang: "es", slug: "geeklab" }) })).rejects.toThrow();
  });
});

describe("la página del caso", () => {
  const render = (slug: string, lang: Lang) => renderToStaticMarkup(<CaseStudy lang={lang} study={getCaseStudy(slug, lang)!} />);

  for (const lang of LANGS) {
    it(`lleva respuesta, problema, rol, stack, resultado, enlaces y <time datetime> visible en ${lang}`, () => {
      const study = getCaseStudy("claude-canvas", lang)!;
      const html = render("claude-canvas", lang);
      const d = getDictionary(lang).caseStudy;
      expect(html).toMatch(/<h1[^>]*>Claude Canvas<\/h1>/);
      expect(html).toContain("data-answer");
      for (const heading of [d.problem, d.role, d.stack, d.outcome, d.links]) expect(html).toContain(`>${heading}</h2>`);
      for (const text of [study.problem, study.role, study.outcome]) expect(html).toContain(hardPercent(text).replace(/'/g, "&#x27;"));
      expect(html).toContain('<time dateTime="2026-10-02">');
      expect(html).toMatch(/<time[^>]*>[^<]*2026[^<]*<\/time>/);
      expect(html).toContain(`href="https://claude-canvas.sgomez.dev"`);
      expect(html).toContain(`>${d.source}</a>`);
      expect(html).toContain('application/ld+json');
      expect(html).toContain(`href="${study.path}.md"`);
    });
  }

  it("enlaza el stack y el proyecto de código abierto relacionado, y a los otros casos", () => {
    const html = render("nudaui-semantic-search-rag", "es");
    expect(html).toContain("RAG");
    expect(html).toContain("https://github.com/sgomez-dev/nudaui-rag");
    expect(html).toContain('href="/work/nudaui"');
    expect(html).toContain('href="/work/claude-canvas"');
    expect(html).toContain('href="/#work"');
  });

  it("Claude Canvas enlaza el original del que es fork", () => {
    expect(render("claude-canvas", "en")).toContain(`href="${CLAUDE_CANVAS.basedOn}"`);
  });

  it("el HTML no anida enlaces", () => {
    for (const lang of LANGS) for (const slug of caseSlugs()) expect(render(slug, lang)).not.toMatch(/<a [^>]*>(?:(?!<\/a>)[\s\S])*<a /);
  });
});

describe("la ficha de la home enlaza al caso sin anidar enlaces", () => {
  for (const lang of LANGS) {
    it(`en ${lang}`, () => {
      const html = renderToStaticMarkup(<Projects lang={lang} />);
      for (const study of getCaseStudies(lang)) {
        // enlace interno visible, aparte de la ficha externa
        expect(html).toContain(`data-case-link="${study.slug}"`);
        expect(html).toContain(`href="${study.path}"`);
        expect(html).toContain(`href="${study.url}"`);
      }
      expect(html).not.toMatch(/<a [^>]*>(?:(?!<\/a>)[\s\S])*<a /);
      // un proyecto sin caso no recibe enlace
      expect(html.match(/data-case-link=/g)).toHaveLength(3);
    });
  }
});

describe("cada caso recibe al menos tres enlaces internos", () => {
  for (const lang of LANGS) {
    for (const study of getCaseStudies(lang)) {
      it(`${study.path}`, () => {
        const url = absolute(study.path);
        const sources: [string, boolean][] = [
          ["la ficha de la home", renderToStaticMarkup(<Projects lang={lang} />).includes(`href="${study.path}"`)],
          ["llms.txt", llmsTxt(lang).includes(`](${url})`)],
          ["llms-full.txt", llmsFullTxt(lang).includes(`Canonical URL: ${url}`)],
          ["el sitemap", sitemap().some((e) => e.url === url)],
          ["la home en markdown", (markdownForPath(lang === "es" ? "/" : "/en") ?? "").includes(url)],
        ];
        const reached = sources.filter(([, ok]) => ok).map(([name]) => name);
        expect(sources.filter(([, ok]) => !ok).map(([name]) => name)).toEqual([]);
        expect(reached.length).toBeGreaterThanOrEqual(3);
      });
    }
  }
});

describe("sin rayas ni dos puntos retóricos en el texto de los casos", () => {
  const DASHES = /—|–| -- /;
  for (const lang of LANGS) {
    it(lang, () => {
      const study = getCaseStudies(lang);
      const text = JSON.stringify([study, getDictionary(lang).caseStudy, ...study.map((s) => caseStudyGraph(s, lang)), ...caseRoutes(lang).map((r) => markdownForPath(r.path))]);
      expect(DASHES.test(text)).toBe(false);
      // dos puntos rematando una frase del copy del caso (no los de «Canonical URL:» ni los de las URL)
      for (const s of study) for (const t of [s.problem, s.role, s.outcome]) expect(t).not.toMatch(/:\s*$/);
    });
  }
});

describe("espacio duro antes de «%»", () => {
  const NBSP = " ";
  it("hardPercent solo toca «cifra espacio %»", async () => {
    const { hardPercent } = await import("@/lib/content/localized");
    expect(hardPercent("del 66,7 % al 80 %")).toBe(`del 66,7${NBSP}% al 80${NBSP}%`);
    expect(hardPercent("from 66.7% to 80%")).toBe("from 66.7% to 80%");
    expect(hardPercent("100 % remoto y un % suelto")).toBe(`100${NBSP}% remoto y un % suelto`);
  });
  it("las páginas de los casos pintan el % pegado a la cifra, en ES y EN, sin tocar los datos", () => {
    for (const lang of ["es", "en"] as const) {
      for (const study of getCaseStudies(lang)) {
        const html = renderToStaticMarkup(<CaseStudy lang={lang} study={study} />);
        expect(html, `${lang} ${study.slug}`).not.toMatch(/\d %/);
      }
    }
    const nuda = getCaseStudy("nudaui-semantic-search-rag", "es")!;
    expect(nuda.outcome).toMatch(/\d %/);
    expect(renderToStaticMarkup(<CaseStudy lang="es" study={nuda} />)).toContain(`80${NBSP}%`);
  });
});
