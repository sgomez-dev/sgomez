import { SITE_URL } from "@/lib/site";

export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Español sin prefijo (las URLs de siempre); el resto de idiomas bajo /{lang}. */
export function localizedPath(lang: Lang, path: string): string {
  const clean = path === "" ? "/" : path;
  if (lang === DEFAULT_LANG) return clean;
  return clean === "/" ? `/${lang}` : `/${lang}${clean}`;
}

export function splitLang(pathname: string): { lang: Lang; path: string } {
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(pathname);
  if (match && isLang(match[1]) && match[1] !== DEFAULT_LANG) {
    return { lang: match[1], path: match[2] ?? "/" };
  }
  return { lang: DEFAULT_LANG, path: pathname };
}

/** URL absoluta; la home española es exactamente SITE_URL, sin barra final (= IDENTITY.url). */
function absoluteLocalized(lang: Lang, path: string): string {
  const p = localizedPath(lang, path);
  return p === "/" ? SITE_URL : `${SITE_URL}${p}`;
}

export function hreflangAlternates(path: string): Record<Lang | "x-default", string> {
  return { es: absoluteLocalized("es", path), en: absoluteLocalized("en", path), "x-default": absoluteLocalized("es", path) };
}

/** Enlace del selector de idioma: la misma página en `to`, o su home si no existe. */
export function switchLangHref(pathname: string, to: Lang, knownPaths: readonly string[]): string {
  const { path } = splitLang(pathname);
  return localizedPath(to, knownPaths.includes(path) ? path : "/");
}

/**
 * Ruta lista para `switchLangHref`: sin barra final (salvo "/") y sin el prefijo
 * interno `/es`. El español se sirve reescribiendo `/about` a `/es/about`, y
 * `usePathname()` puede devolver la ruta reescrita; `splitLang` solo reconoce
 * los idiomas con prefijo público, así que sin esto `/es/about` no casaría.
 */
export function normalizePathname(pathname: string): string {
  let p = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  p = p.replace(/^\/es(?=\/|$)/, "");
  return p === "" ? "/" : p;
}
