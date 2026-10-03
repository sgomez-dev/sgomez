import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import { caseSlugs, isCaseSlug } from "@/lib/routing/cases";
import { OG_SIZE } from "@/lib/seo/metadata";
import { renderCaseOgImage } from "@/lib/seo/og-image";

/** Imagen Open Graph de cada caso de estudio, por idioma, generada en el build. El alt lo pone `buildMetadata`. */
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.flatMap((lang) => caseSlugs().map((slug) => ({ lang, slug })));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  if (!isLang(lang) || !isCaseSlug(slug)) notFound();
  return renderCaseOgImage(slug, lang);
}
