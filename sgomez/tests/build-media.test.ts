import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * La secuencia del capítulo 03 se renderiza en local con Remotion (`npm run render -- --only=build` en `video/`) y se
 * commitea. Presupuesto: como mucho 4 MB en escritorio, 1,5 MB en móvil y 200 KB el póster.
 */
const dir = (n: string) => fileURLToPath(new URL(`../public/media/build/${n}`, import.meta.url));
const FRAMES = 90;
const names = Array.from({ length: FRAMES }, (_, i) => `${String(i + 1).padStart(4, "0")}.webp`);
const total = (size: string) => names.reduce((sum, n) => sum + statSync(dir(`${size}/${n}`)).size, 0);

describe("medios del capítulo 03", () => {
  it("existen los 90 fotogramas de cada tamaño y el póster", () => {
    for (const size of ["desktop", "mobile"]) {
      expect(readdirSync(dir(size)).filter((f) => f.endsWith(".webp"))).toEqual(names);
    }
    expect(existsSync(dir("poster.webp"))).toBe(true);
  });

  it("los fotogramas de escritorio suman como mucho 4 MB", () => {
    expect(total("desktop")).toBeLessThanOrEqual(4 * 1024 * 1024);
  });

  it("los fotogramas de móvil suman como mucho 1,5 MB", () => {
    expect(total("mobile")).toBeLessThanOrEqual(1.5 * 1024 * 1024);
  });

  it("el póster pesa como mucho 200 KB", () => {
    expect(statSync(dir("poster.webp")).size).toBeLessThanOrEqual(200 * 1024);
  });
});
