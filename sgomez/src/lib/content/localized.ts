import type { Lang } from "@/i18n/languages";

/** Un texto visible en los dos idiomas del sitio. */
export type Localized = { es: string; en: string };

export function t(value: Localized | string, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}

/**
 * Espacio duro entre la cifra y el «%» («80 %»): que el porcentaje no se parta en dos líneas. Va en el componente que pinta
 * el texto y no en los datos, que son los textos aprobados y se publican tal cual en el JSON-LD, en el markdown y en llms.txt.
 */
export const hardPercent = (text: string): string => text.replace(/(\d) %/g, "$1\u00A0%");
