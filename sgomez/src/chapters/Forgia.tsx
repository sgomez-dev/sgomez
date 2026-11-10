import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { forgia } from "@/app/content";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import MonogramReveal from "@/components/MonogramReveal";
import { WordReveal, wordRevealStyle } from "@/components/motion/WordReveal";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--forge-hot)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";

/** La llamada principal de la losa: oro de Forgia con su relieve, como un botón de forgia.es. */
const GOLD_BUTTON =
  "inline-flex min-h-12 items-center gap-2 rounded-full bg-[linear-gradient(180deg,#e8d5a8,#c9a96e)] px-6 py-2.5 text-[length:var(--step-0)] font-semibold text-[#0e0e0e] shadow-[inset_0_1px_0_#ffffff80,0_12px_28px_-10px_#c9a96e99] transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--forge-gold)]";

/** Cada tramo va del color de su nudo al del siguiente: de arriba abajo, el raíl entero pasa del teal del bot al oro. */
const RAIL = [
  "linear-gradient(to bottom, var(--forge-teal), color-mix(in oklab, var(--forge-teal) 50%, var(--forge-hot)))",
  "linear-gradient(to bottom, color-mix(in oklab, var(--forge-teal) 50%, var(--forge-hot)), var(--forge-hot) 60%, var(--forge-gold))",
];

/** Brasa ambiente del capítulo: un fondo, no una capa posicionada, así que no puede desbordar a 320. */
const SECTION_STYLE: CSSProperties = {
  backgroundImage:
    "radial-gradient(48rem 28rem at 88% 92%, color-mix(in oklab, var(--forge-gold) 12%, transparent), transparent 70%), radial-gradient(36rem 22rem at 6% 0%, color-mix(in oklab, var(--forge-teal) 9%, transparent), transparent 70%)",
};

/**
 * Capítulo de Forgia, el primero tras la portada (v4): hoy es casi todo su tiempo. Va en una losa Nero de su marca
 * hundida en la porcelana del sitio (`.forge-slab` en globals.css invierte los tokens de texto dentro), con su titular a
 * tamaño de capítulo grande, la franja «Confían en Forgia» de forgia.es y dos llamadas. El ancla es `forgia`; el
 * nodo del grafo es `#forgia-org` (seo.ts) y no se repite aquí.
 *
 * La marca es «La Forja»: cada lead entra frío y sale al rojo. Tres adornos llevan esa idea, todos `aria-hidden` y en su
 * estado final en el HTML del servidor (sin JS, con movimiento reducido o sin `animation-timeline` se ven encendidos):
 * - el punto del logotipo es la brasa (`data-ember`), que se enciende al subir el capítulo; si el logotipo se forma con
 *   cristal (MonogramReveal), la brasa se esconde mientras suena el vídeo, que acaba con ella apagada, y al terminar se
 *   enciende por tiempo (motion.css);
 * - un raíl une los nudos de las tres piezas y se calienta de arriba abajo con el scroll (`data-forge-rail`, un tramo
 *   por pieza); cada nudo prende cuando el calor lo alcanza (`data-forge-node`), en teal el del bot y en oro el de la persona;
 * - cada tarjeta lleva su tramo de la rampa de temperatura (`data-forge-bar`), que leído de arriba abajo va de frío a oro.
 * El CSS vive en motion.css. Las tarjetas suben como el resto (`data-motion="piece"`).
 */
export default function Forgia({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const c = d.chapters.forgia;
  return (
    <Section id="forgia" labelledBy="forgia-h" className="!pt-6 sm:!pt-10">
      <Container>
        <div className="forge-slab relative isolate overflow-hidden px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-20" style={SECTION_STYLE}>
        <Eyebrow motion className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-[color:var(--forge-gold)] shadow-[0_0_12px_var(--forge-gold)]" />
          {c.eyebrow}
        </Eyebrow>
        <Display
          as="h2"
          id="forgia-h"
          lead={c.heading}
          serif={c.headingSerif}
          serifTone="text-[color:var(--forge-hot)]"
          size="text-[length:var(--step-5)]"
          motion="text-reveal"
          className="mt-5 max-w-[18ch] text-balance !tracking-[-0.05em]"
        />
        <div className="mt-10 grid gap-12 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
          <div data-forge-col="" className="flex min-w-0 flex-col gap-5">
            <a
              href={forgia.url}
              rel="noopener"
              aria-label={`${forgia.name}, ${forgia.cta}`}
              className="inline-flex min-h-11 self-start rounded-[var(--radius)] py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
            >
              {/* Con movimiento, el logotipo se forma con cristal una vez al entrar (MonogramReveal, como el de SkyQuetz). */}
              <MonogramReveal>
                {/* eslint-disable-next-line @next/next/no-img-element -- SVG estático de 1,6 KB: sin optimizador ni JS de cliente */}
                <img src={forgia.logo} alt={t(forgia.logoAlt, lang)} width={4945} height={728} decoding="async" data-reveal="forgia" className="h-9 w-auto sm:h-12" />
                {/* La brasa: tapa el punto del logotipo (centro al 98,08 % y al 86,95 % de la caja del SVG). */}
                <span
                  aria-hidden="true"
                  data-ember=""
                  className="pointer-events-none absolute left-[98.08%] top-[86.95%] aspect-square w-[4.2%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
              </MonogramReveal>
            </a>
            <p data-motion="lede" className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text-2)]">{t(forgia.desc, lang)}</p>
            {/* Su parte es la frase que se enciende palabra a palabra, como en SkyQuetz. */}
            <p data-motion="word-reveal" style={wordRevealStyle(t(forgia.myPart, lang))} className="text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text)]">
              <WordReveal text={t(forgia.myPart, lang)} />
            </p>
            <dl className="grid grid-cols-3 gap-2 sm:gap-3">
              {forgia.stats.map((s) => (
                <div key={s.value} className="flex min-w-0 flex-col-reverse justify-end gap-1 rounded-[var(--radius)] bg-[color:var(--bg-2)] p-3 shadow-[inset_0_1px_0_#ffffff0f,0_10px_24px_-12px_#000] sm:p-4">
                  <dt className="text-[length:var(--step--1)] uppercase tracking-[0.1em] text-[color:var(--text-2)]">{t(s.label, lang)}</dt>
                  <dd className="text-[length:var(--step-2)] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[color:var(--text)]">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a href={forgia.url} rel="noopener" className={GOLD_BUTTON}>
                {c.visit}
                <span className="sr-only">, {forgia.cta}</span>
                <span aria-hidden="true">↗</span>
              </a>
              <a href={forgia.url} rel="noopener" className={`${linkClass} px-2`}>
                {forgia.cta}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
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
        <div className="mt-14 border-t border-[color:var(--line)] pt-10 lg:mt-20">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h3 className="text-[length:var(--step-1)] font-semibold tracking-[-0.02em] text-[color:var(--text)]">{c.clients}</h3>
            <p className="text-[length:var(--step--1)] text-[color:var(--text-2)]">{c.clientsNote}</p>
          </div>
          <ul className="mt-6 grid list-none grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 [&>li:last-child:nth-child(odd)]:col-span-2 sm:[&>li:last-child:nth-child(odd)]:col-span-1">
            {forgia.clients.map((cl) => (
              <li key={cl.name} className="min-w-0">
                <a
                  href={cl.url}
                  rel="noopener"
                  className="group flex h-24 min-h-11 items-center justify-center rounded-[var(--radius)] bg-[color:var(--bg-2)] px-5 shadow-[inset_0_1px_0_#ffffff0f] transition-[background-color,transform] duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--bg-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--forge-gold)] sm:h-28"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- AVIF estático y pequeño, sin optimizador */}
                  <img
                    src={cl.logo}
                    alt={cl.name}
                    width={cl.w}
                    height={cl.h}
                    loading="lazy"
                    decoding="async"
                    className="max-h-[52%] w-auto max-w-[80%] object-contain opacity-75 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </a>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </Container>
    </Section>
  );
}
