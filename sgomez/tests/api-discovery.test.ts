import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";
import { GET as apiRoot } from "@/app/api/route";
import { GET as apiIndex } from "@/app/api/v1/route";
import { GET as health } from "@/app/api/v1/health/route";
import { GET as catchAll } from "@/app/api/[...path]/route";
import { GET as catalog } from "@/app/.well-known/api-catalog/route";
import { GET as openapi } from "@/app/openapi.json/route";
import { openApiDocument } from "@/lib/api/openapi";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { agentsMd } from "@/lib/machine/agents-md";
import { API_DISCOVERY_LINK, MACHINE_ROUTES } from "@/lib/site";

type Index = {
  data: { endpoints: { method: string; path: string; operation_id: string; summary: string }[]; openapi_url: string; documentation_url: string; api_catalog_url: string };
  meta: { count: number; self: string };
};

const LINK = '</openapi.json>; rel="service-desc", </developers>; rel="service-doc", </.well-known/api-catalog>; rel="api-catalog"';

describe("/api y /api/v1 devuelven el índice en JSON", () => {
  const doc = openApiDocument() as { paths: Record<string, { get: { operationId: string } }> };

  for (const [name, run, self] of [
    ["/api", apiRoot, "https://sgomez.dev/api"],
    ["/api/v1", apiIndex, "https://sgomez.dev/api/v1"],
  ] as const) {
    it(name, async () => {
      const response = run();
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
      const body = (await response.json()) as Index;
      expect(body.meta.self).toBe(self);
      expect(body.data.openapi_url).toBe("https://sgomez.dev/openapi.json");
      expect(body.data.documentation_url).toBe("https://sgomez.dev/developers");
      expect(body.data.api_catalog_url).toBe("https://sgomez.dev/.well-known/api-catalog");
      // Una entrada por operación del documento, con su operationId.
      expect(body.data.endpoints.map((e) => e.operation_id)).toEqual(Object.values(doc.paths).map((item) => item.get.operationId));
      expect(body.meta.count).toBe(body.data.endpoints.length);
      expect(body.data.endpoints).toContainEqual(expect.objectContaining({ method: "GET", path: "/api/v1/projects/{slug}", operation_id: "getProject" }));
    });
  }

  it("los operationId del documento son únicos", () => {
    const ids = Object.values(doc.paths).map((item) => item.get.operationId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("cabecera Link de descubrimiento", () => {
  it("tiene el valor acordado", () => {
    expect(API_DISCOVERY_LINK).toBe(LINK);
  });

  it("la llevan las respuestas de /api, también los errores, y la especificación", async () => {
    expect(apiIndex().headers.get("link")).toBe(LINK);
    expect(health().headers.get("link")).toBe(LINK);
    const missing = await catchAll(new Request("https://sgomez.dev/api/nope"), { params: Promise.resolve({ path: ["nope"] }) });
    expect(missing.status).toBe(404);
    expect(missing.headers.get("link")).toBe(LINK);
    expect(openapi().headers.get("link")).toBe(LINK);
  });

  it("la home la añade en el proxy, en los dos idiomas, junto al alternate de markdown", async () => {
    for (const path of ["/", "/en"]) {
      const response = await proxy(new NextRequest(`https://sgomez.dev${path}`, { headers: { accept: "text/html" } }));
      const link = response.headers.get("link") ?? "";
      expect(link, path).toContain('rel="alternate"; type="text/markdown"');
      expect(link, path).toContain(LINK);
    }
    const about = await proxy(new NextRequest("https://sgomez.dev/about", { headers: { accept: "text/html" } }));
    expect(about.headers.get("link")).not.toContain("service-desc");
  });
});

describe("/.well-known/api-catalog (RFC 9727)", () => {
  it("es un linkset con service-desc y service-doc de /api/v1", async () => {
    const response = catalog();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe('application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"');
    const body = (await response.json()) as { linkset: Record<string, unknown>[] };
    const api = body.linkset.find((entry) => entry.anchor === "https://sgomez.dev/api/v1")!;
    expect(api["service-desc"]).toEqual([{ href: "https://sgomez.dev/openapi.json", type: "application/json" }]);
    expect(api["service-doc"]).toEqual([{ href: "https://sgomez.dev/developers", type: "text/html" }]);
  });

  it("el proxy no lo toca: no se reescribe a /es ni recibe el 404 de las páginas", async () => {
    const response = await proxy(new NextRequest("https://sgomez.dev/.well-known/api-catalog", { headers: { accept: "*/*" } }));
    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("aparece en los ficheros para máquinas, en llms.txt y en agents.md", () => {
    expect(MACHINE_ROUTES.map((route) => route.path)).toContain("/.well-known/api-catalog");
    for (const lang of ["es", "en"] as const) {
      expect(llmsTxt(lang), `llms.txt ${lang}`).toContain("https://sgomez.dev/.well-known/api-catalog");
      expect(agentsMd(lang), `agents.md ${lang}`).toContain("https://sgomez.dev/.well-known/api-catalog");
    }
  });
});
