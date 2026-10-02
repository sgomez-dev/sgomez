import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { hero } from "@/app/content";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Section } from "@/components/ui/Section";
import Portrait from "@/components/Portrait";
import GlassPoster from "@/components/GlassPoster";
import GlassStage from "@/components/GlassStage";

/** Capítulo 01. El cristal vive solo en la columna del retrato, nunca detrás del texto. */
export default function Hero({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  return (
    <Section id="top" className="!pt-6 sm:!pt-10 lg:!pt-14">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 sl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sl:gap-8">
          <div className="relative isolate mx-auto aspect-square w-[min(320px,100%)] lg:order-2 lg:ml-auto lg:w-full lg:max-w-[560px] sl:order-2 sl:w-[min(62svh,100%)]">
            <GlassStage id="hero" pauseLabel={d.lost.pause} className="absolute inset-0 -z-10">
              <GlassPoster className="h-full w-full" />
            </GlassStage>
            <Portrait alt={d.chapters.hero.portraitAlt} className="absolute bottom-0 left-0 w-[70%]" />
          </div>
          <div className="min-w-0 lg:order-1 sl:order-1">
            <Eyebrow>{d.chapters.hero.eyebrow}</Eyebrow>
            <Display
              as="h1"
              lead={`${hero.name.replace(/ Romero$/, "")}.`}
              serif={d.chapters.hero.serif}
              size="text-[length:clamp(44px,7vw,96px)]"
              motion="text-reveal"
              className="mt-4 !leading-[0.95] !tracking-[-0.045em]"
            />
            <p data-answer className="mt-6 max-w-[34rem] text-[length:var(--step-0)] leading-[1.55] text-[color:var(--text-2)]">
              {t(hero.subtitle, lang)}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#contact" variant="primary">{d.cta.talk}</ButtonLink>
              <ButtonLink href="#work" variant="ghost">{d.cta.work}</ButtonLink>
            </div>
            <p className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-[color:var(--line)] bg-[color:var(--bg-2)] px-4 py-2 text-[length:var(--step--1)] text-[color:var(--text-2)]">
              <span aria-hidden="true" className="size-2 rounded-full bg-[color:var(--light-2)] shadow-[0_0_10px_var(--light-2)]" />
              {d.chapters.hero.available}
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
