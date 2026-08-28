import { openApiJsonResponse } from "@/lib/api/spec-response";

/**
 * /openapi.json — ubicación canónica de la especificación.
 *
 * Está en la raíz porque es donde la buscan los clientes y los auditores antes
 * de mirar en ningún otro sitio. /api/openapi.json y /api/openapi.yaml sirven
 * el MISMO objeto en las otras dos convenciones habituales.
 */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return openApiJsonResponse();
}
