import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { experience } from "@/app/content";
import { getExperience } from "@/lib/api/data";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

/**
 * Capítulo 04. Lista vertical en móvil; desde md, una pista horizontal que se
 * desplaza dentro de sí misma (nunca el documento), con imán en cada tarjeta.
 */
export default function Experience({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const entries = getExperience(lang);
  return (
    <Section id="experience" labelledBy="experience-h" dataAttrs={{ "data-pin": "" }} style={{ "--n": entries.length } as CSSProperties}>
      <div data-pin-stage="" className="flex flex-col justify-center">
      <Container>
        <Eyebrow>{d.chapters.experience.eyebrow}</Eyebrow>
        <Display as="h2" id="experience-h" lead={d.chapters.experience.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />
      </Container>
      <Container className="mt-10 [container-type:inline-size] lg:mt-14">
        <ol
          data-motion="timeline"
          tabIndex={0}
          aria-labelledby="experience-h"
          className="flex min-w-0 list-none flex-col gap-3 pb-1 md:snap-x md:snap-mandatory md:flex-row md:gap-4 md:overflow-x-auto md:overscroll-x-contain md:pb-5 md:[scrollbar-color:var(--line)_transparent] md:[scrollbar-width:thin] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--light-1)]"
        >
          {entries.map((e, i) => (
            <li
              key={e.slug}
              data-motion="card"
              data-index={i}
              className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-5 sm:p-6 md:w-[min(360px,72vw)] md:shrink-0 md:snap-start"
            >
              <p data-e="period" className="text-[length:var(--step--1)] uppercase tracking-[0.12em] tabular-nums text-[color:var(--text-2)] [font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace]">
                {e.period}
              </p>
              <h3 data-e="role" className="text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">{e.role}</h3>
              <p data-e="org" className="text-[length:var(--step-0)] text-[color:var(--light-2)]">{e.organization}</p>
              <p data-e="desc" className="text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{e.description}</p>
              <p data-e="summary" aria-hidden="true" className="hidden">
                {t(experience[i].summary, lang)}
              </p>
            </li>
          ))}
        </ol>
        <div data-pin-progress="" aria-hidden="true" className="mt-6 hidden h-0.5 w-full origin-left bg-[color:var(--light-1)]" />
      </Container>
      </div>
    </Section>
  );
}
