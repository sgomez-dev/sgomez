import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import About from "@/chapters/About";
import Build from "@/chapters/Build";
import { siteFigures } from "@/lib/content/figures";

describe("capítulos 01–03 en HTML de servidor", () => {
  for (const lang of ["es", "en"] as const) {
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
    it(`${lang}: seis capas en Build`, () => expect(html.match(/data-motion="layer"/g)).toHaveLength(6));
    it(`${lang}: el cristal es decorativo`, () => expect(html).toMatch(/data-motion="glass"[^>]*aria-hidden="true"|aria-hidden="true"[^>]*data-motion="glass"/));
  }
});
