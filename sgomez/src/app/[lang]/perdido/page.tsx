import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { LANGS, isLang } from "@/i18n/languages";
import LostStage from "@/chapters/lost/LostStage";
import SiteMap from "@/chapters/lost/SiteMap";

/**
 * Molde del 404. No es una página pública: `proxy.ts` la pide con la cabecera
 * de bypass y la devuelve con estado 404 en cualquier URL desconocida. Fuera del
 * sitemap, `noindex`.
 */
type Props = { params: Promise<{ lang: string }> };

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return { title: getDictionary(lang).notFound.eyebrow, robots: { index: false, follow: true } };
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <>
      <LostStage lang={lang} />
      <SiteMap lang={lang} />
    </>
  );
}
