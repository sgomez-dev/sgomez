import { describe, expect, it } from "vitest";
import { GET as experience } from "@/app/api/v1/experience/route";
import { GET as profile } from "@/app/api/v1/profile/route";
import { GET as search } from "@/app/api/v1/search/route";
import { GET as project } from "@/app/api/v1/projects/[slug]/route";
import { GET as recommendations } from "@/app/api/v1/recommendations/route";
import * as content from "@/app/content";

const call = (url: string, headers?: Record<string, string>) =>
  experience(new Request(`https://sgomez.dev${url}`, { headers }));
const roles = async (res: Response) => ((await res.json()) as { data: { role: string }[] }).data.map((e) => e.role);
const spanishRoles = content.experience.map((e) => e.role.es);

describe("rutas de datos por idioma", () => {
  it("?lang=en responde en inglés", async () => {
    const res = await call("/api/v1/experience?lang=en");
    expect(res.status).toBe(200);
    expect((await roles(res))[2]).toBe("Software Developer");
  });
  it("Accept-Language en-GB sin ?lang responde en inglés", async () => {
    expect((await roles(await call("/api/v1/experience", { "accept-language": "en-GB" })))[2]).toBe("Software Developer");
    expect((await roles(await call("/api/v1/experience", { "accept-language": "EN_us" })))[2]).toBe("Software Developer");
  });
  it("sin idioma responde el español de siempre", async () => {
    expect(await roles(await call("/api/v1/experience"))).toEqual(spanishRoles);
  });
  it("?lang=EN se acepta sin distinguir mayúsculas", async () => {
    const res = await call("/api/v1/experience?lang=EN");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-language")).toBe("en");
  });
  it("?lang desconocido es un 400 invalid_parameter en todas las rutas de datos", async () => {
    const bad = "?lang=fr";
    const responses = [
      await call(`/api/v1/experience${bad}`),
      profile(new Request(`https://sgomez.dev/api/v1/profile${bad}`)),
      search(new Request(`https://sgomez.dev/api/v1/search?q=rag&lang=fr`)),
      await project(new Request(`https://sgomez.dev/api/v1/projects/x${bad}`), { params: Promise.resolve({ slug: "x" }) }),
    ];
    for (const res of responses) {
      expect(res.status).toBe(400);
      const body = (await res.json()) as { error: { code: string; hint: string } };
      expect(body.error.code).toBe("invalid_parameter");
      expect(body.error.hint).toContain("lang=es or lang=en");
    }
  });
  it("Vary incluye Accept-Language y Content-Language coincide con el idioma", async () => {
    for (const [url, headers, lang] of [
      ["/api/v1/experience", undefined, "es"],
      ["/api/v1/experience?lang=en", undefined, "en"],
      ["/api/v1/experience", { "accept-language": "en" }, "en"],
    ] as const) {
      const res = await call(url, headers as Record<string, string> | undefined);
      expect(res.headers.get("vary"), url).toContain("Accept-Language");
      expect(res.headers.get("content-language"), url).toBe(lang);
    }
    const p = profile(new Request("https://sgomez.dev/api/v1/profile?lang=en"));
    expect(p.headers.get("content-language")).toBe("en");
  });
  it("las fechas de las recomendaciones y las ubicaciones también se localizan", async () => {
    const en = (await (await call("/api/v1/experience?lang=en")).json()) as { data: { organization: string }[] };
    expect(en.data[0]!.organization).toBe("Forgia - Santander, Cantabria, Spain");
    expect(en.data[1]!.organization).toBe("SkyQuetz Consulting - Remote (Spain and Latin America)");
    const es = (await (await call("/api/v1/experience")).json()) as { data: { organization: string }[] };
    expect(es.data[0]!.organization).toBe("Forgia - Santander, Cantabria, España");
    expect(es.data[1]!.organization).toBe("SkyQuetz Consulting - Remoto (España y Latinoamérica)");
    const recs = (await (await recommendations(new Request("https://sgomez.dev/api/v1/recommendations?lang=en"))).json()) as { data: { date: string }[] };
    expect(recs.data.map((r) => r.date)).toContain("March 26, 2025");
  });
});
