import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Hero from "@/chapters/Hero";
import Contact from "@/chapters/Contact";
import { getDictionary } from "@/i18n";

describe("GlassStage en el HTML del servidor", () => {
  for (const lang of ["es", "en"] as const) {
    const html = renderToStaticMarkup(<Hero lang={lang} />);
    it(`${lang}: el póster está, sin lienzo, sin botón y en estado poster`, () => {
      expect(html).toMatch(/data-glass="poster"/);
      expect(html).toMatch(/data-motion="glass"/);
      expect(html).not.toMatch(/<canvas/);
      expect(html).not.toMatch(/aria-pressed/);
      expect(html).not.toMatch(/(opacity: ?0|visibility: ?hidden)/);
    });
    it(`${lang}: el nombre del h1 sigue entero`, () => expect(html).toMatch(/<h1[^>]*>[\s\S]*Santiago Gómez de la Torre\./));
  }
  it("F5: una sola etiqueta de pausa, la misma clave que el 404", () => {
    expect(getDictionary("es").lost.pause).toBe("Pausar movimiento");
    expect(getDictionary("en").lost.pause).toBe("Pause motion");
    expect((getDictionary("es") as Record<string, unknown>).glass).toBeUndefined();
  });
});

describe("GlassStage en el contacto", () => {
  it("el póster del contacto va dentro de un GlassStage y sigue oculto por debajo de lg", () => {
    const html = renderToStaticMarkup(<Contact lang="es" />);
    expect(html).toMatch(/hidden[^"]*lg:block[^>]*>\s*<div[^>]*data-glass="poster"/);
    expect(html).not.toMatch(/<canvas/);
  });
});
