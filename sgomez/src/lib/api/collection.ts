import { collectionMeta } from "@/lib/api/data";
import { jsonOk, readInt } from "@/lib/api/http";

/**
 * Handler genérico para las colecciones de solo lectura.
 *
 * Las siete colecciones (proyectos, experiencia, skills, certificaciones,
 * formación, recomendaciones) se paginan igual y devuelven el mismo sobre
 * `{ data, meta }`. Escribir siete veces el mismo `limit`/`offset` era la
 * forma segura de que la séptima validara distinto que la primera.
 */
export function collectionHandler<T>(path: string, load: () => T[]) {
  return function GET(request: Request): Response {
    const url = new URL(request.url);

    const limit = readInt(url, "limit", { fallback: 100, min: 1, max: 100 });
    if (!limit.ok) return limit.response;

    const offset = readInt(url, "offset", { fallback: 0, min: 0, max: 1000 });
    if (!offset.ok) return offset.response;

    const all = load();
    const page = all.slice(offset.value, offset.value + limit.value);

    return jsonOk({
      data: page,
      meta: { ...collectionMeta(page.length, path), total: all.length, limit: limit.value, offset: offset.value },
    });
  };
}
