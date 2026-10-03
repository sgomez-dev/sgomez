import { apiIndexResponse } from "@/lib/api/api-index";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

/** /api: el mismo índice que /api/v1. Bajo /api todo es JSON, también la raíz. */
export function GET(): Response {
  return apiIndexResponse("/api");
}
