import type { Block, StaticPage } from "@/lib/content/pages";
import { absolute } from "@/lib/site";
import { getDictionary } from "@/i18n";
import { fill } from "@/i18n/fill";
import { getCaseStudies, type CaseStudy } from "@/lib/api/data";
import type { Lang } from "@/i18n/languages";
import { machineHref } from "@/lib/routing/pages";

/**
 * Render de markdown para las páginas estáticas.
 *
 * La entrada es el MISMO objeto que renderiza el componente de React, así que
 * la variante markdown de una página no es una traducción escrita a mano: es
 * la otra salida del mismo dato.
 */

/** Los enlaces relativos se absolutizan: un agente puede leer esto sin base. */
function link(label: string, href: string): string {
  return `[${label}](${absolute(href)})`;
}

function renderBlock(block: Block): string[] {
  switch (block.kind) {
    case "paragraph":
      return [block.text, ""];
    case "list":
      return [...block.items.map((item) => `- ${item}`), ""];
    case "table": {
      const rows = [
        `| ${block.head.join(" | ")} |`,
        `| ${block.head.map(() => "---").join(" | ")} |`,
        // Las barras verticales del contenido se escapan o partirían la tabla.
        ...block.rows.map((row) => `| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`),
      ];
      return [...rows, ""];
    }
    case "code":
      return ["```" + block.language, block.code, "```", ""];
    case "links":
      return [
        ...block.items.map((item) =>
          item.note ? `- ${link(item.label, item.href)}: ${item.note}` : `- ${link(item.label, item.href)}`,
        ),
        "",
      ];
  }
}

export function renderPageMarkdown(page: StaticPage): string {
  const lines: string[] = [];
  lines.push(`# ${page.title}`, "");
  lines.push(`> ${page.lead}`, "");
  lines.push(page.description, "");
  lines.push(`Canonical URL: ${absolute(page.path)}`, "");

  for (const section of page.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const block of section.blocks) lines.push(...renderBlock(block));
  }

  lines.push("---", "");
  const formats = `${link("llms.txt", machineHref("/llms.txt", page.lang))}, ${link("agents.md", machineHref("/agents.md", page.lang))}, ${link("OpenAPI", "/openapi.json")}, ${link("sitemap", "/sitemap.xml")}`;
  lines.push(
    page.lang === "es" ? `Más formatos legibles por máquina: ${formats}.` : `More machine-readable formats: ${formats}.`,
    "",
  );

  return lines.join("\n");
}

/**
 * Variante markdown de un caso de estudio: el mismo dato que renderiza `chapters/CaseStudy.tsx`, con los mismos
 * textos del dueño y la fecha de su `updated`.
 */
export function renderCaseStudyMarkdown(study: CaseStudy, lang: Lang): string {
  const d = getDictionary(lang).caseStudy;
  const lines: string[] = [];
  lines.push(`# ${fill(d.title, { title: study.title })}`, "");
  lines.push(`> ${fill(d.lead, { title: study.title })}`, "");
  lines.push(`Canonical URL: ${absolute(study.path)}`, "");
  lines.push(`${d.updated} ${study.updated}`, "");

  lines.push(`## ${d.problem}`, "", study.problem, "");
  lines.push(`## ${d.role}`, "", study.role, "");
  lines.push(`## ${d.stack}`, "", ...study.stack.map((item) => `- ${item}`), "");
  lines.push(`## ${d.outcome}`, "", study.outcome, "");

  lines.push(`## ${d.links}`, "");
  lines.push(`- [${d.source}](${study.url})`);
  if (study.repo) lines.push(`- [${d.repo}](${study.repo})`);
  if (study.based_on) {
    lines.push(`- [${fill(d.basedOn, { name: study.based_on.name, author: study.based_on.author })}](${study.based_on.url})`);
  }
  lines.push("");

  const others = getCaseStudies(lang).filter((c) => c.slug !== study.slug);
  if (others.length > 0) {
    lines.push(`## ${d.related}`, "", ...others.map((c) => `- ${link(c.title, c.path)}`), "");
  }

  lines.push("---", "");
  const formats = `${link("llms.txt", machineHref("/llms.txt", lang))}, ${link("agents.md", machineHref("/agents.md", lang))}, ${link("OpenAPI", "/openapi.json")}, ${link("sitemap", "/sitemap.xml")}`;
  lines.push(lang === "es" ? `Más formatos legibles por máquina: ${formats}.` : `More machine-readable formats: ${formats}.`, "");
  return lines.join("\n");
}
