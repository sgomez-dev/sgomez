import type { Metadata } from "next";
import type { StaticPage } from "@/lib/content/pages";
import { markdownVariantOf } from "@/lib/markdown/routing";

/**
 * Metadata de una página estática.
 *
 * Sale del mismo objeto que el contenido para que el `<title>`, la
 * descripción y la canónica no puedan describir una página distinta de la que
 * se está renderizando. `alternates.types` publica la variante markdown en el
 * `<head>`, que es la mitad de la convención de acceptmarkdown.com que no
 * viaja en cabeceras.
 */
export function pageMetadata(page: StaticPage): Metadata {
  return {
    title: page.metaTitle,
    description: page.description,
    alternates: {
      canonical: page.path,
      types: { "text/markdown": markdownVariantOf(page.path) },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.description,
      url: page.path,
      type: "article",
    },
    twitter: { card: "summary_large_image", title: page.metaTitle, description: page.description },
  };
}
