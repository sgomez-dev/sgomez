import type { Metadata } from "next";
import { hreflangAlternates, localizedPath, type Lang } from "@/i18n/languages";
import { markdownVariantOf } from "@/lib/markdown/routing";

/** Tamaño de la imagen Open Graph: el que piden Facebook, LinkedIn y X para `summary_large_image`. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** Nombre de sitio en Open Graph. */
export const SITE_NAME = "Santiago Gómez de la Torre Romero · Full-Stack Engineer";

/** Texto alternativo de la imagen Open Graph, en el idioma de la página que la enlaza. */
export const OG_ALT: Record<Lang, string> = {
  es: "Santiago Gómez de la Torre, full-stack engineer que lleva la IA a producción",
  en: "Santiago Gómez de la Torre, full-stack engineer who takes AI to production",
};

/** Ruta pública de la imagen Open Graph de una página: `/opengraph-image`, `/en/about/opengraph-image`… */
export function ogImagePath(lang: Lang, path = "/"): string {
  return localizedPath(lang, path === "/" ? "/opengraph-image" : `${path}/opengraph-image`);
}

/** Texto alternativo de la imagen de una página: el de la home, o el nombre con el de la página. */
export function ogAlt(lang: Lang, path: string, pageTitle: string): string {
  return path === "/" ? OG_ALT[lang] : `Santiago Gómez de la Torre, ${pageTitle}`;
}

export type BuildMetadataOptions = {
  lang: Lang;
  /** Ruta lógica sin idioma: "/", "/about"… */
  path: string;
  title: string;
  description: string;
  /** Nombre corto de la página para el alt de su imagen Open Graph («Contacto»). */
  ogTitle?: string;
  /** Texto alternativo completo de la imagen, para las páginas cuyo alt no es «nombre, página» (los casos de estudio). */
  ogAltText?: string;
};

/**
 * Metadata de una página en un idioma.
 *
 * Es el único sitio que decide canónica, hreflang, variante markdown y Open
 * Graph, así que todas las páginas dicen lo mismo de sí mismas:
 *
 * - `alternates.languages` lleva `es`, `en` y `x-default` (el mismo esquema que
 *   el sitemap) y sale de `hreflangAlternates`, por lo que es recíproco.
 *   `alternates` REEMPLAZA al del layout, no se mezcla: por eso cada página lo
 *   lleva entero y no solo la canónica.
 * - `title` va como `absolute`: el título de cada página ya lleva la marca, y
 *   con la plantilla del layout saldría dos veces.
 */
export function buildMetadata({ lang, path, title, description, ogTitle = title, ogAltText }: BuildMetadataOptions): Metadata {
  const canonical = localizedPath(lang, path);
  const image = { url: ogImagePath(lang, path), ...OG_SIZE, alt: ogAltText ?? ogAlt(lang, path, ogTitle) };
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: hreflangAlternates(path),
      types: { "text/markdown": markdownVariantOf(canonical) },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      // /about es el perfil de una persona (`profile`); el resto son páginas de un sitio (`website`).
      ...(path === "/about"
        ? { type: "profile" as const, firstName: "Santiago", lastName: "Gómez de la Torre Romero" }
        : { type: "website" as const }),
      locale: lang === "es" ? "es_ES" : "en_US",
      alternateLocale: [lang === "es" ? "en_US" : "es_ES"],
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [{ url: image.url, alt: image.alt }] },
  };
}
