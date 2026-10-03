import { collectionMeta, getAbout } from "@/lib/api/data";
import { jsonOk, readLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(request?: Request): Response {
  const lang = request ? readLang(request) : ({ ok: true, lang: "es" } as const);
  if (!lang.ok) return lang.response;
  const about = getAbout(lang.lang);
  return jsonOk({ data: about, meta: collectionMeta(about.timeline.length, `${API_BASE}/about`) }, { lang: lang.lang });
}
