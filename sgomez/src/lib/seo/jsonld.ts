import { certifications } from "@/app/content";
import { personGraph, type GraphFaq, type GraphPageType } from "@/app/seo";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import type { StaticPage } from "@/lib/content/pages";

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
