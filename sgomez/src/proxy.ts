import { NextResponse, type NextRequest } from "next/server";
import { markdownForPath, notFoundMarkdown } from "@/lib/markdown/documents";
import { decide } from "@/lib/markdown/routing";
import { CONTENT_VARY, PAGE_VARY, absolute } from "@/lib/site";

/**
 * Negociación de contenido markdown (https://acceptmarkdown.com).
 *
 * Vive en `proxy.ts` y no en `middleware.ts` porque Next 16 renombró así la
 * convención; el fichero antiguo sigue funcionando pero avisa en cada build.
 *
 * Dos cosas pasan aquí y las dos importan por separado:
 *
 * 1. Un `Accept: text/markdown` recibe markdown en la MISMA URL canónica. La
 *    página HTML no cambia y no hay redirección: es otra representación del
 *    mismo recurso, que es justo lo que la negociación de contenido significa.
 * 2. Toda respuesta negociable sale con `Vary: Accept`. Sin eso, la primera
 *    variante que entre en la caché de la CDN se le sirve a todo el mundo: al
 *    agente la página HTML, o al navegador un markdown en crudo, según quién
 *    llegara primero. Es el fallo que la convención señala como el grave.
 *
 * El markdown se genera aquí en vez de reescribir a una ruta interna porque
 * esa ruta sería una URL pública más, visible en el sitemap de cualquiera que
 * mire, para servir algo que ya vive en `lib/markdown`.
 */

const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

function markdownResponse(body: string, status: number, canonical: string, indexable: boolean): NextResponse {
  const headers = new Headers({
    "Content-Type": MARKDOWN_CONTENT_TYPE,
    Vary: CONTENT_VARY,
    "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    // La URL canónica es siempre la HTML, también cuando se pide /about.md.
    Link: `<${absolute(canonical)}>; rel="canonical"`,
  });

  // Las URLs con sufijo .md no se indexan: son la misma página que su
  // canónica y un buscador que las indexara partiría la señal en dos.
  if (!indexable) headers.set("X-Robots-Tag", "noindex, follow");

  return new NextResponse(body, { status, headers });
}

export default function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isRsc = request.headers.has("rsc") || request.headers.has("next-router-prefetch");
  const decision = decide(pathname, request.headers.get("accept"), isRsc);

  if (decision.kind === "skip") return NextResponse.next();

  if (decision.kind === "markdown") {
    const document = markdownForPath(decision.path);
    if (document === undefined) {
      // Un agente que pide markdown y se equivoca de ruta recibe markdown
      // también en el error, con el mapa del sitio para recuperarse.
      return markdownResponse(notFoundMarkdown(decision.path), 404, decision.canonical, false);
    }
    return markdownResponse(document, 200, decision.canonical, decision.indexable);
  }

  const response = NextResponse.next();
  // Next sobreescribe esta cabecera en las respuestas de página, así que hoy
  // quien la hace valer es `vercel.json`. Se declara igualmente: es el valor
  // correcto para esta respuesta, y el día que Next deje de pisarla ya está.
  response.headers.set("Vary", PAGE_VARY);
  response.headers.append(
    "Link",
    `<${absolute(decision.alternate)}>; rel="alternate"; type="text/markdown"`,
  );
  return response;
}

export const config = {
  /**
   * Se excluyen los assets y las rutas que ya sirven su propio formato. El
   * middleware sigue viendo /api porque `decide()` lo descarta explícitamente,
   * pero mantenerlo fuera del matcher ahorra una invocación por petición.
   */
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt|agents.md|openapi.json).*)",
  ],
};
