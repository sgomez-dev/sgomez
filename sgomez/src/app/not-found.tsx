import type { Metadata } from "next";
import Link from "next/link";
import { notFoundMarkdown } from "@/lib/markdown/documents";
import { HTML_ROUTES, MACHINE_ROUTES } from "@/lib/site";

/**
 * 404 con un cuerpo del que un agente pueda salir solo.
 *
 * El estado ya era 404 de verdad: lo que faltaba era el cuerpo. Un 404 que
 * dice "no encontrado" y nada más deja al agente adivinando la siguiente URL;
 * este publica el mapa entero —páginas, ficheros legibles por máquina y los
 * puntos de entrada de la API— y además incluye el mismo mapa en markdown,
 * literal, para el que no sepa leer el HTML de alrededor. Un agente que pide
 * `Accept: text/markdown` recibe directamente ese markdown y ni ve esta
 * página: de eso se encarga `middleware.ts`.
 */
export const metadata: Metadata = {
  title: "404 — Página no encontrada | sgomez.dev",
  description:
    "La ruta pedida no existe en sgomez.dev. Desde aquí se llega al inicio, a las páginas publicadas, al sitemap, a llms.txt y a la API pública.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const markdown = notFoundMarkdown();

  return (
    <main className="min-h-screen py-20 md:py-28">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-400">Error 404</p>
        <h1 className="mt-4 text-4xl md:text-6xl font-bold text-white leading-tight">
          Esta página <span className="gradient-text">no existe</span>
        </h1>
        <p className="mt-5 text-lg text-gray-400 font-light leading-relaxed">
          La URL que has pedido no está publicada en sgomez.dev. Abajo está todo lo que sí lo está.
        </p>

        <section className="mt-14" aria-labelledby="paginas">
          <h2 id="paginas" className="text-xl font-bold text-white mb-4">Páginas</h2>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {HTML_ROUTES.map((route) => (
              <li key={route.path}>
                <Link
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

        <section className="mt-12" aria-labelledby="maquina">
          <h2 id="maquina" className="text-xl font-bold text-white mb-4">Ficheros legibles por máquina</h2>
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

        <section className="mt-12" aria-labelledby="agentes">
          <h2 id="agentes" className="text-xl font-bold text-white mb-2">Para agentes</h2>
          <p className="text-gray-500 font-light text-sm mb-4">
            El mismo mapa en markdown. Pidiendo{" "}
            <code className="font-mono text-violet-300">Accept: text/markdown</code> se recibe solo esto, sin el HTML.
          </p>
          <pre className="glass rounded-xl p-4 overflow-x-auto text-xs font-mono text-gray-400 leading-relaxed whitespace-pre-wrap">
            <code>{markdown}</code>
          </pre>
        </section>
        </div>
      </div>
    </main>
  );
}
