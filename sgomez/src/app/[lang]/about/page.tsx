import type { Metadata } from "next";
import StaticPageLayout from "@/app/components/StaticPageLayout";
import { findStaticPage } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/content/metadata";
import { localizedPath, type Lang } from "@/i18n/languages";

type Props = { params: Promise<{ lang: Lang }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return pageMetadata(findStaticPage(localizedPath(lang, "/about"))!);
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <StaticPageLayout page={findStaticPage(localizedPath(lang, "/about"))!} />;
}

export const dynamicParams = false;
