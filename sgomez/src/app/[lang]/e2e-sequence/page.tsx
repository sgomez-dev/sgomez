import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANGS, isLang } from "@/i18n/languages";
import { e2eFixturesEnabled } from "@/lib/e2e";
import { defineSequence } from "@/motion/scroll-sequence/manifest";
import ScrollSequence from "@/motion/scroll-sequence/ScrollSequence";

/** Solo para e2e/scroll-sequence.spec.ts (ver lib/e2e.ts). Sin E2E_FIXTURES no se genera ni se sirve. */
type Props = { params: Promise<{ lang: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => (e2eFixturesEnabled() ? LANGS.map((lang) => ({ lang })) : []);
export const metadata: Metadata = { robots: { index: false, follow: false } };

const FIXTURE = defineSequence("__fixture", 24, { w: 320, h: 180 }, { w: 160, h: 90 });

export default async function Page({ params }: Props) {
  const { lang } = await params;
  if (!e2eFixturesEnabled() || !isLang(lang)) notFound();
  return (
    <div className="px-4">
      <h1 className="pt-24 text-2xl">Fixture</h1>
      <div style={{ height: "250vh" }} />
      <section id="seq" className="mx-auto max-w-[40rem]">
        <ScrollSequence manifest={FIXTURE} />
      </section>
      <div style={{ height: "120vh" }} />
    </div>
  );
}
