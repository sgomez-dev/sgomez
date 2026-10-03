import { NextResponse, type NextRequest } from "next/server";
import { markdownForPath, notFoundMarkdown } from "@/lib/markdown/documents";
import { decide } from "@/lib/markdown/routing";
import { isRscRequest, isUnknownHtmlPath, routeRequest, type RouteDecision } from "@/lib/routing/request";
import { BYPASS_HEADER, MOLDE_PATH, fallback404Html, fetchMolde, safeOrigin } from "@/lib/lost/molde";
import { hreflangAlternates, splitLang } from "@/i18n/languages";
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
 * Además enruta por idioma (`routeRequest`): el español se sirve sin prefijo
 * reescribiendo a `/es/...`, `/es/*` redirige a la URL sin prefijo y `/lab`,
 * retirada, redirige a la home. Eso se aplica también a las peticiones RSC: la
 * navegación de cliente pide `/about` y tiene que llegar a `/es/about`. Lo único
 * que las peticiones RSC se saltan es la negociación de markdown.
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
    // Un 404 en markdown se cachea un minuto: si la ruta se publica después, no
    // debe quedarse una hora anunciando que no existe.
    "Cache-Control":
      status === 404
        ? "public, max-age=60, s-maxage=60"
        : "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    // La URL canónica es siempre la HTML, también cuando se pide /about.md.
    Link: `<${absolute(canonical)}>; rel="canonical"`,
  });

  // hreflang de la variante markdown: solo cuando el documento existe. Es el
  // mismo esquema que el de la página HTML (es, en y x-default).
  if (status === 200) {
    const alternates = hreflangAlternates(splitLang(canonical).path);
    for (const [hreflang, url] of Object.entries(alternates)) {
      headers.append("Link", `<${url}>; rel="alternate"; hreflang="${hreflang}"`);
    }
  }

  // Las URLs con sufijo .md no se indexan: son la misma página que su
  // canónica y un buscador que las indexara partiría la señal en dos.
  if (!indexable) headers.set("X-Robots-Tag", "noindex, follow");

  return new NextResponse(body, { status, headers });
}

/**
 * 404 real por idioma. El molde `/{lang}/perdido` está prerenderizado; aquí se
 * pide una vez por idioma (caché de 60 s) y se devuelve con estado 404. No se
 * usa `NextResponse.rewrite(..., { status: 404 })` porque hereda el
 * `s-maxage` de un año de la página prerenderizada.
 */
const LOST_CACHE = "public, max-age=60, s-maxage=60";
/** Reserva degradada o petición con la cabecera de bypass: nada de caché compartida. */
const NO_STORE = "private, no-store";

function lostResponse(html: string, cacheControl: string = LOST_CACHE): NextResponse {
  return new NextResponse(html, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": cacheControl,
      Vary: PAGE_VARY,
      "X-Robots-Tag": "noindex, follow",
    },
  });
}

export default async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  // La petición interna que trae el molde lleva la cabecera de bypass: las rutas
  // internas del molde se sirven tal cual, sin el 308 de `/es/*` y sin pedirse a
  // sí mismas otra vez.
  // Con la cabecera NUNCA se vuelve a pedir el molde (evita la recursión si una
  // redirección apunta a otra ruta): lo que no es el molde recibe la reserva.
  if (request.headers.get(BYPASS_HEADER) === "1") {
    if (!Object.values(MOLDE_PATH).includes(pathname)) {
      return lostResponse(fallback404Html(pathname, splitLang(pathname).lang), NO_STORE);
    }
    // Una petición externa que lleve la cabecera pública no debe dejar un 200 cacheable en una CDN.
    const direct = NextResponse.next();
    direct.headers.set("X-Robots-Tag", "noindex, follow");
    direct.headers.set("Cache-Control", NO_STORE);
    return direct;
  }

  const isRsc = isRscRequest(request.headers, request.nextUrl.searchParams);

  const route = routeRequest(pathname);
  if (route.kind === "redirect") {
    return NextResponse.redirect(new URL(route.to + search, request.url), route.status);
  }

  // `decide` recibe siempre la ruta PÚBLICA (`/about`, `/en/about`), no la reescrita.
  const decision = decide(pathname, request.headers.get("accept"), isRsc);

  if (decision.kind !== "markdown" && isUnknownHtmlPath(pathname)) {
    const lang = splitLang(pathname).lang;
    const molde = await fetchMolde(lang, safeOrigin(request.nextUrl.origin));
    // sin molde (degradado) no se cachea: que el siguiente visitante lo vuelva a intentar
    return molde === null || molde === undefined ? lostResponse(fallback404Html(pathname, lang), NO_STORE) : lostResponse(molde);
  }

  if (decision.kind === "skip") return passThrough(request, route);

  if (decision.kind === "markdown") {
    const document = markdownForPath(decision.path);
    if (document === undefined) {
      // Un agente que pide markdown y se equivoca de ruta recibe markdown
      // también en el error, con el mapa del sitio para recuperarse.
      return markdownResponse(
        notFoundMarkdown(decision.path, splitLang(decision.path).lang),
        404,
        decision.canonical,
        false,
      );
    }
    return markdownResponse(document, 200, decision.canonical, decision.indexable);
  }

  const response = passThrough(request, route);
  // En Vercel la respuesta prerenderizada trae su propio Vary y pisa este, así
  // que quien lo hace valer es la transformación de `vercel.json`. Se declara
  // igualmente: es el valor correcto y cubre `next start`.
  response.headers.set("Vary", PAGE_VARY);
  response.headers.append(
    "Link",
    `<${absolute(decision.alternate)}>; rel="alternate"; type="text/markdown"`,
  );
  return response;
}

/** Continúa la petición, reescribiéndola a `/es/...` cuando el enrutado lo pide. */
function passThrough(request: NextRequest, route: RouteDecision): NextResponse {
  if (route.kind === "rewrite") {
    return NextResponse.rewrite(new URL(route.to + request.nextUrl.search, request.url));
  }
  return NextResponse.next();
}

export const config = {
  /**
   * Se excluyen los assets y las rutas que ya sirven su propio formato. El
   * middleware sigue viendo /api porque `decide()` lo descarta explícitamente,
   * pero mantenerlo fuera del matcher ahorra una invocación por petición.
   */
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|llms.txt|llms-full.txt|agents.md|en/llms.txt|en/llms-full.txt|en/agents.md|openapi.json).*)",
  ],
};
