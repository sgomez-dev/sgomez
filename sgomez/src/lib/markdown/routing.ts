import { NEGOTIATION_EXEMPT_PATHS } from "@/lib/site";
import { prefersMarkdown } from "@/lib/markdown/negotiate";

/**
 * Decisión de negociación para una petición: la parte con lógica del
 * middleware, aislada aquí para poder probarla sin levantar un servidor.
 */

export type Decision =
  /** Ni se toca: assets, /api, RSC y ficheros que ya tienen su Content-Type. */
  | { kind: "skip" }
  /** HTML normal; solo hay que anunciar la variante y el Vary. */
  | { kind: "html"; alternate: string }
  /** Servir markdown. `indexable: false` marca las URLs con sufijo .md. */
  | { kind: "markdown"; path: string; canonical: string; indexable: boolean };

/** Extensión de fichero al final de la ruta, si la hay. */
const FILE_EXTENSION = /\.[a-z0-9]+$/i;

/**
 * La variante explícita de una ruta: `/about` → `/about.md`, `/` → `/index.md`.
 * `/.md` sería una ruta con nombre vacío y algunos servidores la tratan como
 * fichero oculto, así que la home usa `index`.
 */
export function markdownVariantOf(pathname: string): string {
  return pathname === "/" ? "/index.md" : `${pathname.replace(/\/$/, "")}.md`;
}

/** Inverso de `markdownVariantOf`. */
export function canonicalOfVariant(pathname: string): string {
  const withoutSuffix = pathname.slice(0, -".md".length);
  if (withoutSuffix === "" || withoutSuffix === "/index") return "/";
  return withoutSuffix;
}

export function decide(pathname: string, accept: string | null | undefined, isRsc: boolean): Decision {
  // Las peticiones RSC de Next piden `text/x-component` y son navegación
  // interna, no un agente: negociarlas rompería el enrutado del cliente.
  if (isRsc) return { kind: "skip" };

  if (pathname.startsWith("/_next") || pathname.startsWith("/api/") || pathname === "/api") {
    return { kind: "skip" };
  }

  // /llms.txt, /openapi.json, /sitemap.xml… ya sirven su propio formato.
  if (NEGOTIATION_EXEMPT_PATHS.includes(pathname)) return { kind: "skip" };

  if (pathname.endsWith(".md")) {
    const canonical = canonicalOfVariant(pathname);
    return { kind: "markdown", path: canonical, canonical, indexable: false };
  }

  // Cualquier otro fichero (imágenes, el PDF del CV, favicon…) se sirve tal cual.
  if (FILE_EXTENSION.test(pathname)) return { kind: "skip" };

  if (prefersMarkdown(accept)) {
    return { kind: "markdown", path: pathname, canonical: pathname, indexable: true };
  }

  return { kind: "html", alternate: markdownVariantOf(pathname) };
}
