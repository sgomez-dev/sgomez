import Link from "next/link";
import type { Block, StaticPage } from "@/lib/content/pages";
import { tokenizeInline } from "@/lib/content/inline";
import { markdownVariantOf } from "@/lib/markdown/routing";
import { getDictionary } from "@/i18n";
import { localizedPath } from "@/i18n/languages";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";

/**
 * Maqueta compartida de las páginas de contenido (/about, /contact, /privacy,
 * /developers).
 *
 * Render de servidor y sin animaciones: son páginas de texto que un agente
 * también va a leer. Nav, Footer y el enlace de salto los pone el layout de
 * `[lang]`; aquí solo va el artículo, en una columna de 68ch. Las tablas y el
 * código se desplazan dentro de su propia región, nunca la página.
 */

const FOCUS =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const LINK = `text-[color:var(--light-1)] underline underline-offset-4 decoration-[color:var(--line)] hover:decoration-current ${FOCUS}`;
const BODY = "text-[length:var(--step-0)] leading-[1.7] text-[color:var(--text-2)] [overflow-wrap:anywhere]";

function Inline({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((token, index) => {
        if (token.kind === "strong") return <strong key={index} className="font-semibold text-[color:var(--text)]">{token.value}</strong>;
        if (token.kind === "code") return <code key={index} className="font-mono text-[0.9em] text-[color:var(--light-2)]">{token.value}</code>;
        return <span key={index}>{token.value}</span>;
      })}
    </>
  );
}

function BlockView({ block, tableLabel, codeLabel }: { block: Block; tableLabel: string; codeLabel: string }) {
  switch (block.kind) {
    case "paragraph":
      return <p className={BODY}><Inline text={block.text} /></p>;

    case "list":
      return (
        <ul className="flex list-none flex-col gap-2.5">
          {block.items.map((item, index) => (
            <li key={index} className={`${BODY} relative pl-5`}>
              <span className="absolute left-0 top-[0.75em] h-1.5 w-1.5 rounded-full bg-[color:var(--light-1)]" aria-hidden="true" />
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div
          role="region"
          aria-label={tableLabel}
          tabIndex={0}
          className={`max-w-full overflow-x-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] ${FOCUS}`}
        >
          <table className="w-full min-w-max text-left text-[length:var(--step--1)] sm:text-sm">
            <thead>
              <tr className="border-b border-[color:var(--line)]">
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="whitespace-nowrap px-4 py-3 text-[length:var(--step--1)] font-medium uppercase tracking-[0.12em] text-[color:var(--text-2)]">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={index} className="border-b border-[color:var(--line)] last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className={cellIndex === 0 ? "whitespace-nowrap px-4 py-3 font-mono text-[color:var(--text)]" : "min-w-[14rem] px-4 py-3 text-[color:var(--text-2)]"}>
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
        <div
          role="region"
          aria-label={codeLabel}
          tabIndex={0}
          className={`max-w-full overflow-x-auto rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] ${FOCUS}`}
        >
          <pre className="w-max min-w-full p-4 font-mono text-[length:var(--step--1)] leading-relaxed text-[color:var(--text)] sm:text-sm">
            <code>{block.code}</code>
          </pre>
        </div>
      );

    case "links":
      return (
        <ul className="flex list-none flex-col gap-1">
          {block.items.map((item) => {
            const external = item.href.startsWith("http") || item.href.startsWith("mailto:");
            return (
              <li key={item.href} className={BODY}>
                <a
                  href={item.href}
                  {...(external && item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`inline-flex min-h-11 items-center ${LINK}`}
                >
                  {item.label}
                </a>
                {item.note ? <span className="text-[color:var(--text-2)]"> — {item.note}</span> : null}
              </li>
            );
          })}
        </ul>
      );
  }
}

export default function StaticPageLayout({ page }: { page: StaticPage }) {
  const variant = markdownVariantOf(page.path);
  const d = getDictionary(page.lang).staticPage;

  return (
    <div className="py-12 md:py-20">
      <Container>
        <article className="max-w-[68ch]">
          <Link prefetch={false} href={localizedPath(page.lang, "/")} className={`inline-flex min-h-11 items-center text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)] hover:text-[color:var(--text)] ${FOCUS}`}>
            <span aria-hidden="true">←&nbsp;</span>
            {d.home}
          </Link>

          <header className="mb-14 mt-6">
            <Display lead={page.title} size="text-[length:var(--step-4)]" />
            <p data-answer className="mt-6 text-[length:var(--step-1)] leading-[1.55] text-[color:var(--serif-ink)] [overflow-wrap:anywhere]">
              {page.lead}
            </p>
          </header>

          <div className="flex flex-col gap-14">
            {page.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="mb-5 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)] [overflow-wrap:anywhere]">{section.heading}</h2>
                <div className="flex flex-col gap-4">
                  {section.blocks.map((block, index) => (
                    <BlockView key={index} block={block} tableLabel={d.tableRegion} codeLabel={d.codeRegion} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* La variante markdown, anunciada también en el <head> y en el
              header Link: quien lee esta página en un navegador puede querer
              la versión que leen los agentes. */}
          <p className="mt-16 border-t border-[color:var(--line)] pt-4">
            <a href={variant} className={`inline-flex min-h-11 items-center text-[length:var(--step--1)] uppercase tracking-[0.14em] ${LINK}`}>
              {d.viewMarkdown}
            </a>
          </p>
        </article>
      </Container>
    </div>
  );
}
