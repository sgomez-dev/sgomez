import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";

export type ContactIntent = "freelance" | "job" | "other";

/** Destinatario de los correos por intención: el de contacto público, no un buzón inventado. */
const TO = "contact@sgomez.dev";

/** `mailto:` con asunto y cuerpo del diccionario, codificados con encodeURIComponent. */
export function contactMailto(intent: ContactIntent, lang: Lang): string {
  const { subject, body } = getDictionary(lang).contact.intent[intent];
  return `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
