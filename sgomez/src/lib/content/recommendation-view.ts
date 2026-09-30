import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import type { Recommendation } from "@/lib/api/data";

/**
 * Qué se enseña de una recomendación. La cita es siempre el original en
 * español; en inglés se añade la traducción con su etiqueta, para que nunca se
 * presente como palabras del autor.
 */
export function recommendationView(
  r: Recommendation,
  lang: Lang,
): { quote: string; quoteLang: "es"; translation?: string; translatedLabel?: string } {
  const view = { quote: r.comment, quoteLang: r.original_language };
  if (lang !== "en" || !r.comment_translation) return view;
  return { ...view, translation: r.comment_translation, translatedLabel: getDictionary(lang).recommendations.translated };
}
