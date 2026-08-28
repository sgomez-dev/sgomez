import { collectionMeta, getAbout } from "@/lib/api/data";
import { jsonOk } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(): Response {
  const about = getAbout();
  return jsonOk({ data: about, meta: collectionMeta(about.timeline.length, `${API_BASE}/about`) });
}
