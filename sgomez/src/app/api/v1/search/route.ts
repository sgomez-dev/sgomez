import { collectionMeta, search } from "@/lib/api/data";
import { jsonError, jsonOk, readInt, readLang } from "@/lib/api/http";
import { API_BASE } from "@/lib/site";

export { POST, PUT, PATCH, DELETE, OPTIONS } from "@/lib/api/http";

export function GET(request: Request): Response {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim();

  if (query === "") {
    return jsonError(
      "invalid_parameter",
      'Query parameter "q" is required and must not be empty.',
      `Example: GET ${API_BASE}/search?q=RAG`,
    );
  }

  const limit = readInt(url, "limit", { fallback: 10, min: 1, max: 50 });
  if (!limit.ok) return limit.response;

  const lang = readLang(request);
  if (!lang.ok) return lang.response;

  const results = search(query, limit.value, lang.lang);

  return jsonOk({
    data: results,
    meta: { ...collectionMeta(results.length, `${API_BASE}/search`), query, limit: limit.value },
  }, { lang: lang.lang });
}
