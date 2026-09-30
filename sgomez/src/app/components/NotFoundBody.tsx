import Link from "next/link";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { notFoundMarkdown } from "@/lib/markdown/documents";
import { localizedHtmlRoutes } from "@/lib/routing/pages";
import { MACHINE_ROUTES } from "@/lib/site";

/**
 * Cuerpo del 404 con un salida para agentes: el mapa entero del sitio
 * (páginas, ficheros legibles por máquina y la API) y el mismo mapa en
 * markdown, literal. Un agente que pide `Accept: text/markdown` recibe
 * directamente ese markdown y ni ve esta página: lo resuelve `proxy.ts`.
 */
export default function NotFoundBody({ lang }: { lang: Lang }) {
  const dict = getDictionary(lang).notFound;
  const x = (spanish: string, english: string) => (lang === "es" ? spanish : english);
  const markdown = notFoundMarkdown(undefined, lang);

  return (
    <div className="min-h-screen py-20 md:py-28">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-400">{dict.eyebrow}</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white leading-tight">
          {dict.heading}
        </h1>
        <p className="mt-5 text-lg text-gray-400 font-light leading-relaxed">
          {dict.body}
        </p>

        <section className="mt-14" aria-labelledby={`paginas-${lang}`}>
          <h2 id={`paginas-${lang}`} className="text-xl font-bold text-white mb-4">{x("Páginas", "Pages")}</h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {localizedHtmlRoutes(lang).map((route) => (
              <li key={route.path}>
                <Link
                  prefetch={false}
                  href={route.path}
                  className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3 hover:bg-white/[0.04] hover:border-violet-500/20 transition-all duration-300 card-hover"
                >
                  <span className="text-sm text-gray-300">{route.title}</span>
                  <span className="font-mono text-xs text-gray-600">{route.path}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby={`maquina-${lang}`}>
          <h2 id={`maquina-${lang}`} className="text-xl font-bold text-white mb-4">{x("Ficheros legibles por máquina", "Machine-readable files")}</h2>
          <ul className="space-y-2">
            {MACHINE_ROUTES.map((route) => (
              <li key={route.path} className="text-gray-400 font-light text-sm">
                <a href={route.path} className="font-mono text-violet-400 hover:text-violet-300 transition-colors">
                  {route.path}
                </a>
                <span className="text-gray-600"> — {route.description}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-labelledby={`agentes-${lang}`}>
          <h2 id={`agentes-${lang}`} className="text-xl font-bold text-white mb-2">{x("Para agentes", "For agents")}</h2>
          <p className="text-gray-500 font-light text-sm mb-4">
            {x("El mismo mapa en markdown. Pidiendo", "The same map in markdown. Sending")}{" "}
            <code className="font-mono text-violet-300">Accept: text/markdown</code>{x(" se recibe solo esto, sin el HTML.", " returns only this, without the HTML.")}
          </p>
          <pre className="glass rounded-xl p-4 overflow-x-auto text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
            <code>{markdown}</code>
          </pre>
        </section>
        </div>
      </div>
    </div>
  );
}
