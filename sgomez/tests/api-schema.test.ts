import Ajv from "ajv";
import { describe, expect, it } from "vitest";
import { GET as health } from "@/app/api/v1/health/route";
import { GET as profile } from "@/app/api/v1/profile/route";
import { GET as about } from "@/app/api/v1/about/route";
import { GET as projects } from "@/app/api/v1/projects/route";
import { GET as project } from "@/app/api/v1/projects/[slug]/route";
import { GET as experience } from "@/app/api/v1/experience/route";
import { GET as skills } from "@/app/api/v1/skills/route";
import { GET as certifications } from "@/app/api/v1/certifications/route";
import { GET as education } from "@/app/api/v1/education/route";
import { GET as recommendations } from "@/app/api/v1/recommendations/route";
import { GET as search } from "@/app/api/v1/search/route";
import { getProjects } from "@/lib/api/data";
import { openApiDocument } from "@/lib/api/openapi";

type Doc = {
  paths: Record<string, { get?: { responses: Record<string, { content?: Record<string, { schema: object }> }> } }>;
  components: unknown;
};
const doc = openApiDocument() as unknown as Doc;

const slug = getProjects()[0].slug;
const call = (path: string, handler: (r: Request, c: { params: Promise<{ slug: string }> }) => Response | Promise<Response>) =>
  handler(new Request(`https://sgomez.dev${path}`), { params: Promise.resolve({ slug }) });

const ROUTES: Record<string, () => Response | Promise<Response>> = {
  "/health": () => health(),
  "/profile": () => call("/api/v1/profile", profile),
  "/about": () => call("/api/v1/about", about),
  "/projects": () => call("/api/v1/projects", projects),
  "/projects/{slug}": () => call(`/api/v1/projects/${slug}`, project),
  "/experience": () => call("/api/v1/experience", experience),
  "/skills": () => call("/api/v1/skills", skills),
  "/certifications": () => call("/api/v1/certifications", certifications),
  "/education": () => call("/api/v1/education", education),
  "/recommendations": () => call("/api/v1/recommendations", recommendations),
  "/search": () => call("/api/v1/search?q=angular", search),
};

const ajv = new Ajv({ unknownFormats: "ignore", schemaId: "auto" });

describe("las respuestas de la API cumplen el esquema OpenAPI", () => {
  const entries = Object.entries(doc.paths).filter(([, item]) => item.get);
  it("cada operación GET del documento tiene su ruta en la prueba", () => {
    expect(entries.map(([path]) => path.replace(/^\/api\/v1/, "")).sort()).toEqual(Object.keys(ROUTES).sort());
  });
  for (const lang of ["es", "en"]) {
    for (const [path, item] of entries) {
      const key = path.replace(/^\/api\/v1/, "");
      it(`${key} (${lang})`, async () => {
        const run = ROUTES[key];
        const schema = item.get!.responses["200"].content!["application/json"].schema;
        const response = await (lang === "es" ? run() : callEn(key));
        expect(response.status).toBe(200);
        const validate = ajv.compile({ ...schema, components: doc.components });
        const ok = validate(JSON.parse(await response.text()));
        expect(validate.errors, JSON.stringify(validate.errors)).toBeNull();
        expect(ok).toBe(true);
      });
    }
  }
});

function callEn(key: string): Response | Promise<Response> {
  const handlers: Record<string, (r: Request, c: { params: Promise<{ slug: string }> }) => Response | Promise<Response>> = {
    "/health": () => health(),
    "/profile": profile,
    "/about": about,
    "/projects": projects,
    "/projects/{slug}": project,
    "/experience": experience,
    "/skills": skills,
    "/certifications": certifications,
    "/education": education,
    "/recommendations": recommendations,
    "/search": search,
  };
  const url = key === "/projects/{slug}" ? `/api/v1/projects/${slug}` : `/api/v1${key}${key === "/search" ? "?q=angular&" : "?"}lang=en`;
  return handlers[key](new Request(`https://sgomez.dev${url}`), { params: Promise.resolve({ slug }) });
}
