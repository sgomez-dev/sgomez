import type { CSSProperties } from "react";
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
import HeroLoop from "@/components/HeroLoop";

/** Capítulo 01. El cristal vive solo en la columna del retrato, nunca detrás del texto. */
export default function Hero({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  return (
    <Section id="top" className="!pt-6 sm:!pt-10 lg:!pt-14">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10 sl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] sl:gap-8">
          <div className="relative isolate mx-auto aspect-square w-[min(320px,100%)] lg:order-2 lg:ml-auto lg:w-full lg:max-w-[560px] sl:order-2 sl:w-[min(62svh,100%)]">
            <GlassStage id="hero" pauseLabel={d.lost.pause} className="absolute inset-0 -z-10">
              <HeroLoop pauseLabel={d.lost.pause} />
              <GlassPoster className="h-full w-full" />
            </GlassStage>
            <Portrait alt={d.chapters.hero.portraitAlt} className="absolute bottom-0 left-0 w-[76%]" />
          </div>
          <div className="min-w-0 lg:order-1 sl:order-1">
            <Eyebrow intro={0}>{d.chapters.hero.eyebrow}</Eyebrow>
            <Display
              as="h1"
              lead={`${hero.name.replace(/ Romero$/, "")}.`}
              serif={d.chapters.hero.serif}
              size="text-[length:clamp(44px,7vw,96px)]"
              motion="text-reveal"
              light
              className="mt-4 !leading-[0.95] !tracking-[-0.045em]"
            />
            <p data-answer data-intro="" style={{ "--k": 1 } as CSSProperties} className="mt-6 max-w-[34rem] text-[length:var(--step-0)] leading-[1.55] text-[color:var(--text-2)]">
              {t(hero.subtitle, lang)}
            </p>
            <div data-intro="" style={{ "--k": 2 } as CSSProperties} className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="#contact" variant="primary">{d.cta.talk}</ButtonLink>
              <ButtonLink href="#work" variant="ghost">{d.cta.work}</ButtonLink>
            </div>
            <a
              href="#forgia"
              data-intro=""
              style={{ "--k": 3 } as CSSProperties}
              className="neu-sm neu-press mt-8 inline-flex min-h-11 items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 text-[length:var(--step--1)] font-medium text-[color:var(--text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
            >
              <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-[color:var(--nero)]">
                <span className="size-2 rounded-full bg-[color:var(--forge-gold)] shadow-[0_0_10px_var(--forge-gold)]" />
              </span>
              {d.chapters.hero.available}
              <span aria-hidden="true" className="text-[color:var(--text-2)]">↓</span>
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
