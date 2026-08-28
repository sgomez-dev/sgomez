import { openApiJsonResponse } from "@/lib/api/spec-response";

/** Alias de /openapi.json bajo /api, con el mismo cuerpo. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return openApiJsonResponse();
}
