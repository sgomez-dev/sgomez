import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Lang } from "@/i18n/languages";
import { notFoundMarkdown } from "@/lib/markdown/documents";
import { SITE_URL } from "@/lib/site";

export const BYPASS_HEADER = "x-sgomez-404";
export const MOLDE_PATH: Record<Lang, string> = { es: "/es/perdido", en: "/en/perdido" };
const TTL_MS = 60_000;
const FAIL_TTL_MS = 10_000;
const FETCH_TIMEOUT_MS = 1500;
// Caché por instancia y de mejor esfuerzo: cada instancia serverless tiene la suya y se pierde al reciclarse.
const cache = new Map<Lang, { html: string; at: number }>();
const failedAt = new Map<Lang, number>();
const inflight = new Map<Lang, Promise<string | null>>();
export function __resetMoldeCache() { cache.clear(); failedAt.clear(); inflight.clear(); }

const HOSTS = new Set(["sgomez.dev", "www.sgomez.dev", "localhost", "127.0.0.1"]);

/** Solo se pide el molde a un origen conocido: una cabecera Host falsa no puede dirigir el fetch a otro sitio. */
export function safeOrigin(origin: string): string {
  try {
    if (HOSTS.has(new URL(origin).hostname)) return origin;
  } catch {
    /* cae al origen público */
  }
  return SITE_URL;
}

/**
 * El fetch con el que el proxy se pide el molde a sí mismo. En Cloudflare un Worker no puede pedirse su propio dominio
 * con un fetch normal, así que usa el binding `WORKER_SELF_REFERENCE` de wrangler.jsonc, que entra en este mismo Worker
 * sea cual sea el host. Fuera del Worker (`next start`, vitest) no hay contexto de Cloudflare y queda el fetch global.
 */
export const selfFetch: typeof fetch = (input, init) => {
  let self: { fetch: typeof fetch } | undefined;
  try {
    self = getCloudflareContext().env.WORKER_SELF_REFERENCE as { fetch: typeof fetch } | undefined;
  } catch {
    /* sin contexto de Cloudflare */
  }
  return self ? self.fetch(input, init) : fetch(input, init);
};

async function load(lang: Lang, origin: string, fetchImpl: typeof fetch, now: () => number, timeoutMs: number): Promise<string | null> {
  const ctrl = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const request = fetchImpl(new URL(MOLDE_PATH[lang], origin), {
      headers: { [BYPASS_HEADER]: "1" },
      cache: "no-store",
      // Una redirección (login de protección de previews, trailingSlash...) cuenta como fallo, no se sigue.
      redirect: "manual",
      signal: ctrl.signal,
    });
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        ctrl.abort();
        reject(new Error("molde timeout"));
      }, timeoutMs);
    });
    const res = await Promise.race([request, timeout]);
    if (res.status !== 200) throw new Error("molde status " + res.status);
    const html = await res.text();
    cache.set(lang, { html, at: now() });
    failedAt.delete(lang);
    return html;
  } catch {
    failedAt.set(lang, now());
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchMolde(
  lang: Lang,
  origin: string,
  fetchImpl: typeof fetch = selfFetch,
  now: () => number = Date.now,
  timeoutMs: number = FETCH_TIMEOUT_MS,
): Promise<string | null> {
  const hit = cache.get(lang);
  if (hit && now() - hit.at < TTL_MS) return Promise.resolve(hit.html);
  const failed = failedAt.get(lang);
  if (failed !== undefined && now() - failed < FAIL_TTL_MS) return Promise.resolve(null);
  const pending = inflight.get(lang);
  if (pending) return pending;
  const p = load(lang, origin, fetchImpl, now, timeoutMs).finally(() => inflight.delete(lang));
  inflight.set(lang, p);
  return p;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Self-contained 404 used when the molde can't be fetched. Built from the same site map as the markdown 404. */
export function fallback404Html(path: string, lang: Lang): string {
  const md = notFoundMarkdown(path, lang);
  const links = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(([, t, h]) => `<li><a href="${esc(h!)}">${esc(t!)}</a></li>`).join("");
  const title = lang === "en" ? "This page broke." : "Esta página se ha roto.";
  return `<!doctype html><html lang="${lang === "en" ? "en" : "es-ES"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>404 · sgomez.dev</title><style>body{margin:0;background:#05060A;color:#F4F6FB;font:16px/1.6 system-ui,sans-serif;padding:48px 24px}a{color:#8FA8FF}main{max-width:680px;margin:auto}</style></head><body><main><p>Error 404 · ${esc(path.slice(0, 80))}</p><h1>${title}</h1><ul>${links}</ul><p><a href="${SITE_URL}${lang === "en" ? "/en" : "/"}">${lang === "en" ? "Back to home" : "Volver al inicio"}</a></p></main></body></html>`;
}
