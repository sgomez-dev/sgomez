import type { ReactNode } from "react";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { getEducation, getRecommendations } from "@/lib/api/data";
import Certifications from "@/chapters/proof/Certifications";
import { recommendationView } from "@/lib/content/recommendation-view";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

function Label({ children, id }: { children: ReactNode; id: string }) {
  return (
    <h3 id={id} className="text-[length:var(--step--1)] font-medium uppercase tracking-[0.14em] text-[color:var(--text-2)]">
      {children}
    </h3>
  );
}

const QUOTE = "text-[length:clamp(1.125rem,1.05rem+0.4vw,1.375rem)] leading-[1.5] tracking-[-0.005em] text-[color:var(--serif-ink)] [font-family:var(--font-serif),serif] [overflow-wrap:anywhere]";

/** Párrafos de una cita: cursiva solo en el primero. */
function Paragraphs({ text, lang }: { text: string; lang: string }) {
  return (
    <div className="flex flex-col gap-4">
      {text.split("\n\n").map((para, i) => (
        <p key={para} lang={lang} className={`${QUOTE} ${i === 0 ? "italic" : ""}`}>
          {para}
        </p>
      ))}
    </div>
  );
}

/**
 * Capítulo 08. Recomendaciones (la cita es siempre el original en español; en
 * inglés la traducción es la cita visible, etiquetada, y el original va en un
 * `<details>` cerrado), certificaciones, formación y,
 * como `children`, las últimas entradas del blog (componente asíncrono que el
 * servidor resuelve en la página).
 */
export default function Proof({ lang, children }: { lang: Lang; children?: ReactNode }) {
  const d = getDictionary(lang);
  const recommendations = getRecommendations(lang);
  const education = getEducation(lang);
  return (
    <Section id="proof" labelledBy="proof-h">
      <Container>
        <Eyebrow motion>{d.chapters.proof.eyebrow}</Eyebrow>
        <Display as="h2" id="proof-h" lead={d.chapters.proof.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />

        <div className="mt-10 lg:mt-14" role="group" aria-labelledby="proof-recs">
          <Label id="proof-recs">{d.chapters.proof.recommendations}</Label>
          <ul className="mt-6 flex list-none flex-col gap-10 sm:gap-12 lg:gap-14">
            {recommendations.map((r) => {
              const v = recommendationView(r, lang);
              return (
                <li key={r.slug} data-motion="quote" className="min-w-0 border-t border-[color:var(--line)] pt-8">
                  <figure className="min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-10">
                    <figcaption className="mb-5 flex flex-col gap-1 lg:mb-0">
                      <a
                        href={r.recommender_url}
                        rel="noopener"
                        className={`inline-flex min-h-11 items-center text-[length:var(--step-1)] font-semibold tracking-[-0.02em] text-[color:var(--text)] underline-offset-4 hover:underline ${focus}`}
                      >
                        {r.name}
                      </a>
                      <span className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{r.date}</span>
                    </figcaption>
                    <div className="min-w-0 max-w-[62ch]">
                      {/* La etiqueta es texto visible del sitio, no parte de la cita: va fuera del blockquote, justo encima. */}
                      {v.translation ? (
                        <p className="mb-3 text-[length:var(--step--1)] uppercase tracking-[0.12em] text-[color:var(--text-2)]">{v.translatedLabel}</p>
                      ) : null}
                      <blockquote className="min-w-0">
                        {v.translation ? (
                          <>
                            <Paragraphs text={v.translation} lang="en" />
                            <details className="group/orig mt-5">
                              <summary className={`inline-flex min-h-11 cursor-pointer items-center text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline ${focus}`}>
                                {d.recommendations.readOriginal}
                                <svg aria-hidden="true" focusable="false" viewBox="0 0 12 12" className="ml-2 h-[1em] w-[1em] shrink-0 transition-transform group-open/orig:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M4.5 2 8.5 6 4.5 10" />
                                </svg>
                              </summary>
                              <div lang={v.quoteLang} className="mt-2 flex flex-col gap-3 border-l-2 border-[color:var(--line)] pl-4">
                                {v.quote.split("\n\n").map((para) => (
                                  <p key={para} className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text-2)]">
                                    {para}
                                  </p>
                                ))}
                              </div>
                            </details>
                          </>
                        ) : (
                          <Paragraphs text={v.quote} lang={v.quoteLang} />
                        )}
                      </blockquote>
                    </div>
                  </figure>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-16 lg:mt-24" role="group" aria-labelledby="proof-certs">
          <Label id="proof-certs">{d.chapters.proof.certifications}</Label>
          <Certifications lang={lang} />
        </div>

        <div className="mt-16 lg:mt-24" role="group" aria-labelledby="proof-edu">
          <Label id="proof-edu">{d.chapters.proof.education}</Label>
          <ul className="mt-6 flex list-none flex-col gap-3">
            {education.map((e) => (
              <li key={e.slug} className="flex min-w-0 flex-col gap-1 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4 sm:p-5">
                <span className="text-[length:var(--step-1)] font-semibold tracking-[-0.02em] text-[color:var(--text)]">{e.institution}</span>
                <span className="text-[length:var(--step-0)] text-[color:var(--text-2)]">{e.detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {children}
      </Container>
    </Section>
  );
}
