import { getCaseStudies } from "@/lib/api/data";
import type { Lang } from "@/i18n/languages";

/**
 * Casos de estudio publicados (`/work/[slug]`): la única lista de slugs que cuentan como ruta conocida.
 *
 * Sale de `getCaseStudies`, o sea, de los proyectos que tienen sus tres textos en los dos idiomas. No vive en
 * `pages.ts` porque `seo.ts` importa ese módulo y los datos importan `seo.ts`: un ciclo.
 */
export const caseSlugs = (): string[] => getCaseStudies("es").map((study) => study.slug);

export const isCaseSlug = (slug: string): boolean => caseSlugs().includes(slug);

/** Ruta lógica (sin idioma) de un caso. */
export const casePath = (slug: string): string => `/work/${slug}`;

/** Rutas lógicas de todos los casos, para el selector de idioma. */
export const caseLogicalPaths = (): string[] => caseSlugs().map(casePath);

export type CaseRoute = {
  path: string;
  lang: Lang;
  logical: string;
  slug: string;
  title: string;
  updated: string;
  changeFrequency: "monthly";
  priority: number;
};

/** Todas las URL de casos, en un idioma o en los dos. */
export function caseRoutes(lang?: Lang): CaseRoute[] {
  return (lang ? [lang] : (["es", "en"] as const)).flatMap((l) =>
    getCaseStudies(l).map((study) => ({
      path: study.path,
      lang: l,
      logical: casePath(study.slug),
      slug: study.slug,
      title: study.title,
      updated: study.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  );
}
