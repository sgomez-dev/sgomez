import { describe, expect, it } from "vitest";
import { contactMailto } from "@/lib/contact/mailto";
import { recommendationView } from "@/lib/content/recommendation-view";
import { getRecommendations } from "@/lib/api/data";
import { getDictionary } from "@/i18n";

describe("contacto por intención", () => {
  for (const lang of ["es", "en"] as const) for (const intent of ["freelance", "job", "other"] as const) {
    it(`${lang}/${intent}`, () => {
      const url = new URL(contactMailto(intent, lang));
      expect(url.protocol).toBe("mailto:");
      expect(url.pathname).toBe("contact@sgomez.dev");
      expect(url.searchParams.get("subject")).toBe(getDictionary(lang).contact.intent[intent].subject);
      expect(url.searchParams.get("body")).toBe(getDictionary(lang).contact.intent[intent].body);
    });
  }
});

describe("recomendaciones", () => {
  it("en inglés: cita original en español y traducción etiquetada", () => {
    const [r] = getRecommendations("en");
    const v = recommendationView(r!, "en");
    expect(v.quote).toBe(r!.comment);
    expect(v.quoteLang).toBe("es");
    expect(v.translation).toBe(r!.comment_translation);
    expect(v.translatedLabel).toBe(getDictionary("en").recommendations.translated);
  });
  it("en español: solo la cita, sin traducción", () => {
    const v = recommendationView(getRecommendations("es")[0]!, "es");
    expect(v.translation).toBeUndefined();
  });
});
