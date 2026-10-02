import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Certifications, { issuerMark } from "@/chapters/proof/Certifications";
import { getCertifications } from "@/lib/api/data";

describe("muro de certificaciones", () => {
  it("siglas legibles por emisor", () => {
    expect(issuerMark("HackerRank")).toBe("HR");
    expect(issuerMark("freeCodeCamp")).toBe("FCC");
    expect(issuerMark("NUWE")).toBe("NUWE");
    expect(issuerMark("Universidad Europea del Atlántico")).toBe("UEA");
    expect(issuerMark("Udemy")).toBe("Ud");
  });
  for (const lang of ["es", "en"] as const) {
    it(`${lang}: todas las certificaciones siguen en el HTML, cada una con su credencial`, () => {
      const html = renderToStaticMarkup(<Certifications lang={lang} />);
      for (const c of getCertifications(lang)) expect(html).toContain(`href="${c.credential_url.replace(/&/g, "&amp;")}"`);
      expect(html).toMatch(/<details/);
    });
  }
});
