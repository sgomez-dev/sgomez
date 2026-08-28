/**
 * Constantes canónicas del sitio y catálogo de rutas.
 *
 * Un único sitio de verdad para: el sitemap, el cuerpo del 404, la
 * negociación de contenido de `middleware.ts`, /llms.txt, /agents.md y el
 * portal de /developers. Antes cada superficie repetía su propia lista de
 * URLs y bastaba añadir una página para que unas la anunciaran y otras no.
 */

export const SITE_URL = "https://sgomez.dev";

/** Versión de la API pública. Va en la URL, no en un header. */
export const API_VERSION = "1.0.0";

/** Prefijo de todos los endpoints de datos. */
export const API_BASE = "/api/v1";

/** Rutas HTML del sitio. `changeFrequency`/`priority` los consume el sitemap. */
export const HTML_ROUTES = [
  { path: "/", title: "Inicio", changeFrequency: "weekly", priority: 1 },
  { path: "/about", title: "Sobre mí", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", title: "Contacto", changeFrequency: "monthly", priority: 0.8 },
  { path: "/developers", title: "Portal para desarrolladores y agentes", changeFrequency: "weekly", priority: 0.8 },
  { path: "/privacy", title: "Privacidad", changeFrequency: "yearly", priority: 0.4 },
  { path: "/lab", title: "Lab", changeFrequency: "monthly", priority: 0.6 },
] as const;

/**
 * Ficheros legibles por máquina. `markdown: true` marca los que ya se sirven
 * como texto plano/markdown y por tanto NO pasan por la negociación de
 * contenido: pedirles `Accept: text/markdown` ya devuelve markdown.
 */
export const MACHINE_ROUTES = [
  {
    path: "/llms.txt",
    title: "llms.txt",
    description: "Resumen factual del sitio, con la sección de cuándo usarlo.",
    type: "text/markdown",
    markdown: true,
  },
  {
    path: "/agents.md",
    title: "agents.md",
    description: "Instrucciones para agentes: cuándo venir aquí y cómo llamar al sitio.",
    type: "text/markdown",
    markdown: true,
  },
  {
    path: "/openapi.json",
    title: "openapi.json",
    description: "Especificación OpenAPI 3.1 de la API pública.",
    type: "application/json",
    markdown: false,
  },
  {
    path: "/api/openapi.yaml",
    title: "openapi.yaml",
    description: "La misma especificación, en YAML.",
    type: "application/yaml",
    markdown: false,
  },
  {
    path: "/sitemap.xml",
    title: "sitemap.xml",
    description: "Todas las URLs publicadas.",
    type: "application/xml",
    markdown: false,
  },
  {
    path: "/robots.txt",
    title: "robots.txt",
    description: "Reglas de rastreo. Los crawlers de IA están permitidos por nombre.",
    type: "text/plain",
    markdown: false,
  },
  {
    path: "/manifest.webmanifest",
    title: "manifest.webmanifest",
    description: "Manifiesto de la aplicación web.",
    type: "application/manifest+json",
    markdown: false,
  },
] as const;

export type HtmlRoute = (typeof HTML_ROUTES)[number];
export type MachineRoute = (typeof MACHINE_ROUTES)[number];

/**
 * Vary de las páginas HTML.
 *
 * Lleva `Accept` porque la misma URL sirve HTML o markdown según lo que pida
 * el cliente, y sin declararlo una CDN puede darle a un agente la variante
 * HTML que guardó para un navegador. Y lleva los cuatro tokens de RSC porque
 * Next varía por ellos para la navegación de cliente: publicar solo `Accept`
 * arreglaría la negociación y rompería el prefetch.
 *
 * OJO: Next 16 sobreescribe la cabecera `Vary` de las respuestas de página al
 * final del pipeline, así que ni el proxy ni `headers()` de next.config
 * bastan por sí solos; el valor que llega al cliente lo fija la capa de
 * hosting (`vercel.json`). Los tres sitios declaran ESTE mismo valor para que
 * gane quien gane, no se pierda ninguno de los dos motivos.
 */
export const PAGE_VARY =
  "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Accept, Accept-Encoding";

/** Vary de las respuestas markdown y de la API, que no varían por RSC. */
export const CONTENT_VARY = "Accept, Accept-Encoding";

/** URL absoluta a partir de una ruta relativa. */
export function absolute(path: string): string {
  return path.startsWith("http") ? path : `${SITE_URL}${path}`;
}

/**
 * Rutas que el middleware no debe tocar nunca: o ya son markdown, o son
 * ficheros con su propio Content-Type que un agente no debe recibir
 * reescrito.
 */
export const NEGOTIATION_EXEMPT_PATHS: readonly string[] = MACHINE_ROUTES.map(
  (route) => route.path,
);
