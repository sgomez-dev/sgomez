import { describe, expect, it } from "vitest";
import * as content from "@/app/content";
import { getProjects, getRecommendations, getProfile, getProject } from "@/lib/api/data";
import { resolveLang } from "@/lib/api/http";
import { siteFigures } from "@/lib/content/figures";

function localizedLeaves(value: unknown, path = "content"): { path: string; es: string; en: string }[] {
  if (value && typeof value === "object" && !Array.isArray(value) && "es" in value && "en" in value) {
    const v = value as { es: string; en: string };
    return [{ path, es: v.es, en: v.en }];
  }
  if (Array.isArray(value)) return value.flatMap((v, i) => localizedLeaves(v, `${path}[${i}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([k, v]) => localizedLeaves(v, `${path}.${k}`));
  return [];
}

describe("contenido bilingüe", () => {
  const leaves = localizedLeaves(content);
  it("hay textos localizados", () => expect(leaves.length).toBeGreaterThan(40));
  it("ningún texto le falta el inglés o el español", () => {
    for (const l of leaves) {
      expect(l.es.trim(), l.path).not.toBe("");
      expect(l.en.trim(), l.path).not.toBe("");
    }
  });
  it("el inglés no es una copia del español en textos largos", () => {
    for (const l of leaves) if (l.es.length > 40) expect(l.en, l.path).not.toBe(l.es);
  });
});

describe("API por idioma", () => {
  it("sin idioma responde en español, como hasta ahora", () => {
    expect(getProfile().availability.statement).toBe(getProfile("es").availability.statement);
  });
  it("los slugs son los mismos en los dos idiomas", () => {
    expect(getProjects("en").map((p) => p.slug)).toEqual(getProjects("es").map((p) => p.slug));
    const first = getProjects("es")[0]!;
    expect(getProject(first.slug, "en")?.slug).toBe(first.slug);
  });
  it("en inglés la cita original se conserva y la traducción va aparte", () => {
    const es = getRecommendations("es");
    const en = getRecommendations("en");
    expect(en.map((r) => r.comment)).toEqual(es.map((r) => r.comment));
    for (const r of en) {
      expect(r.original_language).toBe("es");
      expect(r.comment_translation?.length).toBeGreaterThan(40);
    }
    for (const r of es) expect(r.comment_translation).toBeUndefined();
  });
  it("resolveLang: ?lang gana, luego Accept-Language, luego español", () => {
    expect(resolveLang(new Request("https://x/api?lang=en"))).toBe("en");
    expect(resolveLang(new Request("https://x/api?lang=fr"))).toBe("es");
    expect(resolveLang(new Request("https://x/api", { headers: { "accept-language": "en-GB,en;q=0.9" } }))).toBe("en");
    expect(resolveLang(new Request("https://x/api", { headers: { "accept-language": "es-ES" } }))).toBe("es");
    expect(resolveLang(new Request("https://x/api?lang=es", { headers: { "accept-language": "en" } }))).toBe("es");
  });
});

describe("cifras derivadas", () => {
  it("todos los periodos traen un año de cuatro cifras", () => {
    expect(content.experience.every((e) => /\b(19|20)\d{2}\b/.test(t(e.period)))).toBe(true);
  });
  it("salen de los datos", () => {
    const f = siteFigures();
    expect(f.projects).toBe(content.projects.length);
    expect(f.certifications).toBe(content.certifications.length);
    const years = content.experience.flatMap((e) => (t(e.period).match(/\b(19|20)\d{2}\b/g) ?? []).map(Number));
    expect(f.years).toBe(new Date().getFullYear() - Math.min(...years));
  });
});

function t(v: unknown): string {
  return typeof v === "string" ? v : (v as { es: string }).es;
}
