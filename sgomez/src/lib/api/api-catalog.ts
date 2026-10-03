import { API_BASE, API_CATALOG_PATH, API_DISCOVERY_LINK, absolute } from "@/lib/site";

/** Tipo de medio del catálogo: un linkset (RFC 9264) con el perfil del RFC 9727. */
export const API_CATALOG_CONTENT_TYPE = 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';

/**
 * Cuerpo del catálogo. Un solo ancla, la API v1, con su especificación
 * (`service-desc`), su documentación (`service-doc`) y su sonda de estado
 * (`status`, RFC 8631). El catálogo se enlaza a sí mismo con `api-catalog`.
 */
export function apiCatalog() {
  return {
    linkset: [
      {
        anchor: absolute(API_BASE),
        "service-desc": [{ href: absolute("/openapi.json"), type: "application/json" }],
        "service-doc": [{ href: absolute("/developers"), type: "text/html" }],
        status: [{ href: absolute(`${API_BASE}/health`), type: "application/json" }],
      },
      {
        anchor: absolute(API_CATALOG_PATH),
        item: [{ href: absolute(API_BASE) }],
      },
    ],
  };
}

export function apiCatalogResponse(): Response {
  return new Response(JSON.stringify(apiCatalog(), null, 2) + "\n", {
    headers: {
      "Content-Type": API_CATALOG_CONTENT_TYPE,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Access-Control-Allow-Origin": "*",
      Link: API_DISCOVERY_LINK,
    },
  });
}
