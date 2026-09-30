import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import type { Lang } from "@/i18n/languages";
import { about } from "@/app/content";
import { t } from "@/lib/content/localized";
import { siteFigures } from "@/lib/content/figures";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";

/** Capítulo 02. Las cifras salen de los datos; si los años no se pueden derivar, son dos, no tres. */
export default function About({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const figures = siteFigures();
  const [lead, ...rest] = t(about.description, lang)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const items: { key: string; n: number; template: string }[] = [
    ...(figures.years === null ? [] : [{ key: "years", n: figures.years, template: d.figures.years }]),
    { key: "projects", n: figures.projects, template: d.figures.projects },
    { key: "certs", n: figures.certifications, template: d.figures.certs },
  ];
  return (
    <Section id="about" labelledBy="about-h">
      <Container>
        <Eyebrow>{d.chapters.about.eyebrow}</Eyebrow>
        <Display as="h2" id="about-h" lead={d.chapters.about.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[22ch]" />
        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
          <p data-motion="text-reveal" className="lg:sticky lg:top-[calc(4rem+var(--safe-top)+2rem)] lg:self-start text-[length:clamp(1.5rem,1.2rem+1.2vw,1.75rem)] font-medium leading-[1.3] tracking-[-0.02em] text-[color:var(--text)]">
            {lead}
          </p>
          <div className="space-y-5 text-[length:var(--step-0)] leading-[1.65] text-[color:var(--text-2)]">
            {rest.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <dl className="mt-14 grid gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--line)] bg-[color:var(--line)] sm:grid-cols-[repeat(auto-fit,minmax(0,1fr))]">
          {items.map((it) => (
            <div key={it.key} className="flex flex-col-reverse justify-end gap-2 bg-[color:var(--bg-2)] p-6">
              <dt className="text-[length:var(--step-0)] text-[color:var(--text-2)]">{fill(it.template, { n: "" }).trim()}</dt>
              <dd data-motion="count" data-value={it.n} className="text-[length:var(--step-4)] font-semibold leading-none tracking-[-0.04em] text-[color:var(--text)]">
                {it.n}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </Section>
  );
}
