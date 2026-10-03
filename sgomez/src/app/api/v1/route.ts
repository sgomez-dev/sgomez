import { apiIndexResponse } from "@/lib/api/api-index";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

/** /api/v1: índice de la API, con cada operación y su operationId. */
export function GET(): Response {
  return apiIndexResponse(API_BASE);
}
