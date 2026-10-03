import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { forgia } from "@/app/content";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { WordReveal, wordRevealStyle } from "@/components/motion/WordReveal";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--forge-hot)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

/** Cada tramo va del color de su nudo al del siguiente: de arriba abajo, el raíl entero pasa del teal del bot al oro. */
const RAIL = [
  "linear-gradient(to bottom, var(--forge-teal), color-mix(in oklab, var(--forge-teal) 50%, var(--forge-hot)))",
  "linear-gradient(to bottom, color-mix(in oklab, var(--forge-teal) 50%, var(--forge-hot)), var(--forge-hot) 60%, var(--forge-gold))",
];

/** Brasa ambiente del capítulo: un fondo, no una capa posicionada, así que no puede desbordar a 320. */
const SECTION_STYLE: CSSProperties = {
  backgroundImage:
    "radial-gradient(48rem 28rem at 88% 92%, color-mix(in oklab, var(--forge-gold) 7%, transparent), transparent 70%)",
};

/**
 * Capítulo de Forgia, justo después de SkyQuetz y con su mismo peso (titular tope a 40 px). El ancla es `forgia`; el
 * nodo del grafo es `#forgia-org` (seo.ts) y no se repite aquí.
 *
 * La marca es «La Forja»: cada lead entra frío y sale al rojo. Tres adornos llevan esa idea, todos `aria-hidden` y en su
 * estado final en el HTML del servidor (sin JS, con movimiento reducido o sin `animation-timeline` se ven encendidos):
 * - el punto del logotipo es la brasa (`data-ember`), que se enciende al subir el capítulo;
 * - un raíl une los nudos de las tres piezas y se calienta de arriba abajo con el scroll (`data-forge-rail`, un tramo
 *   por pieza); cada nudo prende cuando el calor lo alcanza (`data-forge-node`), en teal el del bot y en oro el de la persona;
 * - cada tarjeta lleva su tramo de la rampa de temperatura (`data-forge-bar`), que leído de arriba abajo va de frío a oro.
 * El CSS vive en motion.css. Las tarjetas suben como el resto (`data-motion="piece"`).
 */
export default function Forgia({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const c = d.chapters.forgia;
  return (
    <Section id="forgia" labelledBy="forgia-h" style={SECTION_STYLE}>
      <Container>
        <Eyebrow motion>{c.eyebrow}</Eyebrow>
        <Display
          as="h2"
          id="forgia-h"
          lead={c.heading}
          serif={c.headingSerif}
          serifTone="text-[color:var(--forge-hot)]"
          size="text-[length:clamp(1.75rem,1.5rem+1vw,2.5rem)]"
          motion="text-reveal"
          className="mt-4 max-w-[26ch] text-balance"
        />
        <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div data-forge-col="" className="flex min-w-0 flex-col gap-5">
            <a
              href={forgia.url}
              rel="noopener"
              aria-label={`${forgia.name}, ${forgia.cta}`}
              className="inline-flex min-h-11 self-start rounded-[var(--radius)] py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
            >
              <span className="relative inline-flex">
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático de 1,6 KB: sin optimizador ni JS de cliente */}
                <img src={forgia.logo} alt={t(forgia.logoAlt, lang)} width={4945} height={728} decoding="async" className="h-8 w-auto sm:h-10" />
                {/* La brasa: tapa el punto del logotipo (centro al 98,08 % y al 86,95 % de la caja del SVG). */}
                <span
                  aria-hidden="true"
                  data-ember=""
                  className="pointer-events-none absolute left-[98.08%] top-[86.95%] aspect-square w-[4.2%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
              </span>
            </a>
            <p data-motion="lede" className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text-2)]">{t(forgia.desc, lang)}</p>
            {/* Su parte es la frase que se enciende palabra a palabra, como en SkyQuetz. */}
            <p data-motion="word-reveal" style={wordRevealStyle(t(forgia.myPart, lang))} className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text)]">
              <WordReveal text={t(forgia.myPart, lang)} />
            </p>
            <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--line)]">
              {forgia.stats.map((s) => (
                <div key={s.value} className="flex min-w-0 flex-col-reverse justify-end gap-1 bg-[color:var(--bg-2)] p-3 sm:p-4">
                  <dt className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{t(s.label, lang)}</dt>
                  <dd className="text-[length:var(--step-2)] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--text)]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <a href={forgia.url} rel="noopener" className={`${linkClass} self-start`}>
              {forgia.cta}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="flex min-w-0 flex-col gap-4">
            <p className="text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">{c.pieces}</p>
            <ol data-forge="" className="relative flex list-none flex-col gap-3 pl-8 sm:gap-4 sm:pl-10">
              {forgia.pieces.map((p, i) => {
                const you = p.who === "you";
                const last = i === forgia.pieces.length - 1;
                return (
                  <li key={p.name.es} data-forge-piece="" className="relative" style={{ "--i": i } as CSSProperties}>
                    {/* El tramo del raíl hasta el nudo siguiente: la pista apagada y, encima, el calor que baja por ella. */}
                    {last ? null : (
                      <span
                        aria-hidden="true"
                        data-forge-track=""
                        className="absolute -left-[1.3125rem] top-[1.875rem] h-[calc(100%+0.75rem)] w-0.5 bg-[color:var(--line)] sm:-left-[1.8125rem] sm:h-[calc(100%+1rem)]"
                      >
                        <span data-forge-rail="" className="absolute inset-0" style={{ backgroundImage: RAIL[i] }} />
                      </span>
                    )}
                    <span
                      aria-hidden="true"
                      data-forge-node={p.who}
                      className="absolute -left-[1.625rem] top-6 size-3 rounded-full sm:-left-[2.125rem]"
                    />
                    <div
                      data-motion="piece"
                      className={`relative flex flex-col gap-3 overflow-hidden rounded-[var(--radius)] border bg-[color:var(--bg-2)] p-5 ${you ? "border-[color:color-mix(in_oklab,var(--forge-gold)_32%,transparent)]" : "border-[color:var(--line)]"}`}
                    >
                      <span className="flex items-center justify-between gap-3 text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${you ? "bg-[color:var(--forge-gold)]" : "bg-[color:var(--forge-teal)]"}`} />
                          {you ? c.whoYou : c.whoBot}
                        </span>
                        <span aria-hidden="true" className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      </span>
                      <span className="text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">{t(p.name, lang)}</span>
                      <span className="text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{t(p.desc, lang)}</span>
                      {/* Su tramo de la rampa: las tres tarjetas, de arriba abajo, leen frío, teal y oro. */}
                      <span
                        aria-hidden="true"
                        data-forge-bar=""
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-[linear-gradient(90deg,var(--forge-cold),var(--forge-teal)_38%,var(--forge-hot)_72%,var(--forge-gold))] bg-[length:300%_100%]"
                        style={{ backgroundPosition: `${i * 50}% 0` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </Container>
    </Section>
  );
}
