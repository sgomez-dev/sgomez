import Link from "next/link";
import type { Block, StaticPage } from "@/lib/content/pages";
import { tokenizeInline } from "@/lib/content/inline";
import { markdownVariantOf } from "@/lib/markdown/routing";

/**
 * Maqueta compartida de las páginas de contenido (/about, /contact, /privacy,
 * /developers).
 *
 * Render de servidor y sin animaciones: son páginas de texto que un agente
 * también va a leer, y la home ya carga suficiente JavaScript. Los tokens
 * visuales (glass, gradient-text, la retícula de container-custom) son los
 * mismos que el resto del sitio, así que se lee como una página más y no como
 * un anexo pegado por fuera.
 */

function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((token, index) => {
        if (token.kind === "strong") return <strong key={index} className="text-gray-200 font-semibold">{token.value}</strong>;
        if (token.kind === "code") return <code key={index} className="font-mono text-[0.9em] text-violet-300">{token.value}</code>;
        return <span key={index}>{token.value}</span>;
      })}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="text-gray-400 font-light leading-relaxed"><Inline text={block.text} /></p>;

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, index) => (
            <li key={index} className="text-gray-400 font-light leading-relaxed pl-5 relative">
              <span className="absolute left-0 top-[0.6em] w-1.5 h-1.5 rounded-full bg-violet-500/60" aria-hidden="true" />
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="glass rounded-xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {block.head.map((cell) => (
                  <th key={cell} className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-violet-400 whitespace-nowrap">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={index} className="border-b border-white/[0.03] last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={cellIndex === 0 ? "px-4 py-3 font-mono text-xs text-gray-300 whitespace-nowrap" : "px-4 py-3 text-gray-400 font-light"}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "code":
      return (
        <pre className="glass rounded-xl p-4 overflow-x-auto text-xs md:text-sm font-mono text-gray-300 leading-relaxed">
          <code>{block.code}</code>
        </pre>
      );

    case "links":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item) => {
            const external = item.href.startsWith("http") || item.href.startsWith("mailto:");
            return (
              <li key={item.href} className="text-gray-400 font-light leading-relaxed">
                <a
                  href={item.href}
                  {...(external && item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="font-mono text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {item.label}
                </a>
                {item.note ? <span className="text-gray-500"> — {item.note}</span> : null}
              </li>
            );
          })}
        </ul>
      );
  }
}

export default function StaticPageLayout({ page }: { page: StaticPage }) {
  const variant = markdownVariantOf(page.path);

  return (
    <main className="min-h-screen py-20 md:py-28">
      {/* La columna de lectura va DENTRO de container-custom: `max-w-3xl`
          en el mismo elemento no gana, porque `.container-custom` se define
          después en globals.css y fija su propio max-width. */}
      <div className="container-custom">
        <div className="mx-auto max-w-3xl">
        <Link href="/" className="font-mono text-xs uppercase tracking-wider text-gray-500 hover:text-violet-400 transition-colors">
          ← sgomez.dev
        </Link>

        <header className="mt-8 mb-14">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">{page.title}</h1>
          <p className="mt-5 text-lg text-gray-400 font-light leading-relaxed">{page.lead}</p>
        </header>

        <div className="space-y-14">
          {page.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-5">{section.heading}</h2>
              <div className="space-y-4">
                {section.blocks.map((block, index) => (
                  <BlockView key={index} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-20 pt-8 border-t border-white/[0.06] flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-gray-600">
          <Link href="/" className="hover:text-violet-400 transition-colors">Inicio</Link>
          <Link href="/about" className="hover:text-violet-400 transition-colors">Sobre mí</Link>
          <Link href="/contact" className="hover:text-violet-400 transition-colors">Contacto</Link>
          <Link href="/developers" className="hover:text-violet-400 transition-colors">Developers</Link>
          <Link href="/privacy" className="hover:text-violet-400 transition-colors">Privacidad</Link>
          {/* La variante markdown, anunciada también en el <head> y en el
              header Link: quien lee esta página en un navegador puede querer
              la versión que leen los agentes. */}
          <a href={variant} className="hover:text-violet-400 transition-colors">Esta página en markdown</a>
        </footer>
        </div>
      </div>
    </main>
  );
}
