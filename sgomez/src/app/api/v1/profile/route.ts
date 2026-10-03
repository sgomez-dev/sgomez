import { collectionMeta, getProfile } from "@/lib/api/data";
import { jsonOk, readLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(request?: Request): Response {
  const lang = request ? readLang(request) : ({ ok: true, lang: "es" } as const);
  if (!lang.ok) return lang.response;
  const profile = getProfile(lang.lang);
  return jsonOk({ data: profile, meta: collectionMeta(1, `${API_BASE}/profile`) }, { lang: lang.lang });
}
