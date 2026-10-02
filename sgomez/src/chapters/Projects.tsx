import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import Link from "next/link";
import { getCaseStudies, getProjects } from "@/lib/api/data";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import ProjectReel from "@/components/ProjectReel";
import { hasReel } from "@/lib/reels";
import { hardPercent } from "@/lib/content/localized";

const FEATURED = 3;

const initials = (title: string) => {
  const words = title.split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  return (words.length > 1 ? words[0]![0]! + words[1]![0]! : (words[0] ?? "").slice(0, 2)).toUpperCase();
};

/** Capítulo 05. Fichas de producto: las tres primeras ocupan dos columnas y llevan marco de dispositivo. */
export default function Projects({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const projects = getProjects(lang);
  // La ficha es un `<a>` externo, así que el caso de estudio va en un segundo enlace interno al lado, sin anidar enlaces.
  const cases = new Map(getCaseStudies(lang).map((study) => [study.slug, study]));
  return (
    <Section id="work" labelledBy="work-h">
      <Container>
        <Eyebrow>{d.chapters.work.eyebrow}</Eyebrow>
        <Display as="h2" id="work-h" lead={d.chapters.work.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />
        <ul className="mt-10 grid list-none grid-flow-row-dense gap-3 sm:gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {projects.map((p, i) => {
            const featured = i < FEATURED;
            const study = cases.get(p.slug);
            const reel = featured && hasReel(p.slug);
            return (
              <li key={p.slug} data-motion="tile" data-index={i} className={`flex min-w-0 flex-col gap-1 ${featured ? "lg:col-span-2" : ""}`}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener"
                  className={`group flex min-h-11 flex-1 flex-col gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4 transition-colors hover:border-[color-mix(in_oklab,var(--light-1)_45%,transparent)] hover:bg-[color:var(--bg-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)] sm:p-5 ${featured ? "lg:flex-row" : ""}`}
                >
                  {featured ? (
                    <div className={`flex flex-col rounded-[calc(var(--radius)-4px)] border border-[color:var(--line)] bg-[color:var(--bg)] p-2 ${reel ? "lg:w-[40%]" : "lg:w-[34%]"} lg:shrink-0 lg:self-start`}>
                      <div className="mb-2 flex gap-1.5" aria-hidden="true">
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                      </div>
                      {reel ? (
                        <ProjectReel slug={p.slug} />
                      ) : (
                        <div
                          data-motion="reel"
                          className="flex aspect-[16/9] flex-1 flex-col lg:aspect-auto lg:justify-between items-start justify-between gap-3 overflow-hidden rounded-[8px] border border-[color:var(--line)] bg-[color:var(--bg-2)] bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklab,var(--light-1)_16%,transparent),transparent_60%)] p-4 sm:p-5"
                        >
                          <span aria-hidden="true" className="text-[length:var(--step-4)] font-semibold leading-none tracking-[-0.06em] text-[color:var(--text)]">{initials(p.title)}</span>
                          <span className="flex flex-wrap gap-1.5">
                            {p.stack.map((s) => (
                              <span key={s} className="rounded-full border border-[color:var(--line)] px-2.5 py-0.5 text-[length:var(--step--1)] text-[color:var(--text-2)]">{s}</span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3">
                    <h3 className="flex items-start justify-between gap-3 text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">
                      <span className="min-w-0 [overflow-wrap:anywhere]">
                        {p.title}
                        {/* WCAG 2.5.3: el nombre accesible debe contener el texto visible, así que no se usa aria-label; la acción va como texto solo para lectores. */}
                        <span className="sr-only">. {d.projects.open}</span>
                      </span>
                      <span aria-hidden="true" className="shrink-0 text-[color:var(--text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                    </h3>
                    <p className="flex-1 text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{hardPercent(p.description)}</p>
                    {featured && !reel ? null : (
                      <ul className="flex flex-wrap gap-2">
                        {p.stack.map((s) => (
                          <li key={s} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[length:var(--step--1)] text-[color:var(--text-2)]">
                            {s}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </a>
                {study ? (
                  <Link
                    prefetch={false}
                    href={study.path}
                    data-case-link={p.slug}
                    className="inline-flex min-h-11 items-center self-start px-1 text-[length:var(--step--1)] font-medium text-[color:var(--light-1)] underline underline-offset-4 decoration-[color:var(--line)] hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
                  >
                    {d.caseStudy.viewCase}
                    {/* WCAG 2.5.3: el nombre accesible contiene el texto visible y añade de qué proyecto es. */}
                    <span className="sr-only">. {p.title}</span>
                    <span aria-hidden="true">&nbsp;→</span>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
