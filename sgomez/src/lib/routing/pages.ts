import { LANGS, localizedPath, type Lang } from "@/i18n/languages";
import { LOCALIZED_MACHINE_PATHS } from "@/lib/site";
// Fecha real del último cambio de contenido, desde git: la escribe scripts/content-dates.mjs y el CI comprueba que está al día.
import CONTENT_DATES from "./content-dates.json";

/**
 * Catálogo localizado de rutas HTML.
 *
 * Cada ruta declara su título en los dos idiomas: `title: { es, en }` es un
 * tipo completo, así que una ruta nueva no compila sin su versión inglesa y
 * no puede caer al español en silencio. `HTML_ROUTES` de `lib/site.ts` es la
 * vista española de este mismo catálogo; no puede importarlo porque `site.ts`
 * no depende nunca de `@/i18n` (un test comprueba que no se desincronizan).
 */
export const PAGES = ["/", "/about", "/contact", "/developers", "/privacy"] as const;
export type LogicalPath = (typeof PAGES)[number];

type Frequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

export const ROUTE_CATALOGUE: Record<
  LogicalPath,
  { title: Record<Lang, string>; changeFrequency: Frequency; priority: number }
> = {
  "/": { title: { es: "Inicio", en: "Home" }, changeFrequency: "weekly", priority: 1 },
  "/about": { title: { es: "Sobre mí", en: "About me" }, changeFrequency: "monthly", priority: 0.8 },
  "/contact": { title: { es: "Contacto", en: "Contact" }, changeFrequency: "monthly", priority: 0.8 },
  "/developers": {
    title: { es: "Portal para desarrolladores y agentes", en: "Portal for developers and agents" },
    changeFrequency: "weekly",
    priority: 0.8,
  },
  "/privacy": { title: { es: "Privacidad", en: "Privacy" }, changeFrequency: "yearly", priority: 0.4 },
};

/**
 * Fecha en que cambió el contenido de cada página (ISO), sacada de git por
 * `npm run content-dates`: el sitemap la publica como `lastModified` y un
 * `new Date()` por petición le diría al buscador que todo cambia a cada rato.
 */
export const CONTENT_UPDATED: Record<LogicalPath, string> = CONTENT_DATES;

export function routeTitle(logical: LogicalPath, lang: Lang): string {
  return ROUTE_CATALOGUE[logical].title[lang];
}

export type LocalizedHtmlRoute = {
  path: string;
  lang: Lang;
  logical: LogicalPath;
  title: string;
  changeFrequency: Frequency;
  priority: number;
};

/** Todas las URLs HTML del sitio: cada página en cada idioma. */
export function localizedHtmlRoutes(lang?: Lang): LocalizedHtmlRoute[] {
  return (lang ? [lang] : [...LANGS]).flatMap((l) =>
    PAGES.map((logical) => ({
      path: localizedPath(l, logical),
      lang: l,
      logical,
      title: routeTitle(logical, l),
      changeFrequency: ROUTE_CATALOGUE[logical].changeFrequency,
      priority: ROUTE_CATALOGUE[logical].priority,
    })),
  );
}

/**
 * Enlace a un fichero de máquina en el idioma pedido. Los que tienen versión
 * inglesa (`LOCALIZED_MACHINE_PATHS`) cuelgan de `/en`; el resto (openapi,
 * sitemap, robots…) es el mismo en los dos idiomas. Es el ÚNICO sitio que
 * decide esto: el 404 en HTML, el 404 en markdown y la home en markdown lo
 * llaman, y un test comprueba que enlazan lo mismo.
 */
export function machineHref(route: string, lang: Lang): string {
  const localized = (LOCALIZED_MACHINE_PATHS as readonly string[]).includes(route);
  return lang === "en" && localized ? `/en${route}` : route;
}

/** La fecha de contenido más reciente del sitio. */
export function latestContentUpdate(): string {
  return Object.values(CONTENT_UPDATED).sort().at(-1)!;
}
