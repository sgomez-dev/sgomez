import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { contactLinks } from "@/app/content";
import { IDENTITY } from "@/app/seo";
import { contactMailto, type ContactIntent } from "@/lib/contact/mailto";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import GlassPoster from "@/components/GlassPoster";

const CV = "/CV_Santiago_Gómez_de_la_Torre_Romero.pdf";
const INTENTS: ContactIntent[] = ["freelance", "job", "other"];

const focus =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]";
const linkClass = `inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline ${focus}`;

/**
 * Capítulo 09. Cierre: tres intenciones que abren el correo ya redactado, el
 * correo en texto plano, los perfiles que están en `IDENTITY.sameAs` (Facebook
 * sigue en los datos pero no se muestra). El CV cuelga de la intención de empleo. El cristal es decoración.
 */
export default function Contact({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const sameAs: readonly string[] = IDENTITY.sameAs;
  const profiles = contactLinks.filter((l) => sameAs.includes(l.url));
  return (
    <Section id="contact" labelledBy="contact-h">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <Eyebrow>{d.chapters.contact.eyebrow}</Eyebrow>
            <Display
              as="h2"
              id="contact-h"
              lead={d.chapters.contact.heading}
              serif={d.chapters.contact.serif}
              size="text-[length:var(--step-5)]"
              motion="text-reveal"
              className="mt-4"
            />
            <ul className="mt-10 grid list-none gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-14">
              {INTENTS.map((intent) => {
                const c = d.contact.intent[intent];
                return (
                  <li key={intent} className="flex min-w-0 flex-col gap-1">
                    <a
                      href={contactMailto(intent, lang)}
                      className={`group flex min-h-11 w-full flex-1 flex-col gap-3 rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--bg-2)] p-5 transition-colors hover:bg-[color:var(--bg-3)] ${focus}`}
                    >
                      <span className="flex items-start justify-between gap-3 text-[length:var(--step-1)] font-semibold leading-[1.15] tracking-[-0.02em] text-[color:var(--text)]">
                        {c.label}
                        <span aria-hidden="true" className="text-[color:var(--text-2)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                      </span>
                      <span className="text-[length:var(--step-0)] leading-[1.55] text-[color:var(--text-2)]">{c.desc}</span>
                    </a>
                    {intent === "job" ? (
                      <a href={CV} download className={linkClass}>
                        {d.cta.cv}
                        <span aria-hidden="true">↓</span>
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <p className="mt-8 text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">{d.contact.emailLabel}</p>
            <a
              href={`mailto:${IDENTITY.email}`}
              className={`mt-1 inline-flex min-h-11 items-center text-[length:var(--step-2)] font-semibold tracking-[-0.02em] text-[color:var(--text)] underline-offset-4 [overflow-wrap:anywhere] hover:underline ${focus}`}
            >
              {IDENTITY.email}
            </a>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-1">
              <p className="text-[length:var(--step--1)] uppercase tracking-[0.14em] text-[color:var(--text-2)]">{d.contact.profiles}</p>
              {profiles.map((p) => (
                <a key={p.url} href={p.url} rel="noopener" className={linkClass}>
                  {p.label}
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </div>
          <div className="relative isolate mx-auto hidden aspect-square w-full max-w-[420px] lg:block">
            <GlassPoster className="absolute inset-0 h-full w-full" />
          </div>
        </div>
      </Container>
    </Section>
  );
}
