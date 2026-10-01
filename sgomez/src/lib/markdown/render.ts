import type { Block, StaticPage } from "@/lib/content/pages";
import { absolute } from "@/lib/site";
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
