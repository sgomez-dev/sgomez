import { hero } from "@/app/content";
import { IDENTITY, SKYQUETZ } from "@/app/seo";
import { getProjects } from "@/lib/api/data";
import { STATIC_PAGES, findStaticPage } from "@/lib/content/pages";
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

function homeMarkdown(): string {
  const lines: string[] = [];
  lines.push(`# ${IDENTITY.name}`, "");
  lines.push(`> ${hero.subtitle}`, "");
  lines.push(IDENTITY.description, "");
  lines.push(`Canonical URL: ${SITE_URL}`, "");

  lines.push("## Perfil", "");
  lines.push(`- Rol: ${IDENTITY.jobTitle}, en Evenbytes.`);
  lines.push(`- ${IDENTITY.coFounderTitle} (${SKYQUETZ.url}). Cofundador, uno de cuatro socios: no fundador único.`);
  lines.push(`- Ubicación: ${IDENTITY.location.city}, ${IDENTITY.location.region}, España. Trabajo en remoto.`);
  lines.push(`- Contacto: ${IDENTITY.email}`);
  lines.push("");

  lines.push("## Proyectos", "");
  for (const project of getProjects()) {
    lines.push(`- **${project.title}** — ${project.description} (${project.stack.join(", ")}) ${project.url}`);
  }
  lines.push("");

  lines.push("## Páginas", "");
  for (const route of HTML_ROUTES) {
    if (route.path === "/") continue;
    lines.push(`- [${route.title}](${absolute(route.path)})`);
  }
  lines.push("");

  lines.push("## Para agentes", "");
  for (const route of MACHINE_ROUTES) {
    lines.push(`- [${route.title}](${absolute(route.path)}) — \`${route.type}\``);
  }
  lines.push(`- API pública: \`GET ${absolute(`${API_BASE}/profile`)}\``);
  lines.push("");

  return lines.join("\n");
}

function labMarkdown(): string {
  return [
    "# Lab — sgomez.dev",
    "",
    "> Un escritorio de sistema operativo dentro del navegador, desde el que se abren mis proyectos.",
    "",
    "El /lab es un entorno interactivo: iconos, ventanas arrastrables, barra de tareas y una terminal.",
    "Cada icono abre uno de mis proyectos, unos como componente React y otros embebidos desde su propio subdominio.",
    "",
    `Canonical URL: ${absolute("/lab")}`,
    "",
    "## Qué hay dentro",
    "",
    "- Terminal interactiva y un visor de mi CV.",
    "- Proyectos propios alojados en sus subdominios: To-Do, Budget, Skyzen, Sortlab, Landing y Docs.",
    "- sgomez-cli, la herramienta publicada en npm.",
    "",
    "Es una página pensada para explorarse con ratón y teclado. Si lo que necesitas es el listado de proyectos como",
    `datos, pídelo a la API: \`GET ${absolute(`${API_BASE}/projects`)}\`.`,
    "",
  ].join("\n");
}

/** Rutas con representación markdown, en el orden en que se anuncian. */
export const MARKDOWN_DOCUMENTS: Record<string, () => string> = {
  "/": homeMarkdown,
  "/lab": labMarkdown,
  ...Object.fromEntries(
    STATIC_PAGES.map((page) => [page.path, () => renderPageMarkdown(page)] as const),
  ),
};

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
export function notFoundMarkdown(requestedPath?: string): string {
  const lines: string[] = [];
  lines.push("# 404 — Esta página no existe", "");
  lines.push(
    requestedPath
      ? `> No hay nada publicado en \`${requestedPath}\` en ${SITE_URL}. Estas son las rutas que sí existen.`
      : `> La ruta pedida no existe en ${SITE_URL}. Estas son las rutas que sí existen.`,
    "",
  );

  lines.push("## Páginas", "");
  for (const route of HTML_ROUTES) {
    lines.push(`- [${route.title}](${absolute(route.path)})`);
  }
  lines.push("");

  lines.push("## Ficheros legibles por máquina", "");
  for (const route of MACHINE_ROUTES) {
    lines.push(`- [${route.title}](${absolute(route.path)}) — \`${route.type}\``);
  }
  lines.push("");

  lines.push("## API pública", "");
  lines.push(`- \`GET ${absolute(`${API_BASE}/health`)}\` — comprueba el servicio y devuelve los enlaces de entrada.`);
  lines.push(`- \`GET ${absolute(`${API_BASE}/profile`)}\` — el perfil completo en JSON.`);
  lines.push(`- \`GET ${absolute(`${API_BASE}/search`)}?q=…\` — busca en todo el contenido publicado.`);
  lines.push("");
  lines.push(
    "Si buscabas un endpoint de la API, cualquier ruta bajo `/api` devuelve el error en JSON con el motivo y una pista para recuperarte.",
    "",
  );

  return lines.join("\n");
}
