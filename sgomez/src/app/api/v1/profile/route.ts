import { collectionMeta, getProfile } from "@/lib/api/data";
import { jsonOk, resolveLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(request?: Request): Response {
  const profile = getProfile(request ? resolveLang(request) : "es");
  return jsonOk({ data: profile, meta: collectionMeta(1, `${API_BASE}/profile`) });
}
