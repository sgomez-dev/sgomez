import { openApiDocument } from "@/lib/api/openapi";

/**
 * Respuesta compartida por /openapi.json y /api/openapi.json.
 *
 * Las dos rutas existen porque las dos convenciones están extendidas y un
 * cliente que solo prueba una no debería quedarse sin especificación. Lo que
 * no puede haber son dos cuerpos distintos, así que las dos llaman aquí.
 */
export function openApiJsonResponse(): Response {
  return new Response(JSON.stringify(openApiDocument(), null, 2) + "\n", {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      Vary: "Accept, Accept-Encoding",
    },
  });
}
