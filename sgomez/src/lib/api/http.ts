import { absolute } from "@/lib/site";

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
  headers.set("Vary", "Accept, Accept-Encoding");
  return headers;
}

/** Respuesta correcta. `path` es la ruta propia del recurso, para `meta.self`. */
export function jsonOk(body: unknown, init?: { headers?: HeadersInit; status?: number }): Response {
  const headers = baseHeaders(init?.headers);
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
