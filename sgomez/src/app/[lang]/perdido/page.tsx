import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { LANGS, isLang, localizedPath } from "@/i18n/languages";
import SiteMap from "@/chapters/lost/SiteMap";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";

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

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const BTN = `inline-flex min-h-11 items-center rounded-full border border-[color:var(--line)] px-5 py-2 text-[length:var(--step-0)] text-[color:var(--text)] transition-colors hover:bg-[color:var(--bg-3)] ${FOCUS}`;

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDictionary(lang).notFound;
  return (
    <>
      <div className="pt-12 md:pt-20">
        <Container>
          <div className="max-w-[68ch]">
            <Eyebrow>{dict.eyebrow}</Eyebrow>
            <Display lead={dict.heading} serif={dict.headingSerif} size="text-[length:var(--step-4)]" className="mt-4" />
            <p data-answer className="mt-6 text-[length:var(--step-1)] leading-[1.55] text-[color:var(--serif-ink)]">
              {dict.body}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link prefetch={false} href={localizedPath(lang, "/")} className={BTN}>
                {dict.home}
              </Link>
              <a href="#mapa" className={BTN}>
                {dict.map}
              </a>
            </div>
          </div>
        </Container>
      </div>
      <SiteMap lang={lang} />
    </>
  );
}
