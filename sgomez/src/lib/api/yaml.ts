/**
 * Serializador YAML mínimo para el documento OpenAPI.
 *
 * Emite el subconjunto que produce `openApiDocument()`: objetos, arrays,
 * cadenas, números y booleanos. Los escalares y las claves salen entre comillas
 * dobles con el escapado de JSON, que YAML 1.2 acepta tal cual porque JSON es
 * un subconjunto de YAML. Es más verboso que un YAML escrito a mano y a cambio
 * no hay ni un caso de escapado que pueda romper el documento: ni los dos
 * puntos de una URL, ni el `#` de un `$ref`, ni los saltos de línea de la
 * descripción.
 *
 * Se prefiere esto a una dependencia porque el YAML de /api/openapi.yaml es un
 * segundo formato del MISMO objeto que ya se sirve en /openapi.json: el riesgo
 * que hay que controlar es que las dos representaciones se separen, no el de
 * escribir treinta líneas de serializador.
 */

type YamlValue = unknown;

function scalar(value: YamlValue): string {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(String(value));
}

function isEmpty(value: YamlValue): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (value && typeof value === "object") return Object.keys(value as object).length === 0;
  return false;
}

function emit(value: YamlValue, indent: number): string[] {
  const pad = "  ".repeat(indent);

  if (Array.isArray(value)) {
    const lines: string[] = [];
    for (const item of value) {
      if (item && typeof item === "object" && !isEmpty(item)) {
        const nested = emit(item, indent + 1);
        // El primer campo del elemento va en la misma línea que el guion.
        lines.push(`${pad}- ${nested[0].trimStart()}`);
        lines.push(...nested.slice(1));
      } else if (isEmpty(item)) {
        lines.push(`${pad}- ${Array.isArray(item) ? "[]" : "{}"}`);
      } else {
        lines.push(`${pad}- ${scalar(item)}`);
      }
    }
    return lines;
  }

  if (value && typeof value === "object") {
    const lines: string[] = [];
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item === undefined) continue;
      const name = JSON.stringify(key);
      if (isEmpty(item)) {
        lines.push(`${pad}${name}: ${Array.isArray(item) ? "[]" : "{}"}`);
      } else if (item && typeof item === "object") {
        lines.push(`${pad}${name}:`);
        lines.push(...emit(item, indent + 1));
      } else {
        lines.push(`${pad}${name}: ${scalar(item)}`);
      }
    }
    return lines;
  }

  return [`${pad}${scalar(value)}`];
}

export function toYaml(document: unknown): string {
  if (isEmpty(document)) return "{}\n";
  return emit(document, 0).join("\n") + "\n";
}
