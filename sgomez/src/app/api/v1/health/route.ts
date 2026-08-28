import { jsonOk } from "@/lib/api/http";
import { API_VERSION, absolute } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

/**
 * Sonda de disponibilidad. No lleva marca de tiempo a propósito: la respuesta
 * es cacheable y un `now` cambiante la invalidaría en cada petición sin
 * aportar nada que el cliente no sepa ya.
 */
export function GET(): Response {
  return jsonOk({
    data: {
      status: "ok",
      api_version: API_VERSION,
      openapi_url: absolute("/openapi.json"),
      documentation_url: absolute("/developers"),
    },
  });
}
