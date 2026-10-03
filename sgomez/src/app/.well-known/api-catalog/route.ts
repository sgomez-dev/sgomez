import { apiCatalogResponse } from "@/lib/api/api-catalog";

/** /.well-known/api-catalog (RFC 9727). Ver `apiCatalogResponse`. */
export const dynamic = "force-static";
export const revalidate = 3600;

export function GET(): Response {
  return apiCatalogResponse();
}
