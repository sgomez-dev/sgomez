import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { getProjects } from "@/lib/api/data";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

const FEATURED = 3;

/** Capítulo 05. Fichas de producto: las tres primeras ocupan dos columnas y llevan marco de dispositivo. */
export default function Projects({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const projects = getProjects(lang);
  return (
    <Section id="work" labelledBy="work-h">
      <Container>
        <Eyebrow>{d.chapters.work.eyebrow}</Eyebrow>
        <Display as="h2" id="work-h" lead={d.chapters.work.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />
        <ul className="mt-10 grid list-none grid-flow-row-dense gap-3 sm:gap-4 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {projects.map((p, i) => {
            const featured = i < FEATURED;
            return (
              <li key={p.slug} data-motion="tile" data-index={i} className={`min-w-0 ${featured ? "lg:col-span-2" : ""}`}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${p.title} — ${d.projects.open}`}
                  className={`group flex h-full min-h-11 flex-col gap-4 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-4 transition-colors hover:border-[color-mix(in_oklab,var(--light-1)_45%,transparent)] hover:bg-[color:var(--bg-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)] sm:p-5 ${featured ? "lg:flex-row" : ""}`}
                >
                  {featured ? (
                    <div className="flex flex-col rounded-[calc(var(--radius)-4px)] border border-[color:var(--line)] bg-[color:var(--bg)] p-2 lg:w-[46%] lg:shrink-0">
                      <div className="mb-2 flex gap-1.5" aria-hidden="true">
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                        <span className="size-2 rounded-full bg-[color:var(--line)]" />
                      </div>
                      <div
                        data-motion="reel"
                        className="flex aspect-[16/9] flex-1 flex-col lg:aspect-auto lg:min-h-[200px] items-start justify-end gap-2 overflow-hidden rounded-[8px] border border-[color:var(--line)] bg-[color:var(--bg-2)] bg-[radial-gradient(120%_90%_at_0%_0%,color-mix(in_oklab,var(--light-1)_16%,transparent),transparent_60%)] p-4 sm:p-5"
                      >
                        <span className="text-[length:var(--step-2)] font-semibold leading-[1.1] tracking-[-0.03em] text-[color:var(--text)]">{p.title}</span>
                        <span className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{p.stack.join(" · ")}</span>
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col gap-3">
                    <h3 className="flex items-start justify-between gap-3 text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">
                      <span className="min-w-0 [overflow-wrap:anywhere]">{p.title}</span>
                      <span aria-hidden="true" className="shrink-0 text-[color:var(--text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                    </h3>
                    <p className="flex-1 text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{p.description}</p>
                    {featured ? null : (
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
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
