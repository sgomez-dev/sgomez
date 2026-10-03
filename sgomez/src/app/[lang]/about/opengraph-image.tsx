import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import { OG_SIZE } from "@/lib/seo/metadata";
import { renderPageOgImage } from "@/lib/seo/og-image";

/** Imagen Open Graph de /about por idioma, generada en el build. El alt lo pone `buildMetadata`. */
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return renderPageOgImage("/about", lang);
}
