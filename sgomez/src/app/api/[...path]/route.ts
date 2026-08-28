import { notFound } from "@/lib/api/http";
import { API_BASE, absolute } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

/**
 * Comodín de /api: cualquier ruta que no exista bajo /api cae aquí.
 *
 * Existe para que un endpoint mal escrito devuelva JSON y no la página 404 en
 * HTML del sitio. Las rutas estáticas (/api/v1/profile, /api/openapi.yaml…)
 * tienen prioridad sobre este catch-all, así que solo ve lo que de verdad no
 * existe.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  return notFound(
    `No API endpoint at /api/${path.join("/")}.`,
    `Browse the available endpoints in the OpenAPI document at ${absolute("/openapi.json")}, or start from GET ${API_BASE}/health.`,
  );
}
