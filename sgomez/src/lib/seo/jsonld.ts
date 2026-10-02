import { certifications } from "@/app/content";
import { IDENTITY, personGraph, type GraphFaq, type GraphPageType } from "@/app/seo";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import { fill } from "@/i18n/fill";
import type { CaseStudy } from "@/lib/api/data";
import type { StaticPage } from "@/lib/content/pages";
import { absolute } from "@/lib/site";

/**
 * JSON-LD para un `<script type="application/ld+json">`.
 *
 * `JSON.stringify` no escapa `<`, así que un texto con `</script>` cerraría la
 * etiqueta y dejaría el resto como HTML. Se escapan también `>` y `&` (por si
 * el JSON acaba en un contexto que los interprete) y U+2028/U+2029, que son
 * saltos de línea válidos en JSON pero no en JavaScript.
 *
 * OJO con las barras: el reemplazo tiene que ser la secuencia LITERAL de seis
 * caracteres `<`, es decir `"\\u003c"` en el fuente. Escribir `"<"`
 * es el propio `<` y el reemplazo no hace nada.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/**
 * Una credencial por cada certificación real del sitio (`certifications` de
 * `app/content`, la misma lista que se ve en la página). No se inventa ninguna y
 * no hay valoraciones: solo lo que tiene un documento detrás.
 */
function credentials(): Record<string, unknown>[] {
  return certifications.map((c) => ({
    "@type": "EducationalOccupationalCredential",
    name: c.title,
    recognizedBy: { "@type": "Organization", name: c.institution },
    url: c.url,
  }));
}

export type PageGraphOptions = {
  lang: Lang;
  /** Ruta lógica sin idioma: "/", "/about", "/contact"… */
  path: string;
  title: string;
  description: string;
  type: GraphPageType;
  faq?: GraphFaq[];
};

/**
 * El ÚNICO `@graph` de una página: las entidades (persona, empresa, proyectos),
 * el sitio, la página y, si la hay, su FAQ. Cada página lo renderiza una vez; el
 * layout ya no pinta uno global, porque dos grafos por página duplicaban la
 * persona y el sitio.
 */
export function pageGraph(options: PageGraphOptions): Record<string, unknown> {
  const { lang, path, title, description, type, faq } = options;
  const graph = personGraph(lang, { path, title, description, type, faq });
  const nodes = (graph["@graph"] as Record<string, unknown>[]).map((node) =>
    node["@type"] === "Person" ? { ...node, hasCredential: credentials() } : node,
  );
  return { ...graph, "@graph": nodes };
}

/** Grafo de una página estática (/about, /contact, /developers, /privacy). */
export function staticPageGraph(page: StaticPage): Record<string, unknown> {
  const type: GraphPageType = page.slug === "about" ? "AboutPage" : page.slug === "contact" ? "ContactPage" : "WebPage";
  const faq =
    page.slug === "contact"
      ? Object.values(getDictionary(page.lang).contactFaq).map((entry) => ({ q: entry.q, a: entry.a }))
      : undefined;
  return pageGraph({ lang: page.lang, path: `/${page.slug}`, title: page.title, description: page.description, type, faq });
}

/** `@id` de la persona, el mismo que usa todo el grafo. */
const PERSON = `${IDENTITY.url}/#person`;

/** El nodo del proyecto que ya existe en el grafo de la persona, por slug del caso. */
const PROJECT_NODES: Record<string, string> = {
  "claude-canvas": "claude-canvas",
  "nudaui-semantic-search-rag": "nudaui-rag",
  nudaui: "nudaui",
};

/**
 * Grafo de un caso de estudio: las entidades de siempre más la página (`WebPage`, con las migas Inicio, Proyectos y el
 * caso) y el caso en sí como nodo propio. Es un `SoftwareSourceCode` si el proyecto tiene repositorio y un `CreativeWork`
 * si no, siempre con `author` hacia `#person`. Si el proyecto es un fork (Claude Canvas) conserva su `isBasedOn`.
 * `dateModified` es el `updated` del caso, nunca la fecha del build.
 */
export function caseStudyGraph(study: CaseStudy, lang: Lang): Record<string, unknown> {
  const d = getDictionary(lang).caseStudy;
  const logical = `/work/${study.slug}`;
  const pageUrl = absolute(localizedPath(lang, logical));
  const home = localizedPath(lang, "/");
  const workHref = home === "/" ? "/#work" : `${home}#work`;
  const title = fill(d.title, { title: study.title });
  const caseId = `${pageUrl}#case`;
  const projectNode = PROJECT_NODES[study.slug];
  const caseNode: Record<string, unknown> = {
    "@type": study.repo ? "SoftwareSourceCode" : "CreativeWork",
    "@id": caseId,
    name: title,
    headline: title,
    url: pageUrl,
    description: study.description,
    abstract: study.problem,
    keywords: study.stack,
    inLanguage: lang === "es" ? "es-ES" : "en",
    dateModified: study.updated,
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
    sameAs: [study.url],
    ...(study.repo ? { codeRepository: study.repo } : {}),
    ...(projectNode ? { about: { "@id": `${IDENTITY.url}/#${projectNode}` } } : {}),
    ...(study.based_on
      ? {
          isBasedOn: {
            "@type": "SoftwareSourceCode",
            name: study.based_on.name,
            url: study.based_on.url,
            codeRepository: study.based_on.url,
            author: { "@type": "Person", name: study.based_on.author },
          },
        }
      : {}),
    author: { "@id": PERSON },
    creator: { "@id": PERSON },
    isPartOf: { "@id": `${IDENTITY.url}/#website` },
  };
  const graph = personGraph(lang, {
    path: logical,
    title,
    description: fill(d.description, { title: study.title }),
    type: "WebPage",
    dateModified: study.updated,
    trail: [{ name: lang === "es" ? "Proyectos" : "Projects", item: absolute(workHref) }],
    mainEntityId: caseId,
    extraNodes: [caseNode],
  });
  const nodes = (graph["@graph"] as Record<string, unknown>[]).map((node) =>
    node["@type"] === "Person" ? { ...node, hasCredential: credentials() } : node,
  );
  return { ...graph, "@graph": nodes };
}
