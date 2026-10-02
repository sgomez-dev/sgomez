import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CaseStudy from "@/chapters/CaseStudy";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import { LANGS, isLang } from "@/i18n/languages";
import { getCaseStudy } from "@/lib/api/data";
import { caseSlugs, casePath } from "@/lib/routing/cases";
import { buildMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ lang: string; slug: string }> };

/** Solo los casos publicados (los tres textos en los dos idiomas); cualquier otro slug es el 404 a medida. */
export function generateStaticParams() {
  return LANGS.flatMap((lang) => caseSlugs().map((slug) => ({ lang, slug })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  const study = isLang(lang) ? getCaseStudy(slug, lang) : undefined;
  if (!isLang(lang) || !study) notFound();
  const d = getDictionary(lang).caseStudy;
  return buildMetadata({
    lang,
    path: casePath(slug),
    title: fill(d.metaTitle, { title: study.title }),
    description: fill(d.description, { title: study.title }),
    ogTitle: study.title,
    ogAltText: fill(d.ogAlt, { title: study.title }),
  });
}

export default async function Page({ params }: Props) {
  const { lang, slug } = await params;
  const study = isLang(lang) ? getCaseStudy(slug, lang) : undefined;
  if (!isLang(lang) || !study) notFound();
  return <CaseStudy lang={lang} study={study} />;
}
