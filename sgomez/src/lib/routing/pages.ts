import { LANGS, localizedPath, type Lang } from "@/i18n/languages";

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
 * Fecha en que cambió el contenido de cada página (ISO). Se edita a mano
 * cuando cambia el contenido: el sitemap la publica como `lastModified` y un
 * `new Date()` por petición le diría al buscador que todo cambia a cada rato.
 */
export const CONTENT_UPDATED: Record<LogicalPath, string> = {
  "/": "2026-09-30",
  "/about": "2026-09-30",
  "/contact": "2026-09-30",
  "/developers": "2026-09-30",
  "/privacy": "2026-09-30",
};

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

/** La fecha de contenido más reciente del sitio. */
export function latestContentUpdate(): string {
  return Object.values(CONTENT_UPDATED).sort().at(-1)!;
}
