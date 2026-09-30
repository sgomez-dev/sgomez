import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import { OG_ALT, OG_SIZE } from "@/lib/seo/metadata";
import { renderOgImage } from "@/lib/seo/og-image";

/**
 * Imagen Open Graph por idioma: `/opengraph-image` (español, el proxy lo
 * reescribe a `/es/…`) y `/en/opengraph-image`. Se genera en el build, una vez
 * por idioma. El `alt` que lleva cada página sale de `buildMetadata`, que es el
 * que sí conoce el idioma; el de aquí es el del español, el idioma por defecto.
 */
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = OG_ALT.es;
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return renderOgImage(lang);
}
