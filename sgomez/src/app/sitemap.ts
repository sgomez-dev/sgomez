import type { MetadataRoute } from "next";
import { hreflangAlternates } from "@/i18n/languages";
import { CONTENT_UPDATED, latestContentUpdate, localizedHtmlRoutes } from "@/lib/routing/pages";
import { SITE_URL, absolute } from "@/lib/site";

/**
 * Sitemap generado desde el catálogo localizado de `lib/routing/pages.ts`.
 *
 * Publica cada página en sus dos idiomas y cada entrada lleva los `alternates`
 * recíprocos (hreflang), que es lo que permite a un buscador emparejarlas.
 * `lastModified` sale de `CONTENT_UPDATED`, fijo y editado a mano: un
 * `new Date()` por petición declararía que todo cambia en cada rastreo.
 *
 * Los ficheros para agentes (llms.txt, agents.md, la especificación OpenAPI)
 * también van dentro: son documentos publicados con URL propia.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = localizedHtmlRoutes().map((route) => ({
    url: absolute(route.path),
    lastModified: new Date(CONTENT_UPDATED[route.logical]),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    alternates: { languages: hreflangAlternates(route.logical) },
    ...(route.logical === "/" ? { images: [`${SITE_URL}/Santiago_Gómez_de_la_Torre_Romero.png`] } : {}),
  }));

  const lastModified = new Date(latestContentUpdate());
  const machineReadable: MetadataRoute.Sitemap = [
    "/llms.txt",
    "/en/llms.txt",
    "/agents.md",
    "/en/agents.md",
    "/openapi.json",
  ].map((path) => ({ url: absolute(path), lastModified, changeFrequency: "weekly" as const, priority: 0.5 }));

  return [...pages, ...machineReadable];
}
