import { collectionMeta, getAbout } from "@/lib/api/data";
import { jsonOk, resolveLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(request?: Request): Response {
  const about = getAbout(request ? resolveLang(request) : "es");
  return jsonOk({ data: about, meta: collectionMeta(about.timeline.length, `${API_BASE}/about`) });
}
