import { collectionMeta } from "@/lib/api/data";
import { jsonOk } from "@/lib/api/http";
import { openApiDocument } from "@/lib/api/openapi";
import { API_BASE, API_CATALOG_PATH, API_VERSION, absolute } from "@/lib/site";

type Endpoint = { method: "GET"; path: string; operation_id: string; summary: string };

/**
 * Índice de la API, servido en /api y en /api/v1.
 *
 * La lista de operaciones sale del documento OpenAPI y no de una tabla aparte:
 * un endpoint nuevo aparece aquí en cuanto se documenta, y uno sin documentar
 * ya lo frena el test de rutas de `openapi.test.ts`.
 */
export function apiIndexResponse(path: string): Response {
  const document = openApiDocument() as {
    info: { title: string };
    paths: Record<string, { get?: { operationId: string; summary: string } }>;
  };
  const endpoints: Endpoint[] = Object.entries(document.paths).flatMap(([route, item]) =>
    item.get ? [{ method: "GET" as const, path: route, operation_id: item.get.operationId, summary: item.get.summary }] : [],
  );
  return jsonOk({
    data: {
      name: document.info.title,
      api_version: API_VERSION,
      base_url: absolute(API_BASE),
      openapi_url: absolute("/openapi.json"),
      documentation_url: absolute("/developers"),
      api_catalog_url: absolute(API_CATALOG_PATH),
      endpoints,
    },
    meta: collectionMeta(endpoints.length, path),
  });
}
