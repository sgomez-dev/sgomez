import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import About from "@/chapters/About";
import Build from "@/chapters/Build";
import { siteFigures } from "@/lib/content/figures";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";

const figuresMock = vi.hoisted(() => ({ override: null as null | { years: number | null; projects: number; certifications: number } }));
vi.mock("@/lib/content/figures", async (orig) => {
  const real = await orig<typeof import("@/lib/content/figures")>();
  return { ...real, siteFigures: (...a: Parameters<typeof real.siteFigures>) => figuresMock.override ?? real.siteFigures(...a) };
});

const count = (html: string) => (html.match(/data-motion="count"/g) ?? []).length;

describe("capítulos 01–03 en HTML de servidor", () => {
  for (const lang of ["es", "en"] as const) {
    const d = getDictionary(lang);
    const html = renderToStaticMarkup(<><Hero lang={lang} /><About lang={lang} /><Build lang={lang} /></>);
    it(`${lang}: nombre completo en el h1`, () => expect(html).toMatch(/<h1[^>]*>[\s\S]*Santiago Gómez de la Torre\.[\s\S]*<\/h1>/));
    it(`${lang}: hay frase de respuesta marcada`, () => expect(html).toMatch(/data-answer/));
    it(`${lang}: nada empieza invisible`, () => {
      expect(html).not.toMatch(/opacity:\s*0[;"]/);
      expect(html).not.toMatch(/visibility:\s*hidden/);
    });
    it(`${lang}: las cifras son las de los datos`, () => {
      const f = siteFigures();
      expect(html).toContain(`data-value="${f.projects}"`);
      expect(html).toContain(`data-value="${f.certifications}"`);
    });
    it(`${lang}: las etiquetas de las cifras están localizadas`, () => {
      for (const tpl of [d.figures.years, d.figures.projects, d.figures.certs]) {
        expect(html).toContain(fill(tpl, { n: "" }).trim());
      }
    });
    it(`${lang}: seis capas en Build`, () => expect(html.match(/data-motion="layer"/g)).toHaveLength(6));
    it(`${lang}: las capas salen en el orden del brief`, () => {
      const L = d.chapters.build.layers;
      const order = [L.interface, L.api, L.model, L.data, L.evaluation, L.infrastructure];
      const build = html.slice(html.indexOf('id="build"'));
      const pos = order.map((l) => build.indexOf(`</span>${l}</span>`));
      expect(pos.every((p) => p > 0)).toBe(true);
      expect([...pos].sort((a, b) => a - b)).toEqual(pos);
    });
    it(`${lang}: cada capa tiene al menos una tecnología`, () => {
      const layers = html.split('data-motion="layer"').slice(1);
      expect(layers).toHaveLength(6);
      for (const layer of layers) expect(layer.match(/<li class="rounded-full/g)?.length ?? 0).toBeGreaterThan(0);
    });
    it(`${lang}: el retrato es prioritario, con sizes y alt localizado`, () => {
      const img = html.match(/<img[^>]*>/)![0];
      expect(img).toContain('data-priority="true"');
      expect(img).toContain('sizes="(min-width:1024px) 40vw, 80vw"');
      expect(img).toContain(`alt="${d.chapters.hero.portraitAlt}"`);
    });
    it(`${lang}: el cristal es decorativo`, () => expect(html).toMatch(/data-motion="glass"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-motion="glass"/));
    it(`${lang}: tres cifras con años y dos sin ellos`, () => {
      expect(count(renderToStaticMarkup(<About lang={lang} />))).toBe(3);
      figuresMock.override = { years: null, projects: 7, certifications: 9 };
      try {
        expect(count(renderToStaticMarkup(<About lang={lang} />))).toBe(2);
      } finally {
        figuresMock.override = null;
      }
    });
  }
  it("el retrato localizado difiere entre idiomas", () => {
    expect(getDictionary("es").chapters.hero.portraitAlt).not.toBe(getDictionary("en").chapters.hero.portraitAlt);
  });
});
