import { absolute } from "@/lib/site";
import { IDENTITY } from "@/app/seo";
import type { Lang } from "@/i18n/languages";
import { markdownForPath } from "@/lib/markdown/documents";
import { caseRoutes } from "@/lib/routing/cases";
import { localizedHtmlRoutes, machineHref } from "@/lib/routing/pages";

/**
 * Cuerpo de /llms-full.txt y /en/llms-full.txt: TODO el contenido del sitio en
 * markdown, en un solo documento y en su idioma. Es lo que un agente lee cuando
 * quiere el sitio entero sin recorrer las páginas una a una.
 *
 * No escribe nada propio: concatena las mismas representaciones markdown que
 * sirve cada URL (la home y luego cada página estática), así que no puede
 * contradecirlas. `/llms.txt` sigue siendo el resumen corto.
 */
export function llmsFullTxt(lang: Lang): string {
  const es = lang === "es";
  const L: string[] = [];
  L.push(`# ${IDENTITY.name} · sgomez.dev`, "");
  L.push(
    es
      ? `> Todo el contenido de sgomez.dev en markdown, en español. El resumen corto está en ${absolute(machineHref("/llms.txt", lang))}.`
      : `> The whole content of sgomez.dev in markdown, in English. The short summary is at ${absolute(machineHref("/llms.txt", lang))}.`,
    "",
  );

  // Las páginas y, después, cada caso de estudio publicado.
  for (const route of [...localizedHtmlRoutes(lang), ...caseRoutes(lang)]) {
    const document = markdownForPath(route.path);
    if (document === undefined) throw new Error(`llms-full: sin markdown para ${route.path}`);
    L.push("---", "", document.trimEnd(), "");
  }
  return L.join("\n");
}
