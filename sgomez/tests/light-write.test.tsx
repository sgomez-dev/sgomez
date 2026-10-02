import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import { contrastRatio } from "@/lib/design/contrast";

const css = readFileSync(join(process.cwd(), "src", "motion", "motion.css"), "utf8");

describe("nombre escrito con luz", () => {
  for (const lang of ["es", "en"] as const) {
    const html = renderToStaticMarkup(<Hero lang={lang} />);
    it(`${lang}: el nombre entero va en un solo span, sin partir el apellido`, () => {
      expect(html).toMatch(/<span data-light-write="">Santiago Gómez de la Torre\.<\/span>/);
    });
    it(`${lang}: el h1 no lleva estado previo en el HTML`, () => expect(html).not.toMatch(/<h1[^>]*style=/));
  }
  it("la animación solo existe con movimiento permitido y sin tocar color, opacidad ni clip del texto", () => {
    const block = css.slice(css.indexOf("/* Nombre escrito con luz"), css.indexOf("/* Fin nombre escrito con luz */"));
    expect(block).toMatch(/prefers-reduced-motion: no-preference/);
    expect(block).toMatch(/data-motion-state="on"/);
    expect(block).toMatch(/\[data-light-write\]::after/);
    // isolation haría que el multiply se mezclara solo dentro del span y la capa se vería blanca
    expect(block).not.toMatch(/\[data-light-write\]\s*\{[^}]*(opacity|clip-path|color\s*:|isolation)/);
  });
  it("los colores de la banda cumplen AA sobre el fondo", () => {
    for (const c of ["#8FA8FF", "#6EF0DC"]) expect(contrastRatio(c, "#05060A")).toBeGreaterThanOrEqual(4.5);
  });
});
