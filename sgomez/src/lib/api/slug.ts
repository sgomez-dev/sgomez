/**
 * Slugs deterministas para los recursos de la API.
 *
 * Deterministas a propósito: el slug de un proyecto es parte de su URL pública
 * (`/api/v1/projects/{slug}`) y aparece en la especificación OpenAPI como
 * ejemplo, así que no puede depender del orden del array ni de un contador.
 * Sale solo del título, y el título ya está en `content/index.tsx`.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    // Marcas diacríticas: "Galardón" -> "galardon", no "galardo-n".
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
