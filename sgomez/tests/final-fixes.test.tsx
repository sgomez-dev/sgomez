import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import GlassPoster from "@/components/GlassPoster";
import Hero from "@/chapters/Hero";
import Contact from "@/chapters/Contact";
import { buildMetadata } from "@/lib/seo/metadata";
import { llmsTxt } from "@/lib/machine/llms-txt";
import { staticPage } from "@/lib/content/pages";
import { LANGS } from "@/i18n/languages";

const read = (file: string) => fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");

describe("D1: GlassPoster con ids por instancia", () => {
  it("dos instancias no comparten ningún id y cada url(#) apunta al suyo", () => {
    const html = renderToStaticMarkup(
      <>
        <GlassPoster />
        <GlassPoster />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.length).toBe(8);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ref of html.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref[1]);
  });
  it("el hero y el contacto juntos no repiten ids", () => {
    const html = renderToStaticMarkup(
      <>
        <Hero lang="es" />
        <Contact lang="es" />
      </>,
    );
    const ids = [...html.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size, `ids repetidos: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`).toBe(ids.length);
  });
});

describe("D2 y D3: tamaños fluidos y desplazamiento con zona segura", () => {
  const layout = read("src/components/StaticPageLayout.tsx");
  it("sin tamaños de fuente fijos en px", () => {
    expect(layout).not.toMatch(/text-\[\d+px\]/);
    expect(read("src/chapters/Hero.tsx")).not.toMatch(/text-\[\d+px\]/);
    expect(layout).toContain("text-[length:var(--step-2)]");
  });
  it("las secciones de las páginas usan el mismo scroll-margin que Section", () => {
    expect(layout).not.toContain("scroll-mt-24");
    expect(layout).toContain("scroll-mt-[calc(4rem+var(--safe-top))]");
    expect(read("src/components/ui/Section.tsx")).toContain("scroll-mt-[calc(4rem+var(--safe-top))]");
  });
});

describe("D4: og:type", () => {
  const type = (lang: "es" | "en", path: string) => (buildMetadata({ lang, path, title: "t", description: "d" }).openGraph as { type: string }).type;
  it("profile en /about y website en el resto", () => {
    for (const lang of LANGS) {
      expect(type(lang, "/about")).toBe("profile");
      for (const path of ["/", "/contact", "/developers", "/privacy"]) expect(type(lang, path), path).toBe("website");
    }
  });
});

describe("D7: la sección «Selected projects» de llms.txt va en tercera persona", () => {
  for (const lang of LANGS) {
    it(lang, () => {
      const text = llmsTxt(lang);
      const section = text.slice(text.indexOf("## Selected projects"), text.indexOf("## Experience"));
      expect(section.length).toBeGreaterThan(200);
      expect(section).not.toMatch(/\b(my|I raised|I wrote|I built|I reported)\b/i);
      expect(section).not.toMatch(/\b(mi stack|subí|reporté|escribí|propio stack)\b/i);
    });
  }
  it("la descripción de la búsqueda semántica dice quién subió la precisión", () => {
    expect(llmsTxt("en")).toContain("He raised first-result precision from 67% to 80% (hit@1)");
    expect(llmsTxt("es")).toContain("Subió la precisión del primer resultado del 67% al 80% (hit@1)");
  });
});

describe("B4: la política de privacidad dice cómo llegan las portadas del blog", () => {
  it("es y en: las descarga y optimiza el servidor, y el navegador no pide nada a terceros", () => {
    const es = JSON.stringify(staticPage("privacy", "es"));
    const en = JSON.stringify(staticPage("privacy", "en"));
    expect(es).toMatch(/portadas de las entradas del blog/);
    expect(es).toMatch(/El servidor descarga y optimiza/);
    expect(es).toMatch(/tu navegador no pide nada a terceros/);
    expect(en).toMatch(/blog post covers/);
    expect(en).toMatch(/The server fetches and optimizes/);
    expect(en).toMatch(/your browser requests nothing from third parties/);
  });
  it("la frase de las tipografías es una oración completa con verbo", () => {
    expect(JSON.stringify(staticPage("privacy", "es"))).toContain("Next.js descarga Inter Tight e Instrument Serif al compilar y el sitio las sirve desde este mismo dominio");
    expect(JSON.stringify(staticPage("privacy", "en"))).toContain("Next.js downloads Inter Tight and Instrument Serif at build time and the site serves them from this same domain");
  });
});
