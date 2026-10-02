import { splitLang } from "@/i18n/languages";
import { E2E_FIXTURE_PATHS, e2eFixturesEnabled } from "@/lib/e2e";
import { PAGES } from "@/lib/routing/pages";
import { LOCALIZED_MACHINE_PATHS, NEGOTIATION_EXEMPT_PATHS } from "@/lib/site";

export type RouteDecision =
  | { kind: "next" }
  | { kind: "rewrite"; to: string }
  | { kind: "redirect"; to: string; status: 301 | 308 };

const FILE = /\.[a-z0-9]+$/i;

/**
 * Enrutado por idioma. El español vive sin prefijo en la URL pública pero las
 * páginas están bajo `app/[lang]`, así que el proxy reescribe `/about` a
 * `/es/about`; `/es/*` redirige a la URL sin prefijo para que exista una sola
 * dirección canónica; `/lab` se retiró y redirige a la home.
 */
export function routeRequest(pathname: string): RouteDecision {
  if (pathname.startsWith("/_next") || pathname === "/api" || pathname.startsWith("/api/")) return { kind: "next" };
  // `/es/*` redirige SIEMPRE, también las variantes .md: si el chequeo de ficheros
  // fuera primero, `/es/about.md` escaparía del redirect y serviría una segunda
  // URL para el mismo documento.
  if (LOCALIZED_MACHINE_PATHS.some((path) => pathname === `/es${path}`)) {
    return { kind: "redirect", to: pathname.slice(3), status: 308 };
  }
  if (pathname === "/es.md") return { kind: "redirect", to: "/index.md", status: 308 };
  if (pathname.startsWith("/es/") && pathname.endsWith(".md")) {
    return { kind: "redirect", to: pathname.slice(3), status: 308 };
  }
  if (NEGOTIATION_EXEMPT_PATHS.includes(pathname) || FILE.test(pathname)) return { kind: "next" };

  if (pathname === "/lab" || pathname.startsWith("/lab/")) return { kind: "redirect", to: "/", status: 301 };
  if (pathname === "/en/lab" || pathname.startsWith("/en/lab/")) return { kind: "redirect", to: "/en", status: 301 };

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    return { kind: "redirect", to: pathname.slice(3) || "/", status: 308 };
  }
  if (pathname === "/en" || pathname.startsWith("/en/")) return { kind: "next" };
  return { kind: "rewrite", to: pathname === "/" ? "/es" : `/es${pathname}` };
}

/**
 * ¿Es navegación de cliente (RSC) y no un agente pidiendo markdown?
 *
 * OJO: medido en Next 16.2.6, `proxy.ts` NO ve las cabeceras `rsc` ni
 * `next-router-prefetch` ni el parámetro `_rsc`: Next las retira antes de
 * entregar la petición (ni con curl `-H "RSC: 1"` ni con `?_rsc=` aparecen en
 * `request.headers` / `nextUrl`). Se comprueban igualmente por si una versión
 * futura las expone. Hoy la garantía real es otra: el router de cliente nunca
 * envía `Accept: text/markdown`, así que su navegación cae en la rama HTML, que
 * se reescribe igual que cualquier petición.
 */
export function isRscRequest(headers: { has(name: string): boolean }, search: URLSearchParams | string): boolean {
  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  return headers.has("rsc") || headers.has("next-router-prefetch") || params.has("_rsc");
}

/** A public HTML path that matches no page. Files, /api, /_next and machine files are never "unknown HTML". */
export function isUnknownHtmlPath(pathname: string): boolean {
  if (pathname.startsWith("/_next") || pathname === "/api" || pathname.startsWith("/api/")) return false;
  if (NEGOTIATION_EXEMPT_PATHS.includes(pathname) || FILE.test(pathname)) return false;
  // Fase 5: las rutas dinámicas (`/work/[slug]`) tendrán que comprobarse contra su lista de slugs aquí;
  // hoy toda ruta fuera de PAGES es desconocida.
  const { path } = splitLang(pathname);
  // la imagen Open Graph de la home y la de cada página
  if (/^(\/(about|contact|developers|privacy))?\/opengraph-image$/.test(path)) return false;
  if (e2eFixturesEnabled() && (E2E_FIXTURE_PATHS as readonly string[]).includes(path)) return false;
  return !(PAGES as readonly string[]).includes(path.replace(/\/$/, "") || "/");
}
