import Link from "next/link";
import { getDictionary } from "@/i18n";
import { localizedPath, type Lang } from "@/i18n/languages";
import { notFoundMarkdown } from "@/lib/markdown/documents";
import { localizedHtmlRoutes, machineHref } from "@/lib/routing/pages";
import { MACHINE_ROUTES } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Cuerpo del 404 con una salida para agentes: el mapa entero del sitio
 * (páginas, ficheros legibles por máquina y la API) y el mismo mapa en
 * markdown, literal. Un agente que pide `Accept: text/markdown` recibe
 * directamente ese markdown y ni ve esta página: lo resuelve `proxy.ts`.
 *
 * La página es una sola y lleva los dos idiomas: el bloque principal lleva el
 * `<h1>` y sus secciones `<h2>`; el secundario baja un nivel (`<h2>` y `<h3>`).
 */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const LINK = `text-[color:var(--light-1)] underline underline-offset-4 decoration-[color:var(--line)] hover:decoration-current ${FOCUS}`;
const H = "mb-4 text-[length:var(--step-2)] font-semibold tracking-[-0.02em] text-[color:var(--text)]";

export default function NotFoundBody({ lang, primary = lang === "es" }: { lang: Lang; primary?: boolean }) {
  const dict = getDictionary(lang).notFound;
  const markdown = notFoundMarkdown(undefined, lang);
  const ids = { pages: `paginas-${lang}`, machine: `maquina-${lang}`, agents: `agentes-${lang}` };
  const Sub = primary ? "h2" : "h3";

  return (
    <div className="py-12 md:py-20">
      <Container>
        <div className="max-w-[68ch]">
          <Eyebrow>{dict.eyebrow}</Eyebrow>
          <Display as={primary ? "h1" : "h2"} lead={dict.heading} size="text-[length:var(--step-4)]" className="mt-4" />
          <p data-answer className="mt-6 text-[length:var(--step-1)] leading-[1.55] text-[color:var(--serif-ink)]">
            {dict.body}
          </p>
          <Link prefetch={false} href={localizedPath(lang, "/")} className={`mt-4 inline-flex min-h-11 items-center ${LINK}`}>
            {dict.home}
          </Link>
        </div>

        <section className="mt-12" aria-labelledby={ids.pages}>
          <Sub id={ids.pages} className={H}>{dict.pages}</Sub>
          <ul className="grid list-none gap-3 sm:grid-cols-2">
            {localizedHtmlRoutes(lang).map((route) => (
              <li key={route.path} className="flex min-w-0">
                <Link
                  prefetch={false}
                  href={route.path}
                  className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] px-4 py-3 transition-colors hover:bg-[color:var(--bg-3)] ${FOCUS}`}
                >
                  <span className="text-[length:var(--step-0)] text-[color:var(--text)]">{route.title}</span>
                  <span className="text-[length:var(--step--1)] text-[color:var(--text-2)] [overflow-wrap:anywhere]">{route.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12 max-w-[68ch]" aria-labelledby={ids.machine}>
          <Sub id={ids.machine} className={H}>{dict.machine}</Sub>
          <ul className="flex list-none flex-col gap-1">
            {MACHINE_ROUTES.map((route) => {
              // Los ficheros con versión inglesa se enlazan bajo /en en el bloque inglés.
              const href = machineHref(route.path, lang);
              return (
                <li key={route.path} className="text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)] [overflow-wrap:anywhere]">
                  <a href={href} className={`inline-flex min-h-11 items-center ${LINK}`}>
                    {href}
                  </a>
                  <span> — {route.description[lang]}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby={ids.agents}>
          <Sub id={ids.agents} className={`${H} !mb-2`}>{dict.agents}</Sub>
          <p className="mb-4 max-w-[68ch] text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">
            {dict.agentsBefore}{" "}
            <code className="font-mono text-[color:var(--light-2)]">Accept: text/markdown</code>
            {dict.agentsAfter}
          </p>
          <div
            role="region"
            aria-label={dict.markdownRegion}
            tabIndex={0}
            className={`max-w-full overflow-x-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] ${FOCUS}`}
          >
            <pre className="w-max min-w-full p-4 font-mono text-[length:var(--step--1)] leading-relaxed text-[color:var(--text-2)] sm:text-sm">
              <code>{markdown}</code>
            </pre>
          </div>
        </section>
      </Container>
    </div>
  );
}
