import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import LostStage from "@/chapters/lost/LostStage";

describe("LostExperience dentro del escenario", () => {
  for (const lang of ["es", "en"] as const) {
    it(`${lang}: el HTML del servidor sigue con los siete enlaces visibles y sin vídeo, canvas ni botón`, () => {
      const html = renderToStaticMarkup(<LostStage lang={lang} />);
      expect(html.match(/<a [^>]*data-shard-id/g)).toHaveLength(7);
      expect(html).not.toMatch(/<video/);
      expect(html).not.toMatch(/<canvas/);
      expect(html).not.toMatch(/data-lost-cover/);
      expect(html).not.toMatch(/aria-pressed/);
      expect(html).toMatch(/data-stage-poster="end"/);
      expect(html).not.toMatch(/(opacity: ?0|visibility: ?hidden|display: ?none)/);
    });
  }
  it("las capas estáticas llevan la marca que la secuencia usa para ocultarlas", () => {
    const html = renderToStaticMarkup(<LostStage lang="en" />);
    expect(html).toMatch(/data-lost-static/);
  });
});
