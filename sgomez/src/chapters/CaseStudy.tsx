import Link from "next/link";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import { localizedPath, type Lang } from "@/i18n/languages";
import { getCaseStudies, type CaseStudy as CaseStudyData } from "@/lib/api/data";
import { markdownVariantOf } from "@/lib/markdown/routing";
import { hasReel } from "@/lib/reels";
import { JsonLd } from "@/lib/seo/JsonLdScript";
import { caseStudyGraph } from "@/lib/seo/jsonld";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import ProjectReel from "@/components/ProjectReel";

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const LINK = `text-[color:var(--light-1)] underline underline-offset-4 decoration-[color:var(--line)] hover:decoration-current ${FOCUS}`;
const BODY = "text-[length:var(--step-0)] leading-[1.7] text-[color:var(--text-2)] [overflow-wrap:anywhere]";
const H2 = "mb-5 text-[length:var(--step-2)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)] [overflow-wrap:anywhere]";
const SECTION = "scroll-mt-[calc(4rem+var(--safe-top))]";

/** `2026-10-02` en la forma larga del idioma, siempre en UTC para que el servidor y el cliente digan lo mismo. */
function longDate(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-GB", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

/** Lo que se ve de un enlace externo: el host y la ruta, sin esquema ni barra final. */
const shown = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

/**
 * Página de un caso de estudio (`/{lang}/work/{slug}`): frase de respuesta, problema, rol, stack, resultado, enlaces y
 * la fecha de su `updated` en un `<time>`. Render de servidor y de texto: el reel del capítulo 05 es decoración y el
 * contenido no depende de él. El texto sale de `content/index.tsx` (lo escribió el dueño) y de los diccionarios.
 */
export default function CaseStudy({ lang, study }: { lang: Lang; study: CaseStudyData }) {
  const d = getDictionary(lang).caseStudy;
  const title = study.title;
  const others = getCaseStudies(lang).filter((c) => c.slug !== study.slug);
  const home = localizedPath(lang, "/");
  const workHref = home === "/" ? "/#work" : `${home}#work`;

  return (
    <div className="py-12 md:py-20">
      {/* El único @graph de la página: persona, sitio, esta página y el caso (SoftwareSourceCode o CreativeWork). */}
      <JsonLd data={caseStudyGraph(study, lang)} />
      <Container>
        <article className="max-w-[68ch]">
          {/* Ancla de la home: `<a>` simple y no Link, porque el router de Next duplica el hash. */}
          <a
            href={workHref}
            className={`inline-flex min-h-11 items-center text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)] hover:text-[color:var(--text)] ${FOCUS}`}
          >
            <span aria-hidden="true">←&nbsp;</span>
            {d.back}
          </a>

          <header className="mb-14 mt-6">
            <Eyebrow>{d.eyebrow}</Eyebrow>
            <Display lead={title} size="text-[length:var(--step-4)]" className="mt-4" />
            <p data-answer className="mt-6 text-[length:var(--step-1)] leading-[1.55] text-[color:var(--serif-ink)] [overflow-wrap:anywhere]">
              {fill(d.lead, { title })}
            </p>
            <p className="mt-4 text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">
              {d.updated} <time dateTime={study.updated}>{longDate(study.updated, lang)}</time>
            </p>
          </header>

          {hasReel(study.slug) ? (
            <div className="mb-14" role="img" aria-label={d.reelLabel}>
              <ProjectReel slug={study.slug} />
            </div>
          ) : null}

          <div className="flex flex-col gap-14">
            <section id="problem" aria-labelledby="problem-h" className={SECTION}>
              <h2 id="problem-h" className={H2}>{d.problem}</h2>
              <p className={BODY}>{study.problem}</p>
            </section>

            <section id="role" aria-labelledby="role-h" className={SECTION}>
              <h2 id="role-h" className={H2}>{d.role}</h2>
              <p className={BODY}>{study.role}</p>
            </section>

            <section id="stack" aria-labelledby="stack-h" className={SECTION}>
              <h2 id="stack-h" className={H2}>{d.stack}</h2>
              <ul className="flex list-none flex-wrap gap-2">
                {study.stack.map((s) => (
                  <li key={s} className="rounded-full border border-[color:var(--line)] px-3 py-1 text-[length:var(--step--1)] text-[color:var(--text-2)]">
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section id="outcome" aria-labelledby="outcome-h" className={SECTION}>
              <h2 id="outcome-h" className={H2}>{d.outcome}</h2>
              <p className={BODY}>{study.outcome}</p>
            </section>

            <section id="links" aria-labelledby="links-h" className={SECTION}>
              <h2 id="links-h" className={H2}>{d.links}</h2>
              <ul className="flex list-none flex-col gap-1">
                <li className={BODY}>
                  <a href={study.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${LINK}`}>
                    {d.source}
                  </a>
                  <span>, {shown(study.url)}</span>
                </li>
                {study.repo ? (
                  <li className={BODY}>
                    <a href={study.repo} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${LINK}`}>
                      {d.repo}
                    </a>
                    <span>, {shown(study.repo)}</span>
                  </li>
                ) : null}
                {study.based_on ? (
                  <li className={BODY}>
                    <a href={study.based_on.url} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${LINK}`}>
                      {fill(d.basedOn, { name: study.based_on.name, author: study.based_on.author })}
                    </a>
                  </li>
                ) : null}
              </ul>
            </section>

            {others.length > 0 ? (
              <section id="related" aria-labelledby="related-h" className={SECTION}>
                <h2 id="related-h" className={H2}>{d.related}</h2>
                <ul className="flex list-none flex-col gap-1">
                  {others.map((c) => (
                    <li key={c.slug} className={BODY}>
                      <Link prefetch={false} href={c.path} className={`inline-flex min-h-11 items-center ${LINK}`}>
                        {c.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <p className="mt-16 border-t border-[color:var(--line)] pt-4">
            <a
              href={markdownVariantOf(study.path)}
              className={`inline-flex min-h-11 items-center text-[length:var(--step--1)] uppercase tracking-[0.14em] ${LINK}`}
            >
              {getDictionary(lang).staticPage.viewMarkdown}
            </a>
          </p>
        </article>
      </Container>
    </div>
  );
}
