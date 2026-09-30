import { hero } from "@/app/content";
import { t } from "@/lib/content/localized";
import { IDENTITY, IDENTITY_TEXT, SKYQUETZ } from "@/app/seo";
import { LANGS, localizedPath, type Lang } from "@/i18n/languages";
import { getProjects } from "@/lib/api/data";
import { findStaticPage, staticPages } from "@/lib/content/pages";
import { renderPageMarkdown } from "@/lib/markdown/render";
import { API_BASE, HTML_ROUTES, MACHINE_ROUTES, SITE_URL, absolute } from "@/lib/site";

/**
 * Catálogo de representaciones markdown del sitio.
 *
 * Es la tabla que consulta la negociación de contenido: si la ruta está aquí,
 * un `Accept: text/markdown` recibe markdown; si no está, recibe el 404 en
 * markdown de más abajo. Que la lista sea un dato y no una cadena de `if`
 * permite que el test compruebe que TODAS las rutas HTML del sitio tienen su
 * variante.
 */

/** Títulos en inglés de las rutas de `HTML_ROUTES`, para los listados en markdown. */
const PAGE_TITLES_EN: Record<string, string> = {
  "/about": "About me",
  "/contact": "Contact",
  "/developers": "Portal for developers and agents",
  "/privacy": "Privacy",
};

function homeMarkdown(lang: Lang): string {
  const es = lang === "es";
  const x = (spanish: string, english: string) => (es ? spanish : english);
  const home = localizedPath(lang, "/");
  const lines: string[] = [];
  lines.push(`# ${IDENTITY.name}`, "");
  lines.push(`> ${t(hero.subtitle, lang)}`, "");
  lines.push(IDENTITY_TEXT.description[lang], "");
  lines.push(`Canonical URL: ${home === "/" ? SITE_URL : absolute(home)}`, "");

  lines.push(x("## Perfil", "## Profile"), "");
  lines.push(x(`- Rol: ${IDENTITY.jobTitle}, en Evenbytes.`, `- Role: ${IDENTITY.jobTitle}, at Evenbytes.`));
  lines.push(
    x(
      `- ${IDENTITY.coFounderTitle} (${SKYQUETZ.url}). Cofundador, uno de cuatro socios: no fundador único.`,
      `- Co-founder of ${SKYQUETZ.name} (${SKYQUETZ.url}). Co-founder, one of four partners: not the sole founder.`,
    ),
  );
  lines.push(
    x(
      `- Ubicación: ${IDENTITY.location.city}, ${IDENTITY.location.region}, España. Trabajo en remoto.`,
      `- Location: ${IDENTITY.location.city}, ${IDENTITY.location.region}, Spain. I work remotely.`,
    ),
  );
  lines.push(x(`- Contacto: ${IDENTITY.email}`, `- Contact: ${IDENTITY.email}`));
  lines.push("");

  lines.push(x("## Proyectos", "## Projects"), "");
  for (const project of getProjects(lang)) {
    lines.push(`- **${project.title}** — ${project.description} (${project.stack.join(", ")}) ${project.url}`);
  }
  lines.push("");

  lines.push(x("## Páginas", "## Pages"), "");
  for (const route of HTML_ROUTES) {
    if (route.path === "/") continue;
    // /lab no tiene versión inglesa ni markdown.
    if (!es && route.path === "/lab") continue;
    const title = es ? route.title : (PAGE_TITLES_EN[route.path] ?? route.title);
    lines.push(`- [${title}](${absolute(localizedPath(lang, route.path))})`);
  }
  lines.push("");

  lines.push(x("## Para agentes", "## For agents"), "");
  for (const route of MACHINE_ROUTES) {
    lines.push(`- [${route.title}](${absolute(route.path)}) — \`${route.type}\``);
  }
  lines.push(`- ${x("API pública", "Public API")}: \`GET ${absolute(`${API_BASE}/profile`)}\``);
  lines.push("");

  return lines.join("\n");
}

/** Rutas con representación markdown, en el orden en que se anuncian. */
export const MARKDOWN_DOCUMENTS: Record<string, () => string> = Object.fromEntries(
  LANGS.flatMap((lang) => [
    [localizedPath(lang, "/"), () => homeMarkdown(lang)] as const,
    ...staticPages(lang).map((page) => [page.path, () => renderPageMarkdown(page)] as const),
  ]),
);

export const MARKDOWN_PATHS: string[] = Object.keys(MARKDOWN_DOCUMENTS);

export function markdownForPath(path: string): string | undefined {
  const build = MARKDOWN_DOCUMENTS[path];
  if (build) return build();
  // Puede que la ruta exista como página estática aunque no esté en el mapa.
  const page = findStaticPage(path);
  return page ? renderPageMarkdown(page) : undefined;
}

/**
 * Cuerpo del 404, en markdown.
 *
 * Es el mismo texto que muestra la página 404 en HTML. Un 404 que solo dice
 * "no encontrado" obliga al agente a adivinar; este dice a dónde ir, y por eso
 * lleva el mapa del sitio entero: desde aquí se sale a cualquier parte sin una
 * segunda petición a ciegas.
 */
export function notFoundMarkdown(requestedPath?: string, lang: Lang = "es"): string {
  const es = lang === "es";
  const x = (spanish: string, english: string) => (es ? spanish : english);
  const lines: string[] = [];
  lines.push(x("# 404 — Esta página no existe", "# 404 — This page doesn't exist"), "");
  lines.push(
    requestedPath
      ? x(
          `> No hay nada publicado en \`${requestedPath}\` en ${SITE_URL}. Estas son las rutas que sí existen.`,
          `> Nothing is published at \`${requestedPath}\` on ${SITE_URL}. These are the routes that do exist.`,
        )
      : x(
          `> La ruta pedida no existe en ${SITE_URL}. Estas son las rutas que sí existen.`,
          `> The requested route does not exist on ${SITE_URL}. These are the routes that do exist.`,
        ),
    "",
  );

  lines.push(x("## Páginas", "## Pages"), "");
  for (const route of HTML_ROUTES) {
    if (!es && route.path === "/lab") continue;
    const title = es ? route.title : route.path === "/" ? "Home" : (PAGE_TITLES_EN[route.path] ?? route.title);
    lines.push(`- [${title}](${absolute(localizedPath(lang, route.path))})`);
  }
  lines.push("");

  lines.push(x("## Ficheros legibles por máquina", "## Machine-readable files"), "");
  for (const route of MACHINE_ROUTES) {
    lines.push(`- [${route.title}](${absolute(route.path)}) — \`${route.type}\``);
  }
  lines.push("");

  lines.push(x("## API pública", "## Public API"), "");
  lines.push(
    x(
      `- \`GET ${absolute(`${API_BASE}/health`)}\` — comprueba el servicio y devuelve los enlaces de entrada.`,
      `- \`GET ${absolute(`${API_BASE}/health`)}\` — checks the service and returns the entry links.`,
    ),
  );
  lines.push(
    x(
      `- \`GET ${absolute(`${API_BASE}/profile`)}\` — el perfil completo en JSON.`,
      `- \`GET ${absolute(`${API_BASE}/profile`)}\` — the full profile as JSON.`,
    ),
  );
  lines.push(
    x(
      `- \`GET ${absolute(`${API_BASE}/search`)}?q=…\` — busca en todo el contenido publicado.`,
      `- \`GET ${absolute(`${API_BASE}/search`)}?q=…\` — searches all published content.`,
    ),
  );
  lines.push("");
  lines.push(
    x(
      "Si buscabas un endpoint de la API, cualquier ruta bajo `/api` devuelve el error en JSON con el motivo y una pista para recuperarte.",
      "If you were looking for an API endpoint, any route under `/api` returns the error as JSON with the reason and a hint to recover.",
    ),
    "",
  );

  return lines.join("\n");
}
