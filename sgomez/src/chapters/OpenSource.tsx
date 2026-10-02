import type { CSSProperties } from "react";
import { hardPercent } from "@/lib/content/localized";
import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { CLAUDE_CANVAS } from "@/app/seo";
import { getProjects } from "@/lib/api/data";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { BuildTrace } from "@/components/motion/BuildTrace";

const SKILLS_URL = "https://skills.sgomez.dev";
const NUDAUI_URL = "https://nudaui.dev";
const CANVAS_REPO = "sgomez-dev/claude-canvas";

/** Atribución de Claude Canvas, completa y sin abreviar; cada idioma usa su constante de seo.ts. */
const attribution = (lang: Lang) => (lang === "en" ? CLAUDE_CANVAS.attribution : CLAUDE_CANVAS.attributionEs);

function Links({ links }: { links: { href: string; label: string }[] }) {
  return (
    <div className="mt-auto flex flex-wrap gap-x-5 gap-y-1 pt-2">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          rel="noopener"
          className="inline-flex min-h-11 items-center gap-1.5 text-[length:var(--step-0)] font-medium text-[color:var(--light-2)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--light-1)]"
        >
          {l.label}
          <span aria-hidden="true">↗</span>
        </a>
      ))}
    </div>
  );
}

/** Capítulo 06. Tres bloques; cada uno con sus capas (contorno, relleno, contenido) para la fase 2. */
export default function OpenSource({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const nudaui = getProjects(lang).find((p) => p.slug === "nudaui");
  const blocks = [
    {
      key: "nudaui",
      name: "NudaUI",
      desc: nudaui?.description ?? "",
      note: null as string | null,
      links: [{ href: NUDAUI_URL, label: "nudaui.dev" }],
    },
    {
      key: "claude-canvas",
      name: CLAUDE_CANVAS.name,
      desc: lang === "en" ? CLAUDE_CANVAS.descriptionEn : CLAUDE_CANVAS.description,
      note: attribution(lang),
      links: [
        { href: CLAUDE_CANVAS.url, label: "claude-canvas.sgomez.dev" },
        { href: CLAUDE_CANVAS.repo, label: CANVAS_REPO },
      ],
    },
    {
      key: "claude-skills",
      name: "claude-skills",
      desc: d.chapters.openSource.skillsDesc,
      note: null,
      links: [{ href: SKILLS_URL, label: "skills.sgomez.dev" }],
    },
  ];
  return (
    <Section id="open-source" labelledBy="open-source-h">
      <Container>
        <Eyebrow motion>{d.chapters.openSource.eyebrow}</Eyebrow>
        <Display as="h2" id="open-source-h" lead={d.chapters.openSource.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />
        <ul className="mt-10 grid list-none gap-3 sm:gap-4 lg:mt-14 lg:grid-cols-3">
          {blocks.map((b, i) => (
            <li key={b.key} data-motion="build" data-index={i} style={{ "--i": i } as CSSProperties} className="relative isolate flex min-w-0">
              <BuildTrace />
              <div data-layer="outline" aria-hidden="true" className="absolute inset-0 -z-20 rounded-[var(--radius)] border border-[color-mix(in_oklab,var(--light-1)_35%,transparent)]" />
              <div data-layer="fill" aria-hidden="true" className="absolute inset-[1px] -z-10 rounded-[calc(var(--radius)-1px)] bg-[color:var(--bg-3)]" />
              <div data-layer="content" className="flex w-full flex-col gap-4 p-5 sm:p-6">
                <h3 className="text-[length:var(--step-2)] font-semibold leading-[1.1] tracking-[-0.03em] text-[color:var(--text)] [overflow-wrap:anywhere]">{b.name}</h3>
                <p className="text-[length:var(--step-0)] leading-[1.6] text-[color:var(--text-2)]">{hardPercent(b.desc)}</p>
                {b.note ? (
                  <p className="border-l-2 border-[color:var(--light-1)] pl-4 text-[length:var(--step-0)] leading-[1.55] text-[color:var(--text)]">{b.note}</p>
                ) : null}
                <Links links={b.links} />
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
