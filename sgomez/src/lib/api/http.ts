import { isLang, type Lang } from "@/i18n/languages";
import { API_DISCOVERY_LINK, absolute } from "@/lib/site";

/**
 * Respuestas HTTP de la API pública.
 *
 * Regla única: TODO lo que sale de /api es JSON, también los errores. Un
 * agente que recibe la página de error HTML de Next no puede hacer nada con
 * ella; un objeto con `code`, `message` y `hint` sí lo puede leer, reintentar
 * o explicar. Por eso las handlers no dejan que Next genere el error por su
 * cuenta: capturan el caso y devuelven el sobre de aquí.
 */

/** Códigos de error estables. Forman parte del contrato: no se renombran. */
export const ERROR_CODES = {
  bad_request: 400,
  invalid_parameter: 400,
  not_found: 404,
  method_not_allowed: 405,
  internal_error: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export type ApiError = {
  error: {
    status: number;
    code: ErrorCode;
    message: string;
    hint: string;
    documentation_url: string;
  };
};

const DOCS_URL = absolute("/developers");

/** Cabeceras comunes: CORS abierto porque todo el contenido ya es público. */
function baseHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Accept, Content-Type");
  // La representación depende del Accept: sin esto una CDN puede servirle a un
  // agente la variante equivocada de la que ya tiene en caché.
  // El idioma también sale de Accept-Language, así que la CDN debe separar por
  // él o le serviría inglés a quien no pidió idioma. Constante propia de la
  // API: el Vary de las páginas y del markdown no cambia.
  headers.set("Vary", API_VARY);
  // Descubrimiento: especificación, documentación y catálogo, también en los errores.
  headers.set("Link", API_DISCOVERY_LINK);
  return headers;
}

const API_VARY = "Accept, Accept-Encoding, Accept-Language";

/**
 * Respuesta correcta. `lang` (si el recurso depende del idioma) se anuncia en
 * `Content-Language`.
 */
export function jsonOk(body: unknown, init?: { headers?: HeadersInit; status?: number; lang?: Lang }): Response {
  const headers = baseHeaders(init?.headers);
  if (init?.lang) headers.set("Content-Language", init.lang);
  headers.set("Cache-Control", "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400");
  return new Response(JSON.stringify(body, null, 2) + "\n", {
    status: init?.status ?? 200,
    headers,
  });
}

/** Error estructurado. Nunca HTML, nunca un cuerpo vacío. */
export function jsonError(
  code: ErrorCode,
  message: string,
  hint: string,
  init?: { headers?: HeadersInit },
): Response {
  const status = ERROR_CODES[code];
  const headers = baseHeaders(init?.headers);
  // Un error no se cachea: el siguiente cliente puede pedir algo válido.
  headers.set("Cache-Control", "no-store");
  const body: ApiError = {
    error: { status, code, message, hint, documentation_url: DOCS_URL },
  };
  return new Response(JSON.stringify(body, null, 2) + "\n", { status, headers });
}

export function notFound(message: string, hint: string): Response {
  return jsonError("not_found", message, hint);
}

/**
 * Idioma de la respuesta. `?lang=` manda; si no viene, una cabecera
 * Accept-Language que empiece por "en" pide inglés; en cualquier otro caso,
 * español, que es lo que la API devolvía antes de tener idioma.
 */
export function resolveLang(request: Request): Lang {
  const param = new URL(request.url).searchParams.get("lang");
  if (param !== null && param !== "") {
    const value = param.trim().toLowerCase();
    return isLang(value) ? value : "es";
  }
  const accept = request.headers.get("accept-language") ?? "";
  // `en`, `en-GB`, `en_US`, `EN`: cualquier cosa que empiece por la etiqueta.
  return /^\s*en(?![a-z])/i.test(accept) ? "en" : "es";
}

export type ParsedLang = { ok: true; lang: Lang } | { ok: false; response: Response };

/**
 * Valida `?lang=` (sin distinguir mayúsculas) y resuelve el idioma. Un valor
 * desconocido es un 400, no un español silencioso: quien pide `lang=fr` debe
 * enterarse de que no lo tiene. Sin `?lang=` decide Accept-Language.
 */
export function readLang(request: Request): ParsedLang {
  const raw = new URL(request.url).searchParams.get("lang");
  if (raw !== null && raw !== "" && !isLang(raw.trim().toLowerCase())) {
    return {
      ok: false,
      response: jsonError(
        "invalid_parameter",
        `Query parameter "lang" must be "es" or "en". Received: ${JSON.stringify(raw)}.`,
        "Use lang=es or lang=en, or omit the parameter to let Accept-Language decide (default es).",
      ),
    };
  }
  return { ok: true, lang: resolveLang(request) };
}

const ALLOWED_METHODS = "GET, HEAD, OPTIONS";

/**
 * 405 en JSON con su cabecera `Allow`.
 *
 * Sin esto Next responde 405 con el cuerpo vacío y un agente no sabe qué
 * métodos puede usar. La API es de solo lectura: no hay escritura que ofrecer.
 */
export function methodNotAllowed(): Response {
  return jsonError(
    "method_not_allowed",
    "This endpoint is read-only.",
    `Use ${ALLOWED_METHODS}. The public API of sgomez.dev does not accept writes.`,
    { headers: { Allow: ALLOWED_METHODS } },
  );
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;

/** Preflight CORS. */
export function OPTIONS(): Response {
  const headers = baseHeaders();
  headers.set("Allow", ALLOWED_METHODS);
  headers.set("Access-Control-Max-Age", "86400");
  return new Response(null, { status: 204, headers });
}

export type ParsedInt = { ok: true; value: number } | { ok: false; response: Response };

/**
 * Lee un entero de la query string validando el rango.
 *
 * Devuelve la respuesta de error ya construida en vez de lanzar: las handlers
 * son cortas y así el camino de error se ve en el mismo sitio que el correcto.
 */
export function readInt(
  url: URL,
  name: string,
  { fallback, min, max }: { fallback: number; min: number; max: number },
): ParsedInt {
  const raw = url.searchParams.get(name);
  if (raw === null || raw === "") return { ok: true, value: fallback };

  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    return {
      ok: false,
      response: jsonError(
        "invalid_parameter",
        `Query parameter "${name}" must be an integer between ${min} and ${max}. Received: ${JSON.stringify(raw)}.`,
        `Retry with ?${name}=${fallback} or omit the parameter to use the default.`,
      ),
    };
  }
  return { ok: true, value };
}
