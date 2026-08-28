import type { MetadataRoute } from "next";
import { HTML_ROUTES, SITE_URL, absolute } from "@/lib/site";

/**
 * Sitemap generado desde el catálogo de rutas de `lib/site.ts`.
 *
 * Antes la lista estaba escrita a mano aquí y solo tenía tres URLs; publicar
 * una página nueva y olvidarse de añadirla era cuestión de tiempo. Ahora el
 * sitemap y el 404 leen el mismo catálogo, así que no pueden discrepar.
 *
 * Los ficheros para agentes (llms.txt, agents.md, la especificación OpenAPI)
 * también van dentro: son documentos publicados con URL propia, y el
 * requisito de que se puedan encontrar por su nombre empieza por que estén
 * anunciados donde un buscador mira.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const pages: MetadataRoute.Sitemap = HTML_ROUTES.map((route) => ({
    url: absolute(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.path === "/"
      ? { images: [`${SITE_URL}/Santiago_Gómez_de_la_Torre_Romero.png`] }
      : {}),
  }));

  const machineReadable: MetadataRoute.Sitemap = [
    { url: absolute("/llms.txt"), lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: absolute("/agents.md"), lastModified, changeFrequency: "weekly", priority: 0.5 },
    { url: absolute("/openapi.json"), lastModified, changeFrequency: "weekly", priority: 0.5 },
  ];

  return [...pages, ...machineReadable];
}
