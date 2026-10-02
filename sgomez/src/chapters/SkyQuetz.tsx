import { imageProps } from "@/lib/image-props";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { skyquetz } from "@/app/content";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import MonogramReveal from "@/components/MonogramReveal";
import { WordReveal, wordRevealStyle } from "@/components/motion/WordReveal";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

/**
 * Capítulo 07. Secundario a propósito: el titular tope a 40 px, por debajo de
 * los 64 px del resto. El id `skyquetz` es el ancla a la que apunta el
 * breadcrumb del JSON-LD.
 */
export default function SkyQuetz({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  return (
    <Section id="skyquetz" labelledBy="skyquetz-h">
      <Container>
        <Eyebrow motion>{d.chapters.skyquetz.eyebrow}</Eyebrow>
        <Display as="h2" id="skyquetz-h" lead={d.chapters.skyquetz.heading} size="text-[length:clamp(1.75rem,1.5rem+1vw,2.5rem)]" motion="text-reveal" className="mt-4 max-w-[26ch]" />
        <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div className="flex min-w-0 flex-col gap-5">
            <div data-motion="monogram" className="self-start">
              <a href={skyquetz.url} rel="noopener" aria-label={`${skyquetz.name}, ${skyquetz.cta}`} className="inline-flex min-h-11 rounded-[var(--radius)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]">
                <MonogramReveal>
                  {/* eslint-disable-next-line @next/next/no-img-element -- imageProps: <img> normal, sin JS de cliente */}
                  <img {...imageProps({ src: skyquetz.logo, alt: t(skyquetz.logoAlt, lang), width: 425, height: 253 })} alt={t(skyquetz.logoAlt, lang)} className="h-20 w-auto sm:h-24" />
                </MonogramReveal>
              </a>
            </div>
            <p className="text-[length:var(--step-0)] italic text-[color:var(--serif-ink)]" lang="es">{skyquetz.slogan}</p>
            <p data-motion="lede" className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text-2)]">{t(skyquetz.desc, lang)}</p>
            {/* Su parte es la frase que se enciende palabra a palabra, como la bio. */}
            <p data-motion="word-reveal" style={wordRevealStyle(t(skyquetz.myPart, lang))} className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text)]">
              <WordReveal text={t(skyquetz.myPart, lang)} />
            </p>
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--line)]">
              {skyquetz.stats.map((s) => (
                <div key={t(s.label, "es")} className="flex min-w-0 flex-col-reverse justify-end gap-1 bg-[color:var(--bg-2)] p-3 sm:p-4">
                  <dt className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{t(s.label, lang)}</dt>
                  <dd className="text-[length:var(--step-2)] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--text)]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <a href={skyquetz.url} rel="noopener" className={`${linkClass} self-start`}>
              {skyquetz.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <p className="text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">{d.chapters.skyquetz.products}</p>
            <ul className="flex list-none flex-col gap-3 sm:gap-4">
              {skyquetz.products.map((prod) => (
                <li key={prod.name}>
                  <a
                    href={prod.url}
                    rel="noopener"
                    className="group flex min-h-11 flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-5 transition-colors hover:bg-[color:var(--bg-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
                  >
                    <span className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{t(prod.tagline, lang)}</span>
                    <span className="flex items-start justify-between gap-3 text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">
                      {prod.name}
                      <span aria-hidden="true" className="text-[color:var(--text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                    </span>
                    <span className="text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{t(prod.desc, lang)}</span>
                    <span className="flex flex-wrap gap-2">
                      {prod.stack.map((s) => (
                        <span key={s} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[length:var(--step--1)] text-[color:var(--text-2)]">{s}</span>
                      ))}
                    </span>
                    <span className="text-[length:var(--step--1)] text-[color:var(--light-2)]">{prod.cta}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
