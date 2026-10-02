import { getDictionary } from "@/i18n";
import type { Lang } from "@/i18n/languages";
import { technologies } from "@/app/content";
import { IDENTITY } from "@/app/seo";
import { t } from "@/lib/content/localized";
import { Container } from "@/components/ui/Container";
import { Display } from "@/components/ui/Display";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { defineSequence } from "@/motion/scroll-sequence/manifest";
import ScrollSequence from "@/motion/scroll-sequence/ScrollSequence";

/** Las seis losas que se apilan (video/src/BuildSequence.tsx). Sin texto: la lista de al lado es la leyenda. */
const BUILD_SEQUENCE = defineSequence("build", 90, { w: 1600, h: 900 }, { w: 800, h: 450 });

const skillsOf = (category: string) =>
  technologies.find((c) => t(c.category, "es") === category)?.skills.map((s) => s.name) ?? [];
const known = (...needles: string[]) =>
  IDENTITY.knowsAbout
    .filter((k) => needles.some((n) => k.toLowerCase().includes(n.toLowerCase())))
    .map((k) => k.replace(/\s*\(.*\)$/, ""));

/** Capítulo 03. El stack contado como las seis capas de un producto con IA. */
export default function Build({ lang }: { lang: Lang }) {
  const d = getDictionary(lang);
  const L = d.chapters.build.layers;
  const layers = [
    { label: L.interface, chips: skillsOf("Frontend") },
    { label: L.api, chips: skillsOf("Backend") },
    { label: L.model, chips: known("RAG", "Large Language", "Embeddings", "Semantic search", "Prompt engineering") },
    { label: L.data, chips: skillsOf("Databases & Tools") },
    { label: L.evaluation, chips: known("Evals") },
    { label: L.infrastructure, chips: skillsOf("DevOps & Cloud") },
  ];
  return (
    <Section id="build" labelledBy="build-h">
      <Container>
        <Eyebrow>{d.chapters.build.eyebrow}</Eyebrow>
        <Display as="h2" id="build-h" lead={d.chapters.build.heading} size="text-[length:var(--step-4)]" motion="text-reveal" className="mt-4 max-w-[24ch]" />
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-2 lg:items-center lg:gap-12">
          <ol className="flex flex-col gap-[10px]">
            {layers.map((layer, i) => (
              <li
                key={i}
                data-motion="layer"
                data-index={i}
                className="flex flex-col gap-3 rounded-[var(--radius)] border border-[color-mix(in_oklab,var(--light-1)_35%,transparent)] bg-[color:var(--bg-3)] p-4 sm:p-5 md:flex-row md:items-center md:justify-between md:gap-8 lg:flex-col lg:items-start lg:justify-start lg:gap-3"
              >
                <span className="flex items-baseline gap-3 text-[length:var(--step-1)] font-semibold tracking-[-0.02em] text-[color:var(--text)] md:w-56 md:shrink-0 lg:w-auto">
                  <span aria-hidden="true" className="text-[length:var(--step--1)] font-normal tabular-nums text-[color:var(--text-2)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {layer.label}
                </span>
                <ul className="flex flex-wrap gap-2 md:justify-end lg:justify-start">
                  {layer.chips.map((chip) => (
                    <li key={chip} className="rounded-full border border-[color:var(--line)] bg-[color:var(--bg-2)] px-3 py-1 text-[length:var(--step--1)] text-[color:var(--text-2)]">
                      {chip}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <ScrollSequence manifest={BUILD_SEQUENCE} className="order-first lg:order-none" />
        </div>
      </Container>
    </Section>
  );
}
