import type { Lang } from "@/i18n/languages";
import { notFoundMarkdown } from "@/lib/markdown/documents";
import { SITE_URL } from "@/lib/site";

export const BYPASS_HEADER = "x-sgomez-404";
export const MOLDE_PATH: Record<Lang, string> = { es: "/es/perdido", en: "/en/perdido" };
const TTL_MS = 60_000;
const cache = new Map<Lang, { html: string; at: number }>();
export function __resetMoldeCache() { cache.clear(); }

export async function fetchMolde(lang: Lang, origin: string, fetchImpl: typeof fetch = fetch, now: () => number = Date.now): Promise<string | null> {
  const hit = cache.get(lang);
  if (hit && now() - hit.at < TTL_MS) return hit.html;
  try {
    const res = await fetchImpl(new URL(MOLDE_PATH[lang], origin), { headers: { [BYPASS_HEADER]: "1" }, cache: "no-store" });
    if (res.status !== 200) return null;
    const html = await res.text();
    cache.set(lang, { html, at: now() });
    return html;
  } catch {
    return null;
  }
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Self-contained 404 used when the molde can't be fetched. Built from the same site map as the markdown 404. */
export function fallback404Html(path: string, lang: Lang): string {
  const md = notFoundMarkdown(path, lang);
  const links = [...md.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g)].map(([, t, h]) => `<li><a href="${esc(h!)}">${esc(t!)}</a></li>`).join("");
  const title = lang === "en" ? "This page doesn't exist" : "Esta página no existe";
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><title>404 · sgomez.dev</title><style>body{margin:0;background:#05060A;color:#F4F6FB;font:16px/1.6 system-ui,sans-serif;padding:48px 24px}a{color:#8FA8FF}main{max-width:680px;margin:auto}</style></head><body><main><p>Error 404 · ${esc(path.slice(0, 80))}</p><h1>${title}</h1><ul>${links}</ul><p><a href="${SITE_URL}${lang === "en" ? "/en" : "/"}">${lang === "en" ? "Back to home" : "Volver al inicio"}</a></p></main></body></html>`;
}
