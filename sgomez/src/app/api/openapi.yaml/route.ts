import { openApiDocument } from "@/lib/api/openapi";
import { toYaml } from "@/lib/api/yaml";

/**
 * /api/openapi.yaml — la misma especificación en YAML.
 *
 * Se serializa desde `openApiDocument()`, no desde un fichero aparte: dos
 * copias del contrato acaban divergiendo, y la que un cliente elija leer sería
 * cuestión de suerte.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return new Response(toYaml(openApiDocument()), {
    headers: {
      // application/yaml es el tipo registrado en el RFC 9512; text/yaml es el
      // alias histórico que aún usan algunas herramientas.
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
