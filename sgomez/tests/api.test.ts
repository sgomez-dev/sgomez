import { describe, expect, it } from "vitest";
import { GET as health } from "@/app/api/v1/health/route";
import { GET as profile } from "@/app/api/v1/profile/route";
import { GET as aboutRoute } from "@/app/api/v1/about/route";
import { GET as projects } from "@/app/api/v1/projects/route";
import { GET as project } from "@/app/api/v1/projects/[slug]/route";
import { GET as experience } from "@/app/api/v1/experience/route";
import { GET as skills } from "@/app/api/v1/skills/route";
import { GET as certifications } from "@/app/api/v1/certifications/route";
import { GET as education } from "@/app/api/v1/education/route";
import { GET as recommendations } from "@/app/api/v1/recommendations/route";
import { GET as search } from "@/app/api/v1/search/route";
import { GET as unknownEndpoint } from "@/app/api/[...path]/route";
import { OPTIONS, POST } from "@/lib/api/http";
import { getProjects } from "@/lib/api/data";

const BASE = "https://sgomez.dev/api/v1";

function request(path: string): Request {
  return new Request(`https://sgomez.dev${path}`);
}

async function body(response: Response): Promise<Record<string, never>> {
  return JSON.parse(await response.text());
}

const COLLECTIONS: [string, (request: Request) => Response][] = [
  ["/projects", projects],
  ["/experience", experience],
  ["/skills", skills],
  ["/certifications", certifications],
  ["/education", education],
  ["/recommendations", recommendations],
];

describe("respuestas correctas", () => {
  it("health devuelve el estado y los puntos de entrada", async () => {
    const response = health();
    expect(response.status).toBe(200);
    const payload = await body(response);
    expect(payload).toMatchObject({
      data: { status: "ok", openapi_url: "https://sgomez.dev/openapi.json" },
    });
  });

  it("profile devuelve la identidad, con el matiz de cofundador", async () => {
    const payload = await body(profile());
    const data = payload.data as unknown as Record<string, unknown>;
    expect(data.name).toBe("Santiago Gómez de la Torre Romero");
    expect(data.email).toMatch(/@sgomez\.dev$/);
    // Cuatro socios: la API no puede sugerir que fundó la empresa él solo.
    expect(String((data.co_founder_of as Record<string, string>).role)).toMatch(/co-founder/i);
    expect((data.availability as Record<string, unknown>).open_to_work).toBe(true);
  });

  it("about devuelve biografía y cronología", async () => {
    const payload = await body(aboutRoute());
    const data = payload.data as unknown as { summary: string; timeline: unknown[] };
    expect(data.summary.length).toBeGreaterThan(500);
    expect(data.timeline.length).toBeGreaterThan(0);
  });

  for (const [path, handler] of COLLECTIONS) {
    it(`${path} devuelve el sobre { data, meta }`, async () => {
      const response = handler(request(`/api/v1${path}`));
      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
      expect(response.headers.get("access-control-allow-origin")).toBe("*");
      expect(response.headers.get("vary")).toContain("Accept");

      const payload = await body(response);
      const data = payload.data as unknown as unknown[];
      const meta = payload.meta as unknown as Record<string, number | string>;
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
      expect(meta.count).toBe(data.length);
      expect(meta.total).toBeGreaterThanOrEqual(data.length);
      expect(meta.self).toBe(`${BASE}${path}`);
      expect(meta.documentation_url).toBe("https://sgomez.dev/developers");
    });
  }

  it("las colecciones paginan con limit y offset", async () => {
    const first = await body(projects(request("/api/v1/projects?limit=2")));
    expect((first.data as unknown as unknown[]).length).toBe(2);

    const second = await body(projects(request("/api/v1/projects?limit=2&offset=2")));
    expect(second.data).not.toEqual(first.data);
  });

  it("devuelve un proyecto por su slug", async () => {
    const slug = getProjects()[0].slug;
    const response = await project(request(`/api/v1/projects/${slug}`), {
      params: Promise.resolve({ slug }),
    });
    expect(response.status).toBe(200);
    const payload = await body(response);
    expect((payload.data as unknown as { slug: string }).slug).toBe(slug);
  });

  it("busca sin distinguir acentos ni mayúsculas", async () => {
    const payload = await body(search(request("/api/v1/search?q=RAG")));
    const results = payload.data as unknown as { type: string; score: number }[];
    expect(results.length).toBeGreaterThan(0);
    // Ordenado de mejor a peor.
    expect(results.map((hit) => hit.score)).toEqual([...results.map((hit) => hit.score)].sort((a, b) => b - a));

    const accented = await body(search(request(`/api/v1/search?q=${encodeURIComponent("GALARDÓN")}`)));
    const plain = await body(search(request("/api/v1/search?q=galardon")));
    expect(accented.data).toEqual(plain.data);
  });
});

describe("errores en JSON", () => {
  it("404 con las alternativas en la pista", async () => {
    const response = await project(request("/api/v1/projects/no-existe"), {
      params: Promise.resolve({ slug: "no-existe" }),
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    expect(response.headers.get("cache-control")).toBe("no-store");

    const payload = await body(response);
    const error = payload.error as unknown as Record<string, string | number>;
    expect(error.status).toBe(404);
    expect(error.code).toBe("not_found");
    expect(String(error.message)).toContain("no-existe");
    expect(String(error.hint)).toContain(getProjects()[0].slug);
    expect(error.documentation_url).toBe("https://sgomez.dev/developers");
  });

  it("404 en JSON para cualquier ruta desconocida bajo /api", async () => {
    const response = await unknownEndpoint(request("/api/v2/nope"), {
      params: Promise.resolve({ path: ["v2", "nope"] }),
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/json; charset=utf-8");
    const payload = await body(response);
    expect(String((payload.error as unknown as Record<string, string>).message)).toContain("/api/v2/nope");
  });

  it("400 cuando un parámetro está fuera de rango", async () => {
    for (const query of ["?limit=0", "?limit=101", "?limit=abc", "?limit=1.5", "?offset=-1"]) {
      const response = projects(request(`/api/v1/projects${query}`));
      expect(response.status, query).toBe(400);
      const payload = await body(response);
      const error = payload.error as unknown as Record<string, string>;
      expect(error.code).toBe("invalid_parameter");
      // La pista dice cómo recuperarse, no solo que algo falló.
      expect(error.hint).toMatch(/Retry with|omit the parameter/);
    }
  });

  it("400 cuando falta q en la búsqueda", async () => {
    for (const path of ["/api/v1/search", "/api/v1/search?q=", "/api/v1/search?q=%20%20"]) {
      const response = search(request(path));
      expect(response.status, path).toBe(400);
    }
  });

  it("405 en JSON, con la cabecera Allow", async () => {
    const response = POST();
    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    const payload = await body(response);
    expect((payload.error as unknown as Record<string, string>).code).toBe("method_not_allowed");
  });

  it("OPTIONS responde el preflight de CORS", () => {
    const response = OPTIONS();
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-methods")).toBe("GET, HEAD, OPTIONS");
  });
});
