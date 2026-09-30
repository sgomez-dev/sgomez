import type { Metadata } from "next";
import type { StaticPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";

/**
 * Metadata de una página estática.
 *
 * Sale del mismo objeto que el contenido para que el `<title>`, la
 * descripción y la canónica no puedan describir una página distinta de la que
 * se está renderizando. Delega en `buildMetadata`, que añade el hreflang, la
 * variante markdown (la mitad de la convención de acceptmarkdown.com que no
 * viaja en cabeceras) y el Open Graph del idioma de la página.
 */
export function pageMetadata(page: StaticPage): Metadata {
  return buildMetadata({
    lang: page.lang,
    path: `/${page.slug}`,
    title: page.metaTitle,
    description: page.description,
  });
}
