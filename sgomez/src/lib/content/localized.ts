import type { Lang } from "@/i18n/languages";

/** Un texto visible en los dos idiomas del sitio. */
export type Localized = { es: string; en: string };

export function t(value: Localized | string, lang: Lang): string {
  return typeof value === "string" ? value : value[lang];
}
